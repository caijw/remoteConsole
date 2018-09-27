/*
url: http://127.0.0.1:12701/client.html?id={id}&type={type}
example:
http://127.0.0.1:12701/client.html?id=3408807607&type=client
*/
import * as common from './common.js';

const query = common.getUrlQuery(location.href);
const id = query.id; /*唯一标志两端的id*/
const type = query.type;

const wsUrl = 'ws://' + common.WS_CONFIG.address + ':' + common.WS_CONFIG.port + '/?id=' + id + '&type=' + type;

let logs = [];

let _console = {
    log: function() {
        let params = Array.prototype.slice.apply(arguments);
        logs.push({
            type: 'log',
            params: params
        });
    },
    info: function() {
        let params = Array.prototype.slice.apply(arguments);
        logs.push({
            type: 'info',
            params: params
        });
    },
    error: function() {
        let params = Array.prototype.slice.apply(arguments);
        logs.push({
            type: 'error',
            params: params
        });
    }
};

console.log = (function (_log) {
    return function () {
        let params = Array.prototype.slice.apply(arguments);
        _log.apply(console, params);
        _console.log.apply(_console, params);
    }
})(console.log);
console.info = (function (_info) {
    return function () {
        let params = Array.prototype.slice.apply(arguments);
        _info.apply(console, params);
        _console.info.apply(_console, params);
    }
})(console.info);
console.error = (function (_error) {
    return function () {
        let params = Array.prototype.slice.apply(arguments);
        _error.apply(console, params);
        _console.error.apply(_console, params);
    }
})(console.error);

function socketSendJSON(socket, reqData) {
    if(socket.readyState !== common.readyState.OPEN){
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
let log = [];

if(!common.supportWebSocket()){
    alert('不支持websocket');
}else{
    console.log('debug log');
    console.error('error log');
    console.info('info log')
    let socket = new WebSocket(wsUrl);
    function consoleHack() {
        _console.log = function () {
            let params = Array.prototype.slice.apply(arguments);            
            let reqData = {
                cmd: 'logger_log',
                params: params
            };
            socketSendJSON(socket, reqData);
        };
        _console.info = function () {
            let params = Array.prototype.slice.apply(arguments);
            let reqData = {
                cmd: 'logger_info',
                params: params
            };
            socketSendJSON(socket, reqData);
        }
        _console.error = function () {
            let params = Array.prototype.slice.apply(arguments);
            let reqData = {
                cmd: 'logger_error',
                params: params
            };
            socketSendJSON(socket, reqData);
        }
    }



    // Connection opened
    socket.addEventListener('open', function (event) {
        consoleHack();
        for(let i = 0; i < logs.length; ++i){
            let log = logs[i];
            if(console[log.type]){          
                let reqData = {
                    cmd: 'logger_' + log.type,
                    params: log.params
                };
                socketSendJSON(socket, reqData);
            }
        }
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        // console.log('Message from server ', event.data);
        let data = event.data || '{}';
        data = JSON.parse(data);
        data.cmd = data.cmd || '';
        try{
            /*todo use AST tree*/
            let tmp = data.cmd.split('\n');
            let cmds = [];
            for(let i = 0; i < tmp.length; ++i){
                tmp[i] = tmp[i].trim();
                if(tmp[i]){
                    cmds.push(tmp[i]);
                }
            }
            if(!cmds.length){
                return;
            }
            let reg=/(^\s+)|(\s+$)|\s+/g;
            if(cmds.length === 1){
                /*单行处理*/
                if(!reg.test(cmds[0])){
                    cmds[0] = cmds[0].replace(';', '');
                    cmds[0] = 'console.log(' + cmds[0] + ')';
                }else if(cmds[0].indexOf('=') === -1){
                    cmds[0] = cmds[0].replace(';', '');
                    cmds[0] = 'console.log(' + cmds[0] + ')';
                }

            }

            let func = new Function( cmds.join('\n') );
            func();
        }catch(err) {
            console.error(err.stack || err.message);
        }

    });
    window.addEventListener('error', function (event) {
        let errMsg = event.error && event.error.stack || '';
        if(!errMsg){
            if(event.filename){
                errMsg += event.filename;
                if(event.lineno){
                    errMsg += (':' + event.lineno);
                    if(event.colno){
                        errMsg += (':' + event.colno);
                    }
                }
                errMsg += '\n';
            }
            if(event.message){
                errMsg += event.message;
                errMsg += '\n';
            }
        }
        console.error(errMsg);
    });

}


