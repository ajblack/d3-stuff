//d3 drawing variables
var svg, projection, pathGenerator, data;

//coordinate manipulation variables
var retCords, coordinatePairs, currentRet, latlong;

function draw_curve(Ax, Ay, Bx, By, M) {
    // Find midpoint J
    var Jx = Ax + (Bx - Ax) / 2
    var Jy = Ay + (By - Ay) / 2
    // We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
    var a = Bx - Ax
    var asign = (a < 0 ? -1 : 1)
    var b = By - Ay
    var bsign = (b < 0 ? -1 : 1)
    var theta = Math.atan(b / a)
    // Find the point that's perpendicular to J on side
    var costheta = asign * Math.cos(theta)
    var sintheta = asign * Math.sin(theta)
    //austin- trying to calc m value here based off of difference in y values
    var M = By - Ay;
    // Find c and d
    var c = M * sintheta
    var d = M * costheta
    // Use c and d to find Kx and Ky
    var Kx = Jx - c
    var Ky = Jy + d
    return "M" + Ax + "," + Ay +"Q" + Kx + "," + Ky +" " + Bx + "," + By;
}

window.onload = function(){
  data =
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
      ["-122.6795","45.5128","151.19820","-33.86120"],

      //new ones
      ["-122.6795","45.5128","72.82580","18.97500"],
      ["-122.6795","45.5128","103.85650","1.28550"],
      ["-122.6795","45.5128","-121.26924","37.33002"],
      ["-122.6795","45.5128","-79.67436","39.38558"],
      ["-122.6795","45.5128","126.73170","37.45360"],
      ["-122.6795","45.5128","139.76770","35.64270"],
      ["-122.6795","45.5128","-119.71617","45.89048"],
      ["-122.6795","45.5128","-73.58330","45.50000"]
    ]
  }




  retCords = []
  for(var i=0;i<data.rows.length*2;i++){
    var ret = {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"timestampMs":0}};
    retCords.push(ret);
  }

  //console.log(retCords);

  coordinatePairs = [];
  for(var i=0;i<data.rows.length;i++){
    var r1 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][0],data.rows[i][1]]},"properties":{"timestampMs":0}};
    var r2 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][2],data.rows[i][3]]},"properties":{"timestampMs":0}};
    coordinatePairs.push([r1,r2])
  }

  //map the coordinates of each row value (set of two coordinates) individually to a retCords coordinate
  currentRet = 0;
  for(var j=0;j<data.rows.length;j++){
    retCords[currentRet].geometry.coordinates[0] = data.rows[j][0];
    retCords[currentRet].geometry.coordinates[1] = data.rows[j][1];
    currentRet++;
    retCords[currentRet].geometry.coordinates[0] = data.rows[j][2];
    retCords[currentRet].geometry.coordinates[1] = data.rows[j][3];
    currentRet++;
  }

  //convert the coordinates into the features attribute of a geojson object
  latlong = {"type":"FeatureCollection", "features":[]}
  latlong.features = retCords;

  var origWindowHeight = window.innerHeight;
  var origWindowWidth = window.innerWidth;
  var origVizHeight = 960;
  var origVizWidth = 480;

  var width = 960,
      height = 480;


  width = window.innerWidth;
  height = window.innerHeight;

  svg = d3.select("body").append("svg")
      .attr("id", "mySVG")
      .attr("width", width)
      .attr("height", height);


  projection = d3.geoEquirectangular()
    .scale(153)
    .translate([width/2,height/2])

  pathGenerator = d3.geoPath()
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

      //using the coordinate pair object construct lines between coordinates
      for(var i=0;i<coordinatePairs.length;i++){
        var p1 = projection([coordinatePairs[i][0].geometry.coordinates[0],coordinatePairs[i][0].geometry.coordinates[1]])
        var p2 = projection([coordinatePairs[i][1].geometry.coordinates[0],coordinatePairs[i][1].geometry.coordinates[1]])
        svg.append("path")
        .attr("d", draw_curve(p1[0],p1[1],p2[0],p2[1],5))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("class","customline")
        .attr("fill", "none")
        .attr("marker-end","url(#triangle)");
      }
}

var redraw = function(){
  width = window.innerWidth;
  height = window.innerHeight;
  console.log("resizing with dims: "+window.innerWidth);
  svg.attr("width", width)
      .attr("height", height);

  projection.scale(153).translate([width/2,height/2]);
  pathGenerator.projection(projection);
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

  //using the coordinate pair object construct lines between coordinates
  for(var i=0;i<coordinatePairs.length;i++){
    var p1 = projection([coordinatePairs[i][0].geometry.coordinates[0],coordinatePairs[i][0].geometry.coordinates[1]])
    var p2 = projection([coordinatePairs[i][1].geometry.coordinates[0],coordinatePairs[i][1].geometry.coordinates[1]])
    svg.append("path")
    .attr("d", draw_curve(p1[0],p1[1],p2[0],p2[1],5))
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("class","customline")
    .attr("fill", "none")
    .attr("marker-end","url(#triangle)");
  }


}

window.addEventListener("resize", redraw);
