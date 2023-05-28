import React from 'react';
import { SafeAreaView, StatusBar, ScrollView, View, Text } from 'react-native';
import {
  BLEPrinter,
  IBLEPrinter,
  NetPrinter,
  USBPrinter,
} from '@intechnity/react-native-thermal-printer';

type AppState = {
  isBusy: boolean;
  blePrinters: IBLEPrinter[];
}

class App extends React.Component<{}, AppState> {
  blePrinter = BLEPrinter;

  constructor(props: {}) {
    super(props);

    this.state = {
      isBusy: false,
      blePrinters: []
    }
  }

  async componentDidMount() {
    this.setState({ isBusy: true });
    // await BLEPrinter.init();
    // const devices = await BLEPrinter.getDeviceList();

    this.setState({
      isBusy: false,
      //blePrinters: []
    });
  }

  print() {

  }

  render() {
    if (this.state.isBusy) {
      return <Text>Loading...</Text>;
      //return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
      <SafeAreaView>
        <StatusBar />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View>
            <Text>test</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default App;