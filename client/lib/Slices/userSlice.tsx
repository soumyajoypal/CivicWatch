import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import apiRequest from "../utils/apiRequest";

interface NormalUserData {
  xp: number;
  reportsSubmitted: number;
  reportsVerified: number;
  badges: string[];
}

interface AdminUserData {
  permissions: string[];
  verifiedReports: number;
  rejectedReports: number;
  adminCode: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role?: "NormalUser" | "AdminUser";
  status?: "active" | "inactive" | "deleted";
  normalUser?: NormalUserData;
  adminUser?: AdminUserData;
}

interface UserState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  user: null,
  status: "idle",
  error: null,
};

const mapUserData = (data: any): User => {
  if (data.role === "NormalUser") {
    return {
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      role: "NormalUser",
      normalUser: {
        xp: data.xp ?? 0,
        reportsSubmitted: data.reportsSubmitted ?? 0,
        reportsVerified: data.reportsVerified ?? 0,
        badges: data.badges ?? [],
      },
    };
  } else if (data.role === "AdminUser") {
    return {
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      role: "AdminUser",
      adminUser: {
        permissions: data.permissions ?? [],
        verifiedReports: data.verifiedReports ?? 0,
        rejectedReports: data.rejectedReports ?? 0,
        adminCode: data.adminCode ?? "",
      },
    };
  } else {
    return {
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
    };
  }
};

const saveUser = async (user: User | null) => {
  if (user) await AsyncStorage.setItem("user", JSON.stringify(user));
  else await AsyncStorage.removeItem("user");
};

const loadUser = async (): Promise<User | null> => {
  const data = await AsyncStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

export const loginUser = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>("user/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await apiRequest.post("/auth/login", credentials);

    const { token, data } = res.data;

    if (token) {
      await SecureStore.setItemAsync("authToken", token);
    }
    const userData = mapUserData(data);
    return userData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const registerUser = createAsyncThunk<
  User,
  {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: string;
  },
  { rejectValue: string }
>("user/registerUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await apiRequest.post("/auth/register", payload);
    const userData = mapUserData(res.data.data);
    return userData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchUser = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("user/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const user = await loadUser();
    return user;
  } catch (err: any) {
    console.log(err);
    return rejectWithValue(err?.message || "Failed to fetch user");
  }
});

export const logoutUser = createAsyncThunk<void, void>(
  "user/logoutUser",
  async () => {
    await SecureStore.deleteItemAsync("authToken");
    await saveUser(null);
    return;
  }
);

export const uploadUserImage = createAsyncThunk<
  string,
  FormData,
  { rejectValue: string }
>("user/uploadUserImage", async (formData, { rejectWithValue }) => {
  try {
    const res = await apiRequest.post("/user/uploadImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${await SecureStore.getItemAsync("authToken")}`,
      },
    });
    console.log("Uploaded Image URL:", res.data.url);
    return res.data.url;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      saveUser(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    increaseReportCount: (state) => {
      if (
        state.user &&
        state.user.normalUser &&
        typeof state.user.normalUser.reportsSubmitted === "number"
      ) {
        state.user.normalUser.reportsSubmitted += 1;
      }
    },
    increaseVerifiedReports: (state) => {
      if (
        state.user &&
        state.user.adminUser &&
        typeof state.user.adminUser.verifiedReports === "number"
      ) {
        state.user.adminUser.verifiedReports += 1;
      }
    },
    increaseRejectedReports: (state) => {
      if (
        state.user &&
        state.user.adminUser &&
        typeof state.user.adminUser.rejectedReports === "number"
      ) {
        state.user.adminUser.rejectedReports += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
        console.log("User logged in:", action.payload);
        saveUser(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        console.log(state.user);

        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch user!";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch user!";
      })
      .addCase(uploadUserImage.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(uploadUserImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to upload image!";
      })
      .addCase(uploadUserImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      });
  },
});

export const {
  setUser,
  clearError,
  increaseReportCount,
  increaseVerifiedReports,
  increaseRejectedReports,
} = userSlice.actions;
export default userSlice.reducer;
