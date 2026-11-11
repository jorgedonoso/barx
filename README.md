# Barx E-Commerce Analytics

Project showcasing GCP architecture, containerized deployment, and automated CI/CD, built after earning the Google Cloud ACE certification.

## Demo

![Demo](./docs/demo.png)

## Architecture

```mermaid
flowchart LR
    subgraph CI/CD ["CI/CD Pipeline"]
        GH[GitHub Actions] -->|OIDC / WIF| AR[Artifact Registry]
    end

    AR -->|Deploy Container| CR[Cloud Run<br/>Next.js App]

    User([Browser]) --> CR

    CR -->|1. Cache lookup| Redis[(Redis<br/>5-min TTL)]
    Redis -.->|Cache hit| CR

    CR -->|Cache miss| BQ[(BigQuery)]
    BQ -.->|Query data & update cache| CR

    SM[Secret Manager] -.->|Credentials| CR
```

## Infrastructure

**Container**

- Docker multi-stage build with Next.js standalone output
- Linux AMD64 image

**Hosting**

- Artifact Registry and Cloud Run (`us-west4`)
- Autoscaling: 0–2 instances
- Resources: 1 vCPU, 512 MiB memory

**Data**

- BigQuery for analytics data
- Redis for API response caching (5-minute TTL)
- Secret Manager for Redis credentials

**CI/CD**

- GitHub Actions with OIDC-based Workload Identity Federation

## Local Development

```bash
npm install
npm run dev
```
