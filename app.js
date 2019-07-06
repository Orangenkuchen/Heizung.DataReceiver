"use strict";
exports.__esModule = true;
var SerialDataRepository = require("./Data/Serial/SerialDataRepository");
var SerialDataConverter = require("./Converter/SerialDataConverter");
console.info("Starte Heizung.DataReceiver");
var usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository("/dev/ttyUSB0");
var handleOnDataReceived = function (data) {
    var convertedData = SerialDataConverter.SerialDataConverter.SerialDataConverter.heaterDataToArray(data);
    debugger;
};
usbSerialPortRepository.connect(handleOnDataReceived);
console.info("Gestartet");
//# sourceMappingURL=app.js.map