sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/format/NumberFormat",
        "TransenerMovilidad/services/workOrderService",
        "TransenerMovilidad/helpers/panel-control",
        "TransenerMovilidad/helpers/workPlace",
        "TransenerMovilidad/helpers/dialog",
        "TransenerMovilidad/helpers/formatter"
    ],
    function (
        Controller,
        NumberFormat,
        WorkOrderService,
        Panel,
        LocalStorage,
        Dialog,
        Formatter
    ) {
        "use strict";

        return Controller.extend(
            "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects",
            {
                _iWorkOrder: 0,
                _oRouter: null,
                _aTechLocations: [],
                ////
                onInit: function () {
                    this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    this._oRouter
                        .getRoute("WorkOrderDetail")
                        .attachPatternMatched(this._onObjectMatched, this);
                },
                ///
                _onObjectMatched: function (oEvent) {
                    var oArgs = oEvent.getParameter("arguments");
                    let oQuery = oArgs["?query"];
                    this._iWorkOrder = oArgs.workOrderId;

                    if (oQuery.tab == "DefectsToCorrect") {
                        this._cleanModels();
                        this._initializeModels();
                    } else {
                        this._cleanModels();
                    }
                },

                _cleanModels: function () {
                    var oModel = this.getView().getModel("WorkOrderModel");
                    oModel.setProperty("/Equipments", []);
                },

                _initializeModels: function () {
                    var oModel = this.getView().getModel("WorkOrderModel");
                    oModel.setProperty("/Equipments/Busy", true);
                    this._initializeWorkOrderModel();
                    this._initializeSearchFieldsModel();
                },

                _initializeWorkOrderModel: function () {
                    let sEmplazamiento = this.getView()
                        .getModel("WorkOrderModel")
                        .getProperty("/Emplazamiento");

                    let aPromises = [];
                    this._aTechLocations = [];
                    WorkOrderService.getUtByWorkOrder(this._iWorkOrder).then(
                        aTechLocations => {
                            for (let oTechLoc of aTechLocations) {
                                this._aTechLocations.push(oTechLoc);
                                aPromises.push(WorkOrderService.getDefects(oTechLoc));
                            }

                            aPromises.push(
                                WorkOrderService.getDefectsByOrder(this._iWorkOrder)
                            );

                            aPromises.push(WorkOrderService.getDefectsByEmplazamiento(sEmplazamiento));

                            Promise.all(aPromises).then(
                                $.proxy(this.onLocSetSuccess, this),
                                $.proxy(this.onLocSetError, this)
                            );
                        }
                    );
                },

                _initializeSearchFieldsModel: function () {
                    let oPageState = {
                        DefectsValue: ""
                    };

                    var oModel = new sap.ui.model.json.JSONModel(oPageState);
                    this.getView().setModel(oModel, "SearchFieldsModel");
                },

                formatDate: function (dDate) {
                    return Formatter.formatDate(dDate);
                },

                getNullCriticyDefects: function (aDefects) {
                    let sEmplazamiento = this.getView().getModel("WorkOrderModel").getProperty("/Emplazamiento");
                    let aCritDefects = _.filter(aDefects, {
                        Maintloc: sEmplazamiento
                    });
                    return {
                        Emplazamiento: sEmplazamiento,
                        CritDefects: aCritDefects,
                        Quantity: aCritDefects.length
                    };
                },

                onLocSetSuccess: function (aDefects) {
                    let aMaintLocDefects = aDefects.pop();
                    //TODO POP AL ADEFECTS PARA PROBAR

                    let oModel = this.getView().getModel("WorkOrderModel");
                    aDefects = [].concat(...aDefects);
                    let aAllDefects = {
                        defects: {
                            defectsByNullCriticy: [this.getNullCriticyDefects(aMaintLocDefects)],
                            defectsByLocation: [],
                            defectsByOrder: [{
                                OrderNumber: this._iWorkOrder,
                                Defects: aDefects.filter(x => x.Aufnr == this._iWorkOrder || x.Asignar == this._iWorkOrder),
                                NumberOfDefectsOnOrder: aDefects.filter(x => x.Aufnr == this._iWorkOrder || x.Asignar == this._iWorkOrder).length
                            }]
                        }
                    };

                    for (let sLocation of this._aTechLocations) {
                        var oLocation = {
                            EquipmentCode: sLocation,
                            EquipmentDescription: sLocation,
                            Defects: aDefects.filter(x => x.Btpln == sLocation),
                            NumberOfDefectsOnEquipment: aDefects.filter(x => x.Btpln == sLocation).length
                        };
                        aAllDefects.defects.defectsByLocation.push(oLocation);
                    }

                    if (aAllDefects.defects.defectsByLocation.length) {
                        oModel.setProperty("/Equipments", {
                            Busy: true,
                            Array: aAllDefects.defects.defectsByLocation
                        });
                    }

                    if (aAllDefects.defects.defectsByOrder.length) {
                        oModel.setProperty("/DefectsByOrder", {
                            Busy: true,
                            Array: aAllDefects.defects.defectsByOrder
                        });
                    }

                    if (aAllDefects.defects.defectsByNullCriticy.length) {
                        oModel.setProperty("/DefectsByNullCriticy", {
                            Quantity: aAllDefects.defects.defectsByNullCriticy[0].Quantity,
                            Busy: true,
                            Array: aAllDefects.defects.defectsByNullCriticy
                        });
                    }

                    if (!aAllDefects.defects.length) {
                        oModel.setProperty("/Equipments/Busy", false);
                    }
                },

                onLocSetError: function (oErr) {
                    //TODO: Realizar tratamiento de excepciones.
                    console.log(oErr);
                },

                _isVisiblePoints: function (sStartPoint, sEndPoint) {
                    return sStartPoint && sEndPoint ? true : false;
                },

                _formatMarkers: function (number) {
                    var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                        maxFractionDigits: 2,
                        groupingEnabled: true,
                        groupingSeparator: ",",
                        decimalSeparator: "."
                    });

                    return oNumberFormat.parse(number);
                },

                _onDefectPress: function (oEvent) {
                    let sWoFinished = this.getView()
                        .getModel("WorkOrderModel")
                        .getProperty("/Estado");
                    if (sWoFinished !== "FI") {
                        let oListItem = oEvent.getParameters().listItem;
                        let oDefect = oListItem
                            .getBindingContext("WorkOrderModel")
                            .getObject();
                        LocalStorage.setCurrentWorkOrder(this._iWorkOrder);
                        this._oRouter.navTo("NewDefectStation", {
                            defectId: oDefect.Qmnum
                        });
                    } else {
                        Dialog.openMsgDialog({
                            title: "Alerta",
                            content: new sap.m.Text({
                                text:
                                    "No se puede realizar la operación debido a que la orden está finalizada"
                            }),
                            models: [],
                            styleClasses: ["MessageDialog"]
                        });
                    }
                },

                formatLongText: function (sLongText) {
                    return Formatter.formatLongText(sLongText);
                },

                _onDefectsBindingFinish: function (oEvent) {
                    Panel.setExpandEvents(oEvent);
                    this.getView()
                        .getModel("WorkOrderModel")
                        .setProperty("/Equipments/Busy", false);
                },

                _onDefectsBindingFinishOrder: function (oEvent) {
                    Panel.setExpandEvents(oEvent);
                    this.getView()
                        .getModel("WorkOrderModel")
                        .setProperty("/DefectsByOrder/Busy", false);
                },

                _verifyIfDefectsHaveContent: function (oParent) {
                    var oParentContent = oParent.getContent();
                    if (
                        oParentContent.length > 0 &&
                        oParentContent[0].getContent().length > 0
                    )
                        return oParent.getContent()[0].getContent()[0];
                    else return false;
                },

                _filterByDefectsProps: function () {
                    let aDefectsItemsFilter = [];
                    let sSearchTerm = this.getView()
                        .getModel("SearchFieldsModel")
                        .getProperty("/DefectsValue")
                        .toLowerCase();
                    let aEquipmentsItemPanels = this.getView()
                        .byId("DefectsToCorrectContainer")
                        .getItems();
                    let aOrderDefectListItemPanel = this.getView()
                        .byId("orderDefects")
                        .getItems();

                    let aDefectsOfEmplazaminto = this.getView().byId("orderDefectsCrit").getItems();


                    let aLists = [aEquipmentsItemPanels, aOrderDefectListItemPanel, aDefectsOfEmplazaminto];

                    for (let list of aLists) {
                        for (var i = 0; i < list.length; i++) {
                            var aBindingSubItems = this._verifyIfDefectsHaveContent(list[i]);
                            if (aBindingSubItems) {
                                var oParentBindings = aBindingSubItems.getBinding("items");
                                var aSubItemsTable = aBindingSubItems.getItems();
                                for (let oSubItem of aSubItemsTable) {
                                    var oSubItemObj = oSubItem
                                        .getBindingContext("WorkOrderModel")
                                        .getObject();
                                    for (let prop in oSubItemObj) {
                                        if (
                                            typeof oSubItemObj[prop] === "string" &&
                                            oSubItemObj[prop]
                                        ) {
                                            aDefectsItemsFilter.push(
                                                new sap.ui.model.Filter(
                                                    prop,
                                                    sap.ui.model.FilterOperator.Contains,
                                                    sSearchTerm
                                                )
                                            );
                                        }
                                    }
                                }
                                oParentBindings.filter(
                                    new sap.ui.model.Filter(aDefectsItemsFilter, false)
                                );
                            }
                        }
                    }
                },

                _filterByParentNodes: function () {
                    let searchTerm = this.getView()
                        .getModel("SearchFieldsModel")
                        .getProperty("/DefectsValue")
                        .toLowerCase();
                    let bindingEquipmentCode = this.getView()
                        .byId("DefectsToCorrectContainer")
                        .getBinding("items");
                    let bindingDefByOrder = this.getView()
                        .byId("orderDefects")
                        .getBinding("items");

                    let aFilter = [];
                    let oFilter = new sap.ui.model.Filter(
                        [
                            new sap.ui.model.Filter({
                                path: "Defects",
                                test: aDefects => {
                                    var objectMatched = false;

                                    for (let oDefect of aDefects) {
                                        for (let prop in oDefect) {
                                            if (
                                                typeof oDefect[prop] === "string" &&
                                                oDefect[prop] !== ""
                                            ) {
                                                if (
                                                    oDefect[prop].toLowerCase().indexOf(searchTerm) != -1
                                                ) {
                                                    objectMatched = true;
                                                    return objectMatched;
                                                    objectMatched = false;
                                                }
                                            }
                                        }
                                    }
                                }
                            }),
                            new sap.ui.model.Filter(
                                "EquipmentCode",
                                sap.ui.model.FilterOperator.Contains,
                                searchTerm
                            ),
                            new sap.ui.model.Filter(
                                "OrderNumber",
                                sap.ui.model.FilterOperator.Contains,
                                searchTerm
                            ),
                            new sap.ui.model.Filter(
                                "Btpln",
                                sap.ui.model.FilterOperator.Contains,
                                searchTerm
                            )
                        ],
                        false
                    );

                    aFilter.push(oFilter);
                    bindingEquipmentCode.filter(aFilter);
                    bindingDefByOrder.filter(aFilter);
                   // bindingDefEmplazamiento.filter(aFilter);

                },

                _onFilterSearch: function (oEvent) {
                    let searchTerm = oEvent
                        .getSource()
                        .getValue()
                        .toLowerCase();
                    let oBindingEquipmentCodes = this.getView()
                        .byId("DefectsToCorrectContainer")
                        .getBinding("items");
                    let oBindingDefByOrder = this.getView()
                        .byId("orderDefects")
                        .getBinding("items");

                    let oBindingEmplazamientoDefects = this.getView().byId("orderDefectsCrit").getBinding("items");

                    if (!searchTerm) {
                        oBindingEquipmentCodes.filter([]);
                        oBindingDefByOrder.filter([]);
                        oBindingEmplazamientoDefects.filter([]);
                        Panel._collapseAllPanels(null, this.getView().byId("orderDefectsCrit"));
                        Panel._collapseAllPanels(null, this.getView().byId("orderDefects"));
                        Panel._collapseAllPanels(null, this.getView().byId("DefectsToCorrectContainer")
                        );
                    } else {
                        this._filterByDefectsProps();
                        this._filterByParentNodes();
                    }
                },

                _onDefectExpand: function (oEvent) {
                    var bExpanded = oEvent.getParameters().expand;
                    if (bExpanded) {
                        this._filterByDefectsProps();
                        Panel.setItemPanelActive(oEvent.getSource(), bExpanded);
                    }
                }

            }
        );
    }
);
