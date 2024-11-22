import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-scan-doc',
  templateUrl: './scan-doc.component.html',
  styleUrls: ['./scan-doc.component.scss'],
})
export class ScanDocComponent  implements OnInit {

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    category: new FormControl('',[Validators.required]),
    image: new FormControl('',[Validators.required]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user = {} as User;


  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorege('user');
  }

 async takeImage(){
  const dataUrl = (await this.utilsSvc.takePicture('Imagen del documento')).dataUrl;
  this.form.controls.image.setValue(dataUrl);

  }

  async submit() {
    if (this.form.valid) {
      let path = `users/${this.user.uid}/documents`;
  
      const loading = await this.utilsSvc.loading();
      await loading.present();
  
      // Subir imagen y obtener URL
      let dataUrl = this.form.value.image;
      let imagePath = `${this.user.uid}/${Date.now()}`;  // Usar un ID único como docId
      let imageUrl = await this.firebaseSvc.uploadImage(this.user.uid, imagePath, dataUrl);  // Proporcionar los tres parámetros
      this.form.controls.image.setValue(imageUrl);  // Guardar la URL de la imagen en el formulario
  
      // Agregar el documento a la base de datos
      this.firebaseSvc.addDocumento(path, this.form.value).then(async res => {
        this.utilsSvc.dismissModal({ success: true });
  
        this.utilsSvc.presentToast({
          message: 'Documento subido exitosamente',
          duration: 2000,
          position: 'middle',
          color: 'success',
          icon: 'checkmark-circle-outline'
        });
  
      }).catch(error => {
        console.log(error);
  
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2000,
          position: 'middle',
          color: 'danger',
          icon: 'alert-circle-outline'
        });
  
      }).finally(() => {
        loading.dismiss();
      });
  
    }
  }
}
