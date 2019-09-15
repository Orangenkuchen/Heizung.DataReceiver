const mariaDB = require('mariadb');

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
         * @returns Gibt alle Beschreibungen der Heizwerte zurück
         */
        public GetAllValueDescriptions(): Array<ValueDescription> {
            let result: Array<ValueDescription> = new Array<ValueDescription>();

            this.connectionPool.GetConnection()
                               .then(connection => {
                                    connection.query('SELECT * FROM ValueDescription;')
                                              .then(rows => {
                                                    debugger;
                                              });
                               });

            return result;
        } 
        // #endregion

        // #region GetErrorId
        // #endregion

        // #region SetNewError
        // #endregion

        // #region SetHeaterValue
        // #endregion
    }
}