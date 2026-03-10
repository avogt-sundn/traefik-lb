# Angular Federation Expert - Memory

## Workspace Overview
- Angular 21 workspace at `frontend/`, apps under `frontend/projects/`
- Four apps: shell (host, port 4200), partner (remote, 4201), ekf (remote, 4202), loans (remote, 4203)
- Shared library at `frontend/projects/shared/` built via ng-packagr
- `@angular-architects/native-federation` (NOT Webpack Module Federation)
- All apps use **standalone components** (no NgModule pattern in app code)

## Key Architectural Facts
- Shell loads remotes via `federation.manifest.json` at `/environments/federation.manifest.json`
- Path aliases: `@shared/*`, `@shell/*`, `@ekf/*`, `@partner/*`, `@loans/*` in root tsconfig.json
- Apps import shared lib via path aliases directly (e.g. `@shared/util/date`), NOT via the ng-packagr barrel
- tsconfig.json uses JSONC (comments allowed) — Angular CLI parses it with comment support
- All federation configs share identical `shared`/`skip`/`features` blocks

## App Patterns
- All apps: standalone components, signals, `inject()` function preferred
- Shell `App` component: just `<router-outlet>`, no logic
- Partner and loans expose both `./Component` and `./Routes`; ekf exposes only `./Component`
- Partner has own i18n files but they are empty — all translations temporarily in shared i18n

## Shared Library
- Entry: `projects/shared/public-api.ts` (ng-packagr)
- Actual util files: `date.ts`, `phone.ts` (NOT `date.util.ts` etc.)
- `snackbar.util.ts` uses new `@if` control flow — does NOT need CommonModule
- Cookie service used by shell LanguageService for lang persistence

## Known Issues Fixed (cleanup session)
- `shell/app/util/index.ts` was 100 lines of commented-out dead code — cleared
- `shell/app/app.scss` had CSS for classes not used in `App` template — cleared
- `shell/app/services/auth.ts` and `auth-config.ts` are empty stubs, never injected
- `main.scss` had `app-header`/`app-footer` rules — actual selectors are `shell-header`/`shell-footer`
- Footer imported `MatCheckboxModule` (unused), was missing `RouterLink`
- `ClientSelection` injected `LanguageService` but never used it; also had unneeded `CommonModule`
- `public-api.ts` referenced non-existent `date.util`, `phone.util`, `signal-http.util`, `transloco.util`
- Generated API services had `// @ts-ignore` on all model imports and `/* tslint:disable */` directives
- `partner-field-validation.service.ts` had redundant if/else doing identical work in both branches
- `.filter(v => v !== undefined)` on `Validators.*` arrays is unnecessary (Validators never return undefined)
- `client-selection.scss` had duplicate `mat-toolbar` block

## Federation Config Pattern (all 4 apps identical except name/exposes)
```js
const {withNativeFederation, shareAll} = require('@angular-architects/native-federation/config');
module.exports = withNativeFederation({
  name: '...',
  exposes: { ... },  // remotes only
  shared: {
    ...shareAll({singleton: true, strictVersion: true, requiredVersion: 'auto'}),
    'rxjs': {singleton: true, strictVersion: false},
    '@angular/platform-browser': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    '@angular/material': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    '@angular/cdk': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    '@jsverse/transloco': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    'angular-oauth2-oidc': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
  features: { ignoreUnusedDeps: true }
});
```
