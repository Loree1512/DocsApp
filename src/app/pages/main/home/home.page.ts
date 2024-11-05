import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddDocComponent } from 'src/app/shared/components/add-doc/add-doc.component';
import { ScanDocComponent } from 'src/app/shared/components/scan-doc/scan-doc.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSVC = inject(FirebaseService);
  uitlsSvc = inject(UtilsService);

  ngOnInit() {
  }

  signOut(){
    this.firebaseSVC.signOut();
  }

  user(): User{
    return this.uitlsSvc.getFromLocalStorege('user');
  }

  ionViewWillEnter(){
    this.getDocs();
  }

  getDocs() {
    let path = `users/${this.user().uid}/documents`;

    let sub = this.firebaseSVC.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        sub.unsubscribe();
      },
      error: (err: any) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  addDoc(){
    this.uitlsSvc.presentModal({
      component: AddDocComponent,
      cssClass: 'add-doc-modal'
    });
  }

  scanDoc(){
    this.uitlsSvc.presentModal({
      component: ScanDocComponent,
      cssClass: 'scan-doc-modal'

    });
  }

}
