import { configureStore } from "@reduxjs/toolkit";
import billboardReducer from "../lib/Slices/billBoardSlice";
import leaderBoardReducer from "../lib/Slices/leaderBoardSlice";
import locationReducer from "../lib/Slices/locationSlice";
import reportReducer from "../lib/Slices/reportSlice";
import userReducer from "../lib/Slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    location: locationReducer,
    report: reportReducer,
    leaderBoard: leaderBoardReducer,
    billboard: billboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
