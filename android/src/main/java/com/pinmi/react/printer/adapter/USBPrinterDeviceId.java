package com.pinmi.react.printer.adapter;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class USBPrinterDeviceId extends PrinterDeviceId {

    private Integer vendorId;
    private Integer productId;

    public Integer getVendorId() {
        return vendorId;
    }

    public Integer getProductId() {
        return productId;
    }


    public static USBPrinterDeviceId valueOf(Integer vendorId, Integer productId) {
        return new USBPrinterDeviceId(vendorId, productId);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        USBPrinterDeviceId that = (USBPrinterDeviceId) o;

        if (!vendorId.equals(that.vendorId)) return false;
        return productId.equals(that.productId);

    }

    @Override
    public int hashCode() {
        int result = vendorId.hashCode();
        result = 31 * result + productId.hashCode();
        return result;
    }

    private USBPrinterDeviceId(Integer vendorId, Integer productId){
        this.vendorId = vendorId;
        this.productId = productId;
    }
}
