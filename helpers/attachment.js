sap.ui.define([
    "TransenerMovilidad/helpers/dataAccess",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/helpers/file",
    "TransenerMovilidad/services/CMISService"
], function (DataAccessHelper, WorkOrderService, WorkPlace, File, CMISService) {
    "use strict";
    return {
        _callbackSuccess: null,
        _callbackError: null,

        _onCreationSuccess: function (sQmnum) {
            DataAccessHelper.deleteAttachmentFromSQL(sQmnum).then(() => {
                this.processNextFile();
            }).catch(() => {
                this.processNextFile();
            })
        },

        processNextFile: function () {
            this.saveFiles(this._aSqliteRows);
        },

        _getFileAndCreateDocument: function (oFolder, oSqliteFile) {
            File.getFileByPath(oSqliteFile.ATTACHMENT_NAME).then((oFile) => {
                CMISService.createDocument(oFolder.folderId, oFile, () => {
                    this._onCreationSuccess(oSqliteFile.ATTACH_ID);
                }, (e) => {
                    this._executeErrorHandler(e);
                });
            }).catch((e) => {
                this._executeErrorHandler(e);
            });
        },

        _createFolderAndDocument: function (oFolder, oSqliteFile) {
            CMISService.createFolder(oSqliteFile.ATTACH_ID, (oCmisFolder) => {
                oFolder.folderId = oCmisFolder.properties["cmis:objectId"].value;
                File.getFileByPath(oSqliteFile.ATTACHMENT_NAME).then((oFile) => {
                    CMISService.createDocument(oFolder.folderId, oFile, () => {
                        this._onCreationSuccess(oSqliteFile.ATTACH_ID);
                    }, (e) => {
                        this._executeErrorHandler(e);
                    });
                }).catch((e) => {
                    this._executeErrorHandler(e);
                });
            }, (e) => {
                this._executeErrorHandler(e);
            })
        },

        _executeErrorHandler: function (e) {
            console.log(e);
            this.processNextFile();
        },

        handleFileOperations: function (oSqliteFile) {
            CMISService.loadRepositories().then(() => {
                CMISService.findFolderByName(oSqliteFile.ATTACH_ID).then((oFolder) => {
                    if (oFolder.found) {
                        this._getFileAndCreateDocument(oFolder, oSqliteFile)
                    }
                    else {
                        this._createFolderAndDocument(oFolder, oSqliteFile);
                    }
                }).catch((e) => {
                    this._executeErrorHandler(e);
                });
            }).catch((e) => {
                this._executeErrorHandler(e);
            });
        },

        saveFiles: function (aSQLiteRows) {
            let oRow = aSQLiteRows.shift();
            if (oRow) {
                this.handleFileOperations(oRow);
            } else {
                this._callbackSuccess();
            }
        },

        successGetFileResultSet: function (oFileResultSet) {
            this._aSqliteRows = [];
            for (let i = 0; i < oFileResultSet.length; i++) {
                let oSqlFile = oFileResultSet.item(i);
                this._aSqliteRows.push(oSqlFile);
            }
            this.saveFiles(this._aSqliteRows);
        },

        errorGetFileResultSet: function (error) {
            console.log("error", error);
            this._callbackError();
        },

        getSQLiteFiles: function () {
            DataAccessHelper.getSQLiteRows("ATTACHMENTS", [], true, [], false).then((oFileResultSet) => {
                this.successGetFileResultSet(oFileResultSet);
            }).catch(() => {
                this.errorGetFileResultSet();
            });
        },

        synchronizeAttachments: function (fnCallbackSuccess, fnCallbackError) {
            this._callbackSuccess = fnCallbackSuccess;
            this._callbackError = fnCallbackError;
            this.getSQLiteFiles();
        }
    };

});