# react-native-thermal-receipt-printer

Fork of `react-native-printer` and add implement for auto connect printer with usb
A React Native Library to support USB/BLE/Net printer

![Node.js Package](https://github.com/HeligPfleigh/react-native-thermal-receipt-printer/workflows/Node.js%20Package/badge.svg)

## Installation

```
yarn add react-native-thermal-receipt-printer
```

## Troubleshoot

- when install in `react-native` version >= 0.60, xcode show this error

```
duplicate symbols for architecture x86_64
```

that because the .a library uses [CocoaAsyncSocket](https://github.com/robbiehanson/CocoaAsyncSocket) library and Flipper uses it too

_Podfile_

```diff
...
  use_native_modules!

  # Enables Flipper.
  #
  # Note that if you have use_frameworks! enabled, Flipper will not work and
  # you should disable these next few lines.
  # add_flipper_pods!
  # post_install do |installer|
  #   flipper_post_install(installer)
  # end
...
```

and comment out code related to Flipper in `ios/AppDelegate.m`

## Support

| Printer    | Android            | IOS                |
| ---------- | ------------------ | ------------------ |
| USBPrinter | :heavy_check_mark: |                    |
| BLEPrinter | :heavy_check_mark: | :heavy_check_mark: |
| NetPrinter | :heavy_check_mark: | :heavy_check_mark: |

## Predefined tag
| Tags          | Description           |
|:-------------:|:---------------------:|
| C             | Center                |
| D             | Medium font           |
| B             | Large font            |
| M             | Medium font           |
| CM            | Medium font, centered |
| CB            | Medium font, centered |
| CD            | Large font, centered  |

## Development workflow

To get started with the project, run `yarn bootstrap` in the root directory to install the required dependencies for each package:

```sh
yarn bootstrap
```

While developing, you can run the [example app](/example/) to test your changes.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example dev-android
```

To run the example app on iOS:

```sh
yarn example ios
```

## Usage

```javascript
import {
  USBPrinter,
  NetPrinter,
  BLEPrinter,
} from "react-native-thermal-receipt-printer";

USBPrinter.printText("<C>sample text</C>");
USBPrinter.printBill("<C>sample bill</C>");
```

## Example

### USBPrinter (only support android)

```typescript
interface IUSBPrinter {
  device_name: string;
  vendor_id: number;
  product_id: number;
}
```

```javascript
  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState();

  useEffect = () => {
    if(Platform.OS == 'android'){
      USBPrinter.init().then(()=> {
        //list printers
        USBPrinter.getDeviceList().then(setPrinters);
      })
    }
  }

  const _connectPrinter = (printer) => USBPrinter.connectPrinter(printer.vendorID, printer.productId).then(() => setCurrentPrinter(printer))

  const printTextTest = () => {
    currentPrinter && USBPrinter.printText("<C>sample text</C>\n");
  }

  const printBillTest = () => {
    currentPrinter && USBPrinter.printBill("<C>sample bill</C>");
  }

  ...

  return (
    <View style={styles.container}>
      {
        printers.map(printer => (
          <TouchableOpacity key={printer.device_id} onPress={() => _connectPrinter(printer)}>
            {`device_name: ${printer.device_name}, device_id: ${printer.device_id}, vendor_id: ${printer.vendor_id}, product_id: ${printer.product_id}`}
          </TouchableOpacity>
          ))
      }
      <TouchableOpacity onPress={printTextTest}>
        <Text>Print Text</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={printBillTest}>
        <Text>Print Bill Text</Text>
      </TouchableOpacity>
    </View>
  )

  ...

```

### BLEPrinter

```typescript
interface IBLEPrinter {
  device_name: string;
  inner_mac_address: string;
}
```

```javascript
  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState();

  useEffect(() => {
    BLEPrinter.init().then(()=> {
      BLEPrinter.getDeviceList().then(setPrinters);
    });
  }, []);

  _connectPrinter => (printer) => {
    //connect printer
    BLEPrinter.connectPrinter(printer.inner_mac_address).then(
      setCurrentPrinter,
      error => console.warn(error))
  }

  printTextTest = () => {
    currentPrinter && USBPrinter.printText("<C>sample text</C>\n");
  }

  printBillTest = () => {
    currentPrinter && USBPrinter.printBill("<C>sample bill</C>");
  }

  ...

  return (
    <View style={styles.container}>
      {
        this.state.printers.map(printer => (
          <TouchableOpacity key={printer.inner_mac_address} onPress={() => _connectPrinter(printer)}>
            {`device_name: ${printer.device_name}, inner_mac_address: ${printer.inner_mac_address}`}
          </TouchableOpacity>
          ))
      }
      <TouchableOpacity onPress={printTextTest}>
        <Text>Print Text</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={printBillTest}>
        <Text>Print Bill Text</Text>
      </TouchableOpacity>
    </View>
  )

  ...

```

### NetPrinter

```typescript
interface INetPrinter {
  device_name: string;
  host: string;
  port: number;
}
```

_Note:_ get list device for net printers is support scanning in local ip but not recommended

```javascript

  componentDidMount = () => {
    NetPrinter.init().then(() => {
      this.setState(Object.assign({}, this.state, {printers: [{host: '192.168.10.241', port: 9100}]}))
      })
  }

  _connectPrinter => (host, port) => {
    //connect printer
    NetPrinter.connectPrinter(host, port).then(
      (printer) => this.setState(Object.assign({}, this.state, {currentPrinter: printer})),
      error => console.warn(error))
}

  printTextTest = () => {
    if (this.state.currentPrinter) {
      NetPrinter.printText("<C>sample text</C>\n");
    }
  }

  printBillTest = () => {
    if(this.state.currentPrinter) {
      NetPrinter.printBill("<C>sample bill</C>");
    }
  }

  ...

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.printers.map(printer => (
            <TouchableOpacity key={printer.device_id} onPress={(printer) => this._connectPrinter(printer.host, printer.port)}>
              {`device_name: ${printer.device_name}, host: ${printer.host}, port: ${printer.port}`}
            </TouchableOpacity>
            ))
        }
        <TouchableOpacity onPress={() => this.printTextTest()}>
          <Text> Print Text </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.printBillTest()}>
          <Text> Print Bill Text </Text>
        </TouchableOpacity>
      </View>
    )
  }

  ...

```
