(function(window, document, undefined) {
  'use strict';

	var log	= function(o) {
		if(window.console)
			console.log(o);		
	};
	
	var quizz	= window.quizz = {
		init:	function(options) {
			return new Quizz(options);
		},
		VERSION: '0.1'
	};
	
	var 
		win			= window,
		hasProp		= Object.prototype.hasOwnProperty,
		Math 		= window.Math,
		getStyle	= window.getComputedStyle,
		body,
		documentElement,
		htmlbody,
		_instance,
		elm			= {},
		levels		= ["basic", "intermediate", "advnaced", "ninja", "yoda mode"]
	;
	
	function Quizz(options) {
		_instance	= this;
		_instance.topics	= [];
		_instance.level		= [];
		_instance.questions	= [];
		
		var 
			options	= options || {},
			$w	= $(win)	// window
		;

		htmlbody	= $('html, body');
		
		_instance.digest();	//digest the qbank questions
		
		$w.bind('load', _instance.init);
		
		
		return _instance;
	}
	
	Quizz.prototype.init	= function() {
		
	};
	
	Quizz.prototype.digest	= function() {
		$.each(qbank, function(inx) {
			var
				topics	= $(this),
				i = 0,
				k = 0,
				t = 0,
				q = 0,
				obj	= {}
			;
			
			_instance.topics[inx]= [];
			
			for( ; i < levels.length; i++ ) {
				if( typeof _instance.topics[inx][i] === 'undefined' ) {
					_instance.topics[inx][i]	= {
						'level': levels[i],
						'questions': []
					};
				}
			}

			i = 0;
			for( ; i < topics.length; i++ ) {
				obj	= topics[i];
				log( obj.level );
				for( ; k < levels.length; k++ ) {
					if( obj.level === levels[k] ) {						
						for( ; t < _instance.topics[inx].length; t++ ) {
							if( _instance.topics[inx][t].level ===  obj.level ) {
								for( ; q < obj.questions.length; q++ ) {
									_instance.topics[inx][t].questions.push( obj.questions[q] );
								}
							}
						}
					}
				}
			}
		});
		
		log(_instance.topics);
	};
 
})(window,document);

var q	= quizz.init({});
