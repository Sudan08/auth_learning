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
    password: String
});

userSchema.plugin(passportLocalMongoose);


const userData = new mongoose.model('userData',userSchema);

passport.use(userData.createStrategy());

passport.serializeUser(userData.serializeUser());
passport.deserializeUser(userData.deserializeUser());

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
        res.render('main');
    }else{
        res.redirect('/login');
    }
});

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

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})