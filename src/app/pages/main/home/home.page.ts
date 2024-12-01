import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model'; // Adjust the path as necessary
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { getStorage, ref, getDownloadURL, uploadString, uploadBytes } from 'firebase/storage';
import { Observable, from } from 'rxjs';
import { AddDocComponent } from 'src/app/shared/components/add-doc/add-doc.component';
import { ConvertDocComponent } from 'src/app/shared/components/convert-doc/convert-doc.component';
import { ScanDocComponent } from 'src/app/shared/components/scan-doc/scan-doc.component';
import { firstValueFrom, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { inject } from '@angular/core'
import { ModalController } from '@ionic/angular';
import { MapComponent } from 'src/app/shared/components/map/map.component';
import { NavController } from '@ionic/angular';
;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  currentUser: User;
  isModalOpen = false; 
  images: any[] = []; 
  usedSpace: number = 0;
  documents$: Observable<any[]>; 
  storage = getStorage();
  firestore = inject(AngularFirestore);
  availableSpace: number = 0; // Espacio disponible
  recentDocuments$: Observable<any[]>; // Documentos recientes
  constructor(private firebaseSvc: FirebaseService, 
              private utilsSvc: UtilsService, 
              private modalController: ModalController,
              private navController: NavController) {}

  ngOnInit() {
 
    const userUID = this.firebaseSvc.getuserUid();
    this.loadUserProfile();
    this.loadImages();
    this.getUsedSpace();
    this.documents$ = this.firebaseSvc.getDocumentsFromStorage(userUID);
    if (this.currentUser && this.currentUser.uid) {
      this.getRecentDocuments();
    } else {
      console.error('Usuario no autenticado');
    }
  }
     // Función para actualizar la lista de documentos
     async refreshDocumentList(userUID: string) {
      try {
        const documents = await firstValueFrom(this.firebaseSvc.getUserDocumentsCollection(userUID));
        this.documents$ = of(documents); // Asegura que el observable se actualice correctamente
      } catch (error) {
        console.error('Error al obtener la lista de documentos:', error);
      }
    }

    async loadImages() {
      try {
        const userUID = this.firebaseSvc.getuserUid();
        this.images = await this.firebaseSvc.getImagesFromStorage(userUID);
        console.log('Imágenes cargadas:', this.images);
      } catch (error) {
        console.error('Error al cargar las imágenes:', error);
      }
    
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

    async getUsedSpace() {
      try {
        this.usedSpace = await this.firebaseSvc.getUsedSpace();
        console.log('Espacio ocupado:', this.usedSpace, 'MB');
      } catch (error) {
        console.error('Error al obtener el espacio ocupado:', error);
        this.usedSpace = 0; // En caso de error, establecer en 0
      }
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


 // Función para visualizar el documento
 async viewDocument(url: string) {
  try {
    if (!url || url.trim() === '') {
      throw new Error('La ruta del archivo no está definida.');
    }
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error al intentar abrir el documento:', error.message || error);
    alert('No se pudo abrir el documento: ' + (error.message || 'Ruta no válida.'));
  }
}

async openMapForDocument(documentId: string) {
  try {
    const userUID = this.firebaseSvc.getuserUid();
    const coordinates = await firstValueFrom(this.firebaseSvc.getDocumentCoordinates(userUID, documentId));

    console.log('Coordenadas obtenidas:', coordinates);

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      throw new Error('El documento no contiene coordenadas válidas.');
    }

    const { latitude, longitude } = coordinates;

    // Mostrar coordenadas en la consola
    console.log('Coordenadas a pasar al modal:', { latitude, longitude });

    const modal = await this.modalController.create({
      component: MapComponent,
      componentProps: {
        latitude: latitude,
        longitude: longitude,
        documentId: documentId,
      },
    });

    await modal.present();
  } catch (error) {
    console.error('Error al abrir el mapa:', error.message || error);
  }
}

  // Función para eliminar el documento desde Firestore
  async deleteDocument(filePath: string, documentId: string): Promise<void> {
    try {
      await this.firebaseSvc.deleteDocument(filePath, documentId);
      this.utilsSvc.presentToast({
        message: 'Documento eliminado exitosamente.',
        duration: 2000,
        position: 'middle',
        color: 'success',
        icon: 'trash-outline',
      });
    } catch (error) {
      console.error('Error al intentar eliminar el documento:', error.message || error);
      this.utilsSvc.presentToast({
        message: 'Error al eliminar el documento.',
        duration: 2000,
        position: 'middle',
        color: 'danger',
        icon: 'alert-circle-outline',
      });
    }

    
  }


  
}