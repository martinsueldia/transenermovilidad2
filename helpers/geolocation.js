sap.ui.define([], function () {
    "use strict";
    return {
        getGeolocation(fnCallback, fnCallbackError) {
            navigator.geolocation.getCurrentPosition( function(o){
                fnCallback(o)
            }, function(e){
                fnCallbackError(e)
            });
        },
    };
});