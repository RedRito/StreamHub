const VSPO = require('./VSPO');
const Hololive = require('./Hololive')

if(Hololive.some(subString => subString.includes("Shion"))) console.log("IN");
else console.log("Not in");