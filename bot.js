const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const fetch = require("node-fetch");
const ytLinkStart = "https://www.youtube.com/watch?v=";

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
let bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    bot.setPresence({
        game: {
            name: "Testing!"
        }
    });
});

bot.on('message', (user, userID, channelID, message, evt) =>{
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];
       
        args = args.splice(1);
        switch(cmd.toLowerCase()) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            case 'youtube':
                getLatestVideos(channelID);              
            break;
            case 'off':
                bot.disconnect();              
            break;
            // Just add any case commands if you want to..
         }
     }
});

function getLatestVideos(channelID, nReq) {
    // nReq > 10 ? nReq = 10 : nReq;
    nReq = 1;

    fetch(`https://www.googleapis.com/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=UCQBs359lwzyVFtc22LzLjuw&maxResults=${nReq}&key=${auth.ytAPIToken}`)
    .then((res) => res.json())
    .then((data) => {
        data.items.forEach(video => {
            bot.sendMessage({
                to: channelID,
                message: `**${video.snippet.title}**
                ${ytLinkStart}${video.contentDetails.upload.videoId}`
            });
        });
    })
    .catch((err) => bot.sendMessage({to: channelID, message: `Error: ${err}`}));
}