import {Translation} from '@jsverse/transloco';
import {provideHybridTranslocoLoader} from "@shared/services/hybrid-transloco-loader.service";

// Static imports - all Partner translations are now in shared files
import sharedDE from '../../../../shared/i18n/de.json';
import sharedEN from '../../../../shared/i18n/en.json';
import sharedFR from '../../../../shared/i18n/fr.json';

const staticTranslations = new Map<string, Translation>([
  [
    'de',
    sharedDE,
  ],
  [
    'en',
    sharedEN,
  ],
  [
    'fr',
    sharedFR,
  ],
]);

export const PartnerTranslocoProviders = provideHybridTranslocoLoader(staticTranslations, 'partner');
