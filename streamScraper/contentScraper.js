// This is an API scraper that aims to make fetch requests to youtube
const axios = require('axios');
//var creatorList = require('./creatorList');
var mongoose = require('mongoose');  //used for database access
Creator = mongoose.model('Creator'); //creator model


// states
//  input(stream) -> s0(getCreatorName) -(streamType)> s1(upcomingStream), s2(oldStream), s3(ongoingStream)
//  s1(upcomingStream) -streamData> s4(updateDatabase)
//  s2(oldStream) -streamData> s4
//  s3 -> s4
//  s4(updateDatabase) -> output
exports.scrapeContent = function(creatorList){
    console.log(creatorList);
    Promise.all(creatorList.map((creator) => axios.get(creator)))
    .then((
        response
    ) => {    
        let creators = [];
        let creatorJsonData = [];
        response.map((response) => {creators.push(response.data)});

        //get JSON for all creators
        creators.map((creator) => {creatorJsonData.push(parseData(creator))});
        //console.log(creatorJsonData);


        creatorJsonData.map((creator) => { console.log(getCreatorData(creator))});


        // let temp = getCreatorData(creatorJsonData[0]);
        // console.log(temp);
        //updateDatabase(temp);
        // TODO: Parse through JSON and collect relevant data
        // TODO: Update database
        creatorJsonData.map((creator) => {updateDatabase(getCreatorData(creator))});
        

    }).catch(function(error){
        console.log(error);
    });
}

// Promise.all(creatorList.map((creator) => axios.get(creator)))
// .then((
//     response
// ) => {    
//     let creators = [];
//     let creatorJsonData = [];
//     response.map((response) => {creators.push(response.data)});

//     //get JSON for all creators
//     creators.map((creator) => {creatorJsonData.push(parseData(creator))});
//     //console.log(creatorJsonData);
//     creatorJsonData.map((creatorJSON) => {console.log(getCreatorData(creatorJSON))});
//     // let temp = getCreatorData(creatorJsonData[0]);
//     // console.log(temp);
//     //updateDatabase(temp);
//     // TODO: Parse through JSON and collect relevant data
//     // TODO: Update database
//     // creatorJsonData.map((creator) => {updateDatabase(getCreatorData(creator))});
    

// }).catch(function(error){
//     console.log(error);
// });

//Parses and returns a JSON of ytInitialData
function parseData(creator){
    //first stringify the data
    let stringified = JSON.stringify(creator);

    let start = stringified.indexOf("var ytInitialData = {");

    // console.log(start);
    let sliced = stringified.slice(start);
    //next slice till end of data
    start = sliced.indexOf("{");
    let end = sliced.indexOf(";</script>");
    let data = sliced.slice(start, end);
    //need to turn it into a string
    let finished = "\"".concat(data).concat("\"");
    let jsonified = JSON.parse(finished);
    let jsonified2 = JSON.parse(jsonified);
    return jsonified2;
    //console.log(jsonified2.contents.twoColumnBrowseResultsRenderer.tabs[3].tabRenderer);
}

function getCreatorData(creator)
{
    let creatorObj = { name: "", canonicalName: "", icon: "", streams: [] };

    let headers = creator.header.c4TabbedHeaderRenderer
    creatorObj.canonicalName = headers.title;
    creatorObj.icon = headers.avatar.thumbnails[2].url;

    let main = creator.contents.twoColumnBrowseResultsRenderer.tabs
    
    creatorObj.name = main[0].tabRenderer.endpoint.browseEndpoint.canonicalBaseUrl

    console.log(creatorObj.name);

    // 30 streams from JSON last item in contents is for rendering
    let streamContent = main[3].tabRenderer.content.richGridRenderer.contents
    for(let i = 0; i < 30; i++)
    {
        if(!streamContent[i].richItemRenderer) break;   //end of stream content
        let streamObj = {
            streamId: "",
            unixTime: "",
            title: "",
            thumbnail: "",
            watching: false,
            waiting: false,
            amount: "",
            lastUpdated: ""
        }
        let content = streamContent[i].richItemRenderer.content.videoRenderer;
        if(content.publishedTimeText) continue;    //If stream is past, send to update
        else if(!content.upcomingEventData) continue;   //ongoing stream
        else creatorObj.streams.push(createNewStream(content, streamObj)); //create a new stream object, add to creator stream list
    }
    return creatorObj;
}

function getCurrentTime()
{
    return Math.floor(Date.now() / 1000).toString();
}

function createNewStream(streamContent, streamObj)
{
    streamObj.streamId = streamContent.videoId;
    streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url; //subject to change, just size of thumbnail
    streamObj.title = streamContent.title.runs[0].text;
    streamObj.unixTime = streamContent.upcomingEventData.startTime; //if there is upcoming event data then stream must be waiting
    streamObj.waiting = true;
    (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
    streamObj.lastUpdated = getCurrentTime();
    return streamObj;
}

function updateOldStream(streamContent, streamObj) //little complicated needs to get database access
{

    return streamObj;
}


function updateOngoingStream(streamContent, streamObj)
{

    return streamObj;
}

function populateDatabase(creatorList)
{
    
}

function updateDatabase(creator)
{
    creator = Creator();
    creator.save();
    // var NewCreator = new Creator(creator);
    // NewCreator.save();
}

// var headers = {
    //     'Content-Type' : 'application/json; charset=UTF-16'
    // }
    // let test = {
    //     name: creator.name,
    //     canonicalName: "KOYORI",
    //     icon: "EMPTY",
    //     streams: creator.streams
    // };
    // // axios({
    // //     method: 'post',
    // //     url: 'http://localhost:3000/home',
    // //     body: test
    // // }).then(res => console.log(res.data));
    // //console.log(JSON.stringify(test));
    // axios.post("http://localhost:3000/home", test, headers).then(res => console.log(res.data));
    // console.log("Update finished");