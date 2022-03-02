sap.ui.define(
  [
    "TransenerMovilidad/helpers/offlineStore",
    "TransenerMovilidad/services/oDataService",
    "TransenerMovilidad/helpers/odata-filter",
    "TransenerMovilidad/helpers/workPlace"
  ],
  function(OfflineStoreHelper, oDataService, ODataFilter, WorkPlace) {
    "use strict";

    return {
      _entities: {
        workPlaceMaster: "/WorkPlaceMasterSet",
        workOrderUbTecSet: "/WorkOrderUbTecSet",
        defectsCatalogSet: "/DefectsCatalogSet",
        defectsSubCatalogSet: "/DefectsSubCatalogSet",
        defPriorSet: "/DefPriorSet",
        opStatusSet: "/OpStatusSet",
        markerSet: "/EamlShMarkerElemSet",
        MTSMaster: "/MTSElemSet"
      },

      getModel: function() {
        return new sap.ui.model.odata.v2.ODataModel(
          "https://" +
            TransenerMovilidad.devapp.smpInfo.server +
            "/" +
            TransenerMovilidad.devapp.smpInfo.appID +
            ".master",
          {
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

      getModelOffline: function() {
        return new sap.ui.model.odata.v2.ODataModel(
          OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
          {
            json: false,
            headers: {
              DataServiceVersion: "2.0",
              "Cache-Control": "no-cache, no-store",
              Pragma: "no-cache",
              "Content-Type": "application/json"
            }
          }
        );
      },

      getMarkers: function(sBtpln) {
        return new Promise((resolve, reject) => {
          OfflineStoreHelper.setHttpClient(true);
          let aFilters = [
            window.ODataFilter.getExpression(
              "Lrpid ",
              window.ODataFilter.COMPARE.EQUAL,
              sBtpln
            )
          ];
          let oFilter = new window.ODataFilter(
            aFilters,
            window.ODataFilter.OPERATOR.AND
          ).getFilter();
          oDataService
            .read(
              OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
              this._entities.markerSet,
              "",
              "",
              oFilter
            )
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject({ msg: "Error en read del store", res: error });
            });
        });
      },

      getMTS: function() {
        return new Promise((resolve, reject) => {
          OfflineStoreHelper.setHttpClient(true);
          oDataService
            .read(
              OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
              this._entities.MTSMaster,
              "",
              "",
              ""
            )
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject({ msg: "Error en read del store offline", res: error });
            });
        });
      },

      getWorkPlaceMaster: function(bOfflineRead) {
        return new Promise((resolve, reject) => {
          OfflineStoreHelper.setHttpClient(bOfflineRead);
          if (bOfflineRead) {
            oDataService
              .read(
                OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
                this._entities.workPlaceMaster,
                "",
                "",
                ""
              )
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject({ msg: "Error en read del store offline", res: error });
              });
          } else {
            const oModel = this.getModel();
            oModel.read(this._entities.workPlaceMaster, {
              success: function(a) {
                resolve(a);
              },
              error: function(a) {
                reject({
                  msg: "Error en read online",
                  res: a
                });
              }
            });
          }
        });
      },

      getWorkOrderUbTecById: function(bOfflineRead, sUbTecId) {
        return new Promise((resolve, reject) => {
          OfflineStoreHelper.setHttpClient(bOfflineRead);
          if (bOfflineRead) {
            let aExpressionFilter = [
              window.ODataFilter.getExpression(
                "Tplnr",
                window.ODataFilter.COMPARE.EQUAL,
                sUbTecId
              )
            ];
            let oFilter = new window.ODataFilter(
              aExpressionFilter,
              window.ODataFilter.OPERATOR.AND
            ).getFilter();
            oDataService
              .read(
                OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
                this._entities.workOrderUbTecSet,
                "",
                "CatalogXUbTec_nav",
                oFilter
              )
              .then(response => {
                resolve(response.results);
              })
              .catch(error => {
                reject({ msg: "Error en read del store offline", res: error });
              });
          } else {
            let aFilters = [
              new sap.ui.model.Filter(
                "Tplnr",
                sap.ui.model.FilterOperator.EQ,
                sUbTecId
              )
            ];
            const oModel = this.getModel();
            oModel.read(this._entities.workOrderUbTecSet, {
              urlParameters: {
                $expand: "CatalogXUbTec_nav"
              },
              success: function(a) {
                resolve(a.results);
              },
              error: function(a) {
                reject({
                  msg: "Error en read " + "online" + " de las UT.",
                  res: a
                });
              },
              filters: aFilters
            });
          }
        });
      },

      filterTechnicalLocations: function(aTechLocations, sSearchCriteria) {
        let aFound = aTechLocations.filter(oTechLocation => {
          return (
            oTechLocation.Tplnr.toUpperCase().includes(
              sSearchCriteria.toUpperCase()
            ) ||
            oTechLocation.Pltxt.toUpperCase().includes(
              sSearchCriteria.toUpperCase()
            )
          );
        });
        return aFound;
      },

      getWorkOrderUbTecSet: function(bOfflineRead, sStringToFilter) {
        let self = this;
        OfflineStoreHelper.setHttpClient(bOfflineRead);
        return new Promise((resolve, reject) => {
          if (bOfflineRead) {
            let aExpressionFilter = [
              window.ODataFilter.getExpression(
                "Pltxt",
                window.ODataFilter.COMPARE.CONTAINS,
                sStringToFilter
              ),
              window.ODataFilter.getExpression(
                "Tplnr",
                window.ODataFilter.COMPARE.CONTAINS,
                sStringToFilter
              )
            ];
            let oFilter = new window.ODataFilter(
              aExpressionFilter,
              window.ODataFilter.OPERATOR.OR
            ).getFilter();
            oDataService
              .read(
                OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
                this._entities.workOrderUbTecSet,
                "",
                "CatalogXUbTec_nav",
                oFilter,
                "",
                0,
                300
              )
              .then(response => {
                resolve(response.results);
              })
              .catch(error => {
                reject({ msg: "Error en read del store offline", res: error });
              });
          } else {
            const oModel = this.getModel();
            oModel.read(this._entities.workOrderUbTecSet, {
              urlParameters: {
                $expand: "CatalogXUbTec_nav"
              },
              success: function(a) {
                let aFilteredSearch = self.filterTechnicalLocations(
                  a.results,
                  sStringToFilter
                );
                resolve(aFilteredSearch);
              },
              error: function(a) {
                reject({
                  msg: "Error en read online",
                  res: a
                });
              }
            });
          }
        });
      },

      getDefectsSubCatalogSet: function(bOfflineRead, sGroupCatalog) {
        OfflineStoreHelper.setHttpClient(bOfflineRead);
        return new Promise((resolve, reject) => {
          if (bOfflineRead) {
            let aExpressionFilter = [
              window.ODataFilter.getExpression(
                "Codegruppe",
                window.ODataFilter.COMPARE.EQUAL,
                sGroupCatalog
              )
            ];
            let oFilter = new window.ODataFilter(
              aExpressionFilter,
              window.ODataFilter.OPERATOR.AND
            ).getFilter();
            oDataService
              .read(
                OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
                this._entities.defectsSubCatalogSet,
                "",
                "",
                oFilter
              )
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject({ msg: "Error en read del store offline", res: error });
              });
          } else {
            const oModel = this.getModel();
            let oFilter = new sap.ui.model.Filter(
              "Codegruppe",
              sap.ui.model.FilterOperator.EQ,
              sGroupCatalog
            );
            oModel.read(this._entities.defectsSubCatalogSet, {
              filters: [oFilter],
              success: function(a) {
                resolve(a);
              },
              error: function(a) {
                reject({
                  msg: "Error en read online",
                  res: a
                });
              }
            });
          }
        });
      },

      getOpStatusSet: function(bOfflineRead) {
        OfflineStoreHelper.setHttpClient(bOfflineRead);
        return new Promise((resolve, reject) => {
          if (bOfflineRead) {
            oDataService
              .read(
                OfflineStoreHelper._oStoresConfig.masterStore.store.serviceUri,
                this._entities.opStatusSet,
                "",
                "",
                ""
              )
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject({ msg: "Error en read del store offline", res: error });
              });
          } else {
            const oModel = this.getModel();
            oModel.read(this._entities.opStatusSet, {
              success: function(a) {
                resolve(a);
              },
              error: function(a) {
                reject({
                  msg: "Error en read online.",
                  res: a
                });
              }
            });
          }
        });
      }
    };
  }
);
