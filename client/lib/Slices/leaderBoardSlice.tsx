import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import apiRequest from "../utils/apiRequest";

interface LeaderboardState {
  data: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LeaderboardState = {
  data: [],
  status: "idle",
  error: null,
};

export const getLeaderBoard = createAsyncThunk(
  "leaderboard/getLeaderBoard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get("/user/leaderBoard", {
        headers: {
          Authorization: `Bearer ${await SecureStore.getItemAsync("authToken")}`,
        },
      });
      console.log(response.data.data);

      return response.data.data;
    } catch (error) {
      let errorMessage = "An Error Occurred!";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object" &&
        (error as any).response !== null &&
        "data" in (error as any).response &&
        typeof (error as any).response.data === "object" &&
        (error as any).response.data !== null &&
        "message" in (error as any).response.data
      ) {
        errorMessage = (error as any).response.data.message;
      }
      console.log(errorMessage);

      return rejectWithValue(errorMessage);
    }
  }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getLeaderBoard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getLeaderBoard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(getLeaderBoard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
      }),
});

export default leaderboardSlice.reducer;
