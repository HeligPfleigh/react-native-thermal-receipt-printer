import { Buffer } from "buffer";
var BufferHelper = /** @class */ (function () {
    function BufferHelper() {
        var _this = this;
        this.concat = function (buffer) {
            _this.buffers.push(buffer);
            _this.size += buffer.length;
            return _this;
        };
        this.empty = function () {
            _this.buffers = [];
            _this.size = 0;
            return _this;
        };
        this.toBuffer = function () { return Buffer.concat(_this.buffers, _this.size); };
        this.toString = function (encoding) {
            return _this.toBuffer().toString(encoding);
        };
        this.load = function (stream, callback) {
            stream.on("data", function (trunk) {
                _this.concat(trunk);
            });
            stream.on("end", function () {
                callback(null, _this.toBuffer());
            });
            stream.once("error", callback);
        };
        this.buffers = [];
        this.size = 0;
    }
    Object.defineProperty(BufferHelper.prototype, "length", {
        get: function () {
            return this.size;
        },
        enumerable: false,
        configurable: true
    });
    return BufferHelper;
}());
export default BufferHelper;
