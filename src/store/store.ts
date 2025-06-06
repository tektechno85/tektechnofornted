import { configureStore } from "@reduxjs/toolkit";
import apiReducer from "./slices/apiSlice";
import userReducer from "./slices/userSlice";
import payoutReducer from "./slices/payoutSlice";

export const store = configureStore({
  reducer: {
    api: apiReducer,
    user: userReducer,
    payout: payoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
