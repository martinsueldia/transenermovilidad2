sap.ui.define([], function() {
	"use strict";
	return {
        _oPanelActive: null,

        setPanelActive: function (oPanel) {
            this._oPanelActive = oPanel
        },

        getPanelActive: function () {
            return this._oPanelActive;
        },

		setItemPanelActive: function(oPanel, aListPanel, bExpanded) {
	        if(bExpanded) {
                this._collapseAllPanels(oPanel, aListPanel);
                this.setPanelActive(oPanel);
                oPanel.addStyleClass("panel-expanded");
            } else {
	            oPanel.removeStyleClass("panel-expanded");
            }
		},

        _collapseAllPanels: function (oPanelActive, aListPanel) {
            aListPanel.getItems().forEach((oListItem) => {
                oListItem.getContent().forEach((oContent) => {
                    if(oContent.getMetadata().getName() == "sap.m.Panel" && oContent != oPanelActive) {
                        oContent.setExpanded(false);
                        oContent.removeStyleClass("panel-expanded");
                    }
                });
            });
        },

        setExpandEvents: function (oEvent) {
            try {
                var oList = oEvent.getSource();
                var aListItem = oList.getItems();
                for (var i = 0; i < aListItem.length; i++) {
                    var oContent = aListItem[i].getContent();
                    oContent.forEach((content) => {
                        if (content.getMetadata().getName() === "sap.m.Panel"){
                            var oHeaderToolBar = content.getHeaderToolbar();
                            if (oHeaderToolBar.aBindParameters) {
                                oHeaderToolBar.detachBrowserEvent("click", this._onClickPanel);
                            }
                            oHeaderToolBar.attachBrowserEvent("click", this._onClickPanel);
                        }
                    });    
                }
            }
            catch (e) {
                //TODO: Hacer tratamiento de excepciones.
            }
        },

        _onClickPanel: function (){
            this.getParent().setExpanded(!this.getParent().getExpanded());
        }

	};
});