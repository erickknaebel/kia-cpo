es3.SimulationScene = function()
{
	this.progress			= 1;
	this.selectedButton		= null;
	this.$currentFeedback	= null;
	this.$prompt			= null;

	this.imagesToPreload = [
		'images/simulation/customer.jpg',
		'images/simulation/indicators.png',
		'images/simulation/progress.png',
		'images/simulation/question-panel.png',
		'images/simulation/prompt-panel.png',
		'images/simulation/simulation-background.jpg',
		'images/simulation/simulation-button.png'
	];
};

es3.SimulationScene.prototype = new es3.Scene();
es3.SimulationScene.prototype.constructor = es3.SimulationScene;

es3.SimulationScene.prototype.onLoad = function()
{
	this.$choices			= this.$html.find('.simulationChoices').children();
	this.$customer			= this.$html.find('.simulationCustomer');
	this.$prompt			= this.$html.find('.simulationPrompt');
	this.$incorrectFeedback	= this.$html.find('.incorrectFeedback');
	this.$partialFeedback	= this.$html.find('.partialFeedback');
	this.$correctFeedback	= this.$html.find('.correctFeedback');
	this.customerWidth		= this.$customer.width();
};

es3.SimulationScene.prototype.onStart = function()
{
	this.showQuestion();
};

es3.SimulationScene.prototype.onSoundEnd = function()
{
	this.showChoices();
};

es3.SimulationScene.prototype.showQuestion = function()
{
	TweenMax.to('.simulationQuestion', 0.5, {left:0, ease:Power2.easeOut});
};

es3.SimulationScene.prototype.showChoices = function()
{
	TweenMax.staggerTo(this.$choices, 0.4, {top:0, ease:Power1.easeOut}, 0.3);
	TweenMax.delayedCall(1.2, this.showPrompt, null, this);
	this.activateChoices();
};

es3.SimulationScene.prototype.activateChoices = function()
{
	this.$choices.not('.disabled').addClass('active').one(TOUCHEVENT, this.clickHandler.bind(this));
};

es3.SimulationScene.prototype.deactivateChoices = function()
{
	this.$choices.removeClass('active').off(TOUCHEVENT);
};

es3.SimulationScene.prototype.clickHandler = function(event)
{
	this.deactivateChoices();
	this.selectedButton = event.delegateTarget;
	this.hideFeedback();
	this.evaluate();
};

es3.SimulationScene.prototype.evaluate = function()
{
	var correctState = this.selectedButton.getAttribute('data-correct');

	switch(correctState)
	{
		case 'correct':
			this.showCorrect();
			break;

		case 'incorrect':
			this.showIncorrect();
			break;

		case 'partial':
			this.showPartial();
			break;
	}
};

es3.SimulationScene.prototype.showCorrect = function()
{
	var self	= this;
	var audio	= this.$correctFeedback.data('audio');

	var onSoundComplete = function()
	{
		self.play(audio, self.markComplete.bind(self) );
	};

	this.play('correct', onSoundComplete);
	this.selectedButton.className += ' correct';
	this.changeCustomer('happy');
	this.hidePrompt();
	this.showFeedback(this.$correctFeedback);
};

es3.SimulationScene.prototype.showIncorrect = function()
{
	this.play('incorrect', this.onIncorrectSoundComplete.bind(this));
	this.selectedButton.className += ' incorrect';
	this.changeCustomer('unhappy');
	this.showFeedback(this.$incorrectFeedback);
};

es3.SimulationScene.prototype.onIncorrectSoundComplete = function()
{
	this.selectedButton.className += ' disabled';
	TweenMax.to(this.selectedButton, 0.3, {opacity:0.6});
	this.activateChoices();
};

es3.SimulationScene.prototype.showPartial = function()
{
	var self	= this;
	var audio	= this.$partialFeedback.data('audio');

	var onSoundComplete = function()
	{
		self.play(audio, self.markComplete.bind(self) );
	};

	es3.sound.play('partial', onSoundComplete);
	this.selectedButton.className += ' partial';
	this.changeCustomer('puzzled');
	this.hidePrompt();
	this.showFeedback(this.$partialFeedback);
};

es3.SimulationScene.prototype.showFeedback = function($elem)
{
	this.$currentFeedback = $elem;

	$elem.css({left:'-408px', display:'block'});
	TweenMax.to($elem[0], 0.5, {left:59, ease:Power2.easeOut});
};

es3.SimulationScene.prototype.hideFeedback = function()
{
	if (this.$currentFeedback)
	{
		TweenMax.to(this.$currentFeedback[0], 0.2, {autoAlpha:0});
		this.$currentFeedback = null;
	}
};

es3.SimulationScene.prototype.showPrompt = function()
{
	this.$prompt.css({left:'-401px', display:'block'});
	TweenMax.to(this.$prompt[0], 0.5, {left:0, ease:Power2.easeOut});
};

es3.SimulationScene.prototype.hidePrompt = function()
{
	var $prompt = this.$prompt;

	TweenMax.killDelayedCallsTo(this.showPrompt);

	var hidePromptComplete = function()
	{
		$prompt.css('display', 'none');
	};

	TweenMax.to($prompt[0], 0.5, {left:-401, ease:Power2.easeIn, onComplete:hidePromptComplete, overwrite:1});
};

es3.SimulationScene.prototype.changeCustomer = function(expression)
{
	var positions	= {start:0, happy:1, unhappy:2, puzzled:3};
	var offset		= positions[expression] * -this.customerWidth;

	//es3.app.log('changeCustomer ' + expression + ' offset=' + offset + ' customer=' + this.$customer.length);
	this.$customer.css('background-position', offset + 'px 0');
};

es3.SimulationScene.prototype.onDispose = function()
{
	this.deactivateChoices();
};
