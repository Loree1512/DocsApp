import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, deleteDoc} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {getStorage,uploadString,ref,getDownloadURL,uploadBytes,deleteObject, listAll, FirebaseStorage} from "firebase/storage";
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

  async getDocument(path: string): Promise<User | undefined> {
    try {
      const docRef = doc(this.firestore.firestore, path);
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

  
  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  //********almacenamiento **********/

  async uploadImage(path: string, data_url: string): Promise<string> {
    try {
      const fileRef = ref(getStorage(), path);
      await uploadString(fileRef, data_url, 'data_url');
      return await getDownloadURL(ref(getStorage(), path));
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  async uploadFile(filePath: string, file: Blob): Promise<string> {
    try {
      const storageRef = ref(getStorage(), filePath);
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
      async getFileUrl(path: string): Promise<string> {
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
    async deleteFile(path: string): Promise<void> {
      const storage = getStorage();
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    }
    
    async deleteDocument(documentPath: string): Promise<void> {
      try {
        // Obtener referencia al documento en Firestore
        const docRef = this.firestore.doc(documentPath);
        await docRef.delete();
        console.log("Documento eliminado de Firestore.");
      } catch (error) {
        console.error("Error al eliminar el documento en Firestore:", error);
        throw error;
      }
    }

    async getDocumentsFromStorage(path: string): Promise<any[]> {
      const storageRef = ref(this.storage, path);
  
      try {
        const documentList = await listAll(storageRef);
        const documents = await Promise.all(documentList.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url: url
          };
        }));
        return documents;
      } catch (error) {
        console.error("Error al obtener los documentos de Firebase Storage:", error);
        throw error;
      }
    }


  }