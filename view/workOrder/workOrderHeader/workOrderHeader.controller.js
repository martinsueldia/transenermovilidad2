sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/helpers/busyDialog",
    "TransenerMovilidad/helpers/offlineStore",
    "TransenerMovilidad/helpers/user",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/helpers/networkInfo",
], function (Controller, BusyDialog, OfflineStore, UserHelper, WorkPlaceHelper, Dialog, networkInfo) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderHeader.workOrderHeader", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf TransenerMovilidad.view.workOrder.view.workOrderHeader
         */
        //	onInit: function() {
        //
        //	},

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf TransenerMovilidad.view.workOrder.view.workOrderHeader
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf TransenerMovilidad.view.workOrder.view.workOrderHeader
         */
        onAfterRendering: function () {
            this._createModelForImage();
        },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf TransenerMovilidad.view.workOrder.view.workOrderHeader
         */
        //	onExit: function() {
        //
        //	}

        getUserName: function () {
            return UserHelper.getUser();
        },

        _actionSheet: null,

        onPressUserIcon: function (oEvent) {
            let oBtn = oEvent.getSource();
            if (!this._actionSheet) {
                this._actionSheet = this.getActionSheetContent();
                this.getView().addDependent(this._actionSheet);
            }

            this._actionSheet.openBy(oBtn);
        },


        getActionSheetContent: function () {
            return new sap.m.ActionSheet({
                placement: sap.m.PlacementType.Bottom,
                buttons: [
                    new sap.m.Button({
                        iconDensityAware: false,
                        text: "{i18n>Logout}",
                        icon: "sap-icon://log",
                        press: [this.onPressLogout, this]
                    })
                ]
            });
        },

        onPressLogout: function () {
            if (networkInfo.getNetworkInfo() != 'No network connection') {
                BusyDialog.open("ClosingSession", "WaitPlease");
                OfflineStore.flushStores(() => {
                    OfflineStore.clearStores(() => {
                        this._logoutOk();
                    });
                });
            } else {
                Dialog.openMsgDialog({
                    "title": "{i18n>FailedSyncTitle}",
                    "content": new sap.m.Text({
                        text: "{i18n>DeviceDisconnected}",
                        textAlign: sap.ui.core.TextAlign.Center
                    }),
                    "models": []
                });
            }

        },

        _createModelForImage: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            var sCompanyCode = WorkPlaceHelper.getCompanyCode();
            if (sCompanyCode == "TR") {
                oModel.setProperty("/image", "./img/logo-transener.svg");
            } else {
                oModel.setProperty("/image", "./img/logo-transba.svg");
            }
            oModel.setProperty("/region", WorkPlaceHelper.getRegion());
            this.getView().setModel(oModel, "WorkOrderHeader");
        },

        _logoutOk: function () {
            BusyDialog.close();

            WorkPlaceHelper.deleteWorkPlace();
            UserHelper.deleteUser();
            //se agregaron estos nuevos metodos para el limpiado mas in-depth de informacion.
            //ver bien. 
            WorkPlaceHelper.cleanWerks();
            WorkPlaceHelper.cleanCompanyCode();

            // Delete Registration And Reload App.
            UserHelper.doDeleteRegistration(
                $.proxy(UserHelper.doLoadStartPage, UserHelper),
                $.proxy(UserHelper.errorDeleteRegistration, UserHelper)
            );
        }

    });

});