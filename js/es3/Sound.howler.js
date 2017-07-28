es3.sound = {

	name:'es3.sound',
	self:this,
	sound:null,
	soundid:null,
	cues:[],
	timerHandle:null,
	onCompleteCallbacks:[],

	initialize:function()
	{
	},

	onCompleteHandler:function()
	{
		var callbacks = this.onCompleteCallbacks;

		this.unload();

		var count = callbacks.length;

		for (var i = 0; i < count; ++i)
		{
			if (callbacks[i])
			{
				callbacks[i]();
			}
		}
	},

	onComplete:function(callback)
	{
		this.onCompleteCallbacks.push(callback);
	},

	onPlayHandler:function()
	{
		es3.app.enablePause();
	},

	play:function(id, callback)
	{
		//es3.app.log('es3.sound.play ' + id);
		this.unload();
		this.soundid	= id;
		var soundfile	= 'audio/' + id;
		var self		= this;

		this.sound = new Howl({
			urls: [soundfile + '.mp3'],
			buffer:true,	// Play via HTML audio for large files so we don't have to wait for them to download
			volume:1.0,
			onend: this.onCompleteHandler.bind(this)
			});

		this.sound.play(undefined, this.onPlayHandler.bind(this) );

		if (callback)
		{
			this.onComplete(callback);
		}
	},

	clearCallbacks:function()
	{
		this.onCompleteCallbacks = [];
	},

	pause:function()
	{
		if (this.sound)
		{
			this.sound.pause();
		}
	},

	resume:function()
	{
		if (this.sound)
		{
			this.sound.play();
		}
	},

	mute:function()
	{
		if (this.sound)
		{
			this.sound.mute();
		}
	},

	unmute:function()
	{
		if (this.sound)
		{
			this.sound.unmute();
		}
	},

	stop:function()
	{
		if (this.sound)
		{
			this.sound.stop();
		}
	},

	at:function(time, callback, data)
	{
		if (!this.sound)
			return;

		if (callback && this.sound.pos() >= time)
		{
			callback(data);
			return;
		}

		this.cues.push({time:time, handler:callback, data:data});
		this.startTimer();
	},

	timerHandler:function()
	{
		if (!this.sound)
			return;

		var i	= 0;
		var pos	= this.sound.pos();

		while (i < this.cues.length)
		{
			var cue = this.cues[i];

			if (pos >= cue.time)
			{
				cue.handler(cue.data);
				this.cues.splice(i, 1);
			}
			else
			{
				++i;
			}
		}

		if (this.cues.length === 0)
		{
			this.stopTimer();
		}
	},

	startTimer:function()
	{
		if (this.timerHandle === null)
		{
			this.timerHandle = setInterval(this.timerHandler.bind(this), 200);
		}
	},

	stopTimer:function()
	{
		if (this.timerHandle)
		{
			clearInterval(this.timerHandle);
			this.timerHandle = null;
		}
	},

	unload:function()
	{
		es3.app.disablePause();

		this.stopTimer();
		this.onCompleteCallbacks	= [];
		this.cues					= [];

		if (this.sound)
		{
			this.sound.stop();
			this.sound		= null;
			this.soundid	= null;
		}
	}

};
