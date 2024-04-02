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

exports.getCreators =  async function(req, res){
    try{
        const data = await Creator.find().sort({ 'streams.unixTime': 1 }).pretty();
        console.log(data);
        res.json(data);
    }
    catch(err){
        res.send(err);
    }
}

