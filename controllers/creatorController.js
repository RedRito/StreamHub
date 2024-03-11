'use strict';
var mongoose = require('mongoose');
Creator = mongoose.model('Creator');

exports.addCreator = function(req, res)
{
    console.log("ADDING CREATOR\n");
    //var NewCreator = new Creator(req.body);
    console.log(req.body);
    console.log(req.data);
    //NewCreator.save();
};


