sap.ui.define([], function () {
    "use strict";
    return {
    	getTranslationModel: function () {
    		return sap.ui.getCore().byId("app").getModel("i18n");
    	},
    	
        getTranslation: function(i18nMessage) {
            let i18nModel = sap.ui.getCore().byId("app").getModel("i18n");
            let translation = i18nModel.getResourceBundle().getText(i18nMessage);
            if (translation) {
                return translation;
            }
            
            return i18nMessage;
        }
    };
});