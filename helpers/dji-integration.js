sap.ui.define([], function () {
    return {
        _djiProductModel: {},

        getProductConnectedModel: function () {
            return this._getProductConnectedModel();
        },

        _getProductConnectedModel: function () {
            if ($.isEmptyObject(this._djiProductModel)) {
                this._djiProductModel = new sap.ui.model.json.JSONModel({
                    "dji_connected": false
                });
            }

            return this._djiProductModel;
        },

        _getPlugin: function () {
            return cordova.plugins["dji-integration"];
        },

        initPlugin: function () {
            var permissions = cordova.plugins.permissions;
            var aRequiredPermissions = [
                permissions.BLUETOOTH,
                permissions.BLUETOOTH_ADMIN,
                permissions.READ_CONTACTS,
                permissions.WRITE_CONTACTS,
                permissions.RECORD_AUDIO,
                permissions.INTERNET,
                permissions.ACCESS_WIFI_STATE,
                permissions.WAKE_LOCK,
                permissions.ACCESS_COARSE_LOCATION,
                permissions.ACCESS_NETWORK_STATE,
                permissions.ACCESS_FINE_LOCATION,
                permissions.CHANGE_WIFI_STATE,
                permissions.MOUNT_UNMOUNT_FILESYSTEMS,
                permissions.WRITE_EXTERNAL_STORAGE,
                permissions.READ_EXTERNAL_STORAGE,
                permissions.SYSTEM_ALERT_WINDOW,
                permissions.READ_PHONE_STATE,
                permissions.CAMERA
            ];

            this._installRequiredPermissions(aRequiredPermissions);
        },

        _installRequiredPermissions: function (aRequiredPermissions) {
            var permissions = cordova.plugins.permissions;
            permissions.requestPermissions(aRequiredPermissions,
                () => { this._install(); },
                () => { this._installRequiredPermissions(aRequiredPermissions); }
            );
        },

        _onPermissionsError: function () {

        },

        _install: function () {
            this._getPlugin().djiInstall(function () {}, function () {});
            this.registerProduct();
        },

        registerProduct: function () {
            var that = this;
            var oModel = that._getProductConnectedModel();

            this._getPlugin().djiRegister(() => {
                oModel.setProperty("/dji_connected", true);
            }, () => {
                oModel.setProperty("/dji_connected", false);
            });
        },

        openCamera: function (error) {
            this._getPlugin().djiOpenCamera(function () {}, error);
        },

        deletePhotos:function(success, error){
            this._getPlugin().djiDeletePhotos(success, error);
        },

        downloadMedia: function (success, error) {
            this._getPlugin().djiDownload(success, error);
        }
    };
});