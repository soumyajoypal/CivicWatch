import { refreshLocation } from "@/lib/Slices/locationSlice";
import { fetchUser } from "@/lib/Slices/userSlice";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import Splash from "./_splash";

export default function Index() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(refreshLocation());
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded") {
      if (user?.role === "NormalUser") router.replace("/(tabs)");
      else if (user?.role === "AdminUser") {
        console.log("Admin user detected, navigating to admin dashboard");
        router.replace("/(admin)/dashboard");
      } else router.replace("/login");
    }
  }, [status, user]);

  if (status === "loading" || status === "idle") return <Splash />;

  return null;
}
