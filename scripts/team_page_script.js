let url = window.location.href
let url_split = url.split('?=')

const width = 700;
const height = 330;

$.ajaxSetup({
    async: false,
  });
  
function parseCsv5(d) {
    if (d.Player_Count==5){
        return {
            "MINUTES": +d.MIN,
            "LINEUP": d.GROUP_NAME,
            "LINEUP_ID": d.GROUP_ID,
            "NETRTG": +d.NET_RATING,
            "category": 1
        };}
};

function parseCsv(d) {
    return {
        "PLAYER_COUNT": +d['Player_Count'],
        "MINUTES": +d.MIN,
        "LINEUP": d.GROUP_NAME,
        "LINEUP_ID":d.GROUP_ID,
        "GP": +d.GP,
        "OFFRTG": +d.OFF_RATING,
        "DEFRTG": +d.DEF_RATING,
        "NETRTG": +d.NET_RATING
    };
};

function parse_players(d){
    return{
        'PLAYER_NAME': d.GROUP_NAME,
        'PLAYER_ID':d.VS_PLAYER_ID
    }
}

async function load_players(){
    var full_data = 
    d3.json('data/Player_List_2022-23.json',parse_players).then(function(player_data) {
        full_data = player_data
        return full_data
    })
    return full_data
    
}

  //Loads the transaction dataset from GitHub
  function getPlayers() {
    var players_complete;
    $.getJSON(
        'data/Player_List_2022-23.json',
      function (data) {
        players_complete = data;
      }
    );
    return players_complete;
  }

var p_complete = getPlayers();

function getTeams() {
    var players_complete;
    $.getJSON(
        'data/Team_Info.json',
      function (data) {
        teams_complete = data;
      }
    );
    return teams_complete;
  }

var t_complete = getTeams();

function get_current_team(t_complete, sel_team){
    var current_team;
    for (t in t_complete){
        if(t_complete[t].Team_ID == sel_team){
            current_team = t_complete[t].TEAM_NAME;
        }
    }
    return current_team;
}

function get_team_data(t_complete, sel_team){

    for (t in t_complete){
        if(t_complete[t].Team_ID == sel_team){
            console.log(t_complete[t])
            var team_info = {'OFFRTG': t_complete[t].OFF_RATING,
            'DEFRTG': t_complete[t].DEF_RATING,
            'NETRTG': t_complete[t].NET_RATING};
            //team_info.push(t_complete[t].OFF_RATING);
            //team_info.push(t_complete[t].DEF_RATING);
            //team_info.push(t_complete[t].NET_RATING);
        }
    }
    console.log(team_info)
    return team_info;
}


let Caption = d3.select("#description_container");

function Player_String(complete_player_list,player_list){
    let ln_list = [];
    for (p in complete_player_list){
        if (player_list.includes(complete_player_list[p].VS_PLAYER_ID.toString())){
            ln_list.push(complete_player_list[p].GROUP_NAME)
        }
    }
    const ln_reformatted = new Intl.ListFormat().format(ln_list)
    return ln_reformatted;  
};


function Add_Button(Player, Position, Player_ID){
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = Player;
    checkbox.name = Player;
    checkbox.value = Player_ID;
    checkbox.className = 'player_checkbox';
 
    var label = document.createElement('label')
    label.htmlFor = Player;
    label.appendChild(document.createTextNode(Player.concat(" - ",Position)));
 
    var br = document.createElement('br');

    var container = document.getElementById('button_container');
    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(br);
}

function parse_roster(d){
        return{
            'PLAYER_NAME': d.GROUP_NAME,
            'TEAM': d.TEAM_NAME,
            'POSITION': d.POSITION,
            'PLAYER_ID':d.GROUP_ID
        };
}

function get_roster(file_loc){
    d3.csv(file_loc, parse_roster).then(function(player_data) {
        for (let p =0; p < player_data.length; p++){
            Add_Button(player_data[p].PLAYER_NAME, player_data[p].POSITION,player_data[p].PLAYER_ID)
        }
    });
}

function add_title(sel_team){
    d3.csv("data/NBA_Data_File_Locations.csv").then(function(data) {
        for (t in data){
        if(data[t].Team_ID == sel_team){
        let page_title = document.getElementById('page_title')
        page_title.innerText = data[t].Current_BBRef_Team_Name.concat(" Lineups in 2022-23");
}}});
}

function set_page(sel_team){
    d3.csv("data/NBA_Data_File_Locations.csv").then(function(data) {
            for (t in data){
            if(data[t].ESPN_Current_Link_ID == sel_team){
            let page_title = document.getElementById('page_title')
            page_title.innerText = data[t].Current_BBRef_Team_Name.concat(" Lineups in 2022-23");
            get_roster(data[t].Roster_Location)
            set_graphic(data[t].Data_Location)
        }}});
    }


set_page(url_split[1])
console.log(get_current_team(t_complete, url_split[1]))

function set_graphic(file_location){
    d3.csv(file_location, parseCsv5).then(function(data) {
        let clicked = false;
        let Players = [];

        const tooltip = d3.select("#chart")
            .append("div")
            .attr("class", "tooltip");
        
        var radiusScale = d3.scaleSqrt().domain([0,500]).range([2, 40]);
        var Bubble_Fill_Scale = d3.scaleLinear()
            .domain([-300,-20,0,20,300])
            .range(["#FF0000","#FF3F3F","#FFFFFF","#19BAE2","#009AC0"])
        var Color_Axis_Scale = d3.scaleLinear()
            .domain([0,280,300,320,600])
            .range(["#009AC0","#19BAE2","#FFFFFF","#FF3F3F","#FF0000"])
        var Rating_Scale = d3.scaleLinear()
            .domain([70,150])
            .range([30,770])

        var NSVG = d3.select("#netr_axis")

        const CA_Tick = [300,20,0,-20,-300]
        const CA_Tick_Y = [50,120,190,260,330]
        const CA_Tick_Text = ['+300','+20','0','-20','-300']
        for (n in CA_Tick_Text){
            NSVG.append("circle")
            .attr("cx", 60)
            .attr("cy",CA_Tick_Y[n])
            .attr("r",20)
            .attr("fill", Bubble_Fill_Scale(CA_Tick[n]));

            NSVG.append("text")
            .attr("text-anchor","middle")
            .attr("x",60)
            .attr("y",CA_Tick_Y[n]+35)
            .text(CA_Tick_Text[n])
            .attr('class','axis_label')
        }

        NSVG.append("text")
            .attr("text-anchor","middle")
            .attr("x",60)
            .attr("y",15)
            .text("Net Rating");
        
        let TBG = d3.select("#team_bubbles")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        var width = document.getElementById('team_bubbles').innerWidth
        var xCenter = [200, 450, 700];

        var circles = TBG.selectAll("circle") 
        .data(data)                        
        .join("circle")          
        .attr("class", "lineup")            
        .attr("r", function(d) {   
            return radiusScale(d.MINUTES)    
        })
        .on("click", function (e, d) {
            if (d.category<2||clicked == false){
            d3.selectAll('.player_checkbox').property('checked', false);
            for (i in data) {
                data[i].category = 0;
            }
            clicked = true;
            d.category = 2;
            simulation
                .alpha(0.6)
                .restart()
            simulation
                .force("x")
                .initialize(data);
            circles.attr("fill",'#DADADA')
                .attr("opacity",.5)
            d3.select(this).attr("opacity", 1)
            .attr("fill",Bubble_Fill_Scale(d.NETRTG))
            .raise();
            const reg = /[A-Z]{1}\./g
            const reg2 = /\s/g
            Player_Str = String(d.LINEUP_ID).replaceAll(reg, "").replaceAll(reg2,"")
            Players = Player_Str.split("-")
            console.log(Players.slice(1, 6))
            update_caption(Players.slice(1, 6), file_location);}
        // document.querySelectorAll('input[name="chkboxes[]"]:checked').length>0
            else{
                update();
            }
            })
            .on("mouseover", function(e,d) {

                d3.select(this).attr("fill",Bubble_Fill_Scale(d.NETRTG))
                let x = 300;
                let y = d3.select(this).attr("cy")+200;

                tooltip.style("visibility", "visible")
                    .style("top", `${y}px`)
                    .style("left", `${x}px`)
                    .style("z-index", "100")
                    
                    .html(`<b>Lineup: </b><br>
                    ${d.LINEUP}<br>
                    <b>Net Rating: </b><br>
                    ${d.NETRTG}`);
        

                d3.select(this).attr("opacity", 1).raise();
        
            }).on("mouseout", function() {
                d3.select(this).attr("fill",function(d){
                col = '#DADADA'
                if (d.category > 0){
                    col = Bubble_Fill_Scale(d.NETRTG)
                }
                return col})
                tooltip.style("visibility", "hidden");
                d3.select(this).attr("opacity", function(d){
                    let op = .5
                    if(d.category>0){
                        op = 1
                    }
                    return op;
                }).raise();
            });
        
        
        //nodes = data.map(d => Object.create(d));

        var simulation = d3.forceSimulation()
        //.force('strength', 30)
        .force('x', d3.forceX().x(function(d) {
            return xCenter[d.category];
        }))
        .force("y", d3.forceY(165))   
        .force('collision', d3.forceCollide().radius(function(d) {
            return radiusScale(d.MINUTES)+.2;
        }));
        
        
        simulation.nodes(data)  //create a simulation based on data, every node is a circle
            .on('tick', ticked);
        
        function ticked() {
                circles
                    .attr('cx', function(d) {
                        return d.x;
                    })
                    .attr('cy', function(d) {
                        return d.y;
                    });
            }

        function player_filter(player_list, lineup){
            let include = true;
            for (p in player_list){
                if(String(lineup).includes(player_list[p])){
                    continue;
                }
                else{
                    include = false;
                    break;
                }
            }
            return include;
        }

        function update(file_loca){
                clicked = false;
                Players = []
                d3.selectAll(".player_checkbox").each(function(d){
                cb = d3.select(this);
                player = cb.property("value")
                if(cb.property("checked")){
                    Players.push(player)}});

                if(Players.length>0){
                for (i in data) {
                    if(player_filter(Players,String(data[i].LINEUP_ID))){
                        data[i].category = 2;
                    }
                    else{
                    data[i].category = 0;
                }}}
                else{
                    for (i in data) {
                            data[i].category = 1;
                        }
                }

                if (Players.length==5){
                    d3.selectAll("input[type='checkbox']:not(:checked)")
                        .property("disabled",true);
                }
                else{
                    d3.selectAll(".player_checkbox").property("disabled",false);
                }
                simulation
                    .alpha(0.6)
                    .restart()
                simulation
                    .force("x")
                    .initialize(data);   
                circles.attr("fill", function(d) {
                    if (d.category >0 ) {return Bubble_Fill_Scale(d.NETRTG)}
                    if (d3.sum(data, d => d.category) == 0 && Players.length==0) {return Bubble_Fill_Scale(d.NETRTG)}
                    if (d3.sum(data, d => d.category) == 0 && Players.length>0) {return "#DADADA"}
                    else 	{ return "#DADADA" }
                ;})
                .attr("opacity", function(d) {
                    if (d.category > 0) {return 1}
                    if (d3.sum(data, d => d.category) == 0 && Players.length==0) {return 1}
                    if (d3.sum(data, d => d.category) == 0 && Players.length>0) {return .5}
                    else 	{ return .5 }
                ;})

                console.log('players',Players)
                update_caption(Players, file_location);

            }

            function update_caption(player_list, file_loc){
                d3.csv(file_loc, parseCsv).then(function(data_2) {
                let chosen_lineup = get_team_data(t_complete, url_split[1]);
                console.log(t_complete[''])
                let relevant_lineups = data_2.filter(function(d){ return d.PLAYER_COUNT == player_list.length });
                console.log(relevant_lineups)
                for (r in relevant_lineups){
                    if(player_filter(Players,String(relevant_lineups[r].LINEUP_ID))){
                        chosen_lineup = relevant_lineups[r];
                    }}
                console.log(chosen_lineup)

                if(player_list.length==0 && clicked == false){
                    Caption.html(`The <b>${get_current_team(t_complete, url_split[1])}</b> have played <u>82</u> games.<br><br>
                    The team has an <span class = "ort_text">offensive rating</span> of <u>${chosen_lineup[0]}</u> and a <span class = "drt_text">defensive rating</span> of <u>${chosen_lineup[1]}</u> 
                    for a net rating of <u>${chosen_lineup[2]}</u>.<br>`);
                }
                if(player_list.length>0 && d3.sum(data, d => d.category) == 0){
                    Caption.html(`There are no lineups including <b>${Player_String(p_complete, player_list)}</b>.`);
                    for (const key in chosen_lineup) {
                        delete chosen_lineup[key];
                    }
                }
                if(clicked == true){
                    Caption.html(`<b>${Player_String(p_complete,player_list)}</b> have played together
                    <u>${chosen_lineup.GP}</u> out of ${82} possible games and 
                    <u>${chosen_lineup.MINUTES}</u> out of ${82*48} possible minutes.<br><br>
                    The lineup of <b>${Player_String(p_complete,player_list)}</b> has an <span class = "ort_text">offensive rating</span> of <u>${chosen_lineup.OFFRTG}</u> 
                    and a <span class = "drt_text">defensive rating</span> of <u>${chosen_lineup.DEFRTG}</u> for a net rating of <u>${chosen_lineup.NETRTG}</u>.
                    `);
                }

                if(player_list.length==1 && d3.sum(data, d => d.category) > 0){
                    Caption.html(`<b>${Player_String(p_complete,player_list)}</b> has played 
                    <u>${chosen_lineup.GP}</u> out of ${82} possible games and 
                    <u>${chosen_lineup.MINUTES}</u> out of ${82*48} possible minutes.<br><br>
                    Lineups featuring <b>${Player_String(p_complete,player_list)}</b> have an <span class = "ort_text">offensive rating</span> of <u>${chosen_lineup.OFFRTG}</u> 
                    and a <span class = "drt_text">defensive rating</span> of <u>${chosen_lineup.DEFRTG}</u> for a net rating of <u>${chosen_lineup.NETRTG}</u>.
                    `);
                }

                if(player_list.length>1 && d3.sum(data, d => d.category) > 0){
                    Caption.html(`<b>${Player_String(p_complete,player_list)}</b> have played together
                    <u>${chosen_lineup.GP}</u> out of ${82} possible games and 
                    <u>${chosen_lineup.MINUTES}</u> out of ${82*48} possible minutes.<br><br>
                    Lineups featuring <b>${Player_String(p_complete,player_list)}</b> have an <span class = "ort_text">offensive rating</span> of <u>${chosen_lineup.OFFRTG}</u> 
                    and a <span class = "drt_text">defensive rating</span> of <u>${chosen_lineup.DEFRTG}</u> for a net rating of <u>${chosen_lineup.NETRTG}</u>.
                    `);
                }

                if(player_list.length==5 && d3.sum(data, d => d.category) > 0){
                    Caption.html(`<b>${Player_String(p_complete,player_list)}</b> have played together
                    <u>${chosen_lineup.GP}</u> out of ${82} possible games and 
                    <u>${chosen_lineup.MINUTES}</u> out of ${82*48} possible minutes.<br><br>
                    The lineup of <b>${Player_String(p_complete,player_list)}</b> has an <span class = "ort_text">offensive rating</span> of <u>${chosen_lineup.OFFRTG}</u> 
                    and a <span class = "drt_text">defensive rating</span> of <u>${chosen_lineup.DEFRTG}</u> for a net rating of <u>${chosen_lineup.NETRTG}</u>.
                    `);
                }

                let rtg = d3.select("#rating_chart");
                rtg.selectAll("*").remove();

                if(Object.keys(chosen_lineup).length>0){
                
                let Net_Line = rtg.append("line")
                    .attr("x1", Rating_Scale(chosen_lineup.OFFRTG))
                    .attr("y1",50)
                    .attr("x2", Rating_Scale(chosen_lineup.OFFRTG))
                    .attr("y2",50)
                    .transition()
                    .duration(500)
                    .ease(d3.easeLinear)
                    .attr("x2", Rating_Scale(chosen_lineup.DEFRTG))
                    .attr("y2",50)
                    .attr("stroke", Bubble_Fill_Scale(chosen_lineup.NETRTG))
                    .attr("stroke-width",10);

                let ORT_Circle = rtg.append("circle")          
                    .attr("class", "rating_point")         
                    .attr("cx", Rating_Scale(chosen_lineup.OFFRTG))
                    .attr("cy",50)
                    .transition()
                    .duration(500)
                    .ease(d3.easeCircleIn)   
                    .attr("r",10)
                    .attr("stroke","black")
                    .attr("fill", "#00C0BA");

                let DRT_Circle = rtg.append("circle")          
                    .attr("class", "rating_point")            
                    .attr("cx", Rating_Scale(chosen_lineup.DEFRTG))
                    .attr("cy",50)
                    .transition()
                    .duration(500)
                    .ease(d3.easeCircleIn)
                    .attr("r",10)
                    .attr("stroke","black")
                    .attr("fill", "#3A0231");
                }
                var x_axis = d3.axisBottom()
                    .scale(Rating_Scale);
                    
                var RSVG = d3.select("#rating_svg");

                    RSVG.append("g")
                        .call(x_axis)
                        .attr("transform", "translate(0, 70)");
                    
                    RSVG.append("text")
                        .attr("text-anchor", "end")
                        .attr("y", 100)
                        .attr("x",500)
                        .text("Team Rating");
                })}


        d3.selectAll(".player_checkbox").on("change",update);
        update(file_location);
        });
}