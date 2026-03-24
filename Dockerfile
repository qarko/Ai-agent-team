FROM node:20-alpine

WORKDIR /app

# Frontend build
COPY frontend/package.json frontend/
RUN cd frontend && npm install

COPY frontend/ frontend/
RUN cd frontend && npx vite build

# Backend setup
COPY backend/package.json backend/
RUN cd backend && npm install

COPY backend/ backend/

# Copy shared state and scripts
COPY shared/ shared/
COPY scripts/ scripts/
RUN chmod +x scripts/*.sh

# Install jq for scripts
RUN apk add --no-cache jq bash tmux

ENV BASE_DIR=/app
EXPOSE 3001

CMD ["node", "backend/src/index.js"]
