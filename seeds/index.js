const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places , descriptors} =  require('./seedHelpers');
const campground = require('../models/campground');

const dbUrl = 'mongodb+srv://Mayank06:Mayank06@cluster0.xdy6yr9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbUrl, {
   
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array=>array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'668a7ebf0df2abdf86606b6c',
            location:`${cities[random1000].city} ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            geometry:{
                type:'Point',
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora adipisci fugiat quae aperiam distinctio incidunt rem! Molestias hic praesentium enim, cum corrupti fuga soluta, alias nisi ratione ipsa nesciunt eligendi.',
            price:price,
            images:[
                {
                    url:"https://images.pexels.com/photos/9630132/pexels-photo-9630132.jpeg?auto=compress&cs=tinysrgb&w=600",
                    filename:"fjhfjrfyutuy"
                },
                {
                    url:"https://images.pexels.com/photos/8985295/pexels-photo-8985295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                    filename:"hsdoaiyodasd"
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})