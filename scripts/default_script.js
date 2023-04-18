function get_teams(){
    d3.csv("data/NBA_Data_File_Locations.csv").then(function(data) {
        for (let t =0; t < data.length; t++){
            Add_Link(data[t].Current_BBRef_Team_Name, data[t].Team_ID)
        }
    });
}

function Add_Link(team_name, team_id){
    let tp_text = 'team_rating.html?='
    var team_link = document.createElement('a');
    team_link.type = 'a';
    team_link.className = 'dropdown-item';
    team_link.title = team_name
    team_link.href = tp_text.concat(team_id)
    let linkText = document.createTextNode(team_name);
    team_link.appendChild(linkText);

   /* 
    var a = document.createElement('a');
      var linkText = document.createTextNode("my title text");
      a.appendChild(linkText);
      a.title = "my title text";
      a.href = "http://example.com";
      document.body.appendChild(a);
    */
    var container = document.getElementById("team_dropdown_div");
    container.appendChild(team_link);

}

get_teams();