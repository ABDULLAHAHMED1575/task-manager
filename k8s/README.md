# Task Manager - Kubernetes Deployment Guide

This guide will help you deploy the Task Manager application on Kubernetes using Minikube.

## Prerequisites

- Docker installed
- Minikube installed
- kubectl installed

## Architecture

The application consists of:
- **Frontend**: React application served via Nginx
- **Backend**: Node.js/Express API server
- **Database**: PostgreSQL 16
- **Ingress**: Nginx Ingress Controller for routing

## Quick Start

### 1. Start Minikube

```bash
# Start minikube with enough resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable ingress addon
minikube addons enable ingress

# Use minikube's docker daemon (important!)
eval $(minikube docker-env)
```

### 2. Build Docker Images

Build both frontend and backend images in Minikube's Docker environment:

```bash
# Build backend image
cd backend
docker build -t taskmanager-backend:latest .

# Build frontend image
cd ../frontend
docker build -t taskmanager-frontend:latest .

cd ..
```

### 3. Update Configuration (Optional)

Before deploying, you may want to update:

**k8s/backend-secret.yaml**:
- `SECRET_SESSION_KEY`: Change to a secure random string
- Database credentials (if using external DB)

**k8s/backend-configmap.yaml**:
- `CORSORIGIN`: Update to match your ingress host

**k8s/frontend-configmap.yaml**:
- `VITE_API_URL`: Update to match your ingress host + /api

### 4. Deploy to Kubernetes

Apply all manifests in order:

```bash
# Deploy PostgreSQL
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-configmap.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

# Deploy Backend
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

# Deploy Frontend
kubectl apply -f k8s/frontend-configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml
```

Or use the deployment script:

```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

### 5. Run Database Migrations

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -it $BACKEND_POD -- npm run migrate
# Or if you have a specific migration command
kubectl exec -it $BACKEND_POD -- npx knex migrate:latest
```

### 6. Access the Application

```bash
# Get minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
echo "$(minikube ip) taskmanager.local" | sudo tee -a /etc/hosts

# Access the application
# Frontend: http://taskmanager.local
# Backend API: http://taskmanager.local/api
```

Alternatively, use port forwarding:

```bash
# Port forward frontend
kubectl port-forward service/frontend-service 8080:80

# Access at http://localhost:8080
```

## Useful Commands

### Check Pod Status
```bash
kubectl get pods
kubectl get pods -l app=backend
kubectl get pods -l app=frontend
kubectl get pods -l app=postgres
```

### View Logs
```bash
# Backend logs
kubectl logs -l app=backend --tail=100 -f

# Frontend logs
kubectl logs -l app=frontend --tail=100 -f

# PostgreSQL logs
kubectl logs -l app=postgres --tail=100 -f
```

### Check Services
```bash
kubectl get services
kubectl get ingress
```

### Describe Resources
```bash
kubectl describe deployment backend-deployment
kubectl describe service backend-service
kubectl describe ingress taskmanager-ingress
```

### Scale Deployments
```bash
kubectl scale deployment backend-deployment --replicas=3
kubectl scale deployment frontend-deployment --replicas=3
```

### Delete All Resources
```bash
kubectl delete -f k8s/ingress.yaml
kubectl delete -f k8s/frontend-service.yaml
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/frontend-configmap.yaml
kubectl delete -f k8s/backend-service.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/backend-configmap.yaml
kubectl delete -f k8s/backend-secret.yaml
kubectl delete -f k8s/postgres-service.yaml
kubectl delete -f k8s/postgres-deployment.yaml
kubectl delete -f k8s/postgres-pvc.yaml
kubectl delete -f k8s/postgres-configmap.yaml
kubectl delete -f k8s/postgres-secret.yaml
```

Or use:
```bash
kubectl delete -f k8s/
```

## Troubleshooting

### Pods not starting
```bash
# Check pod status
kubectl get pods

# Describe pod to see events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Image pull errors
Make sure you're using Minikube's Docker daemon:
```bash
eval $(minikube docker-env)
# Then rebuild images
```

### Database connection issues
```bash
# Check if postgres is running
kubectl get pods -l app=postgres

# Check postgres logs
kubectl logs -l app=postgres

# Test connection from backend pod
BACKEND_POD=$(kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $BACKEND_POD -- sh
# Inside the pod:
# nc -zv postgres-service 5432
```

### Ingress not working
```bash
# Check ingress status
kubectl get ingress

# Check ingress controller
kubectl get pods -n ingress-nginx

# Verify /etc/hosts entry
cat /etc/hosts | grep taskmanager.local
```

### Backend can't connect to database
Check the DATABASE_URL in backend-secret.yaml matches the postgres service and credentials.

### CORS errors
Update CORSORIGIN in k8s/backend-configmap.yaml to match your ingress host.

## Production Considerations

For production deployment:

1. **Secrets Management**: Use proper secret management (e.g., Sealed Secrets, External Secrets Operator, or cloud provider solutions)
2. **Persistent Storage**: Configure proper StorageClass for your cloud provider
3. **Resource Limits**: Adjust CPU/memory limits based on your workload
4. **High Availability**: Increase replica counts and add pod disruption budgets
5. **Monitoring**: Add Prometheus, Grafana for monitoring
6. **Logging**: Set up centralized logging (ELK, Loki, etc.)
7. **SSL/TLS**: Configure SSL certificates for HTTPS
8. **Database Backups**: Set up regular database backups
9. **Image Registry**: Push images to a proper registry (Docker Hub, GCR, ECR, etc.)
10. **CI/CD**: Automate builds and deployments

## Environment Variables

### Backend
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `NODE_ENV`: Environment (development/production)
- `BCRYPT_ROUNDS`: Password hashing rounds
- `CORSORIGIN`: Allowed CORS origin
- `SECRET_SESSION_KEY`: Session secret key
- `DATABASE_URL`: PostgreSQL connection string

### Frontend
- `VITE_API_URL`: Backend API URL

### PostgreSQL
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
