sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "TransenerMovilidad/helpers/panel-control",
        "TransenerMovilidad/helpers/dialog",
        "TransenerMovilidad/helpers/formatter",
        "TransenerMovilidad/services/workOrderService",
        "TransenerMovilidad/services/masterDataService",
        "TransenerMovilidad/helpers/geolocation",
        "TransenerMovilidad/helpers/log",
        "TransenerMovilidad/helpers/SQLite",
        "TransenerMovilidad/helpers/dataAccess",
        "TransenerMovilidad/helpers/busyDialog",
        "TransenerMovilidad/helpers/file",
        "TransenerMovilidad/helpers/workOrderHelper",
        "TransenerMovilidad/helpers/signature"
    ],
    function (
        Controller,
        History,
        Panel,
        Dialog,
        Formatter,
        WorkOrderService,
        MasterDataService,
        Geolocation,
        LogHelper,
        SQLite,
        DataAccessHelper,
        BusyDialogHelper,
        FileHelper,
        WOHelper,
        SignatureHelper
    ) {
        "use strict";

        return Controller.extend(
            "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.workOrderOperations", {
                _iWorkOrder: 0,
                oRouter: null,
                _fnFinishOT: null,

                _woIsFinished: function (sStatus) {
                    return WOHelper.workOrderIsFinished(sStatus);
                },

                onInit: function () {
                    this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    this.oRouter
                        .getRoute("WorkOrderDetail")
                        .attachPatternMatched(this._onObjectMatched, this);
                },

                _openDailyReport: function () {
                    Dialog.openCustomDialog({
                            title: "Reporte Diario",
                            styleClasses: ["DialogDailyReport"],
                            content: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.dailyReport.dailyReport",
                            models: [],
                            buttons: [
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    press: function () {
                                        Dialog.close();
                                    }
                                })
                            ]
                        },
                        this.getView()
                    );
                },

                _onObjectMatched: function (oEvent) {
                    var oArgs = oEvent.getParameter("arguments");
                    let oQuery = oArgs["?query"];
                    this._iWorkOrder = oArgs.workOrderId;

                    if (oQuery.tab == "OperationsDetail") {
                        this._initializeModels();
                    } else {
                        this._cleanModels();
                    }
                },

                _cleanModels: function () {
                    var oModel = this.getView().getModel("WorkOrderModel");
                    oModel.setProperty("/Operations", []);
                },

                _onOperationExpand: function (oEvent) {
                    var oItemPanel = oEvent.getSource();
                    var oListPanel = oItemPanel.getParent().getParent();
                    var bExpanded = oEvent.getParameter("expand");
                    try {
                        Panel.setItemPanelActive(oItemPanel, oListPanel, bExpanded);
                    } catch (e) {
                        //TODO: hacer tratamiento de excepciones
                    }
                },

                _createDailyEndOperationModel: function () {
                    let oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                        initDate: new Date(),
                        endDate: null,
                        LicenseNumber: "",
                        LegacyNumber: ""
                    });
                    this.getView().setModel(oModel, "EndDailyOperationModel");
                },

                _createDailyEndSignatureModel: function () {
                    let oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                        Legacy: "",
                        Signature: ""
                    });
                    this.getView().setModel(oModel, "SignatureModelDailyEnd");
                },

                _initializeModels: function () {
                    let oModel = this.getView().getModel("WorkOrderModel");
                    oModel.setProperty("/Operations/Busy", true);
                    this._getOperations();
                    this._getMasterStatusOp();
                    this._createDailyEndOperationModel();
                    this._createDailyEndSignatureModel();
                },

                _setEmptyNotification: function (oOper) {
                    oOper.Notification = {
                        NotificationNumber: "",
                        NotificationText: "",
                        WorkOrderNumber: oOper.WorkOrderNumber,
                        OperationNumber: oOper.OperationNumber,
                        SubOperationNumber: oOper.SubOperationNumber
                    };
                },

                _getNotificationByOper: function (oOperation, aNotifications) {
                    let aNotificationsFiltered = aNotifications.filter(
                        x =>
                            !x.SubOperationNumber &&
                            x.OperationNumber == oOperation.OperationNumber
                    );

                    if (!aNotificationsFiltered.length)
                        this._setEmptyNotification(oOperation);
                    else oOperation.Notification = aNotificationsFiltered[0];

                    for (var i = 0; i < oOperation.SubOperations.length; i++) {
                        aNotificationsFiltered = aNotifications.filter(
                            x =>
                                x.SubOperationNumber ==
                                oOperation.SubOperations[i].SubOperationNumber &&
                                x.OperationNumber == oOperation.SubOperations[i].OperationNumber
                        );
                        if (!aNotificationsFiltered.length)
                            this._setEmptyNotification(oOperation.SubOperations[i]);
                        else
                            oOperation.SubOperations[i].Notification =
                                aNotificationsFiltered[0];
                    }
                },

                _onSuccessDocumentUpload: function (oDocument) {
                    Geolocation.getGeolocation(
                        oGeoLocation => {
                            LogHelper.createLog(
                                oDocument,
                                oGeoLocation,
                                "UPLOAD_FILE_OPERATION"
                            );
                        },
                        () => {
                            console.log("Error al obtener localizacion");
                        }
                    );

                    ////testss
                    BusyDialogHelper.close();
                    Dialog.openMsgDialog({
                        title: "Éxito",
                        content: new sap.m.Text({
                            text: "Se ha subido el archivo de manera correcta"
                        }),
                        models: [],
                        styleClasses: ["MessageDialog"]
                    });
                },

                _onErrorDocumentUpload: function () {
                    Dialog.openMsgDialog({
                        title: "Error",
                        content: new sap.m.Text({
                            text: "Se ha producido un error al subir el archivo"
                        }),
                        models: [],
                        styleClasses: ["MessageDialog"]
                    });
                },

                _onSelectFiles: function (oEvent) {
                    //TODO mandar de id file un generado que el indice sea el array.

                    //
                    BusyDialogHelper.open();
                    let oFile = oEvent.getParameters().files[0];
                    oEvent.getSource().setValue("");
                    FileHelper.readBinaryString(oFile, sBinary => {
                        WorkOrderService.getWOAttachments(this._iWorkOrder).then((aAttachments) => {
                            let iAttachment = aAttachments.results.length + 1;
                            let oDocument = {
                                Aufnr: this._iWorkOrder,
                                Error: "",
                                Idfile: iAttachment.toString(),
                                Filebin: sBinary,
                                Filename: oFile.name
                            };
                            WorkOrderService.postWOAttachments(oDocument)
                                .then($.proxy(this._onSuccessDocumentUpload, this, oDocument))
                                .catch(this._onErrorDocumentUpload, this);
                        }).catch(() => {
                            this._onErrorDocumentUpload();
                        });
                    });
                },

                _getMasterStatusOp: function () {
                    MasterDataService.getOpStatusSet(true).then(
                        $.proxy(this._onSuccessStatusOp, this),
                        $.proxy(this._onErrorStatusOp, this)
                    );
                },

                _onSuccessStatusOp: function (aStatusOp) {
                    this._createModelStatusOp(aStatusOp.results);
                },

                _onErrorStatusOp: function (oErr) {
                    console.log(oErr);
                },

                _createModelStatusOp: function (aStatusOp) {
                    let aSorted = _.sortBy(aStatusOp, ['Estat']);
                    let oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                        StatusOp: aSorted
                    });
                    this.getView().setModel(oModel, "ModelStatusOp");
                },

                _getOperations: function () {
                    let aSQLQueriesToSearch = [{
                        column: "AUFNR",
                        value: this._iWorkOrder
                    }];
                    let aPromises = [
                        WorkOrderService.getOperations(this._iWorkOrder),
                        WorkOrderService.getNotifications(this._iWorkOrder),
                        WorkOrderService.getMeasurePoints(this._iWorkOrder),
                        DataAccessHelper.getSQLiteRows(
                            "NOTIFICATIONS",
                            [],
                            true,
                            aSQLQueriesToSearch,
                            false
                        ),
                        DataAccessHelper.getSQLiteRows(
                            "MEASURE_POINTS",
                            [],
                            true,
                            aSQLQueriesToSearch,
                            false
                        )
                    ];

                    Promise.all(aPromises).then(
                        ([
                             aOperations,
                             aNotifications,
                             aMeasurePoints,
                             oSqlResultSetNotification,
                             oSqlResultSetMeasurePoints
                         ]) => {
                            this._mergeNotificationComments(
                                aNotifications,
                                oSqlResultSetNotification
                            );
                            this._mergeMeasurePoints(
                                aMeasurePoints,
                                oSqlResultSetMeasurePoints
                            );
                            this._createModelOperations(
                                aOperations,
                                aNotifications,
                                aMeasurePoints
                            );
                        }
                    );
                },

                _mergeMeasurePoints: function (
                    aMeasurePoints,
                    oSqlResultSetMeasurePoints
                ) {
                    for (let i = 0; i < oSqlResultSetMeasurePoints.length; i++) {
                        let oSqlMeasurePoint = oSqlResultSetMeasurePoints.item(i);
                        aMeasurePoints.find(oMeasurePoint => {
                            if (
                                oMeasurePoint.MeasurementPoint ===
                                oSqlMeasurePoint.MEASUREMENT_POINT &&
                                oMeasurePoint.Aufnr === oSqlMeasurePoint.AUFNR &&
                                oMeasurePoint.Vornr === oSqlMeasurePoint.VORNR &&
                                oMeasurePoint.Iupoz === oSqlMeasurePoint.IUPOZ &&
                                oSqlMeasurePoint.MEASUREMENT_POINT ===
                                oMeasurePoint.MeasurementPoint &&
                                oMeasurePoint.Mdocm === oSqlMeasurePoint.MDOCM
                            ) {
                                oMeasurePoint.RecordedValue = oSqlMeasurePoint.RECORDED_VALUE;
                            }
                        });
                    }
                },

                _isNotificationOfflineSaved: function (
                    aNotifications,
                    oSqlNotification
                ) {
                    return aNotifications.find(oNotification => {
                        if (
                            oNotification.WorkOrderNumber === oSqlNotification.AUFNR &&
                            oNotification.SubOperationNumber === oSqlNotification.IUPOZ &&
                            oNotification.OperationNumber === oSqlNotification.VORNR
                        ) {
                            oNotification.NotificationText =
                                oSqlNotification.NOTIFICATION_TEXT;
                            return true;
                        }
                        return false;
                    });
                },

                _mergeNotificationComments: function (aNotifications, oSqlResultSet) {
                    let oNotification;
                    for (let i = 0; i < oSqlResultSet.length; i++) {
                        let oSqlNotification = oSqlResultSet.item(i);
                        if (
                            !this._isNotificationOfflineSaved(
                                aNotifications,
                                oSqlNotification
                            )
                        ) {
                            oNotification = this._getNotificationStructure();
                            oNotification.NotificationText =
                                oSqlNotification.NOTIFICATION_TEXT;
                            oNotification.WorkOrderNumber = oSqlNotification.AUFNR;
                            oNotification.OperationNumber = oSqlNotification.VORNR;
                            oNotification.SubOperationNumber = oSqlNotification.IUPOZ;
                            aNotifications.push(oNotification);
                        }
                    }
                },

                _getOperationStructure: function (oOper) {
                    return {
                        NotificationNumber: oOper.Rueck,
                        WorkOrderNumber: oOper.Aufnr,
                        OperationNumber: oOper.Vornr,
                        OperationDescription: oOper.Ltxa1,
                        CountSubOperations: 0,
                        Equipment: {
                            EquipmentCode: oOper.Tplnr,
                            EquipmentDescription: oOper.Pltxt
                        },
                        OperationStatus: oOper.Estat,
                        SubOperations: []
                    };
                },

                _getSubOperationStructure: function (oOper, oSubOper, aMeasurePoint) {
                    return {
                        NotificationNumber: oSubOper.Rueck,
                        WorkOrderNumber: oOper.WorkOrderNumber,
                        OperationNumber: oOper.OperationNumber,
                        SubOperationNumber: oSubOper.Iupoz,
                        SubOperationDescription: oSubOper.Ltxa1,
                        Aufpl: oSubOper.Aufpl,
                        Status: oSubOper.Estat,
                        MeasurePoints: this._getFormatterMeasurePoints(aMeasurePoint)
                    };
                },
                //ssssss
                _getFormatterMeasurePoints: function (aMeasurePoint) {
                    for (let oMeasurePoint of aMeasurePoint) {
                        if (oMeasurePoint.RecordedValue) {
                            oMeasurePoint.RecordedValue = Number(oMeasurePoint.RecordedValue);
                        }
                    }
                    return aMeasurePoint;
                },
                _onMeasurePointPress: function (oEvent) {
                    let oOperation = oEvent.getSource();

                    Dialog.openCustomDialog({
                            title: "Informe de punto de medida",
                            content: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.inputPopup.inputPopup",
                            buttons: [
                                new sap.m.Button({
                                    icon: "sap-icon://accept",
                                    press: $.proxy(this._saveMeasurePoint, this)
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    press: () => {
                                        Dialog.close();
                                    }
                                })
                            ],
                            styleClasses: ["MeasurePointDialog"]
                        },
                        oOperation
                    );
                },

                _saveMeasurePoint: function (oEvent) {
                    Dialog.close();
                    let aMeasurePoints = oEvent
                        .getSource()
                        .getBindingContext("WorkOrderModel")
                        .getObject().MeasurePoints;
                    DataAccessHelper.handleMeasurePoints(
                        aMeasurePoints,
                        $.proxy(this._onMeasurePointSaveSuccess, this),
                        $.proxy(this._onMeasurePointSaveError, this)
                    );
                },

                _onMeasurePointSaveSuccess: function () {
                    Dialog.openMsgDialog({
                            title: "Exito",
                            content: new sap.m.Text({
                                text: "Puntos de medida guardados correctamente"
                            }),
                            models: [],
                            styleClasses: ["MessageDialog"]
                        },
                        () => {
                            this._getOperations();
                        }
                    );
                },

                _onMeasurePointSaveError: function () {
                    Dialog.openMsgDialog({
                        title: "Error",
                        content: new sap.m.Text({
                            text: "Ha ocurrido un error al guardar los puntos de medida"
                        }),
                        models: [],
                        styleClasses: ["MessageDialog"]
                    });
                },

                _getSubOperationsByOper: function (
                    oOperation,
                    aOperations,
                    aMesaurePoints
                ) {
                    let aMeasurePointsByOperation;
                    let aSubOperations = aOperations.filter(
                        x => x.Vornr == oOperation.OperationNumber && x.Iupoz
                    );

                    for (let oSubOper of aSubOperations) {
                        aMeasurePointsByOperation = aMesaurePoints.filter(
                            x => x.Vornr == oSubOper.Vornr && x.Iupoz == oSubOper.Iupoz
                        );
                        oOperation.SubOperations.push(
                            this._getSubOperationStructure(
                                oOperation,
                                oSubOper,
                                aMeasurePointsByOperation
                            )
                        );
                    }
                    oOperation.CountSubOperations = oOperation.SubOperations.length;
                },

                _countOperationsAndSuboperations: function (aOperations) {
                    let iNumberOfSubOperationsAndOperations = 0;
                    for (let i = 0; i < aOperations.length; i++) {
                        // conteo de operacion
                        if (
                            aOperations[i].Notification &&
                            aOperations[i].IsFinalNotif !== "X"
                        ) {
                            iNumberOfSubOperationsAndOperations =
                                iNumberOfSubOperationsAndOperations + 1;
                        }

                        // aOperations[i].SubOperations.filter((sub) => { return sub.IsFinalNotif !== "X" })

                        // conteo de suboperaciones con isfnialnotif
                        iNumberOfSubOperationsAndOperations =
                            iNumberOfSubOperationsAndOperations +
                            this.countSubOperationsFinalNotif(aOperations[i].SubOperations);
                    }
                    return iNumberOfSubOperationsAndOperations;
                },

                countSubOperationsFinalNotif: function (aSubOperations) {
                    let iCount = 0;
                    for (let i = 0; i < aSubOperations.length; i++) {
                        if (
                            aSubOperations[i].Notification &&
                            aSubOperations[i].Notification.IsFinalNotif !== "X"
                        ) {
                            iCount = iCount + 1;
                        }
                    }
                    return iCount;
                },

                _countMeasurePoints: function (aOperations) {
                    let iNumberOfMeasurePoints = 0;
                    for (let i = 0; i < aOperations.length; i++) {
                        if (
                            aOperations[i].Notification &&
                            aOperations[i].Notification.IsFinalNotif !== "X"
                        ) {
                            iNumberOfMeasurePoints =
                                iNumberOfMeasurePoints +
                                this.getMeasurePointsCount(aOperations[i].SubOperations);
                        }
                    }
                    return iNumberOfMeasurePoints;
                },

                getMeasurePointsCount: function (aSubOperations) {
                    let iCount = 0;
                    for (let i = 0; i < aSubOperations.length; i++) {
                        iCount = iCount + aSubOperations[i].MeasurePoints.length;
                    }
                    return iCount;
                },

                _createModelOperations: function (
                    aOperations,
                    aNotifications,
                    aMeasurePoints
                ) {
                    let aOperationsModel = [];
                    let oWorkOrderModel = this.getView().getModel("WorkOrderModel");
                    for (let oOperation of aOperations) {
                        if (!oOperation.Iupoz) {
                            oOperation = this._getOperationStructure(oOperation);
                            this._getSubOperationsByOper(
                                oOperation,
                                aOperations,
                                aMeasurePoints
                            );
                            this._getNotificationByOper(oOperation, aNotifications);
                            aOperationsModel.push(oOperation);
                        }
                    }

                    this._orderOperations(aOperationsModel);
                    this._orderSubOperations(aOperationsModel);

                    if (aOperationsModel.length) {
                        oWorkOrderModel.refresh(true);
                        oWorkOrderModel.setProperty("/Operations", {
                            Busy: true,
                            Array: aOperationsModel,
                            NumberOfOperationsAndSuboperationsPending: this._countOperationsAndSuboperations(
                                aOperationsModel
                            ),
                            NumberOfMeasurePointsPending: this._countMeasurePoints(
                                aOperationsModel
                            )
                        });
                    } else {
                        this.getView()
                            .getModel("WorkOrderModel")
                            .setProperty("/Operations/Busy", false);
                    }
                },

                _orderOperations: function (aOperationsModel) {
                    var sProp = "OperationNumber";
                    aOperationsModel.sort(this._sorter(sProp));
                },

                _orderSubOperations: function (aOperationsModel) {
                    var sProp = "SubOperationNumber";
                    for (var i = 0; i < aOperationsModel.length; i++) {
                        aOperationsModel[i].SubOperations.sort(this._sorter(sProp));
                    }
                },

                _sorter: function (sProp) {
                    return function (oFirstOperation, oSecondOperation) {
                        return (
                            parseFloat(oFirstOperation[sProp]) -
                            parseFloat(oSecondOperation[sProp])
                        );
                    };
                },

                _isOperation: function (
                    WorkOrderNumber,
                    OperationNumber,
                    SubOperationNumber
                ) {
                    return WorkOrderNumber && OperationNumber && !SubOperationNumber;
                },

                isValidForChange: function (oSubOperation) {
                    let oNotification = oSubOperation.Notification;
                    let oWorkOrder = this.getView()
                        .getModel("WorkOrderModel")
                        .getData();
                    return (
                        oNotification.IsFinalNotif !== "X" ||
                        oNotification.Status === "E0012" ||
                        oNotification.Status === "E0011" ||
                        oWorkOrder.Estado === ""
                    );
                },

                _massiveStatusChange: function (aSubOperations) {
                    let oSubOperation = aSubOperations.shift();
                    if (oSubOperation) {
                        if (this.isValidForChange(oSubOperation)) {
                            WorkOrderService.getOperations(
                                oSubOperation.WorkOrderNumber,
                                oSubOperation.OperationNumber,
                                oSubOperation.SubOperationNumber
                            ).then(oOperation => {
                                let oOperationChanged = oOperation[0];
                                oOperationChanged.Estat = this._sNewStatus;
                                WorkOrderService.updateOperationStatus(oOperationChanged)
                                    .then(
                                        $.proxy(
                                            this._onUpdateStatusSuccess,
                                            this,
                                            true,
                                            oOperationChanged
                                        )
                                    )
                                    .catch($.proxy(this._onUpdateStatusError, this));
                            });
                        } else {
                            this._massiveStatusChange(this._aSubOperations);
                        }
                    } else {
                        BusyDialogHelper.close();
                        Dialog.openMsgDialog({
                                title: "Exito",
                                content: new sap.m.Text({
                                    text: "Se ha realizado el cambio de estado para todas las suboperaciones de manera correcta"
                                }),
                                models: [],
                                styleClasses: ["MessageDialog"]
                            },
                            () => {
                                this._getOperations();
                            }
                        );
                    }
                },

                singleStatusChange: function (oWorkOrder, sNewStatus) {
                    WorkOrderService.getOperations(
                        oWorkOrder.WorkOrderNumber,
                        oWorkOrder.OperationNumber,
                        oWorkOrder.SubOperationNumber
                    ).then(oOperation => {
                        let oOperationChanged = oOperation[0];
                        oOperationChanged.Estat = sNewStatus;
                        WorkOrderService.updateOperationStatus(oOperationChanged)
                            .then(
                                $.proxy(
                                    this._onUpdateStatusSuccess,
                                    this,
                                    false,
                                    oOperationChanged
                                )
                            )
                            .catch($.proxy(this._onUpdateStatusError, this));
                    });
                },

                _onOpStatusChange: function (oEvent) {
                    BusyDialogHelper.open();
                    let oWorkOrder = oEvent
                        .getSource()
                        .getBindingContext("WorkOrderModel")
                        .getObject();
                    let sNewStatus = oEvent.getParameters().selectedItem.getKey();
                    if (
                        this._isOperation(
                            oWorkOrder.WorkOrderNumber,
                            oWorkOrder.OperationNumber,
                            oWorkOrder.SubOperationNumber
                        )
                    ) {
                        this._sNewStatus = sNewStatus;
                        let oOperation = $.extend(true, {}, oWorkOrder);
                        this._aSubOperations = $.extend(true, [], oWorkOrder.SubOperations);
                        this._aSubOperations.push(oOperation);
                        this._massiveStatusChange(this._aSubOperations);
                    } else {
                        this.singleStatusChange(oWorkOrder, sNewStatus);
                    }
                },

                handleSQLiteSubStatus: function (
                    oOperationChanged,
                    fnCallbackSuccess,
                    fnCallbackError
                ) {
                    DataAccessHelper.handleSubStatus(
                        [
                            oOperationChanged.Aufnr,
                            oOperationChanged.Iupoz,
                            oOperationChanged.Vornr,
                            "",
                            oOperationChanged.Estat
                        ],
                        fnCallbackSuccess,
                        fnCallbackError
                    );
                },

                createStatusLog: function (oOperationChanged) {
                    Geolocation.getGeolocation(
                        oGeoLocation => {
                            LogHelper.createLog(
                                oOperationChanged,
                                oGeoLocation,
                                "UPDATE_SUBOPERATION_STATUS"
                            );
                        },
                        () => {
                            console.log("Error al obtener localizacion");
                        }
                    );
                },

                _onUpdateStatusSuccess: function (isRecursive, oOperationChanged) {
                    this.handleSQLiteSubStatus(
                        oOperationChanged,
                        () => {
                            if (!isRecursive) {
                                BusyDialogHelper.close();
                                this._getOperations();
                            } else {
                                this._massiveStatusChange(this._aSubOperations);
                            }
                        },
                        () => {
                            console.log("error. . . ");
                        }
                    );
                    this.createStatusLog(oOperationChanged);
                },

                _onUpdateStatusError: function () {
                    console.log("error!");
                },

                successInsertComment: function () {
                    Dialog.openMsgDialog({
                            title: "Exito",
                            content: new sap.m.Text({
                                text: "Se ha realizado el comentario de manera correcta"
                            }),
                            models: [],
                            styleClasses: ["MessageDialog"]
                        },
                        () => {
                            this._getOperations();
                        }
                    );
                },

                errorInsertComment: function () {
                    console.log("error Coment FINAll");
                },

                _postNotificationOperation: function (oEvent) {
                    Dialog.close();
                    let oWorkOrder = oEvent
                        .getSource()
                        .getBindingContext("WorkOrderModel")
                        .getObject();
                    let oNotification = oWorkOrder.Notification;
                    let sStatus = oWorkOrder.Status ? oWorkOrder.Status : "";
                    let sSubOperationNumber = oNotification.SubOperationNumber ?
                        oNotification.SubOperationNumber :
                        "";

                    DataAccessHelper.handleComment(
                        [
                            oNotification.WorkOrderNumber,
                            sSubOperationNumber,
                            oNotification.OperationNumber,
                            oNotification.NotificationText,
                            sStatus
                        ],
                        $.proxy(this.successInsertComment, this),
                        $.proxy(this.errorInsertComment, this)
                    );
                },

                _rowFormatter: function (sValue, oControl) {
                    this._updateClassRow(sValue, oControl.getParent());
                    return sValue;
                },

                _updateClassRow: function (sValue, oControl) {
                    switch (sValue) {
                        case "E0005":
                        case "E0006":
                            oControl.addStyleClass("acceptedRow");
                            oControl.removeStyleClass("rejectedRow");
                            break;
                        case "E0007":
                        case "E0008":
                        case "E0009":
                        case "E0010":
                            oControl.addStyleClass("rejectedRow");
                            oControl.removeStyleClass("acceptedRow");
                            break;
                        case "":
                        case "E0011":
                        case "E0012":
                            oControl.removeStyleClass("acceptedRow");
                            oControl.removeStyleClass("rejectedRow");
                    }
                },

                openNotificationDialog: function (oEvent) {
                    let oControl = oEvent.getSource();
                    Dialog.openCustomDialog({
                            title: "Notificación",
                            styleClasses: ["MessageDialogNotif"],
                            content: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.notificationDialog.notificationDialog",
                            buttons: [
                                new sap.m.Button({
                                    visible: {
                                        parts: [
                                            "WorkOrderModel>Notification/IsFinalNotif",
                                            "WorkOrderModel>/Estado"
                                        ],
                                        formatter: function (sIsFinalNotif, sStatus) {
                                            return sIsFinalNotif !== "X" && sStatus !== "FI";
                                        }
                                    },
                                    icon: "sap-icon://accept",
                                    press: $.proxy(this._postNotificationOperation, this)
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    press: () => {
                                        Dialog.close();
                                    }
                                })
                            ]
                        },
                        oControl
                    );
                },

                _onOperationsBindingFinish: function (oEvent) {
                    Panel.setExpandEvents(oEvent);
                    this.getView()
                        .getModel("WorkOrderModel")
                        .setProperty("/Operations/Busy", false);
                },

                _isDailyEndValid: function () {
                    let oModelDailyEnd = this.getView().getModel(
                        "EndDailyOperationModel"
                    );
                    return (
                        oModelDailyEnd.getProperty("/initDate") !== null &&
                        oModelDailyEnd.getProperty("/endDate") !== null &&
                        oModelDailyEnd.getProperty("/LicenseNumber") !== ""
                    );
                },

                _isFinishOTValid: function () {
                    let oModelDailyEnd = this.getView().getModel(
                        "EndDailyOperationModel"
                    );
                    return (
                        oModelDailyEnd.getProperty("/initDate") !== null &&
                        oModelDailyEnd.getProperty("/endDate") !== null &&
                        oModelDailyEnd.getProperty("/LicenseNumber")
                    );
                },

                _postFinishOTDialog: function () {
                    if (this._isFinishOTValid()) {
                        Dialog.close();
                        SignatureHelper.openSignatureDialog(
                            $.proxy(this.handleDailyEnd, this),
                            this.getView()
                        );
                    } else {
                        Dialog.openMsgDialog({
                                title: "Error",
                                content: new sap.m.Text({
                                    text: "Fecha de inicio, fecha de fin y numero de licencia requeridos"
                                }),
                                models: [],
                                styleClasses: ["MessageDialog"]
                            },
                            () => {
                            }
                        );
                    }
                },

                _postEndDailyOperation: function () {
                    if (this._isDailyEndValid()) {
                        Dialog.close();
                        SignatureHelper.openSignatureDialog(
                            $.proxy(this.handleDailyEnd, this),
                            this.getView()
                        );
                    } else {
                        Dialog.openMsgDialog({
                                title: "Error",
                                content: new sap.m.Text({
                                    text: "Fecha de inicio, fecha de fin y numero de licencia requeridas"
                                }),
                                models: [],
                                styleClasses: ["MessageDialog"]
                            },
                            () => {
                            }
                        );
                    }
                },

                errorGetSQLiteNotifications: function (error) {
                    console.log(error);
                },

                _getNotificationPromise: function (oNotification) {
                    return new Promise((resolve, reject) => {
                        WorkOrderService.postSubOperationComment(oNotification)
                            .then(() => {
                                resolve();
                            })
                            .catch(reject);
                    });
                },

                _getNotificationStructure: function () {
                    return {
                        NotificationCont: "",
                        NotificationNumber: "",
                        NotificationText: "",
                        WorkOrderNumber: "",
                        OperationNumber: "",
                        SubOperationNumber: "",
                        Complete: "",
                        IsFinalNotif: "",
                        ExecStartDate: "",
                        ExecFinDate: ""
                    };
                },

                handleSignatureInformation: function (oNotification, aSignatures) {
                    for (let i = 0; i < aSignatures.length; i++) {
                        let iIndex = i + 1;
                        oNotification["Firma" + iIndex] = aSignatures[i]["Signature"];
                        oNotification["Legajo" + iIndex] = aSignatures[i]["Legacy"];
                        oNotification["Nombre" + iIndex] = aSignatures[i]["Name"];
                    }
                },

                createMeasurePointPromise: function (oMeasurePoint) {
                    Geolocation.getGeolocation(
                        (oGeoLocation) => {
                            LogHelper.createLog(oMeasurePoint, oGeoLocation, "MEASURE");
                        },
                        (e) => {
                            console.log("Error al obtener localizacion");
                            console.log(e);
                        }
                    );


                    return new Promise((resolve, reject) => {
                        WorkOrderService.postMeasurePoints(oMeasurePoint).then(() => {
                            resolve();
                        }).catch((e) => {
                            console.log("error al procesar puntos de medida")
                            console.log(e);
                            reject();
                        })
                    });
                },

                processMeasurePoints: function () {
                    let aMeasurePointsPromise = [];
                    DataAccessHelper.getSQLiteRows("MEASURE_POINTS", [], true, [], false)
                        .then(oSqlMeasurePointsResultSet => {
                            for (let i = 0; i < oSqlMeasurePointsResultSet.length; i++) {
                                let oSqlMeasurePoint = oSqlMeasurePointsResultSet.item(i);
                                let oMeasurePoint = {
                                    Aufnr: oSqlMeasurePoint.AUFNR,
                                    Sincro: oSqlMeasurePoint.SINCRO,
                                    Mdocm: oSqlMeasurePoint.MDOCM,
                                    MeasurementPoint: oSqlMeasurePoint.MEASUREMENT_POINT,
                                    SecondaryIndex: oSqlMeasurePoint.SECONDARY_INDEX,
                                    Vornr: oSqlMeasurePoint.VORNR,
                                    Iupoz: oSqlMeasurePoint.IUPOZ,
                                    ReadingDate: oSqlMeasurePoint.READING_DATE,
                                    ReadingTime: oSqlMeasurePoint.READING_TIME,
                                    ShortText: oSqlMeasurePoint.SHORT_TEXT,
                                    RecordedValue: Number(oSqlMeasurePoint.RECORDED_VALUE),
                                    RecordedUnit: oSqlMeasurePoint.RECORDED_UNIT,
                                    WorkOrderObjectnr: oSqlMeasurePoint.WO_OBJECT_NUMBER,
                                    Reader: oSqlMeasurePoint.READER
                                };

                                    oMeasurePoint.Mdocm = Formatter.getTimeString();
                                    aMeasurePointsPromise.push(
                                        this.createMeasurePointPromise(oMeasurePoint)
                                    );
                                    DataAccessHelper.addMeasurePointsDeleteObjects(oMeasurePoint);

                            }
                            this._finishMeasurePointsPromise(aMeasurePointsPromise);
                        })
                        .catch(() => {
                            console.log("al obtener los puntos de medida de SQLITE");
                        });
                },

                _finishMeasurePointsPromise: function (aMeasurePointsPromise) {
                    DataAccessHelper.executeTransaction()
                        .then(() => {
                            Promise.all(aMeasurePointsPromise)
                                .then($.proxy(this.successDailyEnd, this))
                                .catch($.proxy(this.errorDailyEnd, this));
                        })
                        .catch(err => {
                            console.log(err);
                        });
                },

                _finishNotificationPromise: function (aNotificationObjects, aSignatures) {
                    var oNotification = aNotificationObjects.shift();
                    if (oNotification) {
                        this._getNotificationPromise(oNotification).then(() => {
                            this._finishNotificationPromise(aNotificationObjects, aSignatures)
                        }).catch(() => {
                            this._finishNotificationPromise(aNotificationObjects, aSignatures)
                        })
                    } else {
                        let oDailyEndObject = this.getView()
                            .getModel("EndDailyOperationModel")
                            .getData();
                        let oNotificationGeneral = {
                            NotificationCont: "",
                            NotificationNumber: Formatter.getTimeString(),
                            NotificationText: "",
                            WorkOrderNumber: this._iWorkOrder,
                            OperationNumber: "",
                            SubOperationNumber: "",
                            Complete: true,
                            IsFinalNotif: "X",
                            ExecStartDate: oDailyEndObject.initDate,
                            ExecFinDate: oDailyEndObject.endDate,
                            Licencia: oDailyEndObject.LicenseNumber
                        }
                        this.handleSignatureInformation(oNotificationGeneral, aSignatures);

                        this._getNotificationPromise(oNotificationGeneral).then(() => {
                            DataAccessHelper.executeTransaction()
                                .then(() => {
                                    this.processMeasurePoints();
                                })
                                .catch(() => {
                                    this.errorDailyEnd();
                                });
                        });
                    }
                },

                postDailyEndToOffline: function (aSignatures, oSqlResultSet) {
                    Dialog.close();
                    let oDailyEndObject = this.getView()
                        .getModel("EndDailyOperationModel")
                        .getData();
                    let aNotificationObjects = [];
                    for (let i = 0; i < oSqlResultSet.length; i++) {
                        let oSqlNotification = oSqlResultSet.item(i);
                        let oNotification = {
                            NotificationCont: "00000001",
                            NotificationNumber: Formatter.getTimeString(),
                            NotificationText: oSqlNotification.NOTIFICATION_TEXT,
                            WorkOrderNumber: oSqlNotification.AUFNR,
                            OperationNumber: oSqlNotification.VORNR,
                            SubOperationNumber: oSqlNotification.IUPOZ,
                            Complete: oSqlNotification.SUBSTATUS !== "E0011",
                            IsFinalNotif: oSqlNotification.SUBSTATUS === "E0011" ||
                            oSqlNotification.SUBSTATUS === "" ||
                            oSqlNotification.SUBSTATUS === "E0012" ?
                                "" : "X",
                            ExecStartDate: oDailyEndObject.initDate,
                            ExecFinDate: oDailyEndObject.endDate,
                            Licencia: oDailyEndObject.LicenseNumber
                        };
                        if (oNotification.IsFinalNotif === "X") {
                            //todo is this the real deal?
                            if (oNotification.NotificationText !== "") {
                                this.handleSignatureInformation(oNotification, aSignatures);
                                aNotificationObjects.push(
                                    oNotification
                                );
                                DataAccessHelper.addNotificationDeleteObjects(oNotification);
                            }
                        }
                    }
                    ////
                    this._finishNotificationPromise(aNotificationObjects, aSignatures);
                },

                handleDailyEnd: function (aSignatures) {
                    BusyDialogHelper.open();
                    DataAccessHelper.getSQLiteRows("NOTIFICATIONS", [], true, [], false)
                        .then($.proxy(this.postDailyEndToOffline, this, aSignatures))
                        .catch($.proxy(this.errorGetSQLiteNotifications, this));
                },

                successDailyEnd: function () {
                    if (!this._fnFinishOT) {
                        Geolocation.getGeolocation(
                            oGeoLocation => {
                                LogHelper.createLog({
                                        Aufnr: this._iWorkOrder
                                    },
                                    oGeoLocation,
                                    "DAILY_END"
                                );
                            },
                            () => {
                                console.log("Error al obtener localizacion");
                            }
                        );
                        this._createDailyEndOperationModel();
                        BusyDialogHelper.close();
                        Dialog.openMsgDialog({
                                title: "Exito",
                                content: new sap.m.Text({
                                    text: "Se ha realizado el fin diario de manera exitosa"
                                }),
                                models: [],
                                styleClasses: ["MessageDialog"]
                            },
                            () => {
                                this._getOperations();
                            }
                        );
                    } else {
                        BusyDialogHelper.close();
                        this._fnFinishOT();
                    }
                },

                errorDailyEnd: function () {
                    BusyDialogHelper.close();
                    Dialog.openMsgDialog({
                            title: "Error",
                            content: new sap.m.Text({
                                text: "Se ha producido un error al realizar el fin diario"
                            }),
                            models: [],
                            styleClasses: ["MessageDialog"]
                        },
                        () => {
                        }
                    );
                },

                cleanEndDailyOperationModel: function () {
                    this.getView()
                        .getModel("EndDailyOperationModel")
                        .setProperty("/endDate", null);
                    this.getView()
                        .getModel("EndDailyOperationModel")
                        .setProperty("/LicenseNumber", "");
                    this.getView()
                        .getModel("EndDailyOperationModel")
                        .setProperty("/LegacyNumber", "");
                },

                handleRegistersToDailyEnd: function (
                    oSqlResultSet,
                    oSqlResultSetMeasurePoints
                ) {
                    if (
                        oSqlResultSet.item(0)["COUNT(*)"] === 0 &&
                        oSqlResultSetMeasurePoints.item(0)["COUNT(*)"] === 0
                    ) {
                        Dialog.openMsgDialog({
                                title: "Alerta",
                                content: new sap.m.Text({
                                    text: "No se realizaron modificaciones en la orden para hacer el fin diario"
                                }),
                                models: [],
                                styleClasses: ["MessageDialog"]
                            },
                            () => {
                            }
                        );
                    } else {
                        this.cleanEndDailyOperationModel();
                        this.openDailyEndDialog();
                    }
                },

                openDailyEndDialog: function () {
                    Dialog.openCustomDialog({
                            title: "Fin diario de operación",
                            styleClasses: ["MessageDialogDailyEnd"],
                            content: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.endDailyOperationDialog.endDailyOperationDialog",
                            models: [],
                            buttons: [
                                new sap.m.Button({
                                    icon: "sap-icon://accept",
                                    press: $.proxy(this._postEndDailyOperation, this)
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    press: function () {
                                        Dialog.close();
                                    }
                                })
                            ]
                        },
                        this.getView()
                    );
                },

                _openFinishOTDialog: function () {
                    this.cleanEndDailyOperationModel();
                    Dialog.openCustomDialog({
                            title: "Fin diario de operación",
                            styleClasses: ["MessageDialogDailyEnd"],
                            content: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.finishOTDialog.finishOTDialog",
                            models: [],
                            buttons: [
                                new sap.m.Button({
                                    icon: "sap-icon://accept",
                                    press: $.proxy(this._postFinishOTDialog, this)
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    press: function () {
                                        Dialog.close();
                                    }
                                })
                            ]
                        },
                        this.getView()
                    );
                },

                _endDailyOperation: function () {
                    this._fnFinishOT = null;
                    let aPromises = [];
                    aPromises.push(
                        DataAccessHelper.getSQLiteRows("NOTIFICATIONS", [], false, [], true)
                    );
                    aPromises.push(
                        DataAccessHelper.getSQLiteRows(
                            "MEASURE_POINTS",
                            [],
                            false,
                            [],
                            true
                        )
                    );
                    Promise.all(aPromises)
                        .then(([oResultSetNotifications, oResultSetMeasurePoints]) => {
                            this.handleRegistersToDailyEnd(
                                oResultSetNotifications,
                                oResultSetMeasurePoints
                            );
                        })
                        .catch($.proxy(this.errorGetSQLiteNotifications, this));
                },

                getWorkOrderListItemAndUpdate: function () {
                    return WorkOrderService.getWOFromList(this._iWorkOrder)
                        .then(aList => {
                            let oList = aList.results.shift();
                            oList.Estado = "FI";
                            WorkOrderService.updateList(oList);
                        })
                        .catch(e => {
                            console.log(e);
                        });
                },

                handleFinishOT: function () {
                    this._fnFinishOT = () => {
                        this.finishOT();
                    };
                    this._openFinishOTDialog();
                },

                finishOT: function () {
                    let oWorkOrder = this.getView()
                        .getModel("WorkOrderModel")
                        .getData();
                    let oModelDailyEnd = this.getView().getModel(
                        "EndDailyOperationModel"
                    );
                    let aPromises = [];
                    oWorkOrder.Estado = "FI";
                    oWorkOrder.Legajo = oModelDailyEnd.getProperty("/LegacyNumber");
                    aPromises.push(WorkOrderService.updateOTStatus(oWorkOrder));
                    aPromises.push(this.getWorkOrderListItemAndUpdate(this._iWorkOrder));
                    Promise.all(aPromises)
                        .then($.proxy(this.successFinishOT, this))
                        .catch($.proxy(this.errorFinishOT, this));
                },

                openAttachmentList: function () {
                    Dialog.openCustomDialog({
                            title: "Lista de adjuntos",
                            styleClasses: ["DialogDailyReport"],
                            content: "TransenerMovilidad.view.workOrder.workOrderDetail.workOrderOperations.attachmentList.attachmentList",
                            models: [],
                            buttons: [
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    press: function () {
                                        Dialog.close();
                                    }
                                })
                            ]
                        },
                        this.getView()
                    );
                },

                _back: function () {
                    let oHistory = History.getInstance();
                    let sPreviousHash = oHistory.getPreviousHash();

                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    }
                },

                successFinishOT: function () {
                    Geolocation.getGeolocation(
                        oGeoLocation => {
                            LogHelper.createLog({
                                    Aufnr: this._iWorkOrder
                                },
                                oGeoLocation,
                                "FINISH_OT"
                            );
                        },
                        () => {
                            console.log("Error al obtener localizacion");
                        }
                    );
                    Dialog.openMsgDialog({
                            title: "Alerta",
                            content: new sap.m.Text({
                                text: "Se ha hecho cerrado la OT de manera exitosa"
                            }),
                            models: [],
                            styleClasses: ["MessageDialog"]
                        },
                        $.proxy(this._back, this)
                    );
                },

                errorFinishOT: function (error) {
                    console.log("error", error);
                },

                _operationWithIncompleteStatus: function (sStatus) {
                    return sStatus === "" || sStatus === "E0011" || sStatus === "E0012";
                },

                //todo obtener todas las operaciones, ver si la operacion tiene is final notif.
                // armar array vacio
                // pushear si tiene,
                // luego obtener todas las suboperaciones y filtrarlas por isFinalNotif.
                // concatenar al array principal, si da 0 significa que no tengo notif pendientes, si tiene length mostrar error
                _validOperationsAndSuboperations: function () {
                    let aOperations = this.getView()
                        .getModel("WorkOrderModel")
                        .getData().Operations.Array;
                    let aIncorrectOperations = [];
                    for (let oOperation of aOperations) {
                        if (
                            oOperation.Notification &&
                            oOperation.Notification.IsFinalNotif !== "X" &&
                            !this._operationWithIncompleteStatus(oOperation.OperationStatus)
                        ) {
                            aIncorrectOperations.push(oOperation);
                        }

                        let aSubOperationsNotFinished = oOperation.SubOperations.filter(
                            oSubOperation => {
                                return (
                                    !oSubOperation.Notification.IsFinalNotif &&
                                    oSubOperation.Notification.IsFinalNotif !== "X" &&
                                    !this._operationWithIncompleteStatus(oSubOperation.Status)
                                );
                            }
                        );
                        aIncorrectOperations = aIncorrectOperations.concat(
                            aSubOperationsNotFinished
                        );
                    }
                    return aIncorrectOperations.length === 0;
                },

                //todo validar sql
                _validMeasurePoints: function () {
                    let aOperations = this.getView()
                        .getModel("WorkOrderModel")
                        .getData().Operations.Array;
                    for (let oOperation of aOperations) {
                        for (let oSubOperation of oOperation.SubOperations) {
                            if (oSubOperation.Status !== "E0007" && oSubOperation.Status !== "E0008") {
                                if (oSubOperation.MeasurePoints.some(oMeasurePoint => oMeasurePoint.RecordedValue === "")) {
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                },

                getMessageForOTClosing: function () {
                    let aOperations = this.getView()
                        .getModel("WorkOrderModel")
                        .getData().Operations.Array;
                    let aOperationsAndSubWithIncompleteStatus = [];
                    for (let oOperation of aOperations) {
                        if (
                            this._operationWithIncompleteStatus(oOperation.OperationStatus)
                        ) {
                            aOperationsAndSubWithIncompleteStatus.push(oOperation);
                        }
                        let aSubOperationsWithIncoplete = oOperation.SubOperations.filter(
                            oSubOperation => {
                                return this._operationWithIncompleteStatus(
                                    oSubOperation.Status
                                );
                            }
                        );
                        aOperationsAndSubWithIncompleteStatus = aOperationsAndSubWithIncompleteStatus.concat(
                            aSubOperationsWithIncoplete
                        );
                    }

                    return aOperationsAndSubWithIncompleteStatus.length === 0 ?
                        "¿Está seguro que desea dar por finalizada la OT Nº " +
                        this._iWorkOrder +
                        " ? " :
                        "Hay operaciones y suboperaciones no completadas, deséa dar el cierre de la O.T N° " +
                        this._iWorkOrder +
                        " ?";
                },

                openEndWorkOrderDialog: function () {
                    if (this._validMeasurePoints()) {
                        let sMessage = this.getMessageForOTClosing();

                        Dialog.openConfirmDialog({
                                title: "Finalizar OT",
                                content: new sap.m.Text({
                                    text: sMessage
                                }),
                                models: []
                            },
                            $.proxy(this.handleFinishOT, this)
                        );
                    } else {
                        Dialog.openMsgDialog({
                                title: "Alerta",
                                content: new sap.m.Text({
                                    text: "Se necesitan agregar todos los puntos de medidas en las suboperaciones para poder realizar el cierre de la O.T"
                                }),
                                models: [],
                                styleClasses: ["MessageDialog"]
                            },
                            () => {
                            }
                        );
                    }
                }
            }
        );
    }
);