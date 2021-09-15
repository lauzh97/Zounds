# Zounds
A music bot for Discord that plays youtube videos in voice channels

## Requirements
1. Node.js [[download here]](https://nodejs.org/en/)
2. Discord.js & dependencies 
```
    npm install discord.js @discordjs/builders @discordjs/rest discord-api-types
```

## Important
```DO NOT SHARE THE TOKEN IN CONFIG.JSON```

<br>

# Usage
## Registering commands 
This is required only when you add or edit existing commands <br>
```
    node register-command.js
```

## Running the bot
Open a terminal in this directory and run <br>
```
    node index.js
```

<br>

# TODO
1. Basic functionality (/help, send message, connect voice channel)
2. Play youtube videos (url + auto search with keywords + playlist)
3. Search youtube videos (list out videos and take in reply as input)
4. Pause/Resume
5. Queue list (add to queue, view queue, remove from queue)
6. Clear queue
7. Skip currently playing

# Documentation
1. [Discord.js guide](https://discordjs.guide/)
2. [Interaction commands (for bot sending messages and stuff)](https://discord.js.org/#/docs/main/stable/class/CommandInteraction)
3. [Youtube api (core)](https://www.npmjs.com/package/ytdl-core)
4. [Youtube api for discord](https://www.npmjs.com/package/ytdl-core-discord)
5. [Youtube search api](https://www.npmjs.com/package/ytsearch)
6. [Youtube playlist api](https://www.npmjs.com/package/ytpl)