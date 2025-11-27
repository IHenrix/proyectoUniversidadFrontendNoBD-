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
  editCursoId: number | null = null;
  editSeccionId: number | null = null;
  editUsuarioId: number | null = null;

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
    if (this.cursoForm.invalid) { this.cursoForm.markAllAsTouched(); return; }
    this.spinner.show();
    const payload = this.cursoForm.value;
    const obs = this.editCursoId ? this.adminService.actualizarCurso(this.editCursoId, payload) : this.adminService.crearCurso(payload);
    obs.subscribe({
      next: res => {
        if (this.editCursoId) {
          const idx = this.cursos.findIndex(c=>c.id===this.editCursoId);
          if (idx>=0) this.cursos[idx]=res;
        } else {
          this.cursos.push(res);
        }
        this.cursoForm.reset({modalidad:'P'});
        this.editCursoId=null;
        this.spinner.hide();
        Swal.fire({icon:'success', title:'Curso guardado', text: res.nombre || 'Registro guardado', confirmButtonColor:'#00A5A5'});
      },
      error: ()=> { alertNotificacion("No se pudo guardar curso"); this.spinner.hide(); }
    });
  }

  crearUsuario() {
    if (this.usuarioForm.invalid) { this.usuarioForm.markAllAsTouched(); return; }
    this.spinner.show();
    const payload = this.usuarioForm.value;
    const obs = this.editUsuarioId ? this.adminService.actualizarUsuario(this.editUsuarioId, payload) : this.adminService.crearUsuario(payload);
    obs.subscribe({
      next: res => {
        if (this.editUsuarioId) {
          const idx = this.usuarios.findIndex(u=>u.id===this.editUsuarioId);
          if (idx>=0) this.usuarios[idx]=res;
        } else {
          this.usuarios.push(res);
        }
        this.usuarioForm.reset({rol_id:2, activo:true});
        this.editUsuarioId=null;
        this.spinner.hide();
        Swal.fire({icon:'success', title:'Usuario guardado', text: res.username || 'Registro guardado', confirmButtonColor:'#00A5A5'});
      },
      error: ()=> { alertNotificacion("No se pudo guardar usuario"); this.spinner.hide(); }
    });
  }

  crearSeccion() {
    if (this.seccionForm.invalid) { this.seccionForm.markAllAsTouched(); return; }
    this.spinner.show();
    const payload = this.seccionForm.value;
    const obs = this.editSeccionId ? this.adminService.actualizarSeccion(this.editSeccionId, payload) : this.adminService.crearSeccion(payload);
    obs.subscribe({
      next: res => {
        if (this.editSeccionId) {
          const idx = this.secciones.findIndex(s=>s.id===this.editSeccionId);
          if (idx>=0) this.secciones[idx]=res;
        } else {
          this.secciones.push(res);
        }
        this.seccionForm.reset({modalidad:'P', numero_vez:1, estado:'E', horarios:[]});
        this.horariosArray.clear();
        this.editSeccionId=null;
        this.spinner.hide();
        Swal.fire({icon:'success', title:'Sección guardada', text: res.codigo || 'Registro guardado', confirmButtonColor:'#00A5A5'});
      },
      error: ()=> { alertNotificacion("No se pudo guardar seccion"); this.spinner.hide(); }
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

  editarCurso(c:any){
    this.selectedTab='cursos';
    this.editCursoId = c.id;
    this.cursoForm.patchValue(c);
  }

  cancelarCurso() {
    this.editCursoId = null;
    this.cursoForm.reset({modalidad:'P'});
  }

  eliminarCurso(id:number){
    Swal.fire({icon:'warning', title:'Eliminar curso', text:'¿Desea eliminar este curso?', showCancelButton:true, confirmButtonColor:'#d75443'}).then(r=>{
      if (r.isConfirmed){
        this.adminService.eliminarCurso(id).subscribe(()=> {
          this.cursos = this.cursos.filter(c=>c.id!==id);
        });
      }
    });
  }

  editarSeccion(s:any){
    this.selectedTab='secciones';
    this.editSeccionId = s.id;
    this.horariosArray.clear();
    (s.horarios||[]).forEach((h:any)=> this.horariosArray.push(this.fb.group({dia:[h.dia], horaInicio:[h.horaInicio], horaFin:[h.horaFin]})));
    this.seccionForm.patchValue({...s, horarios:[]});
  }

  cancelarSeccion() {
    this.editSeccionId = null;
    this.seccionForm.reset({modalidad:'P', numero_vez:1, estado:'E', horarios:[]});
    this.horariosArray.clear();
  }

  eliminarSeccion(id:number){
    Swal.fire({icon:'warning', title:'Eliminar sección', text:'¿Desea eliminar esta sección?', showCancelButton:true, confirmButtonColor:'#d75443'}).then(r=>{
      if (r.isConfirmed){
        this.adminService.eliminarSeccion(id).subscribe(()=> {
          this.secciones = this.secciones.filter(s=>s.id!==id);
        });
      }
    });
  }

  editarUsuario(u:any){
    this.selectedTab='usuarios';
    this.editUsuarioId = u.id;
    this.usuarioForm.patchValue(u);
  }

  cancelarUsuario() {
    this.editUsuarioId = null;
    this.usuarioForm.reset({rol_id:2, activo:true});
  }

  eliminarUsuario(id:number){
    Swal.fire({icon:'warning', title:'Eliminar usuario', text:'¿Desea eliminar este usuario?', showCancelButton:true, confirmButtonColor:'#d75443'}).then(r=>{
      if (r.isConfirmed){
        this.adminService.eliminarUsuario(id).subscribe(()=> {
          this.usuarios = this.usuarios.filter(u=>u.id!==id);
        });
      }
    });
  }
}
