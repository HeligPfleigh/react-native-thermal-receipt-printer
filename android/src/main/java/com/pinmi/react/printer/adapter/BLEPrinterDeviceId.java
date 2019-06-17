package com.pinmi.react.printer.adapter;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class BLEPrinterDeviceId extends PrinterDeviceId {
    private String innerMacAddress;

    public static BLEPrinterDeviceId valueOf(String innerMacAddress) {
        return new BLEPrinterDeviceId(innerMacAddress);
    }

    private BLEPrinterDeviceId(String innerMacAddress) {
        this.innerMacAddress = innerMacAddress;
    }

    public String getInnerMacAddress() {
        return innerMacAddress;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        BLEPrinterDeviceId that = (BLEPrinterDeviceId) o;

        return innerMacAddress.equals(that.innerMacAddress);

    }

    @Override
    public int hashCode() {
        return innerMacAddress.hashCode();
    }
}
