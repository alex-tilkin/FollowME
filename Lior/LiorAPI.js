var common = require('./FollowMeServerDbConnect');
var usersCollection = common.GetUsersCollectionName();
var followMeDB = common.GetDBConnection();

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

/*
*FollowMeGetUserByEmail
*This function return user details by given email.
*get method.
*/
exports.followMeGetUserByEmail = function(req, res) {
    console.log("FollowMeGetUserByEmail, In");
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

    console.log("FollowMeGetUserByEmail, Out");
}
/*
*FollowMeGetAllUsers
*This function return all the users that stored on the db.
*get method.
*/
exports.followMeGetAllUsers = function(req, res) {
    console.log("FollowMeGetAllUsers, In");
	console.log('Retrieving All users');
	followMeDB.collection(usersCollection, function(err, collection) {
		collection.find().toArray(function(error, items) {
			res.setHeader("Content-Type", "text/plain");
			console.log("error = " + error);
			console.log("items = " + items);		
			res.send(items);
		});
	});
	
    console.log("FollowMeGetAllUsers, Out");
}

/*
*followMeDeleteUser
*This function delete user from the db by given id.
*delete method.
*/
//TODO: unit test.
exports.followMeDeleteUser = function(req, res) {
    console.log("followMeDeleteUser, In");
	var id = req.params.id;
	console.log('Deleting user by given id: ' + id);
	followMeDB.collection(usersCollection, function(err, collection) {
		collection.remove({'sid':id}, {safe:true}, function(err, res) {
			if (err) {
				res.send({'error':'An error has occurred - ' + err});
			} else {
				console.log('' + res + ' document(s) deleted');
				res.send(req.body);
			}
		});
	});
	
    console.log("followMeDeleteUser, Out");
}

/*
*FollowMeLogIn
*This function make user login to the system by user credentials.
*If the user credentials are not authenticate than the function will not
*change the user ConnectionStatus.
*The function send API messages respectively.
*get method.
*/
//TODO: maybe change to put method
exports.FollowMeLogIn = function(req, res) {
    console.log("FollowMeLogIn, In");
	var email = req.params.email;
	var password = req.params.password;
	console.log("email: " + email);
	console.log("password: " + password);
	
	if (email && password) {
		console.log('FollowMeLogIn, email & password not null');
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
	
	console.log("FollowMeLogIn, Out");
}


/*
*FollowMeIsUserExist
*This function make a user registration.
*get method.
*/
exports.FollowMeIsUserExist = function(req, res) {
    console.log("FollowMeIsUserExist, In");
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

	console.log("FollowMeIsUserExist, Out");
}

/*
*FollowMeIsDisplayNameExist
*This function make a user registration.
*get method.
*/
exports.FollowMeIsDisplayNameExist = function(req, res) {
    console.log("FollowMeIsDisplayNameExist, In");
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

	console.log("FollowMeIsDisplayNameExist, Out");
}

/*
*FollowMeSignIn
*This function make a user registration.
*post method.
*Assumption: The User (email) does not exist in the db.
*/
//TODO: add API message for success and for failed.
exports.FollowMeSignIn = function(req, res) {
    console.log("FollowMeSignIn, In");
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
    
	console.log("FollowMeSignIn, Out");
}
	
/*
*FollowMeSetFollower
*This function create a follower to a given user.
*This function return the user path
*post method.
*/
//TODO: check if nodejs/express has session if yes than the function do not need to get the user email.
exports.FollowMeSetFollower = function(req, res) {
    console.log("FollowMeSetFollower, In");
	
	//TODO:implement.
    var email = req.params.email;
	
	if (email) {
		
	}
	console.log("FollowMeSetFollower, Out");
}

/*
*FollowMeAddFriend
*This function add a friend to a given user.
*Function assumption: The email to add as a friend EXIST! (client side would check if exist before invoke this function).
*post method.
*/
//TODO: check if nodejs/express has session if yes than the function do not need to get the user email.
//TODO: complete. need to send all the user information???
exports.FollowMeAddFriend = function(req, res) {
    console.log("FollowMeAddFriend, In");
	var email = req.params.email;
	console.log('email: ' + email);
	var friend = req.body;
	console.log("FollowMeAddFriend, friend details: " + JSON.stringify(friend) + "\n" );
	if (email) {
		followMeDB.collection(usersCollection, function(err, collection) {
			//TODO: check nodjs/express for session. if yes change email to id.
			collection.update({'Email':email}, {$set:{'Friends' : friend}}, {safe:true}, function(err, result) {
				if (err) {
					console.log('Error updating users students: ' + err);
					res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated');
					res.send(friend);
				}
			});
		});	
	}
    
	console.log("FollowMeAddFriend, Out");
}

/*************************************************************************************************/
