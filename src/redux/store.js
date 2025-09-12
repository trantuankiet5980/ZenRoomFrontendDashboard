import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import statsReducer from "./slices/statsSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    stats: statsReducer,
  },
});

export default store;
