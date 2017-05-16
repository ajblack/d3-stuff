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

  console.log(retCords);


/*
  for(var i=0;i<data.rows.length;i++){
    var ret =
    [
      {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"timestampMs":0}},
      {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"timestampMs":0}}
    ]
  }*/

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
/*
    svg.append("path")
               .datum({type: "LineString", coordinates: [[-122.6795,45.5128],[-46.62890,-23.54640]]})
               .attr("style","stroke: red; stroke-width: 2px; fill: none")
               .attr("d", path);
     svg.append("path")
              .datum({type: "LineString", coordinates: [[-122.6795,45.5128],[151.19820,-33.86120]]})
              .attr("style","stroke: red; stroke-width: 2px; fill: none")
              .attr("d", path);*/
/*
      svg.append("path")
               .datum({type: "LineString", coordinates: [[-122.6795,45.5128],[151.19820,-33.86120]]})
               .attr("style","stroke: red; stroke-width: 2px; fill: none")
               .attr("d", pathGenerator);*/
/*
     for(var i=0;i<retCords.length; i++){
       var
     }*/

      var p1 = projection([-122.6795,45.5128]);
      var p2 = projection([151.19820,-33.86120])
      var lineData = [{"x":p1[0], "y":p1[1]},{"x":p2[0],"y":p2[1]}];

      //This is the accessor function we talked about above
      var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      svg.append("path")
      .attr("d", lineFunction(lineData))
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("fill", "none");
      

}
