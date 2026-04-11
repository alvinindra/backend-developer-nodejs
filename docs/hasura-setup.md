# Hasura Setup Guide (Study Lab)

## Start dependencies

```bash
npm run db:up
```

Hasura console: `http://localhost:8080`

Admin secret: `hasura-dev-secret`

## Configure database connection

The default `docker-compose.yml` already connects Hasura to local Timescale/Postgres.

## Example Action wiring

You can create a Hasura Action named `greet` and point webhook URL to:

`http://host.docker.internal:3000/cases/06-hasura/action/greet`

Input type example:

```graphql
input GreetInput {
  name: String!
}
```

Output type example:

```graphql
type GreetOutput {
  case: String!
  message: String!
}
```

## Example Event trigger

Create trigger on `public.orders` table and set webhook URL to:

`http://host.docker.internal:3000/cases/06-hasura/event/order-created`

Use this to practice event-driven integrations and auditing patterns.
