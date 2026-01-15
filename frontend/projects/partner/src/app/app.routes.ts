import {Routes} from '@angular/router';
import {ViewPartner} from './components/pages/view-partner/view-partner';
import {PartnerSearch} from './components/pages/partner-search/partner-search';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full',
  },
  {
    path: 'view/:partnerId',
    component: ViewPartner,
  },
  {
    path: 'view',
    component: ViewPartner,
  },
  {
    path: 'search',
    component: PartnerSearch,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
