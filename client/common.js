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


function captureStackTrace(_, stack) {
    return stack;
}

function getCallInfo(level) {

    var res = {
        line: 0,
        column: 0,
        filename: ''
    };

    if( Error.stackTraceLimit && Error.captureStackTrace){

    	level = level || 0;
    	var origLimit = Error.stackTraceLimit;
    	Error.stackTraceLimit = 5;

    	var err = Object.create(null);
    	Error.captureStackTrace(err, arguments.callee);     // eslint-disable-line no-caller
    	var stack = err.stack;

    	Error.stackTraceLimit = origLimit;

    	if (stack && stack[level] && typeof stack[level].getLineNumber === 'function') {
    	    res.line = stack[level].getLineNumber();
    	    res.column = stack[level].getColumnNumber();
    	    res.filename = stack[level].getFileName();
    	}
    }
    return res;
};