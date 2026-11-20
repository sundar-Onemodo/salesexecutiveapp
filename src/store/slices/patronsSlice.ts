import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApiService,
  CollectionPayload,
  CollectionResponse,
  Patron,
  PatronsResponse,
} from '@/services/api';
import { StorageService } from '@/services/storage';
import { RootState } from '../index';

export interface RecordedCollection extends CollectionResponse {
  patron_id: string;
  patron_name?: string;
  transaction_mode: string;
  timestamp: string;
}

export interface PatronsState {
  patrons: Patron[];
  currency: string;
  isLoading: boolean;
  isSubmittingCollection: boolean;
  error: string | null;
  lastCollectionSuccess: CollectionResponse | null;
  recentCollections: RecordedCollection[];
}

const initialState: PatronsState = {
  patrons: [],
  currency: 'INR',
  isLoading: false,
  isSubmittingCollection: false,
  error: null,
  lastCollectionSuccess: null,
  recentCollections: [],
};

export const fetchPatronsThunk = createAsyncThunk<
  PatronsResponse,
  void,
  { state: RootState; rejectValue: string }
>('patrons/fetchPatrons', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.token) {
    return rejectWithValue('No auth token available');
  }

  try {
    const res = await ApiService.getPatrons(auth.token, auth.executive_patrons_url ?? undefined);
    if (!res.success) {
      return rejectWithValue(res.message || 'Failed to fetch patrons');
    }
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Error fetching patrons');
  }
});

export const submitCollectionThunk = createAsyncThunk<
  RecordedCollection,
  CollectionPayload & { patron_name?: string },
  { state: RootState; rejectValue: string }
>('patrons/submitCollection', async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.token) {
    return rejectWithValue('No auth token available');
  }

  try {
    const res = await ApiService.postCollection(
      auth.token,
      {
        patron_id: payload.patron_id,
        amount: payload.amount,
        transaction_mode: payload.transaction_mode,
      },
      auth.executive_collection_url ?? undefined
    );

    if (!res.success) {
      return rejectWithValue(res.message || 'Failed to record collection');
    }

    const recorded: RecordedCollection = {
      ...res,
      patron_id: payload.patron_id,
      patron_name: payload.patron_name,
      transaction_mode: payload.transaction_mode,
      timestamp: new Date().toISOString(),
    };

    return recorded;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Network error recording collection');
  }
});

export const loadCollectionHistoryThunk = createAsyncThunk(
  'patrons/loadCollectionHistory',
  async () => {
    return await StorageService.getCollections();
  }
);

export const patronsSlice = createSlice({
  name: 'patrons',
  initialState,
  reducers: {
    clearPatronsError: (state) => {
      state.error = null;
    },
    clearLastCollection: (state) => {
      state.lastCollectionSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch patrons
    builder.addCase(fetchPatronsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPatronsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.patrons = action.payload.patrons || [];
      state.currency = action.payload.currency || 'INR';
    });
    builder.addCase(fetchPatronsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch patrons';
    });

    // Submit collection
    builder.addCase(submitCollectionThunk.pending, (state) => {
      state.isSubmittingCollection = true;
      state.error = null;
      state.lastCollectionSuccess = null;
    });
    builder.addCase(submitCollectionThunk.fulfilled, (state, action) => {
      state.isSubmittingCollection = false;
      state.lastCollectionSuccess = action.payload;
      state.recentCollections = [action.payload, ...state.recentCollections];
      // update storage
      StorageService.saveCollections(state.recentCollections);

      // Optimistically update patron's used credit and available credit if found
      const patronIndex = state.patrons.findIndex((p) => p.id === action.payload.patron_id);
      if (patronIndex >= 0) {
        const patron = state.patrons[patronIndex];
        const addedAmount = parseFloat(action.payload.amount || '0');
        const currentUsed = parseFloat(patron.used_credit || '0');
        const limit = parseFloat(patron.credit_limit || '0');

        // Payment collection decreases used credit and increases available credit
        const newUsed = Math.max(0, currentUsed - addedAmount);
        const newAvailable = Math.min(limit, limit - newUsed);

        state.patrons[patronIndex] = {
          ...patron,
          used_credit: newUsed.toFixed(2),
          available_credit: newAvailable.toFixed(2),
        };
      }
    });
    builder.addCase(submitCollectionThunk.rejected, (state, action) => {
      state.isSubmittingCollection = false;
      state.error = action.payload || 'Failed to submit collection';
    });

    // Load History
    builder.addCase(loadCollectionHistoryThunk.fulfilled, (state, action) => {
      if (action.payload) {
        state.recentCollections = action.payload;
      }
    });
  },
});

export const { clearPatronsError, clearLastCollection } = patronsSlice.actions;
export default patronsSlice.reducer;
