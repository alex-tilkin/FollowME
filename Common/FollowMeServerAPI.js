/**********************************************************/
/* Used to retreive DB connection information             */
/**********************************************************/
var common = require('./FollowMeServerDbConnect');

/*********************************************************************/
/* Constants -                                                       */
/* The constants below are responses from the server for quries.     */
/* They are used by the application in order to understnad qureis'   */
/* responses.                                                        */
/*********************************************************************/
var Constants = {
    USER_LOGIN_SUCCESS: 'A00',
    USER_LOGOUT_SUCCESS: 'A01',
    USER_SIGNIN_SUCCESS: 'A02',
    USER_NOT_EXIST: 'A03',
    USER_DISPLAY_NAME_NOT_EXIST: 'A04',
    USER_LOGIN_FAILD: 'E00',
    USER_LOGOUT_FAILD: 'E01',
    USER_EXIST: 'E02',
    USER_SIGNIN_FAILED: 'E03',
    USER_DISPLAY_NAME_EXIST: 'E04'
};

/*********************************************************************/
/* FollowMeGetUserByEmail -                                          */
/* This function return user details by given email.                 */
/* get method.                                                       */
/*********************************************************************/
exports.FollowMeGetUserByEmail = function(req, res) {
    console.log("FollowMeGetUserByEmail - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = req.params.email;
    if (email) {
        console.log('Retrieving user details by given email: ' + email);
        followMeDB.collection(usersCollection, function(err, collection) {
            collection.findOne({'Email' : email}, function(error, item) {
                res.setHeader("Content-Type", "text/plain");
                console.log("error = " + error);
                console.log("item = " + item);      
                res.send(item);
            });
        });
    }

    console.log("FollowMeGetUserByEmail - Out");
}

/*********************************************************************/
/* FollowMeGetAllUsers -                                             */
/* This function return all the users that stored on the db.         */
/* get method.                                                       */
/*********************************************************************/
exports.FollowMeGetAllUsers = function(req, res) {
    console.log("FollowMeGetAllUsers - In");
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    console.log('Retrieving All users');
    followMeDB.collection(usersCollection, function(err, collection) {
        collection.find().toArray(function(error, items) {
            res.setHeader("Content-Type", "text/plain");
            console.log("error = " + error);
            console.log("items = " + items);        
            res.send(items);
        });
    });
    
    console.log("FollowMeGetAllUsers - Out");
}

/*********************************************************************/
/* followMeDeleteUser -                                              */
/* This function delete user from the db by given id.                */
/* delete method                                                     */
/*********************************************************************/
exports.FollowMeDeleteUser = function(request, result) 
{
    console.log("FollowMeDeleteUser - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = request.params.email;

    console.log('FollowMeDeleteUser - Deleting user by given email: ' + email);

    followMeDB.collection(  usersCollection, 
                            function(err, collection) 
                            {
                                collection.remove(  {'Email':email}, 
                                                    {safe:true}, 
                                                    function(err, res) 
                                                    {
                                                        if (err) 
                                                        {
                                                            result.send({'error':'An error has occurred - ' + err});
                                                        } 
                                                        else 
                                                        {
                                                            console.log('followMeDeleteUser - ' + res + ' document(s) deleted');
                                                            result.send(request.body);
                                                        }
                                                    });
                            });
    
    console.log("followMeDeleteUser - Out");
}

/*********************************************************************/
/* FollowMeLogIn -                                                   */
/* This function make user login to the system by user credentials.  */
/* If the user credentials are not authenticate than the             */
/* function will not change the user ConnectionStatus.               */
/* The function send API messages respectively.                      */
/* get method.                                                       */
/*********************************************************************/
exports.FollowMeLogIn = function(req, res) {
    console.log("FollowMeLogIn - In");
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = req.params.email;
    var password = req.params.password;
    console.log("email: " + email);
    console.log("password: " + password);
    
    if (email && password) {
        console.log('FollowMeLogIn - email & password not null');
        followMeDB.collection(usersCollection, function(err, collection) {
            collection.findOne({'Email' : email, 'Password' : password}, {'FirstName': true, 'Password': true, '_id': false}, 
            function(error, item) {
                //User credentials are correct => user ConnectionStatus will update to Online.
                if (item) { 
                    console.log("User was found in the db.");
                    collection.update({'Email' : email}, {$set: {'ConnectionStatus': "Online"}},{safe:true}, function(updateErr, updateres) {
                        if (updateErr) {
                            console.log("Error updating users Online: " + updateErr);
                            res.send({"error":"An error has occurred"});
                        } else {
                            console.log("The ConnectionStatus was update to Online. res: " + updateres);
                            console.log("res msg will be send: " + Constants.USER_LOGIN_SUCCESS);
                            res.setHeader("Content-Type", "text/plain");
                            res.send(Constants.USER_LOGIN_SUCCESS);
                        }
                    });
                } else {
                    console.log("User was NOT found in the db.");
                    console.log("res msg will be send: " + Constants.USER_LOGIN_FAILD);
                    res.setHeader("Content-Type", "text/plain");
                    res.send(Constants.USER_LOGIN_FAILD);
                }
            });
        });
    }
    
    console.log("FollowMeLogIn - Out");
}

/*********************************************************************/
/* FollowMeIsUserExist -                                             */
/* This function make a user registration.                           */
/* get method.                                                       */
/*********************************************************************/
exports.FollowMeIsUserExist = function(req, res) {
    console.log("FollowMeIsUserExist - In");
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = req.params.email;
            
    if (email) {
        console.log('Check if user Email exist: ' + email);
        followMeDB.collection(usersCollection, function(err, collection) {
            collection.findOne({'Email' : email}, function(error, item) {           
                if (item) {//user exist.
                    console.log("User already Exist in the db.");
                    console.log("res msg will be send: " + Constants.USER_EXIST);
                    res.setHeader("Content-Type", "text/plain");
                    res.send(Constants.USER_EXIST);
                } else {
                    console.log("User not Exist in the db.");
                    console.log("res msg will be send: " + Constants.USER_NOT_EXIST);
                    res.setHeader("Content-Type", "text/plain");
                    res.send(Constants.USER_NOT_EXIST);
                }
            });
        });
    } 

    console.log("FollowMeIsUserExist - Out");
}

/*********************************************************************/
/* FollowMeIsDisplayNameExist -                                      */
/* This function make a user registration.                           */
/* get method.                                                       */
/*********************************************************************/
exports.FollowMeIsDisplayNameExist = function(req, res) {
    console.log("FollowMeIsDisplayNameExist - In");
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var displayName = req.params.displayName;
            
    if (displayName) {
        console.log('Check if user displayName exist: ' + displayName);
        followMeDB.collection(usersCollection, function(err, collection) {
            collection.findOne({'DisplayName' : displayName}, function(error, item) {
                if (item) {//user exist.
                    console.log("User DisplayName already Exist in the db.");
                    console.log("res msg will be send: " + Constants.USER_DISPLAY_NAME_EXIST);
                    res.setHeader("Content-Type", "text/plain");
                    res.send(Constants.USER_DISPLAY_NAME_EXIST);
                } else {
                    console.log("User DisplayName not Exist in the db.");
                    console.log("res msg will be send: " + Constants.USER_DISPLAY_NAME_NOT_EXIST);
                    res.setHeader("Content-Type", "text/plain");
                    res.send(Constants.USER_DISPLAY_NAME_NOT_EXIST);
                }
            });
        });
    } 

    console.log("FollowMeIsDisplayNameExist - Out");
}

/*********************************************************************/
/* FollowMeSignIn -                                                  */
/* This function make a user registration.                           */
/* post method.                                                      */
/* Assumption: The User (email) does not exist in the db.            */
/*********************************************************************/
exports.FollowMeSignIn = function(req, res) {
    console.log("FollowMeSignIn - In");
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var user = req.body;
    console.log("User: \n" + user);
    
    followMeDB.collection(usersCollection, function(err, collection) {
        collection.insert(user, {safe:true}, function(err, result) {
         if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('result: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
    
    console.log("FollowMeSignIn - Out");
}

/*********************************************************************/
/* FollowMeSetFollower -                                             */
/* This function create a follower to a given user.                  */
/* This function return the user path                                */
/* post method                                                       */
/*********************************************************************/
exports.FollowMeSetFollower = function(req, res) {
    console.log("FollowMeSetFollower - In");
    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var follower = req.body;
    console.log("/FollowMeSetFollower, follower details: " + JSON.stringify(follower) + "\n" );
    var email = req.params.email;
    
    if (email) {
        followMeDB.collection(usersCollection, function(err, collection) {
            collection.update({'Email':email}, {$set:{'Follower' : follower}}, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error updating user Follower: ' + err);
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(follower);
                }
            });
        }); 
    }
    console.log("FollowMeSetFollower - Out");
}

/********************************************************************/
/* FollowMeAddFriend -                                              */
/* This function add a friend to a given user.                      */
/* Function assumption: The email to add as a friend EXIST!         */
/* (client side would check if exist before invoke this function).  */
/* post method                                                      */
/********************************************************************/
exports.FollowMeAddFriend = function(req, res) {
    console.log("FollowMeAddFriend - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = req.params.email;
    console.log('email: ' + email);
    var friend = req.body;

    console.log("FollowMeAddFriend, friend details: " + JSON.stringify(friend) + "\n" );
    if (email) 
    {
        followMeDB.collection(usersCollection, function(err, collection) 
        {
            collection.update({'Email':email}, {$push:{'Friends' : friend}}, {safe:true}, function(err, result) 
            {
                if (err) {
                    console.log('Error updating user freind: ' + err);
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(friend);
                }
            });
        }); 
    }
    
    console.log("FollowMeAddFriend - Out");
}

/*************************************************************/
/* FollowMeSetPath -                                         */
/* Sets new path of user                                     */  
/*************************************************************/
exports.FollowMeSetCurrentLocation = function( request, 
                                    result)
{
    console.log("FollowMeSetCurrentLocation - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = request.params.email;
    var loc = request.body;

    if(email == null)
    {
        console.log("FollowMeSetCurrentLocation - Invalid email value");
        return;
    }
    
    console.log("FollowMeSetCurrentLocation - Setting curr location for user with email: " + email);
    console.log("FollowMeSetCurrentLocation - Loaction: \n" + JSON.stringify(loc));

    followMeDB.collection(  usersCollection, 
                            function(   err, 
                                        collection)
                            {
                                collection.update(  {'Email' : email},
                                                    {
                                                        $set:{'Path.CurrentLocation' : loc}
                                                    },
                                                    {safe:true},
                                                    function(err, res)
                                                    {
                                                        if (err) 
                                                        {
                                                            console.log("FollowMeSetCurrentLocation - Error: " + err);
                                                            result.send({'error':'An error has occurred'});
                                                        } 
                                                        else
                                                        {
                                                            console.log('FollowMeSetCurrentLocation - ' + res + ' document(s) updated');
                                                            result.send(loc);
                                                        }
                                                    });
                            });

    console.log("FollowMeSetCurrentLocation - Out");
}


/*************************************************************/
/* FollowMeGetAllNearbyEvents                                */
/* Returning all neardby event                               */
/*************************************************************/
exports.FollowMeGetAllNearbyEvents = function(request, 
                                     result)
{
    console.log("FollowMeGetAllNearbyEvents - In");
    
    var followMeDB = common.GetDBConnection();
    var eventsCollection = common.GetEventsCollectionName();    
    var UserBody = request.body;  
    
    followMeDB.collection(eventsCollection, 
        function(err, collection)
        {                        
            if (err) 
            {
                console.log("FollowMeGetAllNearbyEvents Error: " + err);
                result.send(err);
            }
            else
            {    
                collection.ensureIndex({"Location":"2d"}, function(err, res)
                {
                    if (err) 
                    {
                        console.log("Indexing event collection failed: " + err);
                        result.send(err);
                    }
                    else
                    {
                        console.log("Indexing ok");
                        console.log(UserBody["Location"]["Longtitude"]);
                        console.log(UserBody["Location"]["Latitude"]);
                        
                        collection.find({"Location": {$near:[UserBody["Location"]["Longtitude"],UserBody["Location"]["Latitude"]], $maxDistance:50/(111.12*1000)}},
                        {"Location" : true, "EventType" : true, "_id" : false}).toArray(                        
                            function(error, item) 
                            {
                                if (err) 
                                {
                                    console.log("Query nearby location failed: " + err);
                                    result.send(err);
                                }
                                else
                                {
                                    console.log("item = " + JSON.stringify(item));                                    
                                    result.send(item);
                                }                                
                            });
                     }
                });
            }
        });
    
    console.log("FollowMeGetAllNearbyEvents - Out");
}

/*************************************************************/
/* FollowMeChangeuserState -                                 */
/* Changin use state                                         */
/*************************************************************/
exports.FollowMeChangeuserState = function(request, 
                                     result)
{
    console.log("FollowMeChangeuserState - In");
    
    var followMeDB = common.GetDBConnection();
    var usersCollection = common.GetUsersCollectionName();
    var email = request.params.email;
    var UserBody = request.body;
    
    if(email == null)
    {
        console.log("FollowMeChangeuserState - Invalid email value");
        return;
    }
    
    followMeDB.collection(usersCollection, 
        function(err, collection)
        {                        
            if (err) 
            {
                console.log("FollowMeChangeuserState Error: " + err);
                result.send(err);
            }
            else
            {
                collection.update({'Email':email}, { $set:{'ProgressStatus' : UserBody["ProgressStatus"]}}, { upsert: true },  
                    function(err, res)
                    {
                        if (err) 

                        {
                            console.log("FollowMeNotifyEmergency - Error Creating event: " + err);
                            result.send({'error':'An error has occurred'});
                        } 
                        else
                        {
                            result.send(UserBody);
                        }
                    });
            }
        });
    
    
    console.log("FollowMeChangeuserState - In");
}

/*************************************************************/
/* FollowMeNotifyEmergency -                                 */
/* Placing emergency on the map and notify the followe       */
/*************************************************************/
exports.FollowMeNotifyEmergency = function(request, 
                                     result)
{
    console.log("FollowMeNotifyEmergency - In");
    
    var followMeDB = common.GetDBConnection();
    var eventsCollection = common.GetEventsCollectionName();
    var usersCollection = common.GetUsersCollectionName();
    var email = request.params.email;
    var UserBody = request.body;
    console.log("FollowMeNotifyEmergency request body: " + JSON.stringify(UserBody));    
 
    if(email == null)
    {
        console.log("FollowMeNotifyEmergency - Invalid email value");
        return;
    }

    followMeDB.collection(eventsCollection, 
        function(err, collection)
        {                        
            if (err) 
            {
                console.log("FollowMeNotifyEmergency Error: " + err);
                result.send(err);
            }
            else
            {   
                var UserEvent={};
                UserEvent["Location"] = UserBody["Location"];
                console.log("FollowMeNotifyEmergency was here");
                                 
                UserEvent["Creator"] = email;
                UserEvent["Approvals"] = 1;
                UserEvent["EventType"] = {"Event" : "Emergency"};
                
                var dCurr = new Date();
                                            
                var CurrDate={};
                CurrDate["Day"] = dCurr.getDate();
                CurrDate["Month"] = dCurr.getMonth();
                CurrDate["Year"] = dCurr.getFullYear();
                
                var CurrTime = {};
                CurrTime["Seconds"] = dCurr.getSeconds();
                CurrTime["Minutes"] = dCurr.getMinutes();
                CurrTime["Hours"] = dCurr.getHours();
                                            
                var TimeStamp = {};
                TimeStamp["Date"] = CurrDate;
                TimeStamp["Time"] = CurrTime;
                
                UserEvent["TimeStamp"] = TimeStamp;
                
                console.log("FollowMeNotifyEmergency Final json: " + JSON.stringify(UserEvent)); 
                
                collection.insert(UserEvent,  
                    function(err, res)
                    {
                        if (err) 

                        {
                            console.log("FollowMeNotifyEmergency - Error Creating event: " + err);
                            result.send({'error':'An error has occurred'});
                        } 
                        else
                        {
                            console.log('FollowMeNotifyEmergency - ' + res + ' document(s) updated');
                            
                            followMeDB.collection(usersCollection, 
                            function(err, collection)
                            {                        
                                if (err) 
                                {
                                    console.log("FollowMeNotifyEmergency Error: " + err);
                                    result.send(err);
                                }
                                else
                                {
                                                        
                                    collection.update({'Email' : UserBody["To"]},
                                        {
                                            $set:{'Followee.CurrentLocation' : UserBody["Location"]}
                                        },
                                        {safe:true},
                                        function(err, res)
                                        {
                                            if (err) 

                                            {
                                                console.log("FollowMeNotifyEmergency - Error updating users students: " + err);
                                                result.send({'error':'An error has occurred'});
                                            } 
                                            else
                                            {
                                                console.log('FollowMeNotifyEmergency - ' + res + ' document(s) updated');
                                                result.send(UserBody["Location"]);
                                            }
                                        });
                                }
                            });
                            
                        }
                    });          
                
            }                        
        });
                
    console.log("FollowMeNotifyEmergency - Out");
}

/*************************************************************/
/* FollowMeDropEvent -                                       */
/* Drop event from the map                                   */
/*************************************************************/
exports.FollowMeDropEvent = function(request, 
                                     result)
{
    console.log("FollowMeDropEvent - In");
    
    var followMeDB = common.GetDBConnection();
    var eventsCollection = common.GetEventsCollectionName();
    var email = request.params.email;
    var UserEvent = request.body;
    
    console.log("FollowMeDropEvent request body: " + JSON.stringify(UserEvent));
    
    if(email == null)
    {
        console.log("FollowMeDropEvent - Invalid email value");
        return;
    }
    
    followMeDB.collection(eventsCollection, 
        function(err, collection)
        {                        
            if (err) 
            {
                console.log("FollowMeDropEvent Error: " + err);
                result.send(err);
            }
            else
            {     
                collection.remove({"Location" : UserEvent["Location"]}, function(err, res)
                {
                    if (err) 
                    {
                        console.log("FollowMeDropEvent - Error droping event: " + err);
                        result.send({'error':'An error has occurred'});
                    } 
                    else
                    {
                        console.log('FollowMeDropEvent - ' + res + ' document(s) updated');
                        result.send(UserEvent);
                    }
                });        
            }
        });
    
    console.log("FollowMeDropEvent - Out");
}


/*************************************************************/
/* FollowMeCreateEvent -                                     */
/* Creating event on the map                                 */
/*************************************************************/
exports.FollowMeCreateEvent = function(request, 
                                       result)
{
    console.log("FollowMeCreateEvent - In");

    var followMeDB = common.GetDBConnection();
    var eventsCollection = common.GetEventsCollectionName();
    var email = request.params.email;
    var UserEvent = request.body;
    console.log("FollowMeCreateEvent request body: " + JSON.stringify(UserEvent));
    
    if(email == null)
    {
        console.log("FollowMeCreateEvent - Invalid email value");
        return;
    }

    followMeDB.collection(eventsCollection, 
        function(err, collection)
        {                        
            if (err) 
            {
                console.log("FollowMeCreateEvent Error: " + err);
                result.send(err);
            }
            else
            {                    
                UserEvent["Creator"] = email;
                UserEvent["Approvals"] = 1;
                
                var dCurr = new Date();
                                            
                var CurrDate={};
                CurrDate["Day"] = dCurr.getDate();
                CurrDate["Month"] = dCurr.getMonth();
                CurrDate["Year"] = dCurr.getFullYear();
                
                var CurrTime = {};
                CurrTime["Seconds"] = dCurr.getSeconds();
                CurrTime["Minutes"] = dCurr.getMinutes();
                CurrTime["Hours"] = dCurr.getHours();
                                            
                var TimeStamp = {};
                TimeStamp["Date"] = CurrDate;
                TimeStamp["Time"] = CurrTime;
                
                UserEvent["TimeStamp"] = TimeStamp;
                
                console.log("FollowMeCreateEvent Final json: " + JSON.stringify(UserEvent)); 
                
                collection.insert(UserEvent,  function(err, res)
                    {
                        if (err) 
                        {
                            console.log("FollowMeCreateEvent - Error Creating event: " + err);
                            result.send({'error':'An error has occurred'});
                        } 
                        else
                        {
                            console.log('FollowMeCreateEvent - ' + res + ' document(s) updated');
                            result.send(UserEvent);
                        }
                    });                         
                
            }                        
        });
                

    console.log("FollowMeCreateEvent - Out");
}

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
    }
    else
    {
        console.log('FollowMeGetCurrentLocation - Retrieving current location for user with email: ' + email);

        followMeDB.collection(  usersCollection, 
                                function(   err, 
                                            collection) 
                                {
                                    collection.findOne( {'Email' : email}, 
                                                        {   'Path.CurrentLocation' : true, 
                                                            '_id' : false},
                                                        function(   error, 
                                                                    item) 
                                                        {
                                                            result.setHeader(   "Content-Type", 
                                                                                "text/plain");
                                                            console.log("FollowMeGetCurrentLocation - error = " + error);
                                                            console.log("FollowMeGetCurrentLocation - item = " + item);
                                                            
                                                            result.send(item);
                                                        });
                                });
    }

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
    }
    else
    {
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
                                                                result.send({'FollowMeGetCurrentLocation - error':'An error has occurred - ' + err});
                                                            } 
                                                            else
                                                            {
                                                                console.log('FollowMeSetPath - ' + res + ' document(s) updated');
                                                                result.send(path);
                                                            }
                                                        });
                                });
    }
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
        console.log("FollowMeDropPath - Invalid email value, email = " + email);
    }
    else
    {
        console.log("FollowMeDropPath - Dropping path for user with email: " + email);    

        followMeDB.collection(  usersCollection, 
                                function(   err, 
                                            collection) 
                                {
                                    collection.update(  { 'Email' : email },
                                                        { $unset: { 'Path' : 1 }},
                                                        { safe : true }, 
                                                        function(   err, 
                                                                    res) 
                                                        {
                                                            if (err) 
                                                            {
                                                                console.log("FollowMeSetPath - Error in dropping path: " + err);
                                                                result.send({'FollowMeGetCurrentLocation - error':'An error has occurred - ' + err});
                                                            }
                                                            else
                                                            {
                                                                console.log("FollowMeDropPath - The path has removed from the document. result: " + res);
                                                                result.send(request.body);
                                                            }
                                                        });
                                });
    }
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
    //var users = followMeDB.collection(usersCollection);
    
    if(form == null || to == null)
    {
        console.log("FollowMeSendPath - One of the following actual parameters did't found in the message body from = " + from + ", to = " + to);
    }
    else
    {
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
    }
    console.log("FollowMeSendPath - Out");
}

/*************************************************************/
/* FollowMeSendLocation -                                    */
/* Sends the current location to another user                */
/*************************************************************/
exports.FollowMeSendCurrentLocation = function( request, 
                                                result)
{
    console.log("FollowMeSendCurrentLocation - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var fromPath = null;
    var from = request.body.from;
    var to = request.body.to;
    //var users = followMeDB.collection(usersCollection);

    if(form == null || to == null)
    {
        console.log("FollowMeSendCurrentLocation - One of the following actual parameters did't found in the message body from = " + from + ", to = " + to);
    }
    else
    {
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
                                                                                                                    console.log("FollowMeSendCurrentLocation - Error updating users students: " + err);
                                                                                                                    result.send({'error':'An error has occurred'});
                                                                                                                } 
                                                                                                                else
                                                                                                                {
                                                                                                                    console.log('FollowMeSendCurrentLocation - ' + res + ' document(s) updated');
                                                                                                                    result.send(temp);
                                                                                                                }
                                                                                                            });
                                                                                    });
                                                        });
                                });
    }
    console.log("FollowMeSendCurrentLocation - Out");
}

/*************************************************************/
/* FollowMeDropFollower -                                    */
/* Removes follower                                          */
/*************************************************************/
exports.FollowMeDropFollower = function(request, 
                                        result)
{
    console.log("FollowMeDropFollower - In");

    var usersCollection = common.GetUsersCollectionName();
    var followMeDB = common.GetDBConnection();
    var email = request.params.email;

    if(email == null)
    {
        console.log("FollowMeDropFollower - Invalid email value, email = " + email);
    }
    else
    {
        console.log("FollowMeDropFollower - Dropping follower from user with email: " + email);    

        followMeDB.collection(  usersCollection, 
                                function(   err, 
                                            collection) 
                                {
                                    collection.update(  { 'Email' : email },
                                                        { $unset: { 'Follower' : 1 }},
                                                        { safe : true }, 
                                                        function(   err, 
                                                                    res) 
                                                        {
                                                            if (err) 
                                                            {
                                                                console.log("FollowMeDropFollower - Error in dropping follower: " + err);
                                                                result.send({'FollowMeDropFollower - error':'An error has occurred - ' + err});
                                                            }
                                                            else
                                                            {
                                                                console.log("FollowMeDropFollower - The follower has removed from the document. result: " + res);
                                                                result.send(request.body);
                                                            }
                                                        });
                                });
    }
    console.log("FollowMeDropFollower - Out");
}