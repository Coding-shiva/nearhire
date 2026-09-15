# NearHire — Advanced AI-Powered Location-Based Job Discovery Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-2dsphere-brightgreen.svg)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-red.svg)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3-orange.svg)](https://aws.amazon.com)

**NearHire** is a real-world, production-grade MERN + AI job discovery application. When a user opens NearHire, it requests location access, retrieves exact GPS coordinates via the Browser Geolocation API, and discovers relevant hiring opportunities within a configurable radius from nearby companies in **Noida, Delhi, Gurugram, and Ghaziabad**.

---

## 🌟 Key Features

1. **Geospatial Radius Matching**:
   - MongoDB GeoJSON `Point` and `2dsphere` index.
   - Calculates straight-line distance in kilometers using the Haversine formula (e.g. `2.4 km away`).
   - Configurable radius filters: `5 km`, `10 km`, `25 km`, `50 km`, `100 km`.
   - Manual location fallback with preset hubs (Noida Sector 62, Connaught Place, DLF Cyber City, Raj Nagar Ghaziabad).

2. **Dedicated Walk-In Interview Portal**:
   - Filter by `Today`, `Tomorrow`, or `Next 7 Days`.
   - Displays interview timings, venue addresses, required documents, and urgency badges.

3. **Automated Multi-Source Aggregation Engine**:
   - Modular background pipeline: *Fetcher $\to$ Parser $\to$ Normalizer $\to$ Validator $\to$ Duplicate Detection $\to$ Category Detection $\to$ MongoDB $\to$ Cache Invalidation*.
   - BullMQ + Redis background workers scheduled every 30 minutes.
   - Nightly automated expiry sweeper archives closed jobs.

4. **Multi-Factor Deduplication**:
   - Normalized title + company + city MD5 hashing and token similarity algorithms prevent duplicate cards.

5. **AI Skills & Compatibility Engine**:
   - Provider abstraction supporting Google Gemini / OpenAI with smart rule-based taxonomy fallback.
   - Skill normalization (e.g. `ReactJS` $\to$ `React`, `NodeJS` $\to$ `Node.js`, `Mongo` $\to$ `MongoDB`).
   - Calculates % match score, lists matched skills vs missing skills, and provides customized advice.

6. **Interactive Leaflet OpenStreetMap**:
   - Custom markers for user GPS center, companies, and walk-in drives.
   - Interactive popups with instant job details and direct apply buttons.

7. **Multi-Role RBAC**:
   - **Job Seeker**: Discovery, AI match score, 1-click apply, saved jobs, location alerts.
   - **Employer**: Post jobs, schedule walk-in drives, candidate pipeline tracker (`Applied`, `Shortlisted`, `Interview`, `Selected`, `Rejected`).
   - **Admin**: Platform metrics, category & city charts, job verification, source controls, ingestion logs.

---

## 🏗️ System Architecture

```
                          [ Client: React + Vite + Leaflet ]
                                      │                    │
                          REST API / JWT               Browser Geolocation
                                      │                    │
                                      ▼                    ▼
                           [ Nginx Reverse Proxy / Express API ]
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  [ Controllers & Routes ]    [ Geo & AI Services ]      [ BullMQ Queue Manager ]
  - Auth (JWT, Roles)         - MongoDB 2dsphere $near    - Ingestion Queue
  - Jobs & Walk-ins           - Gemini / OpenAI Adapter   - Expiry Queue
  - Companies & Employers     - Duplicate Hash & Sim      - Alert Notification Queue
  - Alerts & Applications     - Category/Skill Normalizer         │
          │                           │                           ▼
          ▼                           ▼               [ Redis 7 / In-Memory ]
  [ MongoDB Atlas / Local ]   [ Redis Caching ]       - Caching nearby results
  - 2dsphere GeoJSON          - Rate limiting         - BullMQ message broker
  - 11 Mongoose Schemas       - Search cache
                                      ▲
                                      │
                         [ Background Workers Engine ]
                         - Job Fetcher & Parser
                         - Normalizer & Validator
                         - Duplicate & AI Classifier
                         - Nightly Expiry Sweeper
                         - Job Alert Matcher
```

---

## 🚀 Quick Start (Docker Compose)

The easiest way to run the entire platform locally:

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/nearhire.git
cd nearhire

# 2. Build and run all 5 containers
docker compose up -d --build

# 3. Populate database with realistic NCR demo data
docker compose exec backend node src/scripts/seed.js

# 4. Open in browser:
# Frontend: http://localhost
# Backend API: http://localhost:5000/health
```

---

## 💻 Local Development Without Docker

### Prerequisites
- Node.js >= 18.0
- MongoDB running locally on `localhost:27017`
- Redis (optional, safe fallback in-memory cache is built-in)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds realistic jobs, companies, and users
npm run dev      # Runs on port 5000
```

### 2. Workers Daemon
```bash
cd workers
npm install
npm start        # Runs scheduled ingestion & expiry sweeper
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server at http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Pre-configured Location |
|---|---|---|---|
| **Job Seeker** | `candidate@nearhire.com` | `password123` | Noida Sector 62 (React, Node.js, MongoDB) |
| **Employer** | `employer@innovatech.com` | `password123` | Sector 62, Noida (InnovaTech Solutions) |
| **Admin** | `admin@nearhire.com` | `admin123` | New Delhi |

---

## 📖 Deployment Guides

- For complete Docker Hub & AWS ECR build/push commands, see [DOCKER_GUIDE.md](./DOCKER_GUIDE.md).
- For complete step-by-step AWS EC2, S3, CloudFront, and SSL instructions, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md).
