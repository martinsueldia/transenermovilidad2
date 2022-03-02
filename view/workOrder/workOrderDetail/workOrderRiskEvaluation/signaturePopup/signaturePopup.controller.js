sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.signaturePopup.signaturePopup", {

        onAfterRendering: function () {
            let oComboBox = this.byId("PersonalCombobox");
            this._generateCanvas();
            this.getView().getModel("ComboControlModel").setProperty("/Control",oComboBox);
        },

        formatTextCombo: function (sLegacy, sName, sLastName) {
            return sLegacy + " - " + sName + " " + sLastName
        },

        saveName:function(oEvent){
            this.getView().getModel("SignatureModel").setProperty("/Name",oEvent.getSource().getValue())
        },

        _generateCanvas: function () {
            let canvas = document.getElementById("signature-pad");
            let context = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 0.75;
            context.fillStyle = "#fff";
            context.strokeStyle = "#444";
            context.lineWidth = 1.5;
            context.lineCap = "round";
            context.fillRect(0, 0, canvas.width, canvas.height);

            let oSignaturePad = new SignaturePad(document.getElementById("signature-pad"), {
                backgroundColor: "#ffffff",
                penColor: "rgb(0, 0, 0)",
                penWidth: "0"
            });

        }


    });
});