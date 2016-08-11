// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var app        = express();
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var User     = require('./models/User.js');
 //var jwt = require('jwt');

mongoose.connect('mongodb://localhost:27017/tokenapp');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
app.use(morgan("dev"));
app.use(express.static("./app"));

app.get("/", function(req, res) {
    res.sendFile("./app/index.html");
});


//Routes
app.post('/authenticate', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
               res.json({
                    type: true,
                    data: user,
                    token: user.token
                }); 
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });    
            }
        }
    });
});

app.post('/signin', function(req, res) {
	console.log(req.body.email);
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User({email:req.body.email, password : req.body.password,token:new Date().getTime()});                
                userModel.save(function(err, user) {
                   // user.token = jwt.sign(user, process.env.JWT_SECRET);
                   /// user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: "User Created",
                            //token: user1.token
                       // });
                    });
                })
            }
        }
    });
});

app.get('/me', ensureAuthorized, function(req, res) {
    User.findOne({token: req.token}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});