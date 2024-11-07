import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Observable, of } from 'rxjs';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from "firebase/storage";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-add-doc',
  templateUrl: './add-doc.component.html',
  styleUrls: ['./add-doc.component.scss'],
})
export class AddDocComponent implements OnInit {
  selectedFile: File | null = null;
  documents$: Observable<any[]> = of([]);
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
  alertController = inject(AlertController);

  user = {} as User;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorege('user');

    if (this.user && this.user.uid) {
      const storagePath = `/users/${this.user.uid}/documents`; // Define la ruta de documentos en Storage
      this.getDocumentsFromStorage(storagePath);
    } else {
      console.error('Usuario no autenticado');
    }
  }

  async getDocumentsFromStorage(path: string) {
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
      this.documents$ = of(documents); // Actualizar el observable
    } catch (error) {
      console.error("Error al obtener los documentos de Firebase Storage:", error);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async submit() {
    if (this.form.valid && this.selectedFile) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const documentPath = `users/${this.user.uid}/documents/${Date.now()}_${this.selectedFile.name}`;
        const fileRef = ref(this.storage, documentPath);
        await uploadBytes(fileRef, this.selectedFile);

        // Actualizar la lista de documentos en tiempo real
        const storagePath = `/users/${this.user.uid}/documents`;
        await this.getDocumentsFromStorage(storagePath);

        this.utilsSvc.presentToast({
          message: 'Documento subido exitosamente',
          duration: 2000,
          position: 'middle',
          color: 'success',
          icon: 'checkmark-circle-outline'
        });
      } catch (error) {
        console.error('Error al subir el documento:', error);
        this.utilsSvc.presentToast({
          message: 'Error al subir el documento',
          duration: 2000,
          position: 'middle',
          color: 'danger',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }


  // Función para visualizar el documento
  async viewDocument(filePath: string): Promise<void> {
    try {
      if (!filePath) {
        throw new Error('La ruta del archivo no está definida.');
      }
      const fileRef = ref(this.storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);
      window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(downloadURL)}&embedded=true`, '_blank');
    } catch (error) {
      console.error('Error al intentar abrir el documento:', error);
    }
  }

  // Función para descargar el documento
  async downloadDocument(filePath: string, name: string) {
    try {
      if (!filePath) {
        throw new Error('La ruta del archivo no está definida.');
      }
      const fileRef = ref(this.storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = name;
      link.click();
    } catch (error) {
      console.error('Error al intentar descargar el documento:', error);
    }
  }
  
  /*
  // Función para eliminar el documento desde Firebase Storage
  async deleteDocument(filePath: string) {
    try {
      if (!filePath) {
        throw new Error('La ruta del archivo no está definida.');
      }
      await this.firebaseSvc.deleteFile(filePath);
      this.utilsSvc.presentToast({
        message: 'Documento eliminado exitosamente',
        duration: 2000,
        position: 'middle',
        color: 'success',
        icon: 'trash-outline'
      });
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
      this.utilsSvc.presentToast({
        message: 'Error al eliminar el documento',
        duration: 2000,
        position: 'middle',
        color: 'danger',
        icon: 'alert-circle-outline'
      });
    }
      
  }
    
*/
async deleteDocument(filePath: string) {
  const alert = await this.alertController.create({
    header: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este documento?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Eliminación cancelada');
        }
      },
      {
        text: 'Eliminar',
        handler: async () => {
          try {
            if (!filePath) {
              throw new Error('La ruta del archivo no está definida.');
            }
            await this.firebaseSvc.deleteFile(filePath);
            this.utilsSvc.presentToast({
              message: 'Documento eliminado exitosamente',
              duration: 2000,
              position: 'middle',
              color: 'success',
              icon: 'trash-outline'
            });

            // Actualizar la lista de documentos
            const storagePath = `/users/${this.user.uid}/documents`;
            await this.getDocumentsFromStorage(storagePath);
          } catch (error) {
            console.error('Error al eliminar el documento:', error);
            this.utilsSvc.presentToast({
              message: 'Error al eliminar el documento',
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

  await alert.present();
}
  
}