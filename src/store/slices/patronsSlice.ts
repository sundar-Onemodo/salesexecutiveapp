import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApiService,
  CollectionPayload,
  CollectionResponse,
  ExecutiveCollectionItem,
  ExecutiveCollectionSummaryResponse,
  ExecutiveCollectionsResponse,
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

  // Real Server Collection APIs
  executiveCollections: ExecutiveCollectionItem[];
  isLoadingCollections: boolean;
  collectionsError: string | null;

  collectionSummary: ExecutiveCollectionSummaryResponse | null;
  isLoadingSummary: boolean;
  summaryError: string | null;
}

const initialState: PatronsState = {
  patrons: [],
  currency: 'INR',
  isLoading: false,
  isSubmittingCollection: false,
  error: null,
  lastCollectionSuccess: null,
  recentCollections: [],

  executiveCollections: [],
  isLoadingCollections: false,
  collectionsError: null,

  collectionSummary: null,
  isLoadingSummary: false,
  summaryError: null,
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

// 5. Thunk: Fetch Executive Collections List (GET /executivecollections?from_date=&to_date=)
export const fetchExecutiveCollectionsThunk = createAsyncThunk<
  ExecutiveCollectionsResponse,
  { fromDate: string; toDate: string },
  { state: RootState; rejectValue: string }
>(
  'patrons/fetchExecutiveCollections',
  async ({ fromDate, toDate }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.token) {
      return rejectWithValue('No auth token available');
    }

    try {
      const res = await ApiService.getExecutiveCollections(auth.token, fromDate, toDate);
      if (!res.success) {
        return rejectWithValue(res.message || 'Failed to fetch executive collections');
      }
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error fetching collections');
    }
  }
);

// 6. Thunk: Fetch Executive Collection Summary Chart Data (GET /executivecollectionsummary?from_date=&to_date=)
export const fetchCollectionSummaryThunk = createAsyncThunk<
  ExecutiveCollectionSummaryResponse,
  { fromDate: string; toDate: string },
  { state: RootState; rejectValue: string }
>(
  'patrons/fetchCollectionSummary',
  async ({ fromDate, toDate }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.token) {
      return rejectWithValue('No auth token available');
    }

    try {
      const res = await ApiService.getExecutiveCollectionSummary(auth.token, fromDate, toDate);
      if (!res.success) {
        return rejectWithValue(res.message || 'Failed to fetch collection summary');
      }
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error fetching summary');
    }
  }
);

export const patronsSlice = createSlice({
  name: 'patrons',
  initialState,
  reducers: {
    clearPatronsError: (state) => {
      state.error = null;
      state.collectionsError = null;
      state.summaryError = null;
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
      StorageService.saveCollections(state.recentCollections);

      // Optimistically update patron's used credit and available credit if found
      const patronIndex = state.patrons.findIndex((p) => p.id === action.payload.patron_id);
      if (patronIndex >= 0) {
        const patron = state.patrons[patronIndex];
        const addedAmount = parseFloat(action.payload.amount || '0');
        const currentUsed = parseFloat(patron.used_credit || '0');
        const limit = parseFloat(patron.credit_limit || '0');

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

    // Executive Collections List
    builder.addCase(fetchExecutiveCollectionsThunk.pending, (state) => {
      state.isLoadingCollections = true;
      state.collectionsError = null;
    });
    builder.addCase(fetchExecutiveCollectionsThunk.fulfilled, (state, action) => {
      state.isLoadingCollections = false;
      state.executiveCollections = action.payload.collections || [];
    });
    builder.addCase(fetchExecutiveCollectionsThunk.rejected, (state, action) => {
      state.isLoadingCollections = false;
      state.collectionsError = action.payload || 'Failed to load collections';
    });

    // Executive Collection Summary (Chart Data)
    builder.addCase(fetchCollectionSummaryThunk.pending, (state) => {
      state.isLoadingSummary = true;
      state.summaryError = null;
    });
    builder.addCase(fetchCollectionSummaryThunk.fulfilled, (state, action) => {
      state.isLoadingSummary = false;
      state.collectionSummary = action.payload;
    });
    builder.addCase(fetchCollectionSummaryThunk.rejected, (state, action) => {
      state.isLoadingSummary = false;
      state.summaryError = action.payload || 'Failed to load summary';
    });
  },
});

export const { clearPatronsError, clearLastCollection } = patronsSlice.actions;
export default patronsSlice.reducer;
