var loaded = function(){
	if (loaded.started) return;
	loaded.started = true;
	window.setTimeout(sh_highlightDocument, 2);
    MaSha.instance = new MaSha({'selectable': document.body});
};

if (window.addEventListener) {
	window.addEventListener('DOMContentLoaded', loaded, false);
	window.addEventListener('load', loaded, false);
} else if (window.attachEvent)
	window.attachEvent('onload', loaded);
else
	window.onload = loaded;
