# react-native-printer
Fork of `react-native-printer` and add implement for auto connect printer with usb
A React Native Library to support USB/BLE/Net printer

## Installation

```
npm install "git+https://github.com/HeligPfleigh/react-native-thermal-receipt-printer" --save

```

## Integrate module

To integrate `react-native-printer` with the rest of your react app just execute:

```
react-native link react-native-printer

```

## Usage

```javascript
import { USBPrinter, NetPrinter, BLEPrinter } from 'react-native-printer';

USBPrinter.printText('<C>这是一个测试打印</C>')
USBPrinter.printBill("<C>这是一段打印测试文字</C>")

```

## Example

### USBPrinter (only support android)

Printer structure:
```
{
  device_name: '/usb/lp1',
  vendor_id: 1155,
  product_id: 22304,
}
```


```javascript

  componentDidMount = () => {
    if(Platform.OS == 'android'){
      USBPrinter.init().then(()=> {
        //list printers
        USBPrinter.getDeviceList()
          .then(printers => {
            this.setState(Object.assign({}, this.state, {printers: printers}))
          });

        //connect printer
        vendorID = 1155
        productId = 22304
        USBPrinter.connectPrinter(vendorID, productId).then(
          (printer) => this.setState(Object.assign({}, this.state, {currentPrinter: printer})), 
          error => console.warn(error))
      })
    }
  }

  printTextTest = () => {
    if(this.state.currentPrinter) {
      USBPrinter.printText("<C>这是一段打印测试文字</C>\n");
    }else{
      console.log("没有设置打印机")
    }
    
  }

  printBillTest = () => {
    if(this.state.currentPrinter) {
      USBPrinter.printBill("<C>这是一段打印测试文字</C>");
    }else{
      console.log("没有设置打印机")
    }
  }

  ...

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.printers.map(printer => (
            <TouchableOpacity key={printer.device_id} onPress={(printer) => this._connectPrinter(printer.vendor_id, printer.product_id)}>
              {`device_name: ${printer.device_name}, device_id: ${printer.device_id}, vendor_id: ${printer.vendor_id}, product_id: ${printer.product_id}`}
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

### BLEPrinter 

Printer structure:
```
{
  device_name: '内部打印机',
  inner_mac_address: 'XXXXX-XXXXXXXX',
}
```


```javascript

  componentDidMount = () => {
    if(Platform.OS == 'android'){
      USBPrinter.init().then(()=> {
        //list printers
        USBPrinter.getDeviceList()
          .then(printers => {
            this.setState(Object.assign({}, this.state, {printers: printers}))
          });

        
      })
    }
  }

  _connectPrinter => (inner_mac_address) => {
    if(Platform.OS == 'android'){
      //connect printer
      USBPrinter.connectPrinter(inner_mac_address).then(
        (printer) => this.setState(Object.assign({}, this.state, {currentPrinter: printer})), 
        error => console.warn(error))
    }
  }

  printTextTest = () => {
    if(this.state.currentPrinter) {
      USBPrinter.printText("<C>这是一段打印测试文字</C>\n");
    }else{
      console.log("没有设置打印机")
    }
    
  }

  printBillTest = () => {
    if(this.state.currentPrinter) {
      USBPrinter.printBill("<C>这是一段打印测试文字</C>");
    }else{
      console.log("没有设置打印机")
    }
  }

  ...

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.printers.map(printer => (
            <TouchableOpacity key={printer.inner_mac_address} onPress={(printer) => this._connectPrinter(printer.inner_mac_address)}>
              {`device_name: ${printer.device_name}, inner_mac_address: ${printer.inner_mac_address}`}
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

### NetPrinter 

Printer structure:
```
{
  device_name: "192.168.10.241:9100",
  host: '192.168.10.241',
  port: 9100
}
```


```javascript

  componentDidMount = () => {
    if(Platform.OS == 'android'){
      NetPrinter.init().then(() => {
        this.setState(Object.assign({}, this.state, {printers: [{host: '192.168.10.241', port: 9100}]}))
        })
    }
  }

  _connectPrinter => (host, port) => {
    if(Platform.OS == 'android'){
      //connect printer
      NetPrinter.connectPrinter(host, port).then(
        (printer) => this.setState(Object.assign({}, this.state, {currentPrinter: printer})), 
        error => console.warn(error))
    }
  }

  printTextTest = () => {
    if(this.state.currentPrinter) {
      NetPrinter.printText("<C>这是一段打印测试文字</C>\n");
    }else{
      console.log("没有设置打印机")
    }
    
  }

  printBillTest = () => {
    if(this.state.currentPrinter) {
      NetPrinter.printBill("<C>这是一段打印测试文字</C>");
    }else{
      console.log("没有设置打印机")
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