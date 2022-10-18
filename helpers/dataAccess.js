sap.ui.define([
    "TransenerMovilidad/helpers/SQLite",
], function (SQLite) {
    "use strict";
    return {

        getQueryForSearchAttachment: function (sQmnum) {
            return [{column: "ATTACH_ID", value: sQmnum}];
        },

        getQueryForSearchNotification: function (sAufnr, sIupoz, sVornr) {
            return [
                {
                    column: "VORNR",
                    value: sVornr
                },
                {
                    column: "AUFNR",
                    value: sAufnr
                },
                {
                    column: "IUPOZ",
                    value: sIupoz
                }
            ]
        },

        getQueryForSearchMeasurePoints: function (sAufnr, sIupoz, sVornr, sMeasurementPoint) {
            return [
                {
                    column: "VORNR",
                    value: sVornr
                },
                {
                    column: "AUFNR",
                    value: sAufnr
                },
                {
                    column: "IUPOZ",
                    value: sIupoz
                },
                {
                    column: "MEASUREMENT_POINT",
                    value: sMeasurementPoint
                }
            ]
        },

        deleteAllTables: function () {
            return new Promise((resolve, reject) => {
                SQLite.delete("ATTACHMENTS",[]);
                SQLite.delete("MEASURE_POINTS", []);
                SQLite.delete("NOTIFICATIONS", []);
                SQLite.executeTransaction().then(() => {
                    console.log("databases cleaned");
                    resolve();
                }).catch(() => {
                    reject();
                });
            })
        },

        deleteAttachmentFromSQL: function (sQmnum) {
            return new Promise((resolve, reject) => {
                SQLite.delete("ATTACHMENTS", this.getQueryForSearchAttachment(sQmnum));
                SQLite.executeTransaction().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                });
            })
        },

        addNotificationDeleteObjects: function (oNotification) {
            SQLite.delete("NOTIFICATIONS", this.getQueryForSearchNotification(oNotification.WorkOrderNumber, oNotification.SubOperationNumber, oNotification.OperationNumber));
        },


        addMeasurePointsDeleteObjects: function (oMeasurePoint) {
            SQLite.delete("MEASURE_POINTS", this.getQueryForSearchNotification(oMeasurePoint.Aufnr, oMeasurePoint.Iupoz, oMeasurePoint.Vornr));
        },

        executeTransaction: function () {
            return new Promise((resolve, reject) => {
                SQLite.executeTransaction().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                });
            })
        },

        handleSubStatus: function (aData, fnCallbackSuccess, fnCallbackError) {
            let [sAufnr, sIupoz, sVornr, sComment, sEstat] = aData;
            let aSelectNotificationQuery = this.getQueryForSearchNotification(sAufnr, sIupoz, sVornr);
            SQLite.select("NOTIFICATIONS", [], true, aSelectNotificationQuery, false);
            SQLite.executeTransaction().then(
                (aResponses) => {
                    if (aResponses.length > 0) {
                        //todo ver como acomodar
                        let oResponse = aResponses.shift();
                        if (oResponse.res.rows.length === 0) {
                            SQLite.insert("NOTIFICATIONS", ["AUFNR", "IUPOZ", "VORNR", "NOTIFICATION_TEXT", "SUBSTATUS"], [aData]);
                            SQLite.executeTransaction().then(fnCallbackSuccess).catch(fnCallbackError)
                        } else {
                            let aColumnsToChange = [{column: "SUBSTATUS", value: sEstat}];
                            SQLite.update("NOTIFICATIONS", aColumnsToChange, aSelectNotificationQuery);
                            SQLite.executeTransaction().then(fnCallbackSuccess).catch(fnCallbackError)
                        }
                    }
                }
            ).catch((error) => {
                console.log(error);
            });
        },

        getMeasureData: function (oMeasurePoint) {
            return [oMeasurePoint.Aufnr,
                oMeasurePoint.Iupoz,
                oMeasurePoint.Vornr,
                oMeasurePoint.MeasurementPoint,
                oMeasurePoint.Mdocm,
                oMeasurePoint.RecordedValue,
                oMeasurePoint.Reader,
                null,
                null,
                oMeasurePoint.RecordedUnit,
                oMeasurePoint.SecondaryIndex,
                oMeasurePoint.ShortText,
                oMeasurePoint.Sincro,
                oMeasurePoint.WorkOrderObjectnr
            ]
        },

        handleMeasurePoints: function (aMeasurePoints, fnCallbackSuccess, fnCallbackError) {
            let oMeasurePoint = aMeasurePoints.shift();
            if (oMeasurePoint !== undefined) {
                let aMeasureData = this.getMeasureData(oMeasurePoint);
                let [sAufnr, sIupoz, sVornr, sMeasurementPoint, sMdocm, sRecordedValue] = aMeasureData;
                let aSelectNotificationQuery = this.getQueryForSearchMeasurePoints(sAufnr, sIupoz, sVornr, sMeasurementPoint);
                SQLite.select("MEASURE_POINTS", [], true, aSelectNotificationQuery, false);
                SQLite.executeTransaction().then(
                    (aResponses) => {
                        if (aResponses.length > 0) {
                            let oResponse = aResponses.shift();
                            if (oResponse.res.rows.length === 0) {
                                SQLite.insert("MEASURE_POINTS", ["AUFNR", "IUPOZ", "VORNR", "MEASUREMENT_POINT", "MDOCM", "RECORDED_VALUE", "READER", "READING_DATE", "READING_TIME", "RECORDED_UNIT", "SECONDARY_INDEX", "SHORT_TEXT", "SINCRO", "WO_OBJECT_NUMBER"], [aMeasureData]);
                            } else {
                                let aColumnsToChange = [{column: "RECORDED_VALUE", value: sRecordedValue}];
                                SQLite.update("MEASURE_POINTS", aColumnsToChange, aSelectNotificationQuery);
                            }
                            this.handleMeasurePoints(aMeasurePoints, fnCallbackSuccess, fnCallbackError)
                        }
                    }
                ).catch((error) => {
                    console.log(error);
                });
            } else {
                SQLite.executeTransaction().then(() => {
                    fnCallbackSuccess();
                }).catch(() => {
                    fnCallbackError();
                })
            }
        },

        /**
         *
         * @param aData
         * @param fnCallbackSuccess
         * @param fnCallbackError
         */
        handleComment: function (aData, fnCallbackSuccess, fnCallbackError) {
            let [sAufnr, sIupoz, sVornr, sComment, sEstat] = aData;
            let aSelectNotificationQuery = this.getQueryForSearchNotification(sAufnr, sIupoz, sVornr);
            SQLite.select("NOTIFICATIONS", [], true, aSelectNotificationQuery, false);
            SQLite.executeTransaction().then(
                (aResponses) => {
                    if (aResponses.length > 0) {
                        //todo ver como acomodar
                        let oResponse = aResponses.shift();
                        if (oResponse.res.rows.length === 0) {
                            SQLite.insert("NOTIFICATIONS", ["AUFNR", "IUPOZ", "VORNR", "NOTIFICATION_TEXT", "SUBSTATUS"], [aData]);
                        } else {
                            let aColumnsToChange = [{column: "NOTIFICATION_TEXT", value: sComment}];
                            SQLite.update("NOTIFICATIONS", aColumnsToChange, aSelectNotificationQuery);
                        }

                        SQLite.executeTransaction().then(fnCallbackSuccess).catch(fnCallbackError)
                    }
                }
            ).catch((error) => {
                console.log(error);
            });
        },

        /**
         *
         * @param aAttachments
         * @param fnCallbackSuccess
         * @param fnCallbackError
         */
        insertFiles: function (aAttachments, fnCallbackSuccess, fnCallbackError) {
            let aFileData = [];
            for (let oAttachment of aAttachments) {
                aFileData.push([oAttachment.Qmnum, oAttachment.name]);
            }
            SQLite.insert("ATTACHMENTS", ["ATTACH_ID", "ATTACHMENT_NAME"], aFileData);
            SQLite.executeTransaction().then(fnCallbackSuccess).catch(fnCallbackError)
        },

        /**
         *
         * @param sTable =NOMBRE DE lA TABLA
         * @param aColumnsToGet = COLUMNAS A OBTENER
         * @param bGetAllRows = SI SE MANDA TRUE AQUI SE OMITE EL PARAMETRO DE ARRIBA, SI ES FALSE OBTIENE LAS DE ARRIBA
         * @param aSearchQuery = QUERY DE BUSQUEDA
         * @param bCount = SI ES TRUE SOLO TRAE EL COUNT
         * @returns {Promise<any>}
         */
        getSQLiteRows: function (sTable, aColumnsToGet, bGetAllRows, aSearchQuery, bCount) {
            return new Promise((resolve, reject) => {
                SQLite.select(sTable, aColumnsToGet, bGetAllRows, aSearchQuery, bCount);
                SQLite.executeTransaction().then((aTransaction) => {
                    let oTransaction = aTransaction.shift();
                    let aTransactions = (oTransaction) ? oTransaction.res.rows : [];
                    resolve(aTransactions);
                }).catch((error) => {
                    console.log(error);
                    reject(error);
                })
            })
        },
    };

});
