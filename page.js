function createToc()
{
	var toc = createElementTree({ tag: 'div', attributes: { id: 'toc' }, children: [ toc_data ]});

	initCollapsers(toc);

	return toc;
}

function keywordKeypress(event)
{
	setTimeout(function() {
		findKeyword(event.target.value);
	}, 0);
}

function keywordKeydown(event)
{
	setTimeout(function() {
		switch (event.keyCode)
		{
		case 13: // enter
			gotoKeyword();
			break;
		case 38: // up
			previousKeyword();
			break;
		case 40: // down
			nextKeyword();
			break;
		}
	}, 0);
}

function indexCompareKeywords(lhs, rhs)
{
	return lhs.firstChild.getAttribute('data').localeCompare(rhs) < 0;
}

function findKeyword(keyword)
{
	var input = document.getElementById('index-keyword');
	var index = document.getElementById('index');
	if (index.currentItem) index.currentItem.className = index.currentItem.className.replace(/\bselected\b/, '');

	var ul = index.firstChild;
	var li_i = lowerBound(ul.children, keyword, indexCompareKeywords);
	if (li_i === ul.children.length)
	{
		index.currentItem = null;
		return;
	}
	var li = ul.children[li_i];
	var a = li.firstChild;

	index.currentItem = a;
	a.scrollIntoView(true);
	if (a.getAttribute('data') === keyword)
	{
		a.className += ' selected';
	}
}

function nextKeyword()
{
	var index = document.getElementById('index');
	if (!index.currentItem)
	{
		selectKeyword(index.firstChild.firstChild); // first
		return;
	}

	var li = index.currentItem.parentNode;

	if (!/\bselected\b/i.test(index.currentItem.className))
	{
		selectKeyword(li);
		return;
	}

	if (isDomElement('ul', li.lastChild))
	{
		selectKeyword(li.lastChild.firstChild); // child
		return;
	}

	var li_next = li.nextSibling;
	while (isDomElement('li', li) && !li_next)
	{
		var li = li.parentNode.parentNode;
		li_next = li.nextSibling;
	}
	if (!li_next) return; // last

	selectKeyword(li_next);
}

function previousKeyword()
{
	var index = document.getElementById('index');

	if (!index.currentItem) return;
	var li = index.currentItem.parentNode;

	if (li.previousSibling)
	{
		selectKeyword(lastDescendant(li.previousSibling));
		return;
	}

	var li_parent = li.parentNode.parentNode;
	if (isDomElement('li', li_parent))
	{
		selectKeyword(li_parent);
		return;
	}
	selectKeyword(li_next);
}

function lastDescendant(li)
{
	while (isDomElement('ul', li.lastChild))
	{
		li = li.lastChild.lastChild;
	}
	return li;
}

function selectKeyword(li)
{
	var index = document.getElementById('index');

	if (index.currentItem)
	{
		index.currentItem.className = index.currentItem.className.replace(/\bselected\b/, '');
	}

	var a = li.firstChild;
	index.currentItem = a;
	scrollIntoViewIfOutOfView(document.getElementById('panels'), a);
	a.className += ' selected';
	var input = document.getElementById('index-keyword');
	input.value = a.getAttribute('data'); // TODO
}

function gotoKeyword()
{
	var index = document.getElementById('index');

	if (index.currentItem && /\bselected\b/i.test(index.currentItem.className))
	{
		index.currentItem.click();
	}

	return false;
}

function createIndex()
{
	var index = createElementTree(index_data);

	return index;
}

function sidebarShowTab(tabId)
{
	document.getElementById('sidebar').className = tabId;
	for (var tab = document.getElementById('panels').firstChild; tab; tab = tab.nextSibling)
	{
		tab.className = tab.className.replace(/\bhidden\b/, '');
		if (tab.id !== tabId)
		{
			tab.className += ' hidden';
		}
	}
	for (var tab = document.getElementById('tabs').firstChild; tab; tab = tab.nextSibling)
	{
		tab.className = tab.className.replace(/\bselected\b/, '');
		if (tab.id === 'show-' + tabId)
		{
			tab.className += ' selected';
		}
	}
	if (window.localStorage) window.localStorage.setItem('sidebar.activeTab', tabId);
}

function showTab(tabId)
{
	return function(event)
	{
		sidebarShowTab(tabId);
	};
}

function createSidebar()
{
	var sidebar = createElementTree({ tag: 'div', attributes: { id: 'sidebar' }, children: [
		{ tag: 'ul', attributes: { id: 'tabs' }, children: [
			{ tag: 'li', attributes: { id: 'show-toc' }, children: [
				{ tag: 'button', events: { click: showTab('toc') }, children: [ 'Contents' ]}
			]},
			{ tag: 'li', attributes: { id: 'show-index' }, children: [
				{ tag: 'button', events: { click: showTab('index') }, children: [ 'Index' ]}
			]},
		]},
		{ tag: 'div', attributes: { id: 'index-bar' }, children: [
			{ tag: 'input', attributes: { id: 'index-keyword' }, events: { keypress: keywordKeypress, keydown: keywordKeydown }},
			{ tag: 'button', attributes: { type: 'submit' }, events: { click: gotoKeyword }, children: ['Go'] }
		]},
		{ tag: 'div', attributes: { id: 'panels' }, children: [
			createToc(),
			createIndex(),
		]}
	]});

	return sidebar;
}

function isAncestorOrSelf(ancestor, descendant)
{
	for (; descendant && ancestor != descendant; descendant = descendant.parentNode);
	return ancestor == descendant;
}

function scrollIntoViewIfOutOfView(toc, elt)
{
	var eltTop = 0;
	for (var p = elt; p && !isAncestorOrSelf(p, toc); p = p.offsetParent)
	{
		eltTop += p.offsetTop;
	}
	if ((toc.scrollTop + toc.clientHeight) < (eltTop + elt.offsetHeight))
	{
		elt.scrollIntoView(false);
	}
	else if (eltTop < toc.scrollTop)
	{
		elt.scrollIntoView(true);
	}
}

function scrollToc()
{
	var toc = document.getElementById('panels');
	var a = findLink(toc, /[^\/]+$/.exec(window.location.pathname));
	expandAncestors(a);
	a.className += ' selected';
	if (window.localStorage) toc.scrollTop = window.localStorage.getItem('toc.scrollTop');
	scrollIntoViewIfOutOfView(toc, a);
}

var loaded = function(){
	if (loaded.started) return;
	loaded.started = true;
	window.setTimeout(sh_highlightDocument, 2);

	// if we’re not in our parent frame, show sidebar
	if (!window.parent || !window.parent.document.getElementById('cpp0x-frameset'))
	{
		var sidebar = createSidebar();

		document.body.className += " show-sidebar";
		document.body.insertBefore(sidebar, document.body.firstChild);

		if (window.localStorage)
		{
			var activeTab = window.localStorage.getItem('sidebar.activeTab');
			sidebarShowTab(activeTab ? activeTab : 'toc');
		}

		scrollToc();

		// Move content into a separate div
		var contentDiv = createElementTree({ tag: 'div', attributes: { id: 'content' }});
		document.body.insertBefore(contentDiv, sidebar.nextSibling);
		for (var node = contentDiv.nextSibling; node; node = contentDiv.nextSibling)
		{
			contentDiv.appendChild(node.parentNode.removeChild(node));
		}
		if (window.location.hash)
		{
			document.getElementById(window.location.hash.replace(/^#/,'')).scrollIntoView(true);
		}
	}
};

function unloaded()
{
	if (!window.localStorage) return;

	var toc = document.getElementById('panels');
	if (!toc) return;

	window.localStorage.setItem('toc.scrollTop', toc.scrollTop);
}

if (window.addEventListener) {
	window.addEventListener('DOMContentLoaded', loaded, false);
	window.addEventListener('load', loaded, false);
} else if (window.attachEvent)
	window.attachEvent('onload', loaded);
else
	window.onload = loaded;

if (window.addEventListener) {
	window.addEventListener('unload', unloaded, false);
} else if (window.attachEvent)
	window.attachEvent('onunload', unloaded);
else
	window.onunload = unloaded;
