function createElementTree(root)
{
	if (root instanceof Node)
	{
		return root;
	}
	else if (typeof(root) === 'string')
	{
		return document.createTextNode(root);
	}
	else
	{
		var elt = document.createElement(root.tag);
		if (root.attributes) for (var attr in root.attributes)
		{
			elt.setAttribute(attr, root.attributes[attr]);
		}
		if (root.properties) for (var prop in root.properties)
		{
			elt[prop] = root.properties[prop];
		}
		if (root.events) for (var event in root.events)
		{
			elt.addEventListener(event, root.events[event], false);
		}
		if (root.children) for (var i = 0; i < root.children.length; ++i)
		{
			elt.appendChild(createElementTree(root.children[i]));
		}
		return elt;
	}
}
