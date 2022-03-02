sap.ui.define([
    "TransenerMovilidad/helpers/dialog",
    "TransenerMovilidad/services/masterDataService",
    "sap/ui/core/mvc/Controller"
], function (Dialog, MasterDataService, Controller) {

    "use strict";
    //
    return Controller.extend("TransenerMovilidad.view.defects.dialog.dialog", {
        _onPressItem: function (oEvent) {
            let oSelected = oEvent.getSource().getBindingContext("TechnicalLocations").getObject();
            let oDefectModel = this.getView().getModel("NewDefect");
            let oCatalogsModel = this.getView().getModel("Catalogs");
            let oValidationModel = this.getView().getModel("ValidationModel");
            oValidationModel.setProperty("/stateBtpln", sap.ui.core.ValueState.None);
            oDefectModel.setProperty("/IsEditable", false);
            oDefectModel.setProperty("/Btpln", oSelected.Id);
            oCatalogsModel.setProperty("/Catalogs", oSelected.Parts);

            this.createMarkerService(oSelected.Id);
        },

        createMarkerService: function (sBtpln) {
            MasterDataService.getMarkers(sBtpln).then((oData) => {
                this.getView().getModel("MarkersModel").setData({
                    Markers: oData.results
                });
                this.getView().getModel("MarkersModel").setProperty("/Markers",oData.results);
                Dialog.close();
            }).catch((error) => {
                Dialog.close();
            })
        },

        onAfterRendering: function () {
            let oView = this.getView();
            let oTableResults = oView.byId("results");
            let sBindingPath = oView.getModel("TechnicalLocations").getProperty("/bindingPath");

            oTableResults.bindItems({
                "path": 'TechnicalLocations>/' + sBindingPath,
                "sorter": new sap.ui.model.Sorter("Id"),
                "template": new sap.m.ColumnListItem({
                    type: sap.m.ListType.Navigation,
                    press: [this._onPressItem, this],
                    cells: [
                        new sap.m.Text({
                            text: "{TechnicalLocations>Id}"
                        }),
                        new sap.m.Text({
                            text: "{TechnicalLocations>Description}"
                        })
                    ]
                })
            });
        }
    });
});