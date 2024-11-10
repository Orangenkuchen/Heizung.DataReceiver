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
        let xmlHttpRequest = new XMLHttpRequest();

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
    public SendHeaterHistoryData(heaterValues: Array<SerialDataConverter.HistoryHeaterValue>, onDoneCallback: (htmlStatusCode: number, resposeText: string) => void) {
        let xml_HttpRequest = new XMLHttpRequest();

        xml_HttpRequest.open('PUT', this.apiAddress + '/HeaterData/HistoryData', true);
        xml_HttpRequest.setRequestHeader('Content-Type', 'application/json');

        xml_HttpRequest.onreadystatechange = function () {
            console.debug("SendHeaterHistoryData status: %i", xml_HttpRequest.readyState);

            if (xml_HttpRequest.readyState === XMLHttpRequest.DONE) {
                onDoneCallback(xml_HttpRequest.status, xml_HttpRequest.responseText);
            }
        };
        
        xml_HttpRequest.send(JSON.stringify(heaterValues));
    }
    // #endregion
}