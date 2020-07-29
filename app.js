const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

dotenv.config({path: './.env'});

const app = express();

app.use(express.urlencoded());
app.use(express.json());
//app.use(express.static('views'));

const viewsPath = path.join(__dirname, '/views');

app.set('view engine', 'hbs');
app.set('views', viewsPath);

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB is connected'));

app.get('/', async (req,res) => {

    const allUsers = await User.find();

    res.render('index', {
        users: allUsers
    });

});

//REGISTER
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req,res) => {

    const {username, email, password, confPassword} = req.body;

    const userEmail = await User.find({email: email});

    const hashedPassword = await bcrypt.hash(confPassword, 8);

    if(userEmail.length > 0){
        res.render('register', {
            message: 'Email is taken'
        })
        
    } else if (password !== confPassword){

        res.render('register', {
            message: 'Passwords do not match'
        })

    } else {
        await User.create({
            username: username,
            email: email,
            password: hashedPassword
        });

        res.render('register', {
            message: 'User registered'
        });
    }
});

//UPDATE
app.get('/update', (req, res) => {
    res.render('update');
});

app.get('/update/:id', async (req,res) => {

    const userId = req.params.id;

    const userUpdated = await User.findById(userId);

    res.render('update', {
        userUpdated
    });

});

app.post('/update/:id', async (req,res) => {

    const {username, email, password, newPassword, confPassword} = req.body;

    const userId = req.params.id;

    const user = await User.findById(userId);

    const decryptedPassword = await bcrypt.compare(password, user.password);

    const hashedPassword = await bcrypt.hash(confPassword, 8);

    if ( decryptedPassword == false ) {

        res.render('update', {
            umessage: 'Passwords are incorrect'
        });

    } else if( newPassword !== confPassword ) {
            
        res.render('update', {
            umessage: 'Passwords are incorrect'
        });
       
    } else {
        await User.findByIdAndUpdate(userId, {
            username: username,
            email: email,
            password: hashedPassword
        });

        res.render('update', {
            umessage: 'User updated'
        });
    }
});

//DELETE
app.post('/:id', async (req,res) => {

    const userId = req.params.id;

    await User.findByIdAndDelete(userId);

    res.render('index', {
        dmessage: 'User deleted'
    });
    
});

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));