/* global _:true */
sap.ui.define(["sap/ui/core/UIComponent", 'TransenerMovilidad/lib/lodash.min'], function (UIComponent, _) {
    "use strict";
    return UIComponent.extend("TransenerMovilidad.Component", {
        metadata: {
            manifest: "json",
            library: "TransenerMovilidad",
            includes: ["less/less.min.js","lib/cmisjs.js", 'lib/odata-querybuilder.min.js']
        },
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            this.getRouter().initialize();

            let oEnvModel = new sap.ui.model.json.JSONModel();
            oEnvModel.loadData("models/env.json", null, false);
            window.env = oEnvModel.getData();

            sap.ui.localResources("less");
            sap.ui.localResources("img");
            sap.ui.localResources("services");
            sap.ui.localResources("mock_data");
            sap.ui.localResources("models");
        },
        createContent: function () {
            $("#loading-content .center").removeClass("fix-ui5-styles");
            return sap.ui.view({
                viewName: "TransenerMovilidad.view.app",
                type: "JS",
                viewData: {
                    component: this
                }
            });
        }
    });
});