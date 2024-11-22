import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model'; // Adjust the path as necessary
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { getStorage, ref, getDownloadURL, uploadString, uploadBytes } from 'firebase/storage';
import { Observable, from } from 'rxjs';
import { AddDocComponent } from 'src/app/shared/components/add-doc/add-doc.component';
import { ConvertDocComponent } from 'src/app/shared/components/convert-doc/convert-doc.component';
import { ScanDocComponent } from 'src/app/shared/components/scan-doc/scan-doc.component';
;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  currentUser: User;
  documents$: Observable<any[]>; 
  storage = getStorage();
  availableSpace: number = 0; // Espacio disponible
  recentDocuments$: Observable<any[]>; // Documentos recientes

  constructor(private firebaseSvc: FirebaseService, private utilsSvc: UtilsService) {}

  ngOnInit() {
    this.currentUser = this.utilsSvc.getFromLocalStorege('user');
    const userUID = this.firebaseSvc.getuserUid();
    this.documents$ = this.firebaseSvc.getDocumentsFromStorage(userUID);
    if (this.currentUser && this.currentUser.uid) {
      this.getAvailableSpace();
      this.getRecentDocuments();
    } else {
      console.error('Usuario no autenticado');
    }
  }

  async getAvailableSpace() {
    this.availableSpace = await this.firebaseSvc.getAvailableSpace();
  }

  getRecentDocuments() {
    const storagePath = `/users/${this.currentUser.uid}/documents`;
  
    // Asegúrate de llamar correctamente al servicio
    this.recentDocuments$ = this.firebaseSvc.getDocumentsFromStorage(this.currentUser.uid);
  }

  async uploadProfilePicture(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const filePath = `users/${this.currentUser.uid}/${file.name}`;
      const fileRef = ref(this.storage, filePath);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      this.currentUser.photoURL = downloadURL;
      await this.firebaseSvc.updateUserProfile(this.currentUser.uid, { photoURL: downloadURL });
      this.getRecentDocuments(); // Actualizar documentos recientes después de subir la foto
    }
  }

  async takeProfilePicture() {
    try {
      const photo = await this.utilsSvc.takePicture('Tomar foto de perfil');
      if (!photo) {
        console.log('El usuario canceló la acción de tomar una foto.');
        return;
      }
      const filePath = `users/${this.currentUser.uid}/profile.jpg`;
      const fileRef = ref(this.storage, filePath);
      await uploadString(fileRef, photo.dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(fileRef);
      this.currentUser.photoURL = downloadURL;
      await this.firebaseSvc.updateUserProfile(this.currentUser.uid, { photoURL: downloadURL });
      this.getRecentDocuments(); // Actualizar documentos recientes después de tomar la foto
    } catch (error) {
      console.error('Error al tomar la foto de perfil:', error);
    }
  }
  signOut() {
    this.firebaseSvc.signOut();
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorege('user');
  }

  ionViewWillEnter() {
    this.getDocs();
  }

  getDocs() {
    const user = this.utilsSvc.getFromLocalStorege('user');

    if (user && user.uid) {
      const path = `users/${user.uid}/documents`;

      const sub = this.firebaseSvc.getCollectionData(path).subscribe({
        next: (res: any) => {
          console.log('Documentos obtenidos:', res);
          sub.unsubscribe();
        },
        error: (err: any) => {
          console.error('Error al obtener documentos:', err);
        }
      });
    } else {
      console.error('UID de usuario no encontrado o usuario no autenticado.');
      this.utilsSvc.routerLink('/auth');
    }
  }

  addDoc() {
    this.utilsSvc.presentModal({
      component: AddDocComponent,
      cssClass: 'add-doc-modal'
    });
  }

  scanDoc() {
    this.utilsSvc.presentModal({
      component: ScanDocComponent,
      cssClass: 'scan-doc-modal'
    });
  }


  convertDoc() {
  this.utilsSvc.presentModal({
    component: ConvertDocComponent,
    cssClass: 'convert-doc-modal'
  });
}
}