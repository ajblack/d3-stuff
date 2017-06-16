(function(window){

  function customDataLibrary(){
    var _v = {};

    var dataShowing = "All";


    _v.testfunction = function(){

    }

    _v.getDataShowing = function(){
      return dataShowing;
    }

    _v.setDataShowing = function(input){
      if(dataShowing === "All" || dataShowing === "Unmanaged" || dataShowing === "Managed"){
        dataShowing = input;
        return input;
      }
      else{
        return "All";
      }
    }



    //returns a two cell array with coordinate data
    //first cell is the coordinates for individual points
    //second cell is the coordinate pairs for constructing paths

    _v.getData = function(data, dataShowing){

      var data =
      {
        "fields":
        [
          {"name":"src_ip"},
          {"name":"src_port"},
          {"name":"protocol"},
          {"name":"src_location"},
          {"name":"dest_ip"},
          {"name":"dest_port"},
          {"name":"dest_location"},
          {"name":"bytes"},
          {"name":"bytes_in"},
          {"name":"bytes_out"},
          {"name":"rule"},
          {"name":"action"},
          {"name":"City"},
          {"name":"Country"},
          {"name":"Region"},
          {"name":"_timediff"},
          {"name":"end_lat"},
          {"name":"end_lon"},
          {"name":"geo_info"},
          {"name":"start_lat"},
          {"name":"start_lon"},
          {"name":"status"}
        ],
        "rows":
        [
          ["10.42.4.21","52689","udp","10.0.0.0-10.255.255.255","184.105.182.7","123","US","180","90","90","client-public","allowed","Fremont","United States","California","timediff","-121.96210","37.54970","Portland OR","-122.6795","45.5128","Unmanaged"],
          ["10.42.4.21","54559","udp","10.0.0.0-10.255.255.255","45.127.112.2","123","US","180","90","90","client-public","allowed","San Fransisco","United States","California","timediff","-121.41280","37.77580","Portland OR","-122.6795","45.5128","Unmanaged"],
          ["10.42.4.228","51175","tcp","10.0.0.0-10.255.255.255","93.171.216.118","80","NL","132","0","132","uc_dlp_mail_skarka","allowed","Amsterdam","Netherlands","North Holland","timediff","4.91670","52.35000","Portland OR","-122.6795","45.5128","Managed"]
        ]
      }

      var retCords = []
      for(var i=0;i<data.rows.length*2;i++){
        var ret = {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"timestampMs":0}};
        retCords.push(ret);
      }


      var coordinatePairs = [];

      for(var i=0;i<data.rows.length;i++){
        var r1 = {
          "type":"Feature",
          "geometry":{"type":"Point","coordinates":[data.rows[i][19],data.rows[i][20]]},
          "properties":
            {
              "src_ip":data.rows[i][0],
              "src_port":data.rows[i][1],
              "protocol":data.rows[i][2],
              "src_location":data.rows[i][3],
              "dest_ip":data.rows[i][4],
              "dest_port":data.rows[i][5],
              "dest_location":data.rows[i][6],
              "bytes":data.rows[i][7],
              "bytes_in":data.rows[i][8],
              "bytes_out":data.rows[i][9],
              "rule":data.rows[i][10],
              "action":data.rows[i][11],
              "City":data.rows[i][12],
              "Country":data.rows[i][13],
              "Region":data.rows[i][14],
              "_timediff":data.rows[i][15],
              "end_lat":data.rows[i][16],
              "end_lon":data.rows[i][17],
              "geo_info":data.rows[i][18],
              "start_lat":data.rows[i][19],
              "start_lon":data.rows[i][20],
              "status":data.rows[i][21],
              "myid":i,
              "row":data.rows[i]
            }
        };
        var r2 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][16],data.rows[i][17]]},"properties":{}};
        coordinatePairs.push([r1,r2])
      }


      //map the coordinates of each row value (set of two coordinates) individually to a retCords coordinate
      var currentRet = 0;
      for(var j=0;j<coordinatePairs.length;j++){
        retCords[currentRet].geometry.coordinates[0] = coordinatePairs[j][0].geometry.coordinates[0];
        retCords[currentRet].geometry.coordinates[1] = coordinatePairs[j][0].geometry.coordinates[1];
        currentRet++;
        retCords[currentRet].geometry.coordinates[0] = coordinatePairs[j][1].geometry.coordinates[0];
        retCords[currentRet].geometry.coordinates[1] = coordinatePairs[j][1].geometry.coordinates[1];
        currentRet++;
      }

      return [retCords, coordinatePairs];
    }



    return _v;
  }

  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myCustomDataLibrary) === 'undefined'){
    window.myCustomDataLibrary = customDataLibrary();
  }
})(window); // We send the window variable withing our function
