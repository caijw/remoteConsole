var WS_CONFIG = {
    address: 'localhost',
    port: '8080'
};

function supportWebSocket() {

    if ("WebSocket" in window) {
        return true;

    } else {
        return false;
    }
}

var readyState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};


function getUrlQuery(url) {
    var result = {};
    var query = url.split("?")[1];
    var queryArr = query.split("&");
    queryArr.forEach(function(item) {
        var key = item.split("=")[0];
        var value = item.split("=")[1];
        result[key] = value;
    });
    return result;
}