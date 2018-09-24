const WebSocket = require('ws');
const static = require('node-static');
const http = require('http');
const path = require('path');
const serverUtil = require('./util.js');

const HTTP_CONFIG = {
    port: 12701,
    address: '127.0.0.1'
};
const WS_CONFIG = {
    port: 8080,
    address: '127.0.0.1'
};
const staticFileRoot = path.resolve(__dirname + '/../client');

const staticFileServer = new static.Server(staticFileRoot);
const wss = new WebSocket.Server({ host: WS_CONFIG.address, port: WS_CONFIG.port });

const httpServer = http.createServer(function(request, response) {
    // console.log(`receive http request. source IP is ${response.socket.remoteAddress}, source port is ${response.socket.remotePort}, url is ${request.url}.`);
    request.on('end', function() {
        staticFileServer.serve(request, response, function(e, res) {
            if (e && (e.status === 404)) { // If the file wasn't found
                response.writeHead(e.status, e.headers);
                response.end(e.message);
            }
        });
    }).resume();
});

wss.on('connection', function connection(ws, request) {
	let reqUrl = request.url || '';
	let searchStr = reqUrl.substring( reqUrl.indexOf('?') + 1 );
	let params = new URLSearchParams(searchStr);
	let id = params.get('id');
	let type = params.get('type');
	let requestValidRes = serverUtil.checkRequestValid({id, type, wss, ws})
	if(!requestValidRes.valid){
		ws.close(requestValidRes.code, requestValidRes.msg);
		return;
	}
	ws.params = params;
	ws.url = reqUrl;
    ws.on('message', function incoming(message) {
        let clients = wss.clients || [];
        let type = ws.params.get('type');
        let id = ws.params.get('id');
        let url = ws.url;
        console.log(`id: ${id} type: ${type} url: ${url} received: ${message}`);
        if(type == 'client'){
        	/*forward to console*/
        	for(let client of clients){
        		if(client !== ws && client.params.get('type') == 'console' && client.params.get('id') == id){
        			console.log(`forward to id: ${client.params.get('id')} type: ${client.params.get('type')} url: ${client.url} message: ${message}`);
        			client.send(message);
        		}
        	}
        }else if(type == 'console'){
        	/*forward to client*/
        	for(let client of clients){
        		if(client !== ws && client.params.get('type') == 'client' && client.params.get('id') == id){
        			console.log(`forward to id: ${client.params.get('id')} type: ${client.params.get('type')} url: ${client.url} message: ${message}`);
        			client.send(message);
        		}
        	}
        }

    });
});

wss.on('listening', function(err) {
    if (err) {
        console.err(err);
        exit(0);
        return;
    }
    console.log(`WebSocket server start listen ${WS_CONFIG.address}:${WS_CONFIG.port}`);
});

httpServer.listen(HTTP_CONFIG.port, HTTP_CONFIG.address, function(err) {
    if (err) {
        console.err(err);
        exit(0);
        return;
    }
    console.log(`http server start listen ${HTTP_CONFIG.address}:${HTTP_CONFIG.port}`);
});