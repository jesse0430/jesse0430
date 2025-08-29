/**
 * API 配置和請求工具
 */

// 從環境變數獲取 API 配置
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000',
  prefix: process.env.NEXT_PUBLIC_API_PREFIX || process.env.API_PREFIX || '/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || process.env.API_TIMEOUT || '5000'),
  enableCache: process.env.NEXT_PUBLIC_ENABLE_API_CACHE === 'true' || process.env.ENABLE_API_CACHE === 'true',
  version: process.env.NEXT_PUBLIC_API_VERSION || process.env.API_VERSION || '1.0',
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || process.env.CLIENT_ID || 'nextjs-app',
};

// 構建完整的 API URL
export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.baseURL}/${cleanEndpoint}`;
};

// 構建相對 API URL (會通過 Next.js rewrites 處理)
export const buildRelativeApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.prefix}/${cleanEndpoint}`;
};

// 通用 API 請求函數
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildRelativeApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': API_CONFIG.version,
      'X-Client-ID': API_CONFIG.clientId,
      ...options.headers,
    },
    timeout: API_CONFIG.timeout,
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...finalOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
};

// 常用 API 方法
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// 導出配置供其他地方使用
export { API_CONFIG };