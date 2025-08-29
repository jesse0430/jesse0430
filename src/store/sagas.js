import { put, takeLatest, delay } from 'redux-saga/effects';
import { incrementFailed, incrementRequested, incrementSucceeded } from './counterSlice';

function* handleIncrement() {
  try {
    yield delay(500);
    yield put(incrementSucceeded(1));
  } catch (e) {
    yield put(incrementFailed());
  }
}

export function* rootSaga() {
  yield takeLatest(incrementRequested.type, handleIncrement);
}

