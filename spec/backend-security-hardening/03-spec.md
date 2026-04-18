# Backend Security Hardening Specification

## Purpose
Definir requisitos verificables para endurecer autenticacion, protecciones de abuso y exposicion de endpoints en PlayerData_API sin romper flujo principal.

## ADDED Requirements

### Requirement: JWT Secret Enforcement
The system MUST fail startup when `JWT_SECRET` is missing, weak, or default-like.

#### Scenario: Startup blocked without valid secret
- GIVEN environment without `JWT_SECRET`
- WHEN the API process starts
- THEN startup MUST fail with explicit configuration error
- AND no HTTP port MUST be opened

#### Scenario: Startup allowed with strong secret
- GIVEN environment with non-default `JWT_SECRET`
- WHEN the API process starts
- THEN startup succeeds
- AND JWT validation uses only configured secret

### Requirement: Abuse Protection by Rate Limit
The system MUST apply rate limiting to sensitive endpoints (`/api/v1/player/login`, `/api/v1/player/validate/:nickname`).

#### Scenario: Under threshold allowed
- GIVEN a client under configured limit
- WHEN requests are sent to sensitive endpoint
- THEN responses are processed normally

#### Scenario: Over threshold blocked
- GIVEN a client exceeding configured limit window
- WHEN another request is sent
- THEN system returns 429
- AND response includes retry metadata

### Requirement: Conditional CORS Policy for Unity/Web
The system SHALL enforce CORS whitelist for browser contexts and MAY allow no-origin requests used by native clients.

#### Scenario: Browser origin allowed
- GIVEN request with `Origin` in allowlist
- WHEN request reaches API
- THEN CORS headers are returned allowing request

#### Scenario: Browser origin denied
- GIVEN request with `Origin` not in allowlist
- WHEN request reaches API
- THEN request is rejected by CORS policy

#### Scenario: Native Unity request without Origin
- GIVEN request without `Origin` header
- WHEN request reaches API
- THEN request is processed
- AND authentication/authorization controls still apply

### Requirement: Security Headers
The system SHOULD apply standard security headers through middleware.

#### Scenario: Response contains headers
- GIVEN any API response
- WHEN response is emitted
- THEN security headers (helmet baseline) are present

## MODIFIED Requirements

### Requirement: Sensitive Endpoint Access
The system MUST require authentication for `/api-docs` and `/api/v1/player/validate/:nickname`.
(Previously: endpoint validation nickname and docs were publicly reachable.)

#### Scenario: Unauthorized request denied
- GIVEN no bearer token
- WHEN client calls protected endpoint
- THEN response is 401

#### Scenario: Authorized request allowed
- GIVEN valid bearer token
- WHEN client calls protected endpoint
- THEN response is successful if payload is valid

### Requirement: Deployment Safety Defaults
The deployment configuration MUST run with production-safe defaults.
(Previously: configuration could run without explicit production posture.)

#### Scenario: Production env enabled
- GIVEN compose deployment
- WHEN service boots
- THEN `NODE_ENV=production` is active

## Coverage Summary
- Happy paths: covered
- Edge cases: covered
- Error states: covered
