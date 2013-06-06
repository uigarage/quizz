/*
 * Author:	Srini Sekhar
 * Version: 0.1
 * Date:	31/05/2013
 * 
 * Quizz is a JavaScript Based library to generate multiple choice questions and show up results. 
 * Questions are drawn up via external question bank js script and also via Ajax (currently working on it).
 */

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
		levels		= ["basic", "intermediate", "advanced", "ninja", "yoda"],
		levelDesc	= {
			'basic':		'A very basic quiz on this topic for novice',
			'intermediate':	'Fairly above basic level (novice to inter)',
			'advanced':		'Advance questions on this topic better for an experianced hand (mostly training for ninja mode)',
			'ninja':		'A mode where every stroke comes out like magic without even thinking',
			'yoda':			'This is where you attain guru and become zen on this topic. A score of 100% will judge you that you are the master'
		}
	;
	
	function Quizz(options) {
		_instance	= this;
		_instance.uri		= [];
		_instance.topics	= [];
		_instance.level		= [];
		_instance.question	= null;
		_instance.test		= {
			inProgress:	false
		};
		
		_instance.selected	= {
			topic:	'',
			level:	'',
			levelIndex:	0,
			qIndex:	0,
			qSkipped:	[],
			payload:	[],
			totalQuestions: 0
		};
		
		//	Elements / DOM
		elm	= {
			page:			$('.page'),
			topics_menu:	$('#topics_menu'),
			level:			$('#level')
		};
		
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
		var
			markup	= '',
			t	= 0
		;
		
		markup	+=	'<li class="first">Quizz </li>';
				
		//	create mark up for topic nav		
		for( t in _instance.topics ) {
			markup	+=	'<li>'
					+	'<a href="#'+ t +'">' + t + '</a>'
					+	'</li>';
		}

		elm.topics_menu.html( markup );	
		
		//	bind click events for topics menu		
		elm.topics_menu.find('a')
			.bind('click', _instance.menu);
	};
	
	Quizz.prototype.menu	= function(e) {
		log( 'MENU' );
		var
			menu	= $(this),
			_i		= _instance,
			topic,
			proceed	= true;
		;

		e.preventDefault();
		if( _i.test.inProgress ) {
			proceed	= confirm( 'Do you want to terminate this test?' );
		}
		
		if( proceed ) {
			_i.cleanUpAndDefault();
			topic	= menu.attr('href').substring(1);
			_i.showLevels(topic);
			
			_i.uri	= [];
			_i.uri.push(topic);
			
			window.location.hash	= _i.uri.join('|');
		}
		//	DOM related magic happens here
	};
	
	//	Shows levels available on screen
	Quizz.prototype.showLevels	= function(t) {
		var
			_i	= _instance,	//	shortening variables
			_s	=_i.selected	
		;
		log( 'LEVEL' );
		var
			topic,
			level,
			i	= 0,
			llen,
			markup	= ''
		;
		
		//	hide page one
		elm.page
			.eq(0)				//	Hide Page 1 (Main Page)
			.addClass( 'dispnone' );
		
		elm.page
			.eq(1)				//	Show Page 2 (Level Page)
			.removeClass( 'dispnone' );

		

		//	assign the selected topic
		_s.topic	= t;
		
		for( topic in _instance.topics ) {			
			if( topic === t ) {
				llen	= _i.topics[topic].length;

				for( ; i < llen; ) {
					level	= _i.topics[topic][i].level;
					if( _i.topics[topic][i].questions.length > 0) {						
						markup	+= '<li>'
								+ '<h2><a href="#'+level+'" class="level">' + level + '</a></h2>'
								+ '<p>' + levelDesc[level] + '<p>'
								+ '</li>';
					} else {
						markup	+= '<li class="disabled">'
							+ '<h2>' + level + '</h2>'
							+ '<p>' + levelDesc[level] + '<p>'
							+ '</li>';
					}
					i++;
				}
			}	
		}
		
		elm.level.html( markup );
		
		//	bind levels for next step
		//	Ask questions
		elm.level.find('.level')
			.unbind()
			.bind('click', function(e) {
				e.preventDefault();
				
				//	Close the level's page and show the question page
				elm.page
					.eq(1)
					.addClass( 'dispnone' );
				//	Question time.
				//	Start asking questions
				_s.level	= $(this).attr('href').substring(1);
				
				for( var i = 0; i < _i.topics[ _s.topic ].length; i++ ) {
					if(  _i.topics[ _s.topic ][i].level === _s.level ) {
						_s.levelIndex	= i;
						_s.totalQuestions	= _i.topics[ _s.topic ][i].questions.length;
						break;
					}
				}
				log( 'Selected Level ' + _s.level );
				log('START TEST');
				
				_i.prepareQuestionsInDOM();
				
				_i.uri.push( _s.level );
				window.location.hash	= _i.uri.join('|');
			});
	};
	
	//	Prepare Questions in DOM
	Quizz.prototype.prepareQuestionsInDOM	= function() {
		var
			_i	= _instance,
			_s	=_i.selected,
			markup	= '',
			i, ll, j, k,				// 	iterators
			q							//	question
		;
		
		i = ll	= j = k	= 0;
		
		for( ll = _s.totalQuestions ; 
			i < ll; i++ ) {
			q	= _i.topics[ _s.topic ][ _s.levelIndex ].questions[i];
			
			markup	+= 	'<div class="page question ' + ( i > 0 ? 'dispnone' : '') + '">'
			
					//	questions
					+	'<h2>' + q.title + '</h2>'			
					//	Choices
					+	'<ul>';
			for( var
					al = q.anss.length;
					j < al; j++ ) {
				
					markup	+=	'<li>'
							+	''
							+ q.anss[j] 
							+ '</li>';
			}
			j	= 0;
					
			markup	+=	'</ul>'
					//	Buttons
					+	'<div class="buttons">'
					+	'<a href="#prev" class="' + (i === 0 ? 'disable': '') + '">Prev</a>'
					+	'<a href="#next" class="' + (i === (ll-1) ? 'disable': '')+ '">Next</a>'
					+	'</div>'
					//	EO Buttons
					
					+	'</div>';			
		}		
		
		//	Mark if test in progress
		_i.test.inProgress	= true;
		
		//	Add questions markup to page
		elm.page
			.eq(1)
			.after( markup );
		
		//	Bind events
		_i.question	= $( '.question' );
		
		_i.question
			.find( '.buttons a' )
			.unbind()
			.bind( 'click', function(e) {
				e.preventDefault();
				
				var
					el	= $(this),
					href
				;
				
				href	= $(this).attr('href').substring(1);
								
				if( href === 'next' && !el.hasClass('disable') ) {
					//	Show next question
					_i.question
						.eq( _s.qIndex++ )
						.addClass( 'dispnone' );
					
					_i.question.eq( _s.qIndex )
						.removeClass( 'dispnone' );
					
				} else if( href === 'prev' && !el.hasClass('disable') ) {
					//	Show prev question
					_i.question
						.eq( _s.qIndex-- )
						.addClass( 'dispnone' );
				
					_i.question
						.eq( _s.qIndex )
						.removeClass( 'dispnone' );
				}
			});
	};
	
	Quizz.prototype.showQuestion	= function( qNo ) {
		
	};
	
	Quizz.prototype.cleanUpAndDefault	= function() {
		var
			_i	= _instance,
			_s	= _i.selected			
		;

		if( _i.question !== null ) {
			_i.question
				.unbind()
				.remove();
			
			_i.question = null;
			_s.qIndex	= 0;
			
			
		}
	};
	
	//	Digest questions from question bank
	Quizz.prototype.digest	= function() {		
		for( var q in qbank ) {
			//	q	is js/html/php/..... topic names	
			var
				topic,
				t,
				qns		= 0,
				i	= 0,
				questions,
				question,
				level
			;
			
			topic	= qbank[q];
			
			//	Initializing instance topics
			_instance.topics[q]= [];
			
			for( 
				var 
					l = levels.length
				; i < l; i++ ) {
				
				if( typeof _instance.topics[q][i] === 'undefined' ) {
					_instance.topics[q][i]	= {
						'level': levels[i],
						'questions': []
					};
				}
			}
						
			for( t in topic ) {
				questions	= topic[t].questions;
				level		= topic[t].level;

				for( qns in questions ) {					
					for( var 
							inst = 0, 
							l = _instance.topics[q].length; inst < l; inst++ ) {
						
						if( _instance.topics[q][inst].level === level ) {
							_instance.topics[q][inst].questions.push( questions[qns] );
						}
					}
				}
			}
		}
	};
 
})(window,document);

var q	= quizz.init({});
