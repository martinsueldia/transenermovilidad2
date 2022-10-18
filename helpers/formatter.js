sap.ui.define([
    "TransenerMovilidad/helpers/i18nTranslation"
], function (Translator) {
    "use strict";
    return {

        _oPhotoConfiguration: null,

        validPhoto: function () {
            if (!this._oPhotoConfiguration) {
                $.getJSON("./models/photoConfiguration.json", (oData) => {
                    this._oPhotoConfiguration = oData;
                });
            }
        },

        getFullYear: function (dDate) {
            let dd = dDate.getDate();
            let mm = dDate.getMonth() + 1;
            let yyyy = dDate.getFullYear();

            if (dd < 10) {
                dd = '0' + dd;
            }

            if (mm < 10) {
                mm = '0' + mm;
            }

            dDate = dd + "-" + mm + "-" + yyyy;
            return dDate;
        },

        getTime: function (dDate) {
            let hours = dDate.getHours();
            let ampm = hours >= 12 ? 'PM' : 'AM';
            let minutes = dDate.getMinutes();
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return hours + ':' + minutes + " " + ampm;
        },

        getDateAndTime: function (dDate) {
            return this.getFullYear(dDate);
        },

        groupBy: function (aData, fnCondition) {
            const map = new Map();
            aData.forEach((item) => {
                const key = fnCondition(item);
                const collection = map.get(key);
                if (!collection) {
                    map.set(key, [item]);
                } else {
                    collection.push(item);
                }
            });
            return map;
        },

        formatLongText: function (sLongText) {
            let aLongTextComments = sLongText.split("\\n*");
            if (aLongTextComments.length) {
                return aLongTextComments[aLongTextComments.length - 1]
            }
        },

        getTimeString: function () {
            let dDate = new Date();
            let sConfNo = dDate.getTime().toString();
            return sConfNo.substr(sConfNo.length - 10);
        },

        formatDate: function (dDate) {
            if (dDate) {
                let dDateFormatted = new Date(dDate.getTime() + dDate.getTimezoneOffset() * 60 * 1000);
                let d = new Date(dDateFormatted);
                let month = '' + (d.getMonth() + 1);
                let day = '' + d.getDate();
                let year = d.getFullYear();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;

                return [day, month, year].join('/');
            }
            return "";

        },


        formatStatus: function (sStatusCode) {
            switch (sStatusCode) {
                case "PE":
                    return Translator.getTranslation("StatusPending");
                case "FI":
                    return Translator.getTranslation("StatusFinished");
                case "EC":
                    return Translator.getTranslation("StatusStarted");
                default:
                    return Translator.getTranslation("StatusUndeterminated");
            }
        },


    };
});