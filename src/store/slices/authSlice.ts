import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiService, RequestOtpResponse, VerifyOtpResponse } from '@/services/api';
import { StorageService, StoredAuthData } from '@/services/storage';

export interface AuthState {
  mobile: string;
  otpRequested: boolean;
  otpMessage: string;
  uid: number | null;
  user_group: number | null;
  token: string | null;
  executive_patrons_url: string | null;
  executive_collection_url: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
}

const initialState: AuthState = {
  mobile: '',
  otpRequested: false,
  otpMessage: '',
  uid: null,
  user_group: null,
  token: null,
  executive_patrons_url: null,
  executive_collection_url: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  isVerifying: false,
  error: null,
};

export const requestOtpThunk = createAsyncThunk<
  RequestOtpResponse,
  string,
  { rejectValue: string }
>('auth/requestOtp', async (mobile, { rejectWithValue }) => {
  try {
    const res = await ApiService.requestOtp(mobile);
    if (!res.success) {
      return rejectWithValue(res.message || 'Failed to request OTP');
    }
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const verifyOtpThunk = createAsyncThunk<
  VerifyOtpResponse & { mobile: string },
  { mobile: string; otp: string },
  { rejectValue: string }
>('auth/verifyOtp', async ({ mobile, otp }, { rejectWithValue }) => {
  try {
    const res = await ApiService.verifyOtp(mobile, otp);
    if (!res.success || !res.token) {
      return rejectWithValue(res.message || 'Invalid or expired OTP');
    }

    // Persist to storage
    await StorageService.saveAuthData({
      token: res.token,
      uid: res.uid ?? 0,
      user_group: res.user_group ?? 0,
      mobile,
      executive_patrons_url: res.executive_patrons_url,
      executive_collection_url: res.executive_collection_url,
    });

    return { ...res, mobile };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to verify OTP');
  }
});

export const loadStoredAuthThunk = createAsyncThunk<StoredAuthData | null>(
  'auth/loadStoredAuth',
  async () => {
    return await StorageService.getAuthData();
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await StorageService.clearAuthData();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpRequested = false;
      state.otpMessage = '';
      state.error = null;
    },
    setMobile: (state, action: PayloadAction<string>) => {
      state.mobile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Request OTP
    builder.addCase(requestOtpThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(requestOtpThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpRequested = true;
      state.otpMessage = action.payload.message || 'OTP requested.';
      if (action.payload.mobile) {
        state.mobile = action.payload.mobile;
      }
    });
    builder.addCase(requestOtpThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to request OTP';
    });

    // Verify OTP
    builder.addCase(verifyOtpThunk.pending, (state) => {
      state.isVerifying = true;
      state.error = null;
    });
    builder.addCase(verifyOtpThunk.fulfilled, (state, action) => {
      state.isVerifying = false;
      state.isAuthenticated = true;
      state.token = action.payload.token ?? null;
      state.uid = action.payload.uid ?? null;
      state.user_group = action.payload.user_group ?? null;
      state.executive_patrons_url = action.payload.executive_patrons_url ?? null;
      state.executive_collection_url = action.payload.executive_collection_url ?? null;
      state.mobile = action.payload.mobile;
    });
    builder.addCase(verifyOtpThunk.rejected, (state, action) => {
      state.isVerifying = false;
      state.error = action.payload || 'Failed to verify OTP';
    });

    // Load Stored Auth
    builder.addCase(loadStoredAuthThunk.fulfilled, (state, action) => {
      state.isInitialized = true;
      if (action.payload && action.payload.token) {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.uid = action.payload.uid;
        state.user_group = action.payload.user_group;
        state.mobile = action.payload.mobile;
        state.executive_patrons_url = action.payload.executive_patrons_url ?? null;
        state.executive_collection_url = action.payload.executive_collection_url ?? null;
      }
    });
    builder.addCase(loadStoredAuthThunk.rejected, (state) => {
      state.isInitialized = true;
    });

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.uid = null;
      state.user_group = null;
      state.otpRequested = false;
      state.otpMessage = '';
      state.executive_patrons_url = null;
      state.executive_collection_url = null;
      state.error = null;
    });
  },
});

export const { clearError, resetOtpState, setMobile } = authSlice.actions;
export default authSlice.reducer;
