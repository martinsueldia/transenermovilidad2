sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/helpers/user",
    "TransenerMovilidad/helpers/offlineStore",
    "TransenerMovilidad/services/masterDataService",
    "TransenerMovilidad/helpers/dji-integration",
    "TransenerMovilidad/helpers/SQLite",
    "TransenerMovilidad/helpers/availableCodesHelper",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/services/workOrderService",
], function (Controller, WorkPlaceHelper, UserHelper, OfflineStoreHelper, MasterDataService, DJIHelper, SQLite, availableWorkplaceCodesHelper, Dialog, WorkOrderService) {

    "use strict";

    return Controller.extend("TransenerMovilidad.view.workPlace.workPlaceSelector.workPlaceSelector", {

        oRouter: null,
        _oDialogWO: null,

        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        },
        //
        onBeforeRendering: function () {
            if (WorkPlaceHelper.getWorkPlace()) {
                DJIHelper._install();
                $("#loading-content").show();
                SQLite.createDataBase("TransenerMovilidad", () => {
                    OfflineStoreHelper.closeAppStores(() => {
                        OfflineStoreHelper.startAppStores(() => {
                            this.oRouter.navTo("WorkOrderList", null, true);
                        })
                    });
                });
            }
        },

        onAfterRendering: function () {
            if (!WorkPlaceHelper.getWorkPlace()) {
                this.getView().setBusy(true);
                MasterDataService.getWorkPlaceMaster(false).then(
                    $.proxy(this._loadWorkPlaceSuccess, this),
                    $.proxy(this._loadWorkPlaceError, this)
                );

                this._createModelForSelectState();
            }

            $("body").addClass("workplaceSelectorCont");
        },

        _filterScpGroupsByWorkplaces: function (aUserAvaibleGroups) {
            let aCodes = availableWorkplaceCodesHelper.getCodes();
            let aFilteredWorkplaces = [];
            let aGroupValue;

            for (let oGroup of aUserAvaibleGroups) {
                aGroupValue = oGroup.value;

                for (let code of aCodes) {
                    if (aGroupValue.startsWith(code)) {
                        aFilteredWorkplaces.push(oGroup);
                    }
                }
            }

            return aFilteredWorkplaces;
        },

        _filterSapWorkplacesByUser: function (aFilteredScpWorkplaces) {
            let afilteredSapWpByUser = [new sap.ui.model.Filter("Arbpl", sap.ui.model.FilterOperator.EQ, 'MDO')];
            let oFilter;
            for (let scpWp of aFilteredScpWorkplaces) {
                oFilter = new sap.ui.model.Filter("Arbpl", sap.ui.model.FilterOperator.EQ, scpWp.value);
                afilteredSapWpByUser.push(oFilter);
            }
            return afilteredSapWpByUser;
        },
        //
        _successGetUserName: function (sUserMail) {
            $.ajax({
                url: "https://" + window.env.workPlaceURL + "/userapi/Users?filter=emails eq '" + sUserMail + "'"
            }).done((data) => {
                let oBinding = this.getView().byId("workplaceSelect").getBinding("items");
                let oUser = data.Resources[0];
                let aUserAvaibleGroups = oUser.groups;
                let aFilterScpGroupsByWorkplaces = this._filterScpGroupsByWorkplaces(aUserAvaibleGroups);//filtro scp
                oBinding.filter(this._filterSapWorkplacesByUser(aFilterScpGroupsByWorkplaces));//filtro sap y scp
            }).fail(function () {
                alert("No se pudo conectar con la api de ususarios");
            });
        },

        _errorGetUserName: function (fnUserNameError) {
            console.log(fnUserNameError);
        },

        _loadWorkPlaceSuccess: function (oDataWorkPlace) {
            let aDataWorkPlace = oDataWorkPlace.results;
            UserHelper.setUser(oDataWorkPlace.results[0].Usuario);

            ////
            aDataWorkPlace.map(oWorkPlace => {
                oWorkPlace.GewrkKtext = oWorkPlace.Arbpl + " - " + oWorkPlace.Ktext;
            });
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(9999);
            oModel.setData({
                WorkPlace: aDataWorkPlace
            });
            this.getView().setModel(oModel, "WorkPlace");
            this.getView().setBusy(false);

            UserHelper.getUserName($.proxy(this._successGetUserName, this), $.proxy(this._errorGetUserName, this));


            var oBinding = this.getView().byId("workplaceSelect").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter("Arbpl", sap.ui.model.FilterOperator.EQ, 'MDO'));

            DJIHelper.initPlugin();
        },

        _loadWorkPlaceError: function () {
            this.getView().setBusy(false);
        },
//
        _createModelForSelectState: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                bValidSelection: false,
                ErrorState: sap.ui.core.ValueState.None,
                WorkPlaceSelected: "",
                oWorkPlaceSelected: {}
            });
            this.getView().setModel(oModel, "WorkPlaceSelection");
        },

        onWorkPlaceSelectionChange: function (oEvent) {
            let oModelWorkPlaceSelection = this.getView().getModel("WorkPlaceSelection");
            if (oEvent.getParameter("selectedItem")) {
                let oWorkPlace = oEvent.getParameter("selectedItem").getBindingContext("WorkPlace").getObject();
                oModelWorkPlaceSelection.setProperty("/WorkPlaceSelected", oWorkPlace.Gewrk);
                oModelWorkPlaceSelection.setProperty("/oWorkPlaceSelected", oWorkPlace);
                oModelWorkPlaceSelection.setProperty("/bValidSelection", true);
                oModelWorkPlaceSelection.setProperty("/ErrorState", sap.ui.core.ValueState.None);
            } else {
                oModelWorkPlaceSelection.setProperty("/WorkPlaceSelected", "");
                oModelWorkPlaceSelection.setProperty("/oWorkPlaceSelected", {});
                oModelWorkPlaceSelection.setProperty("/bValidSelection", false);
                oModelWorkPlaceSelection.setProperty("/ErrorState", sap.ui.core.ValueState.Error);
            }
        },
        //
        closeSession: function () {
            Dialog.openConfirmDialog({
                    title: "Alerta",
                    content: new sap.m.Text({
                        text: "¿Está seguro que desea cerrar sesión?"
                    }),
                    models: []
                },
                () => {
                    UserHelper.doDeleteRegistration(
                        $.proxy(UserHelper.doLoadStartPage, UserHelper),
                        $.proxy(UserHelper.errorDeleteRegistration, UserHelper)
                    );
                }
            );

        },

        createWorkOrdersByWorkplaceModel: function (aOrders) {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(9999);
            oModel.setData({
                Orders: aOrders
            });
            ////
            this.getView().setModel(oModel, "WorkOrderByWorkplaceJsonModel");
            WorkPlaceHelper.setAllOrders(JSON.stringify(aOrders));
        },
        //ashdahsd hectarff
        loadApplicationData: function () {
            let oModelWorkPlaceSelection = this.getView().getModel("WorkPlaceSelection");
            let sWorkPlace = oModelWorkPlaceSelection.getProperty("/WorkPlaceSelected");
            $("#loading-content").show();

            SQLite.createDataBase("TransenerMovilidad", $.proxy(SQLite.successOpenDatabase, SQLite), $.proxy(SQLite.errorOpenDatabase, SQLite));
            WorkPlaceHelper.setWorkPlace(sWorkPlace);
            WorkPlaceHelper.setWerks(oModelWorkPlaceSelection.getProperty("/oWorkPlaceSelected/Werks"));
            WorkPlaceHelper.setCompanyCode(oModelWorkPlaceSelection.getProperty("/oWorkPlaceSelected/Company"));
            WorkPlaceHelper.setRegion(oModelWorkPlaceSelection.getProperty("/oWorkPlaceSelected/Ktext"));
            WorkPlaceHelper.setSpeciality(oModelWorkPlaceSelection.getProperty("/oWorkPlaceSelected/Tcuad"));
            OfflineStoreHelper.startAppStores(() => {
                this.oRouter.navTo("WorkOrderList", null, true);
            });
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
            let s = "(";
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
        ////
        confirmDialog: function (oEvent) {
            let aSelectedOT = oEvent.getParameter("selectedItems");
            if (aSelectedOT.length > 0) {

                let aPromises = [];
                for (let oOt of aSelectedOT) {
                    let oData = oOt.getBindingContext("WorkOrderByWorkplaceJsonModel").getObject();
                    aPromises.push(WorkOrderService.postOTByWorkplace({Aufnr: oData.Aufnr, Gewrk: oData.Gewrk}))
                }

                ////
                Promise.all(aPromises).then(() => {
                    let aOrdersSelected = this.getSelectedOrders(aSelectedOT);
                    let sOrdersQuery = this.getOrdersQuery(aOrdersSelected);
                    let sOrderForNotifications = this.getOrdersForNotifications(aOrdersSelected);
                    let sAttachOrder = this.getOrdersForAttachments(aOrdersSelected);
                    WorkPlaceHelper.setSelectedWorkOrders(sOrdersQuery);
                    WorkPlaceHelper.setAttachOrders(sAttachOrder);
                    WorkPlaceHelper.setOrderNotifications(sOrderForNotifications);
                    this.loadApplicationData();
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



            } else {
                Dialog.openMsgDialog(
                    {
                        title: "Alerta",
                        content: new sap.m.Text({
                            text: "Debe seleccionar al menos una OT"
                        }),
                        models: [],
                        styleClasses: ["MessageDialog"]
                    },
                    () => {
                    }
                );
            }

        },

        closeDialog: function (oEvent) {
            //this._oDialogWO._oDialog.close();
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

        openDialogWorkOrders: function () {
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
                    })
                }
            }).addStyleClass("DialogWorkOrders");
            this._oDialogWO = oDialog;
            this.getView().addDependent(this._oDialogWO);
            this._oDialogWO.open();
        },

        onWorkPlaceSelectionConfirm: function () {
            let oModelWorkPlaceSelection = this.getView().getModel("WorkPlaceSelection");
            let bSelectedWorkplace = oModelWorkPlaceSelection.getProperty("/bValidSelection");
            if (bSelectedWorkplace) {
                let sGewrk = oModelWorkPlaceSelection.getProperty("/oWorkPlaceSelected/Gewrk");
                this.getView().setBusy(true);
                WorkOrderService.getOTByWorkplace(sGewrk).then((aOrders) => {
                    this.createWorkOrdersByWorkplaceModel(aOrders);
                    this.getView().setBusy(false);
                    this.openDialogWorkOrders();
                }).catch(() => {
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
            }

        }

    });

});
