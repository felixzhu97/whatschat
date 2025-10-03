# WhatsChat 部署指南

## 📋 概述

本指南提供 WhatsChat 项目的多种部署方案，包括 Docker、Kubernetes 和生产环境配置。

---

## 🐳 Docker 部署

### 1. 构建镜像

#### 后端镜像

```dockerfile
# apps/server/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

#### 前端镜像

```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: whatschat
      POSTGRES_USER: whatschat
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  server:
    build: ./apps/server
    environment:
      DATABASE_URL: postgresql://whatschat:password@postgres:5432/whatschat
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-super-secret-jwt-key
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  web:
    build: ./apps/web
    ports:
      - "3000:80"
    depends_on:
      - server

volumes:
  postgres_data:
  redis_data:
```

### 3. 部署命令

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## ☸️ Kubernetes 部署

### 1. 命名空间

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: whatschat
```

### 2. 配置映射

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: whatschat-config
  namespace: whatschat
data:
  DATABASE_URL: "postgresql://whatschat:password@postgres:5432/whatschat"
  REDIS_URL: "redis://redis:6379"
  PORT: "3001"
```

### 3. 密钥

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: whatschat-secrets
  namespace: whatschat
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  JWT_REFRESH_SECRET: <base64-encoded-refresh-secret>
```

### 4. 数据库部署

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: whatschat
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          env:
            - name: POSTGRES_DB
              value: whatschat
            - name: POSTGRES_USER
              value: whatschat
            - name: POSTGRES_PASSWORD
              value: password
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: whatschat
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: whatschat
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### 5. 应用部署

```yaml
# k8s/server.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatschat-server
  namespace: whatschat
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whatschat-server
  template:
    metadata:
      labels:
        app: whatschat-server
    spec:
      containers:
        - name: server
          image: whatschat/server:latest
          ports:
            - containerPort: 3001
          envFrom:
            - configMapRef:
                name: whatschat-config
            - secretRef:
                name: whatschat-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: whatschat-server
  namespace: whatschat
spec:
  selector:
    app: whatschat-server
  ports:
    - port: 3001
      targetPort: 3001
  type: ClusterIP
```

### 6. Ingress 配置

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: whatschat-ingress
  namespace: whatschat
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.whatschat.com
        - app.whatschat.com
      secretName: whatschat-tls
  rules:
    - host: api.whatschat.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: whatschat-server
                port:
                  number: 3001
    - host: app.whatschat.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: whatschat-web
                port:
                  number: 80
```

---

## 🌐 生产环境配置

### 1. 环境变量

```bash
# 生产环境变量
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# 数据库配置
DATABASE_URL=postgresql://user:password@db-host:5432/whatschat
REDIS_URL=redis://redis-host:6379

# JWT配置
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-refresh-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS配置
CORS_ORIGIN=https://app.whatschat.com

# 文件上传
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@whatschat.com
SMTP_PASS=<app-password>

# WebRTC配置
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=turn:turn.whatschat.com:3478
TURN_USERNAME=<turn-username>
TURN_PASSWORD=<turn-password>

# 监控配置
PROMETHEUS_PORT=9090
LOG_LEVEL=info
```

### 2. Nginx 配置

```nginx
# nginx.conf
upstream backend {
    server whatschat-server:3001;
}

upstream frontend {
    server whatschat-web:80;
}

server {
    listen 80;
    server_name api.whatschat.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.whatschat.com;

    ssl_certificate /etc/ssl/certs/whatschat.crt;
    ssl_certificate_key /etc/ssl/private/whatschat.key;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name app.whatschat.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.whatschat.com;

    ssl_certificate /etc/ssl/certs/whatschat.crt;
    ssl_certificate_key /etc/ssl/private/whatschat.key;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL 证书

```bash
# 使用 Let's Encrypt
sudo apt install certbot nginx
sudo certbot --nginx -d api.whatschat.com -d app.whatschat.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 监控和日志

### 1. Prometheus 配置

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "whatschat-server"
    static_configs:
      - targets: ["whatschat-server:9090"]
    metrics_path: "/metrics"
    scrape_interval: 5s
```

### 2. Grafana 仪表板

```json
{
  "dashboard": {
    "title": "WhatsChat Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### 3. 日志配置

```yaml
# k8s/fluentd.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  template:
    spec:
      containers:
        - name: fluentd
          image: fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch
          env:
            - name: FLUENT_ELASTICSEARCH_HOST
              value: "elasticsearch.logging.svc.cluster.local"
            - name: FLUENT_ELASTICSEARCH_PORT
              value: "9200"
```

---

## 🔄 CI/CD 流水线

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          kubectl apply -f k8s/
```

### 2. Docker Registry

```bash
# 构建并推送镜像
docker build -t whatschat/server:latest ./apps/server
docker tag whatschat/server:latest registry.whatschat.com/whatschat/server:latest
docker push registry.whatschat.com/whatschat/server:latest
```

---

## 🚀 部署检查清单

### 部署前检查

- [ ] 环境变量配置正确
- [ ] 数据库连接正常
- [ ] Redis连接正常
- [ ] SSL证书有效
- [ ] 域名解析正确
- [ ] 防火墙规则配置
- [ ] 监控系统就绪
- [ ] 备份策略实施

### 部署后验证

- [ ] 健康检查通过
- [ ] API接口正常
- [ ] WebSocket连接正常
- [ ] 文件上传功能正常
- [ ] 邮件发送功能正常
- [ ] 监控指标正常
- [ ] 日志记录正常
- [ ] 性能测试通过

---

## 🔧 故障排除

### 常见问题

1. **数据库连接失败**

   ```bash
   # 检查数据库状态
   kubectl get pods -n whatschat
   kubectl logs postgres-xxx -n whatschat
   ```

2. **Redis连接失败**

   ```bash
   # 检查Redis状态
   kubectl get pods -n whatschat
   kubectl exec -it redis-xxx -n whatschat -- redis-cli ping
   ```

3. **SSL证书问题**
   ```bash
   # 检查证书状态
   kubectl get certificates -n whatschat
   kubectl describe certificate whatschat-tls -n whatschat
   ```

### 性能优化

1. **数据库优化**
   - 添加索引
   - 连接池配置
   - 查询优化

2. **缓存优化**
   - Redis集群
   - 缓存策略
   - 过期时间设置

3. **负载均衡**
   - 水平扩展
   - 健康检查
   - 会话保持

---

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Grafana 官方文档](https://grafana.com/docs/)

---

_本文档随部署方案更新持续维护，最后更新时间：2024年1月_
