
var FSVG = d3.select("#c_vis_1")
var FSG = d3.select("#shot_1")

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
            var path = FSG.append("path")
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
            var path = FSG.append("path")
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
            var path = FSG.append("path")
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
            var path  = FSG.append("path")
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
    
    // Animate the graph for the first time
    //repeat(path2b, FSG);
    //repeat(path3a, FSG);
    shot('b',2,true,FSG)
    shot('a',2,false,FSG)