(function(window){

  function customD3Library(){
    var _v = {};

    var modalInit = false;

    _v.draw_curve = function(Ax, Ay, Bx, By, M) {
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

    _v.draw_line = function(lineData){
      var ret  = "M " + lineData[0]+" "+lineData[1]+ " L "+lineData[2]+ " "+lineData[3];
      return ret;
    }

    _v.createModal = function(){
      if(!modalInit){
        /*
        var iDiv = document.createElement('div');
        iDiv.id = 'world-map-hover-modal';
        //iDiv.className = "hiddenmodal";
        document.getElementsByTagName('body')[0].appendChild(iDiv);
*/
        //new try
        var containerDiv = document.createElement('div');
        containerDiv.id = 'world-map-modal-container';

        var lineBackDiv = document.createElement('div');
        lineBackDiv.id = 'world-map-connect-background';

        var lineDiv = document.createElement('div');
        lineDiv.id = 'world-map-connect-line';

        var modalDiv = window.document.createElement('div');
        modalDiv.id = 'world-map-hover-modal';
/*
        document.getElementsByTagName('body')[0].appendChild(containerDiv);

        containerDiv.appendChild(lineBackDiv);
        containerDiv.appendChild(modalDiv);
        lineBackDiv.appendChild(lineDiv);
*/
        window.document.getElementsByTagName('body')[0].appendChild(modalDiv);

      }
      modalInit = true;
    }

    return _v;
  }



  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myCustomD3Library) === 'undefined'){
    window.myCustomD3Library = customD3Library();
  }
})(window); // We send the window variable withing our function
