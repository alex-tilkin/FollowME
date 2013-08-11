/* Connection configuration */
var express = require('express');
var followMeDBConnect = require('./FollowMeServerDbConnect');
var followMeApi = require('./LiorAPI');

var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

/* Express instantiation */
var app = express();
app.configure(function () {
    app.use(express.logger('dev'));    
    app.use(express.bodyParser());
});

/* Methods linkking to REST methods */
app.get('/users/getuser/:email', followMeApi.followMeGetUserByEmail);
app.get('/users/getall/', followMeApi.followMeGetAllUsers);
app.get('/users/login/:email/:password', followMeApi.FollowMeLogIn);
app.get('/users/userexist/:email', followMeApi.FollowMeIsUserExist);
app.get('/users/displaynameexist/:displayName', followMeApi.FollowMeIsDisplayNameExist);
app.post('/users/addfriend/:email', followMeApi.FollowMeAddFriend);//TODO: if express has session...
app.post('/users/adduser/', followMeApi.FollowMeSignIn);
app.delete('/users/:id', followMeApi.followMeDeleteUser);

app.listen(port,host);