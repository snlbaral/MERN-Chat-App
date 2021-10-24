const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotEnv = require('dotenv')

dotEnv.config()

const userss = require("./routes/users")
const home = require("./routes/home")
const addresses = require("./routes/addresses");
const chat = require("./routes/chat");

mongoose.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).catch(err=>{
    console.log("Errors", err);
});


app.use(cors());
app.use(express.json());
// app.use("/", home);
app.use("/api/users", userss);
//app.use("/api/addresses", addresses);
app.use("/api/chat", chat);


if ( process.env.NODE_ENV == "production"){
    app.use(express.static("client/build"));
    const path = require("path");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

const port = process.env.PORT || 5000;
const server = app.listen(port)


//For Server
const socketIO = require("socket.io");
const io = socketIO(server);


//For Local

// const io = require("socket.io")(8900, {
//     cors: {
//         origin: "http://localhost:3000"
//     }
// });


let users = [];

const addUser = (userId, socketId) =>{
    !users.some((user) => user.userId === userId) &&
        users.push({userId, socketId});
}

const removeUser = (socketId) => {
    users = users.filter((user)=> user.socketId !== socketId);
}

const findUser = (userId) => {
    return users.find((user)=> user.userId === userId);
}


io.on("connection", (socket)=>{
    socket.on("adduser", (userId)=>{
        addUser(userId, socket.id);
        io.emit("onlineUsers", users);
    })
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("onlineUsers", users);
    })

    socket.on("sendMessage", ({senderId, receiverId, message, conversationId}) => {
        const user = findUser(receiverId);
        if(user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                message,
                conversationId
            })
        }
    })

    socket.on("typingMessage", ({senderId, receiverId, senderName, conversationId, textLength}) =>{
        const user = findUser(receiverId);
        var message = null;
        if(textLength>0) {
            message = senderName+" is typing...";
        }
        if(user) {
            io.to(user.socketId).emit("isTyping", {
                receiverId,
                conversationId,
                message
            })
        }
    })
})

