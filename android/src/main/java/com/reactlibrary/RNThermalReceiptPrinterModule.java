
package com.reactlibrary;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class RNThermalReceiptPrinterModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public RNThermalReceiptPrinterModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNThermalReceiptPrinter";
  }

  @ReactMethod
  public void greetUserWithPromises(String name, Boolean isAdmin, Promise promise) {
      System.out.println("User Name: " + name + ", Administrator: " + (isAdmin ? "Yes" : "No"));

      String greeting = "Welcome " + name + ", you " + (isAdmin ? "are" : "are not") + " an administrator";

      promise.resolve(greeting);
  }
}