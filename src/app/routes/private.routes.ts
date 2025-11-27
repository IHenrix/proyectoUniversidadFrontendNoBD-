import { Routes, RouterModule } from '@angular/router';

export const PrivateRoutes: Routes = [
  {
    path: 'usuario',
    loadChildren: () => import('../view/private/usuario/usuario.module').then(m => m.UsuarioModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('../view/private/admin/admin.module').then(m => m.AdminModule)
  }
];
