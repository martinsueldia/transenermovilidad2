sap.ui.jsview(
  "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.workOrderRiskEvaluation",
  {
    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.view.workOrderGeneralInfo
     */
    getControllerName: function() {
      return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.workOrderRiskEvaluation";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.view.workOrderGeneralInfo
     */
    createContent: function(oController) {
      return new sap.m.App({
        pages: [
          new sap.m.Page({
            enableScrolling: true,
            showHeader: false,
            busy: "{WorkOrderModel>/VersionAts/Busy}",
            busyIndicatorDelay: 0,
            content: [
              new sap.m.List({
                id: this.createId("RisksEvaluationsContainer"),
                showNoData: false,
                updateFinished: [oController._onAtsBindingFinish, oController],
                items: {
                  path: "WorkOrderModel>/VersionAts/Array",
                  sorter: new sap.ui.model.Sorter("Atsindex"),
                  templateShareable: false,
                  template: new sap.m.CustomListItem({
                    content: [
                      new sap.m.Panel({
                        expandable: true,
                        expand: [oController._onRiskExpand, oController],
                        headerToolbar: new sap.m.Toolbar({
                          content: [
                            new sap.m.HBox({
                              alignItems: sap.m.FlexAlignItems.Center,
                              justifyContent:
                                sap.m.FlexJustifyContent.SpaceBetween,
                              width: "100%",
                              items: [
                                new sap.m.HBox({
                                  alignItems: sap.m.FlexAlignItems.Center,
                                  items: [
                                    new sap.m.Text({
                                      text: "{i18n>ATSVersion}"
                                    })
                                      .addStyleClass("font-bold")
                                      .addStyleClass("font-blue")
                                      .addStyleClass("sapUiTinyMarginEnd"),
                                    new sap.m.Text({
                                      text: "{WorkOrderModel>Atsindex}"
                                    })
                                      .addStyleClass("font-bold")
                                      .addStyleClass("sapUiTinyMarginEnd")
                                  ]
                                }),
                                new sap.m.HBox({
                                  alignItems: sap.m.FlexAlignItems.End,
                                  items: [
                                    new sap.m.Button({
                                      enabled: {
                                        parts: [
                                          "WorkOrderModel>IsSigned",
                                          "WorkOrderModel>/Estado"
                                        ],
                                        formatter: function(
                                          bIsSigned,
                                          sOrderStatus
                                        ) {
                                          return (
                                            !bIsSigned && sOrderStatus !== "FI"
                                          );
                                        }
                                      },
                                      text: "MTS",
                                      press: [
                                        oController.handleMTSDialog,
                                        oController
                                      ]
                                    })
                                      .addStyleClass("sapUiTinyMarginEnd")
                                      .addStyleClass("button-menu"),
                                    new sap.m.Button({
                                      text: "Visualizar MTS",
                                      press: [
                                        oController.openWatchMTS,
                                        oController
                                      ]
                                    })
                                      .addStyleClass("sapUiTinyMarginEnd")
                                      .addStyleClass("button-menu")
                                  ]
                                })
                              ]
                            })
                              .addStyleClass("sapUiSmallMarginBegin")
                              .addStyleClass("sapUiLargeMarginEnd")
                          ]
                        }),
                        content: [
                          new sap.m.HBox({
                            renderType: "Bare",
                            items: [
                              new sap.m.Text({
                                textAlign: sap.ui.core.TextAlign.Center,
                                width: "50%",
                                text: "Riesgos"
                              })
                                .addStyleClass("font-bold")
                                .addStyleClass("sapUiSmallMargin")
                                .addStyleClass("font-blue"),
                              new sap.m.Text({
                                textAlign: sap.ui.core.TextAlign.Center,
                                width: "50%",
                                text: "Elementos"
                              })
                                .addStyleClass("font-bold")
                                .addStyleClass("sapUiSmallMargin")
                                .addStyleClass("font-blue")
                            ]
                          }).addStyleClass("atsTitles"),
                          new sap.m.VBox({
                            renderType: "Bare",
                            items: {
                              path: "WorkOrderModel>Row",
                              template: new sap.m.HBox({
                                renderType: "Bare",
                                items: [
                                  //segundo hbox copiado
                                  new sap.m.HBox({
                                    alignItems: sap.m.FlexAlignItems.Start,
                                    justifyContent:
                                      sap.m.FlexJustifyContent.Center,
                                    items: [
                                      new sap.m.Text({
                                        visible:
                                          "{WorkOrderModel>Risk/Visibility}",
                                        text: "{WorkOrderModel>Risk/Descr}",
                                        width: "12rem"
                                      })
                                        .addStyleClass("font-bold")
                                        .addStyleClass("sapUiSmallMarginEnd"),
                                      new sap.m.Switch({
                                        visible:
                                          "{WorkOrderModel>Risk/Visibility}",
                                        state: "{WorkOrderModel>Risk/State}",
                                        enabled: {
                                          parts: [
                                            "WorkOrderModel>IsSigned",
                                            "WorkOrderModel>/Estado"
                                          ],
                                          formatter: function(
                                            bIsSigned,
                                            sOrderStatus
                                          ) {
                                            return (
                                              !bIsSigned &&
                                              sOrderStatus !== "FI"
                                            );
                                          }
                                        },
                                        customTextOn: "Si",
                                        customTextOff: "No"
                                      }).addStyleClass(
                                        "atsSwitch sapUiSmallMarginEnd"
                                      )
                                    ]
                                  }).addStyleClass("atsRiskWrapper"),
                                  new sap.m.HBox({
                                    sorter: new sap.ui.model.Sorter("Idats"),
                                    renderType: "Bare",
                                    alignItems: sap.m.FlexAlignItems.Start,
                                    justifyContent:
                                      sap.m.FlexJustifyContent.Center,
                                    items: [
                                      new sap.m.Text({
                                        visible:
                                          "{WorkOrderModel>Element/Visibility}",
                                        text: "{WorkOrderModel>Element/Descr}",
                                        //text: "{WorkOrderModel>Descr}",
                                        width: "12rem"
                                      })
                                        .addStyleClass("font-bold")
                                        .addStyleClass("sapUiSmallMarginEnd"),
                                      new sap.m.Switch({
                                        visible:
                                          "{WorkOrderModel>Element/Visibility}",
                                        state: "{WorkOrderModel>Element/State}",
                                        enabled: {
                                          parts: [
                                            "WorkOrderModel>IsSigned",
                                            "WorkOrderModel>/Estado"
                                          ],
                                          formatter: function(
                                            bIsSigned,
                                            sOrderStatus
                                          ) {
                                            return (
                                              !bIsSigned &&
                                              sOrderStatus !== "FI"
                                            );
                                          }
                                        },
                                        customTextOn: "Si",
                                        customTextOff: "No"
                                      }).addStyleClass(
                                        "atsSwitch sapUiSmallMarginEnd"
                                      )
                                    ]
                                  }).addStyleClass("atsElementWrapper"),
                                  //3ro boton
                                  new sap.m.Button({
                                    press: [
                                      oController.openRPTDialog,
                                      oController
                                    ],
                                    visible:
                                      "{WorkOrderModel>Procedure/Visibility}",
                                    text: "RPT"
                                  })
                                    .addStyleClass("atsRTSWrapper")
                                    .addStyleClass("button-menu")
                                ]
                              }).addStyleClass("atsItem")
                            }
                          }).addStyleClass("atsItemWrapper")
                        ]
                      }).addStyleClass("panel-collapsable")
                    ]
                  })
                }
              })
            ],
            footer: [
              new sap.m.Bar({
                design: sap.m.BarDesign.Footer,
                contentRight: [
                  new sap.m.Button({
                    icon: "sap-icon://activity-individual",
                    iconFirst: true,
                    text: "Firmantes",
                    press: [oController._showAtsSignList, oController]
                  }),
                  new sap.m.Button({
                    enabled: {
                      path: "WorkOrderModel>/Estado",
                      formatter: $.proxy(oController._woIsFinished, oController)
                    },
                    icon: "sap-icon://signature",
                    iconFirst: true,
                    text: "{i18n>Firma}",
                    press: [oController._onSignature, oController]
                  }),
                  new sap.m.Button({
                    enabled: {
                      path: "WorkOrderModel>/Estado",
                      formatter: $.proxy(oController._woIsFinished, oController)
                    },
                    icon: "sap-icon://add-document",
                    iconFirst: true,
                    text: "{i18n>NewATS}",
                    press: [oController._onNewATS, oController]
                  })
                ]
              })
            ]
          }).addStyleClass("WorkOrderRisksTab")
        ]
      });
    }
  }
);
