import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-add-doc',
  templateUrl: './add-doc.component.html',
  styleUrls: ['./add-doc.component.scss'],
})
export class AddDocComponent  implements OnInit {
  selectedFile: File | null = null;
  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    category: new FormControl('',[Validators.required]),
    description: new FormControl(''),
    document: new FormControl('')
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user = {} as User;


  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorege('user');
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

  async submit(){
    if(this.form.valid){

      let path = `users/${this.user.uid}/documents`

      const loading = await this.utilsSvc.loading();
      await loading.present();

      //*******subir documento y obtener url ******/
      let dataUrl = this.form.value.document;
      let documentPath =`${this.user.uid}/${Date.now()}`;
      let documentUrl = await this.firebaseSvc.uploadImage(documentPath,dataUrl);
      this.form.controls.document.setValue(documentUrl);

      this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

        this.utilsSvc.dismissModal({success : true});

        this.utilsSvc.presentToast({
          message: 'Documento subido exitosamente',
          duration: 2000,
          position: 'middle',
          color: 'success',
          icon: 'checkmark-circle-outline'
        })

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2000,
          position: 'middle',
          color: 'danger',
          icon: 'alert-circle-outline'
        })

      }).finally(()=> {
        loading.dismiss();
      })
      
    }
    
    
  }
}
