sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.inputPopup.inputPopup", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.inputPopup.inputPopup";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.view.workOrderOperations
     */
    createContent: function (oController) {
        return new sap.m.VBox({
            items: {
                path: "WorkOrderModel>MeasurePoints",
                template: new sap.m.HBox({
                    alignItems: sap.m.FlexAlignItems.Center,
                    items: [
                        new sap.m.Text({
                            layoutData: new sap.m.FlexItemData({
                                growFactor: 3,
                                baseSize: "0"
                            }),
                            text: "{WorkOrderModel>ShortText}"
                        }).addStyleClass("sapUiTinyMarginEnd font-white font-bold"),
                        new sap.m.Input({
                            type: sap.m.InputType.Number,
                            layoutData: new sap.m.FlexItemData({
                                growFactor: 3,
                                baseSize: "0"
                            }),
                            value: "{WorkOrderModel>RecordedValue}"
                        }).addStyleClass("sapUiTinyMarginEnd"),
                        new sap.m.Text({
                            text: "{WorkOrderModel>RecordedUnit}"
                        }).addStyleClass("font-white font-bold")
                    ]
                }).addStyleClass("sapUiSmallMargin")
            }
        });
    }
});
