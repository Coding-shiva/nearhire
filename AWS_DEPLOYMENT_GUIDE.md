# NearHire — Complete AWS Deployment & Hosting Guide

This guide provides the exact, production-tested commands to deploy **NearHire** to Amazon Web Services (AWS) so real users can access the application over the internet.

---

## Architecture Options

### Option A: Complete Docker Compose on AWS EC2 (Recommended & Fastest)
- **Frontend**: Nginx serving React on port `80` / `443`
- **Backend & Workers**: Express API + BullMQ daemon
- **Database**: MongoDB & Redis running in Docker containers with EBS volume persistence
- **Domain & SSL**: Free SSL via Let's Encrypt / Certbot

### Option B: Decoupled Enterprise Cloud
- **Frontend**: Amazon S3 + CloudFront CDN + ACM Free SSL Certificate
- **Backend & Workers**: AWS EC2 (t3.small/medium)
- **Database**: MongoDB Atlas (Free Tier M0 or Shared) + AWS ElastiCache for Redis
- **DNS**: Amazon Route 53

---

## PART 1: Deploying on AWS EC2 via Docker Compose (Step-by-Step)

### Step 1: Launch an AWS EC2 Instance
1. Open AWS Management Console $\to$ **EC2** $\to$ **Launch Instance**.
2. **Name**: `NearHire-Production-Server`
3. **AMI**: `Ubuntu Server 24.04 LTS` (or 22.04 LTS) (64-bit x86)
4. **Instance Type**: `t3.small` (2 vCPU, 2 GB RAM) or `t3.medium` (4 GB RAM recommended for Redis + MongoDB + Workers)
5. **Key Pair**: Create or select an existing `.pem` key pair (e.g. `nearhire-key.pem`).
6. **Network Settings / Security Group**:
   - Check **Allow SSH traffic from** `Anywhere` (or My IP) (Port `22`)
   - Check **Allow HTTP traffic from the internet** (Port `80`)
   - Check **Allow HTTPS traffic from the internet** (Port `443`)
   - Add Custom TCP Rule: Port `5000` (Optional for direct API debugging)
7. **Storage**: Configure at least `25 GB` General Purpose SSD (gp3).
8. Click **Launch Instance**.

---

### Step 2: Connect to Your EC2 Instance via SSH

On your local machine terminal:
```bash
# Set appropriate permissions for your key
chmod 400 nearhire-key.pem

# Connect to the instance (replace with your EC2 Public IP)
ssh -i nearhire-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

### Step 3: Install Docker and Docker Compose on EC2

Run these commands inside your EC2 terminal:
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install prerequisites
sudo apt install -y curl apt-transport-https ca-certificates software-properties-common git

# 3. Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Allow ubuntu user to execute docker commands without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# 5. Verify Docker installation
docker --version
docker compose version
```

---

### Step 4: Clone NearHire Repository & Configure Environment

```bash
# Clone the repository
git clone https://github.com/<your-username>/nearhire.git
cd nearhire

# Create production .env file
cp .env.example .env

# Edit .env with nano or vim
nano .env
```

Ensure your `.env` has:
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=http://<YOUR_EC2_PUBLIC_IP>

MONGO_URI=mongodb://mongodb:27017/nearhire
REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=production_strong_secret_key_32_characters_random
JWT_REFRESH_SECRET=production_strong_refresh_secret_key_random
JWT_EXPIRES_IN=7d

# Optional AI Key (leave blank to use built-in taxonomy fallback)
GEMINI_API_KEY=
```
Save and exit nano (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

### Step 5: Build and Launch NearHire

```bash
# Launch all 5 containers (MongoDB, Redis, Backend, Workers, Frontend)
docker compose up -d --build
```

Verify containers are running:
```bash
docker compose ps
```

---

### Step 6: Populate Seed Data for NCR Region

Run the seed script inside the backend container to populate realistic data for Noida, Delhi, Gurugram, and Ghaziabad:
```bash
docker compose exec backend node src/scripts/seed.js
```

---

### Step 7: Access the Live Application

Open your web browser and navigate to:
```
http://<YOUR_EC2_PUBLIC_IP>
```
Your NearHire application is now **live and operational**!
- Home page discovery, radius search, walk-in drives, and filters work immediately.
- Test Candidate Login: `candidate@nearhire.com` / `password123`
- Test Employer Login: `employer@innovatech.com` / `password123`
- Test Admin Login: `admin@nearhire.com` / `admin123`

---

## PART 2: Setting up a Custom Domain & Free SSL (HTTPS)

If you have a domain name (e.g. `nearhire.com`):

### 1. Point Domain DNS
In your domain registrar (GoDaddy, Namecheap, Cloudflare, Route 53):
- Add an **A Record**: `@` $\to$ `<YOUR_EC2_PUBLIC_IP>`
- Add an **A Record**: `www` $\to$ `<YOUR_EC2_PUBLIC_IP>`

### 2. Install Free SSL with Certbot
Inside your EC2 server:
```bash
# Install certbot
sudo apt install -y certbot

# Stop frontend container briefly on port 80
docker compose stop frontend

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Restart frontend container
docker compose start frontend
```

---

## PART 3: Deploying Frontend to Amazon S3 + CloudFront (Optional CDN Method)

If you prefer serving the React frontend globally via AWS CloudFront CDN:

### 1. Build Frontend Locally or in CI
```bash
cd frontend
npm ci
npm run build
```

### 2. Create AWS S3 Bucket & Sync
```bash
# Create bucket
aws s3 mb s3://nearhire-web-app --region ap-south-1

# Enable static website hosting
aws s3 website s3://nearhire-web-app/ --index-document index.html --error-document index.html

# Sync compiled production build
aws s3 sync dist/ s3://nearhire-web-app/ --delete
```

### 3. Create CloudFront Distribution
1. In AWS Console, go to **CloudFront** $\to$ **Create distribution**.
2. **Origin domain**: Select your S3 bucket `nearhire-web-app.s3.amazonaws.com`.
3. **Viewer protocol policy**: Redirect HTTP to HTTPS.
4. Under **Custom error response**:
   - Error code: `403` and `404` $\to$ Response page path: `/index.html` $\to$ Response code: `200`.
5. Deploy distribution.

---

## PART 4: Maintenance & Update Commands

### How to update code after changes:
```bash
cd /home/ubuntu/nearhire
git pull origin main
docker compose up -d --build
```

### How to view logs:
```bash
# Ingestion logs & background workers:
docker compose logs -f workers

# API logs:
docker compose logs -f backend
```
