
if (es3 === undefined)
{
	var es3	= {};
}

var IS_TOUCH_DEVICE	= !!('ontouchstart' in window || window.navigator.msMaxTouchPoints);
var TOUCHEVENT		= IS_TOUCH_DEVICE ? 'touchend' : 'click';

es3.app = (function ()
{
	'use strict';

	var SCENES		= es3.configuration.SCENES;
	var DATA_ID		= 'ES3+KU/';
	var NOT_STARTED	= 0;
	var STARTED		= 1;
	var COMPLETED	= 2;

	var self					= {};
	var sceneStates				= {};
	var bookmarks				= {};
	var dirty					= false;
	var currentSceneId			= null;
	var newSceneId				= null;
	var currentSceneObj			= null;
	var newSceneObj				= null;
	var pulseHandle				= null;
	var sceneIndex				= -1;
	var testQuestionResults		= {};
	var firstTestQuestionIndex	= -1;
	var lastTestQuestionIndex	= -1;
	var questionCount			= 0;
	var currentOverlay			= null;
	var lastButtonClicked		= '';
	var selectedMenuButtons		= [];
	var reviewIncorrectQuestions= [];
	var $sceneContainer;
	var $homeButton;
	var $menuButton;
	var $glossary;
	var $resources;
	var $help;
	var $exit;
	var $nextButton;
	var $backButton;
	var $replayButton;
	var $pauseButton;
	var $ccButton;
	var $muteButton;
	var $topicProgressBar;
	var $courseProgressBar;
	var courseProgressAmount;
	var courseProgressMaxWidth;
	var topicProgressMaxWidth;
	var sceneIdDisplay;
	var footer;
	var banner;
	var courseInfo;
	var breadcrumb;
	var ccContainer;

	var initialize = function()
	{
		initializeVariables();
		initializeDisplay();
		initializeSCORM();
		initializeTest();
		initializeSceneStates();
		initializeDebugDisplay();
		initializeKeys();
		loadBookmarks();
		initializeHeader();
		initializeFooter();
		initializeSound(loadStartPage);
	};

	var initializeVariables = function()
	{
		$sceneContainer			= $('#sceneContainer');
		$homeButton				= $('#homeButton');
		$menuButton				= $('#menuButton');
		$glossary               = $('#glossaryButton');
		$resources              = $('#resourcesButton');
		$help                   = $('#helpButton');
		$exit                   = $('#exitButton');
		$nextButton				= $('#nextButton');
		$backButton				= $('#backButton');
		$replayButton			= $('#replayButton');
		$pauseButton			= $('#pauseButton');
		$ccButton               = $('#ccButton');
		$muteButton             = $('#muteButton');
		$topicProgressBar		= $('#topicProgressBar');
		$courseProgressBar		= $('#courseProgressFill');
		courseProgressAmount	= document.getElementById('courseProgressPercent');
		courseProgressMaxWidth	= $('#courseProgress').width();
		topicProgressMaxWidth	= $('#topicProgress').width();
		sceneIdDisplay			= document.getElementById('sceneId');
		footer					= document.getElementsByTagName('footer')[0];
		banner					= document.getElementsByTagName('header')[0];
		courseInfo				= document.getElementById('courseInfo');
		breadcrumb				= document.getElementById('breadcrumb');
		ccContainer				= document.getElementById('ccContainer');
	};

	var initializeSCORM = function()
	{
		if (!pipwerks.SCORM.init())
			return;

		pipwerks.SCORM.handleExitMode = false;
		pipwerks.SCORM.set('cmi.core.exit', 'suspend');
		pipwerks.SCORM.save();
	};

	var initializeDisplay = function()
	{
		var courseCode = document.getElementById('bannerCourseCode');
		courseCode.innerHTML = es3.configuration.COURSE_CODE;
	};

	var initializeSceneStates = function()
	{
		for (var i = SCENES.length - 1; i >= 0; --i)
		{
			sceneStates[SCENES[i]] = NOT_STARTED;
		}
	};

	var initializeDebugDisplay = function()
	{
		if (location.search.indexOf('debug=true') >= 0)
		{
			es3.configuration.SHOW_SCENE_ID	= true;
			es3.configuration.DEBUG_MODE	= true;
		}

		if (es3.configuration.SHOW_SCENE_ID)
		{
			sceneIdDisplay.style.display = 'block';
		}
	};

	var initializeKeys = function()
	{
		$(document).on('keyup', function(event){
			switch(event.keyCode)
			{
				case 32:	// space bar -- play/pause scene
					if ($pauseButton.hasClass('active'))
						pauseButtonHandler();
					break;
				case 36:    // home button
					if ($homeButton.hasClass('active'))
						homeButtonHandler();
					break;
				case 37:	// left arrow -- previous scene
					if ($backButton.hasClass('active'))
						backButtonHandler();
					break;
				case 38:	// up arrow -- replay scene
					if ($replayButton.hasClass('active'))
						replayButtonHandler();
					break;
				case 39:	// right arrow -- next scene
					if ($nextButton.hasClass('active'))
						nextButtonHandler();
					break;
				case 67:	// character c -- toggle closed caption
					if ($ccButton.hasClass('active'))
						toggleCC();
					break;
				case 70:	// character f -- toggle full screen
					toggleFullscreen();
					break;
				case 77:	// character m -- toggle menu page
					if ($menuButton.hasClass('active'))
						menuButtonHandler();
					break;
				case 27:	// esc key - exit panel
					showOverlayPanel('#exitPanel');
					break;
				case 72:	// h key - help panel
					showOverlayPanel('#helpPanel');
					break;
				case 71:	// g key - glossary panel
					showOverlayPanel('#glossaryPanel');
					break;
				case 82:	// r key - resources panel
					showOverlayPanel('#resourcesPanel');
					break;
				case 86:	// character v -- toggle mute
					if ($muteButton.hasClass('active'))
						toggleMute();
					break;
			}
		});
	};

	var initializeHeader = function()
	{
		$glossary.on(TOUCHEVENT, showOverlayPanel.bind(self, '#glossaryPanel'));
		$help.on(TOUCHEVENT, showOverlayPanel.bind(self, '#helpPanel'));
		$resources.on(TOUCHEVENT, showOverlayPanel.bind(self, '#resourcesPanel'));
		$exit.on(TOUCHEVENT, showOverlayPanel.bind(self, '#exitPanel'));
		$homeButton.on(TOUCHEVENT, homeButtonHandler);
		$('.overlayClose').on(TOUCHEVENT, closeOverlayPanel);
		$('#exitNoIcon').on(TOUCHEVENT, closeOverlayPanel);
		$('#exitYesIcon').one(TOUCHEVENT, exitCourse);
		$('#resource1').on(TOUCHEVENT, openResourceDocument.bind(self,'Kia_CPO_Customer_Brochure'));
		$('#resource2').on(TOUCHEVENT, openResourceDocument.bind(self,'Kia_CPO_Window_Sticker'));
		$('#resource3').on(TOUCHEVENT, openResourceDocument.bind(self,'Kia_CPO_Best_Practices'));
	};

	var initializeFooter = function()
	{
		var isIPad = navigator.platform.indexOf("iPad") != -1;

		if (isIPad)
		{
			$muteButton.css('display', 'none');
		}

		if (document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullscreen)
		{
			$('#fullScreenButton').on(TOUCHEVENT, toggleFullscreen);
		}
		else
		{
			$('#fullScreenButton').css('display', 'none');
		}
	};

	var initializeTest = function()
	{
		testQuestionResults		= {};
		firstTestQuestionIndex	= SCENES.indexOf(es3.configuration.FIRST_TEST_QUESTION);
		lastTestQuestionIndex	= SCENES.indexOf(es3.configuration.LAST_TEST_QUESTION);
		questionCount			= lastTestQuestionIndex + 1 - firstTestQuestionIndex;

		if (!es3.configuration.DEBUG_MODE)
		{
			shuffleArray(SCENES, firstTestQuestionIndex, lastTestQuestionIndex);
			removeUnusedQuestions();
			questionCount = es3.configuration.QUESTIONS_TO_PRESENT;
		}
	};

	var initializeSound = function(callback)
	{
		es3.sound.initialize(callback);
		es3.sound.addOnLoad(enablePause);
		es3.sound.addOnUnload(disablePause);
	};

	var shuffleArray = function (array, startIndex, endIndex)
	{
		startIndex	= startIndex || 0;
		endIndex	= endIndex || (array.length - 1);
		var range	= endIndex + 1 - startIndex;

		for (var i = endIndex; i > startIndex; --i)
		{
			var j	= startIndex + Math.floor(Math.random() * range);
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}

		return array;
	};

	var removeUnusedQuestions = function()
	{
		var firstIndexToRemove	= firstTestQuestionIndex - 1 + es3.configuration.QUESTIONS_TO_PRESENT;
		var count				= lastTestQuestionIndex - firstIndexToRemove;

		SCENES.splice(firstIndexToRemove, count);
	};

	var loadBookmarks = function()
	{
		var dataString = pipwerks.SCORM.get('cmi.suspend_data');

		if (dataString === undefined || dataString == 'undefined' || dataString == 'null' || dataString.substr(0, DATA_ID.length) !== DATA_ID)
			return;

		dataString = dataString.substr(DATA_ID.length).replace(/\(\=/g, '[').replace(/\=\)/g, ']');

		try {
			var saveData	= JSON.parse(dataString);
			dirty			= false;
			sceneStates		= saveData.s;
			bookmarks		= saveData.b;
		} catch(e) {
			// unable to parse JSON
		}

		updateCourseProgress(0);
	};

	var saveBookmarks = function()
	{
		log('saveBookmarks: dirty=' + dirty);

		if (dirty)
		{
			var saveObject	= {s:sceneStates, b:bookmarks};
			var saveString	= JSON.stringify(saveObject);

			saveString = saveString.replace(/\[/g, '(=').replace(/\]/g, '=)');

			var success = pipwerks.SCORM.set('cmi.suspend_data', DATA_ID + saveString);
			pipwerks.SCORM.save();

			dirty = !success;
		}
	};

	var exitCourse = function()
	{
		saveBookmarks();
		pipwerks.SCORM.save();
		pipwerks.SCORM.quit();
		window.top.close();
	};

	var openResourceDocument = function(resource)
	{
		window.open('documents/'+resource+'.pdf');
	};

	var updateProgress = function()
	{
		if (sceneIndex > -1)
		{
			updateTopicProgress();
			updateCourseProgress();
		}
	};

	var updateCourseProgress = function(duration)
	{
		var progress	= getCourseProgress();
		var newLength	= Math.floor(progress * courseProgressMaxWidth + 0.5);

		//log('updateCourseProgress: progress=' + progress + ' newLength=' + newLength );

		if ($courseProgressBar.width() != newLength)
		{
			var actualDuration	= duration === undefined ? 0.5 : duration;
			var percent			= Math.floor(progress * 100 + 0.5);

			TweenMax.to($courseProgressBar[0], actualDuration, {width:newLength});
			courseProgressAmount.innerHTML = percent + '%';
		}
	};

	var getCourseProgress = function()
	{
		var total	= 0;
		var count	= 0;

		for (var i = 0; i < firstTestQuestionIndex; ++i)
		{
			var id = SCENES[i];
			total += sceneStates[id] === undefined ? 0 : sceneStates[id];
			++count;
		}

		return total / (count * COMPLETED);
	};

	// Returns the topic ID for the given scene ID
	var getTopic = function(sceneId)
	{
		for (var key in es3.configuration.TOPICS)
		{
			if (sceneId.substr(0, key.length) === key)
			{
				return key;
			}
		}

		return null;
	};

	var updateTopicProgress = function()
	{
		var topic		= getTopic(currentSceneId);
		var progress	= getAverageState(topic) / COMPLETED;
		var oldLength	= $topicProgressBar.width();
		var newLength	= Math.floor(progress * topicProgressMaxWidth + 0.5);

		//log('updateTopicProgress: topic=' + topic);
		//log(' getAverageState=' + getAverageState(topic) + ' progress=' + progress + ' oldLength=' + oldLength + ' newLength=' + newLength);

		if (newLength > oldLength)
		{
			TweenMax.to($topicProgressBar[0], 0.5, {width:newLength});
		}
		else if (newLength < oldLength)
		{
			$topicProgressBar.css('width', newLength + 'px');
		}
	};

	var getAverageState = function(prefix)
	{
		if (!prefix)
			return;

		var total			= 0;
		var count			= 0;
		var prefixLength	= prefix.length;

		for (var i = SCENES.length - 1; i >= 0; --i)
		{
			var sceneId = SCENES[i];

			if (sceneId.substr(0, prefixLength) === prefix)
			{
				var state = sceneStates[sceneId] || 0;
				total += state;
				++count;
			}
		}

		return count === 0 ? 0 : (total / count);
	};

	var gotoScene = function (sceneId)
	{
		log('gotoScene ' + sceneId);

		stopCurrentScene();
		disableNavButtons();
		es3.sound.play(sceneId);

		var index = SCENES.indexOf(sceneId);

		if (index >= 0)
			sceneIndex = index;

		loadScene(sceneId);
	};

	var loadScene = function (sceneId)
	{
		log('loadScene ' + sceneId);
		//stopCurrentScene();
		setCC('');
		newSceneId = sceneId;
		log('ajax ' + 'scenes/' + sceneId + '.html');

		$.ajax({
			url:'scenes/' + sceneId + '.html',
			success:ajaxComplete,
			dataType:'text'
			});
	};

	var ajaxComplete = function(data, textStatus, jqXHR)
	{
		log('ajaxComplete ' + textStatus);

		if (currentSceneId !== null && currentSceneId === newSceneId)
		{
			// special case: we're loading the same scene that's already loaded,
			// so just destroy the old copy
			removeOldScene();
		}

		var scene = '<div id="scene' + newSceneId + '">' + data + '</div>';
		$sceneContainer.append(scene);
	};

	var stopCurrentScene = function()
	{
		log('stopCurrentScene ' + currentSceneId);

		if (currentSceneId)
		{
			disableNavButtons();
			es3.sound.unload();
			TweenMax.killChildTweensOf(currentSceneObj.$html[0]);
		}
	};

	var reloadScene = function()
	{
		gotoScene(SCENES[sceneIndex]);
	};

	var previousScene = function()
	{
		if (sceneIndex > 0)
		{
			--sceneIndex;
			gotoScene(SCENES[sceneIndex]);
		}
	};

	var nextScene = function()
	{
		if (sceneIndex + 1 < SCENES.length)
		{
			++sceneIndex;
			gotoScene(SCENES[sceneIndex]);
		}
	};

	var preloadComplete = function()
	{
		log('preloadComplete ' + newSceneObj.id);
		newSceneObj.load();
		showNewScene();
	};

	var setSceneObject = function (sceneObj)
	{
		console.log('setSceneObj ' + newSceneId);

		newSceneObj			= sceneObj;
		newSceneObj.id		= newSceneId;
		newSceneObj.$html	= $('#scene' + newSceneId);

		newSceneObj.preload(preloadComplete);
	};

	var loadStartPage = function()
	{
		gotoScene(es3.configuration.START_SCENE);
	};

	var showNewScene = function()
	{
		log('showNewScene ' + newSceneId);

		if (currentSceneId)
		{
			TweenMax.to(currentSceneObj.$html, 0.8, {autoAlpha:0, ease:Power4.easeOut});
		}

		TweenMax.to(newSceneObj.$html, 0.8, {autoAlpha:1, ease:Power4.easeOut, onComplete:showSceneComplete});

		setCourseInfoVisibility(newSceneObj);
		setBannerVisibility(newSceneObj);
		setFooterVisibility(newSceneObj);
		updateBreadcrumb(newSceneId);
		sceneIdDisplay.innerHTML = newSceneId;
	};

	var showSceneComplete = function()
	{
		removeOldScene();

		currentSceneId	= newSceneId;
		currentSceneObj	= newSceneObj;
		newSceneId		= null;
		newSceneObj		= null;

		if (currentSceneObj)
		{
			setSceneState(currentSceneId, STARTED);

			currentSceneObj.initialize();
			currentSceneObj.start();
		}

		enableNavButtonsForScene();
	};

	var removeOldScene = function()
	{
		if (currentSceneObj && currentSceneObj.dispose)
		{
			currentSceneObj.dispose();
		}

		if (currentSceneId)
		{
			currentSceneObj.$html.remove();
		}

		currentSceneObj	= null;
		currentSceneId	= null;
	};

	var replayButtonHandler = function()
	{
		reloadScene();
	};

	var menuButtonHandler = function()
	{
		lastButtonClicked = 'menu';
		gotoScene('menu');
	};

	var homeButtonHandler = function()
	{
		if (currentOverlay !== null)
		{
			closeOverlayPanel();
			$('nav a').removeClass('active');
			hideModal();
		}

		hideCC();
		lastButtonClicked = 'home';
		gotoScene('menu');
	};

	var toggleCC = function()
	{
		var visibility	= getComputedStyle(ccContainer).visibility;
		var isVisible	= visibility !== 'hidden';

		TweenMax.to(ccContainer, 0.2, {autoAlpha:(isVisible ? 0 : 1), overwrite:1});
	};

	var hideCC = function()
	{
		TweenMax.to(ccContainer, 0.2, {autoAlpha:0, overwrite:1});
	};

	var setCC = function (text)
	{
		ccContainer.innerHTML = text;
	};

	var toggleFullscreen = function()
	{
		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement)
		{
			if (document.documentElement.requestFullscreen)
			{
				document.documentElement.requestFullscreen();
			}
			else if (document.documentElement.mozRequestFullScreen)
			{
				document.documentElement.mozRequestFullScreen();
			}
			else if (document.documentElement.webkitRequestFullscreen)
			{
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}
		else
		{
			if (document.cancelFullScreen)
			{
				document.cancelFullScreen();
			}
			else if (document.mozCancelFullScreen)
			{
				document.mozCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen)
			{
				document.webkitCancelFullScreen();
			}
		}
	};

	var pauseButtonHandler = function()
	{
		$pauseButton.toggleClass('paused');

		if ($pauseButton.hasClass('paused'))
		{
			es3.sound.pause();
		}
		else
		{
			es3.sound.resume();
		}
	};

	var nextButtonHandler = function()
	{
		stopPulse();

		if (currentSceneObj.onNext)
		{
			currentSceneObj.onNext();
		}
		else
		{
			nextScene();
		}
	};

	var backButtonHandler = function()
	{
		if (currentSceneObj.onBack)
		{
			currentSceneObj.onBack();
		}
		else
		{
			previousScene();
		}
	};

	var toggleMute = function()
	{
		if ($muteButton.hasClass('muted'))
		{
			es3.sound.unmute();
			$muteButton.removeClass('muted');
		}
		else
		{
			es3.sound.mute();
			$muteButton.addClass('muted');
		}
	};

	var enablePause = function()
	{
		console.log('es3.app.enablePause');
		if (!$pauseButton.hasClass('active'))
			$pauseButton.removeClass('paused').addClass('active').on(TOUCHEVENT, pauseButtonHandler);
	};

	var disablePause = function()
	{
		log('es3.app.disablePause');
		$pauseButton.off(TOUCHEVENT).removeClass('paused active');
	};

	var enableReplay = function()
	{
		if (!$replayButton.hasClass('active'))
			$replayButton.addClass('active').on(TOUCHEVENT, replayButtonHandler);
	};

	var disableReplay = function()
	{
		$replayButton.removeClass('active').off(TOUCHEVENT);
	};

	var enableMute = function()
	{
		$muteButton.addClass('active').off(TOUCHEVENT).on(TOUCHEVENT, toggleMute);
	};

	var disableMute = function()
	{
		$muteButton.removeClass('active').off(TOUCHEVENT);
	};

	var enableMenu = function()
	{
		if (!$menuButton.hasClass('active'))
			$menuButton.addClass('active').off(TOUCHEVENT).on(TOUCHEVENT, menuButtonHandler);
	};

	var disableMenu = function()
	{
		$menuButton.removeClass('active').off(TOUCHEVENT);
	};

	var enableHome = function()
	{
		if (!$homeButton.hasClass('active'))
			$homeButton.addClass('active').off(TOUCHEVENT).on(TOUCHEVENT, homeButtonHandler);
	};

	var disableHome = function()
	{
		$homeButton.removeClass('active').off(TOUCHEVENT);
	};

	var enableCC = function()
	{
		$ccButton.addClass('active').off(TOUCHEVENT).on(TOUCHEVENT, toggleCC);
	};

	var disableCC = function()
	{
		$ccButton.removeClass('active').off(TOUCHEVENT);
	};

	var disableNavButtons = function()
	{
		stopPulse();
		disableNext();
		disablePause();
		disableBack();
		disableReplay();
		disableMenu();
		disableHome();
		disableCC();
	};

	var enableNext = function()
	{
		if (sceneIndex + 1 < SCENES.length && !$nextButton.hasClass('active'))
		{
			$nextButton.addClass('active').one(TOUCHEVENT, nextButtonHandler);
		}
	};

	var disableNext = function()
	{
		stopPulse();
		$nextButton.off(TOUCHEVENT).removeClass('active');
	};

	var enableBack = function()
	{
		if (sceneIndex > 0 && !$backButton.hasClass('active'))
		{
			$backButton.addClass('active').one(TOUCHEVENT, backButtonHandler);
		}
	};

	var disableBack = function()
	{
		$backButton.off(TOUCHEVENT).removeClass('active');
	};

	var togglePulse = function()
	{
		$nextButton.toggleClass('pulse');
	};

	var stopPulse = function()
	{
		if (pulseHandle !== null)
		{
			clearInterval(pulseHandle);
			pulseHandle = null;
			$nextButton.removeClass('pulse');
		}
	};

	var pulseNext = function()
	{
		this.enableNext();

		if (pulseHandle === null && sceneIndex + 1 < SCENES.length)
		{
			$nextButton.addClass('pulse');
			pulseHandle = setInterval(togglePulse, 300);
		}
	};

	var enableNavButtonsForScene = function()
	{
		if	(currentSceneObj.disableNext !== true && (es3.configuration.DEBUG_MODE || currentSceneObj.isComplete))
		{
			enableNext();
		}

		if (sceneIndex > 0 && currentSceneObj.disableBack !== true)
		{
			enableBack();
		}

		if (firstTestQuestionIndex == -1 || sceneIndex < firstTestQuestionIndex)
		{
			enableHome();
			enableMenu();
			enableMute();
			enableCC();
		}
		else
		{
			disableHome();
			disableMenu();
			disableMute();
			disableCC();
			hideCC();
		}

		if (!currentSceneObj.disableReplay)
		{
			enableReplay();
		}
	};

	var setBannerVisibility = function(sceneObj)
	{
		setVisibility(banner, sceneObj.displayBanner === true);
	};

	var setCourseInfoVisibility = function(sceneObj)
	{
		setVisibility(courseInfo, sceneObj.displayCourseInfo === true);
	};

	var setFooterVisibility = function(sceneObj)
	{
		setVisibility(footer, sceneObj.displayFooter === true);
	};

	var setVisibility = function(elem, shouldBeVisible)
	{
		var visibility	= window.getComputedStyle(elem).visibility;
		var isVisible	= visibility !== 'hidden';

		if (shouldBeVisible != isVisible)
		{
			TweenMax.to(elem, 0.5, {autoAlpha:shouldBeVisible ? 1 : 0});
		}
	};

	var updateBreadcrumb = function(sceneId)
	{
		var topic = getTopic(sceneId);

		if (topic)
		{
			breadcrumb.innerHTML = es3.configuration.TOPICS[topic];
		}
	};

	var getSceneState = function(sceneId)
	{
		return sceneStates[sceneId];
	};

	var setSceneState = function(sceneId, state)
	{
		log('App.setSceneState ' + sceneId + '->' + state);

		if ((state === NOT_STARTED || state === STARTED || state === COMPLETED) &&
			(sceneStates[sceneId] === undefined || state > sceneStates[sceneId]))
		{
			sceneStates[sceneId]	= state;
			dirty					= true;
			//traceSceneStates();
		}

		updateProgress();
	};

	var traceSceneStates = function()
	{
		var states = [];

		for (var i in sceneStates)
		{
			states.push(i + ':' + sceneStates[i]);
		}

		log('es3.app.traceSceneStates:');
		log(states.join(','));
	};

	var getBookmark = function(id)
	{
		return bookmarks[id];
	};

	var setBookmark = function(id, value)
	{
		if (bookmarks[id] !== value)
		{
			bookmarks[id]	= value;
			dirty			= true;
		}
	};

	var markSceneComplete = function()
	{
		log('es3.app.markSceneComplete ' + currentSceneId);
		setSceneState(currentSceneId, COMPLETED);
		saveBookmarks();
	};

	var clearTestQuestionResults = function()
	{
		testQuestionResults	= {};
	};

	var setTestQuestionResult = function(isCorrect, statement, source)
	{
		log('setTestQuestionResult ' + currentSceneId + '=' + isCorrect);
		testQuestionResults[currentSceneId] = isCorrect;

		if (!isCorrect)
		{
			var incorrectAnswer = {
				source:source,
				sceneStatement:statement
			};

			reviewIncorrectQuestions.push( incorrectAnswer );
		}
	};

	var getCorrectCount = function()
	{
		var count = 0;

		for (var id in testQuestionResults)
		{
			if (testQuestionResults[id] === true)
				++count;
		}

		return count;
	};

	var getTestScore = function()
	{
		var correctCount	= getCorrectCount();
		var score			= Math.floor(correctCount * 100 / questionCount);

		//log('getTestScore questionCount=' + questionCount + ' correct=' + correctCount + ' score=' + score);
		return score;
	};

	var getIncorrectQuestions = function()
	{
		return reviewIncorrectQuestions;
	};

	var showDisclaimers = function()
	{
		showOverlayPanel('#disclaimersPanel');
	};

	var showOverlayPanel = function(selector)
	{
		if (currentOverlay === selector)
		{
			closeOverlayPanel();
		}
		else
		{
			hideOverlayPanel();
			showModal();

			var $panel			= $(selector);
			var panelWidth		= $panel.width();
			var panelPadding	= 60;
			var panelLeft		= Math.floor((1020 - (panelWidth + panelPadding)) / 2);

			TweenMax.to($panel[0], 0.3, {autoAlpha:1, left:panelLeft});
			currentOverlay = selector;
		}
	};

	var hideOverlayPanel = function()
	{
		if (currentOverlay)
		{
			TweenMax.to(currentOverlay, 0.3, {autoAlpha:0, left:1020});
		}

		currentOverlay = null;
	};

	var closeOverlayPanel = function()
	{
		hideOverlayPanel();
		hideModal();
	};

	var showModal = function()
	{
		TweenMax.to('#modal', 0.3, {autoAlpha:1});
	};

	var hideModal = function()
	{
		TweenMax.to('#modal', 0.3, {autoAlpha:0});
	};

	/*
	var getSceneStates = function()
	{
		return sceneStates;
	};
	*/

	var log = function(msg)
	{
		if (es3.configuration.DEBUG_MODE && window.console)
			console.log(msg);
	};

	// Public interface

	self.initialize			= initialize;
	self.gotoScene			= gotoScene;
	self.nextScene			= nextScene;
	self.previousScene		= previousScene;
	self.setSceneObject		= setSceneObject;
	self.log				= log;
	self.getAverageState	= getAverageState;
	self.getBookmark		= getBookmark;
	self.setBookmark		= setBookmark;
	self.enablePause		= enablePause;
	self.disablePause		= disablePause;
	self.enableReplay		= enableReplay;
	self.disableReplay		= disableReplay;
	self.enableMenu			= enableMenu;
	self.disableMenu		= disableMenu;
	self.enableBack			= enableBack;
	self.disableBack		= disableBack;
	self.enableNext			= enableNext;
	self.disableNext		= disableNext;
	self.pulseNext			= pulseNext;
	self.stopPulse			= stopPulse;
	self.getSceneState		= getSceneState;
	self.setSceneState		= setSceneState;
	self.getAverageState	= getAverageState;
	self.markSceneComplete	= markSceneComplete;
	self.getTestScore		= getTestScore;
	self.showDisclaimers	= showDisclaimers;
	self.setCC				= setCC;
	self.setTestQuestionResult		= setTestQuestionResult;
	self.clearTestQuestionResults	= clearTestQuestionResults;
	self.getIncorrectQuestions	= getIncorrectQuestions;

	self.NOT_STARTED		= NOT_STARTED;
	self.STARTED			= STARTED;
	self.COMPLETED			= COMPLETED;

	return self;
})();

$(document).ready(function(){
	window.onbeforeunload	= function(event) { pipwerks.SCORM.save(); pipwerks.SCORM.quit(); return; };
	window.onunload			= function(event) { pipwerks.SCORM.quit(); };
	window.onorientationchange	= function(event) { alert('This course must be viewed in landscape'); event.preventDefault(); return false; };
	es3.app.initialize();
});
