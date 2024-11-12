
const checkQueue = () => {
    if (!global.audioQueue) {
        global.audioQueue = [];
    }
}

const getQueue = () => {
    checkQueue();

    return global.audioQueue;
}

const addToQueue = (url) => {
    checkQueue();

    global.audioQueue.push(url);
}

module.exports = { getQueue, addToQueue }