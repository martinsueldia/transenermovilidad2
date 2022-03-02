sap.ui.define([
    "TransenerMovilidad/lib/odata-querybuilder.min",
], function (Xrm) {
    "use strict";

    return {

        _buildQueryOdata: function (sServiceUri, sEntity, sColumns, sExpand, oFilter, sOrderBy, iSkip, iTop) {
            return (new window.Xrm.oData.QueryBuilder(sServiceUri)
                    .setEntity(sEntity)
                    .setColumns(sColumns)
                    .setExpand(sExpand)
                    .setFilters(oFilter)
                    .setOrders(sOrderBy)
                    .setSkip(iSkip)
                    .setTop(iTop)
            ).toString();
        },

        read: function (sServiceUri, sEntity, sColumns, sExpand, oFilter, sOrderBy, iSkip, iTop) {
            return new Promise((resolve, reject) => {
                iSkip = iSkip ? iSkip : 0;
                iTop = iTop ? iTop : 0;
                sOrderBy = sOrderBy ? sOrderBy : "";
                sColumns = sColumns ? sColumns : "";
                sExpand = sExpand ? sExpand : "";
                OData.read(
                    this._buildQueryOdata(
                        sServiceUri, sEntity, sColumns, sExpand, oFilter, sOrderBy, iSkip, iTop
                    ),
                    (response) => {
                        resolve(response)
                    },
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

    }

});
