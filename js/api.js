/* Version 2.0.0 */

import config from './config.js'

const _webUrl = _spPageContextInfo.webAbsoluteUrl;
const _siteUrl = _spPageContextInfo.siteAbsoluteUrl;
const _root = config.datalistUrl;
let _oDataLevel = "nometadata";
// supporting function for the REST calls
const _getItemTypeForListName = function(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.slice(1) + "ListItem";
}

const _getCorrectUrl = function(url) {
    if (url === undefined || url === null || url === "weburl") return _webUrl;
    if (url === "siteurl") return _siteUrl;
    if (url === "root") return _root;
    return url;
}

const _getCorrectListName = function(listname) {
    switch (listname) {
        case "Parts":
            return "PartNumbers";
        case "ContractPriceList":
            return "ContractPriceList";
        case "SurveillancePrices":
            return "SurveillancePrices";
        case "FixedPriceSchedule":
            return "FixedPriceSchedule";
        case "M2MCSPopup":
            return "M2MCSPopup";
        case "M2MShippingLocations":
            return "M2MShippingLocations";
        case "Customers":
            return "M2MCustomers";
        default:
            return listname;
    }
}

const _getAPIUrl = function(siteUrl, listName, filter, selectFields, sortField, expandFields, top, skip) {
    console.log("_GetAPIUrl");
    var webUrl = _getCorrectUrl(siteUrl);
    var _listName = _getCorrectListName(listName);
    var apiUrl = webUrl + "/_api/lists/getbytitle('" + _listName + "')/items";
    var urlstring = [];
    if (filter !== null && filter !== undefined && filter.length > 0) {
        var filterMatch = filter.match(/\([0123456789]+\)/g);
        if (filterMatch !== null) {
            apiUrl += filter;
        } else {
            urlstring.push("$filter=" + filter);
        }
    };
    if (selectFields !== null && selectFields !== undefined && selectFields.length > 0) {
        urlstring.push("$select=" + selectFields)
    };
    if (sortField !== undefined && sortField !== null && sortField.length > 0) urlstring.push("$orderby=" + sortField);
    if (expandFields !== undefined && expandFields !== null && expandFields.length > 0) urlstring.push("$expand=" + expandFields);
    if (top !== undefined && top !== null && top.length > 0) urlstring.push("$top=" + top);
    if (skip !== undefined && skip !== null && skip.length > 0) urlstring.push("$skip=" + skip);
    if (urlstring.length > 0) apiUrl += "?" + urlstring.join("&");
    return apiUrl;
}

// generic getter.  Given the URL, List name, filter etc. will get items from the list that match the filter.
// if you want a subset of list items supply a filter.  If you want one list item, filter on ID
const _getData = function(webUrl, listName, filter, selectFields, sortField, expandFields, top, skip) {
    var endpoint = _getAPIUrl(_getCorrectUrl(webUrl), listName, filter, selectFields, sortField, expandFields, top, skip);
    console.log("EndPoint: " + endpoint);
    console.log("_oDataLevel: ", _oDataLevel);
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    })
}

const _getAllItemsFromList = function(listName, webUrl, selectFields, sortField) {
    return _getData(_getCorrectUrl(webUrl), listName, null, selectFields, sortField);
}

const _getItemById = function(id, listName, webUrl, selectFields) {
    let endpoint = `${_getCorrectUrl(webUrl)}/_api/lists/getbytitle('${listName}')/items(${id})`;
    if (selectFields !== undefined && selectFields.length > 0) {
        endpoint += `?$select=${selectFields}`;
    }
    return $.ajax({
        url: endpoint,
        method: "GET",
        "headers": { "Accept": `application/json;odata=${_oDataLevel}` }
    })
}

const _updateItemById = function(id, listdata, listName, webUrl) {
    var _listName = _getCorrectListName(listName);
    var endpoint = `${_getCorrectUrl(webUrl)}/_api/web/lists/getbytitle('${_listName}')/items(${id})`;
    var type = _getItemTypeForListName(_listName);
    var data = $.extend({}, {
        __metadata: { 'type': type }
    }, listdata);

    return $.ajax({
        url: endpoint,
        type: "POST",
        headers: {
            "accept": `application/json;odata=${_oDataLevel}`,
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "content-type": `application/json;odata=${_oDataLevel}`,
            "IF-MATCH": "*",
            "X-Http-Method": "MERGE"
        },
        data: JSON.stringify(data)
    })
}

const _deleteItemById = function(id, listName, webUrl) {
    var _listName = _getCorrectListName(listName);
    var endpoint = `${_getCorrectUrl(webUrl)}/_api/web/lists/getbytitle('${_listName}')/items(${id})`;
    return $.ajax({
        url: endpoint,
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": "*",
            "X-HTTP-Method": "DELETE"
        }
    });
}

const _deleteFileByUrl = function(serverRelativePath, webUrl) {
    var endpoint = `${_getCorrectUrl(webUrl)}/_api/web/getfilebyserverrelativeurl('${serverRelativePath}')`;
    return $.ajax({
        url: endpoint,
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": "*",
            "X-HTTP-Method": "DELETE"
        }
    })
}

const _createNewListItem = function(listName, listdata, webUrl, RequestDigest) {
    var _listName = _getCorrectListName(listName);
    var endpoint = `${_getCorrectUrl(webUrl)}/_api/web/lists/getbytitle('${_listName}')/items`;
    var _requestDigest = RequestDigest !== undefined ? RequestDigest : $("#__REQUESTDIGEST").val();
    console.log("Endpoint for create  new item: " + endpoint);
    var type = _getItemTypeForListName(_listName);
    var data = $.extend({}, {
        __metadata: { 'type': type }
    }, listdata);
    console.log("Data sent to server to create a new list item.");
    console.log(data);
    return $.ajax({
        url: endpoint,
        type: "POST",
        headers: {
            "accept": `application/json;odata=${_oDataLevel}`,
            "Content-Type": `application/json;odata=${_oDataLevel}`,
            "X-RequestDigest": _requestDigest
        },
        data: JSON.stringify(data)
    });
}

const _createListItemInOtherSiteCollection = function(siteUrl, listName, payload) {
    const def = $.Deferred();
    $.ajax({
        url: siteUrl + "/_api/contextinfo",
        type: "POST",
        headers: {
            "Accept": `application/json;odata=${_oDataLevel}`
        },
        success: function(contextData) {
            const ni = _createNewListItem(listName, payload, siteUrl, contextData.d.GetContextWebInformation.FormDigestValue);
            ni.done(data => def.resolve(data));
        }
    })
    return def.promise();
}

// User Functions

const _getCurrentUser = function() {
    var endpoint = `${_webUrl}/_api/web/currentuser`;
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    })
}

const _getUserById = function(userid) {
    var endpoint = `${_webUrl}/_api/web/getuserbyid(${userid})`;
    console.log("endpoint:", endpoint);
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    });
}

const _getUserGroups = function(userid) {
    var endpoint = `${_webUrl}/_api/web/getuserbyid(${userid})/Groups`;
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    });
}

const _getCurrentUserProfileProperties = function() {
    const endpoint = `${_siteUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`;
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    })
}

const _getUserProfileProperties = function(accountname) {
    const endpoint = `${_siteUrl}/_api/SP.UserProfiles.PeopleManager/getpropertiesfor(@v)?@v='${encodeURIComponent(accountname)}'`;
    console.log("endpoint for getuserprofileproperties", endpoint);
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    })
}

const _getAllSiteUsers = function() {
    let endpoint = `${_siteUrl}/_api/web/siteusers?$select=Id,LoginName,Title,Email`;
    return $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": `application/json;odata=${_oDataLevel}` }
    })
}

const _setOdataLevel = function(level) {
    _oDataLevel = level;
}

export {
    _webUrl as WebUrl,
    _siteUrl as SiteUrl,
    _getData as GetData,
    _getAllItemsFromList as GetAllItemsFromList,
    _getItemById as GetItemById,
    _updateItemById as UpdateListItemById,
    _deleteItemById as DeleteItemById,
    _deleteFileByUrl as DeleteFileByUrl,
    _createNewListItem as CreateNewListItem,
    _createListItemInOtherSiteCollection as CreateListItemInOtherSiteCollection,
    _getCurrentUser as GetCurrentUser,
    _getUserById as GetUserById,
    _getUserGroups as GetUserGroups,
    _getCurrentUserProfileProperties as GetCurrentUserProfileProperties,
    _getUserProfileProperties as GetUserProfileProperties,
    _getAllSiteUsers as GetAllSiteUsers,
    _setOdataLevel as SetODataLevel
}