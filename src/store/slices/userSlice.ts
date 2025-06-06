import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserDetails } from "../thunks/userThunks";

interface UserState {
  details: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  details: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserDetails: (state) => {
      state.details = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.details = action.payload;
        }
      )
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
