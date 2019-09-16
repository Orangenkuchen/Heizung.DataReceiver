import SerialDataRepository = require("./Data/Serial/SerialDataRepository");
import SerialDataConverter = require("./Converter/SerialDataConverter");
import HeizungsRepository = require("./Data/Database/HeizungRepository");
import mariaDB = require('mariadb');

console.info("Starte Heizung.DataReceiver");

let usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository("/dev/ttyUSB0");

let connectionPool = mariaDB.createPool({
    host: '***REMOVED***', 
    user:'heizung-user', 
    database: 'Heizung',
    password: '***REMOVED***',
    port: 3306,
    connectionLimit: 5
});
let heizungsRepository = new HeizungsRepository.HeizungsRepository.HeizungsRepository(connectionPool);
let neccessaryValuesHashTable: Object = {};

let handleOnDataReceived = function(data: string) {
    let convertedDataArray = SerialDataConverter.SerialDataConverter.SerialDataConverter.heaterDataToArray(data);

    convertedDataArray.forEach((convertedData) => {
        if (typeof neccessaryValuesHashTable[convertedData.index] != "undefined") {
            console.log(`Datensatz für '${convertedData.name}' erhalten.`)
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
        console.log("Alle Datenensätze erhalten. Trenne Verbindung zum USB-Sereill-Adapter")
        usbSerialPortRepository.disconnect();

        let errorIdPromise = heizungsRepository.GetErrorId(neccessaryValuesHashTable[99].value);

        let saveValues = function(errorId) {
            neccessaryValuesHashTable[99].value = errorId;

            let filteredHaterValues = new Array<SerialDataConverter.SerialDataConverter.HeaterValue>();
            for(let paramName in neccessaryValuesHashTable) {
                filteredHaterValues.push(neccessaryValuesHashTable[paramName]);
            }

            console.log("Speichere alle erhaltenen Datensätze in der Datenbank.")
            let saveDonePromise = heizungsRepository.SetHeaterValue(filteredHaterValues);

            saveDonePromise.then(value => console.log("Speichern in der Datenbank erfolgreich."))
                           .catch(exception => console.log(`Speichern in der Datenbank nicht erfolgreich (${exception.toString()})`))
                           .finally(function() {
                console.log("Schließe das Programm.")
                process.exit();
            });
        }

        errorIdPromise.then((errorId) => {
            if (errorId == null) {
                errorIdPromise = heizungsRepository.SetNewError(neccessaryValuesHashTable[99].value);

                errorIdPromise.then(saveValues);
            } else {
                saveValues(errorId);
            }
        })
        .catch(exception => process.exit(1));
    }
}

console.log("Ermittle die Tabelle über die Werte, welche geloggt werden sollen aus 'ValueDescriptions'");
// Ermittelt anhand der Datenbank alle Werte welche für einen Zeitpunkt benötigt werden
var valueDescriptionsPromise = heizungsRepository.GetAllValueDescriptions();
valueDescriptionsPromise.then((valueDescriptions) => {
    valueDescriptions.forEach((valueDescription) => {
        if (valueDescription.isLogged == true) {
            neccessaryValuesHashTable[valueDescription.id.toString()] = null;
        }
    });

    console.log("Verbinde zu USB-Seriell-Adapter")
    usbSerialPortRepository.connect(handleOnDataReceived);
})
.catch(exception => process.exit(1));