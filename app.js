const fs = require('fs');
const fetch = require('node-fetch');
const process = require('process');

var svg_file = fs.createWriteStream("./luogu-elo-rating.svg");
config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
lang = JSON.parse(fs.readFileSync('lang.json', 'utf-8'));

if (config.uid <= 0) {
    console.error("config.uid <= 0");
    process.exit(1);
}

if (!['zh-CN', 'zh-TW', 'en-US'].includes(config.lang)) {
    console.error("config.lang is incorrect.");
    process.exit(1);
}

(async function () {
    var user = await fetch(`https://www.luogu.com.cn/user/${config.uid}`, {
        headers: [["x-luogu-type", "content-only"]]
    }).then(response => response.json()).then(res => res.currentData.user);
    svg_file.write('<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" style="cursor:default;user-select:none;">');
    svg_file.write('<style>rect{fill:#fff;stroke-width:.5px;stroke:#a5a5a5;}.user{fill:#5eb95e;}.rating{fill:#bc10f0;}.contest{fill:#109af0;}.item{fill:#3c5dd8;}</style>');
    svg_file.write('<rect width="350" height="150" rx="6" ry="6" />');
    svg_file.write(`<text x="15" y="30" style="font-size:18px;">${lang[config.lang].title}</text>`);
    svg_file.write(`<text x="15" y="60" class="item">${lang[config.lang].user}</text>`);
    svg_file.write(`<text x="100" y="60" class="user">${user.name} (${config.uid})</text>`);
    svg_file.write(`<text x="15" y="90" class="item">${lang[config.lang].rating}</text>`);
    svg_file.write(`<text x="100" y="90" class="rating">${user.elo.rating}</text>`);
    svg_file.write(`<text x="15" y="120" class="item">${lang[config.lang].contest}</text>`);
    svg_file.write(`<text x="100" y="120" class="contest">${user.elo.contest.name}</text>`);
    svg_file.write(`</svg>`);
})();
