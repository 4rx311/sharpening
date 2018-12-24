//debugger
function MSLField(pnlContainerID, hdnFormValueID, valueXml) {
    this.IsLoading = true;

    this.ControlContainer = window.document.getElementById(pnlContainerID);

    var valueHidden = window.document.createElement('input');
    valueHidden.type = 'hidden';
    valueHidden.id = hdnFormValueID;
    valueHidden.name = hdnFormValueID;
    valueHidden.setAttribute('ControlName', this.FieldTitle);
    if (SM.PageForm != null)
        SM.PageForm.appendChild(valueHidden);
    else
        this.ControlContainer.appendChild(valueHidden);

    this.HiddenFormValue = valueHidden;

    if (window.ListForm_RequiredHiddens != null)
        window.ListForm_RequiredHiddens.push(this.HiddenFormValue);

    this.ValueDocument = SM.LoadXML(valueXml);

    //Methods
    this.GetLookupSection = MSL_GetLookupSection;
    this.CreateLookupControl = MSL_CreateLookupControl;
    this.SaveControlValue = MSL_SaveControlValue;

    this.ReturnLookupResult = MSL_ReturnLookupResult;
    this.CreateListControl = MSL_CreateListControl;
    this.OpenWindow = MSL_OpenWindow;
    this.CreateLookupItem = MSL_CreateLookupItem;


    //DBField Interface
    this.IsChanged = MSL_IsChanged;
    this.Disable = MSL_Disable;
    this.Enable = MSL_Enable;
    this.GetValue = MSL_GetValue;
    this.OnSave = MSL_OnSave;
    this.IsEmptyValue = MSL_IsEmptyValue;

    //Properties
    this.ValueElement = this.ValueDocument.selectSingleNode('ArrayOfControlValue');

    this.Changed = false;

    if (this.RelationProperties != null) {
        RLControl.call(this.RelationProperties, this);
        this.RelationsControl = this.RelationProperties;
    }

    //Initialization
    this.LookupSectionsByListID = new Array();
    var i, len = this.LookupSections.length;
    for (i = 0; i < len; i++) {
        var section = this.LookupSections[i];
        MSLLookupSection.call(section, this);
        this.LookupSectionsByListID[section.LookupListID] = section;
    }
    this.CreateLookupControl();
    this.Value = new MSLFieldValue(this.ValueElement, this);

    this.SaveControlValue();

    MSL_AddFieldToCollection(this);

    if (this.RelationsControl != null) {
        if (this.RelationsControl.ShowRelations)
            this.ControlContainer.appendChild(this.RelationsControl.Container);
    }

    this.IsLoading = false;
}

function MSL_GetDefaultFilterValues() {
    var filterValues = '';
    if (this.DefaultSourceFields != null) {
        var i, len = this.DefaultSourceFields.length;
        for (i = 0; i < len; i++) {
            var field = this.DefaultSourceFields[i];
            if (!SM.IsNE(field.FieldName)) {
                var fieldValue = MSL_GetDefaultFilterValue.call(this, field.FieldName);
                if (!SM.IsNE(fieldValue)) {
                    if (filterValues.length > 0)
                        filterValues += '_pn_';
                    filterValues += field.DestinationFieldName + '_pv_' + fieldValue;
                }
            }
        }
    }
    return filterValues;
}

function MSL_GetDefaultFilterValue(fieldName) {
    if (SM.IsNE(fieldName))
        throw new Error('Не передан параметр fieldName.');

    if (this.DefaultSourceFieldsByName == null) {
        this.DefaultSourceFieldsByName = new Array();
        if (this.DefaultSourceFields != null) {
            var i, len = this.DefaultSourceFields.length;
            for (i = 0; i < len; i++) {
                var sourceField = this.DefaultSourceFields[i];
                if (!SM.IsNE(sourceField.FieldName))
                    this.DefaultSourceFieldsByName[sourceField.FieldName.toLowerCase()] = sourceField;
            }
        }
    }
    var sourceField = this.DefaultSourceFieldsByName[fieldName.toLowerCase()];
    if (sourceField == null)
        throw new Error('Не удалось получить поле источник "' + fieldName + '" из настройки.');

    var defaultValue = null;

    var listForm = window.ListForm;
    if (listForm == null && window.parent.ListForm != null)
        listForm = window.parent.ListForm;
    if (listForm != null) {
        var isSourceLookup = sourceField.SourceType == 'DBFieldLookupSingle' || sourceField.SourceType == 'DBFieldLookupMulti';
        var isDestinationLookup = sourceField.DestinationType == 'Lookup' || sourceField.DestinationType == 'LookupMulti';
        var listFormField = listForm.GetField(fieldName);
        var getFromServer = true;
        if (listFormField != null) {
            if (!listFormField.ReadOnly) {
                defaultValue = listFormField.GetValue();
                getFromServer = false;
            }
        }
        if (getFromServer) {
            //получаем аяксом значение поля
            if (listForm.List() != null) {
                var loadedFields = new Array();
                loadedFields.push(fieldName);
                var sourceItem = listForm.List().GetItemByID(listForm.ItemID, loadedFields);
                if (sourceItem != null) {
                    defaultValue = sourceItem.GetValue(fieldName);
                    if (defaultValue != null) {
                        if (sourceField.SourceType == 'DBFieldLookupSingle') {
                            var lookupID = defaultValue.getAttribute('LookupID');
                            var lookupText = defaultValue.getAttribute('LookupText');
                            if (!IsNullOrEmpty(lookupID) && !IsNullOrEmpty(lookupText)) {
                                var lookupValue = new Object();
                                lookupValue.LookupID = lookupID;
                                lookupValue.LookupText = lookupText;
                                defaultValue = lookupValue;
                            }
                            else
                                defaultValue = null;
                        }
                        else if (sourceField.SourceType == 'DBFieldLookupMulti')
                            defaultValue = null;
                    }
                }
            }
        }
        if (defaultValue != null && isSourceLookup) {
            if (isDestinationLookup) {
                defaultValue = defaultValue.LookupText + '_lid_' + defaultValue.LookupID;
            }
            else {
                //если назначение - не подстановка, то берем текст подстановки.
                defaultValue = defaultValue.LookupText;
            }
        }
    }

    return defaultValue;
}

function MSL_GetClientFilterValues() {
    var values = null;
    if (window.ListForm == null)
        return null;
    if (!ListForm.IsEditForm)
        throw new Error('Операция доступна только на форме редактирования карточки документа.');

    if (this.ClientFilterFields != null) {
        var i, len = this.ClientFilterFields.length;
        var stClientValues = '';
        for (i = 0; i < len; i++) {
            var clientFilterFieldName = this.ClientFilterFields[i];
            var listFormField = ListForm.GetField(clientFilterFieldName);
            if (listFormField != null && !listFormField.ReadOnly) {
                var fieldValue = listFormField.GetValue();
                var clientValue = null;
                if (listFormField.Type == 'DBFieldText' ||
                    listFormField.Type == 'DBFieldMultiLineText' ||
                    listFormField.Type == 'DBSystemFieldText' ||
                    listFormField.Type == 'DBFieldNumber' ||
                    listFormField.Type == 'DBFieldInteger' ||
                    listFormField.Type == 'DBFieldDateTime') {
                    clientValue = fieldValue;
                    if (clientValue == '')
                        clientValue = null;
                }
                else if (listFormField.Type == 'DBFieldChoice' && listFormField.TypedField.DisplayType != 'Checkboxes') {
                    clientValue = fieldValue;
                }
                else if (listFormField.Type == 'DBFieldBoolean') {
                    clientValue = fieldValue.toString();
                }
                else if (listFormField.Type == 'DBFieldLookupSingle') {
                    if (fieldValue != null && fieldValue.LookupID != 0)
                        clientValue = fieldValue.LookupID.toString();
                }
                else if (listFormField.Type == 'DBFieldLookupMulti') {
                    if (fieldValue != null) {
                        var j, jlen = fieldValue.length;
                        var stIDs = '';
                        for (j = 0; j < jlen; j++) {
                            var lookupValue = fieldValue[j];
                            if (lookupValue != null && lookupValue.LookupID != 0) {
                                if (stIDs.length > 0)
                                    stIDs += ',';
                                stIDs += lookupValue.LookupID;
                            }
                        }
                        if (stIDs.length > 0)
                            clientValue = stIDs;
                        else
                            clientValue = '0';
                    }
                }
                else
                    throw new Error('Поле ' + listFormField.Name + ' типа ' + listFormField.Type + ' не поддерживается в SQL-условии фильтрации.');

                if (stClientValues.length > 0)
                    stClientValues += '_pn_';
                stClientValues += listFormField.ID;

                //устанавливаем значение emptyValue, т.к. RequestParamsBuilder на сервере не воспринимает параметры с пустыми значениями,
                //а их нужно передавать с клиента.
                if (clientValue == null)
                    clientValue = 'emptyValue';
                else if (clientValue == '')
                    clientValue = 'emptyText';
                stClientValues += '_pv_' + encodeURIComponent(clientValue);
            }
        }
        if (stClientValues.length > 0)
            values = stClientValues;
    }
    return values;
}

function MSL_GetValue() {
    var value = null;
    if (this.Value != null) {
        if (!this.IsMultiple)
            value = this.Value.SingleValue;
        else
            value = this.Value.MultiValue;
    }
    return value;
}

function MSL_IsChanged() {
    return this.Changed == true;
}

function MSL_OnSave(saveEventArgs) {
    if (this.ListFormField != null) {
        if (this.ListFormField.Required) {
            var canSave = false;
            var isEmptyValue = true;
            if (this.Value != null) {
                if (!this.IsMultiple) {
                    if (this.Value.SingleValue != null) {
                        if (this.Value.SingleValue.LookupID != '0' && this.Value.SingleValue.LookupID != null) {
                            canSave = true;
                            isEmptyValue = false;
                        }
                    }
                }
                else {
                    if (this.Value.MultiValue.length > 0) {
                        canSave = true;
                        isEmptyValue = false;
                    }
                }
            }
            saveEventArgs.CanSave = canSave;
            saveEventArgs.IsEmptyValue = isEmptyValue;
        }
    }
}

function MSL_IsEmptyValue() {
    var isEmptyValue = true;
    if (this.Value != null) {
        if (!this.IsMultiple) {
            if (this.Value.SingleValue != null) {
                if (this.Value.SingleValue.LookupID != '0' && this.Value.SingleValue.LookupID != null) {
                    isEmptyValue = false;
                }
            }
        }
        else {
            if (this.Value.MultiValue.length > 0) {
                isEmptyValue = false;
            }
        }
    }
    return isEmptyValue;
}

function MSLLookupSection(field) {
    this.Field = field;

    //Properties
    this.LookupListID = this.LookupListID.toString()
}

function MSLFieldValue(xmlElement, field) {
    this.Field = field;
    this.XmlElement = xmlElement;

    //Methods
    this.GetAttribute = MSL_GetAttribute;
    this.GetBooleanAttribute = MSL_GetBooleanAttribute;
    this.Persist = MSL_Persist;

    //Properties
    if (!this.Field.IsMultiple) {
        var singleNode = this.XmlElement.selectSingleNode('ControlValue');
        if (singleNode != null)
            this.SingleValue = new MSLFieldValueItem(singleNode, this);
    }
    else {
        this.MultiValue = new Array();
        this.MultiValue.remove = MSL_ArrayRemove;
        var multiNodes = this.XmlElement.selectNodes('ControlValue');
        var i, len = multiNodes.length;
        for (i = 0; i < len; i++) {
            var lookupNode = multiNodes[i];
            var lookupValue = new MSLFieldValueItem(lookupNode, this);
            this.MultiValue.push(lookupValue);
        }
    }
    this.LookupItemsElement = this.XmlElement;
}

///////////////////MSLField - Methods////////////////////

var msl_fieldsByTitle = null;
function MSL_AddFieldToCollection(field) {
    if (msl_fieldsByTitle == null)
        msl_fieldsByTitle = new Array();
    msl_fieldsByTitle[field.FieldTitle] = field;
}

//debugger
function GetMultiSourceField(fieldTitle) {
    var field = null;
    if (msl_fieldsByTitle != null)
        field = msl_fieldsByTitle[fieldTitle];
    return field;
}

//debugger
function MSL_ReturnLookupResult(resultXml) {
    this.DisableChangeHandler = true;
    if (!IsNullOrEmpty(resultXml)) {
        var axoResult = SM.LoadXML(resultXml);
        var resultDocument = axoResult.documentElement.ownerDocument;
        if (!this.IsMultiple) {
            var singleNode = resultDocument.selectSingleNode('ControlValue');
            if (singleNode != null) {
                if (!this.IsListControlMode) {
                    if (this.Value.SingleValue != null)
                        this.Value.SingleValue.Delete();
                }
                var lookupItemElement = singleNode.cloneNode(true);
                this.Value.SingleValue = new MSLFieldValueItem(lookupItemElement, this.Value);
                this.Value.LookupItemsElement.appendChild(lookupItemElement);
            }
        }
        else {
            var multiNodes = resultDocument.selectNodes('ReturnItems/ControlValue');
            var i, len = multiNodes.length;
            for (i = 0; i < len; i++) {
                var lookupNode = multiNodes[i];
                var lookupID = lookupNode.getAttribute('LookupID');
                var lookupListID = lookupNode.getAttribute('LookupListID');
                if (!IsNullOrEmpty(lookupID) && !IsNullOrEmpty(lookupListID)) {
                    var existingNode = this.Value.LookupItemsElement.selectSingleNode('ControlValue[@LookupID="' + lookupID + '"][@LookupListID="' + lookupListID + '"]');
                    if (existingNode == null) {
                        lookupNode = lookupNode.cloneNode(true);
                        var lookupValue = new MSLFieldValueItem(lookupNode, this.Value);
                        this.Value.MultiValue.push(lookupValue);
                        this.Value.LookupItemsElement.appendChild(lookupNode);
                    }
                }
            }
        }
    }
    this.DisableChangeHandler = false;
    this.SaveControlValue();
}

function MSL_OpenWindow() {
    var field = this;
    if (!field.Disabled) {
        var pageName = field.IsNewWindowDesign ? 'MSLWindow.v2.aspx' : 'MSLWindow.aspx';

        var url = field.WebUrl + field.ModulePath + '/' + pageName + '?rnd=' + Math.random();
        var params = '';
        params += '&listID=' + encodeURI(field.ListID.toString());
        params += '&fieldID=' + encodeURI(field.FieldID.toString());
        url += params;
        var winTitle = window.TN.TranslateKey('MSLFieldControl.ItemChoice');
        if (field.IsNewWindowDesign)
            window.OpenPopupWindow(url, field.WindowWidth, field.WindowHeight, '19px 16px 10px 16px !important');
        else
            window.OpenFloatWindow(url, winTitle, field.WindowWidth, field.WindowHeight);
    }
}

function MSL_GetLookupSection(listID) {
    var section = null;
    if (!IsNullOrEmpty(listID)) {
        section = this.LookupSectionsByListID[listID];
    }
    return section;
}

function MSL_CreateLookupControl() {
    if (!this.IsListControlMode) {
        var floatContainer = window.document.createElement('table');
        this.ControlContainer.ActionControl = floatContainer;
        floatContainer.border = 0;
        floatContainer.cellPadding = 0;
        floatContainer.cellSpacing = 0;


        var trFloatContainer = floatContainer.insertRow(-1);

        var tdFloatContainer = trFloatContainer.insertCell(-1);
        tdFloatContainer.className = 'msl_font';

        var divLookupValues = window.document.createElement('div');
        tdFloatContainer.appendChild(divLookupValues);
        this.EditControl = divLookupValues;
        divLookupValues.Field = this;
        var className = 'msl_editctl';
        divLookupValues.className = className;
        if (!IsNullOrEmpty(this.ControlWidth) && this.ControlWidth != '0')
            divLookupValues.style.width = this.ControlWidth + 'px';

        var tdOpenFloatChoice = trFloatContainer.insertCell(-1);
        this.ControlContainer.OpenWindowCell = tdOpenFloatChoice;
        tdOpenFloatChoice.style.paddingRight = '5px';
        tdOpenFloatChoice.style.paddingLeft = '5px';
        tdOpenFloatChoice.innerHTML = "<img src='/_layouts/images/addressbook.gif' border='0' style='cursor:pointer'/>";
        var imgLookupEdit = tdOpenFloatChoice.children[0];
        var field = this;
        imgLookupEdit.onclick = function () { field.OpenWindow(); }

        if (!this.IsMultiple) {
            var tdClearContainer = trFloatContainer.insertCell(-1);
            this.ControlContainer.ClearCell = tdClearContainer;
            tdClearContainer.innerHTML = "<img src='/_layouts/images/delete.gif' border='0' style='cursor:pointer'/>";
            var imgClear = tdClearContainer.children[0];
            imgClear.onclick = function () { if (field.Value.SingleValue != null) field.Value.SingleValue.Delete(); }
        }
        else {
            var tbMultiValueControls = window.document.createElement('table');
            this.EditControl.appendChild(tbMultiValueControls);
            this.MultiValueTable = tbMultiValueControls;
            tbMultiValueControls.border = 0;
            tbMultiValueControls.cellPadding = 0;
            tbMultiValueControls.cellSpacing = 0;
        }
        this.ControlContainer.appendChild(floatContainer);
    }
    else {
        this.CreateListControl();
    }
}

//debugger
function MSL_CreateListControl() {
    var listControl = new ListControl();
    this.ListControl = listControl;
    listControl.Field = this;
    listControl.IsMultiple = this.IsMultiple;
    listControl.IsDropDownList = false;
    listControl.EnableOpenWin = true;
    listControl.WrapGrid = false;
    listControl.Init();

    var controlWidth = this.ControlWidth;
    if (IsNullOrEmpty(this.ControlWidth) || this.ControlWidth == '0' || this.ControlWidth == 0)
        controlWidth = 400;
    listControl.SetControlWidth(controlWidth);

    listControl.InitDeleteValueControl = MSLListControl_InitDeleteValueControl;
    listControl.CreateValueControl = MSLListControl_CreateValueControl;
    listControl.GetGridValueKey = MSLListControl_GetGridValueKey;
    listControl.OnDeleteValue = MSLListControl_OnDeleteValue;
    var thisObj = this;

    if (listControl.OpenWinDiv != null) {
        listControl.OpenWinDiv.onclick = function (evt) { thisObj.OpenWindow(); return SM.CancelEvent(evt); }
        listControl.OpenWinDiv.oncontextmenu = function (evt) { return SM.CancelEvent(evt); }
    }

    listControl.OpenContextGrid = MSLListControl_OpenContextGrid;
    listControl.OpenContextGridCompleted = MSLListControl_OpenContextGridCompleted;
    listControl.GetGridRowValue = MSLListControl_GetGridRowValue;
    listControl.OnSetGridValue = MSLListControl_OnSetGridValue;

    var divCreateItemLink = null;
    if (this.ShowCreateItemLink) {
        var divCreateItemLink = window.document.createElement('div');
        divCreateItemLink.className = 'dbl_divCreateItemLink';
        var lnkCreateItem = window.document.createElement('a');
        divCreateItemLink.appendChild(lnkCreateItem);
        lnkCreateItem.className = 'dbf_lookup_link';
        lnkCreateItem.style.verticalAlign = 'middle';
        lnkCreateItem.innerHTML = this.CreateItemLinkText;
        if (!IsNullOrEmpty(this.CreateItemLinkToolTip))
            lnkCreateItem.title = this.CreateItemLinkToolTip;

        lnkCreateItem.href = 'javascript:';
        lnkCreateItem.onclick = function (evt) { thisObj.CreateLookupItem(); SM.CancelEvent(evt); return false; }
    }

    this.ControlContainer.appendChild(listControl.Container);
    if (divCreateItemLink != null)
        this.ControlContainer.appendChild(divCreateItemLink);
}

//debugger
function MSL_CreateLookupItem() {
    var sourceUrl = this.ModulePath + '/AddCreatedLookupItem.aspx'
    sourceUrl += '?parentFieldID=' + this.FieldID;
    sourceUrl += '&parentListID=' + this.ListID;

    var createUrl = this.CreationLookupListUrl + '/EditForm.aspx';
    var params = '';
    params += '?Source=' + escape(sourceUrl);
    params += '&setIdentityToSource=true';
    if (window.ListForm != null) {
        params += '&parentItemID=' + window.ListForm.ItemID;
        params += '&parentListID=' + window.ListForm.ListID;
    }


    if (!IsNullOrEmpty(this.CreationRequestParams))
        params += '&' + this.CreationRequestParams;

    createUrl += params;
    MSL_OpenWin(createUrl);
}

//debugger
function MSLListControl_GetGridValueKey(lookupValue) {
    if (lookupValue == null)
        throw new Error(SM.SR(window.TN.TranslateKey('MSLFieldControl.EmptyParamException'), '{ParamName}', 'lookupValue'));
    var valueKey = null;
    var value = lookupValue.LookupID + '_' + lookupValue.LookupListID;
    if (value != null)
        valueKey = value;

    if (!IsNullOrEmpty(valueKey))
        valueKey = valueKey.toString();

    return valueKey;
}

function MSLListControl_InitDeleteValueControl(divDeleteValue, rowValue) {
    var lookupValue = rowValue;
    var thisObj = this;
    var deleteControl = divDeleteValue;
    deleteControl.onclick = function (evt) {
        thisObj.ClearValue(lookupValue, true);
        return SM.CancelEvent(evt);
    }
}


function MSLListControl_CreateValueControl(lookupValue) {
    var valueControl = lookupValue.CreateLookupLink();
    return valueControl;
}

//debugger
function MSLListControl_OnDeleteValue(lookupValue) {
    if (lookupValue != null) {
        if (this.IsDeletingPreviousValue)
            this.Field.DisableChangeHandler = true;
        lookupValue.Delete();
        if (this.IsDeletingPreviousValue)
            this.Field.DisableChangeHandler = false;
    }
}

//debugger
function MSLListControl_OpenContextGrid() {
    var filterValue = this.TextFilter.value;
    this.CurrentLookupValuesNode = null;
    if (!IsNullOrEmpty(filterValue)) {
        var field = this.Field;
        var url = field.WebUrl + field.ModulePath + '/MSLContextGrid.aspx?rnd=' + Math.random();

        var params = '';
        params += '&listID=' + encodeURI(field.ListID.toString());
        params += '&fieldID=' + encodeURI(field.FieldID.toString());
        params += '&filterValue=' + encodeURIComponent(filterValue);

        if (window.ListForm != null && !IsNullOrEmpty(window.ListForm.ItemID))
            params += '&listFormItemID=' + window.ListForm.ItemID;

        //добавляем фильтрацию значений по умолчанию
        var defaultFilterValues = MSL_GetDefaultFilterValues.call(field);
        if (!SM.IsNE(defaultFilterValues))
            params += '&defaultFilterValues=' + encodeURIComponent(defaultFilterValues);

        //получаем клиентские значения полей для их использования в SQL-фильтрации
        var clientValues = MSL_GetClientFilterValues.call(field);
        if (!SM.IsNE(clientValues))
            params += '&clientValues=' + clientValues;

        url += params;

        var xmlRequest = SM.GetXmlRequest();
        xmlRequest.open('GET', url, true);
        var thisObj = this;
        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                xmlRequest.onreadystatechange = new Function();
                var responseText = xmlRequest.responseText;
                thisObj.OpenContextGridCompleted(responseText);
            }
        };
        xmlRequest.send(null);
    }
}

//debugger
function MSLListControl_OpenContextGridCompleted(responseText) {
    if (IsNullOrEmpty(responseText))
        throw new Error(SM.SR(window.TN.TranslateKey('MSLFieldControl.EmptyParamException'), '{ParamName}', 'responseText'));

    //alert(responseText);
    if (responseText.indexOf('ResponseError:') == 0) {
        alert(responseText);
        return;
    }
    var splResult = responseText.split('_lookupValuesSeparator_');
    if (splResult.length == 2) {
        var gridHtml = splResult[0];
        var lookupValuesXml = splResult[1];
        if (!IsNullOrEmpty(gridHtml) && !IsNullOrEmpty(lookupValuesXml)) {
            var axoLookupValues = SM.LoadXML(lookupValuesXml);
            var lookupValuesDocument = axoLookupValues.documentElement.ownerDocument;
            this.CurrentLookupValuesNode = lookupValuesDocument.selectSingleNode('ArrayOfControlValue');
            this.SetSelectionGrid(gridHtml);
        }
    }
    this.ShowGrid();
}

function MSLListControl_GetGridRowValue(row) {
    if (row == null)
        throw new Error(SM.SR(window.TN.TranslateKey('MSLFieldControl.EmptyParamException'), '{ParamName}', 'row'));
    var lookupID = row.getAttribute('LookupID');
    var lookupListID = row.getAttribute('LookupListID');
    var value = null;
    if (!IsNullOrEmpty(lookupID) && !IsNullOrEmpty(lookupListID) && this.CurrentLookupValuesNode != null) {
        var lookupValueNode = this.CurrentLookupValuesNode.selectSingleNode("ControlValue[@LookupID='" + lookupID + "'][@LookupListID='" + lookupListID + "']");
        if (lookupValueNode == null)
            throw new Error(window.TN.TranslateKey('MSLFieldControl.GetGridRowValue.NotFoundException') + lookupID);

        lookupValueNode = lookupValueNode.cloneNode(true);
        value = new MSLFieldValueItem(lookupValueNode, this.Field.Value, true);
    }
    return value;
}

//debugger
function MSLListControl_OnSetGridValue(lookupValue) {
    if (lookupValue != null) {
        var field = this.Field;
        field.DisableChangeHandler = true;

        if (!field.IsMultiple) {
            if (field.Value.SingleValue != null)
                field.Value.SingleValue.Delete();

            field.Value.SingleValue = lookupValue
            field.Value.LookupItemsElement.appendChild(lookupValue.XmlElement);
        }
        else {
            field.Value.MultiValue.push(lookupValue);
            field.Value.LookupItemsElement.appendChild(lookupValue.XmlElement);
        }

        field.DisableChangeHandler = false;
        field.SaveControlValue();
    }
}

function MSL_SaveControlValue() {
    this.Value.Persist();
    if (!this.IsLoading)
        this.Changed = true;
    if (!this.DisableChangeHandler && this.ListFormField != null)
        this.ListFormField.OnChange();
}

function MSL_Disable() {
    if (this.ControlContainer != null) {
        this.Disabled = true;
        if (!this.IsListControlMode) {
            if (this.ControlContainer.OpenWindowCell != null)
                this.ControlContainer.OpenWindowCell.style.display = 'none';
            if (this.ControlContainer.ClearCell != null)
                this.ControlContainer.ClearCell.style.display = 'none';
            if (this.IsMultiple) {
                var i, len = this.Value.MultiValue.length;
                for (i = 0; i < len; i++) {
                    var lookupValue = this.Value.MultiValue[i];
                    if (lookupValue.DeleteControl != null)
                        lookupValue.DeleteControl.style.display = 'none';
                }
            }
        }
        else if (this.ListControl != null)
            this.ListControl.Disable();
    }
}

function MSL_Enable() {
    if (this.ControlContainer != null) {
        this.Disabled = false;
        if (!this.IsListControlMode) {
            if (this.ControlContainer.OpenWindowCell != null)
                this.ControlContainer.OpenWindowCell.style.display = '';
            if (this.ControlContainer.ClearCell != null)
                this.ControlContainer.ClearCell.style.display = '';
            if (this.IsMultiple) {
                var i, len = this.Value.MultiValue.length;
                for (i = 0; i < len; i++) {
                    var lookupValue = this.Value.MultiValue[i];
                    if (lookupValue.DeleteControl != null)
                        lookupValue.DeleteControl.style.display = '';
                }
            }
        }
        else if (this.ListControl != null)
            this.ListControl.Enable();
    }
}

/////////////////////END///////////////////////




////////////////////MSLFieldValue - Methods//////////////////////
function MSL_Persist() {
    this.Field.HiddenFormValue.value = SM.PersistXML(this.XmlElement);
}
/////////////////////////////////////////////////////////////////





///////////////////MSLFieldValueItem - Methods////////////////////

function MSLFieldValueItem(xmlElement, value, isContextGridValue) {
    this.Value = value;
    this.Field = value.Field;
    this.XmlElement = xmlElement;

    //Methods
    this.GetAttribute = MSL_GetAttribute;
    this.GetBooleanAttribute = MSL_GetBooleanAttribute;
    this.CreateLookupLink = MSL_CreateLookupLink;
    this.CreateLookupValueControl = MSL_CreateLookupValueControl;
    this.Delete = MSLFieldValueItem_Delete;

    //Properties
    this.LookupID = this.GetAttribute('LookupID');
    this.LookupText = this.GetAttribute('LookupText');
    this.LookupListID = this.GetAttribute('LookupListID');
    this.UrlAccessCode = this.GetAttribute('UrlAccessCode');
    this.PermissionCodeSP = this.GetAttribute('PermissionCodeSP');

    //Initialisation
    this.LookupSection = this.Field.GetLookupSection(this.LookupListID);
    if (!isContextGridValue)
        this.CreateLookupValueControl();
}

//debugger
function MSL_CreateLookupLink() {
    var link = null;
    if (!IsNullOrEmpty(this.LookupID) && !IsNullOrEmpty(this.LookupText)) {
        var lookupID = this.LookupID;
        if (this.LookupSection != null) {
            if (this.LookupSection.Field.ShowLookupLink) {
                link = window.document.createElement('a');
                link.innerHTML = this.LookupText;
                link.className = 'msl_LookupLink';
                var lookupFormUrl = this.LookupSection.DispFormUrl;
                if (this.Field.IsEditFormLookupLink)
                    lookupFormUrl = this.LookupSection.EditFormUrl;
                var closePageUrl = this.Field.ClosePageUrl;
                //link.title = lookupID + ' (' + this.LookupSection.LookupListName + ')';
                var accessCode = null;
                if (this.LookupSection.Field.GrantAccessViaUrl)
                    accessCode = this.UrlAccessCode;

                var field = this.Field;
                var lookupSection = this.LookupSection;
                var thisObj = this;

                var url = lookupFormUrl + '?ID=' + lookupID + '&Source=' + closePageUrl;
                if (!IsNullOrEmpty(accessCode))
                    url += '&ac=' + accessCode;
                if (field.IsEditFormLookupLink)
                    url += '&showDispFormWithoutEditAccess=true';

                link.href = url;

                link.onclick = function (evt) {
                    MSL_OpenWin(url);
                    SM.CancelEvent(evt);
                    return false;
                }
            }
            else {
                link = window.document.createElement('span');
                link.innerHTML = this.LookupText;
                link.className = 'msl_LookupText';
                //link.title = lookupID + ' (' + this.LookupSection.LookupListName + ')';
            }
        }
    }
    return link;
}

function MSL_OpenWin(url) {
    if (IsNullOrEmpty(url))
        throw new Error('Параметр url не может быть пустым.');

    var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
    var openedWin = window.open(url, '_blank', winFeatures);
}


function MSLFieldValueItem_Delete() {
    if (!this.Field.Disabled) {
        if (!this.Field.IsMultiple)
            this.Field.Value.SingleValue = null;
        else {
            var thisObj = this;
            this.Field.Value.MultiValue.remove(function (item) {
                return item.LookupID == thisObj.LookupID && item.LookupListID == thisObj.LookupListID;
            });
        }

        this.Value.XmlElement.removeChild(this.XmlElement);
        if (!this.Field.IsListControlMode)
            this.Control.style.display = 'none';
        this.Field.SaveControlValue();
    }
}

//debugger
//Меняет контрол соответствии с новым значением котрола
function MSL_CreateLookupValueControl() {
    if (!this.Field.IsMultiple) {
        if (this.Value != null) {
            this.Value.SingleValue = this;
            if (!this.Field.IsListControlMode) {
                if (this.Field.EditControl.lastChild != null)
                    this.Field.EditControl.lastChild.style.display = 'none';
                var lookupLink = this.CreateLookupLink();
                this.Field.EditControl.appendChild(lookupLink);
                this.Control = lookupLink;
            }
            else
                this.Field.ListControl.SetValue(this);
        }
    }
    else {
        if (!this.Field.IsListControlMode) {
            var trLookupValue = this.Field.MultiValueTable.insertRow(-1);
            var tdDeleteValue = trLookupValue.insertCell(-1);
            tdDeleteValue.style.paddingTop = '2px';
            tdDeleteValue.style.paddingRight = '2px';

            tdDeleteValue.innerHTML = "<img src='/_layouts/images/delete.gif' border='0' style='cursor:pointer'/>";
            var imgDelete = tdDeleteValue.children[0];
            var thisObj = this;
            imgDelete.onclick = function () { thisObj.Delete(); }
            this.DeleteControl = tdDeleteValue;

            var tdLookupValue = trLookupValue.insertCell(-1);
            var lookupLink = this.CreateLookupLink();
            tdLookupValue.appendChild(lookupLink);
            this.Control = trLookupValue;
        }
        else
            this.Field.ListControl.SetValue(this);
    }
}

/////////////////////END///////////////////////





///////////////Common Methods//////////////////////
function MSL_GetAttribute(attributeName) {
    return GetAttributeValue(this.XmlElement, attributeName);
}

function MSL_GetBooleanAttribute(attributeName) {
    return GetBooleanAttributeValue(this.XmlElement, attributeName);
}

//проверка строки на пусто/нул
function IsNullOrEmpty(str) {
    return (str == null || str == '');
}

//получение текстового атрибута ХМЛ-элемента
function GetAttributeValue(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function GetBooleanAttributeValue(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = GetAttributeValue(xmlElement, attributeName);
    if (!IsNullOrEmpty(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function ClearChildNodes(xmlElement) {
    if (xmlElement != null) {
        while (xmlElement.firstChild != null)
            xmlElement.removeChild(xmlElement.firstChild);
    }
}

function MSL_ArrayRemove(isRemovingItemPredicate) {
    if (isRemovingItemPredicate == null)
        throw new Error(SM.SR(window.TN.TranslateKey('MSLFieldControl.EmptyParamException'), '{ParamName}', 'isRemovingItemPredicate'));
    var j = 0;
    while (j < this.length) {
        var isRemovingItem = false;
        if (isRemovingItemPredicate == null) {
            if (this[j] == itemToRemove)
                isRemovingItem = true;
        }
        else {
            if (isRemovingItemPredicate(this[j]))
                isRemovingItem = true;
        }
        if (isRemovingItem)
            this.splice(j, 1);
        else
            j++;
    }
}