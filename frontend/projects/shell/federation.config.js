const {withNativeFederation, shareAll} = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'shell',

  shared: {
    ...shareAll({singleton: true, strictVersion: true, requiredVersion: 'auto'}),
    'rxjs': {singleton: true, strictVersion: false},
    '@angular/platform-browser': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    '@angular/material': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    '@angular/cdk': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    '@jsverse/transloco': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
    'angular-oauth2-oidc': {singleton: true, strictVersion: true, requiredVersion: 'auto'},
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

  features: {
    ignoreUnusedDeps: true
  }

});
