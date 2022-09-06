sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "TransenerMovilidad/helpers/formatter",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/helpers/workOrderHelper",
    "TransenerMovilidad/helpers/log",
    "TransenerMovilidad/helpers/geolocation",
], function (Controller, History, Formatter, WorkOrderService, Dialog, WOHelper, LogHelper, Geolocation) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.workOrderGeneralInfo", {

        _oWorkOrderModel: {},
        oRouter: null,
        _iWorkOrderId: 0,

        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("WorkOrderDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._iWorkOrderId = oArgs.workOrderId;
            let oQuery = oArgs["?query"];
            if (oQuery.tab == "GeneralInformation") {
                this._initializeModels(this._iWorkOrderId);              
                this._initializeApsModel(this._iWorkOrderId);
            } else {
                this._cleanModels();
            }
        },

        _cleanModels: function () {
            let oModel = this.getView().getModel("WorkOrderModel");
            oModel.setProperty("/Observations", []);
        },

        _initializeModels: function (iWorkOrderId) {
            Promise.all([               
                WorkOrderService.getGenObs(iWorkOrderId),
                WorkOrderService.getAps(iWorkOrderId),
                WorkOrderService.getObservations(iWorkOrderId)                             
            ]).then(([oWorkOrder, aObservations]) => {
                this.createWorkOrderModel(oWorkOrder);
                this.setObservations(aObservations);
                this._initObservationModel();
            }).catch((oError) => {
                this.onGenObsError(oError);
            });
        },

        _initializeApsModel: async function (iWorkOrderId) {
            try {
                debugger;
                const aData = await WorkOrderService.getAps(iWorkOrderId);
            } catch (err) {
                debugger;
                sap.m.MessageToast.show("Error");              
            }
        },

        createWorkOrderModel: function (oWorkOrder) {
            let oModel = new sap.ui.model.json.JSONModel(oWorkOrder);
            this.getView().setModel(oModel, "WorkOrderModel");
        },

        setObservations: function (aObservations) {
            let oModel = this.getView().getModel("WorkOrderModel");
            oModel.setProperty("/Observations", aObservations.results);
        },

        setApsModel: function (aAps) {
            let oApsModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oApsModel, "ApsModel");
            oApsModel.setProperty("/Aps", aAps.results);
            //oApsModel.setData({Aps: aAps.results});
        },

        _initObservationModel: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                "Aufnr": this._iWorkOrderId,
                "Commentid": Formatter.getTimeString(),
                "Observaciones": "",
                "Userid": localStorage["user_logged"],
                "Fecha": new Date()
            }); 
            this.getView().setModel(oModel, "NewObservationModel");
        },

        onGenObsError: function (oErr) {
            Dialog.openMsgDialog({
                "title": "Error",
                "content": new sap.m.Text({text: "Ha ocurrido un error."}),
                "models": []
            });
        },

        _saveObservation: function () {
            let oObservationData = this.getView().getModel("NewObservationModel").getData();
            oObservationData.Commentid = oObservationData.Commentid.substr(5, 10);
            WorkOrderService.saveObservation(oObservationData).then(
                $.proxy(this._onSaveObsSuccess, this, oObservationData),
                $.proxy(this._onSaveObsError, this)
            );
        },

        _onSaveObsError: function () {
            Dialog.openMsgDialog({
                "title": "Error",
                "content": new sap.m.Text({text: "Ha ocurrido un error al guardar el mensaje."}),
                "models": []
            });
        },

        _onSaveObsSuccess: function (oObservation) {
            Geolocation.getGeolocation((oGeoLocation) => {
                LogHelper.createLog(oObservation, oGeoLocation, "CREATE_OBSERVATION_ORDER");
            }, () => {
                console.log("Error al obtener localizacion");
            });
            Dialog.openMsgDialog({
                "title": "Correcto",
                "content": new sap.m.Text({
                    text: "El mensaje ha sido guardado correctamente."
                }),
                "models": []
            }, () => {
                this._initializeModels(oObservation.Aufnr);
            });
        },

        _saveAps: function () {
            let oApsTag = "";
            if (this.getView().getModel("ApsModel").getProperty("/FlagCc") === true) {
                oApsTag = this.getView().getModel("ApsModel").setProperty("/FlagCc", "CC");
                this.getView().getModel("ApsModel").setProperty("/FlagAp", false);
            } else if (this.getView().getModel("ApsModel").getProperty("/FlagAp") === true) {
                oApsTag = this.getView().getModel("ApsModel").setProperty("/FlagAp", "AP");
                this.getView().getModel("ApsModel").setProperty("/FlagCc", false);
            }          
            let oApsModel = this.getView().getModel("ApsModel").getData();
            WorkOrderService.saveAps(oApsModel).then(
                $.proxy(this._onSaveApsSuccess, this, oApsData),
                $.proxy(this._onSaveApsError, this)
            );
        },
       
        _onSaveApsSuccess: function () {           
            Dialog.openMsgDialog({
                "title": "Correcto",
                "content": new sap.m.Text({
                    text: "El APS ha sido guardado correctamente."
                }),
                "models": []
            });
        },

        _onSaveApsError: function () {
            Dialog.openMsgDialog({
                "title": "Error",
                "content": new sap.m.Text({text: "Ha ocurrido un error al guardar el APS."}),
                "models": []
            });
        },

        _woIsFinished: function (sStatus) {
            return WOHelper.workOrderIsFinished(sStatus)
        },

        _formatStatus: function (sStatus) {
            return Formatter.formatStatus(sStatus);
        },

        _formatDate: function (dDate) {
            return Formatter.formatDate(dDate);
        },

        _onBackPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            }
        }

    });

});
