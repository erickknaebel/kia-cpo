es3.PostTestScene = function()
{
	this.name				= 'es3.PostTestScene';
	this.stem				= '';
	this.source				= '';
	this.choices			= [];
	this.lastChoiceIndex	= -1;
    this.disableBack		= true;
    this.disableNext		= true;
    this.disableReplay		= true;
	this.isCorrect			= false;
};

es3.PostTestScene.prototype = new es3.SilentScene();
es3.PostTestScene.prototype.constructor = es3.PostTestScene;

es3.PostTestScene.prototype.onLoad = function()
{
	this.extractData();
	this.buildOutput();
};

es3.PostTestScene.prototype.extractData = function()
{
    var choices		= this.choices;
	var DEBUG_MODE	= es3.configuration.DEBUG_MODE

	this.stem	= this.$html.find('.postTestContent p').html();
	this.source	= this.$html.find('cite').html();

	this.$html.find('ul.choiceData li').each(function(i, elem){

		var text		= elem.innerHTML;
		var isCorrect	= elem.getAttribute('data-correct') === 'true';
		var flag		= (isCorrect && DEBUG_MODE) ? '*' : '';

		choices.push({
			text:flag + text,
			correct:isCorrect
		});
	});
};

es3.PostTestScene.prototype.buildOutput = function()
{
	var output = '<table class="choices">' +
		'<tr>' +
			'<td class="icon"><div></div></td>' +
			'<td>' + this.choices[0].text + '</td>' +
		'</tr>' +
		'<tr>' +
			'<td class="icon"><div></div></td>' +
			'<td>' + this.choices[1].text + '</td>' +
		'</tr>' +
		'<tr>' +
			'<td class="icon"><div></div></td>' +
			'<td>' + this.choices[2].text + '</td>' +
		'</tr>' +
		'<tr>' +
			'<td class="icon"><div></div></td>' +
			'<td>' + this.choices[3].text + '</td>' +
		'</tr>' +
	'</table>';

	var question = '<p class="statement">' + this.stem + '</p>';
	var $content = this.$html.find('.postTestContent');

	$content.html(question + output);
};

es3.PostTestScene.prototype.enableChoices = function()
{
	this.$html.find('.choices tr').addClass('active').on(TOUCHEVENT, this.choiceClickHandler.bind(this));
};

es3.PostTestScene.prototype.disableChoices = function()
{
	this.$html.find('.choices tr').removeClass('active').off(TOUCHEVENT);
};

es3.PostTestScene.prototype.choiceClickHandler = function(event)
{
	var $tr			= $(event.delegateTarget);
	var choiceIndex	= $tr.index();

	if (choiceIndex !== this.lastChoiceIndex)
	{
		$tr.siblings().removeClass('selected');
		$tr.addClass('selected');

		if (this.lastChoiceIndex == -1)
			es3.app.pulseNext();

		this.lastChoiceIndex	= choiceIndex;
		this.isCorrect			= this.choices[choiceIndex].correct;
	}
};

es3.PostTestScene.prototype.onNext = function()
{
	es3.app.disableNext();
	this.disableChoices();
	es3.app.setTestQuestionResult(this.isCorrect, this.stem, this.source);
	this.markComplete();
	es3.app.nextScene();
};

es3.PostTestScene.prototype.onStart = function()
{
	this.enableChoices();
};

es3.PostTestScene.prototype.onDispose = function()
{
	this.disableChoices();
};
