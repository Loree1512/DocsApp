import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() userUID: string;
  @Input() documentId: string;

  private map: L.Map;

  constructor(private firebaseSvc: FirebaseService, private modalController: ModalController, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    if (this.latitude && this.longitude) {
      console.log('Coordenadas recibidas en MapComponent:', { latitude: this.latitude, longitude: this.longitude });
      this.initMap(this.latitude, this.longitude);
    } else {
      console.error('No se recibieron las coordenadas.');
    }
  }

  ngAfterViewInit() {
    // Recargar el tamaño del mapa después de que el modal esté renderizado
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();  // Forzar recálculo de tamaño
      }
    }, 500);  // Ajustar el tiempo según el comportamiento
  }


  initMap(latitude: number, longitude: number): void {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
      console.error('Contenedor del mapa no encontrado.');
      return;
    }
  
    this.map = L.map('mapContainer', {
      zoomControl: true,
      attributionControl: true,
    }).setView([latitude, longitude], 13);
  
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(this.map);
  
  L.control.scale().addTo(this.map);
  L.marker([latitude, longitude]).addTo(this.map)
    // Verificación de las coordenadas antes de agregar el marcador
    console.log('Coordenadas para el marcador:', latitude, longitude);
  
    // Redimensionar el mapa después de la inicialización
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('Redimensionando el mapa...');
      }
    }, 500);
  }

  ionViewDidEnter(): void {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
      console.error('Contenedor del mapa no encontrado.');
      return;
    }
  
    console.log('Dimensiones iniciales del contenedor:', mapContainer.clientWidth, mapContainer.clientHeight);
  
    // Inicializar el mapa si no está ya inicializado
    if (!this.map) {
      console.log('Inicializando mapa...');
      this.initMap(this.latitude, this.longitude);
    }
  
    setTimeout(() => {
      if (this.map) {
        console.log('Reajustando el tamaño del mapa...');
        this.map.invalidateSize();
      }
    }, 500);
  }


  reloadTiles(): void {
    // Recargar las baldosas del mapa
    if (this.map) {
      console.log('Recargando baldosas...');
      this.map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          layer.redraw(); // Forzar el redibujado de las baldosas
        }
      });
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}