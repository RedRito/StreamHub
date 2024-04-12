'use strict';

module.exports = function(app){

    var creator = require('../controllers/creatorController');
    app.route('/home')
    .get(creator.getStreams)
    .post(creator.getStreams);
    // (req, res) => {
    //     //console.log(req.data);
    //     console.log(req.body);
    //     res.json({ message: "POST RECEIEVED!" });
    // }
    app.route('/home/vods')
    .get(creator.getVods);
};