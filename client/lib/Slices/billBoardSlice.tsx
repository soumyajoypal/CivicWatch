import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import apiRequest from "../utils/apiRequest";

interface Billboard {
  id: string;
  imageURL: string;
  location: any;
  crowdConfidence: number;
  verifiedStatus: string;
}

interface BillboardDetails {
  id: string;
  imageURL: string;
  location: any;
  crowdConfidence: number;
  verifiedStatus: string;
  reports: Report[];
}

interface Report {
  _id: string;
  imageURL: string;
  annotatedImageURL: string;
  aiAnalysis: {
    verdict: "unauthorized" | "authorized" | "unsure";
    confidence: number;
    detectedObjects: string[];
  };
  upvotes: string[];
  downvotes: string[];
  communityTrustScore: number;
}

interface BillBoardState {
  billboards: Billboard[]; // feed
  selected: BillboardDetails | null; // current opened billboard
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BillBoardState = {
  billboards: [],
  selected: null,
  status: "idle",
  error: null,
};

export const getBillBoardFeed = createAsyncThunk<
  Billboard[],
  void,
  { rejectValue: string }
>("billboard/getBillBoardFeed", async (_, { rejectWithValue }) => {
  try {
    const response = await apiRequest.get("/billboard/feed", {
      headers: {
        Authorization: `Bearer ${await SecureStore.getItemAsync("authToken")}`,
      },
    });
    console.log(response.data);
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch billboards");
  }
});

export const fetchBillboard = createAsyncThunk<
  BillboardDetails,
  string,
  { rejectValue: string }
>("billboard/fetchBillboard", async (billboardId, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    const res = await apiRequest.get<{ data: BillboardDetails }>(
      `/billboard/details/${billboardId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch billboard");
  }
});

export const getAllBillboards = createAsyncThunk<
  {
    billboards: Billboard[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  },
  {
    page?: number;
    limit?: number;
    status?: string;
    minConfidence?: number;
    maxConfidence?: number;
    zoneId?: string;
    fromDate?: string;
    toDate?: string;
  },
  { rejectValue: string }
>("billboard/getAllBillboards", async (filters, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    const res = await apiRequest.get<{
      data: Billboard[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/billboard", {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    console.log(res.data.data);

    return {
      billboards: res.data.data,
      pagination: res.data.pagination,
    };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch billboards");
  }
});

export const voteReport = createAsyncThunk<
  any,
  { reportId: string; voteType: string }
>("report/voteReport", async ({ reportId, voteType }, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    const response = await apiRequest.post(
      `/report/vote/${reportId}`,
      { voteType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error voting on report:", error);
    return rejectWithValue("Failed to vote on report");
  }
});

const billBoardSlice = createSlice({
  name: "billboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBillBoardFeed.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getBillBoardFeed.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.billboards = action.payload;
      })
      .addCase(getBillBoardFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong";
      })
      .addCase(fetchBillboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBillboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchBillboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch billboard";
      })
      .addCase(voteReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedReport = action.payload;
        if (state.selected) {
          const index = state.selected.reports.findIndex(
            (r) => r._id === updatedReport._id
          );
          if (index !== -1) {
            state.selected.reports[index] = updatedReport;
          }
        }
      })
      .addCase(getAllBillboards.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllBillboards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.billboards = action.payload.billboards;
      })
      .addCase(getAllBillboards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export default billBoardSlice.reducer;
