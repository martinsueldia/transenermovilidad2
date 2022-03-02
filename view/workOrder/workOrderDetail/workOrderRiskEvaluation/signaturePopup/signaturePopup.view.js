sap.ui.jsview(
    "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.signaturePopup.signaturePopup",
    {
        /** Specifies the Controller belonging to this View.
         * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
         * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.view.workOrderRiskEvaluation
         */
        getControllerName: function () {
            return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.signaturePopup.signaturePopup";
        },

        /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
         * Since the Controller is given to this method, its event handlers can be attached right away.
         * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.view.workOrderRiskEvaluation
         */
        //
        createContent: function (oController) {
            return [
                new sap.m.VBox({
                    items: [
                        new sap.m.HBox({
                            items: [
                                new sap.m.Text({
                                    text: "{i18n>LegacyNumber}"
                                }).addStyleClass("sapUiTinyMarginEnd sapUiSmallMarginTop"),
                                new sap.m.Input({
                                    id: this.createId("PersonalCombobox"),
                                    selectedKey: "{SignatureModel>/Legacy}",
                                    showSuggestion: true,
                                    suggestionItems: {
                                        path: "PersonalHabilitadoModel>/Personas",
                                        template: new sap.ui.core.Item({
                                            text: {
                                                parts: [
                                                    "PersonalHabilitadoModel>Legajo",
                                                    "PersonalHabilitadoModel>Nombre",
                                                    "PersonalHabilitadoModel>Apellido"
                                                ],
                                                formatter: $.proxy(
                                                    oController.formatTextCombo,
                                                    oController
                                                )
                                            },
                                            key: "{PersonalHabilitadoModel>Legajo}"
                                        })
                                    },
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "L3 M3 S12"
                                    })
                                }),
                                new sap.m.Text({
                                    visible: false,
                                    text: "Fecha",
                                }).addStyleClass(
                                    "sapUiSmallMarginBegin sapUiTinyMarginEnd sapUiSmallMarginTop"
                                ),
                                new sap.m.DatePicker({
                                    visible: false,
                                    minDate: new Date(),
                                    dateValue: "{SignatureModel>/Fecha}",
                                    displayFormat: "dd/MM/yyyy"
                                })
                            ]
                        }).addStyleClass(
                            "sapUiTinyMarginBegin sapUiTinyMarginTop sapUiTinyMarginBottom"
                        ),
                        new sap.ui.core.HTML({
                            id: this.createId("signaturePlace"),
                            title: "{i18n>FirmeAqui}",
                            content:
                                "<canvas id='signature-pad' class='signature-pad' height='400'></canvas>"
                        })
                    ]
                })
            ];
        }
    }
);
