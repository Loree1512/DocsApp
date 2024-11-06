import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConvertDocComponent } from './convert-doc.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

describe('ConvertDocComponent', () => {
  let component: ConvertDocComponent;
  let fixture: ComponentFixture<ConvertDocComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertDocComponent ],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ConvertDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
