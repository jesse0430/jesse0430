"use client";
import React, { useState, useEffect } from 'react';
import { api, API_CONFIG, buildRelativeApiUrl } from '@/utils/api';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Box,
  Alert,
  Divider 
} from '@mui/material';

export default function ApiExample() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 測試 API 請求
  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 使用工具函數進行 API 請求
      const response = await api.get('test');
      setApiData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 測試直接 fetch
  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = buildRelativeApiUrl('test');
      const response = await fetch(url);
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API 配置範例
      </Typography>

      {/* 當前配置顯示 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            當前 API 配置
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <div>🌐 Backend URL: {API_CONFIG.baseURL}</div>
            <div>🔗 API Prefix: {API_CONFIG.prefix}</div>
            <div>⏱️  Timeout: {API_CONFIG.timeout}ms</div>
            <div>💾 Cache: {API_CONFIG.enableCache ? '啟用' : '停用'}</div>
            <div>📋 Version: {API_CONFIG.version}</div>
            <div>🆔 Client ID: {API_CONFIG.clientId}</div>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* API 測試按鈕 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API 測試
        </Typography>
        <Button 
          variant="contained" 
          onClick={testApiCall}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? '請求中...' : '使用 API 工具函數'}
        </Button>
        <Button 
          variant="outlined" 
          onClick={testDirectFetch}
          disabled={loading}
        >
          {loading ? '請求中...' : '直接 Fetch'}
        </Button>
      </Box>

      {/* 錯誤顯示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 結果顯示 */}
      {apiData && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API 回應
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                backgroundColor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.8rem'
              }}
            >
              {JSON.stringify(apiData, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 使用說明 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            使用說明
          </Typography>
          <Typography variant="body2" paragraph>
            1. <strong>環境變數配置</strong>: 修改 .env.development 或 .env.production 來改變 API 設定
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>API 重寫</strong>: 所有 /api/* 請求會自動重寫到後端 URL
          </Typography>
          <Typography variant="body2" paragraph>
            3. <strong>工具函數</strong>: 使用 api.get(), api.post() 等簡化 API 請求
          </Typography>
          <Typography variant="body2">
            4. <strong>Docker 部署</strong>: 使用 --build-arg 傳入環境變數
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}