es3.VideoScene = function()
{
	this.name	= 'es3.VideoScene';
};

es3.VideoScene.prototype = new es3.Scene();
es3.VideoScene.prototype.constructor = es3.VideoScene;


es3.VideoScene.prototype.hideImageComplete = function()
{
	$('#videoImage').remove();
};

es3.VideoScene.prototype.playVideo = function()
{
	var $video = $('video');

	es3.sound.unload();
	$video.css('display','block').one('ended', $.proxy(this.markComplete, this));
	$video[0].play();

	TweenMax.to('#videoImage', 0.2, {autoAlpha:0, onComplete:this.hideImageComplete, onCompleteScope:this});
};

es3.VideoScene.prototype.enableVideoButton = function()
{
	var self = this;

	$('#videoImage').css('cursor','pointer').one(TOUCHEVENT, $.proxy(self.playVideo, self));
	$('#videoPlayIcon').css('cursor','pointer');
};

es3.VideoScene.prototype.onSoundEnd = function()
{
	// do nothing
};

es3.VideoScene.prototype.onStart = function()
{
	var cueTime = $('#videoPlayIcon').data('cue');

	es3.sound.at(cueTime, this.enableVideoButton.bind(this));
};

es3.VideoScene.prototype.onDispose = function()
{
	var video = $('video')[0];

	video.pause();
	video.src = '';
};

