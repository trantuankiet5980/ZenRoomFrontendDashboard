import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import statsReducer from "./slices/statsSlice";
import propertiesReducer from "./slices/propertiesSlice";
import notificationsReducer from "./slices/notificationsSlice";
import usersReducer from "./slices/usersSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    stats: statsReducer,
    properties: propertiesReducer,
    notifications: notificationsReducer,
    users: usersReducer,
  },
});

export default store;
