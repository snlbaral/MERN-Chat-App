const io = require("socket.io")(8900, {
    cors: {
        origin: "https://snlbaral-chatapp.herokuapp.com"
    }
});

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
    console.log("a user is connected")
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
})