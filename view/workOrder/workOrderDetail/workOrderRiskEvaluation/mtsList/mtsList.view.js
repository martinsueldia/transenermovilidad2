sap.ui.jsview(
  "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.mtsList.mtsList",
  {
    getControllerName: function() {
      return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.mtsList.mtsList";
    },
    
    //
    createContent: function(oController) {
      return [
        new sap.m.Table({
          inset: false,
          fixedLayout: false,
          enableBusyIndicator: true,
          noDataText: "No hay MTS registrados",
          columns: [
            new sap.m.Column({
              width: "110px",
              hAlign: sap.ui.core.TextAlign.Center,
              header: new sap.m.Text({ text: "ID MTS" })
            }),
            new sap.m.Column({
              hAlign: sap.ui.core.TextAlign.Center,
              header: new sap.m.Text({ text: "NOMBRE MTS" })
            })
          ],
          items: {
            path: "MTSJsonModel>/MTS",
            template: new sap.m.ColumnListItem({
              cells: [
                new sap.m.Text({ text: "{MTSJsonModel>IdMts}" }),
                new sap.m.Text({ text: "{MTSJsonModel>NombreMts}" })
              ]
            })
          }
        })
      ];
    }
  }
);
