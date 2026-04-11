import { Router } from "express"

export const case10ReactDemoRouter = Router()

case10ReactDemoRouter.get("/", (_req, res) => {
  res.setHeader("content-type", "text/html; charset=utf-8")
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Case 10 - Frontend Mission Control</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f4f0e6;
        --bg-2: #e5ddca;
        --surface: #fefbf5;
        --ink: #101c26;
        --muted: #4b5962;
        --accent: #0f6c8c;
        --line: #d5c8b1;
        --console: #0f141a;
        --console-line: #28343f;
        --console-ink: #d7ebf8;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        background:
          radial-gradient(circle at 85% 8%, #f7c66e55 0%, transparent 36%),
          radial-gradient(circle at 15% 88%, #8dc8e855 0%, transparent 34%),
          linear-gradient(160deg, var(--bg), var(--bg-2));
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .shell {
        width: min(1200px, 94vw);
        margin: 1.6rem auto 2rem;
        display: grid;
        gap: 1.1rem;
        animation: boot 520ms ease both;
      }

      .hero,
      .panel,
      .console {
        background: color-mix(in oklab, var(--surface), #ffffff 10%);
        border: 1px solid var(--line);
        border-radius: 18px;
        box-shadow: 0 20px 34px -28px rgba(40, 45, 36, 0.45);
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 1.45rem;
        display: grid;
        gap: 0.7rem;
      }

      .hero::before {
        content: "";
        position: absolute;
        width: 260px;
        height: 260px;
        right: -70px;
        top: -120px;
        background: radial-gradient(circle at 40% 40%, #f7c669, transparent 70%);
        opacity: 0.42;
        pointer-events: none;
      }

      .hero h1 {
        margin: 0;
        font: 800 clamp(1.55rem, 2.7vw, 2.55rem)/1 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: -0.02em;
      }

      .hero p {
        margin: 0;
        color: var(--muted);
      }

      .eyebrow {
        margin: 0;
        font: 700 0.76rem/1 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.58rem;
      }

      button {
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 0.56rem 0.94rem;
        font: 700 0.84rem/1 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: 0.01em;
        cursor: pointer;
      }

      .btn-primary {
        color: #fff;
        background: linear-gradient(120deg, var(--accent), #1596c2);
      }

      .btn-secondary {
        color: #243440;
        border: 1px solid var(--line);
        background: #fffdf8;
      }

      .metrics {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      }

      .metric {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 0.75rem 0.8rem;
      }

      .metric-label {
        margin: 0;
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #4d6371;
      }

      .metric-value {
        margin: 0.35rem 0 0;
        font: 800 1.12rem/1 "Archivo", "Segoe UI", sans-serif;
      }

      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1.25fr 0.95fr;
      }

      .panel {
        padding: 1rem;
      }

      h2 {
        margin: 0;
        font: 700 1.06rem/1.08 "Archivo", "Segoe UI", sans-serif;
      }

      .muted {
        margin: 0.35rem 0 0.74rem;
        color: var(--muted);
        font-size: 0.9rem;
      }

      pre {
        margin: 0;
        background: #f5efe4;
        border: 1px solid #e3d6bf;
        border-radius: 12px;
        padding: 0.78rem;
        overflow: auto;
        max-height: 380px;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 999px;
        padding: 0.36rem 0.66rem;
        background: #e9f2f7;
        color: #0f6c8c;
        font: 700 0.77rem/1 "Archivo", "Segoe UI", sans-serif;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 1.2s infinite;
      }

      .case-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.54rem;
      }

      .case-list li {
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 0.62rem 0.74rem;
        background: #fff;
        transition: transform 180ms ease, box-shadow 180ms ease;
      }

      .case-list li:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px -20px rgba(27, 36, 42, 0.45);
      }

      .case-list a {
        text-decoration: none;
        color: #1d3140;
        font: 700 0.88rem/1.2 "Archivo", "Segoe UI", sans-serif;
      }

      .case-list p {
        margin: 0.32rem 0 0;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 0.5rem;
      }

      .row button {
        padding: 0.36rem 0.58rem;
        font-size: 0.73rem;
        background: #fffdf8;
        border: 1px solid var(--line);
        color: #2e4453;
      }

      .tag {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        border: 1px solid #ecd39d;
        background: #fff7e2;
        color: #946318;
        padding: 0.18rem 0.5rem;
        font: 700 0.68rem/1 "Archivo", "Segoe UI", sans-serif;
        letter-spacing: 0.02em;
      }

      .console {
        padding: 1rem;
        background: linear-gradient(165deg, #10151c, #0a1118);
        border-color: #2b3742;
        color: var(--console-ink);
      }

      .console h2 {
        color: #eef8ff;
      }

      .console .muted {
        color: #9eb3c3;
      }

      .console pre {
        background: var(--console);
        border-color: var(--console-line);
        color: var(--console-ink);
      }

      .console-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.55rem;
      }

      .console-meta span {
        border-radius: 999px;
        border: 1px solid #345166;
        padding: 0.2rem 0.5rem;
        font-size: 0.72rem;
        color: #9fc9e4;
      }

      .search {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: #fff;
        padding: 0.58rem 0.66rem;
        margin-bottom: 0.68rem;
        color: var(--ink);
        font: 500 0.9rem/1 "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .timeline {
        display: grid;
        gap: 0.55rem;
      }

      .timeline-item {
        border-left: 3px solid #ddc89c;
        padding-left: 0.62rem;
      }

      .timeline-item p {
        margin: 0.18rem 0 0;
        color: #53626c;
        font-size: 0.84rem;
      }

      .timeline-item strong {
        font: 700 0.84rem/1.1 "Archivo", "Segoe UI", sans-serif;
        color: #1f3748;
      }

      .fade {
        animation: fade-in 420ms ease both;
      }

      @keyframes boot {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script>
      const { useEffect, useMemo, useState } = React;

      const phaseTimeline = [
        { title: 'Foundations', detail: 'health, CRUD, GraphQL, auth' },
        { title: 'Data Platform', detail: 'Postgres + Timescale + Hasura' },
        { title: 'Distributed Patterns', detail: 'outbox, queues, idempotency' },
        { title: 'Delivery & Architecture', detail: 'CI/CD, system design, webhooks' },
        { title: 'Advanced Reliability', detail: 'resilience and event-sourced domains' }
      ];

      const presets = {
        '01': { method: 'GET', path: '/cases/01-health' },
        '07': { method: 'POST', path: '/cases/07-auth/login', body: { username: 'react-control', role: 'developer' } },
        '11': {
          method: 'POST',
          path: '/cases/11-ai-ml/summarize',
          body: {
            text: 'Reliable backend systems require observability, retries, and clear fallback policies when remote dependencies fail.'
          }
        },
        '12': { method: 'GET', path: '/cases/12-observability' },
        '16': {
          method: 'POST',
          path: '/cases/16-resilience/invoke',
          body: { dependency: 'payment-gateway', scenario: 'flaky', timeoutMs: 180 }
        },
        '17': {
          method: 'POST',
          path: '/cases/17-event-sourcing-cqrs/accounts',
          body: { accountId: 'react-lab-account', initialBalance: 300, commandId: 'react-open-account' }
        }
      };

      function complexityTag(id) {
        if (['16', '17', '08', '09', '09b'].includes(id)) {
          return 'Advanced';
        }

        if (['04', '04b', '05', '06', '14', '15'].includes(id)) {
          return 'Intermediate';
        }

        return 'Core';
      }

      function App() {
        const [health, setHealth] = useState(null);
        const [studyCases, setStudyCases] = useState([]);
        const [obs, setObs] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');
        const [query, setQuery] = useState('');
        const [consoleMeta, setConsoleMeta] = useState(['Waiting for action']);
        const [consolePayload, setConsolePayload] = useState('Select a preset from the right panel to execute a real backend flow.');

        useEffect(() => {
          Promise.all([
            fetch('/cases/01-health').then((r) => r.json()),
            fetch('/docs/study-cases').then((r) => r.json()),
            fetch('/cases/12-observability').then((r) => r.json())
          ])
            .then(([healthResponse, docsResponse, obsResponse]) => {
              setHealth(healthResponse);
              setStudyCases(Array.isArray(docsResponse.details) ? docsResponse.details : []);
              setObs(obsResponse);
              setLoading(false);
            })
            .catch(() => {
              setHealth({ error: 'Failed to load runtime endpoints' });
              setError('Unable to fetch lab telemetry right now.');
              setLoading(false);
            });
        }, []);

        const refresh = () => {
          setLoading(true);
          setError('');

          Promise.all([
            fetch('/cases/01-health').then((r) => r.json()),
            fetch('/cases/12-observability').then((r) => r.json())
          ])
            .then(([healthPayload, obsPayload]) => {
              setHealth(healthPayload);
              setObs(obsPayload);
              setLoading(false);
            })
            .catch(() => {
              setHealth({ error: 'Refresh failed' });
              setLoading(false);
            });
        };

        const filteredCases = useMemo(() => {
          const normalized = query.trim().toLowerCase();
          if (!normalized) {
            return studyCases;
          }

          return studyCases.filter((item) => {
            return [item.id, item.title, item.focus, item.route]
              .join(' ')
              .toLowerCase()
              .includes(normalized);
          });
        }, [query, studyCases]);

        const advancedCount = studyCases.filter((item) => ['16', '17', '08', '09', '09b'].includes(item.id)).length;

        const runPreset = (caseId) => {
          const preset = presets[caseId];

          if (!preset) {
            setConsoleMeta(['Case ' + caseId, 'No preset']);
            setConsolePayload('No default preset is defined for this case yet. Use Open Route to interact manually.');
            return;
          }

          const startedAt = Date.now();
          const headers = {};
          const options = { method: preset.method || 'GET', headers };

          if (preset.body) {
            headers['content-type'] = 'application/json';
            options.body = JSON.stringify(preset.body);
          }

          setConsoleMeta(['Case ' + caseId, options.method, preset.path, 'Running']);
          setConsolePayload('Executing preset...');

          fetch(preset.path, options)
            .then(async (response) => {
              const text = await response.text();
              let payload = text;

              try {
                payload = JSON.parse(text);
              } catch {}

              setConsoleMeta([
                'Case ' + caseId,
                options.method,
                preset.path,
                'HTTP ' + response.status,
                (Date.now() - startedAt) + ' ms'
              ]);
              setConsolePayload(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
            })
            .catch((requestError) => {
              setConsoleMeta(['Case ' + caseId, options.method, preset.path, 'Request Error']);
              setConsolePayload(requestError instanceof Error ? requestError.message : 'Unknown request failure');
            });
        };

        const quickCases = filteredCases.slice(0, 8);

        return React.createElement('main', { className: 'shell fade' },
          React.createElement('section', { className: 'hero' },
            React.createElement('p', { className: 'eyebrow' }, 'Case 10 · Frontend Mission Control'),
            React.createElement('h1', null, 'Operate The Backend Lab From One Control Surface'),
            React.createElement('p', null, 'Explore study cases, execute advanced presets, and inspect runtime telemetry directly from a React UI served by this backend.'),
            React.createElement('div', { className: 'actions' },
              React.createElement('button', { className: 'btn-primary', onClick: refresh }, loading ? 'Refreshing...' : 'Refresh Health'),
              React.createElement('button', { className: 'btn-secondary', onClick: () => window.location.assign('/docs/study-cases/ui') }, 'Open Full Study Cases UI'),
              React.createElement('button', { className: 'btn-secondary', onClick: () => window.location.assign('/') }, 'Go Home')
            ),
            React.createElement('section', { className: 'metrics' },
              React.createElement('article', { className: 'metric' },
                React.createElement('p', { className: 'metric-label' }, 'Total Cases'),
                React.createElement('p', { className: 'metric-value' }, String(studyCases.length || 0))
              ),
              React.createElement('article', { className: 'metric' },
                React.createElement('p', { className: 'metric-label' }, 'Advanced Cases'),
                React.createElement('p', { className: 'metric-value' }, String(advancedCount))
              ),
              React.createElement('article', { className: 'metric' },
                React.createElement('p', { className: 'metric-label' }, 'Health Status'),
                React.createElement('p', { className: 'metric-value' }, health && health.status ? String(health.status).toUpperCase() : 'UNKNOWN')
              ),
              React.createElement('article', { className: 'metric' },
                React.createElement('p', { className: 'metric-label' }, 'Request Correlation'),
                React.createElement('p', { className: 'metric-value' }, obs && obs.requestId ? String(obs.requestId).slice(0, 8) : 'N/A')
              )
            )
          ),

          React.createElement('section', { className: 'grid' },
            React.createElement('article', { className: 'panel' },
              React.createElement('h2', null, 'Runbook Timeline'),
              React.createElement('p', { className: 'muted' }, 'The progression path from foundations to reliability engineering.'),
              React.createElement('div', { className: 'timeline' },
                phaseTimeline.map((step) => React.createElement('div', { className: 'timeline-item', key: step.title },
                  React.createElement('strong', null, step.title),
                  React.createElement('p', null, step.detail)
                ))
              ),
              React.createElement('div', { style: { marginTop: '0.95rem' } },
                React.createElement('h2', { style: { marginBottom: '0.34rem' } }, 'Runtime Snapshot'),
                React.createElement('div', { className: 'status' },
                  React.createElement('span', { className: 'dot' }),
                  loading ? 'Syncing lab state...' : 'Connected to backend runtime'
                ),
                React.createElement('div', { style: { marginTop: '0.62rem' } },
                  React.createElement('pre', null, JSON.stringify({ health, observability: obs, error }, null, 2))
                )
              )
            ),

            React.createElement('aside', { className: 'panel' },
              React.createElement('h2', null, 'Case Explorer'),
              React.createElement('p', { className: 'muted' }, 'Search cases, inspect focus areas, then run presets to exercise real endpoints.'),
              React.createElement('input', {
                className: 'search',
                value: query,
                onChange: (event) => setQuery(event.target.value),
                placeholder: 'Filter by case id, title, route, or focus...'
              }),
              React.createElement('ul', { className: 'case-list' },
                quickCases.map((item) => React.createElement('li', { key: item.id },
                  React.createElement('a', { href: item.route, target: '_blank', rel: 'noreferrer' }, 'Case ' + item.id + ' · ' + item.title),
                  React.createElement('p', null, item.focus),
                  React.createElement('div', { className: 'row' },
                    React.createElement('span', { className: 'tag' }, complexityTag(item.id)),
                    React.createElement('button', { onClick: () => runPreset(item.id) }, 'Run Preset'),
                    React.createElement('button', { onClick: () => window.open(item.route, '_blank') }, 'Open Route')
                  )
                ))
              )
            )
          ),

          React.createElement('section', { className: 'console' },
            React.createElement('h2', null, 'Execution Console'),
            React.createElement('p', { className: 'muted' }, 'Each preset writes request metadata and payload output here.'),
            React.createElement('div', { className: 'console-meta' },
              consoleMeta.map((item, index) => React.createElement('span', { key: index + '-' + item }, item))
            ),
            React.createElement('pre', null, consolePayload)
          )
        );
      }

      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
    </script>
  </body>
</html>`)
})
