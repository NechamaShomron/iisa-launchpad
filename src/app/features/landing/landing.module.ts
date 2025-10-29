import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingRoutingModule } from './landing-routing.module';

import { RegistrationFormComponent } from './components/registration-form/registration-form.component';

/**
 * LandingModule handles the landing/registration page feature
 */
@NgModule({
  declarations: [],
  imports: [
    LandingRoutingModule,
    RegistrationFormComponent // Import standalone component
  ]
})
export class LandingModule { }

