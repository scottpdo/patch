var express = require('express'),
    path = require('path'),
    PORT = process.env.PORT || 8000;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use( '/css', express.static('css') );
app.use( '/data', express.static('data') );
app.use( '/img', express.static('img') );
app.use( '/js', express.static('js') );

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function(req, res) {
    res.status(404).send('Page not found');
});

module.exports = {
    start: function() {
        app.listen(PORT);
        console.log('Started server on port', PORT);
    }
};
