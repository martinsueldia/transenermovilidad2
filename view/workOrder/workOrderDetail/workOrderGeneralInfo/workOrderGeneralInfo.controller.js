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

            this._iWorkOrderId = this.oRouter._oRouter._prevRoutes[0].params[0];
            this._initializeModels(this._iWorkOrderId);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._iWorkOrderId = oArgs.workOrderId;
            let oQuery = oArgs["?query"];
            if (oQuery.tab === "GeneralInformation") {
                this._initializeModels(this._iWorkOrderId);
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
                WorkOrderService.getObservations(iWorkOrderId),
                WorkOrderService.getAps(iWorkOrderId)
            ]).then(([oWorkOrder, aObservations, aAps]) => {
                this.createWorkOrderModel(oWorkOrder);
                this.setObservations(aObservations);
                this.setApsModel(aAps);
                this._initObservationModel();
            }).catch((oError) => {
                this.onGenObsError(oError);
            });
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

            const Aps = aAps.results.filter(aps => !!aps.Qmnun || !!aps.Tplnr || !!aps.Qmtxt);
            oApsModel.setProperty("/Aps", Aps);

            const oFlagsAps = aAps.results.find(aps => !aps.Qmnun && !aps.Tplnr && !aps.Qmtxt);
            oApsModel.setProperty("/FlagsAps", oFlagsAps);

            const Flag_Cc = oFlagsAps && oFlagsAps.Flag_Cc === "X";
            oApsModel.setProperty("/Flag_Cc", Flag_Cc);

            const Flag_Ap = oFlagsAps && oFlagsAps.Flag_Ap === "X";
            oApsModel.setProperty("/Flag_Ap", Flag_Ap);
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
            const oApsModel = this.getView().getModel("ApsModel");

            let oFlagsAps = oApsModel.getProperty("/FlagsAps");
            const bCreateNewFlagsAps = !oFlagsAps;
            if (bCreateNewFlagsAps) {
                oFlagsAps = {
                    Aufnr: this._iWorkOrderId,
                    Flag_Cc: "",
                    Flag_Ap: ""
                };
            }

            let CCSelected = oApsModel.getProperty("/Flag_Cc") === true;
            let APSelected = oApsModel.getProperty("/Flag_Ap") === true;

            oFlagsAps.Flag_Cc = CCSelected ? "X" : "";
            oFlagsAps.Flag_Ap = APSelected ? "X" : "";

            oApsModel.setProperty("/FlagsAps", oFlagsAps);

            let successMsgCC = CCSelected ? "Control de Cascada activado." : "Control de Cascada desactivado.";
            let successMsgAP = APSelected ? "Cambio en Documentación activado." : "Cambio en Documentación desactivado.";
            let successMsg = successMsgCC + "\n" + successMsgAP;

            WorkOrderService.saveAps(oFlagsAps, bCreateNewFlagsAps).then(
                $.proxy(this._onSaveApsSuccess, this, successMsg),
                $.proxy(this._onSaveApsError, this)
            );
        },

        _onSaveApsSuccess: function (successMsg) {
            Dialog.openMsgDialog({
                "title": "Cambios guardados correctamente",
                "content": new sap.m.Text({
                    text: successMsg
                }),
                "models": []
            });
        },

        _onSaveApsError: function () {
            Dialog.openMsgDialog({
                "title": "Error",
                "content": new sap.m.Text({text: "Ha ocurrido un error al guardar el Aviso de Planoteca."}),
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
