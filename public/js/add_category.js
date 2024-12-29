// Citation for page:
// Date: 05/18/2024
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/blob/main/Step%205%20-%20Adding%20New%20Data/public/js/add_person.js


// add_category.js


// gets object to modify
let addCategoryForm = document.getElementById('add-category-form-ajax');

function showAddCategoryFrom(){
    document.getElementById('add-category').style.display = 'block';
    document.getElementById('update-category').style.display = 'none';
};

// modifies object
addCategoryForm.addEventListener("submit", function (e) {

    // prevents form from submitting
    e.preventDefault();

    // get inputs
    let inputCategoryID = document.getElementById("input-categoryID");
    let inputDescription = document.getElementById("input-description");
    let inputIcon = document.querySelector('input[name="input-icon"]:checked');

    // gets value from inputs
    let categoryIDValue = inputCategoryID.value;
    let descriptionValue = inputDescription.value;
    let iconValue = inputIcon.value;

    // puts new data into an object
    let data = {
        categoryID: categoryIDValue,
        description: descriptionValue,
        icon: iconValue,
    }

    // setup AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-category-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // tell AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // add new row to table
            addRowToTable(data);

            // clear after insert
            inputCategoryID.value = '';
            inputDescription.value = '';
            inputIcon.value = '';

        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // send request and wait for response
    xhttp.send(JSON.stringify(data));
    document.getElementById('add-category').style.display = 'none';
})


// adds new row to table
addRowToTable = (data) => {

    // references current table 
    let currentTable = document.getElementById("category-table");

    // create the row with cells
    let row = document.createElement("TR");
    let categoryIDCell = document.createElement("TD");
    let descriptionCell = document.createElement("TD");
    let iconCell = document.createElement("TD");
    let editCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");


    // fill in cells with new data
    categoryIDCell.innerText = data.categoryID;
    descriptionCell.innerText = data.description;
    iconCell.innerHTML = data.icon;
    
    // edit link in cell
    let editLink = document.createElement("a");
    editLink.href = "javascript:void(0);";
    editLink.innerText = "Edit"; 
    editLink.onclick = function() {
        updateCategory(data.categoryID); 
    };

    // delete link in cell
    let deleteLink = document.createElement("a"); 
    deleteLink.href = "javascript:void(0);"; 
    deleteLink.innerText = "Delete"; 
    deleteLink.onclick = function() {
        deleteCategory(data.categoryID); 
    };

    // put edit & delete link into cell
    editCell.appendChild(editLink);
    deleteCell.appendChild(deleteLink); 


    // add the cells to the row 
    row.appendChild(categoryIDCell);
    row.appendChild(descriptionCell);
    row.appendChild(iconCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);

    // deleteRow function can find added row
    row.setAttribute('data-value', data.categoryID);

    // add the row to the table
    currentTable.appendChild(row);
}
