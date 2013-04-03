var express = require('express')
  , db = require('./db')
  , invitation = require('./models/invitation')
  , vote = require('./models/vote');

var app = module.exports = express();
    
app.use(express.bodyParser());

app.get('/invitations/:id', function(req, res) {
    console.log('Get request for /invitiations/' + req.params.id);
    var result = db.load(req.params.id);
    result ? res.send(result)
           : res.send(404)
    });

app.post('/invitations', function(req, res) {
    console.log('Post request for /invitations - ' + req.body)
    var newInvitation = new invitation(req.body);
    db.save(newInvitation);
    
    res.header('Location', 'http://' + req.headers.host + app.set('basepath') + req.url + '/' + newInvitation.id);
    res.send({id: newInvitation.id}, 201);
});

app.post('/invitations/:id/votes', function(req, res) {
    console.log('Post request for /invitations/' + req.params.id + '/votes - ' + req.body); 
    var invitation = db.load(req.params.id);
    if(invitation) {
        invitation.votes.push(new vote(req.body));
        db.save(invitation);
        res.send(200);
        
        app.emit('invitationUpdate', invitation);
    } else {
        res.send(404);
    }
});

// Add test data for demo
db.save(new invitation(
    { title: 'Node.js user group seminar - June 2012', choices: [{displayText: 'Tue 12th'}, {displayText: 'Wed 13th'}, {displayText: 'Thu 14th'}, {displayText: 'Fri 15th'}]},
    'test' //ID
));
