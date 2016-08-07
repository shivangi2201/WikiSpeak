/*
* File: jquery.wikiblurb.js
* Version: 1.0.0
* Description: A simple jQuery plugin to get sections of Wikipedia and other Wikis
* Author: 9bit Studios
* Copyright 2012, 9bit Studios
* http://www.9bitstudios.com
* Free to use and abuse under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {

    $.fn.wikiblurb = function (options) {

        var defaults = $.extend({
            wikiURL: "http://en.wikipedia.org/",
            apiPath: 'w',
            section: 0,
            page: 'Jimi_Hendrix',
            removeLinks: false,	    
            type: 'all',
            customSelector: '',
        }, options);
        
        /******************************
	Private Variables
	*******************************/         

        var object = $(this);
        var settings = $.extend(defaults, options);
	
        /******************************
	Public Methods
	*******************************/         
        
        var methods = {
        	
            init: function() {
                return this.each(function () {
                    methods.appendHTML();
                    methods.initializeItems();
                });
            },
			
            /******************************
	    Append HTML
	    *******************************/			

            appendHTML: function() {
            // nothiing to append
            },

            /******************************
	    Initialize
	    *******************************/			

            initializeItems: function() {
                $.ajax({
                    type: "GET",
                    url: settings.wikiURL + settings.apiPath + "/api.php?action=parse&format=json&prop=text&section="+settings.section+"&page="+settings.page+"&callback=?",
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    dataType: "json",
                    success: function (data, textStatus, jqXHR) {

                        try {
                            var markup = data.parse.text["*"];
                            var blurb = $('<div class="nbs-wikiblurb"></div>').html(markup);

                            // remove links?

                            if(settings.removeLinks) {
                                blurb.find('a').each(function() { 
                                    $(this).replaceWith($(this).html()); 
                                });
                            }
                            else {
                                blurb.find('a').each(function() {
                                    var link = $(this);
                                    var relativePath = link.attr('href').substring(1); // remove leading slash
                                    link.attr('href', settings.wikiURL + relativePath); 
                                });			    
                            }

                            // remove any references
                            blurb.find('sup').remove();

                            // remove cite error
                            blurb.find('.mw-ext-cite-error').remove();

                            switch(settings.type) {
                                case 'text':				
                                    object.html($(blurb).find('p'));
                                    break;
				    
                                case 'blurb':
                                    object.html($(blurb).find('p:first'));
                                    break;
				
                                case 'infobox':
                                    object.html($(blurb).find('.vcard'));
                                    break;
				    
                                case 'custom':
                                    object.html($(blurb).find(settings.customSelector));
                                    break;
				
                                default:
                                    object.html(blurb);
                                    break;
                            }
				
                        }
                        catch(e){
                            methods.showError();
                        }
			
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        methods.showError();
                    }
                });
            },
	    
            showError: function(){
                object.html('<div class="nbs-wikiblurb-error">There was an error locating your wiki data</div>');
            }

        };
        
        if (methods[options]) { // $("#element").pluginName('methodName', 'arg1', 'arg2');
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) { 	// $("#element").pluginName({ option: 1, option:2 });
            return methods.init.apply(this);  
        } else {
            $.error( 'Method "' +  method + '" does not exist in wikiblurb plugin!');
        } 
    };

})(jQuery);