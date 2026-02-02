# Tablets

## Structure

- `backend/` FastAPI placeholder service
- `frontend/` React + Vite frontend
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

3) Open frontend:

- http://localhost:5173

Frontend API base can be set via `VITE_API_URL` (see `docker-compose.yml`).

## Admin login

Default credentials (set in `docker-compose.yml`):

- username: `admin`
- password: `admin`

JWT secret is set via `JWT_SECRET` in compose.
Grace period and start time:

- `GRACE_MINUTES` (default 5)
- `SCHOOL_START_TIME` (optional, format `HH:MM:SS`)

## TV page

Open `/tv` and (optional) pass classes and video URL:

- `/tv?classes=1,2`
- `/tv?video=/media/your-video.mp4`

## Reset database and re-seed

The seed runs only on first MySQL initialization. To reset and re-seed:

```bash
docker compose down -v
docker compose up --build
```
