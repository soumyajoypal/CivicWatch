import { RootState } from "@/store/store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import apiRequest from "../utils/apiRequest";

export type ExifData = Record<string, any>;

interface SuspectedDimensions {
  height?: number;
  width?: number;
}

interface AiAnalysis {
  verdict: "unauthorized" | "authorized" | "unsure" | null;
  confidence: number;
  detectedObjects: string[];
}

interface ReportState {
  imageUrl: string | null;
  annotatedUrl: string | null;
  issueDescription: string;
  violationType: string[];
  location: { coordinates: number[] } | null;
  suspectedDimensions: SuspectedDimensions | null;
  estimatedDistance: number | null;
  qrCodeDetected: boolean;
  licenseId: string | null;
  exifData: ExifData | null;
  submitting: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  reports: any[];

  aiAnalysis: AiAnalysis | null;
  userOverrideVerdict: "unauthorized" | "authorized" | "unsure" | null;
}

export interface SubmitReportPayload {
  imageURL: string;
  annotatedURL: string;
  issueDescription: string;
  violationType: string[];
  location: { coordinates: number[] } | null;
  suspectedDimensions: SuspectedDimensions | null;
  qrCodeDetected: boolean;
  aiAnalysis: AiAnalysis;
}

const initialState: ReportState = {
  imageUrl: null,
  annotatedUrl: null,
  issueDescription: "",
  violationType: ["size_violation"],
  location: null,
  suspectedDimensions: null,
  qrCodeDetected: false,
  licenseId: null,
  exifData: null,
  submitting: false,
  error: null,
  estimatedDistance: null,
  aiAnalysis: null,
  userOverrideVerdict: "unsure",
  status: "idle",
  reports: [], // ✅ initialized here
};

export const submitReport = createAsyncThunk<any, SubmitReportPayload>(
  "report/submitReport",
  async (payload, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const response = await apiRequest.post("/report/submit", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting report:", error);
      return rejectWithValue("Failed to submit report");
    }
  }
);

export const getReportsByUser = createAsyncThunk<
  any,
  {
    status?: string;
    violationType?: string;
    verdict?: string;
    page?: number;
    limit?: number;
  },
  { state: RootState }
>(
  "report/getReportsByUser",
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const userId = getState().user.user?._id;
      if (!userId) {
        return rejectWithValue("User ID not found");
      }

      const token = await SecureStore.getItemAsync("authToken");

      const query = new URLSearchParams(
        Object.entries(filters)
          .filter(([_, v]) => v !== undefined && v !== null)
          .reduce<Record<string, string>>((acc, [k, v]) => {
            acc[k] = String(v);
            return acc;
          }, {})
      ).toString();

      const response = await apiRequest.get(
        `/report/user/${userId}${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching user reports:", error);
      return rejectWithValue("Failed to fetch user reports");
    }
  }
);

export const getAllReports = createAsyncThunk<
  any,
  {
    status?: string;
    violationType?: string;
    verdict?: string;
    page?: number;
    limit?: number;
  },
  { state: RootState }
>("report/getAllReports", async (filters, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    const query = new URLSearchParams(
      Object.entries(filters)
        .filter(([_, v]) => v !== undefined && v !== null)
        .reduce<Record<string, string>>((acc, [k, v]) => {
          acc[k] = String(v);
          return acc;
        }, {})
    ).toString();
    const response = await apiRequest.get(
      `/report/all?${query ? `?${query}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    return rejectWithValue("Failed to fetch all reports");
  }
});

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setImageUrl(state, action: PayloadAction<string>) {
      state.imageUrl = action.payload;
    },
    setAnnotatedUrl(state, action: PayloadAction<string>) {
      state.annotatedUrl = action.payload;
    },
    setIssueDescription(state, action: PayloadAction<string>) {
      state.issueDescription = action.payload;
    },
    setViolationType(state, action: PayloadAction<string[]>) {
      state.violationType = action.payload;
    },
    setLocation(state, action: PayloadAction<ReportState["location"]>) {
      state.location = action.payload;
    },
    setSuspectedDimensions(state, action: PayloadAction<SuspectedDimensions>) {
      state.suspectedDimensions = action.payload;
    },
    setExifData(state, action: PayloadAction<ExifData>) {
      state.exifData = action.payload;
    },
    resetReport() {
      return initialState;
    },
    setEstimatedDistance(state, action: PayloadAction<number>) {
      state.estimatedDistance = action.payload;
    },
    setAiAnalysis(state, action: PayloadAction<ReportState["aiAnalysis"]>) {
      state.aiAnalysis = action.payload;
    },
    setUserOverrideVerdict(
      state,
      action: PayloadAction<"unauthorized" | "authorized" | "unsure">
    ) {
      state.userOverrideVerdict = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitReport.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(getReportsByUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getReportsByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reports = action.payload?.data || [];
      })
      .addCase(getReportsByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getAllReports.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reports = action.payload?.data || [];
      })
      .addCase(getAllReports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  setImageUrl,
  setAnnotatedUrl,
  setIssueDescription,
  setViolationType,
  setLocation,
  setSuspectedDimensions,
  setExifData,
  setEstimatedDistance,
  setUserOverrideVerdict,
  resetReport,
  setAiAnalysis,
} = reportSlice.actions;

export default reportSlice.reducer;
