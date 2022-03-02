sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/helpers/formatter",
    "TransenerMovilidad/services/AtsService",
    "TransenerMovilidad/services/masterDataService",
    "TransenerMovilidad/helpers/dialog"
  ],
  function(Controller, Formatter, AtsService, MasterDataService, Dialog) {
    "use strict";
    return Controller.extend(
      "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.mtsList.mtsList",
      {
        onAfterRendering: function() {
          let sAufnr = this.getView()
            .getModel("WorkOrderModel")
            .getData().Aufnr;

          let sAtsIndex = this.getView()
            .getModel("SelectedATSIndex")
            .getData().Atsindex;

          let aPromises = [
            AtsService.getMTSAssignment(sAtsIndex, sAufnr),
            MasterDataService.getMTS()
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

        getMTSName: function(sIdMts, aMTS) {
          let oMTSFound = aMTS.find(oMTS => {
            return oMTS.MTS === sIdMts;
          });
          return oMTSFound.Descr;
        },

        _getMTSStructure: function(oMTS, aMTS) {
          return {
            IdMts: oMTS.Idmts,
            NombreMts: this.getMTSName(oMTS.Idmts, aMTS)
          };
        },

        onSuccessGetData: function(aPromiseResolved) {
          let aData = [];
          let aMTSAssignment = aPromiseResolved[0].results;
          let aMTS = aPromiseResolved[1].results;
          for (let oMTSAssigned of aMTSAssignment) {
            let oData = this._getMTSStructure(oMTSAssigned, aMTS);
            aData.push(oData);
          }

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({ MTS: aData });
          this.getView().setModel(oModel, "MTSJsonModel");
        }
      }
    );
  }
);
