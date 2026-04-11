#!/usr/bin/env bash

set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
fi

npm install
npm run db:up

cat <<'EOF'
Bootstrap complete.

Next:
1) npm run dev
2) Open http://localhost:3000/docs/study-cases
EOF
