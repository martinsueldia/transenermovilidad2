sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderList.workOrderList", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.WorkOrder.view.WorkOrderList
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderList.workOrderList";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.WorkOrder.view.WorkOrderList
     */
    createContent: function (oController) {
        var oPage = new sap.m.Page({
            width: "100%",
            showHeader: true,
            headerContent: [
                sap.ui.jsview("listWorkOrderHeader", "TransenerMovilidad.view.workOrder.workOrderHeader.workOrderHeader")
            ],
            subHeader: [
                new sap.m.Bar({
                    design: sap.m.BarDesign.Auto,
                    contentLeft: [
                        new sap.m.Button({
                            icon: "sap-icon://add",
                            text: "Ordenes",
                            press: [oController._openOTDialog, oController]
                        }).addStyleClass("font-white").addStyleClass("sapUiTinyMarginEnd").addStyleClass("button-menu")
                    ],
                    contentRight: [
                        new sap.m.HBox({
                            alignItems: sap.m.FlexAlignItems.Center,
                            items: [
                                new sap.m.SearchField({
                                    placeholder: "Buscar...",
                                    liveChange: [oController._onLiveChangeOrderSearch, oController] //DB001
                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("search-field-list"),
                                new sap.m.Button({
                                    icon: "sap-icon://add",
                                    text: "{i18n>NewDefect}",
                                    press: [oController._onNewDefect, oController]
                                }).addStyleClass("font-white").addStyleClass("sapUiTinyMarginEnd").addStyleClass("button-menu"),
                                new sap.m.Button({
                                    icon: "sap-icon://synchronize",
                                    press: [oController._sync, oController]
                                }).addStyleClass("font-white").addStyleClass("sapUiTinyMarginEnd").addStyleClass("button-menu")
                            ]
                        })
                    ]
                }).addStyleClass("sub-header-background")
            ],
            content: [
                new sap.m.List({
                    id: this.createId("WOList"),
                    growing: true,
                    growingThreshold: 100,
                    noDataText: "No existen ordenes de trabajo.",
                    updateFinished: [oController._onWorkOrderBindingFinish, oController],
                    type: sap.m.ListType.Navigation,
                    itemPress: [oController._onWorkOrderPress, oController]
                }).bindItems({
                    sorter: new sap.ui.model.Sorter("Gstrp", false, false),
                    path: "WorkOrderModel>/WorkOrderList",
                    template: new sap.m.CustomListItem({
                        type: sap.m.ListType.Navigation,
                        content: [
                            new sap.m.VBox({
                                items: [
                                    new sap.m.HBox({
                                        alignItems: sap.m.FlexAlignItems.Center,
                                        justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                        items: [
                                            new sap.m.HBox({
                                                items: [
                                                    new sap.m.Text({
                                                        text: "{i18n>WorkOrderNumber}"
                                                    }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold").addStyleClass("font-blue"),
                                                    new sap.m.Text({
                                                        text: "{WorkOrderModel>Aufnr}"
                                                    }).addStyleClass("font-bold")
                                                ]
                                            }),
                                            new sap.m.HBox({
                                                alignItems: sap.m.FlexAlignItems.Center,
                                                items: [
                                                    new sap.m.Text({
                                                        text: "{WorkOrderModel>Ktext}"
                                                    }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                                                ]
                                            })
                                        ]
                                    }),
                                    new sap.m.VBox({
                                        items: [
                                            new sap.m.Text({
                                                text: "{WorkOrderModel>Tplnr}"
                                            }).addStyleClass("sapUiTinyMarginBottom").addStyleClass("font-bold"),
                                            new sap.m.HBox({
                                                alignItems: sap.m.FlexAlignItems.Center,
                                                justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                items: [
                                                    new sap.m.VBox({
                                                        items: [
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>StartDate}"
                                                                    }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: {
                                                                            path: "WorkOrderModel>Gstrp",
                                                                            formatter: function (sDate) {
                                                                                return oController._formatDate(sDate);
                                                                            }
                                                                        }
                                                                    }).addStyleClass("font-bold")
                                                                ]
                                                            }),
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>EndDate}"
                                                                    }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: {
                                                                            path: "WorkOrderModel>Gltrp",
                                                                            formatter: function (sDate) {
                                                                                return oController._formatDate(sDate);
                                                                            }
                                                                        }
                                                                    }).addStyleClass("font-bold")
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    new sap.m.VBox({
                                                        visible: {
                                                            parts: [{
                                                                path: "WorkOrderModel>Estado"
                                                            }],
                                                            formatter: $.proxy(oController._isVisibleState, oController)
                                                        },
                                                        items: [
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: ""
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    new sap.m.VBox({
                                                        items: [
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>Supervisor}"
                                                                    }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: "{WorkOrderModel>DescJtrab}"
                                                                    }).addStyleClass("font-bold")
                                                                ]
                                                            }),
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>Applicant}"
                                                                    }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: "{WorkOrderModel>DescSol}"
                                                                    }).addStyleClass("font-bold")
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }).addStyleClass("sapUiSmallMargin")
                        ]
                    })
                })
            ]
        }).addStyleClass("WorkOrderList");

        return oPage;
    }
});