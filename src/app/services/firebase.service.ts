import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { User } from '../models/user.model';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, deleteDoc} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {getStorage,uploadString,ref,getDownloadURL,uploadBytes,deleteObject, listAll, FirebaseStorage, getMetadata} from "firebase/storage";
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap,map } from 'rxjs/operators';
import { of } from 'rxjs';
import { firestore, storage } from './firebase.config';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private storage: FirebaseStorage;
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  /*storage =inject(AngularFireStorage);*/
  utilsSvc = inject(UtilsService);

  constructor() {
    this.storage = getStorage();
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
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ************* actualizar perfil ***********
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }
  // *********** restablecer contraseña *********
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const user = getAuth().currentUser as FirebaseUser;
    if (user) {
      await updateProfile(user, data as { displayName?: string; photoURL?: string });
      const userDocRef = this.firestore.collection('users').doc(uid);
      const userDoc = await userDocRef.get().toPromise();
      if (userDoc.exists) {
        await userDocRef.update(data);
      } else {
        await userDocRef.set(data);
      }
    } else {
      throw new Error('No user is currently signed in.');
    }
  }

  private async getUsedSpace(): Promise<number> {
    // Implementa la lógica para calcular el espacio utilizado
    // Aquí hay un ejemplo básico que suma el tamaño de todos los archivos en Firebase Storage
    const storageRef = ref(this.storage, `/users/${getAuth().currentUser?.uid}/documents`);
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
/*
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }
*/
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
  
  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  //********almacenamiento **********/

  async uploadImage(userUID: string, docId: string, data_url: string): Promise<string> {
    const path = `users/${userUID}/documents/${docId}/image`; // Ajusta la ruta según lo que necesites
    try {
      const fileRef = ref(getStorage(), path);
      await uploadString(fileRef, data_url, 'data_url');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  async uploadFile(userUID: string, docId: string, filePath: string, file: Blob): Promise<string> {
    const path = `users/${userUID}/documents/${docId}/${filePath}`; // Ajusta la ruta según lo que necesites
    try {
      const storageRef = ref(getStorage(), path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  }


    // ************* obtener referencia de almacenamiento ***********
      getStorageRef(path: string) {
      return ref(getStorage(), path);
    }



      // ************* obtener URL de archivo ***********
      async getFileUrl(userUID: string, docId: string, filePath: string): Promise<string> {
        const path = `users/${userUID}/documents/${docId}/${filePath}`;
        const fileRef = ref(getStorage(), path);
        return getDownloadURL(fileRef);
      }


    // ************* eliminar documento ***********
    /*async deleteDocument(docPath: string, filePath: string): Promise<void> {
      try {
        // Eliminar el archivo de Firebase Storage
        const fileRef = ref(getStorage(), filePath);
        await deleteObject(fileRef);
  
        // Eliminar el documento de Firestore
        const docRef = doc(getFirestore(), docPath);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error al eliminar el documento o archivo:', error);
      }
    }



    async deleteFile(filePath: string): Promise<void> {
      try {
        const fileRef = ref(getStorage(), filePath);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error al eliminar el archivo de Firebase Storage:', error);
        throw error;
      }
    }
      */
    async deleteDocument(userUID: string, documentId: string) {
      const path = `users/${userUID}/documents/${documentId}`;
      try {
        await this.firestore.doc(path).delete(); // Elimina el documento de Firestore
        console.log('Documento de Firestore eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar documento de Firestore:', error);
        throw error;
      }
    }

    async deleteDocumentFromFirestore(userUID: string, docId: string) {
      return this.firestore.collection(`users/${userUID}/documents`).doc(docId).delete();
    }

    async getDocumentsFromStorage(path: string): Promise<any[]> {
      const storageRef = ref(this.storage, path);
    
      try {
        const documentList = await listAll(storageRef);
        const documents = await Promise.all(documentList.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,  // Verifica que fullPath esté correcto aquí
            url: url
          };
        }));
        return documents;
      } catch (error) {
        console.error("Error al obtener los documentos de Firebase Storage:", error);
        throw error;
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

  }

function getDataFromSomewhere(): unknown {
  throw new Error('Function not implemented.');
}
