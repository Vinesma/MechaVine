const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const fetch = require("node-fetch");
const fs = require('fs');
const ytLinkStart = "https://www.youtube.com/watch?v=";
let commList = [];

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

    buildCommList();

    bot.setPresence({
        game: {
            name: "Testing!"
        }
    });
});

bot.on('message', (user, userID, channelID, message, evt) =>{
    if (userID === bot.id) return;
    
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];
           
        args = args.splice(1);
        switch(cmd.toLowerCase()) {
            case 'ping':
                sndMsg(channelID, 'Pong!');                
            break;
            case 'youtube':
                getLatestVideos(channelID);              
            break;
            case 'random':
                sndMsg(channelID, `${getRandomInt(0, 100)}`);
            break;
            case 'help':
                let msg = '';
                commList.forEach(item => {
                    msg += item + '\n';
                });
                sndMsg(channelID, msg);
            break;
            case 'off':
                // sndMsg(channelID, `Going to sleep...`);
                bot.disconnect();
            break;
        }
    } 
});

function ytVideo(id, title){
    this.id = id;
    this.title = title;
}

function getLatestVideos(channelID) {
    // nReq > 10 ? nReq = 10 : nReq;
    nReq = 3;
    videoList = [];

    fs.readFile('./storage/videoList.json', (err, jsonData) => {
        if (!err){
            try{
                oldVideoList = JSON.parse(jsonData);
                logger.info(oldVideoList); 
            }catch (error){
                logger.error(`Error parsing: ${error}`);
            }                     
        }else {
            logger.error(`Error reading data: ${err}`);
        }
    });

    fetch(`https://www.googleapis.com/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=UCQBs359lwzyVFtc22LzLjuw&maxResults=${nReq}&key=${auth.ytAPIToken}`)
        .then((res) => res.json())
        .then((data) => {
            data.items.forEach(video => {
                sndMsg(channelID, `**${video.snippet.title}**
                ${ytLinkStart}${video.contentDetails.upload.videoId}`);                
                videoList.push(new ytVideo(video.contentDetails.upload.videoId, video.snippet.title));
            });
            fs.writeFile('./storage/videoList.json', JSON.stringify(videoList), err => {
                logger.error(`(possibly harmless) Error: ${err}`);
            });
        })
        .catch((err) => sndMsg(channelID, `Error: ${err}`));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function sndMsg(ch, msg){
    bot.sendMessage({
        to: ch,
        message: msg
    });
}

function buildCommList(){
    commList.push('**COMMAND LIST**');
    commList.push('!ping : Returns "Pong!", play with the bot!');
    commList.push('!youtube : Returns 3 of the latest yogsLive videos.');
    commList.push('!random : Returns a random number between 0 and 100.');
    commList.push('!help : Returns this help message.');
    commList.push('!off : Turns off the bot.');
}