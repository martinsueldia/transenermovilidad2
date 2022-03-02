sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/services/AtsService",
    "TransenerMovilidad/helpers/formatter"
], function (Controller, History, WorkOrderService, AtsService, Formatter) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDetail", {

        oRouter: null,
        _iWorkOrderId: 0,

        onInit: function () {
            this._initializeCurrentViewModel();
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("WorkOrderDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onBackPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            }
        },

        _loadTab: function (args) {
            let oQuery = args["?query"];
            this._iWorkOrderId = args.workOrderId;

            if (oQuery && oQuery.tab) {
                this.getView().getModel("CurrentViewModel").setProperty("/viewSelectedKey", oQuery.tab);
            } else {
                this.oRouter.navTo("WorkOrderDetail", {
                    workOrderId: this._iWorkOrderId,
                    query: {
                        tab: oQuery.tab
                    }
                }, true);
            }
        },

        _onObjectMatched: function (oEvent) {
            let oModel = this.getView().getModel("WorkOrderModel");
            this._loadTab(oEvent.getParameter("arguments"));

            if (!oModel || oModel.getData().Aufnr != this._iWorkOrderId) {
                this._initializeModel();
            }
        },

        _successGetHeader: function (aHeaders) {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                isSigned: aHeaders.results.length > 0
            });
            this.getView().setModel(oModel, "SignedModel");

        },

        _errorGetHeader: function () {
            console.log("error al obtener la cabecera de ats")
        },

        _createComboControlModel: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                Control: ""
            });
            this.getView().setModel(oModel, "ComboControlModel");
        },

        _createBlankCanvasModel: function () {
            let oBlankCanvasModel = new sap.ui.model.json.JSONModel();
            oBlankCanvasModel.setData({
                BlankImage: "",
                Created: false
            });
            this.getView().setModel(oBlankCanvasModel, "BlankBinaryModel");
        },


        _initializeModel: function () {
            this._createBlankCanvasModel();
            this._createComboControlModel();


            AtsService.getSignatureHeader(this._iWorkOrderId)
                .then($.proxy(this._successGetHeader, this))
                .catch($.proxy(this._errorGetHeader, this));

            this.getView().setModel(WorkOrderService.getModel(), "WorkOrderService");

            Promise.all([
                WorkOrderService.getGenObs(this._iWorkOrderId),
                WorkOrderService.getObservations(this._iWorkOrderId),
                WorkOrderService.getWorkOrderBundles()
            ]).then(([oWorkOrder, aObservations, aPersonalHabilitado]) => {
                this.createWorkOrderBundles(aPersonalHabilitado);
                this.createWorkOrderModel(oWorkOrder);
                this.setObservations(aObservations);
                this._initObservationModel();
            }).catch((oError) => {
                this.onGenObsError(oError);
            });
        },
        //
        createWorkOrderBundles: function (oData) {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(9999);
            oModel.setData({
                Personas: oData.results
            })
            this.getView().setModel(oModel, "PersonalHabilitadoModel");
        },

        createWorkOrderModel: function (oWorkOrder) {
            let oModel = new sap.ui.model.json.JSONModel(oWorkOrder);
            this.getView().setModel(oModel, "WorkOrderModel");
        },

        setObservations: function (aObservations) {
            let oModel = this.getView().getModel("WorkOrderModel");
            oModel.setProperty("/Observations", aObservations.results);
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

        _onTabSelect: function (oEvent) {
            this.oRouter.navTo("WorkOrderDetail", {
                workOrderId: this._iWorkOrderId,
                query: {
                    tab: oEvent.getParameter("selectedKey")
                }
            }, true);
        },

        _initializeCurrentViewModel: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModel, "CurrentViewModel");
        },

        onGenObsError: function (oErr) {
            console.log(oErr);
        },
    });

});