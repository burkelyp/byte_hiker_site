// Citation for page:
// Date: 05/18/2024
// Used basic route structure from template. Adjusted as needed for specific functionality throughout to match our needs.
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/blob/main/Step%205%20-%20Adding%20New%20Data/app.js

// Citation for delete:
// Date: 05/22/2024
// Used basic route structure from template. Adjusted as needed for specific functionality throughout to match our needs. 
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%207%20-%20Dynamically%20Deleting%20Data


/*
    SETUP
*/
var express = require('express');   
var app     = express();            

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

PORT        = 32451;                

const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');         // import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));      // create instance of handlebars engine to process templates
app.set('view engine', '.hbs');                     // use handlebars engine for *.hbs files

var db = require('./database/db-connector')



/*
    ROUTES
*/

// INDEX PAGE - GET route
app.get('/', function(req, res) {
    res.render('index', { title: 'Byte Hikers - Home' });
});


// *********************** USERS PAGE ROUTES *********************** //

// RETRIEVE all users with user preferences
app.get('/users', function(req, res) {

    // query to select users with UserCategoryPreferences
    let showUsers = `
        SELECT 
            Users.userID, userName, email, 
            GROUP_CONCAT(Categories.icon SEPARATOR ' ') AS trailPreferences 
        FROM Users 
        LEFT JOIN UserCategoryPreferences ON Users.userID = UserCategoryPreferences.userID 
        LEFT JOIN Categories ON UserCategoryPreferences.categoryID = Categories.categoryID
        GROUP BY Users.userID 
        ORDER BY Users.userID
    `;

    let getCategories = `SELECT * FROM Categories`;
    db.pool.query(showUsers, function(error, userRows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(500);
            return;
        }
        db.pool.query(getCategories, function(error, categories, fields) {
            if (error) {
                console.error(error);
                res.sendStatus(500);
                return
            }
            else {
                // render users page 
                res.render('users', { 
                    title: 'Byte Hikers - Users', 
                    data: userRows,
                    categories: categories
                });
            };
        });
    });
});


// CREATES user in Users table and creates UserCategoryPreferences entries for user via intersect table: UserCategoryPreferences
app.post('/add-user-ajax', function(req, res) {
    let data = req.body;

    // insert query for adding a user
    let insertUser = `
        INSERT INTO Users (userName, email) 
        VALUES ('${data.userName}', '${data.email}')
    `;

    db.pool.query(insertUser, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.status(400).json({ error: "Error inserting user" });
        } else {
           
            let userID = results.insertId;

            let showUsers = `
                SELECT 
                    Users.userID, userName, email, 
                    GROUP_CONCAT(Categories.icon SEPARATOR ' ') AS trailPreferences 
                FROM Users 
                LEFT JOIN UserCategoryPreferences ON Users.userID = UserCategoryPreferences.userID 
                LEFT JOIN Categories ON UserCategoryPreferences.categoryID = Categories.categoryID
                WHERE Users.userID = ${userID}
                GROUP BY Users.userID 
            `;
            // inserts trail preferences into UserCategoryPreferences table
            if (data.preferences.length > 0) {
                let preferencesData = data.preferences.map(pref => [userID, pref]);
                
                let insertPref = `
                    INSERT INTO UserCategoryPreferences (userID, categoryID) 
                    VALUES ?
                `;

                db.pool.query(insertPref, [preferencesData], function(error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.status(400).json({ error: "Error inserting preferences" });
                    } else {
                        // gets newly added user data
                        db.pool.query(showUsers, function(error, userRows, fields) {
                            if (error) {
                                console.log(error);
                                res.status(400).json({ error: "Error fetching user" });
                            } else {
                                res.status(200).json(userRows[0]);
                            }
                            
                        });
                    }
                });
            } else {
                // gets user if not trail preferences
                db.pool.query(showUsers, function(error, userRows, fields) {
                    if (error) {
                        console.log(error);
                        res.status(400).json({ error: "Error fetching user" });
                    } else {
                        res.status(200).json(userRows[0]);
                    }
                });
            }
        }
    });
});

// DELETE user
app.delete('/delete-user-ajax/', function(req,res,next) {
    let data = req.body;
    let userID = parseInt(data.userID);

    // delete query
    let deleteUser = `
        DELETE FROM Users 
        WHERE userID = ?
    `;

    // run query 
    db.pool.query(deleteUser, [userID], function(error, rows, fields) {
        if (error) {
            // log error on terminal and send 400 status
            console.log(error);
            res.sendStatus(400); 
        } else {
            // send 200 success status
            res.sendStatus(200); 
        }
  })});


// UPDATE user routes:

// RETRIEVE - populates user data 
app.get('/get-user/:userID', function(req, res, next) {

    let userID = req.params.userID;

    // selet user query
    let queryGetUser = 
        `SELECT userName, email 
        FROM Users 
        WHERE userID = ?`;

    db.pool.query(queryGetUser, [userID], function(error, rows, fields) {
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            // send data to client side
            res.status(200).json(rows[0]);
        }
    });
});


// RETRIEVE - gets user preferences from UserCategoryPreferences table to populate checkboxes
app.get('/get-user-preferences/:userID', function(req, res, next) {
    let userID = req.params.userID;

    // query to get user preferences
    let queryGetUserPreferences = `
        SELECT categoryID 
        FROM UserCategoryPreferences 
        WHERE userID = ?;
    `;

    db.pool.query(queryGetUserPreferences, [userID], function(error, rows, fields) {
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            // send data to client side
            res.status(200).json(rows);
        }
    });
});


// RETRIEVE - gets ALL categories from Categories table to create checkboxes
app.get('/get-categories', function(req, res, next) {

    let queryGetCategories = `
        SELECT categoryID, description 
        FROM Categories;
    `;

    db.pool.query(queryGetCategories, function(error, rows, fields) {
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            // send data to client side
            res.status(200).json(rows);
        }
    });
});


// UPDATE user in user table, deletes old preferences and adds new preferences in UserCategoryPreferences 
app.put('/put-user-ajax', function(req, res, next) {
    let data = req.body;
    let userID = data.userID;
    let userName = data.userName;
    let email = data.email;
    let preferences = data.preferences;

    // update user details
    let queryUpdateUser = `
        UPDATE Users 
        SET userName = ?, email = ? 
        WHERE userID = ?
    `;

    // delete existing preferences
    let queryDeletePreferences = `
        DELETE FROM UserCategoryPreferences 
        WHERE userID = ?
    `;

    // handles preferences
    let preferencesData = preferences.map(pref => [userID, pref]);
    let queryInsertPreferences = `
        INSERT INTO UserCategoryPreferences (userID, categoryID) 
        VALUES ?
    `;

    db.pool.query(queryUpdateUser, [userName, email, userID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            db.pool.query(queryDeletePreferences, [userID], function(error, rows, fields) {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    // inserts any new preferences 
                    if (preferences.length > 0) {
                        db.pool.query(queryInsertPreferences, [preferencesData], function(error, rows, fields) {
                            if (error) {
                                console.log(error);
                                res.sendStatus(400);
                            } else {
                                res.sendStatus(200);
                            }
                        });
                    } else {
                        res.sendStatus(200);
                    }
                }
            });
        }
    });
});

// *********************** END OF USERS PAGE ROUTES *********************** //


// *********************** CATEGORIES PAGE ROUTES *********************** //

let icons = null;

// RETRIEVES all categories
app.get('/categories', function(req, res) {

    // query to select categories
    let showCategories = `
        SELECT categoryID, description, icon
        FROM Categories;
    `;
    icons = ['<i class="fa-solid fa-fish"></i>',
        '<i class="fa-solid fa-spider"></i>',
        '<i class="fa-solid fa-paw"></i>',
        '<i class="fa-solid fa-frog"></i>',
        '<i class="fa-solid fa-feather-pointed"></i>',
        '<i class="fa-solid fa-dog"></i>',
        '<i class="fa-solid fa-crow"></i>',
        '<i class="fa-solid fa-bugs"></i>',
        '<i class="fa-solid fa-binoculars"></i>',
        '<i class="fa-solid fa-mountain-sun"></i>',
        '<i class="fa-solid fa-trailer"></i>',
        '<i class="fa-solid fa-tents"></i>',
        '<i class="fa-solid fa-person-hiking"></i>',
        '<i class="fa-solid fa-caravan"></i>',
        '<i class="fa-solid fa-campground"></i>',
        '<i class="fa-solid fa-person-biking"></i>',
        '<i class="fa-solid fa-hat-cowboy"></i>',
        '<i class="fa-solid fa-motorcycle"></i>',
        '<i class="fa-solid fa-truck-monster"></i>',
        '<i class="fa-solid fa-van-shuttle"></i>',
        '<i class="fa-solid fa-truck-pickup"></i>',
        '<i class="fa-solid fa-snowflake"></i>',
        '<i class="fa-solid fa-child-combatant"></i>',
        '<i class="fa-solid fa-water"></i>',
        '<i class="fa-solid fa-skull-crossbones"></i>',
        '<i class="fa-solid fa-broom"></i>',
        '<i class="fa-solid fa-sailboat"></i>',
        '<i class="fa-solid fa-person-swimming"></i>',
        '<i class="fa-solid fa-ship"></i>',
        '<i class="fa-solid fa-anchor"></i>',
        '<i class="fa-solid fa-cannabis"></i>',
        '<i class="fa-solid fa-bicycle"></i>',
        '<i class="fa-solid fa-person-skating"></i>',
        '<i class="fa-solid fa-person-running"></i>',
        '<i class="fa-solid fa-person-snowboarding"></i>',
        '<i class="fa-solid fa-person-skiing-nordic"></i>',
        '<i class="fa-solid fa-person-skiing"></i>',
        '<i class="fa-solid fa-person-walking"></i>',
        '<i class="fa-solid fa-horse"></i>'
    ];

   
                             
    db.pool.query(showCategories, function(error, rows, fields) {                       
        if (error) {
            console.error(error);
            res.sendStatus(500);
                return;
        }

        // renders categories page and categories table and icons to choose
        res.render('categories', { title: 'Byte Hikers - Categories', data: rows, icons: icons });     
        })
    });


// CREATES new category in Categories table
app.post('/add-category-ajax', function(req, res) {
 
    let data = req.body;

    // insert query
    query1 = `INSERT INTO Categories (categoryID, description, icon) 
              VALUES ('${data.categoryID}', '${data.description}', '${data.icon}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        } else {
            // if no error, display all categories
            showCategories =  `
                SELECT categoryID, description, icon
                FROM Categories;
            `;

            db.pool.query(showCategories, function(error, rows, fields) {

                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    res.send(rows);
                }
            })
        }
    })
});

app.post('/add-category-form', function(req, res) {

    let data = req.body;

    // insert query
    query1 = `INSERT INTO Categories (categoryID, description, icon) VALUES ('${data['input-categoryID']}', '${data['input-description']}', '${data['input-icon']}')`;

    db.pool.query(query1, function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        } else {
            res.redirect('/categories');
        }
    })
})


// UPDATE category routes:

// RETRIEVE category data to populate with category data on update category form
app.get('/get-category/:categoryID', function(req, res, next) {

    let categoryID = req.params.categoryID

    // selet category query
    let queryGetCategory = `SELECT categoryID, description, icon FROM Categories WHERE categoryID = ?`;
    let queryGetCategoryIcons = `SELECT icon FROM Categories WHERE categoryID != ?`;

    db.pool.query(queryGetCategory, [categoryID], function(error, rows, fields) {
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } 
        db.pool.query(queryGetCategoryIcons, [categoryID], function(error, existingIcons, fields) {
            if (error) {
                console.log(error);
                res.sendStatus(400);
            }
            else {
                let availableIconsUpdate = icons.filter(icon => !existingIcons.includes(icon));
                // send data to client side
                res.status(200).json(rows[0]);
            };
        });
    });
});


// UPDATE category
app.put('/put-category-ajax', function(req,res,next) {

    let data = req.body;
    let oldCategoryID = data.oldCategoryID;
    let categoryID = data.categoryID;
    let description = data.description;
    let icon = data.icon;

    // update query
    let queryUpdateCategory = `UPDATE Categories SET categoryID = ?, description = ?, icon = ? WHERE categoryID = ?`;

    // run query
    db.pool.query(queryUpdateCategory, [categoryID, description, icon, oldCategoryID], function(error, rows, fields){
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(200); 
        }   
    })
});


// DELETE category
app.delete('/delete-category-ajax/', function(req,res,next){
    let data = req.body;
    let categoryID = data.categoryID;

    let deleteCategory = `DELETE FROM Categories WHERE categoryID = ?`;

    // run query 
    db.pool.query(deleteCategory, [categoryID], function(error, rows, fields){
        if (error) {
            // log error on terminal and send 400 status
            console.log(error);
            res.sendStatus(400); 
        } else {
            // send 200 success status
            res.sendStatus(200); 
        }
  })});

// *********************** END OF CATEGORIES PAGE ROUTES *********************** //


// *********************** TRAILS PAGE ROUTES *********************** //

// RETRIEVES all trails
app.get('/trails', function(req, res) {
    
    // query to select trails
    let showTrails = `
        SELECT Trails.trailID, Trails.trailName, Trails.distance, Trails.difficulty, Trails.elevationGain, Trails.location, 
        CASE 
            WHEN Trails.dogFriendly = 1 THEN 'Yes' 
            WHEN Trails.dogFriendly = 0 THEN 'No'
        END as "dogFriendly",
        CASE 
            WHEN Trails.waterfall = 1 THEN 'Yes' 
            WHEN Trails.waterfall = 0 THEN 'No'
        END as "waterfall",	
            Trails.description, 
            GROUP_CONCAT(DISTINCT Categories.icon SEPARATOR ' ') AS "supportedActivityTypes",
        CASE 
            WHEN AVG(Activities.rating) is null Then '--' ELSE CAST(AVG(Activities.rating) AS FLOAT) 
        END AS avgRating, 
        CASE 
            WHEN AVG(Activities.duration) is null Then '--' ELSE CAST(AVG(Activities.duration) AS FLOAT)
        END AS avgDuration
        FROM Trails
        LEFT JOIN TrailCategories ON TrailCategories.trailID = Trails.trailID
        LEFT JOIN Categories ON TrailCategories.categoryID = Categories.categoryID
        LEFT JOIN Activities ON Trails.trailID = Activities.trailID
        GROUP BY Trails.trailID;
    `;

    // query to select categories
    let showCategories = `
        SELECT categoryID, description 
        FROM Categories;
    `;

    db.pool.query(showTrails, function(error, trailRows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(500);
            return;
        }

        db.pool.query(showCategories, function(error, categoryRows, fields) {
            if (error) {
                console.error(error);
                res.sendStatus(500);
                return;
            }

            // render trails page and pass both trail data and category data
            res.render('trails', { 
                title: 'Byte Hikers - Trails', 
                data: trailRows,
                categories: categoryRows
            });
        });
    });
});


// CREATE trail in trails table
app.post('/add-trail-ajax', function(req, res) {
    let data = req.body;
    let distance = data.distance;
    if (distance == '') {distance = null};
    let elevationGain = data.elevationGain;
    if (elevationGain == '') {elevationGain = null};
    let description = data.description;
    if (description == '') {description = null};

    // insert query for adding a trail
    let insertTrail = `
        INSERT INTO Trails (trailName, location, difficulty, distance, elevationGain, description, dogFriendly, waterfall) 
        VALUES ('${data.trailName}', '${data.location}', '${data.difficulty}', ?, ?, ?, '${data.dogFriendly}', '${data.waterfall}')
    `;

    db.pool.query(insertTrail, [distance, elevationGain, description], function(error, results, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            let trailID = results.insertId;

            let showTrails = ` 
            SELECT 
                Trails.trailID, 
                Trails.trailName, 
                Trails.location, 
                Trails.distance, 
                        
                GROUP_CONCAT(Categories.icon SEPARATOR ' ') AS "supportedActivityTypes", 
                        
                Trails.difficulty, 
                Trails.elevationGain,  
                Trails.description, 
    
                CASE 
                    WHEN Trails.dogFriendly = 1 THEN 'Yes' 
                    WHEN Trails.dogFriendly = 0 THEN 'No'
                    END as "dogFriendly",
                            
                CASE 
                    WHEN Trails.waterfall = 1 THEN 'Yes' 
                    WHEN Trails.waterfall = 0 THEN 'No'
                    END as "waterfall"	
                            
                FROM Trails
                LEFT JOIN TrailCategories ON TrailCategories.trailID = Trails.trailID
                LEFT JOIN Categories ON TrailCategories.categoryID = Categories.categoryID
                WHERE Trails.trailID = ?
                GROUP BY Trails.trailID;
            `;

            if (data.supportedActivities && data.supportedActivities.length > 0) {
                let supportedActivitiesData = data.supportedActivities.map(activity => [trailID, activity]);

                let updateCategories = `
                    INSERT INTO TrailCategories (trailID, categoryID) 
                    VALUES ?
                `;

                db.pool.query(updateCategories, [supportedActivitiesData], function(error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(400);
                    } else {
                        db.pool.query(showTrails, [trailID], function(error, rows, fields) {
                            if (error) {
                                console.log(error);
                                res.sendStatus(400);
                            } else {
                                res.send(rows[0]);
                            }
                        });
                    }
                });
            } else {
                db.pool.query(showTrails, [trailID], function(error, rows, fields) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(400);
                    } else {
                        res.send(rows[0]);
                    }
                });
            }
        }
    });
});


// UPDATE trails routes:

// RETIREVE trail data to populate with trail data on update trail form
app.get('/get-trail/:trailID', function(req, res, next) {

    let trailID = req.params.trailID;
    
    // selet category query
    let queryGetTrail = `
    SELECT * FROM Trails WHERE trailID = ?
    
    `;
    
    db.pool.query(queryGetTrail, [trailID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            // send data to client side
            res.status(200).json(rows[0]);
        }
    });
});


// RETIREVE trail categories to populate checkboxes for update
app.get('/get-trail-categories/:trailID', function(req, res, next) {
    let trailID = req.params.trailID;

    // query to get user preferences
    let queryGetTrailCategories = `
        SELECT categoryID 
        FROM TrailCategories 
        WHERE trailID = ?;
    `;

    db.pool.query(queryGetTrailCategories, [trailID], function(error, rows, fields) {
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            // send data to client side
            res.status(200).json(rows);
        }
    });
});


// UPDATE trail
app.put('/put-trail-ajax', function(req,res,next) {

    let data = req.body;
    let trailID = data.trailID;
    let trailName = data.trailName;
    let location = data.location;
    let categories = data.categories.map(cat => [trailID, cat]);
    let distance = data.distance;
    if (distance == '') {distance = null};
    let elevationGain = data.elevationGain;
    if (elevationGain == '') {elevationGain = null};
    let dogFriendly = data.dogFriendly;
    let waterfall = data.waterfall;
    let difficulty = data.difficulty;
    let description = data.description;
    if (description == '') {description = null};

    // update query
    let queryUpdateTrail = `UPDATE Trails SET trailName = ?, distance = ?, difficulty = ?, elevationGain = ?, location = ?, dogFriendly = ?, waterfall = ?, description = ? WHERE trailID = ?`;
    let queryDeleteTrailCategories = `DELETE FROM TrailCategories WHERE trailID = ?`;
    let queryUpdateTrailCategories = `INSERT INTO TrailCategories (trailID, categoryID) VALUES ?`;

    // run query
    db.pool.query(queryUpdateTrail, [trailName, distance, difficulty, elevationGain, location, dogFriendly, waterfall, description, trailID], function(error, rows, fields){
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        };

        db.pool.query(queryDeleteTrailCategories, [trailID], function(error, rows, fields) {
            if (error) {
                console.log(error);
                res.sendStatus(400);
            };
            if (categories.length > 0) {
                db.pool.query(queryUpdateTrailCategories, [categories], function(error, rows, fields) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(400);
                    }
                    else {
                        res.sendStatus(200); 
                    };
                });
            }
            else {
                res.sendStatus(200);
            };
        });   
    });
});


// DELETE trail
app.delete('/delete-trail-ajax/', function(req,res,next) {
    let data = req.body;
    let trailID = parseInt(data.trailID);

    let deleteTrail = `DELETE FROM Trails WHERE trailID = ?`;

    // run query 
    db.pool.query(deleteTrail, [trailID], function(error, rows, fields) {
        if (error) {
            // log error on terminal and send 400 status
            console.log(error);
            res.sendStatus(400); 
        } else {
            // send 200 success status
            res.sendStatus(200); 
        }
  })});


// *********************** END OF TRAILS PAGE ROUTES *********************** //



// *********************** ACTIVITIES PAGE ROUTES *********************** //

// RETRIEVE all activities
app.get('/activities', function(req, res) {

    // query to select Activities with UserCategoryPreferences
    let showActivities = `
        SELECT  activityID,
                Users.userName AS userName,
                Trails.trailName AS trailName,
                Categories.icon AS icon,
                date,
                rating,
                duration
        FROM Activities
        LEFT JOIN Users
            ON Users.userID = Activities.userID
        LEFT JOIN Trails
            ON Trails.trailID = Activities.trailID
        LEFT JOIN Categories
            ON Categories.categoryID = Activities.categoryID
        ORDER BY activityID;
    `;
    let getUsers = `SELECT userID, userName FROM Users ORDER BY userName`;
    let getTrails = `SELECT trailID, trailName FROM Trails ORDER BY trailName`;
    let getCategories = `SELECT * FROM Categories ORDER BY description`;
                             
    db.pool.query(showActivities, function(error, rows, fields) {     
        
        let activities = rows;
        for (let i = 0; i < activities.length; i++) {
            activities[i].date = new Date(activities[i].date).toLocaleDateString('en-us', { weekday:"short", year:"numeric", month:"short", day:"numeric"});
            if (activities[i].trailName === null) {
                activities[i].trailName = 'null'
            }
            if (activities[i].icon === null) {
                activities[i].icon = 'null'
            }
            
        }

        db.pool.query(getUsers, function(error, rows, fields) {
            let users = rows;

            db.pool.query(getTrails, function(error, rows, fields) {
                let trails = rows;

                db.pool.query(getCategories, function(error, rows, fields) {
                    let categories = rows;

                    // renders activities page and activities table
                    res.render('activities', { title: 'Byte Hikers - Activities', data: activities, users: users, trails: trails, categories: categories}); 
                })
            })
        })          
    })
});

// CREATE activity in Activities table
app.post('/add-activity-ajax', function(req, res) {
 
    let data = req.body;
    if (data.rating == '') {data.rating = null};
    if (data.duration == '') {data.duration = null};

    // insert query
    query1 = `INSERT INTO Activities (userID, trailID, categoryID, date, rating, duration) VALUES ('${data.userID}', '${data.trailID}', '${data.categoryID}', '${data.date}', ?, ?)`;

    db.pool.query(query1, [data.rating, data.duration], function(error, rows, fields){

        if (error) {
            console.log(error)
            res.sendStatus(400);
        } else {
            // if no error, display all users
            showActivities = `
            SELECT  activityID,
                Users.userName AS userName,
                Trails.trailName AS trailName,
                Categories.icon AS icon,
                CAST(date AS date) AS date,
                rating,
                duration
            FROM Activities
            INNER JOIN Users
                ON Users.userID = Activities.userID
            INNER JOIN Trails
                ON Trails.trailID = Activities.trailID
            INNER JOIN Categories
                ON Categories.categoryID = Activities.categoryID
            ORDER BY activityID;
            `;

            db.pool.query(showActivities, function(error, rows, fields) {

                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    res.send(rows);
                }
            })
        }
    })
});


// UPDATE activity routes:

// RETRIEVES activity data to populate with activity data on update activity form
app.get('/get-activity/:activityID', function(req, res, next) {

    let activityID = req.params.activityID;

    // selet category query
    let queryGetActivity = `SELECT * FROM Activities WHERE activityID = ?`;
    let queryGetUsers = `SELECT userID, userName FROM Users`;
    let queryGetTrails = `SELECT trailID, trailName FROM Trails`;
    let queryGetCategories = `SELECT categoryID, description FROM Categories`;

    db.pool.query(queryGetActivity, [activityID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            let activity = rows[0]
            db.pool.query(queryGetUsers, function(error, users, fields) {
                // send status codes
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    db.pool.query(queryGetTrails, function(error, trails, fields) {
                        // send status codes
                        if (error) {
                            console.log(error);
                            res.sendStatus(400);
                        } else {
                            db.pool.query(queryGetCategories, function(error, categories, fields) {
                                // send status codes
                                if (error) {
                                    console.log(error);
                                    res.sendStatus(400);
                                } else {
                                    // send data to client side
                                    res.status(200).json(activity, users, trails, categories);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// UPDATE activity
app.put('/put-activity-ajax', function(req,res,next) {

    let data = req.body;
    let activityID = data.activityID;
    let userID = data.userID;
    let trailID = data.trailID;
    let categoryID = data.categoryID;
    let date = data.date;
    let rating = data.rating;
    if (rating == '') {rating = null};
    let duration = data.duration;
    if (duration == '') {duration = null};

    // update query
    let queryUpdateActivity = `UPDATE Activities SET userID = ?, trailID = ?, categoryID = ?, date = ?, rating = ?, duration = ? WHERE activityID = ?`;

    // run query
    db.pool.query(queryUpdateActivity, [userID, trailID, categoryID, date, rating, duration, activityID], function(error, rows, fields){
        // send status codes
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(200); 
        }   
    })
});


// DELETE activity
app.delete('/delete-activity-ajax/', function(req,res,next) {
    let data = req.body;
    let activityID = parseInt(data.activityID);

    let deleteActivity = `DELETE FROM Activities WHERE activityID = ?`;

    // run query 
    db.pool.query(deleteActivity, [activityID], function(error, rows, fields) {
        if (error) {
            // log error on terminal and send 400 status
            console.log(error);
            res.sendStatus(400); 
        } else {
            // send 200 success status
            res.sendStatus(200); 
        }
  })});

// *********************** END OF ACTIVITIES PAGE ROUTES *********************** //


/*
    LISTENER
*/
app.listen(PORT, function() {            
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
