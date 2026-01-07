# Goals 

## Context Given
architecture with angular components and webshell calls spring boot rest services with sql database

## Topics
1. developer experience
1. deployment in production
1. testing on stages
1. testing locally

## Goals

1. high confidence before production
supporting automated test stages


## Technologies

1. docker
2. Intellij IDEA
3. Traefik with docker provider and container labels
4. postgres
5. nginx
6. angular, typescript
7. spring, java

## strategies:
1. network parity
2. convention over configuration
3. no profiles
4. same immutable image for all stages

## Non-Negotiable Rules
1. Never expose backend ports directly
2. Never run Spring Boot on the host
3. Never route around Traefik
4. Never introduce dev-only configuration