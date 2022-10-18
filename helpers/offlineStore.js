sap.ui.define(
    [
        "TransenerMovilidad/helpers/workPlace",
        "TransenerMovilidad/helpers/i18nTranslation",
        "TransenerMovilidad/helpers/busyDialog",
        "TransenerMovilidad/helpers/dialog"
    ],
    function (WorkPlaceHelper, I18nTranslationHelper, BusyDialog, Dialog) {
        "use strict";
        return {
            _oStoresConfig: [],

            _loadStoresConfig: function (fnCallBack) {
                try {
                    $.getJSON(
                        "./models/offlineStores.json",
                        $.proxy(this.onLoadStoresConfigComplete, this, fnCallBack)
                    );
                } catch (e) {
                    this.onLoadStoresConfigFailed(e.message);
                }
            },

            onLoadStoresConfigFailed: function (oError) {
                console.log(oError);
            },

            onLoadStoresConfigComplete: function (fnCallBack, oStoresConfig) {
                this._oStoresConfig = oStoresConfig;
                if (!$.isEmptyObject(this._oStoresConfig)) {
                    let aStoresKeys = Object.keys(this._oStoresConfig);
                    aStoresKeys.forEach(sKey => {
                        this._oStoresConfig[sKey].store = this.initStore(
                            this._oStoresConfig[sKey]
                        );
                    });
                    this.initDownloadStores(aStoresKeys, fnCallBack);
                }
            },

            closeAppStores: function (fnCallback) {
                try {
                    this._closeAllStores(fnCallback);
                } catch (e) {
                    //TODO: realizar tratamiento de excepciones
                }
            },

            _closeStores: function () {
                let aPromiseCloseStores = [];
                for (let oStore of sap.OData.stores) {
                    aPromiseCloseStores.push(this._closeStore(oStore));
                }
                return aPromiseCloseStores;
            },

            _closeAllStores: function (fnCallback) {
                Promise.all(this._closeStores).then(fnCallback, fnCallback);
            },

            startAppStores: function (fnCallBack, bNotMasterData) {
                this._bNotMasterData = bNotMasterData ? true : false;
                try {
                    this._loadStoresConfig(fnCallBack);
                } catch (e) {
                    //TODO: realizar tratamiento de excepciones
                }
            },

            initStore: function (oConfig) {
                this._replaceWorkPlaceInDefiningRequest(oConfig);

                // Fix para NO llamar a la entidad /EamlShMarkerElemSet cuando el campo Tcuad de la cuadrilla seleccionada es igual a 'ET'.
                if (oConfig.name === "MasterData") {
                    let sTcuad = WorkPlaceHelper.getSpeciality();
                    if (sTcuad === "ET") {
                        delete oConfig.definingRequest.EamlShMarkerElemSet;
                    }
                }

                let oStoreProperties = {
                    name: oConfig.name,
                    host: TransenerMovilidad.devapp.smpInfo.server,
                    port: TransenerMovilidad.devapp.smpInfo.port,
                    https: true,
                    serviceRoot: TransenerMovilidad.devapp.smpInfo.appID + oConfig.destination,
                    definingRequests: oConfig.definingRequest
                };
                return sap.OData.createOfflineStore(oStoreProperties);
            },

            _replaceWorkPlaceInDefiningRequest: function (oConfig) {
                let sWorkPlace = WorkPlaceHelper.getWorkPlace();
                let sWerks = WorkPlaceHelper.getWerks();
                let sWorkOrders = WorkPlaceHelper.getSelectedWorkOrders();
                let sWorkOrderOperations = WorkPlaceHelper.getSelectedWorkOrdersOperations();
                let sOrderAttach = WorkPlaceHelper.getAttachOrder();
                let sCompany = WorkPlaceHelper.getCompanyCode();
                let sTcuad = WorkPlaceHelper.getSpeciality();
                let sDefiningRequestKey = Object.keys(oConfig.definingRequest);
                sDefiningRequestKey.forEach(sKey => {
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{WorkOrdersOperations}", sWorkOrderOperations);
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{WorkOrdersAttach}", sOrderAttach);
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{WorkOrders}", sWorkOrders);
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{WorkPlace}", sWorkPlace);
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{Werks}", sWerks);
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{Company}", sCompany);
                    oConfig.definingRequest[sKey] = oConfig.definingRequest[sKey].replace("{Tcuad}", sTcuad);
                });
            },

            setLoadingText: function (sI18n) {
                $(".loadingText").text(I18nTranslationHelper.getTranslation(sI18n));
            },

            initDownloadStores: function (aStoresKeys, fnCallBack) {
                let sStoreKey = aStoresKeys.pop();
                let that = this;
                if (sStoreKey) {
                    if (sStoreKey === "masterStore" && this._bNotMasterData) {
                        that.setHttpClient(true);
                        that.initDownloadStores(aStoresKeys, fnCallBack);
                    } else {
                        let oStore = this._oStoresConfig[sStoreKey];
                        this.setLoadingText(oStore.i18nKey);
                        let fnSuccess = function () {
                            that.setHttpClient(true);
                            that.initDownloadStores(aStoresKeys, fnCallBack);
                        };
                        let fnError = function (e) {
                            that.setHttpClient(true);
                            //TODO: realizar tratamiento de excepciones
                            console.log(e);
                        };
                        this._openStore(oStore.store).then(fnSuccess, fnError);
                    }

                } else {
                    fnCallBack();
                }
            },

            setHttpClient: function (bStateOffline) {
                if (bStateOffline) {
                    OData.jsonHandler.recognizeDates = true;
                    sap.OData.applyHttpClient(bStateOffline);
                } else sap.OData.removeHttpClient();
            },

            /**
             * Open Store
             * @param oStore
             * @returns {Promise}
             * @private
             */
            _openStore: function (oStore) {
                return new Promise((resolve, reject) => {
                    oStore.open(function () {
                        resolve();
                    }, function (e) {
                        reject(e);
                    });
                });
            },

            /**
             * Close Store
             * @param oStore
             * @returns {Promise}
             * @private
             */
            _closeStore: function (oStore) {
                return new Promise((resolve, reject) => {
                    oStore.close(() => {
                        resolve();
                    }, () => {
                        reject();
                    });
                });
            },

            /**
             * Flush Store
             * @param fnCallBack
             * @param bNotMasterData
             */
            flushStores: function (fnCallBack, bNotMasterData) {
                let aStoresKeys = Object.keys(this._oStoresConfig);
                this._flush(aStoresKeys, fnCallBack, bNotMasterData);
            },

            _flush: function (aStoresKeys, fnCallBack, bNotMasterData) {
                let sStoreKey = aStoresKeys.pop();
                let that = this;
                if (sStoreKey) {
                    if (sStoreKey === "masterStore" && bNotMasterData) {
                        this._flush(aStoresKeys, fnCallBack, bNotMasterData);
                    } else {
                        let oStore = this._oStoresConfig[sStoreKey];
                        let fnSuccess = function () {
                            that._flush(aStoresKeys, fnCallBack, bNotMasterData);
                        };
                        let fnError = function (e) {
                            BusyDialog.close();
                            Dialog.openMsgDialog({
                                title: "Error",
                                content: [
                                    new sap.m.VBox({
                                        items: [
                                            new sap.m.Text({
                                                text: "Ocurrió un error durante la sincronización. Por favor, verifique la conexión y vuelva a intentarlo más tarde."
                                            }),
                                            new sap.m.Panel({
                                                expandable: true,
                                                headerText: "Detalle",
                                                content: [
                                                    new sap.m.Text({
                                                        text: e
                                                    }),
                                                ]
                                            })
                                        ]
                                    }).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTopBottom")
                                ],
                                models: [],
                                styleClasses: [],
                                removeCustomClass: true
                            }, () => {
                            });
                            console.log(e);
                        };
                        if (oStore.sync) {
                            this._flushStore(oStore.store).then(fnSuccess, fnError);
                        } else {
                            this._flush(aStoresKeys, fnCallBack, bNotMasterData);
                        }
                    }
                } else {
                    fnCallBack();
                }
            },

            _flushStore: function (oStore) {
                return new Promise((resolve, reject) => {
                    oStore.flush(function () {
                        resolve();
                    }, function (e) {
                        reject(e);
                    });
                });
            },

            /**
             * Clear Store
             * @param fnCallBack
             * @param bNotMasterData
             */
            clearStores: function (fnCallBack, bNotMasterData) {
                let aStoresKeys = Object.keys(this._oStoresConfig);
                this._clear(aStoresKeys, fnCallBack, bNotMasterData);
            },

            _clear: function (aStoresKeys, fnCallBack, bNotMasterData) {
                let sStoreKey = aStoresKeys.pop();
                let that = this;
                if (sStoreKey) {
                    if (sStoreKey === "masterStore" && bNotMasterData) {
                        this._clear(aStoresKeys, fnCallBack, bNotMasterData);
                    } else {
                        let oStore = this._oStoresConfig[sStoreKey];
                        let fnSuccess = function () {
                            that._clear(aStoresKeys, fnCallBack, bNotMasterData);
                        };
                        let fnError = function (e) {
                            //TODO: realizar tratamiento de excepciones
                            console.log(e);
                        };
                        this._clearStore(oStore.store).then(fnSuccess, fnError);
                    }
                } else {
                    fnCallBack();
                }
            },

            _clearStore: function (oStore) {
                return new Promise((resolve, reject) => {
                    oStore.close(function () {
                        oStore.clear(function () {
                            resolve();
                        }, function () {
                            reject();
                        });
                    }, function () {
                        reject();
                    });
                });
            },

            /**
             * Refresh Store
             * @param fnCallBack
             */
            refreshStores: function (fnCallBack) {
                let aStoresKeys = Object.keys(this._oStoresConfig);
                this._refresh(aStoresKeys, fnCallBack);
            },

            _refresh: function (aStoresKeys, fnCallBack) {
                let sStoreKey = aStoresKeys.pop();
                let that = this;
                if (sStoreKey) {
                    let oStore = this._oStoresConfig[sStoreKey];
                    let fnSuccess = function () {
                        that._refresh(aStoresKeys, fnCallBack);
                    };
                    let fnError = function (e) {
                        BusyDialog.close();
                        Dialog.openMsgDialog({
                            title: "Error",
                            content: [
                                new sap.m.VBox({
                                    items: [
                                        new sap.m.Text({
                                            text: "Ocurrió un error durante la sincronización. Por favor, verifique la conexión y vuelva a intentarlo más tarde."
                                        }),
                                        new sap.m.Panel({
                                            expandable: true,
                                            headerText: "Detalle",
                                            content: [
                                                new sap.m.Text({
                                                    text: e
                                                }),
                                            ]
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTopBottom")
                            ],
                            models: [],
                            styleClasses: [],
                            removeCustomClass: true
                        }, () => {
                        });
                        console.log(e);
                    };

                    if (oStore.sync) {
                        this._refreshStore(oStore.store, oStore.refreshSubset).then(fnSuccess, fnError);
                    } else {
                        this._refresh(aStoresKeys, fnCallBack);
                    }
                } else {
                    fnCallBack();
                }
            },

            _refreshStore: function (oStore, aRefreshSubset) {
                return new Promise((resolve, reject) => {
                    let aSubset = aRefreshSubset ? aRefreshSubset : null;
                    oStore.refresh(function () {
                        resolve();
                    }, function (e) {
                        reject(e);
                    }, aSubset);
                });
            }

        };
    }
);
