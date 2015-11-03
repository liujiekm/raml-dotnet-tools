var CryptoJS = require('./CryptoJS');
var serviceToRegionMap = {
    's3': 'us-east-1',
    's3-external-1': 'us-east-1',
    's3-us-west-2': 'us-west-2',
    's3-us-west-1': 'us-west-1',
    's3-eu-west-1': 'eu-west-1',
    's3-ap-southeast-1': 'ap-southeast-1',
    's3-ap-southeast-2': 'ap-southeast-2',
    's3-ap-northeast-1': 'ap-northeast-1',
    's3-sa-east-1': 'sa-east-1'
};
function getCurrentDate() {
    //Sun, 11 Oct 2009 21:49:13 GMT
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var date = new Date();
    var day = days[date.getUTCDay()];
    var dayOfMonth = '' + date.getUTCDate();
    if (dayOfMonth.length == 1) {
        dayOfMonth = '' + 0 + dayOfMonth;
    }
    var monthIndex = date.getUTCMonth();
    var month = '' + (monthIndex + 1);
    var monthWord = months[monthIndex];
    if (month.length == 1) {
        month = '' + 0 + month;
    }
    var year = date.getUTCFullYear();
    var h = '' + date.getUTCHours();
    if (h.length == 1) {
        h = '' + 0 + h;
    }
    var m = '' + date.getUTCMinutes();
    if (m.length == 1) {
        m = '' + 0 + m;
    }
    var s = '' + date.getUTCSeconds();
    if (s.length == 1) {
        s = '' + 0 + s;
    }
    var short = "" + year + month + dayOfMonth + "T" + h + m + s + "Z";
    var long = "" + day + ", " + dayOfMonth + " " + monthWord + " " + year + " " + h + ":" + m + ":" + s + " GMT";
    var result = {
        'longDate': long,
        'shortDate': short,
        'day': "" + year + month + dayOfMonth
    };
    return result;
}
function isEmpty(obj) {
    if (!obj) {
        return true;
    }
    return Object.keys(obj).length == 0;
}
function generateAuthorizationHeaderValue(ACCESS_KEY, SECRET_KEY, date, method, uriData, payload, query, contentType) {
    var dateHash = CryptoJS.HmacSHA256(date.day, "AWS4" + SECRET_KEY);
    var dateRegionHash = CryptoJS.HmacSHA256(uriData.region, dateHash);
    var dateRegionServiceHash = CryptoJS.HmacSHA256(uriData.regionService, dateRegionHash);
    var signingKey = CryptoJS.HmacSHA256("aws4_request", dateRegionServiceHash);
    var payloadHash = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
    var signedHeaders = "content-md5;content-type;host;x-amz-content-sha256;x-amz-date";
    var contentMD5 = CryptoJS.MD5(payload).toString(CryptoJS.enc.Base64);
    var canonicalRequsest = method + "\n" + uriData.relativeUri + "\n";
    if (isEmpty(query)) {
        canonicalRequsest += "\n";
    }
    else {
        for (var paramName in query) {
            canonicalRequsest += paramName + "=" + query[paramName] + "\n";
        }
    }
    canonicalRequsest += "content-md5:" + contentMD5 + "\n" + "content-type:" + contentType + "\n" + "host:" + uriData.host + "\n" + "x-amz-content-sha256:" + payloadHash + "\n" + "x-amz-date:" + date.shortDate + "\n\n" + signedHeaders + "\n" + payloadHash;
    var canonicalRequestHash = CryptoJS.SHA256(canonicalRequsest).toString(CryptoJS.enc.Hex);
    var stringToSign = "AWS4-HMAC-SHA256\n" + date.shortDate + "\n" + date.day + "/" + uriData.region + "/" + uriData.regionService + "/aws4_request\n" + canonicalRequestHash;
    var signedString = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex);
    var authString = "AWS4-HMAC-SHA256 Credential=" + ACCESS_KEY + "/" + date.day + "/" + uriData.region + "/" + uriData.regionService + "/aws4_request," + "SignedHeaders=" + signedHeaders + ",Signature=" + signedString;
    return authString;
}
function inspectUri(uri) {
    var ind = uri.indexOf('?');
    if (ind >= 0) {
        uri = uri.substring(0, ind);
    }
    ind = uri.indexOf('://') + '://'.length;
    uri = uri.substring(ind);
    ind = uri.indexOf('.s3.amazonaws.com') + '.s3.amazonaws.com'.length;
    var host = uri.substring(0, ind).toLowerCase();
    uri = uri.substring(ind);
    ind = host.indexOf('.');
    var ind2 = host.indexOf('.', ind + 1);
    var service = host.substring(ind + 1, ind2);
    var region = serviceToRegionMap[service];
    return {
        relativeUri: uri,
        host: host,
        region: region,
        regionService: service
    };
}
function patch(req, accessKey, secretKey) {
    var method = req.method.toUpperCase();
    var uriData = inspectUri(req.url);
    var payload = req.postData && req.postData.text ? req.postData.text : null;
    var query = {};
    req.queryString.forEach(function (x) { return query[x.name] = x.value; });
    var contentType = req.postData ? req.postData.mimeType : undefined;
    if (contentType == undefined || contentType == null) {
        contentType = "application/json";
        if (req.postData) {
            req.postData.mimeType = contentType;
        }
    }
    var date = getCurrentDate();
    var authString = generateAuthorizationHeaderValue(accessKey, secretKey, date, method, uriData, payload, query, contentType);
    var payloadHash = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
    var contentMD5 = CryptoJS.MD5(payload).toString(CryptoJS.enc.Base64);
    if (!req.headers) {
        req.headers = [];
    }
    req.headers = [
        {
            name: "Authorization",
            value: authString
        },
        {
            name: "Date",
            value: date.longDate
        },
        {
            name: "Host",
            value: uriData.host
        },
        {
            name: "Content-MD5",
            value: contentMD5
        },
        {
            name: "Content-Type",
            value: contentType
        },
        {
            name: "x-amz-content-sha256",
            value: payloadHash
        },
        {
            name: "x-amz-date",
            value: date.shortDate
        }
    ];
}
var Schema = (function () {
    function Schema(_name) {
        this._name = _name;
    }
    Schema.prototype.apply = function (request) {
        var accessKey = this.paramsProvider.getValue('ACCESS_KEY');
        var secretKey = this.paramsProvider.getValue('SECRET_KEY');
        patch(request, accessKey, secretKey);
    };
    Schema.prototype.store = function () {
    };
    Schema.prototype.update = function () {
    };
    Schema.prototype.isReady = function () {
        return true;
    };
    Schema.prototype.setSecurityProvider = function (paramsProvider) {
        this.paramsProvider = paramsProvider;
    };
    Schema.prototype.name = function () {
        return this._name;
    };
    return Schema;
})();
function createSchema(name) {
    return new Schema(name);
}
exports.createSchema = createSchema;
//# sourceMappingURL=configurator.js.map