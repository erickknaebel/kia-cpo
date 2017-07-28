es3.KnowledgeCheck = function()
{
	this.name			= 'es3.KnowledgeCheck';
	this.correctAudio	= null;
	this.incorrectAudio	= null;
};

es3.KnowledgeCheck.prototype = new es3.Scene();
es3.KnowledgeCheck.prototype.constructor = es3.KnowledgeCheck;

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.onInitialize = function()
{
    var self = this;
	var audioSource     = $('.knowledgeCheckContent');

	self.correctAudio   = audioSource.attr('data-correct-audio');
	self.incorrectAudio = audioSource.attr('data-incorrect-audio');

	this.enableButtons();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.enableButtons = function()
{
	this.$html.find('.button').addClass('enabled').on(TOUCHEVENT, this.onButtonClick.bind(this) );
};

es3.KnowledgeCheck.prototype.disableButtons = function()
{
	this.$html.find('.button').removeClass('enabled').off(TOUCHEVENT);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.onButtonClick = function(event)
{
	var button = $(event.currentTarget);
	this.unSelectAllOtherButtons();
	button.addClass('selected');
	this.checkAnswer(button);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.checkAnswer = function(button)
{
	this.hideRemediation();

	if (button.attr('data-correct') == 'true')
	{
		var buttonX = button.css('backgroundPosition').split(' ')[0];

		$('.icon').css('backgroundPosition', buttonX + ' 0');

		button.addClass('correct');
		this.showCorrectRemediation();
	}
	else
	{
		button.addClass('incorrect');
		this.showIncorrectRemediation();
	}

	this.disableButtons();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.showCorrectRemediation = function()
{
	var correct = $('.knowledgeCheckContent .correct');

	TweenMax.to(correct, 0.3, {autoAlpha:1, top:220});

	this.play(this.correctAudio, this.onSceneComplete.bind(this));
	this.setCueScope(this.correctAudio);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.showIncorrectRemediation = function()
{
	TweenMax.to('.knowledgeCheckContent .incorrect', 0.3, {autoAlpha:1, top:220});

	this.disableAllButtons();

	this.play(this.incorrectAudio, this.unSelectAllOtherButtons.bind(this));
	this.setCueScope(this.incorrectAudio);
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.unSelectAllOtherButtons = function()
{
	$('.button').removeClass('selected incorrect');
	this.enableButtons();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.hideRemediation = function()
{
	TweenMax.set('.knowledgeCheckContent .remediation', {autoAlpha:0});

	this.resetRemediationPosition();
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.resetRemediationPosition = function()
{
	TweenMax.set('.knowledgeCheckContent .remediation', {top:250});
};

//////////////////////////////////////////////////////////////////////////////////////

es3.KnowledgeCheck.prototype.onSceneComplete = function()
{
	this.disableButtons();
	this.markComplete();
};

es3.KnowledgeCheck.prototype.onDispose = function()
{
	this.disableButtons();
};

