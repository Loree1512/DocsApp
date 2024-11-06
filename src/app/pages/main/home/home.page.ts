import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddDocComponent } from 'src/app/shared/components/add-doc/add-doc.component';
import { ConvertDocComponent } from 'src/app/shared/components/convert-doc/convert-doc.component';
import { ScanDocComponent } from 'src/app/shared/components/scan-doc/scan-doc.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {
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