'use strict';
var mongoose = require('mongoose');
Creator = mongoose.model('Creator');
Stream = mongoose.model('Stream');

exports.addCreator = function(req, res)
{
    console.log("ADDING CREATOR\n");
    //var NewCreator = new Creator(req.body);
    console.log(req.body);
    console.log(req.data);
    //NewCreator.save();
};

exports.getStreams =  async function(req, res){
    try{
        let query = {$or: [{watching: true}, {waiting: true}]};
        const requestData = req.body;

        if(requestData.streamType){
            query = {$and: [{watching: false}, {waiting: false}]}
        }
        //if there is a req query
        // console.log(req.body);
        if(requestData.queryType && requestData.queryValue){
            const queryType = requestData.queryType; 
            query[queryType] = requestData.queryValue; 
        }
        const data = await Stream.find(query).sort({ unixTime: 1 });
        res.json(data);
    }
    catch(err){
        res.send(err);
    }
}

exports.getVods = async function(req, res){
    try
    {
        const data = await Stream.find({watching: false, waiting: false}).sort({ unixTime: 1 });
        res.json(data);
    }
    catch(err)
    {
        res.send(err);
    }

}

