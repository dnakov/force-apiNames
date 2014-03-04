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
 
		$("tr>td[id*='00N']").each(function(el) {
 
			ids = ids + '\'' + this.id.substring(0,15) + '\',';
		});
		ids = ids.substring(0,ids.length-1);
 
		var query = 'select id, DeveloperName, FullName from CustomField where id in (' + ids + ')'
 		if(!window.apinamesScript.isOn) {
			$.ajax({ url: location.origin + '/services/data/v28.0/tooling/query', 
				headers: {'Authorization': 'Bearer ' +  getCookie('sid')},
				data: { q: query }, 
				success: function(data) {
					for (var i = 0; i < data.records.length; i++) {
						$("tr>td[id*='00N']").each(function(el) {
							if(data.records[i].Id.substring(0,15) == this.id.substring(0,15))
							{
								window.apinamesScript.oldLabels[this.id.substring(0,15)] = $(this).prev().html();
								$(this).prev().text(data.records[i].DeveloperName + '__c');
							}
						});					
					};
					window.apinamesScript.isOn = !window.apinamesScript.isOn;
					chrome.runtime.sendMessage({isOn:window.apinamesScript.isOn});
				}});
		}
		else //off
		{
			window.apinamesScript.isOn = !window.apinamesScript.isOn;
			chrome.runtime.sendMessage({isOn:window.apinamesScript.isOn});
			$("tr>td[id*='00N']").each(function(el) {
				if(window.apinamesScript.oldLabels[this.id.substring(0,15)] !== undefined)
				{
					if($(this).prev().length > 0)
					{
						$(this).prev()[0].innerHTML = window.apinamesScript.oldLabels[this.id.substring(0,15)];
					}
					
				}
			});								
		}
	}
};