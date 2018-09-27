/*
url: http://127.0.0.1:12701/client.html?id={id}&type={type}
example:
http://127.0.0.1:12701/client.html?id=3408807607&type=console
*/
import * as common from './common.js';

const query = common.getUrlQuery(location.href);
const id = query.id; /*唯一标志两端的id*/
const type = query.type;

const wsUrl = 'ws://' + common.WS_CONFIG.address + ':' + common.WS_CONFIG.port + '/?id=' + id + '&type=' + type;

if(!common.supportWebSocket()){
    alert('不支持websocket');
}else{

	let cmdMap = {
	    logger_log: function (params) {
	        console.log.apply(console, params);

	    },
	    logger_error: function (params) {
	    	console.error.apply(console, params);
	    },
	    logger_info: function (params) {
	    	console.info.apply(console, params);
	    }
	};

	let socket = new WebSocket(wsUrl);
	// Connection opened
	socket.addEventListener('open', function (event) {
	    
	});

	// Listen for messages
	socket.addEventListener('message', function (event) {
	    let data = event.data || '{}';
	    data = JSON.parse(data);
	    let cmd = data.cmd;
	    let params = data.params || [];
	    
	    if(cmdMap[cmd]){
	        cmdMap[cmd](params);
	    }
	});
	let commandContentEle = document.querySelector('#commandContent');
	let execCommandEle = document.querySelector('#execCommand');
	execCommandEle.addEventListener('click', function (event) {
		let commondStr = commandContentEle.value || '';
		commondStr = commondStr.trim();
		if(socket.readyState !== common.readyState.OPEN){
		    alert('socket readyState ' + socket.readyState + ' , not OPEN');
		    return;
		}
		let data = {
			cmd: commondStr
		}
		socket.send( JSON.stringify(data) );

	});


}
