"use strict";
exports.__esModule = true;
var SerialDataConverter;
(function (SerialDataConverter_1) {
    // #endregion
    // #region heaterDataSplitRegex
    /**
     * Regex zum ermitteln einer einzelenn Zeile aus den Daten
     */
    var heaterDataSplitRegex = new RegExp(".*?;.*?;.*?;.*?;.*?;", "g");
    // #endregion
    // #region lineSplitRegex
    /**
     * Regex zum ermitteln einer einzelenn Zeile aus den Daten
     */
    var lineSplitRegex = new RegExp("(?<Name>.*?);(?<Value>.*?);(?<Unknown1>.*?);(?<Unknown2>.*?);(?<Unit>.*?);");
    // #endregion
    /**
     * Converter für Daten von der seriellen Schnitstelle von der Heizung
     */
    var SerialDataConverter = /** @class */ (function () {
        function SerialDataConverter() {
        }
        /**
         * Ermittelt alle Regex-Matches
         *
         * @param regex Das Regex welches ausgeführt werden soll
         * @param text Der Text auf dem das Regex ausgeführt werden soll
         * @returns Gibt die Matches als Array zurück
         */
        SerialDataConverter.matchAll = function (regex, text) {
            var result = [];
            var match = regex.exec(text);
            while (match != null) {
                result.push(match[0]);
                match = regex.exec(text);
            }
            return result;
        };
        // #region heaterDataToArray
        /**
         * Konvertier die Daten von der Heizung um.
         *
         * @param heaterData Die Daten, welche von der seriellen Schnitstelle empfangen wurden.
         * @reutrns Git die konvertieren Daten zurück
         */
        SerialDataConverter.heaterDataToArray = function (heaterData) {
            var result;
            var lineArray = this.matchAll(heaterDataSplitRegex, heaterData);
            lineArray.forEach(function (line) {
                var match = lineSplitRegex.exec(line);
                var heaterValue = {
                    name: match[1],
                    value: parseFloat(match[2]),
                    unidentified1: parseFloat(match[3]),
                    unidentified2: parseFloat(match[4]),
                    unit: match[5]
                };
                result.push(heaterValue);
            });
            return result;
        };
        return SerialDataConverter;
    }());
    SerialDataConverter_1.SerialDataConverter = SerialDataConverter;
})(SerialDataConverter = exports.SerialDataConverter || (exports.SerialDataConverter = {}));
//# sourceMappingURL=SerialDataConverter.js.map