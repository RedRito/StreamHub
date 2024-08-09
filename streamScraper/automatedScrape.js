//automates the contentScraper
const cron = require("node-cron");
var scraper = require("./contentScraper");
var creatorList = require('./creatorList');

var i = 0;


exports.automateScrape = function(time){
    console.log("Starting Youtube Scraper");
    cron.schedule("*/30 * * * * *", function () {
        let creators = [];
        if(!creatorList && creatorList.length) return;
        creators.push(creatorList[i]);
        i++;
        while(i % 10 != 0)
        {
            if(i % creatorList.length == 0) break;
            creators.push(creatorList[i]);
            i++;
        }
        scraper.deleteContent();
        scraper.scrapeContent(creators);
        //TODO: add error checking and rescraping the same creators if err
        i = i % creatorList.length;
        //console.log(creators);
      });
}