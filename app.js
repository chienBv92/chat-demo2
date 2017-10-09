var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server); // goi socket io server
var listUser =[];

server.listen(8000, function(){
    console.log("Ket noi DB thanh cong");
});

io.on("connection", function(socket){
    //socket.emit('notification', {message:"hi"});
    console.log("Co nguoi ket noi" + socket.id);
    socket.on("disconnect", function(){
        console.log("Ngat ket noi"+socket.id);
    });

    socket.on("Client-send-message", function(data){
        //io.sockets.emit("Server-send",data +"88"); // gui di tat ca
        //socket.emit("Server-send",data);  // gui lai chinh no
        //socket.broadcast.emit("Server-send",data); // gui cho nhung client khac tru ban than
        //io.sockets.emit("Server-send-message",{userName: socket.userName, msg: data});
        
        io.sockets.in(socket.Phong).emit("Server-send-message", {userName: socket.userName, msg: data});
    });
    
    socket.on("Client-send-userName", function(data){
        console.log(data);
        
        // dang ki that bai do bi trung lap
        if(listUser.indexOf(data) >= 0){
            socket.emit("Server-send-register-fail",data);

        }
        else{
            listUser.push(data);
            socket.userName = data;
            socket.emit("Server-send-register-success", data);
            io.sockets.emit("Server-send-list-user",listUser);
        }
    });

    // Nhan socket id tu nguoi gui
    socket.on("Select-user",function(data){
        io.to(data).emit("Rep-select-user",{userName: socket.userName}); // server tra ten nguoi gui cho nguoi nhan
    })

    // Logout
    socket.on("Client-logout", function(){
        listUser.splice(listUser.indexOf(socket.userName), 1);
        socket.broadcast.emit("Server-send-list-user",listUser);
        socket.emit("Server-send-logout");
    })

    // Have someone input message
    socket.on("Wait-for-message", function(){
        socket.broadcast.emit("Send-Wait-for-message");
    })

    // Have someone stop typing message
    socket.on("stop-message", function(){
        socket.broadcast.emit("Send-stop-message");
    })

    // Creat room
    socket.on("Creat-room", function(data){
        // co the check truoc khi join room
        
        socket.join(data);
        socket.Phong = data;
        console.log(socket.adapter.rooms);
        var listRoom =[];
        for(var room in socket.adapter.rooms){
            listRoom.push(room);
        }
        io.sockets.emit("Server-send-room", listRoom);
        socket.emit("Server-send-current-room", data);
        //socket.leave(data);
    })

    // Select room
    socket.on("Select-room", function(data){
        // co the check truoc khi join room
        socket.leave(socket.Phong);
        console.log(socket.adapter.room);
        socket.join(data);
        socket.Phong = data;
        
        socket.emit("Server-send-current-room", data);
        //socket.leave(data);
    })

    

});
app.get("/",function(req, res){
    res.render("trangchu.ejs");

})