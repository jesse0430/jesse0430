# Next.js App Router + MUI + Redux Toolkit + Redux-Saga (JavaScript)

## 🚀 功能特色

- ✅ Next.js App Router
- ✅ Material-UI (MUI)
- ✅ Redux Toolkit + Redux-Saga
- ✅ 彈性 API 配置
- ✅ 多環境支援
- ✅ Docker 容器化

## 📁 環境變數配置

### 主要配置變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `BACKEND_URL` | 後端 API 基礎 URL | `http://localhost:4000` |
| `API_PREFIX` | API 路徑前綴 | `/api` |
| `API_TIMEOUT` | API 請求超時時間 (ms) | `5000` |
| `ENABLE_API_CACHE` | 是否啟用 API 快取 | `false` |
| `API_VERSION` | API 版本號 | `1.0` |
| `CLIENT_ID` | 客戶端識別碼 | `nextjs-app` |

### 可選配置變數

| 變數名稱 | 說明 |
|---------|------|
| `API_V2_URL` | 第二版 API URL |
| `WS_URL` | WebSocket URL |

## 🔧 環境檔案

### `.env.development` (開發環境)
```bash
BACKEND_URL=http://localhost:4000
API_PREFIX=/api
API_TIMEOUT=5000
ENABLE_API_CACHE=false
```

### `.env.production` (生產環境)
```bash
BACKEND_URL=https://api.production.com
API_PREFIX=/api
API_TIMEOUT=10000
ENABLE_API_CACHE=true
```

### `.env.local` (本地覆蓋)
```bash
# 可以覆蓋任何設定
BACKEND_URL=http://localhost:3001
API_PREFIX=/api/v1
```

## 🔄 API 重寫規則

`next.config.js` 會根據環境變數自動配置 API 重寫：

```javascript
// 主要 API 重寫
/api/* → ${BACKEND_URL}/*

// 可選：多個 API 端點
/api/v2/* → ${API_V2_URL}/*
/ws/* → ${WS_URL}/*
```

## 🐳 Docker 部署

### 建置映像檔
```bash
# 基本建置
docker build -t nextjs-app:latest .

# 指定後端 URL
docker build -t nextjs-app:latest \
  --build-arg BACKEND_URL=https://api.example.com \
  --build-arg API_PREFIX=/api/v1 \
  .
```

### 執行容器
```bash
docker run -p 3000:3000 --name nextjs-app nextjs-app:latest
```

### Docker Compose 範例
```yaml
version: '3.8'
services:
  nextjs-app:
    build:
      context: .
      args:
        BACKEND_URL: http://backend:4000
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## 🛠️ 本地開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build

# 生產模式
npm run start
```

## 📡 API 使用範例

```javascript
import { api, buildRelativeApiUrl } from '@/utils/api';

// 使用工具函數
const data = await api.get('users');
const user = await api.post('users', { name: 'John' });

// 或直接使用 fetch
const response = await fetch(buildRelativeApiUrl('users'));
```

## 🔍 除錯

啟動時會顯示當前配置：
```
🔧 Next.js 配置載入中...
📡 環境: development
🌐 Backend URL: http://localhost:4000
🔗 API Prefix: /api
⏱️  API Timeout: 5000ms
💾 API Cache: 停用
```
