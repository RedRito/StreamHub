'use strict'


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Creator = new Schema({

    // _id: Schema.ObjectId, //will not declare it explicitly, hassle

    //Found through data, used for database
    name:{
        type: String,
    },
    
    //done by manually, stream name.
    canonicalName:{
        type: String
    },

    icon:{
        type: String //string because it is just a link to an image also done by hand
    },
    
    //max 30 streams that can be seen
    streams:[{ 
        streamId : String,
        unixTime : String,  // Turn string -> number -> time zone || also used for when stream starts
        title : String,
        thumbnail : String,
        watching : Boolean,
        waiting : Boolean,
        amount : String,
        lastUpdated : String, // used to keep track of time / when stream starts
    }]


});

module.exports = mongoose.model('Creator', Creator);
//type: Schema.Types.ObjectId, ref: 'Stream'

