# NearHire — Docker & Containerization Guide

This guide details all commands necessary to build, run, test, and push the NearHire multi-container platform locally and to container registries (Docker Hub / AWS ECR).

---

## 1. Local Architecture

The platform runs as 5 isolated container services connected via an internal bridge network (`nearhire-net`):

| Container Name | Service | Port | Description |
|---|---|---|---|
| `nearhire-frontend` | React 18 + Nginx | `80` | Production static build served via Nginx with `/api` reverse proxy |
| `nearhire-backend` | Express.js API | `5000` | REST API with JWT, geospatial routes, AI service |
| `nearhire-workers` | Background Daemon | Internal | BullMQ, 30-min scheduled job ingestion & nightly expiry sweeper |
| `nearhire-redis` | Redis 7 Alpine | `6379` | Message broker for queues & search cache |
| `nearhire-mongodb` | MongoDB 7.0 | `27017` | Document store with 2dsphere GeoJSON index |

---

## 2. Running Locally with Docker Compose

### Step 1: Clone and Prepare Environment
```bash
# In the project root directory
cp .env.example .env
```

### Step 2: Build and Start All Containers
```bash
# Build images and start all 5 services in detached mode
docker compose up -d --build
```

### Step 3: Check Container Status
```bash
docker compose ps
```
You should see all 5 services in state `Up`.

### Step 4: Seed Database with NCR Demo Data
Run the seed script inside the backend container to populate realistic data for Noida, Delhi, Gurugram, and Ghaziabad:
```bash
docker compose exec backend node src/scripts/seed.js
```

### Step 5: View Live Logs
```bash
# Follow logs for all services
docker compose logs -f

# Or follow only backend & worker logs:
docker compose logs -f backend workers
```

### Step 6: Access the Application
- **Frontend Web App**: [http://localhost](http://localhost) (or [http://localhost:80](http://localhost:80))
- **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### Step 7: Stopping the Containers
```bash
# Stop containers without removing persistent data
docker compose down

# Stop and wipe database volumes (clean reset)
docker compose down -v
```

---

## 3. Pushing Images to Docker Hub

### Step 1: Log in to Docker Hub
```bash
docker login -u <your-dockerhub-username>
```

### Step 2: Build & Tag Backend Image
```bash
docker build -t <your-dockerhub-username>/nearhire-backend:v1.0.0 ./backend
docker tag <your-dockerhub-username>/nearhire-backend:v1.0.0 <your-dockerhub-username>/nearhire-backend:latest
docker push <your-dockerhub-username>/nearhire-backend:latest
```

### Step 3: Build & Tag Frontend Image
```bash
docker build -t <your-dockerhub-username>/nearhire-frontend:v1.0.0 ./frontend
docker tag <your-dockerhub-username>/nearhire-frontend:v1.0.0 <your-dockerhub-username>/nearhire-frontend:latest
docker push <your-dockerhub-username>/nearhire-frontend:latest
```

### Step 4: Build & Tag Workers Image
```bash
docker build -t <your-dockerhub-username>/nearhire-workers:v1.0.0 ./workers
docker tag <your-dockerhub-username>/nearhire-workers:v1.0.0 <your-dockerhub-username>/nearhire-workers:latest
docker push <your-dockerhub-username>/nearhire-workers:latest
```

---

## 4. Pushing Images to AWS Elastic Container Registry (ECR)

If you prefer AWS ECR instead of Docker Hub:

### Step 1: Authenticate Docker to AWS ECR
```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com
```

### Step 2: Create ECR Repositories
```bash
aws ecr create-repository --repository-name nearhire-backend --region ap-south-1
aws ecr create-repository --repository-name nearhire-frontend --region ap-south-1
aws ecr create-repository --repository-name nearhire-workers --region ap-south-1
```

### Step 3: Tag and Push
```bash
# Tag
docker tag nearhire-backend:latest <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/nearhire-backend:latest
docker tag nearhire-frontend:latest <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/nearhire-frontend:latest
docker tag nearhire-workers:latest <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/nearhire-workers:latest

# Push
docker push <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/nearhire-backend:latest
docker push <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/nearhire-frontend:latest
docker push <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/nearhire-workers:latest
```
