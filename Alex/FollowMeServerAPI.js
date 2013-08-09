var common = require('./FollowMeServerDbConnect');


/*************************************************************/
/* FollowMeGetCurrentLocation -                              */
/* Retreives the current location of the user                */
/*************************************************************/
exports.FollowMeGetCurrentLocation = function(  request, 
                                                result)
{
    console.log("FollowMeGetCurrentLocation - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = request.params.email;

    if(email == null)
    {
        console.log("FollowMeGetCurrentLocation - Invalid email value");
        return;
    }

    console.log('Retrieving current location for user with email: ' + email);

    followMeDB.collection(  usersCollection, 
                            function(   err, 
                                        collection) 
                            {
                                collection.findOne( {'Email' : email}, 
                                                    {   'Path.CurrentLocation' : true, 
                                                        '_id' : false},
                                                    function(error, item) 
                                                    {
                                                        result.setHeader(   "Content-Type", 
                                                                            "text/plain");
                                                        console.log("error = " + error);
                                                        console.log("item = " + item);
                                                        
                                                        result.send(item);
                                                    });
                            });

    console.log("FollowMeGetCurrentLocation - Out");
}

/*************************************************************/
/* FollowMeSetPath -                                         */
/* Sets new path of user                                     */  
/*************************************************************/
exports.FollowMeSetPath = function( request, 
                                    result)
{
    console.log("FollowMeSetPath - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = request.params.email;
    var path = request.body;

    if(email == null)
    {
        console.log("FollowMeSetPath - Invalid email value");
        return;
    }
    
    console.log("FollowMeSetPath - Setting new path for user with email: " + email);
    console.log("FollowMeSetPath - Path: \n" + JSON.stringify(path));

    followMeDB.collection(  usersCollection, 
                            function(   err, 
                                        collection)
                            {
                                collection.update(  {'Email' : email},
                                                    {
                                                        $set:{'Path' : path}
                                                    },
                                                    {safe:true},
                                                    function(err, res)
                                                    {
                                                        if (err) 
                                                        {
                                                            console.log("FollowMeSetPath - Error updating users students: " + err);
                                                            result.send({'error':'An error has occurred'});
                                                        } 
                                                        else
                                                        {
                                                            console.log('FollowMeSetPath - ' + res + ' document(s) updated');
                                                            result.send(path);
                                                        }
                                                    });
                            });

    console.log("FollowMeSetPath - Out");
}

/*************************************************************/
/* FollowMeDropPath -                                        */
/* Removes the current path form the user                    */
/*************************************************************/
exports.FollowMeDropPath = function(request, 
                                    result)
{
    console.log("FollowMeDropPath - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = request.params.email;

    if(email == null)
    {
        console.log("FollowMeDropPath - Invalid email value");
        return;
    }

    console.log("FollowMeDropPath - Dropping path for user with email: " + email);    

    followMeDB.collection(  usersCollection, 
                            function(   err, 
                                        collection) 
                            {
                                collection.update(  {'Email':email},
                                                    { $unset: { 'Path' : 1 }},
                                                    {safe:true}, 
                                                    function(   err, 
                                                                res) 
                                                    {
                                                        if (err) 
                                                        {
                                                            result.send({'error':'An error has occurred - ' + err});
                                                        }
                                                        else
                                                        {
                                                            console.log("FollowMeDropPath - The path has removed from the document. result: " + res);
                                                            result.send(request.body);
                                                        }
                                                    });
                            });

    console.log("FollowMeDropPath - Out");
}

/*************************************************************/
/* FollowMeSendPath -                                        */
/* Sends the path to user                                    */
/*************************************************************/
exports.FollowMeSendPath = function(request, 
                                    result)
{
    console.log("FollowMeSendPath - In");
    
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var fromPath = null;
    var from = request.body.from;
    var to = request.body.to;
    var users = followMeDB.collection(usersCollection);

    followMeDB.collection(  usersCollection, 
                            function(err, collection) 
                            {
                                collection.findOne( {'Email':from}, 
                                                    function(err, item) 
                                                    {
                                                        console.log("err="+err);
                                                        console.log("item="+item);
                                                        fromPath = item;
                                                        followMeDB.collection(  usersCollection, 
                                                                                function(   err, 
                                                                                            collection)
                                                                                {
                                                                                    //console.log(fromPath);
                                                                                    var temp = fromPath.Path;
                                                                                    temp['FirstName'] = fromPath.FirstName;
                                                                                    temp['LastName'] = fromPath.LastName;
                                                                                    temp['Email'] = fromPath.Email;
                                                                                    collection.update(  {'Email' : to},
                                                                                                        {
                                                                                                            $set:{'Followee' : temp}
                                                                                                        },
                                                                                                        {safe:true},
                                                                                                        function(err, res)
                                                                                                        {
                                                                                                            if (err) 
                                                                                                            {
                                                                                                                console.log("FollowMeSendPath - Error updating users students: " + err);
                                                                                                                result.send({'error':'An error has occurred'});
                                                                                                            } 
                                                                                                            else
                                                                                                            {
                                                                                                                console.log('FollowMeSendPath - ' + res + ' document(s) updated');
                                                                                                                result.send(fromPath);
                                                                                                            }
                                                                                                        });
                                                                                });
                                                    });
                            });

    console.log("FollowMeSendPath - Out");
}

/*************************************************************/
/* FollowMeSendLocation -                                    */
/* Sends the current location to another user                */
/*************************************************************/
exports.FollowMeSendLocation = function(request, 
                                        result)
{
    console.log("FollowMeGetCurrentLocation - In");

        var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var fromPath = null;
    var from = request.body.from;
    var to = request.body.to;
    var users = followMeDB.collection(usersCollection);

    followMeDB.collection(  usersCollection, 
                            function(err, collection) 
                            {
                                collection.findOne( {'Email':from}, 
                                                    function(err, item) 
                                                    {
                                                        console.log("err="+err);
                                                        console.log("item="+item);
                                                        fromPath = item;
                                                        followMeDB.collection(  usersCollection, 
                                                                                function(   err, 
                                                                                            collection)
                                                                                {
                                                                                    var temp = fromPath.Path.CurrentLocation;
                                                                                    collection.update(  {'Email' : to},
                                                                                                        {
                                                                                                            $set:{'Followee.CurrentLocation' : temp}
                                                                                                        },
                                                                                                        {safe:true},
                                                                                                        function(err, res)
                                                                                                        {
                                                                                                            if (err) 
                                                                                                            {
                                                                                                                console.log("FollowMeSendPath - Error updating users students: " + err);
                                                                                                                result.send({'error':'An error has occurred'});
                                                                                                            } 
                                                                                                            else
                                                                                                            {
                                                                                                                console.log('FollowMeSendPath - ' + res + ' document(s) updated');
                                                                                                                result.send(temp);
                                                                                                            }
                                                                                                        });
                                                                                });
                                                    });
                            });

    console.log("FollowMeGetCurrentLocation - Out");
}