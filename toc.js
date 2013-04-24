// DOM structure:
// UL > LI > A.expand
//         + A[href]
//         + UL.hidden
//    + LI > A.collapse
//         + A[href]
//         + UL

function expand(event)
{
	var handle = event.target;
	handle.onclick = collapse;
	handle.firstChild.nodeValue = '▽';
	handle.parentNode.getElementsByTagName('ul')[0].className = 'visible';
	if (localStorage) localStorage.setItem('expanded.' + handle.nextSibling.href, 'true');
	event.preventDefault();
}

function collapse(event)
{
	var handle = event.target;
	handle.onclick = expand;
	handle.firstChild.nodeValue = '▷';
	handle.parentNode.getElementsByTagName('ul')[0].className = 'hidden';
	if (localStorage) localStorage.removeItem('expanded.' + handle.nextSibling.href);
	event.preventDefault();
}

function initCollapsers(elt)
{
	for (var child = elt.firstChild; child; child = child.nextSibling)
	{
		if (child.nodeType == 1)
		{
			if (/li/i.test(child.nodeName))
			{
				var uls = child.getElementsByTagName('ul');
				if (uls.length > 0)
				{
					var handle = child.insertBefore(
						createElementTree({
							tag: 'a',
							attributes: { 'class': 'expand', 'href': '#' },
							children: [ '▷' ]}),
						child.firstChild);
					handle.onclick = expand;
					if (handle.nextSibling.nodeType == 3 && /^\s+$/.test(handle.nextSibling.nodeValue))
					{
						handle.parentNode.removeChild(handle.nextSibling);
					}
					uls[0].className += ' hidden';
					if (localStorage && localStorage.getItem('expanded.' + handle.nextSibling.href))
					{
						handle.click();
					}
				}
			}
			initCollapsers(child);
		}
	}
}

function findLink(toc, href)
{
	if (!document.evaluate) return null;
	return document.evaluate('//a[@href="' + href + '"]', toc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function expandAncestors(node)
{
	if (!node) return;
	for (node = node.parentNode; node && !(/ul/i.test(node.nodeName)); node = node.parentNode);
	if (!node) return;
	if (/\bhidden\b/.test(node.className))
	{
		node.parentNode.firstChild.click();
	}
	expandAncestors(node);
}
