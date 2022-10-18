sap.ui.define([], function () {
    "use strict";
    return {
        _database: null,
        _querys: [],
        _executeSqlResponses: [],

        // limpia transacciones a realizar
        cleanQueryTransactions: function () {
            this._querys = [];
        },

        // limpia responses de las 1..n executeSQL responses
        cleanSqlResponses: function () {
            this._executeSqlResponses = [];
        },

        //metodo de ejecucion de transacciones
        // el then es el success de la totalidad de las transacciones, si falla una fallan todas
        executeTransaction: function () {
            this.cleanSqlResponses();
            return new Promise((resolve, reject) => {
                this._database.transaction((tx) => {
                    for (let query of this._querys) {
                        tx.executeSql(query.query, query.object,
                            (tx, res) => {
                                this._executeSqlResponses.push({tx, res})
                            }, (tx, error) => {
                                console.log(error.message)
                            });
                    }
                }, (error) => {
                    this.cleanQueryTransactions();
                    reject(error.message);
                }, () => {
                    this.cleanQueryTransactions();
                    resolve(this._executeSqlResponses);
                });
            });
        },

        /**
         *
         * @param sTable = nombre de la tabla
         * @param aQueryToSearch = busqueda especifica
         */
        delete: function (sTable, aQueryToSearch) {
            let sWhereQuery = (aQueryToSearch.length > 0) ? "WHERE " + this._getWhereQuery(aQueryToSearch) : "";
            this._querys.push({
                query: "DELETE FROM " + sTable + " " + sWhereQuery
            })
        },

        /**
         * metodo de insercion generico
         * @param sTable = nombre de la tabla
         * @param sColumns = nombre de columnas a agregar
         * @param sData = query con (?)
         * @param aData = array de info
         */
        insert: function (sTable, aColumns, aData) {
            let sColumns = aColumns.join(",");
            let sDynamicValues = this._getDynamicValues(aColumns);
            for (let oObj of aData) {
                this._querys.push({
                    query: "INSERT INTO " + sTable + "(" + sColumns + ")" + "VALUES (" + sDynamicValues + ")",
                    object: oObj
                })
            }
        },

        /**
         *
         * @param sTable = nombre de la tabla
         * @param aColumnsToUpdate = columnas a updatear
         * @param aQueryToSearch = query de busqueda
         */
        update: function (sTable, aColumnsToUpdate, aQueryToSearch) {
            var sColumnsToChange = this._getColumnsToChange(aColumnsToUpdate);
            let sWhereQuery = (aQueryToSearch.length > 0) ? "WHERE " + this._getWhereQuery(aQueryToSearch) : "";
            this._querys.push({
                query: "UPDATE " + sTable + " SET " + sColumnsToChange + " " + sWhereQuery,
                object: []
            })
        },


        /**
         *
         * @param sTable = nombre de la tabla
         * @param aColumns = array de columnas
         * @param bAllRows = flag para hacer select de columnas mas especificos, si es true trae todo
         * @param aQuery = query de busqueda, si tiene mas de 1 va a activarse el where
         * @param countEnabled = FLAG QUE DEFINE SI QUIERO LOS REGISTROS O SOLO EL NUMERO DE REGISTROS
         */
        select: function (sTable, aColumns, bAllRows, aQuery, countEnabled) {
            let sColumns = (bAllRows) ? "*" : aColumns.join(",");
            let sWhereQuery = (aQuery.length > 0) ? "WHERE " + this._getWhereQuery(aQuery) : "";
            if (!countEnabled) {
                this._querys.push({
                    query: "SELECT " + sColumns + " " + "FROM " + sTable + " " + sWhereQuery,
                    object: []
                })
            } else {
                this._querys.push({
                    query: "SELECT COUNT(*) FROM " + sTable
                })
            }

        },


        /**
         *
         * @param aColumns = arreglo de n columnas
         * @returns {string} = retorna n (?)
         */
        _getDynamicValues: function (aColumns) {
            var aDynamicValues = []
            for (var i = 0; i < aColumns.length; i++) {
                aDynamicValues.push("?");
            }
            return aDynamicValues.join(",")
        },

        _getColumnsToChange: function (aColumnsToChange) {
            var aDynamicColumns = [];
            for (var i = 0; i < aColumnsToChange.length; i++) {
                aDynamicColumns.push(aColumnsToChange[i].column + " = " + this._getTypeOfSearch(aColumnsToChange[i].value));
            }
            return aDynamicColumns.join(" , ")
        },

        _getTypeOfSearch: function (sValue) {
            switch (typeof (sValue)) {
                case "string":
                    return "'" + sValue + "'";
                case "number":
                case "boolean":
                    return sValue;
            }
        },

        _getWhereQuery: function (aQuery) {
            var aQueryWhereString = [];
            for (let oQuery of aQuery) {
                let sTypeOfVariable = this._getTypeOfSearch(oQuery.value);
                aQueryWhereString.push(oQuery.column + "=" + sTypeOfVariable)
            }
            return aQueryWhereString.join(" AND ");
        },


        createDataBase: function (dbName, fnCallbackSuccess, fnCallbackError) {
            this._database = window.sqlitePlugin.openDatabase({
                name: dbName,
                location: 'default'
            }, fnCallbackSuccess, fnCallbackError);
        },

        getSingleFile: function (fnCallbackSuccess, fnCallbackError) {
            this._database.transaction(function (tx) {
                tx.executeSql("SELECT * FROM Attachments LIMIT 1", [], (s, rs) => {
                    fnCallbackSuccess(rs.rows.item(0));
                }, (e) => {
                    fnCallbackError();
                });
            });
        },

        deleteFile: function (sId, fnSuccess, fnError) {
            this._database.transaction(function (tx) {
                tx.executeSql("DELETE FROM Attachments WHERE ID = (?)", [sId], fnSuccess, fnError);
            });
        },


        getTables: function (fnCallback) {
            $.getJSON("./models/database.json", fnCallback);
        },

        /**
         *
         * @param oData DATA TOTAL DE LAS TABLAS DEL JSON
         * @private
         */
        _successGetTables: function (oData) {
            var aTables = oData.Tables;
            this._createTables(aTables);
        },


        successOpenDatabase: function () {
            console.log("Database opened");
            this.getTables($.proxy(this._successGetTables, this));
        },

        errorOpenDatabase: function (tx, error) {
            console.log("Error to open Database" + error.message);
        },

        /**
         *
         * @param aConstraints obtiene las constraint del json de tablas
         * @returns {*}
         * @private
         */
        _getConstraints: function (aConstraints) {
            var sConstraint = "";
            var sQuery;
            for (let oConstraint of aConstraints) {
                sQuery = "CONSTRAINT " + oConstraint.constraint_name + " " + "UNIQUE" + oConstraint.constraint_columns;
                sConstraint += sQuery;
            }
            return sQuery;
        },

        /**
         *
         * @param aTables = arreglo de tablas cargado desde el json
         * @private
         */
        _createTables: function (aTables) {
            var sColumns;
            var sConstraint = "";
            this._database.transaction((tx) => {
                for (let oTable of aTables) {
                    for (let oTableAttribute in oTable) {
                        if (oTable[oTableAttribute].constructor === Array && oTableAttribute !== "constraints") {
                            sColumns = "";
                            for (let oCol of oTable[oTableAttribute]) {
                                var sQuery = oCol.column_name + " " + oCol.data_type;
                                sColumns += sQuery;
                            }
                        }
                    }
                    if (oTable.constraints && oTable.constraints.length > 0) {
                        sConstraint = this._getConstraints(oTable.constraints)
                    }
                    var sQuery = "CREATE TABLE IF NOT EXISTS " + oTable.tableName + "(" + sColumns + sConstraint + ")";
                    tx.executeSql(sQuery, [], () => {
                        console.log("table " + oTable.tableName + " created successfully");
                    }, (error) => {
                        console.log(error.message)
                    });
                }
            }, (error) => {
                console.log(error.message);
            }, () => {
                console.log("Tables created successfully");
            })
        },
    };

});