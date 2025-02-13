function ImagePreloader(images, oncomplete)
{
	'use strict';

	var count;
	var loaded;

	var loadImages = function()
	{
		loaded	= 0;
		count	= images.length;

		if (count === 0)
		{
			preloadComplete();
			return;
		}

		for (var i = 0; i < count; ++i)
		{
			var img;

			if (images[i] instanceof HTMLImageElement)
			{
				img = images[i];
			}
			else
			{
				img = new Image();
				img.src = images[i];
			}

			if (img.complete)
			{
				onLoadComplete();
			}
			else
				img.onload	= onLoadComplete;
		}
	};

	var onLoadComplete = function()
	{
		if (++loaded === count)
			preloadComplete();
	};

	var preloadComplete = function()
	{
		if (oncomplete)
			oncomplete();
	};

	loadImages();
}
