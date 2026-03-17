const express = require('express');
const {Server} = require('socket.io');
const http=require('http');
const path = require('path');
const ACTIONS = require('./src/Actions');

const app = express();

const server=http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});



app.use(express.static('build'));
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})
//this is stored in memory if server restarts then it gets initialised again and mapping is lost.
const userSocketMap = {};

function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return {
            socketId,
            username: userSocketMap[socketId],
        };
    });
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    //this is to maintain a new user who wants to join the room with roomId
    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMap[socket.id]=username;
        socket.join(roomId);

        //getting the list of all the connected clients in that roomId room
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId})=>{
            // we aare sending the new user details (info) to every user present in that roomId.
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    // this is responsible for sending code change so apply check for whether the text typed is seen properly (not in reversed manner).
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        // io.to(roomId).emit(ACTIONS.CODE_CHANGE, {code}); //this was sending the change to all includeing the user who is typing which creating text to appear in reverse order and the cursor was coming at the start 
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code});//this code will send changes to socket room to others only..
    });

    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
    });

    // disconnecting event is important here not writing "disconnected"
    socket.on('disconnecting', ()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        //to leave the socket room officially,
        socket.leave();
    });
});

const PORT=process.env.PORT || 5000
server.listen(PORT, ()=>
    console.log(`Listening on port ${PORT}`)
);