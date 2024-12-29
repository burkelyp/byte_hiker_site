// Citation for page:
// Date: 05/30/2024
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%207%20-%20Dynamically%20Deleting%20Data


function deleteTrail(trailID) {
  if (confirm("Are you sure you want to delete this trail?")) {
    let link = '/delete-trail-ajax/';
    let data = {
        trailID: trailID
    };
  
    $.ajax({
      url: link,
      type: 'DELETE',
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        deleteRow(trailID);
      }
    });
  }
};
  
function deleteRow(trailID){
  let table = document.getElementById("trails-table");
  for (let i = 0, row; row = table.rows[i]; i++) {
    if (table.rows[i].getAttribute("data-value") == trailID) {
      table.deleteRow(i);
      break;
    }
  }
  document.getElementById('update-trail').style.display = 'none';
};
