
## Goals


### Context Given

Our architecture employs Angular components and webshell, the Angular frontends call spring boot-based REST services which persist their date on a sql database.

### Topics

1. developer experience
1. deployment in production
1. testing on stages
1. testing locally

### Goals

1. high confidence before production
supporting automated test stages

### Strategies

1. Achieve parity between dev and production networking.
2. Convention over configuration.
3. No profiles.
4. Same immutable image can be used on all stages.

### Non-Negotiable Rules

1. Never expose backend ports directly.
2. Never run code on the host.
3. Never route around Traefik.
4. Never introduce dev-only configuration.

### Technologies

1. docker
1. Intellij IDEA
1. Traefik with docker provider and container labels
1. postgres
1. nginx
1. angular, typescript
1. spring, java
1. claude code

## Action items

Action Items Derived from Architecture, Goals, Technologies, and Strategies

### 1. Developer Experience

**Objective:** Fast onboarding with identical behavior across all environments.

#### Action Items

- Define a **single Docker Compose topology** representing the complete system:
  - Angular (built and served via Nginx)
  - Spring Boot REST service
  - Postgres
  - Traefik
- Enforce **network parity by default**:
  - All communication via Traefik hostnames
  - No direct container-to-container ports
  - No localhost port usage except Traefik entrypoints
- Establish **strict naming and label conventions**:
  - Deterministic container names
  - Traefik labels identical to staging and production
- Configure **IntelliJ for container-based development**:
  - Remote debugging attached to the Spring container
  - Frontend debugging via browser DevTools against Nginx
- Provide a **single bootstrap command**:
  - Builds all images
  - Starts the complete stack
- Disallow environment-specific behavior:
  - No profiles
  - No conditional runtime flags

---

### 2. Deployment in Production

**Objective:** Zero-drift, repeatable, and predictable releases.

#### Action Items

- Build **one immutable Docker image per component**:
  - Angular compiled once and baked into an Nginx image
  - Spring Boot packaged once into a JVM-based image
- Deploy **exactly the same images** used in local and staging environments
- Use **Traefik Docker provider exclusively**:
  - All routing defined via container labels
  - No external Traefik configuration files
- Apply **convention-based routing**:
  - Stable hostnames
  - Fixed API and frontend path conventions
- Connect Postgres via **network discovery**, not configuration switches
- Validate production readiness by:
  - Deploying the unchanged staging image to production

---

### 3. Testing on Stages

**Objective:** High confidence before production through automated validation.

#### Action Items

- Provision staging environments using the **same Docker Compose topology**:
  - Identical container graph
  - Identical Traefik labels
- Execute **automated tests against running containers**:
  - Frontend tests against deployed Angular/Nginx
  - API tests against deployed Spring Boot services
- Prohibit test-only behavior:
  - No image rebuilds for testing
  - No conditional logic for test stages
- Manage Postgres state via:
  - Container recreation
  - Schema initialization on startup
- Gate promotion to production on:
  - Successful execution of container-based test suites

---

### 4. Testing Locally

**Objective:** Early failure detection with production-identical conditions.

#### Action Items

- Run all local tests **only against Dockerized services**:
  - No in-memory databases
  - No mocked services
- Execute frontend tests against:
  - The same Nginx-served Angular image used elsewhere
- Execute backend tests against:
  - The running Spring container and Postgres
- Enforce **Traefik-only access paths**:
  - Tests must use hostnames, never direct ports
- Require developers to:
  - Test against the full stack, not partial setups

---

### Cross-Cutting Enforcement

#### Action Items

- Explicitly reject the introduction of:
  - Profiles
  - Stage-specific configuration
  - Conditional code paths
- Codify conventions for:
  - Repository layout
  - Container labels
  - Hostname patterns
- Treat **network parity and image immutability as non-negotiable constraints**

---
---

## Resulting State

- Local, staging, and production environments are structurally identical
- Automated tests validate real deployments, not simulations
- Release decisions are confidence-driven, not configuration-driven
- Failures surface early, consistently, and predictably
