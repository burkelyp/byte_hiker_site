// Citation for page:
// Date: 05/18/2024
// Used basic structure of template, changed fields to match specific database needs.
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/blob/main/Step%205%20-%20Adding%20New%20Data/public/js/add_person.js

// Citation for removing dulicates using ...new Set():
// Date: 06/05/2024
// Based on:
// Source URL: https://stackabuse.com/how-to-remove-duplicates-from-an-array-in-javascript/


// function to show add user form
function addUser() {
    document.getElementById('add-user').style.display = 'block';
    document.getElementById('update-user').style.display = 'none';
}


let addUserForm = document.getElementById('add-user-form-ajax');

// event listener for add user form
addUserForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let inputUserName = document.getElementById("input-userName");
    let inputEmail = document.getElementById("input-email");
    let checkboxes = document.querySelectorAll('input[name="userCategoryPreference"]:checked');

    let userNameValue = inputUserName.value;
    let emailValue = inputEmail.value;
    let preferences = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    if (userNameValue) {
        // removes any duplicate items
        let verifiedPreferences = [...new Set(preferences)];

        let data = {
            userName: userNameValue,
            email: emailValue,
            preferences: verifiedPreferences
        }

        // setup AJAX request to add user
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/add-user-ajax", true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let jsonResponse = JSON.parse(xhttp.responseText);
                
                addRowToTable(jsonResponse);

                // clears form
                inputUserName.value = '';
                inputEmail.value = '';

                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });

                // hides form after submission

            } else if (xhttp.readyState == 4 && xhttp.status != 200) {
                console.log("There was an error with the input.")
            }
        }
        // send request and wait for response
        xhttp.send(JSON.stringify(data));
    }
    document.getElementById('add-user').style.display = 'none';

});


// adds new row to table
function addRowToTable(data) {
    // references current table 
    let userTable = document.getElementById("user-table");

    // create the row with cells
    let row = document.createElement("TR");
    let userIDCell = document.createElement("TD");
    let userNameCell = document.createElement("TD");
    let emailCell = document.createElement("TD");
    let trailCell = document.createElement("TD");
    let editCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // fill row with new data
    userIDCell.innerText = data.userID;
    userNameCell.innerText = data.userName;
    emailCell.innerText = data.email;

    // set trail preferences
    trailCell.innerHTML = data.trailPreferences;


    // add edit link in cell
    let editLink = document.createElement("a"); 
    editLink.href = "javascript:void(0);"; 
    editLink.innerText = "Edit"; 
    editLink.onclick = function() {
        updateUser(data.userID); 
    };

    // put delete link into cell
    editCell.appendChild(editLink);


    // add delete link in cell
    let deleteLink = document.createElement("a"); 
    deleteLink.href = "javascript:void(0);"; 
    deleteLink.innerText = "Delete"; 
    deleteLink.onclick = function() {
        deletePerson(data.userID); 
    };

    // put delete link into cell
    deleteCell.appendChild(deleteLink);

    // add cells to the row 
    row.appendChild(userIDCell);
    row.appendChild(userNameCell);
    row.appendChild(emailCell);
    row.appendChild(trailCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);

    // sets attribute for row
    row.setAttribute('data-value', data.userID);

    // adds row to table
    userTable.appendChild(row);

}