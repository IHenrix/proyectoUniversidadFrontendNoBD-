import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Usuario } from 'src/app/interfaces/auth/usuario';
import { AlumnoService } from 'src/app/service/alumno.service';
import { AuthService } from 'src/app/service/auth.service';
import { CONSTANTES } from 'src/app/shared/enum/perfil.type';

@Component({
  selector: 'app-alumno',
  templateUrl: './alumno.component.html',
  styleUrls: ['./alumno.component.scss']
})
export class AlumnoComponent implements OnInit {

  constructor(private alumnoService: AlumnoService, public authService: AuthService,private spinner: NgxSpinnerService, private modalservice: NgbModal) { }
  usuario: Usuario = null;
  CONSTANTES: typeof CONSTANTES = CONSTANTES;
  listaCursos:any=[];
  listaDisponibles:any=[];
  alumnoSeleccionado:any=null;
  listaNotas:any=[];
  @ViewChild('modal_ver_notas') modal_ver_notas: NgbModalRef;
  modal_ver_notas_va: any;
  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }

  ngOnInit() {
    this.spinner.show();
    this.usuario = this.authService.usuario;
    this.cargarListas();
  }

  cargarListas(){
    this.spinner.show();
    this.alumnoService.listarSecciones(this.usuario.id).subscribe({
      next: resp => {
        this.listaCursos=resp;
        this.spinner.hide();
      },
      error: () => { this.spinner.hide(); },
    });
    this.alumnoService.listarSeccionesDisponibles(this.usuario.id).subscribe({
      next: resp => { this.listaDisponibles = resp; },
      error: () => {},
    });
  }

  seleccionAlumno(alumno:any){
    this.spinner.show();
    this.alumnoService.listarNotas(alumno.seccion_id,alumno.alumno_curso_id).subscribe({
      next: resp => {
        this.alumnoSeleccionado=alumno;
        this.modal_ver_notas_va = this.modalservice.open(this.modal_ver_notas, { ...this.modalOpciones, size: 'lg' });
        this.listaNotas=resp;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    })
  }

  matricular(seccion:any){
    this.spinner.show();
    this.alumnoService.matricular(this.usuario.id, seccion.seccion_id).subscribe({
      next: () => {
        this.cargarListas();
        this.spinner.hide();
      },
      error: () => { this.spinner.hide(); }
    })
  }


}
