sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.workOrderGeneralInfo", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.view.workOrderGeneralInfo
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.workOrderGeneralInfo";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.view.workOrderGeneralInfo
     */
    createContent: function (oController) {
        return new sap.m.App({
            pages: [
                new sap.m.Page({
                    enableScrolling: true,
                    showHeader: false,
                    content: [
                        new sap.m.VBox({
                            items: [
                                new sap.m.Panel({
                                    expandable: false,
                                    content: [
                                        new sap.m.HBox({
                                            justifyContent: sap.m.FlexJustifyContent.Start,
                                            items: [
                                                new sap.m.HBox({
                                                    justifyContent: sap.m.FlexJustifyContent.Start,
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: "{i18n>Description}"
                                                        }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                        new sap.m.Text({
                                                            text: "{WorkOrderModel>/Ktext}"
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                                new sap.m.HBox({
                                                    justifyContent: sap.m.FlexJustifyContent.Start,
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: "{i18n>TechnicalLocation}"
                                                        }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                        new sap.m.Text({
                                                            text: "{WorkOrderModel>/Pltxt}"
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                                new sap.m.HBox({
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: "{i18n>ActivityClass}"
                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                        new sap.m.Text({
                                                            text: {
                                                                parts: [
                                                                    {path: "WorkOrderModel>/Actpm"},
                                                                    {path: "WorkOrderModel>/Actpmt"}
                                                                ],
                                                                formatter: function (sActpm, sActpmt) {
                                                                    return sActpm + " " + sActpmt;
                                                                }
                                                            }
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMargin"),
                                new sap.m.Panel({
                                    expandable: false,
                                    content: [
                                        new sap.m.HBox({
                                            items: [
                                                new sap.m.HBox({
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: "{i18n>Site}"
                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                        new sap.m.Text({
                                                            text: "{WorkOrderModel>/Emplazamiento}"
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                                new sap.m.HBox({
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.Text({
                                                            text: "{i18n>InstallationState}",
                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                        new sap.m.Text({
                                                            text: "{WorkOrderModel>/Estadoinstaltxt}"
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                                new sap.m.HBox({
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.HBox({
                                                            items: [
                                                                new sap.m.Text({
                                                                    text: "{i18n>Status}"
                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold")
                                                            ]
                                                        }).addStyleClass("label"),
                                                        new sap.m.Text({
                                                            text: {
                                                                path: "WorkOrderModel>/Estado",
                                                                formatter: function (sStatus) {
                                                                    return oController._formatStatus(sStatus);
                                                                }
                                                            }
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                            ]
                                        }).addStyleClass("sapUiSmallMarginBottom"),
                                        new sap.m.HBox({
                                            items: [
                                                new sap.m.HBox({
                                                    justifyContent: sap.m.FlexJustifyContent.Start,
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.HBox({
                                                            width: "auto",
                                                            items: [
                                                                new sap.m.Text({
                                                                    text: "{i18n>StartDateWorkOrderDetail}"
                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold")
                                                            ]
                                                        }),
                                                        new sap.m.Text({
                                                            text: {
                                                                path: "WorkOrderModel>/Sdate",
                                                                formatter: $.proxy(oController._formatDate, oController)
                                                            }
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                                new sap.m.HBox({
                                                    justifyContent: sap.m.FlexJustifyContent.Start,
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.HBox({
                                                            width: "auto",
                                                            items: [
                                                                new sap.m.Text({
                                                                    text: "{i18n>EndDateWorkOrderDetail}"
                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold")
                                                            ]
                                                        }),
                                                        new sap.m.Text({
                                                            text: {
                                                                path: "WorkOrderModel>/Gltri",
                                                                formatter: $.proxy(oController._formatDate, oController)
                                                            }
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                }),
                                                new sap.m.HBox({
                                                    justifyContent: sap.m.FlexJustifyContent.Start,
                                                    wrap: sap.m.FlexWrap.Wrap,
                                                    width: "33%",
                                                    items: [
                                                        new sap.m.HBox({
                                                            width: "auto",
                                                            items: [
                                                                new sap.m.Text({
                                                                    text: "{i18n>Week}"
                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold")
                                                            ]
                                                        }).addStyleClass("label"),
                                                        new sap.m.Text({
                                                            text: "{WorkOrderModel>/Semana}"
                                                        }).addStyleClass("font-bold")
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMargin"),
                                new sap.m.Panel({
                                    expandable: false,
                                    content: [
                                        new sap.m.VBox({
                                            items: [
                                                new sap.m.Text({
                                                    text: "{i18n>Observations}"
                                                }).addStyleClass("font-bold").addStyleClass("sapUiTinyMarginBottom"),
                                                new sap.m.TextArea({
                                                    value: "{NewObservationModel>/Observaciones}",
                                                    rows: 5,
                                                    width: "100%",
                                                    placeholder: "{i18n>ObservationsPlaceHolder}"
                                                }).addStyleClass("sapUiTinyMarginBottom"),
                                                new sap.m.Button({
                                                    text: "{i18n>Save}",
                                                    enabled:{
                                                        path:"WorkOrderModel>/Estado",
                                                        formatter: $.proxy(oController._woIsFinished, oController)
                                                    },
                                                    press: [oController._saveObservation, oController],
                                                    icon: "sap-icon://accept"
                                                }).addStyleClass("button-menu").addStyleClass("sapUiTinyMarginEnd")
                                            ]
                                        }).addStyleClass("container-with-button")
                                    ]
                                }).addStyleClass("sapUiSmallMargin"),
                                new sap.m.Panel({
                                    content: [
                                        new sap.m.VBox({
                                            items: [
                                                new sap.m.Text({
                                                    text: "{i18n>LastObservations}"
                                                }).addStyleClass("sapUiTinyMarginBottom").addStyleClass("font-bold"),
                                                new sap.m.List({
                                                    id: this.createId("ListObservations"),
                                                    noDataText: "{i18n>NoObservations}",
                                                    items: {
                                                        sorter: new sap.ui.model.Sorter("Fecha", false),
                                                        path: "WorkOrderModel>/Observations",
                                                        templateShareable: false,
                                                        template: new sap.m.CustomListItem({
                                                            content: [
                                                                new sap.m.HBox({
                                                                    alignItems: sap.m.FlexAlignItems.Start,
                                                                    justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                    items: [
                                                                        new sap.m.HBox({
                                                                            id: this.createId("ObservationsContainer"),
                                                                            alignItems: sap.m.FlexAlignItems.Start,
                                                                            items: [
                                                                                new sap.m.Text({
                                                                                    text: "{WorkOrderModel>Userid}"
                                                                                }).addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                new sap.m.Text({
                                                                                    text: "{WorkOrderModel>Observaciones}",
                                                                                    maxLines: 3000
                                                                                })
                                                                            ]
                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("comments-row"),
                                                                        new sap.m.Text({
                                                                            text: {
                                                                                path: "WorkOrderModel>Fecha",
                                                                                formatter: function (sDate) {
                                                                                    return oController._formatDate(sDate);
                                                                                }
                                                                            },
                                                                            wrapping: false
                                                                        }).addStyleClass("font-blue").addStyleClass("font-bold")
                                                                    ]
                                                                })
                                                            ]
                                                        }).addStyleClass("sapUiSmallMarginBottom")
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ]
                        })
                    ]
                }).addStyleClass("WorkOrderGeneralInfoTab")
            ]
        })
    }
});
