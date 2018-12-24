//debugger
function CMField(pnlContainerID, hdnFormValueID, valueXml) {
    this.IsLoading = true;

    //устанавливаем идшник инстанса, чтобы корректно работал CreateRowHandler
    this.InstanceID = Math.random().toString();

    var thisObj = this;
    this.ControlContainer = window.document.getElementById(pnlContainerID);
    this.HiddenFormValue = window.document.getElementById(hdnFormValueID);
    this.ValueDocument = window.SM.LoadXML(valueXml);
    this.ValueElement = this.ValueDocument.selectSingleNode('ItemCollection');

    //Common Methods
    this.GetAttribute = CM_GetAttribute;
    this.GetBooleanAttribute = CM_GetBooleanAttribute;
    this.GetIntegerAttribute = CM_GetIntegerAttribute;

    //Properties
    this.WebID = this.WebID.toString();
    this.ListID = this.ListID.toString();
    this.FieldID = this.FieldID.toString();
    this.ItemID = this.ItemID.toString();
    this.EmptyRowsCount = this.EmptyRowsCount.toString();
    this.ControlWidth = this.ControlWidth.toString();
    this.ShowRowNumber = !this.IsNewDesign;

    //this.IsTemplatesMode = false;
    this.OpenWinFeatures = '';
    if (this.IsNewDesign)
        this.OpenWinFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';

    //Methods
    this.CreateCommission = CM_CreateCommission;
    this.ResetRowsLayout = CM_ResetRowsLayout;
    this.FixPreviewSize = CM_FixPreviewSize;

    this.Validate = CM_Validate;

    //Interface
    this.IsFilled = CM_IsFilled;
    this.Disable = CM_Disable;
    this.OnSave = CM_ValidateOnSave;
    this.OnInit = CMField_OnListFormInit;

    this.PersistValue = CM_PersistValue;
    this.IsEmptyValue = CM_IsEmptyValue;

    this.CreateRowControlsHandlers = new Array();
    this.AddCreateRowControlsHandler = function (handler) {
        if (handler != null)
            thisObj.CreateRowControlsHandlers.push(handler);
    }
    this.ExecuteCreateRowControlsHandlers = CMField_ExecuteCreateRowControlsHandlers;

    //Initialisation
    window.CMFieldInstance = this;

    //hierarchy
    if (this.HierarchyControl != null && this.HierarchyControl.ShowRelations) {
        this.MSLField = null;
        if (window.GetMultiSourceField != null)
            this.MSLField = window.GetMultiSourceField(this.HierarchyControl.FieldTitle);
        RLControl.call(this.HierarchyControl, this.MSLField);
    }
    else
        this.HierarchyControl = null;

    CM_InitActionsMenu.call(this);
    CM_InitTableFields.call(this);
    CM_InitTableHeader.call(this);
    CM_InitCommissions.call(this);
    $(function () { CM_SetTextAreaWidth.call(thisObj); });
    CM_WaitNotCreatedItems.call(this);
    this.PersistValue();
    CM_AddSaveHandler.call(this);

    //добавлено для работы на dispForm (Дима Т.)
    if (!this.IsEditMode || this.Disabled)
        this.Disable();

    this.IsLoading = false;
}
//debugger

///////////////////CMField - Methods////////////////////

function GetCommissionsField(fieldName) {
    return window.CMFieldInstance;
}

function CM_ValidateOnSave(saveEventArgs) {
    if (this.ListFormField != null) {
        if (this.ListFormField.Required) {
            var isEmptyValue = !this.IsFilled();
            saveEventArgs.CanSave = !isEmptyValue;
            saveEventArgs.IsEmptyValue = isEmptyValue;
        }
    }
    if (saveEventArgs.CanSave) {
        var validationResult = CM_Validate.call(this);
        if (!SM.IsNE(validationResult)) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = validationResult;
        }
    }
}

function CM_IsEmptyValue() {
    var isEmptyValue = !this.IsFilled();
    return isEmptyValue;
}

function CM_InitActionsMenu() {
    var divMenu = window.document.createElement('div');
    this.DivMenu = divMenu;
    var tbMenu = window.document.createElement('table');
    this.MenuTable = tbMenu;
    var trMenu = tbMenu.insertRow(-1);
    this.MenuRow = trMenu;
    var thisObj = this;

    var tdCreateImg = trMenu.insertCell(-1);
    var imgCreate = window.document.createElement('img');
    imgCreate.border = 0;
    imgCreate.src = '/_layouts/images/newitem.gif';
    imgCreate.style.cursor = 'pointer';
    imgCreate.onclick = function () { if (!thisObj.Disabled) { thisObj.CreateCommission(null, null); } }

    var tdCreate = trMenu.insertCell(-1);
    tdCreate.style.whiteSpace = 'noWrap';
    var lnkCreate = window.document.createElement('a');
    lnkCreate.className = 'cm_link';
    lnkCreate.href = 'javascript:';
    lnkCreate.innerHTML = this.CreateLinkText;
    lnkCreate.onclick = function () { if (!thisObj.Disabled) { thisObj.CreateCommission(null, null); } }

    tdCreateImg.appendChild(imgCreate);
    tdCreate.appendChild(lnkCreate);

    if (this.EnableFullCreation) {
        var tdCreateRequestImg = trMenu.insertCell(-1);
        tdCreateRequestImg.style.paddingLeft = '10px';
        var imgCreateRequest = window.document.createElement('img');
        imgCreateRequest.border = 0;
        imgCreateRequest.src = '/_layouts/images/newitem.gif';
        imgCreateRequest.style.cursor = 'pointer';
        imgCreateRequest.onclick = function () { CM_CreateRequestCommission.call(thisObj); }

        var tdCreateRequest = trMenu.insertCell(-1);
        tdCreateRequest.style.whiteSpace = 'noWrap';
        var lnkCreateRequest = window.document.createElement('a');
        lnkCreateRequest.className = 'cm_link';
        lnkCreateRequest.href = 'javascript:';
        lnkCreateRequest.innerHTML = this.CreateRequestLinkText;
        lnkCreateRequest.onclick = function () { CM_CreateRequestCommission.call(thisObj); }

        tdCreateRequestImg.appendChild(imgCreateRequest);
        tdCreateRequest.appendChild(lnkCreateRequest);
    }
    if (this.HierarchyControl != null) {
        var tdHierarchy = trMenu.insertCell(-1);
        this.HierarchyCell = tdHierarchy;
        tdHierarchy.IsHeararchyCell = true;
        tbMenu.style.width = '100%';
        tdHierarchy.style.width = '100%';
        tdHierarchy.align = 'right';
        tdHierarchy.appendChild(this.HierarchyControl.Container);
    }
    divMenu.appendChild(tbMenu);

    this.ControlContainer.appendChild(divMenu);

}


function CM_InitTableFields() {
    var tableFields = this.TableFields;
    var i, len = tableFields.length;
    this.TableFieldsByTitle = new Array();
    for (i = 0; i < len; i++) {
        var tableField = tableFields[i];
        CMTableField.call(tableField, this);
        if (!window.SM.IsNE(tableField.Title)) {
            this.TableFieldsByTitle[tableField.Title] = tableField;
        }
    }
}

function CM_InitTableHeader() {
    var divTable = window.document.createElement('div');

    var cmTable = window.document.createElement('table');
    this.Table = cmTable;
    cmTable.border = 0;
    cmTable.cellSpacing = 0;
    cmTable.cellPadding = 0;
    cmTable.className = 'cm_table';
    if (this.ControlWidth > 0)
        cmTable.style.width = this.ControlWidth + 'px';

    var i, len = this.TableFields.length;
    if (len > 0) {
        var trHeader = cmTable.insertRow(-1);

        var firstHeaderOccured = false;
        if (!this.IsNewDesign) {
            firstHeaderOccured = true;
            var tdActions = trHeader.insertCell(-1);
            tdActions.className = 'cm_table_header_first';
            tdActions.style.width = '20px';
            tdActions.innerHTML = '&nbsp;';
            this.HeaderActionsCell = tdActions;
        }

        if (this.ShowRowNumber) {
            var tdNumber = trHeader.insertCell(-1);
            if (!firstHeaderOccured)
                tdNumber.className = 'cm_table_header_first';
            else
                tdNumber.className = 'cm_table_header_other';
            tdNumber.style.width = '20px';
            tdNumber.innerHTML = '№';
            this.HeaderNumberCell = tdNumber;
        }

        for (i = 0; i < len; i++) {
            var tField = this.TableFields[i];
            var tdField = trHeader.insertCell(-1);
            tField.HeaderCell = tdField;
            if (!this.ShowRowNumber && i == 0)
                tdField.className = 'cm_table_header_first';
            else
                tdField.className = 'cm_table_header_other';
            var divHeader = window.document.createElement('div');
            tdField.appendChild(divHeader);
            tField.HeaderDiv = divHeader;
            divHeader.innerHTML = tField.DisplayName;
            if (tField.Width != 0 && tField.Width != null) {
                divHeader.style.width = tField.Width; //уже с px
                tdField.style.width = tField.Width; //уже с px
            }
            else {
                var fieldType = tField.Type;
                var defaultWidthClass = 'cm_tableField_width';
                if (fieldType == 'Text')
                    defaultWidthClass = 'cm_tableField_width_text';
                else if (fieldType == 'Note')
                    defaultWidthClass = 'cm_tableField_width_textarea';
                else if (fieldType == 'Boolean')
                    defaultWidthClass = 'cm_tableField_width_boolean';
                else if (fieldType == 'DateTime') {
                    if (!tField.ShowTime || this.IsNewDesign)
                        defaultWidthClass = 'cm_tableField_width_date';
                    else
                        defaultWidthClass = 'cm_tableField_width_datetime';
                }
                else if (fieldType == 'Lookup')
                    defaultWidthClass = 'cm_tableField_width_lookup';

                if (window.SM.IsNE(divHeader.className))
                    divHeader.className = defaultWidthClass;
                else
                    divHeader.className += ' ' + defaultWidthClass;
            }
            if (tField.Type == 'Note' && tField.EnableTextTemplate && !this.IsNewDesign) {
                var divTextTemplate = window.document.createElement('div');
                this.ControlContainer.appendChild(divTextTemplate);
                divTextTemplate.style.display = 'none';
                divTextTemplate.className = 'cm_textTemplate';
                divTextTemplate.style.width = tField.TextTemplateWidth + 'px';

                divTextTemplate.Show = function (textControl) { CM_ShowTextTemplate(divTextTemplate, textControl); }
                divTextTemplate.Hide = function () { CM_HideTextTemplate(divTextTemplate); }
                $(divTextTemplate).focusout(function (e) { CM_OnTextTemplateBlur(e, divTextTemplate); });
                $(window.document.body).mousedown(function (e) { CM_OnTextTemplateBlur(e, divTextTemplate); });

                var j, jlen = tField.TextTemplateItems.length;
                for (j = 0; j < jlen; j++) {
                    var textItem = tField.TextTemplateItems[j];
                    if (!window.SM.IsNE(textItem)) {
                        var divTextItem = window.document.createElement('div');
                        divTextItem.Holder = divTextTemplate;
                        divTextItem.className = 'cm_textTemplate_item';
                        divTextItem.innerHTML = textItem;
                        divTextItem.onmouseover = function (e) {
                            var e = e || window.event;
                            var divText = e.srcElement ? e.srcElement : e.target;
                            if (window.SM.IsNE(divText.originalClass))
                                divText.originalClass = divText.className;
                            divText.className = 'cm_textTemplate_item_selected';
                        }
                        divTextItem.onmouseout = function (e) {
                            var e = e || window.event;
                            var divText = e.srcElement ? e.srcElement : e.target;
                            divText.className = divText.originalClass;
                        }
                        divTextItem.onmousedown = function (e) {
                            var e = e || window.event;
                            var divText = e.srcElement ? e.srcElement : e.target;
                            divText.Holder.TextControl.value = $(divText).text();
                            divText.Holder.Hide();
                        }
                        divTextTemplate.appendChild(divTextItem);
                    }
                }

                tdField.appendChild(divHeader);
                tField.TextTemplateControl = divTextTemplate;

            }
        }
    }
    divTable.appendChild(cmTable);

    this.ControlContainer.appendChild(divTable);

}

function CM_ShowTextTemplate(textTemplate, textControl) {
    var sameItem = false;
    if (textTemplate.TextControl != null) {
        if (textTemplate.TextControl.Item.UniqueID == textControl.Item.UniqueID)
            sameItem = true;
    }

    var hidden = false;
    if (textTemplate.shown) {
        textTemplate.Hide();
        hidden = true;
    }

    if (!sameItem || sameItem && !hidden) {
        var isNewDesign = textControl.IsNewDesign;
        if (isNewDesign) {
            if (!sameItem) {
                if (textTemplate.parentNode != null)
                    textTemplate.parentNode.removeChild(textTemplate);
                textControl.parentNode.appendChild(textTemplate);
            }
        }
        textTemplate.shown = true;
        textTemplate.TextControl = textControl;

        if (isNewDesign) {
            if (SM.IsIE) {
                textTemplate.style.marginTop = '-2px';
            }
            else if (SM.IsFF) {
                textTemplate.style.marginTop = '-2px';
            }
            else {
                textTemplate.style.marginTop = '-1px';
                textTemplate.style.marginLeft = '2px';
            }
        }
        else {
            var cntOffset = $(textControl).offset();
            var cntHeight = textControl.offsetHeight;

            var menuTop = cntOffset.top + cntHeight;
            var menuLeft = cntOffset.left;

            $(textTemplate).css({ top: menuTop + "px", left: menuLeft + "px" });
        }
        textTemplate.style.display = 'block';

        //**** В этом блоке кода вычисляем куда открывать выпадающее окно в новом дизайне
        if (textControl.IsNewDesign) {
            var bottomPlaceEnable = false;
            var topPlaceEnable = false;
            var wh = $(document).height();
            var winHeight = $(window.top).height();
            var txtRect = textControl.getBoundingClientRect();
            var downAreaHeight = winHeight - txtRect.bottom - textTemplate.offsetHeight;
            bottomPlaceEnable = downAreaHeight > 0;
            if (!bottomPlaceEnable) {
                textTemplate.style.top = (-textTemplate.offsetHeight + 3) + 'px';
            }
            else
                textTemplate.style.top = null;
        }
        else {
            var wh = document.documentElement.offsetHeight;
            var winHeight = $(window.top).height();

            var txtRect = textControl.getBoundingClientRect();
            var downAreaHeight = winHeight - txtRect.bottom - textTemplate.offsetHeight;
            bottomPlaceEnable = downAreaHeight > 0;
            if (!bottomPlaceEnable) {
                var scrollTop = window.SM.GetScrollTop();
                //debugger;
                textTemplate.style.top = (txtRect.top - textControl.offsetHeight - 12 + scrollTop);
            }
        }
        //**** В этом блоке кода вычисляем куда открывать выпадающее окно в новом дизайне

        //textTemplate.focus();
    }
}

function CM_OnTextTemplateBlur(e, textTemplate) {
    var e = e || window.event;
    if (textTemplate.shown) {
        var tmpOffset = $(textTemplate).offset();
        var mouseX = 0;
        var mouseY = 0;
        if (e != null) {
            mouseX = e.clientX + SM.GetScrollLeft();
            mouseY = e.clientY + +SM.GetScrollTop();
        }
        var isOpenImageClick = false;
        if (textTemplate.TextControl != null) {
            if (textTemplate.TextControl.OpenImage != null) {
                var imgOpen = textTemplate.TextControl.OpenImage;
                var openOffset = $(imgOpen).offset();

                var top = openOffset.top;
                var bottom = openOffset.top + imgOpen.offsetHeight;
                var left = openOffset.left;
                var right = openOffset.left + imgOpen.offsetWidth;

                isOpenImageClick = mouseY >= top && mouseY <= bottom && mouseX >= left && mouseX <= right;
            }
        }
        if (!isOpenImageClick) {
            var top = tmpOffset.top;
            var bottom = tmpOffset.top + textTemplate.offsetHeight;
            var left = tmpOffset.left;
            var right = tmpOffset.left + textTemplate.offsetWidth;

            var isOverTemplate = mouseY >= top && mouseY <= bottom && mouseX >= left && mouseX <= right;
            if (!isOverTemplate)
                textTemplate.Hide();
        }
    }
}

function CM_HideTextTemplate(textTemplate) {
    textTemplate.TextControl = null;
    textTemplate.style.display = 'none'; //$(textTemplate).hide(100);
    textTemplate.shown = false;
}

function CM_CreateCommission(xmlElement, rowIndex, userCreated) {
    if (xmlElement == null && userCreated == null)
        userCreated = true;

    userCreated = userCreated == true;
    var cmItem = new CMItem(xmlElement, this, rowIndex);
    cmItem.UserCreated = userCreated;
    this.Commissions.push(cmItem);
    this.CommissionsByID[cmItem.ID] = cmItem;
    this.CommissionsByUniqueID[cmItem.UniqueID] = cmItem;
    return cmItem;
}

function CM_CreateRequestCommission() {
    if (!this.Disabled) {
        var url = this.CommissionsListEditFormUrl + '?rnd=' + Math.random();
        var params = '';
        params += '&settingName=' + encodeURIComponent(this.SettingName);
        params += '&parentItemID=' + this.ItemID;
        params += '&parentListID=' + this.ListID;
        params += '&parentWebID=' + this.WebID;
        params += '&setIdentityToSource=true';
        params += '&closeOnCancel=true';

        //устанавливаем значения по умолчанию для столбцов, у которых значение по умолчанию устанавливается с клиента.
        var i, len = this.TableFields.length;
        var stDefaultFieldValues = '';
        for (i = 0; i < len; i++) {
            var tableField = this.TableFields[i];
            if (!SM.IsNE(tableField.DefaultSourceFieldName) && !SM.IsNE(tableField.DefaultValue)) {
                if (stDefaultFieldValues.length > 0)
                    stDefaultFieldValues += '_pn_';
                stDefaultFieldValues += tableField.ID + '_pv_' + tableField.DefaultValue;
            }
        }
        if (stDefaultFieldValues.length > 0)
            params += '&defaultFieldValues=' + encodeURIComponent(stDefaultFieldValues);

        var backUrl = this.WebUrl + this.ModulePath + '/AddCommission.aspx?rnd=' + Math.random();
        var backParams = '';
        backParams += '&parentItemID=' + this.ItemID;
        backParams += '&parentListID=' + this.ListID;
        backParams += '&parentWebID=' + this.WebID;
        backParams += '&parentFieldID=' + this.FieldID;
        backUrl += backParams;
        params += '&Source=' + encodeURIComponent(backUrl);

        url += params;

        window.open(url, '_blank', this.OpenWinFeatures);
    }
}

//debugger
function CM_InitCommissions() {
    this.Commissions = new Array();
    this.CommissionsByID = new Array();
    this.CommissionsByUniqueID = new Array();
    this.CommissionUniqueID = 0;
    this.IsLastRowAlternate = true;
    this.LastItemNumber = 0;
    var cmNodes = this.ValueElement.selectNodes('Commissions/Item');
    var i, len = cmNodes.length;
    for (i = 0; i < len; i++) {
        var cmNode = cmNodes[i];
        var cmItem = this.CreateCommission(cmNode, null);
    }
    var j, jlen = this.EmptyRowsCount;
    for (j = 0; j < jlen; j++) {
        var cmItem = this.CreateCommission(null, null);
    }
    this.ResetRowsLayout();
}

//debugger
function CM_WaitNotCreatedItems() {
    var i, len = this.Commissions.length;
    for (i = 0; i < len; i++) {
        var cmItem = this.Commissions[i];
        if (!cmItem.IsNew && (cmItem.CreationEventID > 0 && !cmItem.IsTemplate || cmItem.HasNotCreatedCopies)) {
            CM_AddWaitingCommission.call(this, cmItem);
            cmItem.ShowSaving();
        }
    }
    CM_WaitCommissions.call(this);
}



//debugger
function CM_AddSaveHandler() {
    if (!window.CM_SaveHandlerAdded && window.ListForm != null) {
        window.CM_SaveHandlerAdded = true;
        SM.AttachEvent(ListForm, 'OnSaveCompleted', CM_SaveCommissionsHandler, this);
    }
}

function CM_SaveCommissionsHandler(saveEventArgs) {
    if (saveEventArgs.CanSave)
        CM_SaveCommissions.call(this, false);
}

//debugger
function CM_SaveCommissions(showValidationError) {
    if (this.Disabled)
        return false;

    showValidationError = showValidationError === true;

    var canSave = true;
    var i, len = this.Commissions.length;
    var validationResult = '';
    var savingItems = new Array();
    for (i = 0; i < len; i++) {
        var cmItem = this.Commissions[i];
        if (!cmItem.Deleted && cmItem.IsEditMode) {
            var isFilled = cmItem.IsFilled();
            if (isFilled) {
                var validation = cmItem.Validate();
                if (!window.SM.IsNE(validation)) {
                    if (window.SM.IsNE(validationResult))
                        validationResult += window.TN.TranslateKey('CMFieldControl.FieldCannotBeSave') + ' "' + window.TN.Translate(this.FieldTitle) + '"\n';
                    validationResult += '\n';
                    validationResult += validation;
                }
                else
                    savingItems.push(cmItem);
            }
        }
    }
    if (window.SM.IsNE(validationResult)) {
        var j, jlen = savingItems.length;
        for (j = 0; j < jlen; j++) {
            var cmItem = savingItems[j];

            //  Запуск кастомного обработчика процесса сохранения элемента
            var commissionSaveArgs = { Commission: cmItem, CanSave: true };
            SM.FireEvent(this, 'OnCommissionSave', commissionSaveArgs);
            if (!commissionSaveArgs.CanSave)
                return true;

            cmItem.Save(this.IsTemplatesMode);
        }
        if (savingItems.length > 0)
            CM_SaveCreationEvents.call(this, savingItems, false);
    }
    else {
        if (showValidationError)
            alert(validationResult);
        canSave = false;
    }
    return canSave;
}


//debugger
function CMFieldWindow_OnSaveClick() {
    var canSave = false;
    if (window.CMFieldInstance != null)
        canSave = CM_SaveCommissions.call(window.CMFieldInstance, true);
    if (canSave && window.CurrentCommissionsLink != null) {
        window.CurrentCommissionsLink.HideCommissions();
        if (window.Card != null)
            window.Card.Refresh();
    }
    return canSave;
}

function CMFieldWindow_OnCloseClick() {
    if (window.CurrentCommissionsLink != null)
        window.CurrentCommissionsLink.HideCommissions();
}

function CM_Validate() {
    var validationResult = '';
    var i, len = this.Commissions.length;
    for (i = 0; i < len; i++) {
        var cmItem = this.Commissions[i];
        if (!cmItem.Deleted && cmItem.IsEditMode) {
            var isFilled = cmItem.IsFilled();
            if (isFilled) {
                var validation = cmItem.Validate();
                if (!window.SM.IsNE(validation)) {
                    if (window.SM.IsNE(validationResult))
                        validationResult += window.TN.TranslateKey('CMFieldControl.FieldCannotBeSave') + ' "' + window.TN.Translate(this.FieldTitle) + '"\n';
                    validationResult += '\n';
                    validationResult += validation;
                }
            }
        }
    }
    return validationResult;
}

//debugger
function CM_IsFilled(checkServerCommissions) {
    if (checkServerCommissions == null)
        checkServerCommissions = true;
    var isFilled = false;
    var i, len = this.Commissions.length;
    for (i = 0; i < len; i++) {
        var cmItem = this.Commissions[i];
        if (!cmItem.UserCreated && checkServerCommissions) {
            isFilled = true;
            break;
        }
        else if (!cmItem.Deleted) {
            var isItemFilled = false;
            if (cmItem.IsNew)
                isItemFilled = cmItem.IsFilled();
            else if (cmItem.UserCreated || checkServerCommissions)
                isItemFilled = true;

            if (isItemFilled) {
                isFilled = true;
                break;
            }
        }
    }
    return isFilled;
}

function CM_Disable() {
    this.Disabled = true;
    if (this.HierarchyControl == null)
        this.DivMenu.style.display = 'none';
    else if (this.MenuRow != null) {
        var j, jlen = this.MenuRow.cells.length;
        for (j = 0; j < jlen; j++) {
            var tdMenu = this.MenuRow.cells[j];
            if (!tdMenu.IsHeararchyCell)
                tdMenu.style.display = 'none';
        }
    }
    var i, len = this.Commissions.length;
    var deleted = false;
    for (i = 0; i < len; i++) {
        var cmItem = this.Commissions[i];
        if (!cmItem.Deleted && cmItem.IsNew) {
            if (!cmItem.IsTemplate) {
                cmItem.Delete();
                deleted = true;
            }
            else {
                cmItem.ChangeDisplayMode(false);
            }
        }
    }
    if (deleted)
        this.ResetRowsLayout();
}

function CM_ResetRowsLayout() {
    var i, len = this.Table.rows.length;
    this.IsLastRowAlternate = true;
    this.LastItemNumber = 0;
    for (i = 0; i < len; i++) {
        var tableRow = this.Table.rows[i];
        var cmItem = tableRow.Commission;
        if (cmItem != null) {
            if (!cmItem.Deleted) {
                var currentAlternateStyle = !this.IsLastRowAlternate;
                cmItem.SetRowAlternating(currentAlternateStyle);
                this.IsLastRowAlternate = currentAlternateStyle;
                cmItem.SetRowNumber();
            }
        }
    }
}

function CM_PersistValue() {
    this.HiddenFormValue.value = SM.PersistXML(this.ValueElement);
}

/////////////////////CMField - END///////////////////////




//////////////////////////CMTableField//////////////////////////////

function CMTableField(field) {
    this.Field = field;

    //Common Methods
    this.GetAttribute = CM_GetAttribute;
    this.GetBooleanAttribute = CM_GetBooleanAttribute;
    this.GetIntegerAttribute = CM_GetIntegerAttribute;
    switch (this.Type) {
        case 0: this.Type = 'Text'; break;
        case 1: this.Type = 'Note'; break;
        case 2: this.Type = 'DateTime'; break;
        case 3: this.Type = 'Lookup'; break;
        case 4: this.Type = 'Boolean'; break;
    }

    switch (this.ConditionValueType) {
        case 0: this.ConditionValueType = 'None'; break;
        case 1: this.ConditionValueType = 'Equal'; break;
        case 2: this.ConditionValueType = 'NotEqual'; break;
        case 4: this.ConditionValueType = 'Greater'; break;
        case 8: this.ConditionValueType = 'Smaller'; break;
        case 16: this.ConditionValueType = 'GreaterOrEqual'; break;
        case 32: this.ConditionValueType = 'SmallerOrEqual'; break;
        case 64: this.ConditionValueType = 'StartsWith'; break;
        case 128: this.ConditionValueType = 'Contains'; break;
        case 256: this.ConditionValueType = 'NotContains'; break;


    }

    //Properties
    this.ID = this.ID.toString();
    if (this.Width == 0 && this.Type == 'DateTime' && this.Field.IsNewDesign)
        this.Width = 90;
    if (this.Width == 0 && this.Type == 'Lookup' && this.Field.IsNewDesign)
        this.Width = 140;

    //Methods
    this.InitConditions = CMTableField_InitConditions;

    //Initialization
    if (this.Type == 'Lookup') {
        this.LookupSettings = window.GetLookupSettings(this.LookupSettingsName);
        if (this.LookupSettings != null)
            this.LookupSettings.ControlWidth = this.Width;
    }
    this.InitConditions();

}

function CMField_OnListFormInit() {
    if (window.ListForm != null) {
        var i, len = this.TableFields.length;
        for (i = 0; i < len; i++) {
            var tableField = this.TableFields[i];
            CMTableField_InitDefaultLookupSourceField.call(tableField);
        }
    }
}

function CMTableField_InitDefaultLookupSourceField() {
    //если в страница является формой и содержит поле источник - прикрепляем обработчик изменения значения по умолчанию.
    if (window.ListForm != null && !SM.IsNE(this.DefaultSourceFieldName)) {
        //получаем поле карточки.
        var defaultSourceField = ListForm.GetField(this.DefaultSourceFieldName);
        if (defaultSourceField == null)
            throw new Error('Не удалось получить поле-источник ' + this.DefaultSourceFieldName + ' значения столбца табличного поручения.');
        //устанавливаем поле-источник.
        this.DefaultSourceField = defaultSourceField.TypedField;

        //прикрепляем обработчик к полю, если поле присутствует на форме.
        if (this.Type == 'Lookup') {
            if (defaultSourceField.TypedField != null) {
                var thisObj = this;
                this.LookupSettings.SetDefaultControlValue = true;
                defaultSourceField.AddChangeHandler(function () { CMTableField_OnDefaultSourceFieldChange.call(thisObj); });
            }
        }
    }
}


function CMTableField_OnDefaultSourceFieldChange() {
    if (this.DefaultSourceField == null)
        throw new Error('Отсутствует поле источник значения для столбца таблицы поручений ' + this.Title);
    //очищаем предыдущее значение по умолчанию.
    this.DefaultValue = null;
    this.LookupSettings.DefaultControlValues = [];

    if (!this.DefaultSourceField.Settings.IsMultiple) {
        var lookupValue = this.DefaultSourceField.GetValue();
        //устаналиваем новое значение по умолчанию для настройки подстановки.
        if (lookupValue != null && lookupValue.LookupID > 0) {
            this.DefaultValue = lookupValue.LookupID.toString();
            this.LookupSettings.DefaultControlValues.push({
                LookupID: lookupValue.LookupID,
                LookupText: lookupValue.LookupText,
                UrlAccessCode: lookupValue.UrlAccessCode
            });
        }
    }
    else {
        var lookupValues = this.DefaultSourceField.GetValue();
        if (lookupValues != null && lookupValues.length > 0) {
            var i, len = lookupValues.length;
            var stLookupIDs = '';
            for (i = 0; i < len; i++) {
                var lookupValue = lookupValues[i];
                //устаналиваем новое значение по умолчанию для настройки подстановки.
                if (lookupValue != null && lookupValue.LookupID > 0) {
                    this.LookupSettings.DefaultControlValues.push({
                        LookupID: lookupValue.LookupID,
                        LookupText: lookupValue.LookupText,
                        UrlAccessCode: lookupValue.UrlAccessCode
                    });
                    if (stLookupIDs.length > 0)
                        stLookupIDs += ';';
                    stLookupIDs += lookupValue.LookupID;
                }
            }
            if (stLookupIDs.length > 0)
                this.DefaultValue = stLookupIDs;
        }
    }
    //сбрасываем инициализацию Xml-элементов значений по умолчанию в настройке подстановки.
    this.LookupSettings.__init_DefaultControlValueNodes = false;
}
//////////////////////////CMTableField - Methods//////////////////////////////

function CMTableField_InitConditions() {
    if (this.RequiredConditions == null)
        this.RequiredConditions = [];
    var i, len = this.RequiredConditions.length;
    for (i = 0; i < len; i++) {
        var cond = this.RequiredConditions[i];
        CMCondition.call(cond, this);
    }
}

//////////////////////////CMTableField - END//////////////////////////////







//////////////////////////CMCondition////////////////////////////////////

function CMCondition(tableField) {
    this.TableField = tableField;
    this.Field = tableField.Field;

    //Common Methods
    this.GetAttribute = CM_GetAttribute;
    this.GetBooleanAttribute = CM_GetBooleanAttribute;
    this.GetIntegerAttribute = CM_GetIntegerAttribute;

    //Properties
    this.IsEmpty = window.SM.IsNE(this.Value);

    //Methods
    this.Check = CMCondition_Check;

    //Initialization
}

//////////////////////////CMCondition - Methods////////////////////////////////////

function CMCondition_Check(cmItem) {
    //признак удовлетворения условию
    var passed = false;
    if (!window.SM.IsNE(this.FieldTitle)) {
        var cell = cmItem.CellsByTitle[this.FieldTitle];
        if (cell != null) {
            if (cell.IsEditMode) {
                var textValue = cell.GetControlTextValue();
                if (!this.IsEmpty) {
                    if (!window.SM.IsNE(textValue)) {
                        textValue = textValue.toString();
                        if (this.ConditionType == 'Equal')
                            passed = textValue.toLowerCase() == this.Value.toLowerCase();
                        else if (this.ConditionType == 'NotEqual')
                            passed = textValue.toLowerCase() != this.Value.toLowerCase();
                    }
                }
                else {
                    if (this.ConditionType == 'Equal')
                        passed = window.SM.IsNE(textValue);
                    else if (this.ConditionType == 'NotEqual')
                        passed = !window.SM.IsNE(textValue);
                }
            }
        }
    }
    return passed;
}

//////////////////////////CMCondition - END////////////////////////////////////







/////////////////////////CMItem////////////////////////////////////

//debugger
function CMItem(xmlElement, field, creationRowIndex) {
    this.XmlElement = xmlElement;
    this.Field = field;

    this.IsTemplate = false;
    if (xmlElement != null)
        this.IsTemplate = GetBooleanAttributeValue(xmlElement, 'IsTemplate');

    this.IsNew = xmlElement == null || this.IsTemplate;
    this.CreationRowIndex = creationRowIndex;
    if (this.IsNew) {
        if (this.Field.NewRowsCount == null)
            this.Field.NewRowsCount = 0;
        this.Field.NewRowsCount++;
    }

    //Common Methods
    this.GetAttribute = CM_GetAttribute;
    this.GetBooleanAttribute = CM_GetBooleanAttribute;
    this.GetIntegerAttribute = CM_GetIntegerAttribute;

    //Properties
    this.Field.CommissionUniqueID++;
    this.UniqueID = this.Field.CommissionUniqueID;

    //Methods
    this.FillProperties = CMItem_FillProperties;
    this.InitXmlElement = CMItem_InitXmlElement;
    this.InitTableRow = CMItem_InitTableRow;
    this.InitSystemCells = CMItem_InitSystemCells;
    this.InitItemCells = CMItem_InitItemCells;
    this.SetRowAlternating = CMItem_SetRowAlternating;
    this.Save = CMItem_Save;
    this.Validate = CMItem_Validate;
    this.SaveClick = CMItem_SaveClick;
    this.GetFieldsQuery = CMItem_GetFieldsQuery;
    this.SaveCompleted = CMItem_SaveCompleted;
    this.ShowSaving = CMItem_ShowSaving;
    this.HideSaving = CMItem_HideSaving;
    this.ChangeEditAccess = CMItem_ChangeEditAccess;
    this.SetRowNumber = CMItem_SetRowNumber;
    this.DeleteClick = CMItem_DeleteClick;
    this.Delete = CMItem_Delete;
    this.IsFilled = CMItem_IsFilled;
    this.ShowCreationWaiting = CMItem_ShowCreationWaiting;
    this.HideCreationWaiting = CMItem_HideCreationWaiting;
    this.UpdateViewControls = CMItem_UpdateViewControls;
    this.ChangeDisplayMode = CMItem_ChangeDisplayMode;
    this.DeleteTemplate = CMItem_DeleteTemplate;
    this.DeleteTemplateCompleted = CMItem_DeleteTemplateCompleted;
    this.ExecuteCreateRowControlsHandlers = CMItem_ExecuteCreateRowControlsHandlers;

    //Initialization
    this.FillProperties();
    this.InitXmlElement();
    this.InitTableRow();
    this.InitSystemCells();
    this.InitItemCells();
    if (!this.Field.IsLoading)
        this.Field.ResetRowsLayout();
    //this.SetRowAlternating(!this.Field.IsLastRowAlternate);
    this.Field.IsLastRowAlternate = !this.Field.IsLastRowAlternate;
}

/////////////////////////CMItem - Methods////////////////////////////////////

function CMItem_FillProperties() {
    if (this.XmlElement != null) {
        this.ID = this.GetIntegerAttribute('ID');
        this.CreationEventID = this.GetIntegerAttribute('CreationEventID');
        this.HasNotCreatedCopies = this.GetBooleanAttribute('HasNotCreatedCopies');
    }
}


function CMItem_InitXmlElement() {
    if (this.XmlElement == null) {
        var xmlElement = this.Field.ValueDocument.createElement('Item');
        this.XmlElement = xmlElement;
        var cellsElement = this.Field.ValueDocument.createElement('Cells');
        var i, len = this.Field.TableFields.length;
        for (i = 0; i < len; i++) {
            var tField = this.Field.TableFields[i];
            var cellElement = this.Field.ValueDocument.createElement('ItemCell');
            cellsElement.appendChild(cellElement);
            cellElement.setAttribute('FieldTitle', tField.Title);
        }
        xmlElement.appendChild(cellsElement);

    }
}

function CMItem_InitTableRow() {
    var trItem = null;
    if (this.CreationRowIndex == null)
        trItem = this.Field.Table.insertRow(1);
    else
        trItem = this.Field.Table.insertRow(this.CreationRowIndex);

    //правка баги с перекрытием нижними контролами выпадающих списков
    var thisObj = this;
    //trItem.className = 'cm_tr';
    trItem.onmousedown = function () {
        if (thisObj.Field.CurrentClickedRow != null && thisObj.Field.CurrentClickedRow.rowIndex != trItem.rowIndex)
            $(thisObj.Field.CurrentClickedRow).removeClass('cm_tr_top');
        $(trItem).addClass('cm_tr_top');
        thisObj.Field.CurrentClickedRow = trItem;
    }

    this.TableRow = trItem;
    trItem.Commission = this;
}

function CMItem_InitSystemCells() {
    var thisObj = this;

    if (!this.Field.IsNewDesign) {
        var tdActions = this.TableRow.insertCell(-1);

        var divSave = window.document.createElement('div');
        var imgSave = window.document.createElement('img');
        imgSave.src = '/_layouts/images/save.gif';
        imgSave.border = 0;
        imgSave.style.cursor = 'pointer';
        divSave.style.display = 'none';
        imgSave.onclick = function () { thisObj.SaveClick(); }
        this.ImageSave = imgSave;
        this.DivSave = divSave;

        var divDelete = window.document.createElement('div');
        var imgDelete = window.document.createElement('img');
        imgDelete.src = '/_layouts/images/delete.gif';
        imgDelete.border = 0;
        imgDelete.style.cursor = 'pointer';
        imgDelete.style.marginLeft = '3px';
        divDelete.style.display = 'none';
        imgDelete.onclick = function () { thisObj.DeleteClick(); }
        this.ImageDelete = imgDelete;
        this.DivDelete = divDelete;

        var imgDoc = window.document.createElement('img');
        imgDoc.src = '/_layouts/images/icgen.gif';
        imgDoc.border = 0;
        imgDoc.style.cursor = 'default';
        imgDoc.style.marginLeft = '4px';
        imgDoc.style.marginRight = '3px';
        imgDoc.style.display = 'none';
        this.ImageDoc = imgDoc;

        var imgSaving = window.document.createElement('img');
        imgSaving.src = this.Field.ModulePath + '/Images/saving.gif';
        imgSaving.border = 0;
        imgSaving.style.cursor = 'default';
        imgSaving.style.marginLeft = '3px';
        imgSaving.style.display = 'none';
        this.ImageSaving = imgSaving;

        if (this.IsNew) {
            this.DivSave.style.display = '';
            this.DivDelete.style.display = '';
        }
        else {
            this.ImageDoc.style.display = '';
        }

        var tdNumber = this.TableRow.insertCell(-1);
        this.NumberCell = tdNumber;
        //this.SetRowNumber();

        tdActions.appendChild(divSave);
        tdActions.appendChild(divDelete);
        tdActions.appendChild(imgDoc);
        tdActions.appendChild(imgSaving);

        divDelete.appendChild(imgDelete);
        divSave.appendChild(imgSave);

    }
}

function CMItem_SetRowNumber() {
    var number = this.Field.LastItemNumber + 1;
    this.Field.LastItemNumber++;
    if (this.Field.ShowRowNumber)
        this.NumberCell.innerHTML = number + '.';
    this.Number = number;
}

//debugger
function CMItem_InitItemCells() {
    this.Cells = new Array();
    this.CellsByTitle = new Array();
    var i, len = this.Field.TableFields.length;
    var thisObj = this;
    for (i = 0; i < len; i++) {
        var tField = this.Field.TableFields[i];
        var cellNode = this.XmlElement.selectSingleNode("Cells/ItemCell[@FieldTitle='" + tField.Title + "']");
        if (cellNode != null) {
            var itemCell = new CMItemCell(cellNode, this, tField);
            this.Cells.push(itemCell);
            this.CellsByTitle[tField.Title] = itemCell;

            //добавляем в первую ячейку div  с ожиданием создания
            if (this.Cells.length == 1) {
                if (this.Field.IsNewDesign) {
                    this.DivFirstView = itemCell.DivView;
                    this.FirstCell = itemCell;

                    var tbWaiting = window.document.createElement('table');
                    this.WaitingTable = tbWaiting;
                    tbWaiting.style.display = 'none';
                    tbWaiting.border = 0;
                    tbWaiting.cellSpacing = 0;
                    tbWaiting.cellPadding = 0;
                    tbWaiting.className = 'cm_tbWaiting';
                    var trWaiting = tbWaiting.insertRow(-1);

                    var tdSaving = trWaiting.insertCell(-1);
                    var imgSaving = window.document.createElement('img');
                    imgSaving.src = this.Field.ModulePath + '/Images/saving.v2.gif';
                    imgSaving.border = 0;
                    imgSaving.style.cursor = 'default';
                    imgSaving.style.marginLeft = '0px';
                    //imgSaving.style.display = 'none';
                    //this.ImageSaving = imgSaving;

                    var tdCreationWaiting = trWaiting.insertCell(-1);
                    tdCreationWaiting.style.paddingLeft = '3px';

                    itemCell.TableCell.appendChild(tbWaiting);
                    tdSaving.appendChild(imgSaving);
                }
                var divCreationWaiting = window.document.createElement('div');
                if (this.Field.IsNewDesign) {
                    tdCreationWaiting.appendChild(divCreationWaiting);
                    //divCreationWaiting.style.display = 'none';
                    divCreationWaiting.className = 'cm_font';
                    this.DivCreationWaiting = divCreationWaiting;
                }
                else {
                    itemCell.TableCell.appendChild(divCreationWaiting);
                    divCreationWaiting.style.display = 'none';
                    //divCreationWaiting.className = 'cm_text';
                    this.DivCreationWaiting = divCreationWaiting;
                    this.DivFirstView = itemCell.DivView;
                    this.FirstCell = itemCell;
                }
                divCreationWaiting.innerHTML = window.TN.TranslateKey('CMFieldControl.Creating') + '...';


                if (this.IsNew) {
                    this.FirstCell.TextViewControl.innerHTML = window.TN.TranslateKey('CMFieldControl.NotSpecified');
                    if (this.Field.IsNewDesign)
                        this.FirstCell.TextViewControl.style.display = 'none';
                    else
                        this.FirstCell.TextViewControl.style.display = '';
                    this.FirstCell.TextLinkViewControl.style.display = 'none';

                    if (this.Field.IsNewDesign) {
                        this.DivFirstView.style.display = 'none';

                        var tbEdit = window.document.createElement('table');
                        tbEdit.border = 0;
                        tbEdit.cellSpacing = 0;
                        tbEdit.cellPadding = 0;
                        this.EditTable = tbEdit;
                        tbEdit.border = 0;
                        tbEdit.cellSpacing = 0;
                        tbEdit.cellPadding = 0;
                        var trEdit = tbEdit.insertRow(-1);

                        var tdSave = trEdit.insertCell(-1);
                        var imgSave = window.document.createElement('img');
                        imgSave.src = '/_layouts/WSS/WSSC.V4.DMS.Fields.Commissions/Images/save.png';
                        imgSave.border = 0;
                        imgSave.style.cursor = 'pointer';
                        imgSave.style.marginLeft = '0px';
                        imgSave.onclick = function () { thisObj.SaveClick(); }
                        if (this.Field.IsTemplatesMode)
                            imgSave.title = window.TN.TranslateKey('CMFieldControl.SaveCommissionProject');
                        tdSave.appendChild(imgSave);

                        var tdDelete = trEdit.insertCell(-1);
                        var imgDelete = window.document.createElement('img');
                        imgDelete.src = '/_layouts/WSS/WSSC.V4.DMS.Fields.Commissions/Images/delete.png';
                        imgDelete.border = 0;
                        imgDelete.style.cursor = 'pointer';
                        imgDelete.style.marginLeft = '4px';
                        imgDelete.onclick = function () { thisObj.DeleteClick(); }

                        this.EditTable.style.display = '';

                        if (this.Field.ShowRowNumber) {
                            var tdNumber = this.TableRow.insertCell(-1);
                            this.NumberCell = tdNumber;
                        }
                        //this.SetRowNumber();

                        itemCell.TableCell.appendChild(tbEdit);
                        tdDelete.appendChild(imgDelete);


                    }
                }
                if (this.Field.IsNewDesign) {
                    var imgDoc = window.document.createElement('img');
                    //tdActions.appendChild(imgDoc);
                    imgDoc.src = '/_layouts/images/icgen.gif';
                    imgDoc.border = 0;
                    imgDoc.style.cursor = 'default';
                    imgDoc.style.marginLeft = '4px';
                    imgDoc.style.marginRight = '3px';
                    imgDoc.style.display = 'none';
                    this.ImageDoc = imgDoc;
                }
            }
        }
    }

    //вызываем обработчики на создание контрола.
    this.ExecuteCreateRowControlsHandlers();
}

function CMField_ExecuteCreateRowControlsHandlers() {
    var i, len = this.Commissions.length;
    for (i = 0; i < len; i++) {
        var cmItem = this.Commissions[i];
        if (!cmItem.Deleted)
            cmItem.ExecuteCreateRowControlsHandlers();
    }
}

function CMItem_ExecuteCreateRowControlsHandlers() {
    if (this.IsNew) {
        var i, len = this.Field.CreateRowControlsHandlers.length;
        for (i = 0; i < len; i++) {
            var hander = this.Field.CreateRowControlsHandlers[i];

            if (hander != null) {
                if (hander.AppliedCommissions == null)
                    hander.AppliedCommissions = new Array();
                var absoluteUniqueID = 'list' + this.Field.ListID + '_item' + this.Field.ItemID + '_UID' + this.UniqueID + '_CMID' + this.Field.InstanceID;
                if (hander.AppliedCommissions[absoluteUniqueID] == null) {
                    hander.AppliedCommissions[absoluteUniqueID] = true;
                    hander(this);
                }
            }
        }
    }
}

function CMItem_SetRowAlternating(isAlternate) {
    var i, len = this.TableRow.cells.length;
    var cellClass = 'cm_table_cell';
    if (isAlternate)
        cellClass = 'cm_table_cell_alternate';

    var originalClassName = cellClass;
    for (i = 0; i < len; i++) {
        var tmpClassName = originalClassName;
        if (i == 0)
            tmpClassName += '_first';
        else
            tmpClassName += '_other';

        var cell = this.TableRow.cells[i];
        cell.className = tmpClassName;
    }
}

//debugger
function CMItem_Save() {
    var i, len = this.Cells.length;
    this.IsEditMode = false;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        cell.ChangeEditAccess(false);
    }
    if (this.Field.NewRowsCount != null && !this.NewRowsCountChecked) {
        this.Field.NewRowsCount--;
        this.NewRowsCountChecked = true;
    }
    this.IsTemplate = this.Field.IsTemplatesMode == true;
    this.ShowSaving();
}

//debugger
function CMItem_Validate() {
    var resultMsg = '';
    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        var validationResult = cell.Validate();
        if (!validationResult.IsValid) {
            if (resultMsg.length == 0)
                resultMsg += window.TN.TranslateKey('CMFieldControl.RowCannotBeSave') + ' №' + this.Number + ':';
            resultMsg += '\n';
            if (validationResult.NotFilled)
                resultMsg += '    - ' + window.TN.TranslateKey('CMFieldControl.RequiredColumnNotFilled') + ' "' + cell.TableField.DisplayName + '".';
            else if (validationResult.Incorrect) {
                if (!validationResult.ConditionFailed)
                    resultMsg += '    - ' + SM.SR(window.TN.TranslateKey('CMFieldControl.ColumnIncorrect'), '{ColumnName}', cell.TableField.DisplayName)
                else
                    resultMsg += '    - ' + window.TN.Translate(cell.TableField.ConditionErrorText);
            }
        }
    }
    /*
    var fieldsQuery = this.GetFieldsQuery();
    var encodedQuery = encodeURI(fieldsQuery);
    if(encodedQuery.length > 1000)
    {
    if(resultMsg.length == 0)
    resultMsg += 'Невозможно сохранить строку №' + this.Number + ':';
    resultMsg += '\n';
    resultMsg += '    - Превышена максимальная длина запроса на создание поручения. Пожалуйста, обрежьте текстовые поля или уменьшите количество элементов в полях подстановки.';
    }
    */
    return resultMsg;
}

//debugger
function CMItem_SaveClick() {
    if (!this.Field.Disabled) {
        var validationMsg = this.Validate();
        if (window.SM.IsNE(validationMsg)) {

            //  Запуск кастомного обработчика процесса сохранения элемента
            var commissionSaveArgs = { Commission: this, CanSave: true };
            SM.FireEvent(this.Field, 'OnCommissionSave', commissionSaveArgs);
            if (!commissionSaveArgs.CanSave)
                return;

            this.IsSingleSave = true;
            this.Save();
            var savingItems = [this];
            CM_SaveCreationEvents.call(this.Field, savingItems, true);
            if (this.Field.NewRowsCount == 0)
                this.Field.CreateCommission(null, null);
        }
        else {
            alert(validationMsg);
        }
    }
}

function CMItem_GetFieldsQuery() {
    var fieldsQuery = '';
    var i, len = this.Cells.length;
    if (this.IsNew) {
        for (i = 0; i < len; i++) {
            var cell = this.Cells[i];
            if (!cell.TableField.Disabled) {
                var fieldTitle = cell.TableField.Title;
                var textValue = cell.GetControlTextValue();
                if (!window.SM.IsNE(fieldTitle)) {
                    if (fieldsQuery.length > 0)
                        fieldsQuery += '_s_';
                    fieldsQuery += fieldTitle + '_e_' + textValue;
                }
            }
        }
    }
    return fieldsQuery;
}

function CM_SaveCreationEvents(savingItems, isAsync) {
    if (savingItems == null || savingItems.length == 0)
        throw new Error('Не передан параметр savingItems.');

    isAsync = isAsync === true;

    var i, len = savingItems.length;
    //коллекция данных сохраняемых элементов.
    var savingItemsData = [];
    for (i = 0; i < len; i++) {
        var savingItem = savingItems[i];
        //формируем объект сохраняемых данных поручения
        var savingItemData = {};
        savingItemsData.push(savingItemData);

        //уникальный клиентский идентификатор строки поручения
        savingItemData.UniqueID = savingItem.UniqueID;

        //идентификатор существующей записи шаблона поручения.
        if (savingItem.CreationEventID > 0)
            savingItemData.CreationEventID = savingItem.CreationEventID;

        /*
        //признак: поручение является шаблоном.
        if (savingItem.IsTemplate)
            savingItemData.IsTemplate = true;
        */

        //значения сохраняемых полей
        savingItemData.CreationFieldValuesText = savingItem.GetFieldsQuery();
    }

    var url = this.ModulePath + '/CMOperation.aspx?rnd=' + Math.random();
    var params = '';
    params += 'operation=SaveCreationEvents';
    params += '&transactionID=' + this.TransactionID;
    params += '&parentListID=' + this.ListID;
    params += '&commissionsFieldID=' + this.FieldID;
    params += '&parentItemID=' + this.ItemID;

    var isFormSaving = isAsync == false;
    params += '&isFormSaving=' + isFormSaving;
    var isTemplatesMode = this.IsTemplatesMode == true;
    params += '&isTemplatesMode=' + isTemplatesMode;

    var savingDataJson = JSON.stringify(savingItemsData);
    params += '&savingItems=' + encodeURIComponent(savingDataJson);

    var thisObj = this;

    var xmlRequest = SM.GetXmlRequest();
    xmlRequest.open('POST', url, isAsync);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    if (isAsync) {
        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                xmlRequest.onreadystatechange = new Function();
                var responseText = xmlRequest.responseText;
                CM_SaveCreationEventsCompleted.call(thisObj, responseText);
            }
        };
    }
    xmlRequest.send(params);
    if (!isAsync) {
        var responseText = xmlRequest.responseText;
        CM_SaveCreationEventsCompleted.call(thisObj, responseText);
    }
}

function CM_SaveCreationEventsCompleted(responseText) {
    if (SM.IsNE(responseText))
        throw new Error('Не передан параметр resposeText');
    var result = JSON.parse(responseText);
    if (result == null)
        throw new Error('Не удалось получить результат операции SaveCreationEvents.');
    if (result.Exception != null)
        alert(result.Exception.DisplayText);

    //коллекция событий может быть пустой, если возникла ошибка на сервере раньше, чем был сформирован типизированный результат.
    if (result.CreatedEvents == null)
        return;

    var i, len = result.CreatedEvents.length;
    for (i = 0; i < len; i++) {
        var savedItem = result.CreatedEvents[i];
        if (SM.IsNE(savedItem.UniqueID))
            throw new Error('Отсутствует клиентский идентфикатор строки поручения.');

        //получаем поручение, для которого сохранено событие создания.
        var commission = this.CommissionsByUniqueID[savedItem.UniqueID];
        if (commission == null)
            throw new Error('Не удалось получить поручение по клиентскому идентификатору ' + savedItem.UniqueID);

        if (result.Exception != null) {
            //возвращаем отображение редактирования в случае ошибки.
            commission.IsEditMode = true;
            commission.ChangeEditAccess(true);
            commission.HideSaving();
        }
        else {
            if (SM.IsNE(savedItem.CreationEventID))
                throw new Error('Отсутствует идентфикатор события создания поручения.');

            //устанавливаем идентификатор сохраненного события создания поручения в строку поручения.
            commission.CreationEventID = savedItem.CreationEventID;

            if (this.IsTemplatesMode) {
                //для шаблонов поручений
                commission.ChangeEditAccess(true);
                commission.HideSaving();
            }
            else {
                //отправляем сохраненные поручения в ожидание создания поручений.
                CM_AddWaitingCommission.call(this, commission);
            }
        }
    }

    //запускаем ожидание создания поручений.
    CM_WaitCommissions.call(this);
}

function CM_AddWaitingCommission(commission) {
    if (commission == null)
        throw new Error('Не передан параметр commission.');

    //создаем очередь поручений, ожидающих создание.
    if (this.WaitingCommissions == null)
        this.WaitingCommissions = [];

    //добавляем поручение в очередь ожидания создания.
    this.WaitingCommissions.push(commission);
}

function CM_WaitCommissions() {
    //выходим, если отсутствуют ожидающие поручения
    if (this.WaitingCommissions == null || this.WaitingCommissions.length == 0)
        return;

    //выходим, если транзакция ожидания поручений уже запущена
    if (this.IsCommissionsWaiting)
        return;

    //запускаем транзакцию ожидания создания поручений.
    //выполняем ожидание по сохраненным событиям создания поручений либо по событиям создания копий поручений.
    //ожиданий созданий копий поручений может осуществляться как по поручениям-источникам, созданным из строк табличных поручений,
    //таки и по поручениям-источникам, созданным непосредственно из карточки.
    this.IsCommissionsWaiting = true;

    //формируем коллекцию данных ожидаемых поручений.
    var waitingItemsData = []
    while (this.WaitingCommissions.length > 0) {
        //извлекаем из коллекции ожидающих поручения.
        var waitingItem = this.WaitingCommissions.shift();

        //получаем идентификатор сохраненного события создания поручения.
        var creationEventID = waitingItem.CreationEventID;
        if (creationEventID == null)
            creationEventID = 0;

        //получаем идентификатор поручения, являющегося источником для поручений-копий.
        var itemID = waitingItem.ID;
        if (itemID == null)
            itemID = 0;
        var hasCopies = waitingItem.HasNotCreatedCopies == true;

        //данные ожижаемого поручения.
        var waitingItemData = {};
        waitingItemsData.push(waitingItemData);
        waitingItemData.UniqueID = waitingItem.UniqueID;
        waitingItemData.CreationEventID = creationEventID;
        if (hasCopies)
            waitingItemData.ItemID = itemID;
    }

    //формируем запрос ожидания создания поручений.
    var url = this.ModulePath + '/CMOperation.aspx?rnd=' + Math.random();
    var params = '';
    params += 'operation=WaitCommissions';
    params += '&transactionID=' + this.TransactionID;
    params += '&parentListID=' + this.ListID;
    params += '&commissionsFieldID=' + this.FieldID;
    params += '&parentItemID=' + this.ItemID;
    var waitingItemsDataJson = JSON.stringify(waitingItemsData);
    params += '&waitingItems=' + encodeURIComponent(waitingItemsDataJson);

    var thisObj = this;

    var xmlRequest = SM.GetXmlRequest();
    xmlRequest.open('POST', url, true);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            CM_WaitCommissionsCompleted.call(thisObj, responseText);
        }
    };
    xmlRequest.send(params);
}

function CM_WaitCommissionsCompleted(responseText) {
    if (SM.IsNE(responseText))
        throw new Error('Не передан параметр resposeText');
    var result = JSON.parse(responseText);
    if (result == null)
        throw new Error('Не удалось получить результат операции WaitCommissions.');
    if (result.Exception != null) {
        alert(result.Exception.DisplayText);
        return;
    }

    if (result.WaitingItems.length == 0)
        throw new Error('Отсутстует результат ожидания создания поручений.');

    //если аякс-ответ пришел для экзепляра таблицы поручений, которая уже не содержится на страницы 
    //(например, при закрытии превью, а затем при повторном открытии), то выходим из функции.
    if (this.Table.parentNode == null)
        return;

    //инициализируем xml-документ с данными созданных поручений.
    var createdCommissionsXml = null;
    if (!SM.IsNE(result.CreatedItemsXml))
        createdCommissionsXml = SM.LoadXML(result.CreatedItemsXml);

    var i, len = result.WaitingItems.length;
    var resetRowsLayout = false;
    for (i = 0; i < len; i++) {
        var waitingResponse = result.WaitingItems[i];
        //обрабатываем ошибку при создании поручения
        if (!SM.IsNE(waitingResponse.ErrorMessage)) {
            alert('Произошла ошибка при создании поручения с клиентским идентификатором ' + waitingResponse.UniqueID + ': ' + waitingResponse.ErrorMessage);
            continue;
        }

        //получаем строку поручения.
        var commission = this.CommissionsByUniqueID[waitingResponse.UniqueID];
        if (commission == null)
            throw new Error('Не удалось получить поручение по клиентскому идентификатору ' + waitingResponse.UniqueID);

        //получаем xmlNode, соответствующий строке поручения, только для поручения у которого отсутствуют несозданные копии.
        var commissionNode = null;
        if (createdCommissionsXml != null && waitingResponse.ItemID > 0 && !waitingResponse.HasNotCreatedCopies)
            commissionNode = createdCommissionsXml.selectSingleNode('ItemCollection/Commissions/Item[@ID="' + waitingResponse.ItemID + '"]');

        if (commissionNode != null) {
            //если есть данные по поручению - завершаем создание.
            commission.XmlElement = commissionNode;
            commission.FillProperties();
            commission.SaveCompleted();
        }
        else
            CM_AddWaitingCommission.call(this, commission);

        //инициализируем поручения-копии
        if (waitingResponse.CreatedCopies.length > 0) {
            var j, jlen = waitingResponse.CreatedCopies.length;
            for (j = 0; j < jlen; j++) {
                var createdCopy = waitingResponse.CreatedCopies[j];
                if (!SM.IsNE(createdCopy.ErrorMessage)) {
                    alert('Произошла ошибка при создании копии поручения ' + commission.ID + ': ' + createdCopy.ErrorMessage);
                    continue;
                }

                //пропускаем уже созданные поручения-копии
                var copyCommission = this.CommissionsByID[createdCopy.ItemID];
                if (copyCommission != null)
                    continue;

                var copyCommissionNode = createdCommissionsXml.selectSingleNode('ItemCollection/Commissions/Item[@ID="' + createdCopy.ItemID + '"]');
                if (copyCommissionNode == null)
                    throw new Error('Не удалось получить данные созданного поручения-копии с идентификатором ' + createdCopy.ItemID);

                var sourceRowIndex = commission.TableRow.rowIndex;
                if (sourceRowIndex < 0)
                    throw new Error('Индекс строки поручения источника не может быть меньше 0.');
                var copyRowIndex = sourceRowIndex - j;
                var copyItem = this.CreateCommission(copyCommissionNode, copyRowIndex, commission.UserCreated);
                resetRowsLayout = true;
            }
        }
    }

    if (resetRowsLayout)
        this.ResetRowsLayout();
    CM_SetTextAreaWidth.call();

    //сбрасываем флаг запуска ожидания поручений.
    this.IsCommissionsWaiting = false;

    //запускаем следующую обработку ожидающих поручений.
    CM_WaitCommissions.call(this);
}



function CMItem_ChangeDisplayMode(isEdit) {
    if (!isEdit) {
        var i, len = this.Cells.length;
        for (i = 0; i < len; i++) {
            var cell = this.Cells[i];
            cell.UpdateViewControl();
            cell.ChangeDisplayMode(false);
        }
        if (this.Field.IsNewDesign) {
            if (this.EditTable != null)
                this.EditTable.style.display = 'none';
        }
        else {
            this.DivSave.style.display = 'none';
            this.DivDelete.style.display = 'none';
            this.ImageDoc.style.display = '';
        }
    }
}

function CMItem_UpdateViewControls() {
    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        var cellNode = this.XmlElement.selectSingleNode("Cells/ItemCell[@FieldTitle='" + cell.TableField.Title + "']");
        cell.XmlElement = cellNode;
        cell.InitXmlElement();
        cell.UpdateViewControl();
    }
}

function CMItem_SaveCompleted() {
    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        //cell.SaveData();
        var cellNode = this.XmlElement.selectSingleNode("Cells/ItemCell[@FieldTitle='" + cell.TableField.Title + "']");
        cell.XmlElement = cellNode;
        cell.InitXmlElement();
        cell.UpdateViewControl();
        cell.ChangeDisplayMode(false);
    }
    this.HideSaving();
    if (this.Field.IsNewDesign) {
        if (this.EditTable != null)
            this.EditTable.style.display = 'none';
    }
    else {
        this.DivSave.style.display = 'none';
        this.DivDelete.style.display = 'none';
        this.ImageDoc.style.display = '';
    }
}

//debugger
function CMItem_ShowSaving(text) {
    if (this.IsNew) {
        if (this.Field.IsNewDesign) {
            if (this.EditTable != null)
                this.EditTable.style.display = 'none';
        }
        else {
            this.DivSave.style.display = 'none';
            this.DivDelete.style.display = 'none';
        }
    }

    this.ShowCreationWaiting(text);

    if (!this.Field.IsNewDesign) {
        this.ImageSaving.style.display = '';
        if (!this.IsNew)
            this.ImageDoc.style.display = 'none';
    }
}

function CMItem_HideSaving() {
    if (this.IsNew) {
        if (this.Field.IsNewDesign) {
            if (this.EditTable != null)
                this.EditTable.style.display = '';
        }
        else {
            this.DivSave.style.display = '';
            this.DivDelete.style.display = '';
        }
    }

    this.HideCreationWaiting();

    if (!this.Field.IsNewDesign) {
        this.ImageSaving.style.display = 'none';
        if (!this.IsNew)
            this.ImageDoc.style.display = '';
    }
}

function CMItem_ShowCreationWaiting(text) {
    if (this.Field.IsNewDesign) {
        this.WaitingTable.style.display = '';
        if (!SM.IsNE(text))
            this.DivCreationWaiting.innerHTML = text;
        else if (this.IsTemplate)
            this.DivCreationWaiting.innerHTML = window.TN.TranslateKey('CMFieldControl.Saving') + '...';
        else
            this.DivCreationWaiting.innerHTML = window.TN.TranslateKey('CMFieldControl.Creating') + '...';
    }
    else
        this.DivCreationWaiting.style.display = '';
    this.DivFirstView.style.display = 'none';
}

//debugger
function CMItem_HideCreationWaiting() {
    if (this.Field.IsNewDesign) {
        this.WaitingTable.style.display = 'none';
        CM_FixPreviewSize.call(this.Field)
    }
    else
        this.DivCreationWaiting.style.display = 'none';
    if (!this.IsTemplate)
        this.DivFirstView.style.display = '';
}

function CM_FixPreviewSize() {
    if (this.InPreview) {
        var outerDiv = window.FilePreview.outerDiv;
        var cmTable = this.Table;
        if (cmTable.offsetWidth > outerDiv.offsetWidth - 14) {
            var widthInterval = cmTable.offsetWidth - (outerDiv.offsetWidth - 14);
            outerDiv.style.width = outerDiv.offsetWidth + widthInterval + 'px';
            outerDiv.style.left = outerDiv.offsetLeft - widthInterval + 'px';
        }
    }
}

function CMItem_ChangeEditAccess(enabled) {
    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        cell.ChangeEditAccess(enabled);
    }
}

function CMItem_Delete() {
    this.Deleted = true;
    this.TableRow.style.display = 'none';
    if (this.Field.NewRowsCount != null)
        this.Field.NewRowsCount--;
}

//debugger
function CMItem_DeleteClick() {
    if (window.confirm(window.TN.TranslateKey('CMFieldControl.DeleteRowConfirmation'))) {
        if (!(this.IsTemplate && !SM.IsNE(this.CreationEventID))) {
            //удаляем строку
            this.Delete();
            //перекрашиваем строки
            this.Field.ResetRowsLayout();
        }
        else {
            this.DeleteTemplate();
        }
    }
}

function CMItem_DeleteTemplate() {
    var url = this.Field.WebUrl + this.Field.ModulePath + '/CMOperation.aspx?rnd=' + Math.random();
    var params = new String();
    params = params.concat('&operation=', 'DeleteTemplate');
    params = params.concat('&parentListID=', this.Field.ListID);
    params = params.concat('&commissionsFieldID=', this.Field.FieldID);
    params = params.concat('&templateCreationEventID=', this.CreationEventID);

    url += params;

    var xmlRequest = window.SM.GetXmlRequest();
    xmlRequest.open('GET', url, true);
    var thisObj = this;
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            thisObj.DeleteTemplateCompleted(responseText);
        }
    };

    this.ShowSaving('Удаление...');
    this.ChangeEditAccess(false);

    xmlRequest.send(null);
}

function CMItem_DeleteTemplateCompleted(responseText) {
    if (responseText != null && responseText.indexOf('ResponseError:') != -1) {
        alert(responseText);
        return;
    }
    //удаляем строку
    this.Delete();
    //перекрашиваем строки
    this.Field.ResetRowsLayout();
}

function CMItem_IsFilled() {
    var isFilled = false;
    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        if (!cell.TableField.Disabled) {
            var textValue = cell.GetControlTextValue(true);
            if (!window.SM.IsNE(textValue)) {
                isFilled = true;
                break;
            }
        }
    }
    return isFilled;
}

/////////////////////////CMItem - END////////////////////////////////////



/////////////////////////CMValidationResult//////////////////////////////
/////////////////////////CMValidationResult - Methods//////////////////////////////
/////////////////////////CMValidationResult - //////////////////////////////




/////////////////////////CMItemCell//////////////////////////////////////

//debugger
function CMItemCell(xmlElement, item, tableField) {
    this.XmlElement = xmlElement;
    this.Item = item;
    this.Field = item.Field;
    this.TableField = tableField;

    //Common Methods
    this.GetAttribute = CM_GetAttribute;
    this.GetBooleanAttribute = CM_GetBooleanAttribute;
    this.GetIntegerAttribute = CM_GetIntegerAttribute;

    //Properties

    //Methods
    this.InitTableCell = CMItemCell_InitTableCell;
    this.InitXmlElement = CMItemCell_InitXmlElement;
    this.InitViewControl = CMItemCell_InitViewControl;
    this.InitEditControl = CMItemCell_InitEditControl;
    this.UpdateEditControl = CMItemCell_UpdateEditControl;
    this.UpdateViewControl = CMItemCell_UpdateViewControl;
    this.GetDataTextValue = CMItemCell_GetDataTextValue;
    this.Validate = CMItemCell_Validate;
    this.GetControlTextValue = CMItemCell_GetControlTextValue;
    this.SaveData = CMItemCell_SaveData;
    this.ChangeDisplayMode = CMItemCell_ChangeDisplayMode;
    this.ChangeEditAccess = CMItemCell_ChangeEditAccess;

    //Initialization
    this.InitTableCell();
    this.InitXmlElement();
    this.InitViewControl();
    if (this.Item.IsNew && !this.TableField.Disabled) {
        this.InitEditControl();
        if (this.Item.IsTemplate)
            this.UpdateEditControl();
    }
    else
        this.UpdateViewControl();
}

/////////////////////////CMItemCell - Methods//////////////////////////////////////

function CMItemCell_InitTableCell() {
    var tdItemCell = this.Item.TableRow.insertCell(-1);


    if (this.TableField.Width > 0)
        tdItemCell.style.width = (this.TableField.Width - 6) + 'px';


    this.TableCell = tdItemCell;
}

//debugger
function CMItemCell_InitXmlElement() {
    if (this.TableField.Type == 'Lookup' && this.TableField.LookupSettings != null) {
        if (!this.TableField.LookupSettings.IsMultiple) {
            this.LookupSingleNode = GetChildNode(this.XmlElement, 'LookupSingleValue');
        }
        else {
            this.LookupMultiNodes = GetChildNode(this.XmlElement, 'LookupMultiValue');
        }
    }
}

function CMItemCell_InitViewControl() {
    this.IsEditMode = false;
    var divViewControl = window.document.createElement('div');
    this.DivView = divViewControl;
    var fieldType = this.TableField.Type;
    if (fieldType == 'Text' || fieldType == 'Note' || fieldType == 'DateTime' || fieldType == 'Boolean') {
        var txtControl = window.document.createElement('span');
        this.TextViewControl = txtControl;
        divViewControl.appendChild(txtControl);
        if (this.Field.IsNewDesign) divViewControl.className = 'cm_view_control';

        //установка ширины
        if (this.TableField.Width != null) {
            if (this.Field.IsNewDesign) {
                var newWidth = (new Number(this.TableField.Width.replace('px', '')) + 5) + 'px';
                this.TableCell.style.width = newWidth;
                divViewControl.style.width = newWidth;
            }
        }


        if (this.TableField.IsItemLink && fieldType == 'Text') {
            this.TextViewControl.style.display = 'none';
            var linkControl = window.document.createElement('a');
            linkControl.href = 'javascript:';
            linkControl.className = 'cm_link';
            divViewControl.appendChild(linkControl);
            this.TextLinkViewControl = linkControl;
        }
    }
    else if (fieldType == 'Lookup') {
        divViewControl.className = 'cm_div_view';
        //установка ширины ячейки
        if (this.TableField.LookupSettings != null) {
            if (this.Field.IsNewDesign && this.TableField.LookupSettings.IsListControlMode
            && (this.TableField.LookupSettings.ControlWidth == 0 || this.TableField.LookupSettings.ControlWidth == null)) {
                var columnWidth = this.TableField.HeaderDiv.offsetWidth;
                if (!this.TableField.ColumnWidthSet) {
                    if (window.SM.IsNE(window.SM.GetCurrentStyle(this.TableField.HeaderDiv).width))
                        this.TableField.HeaderDiv.style.width = '100%';
                    columnWidth = this.TableField.HeaderDiv.offsetWidth;
                }
                if (columnWidth > 0) {
                    this.TableCell.style.width = columnWidth + 'px';
                    divViewControl.style.width = columnWidth + 'px';
                }
            }
            //установка ширины контрола
            if (this.TableField.LookupSettings.ControlWidth != null && this.TableField.LookupSettings.ControlWidth != 0) {
                var columnWidth = this.TableField.LookupSettings.ControlWidth;
                this.TableCell.style.width = columnWidth;
                divViewControl.style.width = columnWidth;
            }
        }
        else if (this.TableField.Width != null) {
            if (this.Field.IsNewDesign)
                this.TableCell.style.width = this.TableField.Width + 'px';
        }
    }
    if (this.Item.IsNew && !this.TableField.Disabled)
        this.DivView.style.display = 'none';
    this.TableCell.appendChild(divViewControl);
}

//debugger
function CMItemCell_InitEditControl() {
    this.Item.IsEditMode = true;
    this.IsEditMode = true;
    this.EditControlCreated = true;
    var thisObj = this;
    var divEditControl = window.document.createElement('div');
    divEditControl.className = 'cm_edit_control';
    this.DivEdit = divEditControl;

    var tField = this.TableField;
    var fieldType = this.TableField.Type;
    var defaultValueString = this.TableField.DefaultValue;
    if (fieldType == 'Text') {
        var txtControl = window.document.createElement('input');
        txtControl.type = 'text';
        txtControl.className = 'cm_textControl';

        if (!window.SM.IsNE(defaultValueString))
            txtControl.value = defaultValueString;

        this.TextEditControl = txtControl;
        divEditControl.appendChild(txtControl);
    }
    else if (fieldType == 'Note') {
        var noteControl = null;
        if (!this.Field.IsNewDesign) {
            noteControl = window.document.createElement('textarea');
            noteControl.className = 'cm_noteControl';

            if (!window.SM.IsNE(defaultValueString))
                noteControl.value = defaultValueString;
        }
        var tdOpenTemplate = null;
        if (!this.TableField.EnableTextTemplate || this.Field.IsNewDesign) {
            if (!this.Field.IsNewDesign)
                divEditControl.appendChild(noteControl);
            else {
                var styles = { fontSize: '11px', fontFamily: 'Tahoma' };
                this.NoteEditArea = new ResizableAreaControl({
                    Container: divEditControl,
                    Styles: styles,
                    Templates: this.TableField.TextTemplateItems,
                    NoRounded: true,
                    TemplateSeparator: this.TableField.TextTemplateSeparator,
                    Rows: this.TableField.MultiTextRows
                });
                noteControl = this.NoteEditArea.TextArea;
                divEditControl = this.NoteEditArea.Container;
            }
        }
        else {
            var tbNote = window.document.createElement('table');
            tbNote.border = 0;
            tbNote.cellSpacing = 0;
            tbNote.cellPadding = 0;
            tbNote.style.width = '100%';
            if (!this.Field.IsNewDesign)
                tbNote.style.width = '100%';
            var trNote = tbNote.insertRow(-1);
            var tdNote = trNote.insertCell(-1);
            if (!this.Field.IsNewDesign)
                tdNote.appendChild(noteControl);
            else {
                var styles = { fontSize: '11px', fontFamily: 'Tahoma' };
                this.NoteEditArea = new ResizableAreaControl({
                    Container: tdNote,
                    Styles: styles,
                    NoRounded: true,
                    IsBlue: true,
                    Rows: this.TableField.MultiTextRows
                });

                noteControl = this.NoteEditArea.TextArea;
            }
            noteControl.Item = this.Item;
            tdOpenTemplate = trNote.insertCell(-1);
            tdOpenTemplate.style.paddingLeft = '3px';
            tdOpenTemplate.style.width = '16px';

            var imgOpenTemplate = window.document.createElement('img');
            tdOpenTemplate.appendChild(imgOpenTemplate);
            imgOpenTemplate.border = 0;
            if (this.Field.IsNewDesign)
                imgOpenTemplate.src = '/_layouts/WSS/WSSC.V4.DMS.Fields.Commissions/Images/book.png';
            else
                imgOpenTemplate.src = '/_layouts/images/addressbook.gif';
            imgOpenTemplate.style.cursor = 'pointer';
            noteControl.IsNewDesign = this.Field.IsNewDesign;
            imgOpenTemplate.onclick = function () {
                if (noteControl.readOnly)
                    return;

                tField.TextTemplateControl.Show(noteControl);
            }
            noteControl.OpenImage = imgOpenTemplate;
            divEditControl.appendChild(tbNote);

        }
        if (this.Field.IsNewDesign) {
            var textAreaRuleName = 'commissions_textAreaField' + this.TableField.ID;
            if (this.Field.ResizableAreaColumns == null)
                this.Field.ResizableAreaColumns = new Array();

            if (this.TableField.TextAreaRule == null) {
                this.TextAreaRuleName = textAreaRuleName;
                if (this.Field.StyleSheet == null) {
                    var cssNode = document.createElement('STYLE');
                    cssNode.type = 'text/css';
                    cssNode.rel = 'stylesheet';
                    cssNode.media = 'screen';
                    cssNode.title = 'dynamicSheet';

                    if (cssNode.styleSheet) {
                        document.getElementsByTagName("head")[0].appendChild(cssNode);
                        this.Field.StyleSheet = cssNode.styleSheet;
                    }
                    else {
                        document.getElementsByTagName("head")[0].appendChild(cssNode);
                        this.Field.StyleSheet = cssNode.sheet;
                    }
                }

                /*
                if (window.SM.IsFF)
                    this.Field.StyleSheet.insertRule('.' + textAreaRuleName + '{width: 97%;}', 0);
                else {
                    this.Field.StyleSheet.addRule('.' + textAreaRuleName, '{outline: none;}');
                    this.Field.StyleSheet.addRule('.' + textAreaRuleName, '{width: 97%;}');
                }
                */

                if (this.Field.StyleSheet.addRule) {
                    this.Field.StyleSheet.addRule('.' + textAreaRuleName, '{}');
                    this.Field.StyleSheet.addRule('.' + textAreaRuleName, '{}');
                }
                else if (this.Field.StyleSheet.insertRule) {
                    this.Field.StyleSheet.insertRule('.' + textAreaRuleName + '{}', 0);
                }
                else
                    throw new Error('Браузер не поддерживает метод addRule/insertRule');

                var allRules = this.Field.StyleSheet.rules;
                if (allRules == null)
                    allRules = this.Field.StyleSheet.cssRules;

                if (allRules == null)
                    throw new Error('Браузер не поддерживает свойство rules/cssRules');

                var k, klen = allRules.length;
                for (k = 0; k < klen; k++) {
                    var rule = allRules[k];
                    if (rule.selectorText == '.' + textAreaRuleName) {
                        this.TableField.TextAreaRule = rule;
                        break;
                    }
                }

                this.Field.ResizableAreaColumns.push(this.TableField);
            }

            if (!window.SM.IsNE(defaultValueString))
                noteControl.value = defaultValueString;
            noteControl.DivEdit = this.DivEdit;
            noteControl.OpenTemplateCell = tdOpenTemplate;
            noteControl.className = 'cm_noteTextArea ' + textAreaRuleName;
            this.NoteEditArea.InitControl();
        }
        this.NoteEditControl = noteControl;
    }
    else if (fieldType == 'Boolean') {
        var checkControl = document.createElement('input');
        checkControl.type = 'checkbox';

        this.BooleanEditControl = checkControl;
        divEditControl.appendChild(checkControl);

        if (!window.SM.IsNE(defaultValueString))
            checkControl.checked = defaultValueString.toLowerCase() == 'true';
    }
    else if (fieldType == 'DateTime') {
        var dateControl = null;
        if (!this.Field.IsNewDesign) {
            dateControl = new DateTimeControl(null, this.TableField.ShowTime, null, null, this.Field.IsNewDesign);
            dateControl.DateInput.className = 'cm_dateControl';
        }
        else {
            var dateTimeWidth = 90;
            if (!window.SM.IsNE(this.TableField.Width) && this.TableField.Width != 0)
                dateTimeWidth = parseInt(this.TableField.Width.toString().split('px')[0]);
            if (dateTimeWidth % 2 == 0)
                dateTimeWidth = dateTimeWidth - 1;
            dateControl = new DatePickerControl({ ShowTime: this.TableField.ShowTime, TimeVertical: this.Field.IsNewDesign, ControlWidth: dateTimeWidth });
        }
        //this.DateCalendarImage = dateControl.DateInput.parentNode.parentNode.cells[1].children[0].children[0];
        //this.DateCalendarImage.style.marginTop = '0px';

        var defaultDateString = null;
        var defaultTimeString = null;
        if (!window.SM.IsNE(defaultValueString)) {
            var splDate = defaultValueString.toLowerCase().split('t');
            if (splDate.length > 0) {
                defaultDateString = splDate[0];
                if (splDate.length > 1)
                    defaultTimeString = splDate[1];
            }
        }
        tField.DefaultDateString = defaultDateString;
        tField.DefaultTimeString = defaultTimeString;

        if (!window.SM.IsNE(defaultDateString))
            dateControl.DateInput.value = defaultDateString;

        if (this.TableField.ShowTime) {
            if (!this.Field.IsNewDesign) {
                dateControl.Hours.className = 'cm_text';
                dateControl.Minutes.className = 'cm_text';
                dateControl.Hours.parentNode.style.paddingTop = '0px';
                dateControl.Minutes.parentNode.style.paddingTop = '0px';
            }

            if (!window.SM.IsNE(defaultTimeString))
                dateControl.SetTime(defaultTimeString);
        }
        this.DateEditControl = dateControl;
        divEditControl.appendChild(dateControl.Container);
    }
    else if (fieldType == 'Lookup' && this.TableField.LookupSettings != null) {
        var controlName = 'lookupControl_cmField' + this.Field.FieldID + '_tField' + this.TableField.ID + '_item' + this.Item.UniqueID;
        var collectionName = 'lookupControl_cmField' + this.Field.FieldID + '_item' + this.Item.UniqueID;
        var lookupControl = new DBLookupControl(controlName, this.TableField.LookupSettingsName, collectionName);
        if (lookupControl.Settings.ControlMode == 'LookupWindow' &&
          (lookupControl.Settings.WindowControlMode == 'EnumView' || lookupControl.Settings.WindowControlMode == 'RowView') &&
          !lookupControl.Settings.IsListControlMode) {
            lookupControl.EditControl.parentNode.style.width = '100%';
            lookupControl.EditControl.parentNode.parentNode.parentNode.parentNode.style.width = '100%';
        }

        //правка баги с перекрытием выпадающего списка подстановки соседними контролами
        if (this.Field.IsNewDesign && SM.IsIE) {
            this.TableCell.onclick = function () {
                if (thisObj.Item.CurrentCell != null) {
                    thisObj.Item.CurrentCell.style.zIndex = 0;
                    thisObj.Item.CurrentDiv.style.zIndex = 0;
                }
                thisObj.Item.CurrentCell = thisObj.TableCell;
                thisObj.Item.CurrentDiv = thisObj.DivEdit;
                thisObj.Item.CurrentCell.style.zIndex = 100;
                thisObj.Item.CurrentDiv.style.zIndex = 100;
            }
        }

        //если задана ширина контрола, то устанавливаем ее
        this.LookupEditControl = lookupControl;
        if (this.Field.IsNewDesign && this.TableField.LookupSettings.IsListControlMode
            && (this.TableField.LookupSettings.ControlWidth == 0 || this.TableField.LookupSettings.ControlWidth == null)) {
            var thisObj = this;
            var columnWidth = thisObj.TableField.HeaderDiv.offsetWidth;
            if (!thisObj.TableField.ColumnWidthSet) {
                if (window.SM.IsNE(window.SM.GetCurrentStyle(thisObj.TableField.HeaderDiv).width))
                    thisObj.TableField.HeaderDiv.style.width = '100%';
                columnWidth = thisObj.TableField.HeaderDiv.offsetWidth;
                if (columnWidth > 0) {
                    thisObj.TableField.HeaderDiv.style.width = columnWidth + 'px';
                    thisObj.TableField.HeaderCell.style.width = columnWidth + 'px';
                }
                thisObj.TableField.ColumnWidthSet = true;
            }
            if (columnWidth > 0) {
                thisObj.LookupEditControl.ListControl.SetControlWidth(columnWidth);
            }
        }
        //установка ширины контрола
        if (this.Field.IsNewDesign && this.TableField.LookupSettings.ControlWidth != null && this.TableField.LookupSettings.ControlWidth != 0) {
            var columnWidth = this.TableField.LookupSettings.ControlWidth;
            this.LookupEditControl.ListControl.SetControlWidth(columnWidth);
        }
        divEditControl.appendChild(lookupControl.Container);
    }
    this.TableCell.appendChild(divEditControl);

}
//debugger

//debugger
function CMItemCell_UpdateEditControl() {
    var fieldType = this.TableField.Type;
    if (fieldType == 'Text' || fieldType == 'Note' || fieldType == 'DateTime' || fieldType == 'Boolean') {
        var value = this.GetDataTextValue();
        value = GetEmptyStringIfNull(value);
        if (fieldType == 'Text')
            this.TextEditControl.value = value;
        else if (fieldType == 'Note') {
            this.NoteEditControl.value = value;
            this.NoteEditControl.Adjust();
        }
        else if (fieldType == 'Boolean')
            this.BooleanEditControl.checked = !SM.IsNE(value) && value.toLowerCase() == 'true';
        else if (fieldType == 'DateTime') {
            //делаем проверку на null, иначе вместо дефалтового времени установить 0:00
            if (!SM.IsNE(value))
                this.DateEditControl.SetDateTime(value);
        }
    }
    else if (fieldType == 'Lookup' && this.TableField.LookupSettings != null) {
        if (!this.TableField.LookupSettings.IsMultiple) {
            var lookupValueNode = this.LookupSingleNode;
            if (lookupValueNode != null) {
                var lookupValue = new CMLookupValue(lookupValueNode, this);
                var lookupControl = null;
                if (!window.SM.IsNE(lookupValue.LookupID)) {
                    this.LookupEditControl.SetValue(lookupValue);
                }
            }
        }
        else {
            var lookupValueNodes = this.LookupMultiNodes.selectNodes('LookupValue');
            var i, len = lookupValueNodes.length;
            if (len > 0) {
                var lookupValues = new Array();
                for (i = 0; i < len; i++) {
                    var lookupValueNode = lookupValueNodes[i];
                    var lookupValue = new CMLookupValue(lookupValueNode, this);
                    if (!window.SM.IsNE(lookupValue.LookupID))
                        lookupValues.push(lookupValue);
                }
                if (lookupValues.length > 0)
                    this.LookupEditControl.SetValue(lookupValues);
            }
        }
    }
}




function ShortenText(content, maxCharactersCount, textViewControl) {
    var originalContent = content;
    var hasShortContent = false;

    if (maxCharactersCount > 0 && content.length > maxCharactersCount) {
        var maxContent = content.substr(0, maxCharactersCount);
        var lastSpaceIndex = maxContent.lastIndexOf(' ');
        var isMaxCharSpace = content[maxCharactersCount] == ' ';



        if (lastSpaceIndex != -1 && !isMaxCharSpace) {
            content = maxContent.substr(0, lastSpaceIndex);
            hasShortContent = true;
        }
        else if (isMaxCharSpace) {
            content = content.substr(0, maxCharactersCount);
            hasShortContent = true;
        }
        else {
            var nextContent = content.substr(maxCharactersCount);
            var firstSpaceAfterMaxIndex = nextContent.indexOf(' ');
            if (firstSpaceAfterMaxIndex != -1) {
                content = content.substr(0, maxCharactersCount + firstSpaceAfterMaxIndex);
                hasShortContent = true;
            }
        }
    }
    if (!hasShortContent)
        textViewControl.innerHTML = content;
    else {
        var contentTooltipLink = document.createElement('a');
        contentTooltipLink.fullContent = originalContent;
        contentTooltipLink.className = 'cm_link';
        contentTooltipLink.href = 'javascript:';
        if (SM.IsIE)
            contentTooltipLink.innerText = '...';
        else
            contentTooltipLink.textContent = '...';
        contentTooltipLink.onclick = CMItemCellContentLink_OnShowFullContentClick;

        textViewControl.innerHTML = content + '&nbsp;';
        textViewControl.appendChild(contentTooltipLink);
    }
}

function CMItemCellContentLink_OnShowFullContentClick() {
    RL.CallAsync('Tooltip', 'CMItemCellContentLink_ShowFullContent', this);
}

function CMItemCellContentLink_ShowFullContent() {
    var fullContent = this.fullContent;
    var parentElement = this;
    if (!parentElement.ToolTip) {
        parentElement.ToolTip = new Tooltip({
            isVertical: true,
            parentElement: this,
            hideOnMouseOut: false,
            relativeX: 0,
            relativeY: 0,
            relativeLeft: 0,

            enableSelection: true
        });
        parentElement.ToolTip.ParentControl = this;
        var contentTooltip = document.createElement('div');
        contentTooltip.className = "cm_field_tooltip";
        contentTooltip.innerHTML = fullContent;

        parentElement.ToolTip.Container.style.zIndex = 10000;

        parentElement.ToolTip.DivContent.appendChild(contentTooltip);

    }
    if (!parentElement.ToolTip.Visible) {

    }
    parentElement.ToolTip.ShowTrigger();
}

function CMItemCell_UpdateViewControl() {
    var fieldType = this.TableField.Type;
    if (fieldType == 'Text' || fieldType == 'Note' || fieldType == 'DateTime' || fieldType == 'Boolean') {
        var value = this.GetDataTextValue();
        value = GetEmptyStringIfNull(value);
        if (value == null || value == '')
            value = '&nbsp;';

        if (!this.TableField.IsItemLink) {
            //не стал убирать, чтобы не разрушить совместимость со старым кодом.
            this.TextViewControl.innerHTML = value;

            if (fieldType == 'Note') {
                var maxLength = this.TableField.MaxLength;
                var currentText = this.TextViewControl.innerHTML;
                var shortenText = ShortenText(currentText, maxLength, this.TextViewControl);
                // this.TextViewControl.innerHTML = shortenText;
            }
            else if (fieldType == 'Boolean') {
                this.TextViewControl.innerHTML = !SM.IsNE(value) && value.toLowerCase() == 'true' ?
                    TN.TranslateKey('CMFieldControl.BooleanYes') :
                    TN.TranslateKey('CMFieldControl.BooleanNo');
            }
        }
        else if (fieldType == 'Text') {
            this.TextViewControl.style.display = 'none';
            this.TextLinkViewControl.style.display = '';

            this.TextLinkViewControl.innerHTML = value;
            var itemID = this.Item.GetAttribute('ID');
            var url = null;
            var itemDispUrl = this.Field.CommissionsListDispFormUrl + '?ID=' + itemID + '&Source=' + encodeURI(this.Field.BackRedirectUrl);
            var itemEditUrl = this.Field.CommissionsListEditFormUrl + '?ID=' + itemID + '&Source=' + encodeURI(this.Field.BackRedirectUrl) + '&showDispFormWithoutEditAccess=true';
            if (!this.Field.IsEditFormRedirect)
                url = itemDispUrl;
            else
                url = itemEditUrl;
            var thisObj = this;
            this.TextLinkViewControl.onclick = function () { window.open(url, '_blank', thisObj.Field.OpenWinFeatures); }
        }
    }
    else if (fieldType == 'Lookup' && this.TableField.LookupSettings != null) {
        if (this.DivView.LastLookupControl != null)
            this.DivView.LastLookupControl.style.display = 'none';
        if (!this.TableField.LookupSettings.IsMultiple) {
            var lookupValueNode = this.LookupSingleNode;
            if (lookupValueNode != null) {
                var lookupValue = new CMLookupValue(lookupValueNode, this);
                var lookupControl = null;
                if (!window.SM.IsNE(lookupValue.LookupID)) {
                    if (this.TableField.LookupSettings.ShowLookupLink)
                        lookupControl = lookupValue.CreateLookupLink();
                    else
                        lookupControl = lookupValue.CreateLookupText();
                    if (lookupControl != null) {
                        if (!this.Field.IsLoading && !this.LookupCellWidthSet) {
                            if (this.TableField.HeaderDiv.offsetWidth > 0)
                                this.TableCell.style.width = (this.TableField.HeaderDiv.offsetWidth - 8) + 'px';
                            this.TableCell.style.wordWrap = 'break-word';
                            this.LookupCellWidthSet = true;
                        }
                        this.DivView.appendChild(lookupControl);
                        this.DivView.LastLookupControl = lookupControl;
                    }
                }
            }
        }
        else {
            var lookupValueNodes = this.LookupMultiNodes.selectNodes('LookupValue');
            var i, len = lookupValueNodes.length;
            if (len > 0) {
                var divMultiValue = window.document.createElement('div');
                this.DivView.LastLookupControl = divMultiValue;
                for (i = 0; i < len; i++) {
                    var lookupValueNode = lookupValueNodes[i];
                    var lookupValue = new CMLookupValue(lookupValueNode, this);
                    var lookupControl = null;
                    if (this.TableField.LookupSettings.ShowLookupLink)
                        lookupControl = lookupValue.CreateLookupLink();
                    else
                        lookupControl = lookupValue.CreateLookupText();
                    if (lookupControl != null) {

                        /*
                        if(i < len - 1)
                        {
                        var spnSep = window.document.createElement('span');
                        spnSep.innerHTML = ';';
                        lookupControl.appendChild(spnSep);
                        lookupControl.style.marginRight = '5px';
                        }
                        */

                        //--вариант с дивами убрал, потому что по неск.строчкам один контрол сжимается

                        //вернул

                        if (!this.Field.IsLoading && !this.LookupCellWidthSet) {
                            if (this.TableField.HeaderDiv.offsetWidth > 0)
                                this.TableCell.style.width = (this.TableField.HeaderDiv.offsetWidth - 8) + 'px';
                            this.TableCell.style.wordWrap = 'break-word';
                            this.LookupCellWidthSet = true;
                        }

                        var divLookupControl = window.document.createElement('div');
                        divLookupControl.appendChild(lookupControl);
                        divMultiValue.appendChild(divLookupControl);
                        //divMultiValue.appendChild(lookupControl);
                    }
                }

                this.DivView.appendChild(divMultiValue);

            }
        }

        if (this.DivView.LastLookupControl == null)
            $(this.DivView).text(' ');
    }
}

//debugger
function CMItemCell_GetDataTextValue() {
    var value = null;
    var fieldType = this.TableField.Type;
    if (fieldType == 'Text' || fieldType == 'Note' || fieldType == 'Boolean')
        value = this.GetAttribute('Value');
    if (fieldType == 'DateTime') {
        var textValue = this.GetAttribute('Value');
        if (!window.SM.IsNE(textValue)) {
            var splDate = textValue.split('T');
            if (splDate.length > 0) {
                value = splDate[0];
                if (this.TableField.ShowTime && splDate.length > 1) {
                    var timeString = splDate[1];
                    var splTime = timeString.split(':');
                    if (splTime.length > 1)
                        value += ' ' + splTime[0] + ':' + splTime[1];
                }
            }
        }
    }
    return value;
}

//debugger
function CM_SetTextAreaWidth() {
    if (this.ResizableAreaColumns != null) {
        var i, len = this.ResizableAreaColumns.length;
        for (i = 0; i < len; i++) {
            var textColumn = this.ResizableAreaColumns[i];
            if (textColumn.TextAreaRule != null) {
                var textWidth = '140';
                textColumn.TextAreaRule.style.width = '0px';
                var columnWidth = textColumn.HeaderCell.offsetWidth;
                if (columnWidth > 0) {
                    if (textColumn.EnableTextTemplate)
                        textWidth = columnWidth - 8 - 24;
                    else
                        textWidth = columnWidth - 8;
                    textColumn.TextAreaRule.style.width = textWidth + 'px';
                    if (!textColumn.ColumnWidthSet) {
                        textColumn.HeaderCell.style.width = columnWidth - 8 + 'px';
                        textColumn.ColumnWidthSet = true;
                    }
                }
            }
        }
    }
}

//debugger
function CMItemCell_Validate() {
    var result = new CMValidationResult();
    if (this.EditControlCreated) {
        //проверка корректности
        var fieldType = this.TableField.Type;
        if (fieldType == 'DateTime') {
            var rgDate = new RegExp('^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)([0-9][0-9])$');
            var dateString = this.DateEditControl.DateInput.value;
            var isValid = true;

            var day = null;
            var month = null;
            var year = null;
            var hour = null;
            var minute = null;

            if (this.TableField.ShowTime) {
                if (!this.Field.IsNewDesign) {
                    hour = this.DateEditControl.Hours.value;
                    minute = this.DateEditControl.Minutes.value;
                }
                else {
                    hour = this.DateEditControl.Hours.Value != null ? this.DateEditControl.Hours.Value.Value : '';
                    minute = this.DateEditControl.Minutes.Value != null ? this.DateEditControl.Minutes.Value.Value : '';
                }
                if (window.SM.IsNE(dateString) && !window.SM.IsNE(this.TableField.DefaultTimeString)) {
                    if (!window.SM.IsNE(hour) && !window.SM.IsNE(minute)) {
                        var timeString = hour + ':' + minute;
                        if (timeString == this.TableField.DefaultTimeString) {
                            hour = '0';
                            minute = '0';
                        }
                    }
                }
            }

            if (!window.SM.IsNE(dateString)) {
                var matchResult = dateString.match(rgDate);
                var isValid = matchResult != null;
                if (isValid) {
                    day = matchResult[1];
                    month = matchResult[2];
                    year = matchResult[3] + matchResult[4];
                    isValid = CheckMonthMaxDay(day, month, year);
                }
            }
            else {
                if (isValid && this.TableField.ShowTime) {
                    isValid = hour == '0' && minute == '0';
                }
            }
            result.IsValid = isValid;
            result.Incorrect = !isValid;
            if (isValid && !window.SM.IsNE(this.TableField.ConditionValue) && !window.SM.IsNE(dateString)) {
                var dayInt = CM_GetDigitFromString(day);
                var monthInt = CM_GetDigitFromString(month);
                var yearInt = CM_GetDigitFromString(year);
                var hourInt = 0;
                var minuteInt = 0;
                if (this.TableField.ShowTime) {
                    hourInt = CM_GetDigitFromString(hour);
                    minuteInt = CM_GetDigitFromString(minute);
                }

                var cndDay = 0;
                var cndMonth = 0;
                var cndYear = 0;
                var cndHour = 0;
                var cndMinute = 0;

                var splDate = this.TableField.ConditionValue.split('T');
                if (splDate.length > 0) {
                    var splDatePart = splDate[0].split('.');

                    cndDay = CM_GetDigitFromString(splDatePart[0]);
                    cndMonth = CM_GetDigitFromString(splDatePart[1]);
                    cndYear = CM_GetDigitFromString(splDatePart[2]);

                    if (splDate.length > 1) {
                        var splTimePart = splDate[1].split(':');
                        if (splTimePart.length > 1) {
                            cndHour = CM_GetDigitFromString(splTimePart[0]);
                            cndMinute = CM_GetDigitFromString(splTimePart[1]);
                        }
                    }
                }

                var isEqual = false;
                var isGreater = false;
                var isSmaller = false;

                //проверка на равенство
                if (yearInt == cndYear && monthInt == cndMonth && dayInt == cndDay) {
                    isEqual = true;
                    if (!(cndHour == 0 && cndMinute == 0))
                        isEqual = hourInt == cndHour && minuteInt == cndMinute;
                }

                //проверка на больше
                if (yearInt > cndYear)
                    isGreater = true;
                else if (yearInt == cndYear && monthInt > cndMonth)
                    isGreater = true;
                else if (yearInt == cndYear && monthInt == cndMonth && dayInt > cndDay)
                    isGreater = true;
                else if (yearInt == cndYear && monthInt == cndMonth && dayInt == cndDay && !(cndHour == 0 && cndMinute == 0) && hourInt > cndHour)
                    isGreater = true;
                else if (yearInt == cndYear && monthInt == cndMonth && dayInt == cndDay && !(cndHour == 0 && cndMinute == 0) && hourInt == cndHour && minuteInt > cndMinute)
                    isGreater = true;

                //проверка на меньше
                if (yearInt < cndYear)
                    isSmaller = true;
                else if (yearInt == cndYear && monthInt < cndMonth)
                    isSmaller = true;
                else if (yearInt == cndYear && monthInt == cndMonth && dayInt < cndDay)
                    isSmaller = true;
                else if (yearInt == cndYear && monthInt == cndMonth && dayInt == cndDay && !(cndHour == 0 && cndMinute == 0) && hourInt < cndHour)
                    isSmaller = true;
                else if (yearInt == cndYear && monthInt == cndMonth && dayInt == cndDay && !(cndHour == 0 && cndMinute == 0) && hourInt == cndHour && minuteInt < cndMinute)
                    isSmaller = true;

                var conditionType = this.TableField.ConditionValueType;
                var conditionSuccessed = true;
                if (conditionType == 'Equal')
                    conditionSuccessed = isEqual;
                else if (conditionType == 'Greater')
                    conditionSuccessed = isGreater;
                else if (conditionType == 'Smaller')
                    conditionSuccessed = isSmaller;
                else if (conditionType == 'GreaterOrEqual')
                    conditionSuccessed = isGreater || isEqual;
                else if (conditionType == 'SmallerOrEqual')
                    conditionSuccessed = isSmaller || isEqual;

                result.IsValid = conditionSuccessed;
                result.Incorrect = !conditionSuccessed;
                result.ConditionFailed = !conditionSuccessed;
            }
        }

        //проверка обязательности
        if (this.TableField.Required) {
            var checkRequired = true;
            if (this.TableField.RequiredConditions.length > 0) {
                var i, len = this.TableField.RequiredConditions.length;
                var passed = true;
                for (i = 0; i < len; i++) {
                    var cmCondition = this.TableField.RequiredConditions[i];
                    var checkCondResult = cmCondition.Check(this.Item);
                    if (!checkCondResult)
                        passed = false;
                }
                checkRequired = passed;
            }
            if (checkRequired) {
                var textValue = this.GetControlTextValue();
                if (!/[^\s]+/g.test(textValue)) {    //   Проверка наличия только пробелов
                    result.IsValid = false;
                    result.NotFilled = true;
                }
            }
        }
    }
    return result;
}

function CMValidationResult() {
    this.IsValid = true;
    this.NotFilled = false;
    this.Incorrect = false;
    this.ConditionFailed = false;
}


//debugger
function CMItemCell_GetControlTextValue(checkFilled) {
    var textValue = '';
    if (this.EditControlCreated) {
        var fieldType = this.TableField.Type;
        if (fieldType == 'Text' && this.TextEditControl != null) {
            textValue = this.TextEditControl.value;
        }
        else if (fieldType == 'Note' && this.NoteEditControl != null) {
            textValue = this.NoteEditControl.value;

            if (!SM.IsNE(textValue)) {
                var regEmptyText = /^\s+$/g;
                if (regEmptyText.test(textValue))
                    textValue = '';
            }
        }
        else if (fieldType == 'Boolean' && this.BooleanEditControl != null) {
            textValue = this.BooleanEditControl.checked ? 'True' : 'False';
            if (checkFilled && !SM.IsNE(this.TableField.DefaultValue) &&
                this.TableField.DefaultValue.toLowerCase() == textValue.toLowerCase())
                textValue = '';
        }
        else if (fieldType == 'DateTime' && this.DateEditControl != null) {
            textValue = this.DateEditControl.DateInput.value;
            if (this.TableField.ShowTime) {
                if (window.SM.IsNE(textValue))
                    textValue = '';
                if (checkFilled && textValue == this.TableField.DefaultDateString)
                    textValue = '';
                var stHour = ''
                var stMinute = ''
                if (!this.Field.IsNewDesign) {
                    stHour = this.DateEditControl.Hours.value;
                    stMinute = this.DateEditControl.Minutes.value;
                }
                else {
                    stHour = this.DateEditControl.Hours.Value != null ? this.DateEditControl.Hours.Value.Value : '';
                    stMinute = this.DateEditControl.Minutes.Value != null ? this.DateEditControl.Minutes.Value.Value : '';
                }

                if (window.SM.IsNE(textValue) && !window.SM.IsNE(this.TableField.DefaultTimeString)) {
                    if (!window.SM.IsNE(stHour) && !window.SM.IsNE(stMinute)) {
                        var timeString = stHour + ':' + stMinute;
                        if (timeString == this.TableField.DefaultTimeString) {
                            stHour = '0';
                            stMinute = '0';
                        }
                    }
                }

                if (!(stHour == '0' && stMinute == '0') || !window.SM.IsNE(textValue))
                    textValue += ' ' + stHour + ':' + stMinute + ':00';

            }
        }
        else if (fieldType == 'Lookup' && this.LookupEditControl != null) {
            var lookupValue = this.LookupEditControl.Value;
            if (lookupValue != null) {
                if (!this.LookupEditControl.Settings.IsMultiple) {
                    var lookupID = lookupValue.LookupID;
                    if (!window.SM.IsNE(lookupID) && lookupID != 0 && lookupID != '0')
                        textValue = lookupID;
                }
                else if (lookupValue.length > 0) {
                    var stIDs = '';
                    var i, len = lookupValue.length;
                    for (i = 0; i < len; i++) {
                        var singleValue = lookupValue[i];
                        var lookupID = singleValue.LookupID;
                        if (!window.SM.IsNE(lookupID) && lookupID != 0 && lookupID != '0') {
                            if (stIDs.length > 0)
                                stIDs += ';';
                            stIDs += lookupID;
                        }
                    }
                    if (stIDs.length > 0)
                        textValue = stIDs;
                }
            }
            if (checkFilled && !SM.IsNE(this.TableField.DefaultValue)) {
                if (textValue == this.TableField.DefaultValue)
                    textValue = '';
                else if (SM.IsNE(textValue))
                    textValue = '';
            }
        }
    }
    if (textValue == null)
        textValue = '';
    return textValue;
}

//debugger
function CMItemCell_SaveData() {
    if (this.EditControlCreated) {
        var fieldType = this.TableField.Type;
        var fieldTitle = this.TableField.Title;
        var simpleTypeValue = '';
        var isSimpleType = false;
        if (fieldType == 'Text' && this.TextEditControl != null) {
            simpleTypeValue = this.TextEditControl.value;
            isSimpleType = true;
        }
        else if (fieldType == 'Note' && this.NoteEditControl != null) {
            simpleTypeValue = this.NoteEditControl.value;
            isSimpleType = true;
        }
        else if (fieldType == 'Boolean' && this.BooleanEditControl != null) {
            simpleTypeValue = this.BooleanEditControl.checked ? 'True' : 'False';
            isSimpleType = true;
        }
        else if (fieldType == 'DateTime' && this.DateEditControl != null) {
            simpleTypeValue = this.DateEditControl.DateInput.value;
            isSimpleType = true;
        }
        else if (fieldType == 'Lookup' && this.LookupEditControl != null) {
            var lookupValue = this.LookupEditControl.Value;
            if (lookupValue != null) {
                if (!this.LookupEditControl.Settings.IsMultiple) {
                    //чтобы записать пустой идшник
                    var lookupID = GetEmptyStringIfNull(lookupValue.LookupID);
                    var lookupText = lookupValue.LookupValue;
                    var lookupUrl = lookupValue.LookupUrl;
                    this.LookupSingleNode.setAttribute('ID', lookupID);
                    this.LookupSingleNode.setAttribute('Text', lookupText);
                    this.LookupSingleNode.setAttribute('Url', lookupUrl);
                }
                else {
                    var i, len = lookupValue.length;
                    ClearChildNodes(this.LookupMultiNodes);
                    for (i = 0; i < len; i++) {
                        var singleValue = lookupValue[i];
                        var lookupID = GetEmptyStringIfNull(singleValue.LookupID);
                        var lookupText = singleValue.LookupValue;
                        var lookupUrl = singleValue.LookupUrl;
                        var singleValueNode = AddChildNode(this.LookupMultiNodes, 'Val');
                        singleValueNode.setAttribute('LookupID', lookupID);
                        singleValueNode.setAttribute('LookupText', lookupText);
                        //singleValueNode.setAttribute('Url', lookupUrl);
                    }
                }
            }
        }
        if (isSimpleType)
            this.XmlElement.setAttribute('Value', simpleTypeValue);
    }
}

//debugger
function CMItemCell_ChangeDisplayMode(isEditMode) {
    if (!this.TableField.Disabled) {
        if (isEditMode) {
            this.DivView.style.display = 'none';
            if (this.DivEdit != null)
                this.DivEdit.style.display = '';
        }
        else {
            this.DivView.style.display = '';
            if (this.DivEdit != null)
                this.DivEdit.style.display = 'none';
        }
    }
}

function CMItemCell_ChangeEditAccess(enabled) {
    if (this.EditControlCreated) {
        var fieldType = this.TableField.Type;
        if (fieldType == 'Text' && this.TextEditControl != null) {
            this.TextEditControl.readOnly = !enabled;

            if (enabled)
                this.TextEditControl.style.color = "#000000";
            else
                this.TextEditControl.style.color = "#808080";
        }
        else if (fieldType == 'Note' && this.NoteEditControl != null) {
            this.NoteEditControl.readOnly = !enabled;

            if (enabled)
                this.NoteEditControl.style.color = "#000000";
            else
                this.NoteEditControl.style.color = "#808080";
        }
        else if (fieldType == 'Boolean' && this.BooleanEditControl != null) {
            this.BooleanEditControl.disabled = !enabled;
        }
        else if (fieldType == 'DateTime' && this.DateEditControl != null) {
            if (enabled)
                this.DateEditControl.Enable();
            else
                this.DateEditControl.Disable();
        }
        else if (fieldType == 'Lookup' && this.LookupEditControl != null) {
            if (enabled)
                this.LookupEditControl.Enable();
            else
                this.LookupEditControl.Disable();
        }
    }
}


/////////////////////////CMItemCell - END//////////////////////////////////////



/////////////////////////CMLookupValue/////////////////////////////////

function CMLookupValue(xmlElement, cell) {
    this.XmlElement = xmlElement;
    this.Cell = cell;

    //Common Methods
    this.GetAttribute = CM_GetAttribute;
    this.GetBooleanAttribute = CM_GetBooleanAttribute;
    this.GetIntegerAttribute = CM_GetIntegerAttribute;

    //Properties
    this.LookupID = this.GetAttribute('LookupID');
    this.LookupText = this.GetAttribute('LookupText');
    this.LookupUrl = this.Cell.TableField.LookupSettings.LookupListDispFormUrl + '?ID=' + this.LookupID;

    //Methods
    this.CreateLookupLink = CMLookupValue_CreateLookupLink;
    this.CreateLookupText = CMLookupValue_CreateLookupText;
}

/////////////////////////CMLookupValue - Methods/////////////////////////////////

function CMLookupValue_CreateLookupLink() {
    var lookupLink = window.document.createElement('a');
    lookupLink.innerHTML = GetEmptyStringIfNull(this.LookupText);
    lookupLink.className = 'cm_link';
    lookupLink.href = 'javascript:';
    var url = this.LookupUrl + '&Source=/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/ClosePage.aspx';
    var thisObj = this;
    lookupLink.onclick = function () { window.open(url, '_blank', thisObj.Cell.Field.OpenWinFeatures); }
    return lookupLink;
}

function CMLookupValue_CreateLookupText() {
    var lookupSpan = window.document.createElement('span');
    lookupSpan.innerHTML = GetEmptyStringIfNull(this.LookupText);
    return lookupSpan;
}

/////////////////////////CMLookupValue - END/////////////////////////////////



///////////////Common Methods//////////////////////
function CM_GetAttribute(attributeName) {
    return GetAttributeValue(this.XmlElement, attributeName);
}

function CM_GetBooleanAttribute(attributeName) {
    return GetBooleanAttributeValue(this.XmlElement, attributeName);
}

function CM_GetIntegerAttribute(attributeName) {
    return GetIntegerAttributeValue(this.XmlElement, attributeName);
}


//получение текстового атрибута ХМЛ-элемента
function GetAttributeValue(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!window.SM.IsNE(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function GetBooleanAttributeValue(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = GetAttributeValue(xmlElement, attributeName);
    if (!window.SM.IsNE(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function GetIntegerAttributeValue(xmlElement, attributeName) {
    var intValue = 0;
    var value = GetAttributeValue(xmlElement, attributeName);
    if (!window.SM.IsNE(value))
        intValue = parseInt(value);
    return intValue;
}

function ClearChildNodes(xmlElement) {
    if (xmlElement != null) {
        while (xmlElement.firstChild != null)
            xmlElement.removeChild(xmlElement.firstChild);
    }
}

//Функция для получения массива параметров URL
function GetRequestValue(paramName) {
    var value = null;
    if (!window.SM.IsNE(paramName)) {
        paramName = paramName.toLowerCase();
        var requestCollection = RequestCollection();
        if (requestCollection != null)
            value = requestCollection[paramName];
    }
    return value;
}

var cm_htRequestParams = null;
function RequestCollection() {
    if (cm_htRequestParams == null) {
        cm_htRequestParams = new Array();
        var splitedUrl = window.location.href.split('?');
        if (splitedUrl[1] != null) {
            var stParams = splitedUrl[1];
            var arParams = stParams.split('&');
            var i, len = arParams.length;
            for (i = 0; i < len; i++) {
                var paramPair = arParams[i].split('=');
                if (paramPair.length = 2) {
                    var key = paramPair[0];
                    if (!window.SM.IsNE(key)) {
                        key = key.toLowerCase();
                        var reqValue = paramPair[1];
                        cm_htRequestParams[key] = reqValue;
                    }
                }
            }
        }
    }
    return cm_htRequestParams;
}

var Guid_Empty = '00000000-0000-0000-0000-000000000000';

function GetEmptyStringIfNull(obj) {
    if (obj != null)
        return obj;
    else
        return '';
}

//генерит уникальный ИД для ХТМЛ-элементов. Используется для котрола даты
var htUniqueIDs = null;
function GenerateUniqueID(idPrefix) {
    var isUnique = false;
    var id = null;
    if (htUniqueIDs == null)
        htUniqueIDs = new Array();
    while (!isUnique) {
        var rndSuffix = Math.random().toString().split('.')[1];
        id = idPrefix + '_' + rndSuffix;
        if (htUniqueIDs[id] == null) {
            isUnique = true;
            htUniqueIDs[id] = id;
        }
    }
    return id;
}

function CheckMonthMaxDay(day, month, year) {
    var valid = false;
    var intDay = parseInt(day);
    switch (month) {
        case '01':
            valid = intDay <= 31;
            break;

        case '02':
            var isLeapYear = parseInt(year) % 4 == 0;
            if (isLeapYear)
                valid = intDay <= 29;
            else
                valid = intDay <= 28;
            break;

        case '03':
            valid = intDay <= 31;
            break;

        case '04':
            valid = intDay <= 30;
            break;

        case '05':
            valid = intDay <= 31;
            break;

        case '06':
            valid = intDay <= 30;
            break;

        case '07':
            valid = intDay <= 31;
            break;

        case '08':
            valid = intDay <= 31;
            break;

        case '09':
            valid = intDay <= 30;
            break;

        case '10':
            valid = intDay <= 31;
            break;

        case '11':
            valid = intDay <= 30;
            break;

        case '12':
            valid = intDay <= 31;
            break;
    }
    return valid;
}

function GetChildNode(parentNode, childNodeName) {
    var childNode = null;
    if (!window.SM.IsNE(childNodeName)) {
        childNode = parentNode.selectSingleNode(childNodeName);
        if (childNode == null) {
            childNode = parentNode.ownerDocument.createElement(childNodeName);
            parentNode.appendChild(childNode);
        }
    }
    return childNode;
}

function AddChildNode(parentNode, childNodeName) {
    var childNode = null;
    if (!window.SM.IsNE(childNodeName)) {
        childNode = parentNode.ownerDocument.createElement(childNodeName);
        parentNode.appendChild(childNode);
    }
    return childNode;
}

function CM_GetDigitFromString(str) {
    var digit = 0;
    if (str.length == 2) {
        var firstChar = str.charAt(0);
        if (firstChar == '0')
            str = str.charAt(1);
    }
    digit = parseInt(str);
    return digit;
}