import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Observable, from } from 'rxjs';
import { getStorage, ref, getDownloadURL, uploadString, uploadBytes } from 'firebase/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  currentUser: User;
  documents$: Observable<any[]>; 
  recentDocuments$: Observable<any[]>; // Documentos recientes
  storage = getStorage();
  firebaseSvc = inject(FirebaseService);;
  utilsSvc = inject(UtilsService);

  ngOnInit() {const userUID = this.firebaseSvc.getuserUid();
    this.loadUserProfile();
    this.documents$ = this.firebaseSvc.getDocumentsFromStorage(userUID);
    if (this.currentUser && this.currentUser.uid) {
      this.getRecentDocuments();
    } else {
      console.error('Usuario no autenticado');
    }
  }

  getRecentDocuments() {
    const storagePath = `/users/${this.currentUser.uid}/documents`;
  
    // Asegúrate de llamar correctamente al servicio
    this.recentDocuments$ = this.firebaseSvc.getDocumentsFromStorage(this.currentUser.uid);
  }

  async loadUserProfile() {
    try {
      const userUID = this.firebaseSvc.getuserUid(); // Obtener el UID del usuario actual
      this.currentUser = await this.firebaseSvc.getUserProfile(userUID); // Cargar el perfil
      console.log('Perfil cargado:', this.currentUser);
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
    }
  }
  async uploadProfilePicture(event: Event) {
    const input = event.target as HTMLInputElement;
   
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      try {
        // Obtener el UID del usuario
        const userUID = this.firebaseSvc.getuserUid();
  
        // Ruta del archivo en Firebase Storage
        const filePath = `users/${userUID}/${file.name}`;
        const fileRef = ref(this.storage, filePath);
  
        // Subir el archivo
        await uploadBytes(fileRef, file);
  
        // Obtener el URL de descarga del archivo
        const downloadURL = await getDownloadURL(fileRef);
  
        // Obtener el nombre actual del usuario
        const name = this.currentUser.name || '';  // Si no existe, asigna un valor vacío
  
        // Actualizar el perfil del usuario en Firebase (nombre y foto)
        await this.firebaseSvc.updateProfile(userUID, { name, photoURL: downloadURL });
  
        // Actualizar localmente la URL de la foto
        this.currentUser.photoURL = downloadURL;
  
        alert('Foto de perfil subida con éxito.');
      } catch (error) {
        console.error('Error al subir la foto de perfil:', error);
      }
    }
  }

  async takeProfilePicture() {
    try {
      const photo = await this.utilsSvc.takePicture('Tomar foto de perfil');
      
      if (!photo) {
        console.log('El usuario canceló la acción de tomar una foto.');
        return;
      }
  
      // Obtener el UID del usuario
      const userUID = this.firebaseSvc.getuserUid();
  
      // Ruta para la foto de perfil
      const filePath = `users/${userUID}/profile.jpg`;
      const fileRef = ref(this.storage, filePath);
  
      // Subir la foto como base64
      await uploadString(fileRef, photo.dataUrl, 'data_url');
  
      // Obtener el URL de descarga
      const downloadURL = await getDownloadURL(fileRef);
  
      // Obtener el nombre desde el formulario o desde algún campo
      const name = this.currentUser.name;  // Asegúrate de que `name` esté definido
  
      // Actualizar el perfil del usuario en Firebase
      await this.firebaseSvc.updateProfile(userUID, { name, photoURL: downloadURL });
  
      // Actualizar localmente la URL de la foto
      this.currentUser.photoURL = downloadURL;
  
      alert('Foto de perfil tomada y subida con éxito.');
    } catch (error) {
      console.error('Error al tomar la foto de perfil:', error);
    }
  }
}
