sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.finishOTDialog.finishOTDialog", {
        formatTextCombo: function (sLegacy, sName, sLastName) {
            return sLegacy + " - " + sName + " " + sLastName
        }
    });
});
