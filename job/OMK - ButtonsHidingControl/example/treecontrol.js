//debugger
function TC_ExpandCollapseChildren(divExpand, expandedOption)
{
    if(expandedOption == null)
    {
        var expanded = divExpand.getAttribute('Expanded').toLowerCase() == 'true';
        expanded = !expanded;
    }
    else
        expanded = expandedOption == true;
        
    //определение свойств
    var nodeRow = divExpand.parentNode.parentNode;
    var populateOnDemand = divExpand.getAttribute('PopulateOnDemand') == 'true';
    var childLevel = divExpand.getAttribute('ChildLevel');
    if(SM.IsNE(childLevel))
        throw new Error('Не удалось получить ChildLevel дочерних узлов дерева.');
    childLevel = parseInt(childLevel);
    
    //раскрытие
    var childContainer = nodeRow.parentNode.parentNode.nextSibling;
    //nodeType == 1 - только элементы (исключаем текстовые ноды)
    if(childContainer != null && !(childContainer.nodeType == 1 && childContainer.tagName.toLowerCase() == 'div'))
        childContainer = null;
        
    if(expanded)
    {
        $(divExpand).removeClass('tc_expand').addClass('tc_collapse');
        if(childContainer != null)
        {
            childContainer.style.display = '';
            childContainer.previousSibling.style.display = '';
        }
    }
    else
    {
        $(divExpand).removeClass('tc_collapse').addClass('tc_expand');
        if(childContainer != null)
            childContainer.style.display = 'none';
    }
    divExpand.setAttribute('Expanded', expanded.toString());
    
    //аяксовое раскрытие нода
    if(expanded && populateOnDemand && !divExpand.Populated)
    {
        var root = TC.GetRoot(nodeRow);
        if(root != null)
        {
            var populateFunctionName = root.getAttribute('DemandPopulationFunction');
            if(SM.IsNE(populateFunctionName))
                throw new Error('Не удалось получить имя функции отложенного заполнения дочерних узлов');
            var populateFunction = window.eval(populateFunctionName);
            if(populateFunction == null)
                throw new Error('Не удалось получить функцию отложенного заполнения дочерних узлов');
            
            populateFunction(nodeRow, childLevel);
        }
        divExpand.Populated = true;
    }
}

function TC_GetRoot(childElement)
{
    var root = $(childElement).closest('.tc_tree')[0];
    if(root == null)
        throw new Error('Не удалось определить корень дерева.');
    return root;
}

function TC_AddChildNodes(nodeRow, childNodes)
{
    if(nodeRow == null)
        throw new Error('Не передан параметр nodeRow');
    if(nodeRow.tagName.toLowerCase() != 'tr')
        throw new Error('Объект nodeRow должен быть строкой таблицы.');
        
    if(childNodes != null)
    {
        var nodeTable = nodeRow.parentNode.parentNode;
        $(childNodes).insertAfter(nodeTable);
    }
}

function TC_SelectNode(nodeChildElement)
{
    if(nodeChildElement == null)
        throw new Error('Не задан параметр nodeChildElement.');
    
    var currentNode = $(nodeChildElement).closest('.tc_treeNode')[0];
    if(currentNode == null)
        throw new Error('Не удалось определить главный элемент текущего узла.');
        
    //если текущий нод уже выбран - выходим из функции.
    var isCurrentSelected = currentNode.className.indexOf('tc_selected') != -1;
    
    var previousNode = null;
    if(!isCurrentSelected)
    {
        //получаем корневой элемент дерева.
        var root = TC.GetRoot(nodeChildElement);
            
        //снимаем выделение с предыдущего элемента.
        previousNode = $(root).find('.tc_selected').removeClass('tc_selected')[0];

        //устанавливаем выделение на текущий.
        $(currentNode).addClass('tc_selected');
    }
    var result = { CurrentNode: currentNode, PreviousNode: previousNode }
    return result;
}


//Methods
window.TC = new Object();

TC.ExpandCollapseChildren = TC_ExpandCollapseChildren;
TC.GetRoot = TC_GetRoot;
TC.AddChildNodes = TC_AddChildNodes;
TC.SelectNode = TC_SelectNode;