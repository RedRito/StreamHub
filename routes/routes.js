'use strict';

module.exports = function(app){

    var creator = require('../controllers/creatorController');
    app.route('/home')
    .get(creator.getCreators)
    .post(creator.addCreator);
    // (req, res) => {
    //     //console.log(req.data);
    //     console.log(req.body);
    //     res.json({ message: "POST RECEIEVED!" });
    // }
};