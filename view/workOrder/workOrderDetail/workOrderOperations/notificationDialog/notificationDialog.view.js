sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.notificationDialog.notificationDialog", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.notificationDialog.notificationDialog";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    //
    createContent: function (oController) {
        return [
            new sap.m.TextArea({
                height:"160px",
                width:"90%",
                maxLength: 300,
                enabled: {
                    parts: ["WorkOrderModel>Notification/IsFinalNotif", "WorkOrderModel>/Estado"],
                    formatter: function (bIsFinalNotif, sOrderStatus) {
                        return bIsFinalNotif !== "X" && sOrderStatus !== "FI";
                    }
                },
                value: "{WorkOrderModel>Notification/NotificationText}"
            }).addStyleClass("sapUiSmallMarginTop marginTextArea")
        ];
    }
});
