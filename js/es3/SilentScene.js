es3.SilentScene = function()
{
	this.id					= null;
	this.$html				= null;
	this.isComplete			= false;
	this.autoAdvance		= false;
	this.disableBack		= false;
	this.disableNext		= false;
	this.disableReplay		= false;
	this.displayBanner		= true;
	this.displayFooter		= true;
	this.displayCourseInfo	= true;
}

es3.SilentScene.prototype.preload = function(callback)
{
	var allImages = this.getImgElements();

	if (Array.isArray(this.imagesToPreload))
	{
		allImages = allImages.concat(this.imagesToPreload);
	}

	if (allImages.length === 0)
	{
		this.preloadComplete(callback);
	}
	else
	{
		TweenMax.to('#loadergif', 0.3, {autoAlpha:1, delay:0.3});

		ImagePreloader(allImages, this.preloadComplete.bind(this, callback) );
	}
};

// returns an array of all <img> elements that don't have a data-preload attribute = "false"
es3.SilentScene.prototype.getImgElements = function()
{
	var nodes	= this.$html[0].getElementsByTagName('img');
	var imgs	= [];

	for (var i = nodes.length - 1; i >= 0; --i)
	{
		if (nodes[i].getAttribute('data-preload') !== 'false')
		{
			imgs.push(nodes[i]);
		}
	}

	return imgs;
};

es3.SilentScene.prototype.preloadComplete = function(callback)
{
	TweenMax.to('#loadergif', 0.2, {autoAlpha:0, overwrite:1});

	if (callback)
		callback();
};

es3.SilentScene.prototype.load = function()
{
	this.isComplete = es3.app.getSceneState(this.id) === es3.app.COMPLETED;

	if (this.onLoad)
	{
		this.onLoad();
	}
};

es3.SilentScene.prototype.initialize = function()
{
	if (this.onInitialize)
	{
		this.onInitialize();
	}
};

es3.SilentScene.prototype.start = function()
{
	if (this.onStart)
	{
		this.onStart();
	}
};

es3.SilentScene.prototype.markComplete = function()
{
	es3.app.log('es3.SilentScene.markComplete ' + this.id);

	this.isComplete = true;
	es3.app.markSceneComplete();

	if (this.autoAdvance)
	{
		es3.app.nextScene();
	}
	else if (this.disableNext !== true)
	{
		es3.app.pulseNext();
	}
};

es3.SilentScene.prototype.dispose = function()
{
	if (this.onDispose)
		this.onDispose();
};
