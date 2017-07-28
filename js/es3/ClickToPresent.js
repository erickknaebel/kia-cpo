es3.ClickToPresent = function() {

	this.name			= 'es3.ClickToPresent';
	this.$currentScene	= null;
	this.$activeButton	= null;
	this.$buttons		= null;
	this.$audioFiles    = null;
	this.$audioIndex    = 0;
};

es3.ClickToPresent.prototype = new es3.Scene();
es3.ClickToPresent.prototype.constructor = es3.ClickToPresent;

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.onLoad = function() {

	this.$buttons = this.$html.find('.button');

	this.updateButtonStates();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.onStart = function() {

	this.enableButtons();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.updateButtonStates = function() {

	for (var i = this.$buttons.length - 1; i >= 0; --i)
	{
		var button		= this.$buttons[i];
		var bookmark	= es3.app.getBookmark(button.id);

		if (bookmark === es3.app.COMPLETED)
		{
			button.className += ' completed';
		}
		else if (bookmark === es3.app.STARTED)
		{
			button.className += ' started';
		}
	}
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.enableButtons = function() {

	this.$buttons.addClass('enabled').on(TOUCHEVENT, this.onButtonClick.bind(this));
};

es3.ClickToPresent.prototype.disableButtons = function() {

	this.$buttons.removeClass('enabled').off(TOUCHEVENT);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.onButtonClick = function(event) {

	var $button	= $(event.currentTarget);
	var sceneId	= $button.attr('data-load-scene');

	this.$audioFiles =  $button.attr('data-audio').split(',');
	this.$audioIndex = 0;
	this.playSceneAudio(this.$audioFiles[this.$audioIndex]);
	this.selectButton($button);
	this.markButtonStarted($button);
	this.showScene(sceneId);

	es3.app.stopPulse();
};

es3.ClickToPresent.prototype.selectButton = function($button) {

	$button.addClass('active');

	if (this.$activeButton)
	{
		this.$activeButton.removeClass('active');
	}

	this.$activeButton = $button;
};

es3.ClickToPresent.prototype.markButtonStarted = function($button) {

	var buttonId	= $button.attr('id');
	var bookmark	= es3.app.getBookmark(buttonId);

	if (bookmark != es3.app.COMPLETED)
	{
		$button.addClass('started');
		es3.app.setBookmark(buttonId, es3.app.STARTED);
	}
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.showScene = function(sceneId)
{
	var $newScene = this.$html.find('.scene' + sceneId);

	this.hidePreviousScene();
	this.resetCuedElements($newScene);

	TweenMax.to($newScene, 0.5, {autoAlpha:1, overwrite:1});

	this.$currentScene = $newScene;

	$('#sceneId').html(sceneId);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.hidePreviousScene = function()
{
	if (this.$currentScene)
		TweenMax.to(this.$currentScene, 0.5, {autoAlpha:0, overwrite:1});
	else
		TweenMax.to(this.$html.find('.intro'), 0.5, {autoAlpha:0, overwrite:1});
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.playSceneAudio = function(sceneId) {

	this.play(sceneId, this.isNextCue.bind(this));
	this.setCueScope(sceneId);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.isNextCue = function() {

	this.$audioIndex++;

	if( this.$audioIndex < this.$audioFiles.length )
		this.play(this.$audioFiles[this.$audioIndex], this.isNextCue.bind(this));
	else
		this.sceneComplete();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.sceneComplete = function() {

	this.$activeButton.removeClass('started active').addClass('completed');
	es3.app.setBookmark(this.$activeButton.attr('id'), es3.app.COMPLETED);

	if (this.areAllScenesComplete())
		this.markComplete();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.onSoundEnd = function()
{
};

//////////////////////////////////////////////////////////////////////////////////////

es3.ClickToPresent.prototype.areAllScenesComplete = function() {

	for (var i = this.$buttons.length - 1; i >= 0; --i)
	{
		var sceneNumber	= this.$buttons[i].id;
		var sceneState	= es3.app.getBookmark(sceneNumber);

		if (sceneState !== es3.app.COMPLETED)
		{
			return false;
		}
	}

	return true;
};

es3.ClickToPresent.prototype.onDispose = function()
{
	this.disableButtons();
};
