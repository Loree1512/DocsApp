import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail} from 'firebase/auth';
import { User } from '../models/user.model';
import {getFirestore, setDoc, doc, getDoc} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  // ************ autenticacion ***************
getAuth(){
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
  sendRecoveryEmail(email: string){
    return sendPasswordResetEmail(getAuth(), email);
  }

  // ***** Cerrar sesion *****
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }

  //********* Base de datos  **********

  setDocument(path: string, data: any){
    return setDoc(doc(getFirestore(),path),data);
  }

  async getDocument(path: string){
    return  (await getDoc(doc(getFirestore(),path))).data();
  }
}
