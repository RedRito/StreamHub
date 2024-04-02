// This is an API scraper that aims to make fetch requests to youtube
const axios = require('axios');
var mongoose = require('mongoose'); 
Creator = mongoose.model('Creator');
Stream = mongoose.model('Stream');

//used for timing
const ONEDAY = 864000;
const FIVEDAYS = ONEDAY * 5;
const ONEWEEK = ONEDAY * 7;
const WEEK = 7;

//need to update this function with rotating proxies
exports.scrapeContent = function(creatorList){
    // console.log(creatorList);
    Promise.all(creatorList.map((creator) => axios.get(creator)))   //fetch all creator data in list
    .then((
        response
    ) => {    
        let creators = [];
        let creatorJsonData = [];
        response.map((response) => {creators.push(response.data)});
        //get JSON for all creators
        creators.map((creator) => {creatorJsonData.push(parseData(creator))});

        // Parse through JSON and collect relevant data
        // Update database or create a new creator obj
        creatorJsonData.map(
            async (creator) => {
                const data = await getCreatorData(creator);
                console.log(data);
                //first clean up creator streams 
                // await deleteCreatorOldStreams(creator[0].name);
                
                //loop through data
                data.map(async(stream) => {

                    //check if stream is in database
                    const ifStream = await getStreamDb(stream.streamId);
                    if(!ifStream)
                    {
                        await createDatabaseStreamObj(stream);
                    }
                    else await updateDatabase(stream);
                })
            }
        );

    }).catch(function(error){
        console.log("THERES AN ERR");
        console.log(error);
    });
}


//Parses and returns a JSON of ytInitialData
function parseData(creator){
    //first stringify the data
    let stringified = JSON.stringify(creator);

    // Then slice till start of needed data
    let start = stringified.indexOf("var ytInitialData = {");
    let sliced = stringified.slice(start);

    // Next slice till end of data
    start = sliced.indexOf("{");
    let end = sliced.indexOf(";</script>");
    let data = sliced.slice(start, end);
    // Need to turn it into a string to be jsonified
    let finished = "\"".concat(data).concat("\"");
    // Must be parsed twice for proper data, else errors in format
    let jsonified = JSON.parse(finished);  
    let jsonified2 = JSON.parse(jsonified);
    return jsonified2;
}

// async function getCreatorData(creator)
// {
//     let creatorObj = { name: "", canonicalName: "", icon: "", streams: [] };

//     let headers = creator.header.c4TabbedHeaderRenderer
//     if(headers) 
//     {
//         //canonical name and icon
//         creatorObj.canonicalName = headers.title;
//         creatorObj.icon = headers.avatar.thumbnails[2].url;
//     }
//     let main = creator.contents.twoColumnBrowseResultsRenderer.tabs
//     //creator name
//     creatorObj.name = main[0].tabRenderer.endpoint.browseEndpoint.canonicalBaseUrl

//     console.log(creatorObj.name);

//     // 30 streams from JSON last item in contents is for rendering
//     let streamContent = main[3].tabRenderer.content.richGridRenderer.contents
//     for(let i = 0; i < 30; i++)
//     {
//         if(!streamContent[i].richItemRenderer) break;   //end of stream content
//         let streamObj = {
//             streamId: "",
//             unixTime: "",
//             title: "",
//             thumbnail: "",
//             watching: false,
//             waiting: false,
//             amount: "",
//             lastUpdated: ""
//         }
//         let content = streamContent[i].richItemRenderer.content.videoRenderer;
//         if(content.publishedTimeText) 
//         {
//             await updateOldStream(content, creatorObj, streamObj);       
//             if(streamObj.streamId.length != 0){
//                 creatorObj.streams.push(streamObj);     //If stream is past, send to update
//                 // console.log(streamObj);
//             } 
//         }
//         else if(!content.upcomingEventData)
//         {
//             await updateOngoingStream(content, creatorObj, streamObj);
//             if(streamObj.streamId.length != 0){
//                 creatorObj.streams.push(streamObj);     
//                 // console.log(streamObj);
//             } 
//         }
//         else creatorObj.streams.push(createNewStream(content, streamObj)); //create a new stream object, add to creator stream list //NO NEED TO BE ASYNC
//     }
//     return creatorObj;
// }

async function getCreatorData(creator)
{
    let streamsList = [];

    let headers = creator.header.c4TabbedHeaderRenderer;
    let main = creator.contents.twoColumnBrowseResultsRenderer.tabs;

    // 30 streams from JSON last item in contents is for rendering
    let streamContent = main[3].tabRenderer.content.richGridRenderer.contents

    for(let i = 0; i < 15; i++)
    {
        if(!streamContent[i].richItemRenderer) break;   //end of stream content
        let streamObj = { 
            name: "", 
            canonicalName: "", 
            icon: "", 
            company: "",
            streamId: "",
            unixTime: null,
            title: "",
            thumbnail: "",
            watching: false,
            waiting: false,
            amount: "",
            lastUpdated: null
        }

        if(headers) 
        {
            //canonical name and icon
            streamObj.canonicalName = headers.title;
            streamObj.icon = headers.avatar.thumbnails[2].url;
        }
        //creator name
        streamObj.name = main[0].tabRenderer.endpoint.browseEndpoint.canonicalBaseUrl;

        // current stream content in scraped streams array
        let content = streamContent[i].richItemRenderer.content.videoRenderer;

        if(content.publishedTimeText) 
        {
            await updateOldStream(content, streamObj);    // NEW IMPLEMENTATION

            if(streamObj.streamId.length != 0){
                streamsList.push(streamObj);     //If stream is past, send to update
                // console.log(streamObj);
            } 
        }
        else if(!content.upcomingEventData)
        {
            await updateOngoingStream(content, streamObj);    // NEW IMPLEMENTATION
            if(streamObj.streamId.length != 0){
                streamsList.push(streamObj);     
                // console.log(streamObj);
            } 
        }
        else streamsList.push(createNewStream(content, streamObj)); //create a new stream object, add to creator stream list

    }
    return streamsList;
}

// Get current epoch time in miliseconds.
function getCurrentTime()
{
    return Math.floor(Date.now() / 1000);
}

// Fetches and returns streamObj, else it returns null
async function getStreamDb(streamId){
    if(!streamId) return;  //no id invalid input
    const dbStream = await Stream.findOne({streamId: streamId});
    // Debugging
    // console.log(streamId);
    // console.log(dbStream);
    if(!dbStream) return; // stream not found return
    return dbStream; //return stream obj
}

// fetches and returns creator object, else it returns null reference
async function getCreatorDb(creator){
    if(!creator.name) return; //Invalid creator return
    const dbCreator = await Stream.find({name: creator.name});
    return dbCreator; //return creator obj
}


function createNewStream(streamContent, streamObj) // NEW
{
    streamObj.unixTime = parseInt(streamContent.upcomingEventData.startTime, 10); //convert to Number
    streamObj.streamId = streamContent.videoId;
    streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url; //subject to change, just size of thumbnail
    streamObj.title = streamContent.title.runs[0].text;
    streamObj.waiting = true;
    (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
    streamObj.lastUpdated = getCurrentTime();
    return streamObj;
}

// Gets old VOD stream data and updates streamObj
async function updateOldStream(streamContent, streamObj) 
{
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
    const streamDb = await getStreamDb(streamObj.streamId);

    if(!streamDb) notInDb();
    else inDb(streamDb);

    function notInDb(){
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.simpleText.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
    function inDb(streamDb)
    {
        (streamDb.watching || streamDb.waiting) ? streamObj.unixTime = getCurrentTime() : streamObj.unixTime = streamDb.unixTime;   //if new to becoming old stream and stream is found in database
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[1].url;
        streamObj.title = streamContent.title.runs[0].text;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.simpleText.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
}

// Gets ongoing stream data and updates streamObj
async function updateOngoingStream(streamContent, streamObj)
{
    // Else existing creator, update streamobj
    streamObj.streamId = streamContent.videoId;
    const streamDb = await getStreamDb(streamObj.streamId);
    // console.log(streamDb);
    if(!streamDb) notInDb();
    else if(!streamDb.watching) newInDb();
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
    function newInDb(){
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


// Create a new database stream obj
function createDatabaseStreamObj(data)
{
    var newStream = new Stream(data);
    newStream.save();
}
//TODO how do we update / delete old streams 
// one way to do it is to get all creators, check through their streams and delete ones that dont match requirements

// Updates database
async function updateDatabase(stream)
{
    try{
        await Stream.findOneAndUpdate(
            {streamId: stream.streamId},
            stream,
            {new: true}
            );
    }
    catch(err){
        console.log(err);
    }
}
// Updates database
// async function updateDatabase(creator)
// {
//     try{
//         await Creator.findOneAndUpdate(
//             {name: creator.name},
//             {$set: { streams: creator.streams }},
//             {new: true}
//             );
//     }
//     catch(err){
//         console.log(err);
//     }
// }