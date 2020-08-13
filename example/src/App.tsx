import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import * as RNThermalReceiptPrinter from "react-native-thermal-receipt-printer";

export default function App() {
  React.useEffect(() => {
    console.log(RNThermalReceiptPrinter);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
