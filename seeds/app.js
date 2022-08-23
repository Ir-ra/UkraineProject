const mongoose = require('mongoose');
const places = require('./places');
const UkrSee = require('../models/UkrSeeSchema');

mongoose.connect('mongodb+srv://username1:8RGQ42gzCAVFU47L@cluster0.pwsjgmn.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await UkrSee.deleteMany({});
    for(let i=0; i< places.length; i++) {
        const place = new UkrSee({
            author: '62ff76b8457696a7534c89b6',
            title: `${places[i].title}`,
            region: `${places[i].region}`,
            // images: `${places[i].images}`,
            location: `${places[i].location}`,
            description: `${places[i].description}`,
            geometry: { 
                type: 'Point', 
                coordinates: [ places[i].longitude, places[i].latitude ] 
            },
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1619609516890-a87beedb337a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80',
                    filename: 'St. Sophias Cathedral',
                },
                {
                    url: 'https://images.unsplash.com/photo-1572950588869-388b98e6e8c2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                    filename: 'Lvivs Historic Center',
                },
                {
                    url: 'https://images.unsplash.com/photo-1535914097669-df8a03199270?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                    filename: 'Kamenets Podolsky Castle',
                },{
                    url: 'https://images.unsplash.com/photo-1638890745593-297ebfebce67?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                    filename: 'Odessa Opera and Ballet',
                }
            ]
           
        })
        await place.save();
       
    }
}

seedDB().then(() => {
    db.close();
})


// UkrSee.insertMany(places)
// .then(res => {
//     console.log(res)
// })
// .catch(e => {
//     console.log(e)
// })

