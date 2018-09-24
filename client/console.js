/*
url: http://127.0.0.1:12701/client.html?id={id}&type={type}
example:
http://127.0.0.1:12701/client.html?id=3408807607&type=console
*/

var query = getUrlQuery(location.href);
var id = query.id; /*唯一标志两端的id*/
var type = query.type;

var wsUrl = 'ws://' + WS_CONFIG.address + ':' + WS_CONFIG.port + '/?id=' + id + '&type=' + type;

if(!supportWebSocket()){
    alert('不支持websocket');
}else{

	var cmdMap = {
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

	var socket = new WebSocket(wsUrl);
	// Connection opened
	socket.addEventListener('open', function (event) {
	    
	});

	// Listen for messages
	socket.addEventListener('message', function (event) {
	    var data = event.data || '{}';
	    data = JSON.parse(data);
	    var cmd = data.cmd;
	    var params = data.params || [];
	    
	    if(cmdMap[cmd]){
	        cmdMap[cmd](params);
	    }
	});
	var commandContentEle = document.querySelector('#commandContent');
	var execCommandEle = document.querySelector('#execCommand');
	execCommandEle.addEventListener('click', function (event) {
		var commondStr = commandContentEle.value || '';
		commondStr = commondStr.trim();
		if(socket.readyState !== readyState.OPEN){
		    alert('socket readyState ' + socket.readyState + ' , not OPEN');
		    return;
		}
		var data = {
			cmd: commondStr
		}
		socket.send( JSON.stringify(data) );

	});


}
