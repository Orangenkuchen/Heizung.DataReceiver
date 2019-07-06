export namespace SerialDataRepository {
    let dummyData = "Boiler 1;0115;23;2;�C;Vorlauf 1;0063;24;2;�C;Vorlauf 2;0065;25;2;�C;HK Pumpe 1;0000;26;1; ;HK Pumpe 2;0000;27;1; ;Aussentemp;0048;28;2;�C;Kollektortemp;0000;29;2;�C;Betriebsstunden;11162;30;1;h;Fehler;Kein Fehler ;99;1; ;�$ Heizen;0003;1;1;zst;Kesseltemp.;0173;2;2;�C;Abgastemp.;0159;3;1;�C;Abgastemp S;0161;11;1;�C;Kesselstrg ;0081;4;1;%;Prim�rluft ;0084;5;1;%;Rest O2 ist;0137;6;10;%;O2 Regler  ;0000;7;1;%;Sekund�rluft;0000;8;1;%;Saugzug Soll;0079;9;1;%;Saugzug Ist;2420;10;1;U;Einschub Ist;0000;12;1;%;O2 Regler Pell ;0100;13;1;%;F�llstand: ;0000;14;207;%;Ansauggeschw.;0000;15;100;m/s;Strom Austrags;0000;16;1000;A;F�hler 1;0254;17;2;�C;Kesselsoll ;0170;18;2;�C;Pufferoben ;0173;20;2;�C;Pufferunten ;0149;21;2;�C;Pufferpumpe ;0100;22;1;%;";
    let stopDummyDataInterval = null;

    // #region ConnectionState
    export enum ConnectionState {
        /**
         * Nicht Verbunden
         */
        Disconnected = 0,
        /**
         * Verbindet gerade
         */
        Connecting = 1,
        /**
         * Verbindung hergestellt
         */
        Connected = 2
    }
    // #endregion

    /**
     * Klasse zum empfangen von Daten von einem Seriellen Port
     */
    export class SerialDataRepository {
        // #region serialPortName
        /**
         * Der Name von der Seriellen Verbindung (z.B. COM10 oder /dev/ttyUSB0)
         */
        serialPortName: string;
        // #endregion

        // #region connectionState
        /**
         * Der Verbindungsstatus zum Seriellen Port
         */
        connectionState: ConnectionState;
        // #endregion

        // #region ctor
        /**
         * Erstellt die Klasse
         * 
         * @param serialPortName Der Name von Seriellen Port 
         */
        constructor(serialPortName: string) {
            this.serialPortName = serialPortName;
        }
        // #endregion

        // #region connect
        /**
         * Stellt die Verbindung mit dem Seriellen Port her
         * 
         * @param onDataCallback Callback, welcher ausgeführt wird, wenn Daten empfangen werden.
         */
        connect(onDataCallback: (data: string) => void): void {
            // Dummy Daten. Richtige Daten müsssen noch programmiert werden.

            this.connectionState = ConnectionState.Connected;
            
            let intervalId = setInterval(function() {
                onDataCallback(dummyData);
            }, 1000);

            stopDummyDataInterval = () => clearInterval(intervalId);
        }
        // #endregion

        // #region disconnect
        /**
         * Trennt die Verbindung zum Seriellen Port
         */
        disconnect(): void {
            if (this.connectionState == ConnectionState.Connected ||
                this.connectionState == ConnectionState.Connecting) {
                if (stopDummyDataInterval != null) {
                    stopDummyDataInterval();
                    
                    stopDummyDataInterval = null;
                }

                this.connectionState = ConnectionState.Disconnected;
            }
        }
        // #endregion
    }   
}