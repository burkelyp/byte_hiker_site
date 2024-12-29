//  Citation for "update trail":
//  Date: 06/02/2024
//  Adapted from:
//  Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%208%20-%20Dynamically%20Updating%20Data

//  Citation for Javascript callback functions:
//  Date: 06/02/2024
//  Referenced from:
//  Source URL: https://developer.mozilla.org/en-US/docs/Glossary/Callback_function

//  Citation for Array and Map:
//  Date: 06/02/2024
//  Referenced from:
//  Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from


// gets update trail form and select trail elements


let updateTrailForm = document.getElementById('update-trail-form-ajax');
let trailID = null;

function updateTrail(id) {

    // Clear check boxes
    let checkboxes = document.querySelectorAll('input[type=checkbox]');
    for (let i = 0, len = checkboxes.length; i < len; i++) {
        checkboxes[i].checked = false;
    };

    trailID = id;

    // show update form and hide add table
    document.getElementById('update-trail').style.display = 'block';
    document.getElementById('add-trail').style.display = 'none';

    // setup AJAX request
    if (trailID) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/get-trail/${trailID}`, true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                
                let trailData = JSON.parse(xhttp.response);

                // populates data for selected
                document.getElementById("input-trailName-update").value = trailData.trailName;
                document.getElementById("input-location-update").value = trailData.location;
                document.getElementById("input-distance-update").value = trailData.distance;
                document.getElementById("input-elevationGain-update").value = trailData.elevationGain;
                document.getElementById("input-description-update").value = trailData.description;
                document.getElementById("input-difficulty-update").value = trailData.difficulty;
                if (trailData.dogFriendly == 1) {
                    document.getElementById("dogFriendlyYes-update").checked = true;
                }
                else {
                    document.getElementById("dogFriendlyNo-update").checked = true;
                };
                if (trailData.waterfall == 1) {
                    document.getElementById("waterfallYes-update").checked = true;
                }
                else {
                    document.getElementById("waterfallNo-update").checked = true;
                };
                getTrailCategories(trailID);    
            };
        };
    };
    // send request
    xhttp.send();   
};


function getTrailCategories(trailID) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/get-trail-categories/${trailID}`, true);
            
    // handles response, tell AJAX request how to resolve
    xhttp.onreadystatechange = () => { 
        // check if request is complete
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let categoryTypes = JSON.parse(xhttp.responseText);
            for (let i = 0; i < categoryTypes.length; i++) {
                document.getElementById("category-" + categoryTypes[i].categoryID + "-update").checked = true;
              }
        }
    };
            
    // send request
    xhttp.send();
};


// updates trail data in database
updateTrailForm.addEventListener("submit", function (e) {
   
    // prevents form from submitting
    e.preventDefault();

    // form fields to get data from
    let inputTrailName = document.getElementById("input-trailName-update");
    let inputLocation = document.getElementById("input-location-update");
    let checkboxes = document.querySelectorAll('input[name="supportedActivities"]:checked');
    let inputDifficulty = document.getElementById("input-difficulty-update");
    let inputDescription = document.getElementById("input-description-update");
    let inputDistance = document.getElementById("input-distance-update");
    let inputElevationGain = document.getElementById("input-elevationGain-update");
    let inputDogFriendly = document.getElementsByName("input-dogFriendly");
    let inputWaterfall = document.getElementsByName("input-waterfall");
    
    // get values from fields
    let trailNameValue = inputTrailName.value;
    let locationValue = inputLocation.value;
    let categories = Array.from(checkboxes).map(checkbox => checkbox.value);
    let difficultyValue = inputDifficulty.value;
    let descriptionValue = inputDescription.value;
    let distanceValue = inputDistance.value;
    let elevationGainValue = inputElevationGain.value;
    let dogFriendlyValue = 0;
    for (i = 0; i < inputDogFriendly.length; i++) {
        if (inputDogFriendly[i].checked)
            dogFriendlyValue = inputDogFriendly[i].value;
    };
    let waterfallValue = 0;
    for (i = 0; i < inputWaterfall.length; i++) {
        if (inputWaterfall[i].checked)
            waterfallValue = inputWaterfall[i].value;
    };


    // new data package
    let data = {
        trailID: trailID,
        trailName: trailNameValue,
        location: locationValue,
        categories: categories,
        distance: distanceValue,
        elevationGain: elevationGainValue,
        dogFriendly: dogFriendlyValue,
        waterfall: waterfallValue,
        description: descriptionValue,
        difficulty: difficultyValue
    }
    
    // setup AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/put-trail-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {

        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // add new data to the table
            updateRow(data, trailID);

            // reloads page
            location.reload(); 

        }  else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }
    // send request
    xhttp.send(JSON.stringify(data));

})


// updates trail data in row
function updateRow(data, trailID){

    let table = document.getElementById("trails-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
       
        // updates table with new data
        if (table.rows[i].getAttribute("data-value") == trailID) {

            let updateRowIndex = table.getElementsByTagName("tr")[i];
            let trailName = updateRowIndex.getElementsByTagName("td")[1];
            let location = updateRowIndex.getElementsByTagName("td")[2];
            let distance = updateRowIndex.getElementsByTagName("td")[3];
            let elevationGain = updateRowIndex.getElementsByTagName("td")[5];
            let description = updateRowIndex.getElementsByTagName("td")[6];

            trailName.innerHTML = data.trailName;
            location.innerHTML = data.location; 
            distance.innerHTML = data.distance;
            elevationGain.innerHTML = data.elevationGain;
            description.innerHTML = data.description;
       }
    }
}