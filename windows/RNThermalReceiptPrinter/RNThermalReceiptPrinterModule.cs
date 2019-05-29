using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Thermal.Receipt.Printer.RNThermalReceiptPrinter
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNThermalReceiptPrinterModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNThermalReceiptPrinterModule"/>.
        /// </summary>
        internal RNThermalReceiptPrinterModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNThermalReceiptPrinter";
            }
        }
    }
}
