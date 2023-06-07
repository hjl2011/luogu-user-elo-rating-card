const fs = require('fs');
const fetch = require('node-fetch');
const process = require('process');

config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
lang = JSON.parse(fs.readFileSync('lang.json', 'utf-8'));

if (new Date(config.time).valueOf() + 60000 > new Date().valueOf()) {
    console.log("Please wait 1min.");
    process.exit(0);
}

if (config.uid <= 0) {
    console.error("config.uid <= 0");
    process.exit(1);
}

if (!['zh-CN', 'zh-TW'].includes(config.lang)) {
    console.error("config.lang is incorrect.");
    process.exit(1);
}

var svg_file = fs.createWriteStream(config.path);

function Date_Format(date) {
    var str = date.getFullYear();
    if (date.getMonth() + 1 < 10) str += `-0${date.getMonth() + 1}`;
    else str += `-${date.getMonth() + 1}`;
    if (date.getDate() < 10) str += `-0${date.getDate()}`;
    else str += `-${date.getDate()}`;
    if (date.getHours() < 10) str += ` 0${date.getHours()}`;
    else str += ` ${date.getHours()}`;
    if (date.getMinutes() < 10) str += `:0${date.getMinutes()}`;
    else str += `:${date.getMinutes()}`;
    if (date.getSeconds() < 10) str += `:0${date.getSeconds()}`;
    else str += `:${date.getSeconds()}`;
    return str;
}

(async function () {
    var user = await fetch(`https://www.luogu.com.cn/user/${config.uid}`, {
        headers: [["x-luogu-type", "content-only"]]
    }).then(response => response.json()).then(res => res.currentData.user);
    svg_file.write(`<svg width="${null == user.elo ? 300 : Math.max(350, 13 * user.elo.contest.name.length + 40)}" height="${null == user.elo ? 80 : (190 + (config['enable-show-history-maxvalue'] ? 30 : 0))}" version="1.1" xmlns="http://www.w3.org/2000/svg" style="cursor:default;user-select:none;">`);
    if(!config.darkmode) svg_file.write('<style>rect{fill:#fff;stroke-width:.75px;stroke:#a5a5a5;}.title{font-size:18px;fill:#333;}.user{fill:#5eb95e;}.rating{fill:#bc10f0;}.contest{fill:#109af0;}.time{fill:#ea7a13;}.item{fill:#3c5dd8;}.error{fill:#f01111;}</style>');
    else svg_file.write('<style>rect{fill:#666;stroke-width:.75px;stroke:#a5a5a5;}.title{font-size:18px;fill:#eee;}.user{fill:#5eb95e;}.rating{fill:#ffe65b;}.contest{fill:#109af0;}.time{fill:#26ea13;}.item{fill:#58ead2;}.error{fill:#f01111;}</style>');
    svg_file.write('<rect width="100%" height="100%" rx="6" ry="6" />');
    svg_file.write(`<text x="15" y="30" class="title">${lang[config.lang].title}</text>`);
    if(null == user.elo) {
        svg_file.write(`<text x="15" y="60" class="error">${lang[config.lang].errorinfo}</text>`);
    } else {
        svg_file.write(`<text x="15" y="60" class="item">${lang[config.lang].user}</text>`);
        svg_file.write(`<text x="100" y="60" class="user">${user.name} (${config.uid})</text>`);
        svg_file.write(`<text x="15" y="90" class="item">${lang[config.lang].rating}</text>`);
        svg_file.write(`<text x="100" y="90" class="rating">${user.elo.rating}</text>`);
        svg_file.write(`<text x="15" y="120" class="item">${lang[config.lang].contest}</text>`);
        svg_file.write(`<text x="100" y="120" class="contest">${user.elo.contest.name}</text>`);
        svg_file.write(`<text x="15" y="150" class="item">${lang[config.lang].time}</text>`);
        svg_file.write(`<text x="100" y="150" class="time">${Date_Format(new Date(user.elo.time * 1000))}</text>`);
        if (config['enable-show-history-maxvalue']) {
            var api = await fetch(`https://www.luogu.com.cn/api/rating/elo?user=${config.uid}`, {
                headers: [["x-luogu-type", "content-only"]]
            }).then(response => response.json()).then(res => res.records.result);
            maxr = -0x7f7f7f7f;
            for (var i = 0; i < api.length; i++) {
                if (api[i].rating > maxr) maxr = api[i].rating;
            }
            svg_file.write(`<text x="15" y="180" class="item">${lang[config.lang].historymax}</text>`);
            svg_file.write(`<text x="100" y="180" class="rating">${maxr}</text>`);
        }
        svg_file.write(`<text x="${100 + ((13 * user.elo.contest.name.length + 40 - 350) > 0 ? (13 * user.elo.contest.name.length + 40 - 350) : 0)}" y="${175 + (config['enable-show-history-maxvalue'] ? 30 : 0)}" style="fill: ${config.darkmode ? '#eee' : '#999'};font-size: 14px;">${lang[config.lang].card_generation_time}${Date_Format(new Date())}</text>`);
    }
    svg_file.write('</svg>');
    config.time = Date_Format(new Date());
    fs.writeFile('config.json', JSON.stringify(config, null, 4), function (err) {
        if (!err) return;
        console.error(err);
        process.exit(1);
    });
})();
