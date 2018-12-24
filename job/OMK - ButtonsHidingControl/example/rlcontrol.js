//debugger
function RLControl(mslField)
{ 
    this.IsLoading = true;
    
    this.Container = window.document.createElement('div');
    this.Container.className = 'rl_container';
    
    this.CreateLink = RL_CreateLink;
    this.OpenLink = RL_OpenLink;
    this.ParentField = mslField;
    this.AddFieldToCollection = RL_AddFieldToCollection;
    
    //Interface
    this.Disable = RL_Disable;
    this.Enable = RL_Enable;
    this.GetValue = RL_GetValue;
    
    //Properties
    if(window.SM.IsNE(this.WebUrl))
        this.WebUrl = '';
    
    //Initialization
    this.CreateLink();
    
    this.AddFieldToCollection();
    this.IsLoading = false;
}

function RLControlDisplay()
{
    this.AddFieldToCollection = RL_AddFieldToCollection;
    this.AddFieldToCollection();
}

///////////////////RLControl - Methods////////////////////

function RL_AddFieldToCollection()
{
    if(window.RLControlCollection == null)
        window.RLControlCollection = new Array();
    if(!window.SM.IsNE(this.FieldTitle))
    {
        var lowName = this.FieldTitle.toLowerCase();
        if(window.RLControlCollection[lowName] == null)
            window.RLControlCollection[lowName] = this;
    }
}

function GetRLControl(fieldName)
{
    var rlField = null;
    if(!window.SM.IsNE(fieldName))
    {
        fieldName = fieldName.toLowerCase();
        if(window.RLControlCollection != null)
            rlField = window.RLControlCollection[fieldName];
    }
    return rlField;
}

function RL_Disable()
{
}

function RL_Enable()
{
}

function RL_GetValue()
{
    return null;
}

function RL_CreateLink()
{
    var link = window.document.createElement('a');
    link.href = 'javascript:';
    var field = this;
    link.onclick = function() { field.OpenLink(); }
    link.innerHTML = this.LinkText;
    link.className = 'rl_link';
    this.Container.appendChild(link);
}

//debugger
function RL_OpenLink()
{
    if(this.IsMultipleMSLField)
    {
        alert(window.TN.TranslateKey('RLControl.MultiIerarchyNotSupportedException'));
        return;
    }
    
    var parentID = '';
    var parentListID = '';
    var parentWebID = '';
    var currentID = this.CurrentID;//GetRequestValue('ID');
    
    var mslField = this.ParentField;
    if (mslField != null) 
    {
        if (mslField.Value != null) 
        {
            if (mslField.Value.SingleValue != null) 
            {
                if (mslField.Value.SingleValue.LookupSection != null) 
                {
                    parentID = GetEmptyStringIfNull(mslField.Value.SingleValue.LookupID);
                    parentListID = GetEmptyStringIfNull(mslField.Value.SingleValue.LookupListID);
                    parentWebID = GetEmptyStringIfNull(mslField.Value.SingleValue.LookupSection.LookupWebID);
                }
            }
        }
    }
    else
    {
        parentID = this.ParentID;
        parentListID = this.ParentListID;
        parentWebID = this.ParentWebID;
    }
    
    if (!window.SM.IsNE(currentID) && currentID != '0') 
    {
        var url = new String();
        var params = '?listName=' + encodeURI(this.ListName);
        params += '&fieldTitle=' + encodeURI(this.FieldTitle);
        params += '&currentID=' + currentID;
        params += '&parentID=' + parentID;
        params += '&parentListID=' + parentListID;
        params += '&parentWebID=' + parentWebID;
        var pageName = !this.IsNewWindowDesign ? 'RLWindow.aspx' : 'RLWindow.v2.aspx';
        url = url.concat(this.WebUrl, this.ModulePath, '/Relations/', pageName, params);
        var winTitle = this.LinkText;
        if(!this.IsNewWindowDesign)
            window.OpenFloatWindow(url, winTitle, this.WindowWidth, this.WindowHeight);
        else
            window.OpenPopupWindow(url, this.WindowWidth, this.WindowHeight, '19px 16px 10px 16px !important');
    }
}

function  RL_OnDocumentClick(link, url)
{
    //TC.SelectNode(link);
    
    if(SM.IsNE(url))
        throw new Error(SM.SR(window.TN.TranslateKey('MSLFieldControl.EmptyParamException'), '{ParamName}', 'url'));
    
    if(url != null)
    {
        var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
        window.open(url, '_blank', winFeatures);
    }
    return false;
}

function RL_OnWindowLoad()
{
    var popupWindow = window.GetPopupWindow(0);
    if(popupWindow != null)
    {
        var divTree = popupWindow.GetElement('divTree');
        var divButtons = popupWindow.GetElement('divButtons');
        var windowHeight = popupWindow.ContentDiv.offsetHeight;
        var windowWidth = popupWindow.ContentDiv.offsetWidth;
        
        if(!SM.IsIE)
            windowHeight -= 3;
        
        var treeWidth = windowWidth - 2;
        divTree.style.height = windowHeight - divButtons.offsetHeight - 10 + 'px';
        divTree.style.width = treeWidth + 'px';
        //divTree.children[0].style.width = treeWidth + 'px';
    }
}

//debugger
function RL_PopulateChildDocs(nodeRow, childLevel)
{
    var docUniqueID = nodeRow.getAttribute('DocUniqueID');
    if(SM.IsNE(docUniqueID))
        throw new Error('Не удалось получить DocID при раскрытии узла дочерних документов.');
    
    var root = TC.GetRoot(nodeRow);
    if(root != null)
    {
        var fieldName = root.getAttribute('FieldName');
        if(SM.IsNE(fieldName))
            throw new Error('Не удалось получить имя поля мультиисточника.');
        
        var rlControl = window.GetRLControl(fieldName);
        if(rlControl == null)
            throw new Error('Не удалось получит контроле иерархии по имени ' + fieldName);
        
        var url = rlControl.WebUrl + rlControl.ModulePath + '/Relations/PopulateChildDocs.ashx?rnd=' + Math.random().toString();
        var params = '';
        params += '&listName=' + encodeURI(rlControl.ListName);
        params += '&fieldTitle=' + encodeURI(rlControl.FieldTitle);
        params += '&docUniqueID=' + docUniqueID;
        params += '&childLevel=' + childLevel;
        params += '&currentDocID=' + rlControl.CurrentID;
        params += '&currentDocListID=' + rlControl.CurrentListID;
        
        url += params;
        
        var xmlRequest = window.SM.GetXmlRequest();
        xmlRequest.open('GET', url, true);
        
        var nodeRowParam = nodeRow;
        xmlRequest.onreadystatechange = function()
        {
            if(xmlRequest.readyState == 4 && xmlRequest.status == 200) 
            {
                xmlRequest.onreadystatechange = new Function();
                var responseText = xmlRequest.responseText;
                RL_PopulateChildDocsCompleted(nodeRowParam, responseText);
            }
        }
        xmlRequest.send(null);
    }
}

//debugger
function RL_PopulateChildDocsCompleted(nodeRow, childNodes)
{
    if(!SM.IsNE(childNodes))
    {
        if(childNodes.toLowerCase().indexOf('exception') != -1)
        {
            alert(childNodes)
            return;
        }
        TC.AddChildNodes(nodeRow, childNodes);
    }
}


/////////////////////END///////////////////////





///////////////Common Methods//////////////////////
function ClearChildNodes(xmlElement)
{
    if (xmlElement != null)
    {
        while (xmlElement.firstChild != null)
            xmlElement.removeChild(xmlElement.firstChild);
    }
}

//Функция для получения массива параметров URL
function GetRequestValue(paramName)
{
    var value = null;
    if (!window.SM.IsNE(paramName)) 
    {
        paramName = paramName.toLowerCase();
        var requestCollection = RequestCollection();
        if (requestCollection != null)
            value = requestCollection[paramName];
    }
    return value;
}

var rl_htRequestParams = null;
function RequestCollection()
{
    if (rl_htRequestParams == null) 
    {
        rl_htRequestParams = new Array();
        var splitedUrl = window.location.href.split('?');
        if (splitedUrl[1] != null) {
            var stParams = splitedUrl[1];
            var arParams = stParams.split('&');
            var i, len = arParams.length;
            for (i = 0; i < len; i++) {
                var paramPair = arParams[i].split('=');
                if (paramPair.length == 2) 
                {
                    var key = paramPair[0];
                    if(!window.SM.IsNE(key))
                    {
                        key = key.toLowerCase();
                        var reqValue = paramPair[1];
                        rl_htRequestParams[key] = reqValue;
                    }
                }
            }
        }
    }
    return rl_htRequestParams;
}

var Guid_Empty = '00000000-0000-0000-0000-000000000000';

function GetEmptyStringIfNull(obj)
{
    if (obj != null)
        return obj;
    else
        return '';
}

/*-------------- Relations Info ---------------------*/
function MSL_RelationsInfo_CreateMenuControl(img, sourceListID, sourceFieldID, listID, itemID, isDelay) 
{
	img.NeedShowMenu = true;
	if(isDelay)
	{
		setTimeout(function() 
		{
			
			MSL_RelationsInfo_CreateMenuControl_Inner(img, sourceListID, sourceFieldID, listID, itemID);
		}, 1000);
    }
    else MSL_RelationsInfo_CreateMenuControl_Inner(img, sourceListID, sourceFieldID, listID, itemID);
}

function MSL_RelationsInfo_CreateMenuControl_Inner(img, sourceListID, sourceFieldID, listID, itemID) 
{
		if(!img.NeedShowMenu) return;
		//уже есть меню, то открываем его
		if(img.Menu != null)
		{
			img.Menu.IsTriggerHide = false;
			img.Menu.ShowTrigger();
			return;
		}

		//получаем html
		var url = '/_layouts/WSS/WSSC.V4.SYS.Fields.MultiSourceLookup/Relations/GetDocInfo.aspx?rnd=' + Math.random().toString();
		var params = 'sourceListID=' + sourceListID;
		params += '&sourceFieldID=' + sourceFieldID;
		params += '&listID=' + listID;
		params += '&itemID=' + itemID;
		params = encodeURI(params);

		var result = $.ajax({
			url: url,
			data: params,
			async: false,
			dataType: 'text'
		});

		//если было новое событие  на обработку матрицы, то игнорируем полученный результат и делаем запрос снова
		var html = result.responseText;
		if(html == null || html == '') 
		{
			alert('Не удалось определить шаблон');
			return;
		}
	    
		var menuControl = new Tooltip({
			parentElement: img,
			relativeX: 0,
			relativeY: 0,
			relativeLeft: 0,
			hideOnMouseOut: false,
			isVertical: true
		});

		menuControl.ParentControl = img;
		img.Menu = menuControl;
		var divContent = menuControl.DivContent;
		var container = menuControl.Container;
	    
		if(html != null && html != '')
			divContent.innerHTML = html;
	    
		container.style.zIndex = 10000;
		menuControl.IsTriggerHide = false;
		menuControl.ShowTrigger();
}

function MSL_RelationsInfo_HideMenuControl(img) 
{
	img.NeedShowMenu = false;
	
    //скрытие меню
    if(img.Menu != null)
    {
        img.Menu.Hide();
        img.Menu.IsTriggerHide = true;
        return;
    }
}

function MSL_ClickHandler(img, sourceListID, sourceFieldID, listID, itemID)
{
	//меню не было, создаем его
	if(img.Menu == null) 
	{
		MSL_RelationsInfo_CreateMenuControl(img, sourceListID, sourceFieldID, listID, itemID, false);
		return;
	}
	
	//меню скрыто, то окрываем его
	if(img.Menu.IsTriggerHide) MSL_RelationsInfo_HideMenuControl(img);
	else MSL_RelationsInfo_CreateMenuControl(img, sourceListID, sourceFieldID, listID, itemID, false);
}
/**/