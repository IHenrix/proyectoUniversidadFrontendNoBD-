import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminService } from 'src/app/service/admin.service';
import { AuthService } from 'src/app/service/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { alertNotificacion } from 'src/app/util/helpers';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  cursos:any[]=[];
  usuarios:any[]=[];
  secciones:any[]=[];
  selectedTab: 'cursos' | 'secciones' | 'usuarios' = 'cursos';

  cursoForm: FormGroup;
  usuarioForm: FormGroup;
  seccionForm: FormGroup;

  modalidades = [
    {code:'P', label:'Presencial'},
    {code:'R', label:'Remota'},
    {code:'V', label:'Virtual'}
  ];

  constructor(private fb: FormBuilder, private adminService: AdminService, public auth: AuthService, private spinner: NgxSpinnerService) {
    this.cursoForm = this.fb.group({
      nombre: ['', Validators.required],
      horas_semanales: [0, Validators.required],
      creditos: [0, Validators.required],
      modalidad: ['P', Validators.required]
    });

    this.usuarioForm = this.fb.group({
      username: ['', Validators.required],
      passw: ['', Validators.required],
      nombre: ['', Validators.required],
      paterno: [''],
      materno: [''],
      sexo: ['M'],
      email: [''],
      codigo: [''],
      rol_id: [2, Validators.required], // por defecto docente
      activo: [true]
    });

    this.seccionForm = this.fb.group({
      codigo: ['', Validators.required],
      curso_id: [null, Validators.required],
      docente_id: [null, Validators.required],
      modalidad: ['P', Validators.required],
      numero_vez: [1],
      estado: ['E'],
      horarios: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadData();
  }

  get horariosArray(): FormArray {
    return this.seccionForm.get('horarios') as FormArray;
  }

  addHorario() {
    this.horariosArray.push(this.fb.group({
      dia: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required]
    }));
  }

  removeHorario(index:number) {
    this.horariosArray.removeAt(index);
  }

  loadData() {
    this.spinner.show();
    this.adminService.listarCursos().subscribe(c=> this.cursos = c);
    this.adminService.listarUsuarios().subscribe(u=> this.usuarios = u);
    this.adminService.listarSecciones().subscribe(s=> { this.secciones = s; this.spinner.hide(); }, _=> this.spinner.hide());
  }

  crearCurso() {
    if (this.cursoForm.invalid) return;
    this.spinner.show();
    this.adminService.crearCurso(this.cursoForm.value).subscribe({
      next: res => {
        this.cursos.push(res);
        this.cursoForm.reset({modalidad:'P'});
        this.spinner.hide();
        Swal.fire({icon:'success', title:'Curso creado', text: res.nombre || 'Registro guardado', confirmButtonColor:'#00A5A5'});
      },
      error: ()=> { alertNotificacion("No se pudo crear curso"); this.spinner.hide(); }
    });
  }

  crearUsuario() {
    if (this.usuarioForm.invalid) return;
    this.spinner.show();
    this.adminService.crearUsuario(this.usuarioForm.value).subscribe({
      next: res => {
        this.usuarios.push(res);
        this.spinner.hide();
        Swal.fire({icon:'success', title:'Usuario creado', text: res.username || 'Registro guardado', confirmButtonColor:'#00A5A5'});
      },
      error: ()=> { alertNotificacion("No se pudo crear usuario"); this.spinner.hide(); }
    });
  }

  crearSeccion() {
    if (this.seccionForm.invalid) return;
    this.spinner.show();
    this.adminService.crearSeccion(this.seccionForm.value).subscribe({
      next: res => {
        this.secciones.push(res);
        this.seccionForm.reset({modalidad:'P', numero_vez:1, estado:'E', horarios:[]});
        this.horariosArray.clear();
        this.spinner.hide();
        Swal.fire({icon:'success', title:'Sección creada', text: res.codigo || 'Registro guardado', confirmButtonColor:'#00A5A5'});
      },
      error: ()=> { alertNotificacion("No se pudo crear seccion"); this.spinner.hide(); }
    });
  }

  cambiarTab(tab:'cursos'|'secciones'|'usuarios'){
    this.selectedTab = tab;
  }

  nombreCurso(id: number): string {
    const c = this.cursos.find(x => x.id === id);
    return c ? c.nombre : 'N/D';
  }

  nombreUsuario(id: number): string {
    const u = this.usuarios.find(x => x.id === id);
    return u ? `${u.nombre || ''} ${u.paterno || ''}`.trim() : 'N/D';
  }
}
