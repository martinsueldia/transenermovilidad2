sap.ui.define(
  [
    "TransenerMovilidad/helpers/offlineStore",
    "TransenerMovilidad/services/oDataService",
    "TransenerMovilidad/helpers/odata-filter",
    "TransenerMovilidad/helpers/workPlace"
  ],
  function(offlineStore, oDataService, ODataFilter, LocalStorage) {
    "use strict";

    return {
      //this is a test
      _entities: {
        ats: "/ATSMasterSet",
        assignAts: "/ATSAssignmentSet",
        signatureAts: "/SignatureATSSet",
        HeaderATS: "/HeaderAtsSet",
        MTS: "/MTSAssignmentSet"
      },
      _oOptions: {},
      _serviceUri: offlineStore._oStoresConfig.atsStore.store.serviceUri,

      getModel: function() {
        return new sap.ui.model.odata.v2.ODataModel(
          offlineStore._oStoresConfig.atsStore.store.serviceUri,
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

      getAtsSet: function() {
        return new Promise((resolve, reject) => {
          offlineStore.setHttpClient(true);
          let aFilters = [
            window.ODataFilter.getExpression(
              "Company",
              window.ODataFilter.COMPARE.EQUAL,
              LocalStorage.getCompanyCode()
            ),
            window.ODataFilter.getExpression(
              "Tcuad",
              window.ODataFilter.COMPARE.EQUAL,
              LocalStorage.getSpeciality()
            )
          ];
          let oFilter = new window.ODataFilter(
            aFilters,
            window.ODataFilter.OPERATOR.AND
          ).getFilter();
          oDataService
            .read(this._serviceUri, this._entities.ats, "", "", oFilter)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject({ msg: "Error en read del store", res: error });
            });
        });
      },

      getAssignAtsSet: function(iWorkOrder) {
        return new Promise((resolve, reject) => {
          offlineStore.setHttpClient(true);
          let aFilters = [
            window.ODataFilter.getExpression(
              "Aufnr",
              window.ODataFilter.COMPARE.EQUAL,
              iWorkOrder
            )
          ];
          let oFilter = new window.ODataFilter(
            aFilters,
            window.ODataFilter.OPERATOR.AND
          ).getFilter();
          oDataService
            .read(this._serviceUri, this._entities.assignAts, "", "", oFilter)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject({ msg: "Error en read del store", res: error });
            });
        });
      },

      setOptions: function(sMethod, oOptions) {
        this._oOptions[sMethod] = oOptions;
      },

      createAssignAtsSet: function(oATS) {
        return new Promise((resolve, reject) => {
          const oModel = this.getModel();
          offlineStore.setHttpClient(true);
          oModel.create(this._entities.assignAts, oATS, {
            success: function(a) {
              resolve(a);
            },
            error: function(a) {
              reject({ msg: "Error en read del store", res: a });
            }
          });
        });
      },

      getSignatureHeader: function(iWorkOrder) {
        return new Promise((resolve, reject) => {
          offlineStore.setHttpClient(true);
          let aFilters = [
            window.ODataFilter.getExpression(
              "Aufnr",
              window.ODataFilter.COMPARE.EQUAL,
              iWorkOrder
            )
          ];
          let oFilter = new window.ODataFilter(
            aFilters,
            window.ODataFilter.OPERATOR.AND
          ).getFilter();
          oDataService
            .read(this._serviceUri, this._entities.HeaderATS, "", "", oFilter)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject({ msg: "Error en read del store", res: error });
            });
        });
      },

      saveSignatureAts: function(oAtsHeader) {
        return new Promise((resolve, reject) => {
          const oModel = this.getModel();
          offlineStore.setHttpClient(true);
          oModel.create(this._entities.HeaderATS, oAtsHeader, {
            success: function(a) {
              resolve({
                msg: "Success en create del store de la cabecera de firma",
                res: a
              });
            },
            error: function(a) {
              reject({ msg: "Error en create del store", res: a });
            }
          });
        });
      },
      
      getMTSAssignment: function(AtsIndex, Aufnr) {
        return new Promise((resolve, reject) => {
          offlineStore.setHttpClient(true);
          let aFilters = [
            window.ODataFilter.getExpression(
              "Idats",
              window.ODataFilter.COMPARE.EQUAL,
              AtsIndex
            ),
            window.ODataFilter.getExpression(
              "Aufnr",
              window.ODataFilter.COMPARE.EQUAL,
              Aufnr
            )
          ];
          let oFilter = new window.ODataFilter(
            aFilters,
            window.ODataFilter.OPERATOR.AND
          ).getFilter();
          // .read(this._serviceUri, this._entities.MTS, "", "", oFilter)
          oDataService
            .read(this._serviceUri, this._entities.MTS, "", "", oFilter)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject({ msg: "Error en read del store", res: error });
            });
        });
      },

      saveMTS: function(oMTS) {
        return new Promise((resolve, reject) => {
          const oModel = this.getModel();
          offlineStore.setHttpClient(true);
          oModel.create(this._entities.MTS, oMTS, {
            success: function(a) {
              resolve({
                msg: "Success en create del store de la MTS",
                res: a
              });
            },
            error: function(a) {
              reject({ msg: "Error en create del store", res: a });
            }
          });
        });
      }
    };
  }
);
