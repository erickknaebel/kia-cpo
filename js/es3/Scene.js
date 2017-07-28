es3.Scene = function()
{
	this.name				= 'es3.Scene';
	this.currentCueScope	= '';
	this.scopedCues			= {};
};

es3.Scene.prototype = new es3.SilentScene();
es3.Scene.prototype.constructor = es3.Scene;

es3.Scene.prototype.initialize = function()
{
	if (this.onInitialize)
	{
		this.onInitialize();
	}

	this.findCues();
	this.findClosedCaptions();
	es3.sound.addOnComplete(this.soundEndHandler.bind(this));
};

es3.Scene.prototype.play = function(soundFile, onCompleteHandler)
{
	es3.sound.play(soundFile, onCompleteHandler);
	this.setCueScope(soundFile);
	this.loadCC(soundFile);
};

es3.Scene.prototype.cueInHandler = function(elem)
{
	var transitionMethod = this.getTransitionMethod(elem);

	if (transitionMethod !== null)
	{
		transitionMethod(elem, 'in');
	}
};

es3.Scene.prototype.cueOutHandler = function(elem)
{
	var transitionMethod = this.getTransitionMethod(elem);

	if (transitionMethod !== null)
	{
		transitionMethod(elem, 'out');
	}
};

es3.Scene.prototype.getTransitionMethod = function(elem)
{
	var transition = elem.getAttribute('data-transition');

	if (transition !== null && this[transition])
	{
		return this[transition];
	}

	return this.fade;
};

es3.Scene.prototype.fade = function(elem, inOrOut)
{
	TweenMax.to(elem, 0.5, {
		autoAlpha: inOrOut === 'in' ? 1 : 0,
		overwrite: 1
		});
};

es3.Scene.prototype.addCue = function(elem, attr)
{
	var attrValues	= elem.getAttribute(attr).split(':');
	var time		= parseFloat(attrValues[0]);
	var callback	= attr === 'data-cue' ? this.cueInHandler : this.cueOutHandler;

	if (time >= 0.5)
	{
		// Start visual cues earlier to give the element time to animate on
		// before the corresponding cue point in the audio.
		time -= 0.5;
	}

	if (attrValues.length == 1)
	{
		// There is no cue scope specified
		es3.sound.at(time, callback.bind(this), elem);
	}
	else
	{
		this.saveScopedCue(attrValues[1], time, callback.bind(this), elem);
	}
};

es3.Scene.prototype.saveScopedCue = function(scopeName, time, callback, elem)
{
	if (!this.scopedCues.hasOwnProperty(scopeName))
	{
		this.scopedCues[scopeName] = [];
	}

	this.scopedCues[scopeName].push({time:time, callback:callback, elem:elem});
};

es3.Scene.prototype.setCueScope = function(scopeName)
{
	if (scopeName !== this.currentCueScope && this.scopedCues.hasOwnProperty(scopeName))
	{
		this.currentCueScope = scopeName;

		var cues	= this.scopedCues[scopeName];
		var count	= cues.length;

		for (var i = 0; i < count; ++i)
		{
			var cue = cues[i];
			es3.sound.at(cue.time, cue.callback, cue.elem);
		}
	}
};

es3.Scene.prototype.findCues = function()
{
	var html		= this.$html[0];
	var elements	= html.querySelectorAll('[data-cue]');
	var count		= elements.length;
	var i;
	
	for (i = 0; i < count; ++i)
	{
		this.addCue(elements[i], 'data-cue');
	}

	elements	= html.querySelectorAll('[data-cue-out]');
	count		= elements.length;
	
	for (i = 0; i < count; ++i)
	{
		this.addCue(elements[i], 'data-cue-out');
	}
};

es3.Scene.prototype.findClosedCaptions = function()
{
	this.loadCC(this.id);
};

es3.Scene.prototype.loadCC = function(sceneId)
{
	var text = $('#cc' + sceneId).html();

	if (text)
	{
		var parts = text.split(/\{(\d+\.*\d*)\}/g);
		var count = parts.length;

		es3.app.setCC(parts[0]);

		for (var i = 1; i < count; i += 2)
		{
			es3.sound.at(parts[i] - 0.2, es3.app.setCC.bind(es3.app), parts[i+1]);
		}
	}
	else
	{
		this.clearCC();
	}
};

es3.Scene.prototype.clearCC = function()
{
	es3.app.setCC('');
};

es3.Scene.prototype.resetCuedElements = function(arg)
{
	var $elem;

	if (arg instanceof jQuery)
		$elem = arg;
	else if (arg === undefined)
		$elem = this.$html;
	else if (typeof arg == 'string' || arg instanceof String)
		$elem = $(arg);

	$elem.find('[data-cue-out]').not('[data-cue]').css({visibility:'visible', opacity:'1'});
	$elem.find('[data-cue]').css({visibility:'hidden', opacity:'0'});
};

es3.Scene.prototype.onSoundEnd = function()
{
	this.markComplete();
};

es3.Scene.prototype.soundEndHandler = function()
{
	this.onSoundEnd();
};
