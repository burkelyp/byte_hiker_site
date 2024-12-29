// Citation for page:
// Date: 05/22/2024
// Adapted from:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%207%20-%20Dynamically%20Deleting%20Data


function deleteCategory(categoryID) {
  if (confirm("Are you sure you want to delete this category?")) {
      let link = '/delete-category-ajax/';
      let data = {
        categoryID: categoryID
      };
      $.ajax({
        url: link,
        type: 'DELETE',
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function(result) {
          deleteRow(categoryID);
        }
      });
      document.getElementById('update-category').style.display = 'none';
    }
  };
  
  function deleteRow(categoryID){
      let table = document.getElementById("category-table");
      for (let i = 1, row; row = table.rows[i]; i++) {
         if (table.rows[i].getAttribute("data-value") == categoryID) {
              table.deleteRow(i);
              break;
         }
      }
  }