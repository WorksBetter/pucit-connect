const io = require('./index.js').io;
const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, LOGOUT, MESSAGE_RECEIVED, MESSAGE_SENT, COMMUNITY_CHAT, TYPING, PRIVATE_MESSAGE, NEW_CHAT_USER} = require("../Events");
const {createUser, createMessage, createChat} = require("../Factories");

let connectedUsers = {};
let communityChat = createChat({isCommunity:true});

module.exports = function(socket){
    console.log("Socket Id: " + socket.id);

    let sendMessageToChatFromUser;
    let sendTypingFromUser;
    
    // Verify Username

    socket.on(VERIFY_USER, (nickname, callback) => {
        if(isUser(connectedUsers, nickname)){
            callback({isUser:true, user:null});
        } else {
            callback({isUser: false, user: createUser({name:nickname, socketId:socket.id})})
        }
    });

    // User Connects with username
    socket.on(USER_CONNECTED, (user) => {
        user.socketId = socket.id;

        connectedUsers = addUser(connectedUsers, user);
        socket.user = user;

        sendMessageToChatFromUser = sendMessageToChat(user.name);
        sendTypingFromUser = sendTypingToChat(user.name);

        io.emit(USER_CONNECTED, connectedUsers);
        console.log(connectedUsers);
    })

    // User Disconnects
    socket.on('disconnect', () => {
        if("user" in socket){
            connectedUsers = removeUser(connectedUsers, socket.user.name)
            
            io.emit(USER_DISCONNECTED, connectedUsers)
            console.log("List after User Disconnected: ", connectedUsers);
        }
    })

    // User logs out
    socket.on(LOGOUT, () => {
        connectedUsers = removeUser(connectedUsers, socket.user.name);
        io.emit(USER_DISCONNECTED, connectedUsers);
        console.log("List after User Disconnected: ", connectedUsers);
    })

    // Get Community Chat
    socket.on(COMMUNITY_CHAT, (callback) => {
        callback(communityChat);
    });

    socket.on(MESSAGE_SENT, ({chatId, message})=> {
        sendMessageToChatFromUser(chatId, message);
    });

    socket.on(TYPING, ({isTyping, chatId})=> {
        sendTypingFromUser(chatId, isTyping)
    })

    socket.on(PRIVATE_MESSAGE, ({receiver, sender, activeChat}) => {
        if(receiver in connectedUsers){
            const receiverSocket = connectedUsers[receiver].socketId
            if(activeChat === null || activeChat.id === communityChat.id){
                const newChat = createChat({name:`${receiver}&${sender}`, users:[receiver, sender]})
                socket.to(receiverSocket).emit(PRIVATE_MESSAGE, newChat);
                socket.emit(PRIVATE_MESSAGE, newChat)
            } else {
                if(!(receiver in activeChat.users)){
                    activeChat.users
                                .filter(user => user in connectedUsers)
                                .map(user => connectedUsers[user])
                                .map(user => {
                                    socket.to(user.socketId).emit(NEW_CHAT_USER, {chatId:activeChat.id, newUser:receiver})
                                })
                                socket.emit(NEW_CHAT_USER, {chatId:activeChat.id, newUser: receiver})
                }
                socket.to(receiverSocket).emit(PRIVATE_MESSAGE, activeChat)
            }
        }
    })
}



function sendTypingToChat(user){
    return (chatId, isTyping) =>{
        io.emit(`${TYPING}-${chatId}`, {user:user, isTyping:isTyping})
    }
}

// Send Message to chat

function sendMessageToChat(sender){
    return (chatId, message) => {
        io.emit(`${MESSAGE_RECEIVED}-${chatId}`, createMessage({message:message, sender:sender}))
    }
}



// Add user from the list

function addUser(userList, user){
    let newList = Object.assign({}, userList);
    newList[user.name] = user;
    return newList;
}

// Remove user from the list

function removeUser(userList, username){
    let newList = Object.assign({}, userList);
    delete newList[username]
    return newList;
}

// Check if the user is in list

function isUser(userList, username){
    return username in userList
}