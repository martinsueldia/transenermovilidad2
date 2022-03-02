sap.ui.jsview(
  "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.atsList.atsList",
  {
    getControllerName: function() {
      return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.atsList.atsList";
    },

    createContent: function(oController) {
      return [
        new sap.m.List({
          inset: false,
          fixedLayout: false,
          enableBusyIndicator: true,
          noDataText: "No hay firmas registradas",
          items: {
            path: "FirmasJsonModel>/Firmas",
            sorter: new sap.ui.model.Sorter("AtsVersion"),
            template: new sap.m.CustomListItem({
              content: [
                new sap.m.Panel({
                  expandable: true,
                  headerToolbar: [
                    new sap.m.Toolbar({
                      content: [
                        new sap.m.HBox({
                          items: [
                            new sap.m.Text({
                              text: {
                                path: "FirmasJsonModel>AtsVersion",
                                formatter: function(iAts) {
                                  return "N° de ATS: " + iAts;
                                }
                              }
                            }).addStyleClass(
                              "sapUiSmallMarginEnd colorBlackText"
                            )
                          ]
                        })
                      ]
                    })
                  ],
                  content: [
                    new sap.m.VBox({
                      items: {
                        sorter: new sap.ui.model.Sorter("fecha"),
                        path: "FirmasJsonModel>Personal",
                        template: new sap.m.HBox({
                          items: [
                            new sap.m.Text({
                              width: "650px",
                              text: {
                                parts: [
                                  "FirmasJsonModel>legajo",
                                  "FirmasJsonModel>nombre"
                                ],
                                formatter: function(sLegajo, sNombre) {
                                  return (
                                    "Nombre del firmante: " +
                                    sLegajo +
                                    " - " +
                                    sNombre
                                  );
                                }
                              }
                            }).addStyleClass(
                              "sapUiLargeMarginEnd sapUiTinyMarginBegin colorBlackText"
                            ),
                            new sap.m.Text({
                              width: "250px",
                              text: {
                                path: "FirmasJsonModel>fecha",
                                formatter: function(sFecha) {
                                  return "Fecha de Firma: " + sFecha;
                                }
                              }
                            }).addStyleClass(
                              "sapUiLargeMarginEnd colorBlackText"
                            )
                          ]
                        }).addStyleClass("sapUiSmallMarginTopBottom")
                      }
                    }).addStyleClass(
                      "sapUiSmallMarginTop sapUiSmallMarginBottom"
                    )
                  ]
                })
              ]
            })
          }
        })
      ];
    }
  }
);
