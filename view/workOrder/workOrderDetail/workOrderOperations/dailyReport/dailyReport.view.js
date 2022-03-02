sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.dailyReport.dailyReport", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.dailyReport.dailyReport";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    createContent: function (oController) {
        return [
            new sap.m.Table({
                inset: false,
                fixedLayout: false,
                enableBusyIndicator: true,
                noDataText: "{i18n>NoDailyReports}",
                columns: [
                    new sap.m.Column({
                        header: new sap.m.Text({text: "Desde"}),
                        hAlign: sap.ui.core.TextAlign.Center
                    }),
                    new sap.m.Column({
                        header: new sap.m.Text({text: "Hasta"}),
                        hAlign: sap.ui.core.TextAlign.Center
                    }),
                    new sap.m.Column({
                        header: new sap.m.Text({
                            text: "Nº de notificaciones"
                        }),
                        hAlign: sap.ui.core.TextAlign.Center
                    })
                ],
                items: {
                    path: "DailyReportModel>/Reports",
                    sorter: new sap.ui.model.Sorter("from", false, false),
                    template: new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({text: "{DailyReportModel>from}"}),
                            new sap.m.Text({text: "{DailyReportModel>to}"}),
                            new sap.m.Text({text: "{DailyReportModel>notifications}"})
                        ]
                    })
                }
            })
        ];
    }
});
