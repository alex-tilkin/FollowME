var common = require('./FollowMeServerDbConnect');

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
/* FollowMeDropEvent -                                     */
/* Drop event from the map                                 */
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