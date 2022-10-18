sap.ui.define([], function () {
    "use strict";

    return {
        cleanCompanyCode: function () {
            localStorage.removeItem("company_code");
        },

        cleanWerks: function () {
            localStorage.removeItem("Werks");
        },

        getWorkPlace: function () {
            return localStorage.getItem("WorkPlace");
        },

        setSelectedWorkOrders: function (sQuery) {
            localStorage.setItem("SelectedWorkOrders", sQuery)
        },

        getSelectedWorkOrders: function () {
            return localStorage.getItem("SelectedWorkOrders");
        },

        setWerks: function (sWerks) {
            localStorage.setItem("Werks", sWerks);
        },

        getWerks: function () {
            return localStorage.getItem("Werks");
        },

        setWorkPlace: function (sWorkPlace) {
            localStorage.setItem("WorkPlace", sWorkPlace);
        },

        deleteWorkPlace: function () {
            localStorage.removeItem("WorkPlace");
        },

        getCompanyCode: function () {
            return localStorage.getItem("company_code");
        },

        setCompanyCode: function (sCompanyCode) {
            localStorage.setItem("company_code", sCompanyCode);
        },

        getRegion: function () {
            return localStorage.getItem("region");
        },

        setRegion: function (sRegion) {
            localStorage.setItem("region", sRegion);
        },

        setSpeciality: function (sSpeciality) {
            localStorage.setItem("speciality", sSpeciality);
        },

        getSpeciality: function () {
            return localStorage.getItem("speciality");
        },

        setCurrentWorkOrder: function (sCurrentWorkOrder) {
            localStorage.setItem("currentWorkOrder", sCurrentWorkOrder);
        },

        setOrderNotifications: function (sOrderForNotifications) {
            localStorage.setItem("currentWorkOrderOperations", sOrderForNotifications);
        },

        setAttachOrders: function (aAttachOrder) {
            localStorage.setItem("AttachOrders", aAttachOrder);
        },

        getAttachOrder: function () {
            return localStorage.getItem("AttachOrders");
        },

        getCurrentWorkOrder: function () {
            return localStorage.getItem("currentWorkOrder");
        },

        getSelectedWorkOrdersOperations: function () {
            return localStorage.getItem("currentWorkOrderOperations");
        },

        setSelectedOrders: function (aOrdersSelected) {
            localStorage.setItem("selectedOrders", aOrdersSelected);
        },

        getAllOrdersSelected: function () {
            return localStorage.getItem("selectedOrders");
        },

        setAllOrders: function (aOrders) {
            localStorage.setItem("allOrders", aOrders);
        },

        getAllOrders: function () {
            return localStorage.getItem("allOrders");
        }

    };

});