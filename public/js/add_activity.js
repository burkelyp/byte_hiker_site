// Citation for page:
// Date: 05/18/2024
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/blob/main/Step%205%20-%20Adding%20New%20Data/public/js/add_person.js


// add_activity.js


// gets object to modify
let addActivityForm = document.getElementById('add-activity-form-ajax');

function showAddActivityForm() {
    document.getElementById('add-activity').style.display = 'block';
    document.getElementById('update-activity').style.display = 'none';
};

// modifies object
addActivityForm.addEventListener("submit", function (e) {
    
    // prevents form from submitting
    e.preventDefault();

    // gets inputs
    let inputUserID = document.getElementById("mySelectUser");
    let inputTrailID = document.getElementById("mySelectTrail");
    let inputCategoryID = document.getElementById("mySelectCategory");
    let inputDate = document.getElementById("input-date");
    let inputRating = document.getElementById("input-rating");
    let inputDuration = document.getElementById("input-duration");

    // gets value from inputs
    let userIDValue = inputUserID.value;
    let trailIDValue = inputTrailID.value;
    let categoryIDValue = inputCategoryID.value;
    let dateValue = inputDate.value;
    let ratingValue = inputRating.value;
    let durationValue = inputDuration.value;


    // puts new data into an object
    let data = {
        userID: userIDValue,
        trailID: trailIDValue,
        categoryID: categoryIDValue,
        date: dateValue,
        rating: ratingValue,
        duration: durationValue
    }
    
    // setup AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-activity-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // add new row to table
            addRowToTable(xhttp.response);

            // clear after add
            inputUserID.value = "";
            inputTrailID.value = "";
            inputCategoryID.value = "";
            inputDate.value = "";
            inputRating.value = "";
            inputDuration.value = "";

        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }
    document.getElementById('add-activity').style.display = 'none';

    // send request and wait for response
    xhttp.send(JSON.stringify(data));
})


// adds new row to table
addRowToTable = (data) => {

    // references current table 
    let currentTable = document.getElementById("activity-table");

    // refrences new data
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // create the row with cells
    let row = document.createElement("TR");
    let activityIDCell = document.createElement("TD");
    let userNameCell = document.createElement("TD");
    let trailNameCell = document.createElement("TD");
    let categoryCell = document.createElement("TD");
    let dateCell = document.createElement("TD");
    let ratingCell = document.createElement("TD");
    let durationCell = document.createElement("TD");
    let editCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // fill in cells with new data
    activityIDCell.innerText = newRow.activityID;
    userNameCell.innerText = newRow.userName;
    trailNameCell.innerText = newRow.trailName;
    categoryCell.innerHTML = newRow.icon;
    dateCell.innerText = new Date(newRow.date).toLocaleDateString('en-us', { weekday:"short", year:"numeric", month:"short", day:"numeric"});
    ratingCell.innerText = newRow.rating;
    durationCell.innerText = newRow.duration;

    // edit link in cell
    let editLink = document.createElement("a");
    editLink.href = "javascript:void(0);"; 
    editLink.innerText = "Edit"; 
    editLink.onclick = function() {
        updateActivity(newRow.activityID); 
    };

    // delete link in cell
    let deleteLink = document.createElement("a"); 
    deleteLink.href = "javascript:void(0);"; 
    deleteLink.innerText = "Delete"; 
    deleteLink.onclick = function() {
        deleteActivity(newRow.activityID); 
    };
    
    // put edit & delete link into cell
    editCell.appendChild(editLink);
    deleteCell.appendChild(deleteLink); 


    // add the cells to the row 
    row.appendChild(activityIDCell);
    row.appendChild(userNameCell);
    row.appendChild(trailNameCell);
    row.appendChild(categoryCell);
    row.appendChild(dateCell);
    row.appendChild(ratingCell);
    row.appendChild(durationCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);

    // deleteRow function can find added row
    row.setAttribute('data-value', newRow.activityID);

    // add the row to the table
    currentTable.appendChild(row);


}
