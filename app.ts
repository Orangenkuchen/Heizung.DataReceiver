import SerialDataRepository = require("./Data/Serial/SerialDataRepository");
import SerialDataConverter = require("./Converter/SerialDataConverter");
import { APIService } from "./Services/APIService";
import fs = require("fs");

/**
 * Die Settings von der Anwendung
 */
interface Settings
{
    /**
     * Die Adresse von der Api, zu der die Daten gesendet werden sollen
     */
    DestinationApiAdress: string,

    /**
     * Der Pfad vom seriellen Port, mit dem die Heizungsdaten ausgelesen werden können.
     */
    SerialPort: string
}

console.info("Starte Heizung.DataReceiver");

/**
 * Das Hauptprogramm
 */
class Program
{
    // #region fields
    /**
     * Die Settings von der Anwendung
     */
    private configuration: Settings;

    /**
     * Repository für die Serielle-Verbindung
     */
    private usbSerialPortRepository: SerialDataRepository.SerialDataRepository.SerialDataRepository;

    /**
     * Service für die Kommunikation mit der Api, welche die Daten speichert.
     */
    private apiService: APIService;

    /**
     * Hashtable, welche die neusten Wert beinhaltet
     */
    private lastDataHashTable: { [index: number]: SerialDataConverter.SerialDataConverter.HeaterValue };

    /**
     * Gibt an, ob neue Daten empfangen wurden, die noch nicht an die Api gesendet wurden
     */
    private newData: boolean;

    /**
     * Gibt an, wann zuletzt versucht wurde die Verbindung zum seriellen Port wieder herzustellen
     */
    private lastConnectTry: Date | null;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     */
    public constructor()
    {
        this.configuration = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        this.usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository(this.configuration["SerialPort"]);
        this.apiService = new APIService(this.configuration["DestinationApiAdress"]);

        this.lastDataHashTable = {};
        this.newData = false;
        this.lastConnectTry = null;

        setInterval(() => {
            // Löscht die HashTable, damit alle Daten übertragen werden
            this.lastDataHashTable = {};
        }, 60 * 60 * 1000);

        setInterval(
            () => {
                this.ReconnectSerialIfDisconnected();
            },
            10 * 1000
        );
    }
    // #endregion

    // #region HandleOnDataReceived
    /**
     * Wird aufgerufen, wenn neue Daten vom seriellen Port da sind.
     * Die Daten werden geparsed und an die Api gesendet.
     * 
     * @param data Die Daten von der seriellen Schnitstelle
     */
    private HandleOnDataReceived(data: string)
    {
        let convertedDataArray = SerialDataConverter.SerialDataConverter.SerialDataConverter.heaterDataToArray(data);

        convertedDataArray.forEach((convertedData) => {
            if (typeof this.lastDataHashTable[convertedData.index] == "undefined" ||
                this.lastDataHashTable[convertedData.index].value != convertedData.value) {
                this.newData = true;
                this.lastDataHashTable[convertedData.index] = convertedData;
            }
        });

        if (this.newData) {
            this.apiService.SendHeaterValue(
                convertedDataArray,
                (statusCode) => { this.HandlOnDataSendCompleted(statusCode); }
            );
        }
    }
    // #endregion

    // #region HandlOnDataSendCompleted
    /**
     * Wird aufgerufen, wenn das Senden von Daten an die API abgeschlossen ist.
     * Wenn das Senden fehl geschlagen ist, werden die Daten zwischengespeichert
     * und später gesendet.
     * 
     * @param httpStatusCode Der Status code, mit dem die Anfrage beendet wurde.
     */
    private HandlOnDataSendCompleted(httpStatusCode: number)
    {
        
    }
    // #endregion

    // #region ReconnectSerialIfDisconnected
    /**
     * Überprüft ob die Verbindung zum seriellen Port unterbrochen wurde und stellt diese dann wieder her.
     */
    private ReconnectSerialIfDisconnected()
    {
        if (this.usbSerialPortRepository.connectionState == SerialDataRepository.SerialDataRepository.ConnectionState.Disconnected ||
            (this.usbSerialPortRepository.connectionState == SerialDataRepository.SerialDataRepository.ConnectionState.Connecting &&
            new Date().getTime() - this.lastConnectTry.getTime() > 30 * 1000)) {
            console.warn("Verbindung zum USB-Seriell-Adapter verloren. Verbindung wird wiederhergestellt.");

            try {
                this.lastConnectTry = new Date();
                this.usbSerialPortRepository.connect(this.HandleOnDataReceived);
            } catch (exception) {
                console.error(`Fehler beim Verbinden zum USB-Seriell-Adapter: ${exception}`);
            }
        }
    }
    // #endregion
}

let programm = new Program();