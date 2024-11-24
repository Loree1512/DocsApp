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
    
    const userUID = this.firebaseSvc.getuserUid();
    this.documents$ = this.firebaseSvc.getDocumentsFromStorage(userUID);
  
    
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

    // Función para actualizar la lista de documentos después de la eliminación
    async refreshDocumentList(userUID: string) {
      try {
        const documents = await firstValueFrom(this.firebaseSvc.getUserDocumentsCollection(userUID));
        this.documents$ = of(documents); // Asegura que el observable se actualice correctamente
      } catch (error) {
        console.error('Error al obtener la lista de documentos:', error);
      }
    }

   // Función para manejar la subida del documento
   async submit() {
    if (this.form.valid && this.selectedFile) {
      const documentData = this.form.value;
  
      try {
        // Obtener ubicación
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;

         // Obtener userUID desde el servicio
      const userUID = this.firebaseSvc.getuserUid();
  
        // Preparar datos del documento
        const data = {
          ...documentData,
          location: { latitude, longitude },
          userUID,
        };
  
      

      // Subir documento con archivo
      await this.firebaseSvc.addDocument(data, this.selectedFile);

  
        alert('Documento subido con éxito.');
        this.selectedFile = null;
        this.form.reset();
      } catch (error) {
        console.error('Error al subir el documento:', error);
      }
    }
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

// Función para descargar el documento
async downloadDocument(filePath: string) {
  try {
    console.log('Intentando descargar documento con filePath:', filePath); // Depuración
    if (!filePath || filePath.trim() === '') {
      throw new Error('La ruta del archivo no está definida.');
    }

    // Obtener la referencia al archivo en Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, filePath);

    // Obtener la URL de descarga
    const downloadUrl = await getDownloadURL(storageRef);

    // Crear un enlace para iniciar la descarga
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filePath.split('/').pop() || 'archivo';
    link.target = '_blank'; 
    link.click();
  } catch (error) {
    console.error('Error al intentar descargar el documento:', error.message || error);
    alert('No se pudo descargar el documento: ' + (error.message || 'Ruta no válida.'));
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