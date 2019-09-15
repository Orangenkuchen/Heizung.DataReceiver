const mariaDB = require('mariadb');
import { SerialDataConverter } from '../../Converter/SerialDataConverter'

export namespace HeizungsRepository {
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

    /**
     * Converter für Daten von der seriellen Schnitstelle von der Heizung
     */
    export class HeizungsRepository {
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
                                                  
                                                  connection.end();
                                                  resolve(valueDescriptions);
                                              })
                                              .catch(exc => console.error(exc));
                               })
                               .catch(exc => console.error(exc));
            });
            
            return result;
        } 
        // #endregion

        // #region GetErrorId
        /**
         * Ermittelt die Id vom einem Fehlertext. Wenn der Fehlertext noch nicht existiert wird null zurückgegeben.
         * 
         * @param errorText Der Fehlertext dessen Id gesucht werden soll
         * @returns Gibt ein Promise mit der Id oder null zurück
         */
        public GetErrorId(errorText: string): Promise<Number> {
            let that = this;

            let result: Promise<Number> = new Promise<Number>(function(resolve, reject) {
                that.connectionPool.getConnection()
                               .then(connection => {
                                    connection.query(`SELECT * FROM Heizung.ErrorList Where Description = '${errorText}';`)
                                              .then(rows => {
                                                  let id = null;

                                                  if (rows.length > 0) {
                                                      id = rows[0].Id;
                                                  }
                                                  
                                                  connection.end();
                                                  resolve(id);
                                              })
                                              .catch(exc => console.error(exc));
                               })
                               .catch(exc => console.error(exc));
            });
            
            return result;
        }
        // #endregion

        // #region SetNewError
        /**
         * Erzeugt einen neuen Eintrag in der FehlerTabelle
         * 
         * @param errorText Der Fehlertext von der neuen Fehlermeldung
         * @returns Gibt ein Promise mit der Id zurück
         */
        public SetNewError(errorText: string): Promise<Number> {
            let that = this;

            let result: Promise<Number> = new Promise<Number>(function(resolve, reject) {
                that.connectionPool.getConnection()
                               .then(connection => {
                                    connection.query(`INSERT INTO 'ErrorList' (Description) VALUE ('${errorText}')`)
                                              .then(result => {
                                                  connection.end();
                                                  resolve(result.insertId);
                                              })
                                              .catch(exc => console.error(exc));
                               })
                               .catch(exc => console.error(exc));
            });
            
            return result;
        }
        // #endregion

        // #region SetHeaterValue
        /**
         * Fügt neue Heizwerte in die Tabelle hinzu
         * 
         * @param heaterValues Array mit den HeaterValues
         * @returns Gibt ein Promise das angibt wenn der Insert abgeschlossen wurde
         */
        public SetHeaterValue(heaterValues: SerialDataConverter.HeaterValue[]): Promise<Number> {
            let that = this;
            let sqlInsertValues = new Array<string>();
            let currentTime = new Date();
            let currentTimeString = `${currentTime.getFullYear()}-${this.twoDigits(currentTime.getMonth() + 1)}-${this.twoDigits(currentTime.getDate())} ${this.twoDigits(currentTime.getHours())}:${this.twoDigits(currentTime.getMinutes)}:${this.twoDigits(currentTime.getSeconds())}`;

            // Werte in ihren realen Wert umrechnen
            heaterValues.forEach(heaterValue => {
                if (typeof heaterValue.value == "number") {
                    heaterValue.value = heaterValue.value / heaterValue.multiplacator;

                    sqlInsertValues.push(`(${heaterValue.index}, ${heaterValue.value}, '${currentTimeString}')`);
                } else {
                    sqlInsertValues.push(`(${heaterValue.index}, '${heaterValue.value}', '${currentTimeString}')`);
                }
            });

            let result: Promise<Number> = new Promise<Number>(function(resolve, reject) {
                that.connectionPool.getConnection()
                               .then(connection => {
                                    connection.query(`INSERT INTO 'Values' (ValueType, Value, Date) VALUES ${sqlInsertValues.join(", ")}`)
                                              .then(result => {
                                                  connection.end();
                                                  resolve();
                                              })
                                              .catch(exc => console.error(exc));
                               })
                               .catch(exc => console.error(exc));
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
}