'use strict'


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stream = new Schema({

    // _id: Schema.ObjectId, //will not declare it explicitly, hassle

    // Typical essential data
    name: String,
    canonicalName: String,
    icon: String,
    company: String,    //done manually

    // The "meat" of the data
    streamId : String,
    unixTime : Number,  // Turn string -> number -> time zone || also used for when stream starts
    title : String,
    thumbnail : String,
    watching : Boolean,
    waiting : Boolean,
    amount : String,
    lastUpdated : Number, // used to keep track of time / when stream starts

});

module.exports = mongoose.model('Stream', Stream);