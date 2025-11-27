import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/service/auth.service';
import { alertNotificacion } from 'src/app/util/helpers';
import { CONSTANTES } from 'src/app/shared/enum/perfil.type';
import { environment } from 'src/environments/environment';
import Swal, { SweetAlertIcon } from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  version:string;
  constructor(private router: Router, private spinner: NgxSpinnerService,private _authService:AuthService) {
    this.version = environment.version;
  }
  NAME_SYSTEM:string=environment.nameSystem.toUpperCase();
  hide = true;

  ngOnInit() {

  }
  subFormLogin = false;
  form_login = new FormGroup({
    usuario: new FormControl("", [Validators.required]),
    pass: new FormControl("", [Validators.required]),
  });

  get getflogin() {
    return this.form_login.controls;
  }

  login() {
    this.subFormLogin = true;
    if (this.form_login.invalid) {
      return;
    }
    this.iniciarSesion();
  }
  iniciarSesion(){
    this.spinner.show();
    this._authService.login(this.form_login.getRawValue()).subscribe({
      next: resp => {
        if (resp) {
          this._authService.saveUser(resp);
          const rol = this._authService.obtenerRol();
          if (rol === CONSTANTES.ALUMNOS_ROL) {
            this.router.navigate(["/usuario/alumno"]);
          } else if (rol === CONSTANTES.DOCENTE_ROL) {
            this.router.navigate(["/usuario/docente"]);
          } else if (rol === CONSTANTES.ADMIN_ROL) {
            this.router.navigate(["/admin"]);
          } else {
            this.router.navigate(["/login"]);
          }
        }
        else{
          alertNotificacion("El usuario y contraseña no coincide")
        }
      },
      error: () => {
        Swal.fire({ icon: "error", title: "Se ha producido un error al intentar ingresar al módulo(Esto puede ser debido por una desconexion a la base de datos o algun error en el programa)", text: "Intente nuevamente,si persiste por favor comunicarse con soporte del sistema" });
        this.spinner.hide();
      },
      complete: () =>{
        this.spinner.hide();
      }
    })
  }


}
