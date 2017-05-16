window.onload = function(){
  var data =
  {
    "fields":
    [
      {"name":"start_lat"},
      {"name":"start_lon"},
      {"name":"end_lat"},
      {"name":"end_lon"}
    ],
    "rows":
    [
      ["-122.6795","45.5128","-46.62890","-23.54640"],
      ["-122.6795","45.5128","151.19820","-33.86120"]
    ]
  }

  var retCords = []
  for(var i=0;i<data.rows.length*2;i++){
    var ret = {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"timestampMs":0}};
    retCords.push(ret);
  }

  //console.log(retCords);

  var coordinatePairs = [];
  for(var i=0;i<data.rows.length;i++){
    var r1 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][0],data.rows[i][1]]},"properties":{"timestampMs":0}};
    var r2 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][2],data.rows[i][3]]},"properties":{"timestampMs":0}};
    coordinatePairs.push([r1,r2])
  }

  console.log(coordinatePairs);

  //map the coordinates of each row value (set of two coordinates) individually to a retCords coordinate
  var currentRet = 0;

  for(var j=0;j<data.rows.length;j++){
    retCords[currentRet].geometry.coordinates[0] = data.rows[j][0];
    retCords[currentRet].geometry.coordinates[1] = data.rows[j][1];
    currentRet++;
    retCords[currentRet].geometry.coordinates[0] = data.rows[j][2];
    retCords[currentRet].geometry.coordinates[1] = data.rows[j][3];
    currentRet++;
  }

  var latlong = {"type":"FeatureCollection", "features":[]}
  latlong.features = retCords;


  var width = 960,
      height = 480;

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

      svg.append("svg:defs").append("svg:marker")
          .attr("id", "triangle")
          .attr("refX", 30)
          .attr("refY", 2)
          .attr("markerWidth", 30)
          .attr("markerHeight", 30)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M 0 0 4 2 0 4 1 2")
          .style("fill", "red");


  var projection = d3.geoEquirectangular()
    .scale(153)
    .translate([width/2,height/2])

  var pathGenerator = d3.geoPath()
      .projection(projection)

      svg.append("g")
        .attr("class", "land")
        .selectAll("path")
        .data([topojson.feature(world, world.objects.land)])
        .enter()
        .append("path")
        .attr("d", pathGenerator);

    svg.append("g")
        .attr("class", "boundary")
        .selectAll("boundary")
        .data([topojson.feature(world, world.objects.countries)])
        .enter()
        .append("path")
        .attr("d", pathGenerator);

    svg.append( "g" )
      .attr("class","pin")
      .selectAll("path")
      .data( latlong.features)
      .enter()
      .append("path")
      .attr( "d", pathGenerator);


      //helper function returns line data from coordinate pair
      var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      //using the coordinate pair object construct lines between coordinates
      for(var i=0;i<coordinatePairs.length;i++){
        var p1 = projection([coordinatePairs[i][0].geometry.coordinates[0],coordinatePairs[i][0].geometry.coordinates[1]])
        var p2 = projection([coordinatePairs[i][1].geometry.coordinates[0],coordinatePairs[i][1].geometry.coordinates[1]])
        var lineD = [
          {"x":p1[0],"y":p1[1]},
          {"x":p2[0],"y":p2[1]},
        ];
        svg.append("path")
        .attr("d", lineFunction(lineD))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("class","customline")
        .attr("fill", "none")
        .attr("marker-end","url(#triangle)");




      }


}
