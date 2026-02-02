# Tablets

## Structure

- `backend/` FastAPI placeholder service
- `frontend/` Frontend placeholder
- `docs/` Documentation
- `docker-compose.yml` Local dev stack (MySQL + backend)

## Run locally

1) Build and start services:

```bash
docker compose up --build
```

2) Check health:

```bash
curl http://localhost:8000/health
```

## Reset database and re-seed

The seed runs only on first MySQL initialization. To reset and re-seed:

```bash
docker compose down -v
docker compose up --build
```
