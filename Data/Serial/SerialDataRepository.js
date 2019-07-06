"use strict";
exports.__esModule = true;
var SerialDataRepository;
(function (SerialDataRepository_1) {
    var dummyData = "Boiler 1;0115;23;2;�C;Vorlauf 1;0063;24;2;�C;Vorlauf 2;0065;25;2;�C;HK Pumpe 1;0000;26;1; ;HK Pumpe 2;0000;27;1; ;Aussentemp;0048;28;2;�C;Kollektortemp;0000;29;2;�C;Betriebsstunden;11162;30;1;h;Fehler;Kein Fehler ;99;1; ;�$ Heizen;0003;1;1;zst;Kesseltemp.;0173;2;2;�C;Abgastemp.;0159;3;1;�C;Abgastemp S;0161;11;1;�C;Kesselstrg ;0081;4;1;%;Prim�rluft ;0084;5;1;%;Rest O2 ist;0137;6;10;%;O2 Regler  ;0000;7;1;%;Sekund�rluft;0000;8;1;%;Saugzug Soll;0079;9;1;%;Saugzug Ist;2420;10;1;U;Einschub Ist;0000;12;1;%;O2 Regler Pell ;0100;13;1;%;F�llstand: ;0000;14;207;%;Ansauggeschw.;0000;15;100;m/s;Strom Austrags;0000;16;1000;A;F�hler 1;0254;17;2;�C;Kesselsoll ;0170;18;2;�C;Pufferoben ;0173;20;2;�C;Pufferunten ;0149;21;2;�C;Pufferpumpe ;0100;22;1;%;";
    var stopDummyDataInterval = null;
    // #region ConnectionState
    var ConnectionState;
    (function (ConnectionState) {
        /**
         * Nicht Verbunden
         */
        ConnectionState[ConnectionState["Disconnected"] = 0] = "Disconnected";
        /**
         * Verbindet gerade
         */
        ConnectionState[ConnectionState["Connecting"] = 1] = "Connecting";
        /**
         * Verbindung hergestellt
         */
        ConnectionState[ConnectionState["Connected"] = 2] = "Connected";
    })(ConnectionState = SerialDataRepository_1.ConnectionState || (SerialDataRepository_1.ConnectionState = {}));
    // #endregion
    /**
     * Klasse zum empfangen von Daten von einem Seriellen Port
     */
    var SerialDataRepository = /** @class */ (function () {
        // #endregion
        // #region ctor
        /**
         * Erstellt die Klasse
         *
         * @param serialPortName Der Name von Seriellen Port
         */
        function SerialDataRepository(serialPortName) {
            this.serialPortName = serialPortName;
        }
        // #endregion
        // #region connect
        /**
         * Stellt die Verbindung mit dem Seriellen Port her
         *
         * @param onDataCallback Callback, welcher ausgeführt wird, wenn Daten empfangen werden.
         */
        SerialDataRepository.prototype.connect = function (onDataCallback) {
            // Dummy Daten. Richtige Daten müsssen noch programmiert werden.
            this.connectionState = ConnectionState.Connected;
            var intervalId = setInterval(function () {
                onDataCallback(dummyData);
            }, 1000);
            stopDummyDataInterval = function () { return clearInterval(intervalId); };
        };
        // #endregion
        // #region disconnect
        /**
         * Trennt die Verbindung zum Seriellen Port
         */
        SerialDataRepository.prototype.disconnect = function () {
            if (this.connectionState == ConnectionState.Connected ||
                this.connectionState == ConnectionState.Connecting) {
                if (stopDummyDataInterval != null) {
                    stopDummyDataInterval();
                    stopDummyDataInterval = null;
                }
                this.connectionState = ConnectionState.Disconnected;
            }
        };
        return SerialDataRepository;
    }());
    SerialDataRepository_1.SerialDataRepository = SerialDataRepository;
})(SerialDataRepository = exports.SerialDataRepository || (exports.SerialDataRepository = {}));
//# sourceMappingURL=SerialDataRepository.js.map