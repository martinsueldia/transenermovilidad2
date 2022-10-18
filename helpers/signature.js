sap.ui.define(
  ["TransenerMovilidad/helpers/dialog", "TransenerMovilidad/helpers/file"],
  function(Dialog, FileHelper) {
    "use strict";

    return {
      _aSignatures: [],
      _dialog: null,

      _isValidSignature: function(sDrawedBinary) {
        let sBlankBinaryImage = this._dialog
          .getModel("BlankBinaryModel")
          .getProperty("/BlankImage");
        let sLegacy = this._dialog
          .getModel("SignatureModel")
          .getProperty("/Legacy");

        let oDate = this._dialog
          .getModel("SignatureModel")
          .getProperty("/Fecha");

        if (this._sView !== "workOrderRiskEvaluation") {
          return sBlankBinaryImage !== sDrawedBinary && sLegacy !== "";
        } else {
          return (
            sBlankBinaryImage !== sDrawedBinary &&
            sLegacy !== "" &&
            oDate !== null
          );
        }
      },

      _addPersonalFilter: function() {
        let aFilters = [];
        let oModel = this._dialog.getModel("ComboControlModel");
        let oCombo = oModel.getProperty("/Control");
        for (let oSignature of this._aSignatures) {
          aFilters.push(
            new sap.ui.model.Filter(
              "Legajo",
              sap.ui.model.FilterOperator.NE,
              oSignature.Legacy
            )
          );
        }
        let oFilter = new sap.ui.model.Filter({
          filters: aFilters,
          and: true
        });
        oCombo.getBinding("suggestionItems").filter(oFilter);
      },

      _onClearSignature: function() {
        let canvas = document.getElementById("signature-pad");
        let context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.clearRect(0, 0, canvas.width, canvas.height);
      },

      _saveSignatureData: function(binaryString, bSaveAndContinue) {
        let oSignatureModel = this._dialog.getModel("SignatureModel");
        oSignatureModel.setProperty("/Signature", binaryString);
        let oSignatureData = $.extend({}, oSignatureModel.getData());
        this._aSignatures.push(oSignatureData);
        if (!bSaveAndContinue) {
          this._fnSave(this._aSignatures);
        } else {
          this._addPersonalFilter();
          this._onClearSignature();
          this._cleanSignatureModel();
        }
      },

      _saveAndPost: function() {
        if (this._aSignatures.length > 0) {
          let canvas = document.getElementById("signature-pad");
          canvas.toBlob(oBlob => {
            FileHelper.readBinaryString(oBlob, sBinary => {
              if (this._isValidSignature(sBinary)) {
                this._saveSignatureData(sBinary, false);
              } else {
                //
                this._fnSave(this._aSignatures);
              }
            });
          });
        } else {
          let canvas = document.getElementById("signature-pad");
          canvas.toBlob(oBlob => {
            FileHelper.readBinaryString(oBlob, sBinary => {
              if (this._isValidSignature(sBinary)) {
                this._saveSignatureData(sBinary, false);
              } else {
                Dialog.openMsgDialog(
                  {
                    title: "Alerta",
                    content: new sap.m.Text({
                      text: "Necesita completar todos los campos."
                    }),
                    models: [],
                    styleClasses: ["MessageDialog"]
                  },
                  () => {}
                );
              }
            });
          });
        }
      },

      _cleanSignatureModel: function() {
        this._dialog.getModel("SignatureModel").setProperty("/Legacy", "");
        this._dialog.getModel("SignatureModel").setProperty("/Signature", "");
        this._dialog
          .getModel("SignatureModel")
          .setProperty("/Fecha", new Date());
      },

      _cancelSignature: function() {
        this._aSignatures = [];
        Dialog.close();
      },

      _saveAndNew: function() {
        let canvas = document.getElementById("signature-pad");
        canvas.toBlob(oBlob => {
          FileHelper.readBinaryString(oBlob, sBinary => {
            if (this._isValidSignature(sBinary)) {
              this._saveSignatureData(sBinary, true);
            } else {
              Dialog.openMsgDialog(
                {
                  title: "Alerta",
                  content: new sap.m.Text({
                    text: "Necesita completar todos los campos."
                  }),
                  models: [],
                  styleClasses: ["MessageDialog"]
                },
                () => {}
              );
            }
          });
        });
      },

      _getSignatureData: function() {
        return this._sView === "workOrderRiskEvaluation"
          ? {
              Legacy: "",
              Signature: "",
              Name: "",
              Fecha: new Date(),
              visibleFecha: true
            }
          : {
              Legacy: "",
              Signature: "",
              Name: "",
              visibleFecha: false
            };
      },
      //
      _createSignatureModel: function() {
        let oSignatureModel = new sap.ui.model.json.JSONModel();
        var oSignatureData = this._getSignatureData();
        oSignatureModel.setData(oSignatureData);
        this._dialog.setModel(oSignatureModel, "SignatureModel");
      },

      _createPersonalFiltersModel: function() {
        let oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          Filters: []
        });
        this._dialog.setModel(oModel, "PersonalFilterModel");
      },

      setDialogModels: function() {
        this._createSignatureModel();
        this._createPersonalFiltersModel();
        this._generateBlankBinaryString();
      },

      _generateBlankBinaryString: function() {
        let oBlankBinaryModel = this._dialog.getModel("BlankBinaryModel");
        let canvas = document.getElementById("signature-pad");
        if (!oBlankBinaryModel.getProperty("/Created")) {
          canvas.toBlob(oBlob => {
            FileHelper.readBinaryString(oBlob, sBinary => {
              oBlankBinaryModel.setProperty("/BlankImage", sBinary);
              oBlankBinaryModel.setProperty("/Created", true);
            });
          });
        }
      },

      openSignatureDialog: function(fnSave, oView) {
        this._fnSave = fnSave;
        this._aSignatures = [];
        this._sView = oView.getId();
        Dialog.openCustomDialog(
          {
            title: "Firma",
            content:
              "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.signaturePopup.signaturePopup",
            models: [],
            styleClasses: ["signatureDialog"],
            buttons: [
              new sap.m.Button({
                icon: "sap-icon://eraser",
                iconFirst: true,
                text: "{i18n>Clean}",
                press: [this._onClearSignature, this]
              }),
              new sap.m.Button({
                iconFirst: true,
                icon: "sap-icon://save",
                text: "{i18n>SaveAndNew}",
                press: [this._saveAndNew, this]
              }),
              new sap.m.Button({
                iconFirst: true,
                icon: "sap-icon://save",
                text: "{i18n>Save}",
                press: [this._saveAndPost, this]
              }),
              new sap.m.Button({
                iconFirst: true,
                icon: "sap-icon://decline",
                text: "{i18n>Close}",
                press: [this._cancelSignature, this]
              })
            ]
          },
          oView
        );
        this._dialog = Dialog.getDialog();
        this.setDialogModels();
      }
    };
  }
);
