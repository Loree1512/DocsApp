import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, updateEmail, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { User } from '../models/user.model';
import { getFirestore, setDoc, doc, getDoc, addDoc, deleteDoc, where, getDocs, updateDoc} from 'firebase/firestore';
import { UtilsService } from './utils.service';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {getStorage,uploadString,ref,getDownloadURL,uploadBytes,deleteObject, listAll, FirebaseStorage, getMetadata} from "firebase/storage";
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap,map } from 'rxjs/operators';
import { of, lastValueFrom, from } from 'rxjs';
import { firestore, storage } from './firebase.config';
import { get } from 'http';
import { Document } from '../models/document.model';
import { collection, collectionData, query, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private storage: AngularFireStorage;
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);
  private userUid: string = 'USER_UID';

  constructor() {
    
  }

  getuserUid(): string {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('El usuario no está autenticado.');
    }
    return user.uid;
  }
  // ************ autenticacion ***************
  getAuth() {
    return getAuth();
  }

  // ************* acceder ***********
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

 
  // ************* registrar ***********

async signUp(user: User): Promise<any> {  // Devuelve una promesa que resuelve con el userCredential
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    
    // El userCredential contiene el objeto 'user' que tiene el UID
    return userCredential;  // Devuelve el userCredential
  } catch (error) {
    throw error;  // Si ocurre un error, lo lanzamos
  }
}
  // ************* actualizar perfil ***********
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }
  // *********** restablecer contraseña *********
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  async updateProfile(uid: string, { name, photoURL }: { name?: string, photoURL?: string }): Promise<void> {
    try {
        const user = getAuth().currentUser;

        // Actualiza el perfil en Firebase Auth
        if (user) {
            await updateProfile(user, {
                displayName: name || user.displayName,
                photoURL: photoURL || user.photoURL,
            });
        }

        // Obtener la referencia al documento del usuario
        const userDocRef = this.firestore.doc(`users/${uid}`).ref;

        // Actualizar los datos en Firestore (usando setDoc para agregar o actualizar los datos)
        await setDoc(userDocRef, { name, photoURL }, { merge: true });  // merge: true solo actualiza los campos proporcionados

    } catch (error) {
        console.error('Error al actualizar el perfil', error);
    }
}


  private async getUsedSpace(): Promise<number> {
    // Implementa la lógica para calcular el espacio utilizado
    // Aquí hay un ejemplo básico que suma el tamaño de todos los archivos en Firebase Storage
    const storageRef = ref(getStorage(), 'users/${}/documents');
    const documentList = await listAll(storageRef);
    let totalSize = 0;
    for (const itemRef of documentList.items) {
      const metadata = await getMetadata(itemRef);
      totalSize += metadata.size;
    }
    return totalSize / (1024 * 1024); // Convertir a MB
  }



  // ***** Cerrar sesion *****
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }

  //********* Base de datos  **********

  getCollectionData(path: string): Observable<any[]> {
    return this.firestore.collection(path).valueChanges({ idField: 'id' });
  }

  async getUserUID(): Promise<string | null> {
    const user = await this.auth.currentUser;
    return user ? user.uid : null;
  }

async setDocument(path: string, data: any): Promise<void> {
  try {
    await this.firestore.doc(path).set(data);
    console.log(`Documento guardado en la ruta ${path}`);
  } catch (error) {
    console.error("Error al guardar el documento:", error);
    throw error;
  }
}

async getDocument(userUID: string, docId: string): Promise<User | undefined> {
  try {
    const docRef = doc(this.firestore.firestore, `users/${userUID}/documents/${docId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : undefined;
  } catch (error) {
    console.error('Error al obtener el documento:', error);
    return undefined;
  }
}

getUserDocumentsCollection(userUID: string): Observable<any[]> {
  const path = `users/${userUID}/documents`;
  return this.firestore.collection(path).valueChanges({ idField: 'id' });
}


  getUserDocuments() {
    return this.auth.user.pipe(
      switchMap(user => {
        if (user) {
          const path = `users/${user.uid}/documents`;
          return this.firestore.collection(path).valueChanges({ idField: 'id' });
        } else {
          return of([]); // Si no hay usuario autenticado, retorna un array vacío
        }
      })
    );
  }

  getUserDocumentsFromFirestore() {
    const userUID = this.getUserUID();
    return this.firestore.collection(`users/${userUID}/documents`).valueChanges({ idField: 'id' });
  }
  
  addDocumento(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }


  async addDocument(data: any, file: File): Promise<void> {
    try {
      const firestore = getFirestore();
      const storage = getStorage();
  
      // Extraer el UID del usuario de los datos
      const { userUID, ...documentData } = data;
  
      // Crear la referencia al documento
      const documentRef = doc(collection(firestore, `users/${userUID}/documents`));
      const documentId = documentRef.id;
  
      // Subir el archivo al Storage
      const filePath = `users/${userUID}/documents/${documentId}`;
      const storageRef = ref(storage, filePath);
  
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);
  
      // Guardar los datos del documento en Firestore
      const docData = {
        ...documentData,
        fileUrl,
        filePath,
        createdAt: new Date(),
        documentId,
      };
  
      await setDoc(documentRef, docData);
      console.log('Documento subido con éxito.');
    } catch (error) {
      console.error('Error al añadir el documento:', error);
      throw error;
    }
  }
  //********almacenamiento **********/

  async uploadImage(userUID: string, documentId: string, data_url: string): Promise<string> {
    const path = `users/${userUID}/documents/${documentId}/image`; // Ajusta la ruta según lo que necesites
    try {
      const fileRef = ref(getStorage(), path);
      await uploadString(fileRef, data_url, 'data_url');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  async uploadFile(file: File, documentData: Partial<Document>): Promise<void> {
    const id = this.firestore.createId();
    const filePath = `${this.userUid}/documents/${id}`;
    const fileRef = this.storage.ref(filePath);

    return fileRef.put(file).then(async () => {
      const url = await fileRef.getDownloadURL().toPromise();
      const docData = {
        ...documentData,
        url,
        fullPath: filePath,
        id,
      };

      return this.firestore.collection(`users/${this.userUid}/documents`).doc(id).set(docData);
    });
  }


    // ************* obtener referencia de almacenamiento ***********
      getStorageRef(path: string) {
      return ref(getStorage(), path);
    }



      // ************* obtener URL de archivo ***********
      async getFileUrl(userUID: string, documentId: string, filePath: string): Promise<string> {
        const storage = getStorage();
        const fileRef = ref(storage, `users/${userUID}/documents/${documentId}/${filePath}`);
        return getDownloadURL(fileRef);
      }

//* New new new new nenewn ewn **/
    // ************* eliminar documento ***********

async deleteDocument(fullPath: string, documentId: string): Promise<void> {
  try {
    const storage = getStorage();
    const firestore = getFirestore();

    // 1. Eliminar el archivo de Firebase Storage
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
    console.log('Archivo eliminado del Storage.');

    // 2. Eliminar el documento en Firestore
    const userUID = this.getuserUid(); // Obtener el UID dinámicamente
    const documentPath = `users/${userUID}/documents/${documentId}`;
    const documentRef = doc(firestore, documentPath);
    await deleteDoc(documentRef);
    console.log('Documento eliminado de Firestore.');
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
    throw error; // Lanza el error para manejarlo en el componente
  }
}

 //**NEW NEW NEW NEW NEW NEW */
// Función para obtener documentos desde Firebase Storage usando una ruta específica
getDocumentsFromStorage(userUID: string): Observable<Document[]> {
  const firestore = getFirestore();
  const documentsRef = collection(firestore, `users/${userUID}/documents/`);

  // Consulta para ordenar por createdAt en orden descendente
  const documentsQuery = query(documentsRef, orderBy('createdAt', 'desc'));

  return collectionData(documentsQuery, { idField: 'id' }) as Observable<Document[]>;
}

async getUserProfile(userUID: string): Promise<User> {
  const firestore = getFirestore();
  const userRef = doc(firestore, `users/${userUID}`);
  const docSnapshot = await getDoc(userRef);

  if (docSnapshot.exists()) {
    const data = docSnapshot.data() as User; // Se asegura de que los datos devueltos sean del tipo 'User'
    return {
      ...data,
      name: data.name || 'Nombre no disponible', // Valor por defecto si no se encuentra el nombre
      email: data.email || 'Correo no disponible', // Valor por defecto si no se encuentra el email
    };
  } else {
    throw new Error('El perfil del usuario no existe.');
  }
}


     // ************* almacenamiento ***********
  async getAvailableSpace(): Promise<number> {
    // Implementa la lógica para obtener el espacio disponible
    // Esto puede variar dependiendo de cómo gestiones el almacenamiento
    // Aquí hay un ejemplo básico que asume que tienes un límite definido
    const totalSpace = 1000; // Espacio total en MB (ejemplo)
    const usedSpace = await this.getUsedSpace();
    return totalSpace - usedSpace;
  }

  async addDocumentToFirestore(docData: any) {
    const userUID = this.getUserUID(); // Asegúrate de obtener el UID del usuario
    return this.firestore.collection(`users/${userUID}/documents`).add(docData);
  }

  getDocumentCoordinates(userUID: string, documentId: string): Observable<{ latitude: number; longitude: number } | null> {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `users/${userUID}/documents/${documentId}`);
  
    return from(getDoc(documentRef)).pipe(
      map(documentSnapshot => {
        if (documentSnapshot.exists()) {
          const data = documentSnapshot.data();
          console.log('Datos obtenidos del documento:', data);
  
          // Acceder a las coordenadas desde el objeto location
          const latitude = data?.['location']?.latitude ?? null;
          const longitude = data?.['location']?.longitude ?? null;
  
          if (latitude !== null && longitude !== null) {
            console.log('Coordenadas válidas:', { latitude, longitude });
            return { latitude, longitude };
          } else {
            console.warn(`El documento con ID ${documentId} no contiene coordenadas válidas en la propiedad "location".`);
            return null;
          }
        } else {
          console.warn(`El documento con ID ${documentId} no existe.`);
          return null;
        }
      })
    );
  }
}
function getDataFromSomewhere(): unknown {
  throw new Error('Function not implemented.');
}
