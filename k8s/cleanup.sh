#!/bin/bash

set -e

echo "🗑️  Cleaning up Task Manager deployment..."

echo "Deleting Ingress..."
kubectl delete -f k8s/ingress.yaml --ignore-not-found=true

echo "Deleting Frontend resources..."
kubectl delete -f k8s/frontend-service.yaml --ignore-not-found=true
kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/frontend-configmap.yaml --ignore-not-found=true

echo "Deleting Backend resources..."
kubectl delete -f k8s/backend-service.yaml --ignore-not-found=true
kubectl delete -f k8s/backend-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/backend-configmap.yaml --ignore-not-found=true
kubectl delete -f k8s/backend-secret.yaml --ignore-not-found=true

echo "Deleting PostgreSQL resources..."
kubectl delete -f k8s/postgres-service.yaml --ignore-not-found=true
kubectl delete -f k8s/postgres-deployment.yaml --ignore-not-found=true
kubectl delete -f k8s/postgres-configmap.yaml --ignore-not-found=true
kubectl delete -f k8s/postgres-secret.yaml --ignore-not-found=true

echo ""
read -p "Do you want to delete the PostgreSQL data (PVC)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Deleting PVC..."
    kubectl delete -f k8s/postgres-pvc.yaml --ignore-not-found=true
else
    echo "Keeping PVC for data persistence"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Remaining resources:"
kubectl get all
