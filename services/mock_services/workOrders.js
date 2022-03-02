sap.ui.define([], function() {
	"use strict";
	return {
		_oModel: {},
		_sViewId: "",

		loadModel: function(sViewId) {
			this._sViewId = sViewId;
			this._oModel = new sap.ui.model.json.JSONModel();
			this._oModel.attachRequestCompleted($.proxy(this._loadModelComplete, this));
			this._oModel.attachRequestFailed($.proxy(this._loadModelFailed, this));
			this._oModel.loadData("./mock_data/workOrderList.json");
		},

		_loadModelComplete: function() {
			sap.ui.getCore().byId(this._sViewId).setModel(this._oModel, "WorkOrderModel");
		},

		_loadModelFailed: function(oErr) {
			console.log(oErr);
		}
	};
});