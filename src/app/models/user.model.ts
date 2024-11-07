export interface User{
    uid: string,
    email: string,
    password: string,
    name: string,
    photoURL?: string;
    documentId?: string;
}