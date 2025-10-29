import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RegistrationFormComponent } from '../../components/registration-form/registration-form.component';

/**
 * LandingModule handles the landing/registration page feature
 */
@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      { path: '', component: RegistrationFormComponent }
    ]),
    RegistrationFormComponent // Import standalone component
  ]
})
export class LandingModule { }

