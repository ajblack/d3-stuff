(function(window){

  function ratioAppD3Library(){
    var _v = {};

    var modalInit = false;
    var componentsInit = false;

    _v.addComponents = function(anchor, data){
        var vizContainer = window.document.createElement('div'),
          legendContainer = window.document.createElement('div'),

          manAssetLegendContainer = window.document.createElement('div');
          manAssetLegendColor = window.document.createElement('span'),
          manAssetLegendText = window.document.createElement('span'),

          unmanAssetLegendContainer = window.document.createElement('div');
          unmanAssetLegendColor = window.document.createElement('span'),
          unmanAssetLegendText = window.document.createElement('span');

          totalAssetLegendContainer = window.document.createElement('div');
          totalAssetLegendColor = window.document.createElement('span'),
          totalAssetLegendText = window.document.createElement('span');

        vizContainer.id = 'vizContainer';
        legendContainer.id = 'legendContainer';
        manAssetLegendText.id = 'manAssetLegendText';
        manAssetLegendColor.id = 'manAssetLegendColor';
        unmanAssetLegendText.id = 'unmanAssetLegendText';
        unmanAssetLegendColor.id = 'unmanAssetLegendColor';
        totalAssetLegendText.id = 'totalAssetLegendText';
        totalAssetLegendColor.id = 'totalAssetLegendColor';

        manAssetLegendText.classList.add('legendText');
        manAssetLegendColor.classList.add('legendColor','manAsset');
        unmanAssetLegendText.classList.add('legendText');
        unmanAssetLegendColor.classList.add('legendColor','unmanAsset');
        totalAssetLegendText.classList.add('legendText');
        totalAssetLegendColor.classList.add('legendColor', 'totalAsset');
        anchor.appendChild(vizContainer);
        var circleContainer = window.document.createElement('div')
        circleContainer.id = 'circleContainer';
        vizContainer.appendChild(circleContainer);
        vizContainer.appendChild(legendContainer);
        legendContainer.appendChild(totalAssetLegendContainer);
        legendContainer.appendChild(manAssetLegendContainer);
        legendContainer.appendChild(unmanAssetLegendContainer);

        totalAssetLegendContainer.appendChild(totalAssetLegendColor);
        totalAssetLegendContainer.appendChild(totalAssetLegendText);

        manAssetLegendContainer.appendChild(manAssetLegendColor);
        manAssetLegendContainer.appendChild(manAssetLegendText);

        unmanAssetLegendContainer.appendChild(unmanAssetLegendColor);
        unmanAssetLegendContainer.appendChild(unmanAssetLegendText);

        totalAssetLegendText.textContent = data.rows[0][0]+' Total Assets';
        manAssetLegendText.textContent = data.rows[0][1]+' Mananaged Assets';
        unmanAssetLegendText.textContent = data.rows[0][2]+' Unmanaged Assets';
    }

    _v.createModal = function(){
      if(!modalInit){

        var modalDiv = window.document.createElement('div'),
          modalDetail = window.document.createElement('span');

        modalDiv.id = 'circle-hover-modal';
        modalDetail.id = 'circle-hover-modal-detail';
        modalDetail.classList.add('modal-detail');
        window.document.getElementsByTagName('body')[0].appendChild(modalDiv);
        modalDiv.appendChild(modalDetail);

      }
      modalInit = true;
    }


    return _v;
  }



  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.myRatioAppD3Library) === 'undefined'){
    window.myRatioAppD3Library = ratioAppD3Library();
  }
})(window); // We send the window variable withing our function
