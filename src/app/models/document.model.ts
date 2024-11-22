export interface Document {
    documentId: string;
    name: string;
    category: string;
    description: string;
    documentUrl: string;
    createdAt: Date;
    latitude: number;
    longitude: number;
    // Añadir más propiedades si es necesario
  }