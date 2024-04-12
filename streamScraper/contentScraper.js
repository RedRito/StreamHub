// This is an API scraper that aims to make fetch requests to youtube
const axios = require('axios');
var mongoose = require('mongoose'); 
Creator = mongoose.model('Creator');
Stream = mongoose.model('Stream');

//used for timing
const ONEDAY = 86400;
const ONEMINUTE = 60;
const ONESECOND = 1;
const ONEHOUR = 3600;
const FIVEDAYS = ONEDAY * 5;
const ONEWEEK = ONEDAY * 7;
const WEEK = 7;
const headers = {
    "X-Time-Zone": "America/Los_Angeles"
}
//need to update this function with rotating proxies
exports.scrapeContent = function(creatorList){
    console.log(creatorList);
    Promise.all(creatorList.map((creator) => axios.get(creator, {headers: {'Time-Zone': 'Australia/Sydney'}})))   //fetch all creator data in list
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
                if(data[0]){
                    await deleteOldStreams(data[0]);
                }

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

async function getCreatorData(creator)
{
    let streamsList = [];

    let headers = creator.header.c4TabbedHeaderRenderer;
    let main = creator.contents.twoColumnBrowseResultsRenderer.tabs;

    // 30 streams from JSON last item in contents is for rendering
    let streamContent = main[3].tabRenderer.content.richGridRenderer.contents
    //creator name
    let creatorName = main[0].tabRenderer.endpoint.browseEndpoint.canonicalBaseUrl;
    let canonicalName;
    let icon;
    if(headers) 
    {
        //canonical name and icon
        canonicalName = headers.title;
        icon = headers.avatar.thumbnails[2].url;
    }
    else    //headers not present use old data //helps to prevent missing icon from streams
    {
        const creatorList = await getCreatorDb({name: creatorName});
        if(creatorList)
        {
            canonicalName = creatorList[0].canonicalName;
            icon = creatorList[0].icon;
        }
    }
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
        streamObj.name = creatorName;
        streamObj.canonicalName = canonicalName;
        streamObj.icon = icon;

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
    streamObj.thumbnail = streamContent.thumbnail.thumbnails[3].url; //subject to change, just size of thumbnail
    streamObj.title = streamContent.title.runs[0].text;
    streamObj.waiting = true;
    (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
    streamObj.lastUpdated = getCurrentTime();
    return streamObj;
}

//Calculates time of a stream or streaming obj
//Streamed 10 hours ago -> unixTime
function calculatePassingStreamTime(timeString)
{
    if(!timeString) return;
    
    
    //First check if its an ongoing or old stream
    const oldorOngoingStream = (timeString.includes("Streamed")) ?  "Streamed" : "Streaming";
    let firstSlice = timeString.slice(timeString.indexOf(oldorOngoingStream), timeString.indexOf("ago"));
    console.log("FIRST SLICE " + firstSlice);
    let timeConst = null;
    let timeMultiple = null;
    //Get the unit of time
    switch(true){
        case firstSlice.includes("week"):
            return;
        case firstSlice.includes("month"):
            return;
        case firstSlice.includes("year"):
            return;
        case firstSlice.includes("day"):
            timeConst = firstSlice.indexOf("day");
            timeMultiple = ONEDAY;
            break;
        case firstSlice.includes("hour"):
            timeConst = firstSlice.indexOf("hour");
            timeMultiple = ONEHOUR;
            break;
        case firstSlice.includes("minute"):
            timeConst = firstSlice.indexOf("minute");
            timeMultiple = ONEMINUTE;
            break
        case firstSlice.includes("second"):
            timeConst = firstSlice.indexOf("second");
            timeMultiple = ONESECOND;
            break;
        default:
            timeConst = null;
    }
    const secondSlice = timeString.slice(firstSlice.indexOf(oldorOngoingStream) + oldorOngoingStream.length, timeConst);    // Streamed 5 hours -> 5
    console.log("TIME VALUE IS " + secondSlice + " MULTIPLE IS " + timeMultiple);
    const timeValue = parseInt(secondSlice, 10) * timeMultiple; //convert to integer and multiply by multiple
    // APPROXIMATE past time, not 100% accurate
    // console.log("TIME VALUE IS " + timeValue);
    return getCurrentTime() - timeValue;    //100000 - 
}

// Gets old VOD stream data and updates streamObj
async function updateOldStream(streamContent, streamObj) 
{
    let streamTime = streamContent.publishedTimeText.simpleText;
    // calculate stream past date
    streamTime = calculatePassingStreamTime(streamTime);
    console.log(streamTime);
    if(!streamTime) return;
    if((getCurrentTime() - streamTime) > FIVEDAYS)
    {
        console.log("too old");
        return;
    }
    
    //get stream from db
    streamObj.streamId = streamContent.videoId;
    const streamDb = await getStreamDb(streamObj.streamId);

    if(!streamDb) notInDb();
    else inDb(streamDb);

    function notInDb(){
        streamObj.unixTime = streamTime;
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[3].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.amount = (streamContent.shortViewCountText) ? streamContent.shortViewCountText.simpleText.toString() : '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
    function inDb(streamDb)
    {
        streamObj.unixTime = (streamDb.watching || streamDb.waiting) ? streamTime : streamDb.unixTime;   //if new to becoming old stream and stream is found in database
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[3].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.amount = (streamContent.shortViewCountText) ? streamContent.shortViewCountText.simpleText.toString() : '0';
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
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[3].url;
        streamObj.title = streamContent.title.runs[0].text;
        streamObj.watching = true;
        (streamContent.shortViewCountText) ? streamObj.amount = streamContent.shortViewCountText.runs[0].text.toString() : streamObj.amount = '0';
        streamObj.lastUpdated = getCurrentTime();
        return streamObj;
    }
    function newInDb(){
        // New ongoing stream
        streamObj.unixTime = getCurrentTime();
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[3].url;
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
        streamObj.thumbnail = streamContent.thumbnail.thumbnails[3].url;
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
async function deleteOldStreams(creator)
{
    try{
        const creatorList = await getCreatorDb(creator);
        //map through and delete those that dont match;
        creatorList.map(async (stream) => {
            const currTime = getCurrentTime();
            if((currTime - stream.unixTime) >= FIVEDAYS)   //stream older than 5 days
            {
                await Stream.deleteOne({streamId: stream.streamId});
            }
        })
    }
    catch(err){
        console.log(err)
    }
}


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