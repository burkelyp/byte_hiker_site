// Citation for page:
// Date: 05/30/2024
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%207%20-%20Dynamically%20Deleting%20Data


function deleteActivity(activityID) {
  if (confirm("Are you sure you want to delete this activity?")) {
    let link = '/delete-activity-ajax/';
    let data = {
      activityID: activityID
    };
  
    $.ajax({
      url: link,
      type: 'DELETE',
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        deleteRow(activityID);
      }
    });
  }
};
  
function deleteRow(activityID){
  let table = document.getElementById("activity-table");
  for (let i = 0, row; row = table.rows[i]; i++) {
    if (table.rows[i].getAttribute("data-value") == activityID) {
      table.deleteRow(i);
      break;
    }
  }
  document.getElementById('update-activity').style.display = 'none';
};
