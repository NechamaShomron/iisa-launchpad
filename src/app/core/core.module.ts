import { NgModule, Optional, SkipSelf } from '@angular/core';

import { CandidateService } from '../services/candidate.service';

/**
 * CoreModule should be imported only in AppModule.
 * It contains singleton services that should be instantiated once for the entire app.
 */
@NgModule({
  providers: [
    CandidateService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}

