import { SerialDataConverter } from "../Converter/SerialDataConverter";
import { XMLHttpRequest } from "xmlhttprequest";

export class APIService {
    // #region fields
    /**
     * Die Adresse von der API
     */
    private apiAddress: string;
    // #endregion

    // #region ctor
    /**
     * Initialisiert den Service
     * 
     * @parm apiAddress Die Adresse von der API
     */
    public constructor(apiAddress: string) {
        this.apiAddress = apiAddress;
    }
    // #endregion

    // #region SendHeaterValue
    /**
     * Sendet die Heizwerte an die API
     * 
     * @param heaterValues Die Daten, welche gesendet werden sollen
     * @param onDoneCallback Dieses Callback wird dann aufgerufen, wenn der Request abgeschlossen ist.
     */
    public SendHeaterValue(heaterValues: Array<SerialDataConverter.HeaterValue>, onDoneCallback: (htmlStatusCode: number, resposeText: string) => void) {
        var xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.open('PUT', this.apiAddress + '/HeaterData/Latest', true);
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/json');

        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === xmlHttpRequest.DONE) {
                onDoneCallback(xmlHttpRequest.status, xmlHttpRequest.responseText);
            }
        };
        

        xmlHttpRequest.send(JSON.stringify(heaterValues));
    }
    // #endregion

    // #region SendHeaterHistoryData
    /**
     * Sendet Heizungsdaten, die in die Datenbank eingefügt werden sollen an die API
     * 
     * @param heaterValues Die Daten, welche gesendet werden sollen
     * @param onDoneCallback Dieses Callback wird dann aufgerufen, wenn der Request abgeschlossen ist.
     */
    public SendHeaterHistoryData(heaterValues: Array<SerialDataConverter.HeaterValue>, onDoneCallback: (htmlStatusCode: number, resposeText: string) => void) {
        var xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.open('PUT', this.apiAddress + '/HeaterData/HistoryData', true);
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/json');

        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
                onDoneCallback(xmlHttpRequest.status, xmlHttpRequest.responseText);
            }
        };
        
        xmlHttpRequest.send(JSON.stringify(heaterValues));
    }
    // #endregion
}