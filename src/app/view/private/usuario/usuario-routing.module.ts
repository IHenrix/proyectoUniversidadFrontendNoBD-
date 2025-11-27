import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlumnoComponent } from './alumno/alumno.component';
import { DocenteComponent } from './docente/docente.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/usuario/alumno',
    pathMatch: 'full',
  },
  { path: 'alumno', component: AlumnoComponent},
  { path: 'docente', component: DocenteComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
