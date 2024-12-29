//  Citation for "update user":
//  Date: 05/22/2024
//  Used AJAX functionality and basic template structure. Added async functionality for access to other tables.
//  Adapted from:
//  Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%208%20-%20Dynamically%20Updating%20Data

//  Citation for Javascript callback functions:
//  Date: 05/29/2024
//  To handle async functionality for getCategories and getUserPreferences functions. 
//  Referenced from:
//  Source URL: https://developer.mozilla.org/en-US/docs/Glossary/Callback_function

//  Citation for Array and Map:
//  Date: 05/29/2024
//  Used to create an array from checkboxes and map over them.
//  Referenced from:
//  Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from

//  Citation for some():
//  Date: 05/29/2024
//  Used to check if a category is true for a user's preference.
//  Referenced from:
//  Source URL: https://www.w3schools.com/jsref/jsref_some.asp


// hide forms to start
document.getElementById('update-user').style.display = 'none';
document.getElementById('add-user').style.display = 'none';

let updateUserForm = document.getElementById('update-user-form-ajax');
let userID = 0;

function updateUser(id) {
    userID = id;
    document.getElementById('update-user').style.display = 'block';
    document.getElementById('add-user').style.display = 'none';

    // setup AJAX request
    if (userID) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/get-user/${userID}`, true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let userData = JSON.parse(xhttp.response);
                
                // populates data for selected user
                document.getElementById("input-userName-update").value = userData.userName;
                document.getElementById("input-email-update").value = userData.email;

                // gets categories and user preferences to setup populated checkboxes, nested async functionality
                getCategories(categories => {
                    getUserPreferences(userID, userPreferences => {
                        setupCheckboxes(categories, userPreferences);
                    });
                });
            }
        };

        // send request
        xhttp.send();
    }
}

// updates user data / handles form submission
updateUserForm.addEventListener("submit", function (e) {
    // prevents form from submitting
    e.preventDefault();

    // form fields to get data from
    let inputUserName = document.getElementById("input-userName-update");
    let inputEmail = document.getElementById("input-email-update");
    let checkboxes = document.querySelectorAll('input[name="userCategoryPreference"]:checked');

    // get values from form fields
    let userNameValue = inputUserName.value;
    let emailValue = inputEmail.value;
    let preferences = Array.from(checkboxes).map(checkbox => checkbox.value);

    // new data package
    let data = {
        userID: userID,
        userName: userNameValue,
        email: emailValue,
        preferences: preferences
    }
        
    // setup AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/put-user-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // add new data to the table
            updateRow(data, userID);

            // clears update fields after insert
            inputUserName.value = '';
            inputEmail.value = '';

            // reloads page
            location.reload(); 

        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.");
        }
    }
    // send request
    xhttp.send(JSON.stringify(data));
});

// updates user data in row
function updateRow(data, userID){
    let table = document.getElementById("user-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
        // updates table with new data
        if (table.rows[i].getAttribute("data-value") == userID) {
            let updateRowIndex = table.getElementsByTagName("tr")[i];
            let userName = updateRowIndex.getElementsByTagName("td")[1];
            let email = updateRowIndex.getElementsByTagName("td")[2];

            userName.innerHTML = data.userName;
            email.innerHTML = data.email;
        }
    }
}

//  sends AJAX request to fetch categories
function getCategories(categories) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/get-categories", true);

    // handles response
    xhttp.onreadystatechange = () => {
        // check if request is complete
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // parse response and pass it to callback function
            categories(JSON.parse(xhttp.responseText));
        }
    };

    // send request
    xhttp.send();
}

// get user preferences
function getUserPreferences(userID, userPreferences) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/get-user-preferences/${userID}`, true);

    // handles response
    xhttp.onreadystatechange = () => {
        // check if request is complete
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // parse response and pass it to callback function
            userPreferences(JSON.parse(xhttp.responseText));
        }
    };

    // send request
    xhttp.send();
}

// sets up checkboxes
function setupCheckboxes(categories, userPreferences = []) {
    
    let container = document.getElementById('checkboxes-container');
    
    // clears content
    container.innerHTML = '';

    // loops through each category
    categories.forEach(category => {

        // checks if it's a user's preference
        let isChecked = userPreferences.some(preference => preference.categoryID === category.categoryID);
        let checkbox = document.createElement('input');

        // sets attributes
        checkbox.type = 'checkbox';
        checkbox.name = 'userCategoryPreference';
        checkbox.value = category.categoryID;
        checkbox.checked = isChecked;

        let label = document.createElement('label');
        label.innerText = category.description;

        // adds label and checkbox to container
        container.appendChild(checkbox);
        container.appendChild(label);

        // breaks to next line
        container.appendChild(document.createElement('br'));
    });
}