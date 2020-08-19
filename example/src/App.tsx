import * as React from "react";
import { StyleSheet, View, Text, Button, Picker } from "react-native";
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
  IUSBPrinter,
  IBLEPrinter,
  INetPrinter,
} from "react-native-thermal-receipt-printer";
import Loader from "./Loader";

const printerList = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

export default function App() {
  const [selectedValue, setSelectedValue] = React.useState<
    keyof typeof printerList
  >("ble");
  const [devices, setDevices] = React.useState([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedPrinter, setSelectedPrinter] = React.useState<
    IUSBPrinter | IBLEPrinter | INetPrinter
  >({});

  React.useEffect(() => {
    const init = async () => {
      const Printer = printerList[selectedValue];
      try {
        setLoading(true);
        await Printer.init();
        const results = await Printer.getDeviceList();
        setDevices(
          results.map((item) => ({ ...item, printerType: selectedValue }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [selectedValue]);

  React.useEffect(() => {
    const connect = async () => {
      try {
        setLoading(true);
        switch (selectedPrinter.printerType) {
          case "ble":
            await BLEPrinter.connectPrinter(selectedPrinter.inner_mac_address);
            break;
          case "net":
            // TODO
            break;
          case "usb":
            await USBPrinter.connectPrinter(
              selectedPrinter.vendorId,
              selectedPrinter.productId
            );
            break;
          default:
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    connect();
  }, [selectedPrinter]);

  const handlePrint = async () => {
    try {
      const Printer = printerList[selectedValue];
      await Printer.printText("<C>sample text</C>\n");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Select printer type: </Text>
      <Picker
        selectedValue={selectedValue}
        style={{ height: 50, width: 150 }}
        onValueChange={setSelectedValue}
      >
        {Object.keys(printerList).map((item, index) => (
          <Picker.Item
            label={item.toUpperCase()}
            value={item}
            key={`printer-type-item-${index}`}
          />
        ))}
      </Picker>
      <Text>Select printer: </Text>
      <Picker
        selectedValue={selectedPrinter}
        style={{ height: 50, width: 150 }}
        onValueChange={setSelectedPrinter}
      >
        {devices.map((item, index) => (
          <Picker.Item
            label={item.device_name}
            value={item}
            key={`printer-item-${index}`}
          />
        ))}
      </Picker>
      <Button title="Print sample" onPress={handlePrint} />
      <Loader loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});
