import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchData } from "../thunks/apiThunks";

// Define the state type
interface ApiState {
  data: any[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ApiState = {
  data: [],
  loading: false,
  error: null,
};

// Create the slice
const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearData } = apiSlice.actions;
export default apiSlice.reducer;
