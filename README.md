# Barx

## Stack

Next.js · React · TypeScript · Docker · GCP Cloud Run · Artifact Registry

## Infrastructure

- Docker multi-stage build with Next.js standalone output
- Linux AMD64 container image
- Artifact Registry and Cloud Run (`us-west4`)
- Autoscaling: 0–2 instances
- Resources: 1 vCPU, 512 MiB memory
- GitHub Actions CI/CD with OIDC-based Workload Identity Federation

## Local Development

```bash
npm install
npm run dev
```
