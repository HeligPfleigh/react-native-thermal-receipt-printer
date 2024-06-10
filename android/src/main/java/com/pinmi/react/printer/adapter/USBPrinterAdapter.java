package com.pinmi.react.printer.adapter;
import static com.pinmi.react.printer.adapter.UtilsImage.getPixelsSlow;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.util.Base64;
import android.util.Log;
import android.widget.Toast;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;


import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReadableMap;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

/**
 * Created by xiesubin on 2017/9/20.
 */

public class USBPrinterAdapter implements PrinterAdapter {
    private static USBPrinterAdapter mInstance;


    private String LOG_TAG = "RNUSBPrinter";
    private Context mContext;
    private UsbManager mUSBManager;
    private PendingIntent mPermissionIndent;
    private UsbDevice mUsbDevice;
    private UsbDeviceConnection mUsbDeviceConnection;
    private UsbInterface mUsbInterface;
    private UsbEndpoint mEndPoint;
    private UsbDeviceConnection mUsbStampConnection;
    private UsbInterface mUsbStampInterface;
    private UsbEndpoint mStampEndPoint;
    private static final String ACTION_USB_PERMISSION = "com.pinmi.react.USBPrinter.USB_PERMISSION";
    private static final String EVENT_USB_DEVICE_ATTACHED = "usbAttached";

    private final static char ESC_CHAR = 0x1B;
    private static byte[] SELECT_BIT_IMAGE_MODE = { 0x1B, 0x2A, 33 };
    private final static byte[] SET_LINE_SPACE_24 = new byte[] { ESC_CHAR, 0x33, 24 };
    private final static byte[] SET_LINE_SPACE_32 = new byte[] { ESC_CHAR, 0x33, 32 };
    private final static byte[] LINE_FEED = new byte[] { 0x0A };
    private static byte[] CENTER_ALIGN = { 0x1B, 0X61, 0X31 };

    private USBPrinterAdapter() {
    }

    public static USBPrinterAdapter getInstance() {
        if (mInstance == null) {
            mInstance = new USBPrinterAdapter();
        }
        return mInstance;
    }

    private final BroadcastReceiver mUsbDeviceReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    UsbDevice usbDevice = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        Log.i(LOG_TAG, "success to grant permission for device " + usbDevice.getDeviceId() + ", vendor_id: " + usbDevice.getVendorId() + " product_id: " + usbDevice.getProductId());
                        mUsbDevice = usbDevice;
                    } else {
                        Toast.makeText(context, "User refuses to obtain USB device permissions" + usbDevice.getDeviceName(), Toast.LENGTH_LONG).show();
                    }
                }
            } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
                if (mUsbDevice != null) {
                    Toast.makeText(context, "USB device has been turned off", Toast.LENGTH_LONG).show();
                    closeConnectionIfExists();
                    closeConnectionStampIfExists();
                }
            } else if (UsbManager.ACTION_USB_ACCESSORY_ATTACHED.equals(action) || UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(action)) {
                synchronized (this) {
                    if (mContext != null) {
                        ((ReactApplicationContext) mContext).getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit(EVENT_USB_DEVICE_ATTACHED, null);
                    }
                }
            }
        }
    };

    public void init(ReactApplicationContext reactContext, Callback successCallback, Callback errorCallback) {
        this.mContext = reactContext;
        this.mUSBManager = (UsbManager) this.mContext.getSystemService(Context.USB_SERVICE);
        this.mPermissionIndent = PendingIntent.getBroadcast(mContext, 0, new Intent(ACTION_USB_PERMISSION), 0);
        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        filter.addAction(UsbManager.ACTION_USB_ACCESSORY_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        mContext.registerReceiver(mUsbDeviceReceiver, filter);
        Log.v(LOG_TAG, "RNUSBPrinter initialized");
        successCallback.invoke();
    }


    public void closeConnectionIfExists() {
        if (mUsbDeviceConnection != null) {
            mUsbDeviceConnection.releaseInterface(mUsbInterface);
            mUsbDeviceConnection.close();
            mUsbInterface = null;
            mEndPoint = null;
            mUsbDeviceConnection = null;
        }
    }

    public List<PrinterDevice> getDeviceList(Callback errorCallback) {
        List<PrinterDevice> lists = new ArrayList<>();
        if (mUSBManager == null) {
            errorCallback.invoke("USBManager is not initialized while get device list");
            return lists;
        }

        for (UsbDevice usbDevice : mUSBManager.getDeviceList().values()) {
            lists.add(new USBPrinterDevice(usbDevice));
        }
        return lists;
    }

    @Override
    public void selectStampDevice(PrinterDeviceId printerDeviceId, Callback successCallback, Callback errorCallback) {
        if (mUSBManager == null) {
            errorCallback.invoke("USBManager is not initialized before select device");
            return;
        }

        USBPrinterDeviceId usbPrinterDeviceId = (USBPrinterDeviceId) printerDeviceId;
        if (mUsbDevice != null && mUsbDevice.getVendorId() == usbPrinterDeviceId.getVendorId() && mUsbDevice.getProductId() == usbPrinterDeviceId.getProductId()) {
            Log.i(LOG_TAG, "already selected device, do not need repeat to connect");
            if(!mUSBManager.hasPermission(mUsbDevice)){
                closeConnectionStampIfExists();
                mUSBManager.requestPermission(mUsbDevice, mPermissionIndent);
            }
            successCallback.invoke(new USBPrinterDevice(mUsbDevice).toRNWritableMap());
            return;
        }
        closeConnectionStampIfExists();
        if (mUSBManager.getDeviceList().size() == 0) {
            errorCallback.invoke("Device list is empty, can not choose device");
            return;
        }
        for (UsbDevice usbDevice : mUSBManager.getDeviceList().values()) {
            if (usbDevice.getVendorId() == usbPrinterDeviceId.getVendorId() && usbDevice.getProductId() == usbPrinterDeviceId.getProductId()) {
                Log.v(LOG_TAG, "request for device: vendor_id: " + usbPrinterDeviceId.getVendorId() + ", product_id: " + usbPrinterDeviceId.getProductId());
                closeConnectionStampIfExists();
                mUSBManager.requestPermission(usbDevice, mPermissionIndent);
                successCallback.invoke(new USBPrinterDevice(usbDevice).toRNWritableMap());
                return;
            }
        }

        errorCallback.invoke("can not find specified device");
        return;
    }

    @Override
    public void closeConnectionStampIfExists() {
        if (mUsbStampConnection != null) {
            mUsbStampConnection.releaseInterface(mUsbStampInterface);
            mUsbStampConnection.close();
            mUsbStampInterface = null;
            mStampEndPoint = null;
            mUsbStampConnection = null;
        }
    }

    private boolean openStampConnection() {
        if (mUsbDevice == null) {
            Log.e(LOG_TAG, "USB Deivce is not initialized");
            return false;
        }
        if (mUSBManager == null) {
            Log.e(LOG_TAG, "USB Manager is not initialized");
            return false;
        }

        if (mUsbStampConnection != null) {
            Log.i(LOG_TAG, "USB Connection already connected");
            return true;
        }

        UsbInterface usbInterface = mUsbDevice.getInterface(0);
        for (int i = 0; i < usbInterface.getEndpointCount(); i++) {
            final UsbEndpoint ep = usbInterface.getEndpoint(i);
            if (ep.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                if (ep.getDirection() == UsbConstants.USB_DIR_OUT) {
                    UsbDeviceConnection usbDeviceConnection = mUSBManager.openDevice(mUsbDevice);
                    if (usbDeviceConnection == null) {
                        Log.e(LOG_TAG, "failed to open USB Connection");
                        return false;
                    }
                    if (usbDeviceConnection.claimInterface(usbInterface, true)) {
                        mStampEndPoint = ep;
                        mUsbStampInterface = usbInterface;
                        mUsbStampConnection = usbDeviceConnection;
                        Log.i(LOG_TAG, "Device connected");
                        return true;
                    } else {
                        usbDeviceConnection.close();
                        Log.e(LOG_TAG, "failed to claim usb connection");
                        return false;
                    }
                }
            }
        }
        return true;
    }

    @Override
    public void selectDevice(PrinterDeviceId printerDeviceId, Callback successCallback, Callback errorCallback) {
        if (mUSBManager == null) {
            errorCallback.invoke("USBManager is not initialized before select device");
            return;
        }

        USBPrinterDeviceId usbPrinterDeviceId = (USBPrinterDeviceId) printerDeviceId;
        if (mUsbDevice != null && mUsbDevice.getVendorId() == usbPrinterDeviceId.getVendorId() && mUsbDevice.getProductId() == usbPrinterDeviceId.getProductId()) {
            Log.i(LOG_TAG, "already selected device, do not need repeat to connect");
            if(!mUSBManager.hasPermission(mUsbDevice)){
                closeConnectionIfExists();
                mUSBManager.requestPermission(mUsbDevice, mPermissionIndent);
            }
            successCallback.invoke(new USBPrinterDevice(mUsbDevice).toRNWritableMap());
            return;
        }
        closeConnectionIfExists();
        if (mUSBManager.getDeviceList().size() == 0) {
            errorCallback.invoke("Device list is empty, can not choose device");
            return;
        }
        for (UsbDevice usbDevice : mUSBManager.getDeviceList().values()) {
            if (usbDevice.getVendorId() == usbPrinterDeviceId.getVendorId() && usbDevice.getProductId() == usbPrinterDeviceId.getProductId()) {
                Log.v(LOG_TAG, "request for device: vendor_id: " + usbPrinterDeviceId.getVendorId() + ", product_id: " + usbPrinterDeviceId.getProductId());
                closeConnectionIfExists();
                mUSBManager.requestPermission(usbDevice, mPermissionIndent);
                successCallback.invoke(new USBPrinterDevice(usbDevice).toRNWritableMap());
                return;
            }
        }

        errorCallback.invoke("can not find specified device");
        return;
    }

    private boolean openConnection() {
        if (mUsbDevice == null) {
            Log.e(LOG_TAG, "USB Deivce is not initialized");
            return false;
        }
        if (mUSBManager == null) {
            Log.e(LOG_TAG, "USB Manager is not initialized");
            return false;
        }

        if (mUsbDeviceConnection != null) {
            Log.i(LOG_TAG, "USB Connection already connected");
            return true;
        }

        UsbInterface usbInterface = mUsbDevice.getInterface(0);
        for (int i = 0; i < usbInterface.getEndpointCount(); i++) {
            final UsbEndpoint ep = usbInterface.getEndpoint(i);
            if (ep.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                if (ep.getDirection() == UsbConstants.USB_DIR_OUT) {
                    UsbDeviceConnection usbDeviceConnection = mUSBManager.openDevice(mUsbDevice);
                    if (usbDeviceConnection == null) {
                        Log.e(LOG_TAG, "failed to open USB Connection");
                        return false;
                    }
                    if (usbDeviceConnection.claimInterface(usbInterface, true)) {

                        mEndPoint = ep;
                        mUsbInterface = usbInterface;
                        mUsbDeviceConnection = usbDeviceConnection;
                        Log.i(LOG_TAG, "Device connected");
                        return true;
                    } else {
                        usbDeviceConnection.close();
                        Log.e(LOG_TAG, "failed to claim usb connection");
                        return false;
                    }
                }
            }
        }
        return true;
    }


    public void printRawData(String data, Callback errorCallback) {
        final String rawData = data;
        Log.v(LOG_TAG, "start to print raw data " + data);
        boolean isConnected = openConnection();
        if (isConnected) {
            Log.v(LOG_TAG, "Connected to device");
            new Thread(new Runnable() {
                @Override
                public void run() {
                    byte[] bytes = Base64.decode(rawData, Base64.DEFAULT);
                    int b = mUsbDeviceConnection.bulkTransfer(mEndPoint, bytes, bytes.length, 100000);
                    Log.i(LOG_TAG, "Return Status: b-->" + b);
                    closeConnectionIfExists();
                }
            }).start();
        } else {
            String msg = "failed to connected to device";
            Log.v(LOG_TAG, msg);
            errorCallback.invoke(msg);
        }
    }

    public static Bitmap getBitmapFromURL(String src) {
        try {
            URL url = new URL(src);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            Bitmap myBitmap = BitmapFactory.decodeStream(input);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            myBitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);

            return myBitmap;
        } catch (IOException e) {
            // Log exception
            return null;
        }
    }


    @Override
    public void printImageData(final String imageUrl, int imageWidth, int imageHeight, Callback errorCallback) {
        final Bitmap bitmapImage = getBitmapFromURL(imageUrl);

        if(bitmapImage == null) {
            errorCallback.invoke("image not found");
            return;
        }

        Log.v(LOG_TAG, "start to print image data " + bitmapImage);
        boolean isConnected = openConnection();
        if (isConnected) {
            Log.v(LOG_TAG, "Connected to device");
            int[][] pixels = getPixelsSlow(bitmapImage, imageWidth, imageHeight);

            int b = mUsbDeviceConnection.bulkTransfer(mEndPoint, SET_LINE_SPACE_24, SET_LINE_SPACE_24.length, 100000);

            b = mUsbDeviceConnection.bulkTransfer(mEndPoint, CENTER_ALIGN, CENTER_ALIGN.length, 100000);

            for (int y = 0; y < pixels.length; y += 24) {
                // Like I said before, when done sending data,
                // the printer will resume to normal text printing
                mUsbDeviceConnection.bulkTransfer(mEndPoint, SELECT_BIT_IMAGE_MODE, SELECT_BIT_IMAGE_MODE.length, 100000);

                // Set nL and nH based on the width of the image
                byte[] row = new byte[]{(byte)(0x00ff & pixels[y].length)
                        , (byte)((0xff00 & pixels[y].length) >> 8)};

                mUsbDeviceConnection.bulkTransfer(mEndPoint, row, row.length, 100000);

                for (int x = 0; x < pixels[y].length; x++) {
                    // for each stripe, recollect 3 bytes (3 bytes = 24 bits)
                    byte[] slice = recollectSlice(y, x, pixels);
                    mUsbDeviceConnection.bulkTransfer(mEndPoint, slice, slice.length, 100000);
                }

                // Do a line feed, if not the printing will resume on the same line
                mUsbDeviceConnection.bulkTransfer(mEndPoint, LINE_FEED, LINE_FEED.length, 100000);
            }

            mUsbDeviceConnection.bulkTransfer(mEndPoint, SET_LINE_SPACE_32, SET_LINE_SPACE_32.length, 100000);
            mUsbDeviceConnection.bulkTransfer(mEndPoint, LINE_FEED, LINE_FEED.length, 100000);
        } else {
            String msg = "failed to connected to device";
            Log.v(LOG_TAG, msg);
            errorCallback.invoke(msg);
        }

    }

    @Override
    public void printLabelOptions(final ReadableMap options, Callback errorCallback) {
        Log.v(LOG_TAG, "start to print label");
        boolean isConnected = openStampConnection();
        if (isConnected) {
            Log.v(LOG_TAG, "Connected to device");
            new Thread(new Runnable() {
                @Override
                public void run() {
                    int width = options.getInt("width");
                    int height = options.getInt("height");
                    int gap = options.hasKey("gap") ? options.getInt("gap") : 0;

                    ReadableArray texts = options.hasKey("text")? options.getArray("text"):null;
                    ReadableArray qrCodes = options.hasKey("qrcode")? options.getArray("qrcode"):null;
                    ReadableArray barCodes = options.hasKey("barcode")? options.getArray("barcode"):null;
                    ReadableArray images = options.hasKey("image")? options.getArray("image"):null;

                    TscCommand tsc = new TscCommand();
                    tsc.addSize(width,height);
                    tsc.addGap(gap);
                    tsc.addCls();

                    // Add text to label
                    for (int i = 0;texts!=null&& i < texts.size(); i++) {
                        ReadableMap text = texts.getMap(i);
                        String t = text.getString("text");
                        int x = text.getInt("x");
                        int y = text.getInt("y");
                        TscCommand.FONTTYPE fonttype = findFontType(text.getString("fonttype"));
                        TscCommand.ROTATION rotation = findRotation(text.getInt("rotation"));
                        TscCommand.FONTMUL xscal = findFontMul(text.getInt("xscal"));
                        TscCommand.FONTMUL yscal = findFontMul(text.getInt("xscal"));
                        boolean bold = text.hasKey("bold") && text.getBoolean("bold");

                        try {
                            byte[] temp = t.getBytes("UTF-8");
                            String temStr = new String(temp, "UTF-8");
                            t = new String(temStr.getBytes("GB2312"), "GB2312");
                        } catch (Exception e) {
                            Log.e(LOG_TAG, "Text error");
                            return;
                        }

                        tsc.addText(x, y, fonttype, rotation, xscal, yscal, t);

                        if(bold){
                            tsc.addText(x+1, y, fonttype, rotation, xscal, yscal, t);
                            tsc.addText(x, y+1, fonttype, rotation, xscal, yscal, t);
                        }
                    }

                    if(images != null){
                        for (int i = 0; i < images.size(); i++) {
                            ReadableMap img = images.getMap(i);
                            int x = img.getInt("x");
                            int y = img.getInt("y");
                            int imgWidth = img.getInt("width");
                            TscCommand.BITMAP_MODE mode = findBitmapMode(img.getInt("mode"));
                            String image  = img.getString("image");
                            byte[] decoded = Base64.decode(image, Base64.DEFAULT);
                            Bitmap b = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
                            tsc.addBitmap(x,y, mode, imgWidth,b);
                        }
                    }

                    tsc.addPrint(1, 1);
                    Vector<Byte> bytes = tsc.getCommand();
                    byte[] tosend = new byte[bytes.size()];
                    for(int i=0;i<bytes.size();i++){
                        tosend[i]= bytes.get(i);
                    }

                    int b = mUsbStampConnection.bulkTransfer(mStampEndPoint, tosend, tosend.length, 100000);
                    Log.i(LOG_TAG, "Return Status: b-->" + b);
                    closeConnectionStampIfExists();
                }
            }).start();
        } else {
            String msg = "failed to connected to device";
            Log.v(LOG_TAG, msg);
            errorCallback.invoke(msg);
        }
    }

    @Override
    public void printImageBase64(final Bitmap bitmapImage, int imageWidth, int imageHeight, Callback errorCallback) {
        if(bitmapImage == null) {
            errorCallback.invoke("image not found");
            return;
        }

        Log.v(LOG_TAG, "start to print image data " + bitmapImage);
        boolean isConnected = openConnection();
        if (isConnected) {
            Log.v(LOG_TAG, "Connected to device");
            int[][] pixels = getPixelsSlow(bitmapImage, imageWidth, imageHeight);

            int b = mUsbDeviceConnection.bulkTransfer(mEndPoint, SET_LINE_SPACE_24, SET_LINE_SPACE_24.length, 100000);

            b = mUsbDeviceConnection.bulkTransfer(mEndPoint, CENTER_ALIGN, CENTER_ALIGN.length, 100000);

            for (int y = 0; y < pixels.length; y += 24) {
                // Like I said before, when done sending data,
                // the printer will resume to normal text printing
                mUsbDeviceConnection.bulkTransfer(mEndPoint, SELECT_BIT_IMAGE_MODE, SELECT_BIT_IMAGE_MODE.length, 100000);

                // Set nL and nH based on the width of the image
                byte[] row = new byte[]{(byte)(0x00ff & pixels[y].length)
                        , (byte)((0xff00 & pixels[y].length) >> 8)};

                mUsbDeviceConnection.bulkTransfer(mEndPoint, row, row.length, 100000);

                for (int x = 0; x < pixels[y].length; x++) {
                    // for each stripe, recollect 3 bytes (3 bytes = 24 bits)
                    byte[] slice = recollectSlice(y, x, pixels);
                    mUsbDeviceConnection.bulkTransfer(mEndPoint, slice, slice.length, 100000);
                }

                // Do a line feed, if not the printing will resume on the same line
                mUsbDeviceConnection.bulkTransfer(mEndPoint, LINE_FEED, LINE_FEED.length, 100000);
            }

            mUsbDeviceConnection.bulkTransfer(mEndPoint, SET_LINE_SPACE_32, SET_LINE_SPACE_32.length, 100000);
            mUsbDeviceConnection.bulkTransfer(mEndPoint, LINE_FEED, LINE_FEED.length, 100000);
        } else {
            String msg = "failed to connected to device";
            Log.v(LOG_TAG, msg);
            errorCallback.invoke(msg);
        }

    }

    @Override
    public void printQrCode(String qrCode, Callback errorCallback) {

    }

    private byte[] recollectSlice(int y, int x, int[][] img) {
        byte[] slices = new byte[] { 0, 0, 0 };
        for (int yy = y, i = 0; yy < y + 24 && i < 3; yy += 8, i++) {
            byte slice = 0;
            for (int b = 0; b < 8; b++) {
                int yyy = yy + b;
                if (yyy >= img.length) {
                    continue;
                }
                int col = img[yyy][x];
                boolean v = shouldPrintColor(col);
                slice |= (byte) ((v ? 1 : 0) << (7 - b));
            }
            slices[i] = slice;
        }
        return slices;
    }

    private boolean shouldPrintColor(int col) {
        final int threshold = 127;
        int a, r, g, b, luminance;
        a = (col >> 24) & 0xff;
        if (a != 0xff) {// Ignore transparencies
            return false;
        }
        r = (col >> 16) & 0xff;
        g = (col >> 8) & 0xff;
        b = col & 0xff;

        luminance = (int) (0.299 * r + 0.587 * g + 0.114 * b);

        return luminance < threshold;
    }

    public static Bitmap resizeTheImageForPrinting(Bitmap image) {
        // making logo size 150 or less pixels
        int width = image.getWidth();
        int height = image.getHeight();
        if (width > 200 || height > 200) {
            if (width > height) {
                float decreaseSizeBy = (200.0f / width);
                return getBitmapResized(image, decreaseSizeBy);
            } else {
                float decreaseSizeBy = (200.0f / height);
                return getBitmapResized(image, decreaseSizeBy);
            }
        }
        return image;
    }

    public static int getRGB(Bitmap bmpOriginal, int col, int row) {
        // get one pixel color
        int pixel = bmpOriginal.getPixel(col, row);
        // retrieve color of all channels
        int R = Color.red(pixel);
        int G = Color.green(pixel);
        int B = Color.blue(pixel);
        return Color.rgb(R, G, B);
    }

    public static Bitmap getBitmapResized(Bitmap image, float decreaseSizeBy) {
        Bitmap resized = Bitmap.createScaledBitmap(image, (int) (image.getWidth() * decreaseSizeBy),
                (int) (image.getHeight() * decreaseSizeBy), true);
        return resized;
    }

    private TscCommand.BARCODETYPE findBarcodeType(String type) {
        TscCommand.BARCODETYPE barcodeType = TscCommand.BARCODETYPE.CODE128;
        for (TscCommand.BARCODETYPE t : TscCommand.BARCODETYPE.values()) {
            if ((""+t.getValue()).equalsIgnoreCase(type)) {
                barcodeType = t;
                break;
            }
        }
        return barcodeType;
    }

    private TscCommand.READABLE findReadable(int readable) {
        TscCommand.READABLE ea = TscCommand.READABLE.EANBLE;
        if (TscCommand.READABLE.DISABLE.getValue() == readable) {
            ea = TscCommand.READABLE.DISABLE;
        }
        return ea;
    }

    private TscCommand.FONTMUL findFontMul(int scan) {
        TscCommand.FONTMUL mul = TscCommand.FONTMUL.MUL_1;
        for (TscCommand.FONTMUL m : TscCommand.FONTMUL.values()) {
            if (m.getValue() == scan) {
                mul = m;
                break;
            }
        }
        return mul;
    }

    private TscCommand.ROTATION findRotation(int rotation) {
        TscCommand.ROTATION rt = TscCommand.ROTATION.ROTATION_0;
        for (TscCommand.ROTATION r : TscCommand.ROTATION.values()) {
            if (r.getValue() == rotation) {
                rt = r;
                break;
            }
        }
        return rt;
    }

    private TscCommand.FONTTYPE findFontType(String fonttype) {
        TscCommand.FONTTYPE ft = TscCommand.FONTTYPE.FONT_CHINESE;
        for (TscCommand.FONTTYPE f : TscCommand.FONTTYPE.values()) {
            if ((""+f.getValue()).equalsIgnoreCase(fonttype)) {
                ft = f;
                break;
            }
        }
        return ft;
    }

    private TscCommand.BITMAP_MODE findBitmapMode(int mode){
        TscCommand.BITMAP_MODE bm = TscCommand.BITMAP_MODE.OVERWRITE;
        for (TscCommand.BITMAP_MODE m : TscCommand.BITMAP_MODE.values()) {
            if (m.getValue() == mode) {
                bm = m;
                break;
            }
        }
        return bm;
    }
}
