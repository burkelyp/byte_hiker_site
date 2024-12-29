/*
Group 65: Byte Hikers
DDL for Byte Hiker database
by Burkely Pettijohn and Lindsay Schwartz
*/

SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;


/*
Create table Users for users of the app
No 2 users will be able to have identical email address
*/
DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    userID int NOT NULL AUTO_INCREMENT,
    userName varchar(125),
    email varchar(125) UNIQUE,
    PRIMARY KEY(userID)
);


/*
Create table Categories for activity types of the app
A unique categoryID and description are required
*/
DROP TABLE IF EXISTS Categories;
CREATE TABLE Categories (
    categoryID varchar(25) NOT NULL UNIQUE,
    description varchar(125) NOT NULL UNIQUE,
    icon varchar(125) NOT NULL,
    PRIMARY KEY(categoryID)
);


/*
Create table UserCategoryPreferences
intersection table for Users and Categories
A unique userID and categoryID combination is required
*/
DROP TABLE IF EXISTS UserCategoryPreferences;
CREATE TABLE UserCategoryPreferences (
    userCategoryPreferenceID int NOT NULL AUTO_INCREMENT,
    userID int NOT NULL,
    categoryID varchar(25) NOT NULL,
    PRIMARY KEY (userCategoryPreferenceID),
    FOREIGN KEY(UserID) REFERENCES Users(userID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(categoryID) REFERENCES Categories(categoryID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT UniqueEntry UNIQUE (userID, categoryID)

);



/*
Create table Trails for trails of the app
trailName must be unique
*/
DROP TABLE IF EXISTS Trails;
CREATE TABLE Trails (
    trailID int NOT NULL AUTO_INCREMENT,
    trailName varchar(255) NOT NULL UNIQUE,
    distance decimal(11,2),
    difficulty varchar(50),
    elevationGain int,
    location varchar(255),
    dogFriendly tinyint,
    waterfall tinyint,
    description longtext,
    PRIMARY KEY (trailID)
);



/*
Create table TrailCategories for activity types of the app
intersection table for Trails and Categories
A unique trailID and categoryID combination is required
*/
DROP TABLE IF EXISTS TrailCategories;
CREATE TABLE TrailCategories (
    trailCategoryID int NOT NULL AUTO_INCREMENT,
    trailID int NOT NULL,
    categoryID varchar(25) NOT NULL,
    PRIMARY KEY(trailCategoryID),
    FOREIGN KEY(trailID) REFERENCES Trails(trailID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(categoryID) REFERENCES Categories(categoryID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT UniqueEntry UNIQUE (trailID, categoryID)

);



/*
Create table Activities for recording acitivities
*/
DROP TABLE IF EXISTS Activities;
CREATE TABLE Activities (
    activityID int NOT NULL AUTO_INCREMENT,
    trailID int,
    userID int NOT NULL,
    categoryID varchar(25),
    date date NOT NULL,
    rating int,
    duration decimal(11,2),
    PRIMARY KEY (activityID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (trailID) REFERENCES Trails(trailID) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (categoryID) REFERENCES Categories(categoryID) ON DELETE SET NULL ON UPDATE CASCADE
);



/*
Insert sample data into database
*/

INSERT INTO Users (`userName`, `email`)
VALUES  ('Joe Smith', 'jsmith@email.com'),
('Burk Petitjean', 'petitjeb@oreganstate.edu'),
('Linda Smith', 'schwa@oregonstate.edu'),
('Jessica LaNarnia', 'jrenelan@me.com');

INSERT INTO Categories (`categoryID`, `description`, `icon`)
VALUES ('hike', 'Hiking', '<i class="fa-solid fa-person-hiking"></i>'),
('mtb', 'Mountain Biking', '<i class="fa-solid fa-person-biking"></i>'),
('run', 'Trail Running', '<i class="fa-solid fa-person-running"></i>'),
('ski', 'Cross Country Skiing', '<i class="fa-solid fa-person-skiing-nordic"></i>'),
('horse', 'Horseback Riding', '<i class="fa-solid fa-horse"></i>');

INSERT INTO UserCategoryPreferences (`userID`, `categoryID`)
VALUES (3, 'hike'),
(1, 'run'),
(2, 'hike'),
(2, 'mtb'),
(2, 'ski'),
(2, 'run'),
(2, 'horse'),
(4, 'hike'),
(4, 'mtb'),
(3, 'mtb');


INSERT INTO Trails (`trailName`, `distance`, `difficulty`, `elevationGain`, `location`, `dogFriendly`, `waterfall`, `description`)
Values ('Rainbow Falls Trail', 3.9, 'Moderate', 770, 'Gorges State Park, Lake Taxoway, NC', 1, 1, 'Out and back. Falls: Rainbow Falls, Turtleback Falls, Drift Falls.'),
('Barnett Branch Trail', 9.3, 'Moderate', 1689, 'Pisgah National Forest, US-276, NC', 1, 1, 'Out and back. Falls: Barnett Branch Falls. Ends at Black Mountian Trail.'),
('Looking Glass Trail', 6.1, 'Moderate', 1716, 'Pisgah National Forest, Brevard, NC', 1, 0, 'Out and back. View of Looking Glass Rock and panoramic views of the Blue Ridge Mountians. Flat rock for helicopter landing pad.'),
('Acadiana Park', 5.2, 'Moderate', 128, '1212 E Alexander St, Lafayette, LA', 0, 0, 'Swampy loop near the Vermillion River. Medium roller jumps.');

INSERT INTO TrailCategories (`trailID`, `categoryID`)
VALUES (1, 'hike'),
(3, 'hike'),
(2, 'hike'),
(4, 'hike'),
(4, 'mtb'),
(4, 'run'),
(3, 'run'),
(1, 'horse'),
(1, 'mtb');

INSERT INTO Activities (`userID`, `trailID`, `categoryID`, `date`, `rating`, `duration`)
VALUES (3, 2, 'hike', 20240329, 4, 264),
(3, 1, 'hike', 20240426, 5, 134),
(1, 3, 'hike', 20240202, 5, 148),
(2, 4, 'mtb', 20231012, 4, 45),
(4, 4, 'mtb', 20231012, 3, 50);

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
