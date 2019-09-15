import SerialDataRepository = require("./Data/Serial/SerialDataRepository");
import SerialDataConverter = require("./Converter/SerialDataConverter");
import HeizungsRepository = require("./Data/Database/HeizungRepository");
import mariaDB = require('mariadb');

console.info("Starte Heizung.DataReceiver");

let usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository("/dev/ttyUSB0");

let connectionPool = mariaDB.createPool({
    host: '***REMOVED***', 
    user:'heizung-user', 
    password: '***REMOVED***',
    connectionLimit: 5
});
let heizungsRepository = new HeizungsRepository.HeizungsRepository.HeizungsRepository(connectionPool);
let neccessaryValuesHashTable: Object = {};

let handleOnDataReceived = function(data: string) {
    let convertedDataArray = SerialDataConverter.SerialDataConverter.SerialDataConverter.heaterDataToArray(data);

    convertedDataArray.forEach((convertedData) => {
        if (typeof neccessaryValuesHashTable[convertedData.index] != "undefined") {
            neccessaryValuesHashTable[convertedData.index] = convertedData;
        }
    });

    var allValueReceived = true;
    for(let paramName in neccessaryValuesHashTable) {
        if (neccessaryValuesHashTable[paramName] == null) {
            allValueReceived = false;
            break;
        }
    }

    // Wenn alle Werte angekommen sind kann der SerialPortListener beendet werden.
    if (allValueReceived == true) {
        usbSerialPortRepository.disconnect();

        // TODO Speichern
        let errorId = heizungsRepository.GetErrorId(neccessaryValuesHashTable[99].value);

        if (errorId = null) {
            errorId = heizungsRepository.SetNewError(neccessaryValuesHashTable[99].value);
        }

        neccessaryValuesHashTable[99].value = errorId;

        let filteredHaterValues = new Array<SerialDataConverter.SerialDataConverter.HeaterValue>();
        for(let paramName in neccessaryValuesHashTable) {
            filteredHaterValues.push(neccessaryValuesHashTable[paramName]);
        }

        heizungsRepository.SetHeaterValue(filteredHaterValues);
    }
}

// Ermittelt anhand der Datenbank alle Werte welche für einen Zeitpunkt benötigt werden
var valueDescriptionsPromise = heizungsRepository.GetAllValueDescriptions();
valueDescriptionsPromise.then((valueDescriptions) => {
    valueDescriptions.forEach((valueDescription) => {
        if (valueDescription.isLogged == true) {
            neccessaryValuesHashTable[valueDescription.id.toString()] = null;
        }
    });
});
usbSerialPortRepository.connect(handleOnDataReceived);

console.info("Gestartet");