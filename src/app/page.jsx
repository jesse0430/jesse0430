"use client";
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { incrementRequested } from '@/store/counterSlice';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function HomePage() {
  const count = useAppSelector((s) => s.counter.value);
  const isIncrementing = useAppSelector((s) => s.counter.isIncrementing);
  const dispatch = useAppDispatch();

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Next.js + MUI + Redux Toolkit + Saga
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            環境變數配置
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || '未設定'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            API Prefix: {process.env.NEXT_PUBLIC_API_PREFIX || '/api'}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Count: {count}</Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => dispatch(incrementRequested())}
          disabled={isIncrementing}
        >
          {isIncrementing ? 'Incrementing…' : 'Increment (Saga)'}
        </Button>
      </Box>
    </Container>
  );
}

