# react-native-thermal-receipt-printer

Fork of `react-native-thermal-receipt-printer` with added support for locales and QR Code Printing.
This fork is not compatible 1:1 with the original version. The supported tags have changed.

[react-native-thermal-receipt-printer](https://github.com/HeligPfleigh/react-native-thermal-receipt-printer)

## Predefined tags

| Tags          | Description           |
|:-------------:|:---------------------:|
| Text          | Prints normal text    |
| NewLine       | Feed                  |
| QRCode        | Prints QR Code        |

### Text

```xml
<Text align="center" fontWidth="1" fontHeight="1">Example text</Text>
```

Supported attributes:

| Attribute          | Description                             |
|:------------------:|:---------------------------------------:|
| font               | Font type, values: 0 - ?                |
| align              | Align text, values: left, center, right |
| fontWidth          | Font width, values: 0 - 4               |
| fontHeight         | Font height, values: 0 - 4              |
| bold               | Bold, values: 0 - 1                     |

TODO more info from printer documentation about font types

### NewLine

```xml
<NewLine />
```

### QRCode

```xml
<QRCode version='0' errorCorrectionLevel='3' magnification='6'>http://example.com</QRCode>
```

Supported attributes:

| Attribute             | Description                             |
|:---------------------:|:---------------------------------------:|
| version               | Code type, values: 0 - ?                |
| errorCorrectionLevel  | Error correction level, values: 0 - 3   |
| magnification         | Magnification, values: 1 - 8            |

TODO get more info from printer documentation about supported code types

## Usage

```javascript
import {
  USBPrinter,
  NetPrinter,
  BLEPrinter,
} from "react-native-thermal-receipt-printer";

USBPrinter.printText("<Text align='center' fontWidth='1' fontHeight='1'>Example text</Text>");
USBPrinter.printBill("<Text>sample bill</Text>");
```

## Example

### USBPrinter (only supported on android)

```typescript
interface IUSBPrinter {
  device_name: string;
  vendor_id: number;
  product_id: number;
}
```

```typescript
  type State = {
    printers: IUSBPrinter[];
    currentPrinter: IUSBPrinter;
  }

  ...

  async componentDidMount() {
    if (Platform.OS == "android") {
      await USBPrinter.init();
      var availablePrinters = await USBPrinter.getDeviceList();

      this.setState({
        printers: availablePrinters
      });
    }
  }

  async connectPrinter(printer: IUSBPrinter) {
    await USBPrinter.connectPrinter(printer.vendor_id, printer.product_id);

    this.setState({
      currentPrinter: printer
    });
  }

  printText() {
    USBPrinter.printText("<Text align='center' fontWidth='1' fontHeight='1'>Example text</Text>");
  }

  getPrinterDescription(printer: IUSBPrinter) {
    return `device_name: ${printer.device_name}, vendor_id: ${printer.vendor_id}, product_id: ${printer.product_id}`;
  }

  ...

  return (
    <View style={styles.container}>
      {
        this.state.printers.map(printer => (
          <TouchableOpacity key={printer.device_name} onPress={() => connectPrinter(printer)}>
            <Text>{this.getPrinterDescription(printer)}</Text>
          </TouchableOpacity>
        ))
      }
      <TouchableOpacity onPress={() => this.printText()}>
        <Text>Print Text</Text>
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

```typescript
  type State = {
    printers: IBLEPrinter[];
    currentPrinter: IBLEPrinter;
  }

  ...

  async componentDidMount() {
    await BLEPrinter.init();
    var availablePrinters = await BLEPrinter.getDeviceList();

    this.setState({
      printers: availablePrinters
    });
  }

  async connectPrinter(printer: IBLEPrinter) {
    await BLEPrinter.connectPrinter(printer.inner_mac_address);

    this.setState({
      currentPrinter: printer
    });
  }

  printText() {
    BLEPrinter.printText("<Text align='center' fontWidth='1' fontHeight='1'>Example text</Text>");
  }

  getPrinterDescription(printer: IBLEPrinter) {
    return `device_name: ${printer.device_name}, inner_mac_address: ${printer.inner_mac_address}`;
  }

  ...

  return (
    <View style={styles.container}>
      {
        this.state.printers.map(printer => (
          <TouchableOpacity key={printer.device_name} onPress={() => connectPrinter(printer)}>
            <Text>{this.getPrinterDescription(printer)}</Text>
          </TouchableOpacity>
        ))
      }
      <TouchableOpacity onPress={() => this.printText()}>
        <Text>Print Text</Text>
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

_Note:_ getDeviceList does support scanning in local network, but is not recommended

```typescript
  type State = {
    printers: INetPrinter[];
    currentPrinter: INetPrinter;
  }

  ...

  async componentDidMount() {
    await NetPrinter.init();
    var availablePrinters = [{host: '192.168.10.241', port: 9100}];

    this.setState({
      printers: availablePrinters
    });
  }

  async connectPrinter(printer: INetPrinter) {
    let printer = await NetPrinter.connectPrinter(printer.host, printer.port);

    this.setState({
      currentPrinter: printer
    });
  }

  printText() {
    NetPrinter.printText("<Text align='center' fontWidth='1' fontHeight='1'>Example text</Text>");
  }

  getPrinterDescription(printer: INetPrinter) {
    return `device_name: ${printer.device_name}, host: ${printer.host}, port: ${printer.port}`;
  }

  ...

  return (
    <View style={styles.container}>
      {
        this.state.printers.map(printer => (
          <TouchableOpacity key={printer.device_name} onPress={() => connectPrinter(printer)}>
            <Text>{this.getPrinterDescription(printer)}</Text>
          </TouchableOpacity>
        ))
      }
      <TouchableOpacity onPress={() => this.printText()}>
        <Text>Print Text</Text>
      </TouchableOpacity>
    </View>
  )

  ...

```