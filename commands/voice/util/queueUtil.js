
const checkQueue = () => {
    if (!global.audioQueue) {
        global.audioQueue = [];
    }
}

const getQueue = () => {
    checkQueue();
    return global.audioQueue;
}

const isQueueEmpty = () => {
    checkQueue();
    return global.audioQueue.length < 1;
}

const addToQueue = (url) => {
    checkQueue();
    global.audioQueue.push(url);
}

const addPlaylist = (playlist) => {
    checkQueue();
    global.audioQueue = global.audioQueue.concat(playlist);
}

const clearQueue = () => {
    global.audioQueue = [];
}

// Fisher–Yates shuffle
const shuffleQueue = () => {
    let currentIndex = global.audioQueue.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [global.audioQueue[currentIndex], global.audioQueue[randomIndex]] = [
        global.audioQueue[randomIndex], global.audioQueue[currentIndex]];
    }
}

module.exports = { getQueue, isQueueEmpty, addToQueue, addPlaylist, shuffleQueue, clearQueue }