import SerialDataRepository = require("./Data/Serial/SerialDataRepository");
import SerialDataConverter = require("./Converter/SerialDataConverter");

console.info("Starte Heizung.DataReceiver");

var usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository("/dev/ttyUSB0");

let handleOnDataReceived = function(data: string) {
    let convertedData = SerialDataConverter.SerialDataConverter.SerialDataConverter.heaterDataToArray(data);

    debugger;
}

usbSerialPortRepository.connect(handleOnDataReceived);
console.info("Gestartet");