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
    // creatorData.push(creator2);
    // console.log(creatorData.length);
    // console.log("pushed creator data\n");
}).catch(function(error){
    console.log(error);
});

function parseData(creator){
    console.log(creator);
    
}
