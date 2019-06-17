package com.pinmi.react.printer.adapter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class NetPrinterDevice implements PrinterDevice {
    private NetPrinterDeviceId mNetPrinterDeviceId;

    public NetPrinterDevice(String host, Integer port) {
        this.mNetPrinterDeviceId = NetPrinterDeviceId.valueOf(host, port);
    }

    @Override
    public PrinterDeviceId getPrinterDeviceId() {
        return this.mNetPrinterDeviceId;
    }

    @Override
    public WritableMap toRNWritableMap() {
        WritableMap deviceMap = Arguments.createMap();
        deviceMap.putString("device_name", this.mNetPrinterDeviceId.getHost() + ":" + this.mNetPrinterDeviceId.getPort());
        deviceMap.putString("host", this.mNetPrinterDeviceId.getHost());
        deviceMap.putInt("port", this.mNetPrinterDeviceId.getPort());
        return deviceMap;
    }
}
