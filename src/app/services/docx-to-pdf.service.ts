import { Injectable } from '@angular/core';
import * as mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class DocxToPdfService {
    async convertDocxToPdf(file: File): Promise<Uint8Array> {
        try {
            // Convertir el archivo DOCX a Uint8Array y luego a HTML con Mammoth
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer: uint8Array });
            console.log('Contenido HTML generado:', htmlContent);  // Verifica que el contenido HTML se genera correctamente
        
            // Crear un contenedor HTML en el documento (oculto)
            const div = document.createElement('div');
            div.innerHTML = htmlContent;
            div.style.width = '210mm'; // Ancho A4 para el PDF
            div.style.height = '297mm'; // Altura A4 para el PDF
            div.style.visibility = 'hidden';
            div.style.backgroundColor = 'white';  // Asegurarse de que tenga un fondo blanco
            document.body.appendChild(div);
        
            // Verificar si el contenido se muestra correctamente en la página
            console.log('Div con contenido HTML:', div);

            //Verificar el tamaño y contenido
            
        
            // Convertir el HTML a Canvas
            const canvas = await html2canvas(div, { scale: 2 });
            console.log('Canvas generado:', canvas);  // Verifica el contenido del canvas
            document.body.removeChild(div); // Eliminar el contenedor

            // Mostrar la imagen del canvas en el HTML para asegurarse de que se genera correctamente
            const img = new Image();
            img.src = canvas.toDataURL('image/png');
            document.body.appendChild(img); 
        
            // Crear el PDF y agregar el canvas como imagen
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let position = 0;
        
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            if (imgHeight > pageHeight) {
              while (position < imgHeight) {
                position += pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              }
            }
        
            const pdfArrayBuffer = pdf.output('arraybuffer');
            return new Uint8Array(pdfArrayBuffer);
          } catch (error) {
            console.error('Error al convertir el archivo:', error);
            throw new Error('Error al convertir el archivo .docx a PDF');
          }
        }
    }