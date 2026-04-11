# GCP Deployment Guide (Study Lab)

This guide shows a practical deployment flow to Google Cloud Run using Cloud Build.

## Prerequisites

- `gcloud` CLI installed and authenticated
- A GCP project with billing enabled
- APIs enabled: Cloud Build, Cloud Run, Artifact Registry (or Container Registry)

## One-time setup

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## Build and deploy using Cloud Build

From project root:

```bash
gcloud builds submit --config cloudbuild.yaml
```

This uses `cloudbuild.yaml` to:

1. Build Docker image
2. Push image to `gcr.io`
3. Deploy `backend-developer-lab` to Cloud Run

## Verify deployment

```bash
gcloud run services list --platform managed --region us-central1
gcloud run services describe backend-developer-lab --platform managed --region us-central1
```

Open the service URL and verify:

- `/`
- `/docs/study-cases`
- `/cases/01-health`

## Suggested production hardening

- Store secrets in Secret Manager
- Restrict unauthenticated access if not needed
- Use a custom domain and HTTPS policies
- Add Cloud Monitoring alerts for error rate and latency
