//  Citation for "update activity":
//  Date: 06/01/2024
//  Adapted from:
//  Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%208%20-%20Dynamically%20Updating%20Data

//  Citation for Javascript callback functions:
//  Date: 06/01/2024
//  Referenced from:
//  Source URL: https://developer.mozilla.org/en-US/docs/Glossary/Callback_function

//  Citation for Array and Map:
//  Date: 06/01/2024
//  Referenced from:
//  Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from


let updateActivityForm = document.getElementById('update-activity-form-ajax');
let activityID = null;

function updateActivity(id) {
    activityID = id
    document.getElementById('update-activity').style.display = 'block';
    document.getElementById('add-activity').style.display = 'none';

    // setup AJAX request
    if (activityID) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/get-activity/${activityID}`, true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                    
                let activityData = JSON.parse(xhttp.response);
                    
                // populates data for selected
                document.getElementById("mySelectUser-update").value = activityData.userID;
                document.getElementById("mySelectTrail-update").value = activityData.trailID;
                document.getElementById("mySelectCategory-update").value = activityData.categoryID;
                document.getElementById("input-date-update").value = new Date(activityData.date).toISOString().slice(0, 10);
                document.getElementById("input-rating-update").value = activityData.rating;
                document.getElementById("input-duration-update").value = activityData.duration;
            }
        };

        // send request
        xhttp.send();
    };
};




// updates activity data
updateActivityForm.addEventListener("submit", function (e) {
    
    // prevents form from submitting
    e.preventDefault();

    // form fields to get data from
    let inputUserID = document.getElementById("mySelectUser-update");
    let inputTrailID = document.getElementById("mySelectTrail-update");
    let inputCategoryID = document.getElementById("mySelectCategory-update");
    let inputDate = document.getElementById("input-date-update");
    let inputRating = document.getElementById("input-rating-update");
    let inputDuration = document.getElementById("input-duration-update");

    // get values from form fields
    let userIDValue = inputUserID.value;
    let trailIDValue = inputTrailID.value;
    let categoryIDValue = inputCategoryID.value;
    let dateValue = inputDate.value;
    let ratingValue = inputRating.value;
    let durationValue = inputDuration.value;

    // new data package
    let data = {
        activityID: activityID,
        userID: userIDValue,
        trailID: trailIDValue,
        categoryID: categoryIDValue,
        date: dateValue,
        rating: ratingValue,
        duration: durationValue
    }
        
    // setup AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/put-activity-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {

        if (xhttp.readyState == 4 && xhttp.status == 200) {
       
            // add new data to the table
            updateRow(data, activityID);

            // clears update fields after insert
            inputUserID.value = '';
            inputTrailID.value = '';
            inputCategoryID.value = '';
            inputDate.value = '';
            inputRating.value = '';
            inputDuration.value = '';

            // reloads page
            location.reload(); 

        }  else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }
    // send request
    xhttp.send(JSON.stringify(data));

});


// updates activity data in row
function updateRow(data, activityID){
    let table = document.getElementById("activity-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
       
        // updates table with new data
        if (table.rows[i].getAttribute("data-value") == activityID) {

            let updateRowIndex = table.getElementsByTagName("tr")[i];
            let userName = updateRowIndex.getElementsByTagName("td")[1];
            let trailName = updateRowIndex.getElementsByTagName("td")[2];
            let category = updateRowIndex.getElementsByTagName("td")[3];
            let date = updateRowIndex.getElementsByTagName("td")[4];
            let rating = updateRowIndex.getElementsByTagName("td")[5];
            let duration = updateRowIndex.getElementsByTagName("td")[6];
            userName.innerHTML = data.userName;
            trailName.innerHTML = data.trailName; 
            category.innerHTML = data.category;
            date.innerHTML = data.date;
            rating.innerHTML = data.rating;
            duration.innerHTML = data.duration
       }
    }
};