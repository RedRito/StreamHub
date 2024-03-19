// This is an API scraper that aims to make fetch requests to youtube
const axios = require('axios');
var mongoose = require('mongoose'); 
Creator = mongoose.model('Creator');

//used for timing
const ONEDAY = 864000;
const FIVEDAYS = ONEDAY * 5;
const ONEWEEK = ONEDAY * 7;
const WEEK = 7;

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
        // creatorJsonData.map((creator) => {getCreatorData(creator)});
        //creatorJsonData.map((creator) => {getCreatorData(creator).then((res)=> {console.log(res)})});
        // TODO: Parse through JSON and collect relevant data
        creatorJsonData.map(
            async (creator) => {
                const data = await getCreatorData(creator);
                await updateDatabase(data);
            }
        );
        // creatorJsonData.map((creator) => {updateDatabase(getCreatorData(creator))});
    }).catch(function(error){
        console.log("THERES AN ERR");
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

async function getCreatorData(creator)    //NEEDS TO BE ASYNC
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
        if(content.publishedTimeText) 
        {
            await updateOldStream(content, creatorObj, streamObj);        //ASYNC OR PROBLEMS
            if(streamObj.streamId.length != 0){
                creatorObj.streams.push(streamObj);     //If stream is past, send to update
                // console.log(streamObj);
            } 
        }
        else if(!content.upcomingEventData)
        {
            await updateOngoingStream(content, creatorObj, streamObj);
            if(streamObj.streamId.length != 0){
                creatorObj.streams.push(streamObj);     
                // console.log(streamObj);
            } 
        }
        // creatorObj.streams.push(updateOngoingStream(content, creatorObj, streamObj));//ongoing stream       //NO PROBLEMS BUT MUST BE ASYNC
        else creatorObj.streams.push(createNewStream(content, streamObj)); //create a new stream object, add to creator stream list //NO NEED TO BE ASYNC
    }
    return creatorObj;
}

function getCurrentTime()
{
    return Math.floor(Date.now() / 1000).toString();
}

async function getStreamDb(creator, streamId){
    if(!creator.name) return;  //no name invalid input
    //returns array with only 1 element or empty array (not found)
    const dbStream = await Creator.findOne({name: creator.name}).select(
        { streams: 
            { $elemMatch: 
                { streamId: streamId }
            }
        }
    );
    // console.log(creator.name);
    // console.log(streamId);
    // console.log(dbStream);
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

async function updateOldStream(streamContent, creator, streamObj) //little complicated needs to get database access
{
    // Old stream is not in database
    // Constraint is that if stream is very old (5-7 days) we remove it
    // Create a new old stream
        // 2 sub conditions
            // old stream is not in database and not ongoing or upcoming stream
            // old stream is in database and was ongoing or upcoming stream
    let streamTime = streamContent.publishedTimeText.simpleText;
    // calculate stream past date
    let one = streamTime.indexOf("Streamed");
    let two = streamTime.indexOf("ago");
    streamTime = streamTime.slice(one, two);
    
    let middle;
    if(streamTime.includes("week") || streamTime.includes("month") || streamTime.includes("year")) return;
    if(streamTime.includes("days")) middle = streamTime.indexOf("days");
    streamTime = parseInt(streamTime.slice(0, middle), 10); //get number value
    if(streamTime >= WEEK) return; // Stream too far return empty obj

    
    //get stream from db
    streamObj.streamId = streamContent.videoId;
    const streamDb = await getStreamDb(creator, streamObj.streamId);
    if(!streamDb) notInDb();
    else inDb(streamDb);
    // console.log(streamObj.streamId);
    // getStreamDb(creator, streamObj.streamId)
    // .then((streams) => {
    //     // console.log("OLD STREAM " + streams);
    //     // console.log(streams.streamId);
    //     // console.log(streams);
    //     streamDb = streams;
    //     if(!streams) notInDb();
    //     else inDb(streams);
    // })
    // .catch((err) => {console.log(err)});

    function notInDb(){
        //console.log("NEW OLD STREAM");
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.simpleText.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        //console.log(streamObj);
        return streamObj;
    }
    function inDb(streamDb)
    {
        (streamDb.watching || streamDb.waiting) ? streamObj.unixTime = getCurrentTime() : streamObj.unixTime = streamDb.unixTime;   //if new to becoming old stream and stream is found in database
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.simpleText.toString() : streamObj.amount = '0';
        //console.log("OLD STREAM");
        
        streamObj.lastUpdated = getCurrentTime();
        //console.log(streamObj);
        return streamObj;
    }
}


async function updateOngoingStream(streamContent, creator, streamObj)
{
    // If streams are not found in database aka the upcoming stream was not fetched and created in the database
            // The "last updated" is not set and therefore we cannot tell how long the stream had been ongoing
    // First condition must check if streamObj is in database
    streamObj.streamId = streamContent.videoId;
    const streamDb = await getStreamDb(creator, streamObj.streamId);
    // console.log(streamDb);
    if(!streamDb) notInDb();
    else if(!streamDb.watching) newInDb(streamDb);
    else oldInDb(streamDb);
    function notInDb(){
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.watching = true;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
    function newInDb(streamDb){
        // New ongoing stream
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.waiting = false;
        streamObj.watching = true;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
    function oldInDb(streamDb){
        // Old ongoing stream
        streamObj.unixTime = streamDb.unixTime;
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.watching = true;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
    
}

function createDatabaseObj(creator)
{
    // Create a new database 
    // var NewCreator = new Creator(creator);
    // NewCreator.save();
}

async function updateDatabase(creator)    //should also be async for clarity
{
    try{
        await Creator.findOneAndUpdate(
            {name: creator.name},
            {$set: { streams: creator.streams }},
            {new: true}
            );
    }
    catch(err){
        console.log(err);
    }
    // Creator.findOneAndUpdate(
    //     {name: creator.name},
    //     {$set: { streams: creator.streams }},
    //     {new: true}
    //     )
    //     .then()
    //     .catch((err) => {
    //         console.log(err);
    //     });
}