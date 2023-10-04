var express = require('express');
var http = require('http');

require("./config/db");
const config = require("./config/config");
const PORT = config.app.port;

const userInfo = require("./models/userInfo.model");

var app = express();
var server = http.createServer(app);

var io = require('socket.io')(server);
var path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

app.use(express.static(path.join(__dirname,'./public')));

var user;

var getAllUsers = async (req, res) => {
  try {
    user = await userInfo.findOne({ id: req.params.id });
    
    console.log('name is ' + user.name);
    if(user != null){
      fs.readFile(__dirname + "/public/index.html", 'utf8', function(err, data) {

        if (err) throw err;
    
        var $ = cheerio.load(data);
    
        $('script.namevar').append('var name = "' + user.name + '"');
        $.html();
        res.send($.html());
      });
    }
    else{
      fs.readFile(__dirname + "/public/error.html", 'utf8', function(err, data) {

        if (err) throw err;
    
        var $ = cheerio.load(data);
    
        $('h1').text("Session Timeout");
        $.html();
        res.send($.html());
      });
    }
  }
    
  catch (error) {
    res.status(500).send(error.message);
  }
};

app.get('/:id([0-9]{10})', getAllUsers);

app.get('/', (req, res) => {
  fs.readFile(__dirname + "/public/error.html", 'utf8', function(err, data) {

        if (err) throw err;
    
        var $ = cheerio.load(data);
    
        $('h1').text("404 Not Found");
        $.html();
        res.send($.html());
    });
});

// route not found error
app.use((req,res,next) => {
    
    fs.readFile(__dirname + "/public/error.html", 'utf8', function(err, data) {

        if (err) throw err;
    
        var $ = cheerio.load(data);
    
        $('h1').text("404 Not Found");
        $.html();
        res.send($.html());
    });
});

// server error
app.use((err,req,res,next) => {
    fs.readFile(__dirname + "/public/error.html", 'utf8', function(err, data) {

        if (err) throw err;
    
        var $ = cheerio.load(data);
    
        $('h1').text("Something is wrong");
        $.html();
        res.send($.html());
    });
});

var name;

io.on('connection', (socket) => {
  console.log('new user connected');
  
  socket.on('joining msg', (username) => {
  	name = username;
  	io.emit('chat message', `***     ${name} joined the chat     ***`);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('chat message', `***     ${name} left the chat     ***`);
    
  });
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);         //sending message to all except the sender
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});