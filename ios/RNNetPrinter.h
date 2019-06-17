

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNNetPrinter : RCTEventEmitter <RCTBridgeModule>{
    NSString *connected_ip;
    NSString *current_scan_ip;
    NSMutableArray* _printerArray;
    bool is_scanning;
}

@end

