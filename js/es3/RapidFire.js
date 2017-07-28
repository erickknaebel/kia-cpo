es3.RapidFire = function()
{
	this.name			= 'es3.RapidFire';
	this.currentScene    = null;
	this.positiveSFX     = null;
	this.negativeSFX     = null;
	this.sceneArray      = null;
	this.sceneIndex      = null;
    this.audioCueIndex   = 0;

};

es3.RapidFire.prototype = new es3.Scene();
es3.RapidFire.prototype.constructor = es3.RapidFire;


/////////////////////////////////////////////////////////////////////////////
// do this in onInitialize, not in the constructor.

es3.RapidFire.prototype.onInitialize = function()
{
	this.sceneArray = $('.scene');
	this.sceneIndex = 0;
	this.getAudioSource();
	this.enableStart();
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.getAudioSource = function()
{
	var soundAttributes  = $('.rapidFireContent');
	this.positiveSFX     = soundAttributes.attr('data-positive-audio');
	this.negativeSFX     = soundAttributes.attr('data-negative-audio');
	this.conclusionAudio = soundAttributes.attr('data-conclusion-audio').split(',');

};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.enableStart = function()
{
	this.$html.find('.scene #start').on(TOUCHEVENT, this.hideInitialScene.bind(this));
};

es3.RapidFire.prototype.disableStart = function()
{
	this.$html.find('.scene #start').off(TOUCHEVENT).removeClass('enabled');
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.hideInitialScene = function()
{
	this.disableStart();

	TweenMax.to(this.sceneArray[this.sceneIndex], 0.3, { autoAlpha:0 });

	this.showNextScene();
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.hideScene = function()
{
	TweenMax.to(this.sceneArray[this.sceneIndex-1], 0.3, {autoAlpha:0});
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.onSoundEnd = function()
{
	// do not mark complete when the sound ends
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.updateSceneIdValue = function()
{
	// If the '#sceneId' is showing in the browser, update the scene number
	var sceneId = this.sceneArray[this.sceneIndex].className.slice(11);
	$('#sceneId').html(sceneId);
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.showNextScene = function()
{
	$('.button').removeClass('incorrect correct');

	this.sceneIndex++;
	this.updateSceneIdValue();
	this.hideScene();
	this.enableButtons();

	if(this.sceneIndex+1 < this.sceneArray.length)
	{
		TweenMax.to(this.sceneArray[this.sceneIndex], 0.3, {autoAlpha:1});

		this.showTitle();
		this.showButtons();
	}
	else
	{
		this.hideTitle();
		this.disableButtons();
		this.hideButtons();
		this.showConclusion();
	}
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.showConclusion = function()
{
	TweenMax.to(this.sceneArray[this.sceneIndex], 0.3, {autoAlpha:1});

	this.play(this.conclusionAudio[this.audioCueIndex], this.playNextCue.bind(this));

};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.playNextCue = function()
{
    this.audioCueIndex++;
    console.log(this.audioCueIndex);

    if( this.conclusionAudio.length > this.audioCueIndex )
        this.play(this.conclusionAudio[this.audioCueIndex], this.playNextCue.bind(this));

    else
        this.onRoutineComplete();
}

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.disableButtons = function()
{
	this.$html.find('#cpo, #new').off(TOUCHEVENT).removeClass('enabled');
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.enableButtons = function()
{
	this.$html.find('#cpo, #new')
		.addClass('enabled')
		.on(TOUCHEVENT, this.onButtonClick.bind(this));
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.onButtonClick = function(event)
{
	this.disableButtons();

	var button		= $(event.currentTarget);
	var buttonId	= button.attr('id');

	if (this.sceneArray[this.sceneIndex].getAttribute('data-correct') === buttonId)
	{
		button.addClass('correct');
		es3.sound.play(this.positiveSFX, this.showNextScene.bind(this));
	}
	else
	{
		button.addClass('incorrect');
		es3.sound.play(this.negativeSFX, this.showNextScene.bind(this));
	}
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.hideButtons = function()
{
	TweenMax.to('.buttons', 0.3, {autoAlpha:0});
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.showButtons = function()
{
	TweenMax.to('.buttons', 0.3, {autoAlpha:1});
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.showTitle = function()
{
	TweenMax.to('.title', 0.3, {autoAlpha:1});
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.hideTitle = function()
{
	TweenMax.to('.title', 0.3, {autoAlpha:0});
};

/////////////////////////////////////////////////////////////////////////////

es3.RapidFire.prototype.onRoutineComplete = function()
{
    this.audioCueIndex = 0;
	this.markComplete();
};

es3.RapidFire.prototype.onDispose = function()
{
	this.disableStart();
	this.disableButtons();
};
