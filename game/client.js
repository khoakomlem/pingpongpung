window.onload=function(){
	(async function getName (t) {
		const {value: n} = await Swal.fire({
	  		input: 'text',
	 		inputPlaceholder: t
		})
		if (n){
			socket.emit('name', n);
			name = n;
		} else getName('Vui lòng nhập tên phù hợp');
	})('Mời bạn nhập tên:');		
}

$('#create').click(()=>{
	(async function getMax (t) {
		const {value: a} = await Swal.fire({
			input: 'number',
			inputPlaceholder: t
		})
		if (a){
			if (a>4 || a<2)
				getMax("1~4!");
			if (a>1 && a<5){
				max=a;
				socket.emit('create', max, window.innerWidth, window.innerHeight);
				socket.emit('join', socket.id);
				$('#screen1').stop().slideUp(1000,'', ()=>{$('#screen2').append('<h2 id="t" style="position:fixed; top:10px;left:10px; color:white" align="center">Đang chờ người chơi . . .<h2>');$('#screen2').stop().slideDown()});	
			}
	
		}
	})("Max players: (<5)");
});	

socket.on('success', (wid,hei)=>{
	resizeCanvas(wid,hei);
	Width=wid;
	Height=hei;
	$('#screen1').stop().slideUp(1000,'', ()=>{$('#t').remove();$('#screen2').stop().slideDown()});
});

socket.on('reject', (t,type)=>{	
	if (type=='input')
	(async function getName (t,type) {
		const {value: n} = await Swal.fire({
	  		input: 'text',
	 		inputPlaceholder: t
		})
		if (n){
			socket.emit('name', n);
			name = n;
		} else getName('Vui lòng nhập tên phù hợp');
	})(t);
})

socket.on('exit', id=>{
	$('#screen2').stop().slideUp();
	$('#screen1').stop().slideDown();
	socket.emit('exit');
})

function join(id){
	socket.emit('join', id);
}

socket.on('rooom', data=>{
	// alert(1);
	var s='';
	console.log(data);
	s="<table border='1'><tr><td>Mã phòng</td><td>Chủ phòng</td><td>Tình trạng</td><td></td></tr>";
	for (let i in data){
		s=s+"<tr><td>"+data[i].id+"</td><td>"+data[i].name+"</td><td>"+data[i].status+"/"+data[i].max+"</td><td>";
		if (data[i].status==data[i].max)
			s=s+"<input type='submit' value='VÀO' disabled></input></td></tr>";
		else
			s=s+"<input id='vao' type='submit' value='VÀO' onclick='socket.emit(`join`,`"+data[i].id+"`);'></input></td></tr>";
	}
	s=s+"</table>";
	$('#menu').html(s);
});