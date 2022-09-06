sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "TransenerMovilidad/services/workOrderService",
    "TransenerMovilidad/helpers/formatter"
], function (Controller, WorkOrderService, Formatter) {
    "use strict";

    return Controller.extend("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.attachmentList.attachmentList", {

        onAfterRendering: function () {
            let sAufnr = this.getView().getModel("WorkOrderModel").getData().Aufnr;
            WorkOrderService.getWOAttachments(sAufnr).then($.proxy(this.successGetAttachments, this)).catch($.proxy(this.errorGetAttachments, this));
        },

        successGetAttachments: function (aAttachments) {
            let oAttachmentsModel = new sap.ui.model.json.JSONModel();
            oAttachmentsModel.setData({Attachments: aAttachments.results});
            this.getView().setModel(oAttachmentsModel, "AttachmentsModel");
        },

         _deleteWOAttachment: function (oEvent) {
             let oAttachment = oEvent.getSource().getParent().getBindingContext("AttachmentsModel").getObject();
             WorkOrderService.deleteWOAttachment(oAttachment).then( () => {
                 let sAufnr = this.getView().getModel("WorkOrderModel").getData().Aufnr;
                 WorkOrderService.getWOAttachments(sAufnr).then($.proxy(this.successGetAttachments, this)).catch($.proxy(this.errorGetAttachments, this));
             }).catch( (e) => {
                 console.log(e);
             });
         },

        errorGetAttachments: function (e) {
            console.log("error", e);
        },


    });
});
