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
  IBLEPrinter,
  NetPrinter,
  INetPrinter,
  USBPrinter,
  IUSBPrinter
} from '@intechnity/react-native-thermal-printer';

type AppState = {
  isBusy: boolean;
  blePrinters: IBLEPrinter[];
  activeBlePrinter?: IBLEPrinter;
}

class App extends React.Component<{}, AppState> {
  blePrinter = BLEPrinter;

  printText = `
<Printout> 
  <Text align='left' fontWidth='0' fontHeight='0' bold='0' font='0'>1 line</Text>
  <NewLine />
  <Text align='center' fontWidth='2' fontHeight='2' bold='0'>2 line</Text>
  <NewLine />
  <QRCode version='0' errorCorrectionLevel='3' magnification='6'>test 123</QRCode>
</Printout>`;

  constructor(props: {}) {
    super(props);

    this.state = {
      isBusy: false,
      blePrinters: []
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

    await this.resetBlePrinterConnection();
    await BLEPrinter.init();
    const devices = await BLEPrinter.getDeviceList();

    this.setState({
      isBusy: false,
      blePrinters: devices
    });
  }

  async activateBlePrinter(innerMacAddress: string) {
    await this.resetBlePrinterConnection();

    const blePrinter = this.state.blePrinters.find(x => x.inner_mac_address == innerMacAddress);
    if (!blePrinter) return;

    await BLEPrinter.connectPrinter(blePrinter.inner_mac_address);

    this.setState({ activeBlePrinter: blePrinter });
  }

  async resetBlePrinterConnection() {
    const { activeBlePrinter } = this.state;

    if (!activeBlePrinter) return;

    await BLEPrinter.closeConn();
  }

  printToBlePrinter() {
    BLEPrinter.printText(this.printText);
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
              selectedValue={this.state.activeBlePrinter?.inner_mac_address}
              onValueChange={(itemValue, itemIndex) =>
                this.activateBlePrinter(itemValue)
              }
              style={{ marginTop: 20 }}>
              {this.state.blePrinters.map((item, index) => (
                <Picker.Item key={"bt-printer-" + index} label={item.device_name} value={item.inner_mac_address} />
              ))}
            </Picker>

            <View style={styles.printerActionWrapper}>
              <Button disabled={!this.state.activeBlePrinter} onPress={() => this.printToBlePrinter()} title='Print' />
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
    marginTop: 32,
    paddingHorizontal: 24,
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
