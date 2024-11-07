import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);


  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
  
      try {
        const res = await this.firebaseSvc.signIn(this.form.value as User);
        const user = res.user;
  
        if (user) {
          const userData = {
            uid: user.uid,
            name: user.displayName || 'Usuario',
            email: user.email
          };
  
          this.utilsSvc.saveInLocalStorage('user', userData);
          this.utilsSvc.presentToast({
            message: `Bienvenido, ${userData.name}!`,
            duration: 2000,
            position: 'middle',
            color: 'success',
            icon: 'checkmark-circle-outline'
          });
  
          this.getUserInfo(userData.uid); 
          this.utilsSvc.routerLink('/main/home');
        }
      } catch (error) {
        console.error(error);
        this.utilsSvc.presentToast({
          message: error.message,
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

  async getUserInfo(uid: string) {
    const loading = await this.utilsSvc.loading();
    await loading.present();
  
    try {
      const docId = uid; // Aquí deberías definir el docId adecuado
      const userDoc = await this.firebaseSvc.getDocument(uid, docId); // Pasa ambos parámetros
  
      if (userDoc) {
        this.utilsSvc.saveInLocalStorage('user', userDoc);
        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${userDoc.name}`,
          duration: 2000,
          position: 'middle',
          color: 'success',
          icon: 'person-circle-outline'
        });
        this.form.reset();
      }
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      this.utilsSvc.presentToast({
        message: error.message,
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
