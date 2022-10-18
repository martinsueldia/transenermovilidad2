sap.ui.define([], function () {
    "use strict";

    return {
        getUser: function () {
            return localStorage.getItem("user_logged");
        },

        setUser: function (sUser) {
            localStorage.setItem("user_logged", sUser);
        },

        deleteUser: function () {
            localStorage.removeItem("user_logged");
        },

        doDeleteRegistration: function (fnSuccess, fnError) {
            sap.Logon.core.deleteRegistration(fnSuccess, fnError);
        },

        doLoadStartPage: function () {
            sap.Logon.core.loadStartPage();
        },

        errorDeleteRegistration: function (e) {
            //TODO: Realizar tratamiento de excepciones.
            console.log(e);
        },

        getUserName: function (fnUserNameSuccess, fnUserNameError){
            sap.Settings.getConfigProperty(fnUserNameSuccess, fnUserNameError, "UserName");
        }

    };

});