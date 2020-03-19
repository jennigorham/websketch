var sketch_canvas = document.getElementById("sketch");
var context = sketch_canvas.getContext("2d");
var sketch_socket;

var hilite_canvas = document.getElementById("overlay");
var hilite_context = hilite_canvas.getContext("2d");

//draw a path specified by an array of coords
function drawPath(a) {
	if (a.length > 0) {
		context.lineWidth = 1.5;
		context.beginPath();
		context.moveTo(a[0][0], a[0][1]);
		for (i=1; i<a.length; i++) {
			context.lineTo(a[i][0], a[i][1]);
		}
		context.stroke();
	}
}

//erase an area whose boundary is specified by an array of coords
function erasePath(a) {
	if (a.length > 0) {
		context.fillStyle = '#fff';
		context.beginPath();
		context.moveTo(a[0][0], a[0][1]);
		for (i=1; i<a.length; i++) {
			context.lineTo(a[i][0], a[i][1]);
		}
		context.closePath();
		context.fill();
	}
}

var hilite_loop;
var hilite_on = false;
function hiliteToggle() {
	if (hilite_on) {
		hilite_canvas.style.display = 'none';
		hilite_on = false;
	} else {
		hilite_on = true;
		hilite_canvas.style.display = 'block';
	}
}
function hilitePath(a) {
	hilite_context.clearRect(0, 0, hilite_canvas.width, hilite_canvas.height);
	clearTimeout(hilite_loop);
	hilite_canvas.style.display = 'block';
	if (a.length > 0) {
		hilite_context.lineWidth = 1.5;
		hilite_context.beginPath();
		hilite_context.moveTo(a[0][0], a[0][1]);
		for (i=1; i<a.length; i++) {
			hilite_context.lineTo(a[i][0], a[i][1]);
		}
		hilite_context.stroke();
		hilite_on = true;
		hilite_loop = setInterval(hiliteToggle,500);
	}
}
function clearHilite() {
	clearTimeout(hilite_loop);
	hilite_on = false;
	hilite_canvas.style.display = 'none';
}

function connect() {
	console.log('Opening websocket...')
	hilite_canvas.style.display = 'none';
	document.getElementById("reconnect").style.display = "none";
	document.getElementById("connecting").style.display = "block";
	//ip is specified in index.php
	sketch_socket = new WebSocket("ws://" + ip + ":" + port);
	console.log("ws://" + ip + ":" + port);

	sketch_socket.onopen = function (event) {
		console.log('Websocket opened')
		document.getElementById("connecting").style.display = "none";
		//tell the server how big our drawing area is
		sketch_socket.send(JSON.stringify({"width": w, "height": h})); 
	};

	sketch_socket.onerror = function (event) {
		console.log(event);
	}

	sketch_socket.onclose = function (event) {
		document.getElementById("reconnect").style.display = "block";
		document.getElementById("connecting").style.display = "none";
		sketch_canvas.style.display = "none";
		clearHilite();
		console.log("Websocket closed");
	}

	sketch_socket.onmessage = function (event) {
		var msg = JSON.parse(event.data);
		//console.log(msg);
		if (msg['mode'] && typeof msg['id'] !== 'undefined') {
			if (msg['mode'] == 'draw') {
				drawPath(msg['points']);
			} else if (msg['mode'] == 'clear') {
				context.clearRect(0, 0, sketch_canvas.width, sketch_canvas.height);
			} else if (msg['mode'] == 'erase') {
				erasePath(msg['points']);
			} else if (msg['mode'] == 'highlight') {
				hilitePath(msg['points']);
			} else if (msg['mode'] == 'end_highlight') {
				clearHilite();
			} else if (msg['mode'] == 'png') {
				var img=document.createElement("IMG");
				img.setAttribute('src', 'data:image/png;base64,' + msg['img']);
				img.onload = function() {context.drawImage(img,msg['x'],msg['y']);}
			}
			//tell the server we've received the message
			sketch_socket.send(JSON.stringify({"id": msg['id']})); 
		} else if (msg['png']) {
			var img=document.createElement("IMG");
			img.setAttribute('src', 'data:image/png;base64,' + msg['png']);
			img.onload = function() {
				context.drawImage(img,0,0);
				sketch_canvas.style.display = "block";
			}
			sketch_socket.send(JSON.stringify({"confirmall": "true"})); 
		} else {
			console.log(event.data);
		}
	}
}

var last_x;
var last_y;
var coords = new Array();

function addCoord(e) {
	if (e.touches) {
		coords.push([e.changedTouches[0].clientX,e.changedTouches[0].clientY]);
	} else {
		coords.push([e.clientX,e.clientY]);
	}
}
function startDraw(e) {
	e.preventDefault();
	coords = [];
	addCoord(e);
	sketch_canvas.onmousemove = move;
	sketch_canvas.ontouchmove = move;
	hilite_canvas.onmousemove = move;
	hilite_canvas.ontouchmove = move;
}

function move(e) {
	addCoord(e);
	var n = coords.length;
	drawPath([coords[n-2],coords[n-1]]);
}

function endDraw(e) {
	addCoord(e);
	var n = coords.length;
	drawPath([coords[n-2],coords[n-1]]);
	sketch_socket.send(JSON.stringify({"draw": coords})); 
	sketch_canvas.onmousemove = null;
	sketch_canvas.ontouchmove = null;
	hilite_canvas.onmousemove = null;
	hilite_canvas.ontouchmove = null;
}

function cancelDraw(e) {
	sketch_socket.send(JSON.stringify({"draw": coords})); 
	coords = [];
	sketch_canvas.ontouchmove = null;
	hilite_canvas.ontouchmove = null;
}

sketch_canvas.onmousedown = startDraw;
sketch_canvas.ontouchstart = startDraw;
sketch_canvas.onmouseup = endDraw;
sketch_canvas.ontouchend = endDraw;
sketch_canvas.ontouchcancel = cancelDraw;
hilite_canvas.onmousedown = startDraw;
hilite_canvas.ontouchstart = startDraw;
hilite_canvas.onmouseup = endDraw;
hilite_canvas.ontouchend = endDraw;
hilite_canvas.ontouchcancel = cancelDraw;

var w = window.innerWidth;
var h = window.innerHeight;
sketch_canvas.width = w;
sketch_canvas.height = h;
hilite_canvas.width = w;
hilite_canvas.height = h;

function myresize() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	var imgData = context.getImageData(0,0,2000,2000); //save the current canvas image
	sketch_canvas.width = w;
	sketch_canvas.height = h;
	hilite_canvas.width = w;
	hilite_canvas.height = h;
	context.putImageData(imgData,0,0); //restore the saved image
	if (sketch_socket) { //tell the server our new size
		sketch_socket.send(JSON.stringify({"width": w, "height": h})); 
	}
}

connect()
