//debugger
function ExpandCollapseChildren(divExpand, expandedOption)
{
    if(expandedOption == null)
    {
        var expanded = divExpand.getAttribute('Expanded').toLowerCase() == 'true';
        expanded = !expanded;
    }
    else
        expanded = expandedOption == true;
    var childContainer = divExpand.parentNode.parentNode.parentNode.parentNode.nextSibling;
    var imgExpanded = divExpand.children[0];
    var expandImageUrl = divExpand.getAttribute('ExpandImageUrl');
    var collapseImageUrl = divExpand.getAttribute('CollapseImageUrl');
    if(expanded)
    {
        imgExpanded.src = collapseImageUrl;
        childContainer.style.display = '';
        childContainer.previousSibling.style.display = '';
    }
    else
    {
        imgExpanded.src = expandImageUrl;
        childContainer.style.display = 'none';
    }
    divExpand.setAttribute('Expanded', expanded.toString());
    
    if(window.Card != null)
        window.Card.UpdateScrollBar();
}