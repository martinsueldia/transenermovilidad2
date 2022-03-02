sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/formatter"
  ],
  function(Controller, WorkOrderService, Formatter) {
    "use strict";

    return Controller.extend(
      "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.dailyReport.dailyReport",
      {
        onAfterRendering: function() {
          let sAufnr = this.getView()
            .getModel("WorkOrderModel")
            .getData().Aufnr;
          WorkOrderService.getDailyEndNotifications(sAufnr)
            .then($.proxy(this.successGetDailyEndNotifications, this))
            .catch($.proxy(this.errorGetDailyEndNotifications, this));
        },

        _createModel: function(aGroupedDates) {
          let aData = [];
          let oDailyReportModel = new sap.ui.model.json.JSONModel();
          for (let oDateAttributes in aGroupedDates) {
            let oDate = {
              from: aGroupedDates[oDateAttributes][0].ExecStartDate,
              to: aGroupedDates[oDateAttributes][0].ExecFinDate,
              notifications: aGroupedDates[oDateAttributes].length
            };
            aData.push(oDate);
          }
          oDailyReportModel.setData({ Reports: aData });
          this.getView().setModel(oDailyReportModel, "DailyReportModel");

          // let aData = [];
          // let oDailyReportModel = new sap.ui.model.json.JSONModel();
          // for (let oGroupedArray of aGroupedDates) {
          //     if (oGroupedArray[0] !== null) {
          //         let oObject = {
          //             from: oGroupedArray[1][0].ExecStartDate,
          //             to: oGroupedArray[0],
          //             notifications: oGroupedArray[1].length
          //         };
          //         aData.push(oObject);
          //     }
          // }
          // oDailyReportModel.setData({Reports: aData});
          // this.getView().setModel(oDailyReportModel, "DailyReportModel");
        },

        //en este success se le hace un tratamiento al array original de data traida por el servicio
        // esto debido a que las fechas son de tipo objeto y para la agrupacion hay que pasarlas a string
        // el formato de comparacion viene dado por el dd-mm-yyy hh:mm
        successGetDailyEndNotifications: function(aDailyEndOperations) {
          let aDailyOperations = $.extend([], aDailyEndOperations);
          aDailyOperations.forEach(oDailyOperation => {
            oDailyOperation.ExecStartDate = Formatter.formatDate(
              oDailyOperation.ExecStartDate
            );
            oDailyOperation.ExecFinDate = Formatter.formatDate(
              oDailyOperation.ExecFinDate
            );
          });
          // aDailyOperations.map(oElement => {
          //     if (oElement.ExecStartDate !== null && oElement.ExecFinDate !== null) {
          //         oElement.ExecStartDate = Formatter.getDateAndTime(oElement.ExecStartDate);
          //         oElement.ExecFinDate = Formatter.getDateAndTime(oElement.ExecFinDate);
          //     }
          // });
          let aGrouped = _.groupBy(aDailyOperations, oDailyOperation => {
            return oDailyOperation.ExecStartDate && oDailyOperation.ExecFinDate;
          });
          // let aGroupedDates = Formatter.groupBy(aDailyEndOperations, (oElement) => oElement.ExecStartDate && oElement.ExecFinDate);
          this._createModel(aGrouped);
        },

        errorGetDailyEndNotifications: function() {
          console.log("error");
        }
      }
    );
  }
);
