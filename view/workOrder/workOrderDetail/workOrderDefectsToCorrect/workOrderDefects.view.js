sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.view.workOrderDetail
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.view.workOrderDetail
     */
    createContent: function (oController) {
        let aSorter = [];
        let sRegion = localStorage.getItem("speciality");
        if (sRegion === "LI") {
            aSorter = new sap.ui.model.Sorter("MarkerStart");
        } else if (sRegion === "ET") {
            aSorter = new sap.ui.model.Sorter("Qmnum");
        } else {
            aSorter = [];
        }


        return new sap.m.App({
            pages: [
                new sap.m.Page({
                    enableScrolling: true,
                    showHeader: false,
                    busy: "{WorkOrderModel>/Equipments/Busy}",
                    busyIndicatorDelay: 0,
                    content: [
                        new sap.m.Toolbar({
                            content: [
                                new sap.m.SearchField({
                                    id: "defectsSearchField",
                                    placeholder: "{i18n>Search}",
                                    value: "{SearchFieldsModel>/DefectsValue}",
                                    layoutData: new sap.m.FlexItemData({
                                        growFactor: 1,
                                        baseSize: "0"
                                    }),
                                    search: [oController._onFilterSearch, oController]
                                }).addStyleClass("sapUiSmallMarginBegin").addStyleClass("sapUiTinyMarginEnd").addStyleClass("search-field-list")
                            ]
                        }).addStyleClass("DefectsToolbar"),
                        new sap.m.List({
                            updateFinished: [oController._onDefectsBindingFinishOrder, oController],
                            id: this.createId("orderDefectsCrit"),
                            showNoData: false,
                            items: {
                                path: "WorkOrderModel>/DefectsByNullCriticy/Array",
                                template: new sap.m.CustomListItem({
                                    content: [
                                        new sap.m.Panel({
                                            expandable: true,
                                            expand: [oController._onDefectExpand, oController],
                                            headerToolbar: ({
                                                content: [
                                                    new sap.m.HBox({
                                                        alignItems: sap.m.FlexAlignItems.Center,
                                                        justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                        width: "90%",
                                                        items: [
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                alignContent: sap.m.FlexAlignContent.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>DefectOfTheCritic}"
                                                                    }).addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: "{WorkOrderModel>Emplazamiento}"
                                                                    }).addStyleClass("font-bold").addStyleClass("sapUiTinyMarginBegin")
                                                                ]
                                                            }),
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: {
                                                                            parts: [{
                                                                                path: "WorkOrderModel>Quantity"
                                                                            }, {
                                                                                path: "i18n>EquipmentsCount"
                                                                            }],
                                                                            formatter: function (iCountEquipmentDefects, sText) {
                                                                                return sText + " " + iCountEquipmentDefects;
                                                                            }
                                                                        }
                                                                    }).addStyleClass("font-cursive").addStyleClass("font-bold")]
                                                            })
                                                        ]
                                                    }).addStyleClass("sapUiSmallMarginBegin").addStyleClass("sapUiLargeMarginEnd")
                                                ]
                                            }),
                                            content: [
                                                new sap.m.List({
                                                    growing: true,
                                                    growingThreshold: 100,
                                                    type: sap.m.ListType.Navigation,
                                                    itemPress: [oController._onDefectPress, oController],
                                                    templateShareable: false,
                                                    items: {
                                                        path: "WorkOrderModel>CritDefects",
                                                        sorter: aSorter,
                                                        template: new sap.m.CustomListItem({
                                                            type: sap.m.ListType.Navigation,
                                                            content: [
                                                                new sap.m.VBox({
                                                                    items: [
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Qmnum}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Qmnum}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>EqID}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>DlCodegrpt}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>SubEq}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>DlCodet}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),

                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Location}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Btpln}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    visible: {
                                                                                        parts: [
                                                                                            {path: "WorkOrderModel>MarkerStart"},
                                                                                            {path: "WorkOrderModel>MarkerEnd"}
                                                                                        ],
                                                                                        formatter: $.proxy(oController._isVisiblePoints, oController)
                                                                                    },
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>From}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),

                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>MarkerStart",
                                                                                                formatter: function (number) {
                                                                                                    if (number)
                                                                                                        return oController._formatMarkers(number);
                                                                                                    else
                                                                                                        return ""
                                                                                                }
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    visible: {
                                                                                        parts: [
                                                                                            {path: "WorkOrderModel>MarkerStart"},
                                                                                            {path: "WorkOrderModel>MarkerEnd"}
                                                                                        ],
                                                                                        formatter: $.proxy(oController._isVisiblePoints, oController)
                                                                                    },
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>To}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>MarkerEnd",
                                                                                                formatter: function (number) {
                                                                                                    if (number)
                                                                                                        return oController._formatMarkers(number);
                                                                                                    else
                                                                                                        return ""
                                                                                                }
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Criticality}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Priok}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>DetectionTime}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>NotifDate",
                                                                                                formatter: $.proxy(oController.formatDate, oController)
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Qmtxt}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>CauseCode}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    width: "100%",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                                    items: [
                                                                                        new sap.m.HBox({
                                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                                            items: [
                                                                                                new sap.m.Text({
                                                                                                    text: "{i18n>Description}"
                                                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                                new sap.m.Text({
                                                                                                    text: "{WorkOrderModel>Qmtxt}"
                                                                                                }).addStyleClass("font-bold")
                                                                                            ]
                                                                                        }),
                                                                                        new sap.m.HBox({
                                                                                            visible: {
                                                                                                path: "WorkOrderModel>Asignar",
                                                                                                formatter: function (sAsignar) {
                                                                                                    return sAsignar !== "";
                                                                                                }
                                                                                            },
                                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                                            items: [
                                                                                                new sap.m.Text({
                                                                                                    text: "{i18n>CorrectedDefect}"
                                                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                                                                new sap.m.Button({
                                                                                                    icon: "sap-icon://accept"
                                                                                                }).addStyleClass("font-bold").addStyleClass("defect-success-icon")
                                                                                            ]
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginBeginEnd")
                                                            ]
                                                        })
                                                    }
                                                })
                                            ]
                                        }).addStyleClass("panel-collapsable")
                                    ]
                                })
                            }
                        }),
                        new sap.m.List({
                            updateFinished: [oController._onDefectsBindingFinishOrder, oController],
                            id: this.createId("orderDefects"),
                            showNoData: false,
                            items: {
                                path: "WorkOrderModel>/DefectsByOrder/Array",
                                template: new sap.m.CustomListItem({
                                    content: [
                                        new sap.m.Panel({
                                            expandable: true,
                                            expand: [oController._onDefectExpand, oController],
                                            headerToolbar: ({
                                                content: [
                                                    new sap.m.HBox({
                                                        alignItems: sap.m.FlexAlignItems.Center,
                                                        justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                        width: "90%",
                                                        items: [
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                alignContent: sap.m.FlexAlignContent.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>DefectOfTheOrder}"
                                                                    }).addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: "{WorkOrderModel>OrderNumber}"
                                                                    }).addStyleClass("font-bold").addStyleClass("sapUiTinyMarginBegin")
                                                                ]
                                                            }),
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: {
                                                                            parts: [{
                                                                                path: "WorkOrderModel>NumberOfDefectsOnOrder"
                                                                            }, {
                                                                                path: "i18n>EquipmentsCount"
                                                                            }],
                                                                            formatter: function (iCountEquipmentDefects, sText) {
                                                                                return sText + " " + iCountEquipmentDefects;
                                                                            }
                                                                        }
                                                                    }).addStyleClass("font-cursive").addStyleClass("font-bold")]
                                                            })
                                                        ]
                                                    }).addStyleClass("sapUiSmallMarginBegin").addStyleClass("sapUiLargeMarginEnd")
                                                ]
                                            }),
                                            content: [
                                                new sap.m.List({
                                                    growing: true,
                                                    growingThreshold: 100,
                                                    type: sap.m.ListType.Navigation,
                                                    itemPress: [oController._onDefectPress, oController],
                                                    templateShareable: false,
                                                    items: {
                                                        path: "WorkOrderModel>Defects",
                                                        sorter: aSorter,
                                                        template: new sap.m.CustomListItem({
                                                            type: sap.m.ListType.Navigation,
                                                            content: [
                                                                new sap.m.VBox({
                                                                    items: [
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Qmnum}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Qmnum}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>EqID}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>DlCodegrpt}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>SubEq}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>DlCodet}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),

                                                                            ]
                                                                        }),
                                                                        //
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Location}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Btpln}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    visible: {
                                                                                        parts: [
                                                                                            {path: "WorkOrderModel>MarkerStart"},
                                                                                            {path: "WorkOrderModel>MarkerEnd"}],
                                                                                        formatter: $.proxy(oController._isVisiblePoints, oController)
                                                                                    },
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>From}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),

                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>MarkerStart",
                                                                                                formatter: function (number) {
                                                                                                    if (number)
                                                                                                        return oController._formatMarkers(number);
                                                                                                    else
                                                                                                        return ""
                                                                                                }
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    visible: {
                                                                                        parts: [
                                                                                            {path: "WorkOrderModel>MarkerStart"},
                                                                                            {path: "WorkOrderModel>MarkerEnd"}
                                                                                        ],
                                                                                        formatter: $.proxy(oController._isVisiblePoints, oController)
                                                                                    },
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>To}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>MarkerEnd",
                                                                                                formatter: function (number) {
                                                                                                    if (number)
                                                                                                        return oController._formatMarkers(number);
                                                                                                    else
                                                                                                        return ""
                                                                                                }
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Criticality}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Priok}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>DetectionTime}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>NotifDate",
                                                                                                formatter: $.proxy(oController.formatDate, oController)
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Qmtxt}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>CauseCode}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    width: "100%",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                                    items: [
                                                                                        new sap.m.HBox({
                                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                                            items: [
                                                                                                new sap.m.Text({
                                                                                                    text: "{i18n>Description}"
                                                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                                new sap.m.Text({
                                                                                                    text: "{WorkOrderModel>Qmtxt}"
                                                                                                }).addStyleClass("font-bold")
                                                                                            ]
                                                                                        }),
                                                                                        new sap.m.HBox({
                                                                                            visible: {
                                                                                                path: "WorkOrderModel>Asignar",
                                                                                                formatter: function (sAsignar) {
                                                                                                    return sAsignar !== "";
                                                                                                }
                                                                                            },
                                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                                            items: [
                                                                                                new sap.m.Text({
                                                                                                    text: "{i18n>CorrectedDefect}"
                                                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold"),
                                                                                                new sap.m.Button({
                                                                                                    icon: "sap-icon://accept"
                                                                                                }).addStyleClass("font-bold").addStyleClass("defect-success-icon")
                                                                                            ]
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginBeginEnd")
                                                            ]
                                                        })
                                                    }
                                                })
                                            ]
                                        }).addStyleClass("panel-collapsable")
                                    ]
                                })
                            }
                        }),
                        new sap.m.List({
                            id: this.createId("DefectsToCorrectContainer"),
                            updateFinished: [oController._onDefectsBindingFinish, oController],
                            headerToolbar: '',
                            showNoData: false,
                            items: {
                                path: "WorkOrderModel>/Equipments/Array",
                                template: new sap.m.CustomListItem({
                                    content: [
                                        new sap.m.Panel({
                                            id: "EquipmentCodePanel",
                                            expandable: true,
                                            expand: [oController._onDefectExpand, oController],
                                            headerToolbar: ({
                                                content: [
                                                    new sap.m.HBox({
                                                        alignItems: sap.m.FlexAlignItems.Center,
                                                        justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                        width: "90%",
                                                        items: [
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                alignContent: sap.m.FlexAlignContent.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: "{i18n>EquipmentCode}"
                                                                    }).addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                    new sap.m.Text({
                                                                        text: "{WorkOrderModel>EquipmentCode}"
                                                                    }).addStyleClass("font-bold").addStyleClass("sapUiTinyMarginBegin")
                                                                ]
                                                            }),
                                                            new sap.m.HBox({
                                                                alignItems: sap.m.FlexAlignItems.Center,
                                                                items: [
                                                                    new sap.m.Text({
                                                                        text: {
                                                                            parts: [{
                                                                                path: "WorkOrderModel>NumberOfDefectsOnEquipment"
                                                                            }, {
                                                                                path: "i18n>EquipmentsCount"
                                                                            }],
                                                                            formatter: function (iCountEquipmentDefects, sText) {
                                                                                return sText + " " + iCountEquipmentDefects;
                                                                            }
                                                                        }
                                                                    }).addStyleClass("font-cursive").addStyleClass("font-bold")]
                                                            })
                                                        ]
                                                    }).addStyleClass("sapUiSmallMarginBegin").addStyleClass("sapUiLargeMarginEnd")
                                                ]
                                            }),
                                            content: [
                                                new sap.m.List({
                                                    growing: true,
                                                    growingThreshold: 100,
                                                    type: sap.m.ListType.Navigation,
                                                    itemPress: [oController._onDefectPress, oController],
                                                    templateShareable: false,
                                                    items: {
                                                        path: "WorkOrderModel>Defects",
                                                        sorter: aSorter,
                                                        template: new sap.m.CustomListItem({
                                                            type: sap.m.ListType.Navigation,
                                                            content: [
                                                                new sap.m.VBox({
                                                                    items: [
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Qmnum}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Qmnum}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>EqID}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>DlCodegrpt}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>SubEq}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>DlCodet}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Location}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Btpln}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    visible: {
                                                                                        parts: [
                                                                                            {path: "WorkOrderModel>MarkerStart"},
                                                                                            {path: "WorkOrderModel>MarkerEnd"}],
                                                                                        formatter: $.proxy(oController._isVisiblePoints, oController)
                                                                                    },
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>From}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),

                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>MarkerStart",
                                                                                                formatter: function (number) {
                                                                                                    if (number)
                                                                                                        return oController._formatMarkers(number);
                                                                                                    else
                                                                                                        return ""
                                                                                                }
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    visible: {
                                                                                        parts: [
                                                                                            {path: "WorkOrderModel>MarkerStart"},
                                                                                            {path: "WorkOrderModel>MarkerEnd"}
                                                                                        ],
                                                                                        formatter: $.proxy(oController._isVisiblePoints, oController)
                                                                                    },
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>To}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>MarkerEnd",
                                                                                                formatter: function (number) {
                                                                                                    if (number)
                                                                                                        return oController._formatMarkers(number);
                                                                                                    else
                                                                                                        return ""
                                                                                                }
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Criticality}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>Priok}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>DetectionTime}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: {
                                                                                                path: "WorkOrderModel>NotifDate",
                                                                                                formatter: $.proxy(oController.formatDate, oController)
                                                                                            }
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                }),
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.Text({
                                                                                            text: "{i18n>Qmtxt}"
                                                                                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                        new sap.m.Text({
                                                                                            text: "{WorkOrderModel>CauseCode}"
                                                                                        }).addStyleClass("font-bold")
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        new sap.m.HBox({
                                                                            width: "100%",
                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                                                            items: [
                                                                                new sap.m.HBox({
                                                                                    height: "40px",
                                                                                    alignItems: sap.m.FlexAlignItems.Center,
                                                                                    items: [
                                                                                        new sap.m.HBox({
                                                                                            alignItems: sap.m.FlexAlignItems.Center,
                                                                                            items: [
                                                                                                new sap.m.Text({
                                                                                                    text: "{i18n>Description}"
                                                                                                }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),
                                                                                                new sap.m.Text({
                                                                                                    text: "{WorkOrderModel>Qmtxt}"
                                                                                                }).addStyleClass("font-bold")
                                                                                            ]
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                }).addStyleClass("font-blue").addStyleClass("sapUiTinyMarginBeginEnd")
                                                            ]
                                                        })
                                                    }
                                                })
                                            ]
                                        }).addStyleClass("panel-collapsable")
                                    ]
                                })
                            }
                        }).addStyleClass("WorkOrderDefects")
                    ]
                }).addStyleClass("WorkOrderDefectsTab")
            ]
        })
    }
});