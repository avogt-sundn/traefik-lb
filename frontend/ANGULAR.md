# Angular Architecture

This project uses
- Angular components
- with native federation

Each folder is going to be deployed into distinct docker containers.
- the shell container
- multiple remote containers hosting a webcomponent

The collective of Angular code runs in the browser under a single domain as a single web application.

- all CORS issues are resolved and CSP headers are not necessary.


It is served by the shell container, which loads the remotes. It is designed to be extendable and scalable.

No need to configure distinct environments since the application is agnostic to the domain it runs under.

