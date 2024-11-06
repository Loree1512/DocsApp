import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  pages = [
    {title:'Inico', url:'home', icon:'home-outline'},
    {title:'Perfil', url:'profile', icon:'person-outline'},
  ]
    
  

  ngOnInit() {
  }

}
