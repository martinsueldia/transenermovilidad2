sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/helpers/networkInfo",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/busyDialog",
    "TransenerMovilidad/helpers/offlineStore",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/helpers/i18nTranslation",
    "TransenerMovilidad/helpers/formatter",
    "TransenerMovilidad/helpers/attachment",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/helpers/dataAccess",
], function (Controller, networkInfo, workOrderService, BusyDialog, OfflineStore, Dialog, i18nTranslationHelper, Formatter, Attachment, WorkPlaceHelper, DataAccess) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderList.workOrderList", {
        oRouter: null,

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf TransenerMovilidad.view.WorkOrder.WorkOrderList
         */
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("WorkOrderList").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            workOrderService.getList($.proxy(this._onSuccessLoadWO, this), $.proxy(this._onErrorLoadWO, this));
        },

        _formatDate: function (dDate) {
            if (dDate) {
                return Formatter.formatDate(dDate);
            }
        },

        _onSuccessLoadWO: function (oDataWO) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                WorkOrderList: oDataWO.results
            });
            this.getView().setModel(oModel, "WorkOrderModel");
            $("#loading-content").hide();
        },

        _onErrorLoadWO: function (e) {
            console.log(e)
            //TODO: Realizar tratamiento de excepciones
        },

        _createModelWithNoSelectedOrders: function (aOrders) {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(9999);
            oModel.setData({
                Orders: aOrders
            });
            this.getView().setModel(oModel, "WorkOrderByWorkplaceJsonModel");
        },

        closeDialog: function (oEvent) {
            this._oDialogWO._oDialog.close();
            this._oDialogWO._oDialog.destroy(true);
        },
        //
        getOrdersForAttachments: function (aOrdersSelected) {
            let s = "";
            for (let i = 0; i < aOrdersSelected.length; i++) {
                if (i === aOrdersSelected.length - 1) {
                    s += 'Aufnr eq ' + "'" + aOrdersSelected[i] + "'"
                } else {
                    s += 'Aufnr eq ' + "'" + aOrdersSelected[i] + "' and "
                }
            }
            return s;
        },

        confirmDialog: function (oEvent) {
            let aSelectedOT = oEvent.getParameter("selectedItems");
            if (aSelectedOT.length > 0) {
                Dialog.openConfirmDialog({
                        title: "Alerta",
                        content: new sap.m.Text({
                            text: "Se recomienda sincronizar antes de realizar este proceso ya que se perderá los datos anteriores, ¿está seguro?"
                        }),
                        models: []
                    },
                    () => {
                        if (networkInfo.getNetworkInfo() != 'No network connection') {

                            let aPromises = [];
                            for (let oOt of aSelectedOT) {
                                let oData = oOt.getBindingContext("WorkOrderByWorkplaceJsonModel").getObject();
                                aPromises.push(workOrderService.postOTByWorkplace({Aufnr: oData.Aufnr, Gewrk: oData.Gewrk}))
                            }


                            Promise.all(aPromises).then(() => {
                                // if device has connection, do sync
                                $("#loading-content").show();

                                let aOrdersSelected = this.getSelectedOrders(aSelectedOT);
                                let sOrdersQuery = this.getOrdersQuery(aOrdersSelected);
                                let sOrderForNotifications = this.getOrdersForNotifications(aOrdersSelected);
                                let sOrdersAttach = this.getOrdersForAttachments(aOrdersSelected);
                                WorkPlaceHelper.setSelectedWorkOrders(sOrdersQuery);
                                WorkPlaceHelper.setAttachOrders(sOrdersAttach);
                                WorkPlaceHelper.setOrderNotifications(sOrderForNotifications);
                                //
                                DataAccess.deleteAllTables().then(() => {
                                    OfflineStore.flushStores(() => {
                                        OfflineStore.clearStores(() => {
                                            OfflineStore.startAppStores(() => {
                                                workOrderService.getList($.proxy(this._onSuccessLoadWO, this), $.proxy(this._onErrorLoadWO, this));
                                            }, true);
                                        }, true);
                                    }, true);
                                });
                            }).catch(() => {
                                Dialog.openMsgDialog(
                                    {
                                        title: "Alerta",
                                        content: new sap.m.Text({
                                            text: "Error al enviar OT's"
                                        }),
                                        models: [],
                                        styleClasses: ["MessageDialog"]
                                    },
                                    () => {
                                    }
                                );
                            });

                        }
                    }
                );
            }
        },

        getSelectedOrders: function (aSelectedOTItems) {
            let aOTs = [];
            for (let oOTItem of aSelectedOTItems) {
                let oOTContextData = oOTItem.getBindingContext("WorkOrderByWorkplaceJsonModel").getObject();
                aOTs.push(oOTContextData.Aufnr)
            }
            WorkPlaceHelper.setSelectedOrders(JSON.stringify(aOTs));
            return aOTs;
        },

        getOrdersQuery: function (aOrdersSelected) {
            let s = "and (";
            for (let i = 0; i < aOrdersSelected.length; i++) {
                if (i === aOrdersSelected.length - 1) {
                    s += ' Aufnr eq ' + "'" + aOrdersSelected[i] + "')"
                } else {
                    s += ' Aufnr eq ' + "'" + aOrdersSelected[i] + "' or"
                }
            }
            return s;
        },
        //
        getOrdersForNotifications: function (aOrdersSelected) {
            let s = "and (";
            for (let i = 0; i < aOrdersSelected.length; i++) {
                if (i === aOrdersSelected.length - 1) {
                    s += ' WorkOrderNumber eq ' + "'" + aOrdersSelected[i] + "')"
                } else {
                    s += ' WorkOrderNumber eq ' + "'" + aOrdersSelected[i] + "' or"
                }
            }
            return s;
        },

        searchOTS: function (oEvent) {
            let sSearchCriteria = oEvent.getParameter("value");
            let aFilters = [];
            aFilters.push(
                new sap.ui.model.Filter(
                    "Ktext",
                    sap.ui.model.FilterOperator.Contains,
                    sSearchCriteria
                ),
                new sap.ui.model.Filter(
                    "Aufnr",
                    sap.ui.model.FilterOperator.Contains,
                    sSearchCriteria
                )
            );
            let oFilter = new sap.ui.model.Filter({
                filters: aFilters,
                and: false,
            });
            let aOTSBinding = oEvent.getParameter("itemsBinding");
            aOTSBinding.filter(oFilter);
        },

        _openOTDialog: function () {
            if (networkInfo.getNetworkInfo() != 'No network connection') {
                this.getView().setBusy(true);
                let sGewrk = WorkPlaceHelper.getWorkPlace();
                workOrderService.getOTByWorkplace(sGewrk).then((aOrders) => {
                    this.getView().setBusy(false);
                    this._createModelWithNoSelectedOrders(aOrders);
                    let oDialog = new sap.m.SelectDialog({
                        title: "Ordenes de Trabajo",
                        rememberSelections: true,
                        showClearButton: true,
                        multiSelect: true,
                        cancel: [this.closeDialog, this],
                        confirm: [this.confirmDialog, this],
                        search: [this.searchOTS, this],
                        noDataText: "No existen ordenes de trabajo para este puesto de trabajo",
                        items: {
                            path: "WorkOrderByWorkplaceJsonModel>/Orders",
                            template: new sap.m.CustomListItem({
                                content: [
                                    new sap.m.HBox({
                                        width: "100%",
                                        alignContent: sap.m.FlexAlignContent.SpaceBetween,
                                        items:
                                            [
                                                new sap.m.VBox({
                                                    width: "50%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: {
                                                                path: "WorkOrderByWorkplaceJsonModel>Aufnr",
                                                                formatter: (sAufnr) => {
                                                                    return `Orden N° ${sAufnr}`;
                                                                }
                                                            }
                                                        }),
                                                        new sap.m.Text({
                                                            text: {
                                                                path: "WorkOrderByWorkplaceJsonModel>Tplnr",
                                                                formatter: (sTplnr) => {
                                                                    return `Ubicación Tecnica: ${sTplnr}`;
                                                                }
                                                            }
                                                        }),
                                                    ]
                                                }).addStyleClass("sapUiLargeMarginEnd"),
                                                new sap.m.VBox({
                                                    width: "50%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: "{WorkOrderByWorkplaceJsonModel>Ktext}"
                                                        }),
                                                        new sap.m.Text({
                                                            text: {
                                                                path: "WorkOrderByWorkplaceJsonModel>Grtrp",
                                                                formatter: (Grtrp) => {
                                                                    return `Inicio: ${Grtrp}`;
                                                                }
                                                            }
                                                        }),
                                                    ]
                                                })
                                            ]
                                    })
                                ]
                            }).addStyleClass("paddingCustomList")
                        }
                    }).addStyleClass("DialogWorkOrders");
                    this._oDialogWO = oDialog;
                    this.getView().addDependent(this._oDialogWO);
                    this._oDialogWO.open();
                }).catch(() => {
                    this.getView().setBusy(false);
                    Dialog.openMsgDialog(
                        {
                            title: "Alerta",
                            content: new sap.m.Text({
                                text: "Se ha producido un error al obtener las ordenes de trabajo para este puesto de trabajo"
                            }),
                            models: [],
                            styleClasses: ["MessageDialog"]
                        },
                        () => {
                        }
                    );
                });

            } else {
                Dialog.openMsgDialog({
                    "title": "Alerta",
                    "content": new sap.m.Text({
                        text: "{i18n>DeviceDisconnected}",
                        textAlign: sap.ui.core.TextAlign.Center
                    }),
                    "models": []
                });
            }

        },

        _onWorkOrderBindingFinish: function (oEvent) {
            try {
                var oList = oEvent.getSource();
                var aListItem = oList.getItems();
                for (var i = 0; i < aListItem.length; i++) {
                    this._setStatusColor(aListItem[i]);
                }
            } catch (e) {
                //TODO: Hacer tratamiento de excepciones.
            }
        },

        _setStatusColor: function (oListItem) {
            var oWorkOrder = oListItem.getBindingContext("WorkOrderModel").getObject();
            switch (oWorkOrder.Estado) {
                case "PE":
                case "VE":
                    oListItem.addStyleClass("status-pending");
                    break;
                case "FI":
                    oListItem.addStyleClass("status-finished");
                    break;
                case "EC":
                    oListItem.addStyleClass("status-started");
                    break;
                default:
                    oListItem.addStyleClass("status-indeterminated");
            }
        },

        _sync: function () {
            if (networkInfo.getNetworkInfo() != 'No network connection') {
                // if device has connection, do sync
                BusyDialog.open("Synchronizing", "Subiendo información");
                OfflineStore.flushStores(() => {
                    BusyDialog.close();
                    BusyDialog.open("Synchronizing", "Refrescando información...");
                    OfflineStore.refreshStores(() => {
                        BusyDialog.open("Synchronizing", "Subiendo adjuntos...");
                        Attachment.synchronizeAttachments(() => {
                            BusyDialog.open("Synchronizing", "Finalizando sincronización...");
                            this._syncOk();
                        }, () => {
                            BusyDialog.close();
                            Dialog.openMsgDialog({
                                "title": "{i18n>FailedSyncTitle}",
                                "content": new sap.m.Text({
                                    text: "Error al sincronizar adjuntos.",
                                    textAlign: sap.ui.core.TextAlign.Center
                                }),
                                "models": []
                            });
                        })
                    });
                });
            } else {
                // if device is disconnected
                Dialog.openMsgDialog({
                    "title": "{i18n>FailedSyncTitle}",
                    "content": new sap.m.Text({
                        text: "{i18n>DeviceDisconnected}",
                        textAlign: sap.ui.core.TextAlign.Center
                    }),
                    "models": []
                });
            }

        },

        _syncOk: function () {
            let sMsg = i18nTranslationHelper.getTranslation("SyncFinishSuccessful");
            BusyDialog.close();
            Dialog.openMsgDialog({
                "title": "SuccessfulSync",
                "content": new sap.m.Text({text: sMsg}),
                "models": []
            }, () => {
                workOrderService.getList($.proxy(this._onSuccessLoadWO, this), $.proxy(this._onErrorLoadWO, this));
            });
        },

        _onWorkOrderPress: function (oEvent) {
            let oItemPressed = oEvent.getParameters().listItem;
            setTimeout(() => {
                this.oRouter.navTo("WorkOrderDetail", {
                    workOrderId: oItemPressed.getBindingContext("WorkOrderModel").getObject().Aufnr,
                    query: {
                        tab: "GeneralInformation"
                    }
                })
            });
        },

        _onLiveChangeOrderSearch: function (oEvent) {
            let sSearchString = oEvent.getSource().getValue();
            let aFilter = [];
            let oList = this.getView().byId("WOList");
            let oBinding = oList.getBinding("items");

            if (sSearchString) {
                aFilter.push(
                    new sap.ui.model.Filter("Ktext", sap.ui.model.FilterOperator.Contains, sSearchString),
                    new sap.ui.model.Filter("Tplnr", sap.ui.model.FilterOperator.Contains, sSearchString),
                    new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, sSearchString),
                    new sap.ui.model.Filter("DescSol", sap.ui.model.FilterOperator.Contains, sSearchString),
                    new sap.ui.model.Filter("DescJtrab", sap.ui.model.FilterOperator.Contains, sSearchString)
                );
                oBinding.filter(new sap.ui.model.Filter(aFilter, false));
            } else {
                oBinding.filter(aFilter);
            }
        },

        _onNewDefect: function () {
            this.oRouter.navTo("NewDefectStation");
        },

        _isVisibleState: function (state) {
            return state === "VE"
        },


    });
});
