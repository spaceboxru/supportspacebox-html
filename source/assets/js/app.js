
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
	(function() {
		var $a = $('a[data-target]');

		$(document).on('click','a[data-target]', function(event) {
			event.preventDefault();
			var $target = $("#" + this.getAttribute('data-target'));
			$a.removeClass('active');
			$(this).addClass('active');
			if($target.size())
				$('html, body').animate({
					scrollTop: $target.offset().top
				}, 1500);
		});
	}());

	/**
	* Form validate
	*/
	(function() {
		var $form = $('#form'),
			$inputs = $('input[type="text"],textarea', $form),
			$submit = $('button[type="submit"]', $form),
			$required = $('.feedback__form-required', $form);

			$form.validate({
				rules: {
					phone: {
						required: true
					}
				},
				errorPlacement: function(error,element) {
					return true;
				}
			});

			$inputs.on('keyup blur', function () { // fires on every keyup & blur
				if ($form.valid()) {                   // checks form for validity
					$submit.prop('disabled', false);        // enables button
					$required.addClass('hide');
				} else {
					$submit.prop('disabled', 'disabled');   // disables button
					$required.removeClass('hide');
				}
			});

			$submit.on('click', function() {

				alert("");
				
			});

	}());

});

