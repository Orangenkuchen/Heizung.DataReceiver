export namespace SerialDataConverter {
    // #region HeaterValue
    /**
     * Ein Wert welcher aus der Heizung ausgelesen wurde
     */
    export type HeaterValue = {
        /**
         * Der Name vom gelesenen Wert
         */
        name: string;

        /**
         * Der Wert, welcher ermittelt wurde
         */
        value: string | number;

        /**
         * Der Index vom Wert
         */
        index: any;

        /**
         * Der Messwert wurde mit diesem Wert multipliziert um auf 'value' zu kommen
         */
        multiplicator: any;

        /**
         * Die Einheit des Werts
         */
        unit: string;
    }
    // #endregion

    // #region HistoryHeaterValue
    /**
     * Heizungswert mit Zeitstempel
     */
    export interface HistoryHeaterValue extends HeaterValue
    {
        /**
         * Der Zeitstempel, an dem der Heizungswert aufgenommen wurde
         */
        timestamp: Date;
    }
    // #endregion
    
    // #region heaterDataSplitRegex
    /**
     * Regex zum ermitteln einer einzelenn Zeile aus den Daten
     */
    let heaterDataSplitRegex: RegExp = new RegExp(".*?;.*?;.*?;.*?;.*?;", "g");
    // #endregion
        
    // #region lineSplitRegex
    /**
     * Regex zum ermitteln einer einzelenn Zeile aus den Daten
     */
    let lineSplitRegex: RegExp = new RegExp("(?<Name>.*?);(?<Value>.*?);(?<Unknown1>.*?);(?<Unknown2>.*?);(?<Unit>.*?);");
    // #endregion

    /**
     * Converter für Daten von der seriellen Schnitstelle von der Heizung
     */
    export class SerialDataConverter {
        /**
         * Ermittelt alle Regex-Matches
         * 
         * @param regex Das Regex welches ausgeführt werden soll
         * @param text Der Text auf dem das Regex ausgeführt werden soll
         * @returns Gibt die Matches als Array zurück
         */
        static matchAll(regex: RegExp, text: string): any[] {
            let result: any[] = [];

            let match = regex.exec(text);

            while (match != null) {
                result.push(match[0]);

                match = regex.exec(text);
            }

            return result;
        }

        // #region heaterDataToArray
        /**
         * Konvertier die Daten von der Heizung um.
         * 
         * @param heaterData Die Daten, welche von der seriellen Schnitstelle empfangen wurden.
         * @reutrns Git die konvertieren Daten zurück
         */
        static heaterDataToArray(heaterData: string): HeaterValue[]{
            let result: HeaterValue[] = [];

            let lineArray = this.matchAll(heaterDataSplitRegex, heaterData);

            lineArray.forEach((line) => {
                let match = lineSplitRegex.exec(line);

                let value: number | string = parseFloat(match[2]);

                // Wenn die Umwandlung keine Zahl ergibt dann nehme den blanken String
                if (isNaN(value) == true) {
                    value = match[2];
                }

                let heaterValue: HeaterValue = {
                    name: match[1],
                    value: value,
                    index: parseFloat(match[3]),
                    multiplicator: parseFloat(match[4]),
                    unit: match[5]
                };

                result.push(heaterValue);
            });

            return result;
        }
        // #endregion
    }
}