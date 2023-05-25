package com.pinmi.react.printer.adapter;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by xiesubin on 2017/9/22.
 */
public class NetPrinterAdapter implements PrinterAdapter {
    private static NetPrinterAdapter mInstance;
    private ReactApplicationContext mContext;
    private String LOG_TAG = "RNNetPrinter";
    private NetPrinterDevice mNetDevice;

    // TODO- support other ports later
    // private int[] PRINTER_ON_PORTS = {515, 3396, 9100, 9303};

    private int[] PRINTER_ON_PORTS = { 9100 };
    private static final String EVENT_SCANNER_RESOLVED = "scannerResolved";
    private static final String EVENT_SCANNER_RUNNING = "scannerRunning";

    private Socket mSocket;

    private boolean isRunning = false;

    private NetPrinterAdapter() {
    }

    public static NetPrinterAdapter getInstance() {
        if (mInstance == null) {
            mInstance = new NetPrinterAdapter();

        }
        return mInstance;
    }

    @Override
    public void init(ReactApplicationContext reactContext, Callback successCallback, Callback errorCallback) {
        this.mContext = reactContext;
        successCallback.invoke();
    }

    @Override
    public List<PrinterDevice> getDeviceList(Callback errorCallback) {
        this.scan();
        List<PrinterDevice> printerDevices = new ArrayList<>();
        return printerDevices;
    }

    private void scan() {
        if (isRunning)
            return;

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    isRunning = true;
                    emitEvent(EVENT_SCANNER_RUNNING, isRunning);

                    WifiManager wifiManager = (WifiManager) mContext.getApplicationContext()
                            .getSystemService(Context.WIFI_SERVICE);
                    String ipAddress = ipToString(wifiManager.getConnectionInfo().getIpAddress());
                    WritableArray array = Arguments.createArray();

                    String prefix = ipAddress.substring(0, ipAddress.lastIndexOf('.') + 1);
                    int suffix = Integer
                            .parseInt(ipAddress.substring(ipAddress.lastIndexOf('.') + 1, ipAddress.length()));

                    for (int i = 0; i <= 255; i++) {
                        if (i == suffix)
                            continue;

                        ArrayList<Integer> ports = getAvailablePorts(prefix + i);
                        if (!ports.isEmpty()) {
                            WritableMap payload = Arguments.createMap();

                            payload.putString("host", prefix + i);
                            payload.putInt("port", 9100);

                            array.pushMap(payload);
                        }
                    }

                    emitEvent(EVENT_SCANNER_RESOLVED, array);

                } catch (NullPointerException ex) {
                    Log.i(LOG_TAG, "No connection");
                } finally {
                    isRunning = false;
                    emitEvent(EVENT_SCANNER_RUNNING, isRunning);
                }
            }
        }).start();
    }

    private void emitEvent(String eventName, Object data) {
        if (mContext != null) {
            mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, data);
        }
    }

    private ArrayList<Integer> getAvailablePorts(String address) {
        ArrayList<Integer> ports = new ArrayList<>();
        for (int port : PRINTER_ON_PORTS) {
            if (crunchifyAddressReachable(address, port))
                ports.add(port);
        }

        return ports;
    }

    private static boolean crunchifyAddressReachable(String address, int port) {
        try {
            try (Socket crunchifySocket = new Socket()) {
                // Connects this socket to the server with a specified timeout value.
                crunchifySocket.connect(new InetSocketAddress(address, port), 100);
            }
            // Return true if connection successful
            return true;
        } catch (IOException exception) {
            exception.printStackTrace();
            return false;
        }
    }

    private String ipToString(int ip) {
        return (ip & 0xFF) + "." + ((ip >> 8) & 0xFF) + "." + ((ip >> 16) & 0xFF) + "." + ((ip >> 24) & 0xFF);
    }

    @Override
    public void selectDevice(PrinterDeviceId printerDeviceId, Callback sucessCallback, Callback errorCallback) {
        NetPrinterDeviceId netPrinterDeviceId = (NetPrinterDeviceId) printerDeviceId;

        if (this.mSocket != null && !this.mSocket.isClosed()
                && mNetDevice.getPrinterDeviceId().equals(netPrinterDeviceId)) {
            Log.i(LOG_TAG, "already selected device, do not need repeat to connect");
            sucessCallback.invoke(this.mNetDevice.toRNWritableMap());
            return;
        }

        try {
            Socket socket = new Socket(netPrinterDeviceId.getHost(), netPrinterDeviceId.getPort());
            if (socket.isConnected()) {
                closeConnectionIfExists();
                this.mSocket = socket;
                this.mNetDevice = new NetPrinterDevice(netPrinterDeviceId.getHost(), netPrinterDeviceId.getPort());
                sucessCallback.invoke(this.mNetDevice.toRNWritableMap());
            } else {
                errorCallback.invoke("unable to build connection with host: " + netPrinterDeviceId.getHost()
                        + ", port: " + netPrinterDeviceId.getPort());
                return;
            }
        } catch (IOException e) {
            e.printStackTrace();
            errorCallback.invoke("failed to connect printer: " + e.getMessage());
        }
    }

    @Override
    public void closeConnectionIfExists() {
        if (this.mSocket != null) {
            if (!this.mSocket.isClosed()) {
                try {
                    this.mSocket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            this.mSocket = null;
        }
    }

    @Override
    public void printRawData(String rawBase64Data, Callback errorCallback) {
        if (this.mSocket == null) {
            errorCallback.invoke("bluetooth connection is not built, may be you forgot to connectPrinter");
            return;
        }

        final String rawData = rawBase64Data;
        final Socket socket = this.mSocket;
        Log.v(LOG_TAG, "start to print raw data " + rawBase64Data);

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    byte[] bytes = Base64.decode(rawData, Base64.DEFAULT);
                    OutputStream printerOutputStream = socket.getOutputStream();
                    printerOutputStream.write(bytes, 0, bytes.length);
                    printerOutputStream.flush();
                } catch (IOException e) {
                    Log.e(LOG_TAG, "failed to print data" + rawData);
                    e.printStackTrace();
                }
            }
        }).start();
    }
}
