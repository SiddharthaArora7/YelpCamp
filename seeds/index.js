const mongoose = require('mongoose');
const cities = require('./cities')
const {descriptors, places} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind('console','Connection Error'));
db.once('open', ()=>{
    console.log('Database Connected')
});

const sample = array=> array[Math.floor(Math.random()*array.length)]

const seed = async ()=>{
    await Campground.deleteMany({});
    for(let i = 0; i<200; i++){
        const random405 = Math.floor(Math.random()*405)
        const price = Math.floor(Math.random()*20)+100;
        const camp = new Campground({
            author: '620d89629683cc77caa5d8a2',
            location:  `${cities[random405].city}, ${cities[random405].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta consequatur porro iste itaque quidem illo cumque nesciunt! Veritatis repellendus quisquam iure vitae unde, mollitia provident molestias nemo atque facere cum',
            price,
            geometry: {
                coordinates : [ 
                    cities[random405].longitude,
                    cities[random405].latitude,
                ],
                type : "Point" 
                },
            images: [
                {
                  url:  "https://res.cloudinary.com/srm-institute-of-science-and-technology-srmist-delhi-ncr-campus/image/upload/v1645613489/Yelpcamp/kvv8pbynftynmq1b9em3.jpg",
                  filename:  "Yelpcamp/kvv8pbynftynmq1b9em3",                
                },
                {
                  url: "https://res.cloudinary.com/srm-institute-of-science-and-technology-srmist-delhi-ncr-campus/image/upload/v1645613490/Yelpcamp/odkjnzjut29e0mx9jiyy.jpg",
                  filename:  "Yelpcamp/odkjnzjut29e0mx9jiyy",                
                }
              ]
        })
        await camp.save();
    }
}
seed().then(()=>{
    mongoose.connection.close();
}) 