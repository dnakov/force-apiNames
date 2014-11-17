'use strict';

var apinamesScriptRun = function () {

    	if ( !window.jQuery ) {
    		var dollarInUse = !!window.$;
    		var s = document.createElement('script');
    		s.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js');
    		s.addEventListener('load', function(){
    			console.log('jQuery loaded!');

    			if(dollarInUse) {
    				jQuery.noConflict();
    				console.log('`$` already in use; use `jQuery`');
    			}
    			replaceWithAPINames();
    		});

    		document.body.appendChild(s);
    	}
    	else {
    		replaceWithAPINames();
    	}
    	function replaceWithAPINames() {

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
            var headers = {'Authorization': 'Bearer ' +  getCookie('sid')};
            var elNum = 0;
            var recordTypeId;
            window.apinamesScript.oldEls = window.apinamesScript.oldEls || [];
            var sentMsg = false;
            if(!window.apinamesScript.isOn) {
                $.ajax({url: '/services/data/v31.0/sobjects',
                        headers: headers,
                        success: function(data) {
                            for (var i = 0; i < data.sobjects.length; i++) {
                                if(data.sobjects[i].keyPrefix == keyPrefix) {
                                    sObjectName = data.sobjects[i].name;
                                }
                            };
                            $.ajax({url: '/services/data/v31.0/sobjects/' + sObjectName + '/' + sObjectId,
                                headers:headers,
                                success: function(data) {
                                    recordTypeId = data.RecordTypeId || '012000000000000AAA';

                                    $.ajax({url: '/services/data/v31.0/sobjects/' + sObjectName + '/describe/layouts/' + (recordTypeId != null ? recordTypeId : ''),
                                            headers: headers,
                                            success: function(data2) {
                                                var els = $('.labelCol');
                                                data = data2.layouts != null ? data2.layouts[0] : data2;
                                                for (var i = 0; i < data.detailLayoutSections.length; i++) {
                                                    var section = data.detailLayoutSections[i];
                                                    for (var j = 0; j < section.layoutRows.length; j++) {
                                                        var row = section.layoutRows[j];
                                                        for (var k = 0; k < row.layoutItems.length; k++) {
                                                            var item = row.layoutItems[k];
                                                            window.apinamesScript.oldEls.push($(els[elNum]).contents());
                                                            if (!item.placeholder) {
                                                                var comp = item.layoutComponents[0];

                                                                $(els[elNum]).text(comp.value);
                                                            }
                                                            if(!sentMsg) {
                                                             window.apinamesScript.isOn = !window.apinamesScript.isOn;
                                                             chrome.runtime.sendMessage({isOn:window.apinamesScript.isOn});
                                                             sentMsg = true;
                                                            }
                                                            elNum++;
                                                        };
                                                    };
                                                };
                                            }
                                        });
                                }});
                        }});
            } else {
                // var els = $('.labelCol');
                // for (var i = 0; i < els.length; i++) {
                //     $(els[i]).innerHTML = window.apinamesScript.oldEls[i];
                // };
                 // window.apinamesScript.isOn = !window.apinamesScript.isOn;
                chrome.runtime.sendMessage({isOn:window.apinamesScript.isOn});
                window.location.reload();
            }

    	}

};
