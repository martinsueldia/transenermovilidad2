sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.workOrderOperations", {

  /** Specifies the Controller belonging to this View.
   * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
   * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
   */
  getControllerName: function () {
    return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.workOrderOperations";
  },

  /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
   * Since the Controller is given to this method, its event handlers can be attached right away.
   * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
   */
  createContent: function (oController) {
    return new sap.m.App({
      pages: [
        new sap.m.Page({
          enableScrolling: true,
          showHeader: false,
          busy: "{WorkOrderModel>/Operations/Busy}",
          busyIndicatorDelay: 0,
          content: [
            new sap.m.List({
              showNoData: false,
              templateShareable: false,
              updateFinished: [oController._onOperationsBindingFinish, oController],
              items: {
                path: "WorkOrderModel>/Operations/Array",
                template: new sap.m.CustomListItem({
                  content: [
                    new sap.m.Panel({
                      expandable: true,
                      expand: [oController._onOperationExpand, oController],
                      headerToolbar: new sap.m.Toolbar({
                        content: [
                          new sap.m.HBox({
                            alignItems: sap.m.FlexAlignItems.Center,
                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                            width: "100%",
                            items: [
                              new sap.m.HBox({
                                alignItems: sap.m.FlexAlignItems.Center,
                                items: [
                                  new sap.m.Text({
                                    text: "{i18n>OperationNumber}"
                                  }).addStyleClass("font-bold").addStyleClass("font-blue").addStyleClass("sapUiTinyMarginEnd"),
                                  new sap.m.Text({
                                    text: "{WorkOrderModel>OperationNumber}"
                                  }).addStyleClass("font-bold").addStyleClass("sapUiTinyMarginEnd"),
                                  new sap.m.Text({
                                    text: "{WorkOrderModel>Equipment/EquipmentCode}"
                                  }).addStyleClass("font-bold").addStyleClass("sapUiTinyMarginEnd"),
                                  new sap.m.Text({
                                    text: "{WorkOrderModel>Equipment/EquipmentDescription}"
                                  }).addStyleClass("font-bold")
                                ]
                              }),
                              new sap.m.HBox({
                                alignItems: sap.m.FlexAlignItems.Center,
                                items: [
                                  new sap.m.Text({
                                    text: {
                                      parts: [{
                                        path: "WorkOrderModel>CountSubOperations"
                                      }, {
                                        path: "i18n>SubOperations"
                                      }],
                                      formatter: function (iCountSubOperations, sCountSubOperations) {
                                        return iCountSubOperations + " " + sCountSubOperations;
                                      }
                                    }
                                  }).addStyleClass("font-cursive").addStyleClass("font-bold")
                                ]
                              })
                            ]
                          }).addStyleClass("sapUiSmallMarginBegin").addStyleClass("sapUiLargeMarginEnd")
                        ]
                      }),
                      content: [
                        new sap.m.VBox({
                          items: [
                            new sap.m.Panel({
                              expandable: false,
                              content: [
                                new sap.m.HBox({
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
                                          text: "{WorkOrderModel>OperationDescription}"
                                        }).addStyleClass("font-bold")
                                      ]
                                    }),
                                    new sap.m.HBox({
                                      alignItems: sap.m.FlexAlignItems.Center,
                                      items: [
                                        new sap.m.Button({
                                          press: [oController.openNotificationDialog, oController],
                                          icon: {
                                            path: "WorkOrderModel>Notification",
                                            formatter: function (oNotification) {
                                              if (oNotification.NotificationText) {
                                                this.addStyleClass("notification-success");
                                                return "sap-icon://message-success";
                                              } else {
                                                this.addStyleClass("no-notification");
                                                return "sap-icon://notification-2";
                                              }
                                            }
                                          },
                                          layoutData: new sap.m.FlexItemData({
                                            growFactor: 0,
                                            baseSize: "0"
                                          })
                                        }).addStyleClass("showCommentButton sapUiTinyMarginEnd"),
                                        new sap.m.Select({
                                          enabled: {
                                            parts: ["WorkOrderModel>Notification", "WorkOrderModel>/Estado", "WorkOrderModel>Status"],
                                            formatter: function (oNotification, sOrderStatus, sStatus) {
                                              if (sOrderStatus !== "FI") {
                                                //todo agregar estado inicial.
                                                return (oNotification.IsFinalNotif !== "X" || sStatus === "E0012" || sStatus === "E0011" || sStatus === "")
                                              } else {
                                                return false;
                                              }
                                            }
                                          },
                                          change: [oController._onOpStatusChange, oController],
                                          forceSelection: false,
                                          selectedKey: {
                                            parts: ["WorkOrderModel>OperationStatus"],
                                            formatter: function (sStatus) {
                                              return oController._rowFormatter(sStatus, this.getParent());
                                            }
                                          },
                                          items: {
                                            path: "ModelStatusOp>/StatusOp",
                                            sorter: new sap.ui.model.Sorter("Estat"),
                                            templateShareable: false,
                                            template: new sap.ui.core.Item({
                                              text: "{ModelStatusOp>Txt30}",
                                              key: "{ModelStatusOp>Estat}"
                                            })
                                          }
                                        }).addStyleClass("font-bold")
                                      ]
                                    })
                                  ]
                                }).addStyleClass("statusOperationRow")
                              ]
                            }),
                            new sap.m.VBox({
                              items: {
                                path: "WorkOrderModel>SubOperations",
                                template: new sap.m.HBox({
                                  templateShareable: false,
                                  justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                  alignItems: sap.m.FlexAlignItems.Center,
                                  items: [
                                    new sap.m.HBox({
                                      layoutData: new sap.m.FlexItemData({
                                        growFactor: 1,
                                        baseSize: "0"
                                      }),
                                      alignItems: sap.m.FlexAlignItems.Center,
                                      items: [
                                        new sap.m.Text({
                                          text: "{WorkOrderModel>SubOperationNumber}"
                                        }).addStyleClass("sapUiTinyMarginEnd word-no-break font-bold textWidthSubOpe"),
                                        new sap.m.Text({
                                          text: "{WorkOrderModel>SubOperationDescription}"
                                        }).addStyleClass("font-bold")
                                      ]
                                    }),
                                    new sap.m.Button({
                                      text: "PM",
                                      press: [oController._onMeasurePointPress, oController],
                                      visible: {
                                        path: "WorkOrderModel>MeasurePoints",
                                        formatter: function (aMeasurePoints) {
                                          if (aMeasurePoints.length) {
                                            let aMeasureCompleted = aMeasurePoints.filter(x => x.RecordedValue !== "");
                                            if (aMeasureCompleted && aMeasureCompleted.length)
                                              this.addStyleClass("notification-success");
                                            return true;
                                          } else {
                                            return false;
                                          }
                                        }
                                      },
                                      layoutData: new sap.m.FlexItemData({
                                        growFactor: 0,
                                        baseSize: "0"
                                      })
                                    }).addStyleClass("showCommentButton buttonWithText sapUiTinyMarginEnd"),
                                    new sap.m.Button({
                                      press: [oController.openNotificationDialog, oController],
                                      icon: {
                                        path: "WorkOrderModel>Notification",
                                        formatter: function (oNotification) {
                                          if (oNotification.NotificationText) {
                                            this.addStyleClass("notification-success");
                                            return "sap-icon://message-success";
                                          } else {
                                            this.addStyleClass("no-notification");
                                            return "sap-icon://notification-2";
                                          }
                                        }
                                      },
                                      layoutData: new sap.m.FlexItemData({
                                        growFactor: 0,
                                        baseSize: "0"
                                      })
                                    }).addStyleClass("showCommentButton sapUiTinyMarginEnd"),
                                    new sap.m.Select({
                                      enabled: {
                                        parts: ["WorkOrderModel>Notification", "WorkOrderModel>/Estado", "WorkOrderModel>Status"],
                                        //todo agregar estado inicial. 
                                        formatter: function (oNotification, sOrderStatus, sStatus) {
                                          if (sOrderStatus !== "FI") {
                                            return (oNotification.IsFinalNotif !== "X" || sStatus === "E0012" || sStatus === "E0011" || sStatus === "")
                                          } else {
                                            return false;
                                          }
                                        }
                                      },
                                      layoutData: new sap.m.FlexItemData({
                                        growFactor: 0,
                                        baseSize: "0"
                                      }),
                                      forceSelection: false,
                                      selectedKey: {
                                        parts: ["WorkOrderModel>Status"],
                                        formatter: function (sStatus) {
                                          return oController._rowFormatter(sStatus, this);
                                        }
                                      },
                                      alignItems: sap.m.FlexAlignItems.Center,
                                      change: [oController._onOpStatusChange, oController],
                                      items: {
                                        path: "ModelStatusOp>/StatusOp",
                                        template: new sap.ui.core.Item({
                                          text: "{ModelStatusOp>Txt30}",
                                          key: "{ModelStatusOp>Estat}"
                                        })
                                      }
                                    }).addStyleClass("font-bold")
                                  ]
                                }).addStyleClass("statusOperationRow")
                              }
                            })
                          ]
                        })
                      ]
                    }).addStyleClass("panel-collapsable")
                  ]
                })
              }
            }).addStyleClass("listOperations")
          ],
          footer: [
            new sap.m.Bar({
              design: sap.m.BarDesign.Footer,
              contentLeft: [
                new sap.ui.unified.FileUploader({
                  enabled: {
                    path: "WorkOrderModel>/Estado",
                    formatter: $.proxy(oController._woIsFinished, oController)
                  },
                  buttonText: "{i18n>AddFiles}",
                  multiple: true,
                  change: [oController._onSelectFiles, oController],
                  icon: "sap-icon://attachment",
                  style: "Emphasized",
                  maximumFileSize: 10,
                  maximumFilenameLength: 55
                }).addStyleClass("FileUploaderOperacion sapUiSmallMarginEnd"),
              ],
              contentRight: [
                new sap.m.Button({
                  icon: "sap-icon://activity-items",
                  iconFirst: true,
                  text: "{i18n>dailyReport}",
                  press: [oController._openDailyReport, oController]
                }),
                new sap.m.Button({
                  icon: "sap-icon://document",
                  iconFirst: true,
                  text: "{i18n>seeAttachment}",
                  press: [oController.openAttachmentList, oController]
                }),
                new sap.m.Button({
                  enabled: {
                    path: "WorkOrderModel>/Estado",
                    formatter: $.proxy(oController._woIsFinished, oController)
                  },
                  icon: "sap-icon://complete",
                  iconFirst: true,
                  text: "{i18n>endDailyOperation}",
                  press: [oController._endDailyOperation, oController]
                }),
                new sap.m.Button({
                  enabled: {
                    path: "WorkOrderModel>/Estado",
                    formatter: $.proxy(oController._woIsFinished, oController)
                  },
                  icon: "sap-icon://activity-2",
                  iconFirst: true,
                  text: "{i18n>finishOT}",
                  press: [oController.openEndWorkOrderDialog, oController]
                }),

              ]
            })
          ]
        }).addStyleClass("WorkOrderOperationsTab")
      ]
    })
  }
});
