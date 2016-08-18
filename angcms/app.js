'use strict';


var express = require('express');
var  bcrypt = require('bcrypt-nodejs');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Page = require('./models/page');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


var AdminUser = require('./models/adminuser');
var config = require('./config/main');


let server;

mongoose.connect(config.database);

app.use(session({
    secret: 'pandaisdamaninjapans',
    store: new MongoStore({ mongooseConnection: mongoose.connection,
                            ttl: 2 * 24 * 60 * 60
    })
}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));



// catch 404 and forward to error handler
app.post('/addUser', function(req, res) {
    var salt, hash, password;
    password = req.body.password;
    salt = bcrypt.genSaltSync(10);
    hash = bcrypt.hashSync(password, salt);

    var adminuser = new AdminUser({
        username: req.body.username,
        password: hash
    });
    adminuser.save(function(err) {
        if (!err) {
            return res.send({
                success:true,
                data:adminuser
            });

        } else {
            return res.send(err);
        }
    });
});


    
  app.get('/pages', function(req,res){
        Page.find(function(err, pages) {
            if (!err) {
                return res.send(pages);
            } else {
                return res.send(500, err);
            }
        });
    })
    
    app.post('/pages/add',  sessionCheck, function(req,res){
      var page = new Page({
        title: req.body.title,
        url: req.body.url,
        content: req.body.content,
        menuIndex: req.body.menuIndex,
        date: new Date(Date.now())
    });

    page.save(function(err) {
        if (!err) {
            return res.send(200, page);

        } else {
            return res.send(500,err);
        }
    });
        
    })
    
    app.post('/pages/update',  sessionCheck, function(req, res) {
        console.log(req.body._id);
        console.log(req.body);
        var id = req.body._id;
        Page.update({
            _id: id
        }, {
            $set: {
                title: req.body.title,
                url: req.body.url,
                content: req.body.content,
                menuIndex: req.body.menuIndex,
                date: new Date(Date.now())
            }
        }).exec();
        res.send("Page updated");
    })
    
    app.get('/pages/delete/:id',  sessionCheck, function(req, res) {
       var id = req.params.id;
        Page.remove({
            _id: id
        }, function(err) {
            return console.log(err);
        });
        return res.send('Page id- ' + id + ' has been deleted');  
    })    
    
    
    app.get('/pages/admin-details/:id',  sessionCheck, function(req, res) {
        var id = req.params.id;
        Page.findOne({
            _id: id
        }, function(err, page) {
            if (err)
                return console.log(err);
            return res.send(page);
        });
    });
    
    
    app.get('/pages/details/:url', function(req, res) {
        var url = req.params.url;
        console.log(url);
        Page.findOne({
            url: url
        }, function(err, page) {
            if (err)
                return console.log(err);
            console.log(page);    
            return res.send(page);
        });
    })

    
app.post('/adminlogin', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  AdminUser.findOne({
    username: username
  }, function(err, data) {
    if (err | data === null) {
      return res.send(401, "User Doesn't exist");
    } else {
      var usr = data;

      if (username == usr.username && bcrypt.compareSync(password, usr.password)) {

        req.session.regenerate(function() {
          req.session.user = username;
          return res.send(username);

        });
      } else {
        return res.send(401, "Bad Username or Password");
      }
    }
  });
});    
    
app.get('/adminlogout', function(req, res) {
    req.session.destroy(function() {
        return res.send(401, 'User logged out');

    });
});

function sessionCheck(req,res,next){

    if(req.session.user) next();
        else res.send(401,'authorization failed');
}


module.exports.close = function() {
  console.log('shutting down the server...');
  server.close();
};

server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});