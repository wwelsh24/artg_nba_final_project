
var FSVG = d3.select("#c_vis_1")
var FSG = d3.select("#shot_1")

var SSVG = d3.select("#c_vis_2")
var SSG = d3.select("#shot_2")

var margin = {
    left: 10,
    right: 10
  }
var width = document.getElementById('c_vis_1').clientWidth;
var height = document.getElementById('c_vis_1').clientHeight;

const x = d3.scaleLinear().domain([0,10]).range([0,200]);
const y = d3.scaleLinear().domain([0,10]).range([0,125]);

var data3= [7,3,5];
var data3b = [7,2,5];
var data2a = [7,2,5];
var data2b = [7,2,5];

const three_pointer_a = d3.line()
          .x(function(d, i) { 
            return x(3.5)-1.5*x(i); })
          .y(function(d) { return y(d) })
          .curve(d3.curveNatural);
                  
const three_pointer_b = d3.line()
          .x(function(d, i) { 
            return x(6.5)+1.5*x(i); })
          .y(function(d) { return y(d) })
          .curve(d3.curveNatural);

const two_pointer_a = d3.line()
          .x(function(d, i) { 
            return x(2.5)-1*x(i); })
          .y(function(d) { return y(d) })
          .curve(d3.curveNatural);
                  
const two_pointer_b = d3.line()
          .x(function(d, i) { 
            return x(7.5)+1*x(i); })
          .y(function(d) { return y(d) })
          .curve(d3.curveNatural);

          /*
function dribble(rate, g_id,reverse = false)
{ 
    let adjustment = 0;
    if (reverse==true){
        adjustment=100
        }
    let dribble_line = FSG.append('line')
        .attr('x1',150-x(adjustment))
        .attr('x2',-50+x(adjustment))
        .attr('y1',y(5))
        .attr('y2',y(5))
        .attr("stroke-width", 2)
        .attr("stroke", "cyan")
}
*/

function shot(team, shot, success, g_id, rate = 1) {

        function clear_g(){
            g_id.selectAll("*").remove()
        }

        let color = "green";

        if(team=='a'&& shot == 3){
            var path = g_id.append("path")
                .attr("d", three_pointer_a(data3))
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", function(d){
                    if(success==false){
                        color = 'red'
                    }
                    return color}
                    );
        }

        if(team=='b'&& shot == 3){
            var path = g_id.append("path")
                .attr("d", three_pointer_b(data3))
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", function(d){
                    if(success==false){
                        color = 'red'
                    }
                    return color}
                    );
        }

        if(team=='a'&& shot == 2){  
            var path = g_id.append("path")
                .attr("d", two_pointer_a(data3))
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", function(d){
                    if(success==false){
                        color = 'red'
                    }
                    return color}
                    );
        }

        if(team=='b'&& shot==2){
            var path  = g_id.append("path")
                .attr("d", two_pointer_b(data3))
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", function(d){
                    if(success==false){
                        color = 'red'
                    }
                    return color}
                    );
        }

        let length = path.node().getTotalLength();
        path.attr("stroke-dasharray", length + " " + length)
            .attr("stroke-dashoffset", length)
            .transition()
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .duration(2000/rate)
            .on("end", () => setTimeout(clear_g, 1000/rate));
        
        // this will repeat the animation after waiting 1 second
        };

const timer = ms => new Promise(res => setTimeout(res, ms))

async function first_demonstration(){

    const pc = document.getElementById("fpc")
    const pb = document.getElementById("first_play_button");
    pb.classList.add("disabled");

    var game_stats = 
    {Possession:0,
    a_pos: 0,
    b_pos: 0,
    a_points: 0,
    b_points: 0,
    a_off_rat: 0,
    b_off_rat:0,
    a_def_rat: 0,
    b_def_rat:0,
    a_net_rat: 0,
    b_net_rat:0}

    
    var shot_1 = {
        team:'a',
        points:3,
        success:true,
    }
    var shot_2 = {
        team:'b',
        points:2,
        success:true,
    }


    var shot_results = [shot_1,shot_2]
    //var shot_results = shot_generator(200)
    console.log(shot_results)
    let rate_1 = 1.5;
    for (s in shot_results){
        pc.innerText = parseInt(s)+1
        shot(shot_results[s].team,shot_results[s].points,shot_results[s].success,FSG, rate = rate_1);
        game_stats = update_data(game_stats,shot_results[s])
        update_scoreboard_1(game_stats)
        await timer(3400/rate);
    }
    pb.classList.remove("disabled");
}

function update_data(gs,sr){
    gs.Possession+=1
    if(sr.team=='a'){
        gs.a_pos+=1
        if(sr.success==true){
            gs.a_points+=sr.points
        }
    }
    else{
        gs.b_pos+=1
        if(sr.success==true){
            gs.b_points+=sr.points
        }
    }
    gs.a_off_rat = (gs.a_points/gs.a_pos*100).toFixed(2)
    gs.b_off_rat = (gs.b_points/gs.b_pos*100).toFixed(2)
    gs.a_def_rat = (gs.b_points/gs.b_pos*100).toFixed(2)
    gs.b_def_rat = (gs.a_points/gs.a_pos*100).toFixed(2)
    gs.a_net_rat = (gs.a_off_rat-gs.a_def_rat).toFixed(2)
    gs.b_net_rat = (gs.b_off_rat-gs.b_def_rat).toFixed(2)
    return gs
}
function update_scoreboard_1(gs){
    let pointsa = document.getElementById('points_a1')
    pointsa.innerText = gs.a_points
    let pointsb = document.getElementById('points_b1')
    pointsb.innerText = gs.b_points
    
    let opa = document.getElementById('off_poss_a1')
    opa.innerText = gs.a_pos
    let opb = document.getElementById('off_poss_b1')
    opb.innerText = gs.b_pos
    
    let dpa = document.getElementById('def_poss_a1')
    dpa.innerText = gs.b_pos
    let dpb = document.getElementById('def_poss_b1')
    dpb.innerText = gs.a_pos

    let ora = document.getElementById('off_rating_a1')
    ora.innerText = gs.a_off_rat
    let orb = document.getElementById('off_rating_b1')
    orb.innerText = gs.b_off_rat
    
    let dra = document.getElementById('def_rating_a1')
    dra.innerText = gs.a_def_rat
    let drb = document.getElementById('def_rating_b1')
    drb.innerText = gs.b_def_rat
    
    let nra = document.getElementById('net_rating_a1')
    nra.innerText = gs.a_net_rat
    let nrb = document.getElementById('net_rating_b1')
    nrb.innerText = gs.b_net_rat
}

function update_scoreboard_2(gs){
    let pointsa = document.getElementById('points_a2')
    pointsa.innerText = gs.a_points
    let pointsb = document.getElementById('points_b2')
    pointsb.innerText = gs.b_points
    
    let opa = document.getElementById('off_poss_a2')
    opa.innerText = gs.a_pos
    let opb = document.getElementById('off_poss_b2')
    opb.innerText = gs.b_pos
    
    let dpa = document.getElementById('def_poss_a2')
    dpa.innerText = gs.b_pos
    let dpb = document.getElementById('def_poss_b2')
    dpb.innerText = gs.a_pos

    let ora = document.getElementById('off_rating_a2')
    ora.innerText = gs.a_off_rat
    let orb = document.getElementById('off_rating_b2')
    orb.innerText = gs.b_off_rat
    
    let dra = document.getElementById('def_rating_a2')
    dra.innerText = gs.a_def_rat
    let drb = document.getElementById('def_rating_b2')
    drb.innerText = gs.b_def_rat
    
    let nra = document.getElementById('net_rating_a2')
    nra.innerText = gs.a_net_rat
    let nrb = document.getElementById('net_rating_b2')
    nrb.innerText = gs.b_net_rat
}

function shot_generator(shot_count){
    var overall_results = [];
    for(let i = 0; i < shot_count; i++){
        let result=[];
        result.team = 'a'
        if(i%2!=0){
            result.team = 'b'
        }
        result.points=2
        result.success=false
        let shot_type_indicator = Math.random()
        let shot_result_indicator = Math.random()
        if(shot_type_indicator>0.645){
            result.points=3
            if(shot_result_indicator<=0.365){
                result.success=true
            }
        }
        else{
            if(shot_result_indicator<=0.548){
                result.success=true
            }
        }
        overall_results.push(result)
        }
    return overall_results
}

async function simulation(){
    const pc = document.getElementById("spc")
    const pb = document.getElementById("sim_play_button");
    pb.classList.add("disabled");

    const to_sim_count = parseInt(document.getElementById("sim_pos_slider").value)
    const usable_rate = parseInt(document.getElementById("sim_spd_slider").value)

    var game_stats = 
    {Possession:0,
    a_pos: 0,
    b_pos: 0,
    a_points: 0,
    b_points: 0,
    a_off_rat: 0,
    b_off_rat:0,
    a_def_rat: 0,
    b_def_rat:0,
    a_net_rat: 0,
    b_net_rat:0}


    var shot_results = shot_generator(to_sim_count)
    for (s in shot_results){
        pc.innerText = parseInt(s)+1
        shot(shot_results[s].team,shot_results[s].points,shot_results[s].success,SSG, rate = usable_rate);
        game_stats = update_data(game_stats,shot_results[s])
        update_scoreboard_2(game_stats)
        await timer(3400/rate);
    }
    pb.classList.remove("disabled");
    /*
    update_data(game_stats,shot_results)
    shot(shot_results[1].team,shot_results[1].points,shot_results[1].success,FSG)
    console.log(game_stats)
    */
}

function update_sim_sliders(){
    document.getElementById("pos_speed_val").innerText = parseInt(document.getElementById("sim_spd_slider").value)
    document.getElementById("pos_range_val").innerText = parseInt(document.getElementById("sim_pos_slider").value)

}

update_sim_sliders();