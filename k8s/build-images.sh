#!/bin/bash

set -e

echo "🏗️  Building Docker images for Minikube..."

# Make sure we're using minikube's docker daemon
echo "Configuring Docker to use Minikube's daemon..."
eval $(minikube docker-env)

# Build backend image
echo ""
echo "📦 Building backend image..."
cd backend
docker build -t taskmanager-backend:latest .
cd ..

# Build frontend image
echo ""
echo "📦 Building frontend image..."
cd frontend
docker build -t taskmanager-frontend:latest .
cd ..

echo ""
echo "✅ Images built successfully!"
echo ""
echo "📋 Available images:"
docker images | grep taskmanager

echo ""
echo "💡 Next steps:"
echo "   Run: ./k8s/deploy.sh"
