import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private base = environment.urlApiMicroservices.domain + '/admin';
  constructor(private http: HttpClient) {}

  // Cursos
  listarCursos(): Observable<any> { return this.http.get<any>(`${this.base}/cursos`); }
  crearCurso(data:any): Observable<any> { return this.http.post<any>(`${this.base}/cursos`, data); }

  // Secciones
  listarSecciones(): Observable<any> { return this.http.get<any>(`${this.base}/secciones`); }
  crearSeccion(data:any): Observable<any> { return this.http.post<any>(`${this.base}/secciones`, data); }

  // Usuarios
  listarUsuarios(): Observable<any> { return this.http.get<any>(`${this.base}/usuarios`); }
  crearUsuario(data:any): Observable<any> { return this.http.post<any>(`${this.base}/usuarios`, data); }
}
