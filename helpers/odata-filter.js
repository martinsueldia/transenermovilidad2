ODataFilter.COMPARE = {
    "EQUAL": 'eq',
    "CONTAINS": "contains"
};

ODataFilter.OPERATOR = {
    "AND": Xrm.oData.FilterTypes.And,
    "OR": Xrm.oData.FilterTypes.Or
};

ODataFilter.getExpression = function (sAttribute, sCompare, sValue) {
    if (sCompare === "contains") {
        return "substringof" + "('" + sValue.toUpperCase() + "'," + sAttribute + "))"
    }
    return sAttribute + ' ' + sCompare + " '" + sValue + "'";
};

ODataFilter.prototype.getFilter = function () {
    return this.filter;
};

function ODataFilter(expression, operator, filters) {
    this.filter = new window.Xrm.oData.FilterInfo({
        filterType: operator,
        filterExpressions: expression,
        filters: filters ? filters : []
    });
}