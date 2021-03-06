const WS_CONFIG = {
    address: 'h5.qzone.qq.com/ohMy/console',
    port: '80'
};

function supportWebSocket() {

    if ("WebSocket" in window) {
        return true;

    } else {
        return false;
    }
}

const readyState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};


function getUrlQuery(url) {
    var result = {};
    var query = url.split("?")[1] || '';
    if(query){
        var queryArr = query.split("&");
        queryArr.forEach(function(item) {
            var key = item.split("=")[0];
            var value = item.split("=")[1];
            result[key] = value;
        });
    }

    return result;
}

export { 
    WS_CONFIG, 
    readyState, 
    supportWebSocket, 
    getUrlQuery
};