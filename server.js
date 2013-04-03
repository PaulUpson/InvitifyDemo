var express = require('express')
  , http = require("http")
  , app = express()
  , apiServer = require('./api/server')
  , engine = require('ejs-locals')
  , ejsMiddleware = require('ejs-middleware');

app.use('/api', apiServer); // Mount the HTTP API on the URL space /api

app.use(function (req, res, next) {
    setTimeout(next, 4000);
});

// use ejs-locals for all ejs templates:
app.engine('html', engine);
app.set('views', __dirname + '/static');
app.set('view engine', 'html'); // so you can render('index')
app.use(ejsMiddleware(__dirname + '/static', 'html')); // Serve /html files via EJS renderer

app.use(express.static(__dirname + '/static')); // For other requests, just serve /static

var server = http.createServer(app);

// Enable socket.io, making it part of the /api/* space
var io = require('socket.io').listen(server);
io.configure(function() {
    // Configure socket.io
    io.set('resource', '/api/socket.io');
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
    
    io.sockets.on('connection', function (socket) {
        // Keep track of which invitation each client is looking at
        var interestedInInvitationId;
        socket.on('registerInterest', function (data) { interestedInInvitationId = data; });
        
        apiServer.on('invitationUpdate', function (item) {
            // Only send updates to the client if they care about it
            if (item.id === interestedInInvitationId) {
                socket.emit('invitationUpdate', item);
            }
        });
    });
});

//server.listen(process.env.PORT, process.env.IP);
server.listen(3000);

console.log('Express server running on port 3000');
