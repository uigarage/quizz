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
		_instance.topics	= [];
		_instance.level		= [];
		_instance.questions	= [];
		
		_instance.selected	= {
			topic:	'',
			level:	'',
			qIndex:	0,
			qSkipped:	[],
			payload:	[]
		};
		
		//	Elements / DOM
		elm	={
			page:			$('.page'),
			topics_menu:	$('#topics_menu'),
			level:		$('#level')
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
		var
			menu	= $(this),
			topic
		;

		e.preventDefault();
		topic	= menu.attr('href').substring(1);
		_instance.showLevels(topic);
		//	DOM related magic happens here
	};
	
	//	Shows levels available on screen
	Quizz.prototype.showLevels	= function(t) {
		var
			topic,
			level,
			i	= 0,
			llen,
			markup	= ''
		;
		
		//	hide page one
		elm.page
			.eq(0)
			.addClass('dispnone');
		
		//	assign the selected topic
		_instance.selected.topic	= t;
		
		for( topic in _instance.topics ) {			
			if( topic === t ) {
				llen	= _instance.topics[topic].length;

				for( ; i < llen; ) {
					level	= _instance.topics[topic][i].level;
					if( _instance.topics[topic][i].questions.length > 0) {						
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
				elm.level.addClass( 'dispnone' );
				//	Question time.
				//	Start asking questions
				_instance.selected.level	= $(this).attr('href').substring(1);
				
				for( var i = 0; i < _instance.topics[ _instance.selected.topic ].length; i++ ) {
					if(  _instance.topics[ _instance.selected.topic ][i].level === _instance.selected.level ) {
						_instance.selected.payload	=_instance.topics[ _instance.selected.topic ][i].questions;
						break;
					}
				}
				
				_instance.beginTest();
			});
	};
	
	//	Begin test, a loop until test finishes
	Quizz.prototype.beginTest	= function() {
		
		
		_instance.selected.qIndex++;
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
