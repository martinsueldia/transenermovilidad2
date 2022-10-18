sap.ui.define([
    "TransenerMovilidad/helpers/i18nTranslation"
], function (i18nTranslationHelper) {
    return {
        _busyDialog: null,

        _getBusyDialog: function () {
            if (!this._busyDialog) {
                this._busyDialog = new sap.m.BusyDialog();
            }
            return this._busyDialog;
        },

        open: function(i18nTitle, i18nMessage) {
            var t = (i18nMessage) ? i18nTranslationHelper.getTranslation(i18nTitle) : i18nTranslationHelper.getTranslation('Loading');
            var m = (i18nMessage) ? i18nMessage : i18nTitle;
            m = i18nTranslationHelper.getTranslation(m);
            var busyDialog = this._getBusyDialog();
            busyDialog.setTitle(t);
            busyDialog.setText(m);
            busyDialog.addStyleClass("busyDialogLoading");
            busyDialog.open();
        },

        close: function() {
            this._getBusyDialog().close();
        }
    };

});