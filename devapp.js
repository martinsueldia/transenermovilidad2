jQuery.sap.declare("TransenerMovilidad.devapp");
jQuery.sap.require("TransenerMovilidad.devlogon");

TransenerMovilidad.devapp = {
    smpInfo: {},
    //the variable hold TransenerMovilidad.devlogon instance
    devLogon: null,

    //Application Constructor
    initialize: function () {
        this.bindEvents();
    },

    //========================================================================
    // Bind Event Listeners
    //========================================================================
    bindEvents: function () {
        //add an event listener for the Cordova deviceReady event.
        document.addEventListener("deviceready", jQuery.proxy(this.onDeviceReady, this), false);
    },

    startApp: function (context) {
        new sap.ui.core.ComponentContainer({
            component: sap.ui.getCore().createComponent({
                id: "App",
                name: "TransenerMovilidad",
                height: "100%"
            })
        }).placeAt("content");
    },

    //========================================================================
    //Cordova Device Ready
    //========================================================================
    onDeviceReady: function () {
        if (window.sap_webide_FacadePreview) {
            this.startApp();
        } else {
            var that = this;
            $.getJSON("project.json", function (data) {
                if (data && data.hybrid && data.hybrid.plugins.kapsel.logon.selected) {
                    that.smpInfo.server = data.hybrid.msType === 0 ? data.hybrid.hcpmsServer : data.hybrid.server;
                    that.smpInfo.port = data.hybrid.msType === 0 ? "443" : data.hybrid.port;
                    that.smpInfo.appID = data.hybrid.appid;
                }
                if (that.smpInfo.server && that.smpInfo.server.length > 0) {
                    var context = {
                        "serverHost": that.smpInfo.server,
                        "https": data.hybrid.msType === 0 ? "true" : "false",
                        "serverPort": that.smpInfo.port,
                        "auth": [{
                            "type": "saml2.web.post",
                            "config": {
                                "saml2.web.post.authchallengeheader.name": "com.sap.cloud.security.login",
                                "saml2.web.post.finish.endpoint.uri": "/SAMLAuthLauncher",
                                "saml2.web.post.finish.endpoint.redirectparam": "finishEndpointParam"
                            }
                        }],
                        custom: {
                            hiddenFields: ["farmId", "resourcePath", "securityConfig", "serverPort", "serverHost", "https", "reg_instr_panel"],
                            copyrightMsg: ["Copyright @2018 Transener Transba.", "All rights reserved."],
                            hideLogoCopyright: false,
                            disablePasscode: true,
                            copyrightLogo: "../../../img/logo-transener.svg",
                            styleSheet: "../../../css/logon.css"
                        }
                    };
                    that.devLogon = new TransenerMovilidad.devlogon();
                    that.devLogon.doLogonInit(context, that.smpInfo.appID, (c) => {
                        localStorage.setItem("ACID", c.applicationConnectionId);
                        that.startApp();
                    });
                } else {
                    that.startApp();
                }
            });
        }
    }
};