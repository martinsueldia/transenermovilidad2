sap.ui.define([
    "TransenerMovilidad/helpers/busyDialog",
], function (BusyDialog) {
    "use strict";
    return {
        _newImg: [],
        _imagesPath: cordova.file.externalRootDirectory + 'DJICaptures',
        _historicalPath: cordova.file.externalRootDirectory + 'DJICapturesHistorico',
        _fnCallback: {},
        _reader: null,

        _createFile: function () {
            this._oDirectoryFile.createWriter((oFileWriter) => {
                let oFileBlob = this.dataURItoBlob(this._oAttachment.src);
                oFileWriter.write(oFileBlob);
                oFileWriter.onwriteend = $.proxy(this._onWriteEnd, this);
                oFileWriter.onerror = $.proxy(this._onWriteError, this);
            }, () => {
                console.log("error writing file", error)
            })
        },

        _onWriteEnd: function () {
            console.log("se ha creado el archivo en" + cordova.file.externalRootDirectory + 'DJICaptures');
            this.createRecursiveEntries(this._aAttachments);
        },

        _onWriteError: function () {
            console.log("se ha producido un error al realizar la escritura del archivo")
            this.createRecursiveEntries(this._aAttachments);
        },

        _onSuccessGetFile: function (oDirectoryFile) {
            this._oDirectoryFile = oDirectoryFile;
            this._createFile();
        },

        _onErrorGetFile: function (error) {
            console.log(error);
        },

        _onSuccessResolveFileSystem: function (oDirectory) {
            oDirectory.getFile(this._oAttachment.name, {
                create: true
            }, $.proxy(this._onSuccessGetFile, this), $.proxy(this._onErrorGetFile, this))
        },
        _onErrorResolveFileSystem: function (error) {
            console.log(error);
        },

        _fileFound: function () {
            this.createRecursiveEntries(this._aAttachments);
        },
        _fileNotFound: function () {
            window.resolveLocalFileSystemURI(this._imagesPath, $.proxy(this._onSuccessResolveFileSystem, this), $.proxy(this._onErrorResolveFileSystem, this));
        },

        _checkIfFileExists: function () {
            let sFilePath = this._imagesPath + "/" + this._oAttachment.name;
            window.resolveLocalFileSystemURL(sFilePath, $.proxy(this._fileFound, this), $.proxy(this._fileNotFound, this));
        },

        /**
         *  Proceso de creacion de entry para un archivo
         *  1) se abre el local filesystem uri SI EL ARCHIVO NO EXISTE
         *  2) al abrir el filesystem este devuelve un objeto directorio
         *  3) este objeto directorio llama la funcion getFile(), este metodo devolverá un objeto directorio para permitir la escritura
         *  4) transformar objeto de File --> Binary
         *  5) en el success de la transformacion llama metodo de creacion de DirectoryEntry
         *  6) Finalizado de proceso
         *
         */

        handleAttachmentEntries: function (aAttachments, fnSuccess, fnError) {
            this._aAttachments = aAttachments;
            this._fnSuccess = fnSuccess;
            this._fnError = fnError;
            this.checkDJIFolder(() => {
                this.DJIFolderExists();
            }, () => {
                this.createDJIFolder();
            });

        },

        deletePhotosDJI: function () {
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "/DJICaptures", (oDirectory) => {
                oDirectory.removeRecursively(() => {
                    console.log("photos deleted ")
                }, (e) => {
                    console.log("photos deleted")
                    console.log(e)
                })
            }, () => {
                console.log("error on filesystem")
            });
        },

        checkDJIFolder: function (fnFound, fnNotFound) {
            window.resolveLocalFileSystemURL(this._imagesPath, fnFound, fnNotFound);
        },

        DJIFolderExists: function () {
            this.createRecursiveEntries(this._aAttachments);
        },

        createDJIFolder: function () {
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, (oDirectory) => {
                oDirectory.filesystem.root.getDirectory("DJICaptures", {
                    create: true
                }, () => {
                    this.createRecursiveEntries(this._aAttachments);
                }, () => {
                    this._fnError();
                });
            }, () => {
                this._fnError();
            });
        },

        _copyDirectory: function (fnCallback) {
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "/DJICaptures", (oDirectory) => {
                console.log(oDirectory)
                let sDinamycFolder = "/FotosDJI_" + Math.floor((Math.random() * 10000000) + 1).toString();
                oDirectory.copyTo(oDirectory.filesystem.root, sDinamycFolder,
                    (success) => {
                        if (fnCallback) {
                            fnCallback();
                        }
                        console.log("files copied")
                    },
                    (error) => {
                        console.log("files not copied")
                    });
            }, () => {
                console.log("error on filesystem")
            });
        },

        createRecursiveEntries: function (aAttachments) {
            this._oAttachment = aAttachments.shift();
            if (this._oAttachment) {
                this._checkIfFileExists();
            } else {
                this._copyDirectory();
                this._fnSuccess();
            }
        },

        getFileByPath: function (sFilePath) {
            return new Promise((resolve, reject) => {
                window.resolveLocalFileSystemURL(this._imagesPath + "/" + sFilePath, (fileEntry) => {
                    fileEntry.file(file => {
                        let oReader = new FileReader();
                        oReader.onload = () => {
                            let oFileBlob = this.dataURItoBlob(oReader.result);
                            oFileBlob.name = sFilePath;
                            resolve(oFileBlob);
                        };
                        oReader.readAsDataURL(file);
                    }, oErr => {
                        reject(oErr);
                    });
                });
            })
        },

        getDirectoryEntries: function () {
            let reader;
            return new Promise((resolve, reject) => {
                window.resolveLocalFileSystemURL(this._imagesPath, (fileEntry) => {
                    reader = fileEntry.createReader();
                    reader.readEntries((aEntries) => {
                        resolve(aEntries);
                    }, () => {
                        reject();
                    });
                }, (e) => {
                    reject(e);
                });
            });
        },

        getImages: function (fnCallback) {
            this._fnCallback = fnCallback;
            this.getDirectoryEntries().then(
                $.proxy(this._onGetEntriesSuccess, this),
                $.proxy(this._onGetEntriesError, this)
            );
        },


        _onGetEntriesError: function (e) {
            console.log("No DJI Folder")
            BusyDialog.close();
            //TODO: Realizar tratamiento de excepciones
        },
        //cuando ya tengo todos los archivos.
        _onGetEntriesSuccess: function (aEntries) {
            this._getFiles(aEntries);
        },

        _getFiles: function (aEntries) {
            var aPromises = [];
            for (let oEntry of aEntries) {
                aPromises.push(new Promise((resolve, reject) => {
                    oEntry.file(file => {
                        resolve(file);
                    }, oErr => {
                        reject(oErr);
                    });
                }));
            }

            Promise.all(aPromises).then(
                $.proxy(this._getFilesSuccess, this),
                $.proxy(this._getFilesError, this)
            );
        },

        binaryToBlob: function (binary, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;
            var byteCharacters = binary;
            var byteArrays = [];
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            var blob;
            try {
                blob = new Blob(byteArrays, {
                    type: contentType
                });
            } catch (e) {
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                blob = new BlobBuilder();
                blob.append(byteArrays);
                blob = blob.getBlob();
            }

            return blob;
        },

        _getBinaryFile: function (oFile) {
            return new Promise((resolve, reject) => {
                let fReader = new FileReader();
                fReader.onload = () => {
                    resolve({
                        "size": oFile.size,
                        "src": fReader.result,
                        "name": oFile.name,
                        "localURL": oFile.localURL,
                        "type": oFile.type,
                        "localSystem": true
                    });
                };

                fReader.onerror = () => {
                    reject();
                };

                fReader.readAsDataURL(oFile);
            });
        },

        _getFilesSuccess: function (aFiles, aBinaryFiles) {
            if (!aBinaryFiles) {
                aBinaryFiles = [];
            }

            let oFile = aFiles.pop();

            if (oFile) {
                this._getBinaryFile(oFile).then((oBinaryFile) => {
                    aBinaryFiles.push(oBinaryFile);
                    this._getFilesSuccess(aFiles, aBinaryFiles);
                }).catch((e) => {
                    console.log(e);
                    BusyDialog.close();
                });
            } else {
                this._fnCallback(aBinaryFiles);
            }
        },

        _getFilesError: function () {
            BusyDialog.close();
            //TODO: Realizar tratamiento de excepciones
        },

        dataURItoBlob: function (dataURI) {
            let byteString = atob(dataURI.split(',')[1]);
            let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            let blob = new Blob([ab], {
                type: mimeString
            });
            return blob;
        },

        _encodeB64: function (oFile, oModel) {
            let aAtachments = oModel.getProperty("/Attachments");
            let reader = new FileReader();
            reader.onload = () => {
                let oImg = {
                    "size": oFile.size,
                    "src": reader.result,
                    "name": oFile.name,
                    "localURL": "",
                    "type": oFile.type,
                    "localSystem": false
                };
                if (aAtachments && aAtachments.length > 0) {
                    let aNewArray = $.extend([], aAtachments);
                    aNewArray.push(oImg);
                    oModel.setProperty("/Attachments", aNewArray);
                } else {
                    oModel.setProperty("/Attachments", [oImg]);
                }
            };
            reader.onerror = () => {
                console.log("error");
            };
            reader.readAsDataURL(oFile);
        },

        readBinaryString: function (File, fileLoadedCallback) {
            this._reader = new FileReader();
            this._reader.onload = () => {
                this._onFileReaderLoad(fileLoadedCallback)
            };
            this._reader.readAsBinaryString(File);
        },

        _onFileReaderLoad: function (callback) {
            let binaryString = btoa(this._reader.result);
            callback(binaryString);
        }


    };

});