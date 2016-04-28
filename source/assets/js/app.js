
	// Fires whenever a player has finished loading
	function onPlayerReady(event) {
	    event.target.playVideo();
	}

	// Fires when the player's state changes.
	function onPlayerStateChange(event) {
	    // Go to the next video after the current one is finished playing
	    if (event.data === 0) {
	        $.fancybox.next();
	    }
	}

	// The API will call this function when the page has finished downloading the JavaScript for the player API
	function onYouTubePlayerAPIReady() {
	    
	    // Initialise the fancyBox after the DOM is loaded
	    $(document).ready(function() {
	        $(".fancybox")
	            .fancybox({
	                openEffect  : 'none',
	                closeEffect : 'none',
	                nextEffect  : 'none',
	                prevEffect  : 'none',
	                padding     : 0,
	                margin      : 50,
	                beforeShow  : function() {
	                    // Find the iframe ID
	                    var id = $.fancybox.inner.find('iframe').attr('id');
	                    
	                    // Create video player object and add event listeners
	                    var player = new YT.Player(id, {
	                        events: {
	                            'onReady': onPlayerReady,
	                            'onStateChange': onPlayerStateChange
	                        }
	                    });
	                }
	            });
	    });
	    
	}

jQuery(function($) {

	/**
	* Scroll to element
	*/
	$(document).on('click','a[data-target]', function(event) {
		event.preventDefault();
		var $target = $("#" + this.getAttribute('data-target'));
		if($target.size())
			$('html, body').animate({
				scrollTop: $target.offset().top
			}, 2000);
	});

	/**
	* Form validate
	*/
	(function() {
		var $form = $('#form'),
			$inputs = $('input[type="text"],textarea', $form),
			$submit = $('button[type="submit"]', $form);

			$form.validate({
				rules: {
					email: {
						required: true,
						email: true
					}
				},
				errorPlacement: function(error,element) {
					return true;
				}
			});

			$inputs.on('keyup blur', function () { // fires on every keyup & blur
				if ($form.valid()) {                   // checks form for validity
					$submit.prop('disabled', false);        // enables button
				} else {
					$submit.prop('disabled', 'disabled');   // disables button
				}
			});

	}());
});

