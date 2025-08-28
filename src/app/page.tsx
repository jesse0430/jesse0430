"use client";
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { incrementRequested } from '@/store/counterSlice';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  const count = useAppSelector((s) => s.counter.value);
  const isIncrementing = useAppSelector((s) => s.counter.isIncrementing);
  const dispatch = useAppDispatch();

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Next.js + MUI + Redux Toolkit + Saga
      </Typography>
      <Typography variant="h6">Count: {count}</Typography>
      <Button
        sx={{ mt: 2 }}
        variant="contained"
        onClick={() => dispatch(incrementRequested())}
        disabled={isIncrementing}
      >
        {isIncrementing ? 'Incrementing…' : 'Increment (Saga)'}
      </Button>
    </Container>
  );
}

