/**
 * Next.js 配置檔案
 * 支援多種環境變數來配置 API URL
 */

// 環境變數配置
const ENV_CONFIG = {
  // 開發環境
  development: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
    API_PREFIX: process.env.API_PREFIX || '/api',
    API_TIMEOUT: process.env.API_TIMEOUT || '5000',
    ENABLE_API_CACHE: process.env.ENABLE_API_CACHE === 'true',
  },
  // 生產環境
  production: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://api.production.com',
    API_PREFIX: process.env.API_PREFIX || '/api',
    API_TIMEOUT: process.env.API_TIMEOUT || '10000',
    ENABLE_API_CACHE: process.env.ENABLE_API_CACHE === 'true',
  },
  // 測試環境
  test: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://api.staging.com',
    API_PREFIX: process.env.API_PREFIX || '/api',
    API_TIMEOUT: process.env.API_TIMEOUT || '5000',
    ENABLE_API_CACHE: process.env.ENABLE_API_CACHE === 'false',
  }
};

// 根據環境獲取配置
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENV_CONFIG[env] || ENV_CONFIG.development;
};

const config = getConfig();

console.log('🔧 Next.js 配置載入中...');
console.log(`📡 環境: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Backend URL: ${config.BACKEND_URL}`);
console.log(`🔗 API Prefix: ${config.API_PREFIX}`);
console.log(`⏱️  API Timeout: ${config.API_TIMEOUT}ms`);
console.log(`💾 API Cache: ${config.ENABLE_API_CACHE ? '啟用' : '停用'}`);

const nextConfig = {
  reactStrictMode: true,
  
  // 環境變數配置
  env: {
    BACKEND_URL: config.BACKEND_URL,
    API_PREFIX: config.API_PREFIX,
    API_TIMEOUT: config.API_TIMEOUT,
    ENABLE_API_CACHE: config.ENABLE_API_CACHE.toString(),
  },

  // API 重寫規則
  async rewrites() {
    const rewrites = [
      // 主要 API 重寫
      {
        source: `${config.API_PREFIX}/:path*`,
        destination: `${config.BACKEND_URL}/:path*`,
      },
    ];

    // 可選：多個 API 端點支援
    if (process.env.API_V2_URL) {
      rewrites.push({
        source: '/api/v2/:path*',
        destination: `${process.env.API_V2_URL}/:path*`,
      });
    }

    // 可選：WebSocket 代理
    if (process.env.WS_URL) {
      rewrites.push({
        source: '/ws/:path*',
        destination: `${process.env.WS_URL}/:path*`,
      });
    }

    return rewrites;
  },

  // 可選：自定義 headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-API-Version',
            value: process.env.API_VERSION || '1.0',
          },
          {
            key: 'X-Client-ID',
            value: process.env.CLIENT_ID || 'nextjs-app',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
