const mariaDB = require('mariadb');
import { SerialDataConverter } from '../../Converter/SerialDataConverter'

/**
 * Beschreibung für einen Heizungswert
 */
export interface ValueDescription {
    /**
     * Die Id von der Beschreibung
     */
    id: Number;
    /**
     * Die Bschreibung vom Wert
     */
    description: String;
    /**
     * Die Einheit des Werts
     */
    unit: String;
    /**
     * Gibt an, ob der Wert in der Datenbank gespeichert wird
     */
    isLogged: Boolean;
}

export interface ErrorDescription {
    /**
     * Die Id von der Fehlerbeschreibung
     */
    id: Number;

    /**
     * Die Beschreibung vom Fehler
     */
    description: String;
}

export interface DataValue {
    /**
     * Die Id vom Messvalue
     */
    id: Number;

    /**
     * Der Typ vom Wert
     */
    valueType: Number;

    /**
     * Der Wert vom Messwert
     */
    value: Number;

    /**
     * Das Datum vom Timestamp
     */
    timestamp: Date;
}

/**
 * Converter für Daten von der seriellen Schnitstelle von der Heizung
 */
export default class HeizungsRepository {
    // #region fields
    /**
     * Pool an MariaDB Verbindungen
     */
    private connectionPool: any;
    // #endregion

    // #region ctor
    /**
     * Intialisiert das Repository
     * 
     * @param connectionPool Der Connectionpool von der Datenbank
     */
    public constructor(connectionPool: any) {
        this.connectionPool = connectionPool;
    }
    // #endregion
    GetErrorId
    // #region GetAllValueDescriptions
    /**
     * Ermittelt alle Beschreibungen der Heizwerte
     * 
     * @returns Gibt ein Promise mit allen Beschreibungen der Heizwerte zurück
     */
    public GetAllValueDescriptions(): Promise<Array<ValueDescription>> {
        let that = this;
        let valueDescriptions: Array<ValueDescription> = new Array<ValueDescription>();

        let result: Promise<Array<ValueDescription>> = new Promise<Array<ValueDescription>>(function(resolve, reject) {
            that.connectionPool.getConnection()
                            .then(connection => {
                                connection.query('SELECT * FROM Heizung.ValueDescription ORDER BY Id;')
                                            .then(rows => {
                                                rows.forEach(row => {
                                                    valueDescriptions.push({
                                                        "id": row.Id,
                                                        "description": row.Description,
                                                        "unit": row.Unit,
                                                        "isLogged": row.IsLogged[0] == 1
                                                    });
                                                })
                                                
                                                connection.release();
                                                resolve(valueDescriptions);
                                            })
                                            .catch(exception => reject(exception));
                            })
                            .catch(exception => reject(exception));
        });
        
        return result;
    } 
    // #endregion

    // #region GetAllErrorDescriptions
    /**
     * Ermittelt alle Error Ids.
     * 
     * @returns Gibt ein Promise mit einem Array von ErrorDescription
     */
    public GetAllErrorDescriptions(): Promise<Array<ErrorDescription>> {
        let that = this;

        let result: Promise<Array<ErrorDescription>> = new Promise<Array<ErrorDescription>>(function(resolve, reject) {
            that.connectionPool.getConnection()
                            .then(connection => {
                                connection.query("SELECT * FROM Heizung.ErrorList;")
                                            .then(rows => {
                                                let errorDescriptionArray = new Array<ErrorDescription>();

                                                rows.forEach(row => {
                                                    let errorDescription: ErrorDescription = {
                                                        id: row.Id,
                                                        description: row.Description
                                                    };
                                                });

                                                resolve(errorDescriptionArray)
                                            })
                                            .catch(exception => reject(exception));
                            })
                            .catch(exception => reject(exception));
        });
        
        return result;
    }
    // #endregion

    // #region GetDataValues
    /**
     * Ermittelt alle Daten innerhalb des Zeitraums
     * 
     * @param errorText Der Fehlertext dessen Id gesucht werden soll
     * @returns Gibt ein Promise mit der Id oder null zurück
     */
    public GetDataValues(fromDate: Date, toDate: Date): Promise<Array<DataValue>> {
        let that = this;

        let result: Promise<Array<DataValue>> = new Promise<Array<DataValue>>(function(resolve, reject) {
            that.connectionPool.getConnection()
                            .then(connection => {
                                connection.query(`SELECT * FROM Heizung.ErrorList Where Description = '${errorText}';`)
                                            .then(rows => {
                                                let id = null;

                                                if (rows.length > 0) {
                                                    id = rows[0].Id;
                                                }
                                                
                                                connection.release();
                                                resolve(id);
                                            })
                                            .catch(exception => reject(exception));
                            })
                            .catch(exception => reject(exception));
        });
        
        return result;
    }
    // #endregion

    // #region SetValueDescriptionLoggingState
    /**
     * Erzeugt einen neuen Eintrag in der FehlerTabelle
     * 
     * @param errorText Der Fehlertext von der neuen Fehlermeldung
     * @returns Gibt ein Promise mit der Id zurück
     */
    public SetValueDescriptionLoggingState(errorText: string): Promise<Number> {
        let that = this;

        let result: Promise<Number> = new Promise<Number>(function(resolve, reject) {
            that.connectionPool.getConnection()
                            .then(connection => {
                                connection.query(`INSERT INTO 'ErrorList' (Description) VALUE ('${errorText}')`)
                                            .then(result => {
                                                connection.release();
                                                resolve(result.insertId);
                                            })
                                            .catch(exception => reject(exception));
                            })
                            .catch(exception => reject(exception));
        });
        
        return result;
    }
    // #endregion

    /**
     * You first need to create a formatting function to pad numbers to two digits…
     **/
    private twoDigits(d): string {
        if(0 <= d && d < 10) return "0" + d.toString();
        if(-10 < d && d < 0) return "-0" + (-1*d).toString();
        return d.toString();
    }
}