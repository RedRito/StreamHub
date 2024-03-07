// This is an API scraper that aims to make fetch requests to youtube
// Limits 
// import axios from 'axios'
const axios = require('axios');
var creatorList = require('./creatorList');
// var creatorList = [
//     'https://www.youtube.com/@SakuraMiko/streams',
//     'https://www.youtube.com/@HakuiKoyori/streams'
// ];

var creatorData = [];

Promise.all(creatorList.map((creator) => axios.get(creator)))
.then((
    [
        {data: creator1}
        //{data: creator2}
    ]
) => {    
    creatorData.push(creator1);
    parseData(creator1);
    //loopThroughJSON(creator1);
    // creatorData.push(creator2);
    // console.log(creatorData.length);
    // console.log("pushed creator data\n");
}).catch(function(error){
    console.log(error);
});

function parseData(creator){
    //first stringify the data
    var stringified = JSON.stringify(creator);

    var start = stringified.indexOf("var ytInitialData = {");
    
    // console.log(start);
    var sliced = stringified.slice(start);
    //next slice till end of data
    start = sliced.indexOf("{");
    var end = sliced.indexOf(";</script>");
    console.log(start);
    console.log(end);
    var data = sliced.slice(start, end);
    //need to turn it into a string
    var finished = "\"";
    finished = finished.concat(data).concat("\"");
    // console.log(finished);
    // console.log("END\n");
    var jsonified = JSON.parse(finished);
    var jsonified2 = JSON.parse(jsonified);
    console.log(jsonified2.contents);
}
function loopThroughJSON(obj) {
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          // loop through array
          for (let i = 0; i < obj[key].length; i++) {
            loopThroughJSON(obj[key][i]);
          }
        } else {
          // call function recursively for object
          loopThroughJSON(obj[key]);
        }
      } else {
        // do something with value
        console.log(key + ': ' + obj[key]);
      }
    }
  }