function parseCsv_Lineup(d) {
    if (d.Team != 'League Averages'){
    return {
        "Team":d.TEAM_NAME,
        "Lineup":d.GROUP_NAME,
        "Team_ID": d.Team_ID,
        "Wins": d.W,
        "Losses": d.L,
        "Minutes":+d.MIN,
        "OFFRTG": +d.OFF_RATING,
        "DEFRTG": +d.DEF_RATING,
        "NETRTG": +d.NET_RATING,
        "Color_1":d.Color_1,
        "Color_2":d.Color_2,
        'Category':0
    };
};
};

function parseCsv_Team(d) {
    return {
        "Team":d.TEAM_NAME,
        "Team_ID": d.Team_ID,
        "Wins": d.W,
        "Losses": d.L,
        "OFFRTG": +d.OFF_RATING,
        "DEFRTG": +d.DEF_RATING,
        "NETRTG": +d.NET_RATING,
        "Color_1":d.Color_1,
        "Color_2":d.Color_2
    };
};

const width = 600;
const height = 600;



function Fill_Select(team){
    let fill;
    for (c in color_data){
        if (c.Team_1 == team){
        fill = c.Fill_Color
        break;
        }
    }
    return fill;
}


d3.csv("data/filtered_lineup_data.csv", parseCsv_Lineup).then(function(data_1) {
    d3.csv("data/Team_Info.csv", parseCsv_Team).then(function(data_2) {

        function Add_Button(Team, Team_ID){
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = Team;
            checkbox.name = Team;
            checkbox.value = Team_ID;
            checkbox.className = 'team_checkbox';
            
         
            var label = document.createElement('label')
            label.htmlFor = Team;
            label.appendChild(document.createTextNode(Team));
         
            var br = document.createElement('br');
        
            var container = document.getElementById('team_menu');
            container.appendChild(checkbox);
            container.appendChild(label);
            container.appendChild(br);
        }
        
 
        for (let t = 0; t < data_2.length; t++){
            Add_Button(data_2[t].Team, data_2[t].Team_ID)
        }
        

        var league_average = 114.8
        var chart_type = "team";

        const tooltip = d3.select("#description_container")
        .append("div")
        .attr("class", "tooltip");

        function Fill_Select(team){

            let fill = "";
            for (c in data_2){
                if (data_2[c].Team == team){
                fill = data_2[c].Color_1
                break;
                }
            }
            return fill;
        }

        function Stroke_Select(team){
            let stroke = "";
            for (c in data_2){
                if (data_2[c].Team == team){
                stroke = data_2[c].Color_2
                
                break;
                }
            }
            return stroke;
        }

        function Mouse_On(node,dm){
            let x = 0;
            let y = 0;

            if (chart_type == "team"){
            tooltip.style("visibility", "visible")
                .style("top", `${y}px`)
                .style("left", `${x}px`)
                .style("z-index", "100")
                .html(`<b>Team: <br>
                ${dm.Team}</b><br>
                <b>Offensive Rating: </b><br>
                ${dm.OFFRTG}<br>
                <b>Defensive Rating: </b><br>
                ${dm.DEFRTG}<br>
                <b>Net Rating: </b><br>
                ${dm.NETRTG}`);
            }
            else{
                tooltip.style("visibility", "visible")
                .style("top", `${y}px`)
                .style("left", `${x}px`)
                .style("z-index", "100")
                .html(`<b>Team: </b><br>
                ${dm.Team}<br>
                <b>Lineup: </b><br>
                ${dm.Lineup}
                <b>Minutes: </b><br>
                ${dm.Minutes}
                <b>Offensive Rating: </b><br>
                ${dm.OFFRTG}<br>
                <b>Defensive Rating: </b><br>
                ${dm.DEFRTG}<br>
                <b>Net Rating: </b><br>
                ${dm.NETRTG}`);
            }
            
    
            circles.attr("opacity",function(d){
                let opac = .1
                if (d.Team == dm.Team){
                    opac = 1
                }
                return opac
            }).attr("fill",function(d){
                let f = "grey"
                if (d.Team == dm.Team){
                    f = Fill_Select(d.Team);
                }
                return f
            })
            .attr("stroke",function(d){
                let f = "grey"
                if (d.Team == dm.Team){
                    f = Stroke_Select(d.Team);
                }
                return f
            });

        }

        function Mouse_Off(node,dm){
            tooltip.style("visibility", "hidden");
            circles.attr("fill", function(d){
                return Fill_Select(d.Team)
            })
            .attr("stroke", function(d){
                return Stroke_Select(d.Team)
            })
            .attr("opacity",1);
        }


        function Team_Page_Link(team) {
            let url =
            "https://wwelsh24.github.io/artg_nba_final_project/team_rating.html?=".concat(team.Team_ID)
            window.open(url,"_self");
            }
        

        let BSVG = d3.select("#bubble_svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

        let BG = d3.select('#bubbles')


        function drawPlot(data,chart_type){

        let scaler = Math.max(league_average-d3.min(data, function(d) { return d.OFFRTG; }),
        league_average-d3.min(data, function(d) { return d.DEFRTG; }),
        d3.max(data, function(d) { return d.OFFRTG; })-league_average,
        d3.max(data, function(d) { return d.DEFRTG; })-league_average)+2
        
        var axis_scale = d3.scaleLinear()
        .domain([league_average-scaler,league_average+scaler])
        .range([580,20]);

        var radiusScale = d3.scaleSqrt().domain(d3.extent(data_1, function(d) { return d.Minutes; })).range([5, 20]);
        
        circles = BG.selectAll("circle") 
        .data(data)                        
        .join("circle")          
        .attr("class", function(d) {   
            return d.Team   
        })            
        .attr("r", function(d) {
            let rad = 20
            if(data == data_1){
                rad = radiusScale(d.Minutes) 
            }
            if(d.Team == "Average"){
                rad = 0;
            }
        return rad 
        })
        .attr("cy",function(d) {   
            return axis_scale(d.OFFRTG)    
        })
        .attr("cx",function(d) { 
            return axis_scale(d.DEFRTG)    
        })
        .attr("fill", function(d){
            return Fill_Select(d.Team)
        })
        .attr("stroke", function(d){
            return Stroke_Select(d.Team)
        })
        .attr("stroke-width", "2")
        .on("mouseover", function(e,d) {
            Mouse_On(d3.select(this),d);
        })
        .on("mouseout", function(e,d) {
            Mouse_Off(d3.select(this),d);
        })
        .on("dblclick", function (i, d) {
            Team_Page_Link(d);
            })
            .on("click", function (i, d) {
            Mouse_On(d3.select(this),d);
            });



        var xAxis = d3.axisBottom()
            .scale(axis_scale)
            .ticks(10)
            .tickSize(560)
            .tickPadding(10);

        var yAxis = d3.axisRight()
        .scale(axis_scale)
        .ticks(10)
        .tickSize(560)
        .tickPadding(10);

        var ay = BSVG.append("g")
            .attr("class", "axis")
            .call(yAxis);
        
        var ax = BSVG.append("g")
            .attr("class", "axis")
            .call(xAxis);

        BSVG.selectAll(".domain").remove();
        
        function zoomed(e) {
        BG.attr("transform", e.transform);
        BSVG.selectAll(".domain").remove();
        ax.call(xAxis.scale(e.transform.rescaleX(axis_scale)));
        ay.call(yAxis.scale(e.transform.rescaleY(axis_scale)));
        BSVG.selectAll(".domain").remove();
    
            BG.selectAll("circle")
                .attr("r", function(d){
                let rad = 20
                if(chart_type == "lineup"){
                    var radiusScale = d3.scaleSqrt().domain(d3.extent(data_1, function(d) { return d.Minutes; })).range([5, 20]);
                    rad = radiusScale(d.Minutes) 
                }
                if(d.Team == "Average"){
                    rad = 0;
                }
                    return rad/e.transform.k;
                })
                .attr("stroke-width", 2/e.transform.k);

                BG.selectAll("line")
                .attr("stroke-width", 2/e.transform.k)

    };   

    let zoom = d3.zoom()
    .translateExtent([[0, 0], [width, height]])
    .scaleExtent([1, 15])
    .on("zoom", zoomed);
    
    BSVG.call(zoom);
}
        



        function update(){
            let line_cb = document.getElementById('lineup_input');
            if (line_cb.value == "lineup"){
                chart_type = "lineup";
            }
            else{
                chart_type = "team";
            }
            BG.selectAll("*").remove();
            BSVG.selectAll(".axis").remove();
            if (chart_type == "team"){
                drawPlot(data_2, chart_type);
                }
                else{
                    drawPlot(data_1,  chart_type);
                }
        }
        var team_toggle = document.getElementById("lineup_input");
        const selectors = d3.select('#lineup_input');
            selectors.on('change', update);
        update();
    });
});


