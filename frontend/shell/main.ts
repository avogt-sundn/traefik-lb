import { initFederation } from '@softarc/native-federation';

(async () => {

    await initFederation({
        "mfe1": "/serve-mfe1/remoteEntry.json"
    });

    await import('./app');

})();
