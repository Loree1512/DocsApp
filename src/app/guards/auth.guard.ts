import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  firebaseSVC = inject(FirebaseService);
  uitlsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    let user = localStorage.getItem('user');
    
    return new Promise((resolve)=>(

      this.firebaseSVC.getAuth().onAuthStateChanged((auth) => {
        if (auth) {
          if (user) resolve(true);
        } else {
          this.firebaseSVC.signOut();
          resolve(false);
        }
      })

    ));
  }
}
