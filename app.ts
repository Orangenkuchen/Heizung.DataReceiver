import SerialDataRepository = require("./Data/Serial/SerialDataRepository");
import SerialDataConverter = require("./Converter/SerialDataConverter");
import { APIService } from "./Services/APIService";

console.info("Starte Heizung.DataReceiver");

let usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository("/dev/ttyUSB0");
//let apiService: APIService = new APIService("http://***REMOVED***:8080");
let apiService: APIService = new APIService("http://***REMOVED***:8080");
let lastDataHashTable: { [index: number]: SerialDataConverter.SerialDataConverter.HeaterValue } = {};

let handleOnDataReceived = function(data: string) {
    let convertedDataArray = SerialDataConverter.SerialDataConverter.SerialDataConverter.heaterDataToArray(data);
    let newData = false;

    convertedDataArray.forEach((convertedData) => {
        if (typeof lastDataHashTable[convertedData.index] == "undefined" ||
            lastDataHashTable[convertedData.index].value != convertedData.value) {
            newData = true;
            lastDataHashTable[convertedData.index] = convertedData;
        }
    });

    if (newData) {
        apiService.SendHeaterValue(convertedDataArray);
    }
}

let lastConnectTry = null;

setInterval(() => {
    if (usbSerialPortRepository.connectionState == SerialDataRepository.SerialDataRepository.ConnectionState.Disconnected ||
        (usbSerialPortRepository.connectionState == SerialDataRepository.SerialDataRepository.ConnectionState.Connecting &&
         new Date().getTime() - lastConnectTry.getTime() > 30 * 1000)) {
        console.warn("Verbindung zum USB-Seriell-Adapter verloren. Verbindung wird wiederhergestellt.");

        try {
            lastConnectTry = new Date();
            usbSerialPortRepository.connect(handleOnDataReceived);
        } catch (exception) {
            console.error(`Fehler beim Verbinden zum USB-Seriell-Adapter: ${exception}`);
        }
    }
}, 10 * 1000);

setInterval(() => {
    // Löscht die HashTable, damit alle Daten übertragen werden
    lastDataHashTable = {};
}, 60 * 60 * 1000);