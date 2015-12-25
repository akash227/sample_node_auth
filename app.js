var fs = require('fs');
var https = require('https');
var mongoose = require('mongoose');



var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var app = express();

var passport = require('passport');

var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

//step 18
var server = https.createServer({ 
	cert: fs.readFileSync(__dirname+'/my.crt'),
	key:fs.readFileSync(__dirname+'/my.key')
},app);

//step 19 
mongoose.connect('mongodb://localhost:27017/test1');
var userSchema = new mongoose.Schema({
	username: {type:String , unique:true , required:true},
	password: {type:String , required:true}
});

var User = mongoose.model('User',userSchema,'users');


//step 10
passport.use(new passportLocal.Strategy(verifyCredentials));

//step 15
passport.use(new passportHttp.BasicStrategy(verifyCredentials));





function verifyCredentials(username,password,done){
	//pretend this is using a real database
	var obj = {"username": username};
	console.log(obj);
	User.find(obj,function(err,usr){
		if(err){
			console.log("server error");
			return done(null,null);
		}
		else{
		if (!(typeof(usr[0]) == typeof(undefined))) {
			if(password == usr[0].password){
			console.log("usrname pass equal");
		return done( null , {id: username, name: username});}
		else {
			console.log("username and password doesn't match");
		return done(null,null);
		}
		}
		else {
		console.log("user invalid");
		return done(null,null);
	} }
	});
	// if(username === password){
	// 	console.log("usrname pass equal");
	// 	return done( null , {id: username, name: username});
	// } else {
	// 	console.log("usrname pass not equal");
	// 	done(null,null);

	// }
}

//step 11
passport.serializeUser(function(user, done){
	console.log(user.id);
	done(null , user.id);
});

passport.deserializeUser(function(id , done){
	//Query the database or cache here
	
	console.log(id);
	done(null , {id: id,name: id});

});


//step 4
app.set ('view engine','ejs');




//step 8 - npm i body-parser,cookie-parser,express-session
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));


//step 7 - passport's 2 middlewares
app.use(passport.initialize()); //grabs current passport data at a session
app.use(passport.session()); //puts passport data into current session


//step 2
app.get('/',function(req,res){
	console.log(req.isAuthenticated()+" "+req.user);
	res.render('index1',{
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	}); //and create index.ejs
});

//step 20
app.get('/create',function(req,res){
	res.render('create');
	
});



//step 5

app.get('/login',function(req,res){
	res.render('login'); //create login.ejs

});
//step 17
app.use('/api',passport.authenticate('basic',{ session: false }));
//step 12

app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/');
});
 //step 14

function authorizeapi(req,res,next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		res.redirect('/');
	}
}
//step 13
app.get('/api/data',authorizeapi,function(req,res){
	res.json(
		[
		{ name: 'Man of Steel' } ,
		{ version: '1.0' } ,
		{ power: 'Limitless' }
		]
	);
});


//step 21
app.post('/create',function(req,res){
	User.create(req.body,function(err,user){
		if(err){
			console.log(err+"User already exists");
		}
		else{
			console.log(require('util').inspect(user));
			res.redirect('/');
		}
	});
});

//step 6 and step 9
app.post('/login',passport.authenticate('local',{
	failureRedirect: '/'
}),function(req,res){
  res.redirect('/');
});

var port  = 3000;

//step 1
server.listen(port,function(){

	console.log("Listening to port, %d",port);
});


//step 17
//securing with ssl-- openssl req -x509 -nodes -days 365 -newkey rsa:1024 -out my.crt -keyout my.key
