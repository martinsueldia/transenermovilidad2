sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.attachmentList.attachmentList", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.attachmentList.attachmentList";
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
                noDataText: "{i18n>noAttachments}",
                columns: [
                    new sap.m.Column({
                        header: new sap.m.Text({text: "Nombre de adjunto"}),
                        hAlign: sap.ui.core.TextAlign.Center,
                        vAlign: sap.ui.core.VerticalAlign.Middle,
                    }),
                    // new sap.m.Column({
                    //     header: new sap.m.Text({text: ""}),
                    //     hAlign: sap.ui.core.TextAlign.Center
                    // }),
                ],
                items: {
                    path: "AttachmentsModel>/Attachments",
                    template: new sap.m.ColumnListItem({
                        vAlign: sap.ui.core.VerticalAlign.Middle,
                        cells: [
                            new sap.m.Text({text: "{AttachmentsModel>Filename}"}),
                            // new sap.m.Button({
                            //     icon: "sap-icon://delete",
                            //     press: [oController._deleteWOAttachment, oController]
                            // })
                        ]
                    })
                }
            })
        ];
    }
});
