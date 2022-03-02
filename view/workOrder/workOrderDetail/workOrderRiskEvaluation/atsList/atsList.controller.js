sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/formatter",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/services/AtsService",
    "TransenerMovilidad/helpers/dialog"
  ],
  function(
    Controller,
    WorkOrderService,
    Formatter,
    workOrderService,
    AtsService,
    Dialog
  ) {
    "use strict";
    return Controller.extend(
      "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.atsList.atsList",
      {
        onAfterRendering: function() {
          let sAufnr = this.getView()
            .getModel("WorkOrderModel")
            .getData().Aufnr;
          let aPromises = [
            workOrderService.getWorkOrderBundles(),
            AtsService.getSignatureHeader(sAufnr)
          ];
          Promise.all(aPromises)
            .then($.proxy(this.onSuccessGetData, this))
            .catch(e => {
              Dialog.openMsgDialog(
                {
                  title: "Alerta",
                  content: new sap.m.Text({
                    text: "Se ha producido un error al obtener los datos"
                  }),
                  models: [],
                  styleClasses: ["MessageDialog"]
                },
                () => {}
              );
            });
        },

        _getLegacyName: function(sLegacy, aPersonal) {
          let oPersonal = aPersonal.find(oPersona => {
            return oPersona.Legajo === sLegacy;
          });
          if (oPersonal) {
            return oPersonal.Nombre + " " + oPersonal.Apellido;
          } else {
            return "";
          }
        },

        _getPersonalData: function(oSignature, aPersonal) {
          let aData = [];
          for (let i = 1; i < 16; i++) {
            if (
              oSignature["Firma" + i] !== "" &&
              oSignature["Legajo" + i] !== "00000000" &&
              oSignature["Fecha" + i] !== null
            ) {
              aData.push({
                firma: oSignature["Firma" + i],
                nombre: this._getLegacyName(
                  oSignature["Legajo" + i],
                  aPersonal
                ),
                legajo: oSignature["Legajo" + i],
                fecha: Formatter.formatDate(oSignature["Fecha" + i])
                //JefeTrabajo: i === 1
              });
            }
          }
          return aData;
        },

        onSuccessGetData: function(aPromiseResolved) {
          let aData = [];
          let aPersonal = aPromiseResolved[0].results;
          let aSignatures = aPromiseResolved[1].results;
          for (let oSignature of aSignatures) {
            let oData = {
              AtsVersion: parseInt(oSignature.Atsindex),
              Personal: this._getPersonalData(oSignature, aPersonal)
            };
            aData.push(oData);
          }

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({ Firmas: aData });
          this.getView().setModel(oModel, "FirmasJsonModel");
        }
      }
    );
  }
);
