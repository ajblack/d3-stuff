window.onload = function(){
  var uAssets = 17;
  var uAssetsCom = 10;
  var vizContainer = window.document.createElement('div'),
    legendContainer = window.document.createElement('div'),
    uAssetLegendContainer = window.document.createElement('div');
    uAssetLegendColor = window.document.createElement('span'),
    uAssetLegendText = window.document.createElement('span'),
    uAssetComLegendContainer = window.document.createElement('div');
    uAssetComLegendColor = window.document.createElement('span'),
    uAssetComLegendText = window.document.createElement('spans');
  vizContainer.id = 'vizContainer';
  legendContainer.id = 'legendContainer';
  uAssetLegendText.id = 'uAssetLegendText';
  uAssetLegendColor.id = 'uAssetLegendColor';
  uAssetComLegendText.id = 'uAssetComLegendText';
  uAssetComLegendColor.id = 'uAssetComLegendColor';
  uAssetLegendText.classList.add('legendText');
  uAssetLegendColor.classList.add('legendColor','uAsset');
  uAssetComLegendText.classList.add('legendText');
  uAssetComLegendColor.classList.add('legendColor','uAssetCom');
  //uAssetLegendContainer.classList.add('legendLine');
  //uAssetComLegendContainer.classList.add('legendLine');
  window.document.getElementsByTagName('body')[0].appendChild(vizContainer);
  var circleContainer = window.document.createElement('div')
  circleContainer.id = 'circleContainer';
  vizContainer.appendChild(circleContainer);
  vizContainer.appendChild(legendContainer);
  legendContainer.appendChild(uAssetLegendContainer);
  legendContainer.appendChild(uAssetComLegendContainer);

  uAssetLegendContainer.appendChild(uAssetLegendColor);
  uAssetLegendContainer.appendChild(uAssetLegendText);

  uAssetComLegendContainer.appendChild(uAssetComLegendColor);
  uAssetComLegendContainer.appendChild(uAssetComLegendText);

  uAssetLegendText.textContent = ' Unmanaged Assets';
  uAssetComLegendText.textContent = ' Unmanaged Assets with Outbound Communication';

  var handleMouseMove = function(e){
    var modalDiv =  document.getElementById('hover-modal');
    modalDiv.style.top = e.clientY-10+'px';
    modalDiv.style.left = e.clientX+20+'px';
  }

  var svgContainer = d3.select("#circleContainer").append("svg")
    .attr("width", 200)
    .attr("height", 200)
    .attr('id', 'circleContainer')
    .append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")")

  var scale = d3.scaleLinear()
    .domain([0,uAssets])
    .range([0,100]);

  var jsonCircles = [{
    "radius": uAssets,
    "num": uAssets,
    "id": "uAssetCircle"
  }, {
    "radius": uAssetsCom,
    "num": uAssetsCom,
    "id": "uAssetComCircle"
  }];

  var circles = svgContainer.selectAll("circle")
    .data(jsonCircles)
    .enter()
    .append("circle");

  var circleAttributes = circles
    .attr("r", function(d) {
      console.log('radius '+scale(d.radius));
      return scale(d.radius);
    })
    .attr("id", function(d) {
      return d.id
    })
    .attr("data-num", function(d){
      return d.num
    });

    d3.select("#uAssetCircle")
      .attr("class", "uAsset");
    //radius of large circle - radius of small circle is hypotenuse in equation
    d3.select("#uAssetComCircle")
      .attr("class", "uAssetCom")
      .attr("cx", function(d) {
        return -Math.sqrt(Math.pow(100-scale(uAssetsCom),2)/2);
      })
      .attr("cy", function(d) {
        return -Math.sqrt(Math.pow(100-scale(uAssetsCom),2)/2);
      })

    var modalDiv =  document.getElementById('hover-modal');
  document.querySelector("#uAssetCircle").addEventListener('mouseover', function(e){
    modalDiv.classList.add('hovered');
    document.querySelector("#hover-modal-unmanaged-assets").textContent = "Unmanaged Assets: "+document.querySelector('#uAssetCircle').getAttribute('data-num');
    document.querySelector("#uAssetCircle").addEventListener('mousemove',handleMouseMove);
  });
  document.querySelector("#uAssetCircle").addEventListener('mouseleave', function(e){
    modalDiv.classList.remove('hovered');
    document.querySelector("#uAssetCircle").removeEventListener('mousemove',handleMouseMove);
  });
  document.querySelector("#uAssetComCircle").addEventListener('mouseover', function(e){
    modalDiv.classList.add('hovered');
    document.querySelector("#hover-modal-unmanaged-assets").textContent = "Unmanaged Assets with Outbound Traffic: "+document.querySelector('#uAssetComCircle').getAttribute('data-num');
    document.querySelector("#uAssetComCircle").addEventListener('mousemove',handleMouseMove);
  });
  document.querySelector("#uAssetComCircle").addEventListener('mouseleave', function(e){
    modalDiv.classList.remove('hovered');
    document.querySelector("#uAssetComCircle").removeEventListener('mousemove',handleMouseMove);
  });
}
