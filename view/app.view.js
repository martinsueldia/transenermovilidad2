sap.ui.jsview("TransenerMovilidad.view.app", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf TransenerMovilidad.view.View1
	 */
	getControllerName: function() {
		return "TransenerMovilidad.view.app";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf TransenerMovilidad.view.View1
	 */
	createContent: function(oController) {
		var app = new sap.m.App({
	        id: "app",
	        homeIcon: {
                "phone": "",
                "phone@2": "",
                "tablet": "",
                "tablet@2": "",
                "icon": ""
	        },
	        pages: [
	            //sap.ui.jsview("WorkOrderList", "TransenerMovilidad.view.workOrder.workOrderList.workOrderList")
	        ]
	    });

	    //traducciones
	    var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleName: "TransenerMovilidad.i18n.i18n"
	    });
	    
	    this.setModel(i18nModel, "i18n");
	    this.setDisplayBlock(true);

	    return app;
	}
});