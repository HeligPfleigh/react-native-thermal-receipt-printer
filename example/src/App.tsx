import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  Picker,
  TextInput,
} from "react-native";
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
        Object.keys(printerList).map(
          async (item) => await printerList[item].init()
        );
        await Printer.init();
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  React.useEffect(() => {
    const getListDevices = async () => {
      const Printer = printerList[selectedValue];
      try {
        setLoading(true);
        const results = await Printer.getDeviceList();
        setDevices(
          results.map((item) => ({ ...item, printerType: selectedValue }))
        );
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    getListDevices();
  }, [selectedValue]);

  const handleConnectSelectedPrinter = () => {
    console.log(selectedPrinter);
    if (!selectedPrinter) return;
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
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    connect();
  };

  const handlePrint = async () => {
    try {
      const Printer = printerList[selectedValue];
      await Printer.printBill("<C>sample text</C>\n");
    } catch (err) {
      console.warn(err);
    }
  };

  const handleChangePrinterType = async (type: keyof typeof printerList) => {
    setSelectedValue((prev) => {
      printerList[prev].closeConn();
      return type;
    });
    setSelectedPrinter({});
  };

  const _renderNet = () => (
    <View style={{ paddingVertical: 16 }}>
      <View style={styles.rowDirection}>
        <Text>Host: </Text>
        <TextInput placeholder="192.168.100.19" />
      </View>
      <View style={styles.rowDirection}>
        <Text>Port: </Text>
        <TextInput placeholder="9100" />
      </View>
    </View>
  );

  const _renderOther = () => (
    <Picker selectedValue={selectedPrinter} onValueChange={setSelectedPrinter}>
      {devices.map((item, index) => (
        <Picker.Item
          label={item.device_name}
          value={item}
          key={`printer-item-${index}`}
        />
      ))}
    </Picker>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text>Select printer type: </Text>
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleChangePrinterType}
        >
          {Object.keys(printerList).map((item, index) => (
            <Picker.Item
              label={item.toUpperCase()}
              value={item}
              key={`printer-type-item-${index}`}
            />
          ))}
        </Picker>
      </View>
      <View style={styles.section}>
        <Text>Select printer: </Text>
        {selectedValue === "net" ? _renderNet() : _renderOther()}
      </View>
      <Button
        disabled={!selectedPrinter?.device_name}
        title="Connect"
        onPress={handleConnectSelectedPrinter}
      />
      <Button
        disabled={!selectedPrinter?.device_name}
        title="Print sample"
        onPress={handlePrint}
      />
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
  section: {
    flex: 1,
  },
  rowDirection: {
    flexDirection: "row",
  },
});
