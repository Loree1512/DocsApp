import { Component, inject, OnInit } from '@angular/core';
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
