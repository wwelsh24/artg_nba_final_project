function parseCsv_Lineup(d) {
    if (d.Team != 'League Averages'){
    return {
        "Team": d.Team,
        "PG": d.PG,
        "SG": d.SG,
        "SF": d.SF,
        "PF": d.PF,
        "C": d.C,
        "Possessions": +d.Poss,
        "OFFRTG": +d['OFFENSE: Pts/Poss'],
        "DEFRTG": +d['DEFENSE: Pts/Poss'],
        "NETRTG": +d.Diff
    };
};
};

function parseCsv_Team(d) {
    return {
        "Team": d.Team,
        "Wins": d.W,
        "Losses": d.L,
        "OFFRTG": +d['OFFENSE: Pts/Poss'],
        "DEFRTG": +d['DEFENSE: Pts/Poss'],
        "NETRTG": +d.Diff
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

d3.json("Color_Key.json").then(function(color_data){
    d3.csv("lineups_four_factors_3_21_2023.csv", parseCsv_Lineup).then(function(data_1) {
        d3.csv("league_four_factors_3_21_2023.csv", parseCsv_Team).then(function(data_2) {

            var league_average = data_2[0].OFFRTG;
            var chart_type = "team";
            var simulate = false;

            const tooltip = d3.select("#description_container")
            .append("div")
            .attr("class", "tooltip");

            function Fill_Select(team){
                let fill = "";
                for (c in color_data){
                    if (color_data[c].Team_1 == team){
                    fill = color_data[c].Fill_Color
                    break;
                    }
                }
                return fill;
            }

            function Stroke_Select(team){
                let stroke = "";
                for (c in color_data){
                    if (color_data[c].Team_1 == team){
                    stroke = color_data[c].Border_Color
                    
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
                    ${dm.PG},<br>
                    ${dm.SG},<br>
                    ${dm.SF},<br>
                    ${dm.PF},<br>
                    ${dm.C}<br>
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
                  "https://www.basketball-reference.com"
                window.open(url,"_self");
              }
            

            let BSVG = d3.select("#bubble_svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

            let BG = d3.select('#bubbles')


            function drawPlot(data, simulate,chart_type){
            /*
            let x_axis_prime = BG.append("line")
            .attr("x1", 20)
            .attr("x2", 580)
            .attr("y1",300)
            .attr("y2",300)
            .attr("stroke-width",2)
            .attr("stroke","black");

            let y_axis_prime = BG.append("line")
            .attr("y1", 20)
            .attr("y2", 580)
            .attr("x1",300)
            .attr("x2",300)
            .attr("stroke-width",2)
            .attr("stroke","black");
            */
            let net_axis_x = BG.append("line")
            .attr("y1", 580)
            .attr("y2", 20)
            .attr("x1",20)
            .attr("x2",580)
            .attr("stroke-width",2)
            .attr("stroke","black");

            let net_axis_y = BG.append("line")
            .attr("y2", 580)
            .attr("y1", 20)
            .attr("x1",20)
            .attr("x2",580)
            .attr("stroke-width",2)
            .attr("stroke","black");


            let scaler = Math.max(league_average-d3.min(data, function(d) { return d.OFFRTG; }),
            league_average-d3.min(data, function(d) { return d.DEFRTG; }),
            d3.max(data, function(d) { return d.OFFRTG; })-league_average,
            d3.max(data, function(d) { return d.DEFRTG; })-league_average)
            
            console.log(scaler)
            
            var axis_scale = d3.scaleLinear()
            .domain([league_average-scaler,league_average+scaler])
            .range([580,20]);

            /*
            var y_axis_scale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.OFFRTG; }))
            .range([580,20]);
            */

            var radiusScale = d3.scaleSqrt().domain(d3.extent(data, function(d) { return d.Possessions; })).range([5, 20]);
            
            circles = BG.selectAll("circle") 
            .data(data)                        
            .join("circle")          
            .attr("class", function(d) {   
                return d.Team   
            })            
            .attr("r", function(d) {
                let rad = 20
                if(data == data_1){
                    rad = radiusScale(d.Possessions) 
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

            
           
            let sim = d3.forceSimulation()
              .force("x", d3.forceX(d => axis_scale(d.DEFRTG))) // Each point attacted to its center x and y
              .force("y", d3.forceY(d => axis_scale(d.OFFRTG)));
            
            
            
            if (simulate == true){  
                if (data == data_1){
                    sim.force("collision", d3.forceCollide(d => radiusScale(d.Possessions)))
                }
                else{
                    sim.force("collision", d3.forceCollide(d => 20))
                }
              sim.nodes(data)
              .alpha(1)
              .on('tick', ticked);
          }
          else{
              sim.force("collision", null);
          }

        /*
        yAxis = (g) => g
            .attr('transform', `translate(590,0)`)
            .call(d3.axisRight(axis_scale)
            .tickFormat('').ticks(5)
            .tickSize(580)
            .tickPadding(10));

        xAxis = (g) => g
            //.attr('transform', `translate(0, 300)`)
            .call(d3.axisBottom(axis_scale))

            var ax = BSVG.append('g').call(xAxis).attr("class",'axis');
          var ay = BSVG.append('g').call(yAxis).attr("class",'axis');
          */

            var xAxis = d3.axisBottom()
                .scale(axis_scale)
                .ticks(10)
                .tickSize(580)
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

          
          function zoomed(e) {
            sim.alpha(.04)
            BG.attr("transform", e.transform);
            ax.call(xAxis.scale(e.transform.rescaleX(axis_scale)));
            ay.call(yAxis.scale(e.transform.rescaleY(axis_scale)));
            // update axes with these new boundaries
            //ax.call(d3.axisBottom(newX))
            //ay.call(d3.axisLeft(newY))
        
             BG.selectAll("circle")
                 .attr("r", function(d){
                    let rad = 20
                    if(chart_type == "lineup"){
                        var radiusScale = d3.scaleSqrt().domain(d3.extent(data_1, function(d) { return d.Possessions; })).range([5, 20]);
                        rad = radiusScale(d.Possessions) 
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

          // Draw the grid lines.
          //svg.append('g').call(xGrid)
          //svg.append('g').call(yGrid)
        

            
                //BG.attr("transform", "rotate(45)")
    }
            


       
            
    
            function ticked() {
                    circles
                        .attr('cx', function(d) {
                            return d.x;
                        })
                        .attr('cy', function(d) {
                            return d.y;
                        });
                }

            function update(){
                sim_cb = d3.select("#sim_input");
                if (sim_cb.property("checked")){
                    simulate = true;
                }
                else{
                    simulate = false;
                }
                line_cb = d3.select("#lineup_input");
                if (line_cb.property("checked")){
                    chart_type = "lineup";
                    console.log(chart_type)
                }
                else{
                    chart_type = "team";
                }

                BG.selectAll("*").remove();
                if (chart_type == "team"){
                    drawPlot(data_2, simulate, chart_type);
                    }
                    else{
                        drawPlot(data_1, simulate, chart_type);
                    }
            }
                d3.selectAll(".checkbox").on("change",update);
                update();
        });
    });
});

