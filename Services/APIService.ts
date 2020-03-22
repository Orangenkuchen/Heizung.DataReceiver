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
     */
    public SendHeaterValue(heaterValues: Array<SerialDataConverter.HeaterValue>) {
        var xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.open('POST', this.apiAddress + '/HeaterData', true);
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/json');
        xmlHttpRequest.send(JSON.stringify(heaterValues));
    }
    // #endregion
}