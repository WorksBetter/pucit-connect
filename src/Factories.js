const {v4: uuidv4} = require('uuid');

// Create User

const createUser = ({name="", socketId=null} = {}) => (
     {
        id: uuidv4(),
        name: name,
        socketId: socketId
    }
)

// Create Message

const createMessage = ({message="", sender=""} = {}) => (
    {
        id: uuidv4(),
        time: getTime(new Date(Date.now())),
        message: message,
        sender: sender
    }
)

// Create Chat

const createChat = ({messages=[], name="Community", users=[], isCommunity=false} = {}) => (
    {
        id: uuidv4(), 
        name: isCommunity ? "Community" : createChatNameFromUsers(users),
        messages: messages,
        users: users,
        typingUsers: [],
        isCommunity: isCommunity
    }
)


const createChatNameFromUsers = (users, excludedUser="") => {
    return users.filter(u => u !== excludedUser).join(' & ') || "Empty Users";
}

// Get and return date in 24hr time i.e. '11:30', '19:30'

const getTime = (date) => {
    return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
}

module.exports = {
    createMessage,
    createUser,
    createChat,
    createChatNameFromUsers
}