sap.ui.jsview("TransenerMovilidad.view.workPlace.workPlaceSelector.workPlaceSelector", {

    getControllerName: function () {
        return "TransenerMovilidad.view.workPlace.workPlaceSelector.workPlaceSelector";
    },
    //testxD&&
    createContent: function (oController) {
        return new sap.m.Page({
            width: "100%",
            showHeader: false,
            content: [
                new sap.m.VBox({
                    width: "100%",
                    height: "100%",
                    justifyContent: sap.m.FlexJustifyContent.start,
                    alignItems: sap.m.FlexAlignItems.Center,
                    items: [
                        new sap.m.HBox({
                            justifyContent: sap.m.FlexJustifyContent.start,
                            alignItems: sap.m.FlexAlignItems.Center,
                            items: [
                                new sap.m.Image({
                                    src: "./img/logo-transener.svg",
                                    width: "250px"
                                }).addStyleClass("sapUiSmallMarginEnd").addStyleClass("sapUiLargeMarginTop"),
                                new sap.m.Image({
                                    src: "./img/logo-transba.svg",
                                    width: "250px"
                                }).addStyleClass("sapUiSmallMarginBegin").addStyleClass("sapUiLargeMarginTop")
                            ]
                        }).addStyleClass("sapUiLargeMarginTop").addStyleClass("contentLogosWorkPlaceSelector"),
                        new sap.m.Text({
                            text: "{i18n>SelectPlace}"
                        }).addStyleClass("sapUiMediumMarginTop").addStyleClass("font-blue").addStyleClass("font-bold"),
                        new sap.m.Select({
                            id: this.createId("workplaceSelect"),
                            width: "550px",
                            forceSelection: false,
                            valueState: "{WorkPlaceSelectState>/ErrorState}",
                            change: [oController.onWorkPlaceSelectionChange, oController],
                            items: {
                                path: "WorkPlace>/WorkPlace",
                                template: new sap.ui.core.ListItem({
                                    key: "{WorkPlace>Arbpl}",
                                    text: "{WorkPlace>GewrkKtext}"
                                })
                            }
                        }).addStyleClass("sapUiSmallMarginTop").addStyleClass("inputWorkPlaceSelector"),
                        new sap.m.Button({
                            width: "550px",
                            text: "{i18n>Confirm}",
                            press: [oController.onWorkPlaceSelectionConfirm, oController]
                        }).addStyleClass("btnWorkPlaceSelector"),
                        new sap.m.Button({
                            width: "550px",
                            text: "{i18n>CloseSession}",
                            press: [oController.closeSession, oController]
                        }).addStyleClass("btnWorkPlaceSelector sapUiSmallMarginTop")
                    ]
                }),
            ]
        }).addStyleClass("WorkPlaceSelector");
    }

});