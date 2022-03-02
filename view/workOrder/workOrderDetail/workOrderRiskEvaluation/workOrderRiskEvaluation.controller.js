sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/helpers/panel-control",
    "TransenerMovilidad/services/AtsService",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/helpers/signaturePad",
    "TransenerMovilidad/helpers/file",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/helpers/workOrderHelper",
    "TransenerMovilidad/helpers/log",
    "TransenerMovilidad/helpers/geolocation",
    "TransenerMovilidad/helpers/signature",
    "TransenerMovilidad/services/masterDataService"
  ],
  function(
    Controller,
    Panel,
    AtsService,
    Dialog,
    SignaturePad,
    FileHelper,
    LocalStorage,
    WOHelper,
    LogHelper,
    Geolocation,
    SignatureHelper,
    MasterDataService
  ) {
    "use strict";

    return Controller.extend(
      "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.workOrderRiskEvaluation",
      {
        alreadyRun: false,
        oModel: null,
        _iWorkOrder: 0,
        aSignatures: [],
        aMTS: [],
        _aDataMTS: [],

        onInit: function() {
          this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this.oRouter
            .getRoute("WorkOrderDetail")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function(oEvent) {
          var oArgs = oEvent.getParameter("arguments");
          let oQuery = oArgs["?query"];
          this._iWorkOrder = oArgs.workOrderId;

          if (oQuery.tab == "RiskEvaluation") {
            this._initializeModels();
          } else {
            this._cleanModels();
          }
        },

        _cleanModels: function() {
          var oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/VersionAts", []);
        },

        _woIsFinished: function(sStatus) {
          return WOHelper.workOrderIsFinished(sStatus);
        },

        _initializeModels: function() {
          var oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/VersionAts/Busy", true);
          this._getRiskEvaluations();
        },

        _createPersonalFiltersModel: function() {
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({
            Filters: []
          });
          this.getView().setModel(oModel, "PersonalFilterModel");
        },

        _getRiskEvaluations: function() {
          let aPromises = [
            AtsService.getAtsSet(),
            AtsService.getAssignAtsSet(this._iWorkOrder),
            AtsService.getSignatureHeader(this._iWorkOrder)
          ];

          Promise.all(aPromises).then(
            ([aAts, aAtsAssigned, aAtsHeaders]) => {
              this._createModelRisk(
                aAts.results,
                aAtsAssigned.results,
                aAtsHeaders.results
              );
            },
            oErr => {
              this._onCreateError(oErr.msg);
            }
          );
        },

        _onCreateError: function(sMsg) {
          //llamar al dialogo mostrando el error recibido por parametro
        },

        _getCompletedATS: function(aAts, aAtsAssigned, iAtsIndex) {
          let oAtsAssignedByVersion;
          let oAtsExtend = $.extend(true, [], aAts);
          let oATS = {
            Elements: oAtsExtend.filter(x => x.Tiats === "E"),
            Risks: oAtsExtend.filter(x => x.Tiats === "R"),
            Procedures: oAtsExtend.filter(x => x.Tiats === "P"),
            Atsindex: iAtsIndex,
            IsSigned: true
          };

          oATS.Elements.map(x => (x.State = false));
          oATS.Elements.map(x => (x.Visibility = true));

          oATS.Risks.map(x => (x.State = false));
          oATS.Risks.map(x => (x.Visibility = true));

          oATS.Procedures.map(x => (x.Visibility = true));

          oAtsAssignedByVersion = aAtsAssigned.filter(
            x => parseInt(x.Atsindex) === parseInt(iAtsIndex)
          );

          for (let oElement of oATS.Elements) {
            oElement.State = oAtsAssignedByVersion.find(
              x =>
                x.Idats === oElement.Idats &&
                x.Tiats === oElement.Tiats &&
                parseInt(x.Atsindex) === parseInt(iAtsIndex)
            )
              ? true
              : false;
            oElement.IsSigned = true;
          }

          for (let oRisk of oATS.Risks) {
            oRisk.State = oAtsAssignedByVersion.find(
              x =>
                x.Idats === oRisk.Idats &&
                x.Tiats === oRisk.Tiats &&
                parseInt(x.Atsindex) === parseInt(iAtsIndex)
            )
              ? true
              : false;
            oRisk.IsSigned = true;
          }
          //return oATS;
          return this._createATSStructure(oATS);
        },

        _getElementStructure: function(oElement) {
          return {
            visibility: false
          };
        },
        _getRiskStructure: function(oRisk) {},
        _getProcedureStructure: function(oProcedure) {},

        _createATSStructure: function(oAts) {
          return {
            Atsindex: oAts.Atsindex,
            IsSigned: true,
            Row: this._getAtsRowStucture(oAts)
          };
        },

        _getAtsRowStucture: function(oAts) {
          oAts.Risks = _.orderBy(oAts.Risks, ["Idats"]);
          oAts.Elements = _.orderBy(oAts.Elements, ["Idats"]);
          oAts.Procedures = _.orderBy(oAts.Procedures, ["Idats"]);
          let aRow = [];
          let iMaxRow = Math.max(
            oAts.Elements.length,
            oAts.Risks.length,
            oAts.Procedures.length
          );
          for (let i = 0; i < iMaxRow; i++) {
            aRow.push({
              IsSigned: oAts.IsSigned,
              Element: oAts.Elements[i]
                ? oAts.Elements[i]
                : { Visibility: false },
              Risk: oAts.Risks[i] ? oAts.Risks[i] : { Visibility: false },
              Procedure: oAts.Procedures[i]
                ? oAts.Procedures[i]
                : { Visibility: false }
            });
          }
          return aRow;
        },

        _getNewAtsRowStructure: function(aAts, iAtsIndex) {
          let oATS = {
            Elements: aAts.filter(x => x.Tiats === "E"),
            Risks: aAts.filter(x => x.Tiats === "R"),
            Procedures: aAts.filter(x => x.Tiats === "P"),
            Atsindex: iAtsIndex,
            IsSigned: false
          };
          let aData = this._getAtsRowStucture(oATS);
          return {
            Atsindex: iAtsIndex,
            IsSigned: false,
            Row: aData
          };
        },

        _getNewATS: function(aAts, iIndex) {
          return this._getNewAtsRowStructure(aAts, iIndex);
        },

        /*
            aATS: Array de datos maestros del ATS.
            aATSAssgined: Elementos del ATS que están seleccionados.
        */
        _createModelRisk: function(aAts, aAtsAssigned, aHeaderAts) {
          aHeaderAts.map(oAts => (oAts.Atsindex = parseInt(oAts.Atsindex)));
          let oModel = this.getView().getModel("WorkOrderModel");
          let aListATS = [];

          for (let oHeader of aHeaderAts) {
            aListATS.push(
              this._getCompletedATS(aAts, aAtsAssigned, oHeader.Atsindex)
            );
          }

          if (!aListATS.length) {
            aListATS.push(this._getNewAtsRowStructure(aAts, 1));
          }

          if (aListATS.length) {
            oModel.setProperty("/VersionAts", {
              Busy: true,
              Array: aListATS
            });
          } else {
            oModel.setProperty("/VersionAts/Busy", false);
          }
        },

        _onRiskExpand: function(oEvent) {
          let oItemPanel = oEvent.getSource();
          let bExpanded = oEvent.getParameter("expand");
          let oListPanel = oItemPanel.getParent().getParent();
          try {
            Panel.setItemPanelActive(oItemPanel, oListPanel, bExpanded);
          } catch (e) {
            //TODO: hacer tratamiento de excepciones
          }
        },

        _onNewATS: function() {
          let oModel = this.getView().getModel("WorkOrderModel");
          let aListATS = oModel.getData().VersionAts.Array;
          if (aListATS.find(x => !x.IsSigned)) {
            Dialog.openMsgDialog(
              {
                title: "Alerta",
                content: new sap.m.Text({
                  text: "No se puede armar un nuevo ATS sin firmar el anterior"
                }),
                models: [],
                styleClasses: ["MessageDialog"]
              },
              () => {}
            );
          } else {
            AtsService.getAtsSet().then(
              aATS => {
                let iIndex = aListATS.length + 1;
                aListATS.push(this._getNewATS(aATS.results, iIndex));
                oModel.setProperty("/VersionAts", {
                  Busy: true,
                  Array: aListATS
                });
              },
              () => {
                console.log("ocurrio un error al obtener maestro de ats");
              }
            );
          }
        },

        _showAtsSignList: function() {
          //
          Dialog.openCustomDialog(
            {
              title: "Listado de Firmantes",
              styleClasses: ["DialogFirmantes"],
              content:
                "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.atsList.atsList",
              models: [],
              buttons: [
                new sap.m.Button({
                  icon: "sap-icon://decline",
                  press: function() {
                    Dialog.close();
                  }
                })
              ]
            },
            this.getView()
          );
        },

        closeDialog: function(oEvent) {
          this._oDialogMTS._oDialog.close();
        },
        confirmDialog: function(oEvent) {
          let aData = [];
          let aSelectedMTS = oEvent.getParameter("selectedItems");
          for (let oMTSItem of aSelectedMTS) {
            let oMTS = oMTSItem.getBindingContext("MTSJsonModel").getObject();
            aData.push(oMTS);
          }
          this._aDataMTS = aData;
          this._oDialogMTS._oDialog.close();
        },

        searchMTS: function(oEvent) {
          let sSearchCriteria = oEvent.getParameter("value");
          let aFilter = [];
          aFilter.push(
            new sap.ui.model.Filter(
              "Descr",
              sap.ui.model.FilterOperator.Contains,
              sSearchCriteria
            )
          );
          let aMTSBinding = oEvent.getParameter("itemsBinding");
          aMTSBinding.filter(aFilter);
        },

        openDialogMTS: function() {
          if (!this._oDialogMTS) {
            let oDialog = new sap.m.SelectDialog({
              title: "MTS",
              rememberSelections: true,
              showClearButton: true,
              multiSelect: true,
              cancel: [this.closeDialog, this],
              confirm: [this.confirmDialog, this],
              search: [this.searchMTS, this],
              noDataText: "No existen MTS",
              items: {
                sorter: new sap.ui.model.Sorter("MTS"),
                path: "MTSJsonModel>/MTS",
                template: new sap.m.StandardListItem({
                  title: "{MTSJsonModel>Descr}",
                  description: "{MTSJsonModel>MTS}"
                })
              }
            });
            this._oDialogMTS = oDialog;
            this.getView().addDependent(this._oDialogMTS);
          }
          this._oDialogMTS.open();
        },

        createModelMTS: function(data) {
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setSizeLimit(99999);
          oModel.setData({
            MTS: data.results
          });
          this.getView().setModel(oModel, "MTSJsonModel");
        },

        handleMTSDialog: function() {
          MasterDataService.getMTS()
            .then(results => {
              if (!this._oDialogMTS) {
                this.createModelMTS(results);
              }
              this.openDialogMTS();
            })
            .catch(() => {
              Dialog.openMsgDialog(
                {
                  title: "Alerta",
                  content: new sap.m.Text({ text: "MTS no disponible" }),
                  models: [],
                  styleClasses: ["MessageDialog"]
                },
                () => {}
              );
            });
        },

        _onSignature: function() {
          let aAts = this.getView()
            .getModel("WorkOrderModel")
            .getData().VersionAts.Array;
          if (aAts.find(x => !x.IsSigned)) {
            SignatureHelper.openSignatureDialog(
              $.proxy(this.saveSignatures, this),
              this.getView()
            );
          } else {
            Dialog.openMsgDialog(
              {
                title: "Alerta",
                content: new sap.m.Text({ text: "No hay ATS para firmar" }),
                models: [],
                styleClasses: ["MessageDialog"]
              },
              () => {}
            );
          }
        },
        //
        saveSignatures: function(aSignatures) {
          let oAtsSignature = {};
          let aListATS = this.getView()
            .getModel("WorkOrderModel")
            .getData().VersionAts.Array;
          oAtsSignature.Aufnr = this._iWorkOrder;
          for (let i = 0; i < aSignatures.length; i++) {
            let iIndex = i + 1;
            oAtsSignature["Firma" + iIndex] = aSignatures[i]["Signature"];
            oAtsSignature["Legajo" + iIndex] = aSignatures[i]["Legacy"];
            oAtsSignature["Nombre" + iIndex] = aSignatures[i]["Name"];
            oAtsSignature["Fecha" + iIndex] = aSignatures[i]["Fecha"];
          }

          for (let oAts of aListATS) {
            if (!oAts.IsSigned) {
              this._assignATS(oAts, oAtsSignature);
            }
          }
        },

        _getAssignedRisk: function(oAts) {
          let aAssignedRisks = [];
          for (let oRow of oAts.Row) {
            if (oRow.Risk.State) {
              oRow.Risk.Aufnr = this._iWorkOrder;
              oRow.Risk.Gewrk = LocalStorage.getWorkPlace();
              oRow.Risk.Atsindex = oAts.Atsindex;
              aAssignedRisks.push(oRow.Risk);
            }
          }
          return aAssignedRisks;
        },

        openWatchMTS: function(oEvent) {
          let oModel = new sap.ui.model.json.JSONModel();
          let sAtsIndex = oEvent
            .getSource()
            .getParent()
            .getParent()
            .getBindingContext("WorkOrderModel")
            .getObject().Atsindex;

          oModel.setData({
            Atsindex: sAtsIndex
          });
          this.getView().setModel(oModel, "SelectedATSIndex");
          Dialog.openCustomDialog(
            {
              title: "MTS ",
              styleClasses: ["DialogFirmantes"],
              content:
                "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.mtsList.mtsList",
              models: [],
              buttons: [
                new sap.m.Button({
                  icon: "sap-icon://decline",
                  press: function() {
                    Dialog.close();
                  }
                })
              ]
            },
            this.getView()
          );
        },

        //
        _getAssignedElements: function(oAts) {
          let aAssignedElements = [];
          for (let oRow of oAts.Row) {
            if (oRow.Element.State) {
              oRow.Element.Aufnr = this._iWorkOrder;
              oRow.Element.Gewrk = LocalStorage.getWorkPlace();
              oRow.Element.Atsindex = oAts.Atsindex;
              aAssignedElements.push(oRow.Element);
            }
          }
          return aAssignedElements;
        },

        openRPTDialog: function(oEvent) {
          let sText = oEvent
            .getSource()
            .getBindingContext("WorkOrderModel")
            .getObject().Procedure.Descr;
          Dialog.openMsgDialog(
            {
              title: "Riesgo Procedimiento de Trabajo",
              content: new sap.m.Text({
                text: sText
              }),
              models: [],
              styleClasses: ["MessageDialog"]
            },
            () => {}
          );
        },

        assignMTS: function(iAtsIndex, aPromises) {
          for (let oMTS of this._aDataMTS) {
            let oMTSPayload = {
              Aufnr: this._iWorkOrder,
              Idats: iAtsIndex,
              Idmts: oMTS.MTS
            };
            aPromises.push(AtsService.saveMTS(oMTSPayload));
          }
        },

        _assignATS: function(oAts, oAtsSignature) {
          oAtsSignature.Atsindex = oAts.Atsindex;
          let aAssignedATS = [];
          let aPromises = [];
          aAssignedATS = aAssignedATS.concat(this._getAssignedElements(oAts));
          aAssignedATS = aAssignedATS.concat(this._getAssignedRisk(oAts));

          this.assignMTS(oAts.Atsindex, aPromises);

          for (let oAssignedATS of aAssignedATS) {
            aPromises.push(AtsService.createAssignAtsSet(oAssignedATS));
          }

          aPromises.push(AtsService.saveSignatureAts(oAtsSignature));

          Promise.all(aPromises)
            .then($.proxy(this.successSaveATS, this, oAtsSignature))
            .catch($.proxy(this.errorSaveATS, this));
        },
        //
        successSaveATS: function(oAtsSignature) {
          Geolocation.getGeolocation(
            oGeoLocation => {
              LogHelper.createLog(oAtsSignature, oGeoLocation, "CREATE_ATS");
            },
            () => {
              console.log("Error al obtener localizacion");
            }
          );

          Dialog.close();
          Dialog.openMsgDialog(
            {
              title: "Alerta",
              content: new sap.m.Text({
                text: "Se ha realizado la firma de manera exitosa"
              }),
              models: [],
              styleClasses: ["MessageDialog"]
            },
            () => {
              this._aDataMTS = [];
              this._oDialogMTS = null;
              this.aSignatures = [];
              this._initializeModels();
              this.getView()
                .getModel("SignedModel")
                .setProperty("/isSigned", true);
            }
          );
        },

        errorSaveATS: function() {
          Dialog.openMsgDialog(
            {
              title: "Alerta",
              content: new sap.m.Text({
                text: "Se ha producido un error al firmar ATS"
              }),
              models: [],
              styleClasses: ["MessageDialog"]
            },
            () => {}
          );
        },

        _onAtsBindingFinish: function(oEvent) {
          Panel.setExpandEvents(oEvent);
          let oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/VersionAts/Busy", false);
        }
      }
    );
  }
);
