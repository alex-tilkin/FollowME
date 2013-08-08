var common = require('./FollowMeServerDbConnect');

/*************************************************************/
/* FollowMeGetCurrentLocation -                              */
/* Retreives the current location of the user                */
/*************************************************************/
exports.FollowMeGetCurrentLocation = function(  request, 
                                                result)
{
    var dbConnection = common.GetDBConnection();
    var usersCollection = common.GetUsersCollectionName();
    var email;
    
    console.log("FollowMeGetCurrentLocation - In");
    
    email = request.params.email;
    console.log('Retrieving current location for user with email: ' + email);
    
    if(email == null)
    {
        console.log("FollowMeGetCurrentLocation - Invalid email value");
        return;
    }

    followMeDB.collection(  usersCollection, 
                            function(   err, 
                                        collection) 
                            {
                                collection.findOne({'Email':email}, 
                                                    function(error, item) 
                                                    {
                                                        res.setHeader(  "Content-Type", 
                                                                        "text/plain");
                                                        console.log("error = " + error);
                                                        console.log("item = " + item);
                                                        
                                                        res.send(item);
                                                    });
                            });

    console.log("FollowMeGetCurrentLocation - Out");
}

/*************************************************************/
/* FollowMeSetPath -                                         */
/* Sets the current path of the user                         */  
/*************************************************************/
exports.FollowMeSetPath = function( request, 
                                    result)
{
    console.log("FollowMeGetCurrentLocation - In");
    console.log("FollowMeGetCurrentLocation - Out");
}

/*************************************************************/
/* FollowMeDropPath -                                        */
/* Removes the current path form the user                    */
/*************************************************************/
exports.FollowMeDropPath = function(request, 
                                    result)
{
    console.log("FollowMeGetCurrentLocation - In");
    console.log("FollowMeGetCurrentLocation - Out");
}

/*************************************************************/
/* FollowMeSendPath -                                        */
/* Sends the path to user                                    */
/*************************************************************/
exports.FollowMeSendPath = function(request, 
                                    result)
{
    console.log("FollowMeGetCurrentLocation - In");
    console.log("FollowMeGetCurrentLocation - Out");
}

/*************************************************************/
/* FollowMeSendLocation -                                    */
/* Sends the current location to another user                */
/*************************************************************/
exports.FollowMeSendLocation = function(request, 
                                        result)
{
    console.log("FollowMeGetCurrentLocation - In");
    console.log("FollowMeGetCurrentLocation - Out");
}