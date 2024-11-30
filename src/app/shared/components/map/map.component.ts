import { Component, AfterViewInit, Input } from '@angular/core';
import * as L from 'leaflet';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Document } from 'src/app/models/document.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  @Input() userUID!: string; // Recibe el UID del usuario
  @Input() documentId?: string; // Opcional: Recibe un documentId si se especifica

  map: any;

  constructor(private firebaseSvc: FirebaseService, private modalController: ModalController) {}

  ngAfterViewInit() {
    this.initializeMap();

    if (this.documentId) {
      // Cargar un solo documento por documentId
      this.loadSingleDocumentLocation();
    } else {
      // Cargar todas las ubicaciones para el userUID
      this.loadAllDocumentLocations();
    }
  }

  initializeMap() {
    this.map = L.map('map').setView([-33.0153, -71.5500], 13); // Viña del Mar, Chile

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  loadAllDocumentLocations() {
    this.firebaseSvc.getDocumentsFromStorage(this.userUID).subscribe((documents: Document[]) => {
      const group = L.featureGroup(); // Agrupar los marcadores

      documents.forEach((doc) => {
        if (doc.latitude && doc.longitude) {
          // Crear un marcador para cada documento
          const marker = L.marker([doc.latitude, doc.longitude]).bindPopup(
            `<strong>${doc.name}</strong><br>${doc.description || ''}`
          );

          marker.addTo(this.map);
          group.addLayer(marker); // Agregar el marcador al grupo
        }
      });

      // Ajustar el mapa para mostrar todos los marcadores
      if (group.getBounds().isValid()) {
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    });
  }

  loadSingleDocumentLocation() {
    this.firebaseSvc.getDocumentsFromStorage(this.userUID).subscribe((documents: Document[]) => {
      // Filtrar el documento con el documentId específico
      const doc = documents.find((d) => d.documentId === this.documentId);

      if (doc && doc.latitude && doc.longitude) {
        // Crear un marcador para el documento específico
        L.marker([doc.latitude, doc.longitude])
          .addTo(this.map)
          .bindPopup(`<strong>${doc.name}</strong><br>${doc.description || ''}`)
          .openPopup();

        // Centrar el mapa en la ubicación del documento
        this.map.setView([doc.latitude, doc.longitude], 13);
      }
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}