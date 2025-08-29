import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  isIncrementing: false,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    incrementRequested(state) {
      state.isIncrementing = true;
    },
    incrementSucceeded(state, action) {
      state.value += action.payload;
      state.isIncrementing = false;
    },
    incrementFailed(state) {
      state.isIncrementing = false;
    },
  },
});

export const { incrementRequested, incrementSucceeded, incrementFailed } = counterSlice.actions;

export default counterSlice.reducer;

