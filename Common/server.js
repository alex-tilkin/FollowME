/* Connection configuration */
var express = require('express');
var followMeDBConnect = require('./FollowMeServerDbConnect');
var followMeApi = require('./FollowMeServerAPI');

var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

/* Express instantiation */
var app = express();
app.configure(function () 
{
    app.use(express.logger('dev'));    
    app.use(express.bodyParser());
});


/* linking methods to REST methods */

/* GETs */
app.get('/users/getcurrentlocation/:email', followMeApi.FollowMeGetCurrentLocation);
app.get('/users/getuser/:email', followMeApi.FollowMeGetUserByEmail);
app.get('/users/getall/', followMeApi.FollowMeGetAllUsers);
app.get('/users/login/:email/:password', followMeApi.FollowMeLogIn);
app.get('/users/userexist/:email', followMeApi.FollowMeIsUserExist);
app.get('/users/displaynameexist/:displayName', followMeApi.FollowMeIsDisplayNameExist);

/* POSTs */
app.post('/users/setpath/:email', followMeApi.FollowMeSetPath);
app.post('/users/sendpath', followMeApi.FollowMeSendPath);
app.post('/users/sendcurrentlocation', followMeApi.FollowMeSendCurrentLocation);
app.post('/events/createevent/:email', followMeApi.FollowMeCreateEvent);
app.post('/events/notifyemergency/:email', followMeApi.FollowMeNotifyEmergency);
app.post('/users/changeuserstate/:email', followMeApi.FollowMeChangeuserState);
app.post('/events/getnearbyevents/', followMeApi.FollowMeGetAllNearbyEvents);
app.post('/users/setcurrentlocation/:email', followMeApi.FollowMeSetCurrentLocation);
app.post('/users/addfriend/:email', followMeApi.FollowMeAddFriend);
app.post('/users/adduser/', followMeApi.FollowMeSignIn);
app.post('/users/addfollower/:email', followMeApi.FollowMeSetFollower);

/* DELETEs */
app.delete('/users/droppath/:email', followMeApi.FollowMeDropPath);
app.delete('/events/dropevent/:email', followMeApi.FollowMeDropEvent);
app.delete('/users/deleteuser/:email', followMeApi.FollowMeDeleteUser);

app.listen(port,host);
