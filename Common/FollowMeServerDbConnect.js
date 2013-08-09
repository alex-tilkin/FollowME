var usersCollection = "Users";
var eventsCollection = "Events";
var dataBaseName = "FollowMeDB";

/* Database Connection */
var followMeDB = null;

var mongo = require('mongodb');

//var port = (process.env.VMC_APP_PORT || 3000);
//var host = (process.env.VCAP_APP_HOST || 'localhost');

/* We enter this code only once */
if(process.env.VCAP_SERVICES)
{
    /* JSON is a javascript object */
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else
{
    var mongo = 
    {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"", 
        "name":"",
        "db":"FollowMeDB"
    }
}

var generate_mongo_url = function(obj)
{
    /* According to where we are, we init our connection params */
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if(obj.username && obj.password)
  {
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else
  {
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);

require('mongodb').connect( mongourl, 
                            function(   err, 
                                        conn)
                            {
                                followMeDB = conn;
                                if(err == null) 
                                {
                                    console.log("Connected to " + dataBaseName + " database");
                                    followMeDB.collection(  usersCollection, 
                                                            {strict:true}, 
                                                            function(err, collection) 
                                                            {
                                                                if (err) 
                                                                {
                                                                    console.log("The '" + usersCollection + "' collection doesn't exist. Creating it with sample data...");
                                                                    populateFollowMeDB(usersCollection);
                                                                }
                                                            });

                                    followMeDB.collection(  eventsCollection, 
                                                            {strict:true}, 
                                                            function(err, collection) 
                                                            {
                                                                if (err) 
                                                                {
                                                                    console.log("The '" + eventsCollection + "' collection doesn't exist. Creating it with sample data...");
                                                                    populateFollowMeDB(eventsCollection);
                                                                }
                                                            });
                                }
                            });

exports.GetDBConnection = function()
{
    console.log("GetDBConnection - In");
    return followMeDB;
}

exports.GetUsersCollectionName = function()
{
    console.log("GetUsersCollectionName - In");
    return usersCollection;
}

exports.GetEventsCollectionName = function()
{
    console.log("GetEventsCollectionName - In");
    return eventsCollection;
}

var populateFollowMeDB = function(collectionName) 
{
    if(collectionName == usersCollection)
    {
        insertSampleUsers();
    }
    else 
    if(collectionName == eventsCollection)
    {
        insertSampleEvents();
    }
};

var insertSampleEvents = function()
{
    for (var index = 0; index < sampleUsers.length; index++) 
    {
            followMeDB.collection(  eventsCollection, 
                            function(   err, 
                                        collection) 
                            {
                                collection.insert(  sampleEvents[index], 
                                                    {safe:true}, 
                                                    function(   err, 
                                                                result)
                                                    {
                                                        console.log("Event result="+result);
                                                        console.log("err="+err);
                                                    });
                            });
    }
}

var insertSampleUsers = function()
{
    for (var index = 0; index < sampleUsers.length; index++) 
    {
        followMeDB.collection(usersCollection, 
                            function(   err, 
                                        collection) 
                            {
                                collection.insert(  sampleUsers[index], 
                                                    {safe:true}, 
                                                    function(   err, 
                                                                result)
                                                    {
                                                        console.log("User result="+result);
                                                        console.log("err="+err);
                                                    });
                            });
    }
}
/* FollowME Maintanance Utils - END */


/* FolloME Sample Data */
var sampleUsers = 
[
    {
        Email: "alextilk@gmail.com",
        Password: "1985",
        FirstName: "Alex",
        LastName: "Tilkin",
        DisplayName: "Shaolin Rabbi",
        Birthday: 
        {
            Date:
            {
                Day: "3",
                Moth: "8",
                Year: "1985"
            }
        },
        Address:
        {
            Country: "Israel",
            City: "Tel-Aviv",
            Street: "Shmryihu Levin",
            House: "16",
            Apartment: "8"
        },
        ConnectionStatus: "Offline",
        ProgressStatus: "Safe"
    },
    {
        Email: "sralexei@gmail.com",
        Password: "1234",
        FirstName: "Alexei",
        LastName: "Sragovich",
        DisplayName: "Sr. Alex",
        ConnectionStatus: "Offline",
        ProgressStatus: "Safe"
    },
    {
        Email : "lior@gmail.com",
        Password : "1234",
        FirstName : "Lior",
        LastName : "Solomon",
        DisplayName : "LiorS",
        ConnectionStatus : "Offline",
        ProgressStatus : "Safe",
        Address : 
        {
            Country : "Israel",
            City : "Herteliyha"
        },
        Path:
        {
            Start:
            {
                Longtitude: 400,
                Latitude: 400
            },
            End:
            {
                Longtitude: 450,
                Latitude: 450
            },
            MileStones:
            [
                {
                    Longtitude: 410,
                    Latitude: 410
                },
                {
                    Longtitude: 420,
                    Latitude: 420
                },
                {
                    Longtitude: 430,
                    Latitude: 430
                },
                {
                    Longtitude: 440,
                    Latitude: 440
                },
                {
                    Longtitude: 450,
                    Latitude: 450
                }
            ],
            CurrentLocation:
            {
                Longtitude: 425,
                Latitude: 425
            }
        }
    }
];

var sampleEvents = 
[
    {
        EventType:
        {
            Event: "Fire"
        },
        Creator: "alextilk@gmail.com",
        Approvals: 0,
        Timestamp:
        {
            Date:
            {
                Day: "7",
                Month: "8",
                Year: "2013"
            },
            Time:
            {
                Hours: "7",
                Minutes: "18",
                Seconds: "36"
            }
        },
        Location:
        {
            Longtitude: 854.56,
            Latitude: 469.98
        }
    },
    {
        EventType:
        {
            Event: "Hooligans"
        },
        Creator: "sralexei@gmail.com",
        Approvals: 0,
        Timestamp:
        {
            Date:
            {
                Day: "2",
                Month: "8",
                Year: "2013"
            },
            Time:
            {
                Hours: "21",
                Minutes: "18",
                Seconds: "36"
            }
        },
        Location:
        {
            Longtitude: 758.56,
            Latitude: 429.98
        }
    },
    {
        EventType:
        {
            Event: "Electicity Blackout"
        },
        Creator: "lior@gmail.com",
        Approvals: 1,
        Timestamp:
        {
            Date:
            {
                Day: "23",
                Month: "7",
                Year: "2013"
            },
            Time:
            {
                Hours: "13",
                Minutes: "46",
                Seconds: "17"
            }
        },
        Location:
        {
            Longtitude: 750.56,
            Latitude: 439.98
        }
    }
]
/* FolloME Sample Data - END */