const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const {
    restart
} = require('nodemon');

const mongoose = require('mongoose');
const app = express();


mongoose.connect('mongodb://localhost:27017/userdataDB');

const userSchema = {
    name: String,
    username : String,
    email : String,
    password: String
}

const userData = mongoose.model('userData',userSchema);


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
        if (items.length === 0){
            newUser.save();
        }else{
        items.forEach(element => {
            if (element.username === username || element.email === email ){
                res.send({err:'Already exists'});
            }else{
                newUser.save();
                res.send({status:'Your data added successfully'});
            }
        })};

    })
    
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000")
})