es3.sound = (function()
{
	'use strict';

	var self = {};

	self.name	= 'es3.sound';

	var lastFilename		= '';
	var sound				= null;
	var	isLoaded			= false;
	var isMuted				= false;
	var onCompleteCallbacks	= [];
	var onLoadCallbacks		= [];
	var onUnloadCallbacks	= [];

	var initialize = function(callback)
	{
		soundManager.setup({
			url: 'js/soundmanager/swf/',
			preferFlash: false,
			useHTML5Audio:true,
			onready: function() {
				if (callback)
					callback();
			},
			ontimeout: function() {
				// SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
				es3.app.log('soundmanager timeout');
			}
		});
	};

	var play = function(filename, onCompleteCallback)
	{
		unload();
		
		lastFilename = filename;

		sound = soundManager.createSound({
			url:'audio/' + filename + '.mp3',
			stream:false,
			//autoLoad:true,
			autoPlay:true,
			multiShot: false,
			onload: onLoadHandler,
			//onplay: onPlayHandler,
			onfinish: onCompleteHandler
			});

		if (onCompleteCallback)
		{
			addOnComplete(onCompleteCallback);
		}

		//sound.play();
	};

	var onLoadHandler = function(success)
	{
		console.log('es3.sound.onLoadHandler ' + lastFilename + ' success=' + success);
		isLoaded = success;

		if (success)
		{
			if (isMuted)
				sound.mute();

			dispatch(onLoadCallbacks);
			//sound.onPosition(sound.duration - 500, onCompleteHandler);
		}
	};

	var onCompleteHandler = function()
	{
		var callbacks = onCompleteCallbacks;
		unload();
		dispatch(callbacks);
	};

	var addOnLoad = function(callback)
	{
		if (onLoadCallbacks.indexOf(callback) == -1)
			onLoadCallbacks.push(callback);
	};

	var addOnUnload = function(callback)
	{
		if (onUnloadCallbacks.indexOf(callback) == -1)
			onUnloadCallbacks.push(callback);
	};

	var addOnComplete = function(callback)
	{
		if (onCompleteCallbacks.indexOf(callback) == -1)
			onCompleteCallbacks.push(callback);
	};

	var clearCallbacks = function()
	{
		onCompleteCallbacks = [];
	};

	var pause = function()
	{
		if (sound)
		{
			sound.pause();
		}
	};

	var resume = function()
	{
		if (sound)
		{
			sound.resume();
		}
	};

	var stop = function()
	{
		if (sound)
		{
			sound.stop();
		}
	};

	var mute = function()
	{
		isMuted = true;

		if (sound)
		{
			sound.mute();
		}
	};

	var unmute = function()
	{
		isMuted = false;

		if (sound)
		{
			sound.unmute();
		}
	};

	var at = function(seconds, callback, data)
	{
		if (!sound)
			return;

		sound.onPosition(seconds * 1000, function(position) { callback(data); });
	};

	var unload = function()
	{
		dispatch(onUnloadCallbacks);

		onCompleteCallbacks	= [];
		isLoaded			= false;

		if (sound)
		{
			sound.stop();
			sound.destruct();
			sound	= null;
		}
	};
	
	var dispatch = function(callbacks)
	{
		var count = callbacks.length;

		for (var i = 0; i < count; ++i)
		{
			if (callbacks[i])
			{
				callbacks[i]();
			}
		}
	};

	self.initialize		= initialize;
	self.play			= play;
	self.pause			= pause;
	self.resume			= resume;
	self.stop			= stop;
	self.mute			= mute;
	self.unmute			= unmute;
	self.at				= at;
	self.unload			= unload;
	self.addOnComplete	= addOnComplete;
	self.addOnLoad		= addOnLoad;
	self.addOnUnload	= addOnUnload;

	return self;
})();
