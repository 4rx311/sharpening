//debugger
function PField(pnlContainerID, hdnFormValueID, valueXml)
{ 
    this.IsLoading = true;
    if(SM.IsNE(valueXml))
        throw new Error('Параметр valueXml не может быть пустым.');
    
    this.ControlContainer = window.document.getElementById(pnlContainerID);
    this.HiddenFormValue = window.document.getElementById(hdnFormValueID);
    this.ValueDocument = SM.LoadXML(valueXml);
    
    if(this.IsSettingsEditor)
        window.publshingDefaultValue = this;
    
    //Methods
    this.CreatePublishingControl = P_CreatePublishingControl;
    this.UpdatePublishingControl = P_UpdatePublishingControl;
    this.SaveControlValue = P_SaveControlValue;
    
    //Properties
    this.ValueElement = this.ValueDocument.selectSingleNode('ArrayOfControlValue');
    if(this.WebUrl == null)
        this.WebUrl = '';
    
    //DBField Interface
    this.OnSave = P_OnSave;
    this.Disable = P_Disable;
    this.IsEmptyValue = P_IsEmptyValue;
    
    
    //Initialisation
    this.Value = new PFieldValue(this.ValueElement, this);
    if(this.IsSettingsEditor)
    {
        this.CbxIsMultiple = window.document.getElementById(this.CbxIsMultipleID);
        this.CblCatalogs = window.document.getElementById(this.CblCatalogsID);
        this.DdlShowAllRubrics = window.document.getElementById(this.DdlShowAllRubricsID);
    }
    
    
    this.CreatePublishingControl();
    this.Value.InitPublishings();
    this.UpdatePublishingControl();
    this.SaveControlValue();
    

    P_AddFieldToCollection(this);
    
    this.IsLoading = false;
}

function PFieldValue(xmlElement, field)
{ 
    this.Field = field;
    this.XmlElement = xmlElement;
    
    //Methods
    this.GetAttribute = P_GetAttribute;
    this.GetBooleanAttribute = P_GetBooleanAttribute;
    this.Persist = P_Persist;
    this.InitPublishings = P_InitPublishings;
    
    //Properties
    this.PublishingsElement = this.XmlElement;
    
    //Initialization
    this.InitPublishings();
}

function PFieldValueItem(xmlElement, value)
{
    this.Value = value;
    this.Field = value.Field;
    this.XmlElement = xmlElement;
    
    //Methods
    this.GetAttribute = P_GetAttribute;
    this.GetBooleanAttribute = P_GetBooleanAttribute;
    
    //Properties
    this.RubricID = this.GetAttribute('RubricID');
    this.CatalogID = this.GetAttribute('CatalogID');
}

///////////////////PField - Methods////////////////////

var p_fieldsByName = null;
var p_fieldsByIndex = null;
function P_AddFieldToCollection(field)
{
    if (p_fieldsByName == null)
        p_fieldsByName = new Array();
    if(p_fieldsByIndex == null)
        p_fieldsByIndex = new Array();
    if(!IsNullOrEmpty(field.FieldName))
    {
        p_fieldsByName[field.FieldName] = field;
        p_fieldsByIndex.push(field);
    }
}

function GetPublishingField(fieldName)
{
    var field = null;
    if (p_fieldsByName != null)
        field = p_fieldsByName[fieldName];
    return field;
}

//debugger
function P_ReturnPublishingResult(fieldName, resultXml)
{
    var field = null;
    if(window.publshingDefaultValue != null)
        field = window.publshingDefaultValue;
    else
        field = GetPublishingField(fieldName);
        
    if (field != null)
    {
        P_ClearValue(field);
        if (!IsNullOrEmpty(resultXml)) 
        {
            var axoResult = SM.LoadXML(resultXml);
            var resultDocument = axoResult.documentElement;
            var resultNodes = resultDocument.selectNodes('ControlValue');
            if (resultNodes.length > 0) 
            {
                var i, len = resultNodes.length;
                for(i = 0; i < len; i++)
                {
                    var singleNode = resultNodes[i];
                    var catalogOID = GetAttributeValue(singleNode, 'CatalogID');
                    var rubricID = GetAttributeValue(singleNode, 'RubricID');
                    if (!IsNullOrEmpty(catalogOID) && !IsNullOrEmpty(rubricID)) 
                    {
                        var publishingItemElement = field.ValueDocument.createElement('ControlValue');
                        publishingItemElement.setAttribute('CatalogID', catalogOID);
                        publishingItemElement.setAttribute('RubricID', rubricID);
                        field.Value.PublishingsElement.appendChild(publishingItemElement);
                    }
                }
            }
        }
        field.Value.InitPublishings();
        field.UpdatePublishingControl();
        field.SaveControlValue();
    }
}

//debugger
function P_OpenWindow(field)
{
    if(!field.IsNewWindowDesign && field.Disabled)
        return;
        
    var url = new String();
    var params = '?webUrl=' + encodeURI(field.WebUrl);
    params += '&listID=' + field.ListID;
    params += '&fieldID=' + field.FieldID;
    params += '&isSettingsEditor=' + encodeURI(field.IsSettingsEditor.toString());
    if(field.IsSettingsEditor)
    {
        params += '&isMultiple=' + encodeURI(field.CbxIsMultiple.checked.toString());
        
        var rows = field.CblCatalogs.rows;
        var i, len = rows.length;
        var stCatalogs = new String();
        for(i = 0; i < len; i++)
        {
            var row = rows[i];
            var spnAttrs = row.cells[0].children[0];
            var cbxCatalog = spnAttrs.children[0];
            if(cbxCatalog.checked)
            {
                if(stCatalogs.length > 0)
                    stCatalogs += ',';
                stCatalogs += spnAttrs.getAttribute('CatalogID');
            }
        }
        params += '&catalogs=' + encodeURI(stCatalogs);
        
        var showAllRubricsIndex = field.DdlShowAllRubrics.selectedIndex;
        var showAllRubrics = showAllRubricsIndex == 0;
        params += '&showAllRubrics=' + showAllRubrics;
    }
    
    //в будущем учесть МАКС длину УРЛ
    var i, len = field.Value.Publishings.length;
    var stPublishings = new String();
    for(i = 0; i < len; i++)
    {
        var pubItem = field.Value.Publishings[i];
        if(!IsNullOrEmpty(pubItem.RubricID))
        {
            var stPub = pubItem.RubricID;
            if(stPublishings.length > 0)
                stPublishings += ';';
            stPublishings += stPub;
        }
    }
    if(!field.IsNewWindowDesign)
    {
        field.HiddenSelectedRubrics.value = stPublishings;
        params += '&hiddenSelectedRubricsID=' + field.HiddenSelectedRubrics.id;
    }
    else
        params += '&selectedRubrics=' + stPublishings;
    
    
    params += '&isEditMode=' + field.IsEditMode.toString().toLowerCase();
    
    var pageUrl = null;
    if(!field.IsNewWindowDesign)
        pageUrl = '/Field/RubricSelect.aspx';
    else
        pageUrl = '/Field/RubricSelect.v2/RubricSelect.aspx';
    
    url = url.concat(field.WebUrl, field.ModulePath, pageUrl, params);
    var winTitle = 'Выбор рубрики';
    if(!field.IsNewWindowDesign)
        OpenFloatWindow(url, winTitle, field.WindowWidth, field.WindowHeight);
    else
        OpenPopupWindow(url, field.WindowWidth, field.WindowHeight, '19px 16px 10px 16px !important', 0, true);
}
//debugger

function P_ClearValue(field)
{
    if(!field.Disabled)
    {
        ClearChildNodes(field.Value.PublishingsElement);
        field.Value.InitPublishings();
        field.UpdatePublishingControl();
        field.SaveControlValue();
    }
}

//debugger
function P_CreatePublishingControl() 
{
    var field = this;
    if(!this.IsNewWindowDesign)
    {
        var floatContainer = window.document.createElement('table');
        this.ControlContainer.appendChild(floatContainer);
        this.ControlContainer.ActionControl = floatContainer;
        this.EditControl = floatContainer;
        floatContainer.border = 0;
        floatContainer.cellPadding = 0;
        floatContainer.cellSpacing = 0;


        var trFloatContainer = floatContainer.insertRow(-1);
        
        var tdSetValueImage = trFloatContainer.insertCell(-1);
        tdSetValueImage.innerHTML = "<img src='/_layouts/images/open.gif' border='0' style='cursor:pointer'/>";
        var imgSetValue = tdSetValueImage.children[0];
        imgSetValue.onclick = function(){ P_OpenWindow(field); }
        var tdSetValue = trFloatContainer.insertCell(-1);
        var lnkSetValue = window.document.createElement('a');
        lnkSetValue.innerHTML = 'Установить значение';
        lnkSetValue.href = 'javascript:';
        lnkSetValue.className = 'pbl_link';
        lnkSetValue.onclick = function(){ P_OpenWindow(field); }
        tdSetValue.appendChild(lnkSetValue);
        tdSetValue.style.paddingRight = '10px';
        this.EditControl.LinkSetValue = lnkSetValue;
        this.EditControl.LinkSetValue.Image = imgSetValue;
        
        if(this.IsEditMode)
        {
            var tdClearValueImage = trFloatContainer.insertCell(-1);
            tdClearValueImage.innerHTML = "<img src='/_layouts/images/delete.gif' border='0' style='cursor:pointer'/>";
            var imgClearValue = tdClearValueImage.children[0];
            imgClearValue.onclick = function(){ P_ClearValue(field); }
            var tdClearValue = trFloatContainer.insertCell(-1);
            var lnkClearValue = window.document.createElement('a');
            lnkClearValue.innerHTML = 'Очистить значение';
            lnkClearValue.href = 'javascript:';
            lnkClearValue.className = 'pbl_link';
            lnkClearValue.onclick = function(){ P_ClearValue(field); }
            tdClearValue.appendChild(lnkClearValue);
            this.EditControl.LinkClearValue = lnkClearValue;
            this.EditControl.LinkClearValue.Image = imgClearValue;
        }
    }
    else
    {
        var lnkSetValue = window.document.createElement('a');
        lnkSetValue.innerHTML = this.IsEditMode ? window.TN.TranslateKey('PField.ViewAndEdit') : window.TN.TranslateKey('PField.View');
        lnkSetValue.href = 'javascript:';
        lnkSetValue.className = 'pbl_link';
        lnkSetValue.onclick = function(){ P_OpenWindow(field); }
        this.ValueLink = lnkSetValue;
        this.ControlContainer.appendChild(lnkSetValue);
    }
    
    this.HiddenSelectedRubrics = window.document.createElement('input');
    this.HiddenSelectedRubrics.type = 'hidden';
    this.HiddenSelectedRubrics.id = GenerateUniqueID('hdnSelectedRubrics');
    this.ControlContainer.appendChild(this.HiddenSelectedRubrics);
}

//Меняет контрол соответствии с новым значением котрола
function P_UpdatePublishingControl()
{
    if (this.Value != null) 
    {
        if(!this.IsNewWindowDesign)
        {
            var setValueText = 'Установить значение';
            var clearDisplay = 'none';
            if(this.Value.Publishings.length > 0)
            {
                setValueText = 'Изменить значение';
                clearDisplay = '';
            }
            if(!this.IsEditMode)
                setValueText = 'Просмотреть значение';
        
            this.EditControl.LinkSetValue.innerHTML = setValueText;
            if(this.EditControl.LinkClearValue != null)
            {
                this.EditControl.LinkClearValue.style.display = clearDisplay;
                this.EditControl.LinkClearValue.Image.style.display = clearDisplay;
            }
        }
    }
}

function P_OnSave(saveEventArgs) 
{
    if(this.ListFormField != null)
    {
        if (this.ListFormField.Required) 
        {
            var canSave = false;
            var isEmptyValue = true;
            if(this.Value != null)
            {
                if(this.Value.Publishings.length > 0)
                {
                    canSave = true;
                    isEmptyValue = false;
                }
            }
            saveEventArgs.CanSave = canSave;
            saveEventArgs.IsEmptyValue = isEmptyValue;
        }
    }
}

//возвращает true, если значение поля публикации является пустым.
function P_IsEmptyValue()
{
    var isEmptyValue =
        this.Value != null &&
        this.Value.Publishings != null &&
        this.Value.Publishings.length;

    return isEmptyValue;
}

function P_SaveControlValue()
{
    this.Value.Persist();
}

function P_Disable()
{
    if (this.ControlContainer != null) 
    {
        if(!this.IsNewWindowDesign)
        {
            this.EditControl.LinkSetValue.className = 'pbl_link_disabled';
            this.EditControl.LinkClearValue.className = 'pbl_link_disabled';
            this.EditControl.LinkClearValue.Image.src = '/_layouts/images/deletegray.gif';
        }
        else
        {
            this.ValueLink.innerHTML = 'Просмотреть';
            this.IsEditMode = false;
        }
        this.Disabled = true;
    }
}

function DisablePublishingField(fieldName)
{
    var pField = window.GetPublishingField(fieldName);
    if(pField != null)
        pField.Disable();
}

/////////////////////END///////////////////////




////////////////////PFieldValue - Methods//////////////////////
function P_Persist()
{
    this.Field.HiddenFormValue.value = SM.PersistXML(this.XmlElement);
}

function P_InitPublishings()
{
    this.Publishings = new Array();
    if(this.PublishingsElement != null)
    {   
        var publishingsNodes = this.PublishingsElement.selectNodes('ControlValue');
        var i, len = publishingsNodes.length;
        for(i = 0; i < len; i++)
        {
            var pubNode = publishingsNodes[i];
            var pubItem = new PFieldValueItem(pubNode, this);
            this.Publishings.push(pubItem);
        }
    }
}
/////////////////////////////////////////////////////////////////







/*----------------------------- PRubricWindow -------------------------------*/

//debugger
function PRubricWindow(rubricValuesXml)
{
    window.RubricWindow = this;
    
    //Properties
    this.Field = GetPublishingField(this.FieldName);
    this.PopupWindow = window.GetPopupWindow();
    this.RubricValuesDocument = SM.LoadXML(rubricValuesXml);
    this.RubricValueNodes = this.RubricValuesDocument.selectSingleNode('ArrayOfControlValue');
    
    //Methods
    this.OnPageLoad = PRW_OnPageLoad;
    this.OnMenuItemClick = PRW_OnMenuItemClick;
    this.OnOKClick = PRW_OnOKClick;
    this.Close = PRW_Close;
    this.ClearResult = PRW_ClearResult;
    this.ChangeShowMode = PRW_ChangeShowMode;
    this.HideChildNodes = PRW_HideChildNodes;
    this.ShowAbove = PRW_ShowAbove;
    this.OnRubricNodeClick = PRW_OnRubricNodeClick;
    this.SetRubricSelectionState = PRW_SetRubricSelectionState;
    
    //Initialization
    this.OnPageLoad();
}

//debugger
function PRW_OnPageLoad()
{
    this.MainDiv = this.PopupWindow.GetElement('divMain');
    if(!this.IsEditMode)
        $(this.MainDiv).addClass('pbl_displayMode');
    
    var menuItemID = this.IsShowAllDefaultMode ? 'linkShowAll' : 'linkShowSelected';
    this.CurrentMenuItem = null;
    this.CurrentContent = null;
    this.OnMenuItemClick(this.PopupWindow.GetElement(menuItemID), true);
    
    //меняем размеры дерева
    var divMenu = this.PopupWindow.GetElement('divMenu');
    var divTree = this.PopupWindow.GetElement('divTree');
    var divButtons = this.PopupWindow.GetElement('divButtons');
    this.TreeRubricSelect = this.PopupWindow.GetElement('rubricTree');
    
    var frameHeight = this.PopupWindow.ContentDiv.offsetHeight;
    
    var heightInterval = frameHeight - divMenu.offsetHeight - divButtons.offsetHeight;
    divTree.style.height = (heightInterval - 16) + 'px';
    this.TreeRubricSelect.style.display = 'none';
    divTree.style.width = divTree.offsetWidth + 'px';
    this.TreeRubricSelect.style.display = '';
    
    this.CurrentNodeRow = null;
    
    this.CurrentFolderImage = $(this.PopupWindow.ContentDiv).find("img[isCurrent='true']")[0];
    if(this.CurrentFolderImage != null)
        this.CurrentNodeRow = this.CurrentFolderImage.parentNode.parentNode;
    else
    {
        this.CurrentNodeRow == null
        this.CurrentFolderImage = null;
    }
        
    this.HidedRubrics = new Array();
    
    this.ShowSelectedLink = this.PopupWindow.GetElement('linkShowSelected');
    this.ShowAllLink = this.PopupWindow.GetElement('linkShowAll');
    if(this.IsShowAllDefaultMode)
        this.ChangeShowMode(this.ShowAllLink);
    else
        this.ChangeShowMode(this.ShowSelectedLink);
}

function PRW_OnMenuItemClick(tdMenu, isLoading)
{
    if(this.CurrentMenuItem != null)
    {
        var prevMenuItem = this.CurrentMenuItem;
        prevMenuItem.className = 'pbl_tdMenuGrey';
        prevMenuItem.children[0].className = 'pbl_tdMenuGreyText';
    }
    this.CurrentMenuItem = tdMenu;
    this.CurrentMenuItem.className = 'pbl_tdMenuGrey_current';
    this.CurrentMenuItem.children[0].className = 'pbl_tdMenuGreyText_current';
    if(!isLoading)
        this.ChangeShowMode(tdMenu);
}

//debugger
function PRW_OnOKClick()
{
    if(this.IsEditMode)
    {
        var xml = SM.PersistXML(this.RubricValuesDocument);
        if(window.P_ReturnPublishingResult != null)
            window.P_ReturnPublishingResult(this.FieldName, xml);
    }
    this.Close();
}

//debugger
function PRW_ClearResult()
{
    if(this.IsEditMode)
    {
        var thisObj = this;
        $(this.PopupWindow.ContentDiv).find("tr[checked='true']").each(function(index, nodeRow)
        {
            var folderImage = $(nodeRow).find("img[isCheckImage='true']")[0];
            thisObj.SetRubricSelectionState(folderImage, nodeRow, false);
        });
    }
}

function PRW_Close()
{
    window.RubricWindow = null;
    this.PopupWindow.Hide();
}

function PRW_GetNextSibling(node)
{
    if(node == null)
        throw new Error('Не передан параметр node');
    var result = null;
    if(SM.IsIE)
    {
        result = node.nextSibling;
        if(result != null && result.nodeType != 1)
            result = result.nextSibling;
    }
    else
        result = node.nextElementSibling;
    return result;
}

function PRW_GetPreviousSibling(node)
{
    if(node == null)
        throw new Error('Не передан параметр node');
    var result = null;
    if(SM.IsIE)
    {
        result = node.previousSibling;
        if(result != null && result.nodeType != 1)
            result = result.previousSibling;
    }
    else
        result = node.previousElementSibling;
    return result;
}

//debugger
function PRW_ChangeShowMode(currentLink)
{
    var linkShowSelected = this.PopupWindow.GetElement('linkShowSelected');
    var linkShowAll = this.PopupWindow.GetElement('linkShowAll');
    if(currentLink != null)
    {
        var anotherLink = linkShowAll;
        var isShowAllLink = false;
        if(currentLink.id == linkShowAll.id)
        {
            anotherLink = linkShowSelected;
            isShowAllLink = true;
        }
         
        if(!currentLink.Selected)
        {
            anotherLink.Selected = false;
            currentLink.Selected = true;
            
            //anotherLink.className = 'wssc-link';
            //currentLink.className = 'wssc-disabledLink';
            
            if(isShowAllLink)
            {
                if(this.HidedRubrics.length > 0)
                {
                    while(this.HidedRubrics.length > 0)
                    {
                        var rubricControl = this.HidedRubrics.shift();
                        var canDisplay = true;
                        if(rubricControl.nodeType != 1)
                            continue;
                        if(rubricControl.tagName.toLowerCase() == 'div')
                        {
                            var parentNode = PRW_GetPreviousSibling(rubricControl);
                            if(parentNode != null)
                            {
                                var divExpColl = $(parentNode).find("div[IsExpandCollapseDiv='true']")[0];
                                if(divExpColl != null)
                                {
                                    var expanded = divExpColl.getAttribute('Expanded');
                                    if(expanded != null)
                                    {
                                        expanded = expanded.toLowerCase() == 'true';
                                        canDisplay = expanded;
                                    }
                                }
                            }
                        }
                        else if(rubricControl.tagName.toLowerCase() == 'img')
                            rubricControl.parentNode.style.cursor = '';
                        
                        if(canDisplay)
                            rubricControl.style.display = '';
                    }
                }
            }
            else
            {
                var i, len = this.TreeRubricSelect.children.length;
                for(i = 0; i < len; i++)
                {
                    var catalogNode = this.TreeRubricSelect.children[i];
                    if(catalogNode != null)
                    {
                        if(catalogNode.nodeType != 1)
                            continue;
                        if(catalogNode.tagName.toLowerCase() == 'table')
                        {
                            var isRootSelected = IsRubricSelected(catalogNode, -1);
                            if(!isRootSelected)
                            {
                                catalogNode.style.display = 'none';//none
                                this.HidedRubrics.push(catalogNode);
                            }
                            var catalogChildNodes = PRW_GetNextSibling(catalogNode);
                                
                            if(catalogChildNodes != null)
                            {
                                if(catalogChildNodes.tagName.toLowerCase() == 'div')
                                {
                                    if(!isRootSelected && catalogChildNodes.style.display != 'none')
                                    {
                                        catalogChildNodes.style.display = 'none';//none
                                        this.HidedRubrics.push(catalogChildNodes);
                                    }
                                    catalogChildNodes.IsCatalogChildNodes = true;
                                    this.HideChildNodes(true, catalogChildNodes, 0);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

//debugger
function PRW_HideChildNodes(isRootNode, childNodes, currentLevel)
{
    var i, len = childNodes.children.length;
    var parentNode = PRW_GetPreviousSibling(childNodes);
        
    var imgExpColl = $(parentNode).find("div[IsExpandCollapseDiv='true']").children(':first-child')[0];
    imgExpColl.Expanded = false;
    for(i = 0; i < len; i++)
    {
        var node = childNodes.children[i];
        
        if(node.nodeType != 1)
            continue;
        
        if(node.tagName.toLowerCase() == 'table')
        {
            var rubricSelected = IsRubricSelected(node, currentLevel);
            if(rubricSelected)
                this.ShowAbove(node);
            else
            {
                node.style.display = 'none';
                if(!imgExpColl.Expanded)
                {
                    imgExpColl.style.display = 'none';
                    imgExpColl.parentNode.style.cursor = 'default';
                }
                this.HidedRubrics.push(node);
                this.HidedRubrics.push(imgExpColl);
                
                var rubricChildNodes = PRW_GetNextSibling(node);
                if(rubricChildNodes != null)
                {
                    if(rubricChildNodes.tagName.toLowerCase() == 'div' && rubricChildNodes.style.display != 'none')
                    {
                        rubricChildNodes.style.display = 'none';
                        this.HidedRubrics.push(rubricChildNodes);
                    }
                }
            }
        }
        else
        {
            var rubricNode = PRW_GetPreviousSibling(node);
            this.HideChildNodes(false, node, currentLevel + 1);
        }
    }
}


        
//debugger
function IsRubricSelected(node, currentLevel)
{
    var trRubric = node.rows[0];
    var rubricSelected = trRubric.getAttribute('checked').toString() == 'true';
    return rubricSelected;
}

//debugger
function PRW_ShowAbove(rubricNode)
{
    var parentChildNodes = rubricNode.parentNode;
    if(parentChildNodes != null)
    {
        var parentNode = PRW_GetPreviousSibling(parentChildNodes);
        if(parentNode != null)
        {
            if(parentNode.tagName.toLowerCase() == 'table')
            {                        
                var divExpColl = $(parentNode).find("div[IsExpandCollapseDiv='true']")[0];
                var imgExpColl = divExpColl.children[0];
                imgExpColl.style.display = '';
                divExpColl.style.cursor = 'default';
                imgExpColl.Expanded = true;
                ExpandCollapseChildren(divExpColl, true);
                
                if(!parentChildNodes.IsCatalogChildNodes)
                    this.ShowAbove(parentNode);
            }
        }
        
    }
}


//debugger
function PRW_OnRubricNodeClick(folderImage, nodeRow)
{
    if(!this.IsMultiple && this.CurrentNodeRow != null && this.CurrentFolderImage != null)
    {
        var rubricID = nodeRow.getAttribute('rubricID');
        var currentRubricID = this.CurrentNodeRow.getAttribute('rubricID');
        if(rubricID != currentRubricID)
            this.SetRubricSelectionState(this.CurrentFolderImage, this.CurrentNodeRow, false);
    }

    var checked = nodeRow.getAttribute('checked').toString() == 'true';
    checked = !checked;
    this.SetRubricSelectionState(folderImage, nodeRow, checked);
    
    if(!this.IsMultiple)
    {
        if(checked)
        {
            this.CurrentNodeRow = nodeRow;
            this.CurrentFolderImage = folderImage;
        }
        else
        {
            this.CurrentNodeRow = null;
            this.CurrentFolderImage = null;
        }
    }
}

function PRW_SetRubricSelectionState(folderImage, nodeRow, checked)
{
    var allowPublishing = nodeRow.getAttribute('allowPublishing') == 'true';
    nodeRow.setAttribute('checked', checked.toString().toLowerCase());
    var imageName = null;
    if(allowPublishing)
        imageName = checked ? 'rubric_checked.png' : 'rubric_unchecked.png';
    else
        imageName = checked ? 'rubric_checked_disabled.gif' : 'rubric_unchecked_disabled.gif';
    folderImage.src = '/_layouts/WSS/WSSC.V4.DMS.Publishing/Field/RubricSelect.v2/Images/' + imageName;
    
    var rubricID = nodeRow.getAttribute('rubricID');
    var catalogID = nodeRow.getAttribute('catalogID');
    var rubricNode = this.RubricValueNodes.selectSingleNode("ControlValue[@RubricID='" + rubricID + "']");
    if(checked && rubricNode == null)
    {
        rubricNode = this.RubricValueNodes.ownerDocument.createElement('ControlValue');
        this.RubricValueNodes.appendChild(rubricNode);
        rubricNode.setAttribute('RubricID', rubricID);
        rubricNode.setAttribute('CatalogID', catalogID);
    }
    else if(!checked && rubricNode != null)
        this.RubricValueNodes.removeChild(rubricNode);
}



///////////////Common Methods//////////////////////
function P_GetAttribute(attributeName)
{
    return GetAttributeValue(this.XmlElement, attributeName); 
}

function P_GetBooleanAttribute(attributeName)
{
    return GetBooleanAttributeValue(this.XmlElement, attributeName);
}

//проверка строки на пусто/нул
function IsNullOrEmpty(str)
{
    return (str == null || str == '');
}

//получение текстового атрибута ХМЛ-элемента
function GetAttributeValue(xmlElement, attributeName)
{
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if(!IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;        
}

//получение булевого атрибута ХМЛ-элемента
function GetBooleanAttributeValue(xmlElement, attributeName)
{
    var boolValue = false;
    var attrValue = GetAttributeValue(xmlElement, attributeName);
    if(!IsNullOrEmpty(attrValue))
    {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function ClearChildNodes(xmlElement)
{
    if (xmlElement != null)
    {
        while (xmlElement.firstChild != null)
            xmlElement.removeChild(xmlElement.firstChild);
    }
}

//генерит уникальный ИД для ХТМЛ-элементов. Используется для котрола даты
var htUniqueIDs = null;
function GenerateUniqueID(idPrefix)
{
    var isUnique = false;
    var id = null;
    if(htUniqueIDs == null)
        htUniqueIDs = new Array();
    while(!isUnique)
    {
        var rndSuffix = Math.random().toString().split('.')[1];
        id = idPrefix + '_' + rndSuffix;
        if(htUniqueIDs[id] == null)
        {
            isUnique = true;
            htUniqueIDs[id] = id;
        }
    }
    return id;
}
