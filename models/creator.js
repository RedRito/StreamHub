'use strict'


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Creator = new Schema({

    _id: Schema.ObjectId,

    name:{
        type: String,
        required: true
    },

    icon:{
        type: string //string because it is just a link to an image
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

//type: Schema.Types.ObjectId, ref: 'Stream'

