sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/services/masterDataService",
    "TransenerMovilidad/helpers/panel-control",
    "TransenerMovilidad/helpers/workPlace",
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/helpers/formatter",
    "sap/m/MessageBox"
  ],
  function (Controller, NumberFormat, WorkOrderService, MasterDataService, Panel, LocalStorage, Dialog, Formatter, MessageBox) {
    "use strict";

    return Controller.extend(
      "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects",
      {
        _iWorkOrder: 0,
        _oRouter: null,
        _aTechLocations: [],

        onInit: function () {
          this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this._oRouter.getRoute("WorkOrderDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
          var oArgs = oEvent.getParameter("arguments");
          let oQuery = oArgs["?query"];
          this._iWorkOrder = oArgs.workOrderId;
          if (oQuery.tab == "DefectsToCorrect") {
            this._cleanModels();
            this._initializeModels();
          } else {
            this._cleanModels();
          }
        },

        _cleanModels: function () {
          var oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/Equipments", []);
        },

        _initializeModels: function () {
          var oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/Equipments/Busy", true);
          this._initializeWorkOrderModel();
          this._initializeSearchFieldsModel();
          this._initializeFilterInputsModel();
          this._getWorkPlaces();
          //Paneles con las listas de defectos - los muestro contraidos por default
          this.getView().getModel("WorkOrderModel").setProperty("/PanelCriticityExpand", false);
          this.getView().getModel("WorkOrderModel").setProperty("/PanelOrderDefectsExpand", false);
          this.getView().getModel("WorkOrderModel").setProperty("/PanelEquipmentExpand", false);
        },

        _initializeWorkOrderModel: function () {
          let sEmplazamiento = this.getView().getModel("WorkOrderModel").getProperty("/Emplazamiento");
          let aPromises = [];
          this._aTechLocations = [];
          WorkOrderService.getUtByWorkOrder(this._iWorkOrder).then(
            aTechLocations => {
              for (let oTechLoc of aTechLocations) {
                this._aTechLocations.push(oTechLoc);
                aPromises.push(WorkOrderService.getDefects(oTechLoc));
              }
              aPromises.push(
                WorkOrderService.getDefectsByOrder(this._iWorkOrder)
              );
              aPromises.push(WorkOrderService.getDefectsByEmplazamiento(sEmplazamiento));
              Promise.all(aPromises).then(
                $.proxy(this.onLocSetSuccess, this),
                $.proxy(this.onLocSetError, this)
              );
            }
          );
        },

        _initializeSearchFieldsModel: function () {
          let oPageState = {
            DefectsValue: ""
          };
          var oModel = new sap.ui.model.json.JSONModel(oPageState);
          this.getView().setModel(oModel, "SearchFieldsModel");
        },

        _initializeFilterInputsModel: function () {
          let oFilters = {
            Id: "",
            Desde: "",
            Hasta: "",
            Ubicacion: "",
            Descripcion: ""
          };
          var oModelFilters = new sap.ui.model.json.JSONModel(oFilters);
          this.getView().setModel(oModelFilters, "FilterInputsModel");
        },

        _getWorkPlaces: function () {
          MasterDataService.getWorkPlaceMaster(true).then(
            $.proxy(this._onGetWorkPlaceSuccess, this),
            $.proxy(this._onReadError, this)
          );
        },

        _onGetWorkPlaceSuccess: function (aWorkPlaces) {
          let aWorkPlacesFormatted = this.filterWorkPlaces(aWorkPlaces.results);
          this._createWorkPlaceModel(aWorkPlacesFormatted);
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

        _createWorkPlaceModel: function (aWorkPlaces) {
          var oWorkPlaceModel = new sap.ui.model.json.JSONModel();
          oWorkPlaceModel.setData({
            WorkPlaces: aWorkPlaces
          });
          this.getView().setModel(oWorkPlaceModel, "WorkPlaceModel");
          let aWorkPlacesData = oWorkPlaceModel.getData().WorkPlaces;
          let aWorkOrder = this.getView().getModel("WorkOrderModel").getData();
          let idCuadrilla = aWorkPlacesData.find(e => e.Gewrk === aWorkOrder.Gewrk);
          if (idCuadrilla.Tcuad === "LI") {
            this.getView().byId("orderDefectsCrit").setVisible(false);
          } else {
            this.getView().byId("orderDefectsCrit").setVisible(true);
          }
        },

        formatDate: function (dDate) {
          return Formatter.formatDate(dDate);
        },

        getNullCriticyDefects: function (aDefects) {
          let sEmplazamiento = this.getView().getModel("WorkOrderModel").getProperty("/Emplazamiento");
          let aCritDefects = _.filter(aDefects, {
            Maintloc: sEmplazamiento
          });
          return {
            Emplazamiento: sEmplazamiento,
            CritDefects: aCritDefects,
            Quantity: aCritDefects.length
          };
        },

        onLocSetSuccess: function (aDefects) {
          let aMaintLocDefects = aDefects.pop();
          let oModel = this.getView().getModel("WorkOrderModel");
          let aWorkPlacesData = this.getView().getModel("WorkPlaceModel").getData().WorkPlaces;
          let aWorkOrder = this.getView().getModel("WorkOrderModel").getData();
          let idCuadrilla = aWorkPlacesData.find(e => e.Gewrk === aWorkOrder.Gewrk);
          aDefects = [].concat(...aDefects);
          let aAllDefects = {
            defects: {
              defectsByNullCriticy: idCuadrilla.Tcuad !== "LI" ? [this.getNullCriticyDefects(aMaintLocDefects)] : [],
              defectsByLocation: [],
              defectsByOrder: [{
                OrderNumber: this._iWorkOrder,
                Defects: aDefects.filter(x => x.Aufnr == this._iWorkOrder || x.Asignar == this._iWorkOrder),
                NumberOfDefectsOnOrder: aDefects.filter(x => x.Aufnr == this._iWorkOrder || x.Asignar == this._iWorkOrder).length
              }]
            }
          };
          for (let sLocation of this._aTechLocations) {
            var oLocation = {
              EquipmentCode: sLocation,
              EquipmentDescription: sLocation,
              Defects: aDefects.filter(x => x.Btpln == sLocation && x.Asignar === ""),
              NumberOfDefectsOnEquipment: aDefects.filter(x => x.Btpln == sLocation && x.Asignar === "").length
            };
            aAllDefects.defects.defectsByLocation.push(oLocation);
          }
          if (aAllDefects.defects.defectsByLocation.length) {
            oModel.setProperty("/Equipments", {
              Busy: true,
              Array: aAllDefects.defects.defectsByLocation
            });
          }
          if (aAllDefects.defects.defectsByOrder.length) {
            oModel.setProperty("/DefectsByOrder", {
              Busy: true,
              Array: aAllDefects.defects.defectsByOrder
            });
          }
          if (aAllDefects.defects.defectsByNullCriticy.length) {
            oModel.setProperty("/DefectsByNullCriticy", {
              Quantity: aAllDefects.defects.defectsByNullCriticy[0].Quantity,
              Busy: true,
              Array: aAllDefects.defects.defectsByNullCriticy
            });
          }
          if (!aAllDefects.defects.length) {
            oModel.setProperty("/Equipments/Busy", false);
          }
        },

        onLocSetError: function (oErr) {
          //TODO: Realizar tratamiento de excepciones.
          MessageBox.warning(oErr);
        },

        _isVisiblePoints: function (sStartPoint, sEndPoint) {
          return sStartPoint && sEndPoint ? true : false;
        },

        _onDefectPress: function (oEvent) {
          let sWoFinished = this.getView().getModel("WorkOrderModel").getProperty("/Estado");
          if (sWoFinished !== "FI") {
            let oListItem = oEvent.getParameters().listItem;
            let oDefect = oListItem.getBindingContext("WorkOrderModel").getObject();
            LocalStorage.setCurrentWorkOrder(this._iWorkOrder);
            this._oRouter.navTo("NewDefectStation", {
              defectId: oDefect.Qmnum
            });
          } else {
            Dialog.openMsgDialog({
              title: "Alerta",
              content: new sap.m.Text({
                text:
                  "No se puede realizar la operación debido a que la orden está finalizada"
              }),
              models: [],
              styleClasses: ["MessageDialog"]
            });
          }
        },

        formatLongText: function (sLongText) {
          return Formatter.formatLongText(sLongText);
        },

        _onDefectsBindingFinish: function (oEvent) {
          Panel.setExpandEvents(oEvent);
          this.getView().getModel("WorkOrderModel").setProperty("/Equipments/Busy", false);
        },

        _onDefectsBindingFinishOrder: function (oEvent) {
          Panel.setExpandEvents(oEvent);
          this.getView().getModel("WorkOrderModel").setProperty("/DefectsByOrder/Busy", false);
        },

        _verifyIfDefectsHaveContent: function (oParent) {
          var oParentContent = oParent.getContent();
          if (
            oParentContent.length > 0 &&
            oParentContent[0].getContent().length > 0
          )
            return oParent.getContent()[0].getContent()[0];
          else return false;
        },

        //Funciones para los filtros de búsqueda
        _onFilterSearch: function () {
          let oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/Equipments/Busy", true);
          //Si la cuadrilla es de tipo LI (linea) no mostrar los defectos del emplazamiento
          let aWorkOrder = oModel.getData();
          let aWorkPlacesData = this.getView().getModel("WorkPlaceModel").getData().WorkPlaces;
          let idCuadrilla = aWorkPlacesData.find(e => e.Gewrk === aWorkOrder.Gewrk);
          //Arrays para guardar los elementos de la búsqueda encontrados
          let aFilteredDataEmpl = [];
          let aFilteredDataEquip = [];
          let aFilteredDataOrder = [];
          let aSearchedItemsEmpl = [];
          let aSearchedItemsEquip = [];
          let aSearchedItemsOrder = [];
          let aDataEmplazamiento = [];
          let aDataDefectosOrden = [];
          let aDataDefectosEquipos = [];
          let aDescLowerCase = []; //Para convertir todas las descripciones de las listas a lower case
          //Booleano que chequea si los valores ingresados tienen letras o no
          let bContainLetters = true;
          //Capturo lo ingresado en los filtros de búsqueda
          let inputId = this.getView().getModel("FilterInputsModel").getProperty("/Id").toLowerCase();
          let inputUbicacion = this.getView().getModel("FilterInputsModel").getProperty("/Ubicacion").toLowerCase();
          let inputDesde = this.getView().getModel("FilterInputsModel").getProperty("/Desde").toLowerCase();
          let inputHasta = this.getView().getModel("FilterInputsModel").getProperty("/Hasta").toLowerCase();
          let inputDescripcion = this.getView().getModel("FilterInputsModel").getProperty("/Descripcion").toLowerCase();
          //Modelo de datos con la data de las listas de defectos
          if (idCuadrilla.Tcuad !== "LI"){
            aDataEmplazamiento = this.getView().getModel("WorkOrderModel").getData().DefectsByNullCriticy.Array[0].CritDefects
          }
          aDataDefectosOrden = this.getView().getModel("WorkOrderModel").getData().DefectsByOrder.Array[0].Defects
          aDataDefectosEquipos = this.getView().getModel("WorkOrderModel").getData().Equipments.Array[0].Defects
          //Busco la info
          if (inputId !== "") {
            //QNUM (ID)
            bContainLetters = /[a-z]/i.test(inputId);
            if (inputId.length > 2 && bContainLetters === false) {
              //Lista de defectos del emplazamiento
              if (aDataEmplazamiento.length !== 0 && idCuadrilla.Tcuad !== "LI") {
                aSearchedItemsEmpl = aDataEmplazamiento.filter(e => e.Qmnum.includes(inputId));
                aSearchedItemsEmpl.forEach(function (item) {
                  aFilteredDataEmpl.push(item);
                });
              }
              //Lista de defectos de la orden
              if (aDataDefectosOrden.length !== 0) {
                aSearchedItemsOrder = aDataDefectosOrden.filter(e => e.Qmnum.includes(inputId));
                aSearchedItemsOrder.forEach(function (item) {
                  aFilteredDataOrder.push(item);
                });
              }
              //Lista de defectos del equipo
              if (aDataDefectosEquipos.length !== 0) {
                aSearchedItemsEquip = aDataDefectosEquipos.filter(e => e.Qmnum.includes(inputId));
                aSearchedItemsEquip.forEach(function (item) {
                  aFilteredDataEquip.push(item);
                });
              }
            } else {
              MessageBox.warning("Debe ingresar al menos tres caracteres.");
            }
          } 
          if (inputUbicacion !== "") {
            //BTPLN (UBICACION)
            bContainLetters = /[a-z]/i.test(inputUbicacion);
            if (inputUbicacion.length > 2 && bContainLetters === true) {
              inputUbicacion = inputUbicacion.toUpperCase();
              //Lista de defectos del emplazamiento
              if (aDataEmplazamiento.length !== 0 && idCuadrilla.Tcuad !== "LI") {
                aSearchedItemsEmpl = aDataEmplazamiento.filter(e => e.Btpln.includes(inputUbicacion));
                aSearchedItemsEmpl.forEach(function (item) {
                  aFilteredDataEmpl.push(item);
                });
              }
              //Lista de defectos de la orden
              if (aDataDefectosOrden.length !== 0) {
                aSearchedItemsOrder = aDataDefectosOrden.filter(e => e.Btpln.includes(inputUbicacion));
                aSearchedItemsOrder.forEach(function (item) {
                  aFilteredDataOrder.push(item);
                });
              }
              //Lista de defectos del equipo
              if (aDataDefectosEquipos.length !== 0) {
                aSearchedItemsEquip = aDataDefectosEquipos.filter(e => e.Btpln.includes(inputUbicacion));
                aSearchedItemsEquip.forEach(function (item) {
                  aFilteredDataEquip.push(item);
                });
              }
            } else {
              MessageBox.warning("Debe ingresar al menos tres caracteres.");
            }
          } 
          if (inputDesde !== "") {
            //DESDE (MARKER START)
            bContainLetters = /[a-z]/i.test(inputDesde);
            if (bContainLetters === false) {  
              //Lista de defectos del emplazamiento
              if (aDataEmplazamiento.length !== 0 && idCuadrilla.Tcuad !== "LI") {
                aSearchedItemsEmpl = aDataEmplazamiento.filter(e => e.MarkerStart.includes(inputDesde));
                aSearchedItemsEmpl.forEach(function (item) {
                  aFilteredDataEmpl.push(item);
                });
              }
              //Lista de defectos de la orden
              if (aDataDefectosOrden.length !== 0) {
                aSearchedItemsOrder = aDataDefectosOrden.filter(e => e.MarkerStart.includes(inputDesde));
                aSearchedItemsOrder.forEach(function (item) {
                  aFilteredDataOrder.push(item);
                });
              }
              //Lista de defectos del equipo
              if (aDataDefectosEquipos.length !== 0) {
                aSearchedItemsEquip = aDataDefectosEquipos.filter(e => e.MarkerStart.includes(inputDesde));
                aSearchedItemsEquip.forEach(function (item) {
                  aFilteredDataEquip.push(item);
                });
              }
            } else {
              MessageBox.warning("Debe ingresar sólo números.");
            }
          } 
          if (inputHasta !== "") {
            //HASTA (MARKER END)
            bContainLetters = /[a-z]/i.test(inputHasta);
            if (bContainLetters === false) {
              //Lista de defectos del emplazamiento
              if (aDataEmplazamiento.length !== 0 && idCuadrilla.Tcuad !== "LI") {
                aSearchedItemsEmpl = aDataEmplazamiento.filter(e => e.MarkerEnd.includes(inputHasta));
                aSearchedItemsEmpl.forEach(function (item) {
                  aFilteredDataEmpl.push(item);
                });
              }
              //Lista de defectos de la orden
              if (aDataDefectosOrden.length !== 0) {
                aSearchedItemsOrder = aDataDefectosOrden.filter(e => e.MarkerEnd.includes(inputHasta));
                aSearchedItemsOrder.forEach(function (item) {
                  aFilteredDataOrder.push(item);
                });
              }
              //Lista de defectos del equipo
              if (aDataDefectosEquipos.length !== 0) {
                aSearchedItemsEquip = aDataDefectosEquipos.filter(e => e.MarkerEnd.includes(inputHasta));
                aSearchedItemsEquip.forEach(function (item) {
                  aFilteredDataEquip.push(item);
                });
              }
            } else {
              MessageBox.warning("Debe ingresar sólo números.");
            } 
          }
          if (inputDescripcion !== "") {
            //DESCRIPCION (QMTXT)
            bContainLetters = /[a-z]/i.test(inputDescripcion);
            if (inputDescripcion.length > 2 && bContainLetters === true) {
              //Lista de defectos del emplazamiento
              if (aDataEmplazamiento.length !== 0 && idCuadrilla.Tcuad !== "LI") {
                aDescLowerCase = aDataEmplazamiento.map(item => ({
                  ...item,
                  Qmtxt: item.Qmtxt.toLowerCase()
                }));
                aSearchedItemsEmpl = aDescLowerCase.filter(e => e.Qmtxt.includes(inputDescripcion));
                aSearchedItemsEmpl.forEach(function (item) {
                  aFilteredDataEmpl.push(item);
                });
              }
              //Lista de defectos de la orden
              if (aDataDefectosOrden.length !== 0) {
                aDescLowerCase = aDataDefectosOrden.map(item => ({
                  ...item,
                  Qmtxt: item.Qmtxt.toLowerCase()
                }));
                aSearchedItemsOrder = aDescLowerCase.filter(e => e.Qmtxt.includes(inputDescripcion));
                aSearchedItemsOrder.forEach(function (item) {
                  aFilteredDataOrder.push(item);
                });
              }
              //Lista de defectos del equipo
              if (aDataDefectosEquipos.length !== 0) {
                aDescLowerCase = aDataDefectosEquipos.map(item => ({
                  ...item,
                  Qmtxt: item.Qmtxt.toLowerCase()
                }));
                aSearchedItemsEquip = aDescLowerCase.filter(e => e.Qmtxt.includes(inputDescripcion));        
                aSearchedItemsEquip.forEach(function (item) {
                  aFilteredDataEquip.push(item);
                });
              }
            } else {
              MessageBox.warning("Debe ingresar al menos tres caracteres.");
            } 
          }
          //Refresco la vista con los resultados de la busqueda/s
          if (aFilteredDataEmpl.length !== 0) {
            this.getView().getModel("WorkOrderModel").setProperty("/DefectsByNullCriticy/Array/0/CritDefects", aFilteredDataEmpl);
            this.getView().getModel("WorkOrderModel").setProperty("/PanelCriticityExpand", true);
          }
          if (aFilteredDataOrder.length !== 0) {
            this.getView().getModel("WorkOrderModel").setProperty("/DefectsByOrder/Array/0/Defects", aFilteredDataOrder);
            this.getView().getModel("WorkOrderModel").setProperty("/PanelOrderDefectsExpand", true);
          } 
          if (aFilteredDataEquip.length !== 0) {
            this.getView().getModel("WorkOrderModel").setProperty("/Equipments/Array/0/Defects", aFilteredDataEquip);
            this.getView().getModel("WorkOrderModel").setProperty("/PanelEquipmentExpand", true);
          }
          if (aFilteredDataEmpl.length === 0 && aFilteredDataEquip.length === 0 && aFilteredDataOrder.length === 0) {
            MessageBox.warning("No hay resultados para su búsqueda.");
          }
          oModel.setProperty("/Equipments/Busy", false);
        },

        _onClearFilters: function () {
          let oModel = this.getView().getModel("WorkOrderModel");
          oModel.setProperty("/Equipments/Busy", true);
          //Inputs de búsqueda
          this.getView().getModel("FilterInputsModel").setProperty("/Id", "");
          this.getView().getModel("FilterInputsModel").setProperty("/Ubicacion", "");
          this.getView().getModel("FilterInputsModel").setProperty("/Desde", "");
          this.getView().getModel("FilterInputsModel").setProperty("/Hasta", "");
          this.getView().getModel("FilterInputsModel").setProperty("/Descripcion", "");
          //Seteo paneles contraidos
          oModel.setProperty("/PanelCriticityExpand", false);
          oModel.setProperty("/PanelOrderDefectsExpand", false);
          oModel.setProperty("/PanelEquipmentExpand", false);
          //Refresco el modelo
          this._initializeWorkOrderModel();
          oModel.setProperty("/Equipments/Busy", false);
        }

      }
    );
  }
);
