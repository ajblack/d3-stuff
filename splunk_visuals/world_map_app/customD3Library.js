(function(window){

  function customD3Library(){
    var _v = {};

    var modalInit = false;
    var dataPanelInit = false;

    _v.handlePathClick = function(path, modalWindow, panelWindow, d3Event){
      console.log('handling path click from lib');
      modalWindow.classList.remove("visiblemodal");
      panelWindow.classList.add("visiblemodal");
      panelWindow.querySelector("#panel-src_ip").textContent = "Source IP: "+path.getAttribute("data-src_ip");
      panelWindow.querySelector("#panel-protocol").textContent = "Protocol: "+path.getAttribute("data-protocol");
      panelWindow.querySelector("#panel-src_location").textContent = "Source Location: "+path.getAttribute("data-src_location");
      panelWindow.querySelector("#panel-dest_ip").textContent = "Dest IP: "+path.getAttribute("data-dest_ip");
      panelWindow.querySelector("#panel-dest_port").textContent = "Dest Port: "+path.getAttribute("data-dest_port");
      panelWindow.querySelector("#panel-dest_location").textContent = "Dest Location: "+path.getAttribute("data-dest_location");
      panelWindow.querySelector("#panel-bytes").textContent = "Bytes: "+path.getAttribute("data-bytes");
      panelWindow.querySelector("#panel-bytes_in").textContent = "Bytes In: "+path.getAttribute("data-bytes_in");
      panelWindow.querySelector("#panel-bytes_out").textContent = "Bytes Out: "+path.getAttribute("data-bytes_out");
      panelWindow.querySelector("#panel-rule").textContent = "Rule: "+path.getAttribute("data-rule");
      panelWindow.querySelector("#panel-action").textContent = "Action: "+path.getAttribute("data-action");
      panelWindow.querySelector("#panel-City").textContent = "City: "+path.getAttribute("data-City");
      panelWindow.querySelector("#panel-Country").textContent = "Country: "+path.getAttribute("data-Country");
      panelWindow.querySelector("#panel-Region").textContent = "Region: "+path.getAttribute("data-Region");
      panelWindow.querySelector("#panel-_timediff").textContent = "Time Difference: "+path.getAttribute("data-_timediff");
      panelWindow.querySelector("#panel-end_lat").textContent = "End Lat: "+path.getAttribute("data-end_lat");
      panelWindow.querySelector("#panel-end_lon").textContent = "End Long: "+path.getAttribute("data-end_lon");
      panelWindow.querySelector("#panel-geo_info").textContent = "Geo Info: "+path.getAttribute("data-geo_info");

      panelWindow.querySelector("#panel-start_lat").textContent = "Start Lat: "+path.getAttribute("data-start_lat");
      panelWindow.querySelector("#panel-start_lon").textContent = "Start Long: "+path.getAttribute("data-start_lon");
      panelWindow.querySelector("#panel-status").textContent = "Status: "+path.getAttribute("data-status");
      panelWindow.setAttribute('data-myid', path.getAttribute('data-myid'));
      panelWindow.classList.add('hovered');
      if(path.dataset.status === "Unmanaged"){
        panelWindow.classList.remove('managed');
        panelWindow.classList.add('unmanaged');
      }
      else{
        panelWindow.classList.remove('unmanaged');
        panelWindow.classList.add('managed');
      }

      //anchor.getBoundingClientRect();
      //document.querySelector('#'+anchorID+'world-map-svg').getBoundingClientRect();
      panelWindow.style.top = d3Event.clientY-10+'px';
      panelWindow.style.left = d3Event.clientX+20+'px';
    }

    _v.handlePathMouseover = function(path, modalWindow, panelWindow, d3Event){
      path.setAttribute('stroke', 'blue');
      path.setAttribute('marker-end','url(#triangleSelected)');
      if(path.dataset.myid == panelWindow.dataset.myid){
        panelWindow.classList.add('hovered');
      }
      //show the preview modal only if the detail window is not currently showing this data
      if(path.dataset.myid !== panelWindow.dataset.myid || !panelWindow.classList.contains('visiblemodal')){
        modalWindow.classList.add("visiblemodal");
        modalWindow.querySelector("#modal-src_ip").textContent = "Source IP: "+path.getAttribute("data-src_ip");
        modalWindow.querySelector("#modal-src_port").textContent = "Source Port: "+path.getAttribute("data-src_port");
        modalWindow.querySelector("#modal-src_location").textContent = "Source Location: "+path.getAttribute("data-src_location");
        modalWindow.querySelector("#modal-protocol").textContent = "Protocol: "+path.getAttribute("data-protocol");
        modalWindow.querySelector("#modal-dest_ip").textContent = "Dest IP: "+path.getAttribute("data-dest_ip");
        modalWindow.querySelector("#modal-dest_port").textContent = "Dest Port: "+path.getAttribute("data-dest_port");
        modalWindow.querySelector("#modal-dest_location").textContent = "Dest Location: "+path.getAttribute("data-dest_location");
        modalWindow.setAttribute('data-myid', path.getAttribute('data-myid'));
        modalWindow.style.top = d3Event.clientY-10+'px';
        modalWindow.style.left = d3Event.clientX+20+'px';
      }
    }

    _v.handlePathMouseleave = function(path, modalWindow, panelWindow, d3Event){
      //path.setAttribute('class','');

      if(path.dataset.status === "Unmanaged"){
        path.setAttribute('stroke', 'red');
        path.setAttribute('marker-end','url(#triangleUnmanaged)');
      }
      else{
        path.setAttribute('stroke', 'green');
        path.setAttribute('marker-end','url(#triangleManaged)');
      }
      panelWindow.classList.remove('hovered');
      modalWindow.classList.remove("visiblemodal");
    }

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

    _v.makeElementDraggable = function(elem, anchor){
      $('.world-map-data-panel').draggable({
        containment:anchor
      });
    }
/*
    _v.createModal = function(anchor, anchorID){
      if(!modalInit){

        var modalDiv = window.document.createElement('div');
        modalDiv.id = 'world-map-hover-modal';
        window.document.getElementsByTagName('body')[0].appendChild(modalDiv);
        $("#world-map-hover-modal" ).load( "/static/app/world_map_app/modal.html", function(){});

      }
      modalInit = true;
    }

    _v.createDataPanel = function(anchor, anchorID){

      if(!dataPanelInit){
        var panelDiv = window.document.createElement('div');
        panelDiv.id = anchorID+'world-map-data-panel';
        var panelID = '#'+anchorID+'world-map-data-panel';

      //  console.log("parent element: ")+document.getElementsByClassName('splunk-radial-meter')[0];

        window.document.getElementsByTagName('body')[0].appendChild(panelDiv);

        $(panelID).draggable({
          containment:panelID
        });


        $(panelID).load('/static/app/world_map_app/datapanel.html', function(){});
        panelDiv.addEventListener('contextmenu', function(e){
          e.preventDefault();
          panelDiv.classList.remove('visiblemodal');
        });
        panelDiv.addEventListener('mouseover', function(e){
          panelDiv.classList.add('hovered');
          var panelID = panelDiv.getAttribute('data-myid');
          var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelID+'"]');
          matchingPath.setAttribute('stroke', 'blue');
        });
        panelDiv.addEventListener('mouseleave', function(e){
          panelDiv.classList.remove('hovered');
          var panelID = panelDiv.getAttribute('data-myid');
          var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelID+'"]');
          matchingPath.setAttribute('stroke', 'red');
        });
        window.addEventListener('scroll', function(e){
          var panelBox = document.querySelector(panelID).getBoundingClientRect();
          var anchorBox = document.querySelector(anchorID).getBoundingClientRect();

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
*/
    return _v;
  }



  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myCustomD3Library) === 'undefined'){
    window.myCustomD3Library = customD3Library();
  }
})(window); // We send the window variable withing our function
