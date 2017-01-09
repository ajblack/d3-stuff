var nodeData = [{x: 30, y: 50, key: 0, size: 1},
              {x: 150, y: 180, key: 1, size: 3},
              {x: 165, y: 132, key: 2, size: 15},
              {x: 121, y: 180, key: 3, size: 12},
              {x: 133, y: 512, key: 4, size: 4},
              {x: 190, y: 520, key: 5, size: 8}]

var width, height, vis, selector, index, marginVert, marginHor;
marginVert = 50; marginHor = 50;
index = 6
var verticalScale = d3.scaleLinear();
var horizontalScale = d3.scaleLinear();
verticalScale.domain([0,d3.max(nodeData, function(d){
  return d.y;
})]);
verticalScale.range([0,300]);


horizontalScale.domain([0,d3.max(nodeData, function(d){
  return d.x;
})]);
horizontalScale.range([0,500]);


var writeChart = function(){
  vis.selectAll('circle .node').data(nodeData).enter()
    .append('svg:circle')
    .attr('class', 'node')
    .attr('cx', function(d){return horizontalScale(d.x)})
    .attr('cy', function(d){return verticalScale(d.y)})
    .attr('r', function(d){return d.size+'px'})
    .attr('fill', 'rgb(138, 134, 216)')
    .attr('data-key', function(d){return d.key})
    .attr('transform', 'translate('+marginHor+','+marginVert+')')
    .on('mouseover', function(d){
      console.log('mousing over element '+d.key);
    })

    //austin\
    /*
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;*/
    var yAxis = d3.axisLeft(verticalScale);
    var xAxis = d3.axisTop(horizontalScale);
    d3.select('svg').append('g')
    .attr('transform', 'translate('+marginHor+','+marginVert+')')
    .classed('x axis', true)
    .call(xAxis);

    d3.select('svg').append('g')
    .attr('transform', 'translate('+marginHor+','+marginVert+')')
    .classed('y axis', true)
    .call(yAxis);

}

var initChart = function(){
  height = window.innerHeight;
  width = window.innerWidth;
  vis = d3.select('#graph').append('svg');
  vis.attr('width', width).attr('height',height);
  vis.text('The Graph').select('#graph');
  writeChart();
}

var addNewNode = function(evt){
  nodeData.push({x:evt.clientX, y:evt.clientY, key: index, size: 5});
  vis.append('svg:circle')
  .attr('class', 'node')
  .attr('cx', evt.clientX)
  .attr('cy', evt.clientY)
  .attr('r', function(d){return nodeData[nodeData.length-1].size+'px'})
  .attr('fill', 'rgb(229, 144, 177)')
  .attr('data-key', function(){index++; return nodeData[nodeData.length-1].key})
  .on('mouseover', function(d){
    console.log('mousing over element '+nodeData[nodeData.length-1].key);
  })
}

var removeNode = function(target){
  console.log(target.dataset.key);
  for(var i = 0;i<nodeData.length;i++){
    if(nodeData[i].key == target.dataset.key){
      nodeData.splice(i, 1);
      selector = '[data-key="'+target.dataset.key+'"]';
      d3.select(selector).data([]).exit().remove();
    }
  }
}
var modNodeSize = function(target, sign){
  var oldVal = parseInt(vis.select('[data-key="'+target.dataset.key+'"]').attr('r'));
  vis.select('[data-key="'+target.dataset.key+'"]').attr('r',function(){
     return (oldVal+sign*oldVal/2) > 1 ? (oldVal+sign*oldVal/2) +'px' : '1px'
   });
}

window.onload = function(){
  initChart();
  document.addEventListener('click', function(evt){
    if(evt.target.classList.contains('node')){
      //removeNode(evt.target);
      modNodeSize(evt.target, 1);
    }
    else{
      addNewNode(evt);
    }
  });

  document.addEventListener('contextmenu', function(evt){
    if(evt.target.classList.contains('node')){
      evt.preventDefault();
      //removeNode(evt.target);
      modNodeSize(evt.target, -1);
    }

  })
}
