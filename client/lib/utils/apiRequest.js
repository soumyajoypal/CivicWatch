import axios from "axios";
import * as SecureStore from "expo-secure-store";
const apiRequest = axios.create({
  baseURL: "http://192.168.0.178:3000/api",
  withCredentials: true,
});

apiRequest.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiRequest;
