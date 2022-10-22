require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const {
    restart
} = require('nodemon');


const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express();


mongoose.connect('mongodb://localhost:27017/userdataDB');

const userSchema = new mongoose.Schema({
    name: String,
    username : String,
    email : String,
    password: String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password']});

const userData = new mongoose.model('userData',userSchema);


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(express.static('public'));


app.get('/login',(req,res)=>{
    res.render('login')
})

app.get("/",(req,res)=>{
    res.render('index')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register',(req,res)=>{
    const name = req.body.name; 
    const username = req.body.username;
    const email = req.body.email;
    const password =req.body.password;

    const newUser = new userData({
        name : name,
        username :username,
        email: email,
        password : password,
    });
    userData.find({},function(err,items){
        if(err){
            console.log(err);
        }
        else{
        if (items.length == 0){
            newUser.save();
            console.log('saved');
        }
    };
    })
    userData.find({$or:[{username : username },{ email : email}]},function(err,data){
        if (data.length === 1){
            console.log('Already exists')
        }else{
            newUser.save();
            console.log('new user added')
        }
    });
    
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})