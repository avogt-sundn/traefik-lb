import {initFederation} from '@angular-architects/native-federation';

initFederation('/environments/federation.manifest.json')
  .then(() => import('./bootstrap'))
