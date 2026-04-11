# Backend Developer Study Cases

This project is designed as a backend-focused lab with one codebase and many route-level study cases.

## API documentation

- Interactive Stoplight docs: `/docs/openapi`
- Raw OpenAPI file: `/docs/openapi.yaml`

## Cases mapped to job requirements

1. `/cases/01-health` - service health/readiness patterns.
2. `/cases/02-typescript-crud` - typed backend CRUD with runtime validation.
3. `/cases/03-graphql` - GraphQL API and schema evolution basics.
4. `/cases/04-postgres` - SQL table setup, inserts, reads, and index usage.
5. `/cases/04b-postgres-transactions` - transaction safety and ACID transfer flow.
6. `/cases/05-timescale` - time-series ingestion and aggregation.
7. `/cases/06-hasura` - Hasura actions and event webhook handlers.
8. `/cases/07-auth` - JWT login + role-based authorization.
9. `/cases/08-microservices` - outbox/publish workflow simulation.
10. `/cases/08b-service-boundary` - inventory and payment boundary orchestration.
11. `/cases/09-queue-worker` - async worker retries and dead-letter behavior.
12. `/cases/09b-idempotency` - idempotent payment API pattern.
13. `/cases/10-react-demo` - lightweight frontend integration in one project.
14. `/cases/11-ai-ml` - AI/ML provider integration pattern with fallback.
15. `/cases/12-observability` - structured logging and request tracing.
16. `/cases/13-cicd-gcp` - CI/CD pipeline and Cloud Run deployment reference.
17. `/cases/14-system-design` - scalability checklist and architecture template.
18. `/cases/15-ci-cd-webhook` - secure GitHub webhook signature verification.
19. `/cases/16-resilience` - retries, timeouts, circuit breaker, and bulkhead behavior.
20. `/cases/17-event-sourcing-cqrs` - command flow, append-only events, and projection rebuild.

Cases `08` and `09` now support a dedicated worker process via `npm run dev:worker`.

## Suggested learning path

Start with 01, 02, 07 for core backend foundations. Then move to 04, 04b, 05, 03 for data + API patterns. Continue with 06, 08, 08b, 09, 09b for distributed systems behavior. Finish with 11, 12, 13, 14, 15, 16, and 17 for modern platform readiness.

## Route walk-through commands

```bash
curl http://localhost:3000/cases/01-health

curl -X POST http://localhost:3000/cases/02-typescript-crud -H "content-type: application/json" -d '{"title":"learn ts","status":"todo"}'

curl -X POST http://localhost:3000/cases/03-graphql -H "content-type: application/json" -d '{"query":"{ books { id title author } }"}'

curl -X POST http://localhost:3000/cases/04-postgres/setup
curl -X POST http://localhost:3000/cases/04b-postgres-transactions/setup
curl -X POST http://localhost:3000/cases/05-timescale/setup
curl -X POST http://localhost:3000/cases/08-microservices/setup
curl -X POST http://localhost:3000/cases/09-queue-worker/setup

curl -X POST http://localhost:3000/cases/08b-service-boundary/checkout -H "content-type: application/json" -d '{"sku":"laptop","quantity":1,"amount":999}'

curl -X POST http://localhost:3000/cases/08-microservices/orders -H "content-type: application/json" -d '{"customerId":"user-1","amount":299}'
curl http://localhost:3000/cases/08-microservices/state

curl -X POST http://localhost:3000/cases/09b-idempotency/payment -H "content-type: application/json" -H "idempotency-key: order-123" -d '{"amount":120,"currency":"USD"}'
curl -X POST http://localhost:3000/cases/09-queue-worker/enqueue -H "content-type: application/json" -d '{"type":"send-email","payload":{"to":"candidate@example.com"}}'
curl http://localhost:3000/cases/09-queue-worker/stats

curl http://localhost:3000/cases/13-cicd-gcp
curl http://localhost:3000/cases/14-system-design/architecture-template
curl -X POST http://localhost:3000/cases/16-resilience/invoke -H "content-type: application/json" -d '{"dependency":"payment-gateway","scenario":"flaky","timeoutMs":180}'
curl http://localhost:3000/cases/16-resilience/state

curl -X POST http://localhost:3000/cases/17-event-sourcing-cqrs/accounts -H "content-type: application/json" -d '{"accountId":"docs-account","initialBalance":250,"commandId":"docs-open"}'
curl -X POST http://localhost:3000/cases/17-event-sourcing-cqrs/accounts/docs-account/deposit -H "content-type: application/json" -d '{"amount":50,"commandId":"docs-deposit"}'
curl http://localhost:3000/cases/17-event-sourcing-cqrs/accounts/docs-account
```
