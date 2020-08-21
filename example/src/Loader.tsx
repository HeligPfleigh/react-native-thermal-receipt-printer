import React from "react";
import { StyleSheet, Modal, View, ActivityIndicator } from "react-native";

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
});

interface LoaderProps {
  loading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ loading }: LoaderProps) => {
  const noop = () => {};
  return (
    <Modal
      visible={loading}
      animationType="none"
      onRequestClose={noop}
      transparent
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator animating={loading} size="large" />
        </View>
      </View>
    </Modal>
  );
};

export default Loader;
