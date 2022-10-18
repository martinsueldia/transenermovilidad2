sap.ui.define([
    "TransenerMovilidad/helpers/i18nTranslation"
], function (Translator) {
    "use strict";
    return {
        dialog: null,
        _aDialogs: [],

        //retornar dialogo en la ultima posicion
        getDialog: function () {
            if (this._aDialogs.length > 0)
                return this._aDialogs[this._aDialogs.length - 1];
        },

        openCustomDialog: function (options, viewDependent, oBindContext) {
            let oDialog = new sap.m.Dialog({
                title: options.title ? Translator.getTranslation(options.title) : "",
                afterClose: $.proxy(this.close, this),
                content: [
                    sap.ui.jsview("dialogContent", options.content)
                ],
                buttons: options.buttons
            });

            if (options.models)
                options.models.forEach(m => {
                    oDialog.setModel(m.object, m.id);
                });

            for (let styleClass of options.styleClasses)
                oDialog.addStyleClass(styleClass);

            if (viewDependent)
                viewDependent.addDependent(oDialog);

            this._aDialogs.push(oDialog);
            oDialog.open();
        },

        open: function (options, viewDependant, fnClose) {
            let oDialog = new sap.m.Dialog({
                title: options.title ? Translator.getTranslation(options.title) : "",
                afterClose: $.proxy(this.close, this),
                content: [
                    sap.ui.jsview("dialogContent", options.content)
                ],
                buttons: [
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: () => {
                            this.close();
                            if (fnClose) {
                                fnClose();
                            }
                        }
                    })
                ]
            });

            options.models.forEach(m => {
                oDialog.setModel(m.object, m.id);
            });

            if (viewDependant)
                viewDependant.addDependent(oDialog);

            oDialog.addStyleClass("CustomDialog");
            oDialog.setModel(Translator.getTranslationModel(), "i18n");
            this._aDialogs.push(oDialog);
            oDialog.open();
        },

        openMsgDialog: function (options, fnClose) {
            let oDialog = new sap.m.Dialog({
                title: options.title ? Translator.getTranslation(options.title) : "",
                afterClose: $.proxy(this.close, this),
                content: options.content,
                buttons: [
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: () => {
                            this.close();
                            if (fnClose) {
                                fnClose();
                            }
                        }
                    })
                ]
            });

            options.models.forEach(m => {
                oDialog.setModel(m.object, m.id);
            });

            if (options.styleClasses){
                for (let styleClass of options.styleClasses)
                    oDialog.addStyleClass(styleClass);
            }

            oDialog.addStyleClass("MessageDialog");

            if (options.removeCustomClass)
                oDialog.removeStyleClass("MessageDialog");

            oDialog.setModel(Translator.getTranslationModel(), "i18n");

            this._aDialogs.push(oDialog);

            oDialog.open();
        },

        close: function () {
            let oDialog = this._aDialogs.pop();
            if (oDialog) {
                oDialog.close();
                oDialog.destroy();
            }
        },

        openConfirmDialog:function(options,fnOk,fnClose){
            let oDialog = new sap.m.Dialog({
                title: options.title ? Translator.getTranslation(options.title) : "",
                afterClose: $.proxy(this.close, this),
                content: options.content,
                buttons: [
                    new sap.m.Button({
                        icon: "sap-icon://accept",
                        press: () => {
                            this.close();
                            if (fnOk) {
                                fnOk();
                            }
                        }
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: () => {
                            this.close();
                            if (fnClose) {
                                fnClose();
                            }
                        }
                    })
                ]
            });

            options.models.forEach(m => {
                oDialog.setModel(m.object, m.id);
            });

            oDialog.addStyleClass("MessageDialog");
            oDialog.setModel(Translator.getTranslationModel(), "i18n");

            this._aDialogs.push(oDialog);

            oDialog.open();
        }

    };

});