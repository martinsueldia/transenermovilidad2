sap.ui.jsview("TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDetail", {

    /** Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.view.workOrderDetail
     */
    getControllerName: function () {
        return "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDetail";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf TransenerMovilidad.view.workOrder.workOrderDetail.view.workOrderDetail
     */
    createContent: function (oController) {
        var oPage = new sap.m.Page({
            enableScrolling: false,
            showHeader: true,
            headerContent: [
                sap.ui.jsview("workOrderDetailHeader", "TransenerMovilidad.view.workOrder.workOrderHeader.workOrderHeader")
            ],
            subHeader: [
                new sap.m.Bar({
                    design: sap.m.BarDesign.Auto,
                    contentLeft: [
                        new sap.m.Button({
                            icon: "sap-icon://nav-back",
                            press: [oController._onBackPress, oController]
                        }).addStyleClass("sapUiTinyMarginBegin").addStyleClass("button-menu")
                    ],
                    contentMiddle: [
                        new sap.m.Text({text: "{i18n>WorkOrderNumber}"}).addStyleClass("font-bold").addStyleClass("font-white"),
                        new sap.m.Text({text: "{WorkOrderModel>/Woclass}"}).addStyleClass("font-bold").addStyleClass("font-white"),
                        new sap.m.Text({text: "{WorkOrderModel>/Aufnr}"}).addStyleClass("font-bold").addStyleClass("font-white")
                    ]
                }).addStyleClass("sub-header-background")
            ]
        }).addStyleClass("WorkOrderDetail");

        oPage.addContent(this._getIconTabControl(oController));
        return oPage;
    },

    _getIconTabControl: function (oController) {
        let oIconTabBar = new sap.m.IconTabBar({
            expandable: false,
            select: [oController._onTabSelect, oController],
            selectedKey: "{CurrentViewModel>/viewSelectedKey}"
        }).addStyleClass("bar-menu-detail");

        oIconTabBar.addItem(this._getGeneralInformationTabFilter())
        oIconTabBar.addItem(this._getAtsIconTabFilter());
        oIconTabBar.addItem(this._getOperationsIconTabFilter());
        oIconTabBar.addItem(this._getDefectsIconTabFilter());
        return oIconTabBar;
    },

    _getGeneralInformationTabFilter: function () {
        let oGeneralIconTabFilter = new sap.m.IconTabFilter({
            icon: "sap-icon://folder",
            text: "{i18n>GeneralInformation}",
            key: "GeneralInformation"
        });

        let oGeneralView = sap.ui.view({
            id: "workOrderGeneralInfo",
            viewName: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderGeneralInfo.workOrderGeneralInfo",
            async: true,
            type: sap.ui.core.mvc.ViewType.JS
        }).loaded().then((oView) => {
            oGeneralIconTabFilter.addContent(oView);
        });

        return oGeneralIconTabFilter;
    },

    _getAtsIconTabFilter: function () {
        let oAtsIconTab = new sap.m.IconTabFilter({
            icon: "sap-icon://eam-work-order",
            text: "{i18n>RiskEvaluation}",
            key: "RiskEvaluation"
        });

        let oAtsView = sap.ui.view({
            id: "workOrderRiskEvaluation",
            viewName: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderRiskEvaluation.workOrderRiskEvaluation",
            async: true,
            type: sap.ui.core.mvc.ViewType.JS
        }).loaded().then((oView) => {
            oAtsIconTab.addContent(oView);
        });

        return oAtsIconTab;
    },

    _getOperationsIconTabFilter: function () {
        let oOperationsIconTab = new sap.m.IconTabFilter({
            enabled: "{SignedModel>/isSigned}",
            icon: "sap-icon://activity-2",
            text: "{i18n>OperationsDetail}",
            key: "OperationsDetail"
        });

        let oOperationsView = sap.ui.view({
            id: "workOrderOperations",
            viewName: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.workOrderOperations",
            async: true,
            type: sap.ui.core.mvc.ViewType.JS
        }).loaded().then((oView) => {
            oOperationsIconTab.addContent(oView);
        });

        return oOperationsIconTab;
    },

    _getDefectsIconTabFilter: function () {
        let oDefectIconTab = new sap.m.IconTabFilter({
            enabled: "{SignedModel>/isSigned}",
            icon: "sap-icon://add-activity-2",
            text: "{i18n>DefectsToCorrect}",
            key: "DefectsToCorrect"
        });

        let oDefectView = sap.ui.view({
            id: "workOrderDefectsToCorrect",
            viewName: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderDefectsToCorrect.workOrderDefects",
            async: true,
            type: sap.ui.core.mvc.ViewType.JS
        }).loaded().then((oView) => {
            oDefectIconTab.addContent(oView);
        });

        return oDefectIconTab;
    }
});