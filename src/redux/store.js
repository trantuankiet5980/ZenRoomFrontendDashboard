import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import statsReducer from "./slices/statsSlice"
import propertiesReducer from "./slices/propertiesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    stats: statsReducer,
    properties: propertiesReducer,
  },
});

export default store;
