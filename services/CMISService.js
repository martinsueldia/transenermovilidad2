sap.ui.define(["TransenerMovilidad/lib/cmisjs"], function (cmis) {
    "use strict";

    return {

        _cmisDestinationUrl: "https://"+TransenerMovilidad.devapp.smpInfo.server+"/DocumentServiceProxy",
        /**************************************************** SESION CMIS ***********************************************************/
        _session: null,
        _getSession: function () {
            if (!this._session) {
                this._session = window.cmis.createSession(this._cmisDestinationUrl);
            }
            return this._session;
        },


        /**************************************************** REPOSITORIOS ***********************************************************/
        loadRepositories: function () {
            return new Promise((resolve, reject) => {
                let session = this._getSession();
                session.loadRepositories({
                    request: {
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (e) {
                            reject(e)
                        }
                    }
                });
            });
        },


        /**************************************************** FOLDER CONTENT ***********************************************************/
        loadFolderContent: function (folderId) {
            //busy//
            BusyDialogHelper.open("Loading", "SearchingFolderContent");
            //abre sesion
            var session = this._getSession();
            //carga repositorios
            //session.setCredentials($("input[name='username']").val(), $("input[name='password']").val()).loadRepositories({
            session.getChildren(folderId, {
                request: {
                    success: jQuery.proxy(this._onLoadFolderContentSuccess, this),
                    error: jQuery.proxy(this._onLoadFolderContentError, this)
                }
            });
        },

        _onLoadFolderContentSuccess: function (data) {
            //busy
            BusyDialogHelper.close();
            //modelo
            var oModel = sap.ui.getCore().byId("App").getModel("folderStructure");
            oModel.setProperty("/FolderItems", data.objects);
        },

        _onLoadFolderContentError: function (e) {
            //busy
            BusyDialogHelper.close();
            //error message
            if (e.responseJSON) {
                MessageBoxHelper.showAlert("Error", e.responseJSON.message);
            }
        },


        /**************************************************** STREAM URL ***********************************************************/
        getStreamUrl: function (fileId) {
            //abre sesion
            var session = this._getSession();
            //obtiene URL
            return session.getContentStreamURL(fileId);
        },


        /**************************************************** CREATE FOLDER ***********************************************************/
        createFolder: function (folderName, fnSuccess, fnError) {
            var session = this._getSession();
            session.createFolder(session.defaultRepository.repositoryId, folderName, null, null, null, {
                request: {
                    success: fnSuccess,
                    error: fnError
                }
            });
        },

        findFolder: function (aFolders, sFolderName) {
            let oFolder = {
                folderId: "",
                found: false
            };
            for (let oFolder of aFolders) {
                let sFolder = oFolder.object.properties["cmis:name"].value;
                if (sFolderName === sFolder) {
                    oFolder.folderId = oFolder.object.properties["cmis:objectId"].value;
                    oFolder.found = true;
                    return oFolder;
                }
            }
            return oFolder;
        },

        findFolderByName: function (sFolderName) {
            let session = this._getSession();
            session.defaultRepository.rootFolderUrl = this._cmisDestinationUrl+"/"+session.defaultRepository.repositoryId+"/root";
            return new Promise((resolve, reject) => {
                session.getChildren(session.defaultRepository.repositoryId, {
                    request: {
                        success: (data) => {
                            let aFolders = data.objects;
                            let oFolder = this.findFolder(aFolders, sFolderName);
                            resolve(oFolder);
                        },
                        error: (error) => {
                            reject(error);
                        }
                    }
                });
            });
        },


        /**************************************************** CREATE FOLDER ***********************************************************/

        createDocument: function (parentFolderId, file, fnSuccess, fnError) {
            //abre sesion
            var session = this._getSession();
            //prepara parametros
            var fileName = file.name;
            var mimeType = file.type;
            var versioning = "major";
            //crea documento
            session.createDocument(parentFolderId, file, fileName, mimeType, versioning, null, null, null, {
                request: {
                    success: fnSuccess,
                    error: fnError
                }
            });
        },


        /**************************************************** DELETE ***********************************************************/
        deleteObject: function (objectId, fnComplete) {
            //abre sesion
            var session = this._getSession();
            //crea folder
            session.deleteObject(objectId, true, {
                request: {
                    complete: fnComplete
                }
            });
        }

    };
});