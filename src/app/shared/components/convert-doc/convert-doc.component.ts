import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DocxToPdfService } from 'src/app/services/docx-to-pdf.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-convert-doc',
  templateUrl: './convert-doc.component.html',
  styleUrls: ['./convert-doc.component.scss'],
})
export class ConvertDocComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  isConverting: boolean = false;  // Estado de conversión
  pdfDocuments$: Observable<any[]>; 

  constructor(
    private fb: FormBuilder,
    private docxToPdfService: DocxToPdfService,
    private firebaseSvc: FirebaseService
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    // Obtener la lista de documentos PDF almacenados en Firestore
    this.pdfDocuments$ = this.firebaseSvc.getCollectionData('pdfDocuments');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedFile = input.files[0];
    }
  }

  async convertToPdf() {
    if (this.selectedFile) {
      this.isConverting = true;  // Activar estado de conversión
      try {
        // Convertir el archivo a PDF
        const pdfBytes = await this.docxToPdfService.convertDocxToPdf(this.selectedFile);

        // Crear un Blob para subirlo a Firebase Storage
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = `${new Date().getTime()}.pdf`;  // Nombre único
        const filePath = `/pdfDocuments/${fileName}`;
        
        // Subir el archivo PDF a Firebase Storage
        const fileRef = this.firebaseSvc.getStorageRef(filePath);
        await uploadBytes(fileRef, blob);

        // Obtener la URL de descarga del archivo subido
        const downloadURL = await getDownloadURL(fileRef);

        // Guardar el nombre del archivo y la URL de descarga en Firestore
        await this.firebaseSvc.addDocument('pdfDocuments', { name: fileName, url: downloadURL });

        console.log('Archivo PDF subido y guardado en Firestore exitosamente!');
      } catch (error) {
        console.error('Error en la conversión o subida del archivo:', error);
      } finally {
        this.isConverting = false;  // Desactivar estado de conversión
      }
    }
  }

  // Métodos para visualizar y descargar el PDF
  viewPdf(fileUrl: string) {
    window.open(fileUrl, '_blank');
  }

  downloadPdf(fileUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  }
}