sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/helpers/i18nTranslation",
    "TransenerMovilidad/helpers/file",
    "TransenerMovilidad/helpers/dji-integration",
    "TransenerMovilidad/helpers/busyDialog",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/services/masterDataService",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/formatter",
    "TransenerMovilidad/helpers/dataAccess",
    "TransenerMovilidad/helpers/geolocation",
    "TransenerMovilidad/helpers/log",
    "TransenerMovilidad/helpers/workOrderHelper",
    "sap/m/MessageBox"
  ],
  function (Controller, History, Dialog, Translator, File, DjiIntegration, BusyDialog, WorkPlaceHelper, MasterDataService, WorkOrderService,
    Formatter, DataAccess, Geolocation, LogHelper, WOHelper, MessageBox) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.defects.stations.newDefect", {
      _newDefectModel: {},
      _oTechLocModel: {},
      _oRouter: null,
      _isEdit: false,
      _iDefectId: null,
      _iWorkOrderId: null,
      _sLocationId: null,

      scrollViewToTop: function () {
        let aContent = this.getView().getContent();
        if (aContent.length > 0) {
          let sContentId = aContent.shift().sId;
          let oDOMContent = $("section[id*='" + sContentId + "-cont']");
          if (oDOMContent.length > 0) {
            oDOMContent[0].scroll(0, 0);
          }
        }
      },

      onInit: function () {
        this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        this._oRouter.getRoute("NewDefectStation").attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        this._iDefectId = oEvent.getParameter("arguments").defectId;
        if (this._iDefectId) {
          this._isEdit = true;
          WorkOrderService.getDefectById(this._iDefectId).then(
            $.proxy(this._initializeModels, this),
            $.proxy(this._onReadError, this)
          );
        } else {
          this._isEdit = false;
          this._initializeModels();
        }
      },

      onAfterRendering: function () {
         this.byId("desdeInput").setFilterFunction(function (sTerm, oItem) {
          // A case-insensitive 'string contains' style filter
          return oItem.getText().match(new RegExp(sTerm, "i"));
        }); 
        this.byId("hastaInput").setFilterFunction(function (sTerm, oItem) {
          // A case-insensitive 'string contains' style filter
          return oItem.getText().match(new RegExp(sTerm, "i"));
        });  
      },

      _resetStates: function () {
        let oValidationModel = this.getView().getModel("ValidationModel");
        oValidationModel.setProperty("/stateMarkerStart", sap.ui.core.ValueState.None);
        oValidationModel.setProperty("/stateMarkerEnd", sap.ui.core.ValueState.None);
        oValidationModel.setProperty("/stateLongtext", sap.ui.core.ValueState.None);
        oValidationModel.setProperty("/stateBtpln", sap.ui.core.ValueState.None);
        oValidationModel.setProperty("/stateDlCodegrp", sap.ui.core.ValueState.None);
        oValidationModel.setProperty("/stateDlCode", sap.ui.core.ValueState.None);
      },

      filterWorkPlaces: function (aWorkPlaces) {
        let aFormatted = aWorkPlaces.filter(oWorkPlace => {
          return (
            oWorkPlace.Werks === localStorage.Werks &&
            localStorage.speciality === oWorkPlace.Tcuad
          );
        });
        return aFormatted;
      },

      _onGetWorkPlaceSuccess: function (aWorkPlaces) {
        let aWorkPlacesFormatted = this.filterWorkPlaces(aWorkPlaces.results);
        this._createWorkPlaceModel(aWorkPlacesFormatted);
      },

      _createWorkPlaceModel: function (aWorkPlaces) {
        let oWorkPlaceModel = new sap.ui.model.json.JSONModel();
        oWorkPlaceModel.setData({
          WorkPlaces: aWorkPlaces
        });
        this.getView().setModel(oWorkPlaceModel, "WorkPlaceModel");
      },

      _onReadError: function (oErr) {
        //TODO: Mostrar excepción
        MessageBox.warning(oErr);
      },

      _onBackPress: function () {
        this.scrollViewToTop();
        this._back();
      },

      _onPartChange: function (oEvent) {
        let oView = this.getView();
        try {
          var sGroupCatalog = oView.getModel("NewDefect").getProperty("/DlCodegrp");
          MasterDataService.getDefectsSubCatalogSet(true, sGroupCatalog).then(
            $.proxy(this._onSubCatalogsSuccess, this),
            $.proxy(this._onReadError, this)
          );
        } catch (ex) {
          //TODO: mostrar excepción
          MessageBox.warning(ex);
        }
      },

      _onSubCatalogsSuccess: function (aSubCatalogs) {
        let oValidationModel = this.getView().getModel("ValidationModel");
        oValidationModel.setProperty("/stateDlCodegrp", "None");
        let oView = this.getView();
        let oSubCatalogModel = oView.getModel("SubCatalogs");
        oSubCatalogModel.setData({
          Catalogs: aSubCatalogs.results
        });
      },

      _onSearchTechLoc: function (oEvent) {
        try {
          this.filterTechnicalLocations();
        } catch (ex) {
          //TODO: Realizar tratamiento de excepciones
          MessageBox.warning(ex);
        }
      },

      filterTechnicalLocations: function () {
        try {
          let oView = this.getView();
          let sValueSearch = oView.getModel("NewDefect").getProperty("/Btpln");
          MasterDataService.getWorkOrderUbTecSet(true, sValueSearch).then(
            $.proxy(this._onGetWorkOrderUbTecSetSuccess, this),
            $.proxy(this._onGetWorkOrderUbTecSetError, this)
          );
        } catch (ex) {
          //TODO: Realizar tratamiento de excepciones
          MessageBox.warning(ex);
        }
      },

      _onGetWorkOrderUbTecSetSuccess: function (aTechLocations) {
        let oView = this.getView();
        let oTechLocModel = new sap.ui.model.json.JSONModel();
        let aFilteredLocations = aTechLocations.map(x => {
          return {
            Id: x.Tplnr,
            Description: x.Pltxt,
            Parts: x.CatalogXUbTec_nav.results
          };
        });
        oTechLocModel.setData({
          TechnicalLocations: aFilteredLocations
        });
        oTechLocModel.setProperty("/bindingPath", "TechnicalLocations");
        oView.setModel(oTechLocModel, "TechnicalLocations");
        this._openDialog();
      },

      _onGetWorkOrderUbTecSetError: function () {
        //TODO mostrar excepcion correspondiente.
        MessageBox.warning("Error");
      },

      _woIsFinished: function (sStatus) {
        return WOHelper.workOrderIsFinished(sStatus);
      },

      _onDeleteTechLoc: function () {
        let oView = this.getView();
        oView.getModel("NewDefect").setProperty("/Btpln", "");
        oView.getModel("NewDefect").setProperty("/IsEditable", true);
        oView.getModel("NewDefect").setProperty("/MarkerStart", "");
        oView.getModel("NewDefect").setProperty("/MarkerEnd", "");
        oView.getModel("MarkersModel").setProperty("/Markers", []);
      },

      _showPhotoAlert: function () {
        let oPhotoConfig = this.getView().getModel("PhotoConfigurationModel").getData();
        let sPhotoTypeAllowed = oPhotoConfig.ImageTypeAllowed.join(",");
        let iMaxSize = oPhotoConfig.MaxSizePerImage / 1000000;
        Dialog.openMsgDialog({
          title: "Alerta",
          styleClasses: ["MessageDialogPhotos"],
          content: new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: "Las fotos que se intentan subir deben de cumplir los siguientes requerimientos"
              }),
              new sap.m.Text({
                text: "Formatos permitidos:" + " " + sPhotoTypeAllowed
              }),
              new sap.m.Text({
                text: "Tamaño maximo por imagen:" + iMaxSize + " MB"
              }),
              new sap.m.Text({
                text: "Maximo de imagenes a subir:" + oPhotoConfig.FileLimit
              })
            ]
          }),
          models: []
        },
          () => { }
        );
      },

      validateImageFormat: function (sAttachmentType) {
        let oPhotoConfig = this.getView().getModel("PhotoConfigurationModel").getData();
        return oPhotoConfig.ImageTypeAllowed.find(sType => {
          return sType === sAttachmentType;
        });
      },

      _validPhotos: function () {
        let iValidPhotos = 0;
        let iFileLimit = this.getView().getModel("PhotoConfigurationModel").getProperty("/FileLimit");
        let aAttachments = this.getView().getModel("NewDefect").getProperty("/Attachments");
        let iMaxSizePerImage = this.getView().getModel("PhotoConfigurationModel").getProperty("/MaxSizePerImage");
        if (aAttachments) {
          if (aAttachments.length <= iFileLimit) {
            for (let oAttachment of aAttachments) {
              let sAttachmentType = oAttachment.type.split("/")[1].toUpperCase();
              let bValidImageFormat = this.validateImageFormat(
                sAttachmentType
              );
              if (bValidImageFormat && oAttachment.size <= iMaxSizePerImage) {
                iValidPhotos++;
              }
            }
          } else {
            return false;
          }
        } else {
          return true;
        }
        return iValidPhotos === aAttachments.length;
      },

      _onSaveDefect: function () {
        if (this._validateStates()) {
          if (this._validPhotos()) {
            BusyDialog.open("Cargando", "Creando defecto...");
            let oNewDefect = this.getView().getModel("NewDefect").getData();
            this._formatNewDefect(
              oNewDefect,
              () => {
                if (this._isEdit) {
                  WorkOrderService.updateStationDefect(oNewDefect).then(
                    $.proxy(this._onUpdateDefectSuccess, this, oNewDefect),
                    $.proxy(this._onCreateDefectError, this)
                  );
                } else {
                  WorkOrderService.createStationDefect(oNewDefect).then(
                    $.proxy(this._onCreateDefectSuccess, this),
                    $.proxy(this._onCreateDefectError, this)
                  );
                }
              },
              $.proxy(this._onCreateDefectError, this)
            );
          } else {
            this._showPhotoAlert();
          }
        } else {
          this.scrollViewToTop();
        }
      },

      _createValidationModel: function () {
        let oValidationModel = new sap.ui.model.json.JSONModel();
        oValidationModel.setData({
          stateMarkerStart: sap.ui.core.ValueState.None,
          stateMarkerEnd: sap.ui.core.ValueState.None,
          stateLongtext: sap.ui.core.ValueState.None,
          stateBtpln: sap.ui.core.ValueState.None,
          stateDlCodegrp: sap.ui.core.ValueState.None,
          stateDlCode: sap.ui.core.ValueState.None,
          errorText: "Este campo es requerido"
        });
        this.getView().setModel(oValidationModel, "ValidationModel");
      },

      onSubPartChange: function (oEvent) {
        let oValidationModel = this.getView().getModel("ValidationModel");
        let sKey = oEvent.getSource().getSelectedKey();
        oValidationModel.setProperty(
          "/stateDlCode",
          sKey === "" ? "Error" : "None"
        );
      },

      _validateStates: function () {
        let oNewDefectData = this.getView().getModel("NewDefect").getData();
        let oModelState = this.getView().getModel("ValidationModel").getData();
        for (let attr in oNewDefectData) {
          if (attr === "MarkerStart" || attr === "MarkerEnd" || attr === "Longtext" || attr === "Btpln" || attr === "DlCodegrp" || attr === "DlCode") {
            if (!oNewDefectData[attr]) {
              if (attr === "Longtext" && this._isEdit) {
                this.getView().getModel("ValidationModel").setProperty("/state" + attr, sap.ui.core.ValueState.None);
              } else {
                this.getView().getModel("ValidationModel").setProperty("/state" + attr, sap.ui.core.ValueState.Error);
              }
            } else {
              this.getView().getModel("ValidationModel").setProperty("/state" + attr, sap.ui.core.ValueState.None);
            }
          }
        }
        if (localStorage.getItem("speciality") === "ET") {
          return (oModelState.stateLongtext === "None" && oModelState.stateBtpln === "None" && oModelState.stateDlCodegrp === "None" && oModelState.stateDlCode === "None");
        } else {
          return (oModelState.stateMarkerStart === "None" && oModelState.stateMarkerEnd === "None" && oModelState.stateLongtext === "None" && oModelState.stateBtpln === "None" &&
            oModelState.stateDlCodegrp === "None" && oModelState.stateDlCode === "None");
        }
      },

      openLongTextDialog: function () {
        let sLongText = this._realLongText;
        Dialog.openMsgDialog({
          title: "Descripciones",
          content: new sap.m.Text({
            text: sLongText
          }),
          models: [],
          styleClasses: ["DialogLongText"]
        });
      },

      isEditAndCorrected: function (bIsEdit, bIsCorrectedDefect) {
        return bIsEdit && !bIsCorrectedDefect;
      },

      saveAttachmentsSQLite: function (aAttachments, fnCallbackSuccess, fnCallbackErr) {
        DataAccess.insertFiles(
          aAttachments,
          fnCallbackSuccess,
          fnCallbackErr
        );
      },
      
      getAttachmentPromises: function (aAttachments) {
        let aPromises = [];
        for (let oAttachment of aAttachments) {
          let oPayload = {
            Qmnum: oAttachment.Qmnum,
            Archivo: window.env.repository.url +
              window.env.repository.id +
              "/root/" +
              oAttachment.Qmnum +
              "/" +
              oAttachment.name
          };
          aPromises.push(WorkOrderService.postAttachments(oPayload));
        }
        return aPromises;
      },

      _saveAttachments: function (oNewDefect, sAttachmentOfflineId, fnCallbackSuccess, fnCallbackErr) {
        let aAttachments;
        let aAttachmentsSqlite;
        if (oNewDefect.Attachments && oNewDefect.Attachments.length > 0) {
          aAttachments = $.extend([], oNewDefect.Attachments);
          aAttachmentsSqlite = $.extend([], oNewDefect.Attachments);
          aAttachmentsSqlite.map(oAttachment => (oAttachment.Qmnum = sAttachmentOfflineId));
          let aAttachmentPromises = this.getAttachmentPromises(aAttachmentsSqlite);
          Promise.all(aAttachmentPromises)
            .then(() => {
              delete oNewDefect.Attachments;
              File.handleAttachmentEntries(aAttachments, () => {this.saveAttachmentsSQLite(aAttachmentsSqlite, fnCallbackSuccess, fnCallbackErr);},
                fnCallbackErr
              );
            })
            .catch();
        } else {
          fnCallbackSuccess();
        }
      },

      _formatNewDefect: function (oNewDefect, fnCallbackSuccess, fnCallbackErr) {
        if (!this._isEdit) {
          oNewDefect.Qmnum = Formatter.getTimeString();
          oNewDefect.Qmtxt = oNewDefect.Longtext.substr(0, 40);
        }
        fnCallbackSuccess();
      },

      _back: function () {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        }
      },

      _onUpdateDefectSuccess: function (oNewDefect) {
        this._saveAttachments(oNewDefect, oNewDefect.Qmnum, () => {
            this._onSaveAttachmentSuccess(oNewDefect, {
              mode: "EDIT_DEFECT",
              message: "El defecto ha sido actualizado con exito"
            });
          },
          () => {
            this._onSaveAttachmentError();
          }
        );
      },

      _onSaveAttachmentSuccess: function (oNewDefect, oConfig) {
        Geolocation.getGeolocation(
          oGeoLocation => {
            LogHelper.createLog(oNewDefect, oGeoLocation, oConfig.mode);
          },
          () => {
            //TODO mostrar excepcion correspondiente.
            MessageBox.warning("Error al obtener localizacion");
          }
        );
        BusyDialog.close();
        Dialog.openMsgDialog({
          title: "Correcto",
          content: new sap.m.Text({
            text: oConfig.message
          }),
          models: []
        },
          $.proxy(this._back, this)
        );
      },

      _onSaveAttachmentError: function () {
        BusyDialog.close();
        Dialog.openMsgDialog({
          title: "Error",
          content: new sap.m.Text({
            text: "Ha ocurrido un error al crear los archivos"
          }),
          models: []
        });
      },

      _onCreateDefectSuccess: function () {
        let oNewDefect = this.getView().getModel("NewDefect").getData();
        this._saveAttachments(oNewDefect, oNewDefect.Qmnum, () => {
            this._onSaveAttachmentSuccess(oNewDefect, {
              mode: "NEW_DEFECT",
              message: "El defecto ha sido creado con exito"
            });
          },
          () => {
            this._onSaveAttachmentError();
          }
        );
      },

      _onCreateDefectError: function () {
        BusyDialog.close();
        Dialog.openMsgDialog({
          title: "Error",
          content: new sap.m.Text({
            text: "Ha ocurrido un error al crear el defecto"
          }),
          models: []
        });
      },

      formatLongTextForDialog: function (oDefect) {
        let oDefectCopy = $.extend({}, oDefect);
        this._realLongText = oDefectCopy.Longtext;
      },

      _initDefectModel: function (oDefect) {
        let oNewDefectModel = new sap.ui.model.json.JSONModel();
        let oView = this.getView();
        oNewDefectModel.loadData("models/stationDefect.json", null, false);
        if (this._isEdit) {
          oDefect.NotifDate = new Date(oDefect.NotifDate.getTime() + oDefect.NotifDate.getTimezoneOffset() * 60000);
          this.formatLongTextForDialog(oDefect);
          oDefect.Longtext = Formatter.formatLongText(oDefect.Longtext);
          oNewDefectModel.setData(oDefect);
        } else {
          oNewDefectModel.setProperty("/NotifDate", new Date());
          oNewDefectModel.setProperty("/Gewrk", localStorage["WorkPlace"]);
          oNewDefectModel.setProperty("/IsEditable", true);
          oNewDefectModel.setProperty("/Planplant", localStorage["Werks"]);
        }
        oView.setModel(oNewDefectModel, "NewDefect");
      },

      setWerks: function (oEvent) {
        var sWerks = oEvent.getParameter("selectedItem").getBindingContext("WorkPlaceModel").getObject().Werks;
        this.getView().getModel("NewDefect").setProperty("/Planplant", sWerks);
      },

      _initializeModels: function (oDefect) {
        try {
          this._createValidationModel();
          this._resetStates();
          this._initDefectModel(oDefect);
          this._setViewModels(oDefect);
        } catch (ex) {
          //TODO mostrar excepcion correspondiente.
          MessageBox.warning(ex);
        }
      },

      _onDeleteImage: function (oEvent) {
        let oControl = oEvent.getSource().getParent().getBindingContext("NewDefect").getObject();
        let oModel = this.getView().getModel("NewDefect");
        let aAttachments = oModel.getProperty("/Attachments");
        let iIndex = aAttachments.indexOf(oControl);
        aAttachments.splice(iIndex, 1);
        oModel.refresh(true);
      },

      _loadPhotoConfigurationModel: function () {
        let oPhotoConfigurationModel = new sap.ui.model.json.JSONModel();
        oPhotoConfigurationModel.loadData("./models/photoConfiguration.json");
        this.getView().setModel(oPhotoConfigurationModel, "PhotoConfigurationModel");
      },

      _loadRepositoryConfiguration: function () {
        let oRepositoryConfigurationModel = new sap.ui.model.json.JSONModel();
        oRepositoryConfigurationModel.loadData("./models/repository.json");
        this.getView().setModel(oRepositoryConfigurationModel, "RepositoryConfigurationModel");
      },

      _setViewModels: function (oDefect) {
        let oView = this.getView();
        let oCatalogModel = new sap.ui.model.json.JSONModel();
        let oSubCatalogsModel = new sap.ui.model.json.JSONModel();
        let oMarkersModel = new sap.ui.model.json.JSONModel();
        oMarkersModel.setSizeLimit(9999);
        oMarkersModel.setData({});
        this._loadPhotoConfigurationModel();
        this._loadRepositoryConfiguration();
        oView.setModel(MasterDataService.getModelOffline(), "MasterData");
        oView.setModel(DjiIntegration.getProductConnectedModel(), "DJIModel");
        oView.setModel(oSubCatalogsModel, "SubCatalogs");
        oView.setModel(oCatalogModel, "Catalogs");
        oView.setModel(oMarkersModel, "MarkersModel");
        this._initializeDefectViewModel();
        this._getWorkPlaces();
        if (this._isEdit) this._getPartsByTechnicalLocation(oDefect.Btpln);
      },

      _getPartsByTechnicalLocation: function (sUbTecId) {
        MasterDataService.getWorkOrderUbTecById(true, sUbTecId).then(
          $.proxy(this._onGetPartsByLocSuccess, this),
          $.proxy(this._onGetPartsByLocError, this)
        );
      },

      _onGetPartsByLocSuccess: function (aParts) {
        if (aParts.length > 0) {
          let oLocation = aParts.shift();
          let aPartsResults = oLocation.CatalogXUbTec_nav.results ? oLocation.CatalogXUbTec_nav.results : [];
          let oModel = this.getView().getModel("Catalogs");
          oModel.setProperty("/Catalogs", aPartsResults);
          this._onPartChange();
        }
      },

      _onGetPartsByLocError: function (oErr) {
        //TODO mostrar excepcion correspondiente.
        MessageBox.warning(oErr);
      },

      _getWorkPlaces: function () {
        MasterDataService.getWorkPlaceMaster(true).then(
          $.proxy(this._onGetWorkPlaceSuccess, this),
          $.proxy(this._onReadError, this)
        );
      },

      _setDialogOptions: function (options) {
        try {
          options.content = "TransenerMovilidad.view.defects.dialog.dialog";
          options.title = Translator.getTranslation("ChooseTechLoc");
          options.models = [];
        } catch (ex) {
          throw ex;
        }
      },

      _openDialog: function () {
        let oDialogOptions = {};
        try {
          this._setDialogOptions(oDialogOptions);
          Dialog.open(oDialogOptions, this.getView());
        } catch (e) {
          //TODO mostrar excepcion correspondiente.
          MessageBox.warning(e);
        }
      },

      _onNewPhotoPress: function () {
        try {
          DjiIntegration.openCamera($.proxy(this._onOpenCameraError, this));
        } catch (ex) {
          //TODO mostrar excepcion correspondiente.
          MessageBox.warning(ex);
        }
      },

      _onOpenCameraError: function (oErr) {
        //TODO mostrar excepcion correspondiente.
        MessageBox.warning(oErr);
      },

      _onDownloadSuccess: function () {
        BusyDialog.open(
          "Cargando",
          "Agregando imagenes, por favor, espere..."
        );
        File.getImages(aBinaryFiles => {
          var oModel = this.getView().getModel("NewDefect");
          oModel.setProperty("/Attachments", aBinaryFiles);
          BusyDialog.close();
        });
      },

      _onDownloadPress: function () {
        try {
          //todo como no hay dron ir directo al success
          // this._onDownloadSuccess();
          DjiIntegration.downloadMedia(
            $.proxy(this._onDownloadSuccess, this),
            $.proxy(this._onDownloadErr, this)
          );
        } catch (ex) {
          BusyDialog.close();
          //TODO: Tratar excepciones.
          MessageBox.warning(ex);
        }
      },

      _onDeleteDJI: function () {
        Dialog.openConfirmDialog({
          title: "Borrar Fotos",
          content: new sap.m.Text({
            text: "¿Está seguro de formatear la tarjeta SD?"
          }),
          models: []
        },
          () => {
            File._copyDirectory(() => {
              File.deletePhotosDJI()
            });
            DjiIntegration.deletePhotos(() => {
              Dialog.openMsgDialog({
                "title": "Alerta",
                "content": new sap.m.Text({
                  text: "Se ha formateado la tarjeta SD de manera exitosa"
                }),
                "models": []
              }, () => { });
            }, (e) => {
              MessageBox.warning(e)
            })
          }
        );
      },

      _onDownloadErr: function (oErr) {
        MessageBox.warning(oErr);
      },

      _onImgChange: function (oEvent) {
        let oFile = oEvent.getParameters().files[0];
        let oDefectModel = this.getView().getModel("NewDefect");
        File._encodeB64(oFile, oDefectModel);
      },

      _initializeDefectViewModel: function () {
        let oDefect = this.getView().getModel("NewDefect").getData();
        let oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          visibleOnlyOnEdit: this._isEdit,
          viewTitle: "N°" + this._iDefectId,
          isEdit: this._isEdit,
          isNew: !this._isEdit,
          isCorrectedDefect: oDefect.Asignar ? oDefect.Asignar.length > 0 : false,
          hasWorkOrderAssigned: oDefect.Aufnr.length > 0,
          workPlaceLines: WorkPlaceHelper.getSpeciality() == "LI"
        });
        this.getView().setModel(oModel, "DefectView");
      },

      _correctDefect: function () {
        //para la correccion se coloca este campo como valido siempre
        let oValidationModel = this.getView().getModel("ValidationModel");
        oValidationModel.setProperty("/stateLongtext", sap.ui.core.ValueState.None);
        let oDefectModel = this.getView().getModel("NewDefect");
        Geolocation.getGeolocation(
          oGeoLocation => {
            LogHelper.createLog(
              oDefectModel.getData(),
              oGeoLocation,
              "CORRECT_DEFECT"
            );
          },
          () => {
            MessageBox.warning("Error al obtener localizacion");
          }
        );
        oDefectModel.setProperty("/Asignar", WorkPlaceHelper.getCurrentWorkOrder());
        this._onSaveDefect();
      }

    }
    );
  }
);