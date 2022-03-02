sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderHeader.workOrderHeader", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf TransenerMovilidad.view.workOrder.view.workOrderHeader
	 */
	getControllerName: function() {
		return "TransenerMovilidad.view.workOrder.workOrderHeader.workOrderHeader";
	},
	
	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf TransenerMovilidad.view.workOrder.view.workOrderHeader
	 */
	createContent: function(oController) {
		return new sap.m.Bar({
			design: sap.m.BarDesign.Auto,
			contentLeft: [
				new sap.m.HBox({
					alignItems: sap.m.FlexAlignItems.Center,
					width: "100%",
					items: [
						new sap.m.Button({
							icon: "sap-icon://customer",
                            press: [oController.onPressUserIcon, oController]
						}).addStyleClass("sapUiSmallMarginEnd").addStyleClass("font-blue"),
						new sap.m.Text({
							text: oController.getUserName()
						}).addStyleClass("font-bold")
					]
				})
			],
			contentRight: [
				new sap.m.HBox({
					alignItems: sap.m.FlexAlignItems.Center,
					alignContent: sap.m.FlexAlignContent.Center,
					width: "100%",
					items: [
						new sap.m.Text({
							text: "{WorkOrderHeader>/region}"
						}).addStyleClass("sapUiTinyMarginEnd").addStyleClass("font-bold").addStyleClass("font-blue"),
						new sap.m.Image({
							src: "{WorkOrderHeader>/image}",
							width: "120px"
						})
					]
				}).addStyleClass("sapUiTinyMarginEnd logoAlignHeader")
			]
		});
	}

});