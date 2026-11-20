import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patronsReducer from './slices/patronsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patrons: patronsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
