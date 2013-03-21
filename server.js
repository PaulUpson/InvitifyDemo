var express = require('express'),
    app = express.createServer().listen(process.env.PORT, process.env.IP),
    apiServer = require('./api/server'),
    ejsMIddleware = require('ejs-middleware');
    
app.use('/api', apiServer); // Mount the HTTP API on the URL space /api

app.use(function (req, res, next) {
    setTimeout(next, 4000);
});

app.use(ejsMIddleware(__dirname + '/static', 'html', app)); // Serve /html files via EJS renderer

app.use(express.static(__dirname + '/static')); // For other requests, just serve /static

// Enable socket.io, making it part of the /api/* space
var io = require('socket.io').listen(app);
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