sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects", {

  getControllerName: function () {
    return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects";
  },

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
            //Filtros individuales de busqueda
            new sap.m.Toolbar({
              content: [
                new sap.m.Text({ text: "Id" }).addStyleClass("font-bold").addStyleClass("font-blue"),
                new sap.m.Input({
                  id: "FilterById",
                  value: "{FilterInputsModel>/Id}",
                  maxLength: 15,
                  width: "30%"
                }),
                new sap.m.Text({ text: "Ubicación" }).addStyleClass("font-bold").addStyleClass("font-blue"),
                new sap.m.Input({
                  id: "FilterByLocation",
                  value: "{FilterInputsModel>/Ubicacion}",
                  maxLength: 10,
                  width: "30%"
                }),
                new sap.m.Text({ text: "Desde" }).addStyleClass("font-bold").addStyleClass("font-blue"),
                new sap.m.Input({
                  id: "FilterByFrom",
                  value: "{FilterInputsModel>/Desde}",
                  maxLength: 10,
                  width: "30%"
                }),
                new sap.m.Text({ text: "Hasta" }).addStyleClass("font-bold").addStyleClass("font-blue"),
                new sap.m.Input({
                  id: "FilterByTo",
                  value: "{FilterInputsModel>/Hasta}",
                  maxLength: 10,
                  width: "30%"
                }),
                new sap.m.Text({ text: "Desc" }).addStyleClass("font-bold").addStyleClass("font-blue"),
                new sap.m.Input({
                  id: "FilterByDesc",
                  value: "{FilterInputsModel>/Descripcion}",
                  maxLength: 10,
                  width: "30%"
                }),
                new sap.m.Button({
                  icon: "sap-icon://search",
                  press: [oController._onFilterSearch, oController]
                }).addStyleClass("sapUiTinyMarginBegin").addStyleClass("button-menu"),
                new sap.m.Button({
                  icon: "sap-icon://sys-cancel",
                  press: [oController._onClearFilters, oController]
                }).addStyleClass("sapUiTinyMarginBegin").addStyleClass("button-menu")
              ]
            }).addStyleClass("DefectsToolbar"),
            //Defectos Emplazamiento
            new sap.m.List({
              updateFinished: [oController._onDefectsBindingFinishOrder, oController],
              id: this.createId("orderDefectsCrit"),
              showNoData: false,
              height: "100%",
              items: {
                path: "WorkOrderModel>/DefectsByNullCriticy/Array",
                template: new sap.m.CustomListItem({
                  content: [
                    new sap.m.Panel({
                      expandable: true,
                      expanded: "{WorkOrderModel>/PanelCriticityExpand}",
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
                                              { path: "WorkOrderModel>MarkerStart" },
                                              { path: "WorkOrderModel>MarkerEnd" }
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
                                              }
                                            }).addStyleClass("font-bold")
                                          ]
                                        }),
                                        new sap.m.HBox({
                                          height: "40px",
                                          alignItems: sap.m.FlexAlignItems.Center,
                                          visible: {
                                            parts: [
                                              { path: "WorkOrderModel>MarkerStart" },
                                              { path: "WorkOrderModel>MarkerEnd" }
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
            //Defectos orden
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
                      expanded: "{WorkOrderModel>/PanelOrderDefectsExpand}",
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
                                              { path: "WorkOrderModel>MarkerStart" },
                                              { path: "WorkOrderModel>MarkerEnd" }],
                                            formatter: $.proxy(oController._isVisiblePoints, oController)
                                          },
                                          items: [
                                            new sap.m.Text({
                                              text: "{i18n>From}"
                                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),

                                            new sap.m.Text({
                                              text: {
                                                path: "WorkOrderModel>MarkerStart",
                                              }
                                            }).addStyleClass("font-bold")
                                          ]
                                        }),
                                        new sap.m.HBox({
                                          height: "40px",
                                          alignItems: sap.m.FlexAlignItems.Center,
                                          visible: {
                                            parts: [
                                              { path: "WorkOrderModel>MarkerStart" },
                                              { path: "WorkOrderModel>MarkerEnd" }
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
            //Defectos equipo
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
                      expanded: "{WorkOrderModel>/PanelEquipmentExpand}",
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
                                              { path: "WorkOrderModel>MarkerStart" },
                                              { path: "WorkOrderModel>MarkerEnd" }],
                                            formatter: $.proxy(oController._isVisiblePoints, oController)
                                          },
                                          items: [
                                            new sap.m.Text({
                                              text: "{i18n>From}"
                                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-blue").addStyleClass("font-bold"),

                                            new sap.m.Text({
                                              text: {
                                                path: "WorkOrderModel>MarkerStart",
                                              }
                                            }).addStyleClass("font-bold")
                                          ]
                                        }),
                                        new sap.m.HBox({
                                          height: "40px",
                                          alignItems: sap.m.FlexAlignItems.Center,
                                          visible: {
                                            parts: [
                                              { path: "WorkOrderModel>MarkerStart" },
                                              { path: "WorkOrderModel>MarkerEnd" }
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
            })
          ]
        }).addStyleClass("WorkOrderDefectsTab")
      ]
    })
  }
});