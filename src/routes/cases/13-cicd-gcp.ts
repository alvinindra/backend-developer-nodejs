import { Router } from "express";

export const case13CicdGcpRouter = Router();

case13CicdGcpRouter.get("/", (_req, res) => {
  res.json({
    case: "13-cicd-gcp",
    summary: "CI/CD and GCP deployment study case",
    pipelines: [
      {
        system: "GitHub Actions",
        file: ".github/workflows/ci.yml",
        stages: ["install", "lint", "test", "build"]
      },
      {
        system: "CircleCI",
        file: ".circleci/config.yml",
        stages: ["install", "lint", "test", "build"]
      },
      {
        system: "Google Cloud Build",
        file: "cloudbuild.yaml",
        stages: ["docker-build", "docker-push", "cloud-run-deploy"]
      }
    ],
    gcpTargets: {
      runService: "backend-developer-lab",
      region: "us-central1",
      image: "gcr.io/YOUR_PROJECT_ID/backend-developer-lab"
    }
  });
});
