sap.ui.define([
    "TransenerMovilidad/helpers/offlineStore",
    "TransenerMovilidad/services/oDataService",
    "TransenerMovilidad/helpers/odata-filter",
    "TransenerMovilidad/helpers/formatter"
], function (offlineStore, oDataService, ODataFilter, Formatter) {
    "use strict";

    return {
        _entities: {
            list: "/WorkOrderListSet",
            genObs: "/WorkOrderGenObsSet",
            obsSet: "/WorkOrderObsSet", // NO configurado
            WoOps: "/WorkOrderOpSet",
            locSet: "/DefectsByLocSet", // No se usa
            riskSet: "/HeaderAtsSet",
            workOrderDefSet: "/WorkOrderDefSet",
            workOrderOpSet: "/WorkOrderOpSet",
            workOrderNotifSet: "/WorkOrderOpNotificationSet",
            utByWorkOrder: "/WONumListSet",
            WOAttachment: "/WOAttachmentSet", // Solo create
            measureDocSet: "/MeasuremDocSet",
            activityLogSet: "/ActivityLogSet",
            WODocAttachment: "/WODocAttachmentSet",
            PersonalHabilitado: "/PersonalHabilitadoSet",
            WorkOrdersByWorkplace: "/OTByWorkPlaceSet", // Read Online
            DefectsAPSet: "/DefectsAPSet" // NO configurado
        },

        getServiceUri: function () {
            return offlineStore._oStoresConfig.workOrderStore.store.serviceUri
        },

        postAttachments: function (oAttachment) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.create(this._entities.WOAttachment, oAttachment, {
                    success: function (a) {
                        resolve({
                            msg: "Success en create del store",
                            res: a
                        });
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en create del store",
                            res: a
                        });
                    }
                });
            });
        },

        getModel: function () {
            return new sap.ui.model.odata.v2.ODataModel(this.getServiceUri(), {
                json: true,
                useBatch: false,
                defaultUpdateMethod: "PUT",
                headers: {
                    "DataServiceVersion": "2.0",
                    "Cache-Control": "no-cache, no-store",
                    "Pragma": "no-cache",
                    "Content-Type": "application/json"
                }
            });
        },

        createActivityLog: function (oLog) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.create(this._entities.activityLogSet, oLog, {
                    success: function (a) {
                        resolve({
                            msg: "Success en create del store",
                            res: a
                        });
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en create del store",
                            res: a
                        });
                    }
                });
            });
        },

        getWorkOrderBundles: function () {
            offlineStore.setHttpClient(true);
            return new Promise((resolve, reject) => {
                oDataService.read(this.getServiceUri(), this._entities.PersonalHabilitado, "", "", "").then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                })
            });
        },

        createStationDefect: function (oNewDefect) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.create(this._entities.workOrderDefSet, oNewDefect, {
                    success: function (a) {
                        resolve(a);
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en create del store",
                            res: a
                        });
                    }
                });
            });
        },

        getList: function (successCallback, errorCallback) {
            offlineStore.setHttpClient(true);
            oDataService.read(this.getServiceUri(), this._entities.list, "", "", "").then((response) => {
                successCallback(response);
            }).catch((error) => {
                errorCallback(error);
            })
        },

        getUtByWorkOrder: function (iWorkOrder) {
            offlineStore.setHttpClient(true);
            return new Promise((resolve, reject) => {
                let aExpressionFilter = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder)
                ];
                let oFilter = new window.ODataFilter(aExpressionFilter, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.utByWorkOrder, "", "UbTecByWONumSet_nav", oFilter)
                    .then((response) => {
                        let aTechLocations = [];
                        for (let oWorkOrder of response.results) {
                            for (let oTech of oWorkOrder.UbTecByWONumSet_nav.results) {
                                aTechLocations.push(oTech.Tplnr);
                            }
                        }
                        resolve(aTechLocations);
                    })
                    .catch(() => {
                        reject();
                    })
            });
        },

        /**
         *
         * @param iWorkOrder
         * @param iOperation
         * @param iSubOperation
         * @returns {Array}
         * proceso de busqueda de operaciones Generalizado.
         * si tiene solo work order busco todas las operaciones
         * si tiene work order y numero de operacion es en si una operacion
         * si tiene work order, numero de operacion y numero de suboperacion es una suboperacion
         */
        getFilterForOperation: function (iWorkOrder, iOperation, iSubOperation) {
            let aOperationFilter = [];
            if (iWorkOrder && !iOperation && !iSubOperation) {
                aOperationFilter.push(window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder));
            }
            if (iWorkOrder && iOperation && !iSubOperation) {
                aOperationFilter.push(window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder));
                aOperationFilter.push(window.ODataFilter.getExpression("Vornr", window.ODataFilter.COMPARE.EQUAL, iOperation));
                aOperationFilter.push(window.ODataFilter.getExpression("Iupoz", window.ODataFilter.COMPARE.EQUAL, ""));
            }
            if (iWorkOrder && iOperation && iSubOperation) {
                aOperationFilter.push(window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder));
                aOperationFilter.push(window.ODataFilter.getExpression("Vornr", window.ODataFilter.COMPARE.EQUAL, iOperation));
                aOperationFilter.push(window.ODataFilter.getExpression("Iupoz", window.ODataFilter.COMPARE.EQUAL, iSubOperation));
            }
            return aOperationFilter;

        },

        getOperations: function (iWorkOrder, iOperation, iSubOperation) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = this.getFilterForOperation(iWorkOrder, iOperation, iSubOperation);
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.WoOps, "", "", oFilter)
                    .then((response) => {
                        resolve(response.results);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        /* getMaxValue: function (oMeasurePoint, aMeasurePoints) {
             let aFiltered = aMeasurePoints.filter(oMP => {
                 return oMP.Vornr === oMeasurePoint.Vornr && oMP.Aufnr === oMeasurePoint.Aufnr && oMP.Iupoz === oMeasurePoint.Iupoz && oMP.Mdocm !== "";
             });
             if (aFiltered.length > 0) {
                 let aIMdoc = aFiltered.map(e => parseFloat(e.Mdocm));
                 let iMax = Math.max(...aIMdoc).toString();
                 return iMax;
             }
             return "";
         },*/

        getMaxValue: function (oMeasurePoint, aMeasurePoints) {
            let aFiltered = aMeasurePoints.filter(oMP => {
                return oMP.Vornr === oMeasurePoint.Vornr && oMP.Aufnr === oMeasurePoint.Aufnr && oMP.Iupoz === oMeasurePoint.Iupoz;
            });
            if (aFiltered.length > 0) {
                let aIMdoc = aFiltered.map(e => {
                    return parseFloat(e.Mdocm === "" ? "0" : e.Mdocm)
                });
                let iMax = Math.max(...aIMdoc).toString();
                return iMax;
            }
            return "";
        },
        //Esto está comentado
        getLastRecordedValue: function (oMeasuremPoint, aMeasurePoints) {
            let sMaxValue = this.getMaxValue(oMeasuremPoint, aMeasurePoints);
            if (sMaxValue) {
                let oMeasurePointWithMaxValue = aMeasurePoints.find(e => e.Mdocm === sMaxValue);
                if (oMeasurePointWithMaxValue) {
                    return oMeasurePointWithMaxValue.RecordedValue;
                } else {
                    return ""
                }
            }
            return "";
        },

        getMeasurePoints: function (iWorkOrder) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.measureDocSet, "", "", oFilter)
                    .then((response) => {
                        let aResultsComplete = $.extend([], response.results);
                        let aWithoutMeasuremDoc = response.results.filter(e => e.Mdocm === "");
                        /* aWithoutMeasuremDoc.forEach((e) => {
                            e.RecordedValue = this.getLastRecordedValue(e, aResultsComplete)
                        });*/
                        resolve(aWithoutMeasuremDoc);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getNotifications: function (iWorkOrder) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("WorkOrderNumber", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.workOrderNotifSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response.results);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getGenObs: function (iWorkOrder) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.genObs, "", "WorkOrderGenObs_nav", oFilter)
                    .then((response) => {
                        let oResponse = response.results.shift();
                        if (oResponse)
                            resolve(oResponse);
                        else
                            resolve({
                                Equipments: {},
                                Observations: [],
                                VersionAts: {},
                                Operations: {}
                            })
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getObservations: function (iWorkOrder) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.obsSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getAps: function (iWorkOrder) { 
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.DefectsAPSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        _getApsFlagsUpdatePath: function (sWorkOrderNumber) {
            return "(Aufnr='" + sWorkOrderNumber + "',Qmnum='')";
        },

        saveAps: function (oApsData, bCreate) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                const mParameters = {
                    success: function () {
                        console.log("Success saveApps");
                        resolve();
                    },
                    error: function (a) {
                        console.log("Error saveApps");
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                };

                if (bCreate) {
                    oModel.create(this._entities.DefectsAPSet, oApsData, mParameters);
                } else {
                    const sPathToUpdate = this._getApsFlagsUpdatePath(oApsData.Aufnr);
                    oModel.update(this._entities.DefectsAPSet + sPathToUpdate, oApsData, mParameters);
                }
            });
        },

        _getDefectUpdatePath: function (oDefect) {
            return oDefect.__metadata.uri.split("/")[4];
        },

        getDefectsByOrder: function (iWorkOrder) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                    window.ODataFilter.getExpression("Asignar", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.OR).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.workOrderDefSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response.results);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getDefectsByEmplazamiento: function (sEmplazamiento) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Asignar", window.ODataFilter.COMPARE.EQUAL, ""),
                    window.ODataFilter.getExpression("Maintloc", window.ODataFilter.COMPARE.EQUAL, sEmplazamiento)
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.workOrderDefSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response.results);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getDefects: function (sLocId) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Btpln", window.ODataFilter.COMPARE.EQUAL, sLocId),
                    window.ODataFilter.getExpression("Asignar", window.ODataFilter.COMPARE.EQUAL, ""),
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, "")
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                //oDataService.read(this.getServiceUri(), this._entities.workOrderDefSet, "", "WOAttachmentSet_nav", oFilter)
                oDataService.read(this.getServiceUri(), this._entities.workOrderDefSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response.results);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getDefectById: function (iDefectId) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Qmnum", window.ODataFilter.COMPARE.EQUAL, iDefectId),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.workOrderDefSet, "", "", oFilter)
                    .then((response) => {
                        let oResponse = response.results.shift();
                        if (oResponse)
                            resolve(oResponse);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        _deleteUnnecesaryKeys: function (oDefect) {
            delete oDefect.__metadata;
            delete oDefect.WODef_DefAct_nav;
            delete oDefect.WODef_DefCa_nav;
            delete oDefect.WODef_DefIt_nav;
            delete oDefect.WODef_DefTx_nav;
            delete oDefect.WOAttachmentSet_nav;
        },

        deleteWOAttachment: function (oAttachment) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                let sPathToUpdate = oAttachment.__metadata.uri.split("/")[4];
                // Etag and set header
                offlineStore.setHttpClient(true);
                oModel.remove("/" + sPathToUpdate, {
                    success: function (a) {
                        resolve(a);
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    },
                    eTag: "*"
                });
            });
        },

        updateStationDefect: function (oDefect) {
            let oCopyDefect = $.extend(true, {}, oDefect);
            let sPathToUpdate = this._getDefectUpdatePath(oCopyDefect);
            this._deleteUnnecesaryKeys(oCopyDefect);
            delete oCopyDefect["@com.sap.vocabularies.Offline.v1.isLocal"];
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.update("/" + sPathToUpdate, oCopyDefect, {
                    success: function (a) {
                        resolve(a);
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    },
                    eTag: "*"
                });
            });

        },

        saveObservation: function (oObservation) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.create(this._entities.obsSet, oObservation, {
                    success: function () {
                        resolve();
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            });
        },

        _getOperationUpdatePath: function (sWorkOrderNumber, sOperationNumber, sSubOperationNumber) {
            return "(Aufnr='" + sWorkOrderNumber + "',Vornr='" + sOperationNumber + "',Iupoz='" + sSubOperationNumber + "')";
        },

        updateOperationStatus: function (oSubOperation) {
            let sPathToUpdate = this._getOperationUpdatePath(oSubOperation.Aufnr, oSubOperation.Vornr, oSubOperation.Iupoz);
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.update(this._entities.workOrderOpSet + sPathToUpdate, this._getOperationPayload(oSubOperation), {
                    success: function () {
                        resolve();
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            })
        },

        updateOTStatus: function (oWorkOrder) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.update(this._entities.genObs + "('" + oWorkOrder.Aufnr + "')", this._getWorkOrderPayload(oWorkOrder), {
                    success: function () {
                        resolve();
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            })
        },
        
        getOnlineModel: function () {
            return new sap.ui.model.odata.v2.ODataModel(
                "https://" +
                TransenerMovilidad.devapp.smpInfo.server +
                "/" +
                TransenerMovilidad.devapp.smpInfo.appID +
                ".wo",
                {
                    useBatch: false,
                    json: true,
                    headers: {
                        DataServiceVersion: "2.0",
                        "Cache-Control": "no-cache, no-store",
                        Pragma: "no-cache",
                        "Content-Type": "application/json"
                    }
                }
            );
        },

        postOTByWorkplace: function (payload) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(false);
                const oModel = this.getOnlineModel();
                oModel.create(this._entities.WorkOrdersByWorkplace, payload, {
                    success: function (data) {
                        offlineStore.setHttpClient(true);
                        resolve();
                    },
                    error: function (a) {
                        offlineStore.setHttpClient(true);
                        reject({
                            msg: "Error en read online",
                            res: a
                        });
                    }
                });
            });
        },

        getOTByWorkplace: function (sGewrk) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(false);
                const oModel = this.getOnlineModel();
                oModel.read(this._entities.WorkOrdersByWorkplace, {
                    filters: [new sap.ui.model.Filter("Gewrk", sap.ui.model.FilterOperator.EQ, sGewrk)],
                    success: function (data) {
                        data.results.forEach(e => e.Grtrp = Formatter.formatDate(e.Grtrp));
                        offlineStore.setHttpClient(true);
                        resolve(data.results);
                    },
                    error: function (a) {
                        offlineStore.setHttpClient(true);
                        reject({
                            msg: "Error en read online",
                            res: a
                        });
                    }
                });
            });
        },

        getWOFromList: function (sAufnr) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, sAufnr),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.list, "", "", oFilter)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        getWOAttachments: function (sAufnr) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("Aufnr", window.ODataFilter.COMPARE.EQUAL, sAufnr),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.WODocAttachment, "", "", oFilter)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        updateList: function (oWorkOrder) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.update(this._entities.list + "('" + oWorkOrder.Aufnr + "')", oWorkOrder, {
                    success: function (a) {
                        resolve(a);
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            })
        },

        _getOperationPayload: function (oOperation) {
            delete oOperation.MeasuremDocSet_nav;
            delete oOperation.OperationStatusSet_nav;
            delete oOperation.__metadata;
            return oOperation;
        },

        _getWorkOrderPayload: function (oWorkOrder) {
            delete oWorkOrder.__metadata;
            delete oWorkOrder.Equipments;
            delete oWorkOrder.Operations;
            delete oWorkOrder.VersionAts;
            delete oWorkOrder.WorkOrderGenObs_nav;
            delete oWorkOrder.Observations;
            return oWorkOrder;
        },

        postSubOperationComment: function (oNotification) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.create(this._entities.workOrderNotifSet, oNotification, {
                    success: function () {
                        resolve();
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            });
        },

        postMeasurePoints: function (oMeasurePoint) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                delete oMeasurePoint.__metadata;
                oModel.create(this._entities.measureDocSet, oMeasurePoint, {
                    success: function (a) {
                        resolve(a);
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            });
        },

        getDailyEndNotifications: function (iWorkOrder) {
            return new Promise((resolve, reject) => {
                offlineStore.setHttpClient(true);
                let aFilters = [
                    window.ODataFilter.getExpression("WorkOrderNumber", window.ODataFilter.COMPARE.EQUAL, iWorkOrder),
                ];
                let oFilter = new window.ODataFilter(aFilters, window.ODataFilter.OPERATOR.AND).getFilter();
                oDataService.read(this.getServiceUri(), this._entities.workOrderNotifSet, "", "", oFilter)
                    .then((response) => {
                        resolve(response.results);
                    })
                    .catch((error) => {
                        reject({
                            msg: "Error en read del store",
                            res: error
                        })
                    });
            });
        },

        postWOAttachments: function (oDocument) {
            return new Promise((resolve, reject) => {
                const oModel = this.getModel();
                offlineStore.setHttpClient(true);
                oModel.create(this._entities.WODocAttachment, oDocument, {
                    success: function () {
                        resolve();
                    },
                    error: function (a) {
                        reject({
                            msg: "Error en read del store",
                            res: a
                        })
                    }
                });
            });
        }
    };
});