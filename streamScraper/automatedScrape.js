//automates the contentScraper
const cron = require("node-cron");
var scraper = require("./contentScraper");
var creatorList = require('./creatorList');
var populate = require("./creatorPopulate");

var i = 0;


exports.automateScrape = function(time){
    console.log("Starting Youtube Scraper");
    cron.schedule("*/30 * * * * *", function () {
        let creators = [];
        if(i == 0){
            creators.push(creatorList[i]);
            //console.log(creatorList[i]);
            i++;
        }
        else i++;
        while(i % 10 != 0)
        {
            if(i % creatorList.length == 0) break;
            creators.push(creatorList[i]);
            //console.log(creatorList[i]);
            i++;
        }
        scraper.scrapeContent(creators);
        i = i % 20;
        // i = i % creatorList.length;
        // i++;
        //console.log(creators);
      });
}