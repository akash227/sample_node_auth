var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var app = express();

var passport = require('passport');

var passportLocal = require('passport-local');
var passportHttp = require('passport-http');


//step 10
passport.use(new passportLocal.Strategy(verifyCredentials));

//step 15
passport.use(new passportHttp.BasicStrategy(verifyCredentials));





function verifyCredentials(username,password,done){
	//pretend this is using a real database
	if(username === password){
		console.log("usrname pass equal");
		return done( null , {id: username, name: username});
	} else {
		console.log("usrname pass not equal");
		done(null,null);
	}
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
		res.send(403);
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


//step 6 and step 9
app.post('/login',passport.authenticate('local'),function(req,res){
  res.redirect('/');
});

var port  = 3000;

//step 1
app.listen(port,function(){

	console.log("Listening to port, %d",port);
});
