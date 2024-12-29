//  Citation for "update category":
//  Date: 05/29/2024
//  Adapted from:
//  Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%208%20-%20Dynamically%20Updating%20Data


let updateCategoryForm = document.getElementById('update-category-form-ajax');
let selectCategory = document.getElementById("mySelect");
let oldCategoryID = null;

function updateCategory(id) {
    document.getElementById('update-category').style.display = 'block';
    document.getElementById('add-category').style.display = 'none';
    oldCategoryID = id;

    // setup AJAX request
    if (oldCategoryID) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/get-category/${oldCategoryID}`, true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                
                let categoryData = JSON.parse(xhttp.response);

                // populates data for selected
                document.getElementById("input-categoryID-update").value = categoryData.categoryID;
                document.getElementById("input-description-update").value = categoryData.description;
                document.getElementById(categoryData.icon).checked = true;
            }
        }

        xhttp.send();
    }
};


// updates category data
updateCategoryForm.addEventListener("submit", function (e) {
   
    // prevents form from submitting
    e.preventDefault();

    // form fields to get data from
    let inputCategoryID = document.getElementById("input-categoryID-update");
    let inputDescription = document.getElementById("input-description-update");
    let inputIcon = document.querySelector('input[name="input-icon-update"]:checked');

    // get values form fields
    let categoryIDValue = inputCategoryID.value;
    let descriptionValue = inputDescription.value;
    let iconValue = inputIcon.value;

    // new data package
    let data = {
        oldCategoryID: oldCategoryID,
        categoryID: categoryIDValue,
        description: descriptionValue,
        icon: iconValue,
    }

    // setup AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/put-category-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // let jsonResponse = JSON.parse(xhttp.response); 
            let jsonResponse = { categoryID: categoryIDValue, description: descriptionValue, icon: iconValue };

            // add new data to the table
            updateRow(jsonResponse, oldCategoryID);

            // clears update fields after insert
            inputCategoryID.value = "";
            inputDescription.value = '';
            inputIcon.value = '';


        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }
    // send request and wait for response
    xhttp.send(JSON.stringify(data));
    document.getElementById('update-category').style.display = 'none';

})


// updates category data in row
function updateRow(data, oldCategoryID){

    let table = document.getElementById("category-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
       
        // updates table with new data
        if (table.rows[i].getAttribute("data-value") == oldCategoryID) {

            // get the category's row
            let updateRowIndex = table.getElementsByTagName("tr")[i];

            let new_categoryID = updateRowIndex.getElementsByTagName("td")[0];

            // get the description
            let description = updateRowIndex.getElementsByTagName("td")[1];

            // get the icon row
            let icon = updateRowIndex.getElementsByTagName("td")[2];

            new_categoryID.innerHTML = data.categoryID;
            description.innerHTML = data.description;
            icon.innerHTML = data.icon; 
       }
    }
}