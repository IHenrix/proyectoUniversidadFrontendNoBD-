import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  constructor(
    private http: HttpClient,
  ) {
  }
  private baseEndpoint = environment.urlApiMicroservices.domain + '/docente';

  listarSecciones(docenteId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('docenteId', docenteId);
    return this.http.get<any>(this.baseEndpoint + '/secciones', { params: params })
  }

  listarAlumnos(seccionId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('seccionId', seccionId);
    return this.http.get<any>(this.baseEndpoint + '/secciones/alumnos', { params: params })
  }
  registrarEditarNotas(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/registrar-editar-notas', JSON.stringify(data))
  }
  eliminarNota(notaId: number, alumnoCursoId:number, seccionId:number): Observable<any> {
    return this.http.delete<any>(this.baseEndpoint + '/nota/'+notaId+'/alumno/'+alumnoCursoId+'/seccion/'+seccionId)
  }

}
