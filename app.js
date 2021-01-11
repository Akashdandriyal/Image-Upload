const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const imgModel = require('./model/model');

require('dotenv/config');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use('/uploads', express.static('uploads'));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    console.log("DB connected");
});

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,path.join(__dirname+'/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`);
    }
});

let upload = multer({storage: storage});

app.get('/', (req, res) => {
    try {
        imgModel.find({}, (err, docs) => {
            if(docs) {
                res.render('home', {items: docs});
            } else {
                console.log(err);
            }
        });
    } catch(e) {
        res.send(e);
    }
});

app.post('/', upload.single('image'), (req, res, next) => {
    try {
        let obj = {
            name: req.body.name,
            desc: req.body.desc,
            img: {
                data: fs.readFileSync(path.join(`${__dirname}/uploads/${req.file.filename}`)),
                contentType: 'image/png'
            }
        }
        console.log(`obj= ${obj}`);
        imgModel.create(obj, (err, doc) => {
            if(!err) {
                res.redirect('/');
            } else {
                console.log(err);
            }
        });
    } catch(e) {
        res.send(e);
    }
});

let port_number = (process.env.PORT || 3000);
app.listen(port_number, function(){
    console.log("Server is running on port "+ port_number);
});