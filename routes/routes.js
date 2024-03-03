'use strict';

module.exports = function(app){

    app.route('/home')
    .get((req, res) => {
        res.json({ message: "Hello from server!" });
    })
};