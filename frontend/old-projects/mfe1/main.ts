import { initFederation } from '@angular-architects/native-federation';

(async () => {

    await initFederation();
    await import('./component');

})();
