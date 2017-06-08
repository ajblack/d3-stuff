(function(window){

  function customD3Library(){
    var _v = {};

    var modalInit = false;
    var dataPanelInit = false;

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

        var modalDiv = window.document.createElement('div');
        modalDiv.id = 'world-map-hover-modal';
        window.document.getElementsByTagName('body')[0].appendChild(modalDiv);
        $("#world-map-hover-modal" ).load( "/static/app/world_map_app/modal.html", function(){});

      }
      modalInit = true;
    }

    _v.createDataPanel = function(){

      if(!dataPanelInit){
        var panelDiv = window.document.createElement('div');
        panelDiv.id = 'world-map-data-panel';

      //  console.log("parent element: ")+document.getElementsByClassName('splunk-radial-meter')[0];

        window.document.getElementsByTagName('body')[0].appendChild(panelDiv);

        $( "#world-map-data-panel").draggable({
          containment:".splunk-radial-meter"
        });


        $("#world-map-data-panel").load('/static/app/world_map_app/datapanel.html', function(){});
        panelDiv.addEventListener('contextmenu', function(e){
          e.preventDefault();
          panelDiv.classList.remove('visiblemodal');
        });
        panelDiv.addEventListener('mouseover', function(e){
          panelDiv.classList.add('hovered');
          var panelID = panelDiv.getAttribute('data-myid');
          var matchingPath = window.document.querySelector('#world-map-svg').querySelector('[data-myid="'+panelID+'"]');
          matchingPath.setAttribute('stroke', 'blue');
        });
        panelDiv.addEventListener('mouseleave', function(e){
          panelDiv.classList.remove('hovered');
          var panelID = panelDiv.getAttribute('data-myid');
          var matchingPath = window.document.querySelector('#world-map-svg').querySelector('[data-myid="'+panelID+'"]');
          matchingPath.setAttribute('stroke', 'red');
        });
        window.addEventListener('scroll', function(e){
          var panelBox = document.querySelector('#world-map-data-panel').getBoundingClientRect();
          var anchorBox = document.querySelector('.mySvgContainer').getBoundingClientRect();

					//console.log("panel top: "+panelBox.top+" and anchorTop: "+anchorBox.top);
          //console.log("panel bottom: "+panelBox.bottom+" and anchorTop: "+anchorBox.bottom);
          if(panelBox.top < anchorBox.top){
            panelDiv.style.top = anchorBox.top+'px';
          }
          else if(panelBox.bottom > anchorBox.bottom){
            panelDiv.style.top = anchorBox.bottom - panelBox.height+'px';
          }
        })
      }
      dataPanelInit = true;

    }

    return _v;
  }



  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myCustomD3Library) === 'undefined'){
    window.myCustomD3Library = customD3Library();
  }
})(window); // We send the window variable withing our function
