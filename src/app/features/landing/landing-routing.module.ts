import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationFormComponent } from './components/registration-form/registration-form.component';

const routes: Routes = [
  { path: '', component: RegistrationFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule {}


