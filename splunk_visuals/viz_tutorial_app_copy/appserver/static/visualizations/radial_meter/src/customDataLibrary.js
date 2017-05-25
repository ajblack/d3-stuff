(function(window){

  function customDataLibrary(){
    var _v = {};

    console.log('initializing data lib');

    _v.testfunction = function(){

    }

    _v.getData = function(data){

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
    }



    return _v;
  }

  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myCustomDataLibrary) === 'undefined'){
    window.myCustomDataLibrary = customDataLibrary();
  }
})(window); // We send the window variable withing our function
