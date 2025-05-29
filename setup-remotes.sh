#!/bin/bash

# Setup script for multiple git remotes (GitHub and GitLab)
# Usage: ./setup-remotes.sh <github-repo-url> <gitlab-repo-url>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <github-repo-url> <gitlab-repo-url>"
    echo "Example: $0 git@github.com:username/portfolio.git git@gitlab.com:username/portfolio.git"
    exit 1
fi

GITHUB_REPO=$1
GITLAB_REPO=$2

echo "Setting up git remotes..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Add GitHub remote
echo "Adding GitHub remote..."
git remote add github "$GITHUB_REPO"

# Add GitLab remote
echo "Adding GitLab remote..."
git remote add gitlab "$GITLAB_REPO"

# Set up origin to push to both
echo "Setting up origin to push to both remotes..."
git remote add origin "$GITHUB_REPO"
git remote set-url --add --push origin "$GITHUB_REPO"
git remote set-url --add --push origin "$GITLAB_REPO"

echo "Git remotes configured successfully!"
echo ""
echo "Available remotes:"
git remote -v
echo ""
echo "To push to both repositories:"
echo "  git push origin main"
echo ""
echo "To push to individual repositories:"
echo "  git push github main"
echo "  git push gitlab main" 