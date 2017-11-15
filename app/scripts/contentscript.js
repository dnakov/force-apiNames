'use strict';

var apinamesScriptRun = function (hostPrefix) {


  function replaceWithAPINames(hostPrefix) {

    window.apinamesScript = window.apinamesScript || {};
    window.apinamesScript.oldLabels = window.apinamesScript.oldLabels || {};
    window.apinamesScript.isOn = window.apinamesScript.isOn === undefined ? false : window.apinamesScript.isOn;
    window.apinamesScript.loaded = true;

    var ids = '';
    function getCookie(name) {
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length == 2) return parts.pop().split(";").shift();
    }

    if(window.location.pathname.length < 16) return;

    var keyPrefix = window.location.pathname.substring(1,4);
    var sObjectId = window.location.pathname.substring(1,16);
    var sObjectName;
    var headers = {'Authorization': 'Bearer ' +  getCookie('sid'), 'Content-Type': 'application/json'};
    var recordTypeId;
    var sentMsg = false;
    if(!window.apinamesScript.isOn) {
      let json = (response) => { return response.json() }
      fetch(hostPrefix + '/services/data/v37.0/sobjects', { method: 'GET', headers: headers }).then(json).then( data => {
        console.log(data)
        for (var i = 0; i < data.sobjects.length; i++) {
          if(data.sobjects[i].keyPrefix == keyPrefix) {
            sObjectName = data.sobjects[i].name;
          }
        };
        fetch(hostPrefix + '/services/data/v37.0/sobjects/' + sObjectName + '/' + sObjectId, { headers:headers }).then(json).then( data => {
          recordTypeId = data.RecordTypeId || '012000000000000AAA';

          fetch(hostPrefix + '/services/data/v37.0/sobjects/' + sObjectName + '/describe/layouts/' + (recordTypeId != null ? recordTypeId : ''), { headers: headers }).then(json).then( data2 => {
            var els = document.querySelectorAll('.labelCol');
            data = data2.layouts != null ? data2.layouts[0] : data2;
            let labelMap = {}
            data.detailLayoutSections.map( section => {
              section.layoutRows.map( row => {
                row.layoutItems.filter( item => !item.placeHolder ).map( item => {
                  labelMap[item.label] = item.layoutComponents[0] && item.layoutComponents[0].value
                })
              })
            })
            Array.prototype.map.call(els, el => {
              let txt = el.textContent.split('sfdcPage.')[0]
              if(labelMap[txt] != null) {
                el.textContent = labelMap[txt];
                delete labelMap[txt];
              }
            })
            if(!sentMsg) {
              window.apinamesScript.isOn = !window.apinamesScript.isOn;
              chrome.runtime.sendMessage({isOn:window.apinamesScript.isOn});
              sentMsg = true;
            }
          })
        })
      })
    } else {
      chrome.runtime.sendMessage({isOn:window.apinamesScript.isOn});
      window.location.reload();
    }

  }
  replaceWithAPINames(hostPrefix);
};
