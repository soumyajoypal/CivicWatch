// components/BillboardMap.tsx
import { AppDispatch, RootState } from "@/store/store";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import { getBillBoardFeed } from "../../lib/Slices/billBoardSlice";
const BillboardMap = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { billboards, status } = useSelector(
    (state: RootState) => state.billboard
  );

  useEffect(() => {
    dispatch(getBillBoardFeed());
  }, [dispatch]);

  if (status === "loading") {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!billboards.length) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color="gray" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: billboards[0]?.location.coordinates[1] ?? 22.5726,
        longitude: billboards[0]?.location.coordinates[0] ?? 88.3639,
        latitudeDelta: 0.01, // was 0.05 — smaller = zoom closer
        longitudeDelta: 0.01,
      }}
    >
      {billboards.map((bb) => (
        <React.Fragment key={bb.id}>
          <Marker
            coordinate={{
              latitude: bb.location.coordinates[1],
              longitude: bb.location.coordinates[0],
            }}
            title={`Billboard: ${bb.id}`}
            description={`Crowd Confidence: ${bb.crowdConfidence}`}
            pinColor="red"
          />
          <Circle
            center={{
              latitude: bb.location.coordinates[1],
              longitude: bb.location.coordinates[0],
            }}
            radius={120} // was 500 — try 100–150 for smaller coverage
            strokeColor="rgba(255,0,0,0.8)"
            fillColor="rgba(255,0,0,0.2)"
          />
        </React.Fragment>
      ))}
    </MapView>
  );
};

export default BillboardMap;

const styles = StyleSheet.create({
  map: {
    flex: 1,
    height: 300,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
