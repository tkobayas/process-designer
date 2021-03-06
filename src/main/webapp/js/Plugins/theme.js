if (!ORYX.Plugins) 
    ORYX.Plugins = {};

if (!ORYX.Config)
	ORYX.Config = {};

ORYX.Plugins.Theme = Clazz.extend({
	construct: function(facade){
		this.facade = facade;
		
		var ajaxObj = new XMLHttpRequest;
		var url = ORYX.PATH + "themes";
	    var params  = "action=getThemeNames&profile=" + ORYX.PROFILE;
	    ajaxObj.open("POST",url,false);
	    ajaxObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    ajaxObj.send(params);
	    
	    if (ajaxObj.status == 200) {
			var themeNamesArray = ajaxObj.responseText.split(",");
			for (var i = 0; i < themeNamesArray.length; i++) {
	   			 this.facade.offer({
	   				'name': themeNamesArray[i],
	   				'functionality': this.applyTheme.bind(this, themeNamesArray[i]),
	   				'group': ORYX.I18N.View.jbpmgroup,
	   				dropDownGroupIcon : ORYX.PATH + "images/colorpicker.gif",
	   				'icon': ORYX.PATH + "images/colorize.png",
	   				'description': "Apply " + themeNamesArray[i] + " Color Theme",
	   				'index': 10,
	   				'minShape': 0,
	   				'maxShape': 0,
	   				'isEnabled': function(){
	   					profileParamName = "profile";
	   					profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	   					regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
	   			        regexa = new RegExp( regexSa );
	   			        profileParams = regexa.exec( window.location.href );
	   			        profileParamValue = profileParams[1]; 
	   					return profileParamValue == "jbpm";
	   				}.bind(this)
	   			});
  			}
		} else {
			Ext.Msg.alert('Error loading Color Themes.');
		}
	},
	applyTheme: function(tname) {
		this._createCookie("designercolortheme", tname, 365);
		Ext.Ajax.request({
            url: ORYX.PATH + 'themes',
            method: 'POST',
            success: function(response) {
    	   		try {
    	   			if(response.responseText && response.responseText.length > 0) {
    	   				var themejson = response.responseText.evalJSON();
    	   				var themeobj = themejson["themes"];
    	   				var toapplyobj = themeobj[tname];
    	   				
    	   				ORYX.EDITOR._canvas.getChildNodes().each((function(child) {
    	   					this.applyThemeToNodes(child, toapplyobj);
    	   				}).bind(this));
    	   			} else {
    	   				Ext.Msg.alert('Invalid Color Theme data.');
    	   			}
    	   		} catch(e) {
    	   			Ext.Msg.alert('Error applying Color Theme:\n' + e);
    	   		}
            }.bind(this),
            failure: function(){
            	Ext.Msg.alert('Error applying Color Theme.');
            },
            params: {
            	action: 'getThemeJSON',
            	profile: ORYX.PROFILE
            }
        });
	},
	applyThemeToNodes: function(child, themeObj) {
		var childgroup = child.getStencil().groups()[0];
		var childthemestr = themeObj[childgroup];
		if(childthemestr && child.properties["oryx-isselectable"] != "false") { 
			var themestrparts = childthemestr.split("|");
			child.setProperty("oryx-bgcolor", themestrparts[0]);
			child.setProperty("oryx-bordercolor", themestrparts[1]);
			child.setProperty("oryx-fontcolor", themestrparts[2]);
			child.refresh();
		}
		if(child.getChildNodes().size() > 0) {
			for (var i = 0; i < child.getChildNodes().size(); i++) {
				this.applyThemeToNodes(child.getChildNodes()[i], themeObj);
			}
		}
	},
	_createCookie: function(name, value, days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else {
			var expires = "";
		}
		
		document.cookie = name+"="+value+expires+"; path=/";
	},
	_readCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
});