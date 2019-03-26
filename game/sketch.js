var count=0, mex=-100, himx=0, loop, key, ballx=-100, bally=-100, myscore=0, himscore=0;

function preload(){
}

function setup(){
	var canv=createCanvas(window.innerWidth, window.innerHeight);
	himx=width/2-60;
	mex=width/2-60;
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
	if (keyIsDown(LEFT_ARROW)){
		socket.emit('move','a')
	} else
	if (keyIsDown(RIGHT_ARROW)){
		socket.emit('move','d')
	}
}