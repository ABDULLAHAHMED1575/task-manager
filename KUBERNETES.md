# Kubernetes Deployment for Task Manager

This document provides a quick overview of deploying the Task Manager application to Kubernetes using Minikube.

## Quick Start

### 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed

### 2. Start Minikube & Build Images

```bash
# Start minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable ingress
minikube addons enable ingress

# Configure docker to use minikube's daemon
eval $(minikube docker-env)

# Build images
./k8s/build-images.sh
```

### 3. Deploy Application

```bash
# Deploy all components
./k8s/deploy.sh
```

### 4. Access the Application

```bash
# Add to /etc/hosts
echo "$(minikube ip) taskmanager.local" | sudo tee -a /etc/hosts

# Open in browser
# Frontend: http://taskmanager.local
# Backend API: http://taskmanager.local/api
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Ingress Controller                 │
│         (taskmanager.local)                     │
└────────────┬────────────────────┬───────────────┘
             │                    │
             │ /                  │ /api
             │                    │
       ┌─────▼──────┐      ┌──────▼──────┐
       │  Frontend  │      │   Backend   │
       │  Service   │      │   Service   │
       └─────┬──────┘      └──────┬──────┘
             │                    │
       ┌─────▼──────┐      ┌──────▼──────┐
       │  Frontend  │      │   Backend   │
       │ Deployment │      │ Deployment  │
       │ (2 pods)   │      │  (2 pods)   │
       └────────────┘      └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │  PostgreSQL │
                           │   Service   │
                           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │  PostgreSQL │
                           │ Deployment  │
                           │  (1 pod)    │
                           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │     PVC     │
                           │   (5Gi)     │
                           └─────────────┘
```

## Components

### Application Components

- **Frontend**: React application served via Nginx (port 80)
- **Backend**: Node.js/Express API server (port 3000)
- **Database**: PostgreSQL 16 (port 5432)

### Kubernetes Resources

#### PostgreSQL
- `postgres-secret.yaml` - Database credentials
- `postgres-configmap.yaml` - Database configuration
- `postgres-pvc.yaml` - Persistent storage (5Gi)
- `postgres-deployment.yaml` - Database deployment
- `postgres-service.yaml` - Database service

#### Backend
- `backend-secret.yaml` - Session keys and DB connection
- `backend-configmap.yaml` - Environment configuration
- `backend-deployment.yaml` - Backend deployment (2 replicas)
- `backend-service.yaml` - Backend service

#### Frontend
- `frontend-configmap.yaml` - API URL configuration
- `frontend-deployment.yaml` - Frontend deployment (2 replicas)
- `frontend-service.yaml` - Frontend service

#### Ingress
- `ingress.yaml` - Routes traffic to frontend and backend

## Useful Scripts

```bash
# Build Docker images
./k8s/build-images.sh

# Deploy all components
./k8s/deploy.sh

# Clean up deployment
./k8s/cleanup.sh

# Check status
kubectl get pods
kubectl get services
kubectl get ingress

# View logs
kubectl logs -l app=backend --tail=100 -f
kubectl logs -l app=frontend --tail=100 -f
kubectl logs -l app=postgres --tail=100 -f

# Scale deployments
kubectl scale deployment backend-deployment --replicas=3
kubectl scale deployment frontend-deployment --replicas=3
```

## Configuration

### Backend Environment Variables

Configured via `k8s/backend-configmap.yaml` and `k8s/backend-secret.yaml`:

- `PORT`: Server port (3000)
- `HOST`: Server host (0.0.0.0)
- `NODE_ENV`: Environment (production)
- `CORSORIGIN`: Allowed CORS origin
- `SECRET_SESSION_KEY`: Session secret (secret)
- `DATABASE_URL`: PostgreSQL connection string (secret)
- `BCRYPT_ROUNDS`: Password hashing rounds (10)

### Frontend Environment Variables

Configured via `k8s/frontend-configmap.yaml`:

- `VITE_API_URL`: Backend API URL (http://taskmanager.local/api)

### Database Configuration

Configured via `k8s/postgres-secret.yaml`:

- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name

## Customization

### Change Domain Name

1. Update `k8s/ingress.yaml` - change `host` from `taskmanager.local`
2. Update `k8s/backend-configmap.yaml` - change `CORSORIGIN`
3. Update `k8s/frontend-configmap.yaml` - change `VITE_API_URL`
4. Rebuild frontend image (API URL is baked into the build)

### Change Resource Limits

Edit the respective deployment files:
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`
- `k8s/postgres-deployment.yaml`

### Change Replica Counts

```bash
kubectl scale deployment backend-deployment --replicas=3
kubectl scale deployment frontend-deployment --replicas=3
```

Or edit the deployment files and reapply.

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods

# Describe pod
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Image Pull Errors

Make sure you're using Minikube's Docker daemon:

```bash
eval $(minikube docker-env)
./k8s/build-images.sh
```

### Database Connection Issues

```bash
# Check postgres is running
kubectl get pods -l app=postgres

# Test connection
BACKEND_POD=$(kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $BACKEND_POD -- nc -zv postgres-service 5432
```

### Ingress Not Working

```bash
# Check ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl get ingress

# Verify /etc/hosts
cat /etc/hosts | grep taskmanager.local
```

## Production Considerations

For production deployment, consider:

1. **Use external database** - Managed PostgreSQL (RDS, Cloud SQL, etc.)
2. **Proper secrets management** - Use Sealed Secrets or cloud-native solutions
3. **SSL/TLS** - Configure SSL certificates for HTTPS
4. **Image registry** - Push images to Docker Hub, GCR, ECR, etc.
5. **Monitoring** - Add Prometheus, Grafana
6. **Logging** - Centralized logging (ELK, Loki)
7. **Backups** - Regular database backups
8. **High availability** - Multiple replicas, pod disruption budgets
9. **Resource limits** - Tune based on actual usage
10. **CI/CD** - Automate builds and deployments

## Additional Documentation

For detailed deployment instructions, troubleshooting, and advanced configuration, see:

📖 **[k8s/README.md](k8s/README.md)** - Complete deployment guide

## File Structure

```
task-manager/
├── backend/
│   ├── Dockerfile                    # Backend Docker image
│   ├── .dockerignore                 # Docker ignore patterns
│   └── ...
├── frontend/
│   ├── Dockerfile                    # Frontend Docker image
│   ├── nginx.conf                    # Nginx configuration
│   ├── .dockerignore                 # Docker ignore patterns
│   └── ...
└── k8s/                              # Kubernetes manifests
    ├── README.md                     # Detailed deployment guide
    ├── build-images.sh               # Build Docker images
    ├── deploy.sh                     # Deploy all components
    ├── cleanup.sh                    # Clean up deployment
    ├── postgres-secret.yaml
    ├── postgres-configmap.yaml
    ├── postgres-pvc.yaml
    ├── postgres-deployment.yaml
    ├── postgres-service.yaml
    ├── backend-secret.yaml
    ├── backend-configmap.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-configmap.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    └── ingress.yaml
```
