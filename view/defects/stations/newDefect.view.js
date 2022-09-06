sap.ui.jsview("TransenerMovilidad.view.defects.stations.newDefect", {

  /** Specifies the Controller belonging to this View.
   * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
   * @memberOf TransenerMovilidad.view.WorkOrder.view.WorkOrderList
   */
  getControllerName: function () {
    return "TransenerMovilidad.view.defects.stations.newDefect";
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
        sap.ui.jsview("stationsNewDefectHeader", "TransenerMovilidad.view.workOrder.workOrderHeader.workOrderHeader")
      ],
      subHeader: [
        new sap.m.Bar({
          design: sap.m.BarDesign.Auto,
          contentLeft: [
            new sap.m.Button({
              icon: "sap-icon://nav-back",
              press: [oController._onBackPress, oController]
            }).addStyleClass("sapUiTinyMarginBegin").addStyleClass("button-menu")
          ],
          contentMiddle: [
            new sap.m.Text({
              text: "{i18n>AddDefectStations}"
            }).addStyleClass("font-white"),
            new sap.m.Text({
              text: "{DefectView>/viewTitle}",
              visible: "{DefectView>/visibleOnlyOnEdit}"
            }).addStyleClass("font-white")
          ]
        }).addStyleClass("sub-header-background")
      ],
      content: [
        new sap.m.VBox({
          justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
          items: [
            new sap.m.Panel({
              expandable: false,
              content: [
                new sap.m.VBox({
                  items: [
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          items: [
                            new sap.m.Text({
                              text: "{i18n>TechnicalLocationDefect}"
                            }).addStyleClass("sapUiTinyMarginEnd ").addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          items: [
                            new sap.m.Input({
                              editable: {
                                path: "DefectView>/isEdit",
                                formatter: function (isEdit) {
                                  return !isEdit;
                                }
                              },
                              placeholder: "Buscar",
                              layoutData: new sap.m.FlexItemData({
                                growFactor: 4,
                                baseSize: "0"
                              }),
                              value: "{NewDefect>/Btpln}",
                              valueState: "{ValidationModel>/stateBtpln}",
                              valueStateText: "{ValidationModel>/errorText}",
                              enabled: {
                                parts: [{
                                  path: "NewDefect>/IsEditable"
                                },
                                {
                                  path: "DefectView>/isEdit"
                                }
                                ],
                                formatter: function (bIsEditable, bIsEdit) {
                                  if (bIsEditable) {
                                    return bIsEditable && !bIsEdit;
                                  } else {
                                    return bIsEdit;
                                  }
                                }
                              },
                            }),
                            new sap.m.Button({
                              icon: "sap-icon://decline",
                              press: [oController._onDeleteTechLoc, oController],
                              enabled: "{DefectView>/isNew}",
                              layoutData: new sap.m.FlexItemData({
                                growFactor: 0,
                                baseSize: "0"
                              }),
                            }),
                            new sap.m.Button({
                              icon: "sap-icon://search",
                              press: [oController._onSearchTechLoc, oController],
                              enabled: "{DefectView>/isNew}",
                              layoutData: new sap.m.FlexItemData({
                                growFactor: 0,
                                baseSize: "0"
                              }),
                            })
                          ]
                        })
                      ]
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 2,
                            baseSize: "0"
                          }),
                          alignItems: sap.m.FlexAlignItems.Center,
                          items: [
                            new sap.m.Text({
                              text: "{i18n>AffectedParts}"
                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          alignItems: sap.m.FlexAlignItems.Center,
                          justifyContent: sap.m.FlexJustifyContent.Start,
                          width: "35%",
                          items: [
                            new sap.m.Select({
                              forceSelection: false,
                              width: "100%",
                              layoutData: new sap.m.FlexItemData({
                                growFactor: 1,
                                baseSize: "0"
                              }),
                              value: "{NewDefect>/DlCodegrp}",
                              selectedKey: "{NewDefect>/DlCodegrp}",
                              valueState: "{ValidationModel>/stateDlCodegrp}",
                              valueStateText: "{ValidationModel>/errorText}",
                              change: [oController._onPartChange, oController],
                              enabled: {
                                path: "DefectView>/isCorrectedDefect",
                                formatter: function (bIsCorrectedDefect) {
                                  return !bIsCorrectedDefect;
                                }
                              },
                              //enabled: "{DefectView>/isNew}",
                              items: {
                                filters: [
                                  new sap.ui.model.Filter("Katalogart", sap.ui.model.FilterOperator.EQ, "B"),
                                ],
                                path: "Catalogs>/Catalogs",
                                sorter: new sap.ui.model.Sorter("Kurztext"),
                                template: new sap.ui.core.Item({
                                  text: "{Catalogs>Kurztext}",
                                  key: "{Catalogs>Codegruppe}"
                                })
                              }
                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          alignItems: sap.m.FlexAlignItems.Center,
                          justifyContent: sap.m.FlexJustifyContent.Start,
                          items: [
                            new sap.m.Select({
                              change: [oController.onSubPartChange, oController],
                              forceSelection: false,
                              width: "100%",
                              layoutData: new sap.m.FlexItemData({
                                growFactor: 1,
                                baseSize: "0"
                              }),
                              value: "{NewDefect>/DlCode}",
                              selectedKey: "{NewDefect>/DlCode}",
                              valueState: "{ValidationModel>/stateDlCode}",
                              valueStateText: "{ValidationModel>/errorText}",
                              enabled: {
                                path: "DefectView>/isCorrectedDefect",
                                formatter: function (bIsCorrectedDefect) {
                                  return !bIsCorrectedDefect;
                                }
                              },
                              //enabled: "{DefectView>/isNew}",
                              items: {
                                path: "SubCatalogs>/Catalogs",
                                sorter: new sap.ui.model.Sorter("Kurztext"),
                                template: new sap.ui.core.Item({
                                  text: "{SubCatalogs>Kurztext}",
                                  key: "{SubCatalogs>Code}"
                                }),
                              }
                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                          ]
                        })
                      ]
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: [
                        new sap.m.Text({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 0.67,
                            baseSize: "0"
                          }),
                          text: "Informe"
                        }).addStyleClass("font-bold"),
                        new sap.m.Input({
                          placeholder: "Local",
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          width: "100%",
                          enabled: "{DefectView>/isNew}",
                          value: "{NewDefect>/Msgrp}"
                        }).addStyleClass("sapUiTinyMarginEnd"),
                        new sap.m.Input({
                          placeholder: "Clasificacion",
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          value: "{NewDefect>/Clasif}",
                          enabled: "{DefectView>/isNew}",
                          width: "100%"
                        }).addStyleClass("sapUiTinyMarginEnd"),
                      ]
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      visible: "{DefectView>/workPlaceLines}",
                      items: [
                        new sap.m.Text({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 0.67,
                            baseSize: "0"
                          }),
                          text: "Marcador"
                        }).addStyleClass("font-bold"),
                         new sap.m.Input({
                            id: this.createId("desdeInput"),
                            value: "{NewDefect>/MarkerStart}",
                            placeholder: "Desde",
                            selectedKey: "{NewDefect>/MarkerStart}",
                            enabled: "{DefectView>/isNew}",
                            valueState: "{ValidationModel>/stateMarkerStart}",
                            valueStateText: "{ValidationModel>/errorText}",
                            showSuggestion: true,
                            suggestionItems: {
                                sorter: new sap.ui.model.Sorter("Marker", false, false),
                                path: "MarkersModel>/Markers",
                                template: new sap.ui.core.Item({
                                    text: "{MarkersModel>Marker}",
                                    key: "{MarkersModel>Marker}"
                                }),
                            },
                            layoutData: new sap.m.FlexItemData({
                                growFactor: 1,
                                baseSize: "0"
                            }),
                        }).addStyleClass("sapUiTinyMarginEnd"), 
                         new sap.m.Input({
                          id: this.createId("hastaInput"),
                          value: "{NewDefect>/MarkerEnd}",
                          placeholder: "Hasta",
                          selectedKey: "{NewDefect>/MarkerEnd}",
                          enabled: "{DefectView>/isNew}",
                          valueState: "{ValidationModel>/stateMarkerEnd}",
                          valueStateText: "{ValidationModel>/errorText}",
                          showSuggestion: true,
                          suggestionItems: {
                            sorter: new sap.ui.model.Sorter("Marker", false, false),
                            path: "MarkersModel>/Markers",
                            template: new sap.ui.core.Item({
                              text: "{MarkersModel>Marker}",
                              key: "{MarkersModel>Marker}"
                            }),
                          },
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                        }).addStyleClass("sapUiTinyMarginEnd"), 
                      ]
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          items: [
                            new sap.m.Text({
                              text: "Fecha de Detección"
                            }).addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          items: [
                            new sap.m.DatePicker({
                              layoutData: new sap.m.FlexItemData({
                                growFactor: 1,
                                baseSize: "0"
                              }),
                              width: "100%",
                              dateValue: "{NewDefect>/NotifDate}",
                              displayFormat: "dd/MM/yyyy",
                              enabled: "{DefectView>/isNew}"
                            }).addStyleClass("sapUiTinyMarginEnd")
                          ]
                        }),
                      ]
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          alignItems: sap.m.FlexAlignItems.Center,
                          items: [
                            new sap.m.Text({
                              text: "{i18n>ResultOf}"
                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.Select({
                          width: "100%",
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          value: "{NewDefect>/DCode}",
                          selectedKey: "{NewDefect>/DCode}",
                          enabled: "{DefectView>/isNew}",
                          items: {
                            path: "MasterData>/DefectsSubCatalogSet",
                            sorter: new sap.ui.model.Sorter("Kurztext"),
                            filters: [
                              new sap.ui.model.Filter("Katalogart", sap.ui.model.FilterOperator.EQ, "T"),
                              new sap.ui.model.Filter("Codegruppe", sap.ui.model.FilterOperator.EQ, "ORIG")
                            ],
                            template: new sap.ui.core.Item({
                              text: "{MasterData>Kurztext}",
                              key: "{MasterData>Code}"
                            })
                          }
                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                      ]
                    }),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Start,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          items: [
                            new sap.m.Text({
                              text: "{i18n>DefectDescription}"
                            })
                          ]
                        }).addStyleClass("font-bold"),
                        new sap.m.TextArea({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          width: "93%",
                          value: "{NewDefect>/Longtext}",
                          enabled: {
                            path: "DefectView>/isCorrectedDefect",
                            formatter: function (bIsCorrectedDefect) {
                              return !bIsCorrectedDefect;
                            }
                          },
                          rows: 3,
                          valueState: "{ValidationModel>/stateLongtext}",
                          valueStateText: "{ValidationModel>/errorText}",
                        }).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginBegin "),
                        new sap.m.Button({
                          visible: {
                            path: "DefectView>/isEdit",
                            formatter: function (isEdit) {
                              return isEdit;
                            }
                          },
                          icon: "sap-icon://discussion-2",
                          press: [oController.openLongTextDialog, oController]
                        })
                      ],
                    }).addStyleClass("textAreaBox"),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          alignItems: sap.m.FlexAlignItems.Start,
                          items: [
                            new sap.m.Text({
                              text: "{i18n>DefectCriticality}"
                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.Select({
                          width: "100%",
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          selectedKey: "{NewDefect>/Priok}",
                          enabled: {
                            path: "DefectView>/isCorrectedDefect",
                            formatter: function (bIsCorrectedDefect) {
                              return !bIsCorrectedDefect;
                            }
                          },
                          items: {
                            path: "MasterData>/DefPriorSet",
                            sorter: new sap.ui.model.Sorter("Priokx"),
                            template: new sap.ui.core.Item({
                              text: "{MasterData>Priokx}",
                              key: "{MasterData>Priok}"
                            })
                          },
                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                      ]
                    }),
                    new sap.m.HBox({
                      alignItems: sap.m.FlexAlignItems.Center,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: [
                        new sap.m.HBox({
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 1,
                            baseSize: "0"
                          }),
                          alignItems: sap.m.FlexAlignItems.Center,
                          items: [
                            new sap.m.Text({
                              text: "{i18n>WorkStation}"
                            }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                          ]
                        }),
                        new sap.m.Select({
                          width: "100%",
                          layoutData: new sap.m.FlexItemData({
                            growFactor: 3,
                            baseSize: "0"
                          }),
                          change: [oController.setWerks, oController],
                          selectedKey: "{NewDefect>/Gewrk}",
                          enabled: true,
                          items: {
                            path: "WorkPlaceModel>/WorkPlaces",
                            sorter: new sap.ui.model.Sorter("Ktext"),
                            template: new sap.ui.core.ListItem({
                              key: "{WorkPlaceModel>Gewrk}",
                              text: "{WorkPlaceModel>Ktext}"
                            })
                          }
                        }).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold")
                      ]
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.HBox({
                      wrap: sap.m.FlexWrap.Wrap,
                      justifyContent: sap.m.FlexJustifyContent.Start,
                      items: {
                        path: "NewDefect>/Attachments",
                        template: new sap.m.VBox({
                          justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                          alignItems: sap.m.FlexAlignItems.Center,
                          items: [
                            new sap.m.Image({
                              src: {
                                path: "NewDefect>src",
                                formatter: function (sSrc) {
                                  let image = sSrc.split(",")[1];
                                  return "data:image/gif;base64," + image;
                                }
                              }
                            }).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTopBottom"),
                            new sap.m.HBox({
                              alignContent: sap.m.FlexAlignContent.End,
                              items: [
                                new sap.m.Text({
                                  textAlign: sap.ui.core.TextAlign.Center,
                                  text: "{NewDefect>name}"
                                }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginEnd textElipsis"),
                                new sap.m.Button({
                                  icon: "sap-icon://decline",
                                  press: [oController._onDeleteImage, oController]
                                }).addStyleClass("buttonDeleteImage")
                              ]
                            }).addStyleClass("sapUiSmallMarginBottom")

                          ]
                        })
                      }
                    }).addStyleClass("sapUiMediumMarginBottom")
                  ]
                })
              ]
            })
          ]
        })
      ],
      footer: new sap.m.Bar({
        contentLeft: [
          new sap.ui.unified.FileUploader({
            buttonOnly: true,
            iconOnly: true,
            multiple: true,
            change: [oController._onImgChange, oController],
            icon: "sap-icon://add-photo",
            style: "Emphasized",
            fileType: ["jpg", "png", "bmp"],
            maximumFileSize: 10,
            maximumFilenameLength: 55,
            enabled: {
              path: "DefectView>/isCorrectedDefect",
              formatter: function (bIsCorrected) {
                return !bIsCorrected
              }
            }
          }).addStyleClass("attach"),
          new sap.m.Button({
            icon: "sap-icon://camera",
            text: "Agregar Foto",
            enabled: "{DJIModel>/dji_connected}",
            press: [oController._onNewPhotoPress, oController]
          }),
          new sap.m.Button({
            icon: "sap-icon://download",
            text: "Descargar",
            enabled: "{DJIModel>/dji_connected}",
            press: [oController._onDownloadPress, oController]
          }),
          new sap.m.Button({
            icon: "sap-icon://delete",
            text: "Borrar Fotos DJI",
            enabled: "{DJIModel>/dji_connected}",
            press: [oController._onDeleteDJI, oController]
          })
        ],
        contentRight: [
          new sap.m.Button({
            text: "{i18n>CorrectDefect}",
            press: [oController._correctDefect, oController],
            visible: {
              parts: ["DefectView>/isEdit", "DefectView>/isCorrectedDefect"],
              formatter: $.proxy(oController.isEditAndCorrected, oController),
            }
          }),
          new sap.m.Button({
            text: "{i18n>SaveEditDefect}",
            press: [oController._onSaveDefect, oController],
            visible: {
              parts: ["DefectView>/isCorrectedDefect", "DefectView>/isEdit"],
              formatter: (bIsCorrected, isEdit) => {
                return !bIsCorrected && isEdit
              }
            }
          }),
          new sap.m.Button({
            text: "{i18n>SaveNewDefect}",
            press: [oController._onSaveDefect, oController],
            visible: "{DefectView>/isNew}",
          }),
        ]
      })
    }).addStyleClass("newDefect");

    return oPage;
  }
});