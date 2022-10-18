sap.ui.define([
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/formatter"
], function (WorkOrderService, Formatter) {
    "use strict";
    return {

        dictionary: {
            "NEW_DEFECT": "Defecto generado",
            "EDIT_DEFECT": "Edición de defecto realizado por",
            "UPDATE_SUBOPERATION_STATUS": "Cambio de estado en operacion/suboperacion",
            "CREATE_OBSERVATION_ORDER": "Observacion generada para la orden Nº {Aufnr} con el comentario: {Observaciones}",
            "CREATE_ATS": "ATS firmado para la orden Nº {Aufnr} con numero de ATS {Atsindex}",
            "UPLOAD_FILE_OPERATION": "Subida de archivo para la orden {Aufnr}",
            "DAILY_END": "Fin diario realizado en la orden Nº {Aufnr}",
            "FINISH_OT": "Finalizacion de OT realizada para la orden Nº {Aufnr}",
            "CORRECT_DEFECT": "Correccion de defecto Nº {Qmnum}",
            "MEASURE": "Se ha realizado tarea de puntos de medida para el punto de medida Nº {MeasurementPoint}"
        },

        _getDescriptionByOperationDictionary: function (oData, sDictionary) {
            let oDictionary = $.extend({}, this.dictionary);
            let sDescription = oDictionary[sDictionary];
            let aKeys = Object.keys(oData);
            for (let i in aKeys) {
                let bFound = sDescription.search("{" + aKeys[i] + "}");
                if (bFound !== -1) {
                    sDescription = sDescription.replace("{" + aKeys[i] + "}", oData[aKeys[i]]);
                }

            }
            return sDescription;
        },

        createLog: function (oData, oGeolocation, sDictionary) {
            let sUser = localStorage.getItem("user_logged");
            let sDescription = this._getDescriptionByOperationDictionary(oData, sDictionary);
            let oLog = {
                Idaction: Formatter.getTimeString(),
                Timestamp: new Date(),
                Locationx: oGeolocation.coords.longitude.toFixed(5),
                Locationy: oGeolocation.coords.latitude.toFixed(5),
                Aufnr: oData.Aufnr,
                Qmnum: (oData.Qmnum) ? oData.Qmnum : "",
                Vornr: (oData.Vornr) ? oData.Vornr : "",
                Iupoz: (oData.Iupoz) ? oData.Iupoz : "",
                Rueck: "",
                Rmzhl: "",
                Mdocm: "",
                Filename: "",
                Descr: sDescription,
                Entityname: "",
                Usuario: sUser
            };
            WorkOrderService.createActivityLog(oLog);
        },

    };
});