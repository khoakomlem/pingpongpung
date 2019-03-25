var count=0, mex=-100, himx=-100, loop, key, ballx=-100, bally=-100, myscore=0, himscore=0;

function preload(){
	document.addEventListener("keydown", (e)=>{
		clearInterval(loop);
		key=e.key;
		loop=setInterval(()=>{
			if (key=="a" || key=="A")
				socket.emit('move','a')
			if (key=="d" || key=="D")
				socket.emit('move','d');
		},7);
		
	})
	document.addEventListener("keyup", ()=>{
		clearInterval(loop);
		socket.emit('move','');
	})
}

function setup(){
	var canv=createCanvas(window.innerWidth, window.innerHeight);
	canv.parent('screen2');
  	textSize(40);
  	textAlign(CENTER, CENTER);
  	fill(255);
	socket.on('ship0', (data,id)=>{
		if (socket.id==id)
			mex=data.x;
		else
			himx=data.x;
	})
	socket.on('ship1', (data,id)=>{
		if (socket.id==id)
			mex=data.x;
		else
			himx=data.x;
	})
	socket.on('ball', (data,id)=>{
		
		if (socket.id==id){
			ballx=data.x;
			bally=data.y;
		}
		else{
			ballx=width-data.x-20;
			bally=height-data.y-20;
		}
	})
	socket.on('score', (data,id)=>{
		if (socket.id==id){
			myscore=data;	
		} else{
			himscore=data;
		}
	})
}

function draw(){
	background(0);
	rect(mex, height-60, 120, 20);
	rect(width-himx-121, 40, 120, 20);
	rect(ballx, bally, 20, 20);
	textAlign(CENTER);
	text(myscore, width/2, height-150);
	text(himscore, width/2, 130);
}