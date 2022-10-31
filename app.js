require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const {
    restart
} = require('nodemon');
const mongoose = require('mongoose');

const passport = require('passport');

const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-find-or-create')
const GoogleStrategy = require('passport-google-oauth20').Strategy;




const session = require('express-session');

const app = express();

app.use(session({
    secret:'Stay hungry Stay foolish.',
    resave:false,
    saveUninitialized:false
})); 

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect('mongodb+srv://admin-sudan:'+process.env.DBPASSWORD+'@cluster0.s4syznv.mongodb.net/secretDB');

const userSchema = new mongoose.Schema({
    name: String,
    username : String,
    email : String,
    password: String,
    googleId: String ,
    secret : [String],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const userData = new mongoose.model('userData',userSchema);

passport.use(userData.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: "http://localhost:3000/auth/google/secret",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    userData.findOrCreate({ googleId: profile.id , name:profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(express.static('public'));


app.get('/login',(req,res)=>{
    res.render('login')
});

app.get("/",(req,res)=>{
    res.render('index')
});

app.get('/register',(req,res)=>{
    res.render('register')
});

app.get('/main',(req,res)=>{
    if (req.isAuthenticated()){
        userData.find({secret:{$ne:null}},(err,foundsecret)=>{
            if (err){
                console.log(err);
            }else{
                res.render('main',{data:foundsecret});
            }
        })
    }else{
        res.redirect('/login');
    }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


app.get('/auth/google/secret', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/main');
});

app.get('/submit',(req,res)=>{
    if (req.isAuthenticated()){
        res.render('submit');
    }else{
        res.redirect('/login');
    }
})

app.post('/register',(req,res)=>{
    const data = {
        name :req.body.name,
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
    };   
    // const name = req.body.name; 
    // const username = req.body.username;
    // const email = req.body.email;
    // const password =req.body.password;
        
        userData.find({},function(err,items){
            if(err){
                console.log(err);
            }
            else{
            if (items.length == 0){
                userData.register(data,data.password,function(err,user){
            if (err){
                console.log(err);
                res.redirect('/');
            }else{
                passport.authenticate('local')(req,res,function(){
                    res.redirect('/main');
                })
            }

        })
                console.log('saved');
            }
        };
        })
        userData.find({$or:[{username : data.username },{ email : data.email}]},function(err,datas){
            if (datas.length === 1){
                console.log('Already exists')
                

            }else{
                userData.register(data,data.password,function(err,user){
            if (err){
                console.log(err);
                res.redirect('/');
            }else{
                passport.authenticate('local')(req,res,function(){
                    res.redirect('/main');
                })
            }

        })
                console.log('new user added')
            }
        });
    
})

app.post('/login',(req,res)=>{

    const user= new userData({
        username : req.body.username,
        password : req.body.password
    });
    req.login(user,(err)=>{
        if (err){
            console.log(err);
        } else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/main');
            })
        }
    })
})

app.post('/submit',(req,res)=>{
    const submittedSecret = req.body.secret;
    userData.findById(req.user.id,(err,founduser)=>{
        if (err){
            console.log(err);
        }else{
            founduser.secret.push(submittedSecret);
            // founduser.secret=[];
            founduser.save();
            res.redirect('/main');
            
        }
    })

    // userData.find    
})
console.log('Hello world')


app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})