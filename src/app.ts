import fs from "node:fs"
import path from "node:path"
import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import { casesRouter } from "./routes/cases"
import { requestContextMiddleware } from "./modules/observability/request-context"
import { getLogFormat, log } from "./modules/observability/logger"
import { studyCases } from "./modules/study/case-registry"

export const app = express()

const studyCasesResponse = {
  message:
    "Open README.md and docs/study-cases.md in the project folder for full guide",
  routes: studyCases.map((item) => item.route),
  details: studyCases,
  openApi: "/docs/openapi.yaml",
  openApiUi: "/docs/openapi",
}

const openApiSpecFilePath = path.resolve(process.cwd(), "docs", "openapi.yaml")

function renderHomePage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Backend Study Lab Documentation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #ece4d3;
        --bg-2: #f7f1e4;
        --surface: #fffaf1;
        --surface-strong: #fff;
        --ink: #111d27;
        --muted: #51606e;
        --accent: #0f6c8c;
        --accent-2: #b45d36;
        --line: #d7c7af;
        --shadow: rgba(25, 42, 55, 0.18);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        background:
          radial-gradient(circle at 88% 9%, #f4c87266 0%, transparent 33%),
          radial-gradient(circle at 16% 84%, #93cae366 0%, transparent 30%),
          linear-gradient(160deg, var(--bg), var(--bg-2));
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .page {
        width: min(1120px, 94vw);
        margin: 1.6rem auto 2.2rem;
        display: grid;
        gap: 1rem;
        animation: rise 520ms ease-out;
      }

      .mast,
      .hero,
      .panel,
      .mini {
        background: color-mix(in oklab, var(--surface), #ffffff 10%);
        border: 1px solid var(--line);
        border-radius: 18px;
        box-shadow: 0 22px 34px -30px var(--shadow);
      }

      .mast {
        padding: 0.75rem 0.9rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.55rem;
      }

      .brand {
        margin: 0;
        font: 700 0.86rem/1 "IBM Plex Mono", monospace;
        color: #275067;
        letter-spacing: 0.03em;
      }

      .mast-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .mast-links a {
        text-decoration: none;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 0.3rem 0.6rem;
        color: #304657;
        font: 700 0.72rem/1 "Archivo", "Segoe UI", sans-serif;
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 1.35rem;
      }

      .hero::before {
        content: "";
        position: absolute;
        right: -80px;
        top: -110px;
        width: 280px;
        height: 280px;
        background: radial-gradient(circle at 35% 35%, #f4c872, transparent 72%);
        opacity: 0.42;
        pointer-events: none;
      }

      .eyebrow {
        margin: 0;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--accent);
        font: 700 0.74rem/1 "Archivo", "Segoe UI", sans-serif;
      }

      h1 {
        margin: 0.5rem 0 0.8rem;
        max-width: 18ch;
        font: 800 clamp(1.8rem, 2.8vw, 2.8rem)/1.02 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 0;
        color: var(--muted);
        max-width: 70ch;
      }

      .actions {
        margin-top: 1.05rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.58rem;
      }

      a.button {
        text-decoration: none;
        border-radius: 999px;
        padding: 0.58rem 0.94rem;
        font: 700 0.78rem/1 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: 0.01em;
        transition: transform 160ms ease, box-shadow 160ms ease;
      }

      a.button:hover {
        transform: translateY(-1px);
      }

      a.button.primary {
        color: #fff;
        background: linear-gradient(120deg, var(--accent), #1596c2);
      }

      a.button.secondary {
        color: var(--ink);
        border: 1px solid var(--line);
        background: #fffefb;
      }

      .stats {
        margin-top: 0.85rem;
        display: grid;
        gap: 0.58rem;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .chip {
        padding: 0.64rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--surface-strong);
      }

      .chip p {
        margin: 0;
      }

      .chip .label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font: 700 0.64rem/1 "Archivo", "Segoe UI", sans-serif;
        color: #526878;
      }

      .chip .value {
        margin-top: 0.35rem;
        font: 800 1.06rem/1 "Archivo", "Segoe UI", sans-serif;
      }

      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1.25fr 0.92fr;
      }

      .panel {
        padding: 1rem;
      }

      .panel h2 {
        margin: 0;
        font: 700 1.02rem/1.1 "Archivo", "Segoe UI", sans-serif;
      }

      .panel p {
        margin: 0.42rem 0 0;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .panel ul {
        margin: 0.72rem 0 0;
        padding-left: 1.1rem;
        color: #2f4b5f;
        display: grid;
        gap: 0.46rem;
      }

      .mini {
        padding: 1rem;
      }

      .mini h3 {
        margin: 0;
        font: 700 0.95rem/1.1 "Archivo", "Segoe UI", sans-serif;
      }

      .mini-grid {
        display: grid;
        gap: 0.58rem;
        margin-top: 0.7rem;
      }

      .mini a {
        text-decoration: none;
        color: #234055;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: #fff;
        padding: 0.58rem 0.64rem;
        font: 700 0.76rem/1.2 "Archivo", "Segoe UI", sans-serif;
      }

      .mini span {
        display: block;
        margin-top: 0.23rem;
        color: #586879;
        font: 500 0.8rem/1.3 "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 700px) {
        .page {
          margin: 1.2rem auto 1.8rem;
        }

        .hero {
          padding: 1.2rem;
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="mast">
        <p class="brand">BACKEND STUDY LAB DOCS</p>
        <nav class="mast-links">
          <a href="/">Root</a>
          <a href="/docs/study-cases">JSON</a>
          <a href="/docs/study-cases/ui">Runner</a>
          <a href="/docs/openapi">OpenAPI</a>
        </nav>
      </header>

      <section class="hero">
        <p class="eyebrow">Documentation Portal</p>
        <h1>Backend Developer Study Lab Docs Website</h1>
        <p class="subtitle">A unified docs surface for case discovery, execution playbooks, and architecture study paths. One voice, one typography system, one visual identity.</p>
        <div class="actions">
          <a class="button primary" href="/docs/study-cases/ui">Open Case Runner</a>
          <a class="button secondary" href="/docs/study-cases">Open JSON Docs</a>
          <a class="button secondary" href="/docs/openapi">OpenAPI Reference</a>
          <a class="button secondary" href="/cases/10-react-demo">Open Mission Control UI</a>
        </div>

        <section class="stats">
          <article class="chip">
            <p class="label">Total Cases</p>
            <p class="value">${studyCases.length}</p>
          </article>
          <article class="chip">
            <p class="label">Advanced Tracks</p>
            <p class="value">Resilience + CQRS</p>
          </article>
          <article class="chip">
            <p class="label">Primary Entry</p>
            <p class="value">/docs/study-cases/ui</p>
          </article>
        </section>
      </section>

      <section class="grid">
        <article class="panel">
          <h2>What This Docs Site Covers</h2>
          <p>Practical backend progression from API foundations to distributed reliability patterns.</p>
          <ul>
            <li>Structured study phases with runnable presets</li>
            <li>Security, observability, and CI/CD-oriented case references</li>
            <li>Fast switching between docs, UI runner, and live endpoints</li>
          </ul>
        </article>

        <aside class="mini">
          <h3>Quick Navigation</h3>
          <div class="mini-grid">
            <a href="/docs/study-cases/ui">Study Case Runner<span>Visual phase runner with console output</span></a>
            <a href="/docs/study-cases">Study Case JSON<span>Machine-friendly route inventory</span></a>
            <a href="/docs/openapi">OpenAPI Docs<span>Stoplight-powered API reference</span></a>
            <a href="/cases/01-health">Health Endpoint<span>Immediate runtime verification</span></a>
            <a href="/cases/10-react-demo">Mission Control<span>React telemetry and preset launcher</span></a>
          </div>
        </aside>
      </section>

      <section class="grid">
        <article class="panel">
          <h2>Design Direction</h2>
          <p>This docs website uses a single typography pair and shared color tokens across pages to avoid fragmented visual identity.</p>
        </article>
        <article class="panel">
          <h2>Recommended Path</h2>
          <p>Start with cases 01-07, continue through data and distributed cases, then finish with resilience and event-sourced flows.</p>
        </article>
      </section>
    </main>
  </body>
</html>`
}

function renderStudyCasesPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Backend Docs Case Runner</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #ece4d3;
        --bg-2: #f7f1e4;
        --surface: #fffaf1;
        --ink: #111d27;
        --muted: #51606e;
        --accent: #0f6c8c;
        --accent-2: #b45d36;
        --success: #247f57;
        --warn: #b05f2f;
        --line: #d7c7af;
        --shadow: rgba(25, 42, 55, 0.18);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        color: var(--ink);
        min-height: 100vh;
        background:
          radial-gradient(circle at 88% 9%, #f4c87266 0%, transparent 33%),
          radial-gradient(circle at 16% 84%, #93cae366 0%, transparent 30%),
          linear-gradient(160deg, var(--bg), var(--bg-2));
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .shell {
        width: min(1200px, 94vw);
        margin: 1.8rem auto;
        display: grid;
        gap: 1rem;
      }

      .head {
        background: linear-gradient(160deg, #fffef9 0%, #fff8ed 100%);
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 1.3rem;
        box-shadow: 0 22px 34px -30px var(--shadow);
      }

      .head h1 {
        margin: 0;
        font: 800 clamp(1.6rem, 2.6vw, 2.4rem)/1.02 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: -0.02em;
      }

      .head p {
        margin: 0.5rem 0 0.95rem;
        color: var(--muted);
        max-width: 70ch;
      }

      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .links a {
        text-decoration: none;
        font: 700 0.79rem/1 "Archivo", "Segoe UI", sans-serif;
        border-radius: 999px;
        padding: 0.58rem 0.95rem;
      }

      .links a.primary {
        background: linear-gradient(120deg, var(--accent), #1d8cc5);
        color: #fff;
      }

      .links a.secondary {
        border: 1px solid var(--line);
        color: #325062;
        background: #fff;
      }

      .stats {
        margin-top: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .chip {
        border-radius: 999px;
        border: 1px solid var(--line);
        padding: 0.4rem 0.68rem;
        background: #fff;
        color: #3b505e;
        font-size: 0.82rem;
      }

      .layout {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1.4fr 0.9fr;
      }

      .stack {
        display: grid;
        gap: 0.9rem;
      }

      .phase {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.92);
        padding: 0.9rem;
        box-shadow: 0 14px 24px -24px var(--shadow);
      }

      .phase-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 0.8rem;
        margin-bottom: 0.7rem;
      }

      .phase-head-main {
        min-width: 0;
        flex: 1 1 460px;
      }

      .phase h2 {
        margin: 0;
        font: 700 1.03rem/1.12 "Archivo", "Segoe UI", sans-serif;
      }

      .phase p {
        margin: 0.36rem 0 0;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .run-phase {
        border: 0;
        border-radius: 999px;
        padding: 0.48rem 0.78rem;
        background: linear-gradient(120deg, var(--accent-2), #ea9259);
        color: #fff;
        font: 700 0.75rem/1 "Archivo", "Segoe UI", sans-serif;
        cursor: pointer;
        white-space: nowrap;
        flex: 0 0 auto;
      }

      .cases {
        display: grid;
        gap: 0.55rem;
      }

      .case {
        display: flex;
        flex-direction: column;
        gap: 0.64rem;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 0.76rem;
        background: #fff;
      }

      .case-top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .case-top-text {
        min-width: 0;
      }

      .case-id {
        margin: 0;
        color: #25485e;
        font: 700 0.72rem/1 "Archivo", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.07em;
      }

      .case-status {
        border-radius: 999px;
        border: 1px solid var(--line);
        padding: 0.18rem 0.48rem;
        font-size: 0.73rem;
        color: #41535f;
        white-space: nowrap;
        align-self: flex-start;
      }

      .case-status.done {
        border-color: #bde2cb;
        color: var(--success);
        background: #effaf3;
      }

      .case-status.failed {
        border-color: #f0cbba;
        color: var(--warn);
        background: #fff6f0;
      }

      .case h3 {
        margin: 0.35rem 0 0;
        font: 700 0.95rem/1.16 "Archivo", "Segoe UI", sans-serif;
        overflow-wrap: anywhere;
      }

      .case p {
        margin: 0.38rem 0 0;
        color: var(--muted);
        font-size: 0.88rem;
        overflow-wrap: anywhere;
      }

      .route {
        margin: 0.44rem 0 0;
        color: #345467;
        font-size: 0.79rem;
        word-break: normal;
        overflow-wrap: anywhere;
      }

      .case-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .case-actions button,
      .case-actions a {
        text-decoration: none;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: #fff;
        color: #2d4e63;
        padding: 0.37rem 0.64rem;
        font: 700 0.72rem/1 "Archivo", "Segoe UI", sans-serif;
        cursor: pointer;
      }

      .case-actions button.primary {
        border-color: transparent;
        background: linear-gradient(120deg, var(--accent), #1f8dc3);
        color: #fff;
      }

      .console {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: #0e1820;
        color: #d9edf9;
        padding: 0.9rem;
        position: sticky;
        top: 1rem;
        height: fit-content;
      }

      .console h2 {
        margin: 0;
        color: #f4fbff;
        font: 700 1.01rem/1.1 "Archivo", "Segoe UI", sans-serif;
      }

      .console .meta {
        margin-top: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .console .meta span {
        border-radius: 999px;
        border: 1px solid #2b4a5e;
        padding: 0.24rem 0.5rem;
        font-size: 0.73rem;
        color: #a6cde5;
      }

      .console pre {
        margin: 0.7rem 0 0;
        max-height: 62vh;
        overflow: auto;
        border-radius: 10px;
        padding: 0.78rem;
        background: #0a1218;
        border: 1px solid #1f3342;
        color: #d2e8f5;
        font-size: 0.8rem;
      }

      .mini-note {
        margin-top: 0.62rem;
        color: #95b7cc;
        font-size: 0.78rem;
      }

      @media (max-width: 1040px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .console {
          position: static;
        }
      }

      @media (max-width: 700px) {
        .case-top {
          grid-template-columns: 1fr;
        }

        .case-status {
          justify-self: flex-start;
        }

        .run-phase {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="head">
        <h1>Backend Study Cases · Full Phase Runner</h1>
        <p>Run all backend study phases from one interface. Every case has a ready-to-use action preset and live response console, including UI checkpoints.</p>
        <nav class="links">
          <a class="primary" href="/cases/10-react-demo">Open React Integration Case</a>
          <a class="secondary" href="/docs/openapi">OpenAPI Docs</a>
          <a class="secondary" href="/docs/study-cases">View JSON</a>
          <a class="secondary" href="/docs">Docs Home</a>
        </nav>
        <div class="stats" id="progress-stats"></div>
      </section>

      <section class="layout">
        <div class="stack" id="phase-grid"></div>

        <aside class="console">
          <h2>Execution Console</h2>
          <div class="meta" id="console-meta"></div>
          <pre id="console-body">Select "Run Preset" on any case to see output.</pre>
          <p class="mini-note">Tip: Cases 04, 04b, 05, 08, and 09 require DB services running. Cases 16 and 17 are fully local and safe for quick practice.</p>
        </aside>
      </section>
    </main>

    <script>
      const phaseDefinitions = [
        {
          id: 'phase-1',
          title: 'Phase 1 · Core Backend Foundations',
          subtitle: 'Service readiness, typed CRUD, GraphQL basics, and JWT auth.',
          caseIds: ['01', '02', '03', '07']
        },
        {
          id: 'phase-2',
          title: 'Phase 2 · Data and Platform',
          subtitle: 'Postgres, transactions, time-series metrics, and Hasura integration.',
          caseIds: ['04', '04b', '05', '06']
        },
        {
          id: 'phase-3',
          title: 'Phase 3 · Distributed Systems Patterns',
          subtitle: 'Outbox, boundaries, queue workers, and idempotency in action.',
          caseIds: ['08', '08b', '09', '09b']
        },
        {
          id: 'phase-4',
          title: 'Phase 4 · Product and Observability',
          subtitle: 'Frontend touchpoint, AI fallback pattern, and request observability.',
          caseIds: ['10', '11', '12']
        },
        {
          id: 'phase-5',
          title: 'Phase 5 · Delivery and Architecture',
          subtitle: 'CI/CD topology, system design references, and webhook security.',
          caseIds: ['13', '14', '15']
        },
        {
          id: 'phase-6',
          title: 'Phase 6 · Reliability and Domain Evolution',
          subtitle: 'Resilience controls plus event-sourced command/query workflows.',
          caseIds: ['16', '17']
        }
      ]

      const playbookByCaseId = {
        '01': {
          primary: { label: 'Run Preset', method: 'GET', path: '/cases/01-health' }
        },
        '02': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/02-typescript-crud',
            body: { title: 'Study TypeScript backend flow', description: 'created from phase runner', status: 'todo' }
          }
        },
        '03': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/03-graphql',
            body: { query: '{ books { id title author } }' }
          }
        },
        '04': {
          primary: { label: 'Run Preset', method: 'POST', path: '/cases/04-postgres/setup' },
          secondary: {
            label: 'Create User',
            method: 'POST',
            path: '/cases/04-postgres/users',
            body: { email: 'learner+' + Date.now() + '@example.com', name: 'Study User' }
          }
        },
        '04b': {
          primary: { label: 'Run Preset', method: 'POST', path: '/cases/04b-postgres-transactions/setup' },
          secondary: {
            label: 'Transfer Sample',
            method: 'POST',
            path: '/cases/04b-postgres-transactions/transfer',
            body: { fromOwner: 'alice', toOwner: 'bob', amount: 25 }
          }
        },
        '05': {
          primary: { label: 'Run Preset', method: 'POST', path: '/cases/05-timescale/setup' },
          secondary: {
            label: 'Ingest Metric',
            method: 'POST',
            path: '/cases/05-timescale/metrics',
            body: { service: 'api', value: 123.4 }
          }
        },
        '06': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/06-hasura/action/greet',
            body: {
              session_variables: { 'x-hasura-role': 'developer' },
              input: { name: 'backend learner' }
            }
          }
        },
        '07': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/07-auth/login',
            body: { username: 'dev-user', role: 'developer' }
          },
          secondary: {
            label: 'Profile with Token',
            method: 'GET',
            path: '/cases/07-auth/profile',
            useAuthToken: true
          }
        },
        '08': {
          primary: { label: 'Run Preset', method: 'POST', path: '/cases/08-microservices/setup' },
          secondary: {
            label: 'Create Order',
            method: 'POST',
            path: '/cases/08-microservices/orders',
            body: { customerId: 'user-1', amount: 299 }
          }
        },
        '08b': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/08b-service-boundary/checkout',
            body: { sku: 'keyboard', quantity: 1, amount: 120 }
          }
        },
        '09': {
          primary: { label: 'Run Preset', method: 'POST', path: '/cases/09-queue-worker/setup' },
          secondary: {
            label: 'Enqueue Job',
            method: 'POST',
            path: '/cases/09-queue-worker/enqueue',
            body: { type: 'send-email', payload: { to: 'candidate@example.com' }, maxAttempts: 3 }
          }
        },
        '09b': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/09b-idempotency/payment',
            body: { amount: 120, currency: 'USD' },
            idempotencyKey: true
          }
        },
        '10': {
          primary: { label: 'Open UI', openUrl: '/cases/10-react-demo' }
        },
        '11': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/11-ai-ml/summarize',
            body: {
              text: 'Modern backend systems need resilient integrations, clear observability, and predictable fallback strategies when external providers become unavailable or unstable.'
            }
          }
        },
        '12': {
          primary: { label: 'Run Preset', method: 'GET', path: '/cases/12-observability' }
        },
        '13': {
          primary: { label: 'Run Preset', method: 'GET', path: '/cases/13-cicd-gcp' }
        },
        '14': {
          primary: { label: 'Run Preset', method: 'GET', path: '/cases/14-system-design/scaling-checklist' },
          secondary: { label: 'Architecture Template', method: 'GET', path: '/cases/14-system-design/architecture-template' }
        },
        '15': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/15-ci-cd-webhook/signature/generate',
            body: { event: 'push', repository: 'study-lab' }
          }
        },
        '16': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/16-resilience/invoke',
            body: { dependency: 'payment-gateway', scenario: 'flaky', timeoutMs: 180 }
          },
          secondary: { label: 'Inspect Circuit State', method: 'GET', path: '/cases/16-resilience/state' }
        },
        '17': {
          primary: {
            label: 'Run Preset',
            method: 'POST',
            path: '/cases/17-event-sourcing-cqrs/accounts',
            body: { accountId: 'phase-runner-account', initialBalance: 250, commandId: 'phase-open-account' }
          },
          secondary: {
            label: 'Deposit Funds',
            method: 'POST',
            path: '/cases/17-event-sourcing-cqrs/accounts/phase-runner-account/deposit',
            body: { amount: 40, commandId: 'phase-deposit-funds' }
          }
        }
      }

      const phaseGrid = document.getElementById('phase-grid')
      const statsRoot = document.getElementById('progress-stats')
      const consoleMeta = document.getElementById('console-meta')
      const consoleBody = document.getElementById('console-body')

      let studyCaseDetails = []
      let progressState = {}

      try {
        progressState = JSON.parse(localStorage.getItem('study-case-progress') || '{}')
      } catch {
        progressState = {}
      }

      function saveProgress() {
        localStorage.setItem('study-case-progress', JSON.stringify(progressState))
      }

      function normalizeBody(action) {
        if (!action || !action.body) {
          return undefined
        }

        if (typeof action.body === 'function') {
          return action.body()
        }

        return action.body
      }

      function currentStatus(caseId) {
        const record = progressState[caseId]
        if (!record) {
          return 'Pending'
        }

        return record.ok ? 'Done' : 'Needs Attention'
      }

      function statusClass(caseId) {
        const record = progressState[caseId]
        if (!record) {
          return 'case-status'
        }

        return record.ok ? 'case-status done' : 'case-status failed'
      }

      function renderStats() {
        const total = studyCaseDetails.length
        const completed = studyCaseDetails.filter((item) => progressState[item.id]?.ok).length
        const failed = studyCaseDetails.filter((item) => progressState[item.id] && !progressState[item.id].ok).length

        statsRoot.innerHTML =
          '<span class="chip">Total Cases: ' + total + '</span>' +
          '<span class="chip">Completed: ' + completed + '</span>' +
          '<span class="chip">Needs Attention: ' + failed + '</span>'
      }

      function setConsoleMeta(meta) {
        const fields = [
          'Case ' + meta.caseId,
          meta.method,
          meta.path,
          'HTTP ' + meta.status
        ]

        if (meta.elapsedMs) {
          fields.push(meta.elapsedMs + ' ms')
        }

        consoleMeta.innerHTML = fields.map((item) => '<span>' + item + '</span>').join('')
      }

      function prettyPayload(payload) {
        if (typeof payload === 'string') {
          return payload
        }

        try {
          return JSON.stringify(payload, null, 2)
        } catch {
          return String(payload)
        }
      }

      async function runAction(caseInfo, action) {
        if (!action) {
          return
        }

        if (action.openUrl) {
          progressState[caseInfo.id] = { ok: true, status: 200, method: 'OPEN', path: action.openUrl, at: new Date().toISOString() }
          saveProgress()
          renderStats()
          renderPhaseGrid()
          setConsoleMeta({ caseId: caseInfo.id, method: 'OPEN', path: action.openUrl, status: 200 })
          consoleBody.textContent = 'Opened UI route in a new tab: ' + action.openUrl
          window.open(action.openUrl, '_blank')
          return
        }

        const headers = Object.assign({}, action.headers || {})
        let bodyPayload = normalizeBody(action)

        if (bodyPayload !== undefined) {
          headers['content-type'] = 'application/json'
        }

        if (action.idempotencyKey) {
          headers['idempotency-key'] = 'phase-' + Date.now()
        }

        if (action.useAuthToken) {
          const token = localStorage.getItem('study-case-auth-token')
          if (token) {
            headers.authorization = 'Bearer ' + token
          }
        }

        const options = {
          method: action.method || 'GET',
          headers
        }

        if (bodyPayload !== undefined) {
          options.body = JSON.stringify(bodyPayload)
        }

        const startedAt = Date.now()

        try {
          const response = await fetch(action.path, options)
          const text = await response.text()
          let parsed = text

          try {
            parsed = JSON.parse(text)
          } catch {}

          if (parsed && typeof parsed === 'object' && parsed.token) {
            localStorage.setItem('study-case-auth-token', parsed.token)
          }

          progressState[caseInfo.id] = {
            ok: response.ok,
            status: response.status,
            method: options.method,
            path: action.path,
            at: new Date().toISOString()
          }

          saveProgress()
          renderStats()
          renderPhaseGrid()

          setConsoleMeta({
            caseId: caseInfo.id,
            method: options.method,
            path: action.path,
            status: response.status,
            elapsedMs: Date.now() - startedAt
          })
          consoleBody.textContent = prettyPayload(parsed)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected request failure'

          progressState[caseInfo.id] = {
            ok: false,
            status: 0,
            method: options.method,
            path: action.path,
            at: new Date().toISOString(),
            error: message
          }

          saveProgress()
          renderStats()
          renderPhaseGrid()

          setConsoleMeta({ caseId: caseInfo.id, method: options.method, path: action.path, status: 'ERROR' })
          consoleBody.textContent = message
        }
      }

      async function runPhase(phase) {
        for (const caseId of phase.caseIds) {
          const caseInfo = studyCaseDetails.find((item) => item.id === caseId)
          if (!caseInfo) {
            continue
          }

          const playbook = playbookByCaseId[caseId]
          if (!playbook?.primary) {
            continue
          }

          await runAction(caseInfo, playbook.primary)
        }
      }

      function renderPhaseGrid() {
        phaseGrid.innerHTML = ''

        for (const phase of phaseDefinitions) {
          const phaseSection = document.createElement('section')
          phaseSection.className = 'phase'

          const phaseHead = document.createElement('div')
          phaseHead.className = 'phase-head'

          const titleWrap = document.createElement('div')
          titleWrap.className = 'phase-head-main'
          const title = document.createElement('h2')
          title.textContent = phase.title
          const subtitle = document.createElement('p')
          subtitle.textContent = phase.subtitle
          titleWrap.appendChild(title)
          titleWrap.appendChild(subtitle)

          const runPhaseButton = document.createElement('button')
          runPhaseButton.className = 'run-phase'
          runPhaseButton.textContent = 'Run Full Phase'
          runPhaseButton.onclick = () => runPhase(phase)

          phaseHead.appendChild(titleWrap)
          phaseHead.appendChild(runPhaseButton)

          const caseGrid = document.createElement('div')
          caseGrid.className = 'cases'

          for (const caseId of phase.caseIds) {
            const caseInfo = studyCaseDetails.find((item) => item.id === caseId)
            if (!caseInfo) {
              continue
            }

            const caseCard = document.createElement('article')
            caseCard.className = 'case'

            const caseTop = document.createElement('div')
            caseTop.className = 'case-top'

            const caseTopText = document.createElement('div')
            caseTopText.className = 'case-top-text'
            const caseIdLabel = document.createElement('p')
            caseIdLabel.className = 'case-id'
            caseIdLabel.textContent = 'Case ' + caseInfo.id
            const caseTitle = document.createElement('h3')
            caseTitle.textContent = caseInfo.title
            const caseFocus = document.createElement('p')
            caseFocus.textContent = caseInfo.focus
            const route = document.createElement('p')
            route.className = 'route'
            route.textContent = caseInfo.route

            caseTopText.appendChild(caseIdLabel)
            caseTopText.appendChild(caseTitle)
            caseTopText.appendChild(caseFocus)
            caseTopText.appendChild(route)

            const status = document.createElement('span')
            status.className = statusClass(caseInfo.id)
            status.textContent = currentStatus(caseInfo.id)

            caseTop.appendChild(caseTopText)
            caseTop.appendChild(status)

            const actions = document.createElement('div')
            actions.className = 'case-actions'

            const openRoute = document.createElement('a')
            openRoute.href = caseInfo.route
            openRoute.target = '_blank'
            openRoute.rel = 'noreferrer'
            openRoute.textContent = 'Open Route'

            actions.appendChild(openRoute)

            const playbook = playbookByCaseId[caseInfo.id]

            if (playbook?.primary) {
              const runPrimary = document.createElement('button')
              runPrimary.className = 'primary'
              runPrimary.textContent = playbook.primary.label || 'Run Preset'
              runPrimary.onclick = () => runAction(caseInfo, playbook.primary)
              actions.appendChild(runPrimary)
            }

            if (playbook?.secondary) {
              const runSecondary = document.createElement('button')
              runSecondary.textContent = playbook.secondary.label || 'Run Extra'
              runSecondary.onclick = () => runAction(caseInfo, playbook.secondary)
              actions.appendChild(runSecondary)
            }

            caseCard.appendChild(caseTop)
            caseCard.appendChild(actions)
            caseGrid.appendChild(caseCard)
          }

          phaseSection.appendChild(phaseHead)
          phaseSection.appendChild(caseGrid)
          phaseGrid.appendChild(phaseSection)
        }
      }

      async function bootstrap() {
        try {
          const response = await fetch('/docs/study-cases')
          const docs = await response.json()
          studyCaseDetails = Array.isArray(docs.details) ? docs.details : []
          renderStats()
          renderPhaseGrid()
        } catch (error) {
          setConsoleMeta({ caseId: 'N/A', method: 'GET', path: '/docs/study-cases', status: 'ERROR' })
          consoleBody.textContent = error instanceof Error ? error.message : 'Could not load study case docs'
        }
      }

      bootstrap()
    </script>
  </body>
</html>`
}

function renderOpenApiPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Backend Study Lab API Reference</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css" />
    <style>
      :root {
        --bg: #ece4d3;
        --bg-2: #f7f1e4;
        --surface: #fffaf1;
        --ink: #111d27;
        --line: #d7c7af;
        --shadow: rgba(25, 42, 55, 0.18);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        background:
          radial-gradient(circle at 88% 9%, #f4c87266 0%, transparent 33%),
          radial-gradient(circle at 16% 84%, #93cae366 0%, transparent 30%),
          linear-gradient(160deg, var(--bg), var(--bg-2));
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .shell {
        width: min(1220px, 95vw);
        margin: 1.2rem auto 1.6rem;
        display: grid;
        gap: 0.8rem;
      }

      .head {
        background: color-mix(in oklab, var(--surface), #ffffff 10%);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 20px 30px -30px var(--shadow);
        padding: 0.9rem 1rem;
      }

      .head h1 {
        margin: 0;
        font: 800 clamp(1.3rem, 2.4vw, 1.85rem)/1.06 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: -0.02em;
      }

      .head p {
        margin: 0.45rem 0 0;
        color: #4f5f6c;
      }

      .links {
        margin-top: 0.75rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .links a {
        text-decoration: none;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: #fff;
        color: #2d4e63;
        padding: 0.4rem 0.74rem;
        font: 700 0.74rem/1 "Archivo", "Segoe UI", sans-serif;
      }

      .api-wrap {
        border: 1px solid var(--line);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 22px 34px -30px var(--shadow);
      }

      elements-api {
        height: min(76vh, 900px);
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="head">
        <h1>OpenAPI Reference · Stoplight Elements</h1>
        <p>Interactive API docs generated from <code>/docs/openapi.yaml</code> for all study-case routes.</p>
        <nav class="links">
          <a href="/docs">Docs Home</a>
          <a href="/docs/study-cases">Case JSON</a>
          <a href="/docs/study-cases/ui">Phase Runner</a>
          <a href="/docs/openapi.yaml">Raw OpenAPI YAML</a>
        </nav>
      </header>

      <section class="api-wrap">
        <elements-api apiDescriptionUrl="/docs/openapi.yaml" router="hash" />
      </section>
    </main>
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
  </body>
</html>`
}

app.disable("x-powered-by")

app.use(cors())
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buffer) => {
      ;(req as Request).rawBody = buffer.toString("utf8")
    },
  }),
)
app.use(requestContextMiddleware)
app.use((_req, res, next) => {
  res.setHeader("x-content-type-options", "nosniff")
  res.setHeader("x-frame-options", "DENY")
  res.setHeader("referrer-policy", "no-referrer")
  next()
})
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint()

  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    log("info", "http_request", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(elapsedMs.toFixed(2)),
      userAgent: req.header("user-agent"),
      ip: req.ip,
    })
  })

  next()
})

app.get("/", (req, res) => {
  if (req.headers.accept?.includes("text/html")) {
    res.setHeader("content-type", "text/html; charset=utf-8")
    res.send(renderHomePage())
    return
  }

  res.json({
    name: "Backend Developer Node.js Study Lab",
    docs: "/docs/study-cases",
    casesBase: "/cases",
    totalCases: studyCases.length,
  })
})

app.get("/docs/study-cases", (_req, res) => {
  res.json(studyCasesResponse)
})

app.get("/docs", (_req, res) => {
  res.setHeader("content-type", "text/html; charset=utf-8")
  res.send(renderHomePage())
})

app.get("/docs/openapi", (_req, res) => {
  res.setHeader("content-type", "text/html; charset=utf-8")
  res.send(renderOpenApiPage())
})

app.get("/docs/openapi.yaml", (_req, res) => {
  try {
    const spec = fs.readFileSync(openApiSpecFilePath, "utf8")
    res.setHeader("content-type", "application/yaml; charset=utf-8")
    res.send(spec)
  } catch {
    res.status(500).json({
      error: "OpenAPI spec unavailable",
      expectedPath: openApiSpecFilePath,
    })
  }
})

app.get("/docs/study-cases/ui", (_req, res) => {
  res.setHeader("content-type", "text/html; charset=utf-8")
  res.send(renderStudyCasesPage())
})

app.use("/cases", casesRouter)

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  log("error", "unhandled_error", {
    requestId: req.requestId,
    error: err instanceof Error ? err.message : "Unknown error",
  })

  res.status(500).json({
    error: "Internal server error",
    requestId: req.requestId,
  })
})
