const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(express.static(`${__dirname}/public`));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    'mongodb+srv://manas:manas123@cluster0.lr6pm.mongodb.net/TwitterDB?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('Mongodb connected...');
  });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  posts: [
    {
      title: String,
      content: String,
      likes: Number,
    },
  ],
  friends: [String],
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/user/:userID', function (req, res) {
  const findAllUsers = async () => {
    let allusers = await User.find({});
    User.findOne({ _id: req.params.userID }, (err, user) => {
      res.render('user.ejs', {
        id: user._id,
        username: user.username,
        email: user.email,
        posts: user.posts,
        friends: user.friends,
        allUsers: allusers,
      });
    });
    // console.log(allusers);
  };

  findAllUsers();
});

app.get('/myPosts/:userID', function (req, res) {
  User.findOne({ _id: req.params.userID }, (err, user) => {
    res.render('myPosts.ejs', {
      id: user._id,
      username: user.username,
      posts: user.posts,
    });
  });
});

app.get('/addPost/:userID', function (req, res) {
  User.findOne({ _id: req.params.userID }, (err, user) => {
    res.render('addPost.ejs', {
      id: user._id,
      username: user.username,
    });
  });
});

app.post('/addFriend/:userID', async function (req, res) {
  await User.updateOne(
    { _id: req.params.userID },
    {
      $addToSet: {
        friends: req.body.friend,
      },
    }
  );
  res.redirect('/user/' + req.params.userID);
});

app.post('/signup', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render('SuccessSignup');
    }
  });
});

app.post('/login', (req, res) => {
  User.findOne({ username: req.body.username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === req.body.password) {
          res.redirect('user/' + foundUser._id);
        }
      }
    }
  });
});

app.post('/addPost/:userID', async (req, res) => {
  await User.updateOne(
    { _id: req.params.userID },
    {
      $push: {
        posts: {
          title: req.body.title,
          content: req.body.content,
          likes: 0,
        },
      },
    }
  );

  res.redirect('/myPosts/' + req.params.userID);
});

// app.post('/addLike/:userID', (req, res) => {});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server Started Successfully`);
});
