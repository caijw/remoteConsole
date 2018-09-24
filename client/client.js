/*
url: http://127.0.0.1:12701/client.html?id={id}&type={type}
example:
http://127.0.0.1:12701/client.html?id=3408807607&type=client
*/
var query = getUrlQuery(location.href);
var id = query.id; /*唯一标志两端的id*/
var type = query.type;

var wsUrl = 'ws://' + WS_CONFIG.address + ':' + WS_CONFIG.port + '/?id=' + id + '&type=' + type;

function socketSendJSON(socket, reqData) {
    if(socket.readyState !== readyState.OPEN){
        alert('socket readyState ' + socket.readyState + ' , not OPEN');
        return;
    }
    try{
        socket.send( JSON.stringify(reqData) );
    }catch(err){
        reqData = {
            cmd: 'logger_error',
            params: [err.stack || err.message]
        };
        socket.send( JSON.stringify(reqData) );
    }

}

if(!supportWebSocket()){
    alert('不支持websocket');
}else{



    var socket = new WebSocket(wsUrl);
    function consoleHack() {
        console.log = (function (_log) {
            return function () {
                var params = Array.prototype.slice.apply(arguments);
                _log.apply(console, params);
                var reqData = {
                    cmd: 'logger_log',
                    params: params
                };
                socketSendJSON(socket, reqData);

            }
        })(console.log);
        console.info = (function (_info) {
            return function () {
                var params = Array.prototype.slice.apply(arguments);
                _info.apply(console, params);
                var reqData = {
                    cmd: 'logger_info',
                    params: params
                };
                socketSendJSON(socket, reqData);
            }
        })(console.info);
        console.error = (function (_error) {
            return function () {
                var params = Array.prototype.slice.apply(arguments);
                _error.apply(console, params);
                var reqData = {
                    cmd: 'logger_error',
                    params: params
                };
                socketSendJSON(socket, reqData);
            }
        })(console.error);
    }



    // Connection opened
    socket.addEventListener('open', function (event) {
        consoleHack();
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        // console.log('Message from server ', event.data);
        var data = event.data || '{}';
        data = JSON.parse(data);
        data.cmd = data.cmd || '';
        try{
            /*todo use AST tree*/
            var tmp = data.cmd.split('\n');
            var cmds = [];
            for(var i = 0; i < tmp.length; ++i){
                tmp[i] = tmp[i].trim();
                if(tmp[i]){
                    cmds.push(tmp[i]);
                }
            }
            if(!cmds.length){
                return;
            }
            var reg=/(^\s+)|(\s+$)|\s+/g;
            if(cmds.length === 1 && !reg.test(cmds[0])){
                cmds[0] = cmds[0].replace(';', '');
                cmds[0] = 'console.log(' + cmds[0] + ')';
            }

            var func = new Function( cmds.join('\n') );
            func();
        }catch(err) {
            console.error(err.stack || err.message);
        }

    });

}


