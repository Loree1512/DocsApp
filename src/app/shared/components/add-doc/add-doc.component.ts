import { Document } from './../../../models/document.model';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Observable, map, of } from 'rxjs';
import { getStorage, ref, deleteObject, getDownloadURL, uploadBytes, listAll } from "firebase/storage";
import { Geolocation } from '@capacitor/geolocation';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-add-doc',
  templateUrl: './add-doc.component.html',
  styleUrls: ['./add-doc.component.scss'],
})
export class AddDocComponent implements OnInit {
  selectedFile: File | null = null;
  documents$: Observable<any[]>; 
  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    document: new FormControl('')
  });

  fb = inject(FormBuilder);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  storage = getStorage();
  firestore = inject(AngularFirestore);

  user = {} as User;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorege('user');

  
    
  }
  
  async getDocumentsFromStorage(userUID: string, documentId: string): Promise<any[]> {
    const path = `users/${userUID}/documents/${documentId}`;  // Formamos la ruta completa en Storage
    const storageRef = ref(this.storage, path);

    try {
      const documentList = await listAll(storageRef);
      const documents = await Promise.all(
        documentList.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url: url
          };
        })
      );
      return documents;
    } catch (error) {
      console.error("Error al obtener los documentos de Firebase Storage:", error);
      throw error;
    }
  }


  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Convertir el archivo a una URL de datos
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.form.controls.document.setValue(reader.result);
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

   // Función para manejar la subida del documento
   async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
  
      try {
        // Obtener la ubicación
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;
        alert(`Ubicación de subida:\nLatitud: ${latitude}\nLongitud: ${longitude}`);
  
        const documentPath = `users/${this.user.uid}/documents/${Date.now()}_${this.form.value.name}`;
  
        // Si tienes lógica para subir el archivo, asegúrate de que se llame aquí
        // Ejemplo: await this.firebaseSvc.uploadFile(documentPath, this.selectedFile);
  
        // Esperar a que el documento se suba correctamente y actualizar la lista de documentos
        await this.refreshDocumentList(this.user.uid);
  
        // Notificación de éxito
        this.utilsSvc.presentToast({
          message: 'Documento subido exitosamente',
          duration: 2000,
          position: 'middle',
          color: 'success',
          icon: 'checkmark-circle-outline'
        });
  
      } catch (error) {
        console.error('Error al subir el documento:', error);
  
        // Notificación de error
        this.utilsSvc.presentToast({
          message: 'Error al subir el documento',
          duration: 2000,
          position: 'middle',
          color: 'danger',
          icon: 'alert-circle-outline'
        });
      } finally {
        // Asegúrate de cerrar el indicador de carga en todas las situaciones
        await loading.dismiss();
      }
    }
  }
  // Función para visualizar el documento
  async viewDocument(filePath: string) {
    try {
      if (!filePath) {
        throw new Error('La ruta del archivo no está definida.');
      }
      // Abrir el documento en una nueva pestaña
      window.open(filePath, '_blank');
    } catch (error) {
      console.error('Error al intentar abrir el documento:', error);
      this.utilsSvc.presentToast({
        message: 'Error al intentar abrir el documento',
        duration: 2000,
        position: 'middle',
        color: 'danger',
        icon: 'alert-circle-outline'
      });
    }
  }

// Función para descargar el documento
async downloadDocument(doc: { documentUrl: string; name: string }) {
  if (!doc?.documentUrl) {
    console.error('Error al intentar descargar el documento: La ruta del archivo no está definida.');
    this.utilsSvc.presentToast({
      message: 'Error: La ruta del archivo no está definida.',
      duration: 2000,
      position: 'middle',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    return;
  }

  try {
    // Obtener la URL de descarga del archivo desde Firebase Storage usando documentUrl
    const storageRef = ref(this.storage, doc.documentUrl);
    const url = await getDownloadURL(storageRef);

    // Crear un enlace de descarga y activar la descarga
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';  // Abrir en una nueva pestaña
    a.download = doc.name || 'descarga';  // Usa el nombre del documento para la descarga, o un nombre genérico
    a.click();

    console.log('Documento descargado correctamente');
  } catch (error) {
    console.error('Error al intentar descargar el documento:', error);
    this.utilsSvc.presentToast({
      message: 'Error al descargar el documento.',
      duration: 2000,
      position: 'middle',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
  }
}

  // Función para eliminar el documento desde Firestore
async deleteDocument(documentId: string): Promise<void> {
  if (!documentId || !this.user?.uid) {
    console.error('Error al eliminar el documento: ID de documento o UID de usuario no definidos.');
    return;
  }

  const userUID = this.user.uid;
  const documentPath = `users/${userUID}/documents/${documentId}`; // Construye la ruta correctamente

  // Confirmar si el usuario está seguro de eliminar el documento
  const confirm = await this.utilsSvc.confirmAlert({
    message: '¿Estás seguro de que deseas eliminar este documento?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        handler: async () => {
          try {
            // Eliminar el documento desde Firestore usando la ruta correcta
            await this.firestore.doc(documentPath).delete();
            console.log('Documento eliminado con éxito de Firestore.');

            // Actualizar la lista de documentos
            await this.refreshDocumentList(userUID);

            // Mostrar mensaje de éxito
            this.utilsSvc.presentToast({
              message: 'Documento eliminado exitosamente.',
              duration: 2000,
              position: 'middle',
              color: 'success',
              icon: 'trash-outline'
            });
          } catch (error) {
            console.error('Error al eliminar el documento:', error);
            this.utilsSvc.presentToast({
              message: 'Error al eliminar el documento.',
              duration: 2000,
              position: 'middle',
              color: 'danger',
              icon: 'alert-circle-outline'
            });
          }
        }
      }
    ]
  });
}
  
  // Función para eliminar el archivo desde Firebase Storage
  async deleteFile(filePath: string): Promise<void> {
    const fileRef = ref(this.storage, filePath);
    try {
      await deleteObject(fileRef);  // Eliminar archivo desde Firebase Storage
      console.log('Archivo eliminado de Firebase Storage.');
    } catch (error) {
      console.error('Error al eliminar el archivo de Firebase Storage:', error);
    }
  }
  
  // Función para actualizar la lista de documentos después de la eliminación
  async refreshDocumentList(userUID: string) {
    try {
      const documents = await this.firebaseSvc.getUserDocumentsCollection(userUID).toPromise();
      this.documents$ = of(documents); // Esto asegura que el observable se actualice
    } catch (error) {
      console.error('Error al obtener la lista de documentos:', error);
    }
  }
  // Función para eliminar el archivo desde Firebase Storage
  
}