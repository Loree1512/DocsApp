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
    uid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    category: new FormControl('',[Validators.required]),
    image: new FormControl('',[Validators.required]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);


  ngOnInit() {
  }

 async takeImage(){
  const dataUrl = (await this.utilsSvc.takePicture('Imagen del documento')).dataUrl;
  this.form.controls.image.setValue(dataUrl);

  }

  async submit(){
    if(this.form.valid){
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.signUp(this.form.value as User).then(async res => {

        await this.firebaseSvc.updateUser(this.form.value.name);

        let uid= res.user.uid;
        this.form.controls.uid.setValue(uid);

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
