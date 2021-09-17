# Zounds
A music bot for Discord that plays youtube videos in voice channels

## Requirements
1. Node.js v14 [[download here]](https://nodejs.org/en/)
2. Discord.js & dependencies 
```
    npm i discord.js @discordjs/builders @discordjs/rest @discordjs/voice discord-api-types youtube-dl ytdl-core ytdl-core-discord ytsr ytpl ffmpeg-static prism-media shuffle-array
```

## Important
> **DO NOT SHARE THE TOKEN IN CONFIG.JSON**

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
- [x] Basic functionality (/help, send message, connect voice channel)
- [x] Play youtube videos (url + auto search with keywords + playlist)
- [ ] Search youtube videos (list out videos and take in reply as input)
- [x] Pause/Resume
- [x] Queue list (add to queue, view queue, remove from queue)
- [x] Clear queue
- [x] Skip currently playing

# Documentation
1. [Discord.js guide](https://discordjs.guide/)
2. [Interaction commands (for bot sending messages and stuff)](https://discord.js.org/#/docs/main/stable/class/CommandInteraction)
3. [Youtube api for discord](https://www.npmjs.com/package/ytdl-core-discord)
4. [Youtube search api](https://www.npmjs.com/package/ytsr)
5. [Youtube playlist api](https://www.npmjs.com/package/ytpl)