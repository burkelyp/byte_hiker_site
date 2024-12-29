// Citation for page:
// Date: 05/22/2024
// Used basic structure of template file, updated to fit specific database needs.
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%207%20-%20Dynamically%20Deleting%20Data


function deletePerson(userID) {
  if (confirm("Are you sure you want to delete this user?")) {
    let link = '/delete-user-ajax/';
    let data = {
      userID: userID
    };
  
    $.ajax({
      url: link,
      type: 'DELETE',
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        deleteRow(userID);
      }
    });
  }
};
  
function deleteRow(userID){
  let table = document.getElementById("user-table");
  for (let i = 0, row; row = table.rows[i]; i++) {
    if (table.rows[i].getAttribute("data-value") == userID) {
      table.deleteRow(i);
      break;
    }
  }
  document.getElementById('update-user').style.display = 'none';
};
