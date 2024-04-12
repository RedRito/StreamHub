//automates the contentScraper
const cron = require("node-cron");
var scraper = require("./contentScraper");
var creatorList = require('./creatorList');

var i = 0;


exports.automateScrape = function(time){
    console.log("Starting Youtube Scraper");
    cron.schedule("*/20 * * * * *", function () {
        let creators = [];
        creators.push('https://www.youtube.com/@NatsuiroMatsuri/streams');
        creators.push('https://www.youtube.com/@Robocosan/streams');
        creators.push('https://www.youtube.com/@SakuraMiko/streams');
        creators.push('https://www.youtube.com/@HoshimachiSuisei/streams');
        creators.push('https://www.youtube.com/@AZKi/streams');
        // if(i == 0){
        //     creators.push(creatorList[i]);
        //     //console.log(creatorList[i]);
        //     i++;
        // }
        // else i++;
        // while(i % 10 != 0)
        // {
        //     if(i % creatorList.length == 0) break;
        //     creators.push(creatorList[i]);
        //     //console.log(creatorList[i]);
        //     i++;
        // }
        scraper.scrapeContent(creators);
        //i = i % 20;
        i = i % creatorList.length;
        //console.log(creators);
      });
}