(function(window){

  function customD3Library(){
    var _v = {};

    var modalInit = false;
    var circlesInit = false;


    _v.createModal = function(){
      if(!modalInit){

        var modalDiv = window.document.createElement('div'),
          modalDetail = window.document.createElement('span');

        modalDiv.id = 'circle-hover-modal';
        modalDetail.id = 'hover-modal-unmanaged-assets';
        modalDetail.classList.add('modal-detail');
        window.document.getElementsByTagName('body')[0].appendChild(modalDiv);
        modalDiv.appendChild(modalDetail);

      }
      modalInit = true;
    }

    _v.createCircles = function(totalAssets, managedAssets, unmanagedAssets){

      if(!circlesInit){
        
      }
      circlesInit = true;

    }
    return _v;
  }



  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myCustomD3Library) === 'undefined'){
    window.myCustomD3Library = customD3Library();
  }
})(window); // We send the window variable withing our function
