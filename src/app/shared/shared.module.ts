import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddDocComponent } from './components/add-doc/add-doc.component';
import { ScanDocComponent } from './components/scan-doc/scan-doc.component';
import { ConvertDocComponent } from './components/convert-doc/convert-doc.component';



@NgModule({
  declarations: [
    HeaderComponent, 
    CustomInputComponent,
    LogoComponent,
    AddDocComponent,
    ScanDocComponent,
    ConvertDocComponent
  ],
  exports:[
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    ReactiveFormsModule,
    AddDocComponent,
    ScanDocComponent,
    ConvertDocComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
