import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Usuario } from '../interfaces/auth/usuario';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _usuario: Usuario;
  constructor(

    private http: HttpClient,
  ) {
  }

  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (
      this._usuario == null &&
      localStorage.getItem("usuario_uni") != null
    ) {
      this._usuario = JSON.parse(
        localStorage.getItem("usuario_uni")
      ) as Usuario;
      return this._usuario;
    }
    return new Usuario();
  }

  login(data:any): Observable<any> {
    const urlEndpoint = environment.urlApiMicroservices.domain + "/usuario/login";
    return this.http.post<any>(urlEndpoint, JSON.stringify(data));
  }

  saveUser(data: any): void {
    this._usuario = data as Usuario;
    localStorage.setItem("usuario_uni", JSON.stringify(this._usuario));
  }

  validUsuario(): string {
    return localStorage.getItem("usuario_uni");
  }

  logout() {
    localStorage.removeItem("usuario_uni");
  }

  authenticated(): boolean {
    let valid: string = this.validUsuario();
    if (valid != '') {
      return true;
    }
    return false;
  }

   obtenerRol(): number {
    if (this._usuario) {
      return this._usuario.rol_id;
    }
    return null;
  }

 /*convertirRol(rol: string): string {
    switch (rol) {
      case 'ROLE_USER':
        return 'ALUMNO';
      case 'ROLE_DOCENTE':
        return 'DOCENTE';
      case 'ROLE_ADMIN':
        return 'ADMINISTRADOR';
      default:
        return '-';
    }
  }
  mostrarRolActual():string{
    return this.convertirRol(this.obtenerRol());
  }*/



}
