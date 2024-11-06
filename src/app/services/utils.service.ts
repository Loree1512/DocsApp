import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCtrl = inject(ModalController);
  router = inject(Router);


async takePicture(promptLabelHeader: string){
  return await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    promptLabelHeader,
    promptLabelPhoto:'Seleciona una imagen',
    promptLabelPicture:'Tomar una foto',

  });
};

  loading() {
    return this.loadingCtrl.create({ spinner: "crescent" });
  }

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }


  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorege(key: string) {
    const item = localStorage.getItem(key);
    // Verifica si el valor existe y no es null ni undefined
    if (item) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error('Error al parsear JSON:', error);
        return null; // o algún valor por defecto
      }
    }
    return null; // o algún valor por defecto si el item no existe
  }

  async presentModal(opts: ModalOptions){
    const modal = await this.modalCtrl.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) return data;
  }

  dismissModal(data?: any){
    return this.modalCtrl.dismiss(data);
  }
}
