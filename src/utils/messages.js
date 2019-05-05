const generateMessage = (text) => {
    return {
        text,
        createAt: new Date().getTime()
    }
}

const generateLocationMessage= (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}