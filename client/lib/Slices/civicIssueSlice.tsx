import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import apiRequest from "../utils/apiRequest";

interface CivicIssue {
  id: string;
  imageURL: string;
  location: any;
  crowdConfidence: number;
  verifiedStatus: string;
}

interface CivicIssueDetails {
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
    verdict: "action_required" | "action_not_required" | "unsure";
    confidence: number;
    detectedObjects: string[];
  };
  upvotes: string[];
  downvotes: string[];
  severity?: string;
  impact?: string;
  communityTrustScore: number;
}

interface CivicIssueState {
  issues: CivicIssue[]; // feed
  selected: CivicIssueDetails | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CivicIssueState = {
  issues: [],
  selected: null,
  status: "idle",
  error: null,
};

// Feed
export const getCivicIssueFeed = createAsyncThunk<
  CivicIssue[],
  void,
  { rejectValue: string }
>("civicIssue/getCivicIssueFeed", async (_, { rejectWithValue }) => {
  try {
    const response = await apiRequest.get("/civic-issues/feed", {
      headers: {
        Authorization: `Bearer ${await SecureStore.getItemAsync("authToken")}`,
      },
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch civic issues");
  }
});

// Details
export const fetchCivicIssue = createAsyncThunk<
  CivicIssueDetails,
  string,
  { rejectValue: string }
>("civicIssue/fetchCivicIssue", async (issueId, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    const res = await apiRequest.get<{ data: CivicIssueDetails }>(
      `/civic-issues/details/${issueId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch civic issue");
  }
});

// Paginated fetch
export const getAllCivicIssues = createAsyncThunk<
  {
    issues: CivicIssue[];
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
>("civicIssue/getAllCivicIssues", async (filters, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    const res = await apiRequest.get<{
      data: CivicIssue[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/civic-issues", {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });

    return {
      issues: res.data.data,
      pagination: res.data.pagination,
    };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch civic issues");
  }
});

// Voting
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

const civicIssueSlice = createSlice({
  name: "civicIssue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Feed
      .addCase(getCivicIssueFeed.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCivicIssueFeed.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.issues = action.payload;
      })
      .addCase(getCivicIssueFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong";
      })
      // Details
      .addCase(fetchCivicIssue.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCivicIssue.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchCivicIssue.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch civic issue";
      })
      // Vote
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
      // Paginated
      .addCase(getAllCivicIssues.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllCivicIssues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.issues = action.payload.issues;
      })
      .addCase(getAllCivicIssues.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export default civicIssueSlice.reducer;
