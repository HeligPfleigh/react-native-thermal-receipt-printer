import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  BLEPrinter,
  IBLEPrinterIdentity,
  NetPrinter,
  INetPrinterIdentity,
  USBPrinter,
  IUSBPrinterIdentity
} from '@intechnity/react-native-thermal-printer';

type AppState = {
  isBusy: boolean;
  blePrinters: IBLEPrinterIdentity[];
  netPrinters: INetPrinterIdentity[];
  usbPrinters: IUSBPrinterIdentity[];
  activeBlePrinter?: IBLEPrinterIdentity;
  activeNetPrinter?: INetPrinterIdentity;
  activeUSBPrinter?: IUSBPrinterIdentity;
}

class App extends React.Component<{}, AppState> {
  blePrinter = BLEPrinter;
  netPrinter = NetPrinter;
  usbPrinter = USBPrinter;

  printText = `
<Printout>
  <Text align='left' fontWidth='0' fontHeight='0' bold='0' font='0'>First line</Text>
  <NewLine />
  <Text align='right' fontWidth='1' fontHeight='1' bold='0'>Second line</Text>
  <NewLine />
  <Text align='center' fontWidth='0' fontHeight='0' bold='0'>Third line</Text>
  <NewLine />
  <NewLine />
  <QRCode version='0' errorCorrectionLevel='3' magnification='6'>test 123</QRCode>
</Printout>`;

  constructor(props: {}) {
    super(props);

    this.state = {
      isBusy: false,
      blePrinters: [],
      netPrinters: [],
      usbPrinters: [],
    }
  }

  async refreshBlePrinters() {
    if (this.state.isBusy) {
      return;
    }

    this.setState({
      isBusy: true,
      blePrinters: [],
      activeBlePrinter: undefined
    });

    try {
      await this.resetBlePrinterConnection();
      await BLEPrinter.init();
      const devices = await BLEPrinter.getDeviceList();

      this.setState({
        isBusy: false,
        blePrinters: devices
      });
    } catch (err) {
      console.error('Failed to refresh BLE printers ' + err);
      this.setState({ isBusy: false });
    }
  }

  async activateBlePrinter(index: number) {
    await this.resetBlePrinterConnection();

    const blePrinter = this.state.blePrinters[index];
    if (!blePrinter) return;

    await BLEPrinter.connectPrinter(blePrinter.innerMacAddress);

    this.setState({ activeBlePrinter: blePrinter });
  }

  async resetBlePrinterConnection() {
    const { activeBlePrinter } = this.state;

    if (!activeBlePrinter) return;

    await BLEPrinter.closeConn();
  }

  printToBlePrinter() {
    BLEPrinter.print(this.printText);
  }

  async refreshNetPrinters() {
    if (this.state.isBusy) {
      return;
    }

    this.setState({
      isBusy: true,
      netPrinters: [],
      activeNetPrinter: undefined
    });

    try {
      await this.resetNetPrinterConnection();
      await NetPrinter.init();
      const devices = await NetPrinter.getDeviceList();

      this.setState({
        isBusy: false,
        netPrinters: devices ?? []
      });
    } catch (err) {
      console.error('Failed to refresh NET printers: ' + err);
      this.setState({ isBusy: false });
    }
  }

  async activateNetPrinter(index: number) {
    await this.resetNetPrinterConnection();

    const netPrinter = this.state.netPrinters[index];
    if (!netPrinter) return;

    await NetPrinter.connectPrinter(netPrinter.host, netPrinter.port);

    this.setState({ activeNetPrinter: netPrinter });
  }

  async resetNetPrinterConnection() {
    const { activeNetPrinter } = this.state;

    if (!activeNetPrinter) return;

    await NetPrinter.closeConn();
  }

  printToNetPrinter() {
    NetPrinter.print(this.printText);
  }

  async refreshUSBPrinters() {
    if (this.state.isBusy) {
      return;
    }

    this.setState({
      isBusy: true,
      usbPrinters: [],
      activeUSBPrinter: undefined
    });

    try {
      await this.resetUSBPrinterConnection();
      await USBPrinter.init();
      const devices = await USBPrinter.getDeviceList();

      this.setState({
        isBusy: false,
        usbPrinters: devices
      });
    } catch (err) {
      console.error('Failed to refresh USB printers: ' + err);
      this.setState({ isBusy: false });
    }
  }

  async activateUSBPrinter(index: number) {
    await this.resetUSBPrinterConnection();

    const usbPrinter = this.state.usbPrinters[index];
    if (!usbPrinter) return;

    await USBPrinter.connectPrinter(usbPrinter.vendorId, usbPrinter.productId);

    this.setState({ activeUSBPrinter: usbPrinter });
  }

  async resetUSBPrinterConnection() {
    const { activeUSBPrinter } = this.state;

    if (!activeUSBPrinter) return;

    await USBPrinter.closeConn();
  }

  printToUSBPrinter() {
    USBPrinter.print(this.printText);
  }

  render() {
    return (
      <SafeAreaView>
        <StatusBar />
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Bluetooth Printer</Text>
            <Text style={styles.sectionDescription}>Example printout to a bluetooth thermal printer.</Text>

            <View style={styles.printerActionWrapper}>
              <Button onPress={() => this.refreshBlePrinters()} title='Refresh bluetooth printers' />
            </View>

            <Text style={styles.pickPrinterTitle}>Pick a printer:</Text>
            <Picker
              selectedValue={this.state.activeBlePrinter?.innerMacAddress}
              onValueChange={(itemValue, itemIndex) =>
                this.activateBlePrinter(itemIndex)
              }
              style={{ marginTop: 20 }}>
              {this.state.blePrinters.map((item, index) => (
                <Picker.Item key={"bt-printer-" + index} label={item.deviceName} value={item.innerMacAddress} />
              ))}
            </Picker>

            <View style={styles.printerActionWrapper}>
              <Button disabled={!this.state.activeBlePrinter} onPress={() => this.printToBlePrinter()} title='Print' />
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Network Printer</Text>
            <Text style={styles.sectionDescription}>Example printout to a network thermal printer.</Text>

            <View style={styles.printerActionWrapper}>
              <Button onPress={() => this.refreshNetPrinters()} title='Refresh network printers' />
            </View>

            <Text style={styles.pickPrinterTitle}>Pick a printer:</Text>
            <Picker
              selectedValue={this.state.activeNetPrinter?.host}
              onValueChange={(itemValue, itemIndex) =>
                this.activateNetPrinter(itemIndex)
              }
              style={{ marginTop: 20 }}>
              {this.state.netPrinters.map((item, index) => (
                <Picker.Item key={"net-printer-" + index} label={item.deviceName} value={item.host} />
              ))}
            </Picker>

            <View style={styles.printerActionWrapper}>
              <Button disabled={!this.state.activeNetPrinter} onPress={() => this.printToNetPrinter()} title='Print' />
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>USB Printer</Text>
            <Text style={styles.sectionDescription}>Example printout to a USB thermal printer.</Text>

            <View style={styles.printerActionWrapper}>
              <Button onPress={() => this.refreshUSBPrinters()} title='Refresh USB printers' />
            </View>

            <Text style={styles.pickPrinterTitle}>Pick a printer:</Text>
            <Picker
              selectedValue={this.state.activeUSBPrinter?.vendorId}
              onValueChange={(itemValue, itemIndex) =>
                this.activateUSBPrinter(itemIndex)
              }
              style={{ marginTop: 20 }}>
              {this.state.usbPrinters.map((item, index) => (
                <Picker.Item key={"usb-printer-" + index} label={item.deviceName} value={item.vendorId} />
              ))}
            </Picker>

            <View style={styles.printerActionWrapper}>
              <Button disabled={!this.state.activeUSBPrinter} onPress={() => this.printToUSBPrinter()} title='Print' />
            </View>
          </View>
        </ScrollView>

        {this.state.isBusy &&
          <View style={styles.activityIndicatorOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>}
      </SafeAreaView>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  sectionContainer: {
    margin: 5,
    padding: 20,
    borderColor: "#bbbbbb",
    borderWidth: 1,
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  printerActionWrapper: {
    marginTop: 20
  },
  pickPrinterTitle: {
    marginTop: 20,
    fontSize: 18
  },
  activityIndicatorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  }
});
