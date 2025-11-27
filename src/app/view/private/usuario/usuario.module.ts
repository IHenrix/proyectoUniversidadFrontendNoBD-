import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { UsuarioComponent } from './usuario.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AlumnoComponent } from './alumno/alumno.component';
import { DocenteComponent } from './docente/docente.component';


@NgModule({
  declarations: [UsuarioComponent,AlumnoComponent,DocenteComponent
  ],
  imports: [
    CommonModule,
    UsuarioRoutingModule,
    SharedModule
  ]
})
export class UsuarioModule { }
