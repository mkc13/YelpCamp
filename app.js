if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app  = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
const passport = require('passport');
const LocalStrategy = require('passport-local');
const campgroundRoutes = require('./routes/campground.js');
const reviewRoutes = require('./routes/reviews.js');
const User = require('./models/user.js');
const userRoute = require('./routes/users.js');
const { Console } = require('console');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');

// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
const dbUrl = 'mongodb+srv://Mayank06:Mayank06@cluster0.xdy6yr9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbUrl, {
   
});



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use('/public', express.static('public'));
app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );


const store =  MongoDBStore.create({
    mongoUrl:dbUrl,
    secret:'thisshouldbebettersecret',
    touchAfter:24*3600
})
store.on("error",function(e){
    console.log("Error",e) 
})

const sessionConfig = {
    secret :'thisshouldbebettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(mongoSanitize());



app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}) 
app.get('/',(req,res)=>{
    res.render('home');
})
app.use('/',userRoute);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err, req, res, next) => {
    const {statusCode=500 , message= 'Something went wrong'} = err; 
    res.status(statusCode).render('error',{err});
});

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("Server Runningg..............");
})  