import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { CandidateListComponent } from '../../components/candidate-list/candidate-list.component';
import { CandidateDetailComponent } from '../../components/candidate-detail/candidate-detail.component';
import { CandidateMapComponent } from '../../components/candidate-map/candidate-map.component';

/**
 * DashboardModule handles the dashboard and candidate management features
 */
@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      { path: '', component: DashboardComponent } // Empty path since route is 'dashboard' in parent
    ]),
    // Import standalone components
    DashboardComponent,
    CandidateListComponent,
    CandidateDetailComponent,
    CandidateMapComponent
  ]
})
export class DashboardModule { }

