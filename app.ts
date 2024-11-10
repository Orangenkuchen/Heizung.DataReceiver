import SerialDataRepository = require("./Data/Serial/SerialDataRepository");
import SerialDataConverter = require("./Converter/SerialDataConverter");
import { APIService } from "./Services/APIService";
import fs = require("fs");
import { Console } from "console";

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
     * Beinhaltet die Heizungsdaten, welche nicht gespeichert werden konnten, weil die Api nicht erreichbar ist.
     * Wird im ganzen an die Api gesendet, wenn diese wieder erreichbar ist.
     */
    private offlineValuesArray: Array<SerialDataConverter.SerialDataConverter.HistoryHeaterValue>;

    /**
     * Gibt an, ob neue Daten empfangen wurden, die noch nicht an die Api gesendet wurden
     */
    private newData: boolean;

    /**
     * Gibt an, wann zuletzt versucht wurde die Verbindung zum seriellen Port wieder herzustellen
     */
    private lastConnectTry: Date | null;

    /**
     * Dieser Timer wird gesetzt, wenn der Api-Server nicht erreichbar ist und wird gestoppt wenn er wieder erreichbar ist.
     */
    private offlineSaveTimer: ReturnType<typeof setInterval> | null;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Klasse
     */
    public constructor()
    {
        console.info("Initialisiere die Klasse Programm...");

        this.configuration = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        this.usbSerialPortRepository = new SerialDataRepository.SerialDataRepository.SerialDataRepository(this.configuration["SerialPort"]);
        this.apiService = new APIService(this.configuration["DestinationApiAdress"]);

        this.lastDataHashTable = {};
        this.newData = false;
        this.lastConnectTry = null;
        this.offlineSaveTimer = null;
        this.offlineValuesArray = new Array<SerialDataConverter.SerialDataConverter.HistoryHeaterValue>();

        let clearStatusIntervalMs = 60 * 60 * 1000;
        console.info("Starten den Interval zum ablöschen des aktuellen Status (damit alles neu übertragen wird; %i)...", clearStatusIntervalMs);
        setInterval(() => {
            // Löscht die HashTable, damit alle Daten übertragen werden.
            console.debug("Lösche den aktuellen Status, damit alles neu übertragen wird...");
            this.lastDataHashTable = {};
        }, clearStatusIntervalMs);

        let sendNewDataToApiIfAwailableMs = 2000;
        console.info("State den Interval (%i ms) zum überprüfen und senden von neuen Daten an die API...", sendNewDataToApiIfAwailableMs);
        setInterval(() =>
            {
                this.CheckIfNewDataToSendExists();
            },
            sendNewDataToApiIfAwailableMs
        );

        setInterval(
            () => {
                this.ReconnectSerialIfDisconnected();
            },
            10 * 1000
        );

        console.info("Programm initialisiert...");
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
    }
    // #endregion

    // #region CheckIfNewDataToSendExists
    /**
     * Überprüft, ob neue Daten vorhanden sind und sendet diese dann an die API.
     */
    private CheckIfNewDataToSendExists()
    {
        if (this.newData) {
            console.debug("Neue Daten empfangen. Sende diese an die API...");

            let dataArray = new Array<SerialDataConverter.SerialDataConverter.HeaterValue>();

            for (let key in this.lastDataHashTable)
            {
                dataArray.push(this.lastDataHashTable[key])
            }

            this.apiService.SendHeaterValue(
                dataArray,
                (statusCode, responseText) => { this.HandlOnDataSendCompleted(statusCode, responseText); }
            );
            this.newData = false;
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
     * @param responseText Der Text von der Antwort
     */
    private HandlOnDataSendCompleted(httpStatusCode: number, responseText: string)
    {
        console.debug("Senden der Daten an die API abgeschlossen. Überüfe den Status code (%i, %s)...", httpStatusCode, responseText);

        if (httpStatusCode == 0)
        {
            console.debug("Senden der Daten an die API konnte nicht durchgeführt werden. Überprüfe, ob der offlineSaveTimer läuft...");

            if (this.offlineSaveTimer == null)
            {
                let offlineSaveTimerMs = 15 * 60 * 1000;
                console.debug("Der Offline-Save-Timer läuft noch nicht. Erstelle diesen (%i ms)...", offlineSaveTimerMs);
                
                this.offlineSaveTimer = setInterval(
                    () => {
                        console.debug("Offline-Timer abgelaufen. Da keine Verbindung zur Api besteht, werden die aktuellen Daten zwischengespeichert...");

                        for (let propertyName in this.lastDataHashTable)
                        {
                            this.offlineValuesArray.push(
                                {
                                    index: this.lastDataHashTable[propertyName].index,
                                    multiplicator: this.lastDataHashTable[propertyName].multiplicator,
                                    name: this.lastDataHashTable[propertyName].name,
                                    unit: this.lastDataHashTable[propertyName].unit,
                                    value: this.lastDataHashTable[propertyName].value,
                                    timestamp: new Date()
                                }
                            );
                        }

                        console.debug("Element in der Offline-Queue: %i", this.offlineValuesArray.length);
                    },
                    offlineSaveTimerMs
                );
            }
        }
        else if (httpStatusCode >= 200 && httpStatusCode <= 299)
        {
            console.debug("Senden der Daten an die API war erfolgreich.");

            if (this.offlineSaveTimer != null)
            {
                console.debug("Der Offline-Save-Timer ist noch aktiv. Da das senden erfolgreich war, wird dieser gestoppt...");

                clearInterval(this.offlineSaveTimer);
                this.offlineSaveTimer = null;
            }

            if (this.offlineValuesArray.length > 0)
            {
                console.debug("Es sind noch Offline-Daten vorhanden (%i). Sende diese an die API...", this.offlineValuesArray.length);
                console.debug("TEST: %s", JSON.stringify(this.offlineValuesArray));
                this.apiService.SendHeaterHistoryData(
                    this.offlineValuesArray, 
                    (httpStatus, responseText) =>
                    {
                        console.debug("Senden der Offline-Daten abgeschlossen. Überpüfe den Status code...");

                        if (httpStatus >= 200 && httpStatus <= 299)
                        {
                            console.debug("Senden der Offlilne-Daten an die API erfolgreich. Lösche diese ab...");
                            this.offlineValuesArray.length = 0;
                        }
                        else
                        {
                            console.error("Senden der Offline-Daten an die Api fehlgeschlagen (%i, %s)...", httpStatus, responseText);
                        }
                    }
                );
                this.offlineValuesArray.length = 0;
            }
        }
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
            new Date().getTime() - this.lastConnectTry.getTime() > 30 * 1000))
        {
            console.warn("Verbindung zum USB-Seriell-Adapter verloren. Verbindung wird wiederhergestellt.");

            try {
                this.lastConnectTry = new Date();
                this.usbSerialPortRepository.connect((data) => {  this.HandleOnDataReceived(data) });
            } catch (exception) {
                console.error(`Fehler beim Verbinden zum USB-Seriell-Adapter: ${exception}`);
            }
        }
    }
    // #endregion
}

console.info("State den Hauptablauf...");
let programm = new Program();