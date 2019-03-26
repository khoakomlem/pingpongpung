var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
// info var
var rooms={}, joined=[], names=[], idroom=[], idsockets=[], ship=[], ball={}, score=[], restart=[], timeout=[];
// game var
var speedu, speedl, up=true, left=true, x, y;
const random = require('random')

app.get('/', function(req, res){
    var express=require('express');
    app.use(express.static(path.join(__dirname)));
    res.sendFile(path.join(__dirname, 'index.html'));
});

//////////////////////////////////////////////////////////////////////////////////////

io.on('connection', function(socket){
    score[socket.id]=0;
    idroom[socket.id]='1';
    ship[socket.id]={
        x:100
    }
    socket.on('disconnect', function() {
        for (var i in idsockets[idroom[socket.id]])
            io.to(idsockets[idroom[socket.id]][i]).emit('exit');
        delete joined[socket.id];
        delete idsockets[idroom[socket.id]];
        delete rooms[idroom[socket.id]];
        delete names[socket.id];
        delete ball[idroom[socket.id]];
        delete score[socket.id];
        delete timeout[idroom[socket.id]];
        io.emit('rooom',rooms);
    })

    socket.on('exit', ()=>{
        socket.leave(idroom[socket.id]);
        delete joined[socket.id];
        score[socket.id]=0;
    })

    socket.on('name', name=>{
        var ok=true;
        for (var i in names)
            if (names[i]==name){
                ok=false;
                socket.emit('reject', 'Tên đã có người sử dụng','input');
                break;
            }
        if (ok)
            names[socket.id]=name;
    })

    socket.on('join', id=>{
        for (var i in idsockets[id])
            if (idsockets[id][i]==socket.id)
                return;
        socket.join(id);
        idsockets[id].push(socket.id);
        idroom[socket.id]=id;
        rooms[id].status++;
        io.emit('rooom',rooms);
        ship[socket.id]={
            x:rooms[id].width/2-60
        }
        if (rooms[id].status==rooms[id].max){
            io.to(id).emit('success', rooms[id].width, rooms[id].height);      
            restart[id]=true;
            timeout[id]=0;  
            ball[id]={
                x:rooms[id].width/2,
                y:rooms[id].height/2,
                left:random.boolean(),
                up:random.boolean(),
                speedu:rooms[id].width/700+3.5,
                speedl:random.float(0,5),
                swidth:rooms[id].width,
                sheight:rooms[id].height
            }
            timeout[id]=0;

        }
    });

    socket.on('create', (m,wid,hei)=>{
        rooms[socket.id]={
            id:socket.id,
            name:names[socket.id],
            status:0,
            max:m,
            width:wid,
            height:hei
        }
        idsockets[socket.id]=[];
        io.emit('rooom', rooms);
    })

    socket.on('move', s=>{
        try{
        switch (s){
            case 'a':
                ship[socket.id].x-=20;
                if (ship[socket.id].x<0)
                    ship[socket.id].x=0;
                break;
            case 'd':
                ship[socket.id].x+=20;
                if (ship[socket.id].x+120>rooms[idroom[socket.id]].width)
                    ship[socket.id].x=rooms[idroom[socket.id]].width-121;
                break;
        }
        for (var i in idsockets[idroom[socket.id]])
            io.to(idroom[socket.id]).emit('ship'+i, ship[idsockets[idroom[socket.id]][i]], idsockets[idroom[socket.id]][i]);
        }
        catch(e){
            //console.log('loi move')
        }
    })

    io.emit('rooom',rooms);
})

http.listen(3000, function(){
    console.log('The server ran on port 3000\nGo to the link: localhost:3000 to see the webgame');
});

setInterval(()=>{
    
    for (var i in ball){
        try{
            if (restart[i])
                timeout[i]++;
            if (timeout[i]>100){
                timeout[i]=0;
                restart[i]=false;
            }
        if (!restart[i]){
            if (ball[i].left) ball[i].x-=ball[i].speedl;
            if (!ball[i].left) ball[i].x+=ball[i].speedl;
            if (ball[i].up) ball[i].y-=ball[i].speedu;
            if (!ball[i].up) ball[i].y+=ball[i].speedu;
        }

        if (ball[i].x<=0){
            ball[i].x=1;
            ball[i].left=false;
        }
        if (ball[i].x+20>=rooms[i].width){
            ball[i].x=rooms[i].width-20;
            ball[i].left=true;
        }
        if (ball[i].y<=0){
            ball[i].y=1;
            ball[i].up=false;
            score[idsockets[i][0]]++;
            ball[i].y=rooms[i].height/2;
            ball[i].x=rooms[i].width/2;
            restart[i]=true;
            io.to(i).emit('score',score[idsockets[i][0]],idsockets[i][0]);
        }
        if (ball[i].y+20>=rooms[i].height){
            ball[i].y=rooms[i].height-20;
            ball[i].up=true;
            ball[i].y=rooms[i].height/2;
            ball[i].x=rooms[i].width/2;
            restart[i]=true;
            score[idsockets[i][1]]++;
            io.to(i).emit('score',score[idsockets[i][1]],idsockets[i][1]);
        }
        for (var j in idsockets[i]){
            var id=idsockets[i][j];
            if (id==i){
                if (ball[i].y+20>=rooms[i].height-60 && ball[i].y<=rooms[i].height-40 && ball[i].x+20>=ship[id].x && ball[i].x<=ship[id].x+120){
                    ball[i].y=rooms[i].height-80;
                    ball[i].up=true;
                    ball[i].speedl=random.float(0,5);

                }
            } else {
                var ballx=rooms[i].width-ball[i].x-20;
                var bally=rooms[i].height-ball[i].y-20;
                var shipx=rooms[i].width-ship[id].x-121;
                if (ball[i].y<=60 && ball[i].y>=40 && ball[i].x+20>=shipx && ball[i].x<=shipx+120){
                    ball[i].y=60;
                    ball[i].up=false;
                    ball[i].speedl=random.float(0,5);
                }
            } 

        }
        io.to(i).emit('ball',ball[i],i);
        }
        catch(e){console.log(e)}
    }

},10)