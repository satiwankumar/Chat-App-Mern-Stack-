





const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());

const port = process.env.port || 5002


app.use(router)


io.on('connection', (socket) => {
    console.log('user connected')



    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room })
        
        if (error) return callback(error)
       

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name},has joined` })
        socket.join(user.room)
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        console.log('send mssage listended')
        let user = getUser(socket.id)
        console.log(user)
        io.to(user.room).emit('message',{user:user.name,text:message});
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left`})
           
        }
    })
})

server.listen(port, () => {
    console.log(`server  is connected at the port${port}`)
})