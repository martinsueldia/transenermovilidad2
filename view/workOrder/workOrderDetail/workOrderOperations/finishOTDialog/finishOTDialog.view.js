sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.finishOTDialog.finishOTDialog", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.finishOTDialog.finishOTDialog";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    createContent: function (oController) {
        return [
            new sap.ui.layout.form.SimpleForm({
                layout: "ResponsiveGridLayout",
                width: "90%",
                editable: true,
                content: [
                    new sap.m.Label({
                        text: "{i18n>Begin}",
                        layoutData: new sap.ui.layout.GridData({
                            span: "L3 M3 S12",
                        })
                    }).addStyleClass("sapUiTinyMarginBegin"),
                    new sap.m.DatePicker({
                        maxDate: "{EndDailyOperationModel>/endDate}",
                        dateValue: "{EndDailyOperationModel>/initDate}",
                        displayFormat: "dd/MM/yyyy",
                        layoutData: new sap.ui.layout.GridData({
                            span: "L3 M3 S12",
                        })
                    }),
                    new sap.m.Label({
                        text: "{i18n>End}",
                        layoutData: new sap.ui.layout.GridData({
                            span: "L3 M3 S12"
                        })
                    }).addStyleClass("sapUiTinyMarginBegin"),
                    new sap.m.DatePicker({
                        minDate: "{EndDailyOperationModel>/initDate}",
                        dateValue: "{EndDailyOperationModel>/endDate}",
                        displayFormat: "dd/MM/yyyy",
                        layoutData: new sap.ui.layout.GridData({
                            span: "L3 M3 S12"
                        })
                    }),
                    new sap.m.Label({
                        text: "{i18n>License}",
                        layoutData: new sap.ui.layout.GridData({
                            span: "L3 M3 S12"
                        })
                    }).addStyleClass("sapUiTinyMarginBegin"),
                    new sap.m.Input({
                        value: "{EndDailyOperationModel>/LicenseNumber}",
                        layoutData: new sap.ui.layout.GridData({
                            span: "L3 M3 S12"
                        })
                    })
                ]
            }).addStyleClass("sapUiSmallMarginBeginEnd sapUiTinyMarginTop formBackgroundDailyNotif")
        ];
    }
});
