sap.ui.define([], function () {
    "use strict";

    return {
        workOrderIsFinished: function (sStatus) {
            return sStatus !== "FI";
        }



    };

});