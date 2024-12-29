// Citation for page:
// Date: 05/18/2024
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/blob/main/Step%205%20-%20Adding%20New%20Data/public/js/add_person.js


function showAddTrailForm() {
    document.getElementById('add-trail').style.display = 'block';
    document.getElementById('update-trail').style.display = 'none';
};

let addTrailForm = document.getElementById('add-trail-form-ajax');

// event listener for add trail form
addTrailForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let inputTrailName = document.getElementById("input-trailName");
    let inputLocation = document.getElementById("input-location");
    let checkboxes = document.querySelectorAll('input[name="supportedActivityTypes"]:checked');
    let inputdifficulty = document.getElementById("input-difficulty");
    let inputdistance = document.getElementById("input-distance");
    let inputelevationGain = document.getElementById("input-elevationGain");
    let inputdescription = document.getElementById("input-description");

    // accounts for yes/no values
    let inputDogFriendlyYes = document.getElementById("dogFriendlyYes");
    let inputWaterfallYes = document.getElementById("waterfallYes");


    let trailNameValue = inputTrailName.value;
    let locationValue = inputLocation.value;
    let supportedActivities = Array.from(checkboxes).map(checkbox => checkbox.value);
    let difficultyValue = inputdifficulty.value;
    let distanceValue = inputdistance.value;
    let elevationGainValue = inputelevationGain.value;
    let descriptionValue = inputdescription.value;

    if (trailNameValue && locationValue) {

        // accounts for yes/no values
        let dogFriendlyValue = 0;
        if (inputDogFriendlyYes.checked) {
            dogFriendlyValue = 1;
        };
        let waterfallValue = 0;
        if (inputWaterfallYes.checked) {
            waterfallValue = 1;
        };

        let data = {
            trailName: trailNameValue,
            location: locationValue,
            supportedActivities: supportedActivities,
            difficulty: difficultyValue,
            distance: distanceValue,
            elevationGain: elevationGainValue,
            description: descriptionValue,
            dogFriendly: dogFriendlyValue,
            waterfall: waterfallValue
        }

        // setup AJAX request to add trail
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/add-trail-ajax", true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let jsonResponse = JSON.parse(xhttp.responseText);
                
                addRowToTable(jsonResponse);

                // clears form
                inputTrailName.value = '';
                inputLocation.value = '';            
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                inputdifficulty.value = '';
                inputdistance.value = '';
                inputelevationGain.value = '';
                inputdescription.value = '';
                
                // accounts for yes/no values
                inputDogFriendlyYes.checked = false;
                document.getElementById("dogFriendlyNo").checked = false;
                inputWaterfallYes.checked = false;
                document.getElementById("waterfallNo").checked = false;


            } else if (xhttp.readyState == 4 && xhttp.status != 200) {
                console.log("There was an error with the input.")
            }
        }
        // send request and wait for response
        xhttp.send(JSON.stringify(data));
        document.getElementById('add-trail').style.display = 'none';
    }
});

// adds new row to table
addRowToTable = (data) => {
    // references current table 
    let trailsTable = document.getElementById("trails-table");

    // create the row with cells
    let row = document.createElement("TR");
    let trailIDCell = document.createElement("TD");
    let trailNameCell = document.createElement("TD");
    let locationCell = document.createElement("TD");
    let supportedActivitiesCell = document.createElement("TD");
    let difficultyCell = document.createElement("TD");
    let distanceCell = document.createElement("TD");

    let elevationGainCell = document.createElement("TD");
    let descriptionCell = document.createElement("TD");

    let dogFriendlyCell = document.createElement("TD");
    let waterfallCell = document.createElement("TD");

    let avgRatingCell = document.createElement("TD");
    let avgDurationCell = document.createElement("TD");


    let editCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // fill row with new data
    trailIDCell.innerText = data.trailID;
    trailNameCell.innerText = data.trailName;
    locationCell.innerText = data.location;
    supportedActivitiesCell.innerHTML = data.supportedActivityTypes;
    difficultyCell.innerText = data.difficulty;
    distanceCell.innerText = data.distance;

    elevationGainCell.innerText = data.elevationGain;
    descriptionCell.innerText = data.description;

    dogFriendlyCell.innerText = data.dogFriendly;
    waterfallCell.innerText = data.waterfall;

    avgRatingCell.innerText = '--';
    avgDurationCell.innerText = '--';

    // add edit link in cell
    let editLink = document.createElement("a"); 
    editLink.href = "javascript:void(0);"; 
    editLink.innerText = "Edit"; 
    editLink.onclick = function() {
        updateTrail(data.trailID); 
    };

    // put delete link into cell
    editCell.appendChild(editLink);

    // delete link in cell
    let deleteLink = document.createElement("a"); 
    deleteLink.href = "javascript:void(0);"; 
    deleteLink.innerText = "Delete"; 
    deleteLink.onclick = function() {
        deleteTrail(data.trailID); 
    };

    // put delete link into cell
    deleteCell.appendChild(deleteLink);

    // add cells to the row 
    row.appendChild(trailIDCell);
    row.appendChild(trailNameCell);
    row.appendChild(locationCell);
    row.appendChild(supportedActivitiesCell);
    row.appendChild(difficultyCell);
    row.appendChild(distanceCell);
    row.appendChild(elevationGainCell);
    row.appendChild(descriptionCell);
    row.appendChild(dogFriendlyCell);
    row.appendChild(waterfallCell);
    row.appendChild(avgRatingCell);
    row.appendChild(avgDurationCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);

    // sets attribute for row
    row.setAttribute('data-value', data.trailID);

    // adds row to table
    trailsTable.appendChild(row);

}
