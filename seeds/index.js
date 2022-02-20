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
    for(let i = 0; i<50; i++){
        const random405 = Math.floor(Math.random()*405)
        const price = Math.floor(Math.random()*20)+100;
        const camp = new Campground({
            author: '620d89629683cc77caa5d8a2',
            location:  `${cities[random405].city}, ${cities[random405].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta consequatur porro iste itaque quidem illo cumque nesciunt! Veritatis repellendus quisquam iure vitae unde, mollitia provident molestias nemo atque facere cum',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/srm-institute-of-science-and-technology-srmist-delhi-ncr-campus/image/upload/v1645336865/Yelpcamp/gjzrth3a1ggoexwylswc.jpg',
                  filename: 'Yelpcamp/gjzrth3a1ggoexwylswc',                
                },
                {
                  url: 'https://res.cloudinary.com/srm-institute-of-science-and-technology-srmist-delhi-ncr-campus/image/upload/v1645336867/Yelpcamp/sinnnivw0na74ozt2yzn.jpg',
                  filename: 'Yelpcamp/sinnnivw0na74ozt2yzn',                
                }
              ]
        })
        await camp.save();
    }
}
seed().then(()=>{
    mongoose.connection.close();
}) 