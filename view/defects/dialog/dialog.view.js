sap.ui.jsview("TransenerMovilidad.view.defects.dialog.dialog", {

    getControllerName: function () {
        return "TransenerMovilidad.view.defects.dialog.dialog";
    },

    createContent: function (oController) {
        var oTableContent = new sap.m.Table({
            growing: true,
            growingThreshold: 100,
            id: this.createId("results"),
            columns: [
                new sap.m.Column({
                    header: [
                        new sap.m.Text({
                            text: "{i18n>Code}"
                        })
                    ]
                }),
                new sap.m.Column({
                    header: [
                        new sap.m.Text({
                            text: "{i18n>DescriptionDialog}"
                        })
                    ]
                })
            ]
        });

        return oTableContent;
    }
});