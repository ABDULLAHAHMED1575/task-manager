#!/bin/bash

set -e

echo "🚀 Deploying Task Manager to Kubernetes..."

# Deploy PostgreSQL
echo ""
echo "📦 Deploying PostgreSQL..."
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-configmap.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s || {
    echo "❌ PostgreSQL failed to start. Checking logs..."
    kubectl logs -l app=postgres --tail=50
    exit 1
}
echo "✅ PostgreSQL is ready"

# Deploy Backend
echo ""
echo "📦 Deploying Backend..."
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

echo "⏳ Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s || {
    echo "❌ Backend failed to start. Checking logs..."
    kubectl logs -l app=backend --tail=50
    exit 1
}
echo "✅ Backend is ready"

# Run migrations
echo ""
echo "🔄 Running database migrations..."
BACKEND_POD=$(kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $BACKEND_POD -- npx knex migrate:latest || {
    echo "⚠️  Migration failed or no migrations to run"
}

# Deploy Frontend
echo ""
echo "📦 Deploying Frontend..."
kubectl apply -f k8s/frontend-configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

echo "⏳ Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s || {
    echo "❌ Frontend failed to start. Checking logs..."
    kubectl logs -l app=frontend --tail=50
    exit 1
}
echo "✅ Frontend is ready"

# Deploy Ingress
echo ""
echo "📦 Deploying Ingress..."
kubectl apply -f k8s/ingress.yaml

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Resource Status:"
kubectl get pods
echo ""
kubectl get services
echo ""
kubectl get ingress

echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://taskmanager.local"
echo "   Backend API: http://taskmanager.local/api"
echo ""
echo "💡 Don't forget to add to /etc/hosts:"
echo "   $(minikube ip) taskmanager.local"
