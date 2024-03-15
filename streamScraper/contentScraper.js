// This is an API scraper that aims to make fetch requests to youtube
const axios = require('axios');
var mongoose = require('mongoose'); 
Creator = mongoose.model('Creator');

//used for timing
const ONEDAY = 864000;
const FIVEDAYS = ONEDAY * 5;
const ONEWEEK = ONEDAY * 7;

//need to update this function with rotating proxies
exports.scrapeContent = function(creatorList){
    console.log(creatorList);
    Promise.all(creatorList.map((creator) => axios.get(creator)))   //fetch all creator data in list
    .then((
        response
    ) => {    
        let creators = [];
        let creatorJsonData = [];
        response.map((response) => {creators.push(response.data)});
        //get JSON for all creators
        creators.map((creator) => {creatorJsonData.push(parseData(creator))});
        //calculate relevant data
        creatorJsonData.map((creator) => {console.log(getCreatorData(creator))});
        // TODO: Parse through JSON and collect relevant data
        creatorJsonData.map((creator) => {updateDatabase(getCreatorData(creator))});
    }).catch(function(error){
        console.log(error);
    });
}


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
    if(headers) 
    {
        creatorObj.canonicalName = headers.title;
        creatorObj.icon = headers.avatar.thumbnails[2].url;
    }
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
        else if(!content.upcomingEventData) creatorObj.streams.push(updateOngoingStream(content, creatorObj, streamObj));   //ongoing stream
        else creatorObj.streams.push(createNewStream(content, streamObj)); //create a new stream object, add to creator stream list
    }
    return creatorObj;
}

function getCurrentTime()
{
    return Math.floor(Date.now() / 1000).toString();
}

async function getStreamDb(creator, streamId){
    if(!creator.streams[0] || !creator.name) return;  // creator has no streams or no name invalid input
    //returns array with only 1 element or empty array (not found)
    const dbStream = await Creator.findOne({name: creator.name}).select(
        { streams: 
            { $elemMatch: 
                { streamId: streamId }
            }
        }
    );
    if(!dbStream.streams[0]) return; // stream not found return
    return dbStream.streams[0]; //return stream obj
}

async function getCreatorDb(creator){
    if(!creator.name) return; //Invalid creator return
    //returns creator object, else it returns null reference
    const dbCreator = await Creator.findOne({name: creator.name});
    return dbCreator; //return creator obj
}



function createNewStream(streamContent, streamObj)
{
    // if((streamContent.upcomingEventData.startTime - getCurrentTime()) > FIVEDAYS) return; //if stream is too far ahead in time //buggy dont do anything yet
    streamObj.unixTime = streamContent.upcomingEventData.startTime
    streamObj.streamId = streamContent.videoId;
    streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url; //subject to change, just size of thumbnail
    streamObj.title = streamContent.title.runs[0].text;
    streamObj.waiting = true;
    (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
    streamObj.lastUpdated = getCurrentTime();
    return streamObj;
}

function updateOldStream(streamContent, creator, streamObj) //little complicated needs to get database access
{



    return streamObj;
}


function updateOngoingStream(streamContent, creator, streamObj)
{
    // If streams are not found in database aka the upcoming stream was not fetched and created in the database
            // The "last updated" is not set and therefore we cannot tell how long the stream had been ongoing
    // First condition must check if streamObj is in database
    let stream = false;
    let streamDb;
    streamObj.streamId = streamContent.videoId;
    getStreamDb(creator, streamObj.streamId)
    .then((streams) => {
        (streams[0]) ? stream = true : stream = false;
        if(stream) streamDb = streams[0];
    }) //if no stream found
    .catch((err) => {console.log(err)});

    // ongoing stream but not previously found in database
    // create ongoing stream obj
    if(!stream){
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.watching = true;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }

    // New ongoing stream
    if(!streamDb.watching){
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.waiting = false;
        streamObj.watching = true;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }

    // Old ongoing stream
    streamObj.unixTime = streamDb.unixTime;
    streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
    streamObj.title = streamContent.title.runs[0].text;
    (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
    streamObj.lastUpdated = getCurrentTime();
    
    return streamObj;
}

function createDatabaseObj(creator)
{
    // Create a new database 
    // var NewCreator = new Creator(creator);
    // NewCreator.save();
}

function updateDatabase(creator)
{
    Creator.findOneAndUpdate(
        {name: creator.name},
        {$set: { streams: creator.streams }},
        {new: true}
        )
        .then()
        .catch((err) => {
            console.log(err);
        });
}