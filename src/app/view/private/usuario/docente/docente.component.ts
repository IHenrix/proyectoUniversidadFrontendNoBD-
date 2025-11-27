import { Component, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Usuario } from 'src/app/interfaces/auth/usuario';
import { AlumnoService } from 'src/app/service/alumno.service';
import { AuthService } from 'src/app/service/auth.service';
import { DocenteService } from 'src/app/service/docente.service';
import { CONSTANTES } from 'src/app/shared/enum/perfil.type';
import { alertNotificacion, languageDataTable } from 'src/app/util/helpers';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.component.html',
  styleUrls: ['./docente.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DocenteComponent implements OnInit {

  constructor(private docenteService: DocenteService, private alumnoService: AlumnoService, private modalservice: NgbModal, public authService: AuthService, private spinner: NgxSpinnerService) { }
  usuario: Usuario = null;
  listaCursos: any = [];
  listaAlumnos: any = [];
  listaNotas: any = [];

  CONSTANTES: typeof CONSTANTES = CONSTANTES;

  @ViewChild('modal_editar_notas') modal_editar_notas: NgbModalRef;
  modal_editar_notas_va: any;
  notaPonderada: string = '0.00';
  inputEnFoco: boolean = false;
  lectura: boolean = false;
  @ViewChildren(DataTableDirective) private dtElements;
  datatable_lista_alumnos: DataTables.Settings = {};
  datatable_dtTrigger_lista_alumnos: Subject<ADTSettings> = new Subject<ADTSettings>();
  cursoSeleccionado: any = null;
  alumnoSeleccionado: any = null;
  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }
  notaPoderada: string | number = "-";
  notaPoderadaAlumno: string | number = "-";
  notaPoderadaAlumnoReal: string | number = "-";

  invalidGuardarNotas: boolean = true;
  ngOnInit() {
    this.usuario = this.authService.usuario;
    setTimeout(() => {
      this.datatable_lista_alumnos = {
        dom: '<"top"if>rt<"bottom">p<"clear">',
        paging: true,
        pagingType: 'full_numbers',
        pageLength: 10,
        responsive: true,
        language: languageDataTable("Alumnos"),
        columns: [
          { data: 'id' },
          { data: 'codigo' },
          { data: 'nombre' },
          { data: 'paterno' },
          { data: 'materno' },
          {
            data: 'notaAlumnoFinal', render: (data: any) => {
              if (data == null) {
                return '--';
              }
              return data;
            }
          },
          {
            data: 'estado', render: (data: any) => {
              let span = "";
              switch (data) {
                case 'E':
                  span = '<span class="badge-sunarp badge-sunarp-gray-light">En curso</span>'
                  break;
                case 'A':
                  span = '<span class="badge-sunarp badge-sunarp-green">Aprobado</span>'
                  break;
                case 'D':
                  span = '<span class="badge-sunarp badge-sunarp-red">Desaprobado</span>'
                  break;
              }
              return span;
            }
          },
          {
            data: 'id', render: () => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-black ver_detalle mr-3"><i class="fa fa-eye" aria-hidden="true"></i> Ver</button><button type="button" class="btn-sunarp-red editar_notas mr-3"><i class="fa fa-pencil" aria-hidden="true"></i> Editar</button></div';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.ver_detalle', row).off().on('click', () => {
            this.seleccionAlumno(data, true);
          });
          $('.editar_notas', row).off().on('click', () => {
            this.seleccionAlumno(data, false);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }
    });
    this.listarCursos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable_dtTrigger_lista_alumnos.next(this.datatable_lista_alumnos);
    }, 200);
  }

  listarCursos() {
    this.spinner.show();
    this.docenteService.listarSecciones(this.usuario.id).subscribe({
      next: resp => {
        this.listaCursos = resp;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    })
  }

  seleccionarCurso(curso: any) {
    this.spinner.show();
    this.docenteService.listarAlumnos(curso.id).subscribe({
      next: resp => {
        this.listaAlumnos = resp;
        this.cursoSeleccionado = curso;
        this.recargarTabla();
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    })
  }

  seleccionAlumno(data: any, lectura: boolean) {
    this.spinner.show();
    this.alumnoService.listarNotas(this.cursoSeleccionado.id, data.id).subscribe({
      next: resp => {
        this.lectura = lectura;
        this.alumnoSeleccionado = data;
        if (this.alumnoSeleccionado.estado == 'A' || this.alumnoSeleccionado.estado == 'D') {
          this.notaPoderada = this.alumnoSeleccionado.notaFinal;
          this.notaPoderadaAlumno = this.alumnoSeleccionado.notaAlumnoFinal;
          this.notaPoderadaAlumnoReal = this.alumnoSeleccionado.notaAlumnoReal;
        }
        else {
          this.notaPoderada = "-";
          this.notaPoderadaAlumno = "-";
          this.notaPoderadaAlumnoReal = "-";
        }
        this.modal_editar_notas_va = this.modalservice.open(this.modal_editar_notas, { ...this.modalOpciones, size: 'lg' });
        this.listaNotas = resp;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    })
  }

  regresarListaCursos() {
    this.cursoSeleccionado = null;
  }

  recargarTabla() {
    let tabla_ren = this.dtElements._results[0].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(this.listaAlumnos).draw();
    });
  }

  formatearNota(index: number): void {
    this.notaPoderada = "-";
    this.notaPoderadaAlumno = "-";
    this.notaPoderadaAlumnoReal = "-";
    const nota = this.listaNotas[index].nota;
    if (nota === null || nota === '' || isNaN(nota) || nota < 0 || nota > 20) {
      this.listaNotas[index].nota = '';
      this.listaNotas[index].notaAlumno = '';
      return;
    }
    this.listaNotas[index].nota = this.formatearDecimal(nota);
    this.listaNotas[index].notaAlumno = this.notaFavorAlumno(nota);
    this.notaPoderada = this.calcularPromedio();
    this.notaPoderadaAlumnoReal = this.calcularPromedioFavorAlumno();
    this.notaPoderadaAlumno = this.notaPoderadaAlumnoReal != '-' ? this.notaFavorAlumno(Number(this.notaPoderadaAlumnoReal)) : '-';
  }
  notaFavorAlumno(value: number): string {
    const decimalPart = Math.round((value % 1) * 100) / 100;
    const rounded = decimalPart >= 0.6 ? Math.ceil(value) : Math.floor(value);
    return rounded < 10 ? `0${rounded}` : `${rounded}`;
  }

  validarRango(valor: string | number | null): 'valid' | 'invalid' | 'empty' {
    if (valor === null || valor === '') {
      return 'empty';
    }
    const nota = parseFloat(valor.toString());
    if (isNaN(nota) || nota < 0 || nota > 20) {
      return 'invalid';
    }
    return 'valid';
  }
  formatearDecimal(valor: string | number): string {
    const num = parseFloat(valor.toString());
    return num.toFixed(2);
  }

  tieneNotasInvalidas(): boolean {
    const todasNulas = this.listaNotas.every(nota => nota.nota === null || nota.nota === undefined || nota.nota === '');
    if (todasNulas) {
      return true;
    }
    const algunaInvalida = this.listaNotas.some(nota => {
      const valor = nota.nota;
      return valor !== null && valor !== undefined && valor !== '' && (isNaN(valor) || valor < 0 || valor > 20);
    });
    return algunaInvalida;
  }

  todasNotasValidas(): boolean {
    return this.listaNotas.every(nota => {
      const valor = nota.nota;
      return valor !== null && valor !== undefined && valor !== '' && !isNaN(valor) && valor >= 0 && valor <= 20;
    });
  }
  calcularPromedio(): string | number {
    if (!this.todasNotasValidas()) {
      return '-';
    }
    const promedio = this.listaNotas.reduce((acumulador, nota) => {
      const valor = nota.nota;
      const porcentaje = nota.porcentaje;
      return acumulador + (valor * (porcentaje / 100));
    }, 0);
    return promedio.toFixed(2);
  }
  calcularPromedioFavorAlumno() {
    if (!this.todasNotasValidas()) {
      return '-';
    }
    const promedio = this.listaNotas.reduce((acumulador, nota) => {
      const valor = nota.notaAlumno;
      const porcentaje = nota.porcentaje;
      return acumulador + (valor * (porcentaje / 100));
    }, 0);
    return this.formatearDecimal(promedio);
  }


  guardarNotas() {
    const request = {
      alumnoCursoId: this.alumnoSeleccionado.id,
      seccionId: this.cursoSeleccionado.id,
      notas: this.listaNotas
    }
    this.spinner.show();
    this.docenteService.registrarEditarNotas(request).subscribe({
      next: () => {
        Swal.fire({
          icon: "success",
          title: "Se ha guardado satisfactoriamente las notas del alumno " +
            this.alumnoSeleccionado?.paterno + ' ' +
            this.alumnoSeleccionado?.materno + ' ' +
            this.alumnoSeleccionado?.nombre,
          text: environment.nameSystem,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          confirmButtonColor: '#00A5A5',
          confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>'
        }).then((result) => {
          if (result.isConfirmed) {
            this.seleccionarCurso(this.cursoSeleccionado);
          }
        });
        this.spinner.hide();
        this.modal_editar_notas_va.close();
      },
      error: () => {
        alertNotificacion("Se ha producido un error al intentar registrar o editar las notas")
        this.spinner.hide();
      },
    })

  }

  eliminarNotaAlumno(nota: any) {
    Swal.fire({
      icon: "warning",
      title: "Desea eliminar la nota " + nota.notaAlumno + " de " + nota.criterio + " del alumno " + this.alumnoSeleccionado?.paterno + ' ' +
        this.alumnoSeleccionado?.materno + " " +
        this.alumnoSeleccionado?.nombre + "?",
      text: "Esta accion es irreversible",
      confirmButtonText: '<span style="padding: 0 12px;">Si, eliminar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.docenteService.eliminarNota(nota.notaId,this.alumnoSeleccionado.id,this.cursoSeleccionado.id).subscribe({
          next: () => {
            Swal.fire({
              icon: "info",
              title: "Se ha eliminado la nota correctamente",
              text: environment.nameSystem,
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              confirmButtonColor: '#00A5A5',
              confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>'
            }).then((r) => {
              if (r.isConfirmed) {
                this.seleccionarCurso(this.cursoSeleccionado);
              }
            });
            this.spinner.hide();
            this.modal_editar_notas_va.close();
          },
          error: () => {
            alertNotificacion("Se ha producido un error al intentar eliminar la nota")
            this.spinner.hide();
          },
        })
      }
    });
  }

}
