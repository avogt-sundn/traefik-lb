# Angular Build Fixer - Agent Memory

## OpenAPI-Generated Code: Stale Type References

The `loans` app has OpenAPI-generated code under `projects/loans/src/app/api/`.
The service implementation (`api/loan-gateway.service.ts`) and service interface
(`api/loan-gateway.serviceInterface.ts`) can diverge when the generator is re-run
partially or with a different spec.

**Known issue (fixed):** `loan-gateway.service.ts` imported the non-existent
`ContractRequestDto` from `../model/contract-request-dto`. The correct type is
`ContractDto` from `../model/contract-dto`, matching what the interface already used.

**Pattern to watch:** If `contract-request-dto` (or any model file) is missing from
`projects/loans/src/app/api/model/`, check `models.ts` for the barrel and compare
the interface file — it is the source of truth for correct type names.

## Model barrel file

`projects/loans/src/app/api/model/models.ts` re-exports all model types. Use it to
quickly audit which types actually exist when an import resolves to a missing file.
