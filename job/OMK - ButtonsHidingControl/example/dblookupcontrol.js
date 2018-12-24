//debugger
function DBLookupSettings(xiSettings) {
    this.SearchCompletedHandlers = new Array();

    //Methods
    this.Init = DBLookupSettings_Init;
    this.InitSetValueXmlFunction = DBLookupSettings_InitSetValueXmlFunction;
    this.GetLookupWindowParams = DBLookupSettings_GetLookupWindowParams;
    this.GetParentFilterParams = DBLookupSettings_GetParentFilterParams;
    this.OpenLookupWindow = DBLookupSettings_OpenLookupWindow;
    this.CreateLookupItem = DBLookupSettings_CreateLookupItem;
    this.GetLookupText = DBLookupSettings_GetLookupText;
    this.ParseLookupValue = DBLookupSettings_ParseLookupValue;
    this.AddSearchCompletedHandler = DBLookupSettings_AddSearchCompletedHandler;
    this.ExecuteSearchCompletedHandlers = DBLookupSettings_ExecuteSearchCompletedHandlers;
    this.CreateLookupValueNode = DBLookupSettings_CreateLookupValueNode;
    this.GetDefaultFilterValue = DBLookupSettings_GetDefaultFilterValue;
    this.GetDefaultFilterValues = DBLookupSettings_GetDefaultFilterValues;

    //Initialization
    this.Init();
}

window.LookupConsts = {};
window.LookupConsts.Events = {};
window.LookupConsts.Events.ChangeSearchRequest = 'ChangeSearchRequest';

//debugger

function DBLookupSettings_GetDefaultFilterValue(fieldName, isRequestParam) {
    if (SM.IsNE(fieldName))
        throw new Error('Не передан параметр fieldName.');

    if (this.DefaultSourceFieldsByName == null) {
        this.DefaultSourceFieldsByName = new Array();
        var i, len = this.DefaultSourceFields.length;
        for (i = 0; i < len; i++) {
            var sourceField = this.DefaultSourceFields[i];
            if (!SM.IsNE(sourceField.FieldName))
                this.DefaultSourceFieldsByName[sourceField.FieldName.toLowerCase()] = sourceField;
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
        var isDestinationLookup = sourceField.DestinationType == 'DBFieldLookupSingle' || sourceField.DestinationType == 'DBFieldLookupMulti';
        var listFormField = listForm.GetField(fieldName);
        var getFromServer = true;
        if (listFormField != null) {
            if (!listFormField.ReadOnly) {
                defaultValue = listFormField.GetValue();

                if (sourceField.SourceType == 'DBFieldLookupMulti') {
                    if (defaultValue != null && defaultValue.length > 0)
                        defaultValue = defaultValue[0];
                    else
                        defaultValue = null;
                }

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
                    //получаем первое значение мультиподстановки.
                    if (defaultValue != null && sourceField.SourceType == 'DBFieldLookupMulti')
                        defaultValue = defaultValue.selectSingleNode('LookupValue');

                    if (defaultValue != null) {
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
                }
            }
        }
        if (defaultValue != null && isSourceLookup) {
            if (isDestinationLookup) {
                //если значение исп-ся для параметра запроса, приводи его к LookupID
                //иначе оставляем его в виде объекта LookupValue
                if (isRequestParam)
                    defaultValue = defaultValue.LookupID;
            }
            else {
                //если назначение - не подстановка, то берем текст подстановки.
                defaultValue = defaultValue.LookupText;
            }
        }
    }

    return defaultValue;
}

function DBLookupSettings_GetClientFilterValues() {
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

function DBLookupSettings_Init() {
    if (window.LookupSettingsCollection == null)
        window.LookupSettingsCollection = new Array();
    if (!IsNullOrEmpty(this.SettingsName)) {
        var lowName = this.SettingsName.toLowerCase();
        window.LookupSettingsCollection[lowName] = this;
    }

    this.SettingsParams = '';
    this.SettingsParams += 'settingsAssemblyName=' + escape(this.SettingsAssemblyName);
    this.SettingsParams += '&settingsTypeName=' + escape(this.SettingsTypeName);
    this.SettingsParams += '&sourceParameters=' + escape(this.SourceParameters);

    //ItemFields
    this.ItemFieldsByName = new Array();
    var i, len = this.ItemFields.length;
    for (i = 0; i < len; i++) {
        var itemField = this.ItemFields[i];
        DBLookupItemField.call(itemField, this);
        var lowName = itemField.FieldName.toLowerCase();
        this.ItemFieldsByName[lowName] = itemField;
    }

    var thisObj = this;
    //LookupWeb
    this.__init_LookupWeb = false;
    this._LookupWeb = null;
    this.LookupWeb = function () {
        if (!thisObj.__init_LookupWeb) {
            thisObj._LookupWeb = window.Context().Site().GetWebByID(thisObj.LookupWebID);
            thisObj.__init_LookupWeb = true;
        }
        return thisObj._LookupWeb;
    }

    //LookupList
    this.__init_LookupList = false;
    this._LookupList = null;
    this.LookupList = function () {
        if (!thisObj.__init_LookupList) {
            if (thisObj.LookupWeb() != null)
                thisObj._LookupList = thisObj.LookupWeb().GetListByID(thisObj.LookupListID);
            thisObj.__init_LookupList = true;
        }
        return thisObj._LookupList;
    }


    //SettingsDocument
    this.__init_SettingsDocument = false;
    this._SettingsDocument = null;
    this.SettingsDocument = function () {
        if (!thisObj.__init_SettingsDocument) {
            thisObj._SettingsDocument = window.SM.LoadXML('<LookupSettings></LookupSettings>');
            thisObj.__init_SettingsDocument = true;
        }
        return thisObj._SettingsDocument;
    }

    this.__init_XmlElement = false;
    this.InitXmlElement = function () {
        if (!thisObj.__init_XmlElement) {
            if (thisObj.SettingsDocument() != null)
                thisObj.XmlElement = thisObj.SettingsDocument().selectSingleNode('LookupSettings');
            thisObj.__init_XmlElement = true;
        }
        return thisObj._XmlElement;
    }

    //DropDownItemsNode
    this.__init_DropDownItemsNode = false;
    this.InitDropDownItemsNode = function () {
        if (!thisObj.__init_DropDownItemsNode) {
            thisObj.DropDownItemsNode = thisObj.SettingsDocument().createElement('DropDownItems');
            thisObj.InitXmlElement();
            thisObj.XmlElement.appendChild(thisObj.DropDownItemsNode);
            if (thisObj.DropDownItems != null) {
                var i, len = thisObj.DropDownItems.length;
                for (i = 0; i < len; i++) {
                    var dropDownItem = thisObj.DropDownItems[i];
                    var dropDownItemNode = thisObj.CreateLookupValueNode(dropDownItem);
                    thisObj.DropDownItemsNode.appendChild(dropDownItemNode);
                }
            }

            thisObj.__init_DropDownItemsNode = true;
        }
    }

    //DefaultControlValueNodes
    this.__init_DefaultControlValueNodes = false;
    this.InitDefaultControlValueNodes = function () {
        if (!thisObj.__init_DefaultControlValueNodes) {
            thisObj.DefaultControlValueNode = null;
            thisObj.DefaultControlValueNodes = [];
            if (thisObj.DefaultControlValues != null) {
                if (thisObj.DefaultControlValues.length > 0) {
                    thisObj.InitXmlElement();
                    var defaultValuesNode = thisObj.SettingsDocument().createElement('DefaultControlValues');
                    thisObj.XmlElement.appendChild(defaultValuesNode);

                    var i, len = thisObj.DefaultControlValues.length;
                    for (i = 0; i < len; i++) {
                        var defaultValue = thisObj.DefaultControlValues[i];
                        var defaultValueNode = thisObj.CreateLookupValueNode(defaultValue);
                        defaultValuesNode.appendChild(defaultValueNode);
                        thisObj.DefaultControlValueNodes.push(defaultValueNode);
                        if (thisObj.DefaultControlValueNode == null)
                            thisObj.DefaultControlValueNode = defaultValueNode;
                    }
                }

            }
            thisObj.__init_DefaultControlValueNodes = true;
        }
    }

}
//debugger

function DBLookupSettings_CreateLookupValueNode(lookupValue) {
    var lookupValueNode = this.SettingsDocument().createElement('LookupValue');
    lookupValueNode.setAttribute('LookupID', lookupValue.LookupID.toString());
    lookupValueNode.setAttribute('LookupText', DBLookup_CheckEmptyString(lookupValue.LookupText));
    lookupValueNode.setAttribute('UrlAccessCode', DBLookup_CheckEmptyString(lookupValue.UrlAccessCode));
    return lookupValueNode;
}

function DBLookup_CheckEmptyString(str) {
    if (IsNullOrEmpty(str))
        return '';
    return str;
}

function DBLookupSettings_AddSearchCompletedHandler(resultUniqueKey, handler) {
    if (IsNullOrEmpty(resultUniqueKey))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'resultUniqueKey'));
    if (IsNullOrEmpty(handler))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'handler'));

    var handlerCollection = this.SearchCompletedHandlers[resultUniqueKey];
    if (handlerCollection == null) {
        handlerCollection = new Array();
        this.SearchCompletedHandlers[resultUniqueKey] = handlerCollection;
    }
    handlerCollection.push(handler);
}

function DBLookupSettings_ExecuteSearchCompletedHandlers(resultUniqueKey, lookupWindow, searchParams) {
    if (!IsNullOrEmpty(resultUniqueKey)) {
        var handlerCollection = this.SearchCompletedHandlers[resultUniqueKey];
        if (handlerCollection != null) {
            var i, len = handlerCollection.length;
            for (i = 0; i < len; i++) {
                var handler = handlerCollection[i];
                if (handler != null)
                    handler(lookupWindow, searchParams);
            }
        }
    }
}

var lookupItemDeletedText = 'lookupItemDeleted';
function DBLookupSettings_GetLookupText(lookupID) {
    var lookupText = null;
    if (!IsNullOrEmpty(lookupID)) {
        if (this.LookupList() != null) {
            var loadedFields = new Array();
            loadedFields.push(this.LookupFieldName);
            var lookupItem = this.LookupList().GetItemByID(lookupID, loadedFields);
            if (lookupItem != null) {
                lookupText = lookupItem.GetValue(this.LookupFieldName);
                if (lookupText != null)
                    lookupText = lookupText.toString();
            }
            else
                lookupText = lookupItemDeletedText;
        }
    }
    return lookupText;
}

function DBLookupSettings_InitSetValueXmlFunction() {
    if (!IsNullOrEmpty(this.SetValueXmlFunction)) {
        var getFunctionCode = 'window.' + this.SetValueXmlFunction + ';';
        this.SetValueXml = window.eval(getFunctionCode);
    }
    if (this.SetValueXml == null)
        throw new Error(window.TN.TranslateKey('LookupControl.SetValueXmlFunctionUndefinedException'));
}

function GetLookupSettings(settingsName, throwNotFoundException) {
    if (throwNotFoundException && SM.IsNE(settingsName))
        throw new Error('Не передан параметр settingsName.');

    var lookupSettings = null;
    if (window.LookupSettingsCollection != null && !SM.IsNE(settingsName)) {
        settingsName = DBLookup_DecodeQuotes(settingsName);
        settingsName = settingsName.toLowerCase();
        lookupSettings = window.LookupSettingsCollection[settingsName];
    }

    if (throwNotFoundException && lookupSettings == null)
        throw new Error('Не удалось получить настройку подстановки по названию ' + settingsName);

    return lookupSettings;
}

function DBLookupSettings_GetDefaultFilterValues() {
    var filterValues = '';
    var i, len = this.DefaultSourceFields.length;
    for (i = 0; i < len; i++) {
        var field = this.DefaultSourceFields[i];
        if (!SM.IsNE(field.FieldName)) {
            var fieldValue = this.GetDefaultFilterValue(field.FieldName, true);
            if (!SM.IsNE(fieldValue)) {
                if (filterValues.length > 0)
                    filterValues += '_pn_';
                filterValues += field.DestinationFieldName + '_pv_' + fieldValue;
            }
        }
    }
    return filterValues;
}

//debugger
function DBLookupSettings_GetLookupWindowParams(resultUniqueKey, lookupControl) {
    var params = '';
    params += '&' + this.SettingsParams;
    params += '&settingsName=' + escape(this.SettingsName);
    params += '&isMultiple=' + escape(this.IsMultiple.toString());
    params += '&isNewWindowDesign=' + escape(this.IsNewWindowDesign.toString());
    if (resultUniqueKey == null)
        resultUniqueKey = '';
    params += '&resultUniqueKey=' + escape(resultUniqueKey);
    if (window.ListForm != null) {
        if (!IsNullOrEmpty(window.ListForm.ItemID))
            params += '&listFormItemID=' + window.ListForm.ItemID.toString();
        if (!IsNullOrEmpty(window.ListForm.ListID))
            params += '&listFormListID=' + window.ListForm.ListID.toString();
        if (!IsNullOrEmpty(window.ListForm.WebID))
            params += '&listFormWebID=' + window.ListForm.WebID.toString();
    }
    if (window.Context != null) {
        if (!IsNullOrEmpty(window.Context().ContextSiteUrl))
            params += '&contextSiteUrl=' + encodeURI(window.Context().ContextSiteUrl);
    }
    if (!IsNullOrEmpty(this.WindowKey))
        params += '&windowKey=' + this.WindowKey;
    if (this.EnableWindowLookupValueEdit && this.IsMultiple && lookupControl != null) {
        if (lookupControl.Value != null) {
            var stIDs = '';
            var i, len = lookupControl.Value.length;
            for (i = 0; i < len; i++) {
                var lookupValue = lookupControl.Value[i];
                if (lookupValue != null) {
                    if (!lookupValue.Deleted && lookupValue.LookupID != 0 && lookupValue.LookupID != '0') {
                        if (stIDs.length > 0)
                            stIDs += ';';
                        stIDs += lookupValue.LookupID;
                    }
                }
            }
            if (stIDs.length > 0) {
                params += '&defaultSelectedIDs=' + stIDs;
            }
        }
    }
    this.LookupWindowOpener = lookupControl;
    params = DBLookupSettings_CustomizeSearchRequest.call(this, params, resultUniqueKey);

    params = params;
    return params;
}

function DBLookupSettings_CustomizeSearchRequest(params, resultUniqueKey) {
    if (SM.IsNE(params))
        throw new Error('Не передан параметр params.');

    var customQueryBuilder = SM.GetRequestQueryBuilder({ AutoEncode: false, AutoEscape: false });
    SM.FireEvent(this, window.LookupConsts.Events.ChangeSearchRequest, customQueryBuilder);

    //запускаем новое событие, в которое передаем объект с аргументами, содержащими полный набор доп. параметров поиска.
    //старое событие оставляем для совместимости со старыми подписанными обработчиками.
    var eventArgs = { QueryBuilder: customQueryBuilder, ResultUniqueKey: resultUniqueKey };
    SM.FireEvent(this, 'OnSearchRequest', eventArgs);

    var customQuery = customQueryBuilder.GetQueryString();
    if (!SM.IsNE(customQuery))
        params += '&' + customQuery;
    return params;
}

function DBLookupSettings_GetParentFilterParams(lookupControl) {
    var params = '';
    var hasValues = false;
    var lookupIDs = '';
    var parentField = null;
    var parentFieldMetadata = null;
    var parentFilter = null;
    if (lookupControl != null)
        parentFilter = lookupControl.ParentFilter;
    if (parentFilter != null) {
        if (parentFilter.Value != null) {
            if (!parentFilter.Settings.IsMultiple) {
                lookupID = parentFilter.Value.LookupID;
                if (!IsNullOrEmpty(lookupID))
                    lookupIDs = lookupID;
            }
            else {
                var i, len = parentFilter.Value.length;
                for (i = 0; i < len; i++) {
                    var lookupValue = parentFilter.Value[i];
                    if (lookupValue != null) {
                        if (!IsNullOrEmpty(lookupValue.LookupID)) {
                            if (lookupIDs.length > 0)
                                lookupIDs += ',';
                            lookupIDs += lookupValue.LookupID;
                        }
                    }
                }
            }
        }
        hasValues = true;
    }
    else if (!SM.IsNE(this.ParentFilterName) && window.ListForm != null) {
        parentField = window.ListForm.GetField(this.ParentFilterName);
        if (parentField != null)
            parentFieldMetadata = parentField.Field();
        if (parentFieldMetadata != null) {
            var isLookup = parentField.Type == 'DBFieldLookupSingle' || parentField.Type == 'DBFieldLookupMulti';
            var isMultiple = parentField.Type == 'DBFieldLookupMulti';
            if (isLookup) {
                var value = parentField.GetValue();

                if (value != null) {
                    if (!isMultiple) {
                        if (parentField.ReadOnly) {
                            var lookupNode = value;
                            var lookupID = lookupNode.getAttribute('LookupID');
                            if (!SM.IsNE(lookupID))
                                lookupIDs = lookupID;
                        }
                        else {
                            lookupIDs = value.LookupID;
                        }
                    }
                    else {
                        if (parentField.ReadOnly) {
                            var lookupNodes = value.selectNodes('LookupValue');
                            var i, len = lookupNodes.length;
                            for (i = 0; i < len; i++) {
                                var lookupNode = lookupNodes[i];
                                var lookupID = lookupNode.getAttribute('LookupID');
                                if (!SM.IsNE(lookupID)) {
                                    if (lookupIDs.length > 0)
                                        lookupIDs += ',';
                                    lookupIDs += lookupID;
                                }
                            }
                        }
                        else {
                            var i, len = value.length;
                            for (i = 0; i < len; i++) {
                                var lookupValue = value[i];
                                var lookupID = lookupValue.LookupID;
                                if (!SM.IsNE(lookupID)) {
                                    if (lookupIDs.length > 0)
                                        lookupIDs += ',';
                                    lookupIDs += lookupID;
                                }
                            }
                        }
                    }
                }

                hasValues = true;
            }
        }
    }

    if (hasValues) {
        if (IsNullOrEmpty(lookupIDs))
            lookupIDs = '0';
        params += '&parentFilterValues=' + lookupIDs;

        //делаем костыль, поскольку у нас нет parentFilter:
        //берем настройка типа источника с текущего контрола, будто бы он такой же
        //а чтобы определить конкретное поле replace-им fieldID в свойстве SourceParameters.
        if (parentFilter != null) {
            params += '&parentAssemblyName=' + escape(parentFilter.Settings.SettingsAssemblyName);
            params += '&parentTypeName=' + escape(parentFilter.Settings.SettingsTypeName);
            params += '&parentSourceParameters=' + escape(parentFilter.Settings.SourceParameters);
        }
        else if (parentFieldMetadata != null) {
            params += '&parentAssemblyName=' + escape(parentFieldMetadata.SettingsAssemblyName);
            params += '&parentTypeName=' + escape(parentFieldMetadata.SettingsTypeName);
            params += '&parentSourceParameters=' + escape(parentFieldMetadata.SourceParameters);
        }
    }

    return params;
}
//debugger


function DBLookupSettings_OpenLookupWindow(resultUniqueKey, lookupControl) {
    var pageUrl = this.IsNewWindowDesign ? 'LookupWindow.v2.aspx' : 'LookupWindow.aspx';
    var url = this.CurrentWebUrl + this.ModulePath + '/' + pageUrl + '?rnd=' + Math.random();

    var params = this.GetLookupWindowParams(resultUniqueKey, lookupControl);
    url += params;

    var winTitle = window.TN.TranslateKey('LookupControl.ItemChoice');
    if (!IsNullOrEmpty(this.WindowTitle))
        winTitle = this.WindowTitle;
    if (this.IsNewWindowDesign)
        window.OpenPopupWindow(url, this.WindowWidth, this.WindowHeight, '19px 16px 10px 16px !important', this.ParentPopupLevel, true);
    else
        window.OpenFloatWindow(url, winTitle, this.WindowWidth, this.WindowHeight);
}

function DBLookupSettings_SetValueXml(resultUniqueKey, xml) {
    if (!IsNullOrEmpty(resultUniqueKey)) {
        var lookupControl = window.GetLookupControl(resultUniqueKey);
        if (lookupControl != null)
            lookupControl.SetValueXml(xml);
    }
}

//debugger
function DBLookupSettings_CreateLookupItem(resultUniqueKey) {
    var params = '';
    if (!this.IsAnotherLookupCreationList) {
        var sourceUrl = this.ModulePath + '/AddCreatedLookupItem.aspx'
        sourceUrl += '?' + this.SettingsParams;
        sourceUrl += '&settingsName=' + encodeURIComponent(this.SettingsName);
        sourceUrl += '&resultUniqueKey=' + encodeURIComponent(resultUniqueKey);
        params += '?Source=' + encodeURIComponent(sourceUrl);
        params += '&setIdentityToSource=true';
    }
    else {
        params += '?closeOnUpdate=true&closeOnCancel=true';
    }

    var createUrl = this.LookupCreationListUrl + '/EditForm.aspx';

    if (this.CreateItemOnServer)
        params += '&createOnServer=' + this.CreateItemOnServer;
    if (this.DeleteCreatedItemOnCancel)
        params += '&deleteOnCancel=' + this.DeleteCreatedItemOnCancel;

    if (!IsNullOrEmpty(this.SetCreationValueParams))
        params += '&' + this.SetCreationValueParams;

    if (!IsNullOrEmpty(this.CreationRequestParams))
        params += '&' + this.CreationRequestParams;

    //передача значений полей для простановки (на время выполнения в оперативной памяти без сохранения) в родительский элемент
    //из которого будет производиться простановка при создании.
    if (this.ItemFields != null && this.ItemFields.length > 0) {
        var stCreationSourceValues = '';
        var i, len = this.ItemFields.length;
        for (i = 0; i < len; i++) {
            var itemField = this.ItemFields[i];
            if (!SM.IsNE(itemField.CreationSourceFieldName)) {
                var listFormField = ListForm.GetField(itemField.CreationSourceFieldName);
                //обрабатываем только не задизэйбленные поля, которые пользователь может менять.
                if (listFormField != null && !listFormField.Disabled && !listFormField.ReadOnly) {
                    var reqFieldValue = '';

                    var fieldValue = listFormField.GetValue();
                    if (fieldValue != null) {
                        var fieldType = listFormField.Type;
                        if (fieldType == 'DBFieldText' || fieldType == 'DBFieldMultiLineText' || fieldType == 'DBFieldDateTime')
                            reqFieldValue = fieldValue;
                        else if (fieldType == 'DBFieldBoolean')
                            reqFieldValue = fieldValue.toString();
                        else if (fieldType == 'DBFieldLookupSingle') {
                            reqFieldValue = fieldValue.LookupID.toString();
                            if (reqFieldValue == '0')
                                reqFieldValue = null;
                        }
                        else if (fieldType == 'DBFieldLookupMulti') {
                            var j, jlen = fieldValue.length;
                            for (j = 0; j < jlen; j++) {
                                var lookupValue = fieldValue[j];
                                if (reqFieldValue.length > 0)
                                    reqFieldValue += ',';
                                reqFieldValue += lookupValue.LookupID.toString();
                            }
                        }
                        else if (fieldType == 'MSLField') {
                            if (!listFormField.TypedField.IsMultiple) {
                                reqFieldValue = fieldValue.LookupID + ':' + fieldValue.LookupListID;
                                if (reqFieldValue == '0')
                                    reqFieldValue = null;
                            }
                            else {
                                var j, jlen = fieldValue.length;
                                for (j = 0; j < jlen; j++) {
                                    var lookupValue = fieldValue[j];
                                    if (reqFieldValue.length > 0)
                                        reqFieldValue += ',';
                                    reqFieldValue += lookupValue.LookupID + ':' + lookupValue.LookupListID;;
                                }
                            }
                        }
                        else
                            throw new Error('Получение значения для простановки при создании из поля ' + listFormField.Name + ' типа ' + listFormField.Type + ' не поддерживается.');
                    }

                    //заменяем пустое значение спец. словом, т.к. серверный парсер RequestParamsBuilder игнорирует пустые пары.
                    if (SM.IsNE(reqFieldValue))
                        reqFieldValue = '_EV_';

                    if (stCreationSourceValues.length > 0)
                        stCreationSourceValues += '_pn_';
                    stCreationSourceValues += listFormField.ID + '_pv_' + reqFieldValue;
                }
            }
        }

        if (!SM.IsNE(stCreationSourceValues))
            params += '&creationValues=' + encodeURIComponent(stCreationSourceValues);
    }

    createUrl += params;
    DBLookup_OpenWin(createUrl);
}

function DBLookup_OpenWin(url) {
    if (IsNullOrEmpty(url))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'url'));

    var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
    var openedWin = window.open(url, '_blank', winFeatures);
}

//////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////// DBLookupItemField ///////////////////////////////

function DBLookupItemField(settings) {
    if (settings == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'settings'));

    this.Settings = settings;
}

//////////////////////////////////////////////////////////////////////////////////







////////////////////////////////////DBLookupControlCollection///////////////////////////////

function DBLookupControlCollection(collectionName) {
    if (IsNullOrEmpty(collectionName))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'collectionName'));
    this.CollectionName = collectionName;
    this.Controls = new Array();
    this.ControlsByName = new Array();

    var thisObj = this;
    this.AddControl = function (relativeName, control) {
        if (IsNullOrEmpty(relativeName))
            throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'relativeName'));
        relativeName = relativeName.toLowerCase();
        if (thisObj.ControlsByName[relativeName] == null) {
            thisObj.ControlsByName[relativeName] = control;
            thisObj.Controls.push(control);
        }
    }

    this.GetControl = function (relativeName) {
        var control = null;
        if (!IsNullOrEmpty(relativeName)) {
            relativeName = relativeName.toLowerCase();
            control = this.ControlsByName[relativeName];
        }
        return control;
    }
}

function GetLookupControlCollection(collectionName) {
    var collection = null;
    if (IsNullOrEmpty(collectionName))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'collectionName'));
    collectionName = collectionName.toLowerCase();
    if (window.LookupControlCollections == null)
        window.LookupControlCollections = new Array();
    collection = window.LookupControlCollections[collectionName];
    if (collection == null) {
        collection = new DBLookupControlCollection(collectionName);
        window.LookupControlCollections[collectionName] = collection;
    }
    return collection;
}

//////////////////////////////////////////////////////////////////////////////////



function DBLookup_DecodeQuotes(inputString) {
    if (IsNullOrEmpty(inputString))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'inputString'));
    var rgSQuot = /(_squot_)/g;
    var rgDQuot = /(_dquot_)/g
    var result = inputString.replace(rgSQuot, "'").replace(rgDQuot, '"');
    return result;
}

//debugger
////////////////////////////////////DBLookupControl///////////////////////////////
function DBLookupControl(controlName, settingsName, collectionName, containerID, valueHiddenID, xiControl) {
    //return;
    if (IsNullOrEmpty(controlName))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'controlName'));

    if (IsNullOrEmpty(settingsName))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'settingsName'));

    var controlName = DBLookup_DecodeQuotes(controlName);
    var settingsName = DBLookup_DecodeQuotes(settingsName);

    this.SettingsName = settingsName;

    this.Settings = window.GetLookupSettings(this.SettingsName);
    if (this.Settings == null)
        throw new Error(window.TN.TranslateKey("LookupControl.SettingsNotFoundException") + " '" + this.SettingsName + "'");

    this.IsLoading = true;

    if (IsNullOrEmpty(collectionName))
        collectionName = "DefaultCollection";

    this.Collection = GetLookupControlCollection(collectionName);
    this.Collection.AddControl(this.Settings.RelativeName, this);

    //Document

    this.ControlDocument = null;
    if (!IsNullOrEmpty(xiControl))
        this.ControlDocument = window.SM.LoadXML(xiControl);
    else
        this.ControlDocument = window.SM.LoadXML('<LookupControl></LookupControl>');
    this.XmlElement = this.ControlDocument.selectSingleNode('LookupControl');

    this.GetAttribute = DBLookup_GetAttribute;
    this.GetBooleanAttribute = DBLookup_GetBooleanAttribute;
    this.GetIntegerAttribute = DBLookup_GetIntegerAttribute;

    //Properties
    this.ControlName = controlName;
    this.Changed = false;

    //Container
    this.Container = null;
    if (!IsNullOrEmpty(containerID))
        this.Container = window.document.getElementById(containerID);
    else
        this.Container = window.document.createElement('div');
    this.Container.Control = this;
    if (IsIE8()) {
        this.Container.style.display = 'table';
        this.Container.style.borderCollapse = 'collapse';
    }

    //ValueHidden
    this.ValueHidden = window.document.createElement('input');
    this.ValueHidden.type = 'hidden';
    if (SM.IsNE(valueHiddenID))
        this.Container.appendChild(this.ValueHidden);
    else {
        this.ValueHidden.id = valueHiddenID;
        this.ValueHidden.name = valueHiddenID;
        SM.PageForm.appendChild(this.ValueHidden);
    }

    if (this.ValueHidden == null)
        throw new Error('Не удалось получить hidden значений контрола подстановки.');

    //необходимо для диагностики при сохранении ListForm.
    if (!SM.IsNE(controlName))
        this.ValueHidden.setAttribute('ControlName', controlName);

    if (window.ListForm_RequiredHiddens != null)
        window.ListForm_RequiredHiddens.push(this.ValueHidden);

    //Value

    this.SingleValueNode = this.XmlElement.selectSingleNode('LookupValue');
    this.Settings.InitDefaultControlValueNodes();
    if (this.SingleValueNode == null) {
        var firstDefaultValueNode = this.Settings.DefaultControlValueNodes[0];
        if (this.Settings.SetDefaultControlValue && firstDefaultValueNode != null) {
            var defValueNode = firstDefaultValueNode.cloneNode(true);
            this.SingleValueNode = defValueNode;
            this.XmlElement.appendChild(defValueNode);
            this.DefaultValueSet = true;
        }
        if (this.SingleValueNode == null) {
            this.SingleValueNode = this.ControlDocument.createElement('LookupValue');
            this.XmlElement.appendChild(this.SingleValueNode);
        }
    }
    this.MultiValueNode = this.XmlElement.selectSingleNode('MultiValue');
    if (this.MultiValueNode == null) {
        this.MultiValueNode = this.ControlDocument.createElement('MultiValue');
        this.XmlElement.appendChild(this.MultiValueNode);
    }
    var checkFirstValue = this.MultiValueNode.selectSingleNode('LookupValue');
    if (checkFirstValue == null && this.Settings.SetDefaultControlValue && this.Settings.DefaultControlValueNodes.length > 0) {
        var j, jlen = this.Settings.DefaultControlValueNodes.length;
        for (j = 0; j < jlen; j++) {
            var defaultValueNode = this.Settings.DefaultControlValueNodes[j];
            var defaultValueNodeCopy = defaultValueNode.cloneNode(true);
            this.MultiValueNode.appendChild(defaultValueNodeCopy);
        }
        this.DefaultValueSet = true;
    }


    //Methods
    this.CreateControl = DBLookupControl_CreateControl;
    this.OpenLookupWindow = DBLookupControl_OpenLookupWindow;
    this.SaveValue = DBLookupControl_SaveValue;
    this.AddControlToCollection = DBLookupControl_AddControlToCollection;
    this.CreateDropDownList = DBLookupControl_CreateDropDownList;
    this.OnDropDownListChange = DBLookupControl_OnDropDownListChange;
    this.CreateRowViewControl = DBLookupControl_CreateRowViewControl;
    this.CreateListControl = DBLookupControl_CreateListControl;
    this.CreateTableViewControl = DBLookupControl_CreateTableViewControl;
    this.CreateEnumViewControl = DBLookupControl_CreateEnumViewControl;
    this.DeleteSingleValue = DBLookupControl_DeleteSingleValue;
    this.SetValueXml = DBLookupControl_SetValueXml;
    this.CreateLookupValueNode = DBLookupControl_CreateLookupValueNode;
    this.ResetRowsLayout = DBLookupControl_ResetRowsLayout;
    this.AddChangeHandler = DBLookupControl_AddChangeHandler;
    this.AddDeleteHandler = DBLookupControl_AddDeleteHandler;
    this.SetParentDropDownItems = DBLookupControl_SetParentDropDownItems;

    //DBField Interface
    this.Disable = DBLookupControl_Disable;
    this.Enable = DBLookupControl_Enable;
    this.GetValue = DBLookupControl_GetValue;
    this.GetValueKey = DBLookupControl_GetValueKey;
    this.SetValue = DBLookupControl_SetValue;
    this.OnSave = DBLookupControl_OnSave;
    this.IsChanged = DBLookupControl_IsChanged;
    this.IsEmptyValue = DBLookupControl_IsEmptyValue;

    //Initialization
    this.ChangeHandlers = new Array();
    this.DeleteHandlers = new Array();
    if (!IsNullOrEmpty(this.Settings.ParentFilterName)) {
        this.ParentFilter = this.Collection.GetControl(this.Settings.ParentFilterName);
        if (this.ParentFilter != null) {
            var thisObj = this;
            this.ParentFilter.AddChangeHandler(function () {
                if (thisObj.EditControl != null)
                    thisObj.EditControl.style.display = 'none';
                else if (thisObj.ListControl != null)
                    thisObj.ListControl.Container.style.display = 'none';
                if (thisObj.CreateItemLinkDiv != null)
                    thisObj.CreateItemLinkDiv.style.display = 'none';
                thisObj.CreateControl();
                if (thisObj.ListControl != null) {
                    if (thisObj.ClearByParentValue || thisObj.ParentFilter.Value == null || thisObj.Settings.ControlMode == 'LookupWindow')
                        thisObj.SetValue(null);
                    else if (thisObj.ParentValue != null)
                        thisObj.SetValue(thisObj.ParentValue);
                }
            });

            this.FilterRelationField = function () {
                if (!thisObj.__init_FilterRelationField) {
                    if (thisObj.Settings.FilterRelationType == 'Single') {
                        if (thisObj.Settings.LookupList() != null)
                            thisObj._FilterRelationField = thisObj.Settings.LookupList().GetField(thisObj.Settings.FilterRelationFieldName);
                    }
                    else if (thisObj.Settings.FilterRelationType == 'Multiple') {
                        if (thisObj.ParentFilter.Settings.LookupList() != null)
                            thisObj._FilterRelationField = thisObj.ParentFilter.Settings.LookupList().GetField(thisObj.Settings.FilterRelationFieldName);
                    }
                    else if (thisObj.Settings.FilterRelationType == 'Direct')
                        thisObj._FilterRelationField = null;

                    if (thisObj._FilterRelationField == null && thisObj.Settings.FilterRelationType != 'Direct')
                        throw new Error('Не удалось получить связывающее поле ' + thisObj.Settings.FilterRelationFieldName + ' для контрола подстановки ' + thisObj.ControlName + '.');

                    thisObj.__init_FilterRelationField = true;
                }
                return thisObj._FilterRelationField;
            }
        }
    }
    this.CreateControl();
    this.AddControlToCollection();

    this.IsLoading = false;
}
//debugger

function DBLookupControl_AddChangeHandler(handler) {
    if (handler != null)
        this.ChangeHandlers.push(handler);
}

function DBLookupControl_AddDeleteHandler(handler) {
    if (handler != null)
        this.DeleteHandlers.push(handler);
}


function DBLookupControl_AddControlToCollection() {
    if (window.LookupControlCollection == null)
        window.LookupControlCollection = new Array();
    if (!IsNullOrEmpty(this.ControlName)) {
        var lowName = this.ControlName.toLowerCase();
        window.LookupControlCollection[lowName] = this;
    }
}

function GetLookupControl(controlName) {
    var lookupControl = null;
    if (window.LookupControlCollection != null && !IsNullOrEmpty(controlName)) {
        controlName = controlName.toLowerCase();
        lookupControl = window.LookupControlCollection[controlName];
    }
    return lookupControl;
}

//debugger
function DBLookupControl_SaveValue() {
    if (!this.Settings.IsMultiple) {
        this.Value = this.SingleValue;
        if (this.SingleValue != null)
            this.SingleValue.SaveValue();

        if (this.Settings.ControlMode == 'LookupWindow' && this.Settings.WindowControlMode == 'RowView') {
            var controlDiv = this.EditControl;
            if (this.Settings.IsListControlMode)
                controlDiv = null;//this.ListControl.ControlDiv;

            if (controlDiv != null) {
                if (this.SingleValue == null)
                    controlDiv.style.height = '';
                else {
                    if (this.SingleValue.LookupID > 0)
                        controlDiv.style.height = 'auto';
                    else
                        controlDiv.style.height = '';
                }
            }
        }
    }
    else {
        //очищаем значение ХМЛ потому что созданные значения еще раз добавятся к MultiValueNode
        if (this.MultiValueNode != null) {
            while (this.MultiValueNode.firstChild != null)
                this.MultiValueNode.removeChild(this.MultiValueNode.firstChild);
        }

        this.Value = this.MultiValue;
        var i, len = this.MultiValue.length;
        for (i = 0; i < len; i++) {
            var singleValue = this.MultiValue[i];
            if (singleValue != null)
                singleValue.SaveValue();
        }
        if (this.Settings.WindowControlMode == 'RowView' || this.Settings.WindowControlMode == 'EnumView') {
            var controlDiv = this.EditControl;
            if (this.Settings.IsListControlMode)
                controlDiv = null;//this.ListControl.ControlDiv;

            if (controlDiv != null) {
                if (this.MultiValue.length == 0)
                    controlDiv.style.height = '';
                else
                    controlDiv.style.height = 'auto';
            }
        }
    }
    if (this.XmlElement != null)
        this.ValueHidden.value = window.SM.PersistXML(this.XmlElement);

    if (!this.DisableChangeHandler) {
        if (this.ListFormField != null)
            this.ListFormField.OnChange();
        if (this.ChangeHandlers.length > 0) {
            var i, len = this.ChangeHandlers.length;
            for (i = 0; i < len; i++) {
                var handler = this.ChangeHandlers[i];
                if (handler != null)
                    handler();
            }
        }

        //запускаем событие изменения значения контрола для настройки подстановки, по которой создан контрол.
        //используется возможности обработки всех контролов, создаваемых на странице по данной настройки, 
        //например, для столбца подстановки в поле Табличной секции.
        SM.FireEvent(this.Settings, 'OnControlChange', { LookupControl: this });
    }
    if (!this.IsLoading)
        this.Changed = true;
}

function DBLookupControl_IsChanged() {
    return this.Changed == true;
}

//debugger
function DBLookupControl_CreateControl() {
    //Инициализация значения
    if (!this.Settings.IsMultiple) {
        var singleValue = new DBLookupControlValue(this.SingleValueNode, this);
        singleValue.SetToControlValue();
    }
    else {
        this.MultiValue = new Array();
        var multuValueNodes = this.MultiValueNode.selectNodes('LookupValue');
        var i, len = multuValueNodes.length;
        for (i = 0; i < len; i++) {
            var controlValueNode = multuValueNodes[i];
            var controlValue = new DBLookupControlValue(controlValueNode, this);
            controlValue.SetToControlValue();
        }
    }


    //Инициализация контрола
    if (this.Settings.ControlMode == 'DropDownList') {
        if (!(this.Settings.IsListControlMode && this.Settings.IsDropDownListControl))
            this.CreateDropDownList();
        else
            this.CreateListControl();
    }
    if (this.Settings.ControlMode == 'LookupWindow') {
        //создание заголовков контролов
        if (this.Settings.WindowControlMode == 'RowView') {
            if (!this.Settings.IsListControlMode)
                this.CreateRowViewControl();
            else
                this.CreateListControl();
        }
        if (this.Settings.WindowControlMode == 'TableView')
            this.CreateTableViewControl();
        if (this.Settings.IsMultiple && this.Settings.WindowControlMode == 'EnumView')
            this.CreateEnumViewControl();
    }
    //простановка значений в контролы    
    if (!this.Settings.IsMultiple) {
        if (this.SingleValue != null) {
            if (this.SingleValue.LookupID != 0)
                this.SingleValue.CreateValueControl();
            //обновляем табличное значение.
            DBLookupControl_RefreshTableValues.call(this);
        }
    }
    else {
        var i, len = this.MultiValue.length;
        for (i = 0; i < len; i++) {
            var singleValue = this.MultiValue[i];
            if (singleValue.LookupID != 0)
                singleValue.CreateValueControl();
        }
        //обновляем табличное значение.
        DBLookupControl_RefreshTableValues.call(this);

        //клиентская сортировка таблицы значений
        if (this.Settings.WindowControlMode == 'TableView' &&
            this.Settings.TableViewSortingEnabled) {
            if (this.Settings.ItemFields != null && this.Settings.ItemFields.length > 0) {
                var j, jlen = this.Settings.ItemFields.length;
                var sorting = [];
                var settings = {
                    headers: [],
                    sortIcons: {
                        asc: '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Lookup/images/sort_asc.png',
                        desc: '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Lookup/images/sort_desc.png',
                        unspecified: '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Lookup/images/sort_bg.png'
                    }
                };
                //пустой столбец с иконками действий.
                settings.headers.push({ sorter: 'text' });
                //пример: var sorting = [[1, 0], [2, 0]];
                var sortColumnIndex = 0;
                //debugger;
                var theadRow = null;
                if (this.EditControl != null && this.EditControl.tHead != null &&
                    this.EditControl.tHead.rows != null && this.EditControl.tHead.rows.length > 0)
                    theadRow = this.EditControl.tHead.rows[0];

                if (theadRow != null && theadRow.cells != null && theadRow.cells.length > 0) {
                    for (var i = 0; i < theadRow.cells.length; i++) {
                        var headCell = theadRow.cells[i];
                        if (headCell.ItemField == null)
                            continue;

                        if (!headCell.ItemField.ShowInTable)
                            continue;

                        var triggers = [];
                        triggers.push(headCell);
                        if (headCell.SortIcon != null)
                            triggers.push(headCell.SortIcon);

                        //собираем метаданные сортировки (типы сортируемых данных столбцов)
                        var sortType = headCell.ItemField.SortingDataType;
                        //тип данных для сортировки по умолчанию
                        if (SM.IsNE(sortType))
                            sortType = 'text';
                        var header = {
                            sorter: sortType,
                            sortIcon: headCell.SortIcon,
                            triggers: triggers
                        };
                        settings.headers.push(header);

                        if (headCell.ItemField.DefaultSorting == 'Ascending' ||
                            headCell.ItemField.DefaultSorting == 'Descending') {
                            var sortDirection = 0;
                            if (headCell.ItemField.DefaultSorting == 'Descending')
                                sortDirection = 1;
                            //собираем сортируемые колонки
                            var columnSorter = [sortColumnIndex + 1, sortDirection];
                            sorting.push(columnSorter);
                        }

                        sortColumnIndex++;
                    }
                }


                /*for (var j = 0; j < this.Settings.ItemFields.length; j++) {
                    var itemField = this.Settings.ItemFields[j];
                    if (!itemField.ShowInTable)
                        continue;

                    //собираем метаданные сортировки (типы сортируемых данных столбцов)
                    var sortType = itemField.SortingDataType;
                    //тип данных для сортировки по умолчанию
                    if (SM.IsNE(sortType))
                        sortType = 'text';
                    var header = { sorter: sortType };
                    settings.headers.push(header);

                    if (itemField.DefaultSorting == 'Ascending' || itemField.DefaultSorting == 'Descending') {
                        var sortDirection = 0;
                        if (itemField.DefaultSorting == 'Descending')
                            sortDirection = 1;
                        //собираем сортируемые колонки
                        var columnSorter = [sortColumnIndex + 1, sortDirection];
                        sorting.push(columnSorter);
                    }

                    sortColumnIndex++;
                }*/

                //записываем сортировку по умолчанию в свойство
                this.EditControl.DefaultSorting = sorting;
                var thisObj = this;
                SM.AttachEvent(this.EditControl, 'OnSort', function () {
                    thisObj.ResetRowsLayout();
                });

                //инициализируем плагин клиентской сортировки таблицы.
                SM.OnPageLoad(function () {
                    RL.CallAsync('tablesorter', function () {
                        $(thisObj.EditControl).tablesorter(settings, sorting);

                        thisObj.EditControl.TableSorterInited = true;
                        //если сортировка еще не назначена в блоке загрузки данных
                        //то сортируем в текущем блоке кода
                        if (!thisObj.EditControl.SortingInited) {
                            var sorting = thisObj.EditControl.DefaultSorting;
                            //debugger
                            $(thisObj.EditControl).trigger("sorton", [sorting]);
                            thisObj.EditControl.SortingInited = true;
                        }
                    }, null, null);
                });
            }
        }
    }

    //дизэйблим контрол, если при загрзке он должен быть задизэйблен.
    if (this.Settings.Disabled)
        this.Disable();
    this.SaveValue();
}
//debugger

function DBLookupControl_CreateLookupValueNode(lookupID, lookupText) {
    var lookupValueNode = this.XmlElement.ownerDocument.createElement('LookupValue');
    if (lookupID != null)
        lookupID = lookupID.toString();
    if (IsNullOrEmpty(lookupID))
        lookupID = '0';
    if (lookupText != null)
        lookupText = lookupText.toString();
    if (lookupText == null)
        lookupText = '';
    lookupValueNode.setAttribute('LookupID', lookupID);
    lookupValueNode.setAttribute('LookupText', lookupText);
    return lookupValueNode;
}

//debugger
function DBLookupControl_CreateDropDownList() {
    this.EditControl = window.document.createElement('select');
    this.EditControl.className = 'dbf_lookup_ddl';
    if (!IsNullOrEmpty(this.Settings.CssClass)) {
        if (!this.Settings.OverrideCssClass)
            this.EditControl.className = this.EditControl.className + ' ' + this.Settings.CssClass;
        else
            this.EditControl.className = this.Settings.CssClass;
    }
    if (this.Settings.ControlWidth > 0)
        this.EditControl.style.cssText += 'width: ' + this.Settings.ControlWidth + 'px !important';//this.EditControl.style.width = this.Settings.ControlWidth;
    else if (this.Settings.WrapDropDownListContent)
        this.EditControl.className = this.EditControl.className + ' dbf_lookup_ddl_wrapContent';
    var thisObj = this;
    this.EditControl.onchange = function () { thisObj.OnDropDownListChange(); }

    var emptyValue = null;
    var selectedIndex = -1;
    var optionIndex = 0;
    this.DropDownValues = new Array();
    if (this.Settings.ShowEmptyOptionText) {
        var emptyOptionText = window.TN.TranslateKey('LookupControl.None');
        if (!IsNullOrEmpty(this.Settings.EmptyOptionText))
            emptyOptionText = this.Settings.EmptyOptionText;
        var emptyElement = this.CreateLookupValueNode(0, emptyOptionText);
        emptyValue = new DBLookupControlValue(emptyElement, this);
        emptyValue.CreateValueControl();
        emptyValue.OptionIndex = optionIndex;
        selectedIndex = optionIndex;
        optionIndex++;
    }
    this.Settings.InitDropDownItemsNode();
    if (this.SingleValue != null) {
        if (this.SingleValue.LookupID != 0) {
            var existingControlNode = this.Settings.XmlElement.selectSingleNode("DropDownItems/LookupValue[@LookupID='" + this.SingleValue.LookupID + "']");
            if (existingControlNode == null) {
                var existingValue = new DBLookupControlValue(this.SingleValue.XmlElement.cloneNode(true), this);
                existingValue.CreateValueControl();
                existingValue.OptionIndex = optionIndex;
                selectedIndex = optionIndex;
                optionIndex++;
            }
        }
    }
    var setFirstValue = this.SetParentDropDownItems();

    if (this.Settings.DropDownItemsNode != null) {
        var controlValueNodes = this.Settings.DropDownItemsNode.selectNodes('LookupValue');
        var i, len = controlValueNodes.length;
        for (i = 0; i < len; i++) {
            var controlValueNode = controlValueNodes[i];
            var controlValue = new DBLookupControlValue(controlValueNode, this);
            if (controlValue.LookupID != 0 && !IsNullOrEmpty(controlValue.LookupText)) {
                controlValue.CreateValueControl();
                if (this.SingleValue != null) {
                    if (this.SingleValue.LookupID == controlValue.LookupID) {
                        selectedIndex = optionIndex;
                        if (this.IsLoading)
                            setFirstValue = false;
                    }
                }
                controlValue.OptionIndex = optionIndex;
                optionIndex++;
            }
        }
    }
    if ((selectedIndex == -1 || setFirstValue) && optionIndex > 0)
        selectedIndex = 0;
    if (selectedIndex != -1) {
        this.EditControl.selectedIndex = selectedIndex;
        var optSelected = this.EditControl.options[selectedIndex];
        optSelected.LookupValue.SetToControlValue();
    }
    this.Container.appendChild(this.EditControl);

}

//debugger
function DBLookupControl_SetParentDropDownItems() {
    var setFirstValue = false;
    if (this.ParentFilter != null) {
        this.Settings.InitDropDownItemsNode();

        if (this.Settings.DropDownItemsNode != null)
            this.Settings.XmlElement.removeChild(this.Settings.DropDownItemsNode);
        this.Settings.DropDownItemsNode = null;
        var parentSettings = this.ParentFilter.Settings;
        var relationFieldName = this.Settings.FilterRelationFieldName;
        var relationType = this.Settings.FilterRelationType;
        if (!parentSettings.IsMultiple && !IsNullOrEmpty(relationFieldName)) {

            var parentLookupID = 0;
            if (this.ParentFilter.Value != null)
                parentLookupID = this.ParentFilter.Value.LookupID;

            if (parentLookupID > 0) {
                var currentLookupID = '0';
                if (this.SingleValue != null)
                    currentLookupID = this.SingleValue.LookupID.toString();
                if (currentLookupID == '0')
                    currentLookupID = null;

                var containsCurrentValue = false;
                var firstValueNode = null;

                var dropDownItemsNode = this.Settings.XmlElement.ownerDocument.createElement('DropDownItems');
                this.Settings.XmlElement.appendChild(dropDownItemsNode);
                this.Settings.DropDownItemsNode = dropDownItemsNode;

                if (relationType == 'Single') {
                    if (this.FilterRelationField() == null)
                        throw new Error('Не удалось получить связывающее поле ' + relationFieldName);
                    if (!this.FilterRelationField().IsLookup)
                        throw new Error('Связывающее поле ' + relationFieldName + ' не является полем подстановки.');



                    var loadedFields = new Array();
                    loadedFields.push(this.Settings.LookupFieldName);
                    var query = null;
                    if (!this.FilterRelationField().IsMultiple)
                        query = '[' + relationFieldName + '] = ' + parentLookupID;
                    else
                        query = 'ID IN (SELECT ItemID FROM WSSC_SYS_Fields_LookupMulti WITH(NOLOCK) WHERE LookupID = ' + parentLookupID + ' AND FieldID = ' + this.FilterRelationField().ID + ')';
                    var lookupItems = this.Settings.LookupList().GetItems(query, loadedFields);
                    var i, len = lookupItems.length;
                    for (i = 0; i < len; i++) {
                        var lookupItem = lookupItems[i];
                        var lookupID = lookupItem.ID;
                        var lookupText = lookupItem.GetValue(this.Settings.LookupFieldName);
                        if (!IsNullOrEmpty(lookupText)) {
                            var lookupValueNode = this.Settings.XmlElement.ownerDocument.createElement('LookupValue');
                            lookupValueNode.setAttribute('LookupID', lookupID.toString());
                            lookupValueNode.setAttribute('LookupText', lookupText);
                            dropDownItemsNode.appendChild(lookupValueNode);

                            if (firstValueNode == null)
                                firstValueNode = lookupValueNode;
                            if (currentLookupID == lookupID.toString())
                                containsCurrentValue = true;

                            setFirstValue = true;
                        }
                    }
                }
                else if (relationType == 'Multiple') {
                    var loadedFields = new Array();
                    if (relationFieldName != this.ParentFilter.Settings.LookupFieldName)
                        loadedFields.push(this.ParentFilter.Settings.LookupFieldName);
                    loadedFields.push(relationFieldName);
                    var parentItem = this.ParentFilter.Settings.LookupList().GetItemByID(parentLookupID, loadedFields);
                    if (parentItem != null) {
                        var multiValue = parentItem.GetValue(relationFieldName);
                        if (multiValue != null) {
                            var lookupNodes = multiValue.selectNodes('LookupValue');
                            var j, jlen = lookupNodes.length;
                            var stLookupTextCollection = '';
                            for (j = 0; j < jlen; j++) {
                                var lookupNode = lookupNodes[j];
                                var lookupValueNode = lookupNode.cloneNode(true);
                                dropDownItemsNode.appendChild(lookupValueNode);
                                var lookupID = lookupValueNode.getAttribute('LookupID');

                                if (firstValueNode == null)
                                    firstValueNode = lookupValueNode;
                                if (currentLookupID == lookupID.toString())
                                    containsCurrentValue = true;

                                setFirstValue = true;
                            }
                        }
                    }
                }
                else if (relationType == 'Direct') {
                    throw new Error('Выпадающий список в режиме связывания Direct не поддерживается.');
                }
                this.ClearByParentValue = false;
                this.ParentValue = null;
                if ((!containsCurrentValue || !this.Settings.ShowEmptyOptionText) && this.Settings.IsNewWindowDesign) {
                    var nodeToSet = null;
                    if (!this.Settings.ShowEmptyOptionText && firstValueNode != null)
                        nodeToSet = firstValueNode;

                    if (nodeToSet == null)
                        this.ClearByParentValue = true;
                    else {
                        this.ParentValue = {
                            LookupID: firstValueNode.getAttribute('LookupID'),
                            LookupText: firstValueNode.getAttribute('LookupText')
                        }
                    }
                    if (this.IsLoading && firstValueNode != null && !containsCurrentValue) {
                        if (this.SingleValueNode != null && this.SingleValueNode.parentNode != null)
                            this.SingleValueNode.parentNode.removeChild(this.SingleValueNode);

                        this.SingleValueNode = firstValueNode;
                        this.SingleValue = new DBLookupControlValue(firstValueNode, this);
                        this.SingleValue.SetToControlValue();
                    }
                }
            }
        }
    }
    return setFirstValue;
}
//debugger

function DBLookupControl_OnDropDownListChange() {
    var selectedIndex = this.EditControl.selectedIndex;
    var optSelected = this.EditControl.options[selectedIndex];
    optSelected.LookupValue.SetToControlValue();
    this.DefaultValueSet = false;
    this.SaveValue();
}

//debugger
function DBLookupControl_CreateRowViewControl() {
    var tbWindowControl = window.document.createElement('table');
    tbWindowControl.border = 0;
    tbWindowControl.cellSpacing = 0;
    tbWindowControl.cellPadding = 0;
    tbWindowControl.className = 'dbf_lookup_tbWinControl';

    var trWindowControl = tbWindowControl.insertRow(-1);

    var tdWindowControl = trWindowControl.insertCell(-1);
    var divWindowControl = window.document.createElement('div');
    tdWindowControl.appendChild(divWindowControl);
    this.EditControl = divWindowControl;
    divWindowControl.className = 'dbf_lookup_winControl';

    if (!IsNullOrEmpty(this.Settings.CssClass)) {
        if (!this.Settings.OverrideCssClass)
            this.EditControl.className = this.EditControl.className + ' ' + this.Settings.CssClass;
        else
            this.EditControl.className = this.Settings.CssClass;
    }

    if (this.Settings.ControlWidth > 0) {
        divWindowControl.style.cssText += 'width: ' + this.Settings.ControlWidth + 'px !important';
        //divWindowControl.style.width = this.Settings.ControlWidth;
    }

    var thisObj = this;

    var tdActions = trWindowControl.insertCell(-1);
    var tbActions = window.document.createElement('table');
    tdActions.appendChild(tbActions);
    tbActions.border = 0;
    tbActions.cellSpacing = 0;
    tbActions.cellPadding = 0;
    var trActions = tbActions.insertRow(-1);

    if (!this.Settings.HideOpenWindow) {
        var tdOpenWindow = trActions.insertCell(-1);
        this.OpenWindowControl = tdOpenWindow;
        tdOpenWindow.style.paddingLeft = '5px';
        tdOpenWindow.style.verticalAlign = 'top';
        var imgOpenWindow = window.document.createElement('img');
        tdOpenWindow.appendChild(imgOpenWindow);
        imgOpenWindow.src = '/_layouts/images/addressbook.gif';
        imgOpenWindow.style.cursor = 'pointer';
        imgOpenWindow.onclick = function () { thisObj.OpenLookupWindow(); }
    }

    if (!this.Settings.IsMultiple) {
        var tdDeleteValue = trActions.insertCell(-1);
        this.DeleteSingleValueControl = tdDeleteValue;
        tdDeleteValue.style.paddingLeft = '5px';
        tdDeleteValue.style.verticalAlign = 'top';
        var imgDeleteValue = window.document.createElement('img');
        tdDeleteValue.appendChild(imgDeleteValue);
        imgDeleteValue.src = '/_layouts/images/delete.gif';
        imgDeleteValue.style.cursor = 'pointer';
        imgDeleteValue.onclick = function () { thisObj.DeleteSingleValue(); }
    }
    else {
        var tbMultiValue = window.document.createElement('table');
        this.EditControl.appendChild(tbMultiValue);
        tbMultiValue.border = 0;
        tbMultiValue.cellSpacing = 0;
        tbMultiValue.cellPadding = 0;
        this.MultiValueTable = tbMultiValue;
    }
    if (this.Settings.ShowCreateItemLink) {

        var tdCreateItem = trActions.insertCell(-1);
        tdCreateItem.style.paddingLeft = '5px';
        tdCreateItem.style.verticalAlign = 'top';
        tdCreateItem.style.paddingTop = '1px';
        var lnkCreateItem = window.document.createElement('a');
        tdCreateItem.appendChild(lnkCreateItem);
        lnkCreateItem.className = 'dbf_lookup_link';
        lnkCreateItem.innerHTML = this.Settings.CreateItemLinkText;
        if (!IsNullOrEmpty(this.Settings.CreateItemLinkToolTip))
            lnkCreateItem.title = this.Settings.CreateItemLinkToolTip;

        lnkCreateItem.href = 'javascript:';
        lnkCreateItem.onclick = function () { thisObj.Settings.CreateLookupItem(thisObj.ControlName); return false; }
    }
    this.Container.appendChild(tbWindowControl);
}

//debugger
function DBLookupControl_CreateListControl() {
    var isDropDownList = this.Settings.ControlMode == 'DropDownList';

    var listControl = new ListControl();
    this.ListControl = listControl;
    listControl.LookupControl = this;
    listControl.IsMultiple = this.Settings.IsMultiple;
    listControl.IsDropDownList = isDropDownList;
    listControl.EnableOpenWin = !this.Settings.HideOpenWindow && !isDropDownList;
    listControl.WrapGrid = this.Settings.WrapListControlGrid;
    listControl.RemovableValue = !this.Settings.HideDeleteValuePicker;
    if (!IsNullOrEmpty(this.Settings.DefaultListControlText))
        listControl.DefaultText = this.Settings.DefaultListControlText;
    //listControl.DefaultText = this.Settings.SettingsName;//тест
    listControl.Init();
    //если для подстановки отключен крестик удаление и отключено окошко, то дизэйблим контрол.
    if (!listControl.RemovableValue && !listControl.EnableOpenWin && !listControl.IsDropDownList)
        listControl.Disable();


    if (!IsNullOrEmpty(this.Settings.CssClass)) {
        if (!this.Settings.OverrideCssClass)
            listControl.Container.className = listControl.Container.className + ' ' + this.Settings.CssClass;
        else
            listControl.Container.className = this.Settings.CssClass;
    }


    var controlWidth = this.Settings.ControlWidth;
    if (controlWidth == 0 || controlWidth == null)
        controlWidth = 400;
    if (controlWidth.toString().indexOf('px') != -1)
        controlWidth = parseInt(controlWidth.split('px')[0]);
    if (controlWidth > 0)
        listControl.SetControlWidth(controlWidth);

    listControl.InitDeleteValueControl = DBLookupListControl_InitDeleteValueControl;
    listControl.CreateValueControl = DBLookupListControl_CreateValueControl;
    listControl.GetGridValueKey = DBLookupListControl_GetGridValueKey;
    listControl.OnDeleteValue = DBLookupListControl_OnDeleteValue;
    var thisObj = this;
    if (listControl.OpenWinDiv != null) {
        listControl.OpenWinDiv.onmousedown = function (evt) {
            if (thisObj.ListControl.IsTextFocused)
                thisObj.ListControl.TextBlurDisabled = true;
        }
        listControl.OpenWinDiv.onclick = function (evt) {
            if (thisObj.ListControl.TextBlurDisabled) {
                thisObj.ListControl.TextBlurDisabled = false;
                thisObj.ListControl.OnTextBlur();
            }
            thisObj.OpenLookupWindow(); return SM.CancelEvent(evt);
        }
        listControl.OpenWinDiv.oncontextmenu = function (evt) { return SM.CancelEvent(evt); }
    }
    listControl.OpenContextGrid = DBLookupListControl_OpenContextGrid;
    listControl.OpenContextGridCompleted = DBLookupListControl_OpenContextGridCompleted;
    listControl.GetGridRowValue = DBLookupListControl_GetGridRowValue;
    listControl.OnSetGridValue = DBLookupListControl_OnSetGridValue;

    var divCreateItemLink = null;
    if (this.Settings.ShowCreateItemLink) {
        var divCreateItemLink = window.document.createElement('div');
        divCreateItemLink.className = 'dbl_divCreateItemLink';
        var lnkCreateItem = window.document.createElement('a');
        divCreateItemLink.appendChild(lnkCreateItem);
        lnkCreateItem.className = 'dbf_lookup_link';
        lnkCreateItem.style.verticalAlign = 'middle';
        lnkCreateItem.innerHTML = this.Settings.CreateItemLinkText;
        if (!IsNullOrEmpty(this.Settings.CreateItemLinkToolTip))
            lnkCreateItem.title = this.Settings.CreateItemLinkToolTip;

        lnkCreateItem.href = 'javascript:';
        lnkCreateItem.onclick = function (evt) { thisObj.Settings.CreateLookupItem(thisObj.ControlName); SM.CancelEvent(evt); return false; }
    }

    if (isDropDownList) {
        this.SetParentDropDownItems();

        this.DropDownValues = new Array();
        this.Settings.InitDropDownItemsNode();
        if (this.Settings.DropDownItemsNode != null) {
            listControl.CurrentLookupValuesNode = this.Settings.DropDownItemsNode;
            var controlValueNodes = this.Settings.DropDownItemsNode.selectNodes('LookupValue');
            var i, len = controlValueNodes.length;
            for (i = 0; i < len; i++) {
                var controlValueNode = controlValueNodes[i];
                var controlValue = new DBLookupControlValue(controlValueNode, this);
                if (controlValue.LookupID != 0 && !IsNullOrEmpty(controlValue.LookupText)) {
                    var gridRow = listControl.AddGridRow(controlValue.LookupText, controlValue);
                    gridRow.setAttribute('LookupID', controlValue.LookupID.toString());
                    this.DropDownValues[controlValue.LookupID] = controlValue;
                }
            }
        }
    }
    this.Container.appendChild(listControl.Container);
    if (isDropDownList)
        this.EditControl = listControl.Container;
    if (divCreateItemLink != null) {
        this.Container.appendChild(divCreateItemLink);
        this.CreateItemLinkDiv = divCreateItemLink;
    }
}

function DBLookupListControl_GetGridValueKey(lookupValue) {
    if (lookupValue == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'lookupValue'));
    var valueKey = null;
    var value = lookupValue.LookupID;
    if (value != null)
        valueKey = value;

    if (!IsNullOrEmpty(valueKey))
        valueKey = valueKey.toString();

    return valueKey;
}

//debugger
function DBLookupListControl_InitDeleteValueControl(divDeleteValue, rowValue) {
    var lookupValue = rowValue;
    var thisObj = this;
    var deleteControl = divDeleteValue;
    deleteControl.onclick = function (evt) {
        var canDelete = lookupValue.ProcessDeleteHandlers();
        if (canDelete)
            thisObj.ClearValue(lookupValue, true);
        return SM.CancelEvent(evt);
    }
}

//debugger
function DBLookupListControl_CreateValueControl(lookupValue, resultControl) {
    var valueControl = lookupValue.CreateLookupLink();
    var settings = this.LookupControl.Settings;
    if (settings.EnableMultiValueReorder && !this.LookupControl.Disabled) {

        var imgMoveUp = lookupValue.CreateMoveLink(true);
        resultControl.appendChild(imgMoveUp);
        var imgMoveDown = lookupValue.CreateMoveLink(false);
        resultControl.appendChild(imgMoveDown);
        lookupValue.SwapControl = resultControl;
        if (!this.OrderedStyleInited) {
            $(this.Container).addClass('dbl_orderedControl');
            this.OrderedStyleInited = true;
        }
    }
    return valueControl;
}

function DBLookupListControl_OnDeleteValue(lookupValue) {
    if (lookupValue != null) {
        if (this.IsDeletingPreviousValue)
            this.LookupControl.DisableChangeHandler = true;
        lookupValue.DeleteValue();
        if (this.IsDeletingPreviousValue)
            this.LookupControl.DisableChangeHandler = false;
    }
}

//debugger
function DBLookupListControl_OpenContextGrid() {
    var filterValue = this.TextFilter.value;
    this.CurrentLookupValuesNode = null;
    if (!IsNullOrEmpty(filterValue)) {
        var lookupSettings = this.LookupControl.Settings;
        var url = lookupSettings.ModulePath + '/ContextGrid.aspx?rnd=' + Math.random();

        var params = '';
        params += lookupSettings.SettingsParams;
        params += '&isContextSearch=true';
        params += '&settingsName=' + escape(lookupSettings.SettingsName);
        params += '&filterValue=' + escape(filterValue);
        if (window.Context != null) {
            if (!IsNullOrEmpty(window.Context().ContextSiteUrl))
                params += '&contextSiteUrl=' + encodeURI(window.Context().ContextSiteUrl);
        }

        var parentParams = lookupSettings.GetParentFilterParams(this.LookupControl);
        if (!SM.IsNE(parentParams))
            params += parentParams;

        if (window.ListForm != null) {
            if (!IsNullOrEmpty(window.ListForm.ItemID))
                params += '&listFormItemID=' + window.ListForm.ItemID.toString();
            if (!IsNullOrEmpty(window.ListForm.ListID))
                params += '&listFormListID=' + window.ListForm.ListID.toString();
            if (!IsNullOrEmpty(window.ListForm.WebID))
                params += '&listFormWebID=' + window.ListForm.WebID.toString();
        }

        var defaultFilterValues = lookupSettings.GetDefaultFilterValues();
        if (!SM.IsNE(defaultFilterValues))
            params += '&defaultFilterValues=' + escape(defaultFilterValues);

        //получаем клиентские значения полей для их использования в SQL-фильтрации
        var clientValues = DBLookupSettings_GetClientFilterValues.call(lookupSettings);
        if (!SM.IsNE(clientValues))
            params += '&clientValues=' + clientValues;

        var lookupControl = this.LookupControl;
        params = DBLookupSettings_CustomizeSearchRequest.call(lookupSettings, params, lookupControl.ControlName);

        var xmlRequest = SM.GetXmlRequest();
        xmlRequest.open('POST', url, true);
        xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        var thisObj = this;
        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                xmlRequest.onreadystatechange = new Function();
                var responseText = xmlRequest.responseText;
                thisObj.OpenContextGridCompleted(responseText);
            }
        };
        xmlRequest.send(params);
    }
}

//debugger
function DBLookupListControl_OpenContextGridCompleted(responseText) {
    if (IsNullOrEmpty(responseText))
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'responseText'));

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
            this.CurrentLookupValuesNode = lookupValuesDocument.selectSingleNode('ArrayOfLookupValue');
            this.SetSelectionGrid(gridHtml);
        }
    }
    this.ShowGrid();
}

function DBLookupListControl_GetGridRowValue(row) {
    if (row == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'row'));
    var lookupID = row.getAttribute('LookupID');
    var value = null;
    if (!IsNullOrEmpty(lookupID) && this.CurrentLookupValuesNode != null) {
        var lookupValueNode = this.CurrentLookupValuesNode.selectSingleNode("LookupValue[@LookupID='" + lookupID + "']");
        if (lookupValueNode == null)
            throw new Error(window.TN.TranslateKey('LookupControl.GetGridRowValue.NotFoundException') + lookupID);

        lookupValueNode = lookupValueNode.cloneNode(true);
        value = new DBLookupControlValue(lookupValueNode, this.LookupControl);
    }
    return value;
}

//debugger
function DBLookupListControl_OnSetGridValue(lookupValue) {
    if (lookupValue != null) {
        var lookupControl = this.LookupControl;
        if (!lookupControl.Settings.IsMultiple) {
            //удаляем текущий контрол
            if (lookupControl.SingleValue != null) {
                lookupControl.DisableChangeHandler = true;
                lookupControl.SingleValue.DeleteValue();
                lookupControl.DisableChangeHandler = false;
            }
        }
        //lookupValue.CreateValueControl();
        lookupValue.SetToControlValue();
        lookupControl.DefaultValueSet = false;
        lookupControl.SaveValue();
    }
}


function DBLookupControl_CreateTableViewControl() {
    var divLookupSelect = window.document.createElement('div');
    divLookupSelect.className = 'dbf_lookup_font';
    divLookupSelect.style.paddingBottom = '5px';
    var tbLookupSelect = window.document.createElement('table');
    divLookupSelect.appendChild(tbLookupSelect);
    tbLookupSelect.border = 0;
    tbLookupSelect.cellSpacing = 0;
    tbLookupSelect.cellPadding = 0;
    var trLookupSelect = tbLookupSelect.insertRow(-1);
    this.OpenWindowControl = tbLookupSelect;

    var thisObj = this;

    if (!this.Settings.HideOpenWindow && !this.Settings.Disabled && !this.Disabled && !trLookupSelect.__init_OpenWin) {
        var tdOpenWindowImg = trLookupSelect.insertCell(-1);
        tdOpenWindowImg.style.paddingRight = '5px';
        tdOpenWindowImg.style.verticalAlign = 'top';
        tdOpenWindowImg.innerHTML = "<img border='0' src='/_layouts/images/addressbook.gif' onclick='this.parentNode.parentNode.cells[this.parentNode.cellIndex + 1].children[0].click()' style='cursor:pointer'/>";

        var tdOpenWindow = trLookupSelect.insertCell(-1);
        tdOpenWindow.style.paddingRight = '15px';
        tdOpenWindow.style.verticalAlign = 'top';
        tdOpenWindow.style.paddingTop = '1px';
        var lnkOpenWindow = window.document.createElement('a');
        tdOpenWindow.appendChild(lnkOpenWindow);
        lnkOpenWindow.className = 'dbf_lookup_link';
        lnkOpenWindow.innerHTML = this.Settings.TableModeLinkText;
        lnkOpenWindow.href = 'javascript:';
        lnkOpenWindow.onclick = function () { thisObj.OpenLookupWindow(); }
        trLookupSelect.__init_OpenWin = true;
    }

    if (this.Settings.ShowCreateItemLink && !this.Settings.Disabled && !this.Disabled && !trLookupSelect.__init_CreateLink) {

        var tdCreateItemImg = trLookupSelect.insertCell(-1);
        tdCreateItemImg.style.paddingRight = '5px';
        tdCreateItemImg.style.verticalAlign = 'top';
        tdCreateItemImg.innerHTML = "<img border='0' src='/_layouts/images/newitem.gif' onclick='this.parentNode.parentNode.cells[this.parentNode.cellIndex + 1].children[0].click()' style='cursor:pointer'/>";

        var tdCreateItem = trLookupSelect.insertCell(-1);
        tdCreateItem.style.paddingRight = '15px';
        tdCreateItem.style.verticalAlign = 'top';
        tdCreateItem.style.paddingTop = '1px';
        var lnkCreateItem = window.document.createElement('a');
        tdCreateItem.appendChild(lnkCreateItem);
        lnkCreateItem.className = 'dbf_lookup_link';
        lnkCreateItem.innerHTML = this.Settings.CreateItemLinkText;
        if (!IsNullOrEmpty(this.Settings.CreateItemLinkToolTip))
            lnkCreateItem.title = this.Settings.CreateItemLinkToolTip;

        lnkCreateItem.href = 'javascript:';
        lnkCreateItem.onclick = function () { thisObj.Settings.CreateLookupItem(thisObj.ControlName); return false; }
        trLookupSelect.__init_CreateLink = true;
    }






    var tbTableControl = window.document.createElement('table');
    this.EditControl = tbTableControl;
    var tbID = 'lookupTB_' + Math.random().toString().replace(',', '').replace('.', '');
    tbTableControl.id = tbID;
    tbTableControl.border = 0;
    tbTableControl.cellSpacing = 0;
    tbTableControl.cellPadding = 0;
    tbTableControl.className = 'dbl_table dbl_table_cellBorder';

    var trHeaderContainer = tbTableControl.createTHead();
    var trHeader = trHeaderContainer.insertRow(-1);
    tbTableControl.style.display = 'none';
    var i, len = this.Settings.ItemFields.length;
    var tdActions = trHeader.insertCell(-1);
    this.MultiHeaderControl = tdActions;
    var hasActions = !this.Settings.HideDeleteValuePicker || this.Settings.EnableMultiValueReorder;
    if (this.Settings.Disabled || this.Disabled || !hasActions)
        this.MultiHeaderControl.style.display = 'none';

    tdActions.className = 'dbl_table_header';
    tdActions.NoSortable = true;
    tdActions.style.width = '16px';
    this.IsLastRowAlternate = true;
    var sortPadding = 10;
    for (i = 0; i < len; i++) {
        var tField = this.Settings.ItemFields[i];
        if (tField.ShowInTable) {
            var tdField = document.createElement('th');
            tdField.ItemField = tField;
            trHeader.appendChild(tdField);

            if (tField.TableColumnWidth != null && tField.TableColumnWidth > 0) {
                tdField.style.width = tField.TableColumnWidth + 'px';
                tdField.className = 'dbl_table_colWidth';
            }

            var headerClass = 'dbl_table_header'
            //tdField.style.position = 'relative';

            if (!tField.UserSortable) {
                //если колонка не подразумевает пользовательскую сортировку,
                //устанавливаем специальный класс
                //запрещающий сортировку плагину сортировки.
                tdField.NoSortable = true;
            }

            DBLookup_AddClass(tdField, headerClass);

            var divHeader = window.document.createElement('div');
            tdField.appendChild(divHeader);

            var divHeaderContent = window.document.createElement('div');
            divHeader.appendChild(divHeaderContent);
            divHeaderContent.innerHTML = tField.DisplayName;
            divHeaderContent.className = 'dbl_table_offset';
            divHeaderContent.style.position = 'relative';

            if (tField.UserSortable) {
                //освобождаем место под иконку сортировки
                tdField.style.paddingRight = sortPadding + 'px';
                //добавляем иконки сортировки
                tdField.SortIconContainer = document.createElement('div');
                tdField.SortIconContainer.className = 'dbl_header_sort_container';

                tdField.SortIcon = document.createElement('div');
                tdField.SortIcon.className = 'dbl_header_sort_icon';
                tdField.SortIconContainer.appendChild(tdField.SortIcon);

                divHeaderContent.appendChild(tdField.SortIconContainer);
            }

            var fieldType = tField.Type;
            if (tField.TableColumnWidth == null || tField.TableColumnWidth == 0) {
                //ширина столбца формируется по контенту (заголовка или ячейки какой-либо сторки)
                var defaultWidthClass = 'dbl_tableField_width';
                if (fieldType == 'DBFieldText')
                    defaultWidthClass = 'dbl_tableField_width_text';
                else if (fieldType == 'DBFieldMultiLineText')
                    defaultWidthClass = 'dbl_tableField_width_textarea';
                else if (fieldType == 'DBFieldDateTime') {
                    if (!tField.ShowTime)
                        defaultWidthClass = 'dbl_tableField_width_date';
                    else
                        defaultWidthClass = 'dbl_tableField_width_datetime';
                }
                else if (fieldType == 'DBFieldLookupSingle' || fieldType == 'DBFieldLookupMulti')
                    defaultWidthClass = 'dbl_tableField_width_lookup';

                divHeader.className = defaultWidthClass;
            }
            else {
                //задана фиксированная ширина столбца => чтобы ее не нарушить уменьшаем
                //на величину paddingRight
                var tmpHeaderWidth = tField.TableColumnWidth;
                if (tField.UserSortable)
                    tmpHeaderWidth -= sortPadding;
                divHeader.style.width = tmpHeaderWidth + 'px';
            }
        }
    }

    //запускаем событие отрисовки заголовка.
    SM.FireEvent(this, 'InitHeaderCompleted', { HeaderRow: trHeader });

    this.Container.appendChild(divLookupSelect);
    this.Container.appendChild(tbTableControl);
}

//debugger
function DBLookupControl_ResetRowsLayout() {
    if (this.Settings.WindowControlMode == 'TableView') {
        if (this.Settings.IsMultiple) {
            var i, len = this.MultiValue.length;

            var currentAlternateStyle = true;

            if (this.Settings.TableViewSortingEnabled) {
                var mainBody = this.EditControl.tBodies[0];
                if (mainBody != null) {
                    var valueRows = mainBody.rows;
                    var j, jlen = valueRows.length;
                    for (j = 0; j < jlen; j++) {
                        var valueRow = valueRows[j];

                        //пропускаем удалённые строки.
                        if (valueRow.style.display == 'none')
                            continue;

                        currentAlternateStyle = !currentAlternateStyle;
                        if (currentAlternateStyle)
                            valueRow.className = 'dbl_table_cell_alternate';
                        else
                            valueRow.className = '';
                    }
                }
            }
            else {
                for (i = 0; i < len; i++) {
                    currentAlternateStyle = !currentAlternateStyle;

                    var singleValue = this.MultiValue[i];

                    if (currentAlternateStyle)
                        singleValue.ValueControl.className = 'dbl_table_cell_alternate';
                    else
                        singleValue.ValueControl.className = '';
                }
            }
            this.IsLastRowAlternate = currentAlternateStyle;
        }
    }
    /*
    else if(this.Settings.WindowControlMode == 'RowView' && this.Settings.IsListControlMode)
    {
        var i, len = this.MultiValue.length;
        for(i = 0; i < len; i++)
        {
            var lookupValue = this.MultiValue[i];
            if(!lookupValue.Deleted)
            {
                if(lookupValue.Index == 0)
                    lookupValue.ValueControl.parentNode.parentNode.style.paddingTop = '0px';
                else
                    lookupValue.ValueControl.parentNode.parentNode.style.paddingTop = '4px';
            }
        }
    }
    */
}

function DBLookupControl_CreateEnumViewControl() {
}

//обновляет значения табличных значение элементов подстановки.
function DBLookupControl_RefreshTableValues(lookupIDToRefresh) {
    if (this.Settings.WindowControlMode != 'TableView')
        return;

    //идентификатор элемента подстановки для принудительного обновления табличных значений.
    if (lookupIDToRefresh == null)
        lookupIDToRefresh = 0;

    //формируем массив обновляемых значений и строку, содержащую идентификаторы подстановок.
    var lookupIdentities = '';
    var refreshingValues = [];

    //формируем коллекцию обновляемых значений для множественной подстановки.
    if (this.Settings.IsMultiple) {
        var i, len = this.MultiValue.length;
        for (i = 0; i < len; i++) {
            var lookupValue = this.MultiValue[i];
            if (lookupValue.LookupID > 0 && (lookupIDToRefresh == 0 && !lookupValue.TableValuesLoaded || lookupValue.LookupID == lookupIDToRefresh)) {

                //добавляем значение в коллекцию обноляемых значений.
                refreshingValues.push(lookupValue);
                if (lookupIdentities.length > 0)
                    lookupIdentities += ',';
                lookupIdentities += lookupValue.LookupID;
            }
        }
    }
    //инициализируем обновляемое значение единичной подстановки.
    else if (this.SingleValue != null && this.SingleValue.LookupID > 0 && (lookupIDToRefresh == 0 && !this.SingleValue.TableValuesLoaded || this.SingleValue.LookupID == lookupIDToRefresh)) {
        //добавляем значение в коллекцию обноляемых значений.
        refreshingValues.push(this.SingleValue);

        //добавляем идентфиикатор элемента подстановки в строку идентификаторов.
        lookupIdentities += this.SingleValue.LookupID;
    }

    //если сформирована строка идентификаторов элемента подстановки, запускаем запрос получения табличных значений.
    if (lookupIdentities.length == 0 || refreshingValues.length == 0)
        return;

    //создаём запрос.
    var requestBuilder = SM.CreateRequestBuilder({
        DefaultParams: this.Settings.SettingsParams,
        EncodeParams: false
    });

    //устанавливаем название операции.
    requestBuilder.SetParam('operationName', 'GetTableValues');

    //устанавливаем идентификаторы элементов подстановок в запрос, передаём параметр методом POST.
    requestBuilder.SetParam('lookupIdentities', lookupIdentities, true);

    //отправляем запрос.
    requestBuilder.SendRequest(this.Settings.ModulePath + '/LookupControlService.ashx', DBLookupControl_RefreshTableValuesCompleted, this, refreshingValues);
}


//обрабатывает окончание обновления табличных значений элементов подстановки.
function DBLookupControl_RefreshTableValuesCompleted(responseText, refreshingValues) {
    if (SM.IsNE(responseText))
        throw new Error('Отсутствует результат выполнения метода DBLookupControl_RefreshTableValues.');
    if (refreshingValues == null)
        throw new Error('Не передана коллекция элементов подстановки в параметре refreshingValues, для которых обновлены табличные значения.');

    //получаем результат операции.
    var result = JSON.parse(responseText);
    if (result.Exception != null) {
        alert(result.Exception.DisplayText);
        return;
    }

    //формируем словарь элементов подстановки по идентификатору элемента.
    var k, klen = result.Items.length;
    var tableItems = {};
    for (k = 0; k < klen; k++) {
        var tableItem = result.Items[k];
        tableItems[tableItem.ItemID] = tableItem;

        //формируем словарь значений по названиям полей.
        var tableValues = tableItem.TableValues;
        tableItem.TableValues = {};
        var m, mlen = tableValues.length;
        for (m = 0; m < mlen; m++) {
            var tableValue = tableValues[m];
            tableItem.TableValues[tableValue.FieldName.toLowerCase()] = tableValue.Value;
        }
    }

    //инициализиурем табличные значения.
    var i, len = refreshingValues.length;
    for (i = 0; i < len; i++) {
        //получаем обновляемое значение подстановки.
        var lookupValue = refreshingValues[i];

        //получаем набор табличных значений для элемента.
        var tableItem = tableItems[lookupValue.LookupID];

        //обновляем значения в таблице.
        DBLookupControlValue_RefreshTableValues.call(lookupValue, tableItem);
    }

    //для множественной подстановки сортируем таблицу значений после обновления значений.
    if (this.Settings.IsMultiple && this.Settings.TableViewSortingEnabled) {
        //т.к. сортировка накладывается асинхронно, то она может еще не отработать
        if (this.EditControl.TableSorterInited) {
            $(this.EditControl).trigger("update");
            var sorting = null;
            var currentSorting = null;
            //пробуем получить текущую сортировку
            if (this.EditControl.config != null)
                currentSorting = this.EditControl.config.CurrentSorting;

            sorting = currentSorting;
            //если текущей сортировки нет, то используем сортировку по умолчанию
            //заданную изначально при инициализации плагина.
            if (currentSorting == null)
                sorting = this.EditControl.DefaultSorting;

            $(this.EditControl).trigger("sorton", [sorting]);
            this.EditControl.SortingInited = true;
        }
    }
}

//обновляет отображение табличных значений для элемента подстановки по полученному с сервера набору значений.
function DBLookupControlValue_RefreshTableValues(tableItem) {

    //если набор табличных значений отсутствует, значит элемент был удалён и необходимо удалить значение из контрола подстановки.
    if (tableItem == null) {
        this.DeleteValue();
        return;
    }

    var i, len = this.Settings.ItemFields.length;
    for (i = 0; i < len; i++) {
        var itemField = this.Settings.ItemFields[i];

        //пропускаем поля, которые не отображается в таблице.
        if (!itemField.ShowInTable)
            continue;

        //получаем ячейку табличного значения.
        var tdField = this.Cells[itemField.FieldName];
        if (tdField == null)
            continue;

        //получаем див, в которомом должно быть отображено значение ячейки.
        var divContent = tdField.DivContent;

        //получаем табличное значение поля.
        var fieldValue = tableItem.TableValues[itemField.FieldName.toLowerCase()];

        //обрабатываем ссылку на элемент.
        if (itemField.IsItemLink) {
            if (tdField.LookupLink != null) {
                if (SM.IsNE(fieldValue))
                    fieldValue = window.TN.TranslateKey('LookupControl.Undefined');
                tdField.LookupLink.innerHTML = fieldValue;
            }
        }
        //обрабатываем непустое значение поля.
        else if (!SM.IsNE(fieldValue)) {
            //обрабатываем значение поля подстановки.
            if (itemField.FieldType == 'DBFieldLookupSingle')
                SM.SetInnerText(divContent, fieldValue.LookupText);
            //обрабатываем значение множественной подстановки.
            else if (itemField.FieldType == 'DBFieldLookupMulti') {
                var lookupTexts = '';
                var j, jlen = fieldValue.length;
                for (j = 0; j < jlen; j++) {
                    var lookupValue = fieldValue[j];
                    if (!SM.IsNE(lookupValue.LookupText)) {
                        if (lookupTexts.length > 0)
                            lookupTexts += '; ';
                        lookupTexts += lookupValue.LookupText;
                    }
                }
                SM.SetInnerText(divContent.innerHTML, lookupTexts);
            }
            //обрабатываем поле файлов.
            else if (itemField.FieldType == 'DBFieldFiles') {
                //устанавливаем пустое значение при отсутствии файлов.
                divContent.innerHTML = '';
                DBLookup_AddClass(divContent, 'dbl_center');

                //обрабатываем файлы из поля.
                var filesCount = fieldValue.length;
                if (filesCount > 0) {

                    //определяем наличие хотя бы одного превью.
                    var hasAnyPreview = false;
                    for (var j = 0; j < filesCount; j++) {
                        var fileValue = fieldValue[j];
                        if (fileValue.HasPreview) {
                            hasAnyPreview = true;
                            break;
                        }
                    }

                    //получаем признак множественных файлов.
                    var isMultiple = fieldValue.length > 1;
                    //если файлов несколько, рисуем пиктограмму открытия меню с перечнем файлов.
                    if (isMultiple) {
                        //создаём картинку с файлами.
                        var imgFiles = document.createElement('img');
                        imgFiles.className = 'dbl_fileIcon';
                        //если ни один из файлов не содержит превью, добавляем затемняющий стиль.
                        if (!hasAnyPreview)
                            DBLookup_AddClass(imgFiles, 'dbl_fileIcon_fade');
                        imgFiles.src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/ic_many.png';
                        imgFiles.title = TN.TranslateKey('LookupControl.ClickToShowFiles');

                        //добавляем ссылку на меню в ячейку.
                        divContent.appendChild(imgFiles);

                        //создаём контрол меню.
                        var menuControl = new Tooltip({
                            parentElement: imgFiles,
                            relativeX: 0,
                            relativeY: 0,
                            relativeLeft: 0,
                            hideOnMouseOut: false,
                            isVertical: true
                        });
                        imgFiles.Menu = menuControl;
                        imgFiles.onclick = DBLookupControl_OnMultiFilesClick;

                        //создаём файлы.
                        for (var j = 0; j < filesCount; j++) {
                            var fileValue = fieldValue[j];
                            fileValue.ItemID = tableItem.ItemID;
                            fileValue.ListID = this.Settings.LookupListID;
                            fileValue.FieldName = itemField.FieldName;
                            var menuLink = DBLookupControl_CreateMenuLink.call(menuControl, fileValue.FileName, fileValue.FileUrl, DBLookupControl_OnFileClick, fileValue.IconUrl);
                            if (menuLink.Image != null && !fileValue.HasPreview)
                                menuLink.Image.className += ' dbl_fileIcon_fade';

                            menuLink.setAttribute('FileName', fileValue.FileName);
                            menuLink.setAttribute('FileUrl', fileValue.FileUrl);
                            menuLink.setAttribute('SiteID', fileValue.FileSiteID);
                            menuLink.setAttribute('EnableFooterText', fileValue.EnableFooterText.toString().toLowerCase());
                            if (!SM.IsNE(this.UrlAccessCode)) {
                                menuLink.setAttribute('ac', this.UrlAccessCode);

                                //подключаем обработчик для изменения установки доступа по ссылке к файлу в ссылку на файл.
                                if (fileValue.HasPreview)
                                    SM.AttachEvent(menuLink, 'OnFilePreviewOpened', DBLookupControl_OnFilePreviewOpened, this);
                            }
                            //устанавливаем ссылку на значение файла.
                            menuLink.FileValue = fileValue;
                        }

                        //устанавливаем фиксированную ширину меню файлов.
                        if (menuControl.LinksTable != null)
                            menuControl.LinksTable.className += ' dbl_filesMenuTable';
                    }
                    //рисуем пиктограмму открытия одного файла.
                    else {
                        var fileValue = fieldValue[0];
                        var fileLink = document.createElement('a');
                        fileLink.href = fileValue.FileUrl;
                        fileLink.title = fileValue.FileName;

                        //устанавливаем обработчик клика по ссылке.
                        fileLink.onclick = DBLookupControl_OnSingleFileClick;

                        //устанавливаем параметры ссылки, требуемые для корректного открытия превью и файла на чтение.
                        fileLink.setAttribute('FileName', fileValue.FileName);
                        fileLink.setAttribute('FileUrl', fileValue.FileUrl);
                        fileLink.setAttribute('SiteID', fileValue.FileSiteID);
                        fileLink.setAttribute('EnableFooterText', fileValue.EnableFooterText.toString().toLowerCase());
                        if (!SM.IsNE(this.UrlAccessCode)) {
                            fileLink.setAttribute('ac', this.UrlAccessCode);

                            //подключаем обработчик для изменения установки доступа по ссылке к файлу в ссылку на файл.
                            if (fileValue.HasPreview)
                                SM.AttachEvent(fileLink, 'OnFilePreviewOpened', DBLookupControl_OnFilePreviewOpened, this);
                        }
                        //устанавливаем ссылку на значение файла.
                        fileLink.FileValue = fileValue;

                        //создаём картинку с файлом.
                        var imgFile = document.createElement('img');
                        //добавляем картинку к ссылке.
                        fileLink.appendChild(imgFile);
                        //устанавливаем путь к картинке, соответствующей расширению файла.
                        imgFile.src = fileValue.IconUrl;
                        imgFile.className = 'dbl_fileIcon';
                        //затемняем картинку, если нет превью.
                        if (!fileValue.HasPreview)
                            DBLookup_AddClass(imgFile, 'dbl_fileIcon_fade');

                        //добавляем ссылку на файл в ячейку.
                        divContent.appendChild(fileLink);
                    }
                }

            }
            //обрабатываем поле ссылки.
            else if (itemField.FieldType == 'DBFieldLink') {
                //устанавливаем пустое значение при отсутствии ссылок.
                divContent.innerHTML = '';

                //добавляем ссылки.
                var j, jlen = fieldValue.length;
                for (j = 0; j < jlen; j++) {
                    var linkValue = fieldValue[j];
                    var title = !SM.IsNE(linkValue.Title) ? linkValue.Title : linkValue.Url;

                    var link = document.createElement('a');
                    link.className = 'dbf_lookup_link';
                    link.href = linkValue.Url;
                    SM.SetInnerText(link, title);
                    if (!SM.IsNE(linkValue.Tooltip))
                        link.title = linkValue.Tooltip;
                    link.onclick = function (evt) { DBLookup_OpenWin(this.href); SM.CancelEvent(evt); return false; }

                    var divLink = document.createElement('div');
                    if (j > 0)
                        divLink.className = 'dbl_table_linkHolder';
                    divLink.appendChild(link);
                    divContent.appendChild(divLink);
                }
            }
            //обработка типа поля по умолчанию.
            else
                divContent.innerHTML = fieldValue.toString();
        }
        //устанавливаем пустое значение поля.
        else
            divContent.innerHTML = '';
    }

    //устанавливаем признак того, что табличное значение было загружено с сервера.
    this.TableValuesLoaded = true;
}


//обрабатываем клик по пиктограмме, открывающей перечень нескольких файлов, загруженных в поле.
function DBLookupControl_OnMultiFilesClick() {
    this.Menu.ShowTrigger();
}

//обрабатывает клик по одиночному файлу.
function DBLookupControl_OnSingleFileClick(evt) {
    if (evt == null)
        evt = window.event;
    return DBLookupControl_OnFileClick(this, evt);
}

//открывает превью файла при его наличии или открывает файл на чтение.
function DBLookupControl_OnFileClick(fileLink, evt) {

    if (fileLink == null)
        throw new Error('Не передан параметр fileLink.');

    //получаем значение файла.
    var fileValue = fileLink.FileValue;
    if (fileValue == null)
        throw new Error('Не передан параметр fileValue.');

    //открываем превью файла, если оно имеется.
    if (fileValue.HasPreview)
        ShowFilePreview(fileValue.FileWebID, fileValue.FileListID, fileValue.FileItemID, fileLink, true, true);
    else
        return OnFileClick(fileLink, false);

    //возвращаем false, чтобы блокировать скачивание файла.
    SM.CancelEvent(evt);
    return false;
}

//обрабатывает открытие файла.
function DBLookupControl_OnFilePreviewOpened(filePreview) {
    if (filePreview != null && filePreview.nameField != null)
        filePreview.nameField.setAttribute('ac', this.UrlAccessCode);
}

function DBLookupControl_CreateMenuLink(linkText, linkUrl, linkClick, imageUrl) {
    if (SM.IsNE(linkText))
        throw new Error('Не передан параметр linkText.');

    if (this.LinksTable == null) {
        var divContainer = window.document.createElement('div');
        this.DivContent.appendChild(divContainer);
        this.LinksTable = window.document.createElement('table');
        divContainer.appendChild(this.LinksTable);
        this.LinksTable.border = 0;
        this.LinksTable.cellPadding = 0;
        this.LinksTable.cellSpacing = 0;
        this.LinksTable.className = 'dbl_menuLinksTable';
    }
    var trLink = this.LinksTable.insertRow(-1);
    var tdImage = trLink.insertCell(-1);
    tdImage.className = 'dbl_menuLinkImageCell';
    var tdLink = trLink.insertCell(-1);
    var isFirstLink = trLink.rowIndex == 0;
    if (isFirstLink)
        trLink.className = 'dbl_menuFirstRow';

    tdLink.className = 'dbl_menuLinkCell';
    var link = window.document.createElement('a');
    tdLink.appendChild(link);
    if (SM.IsNE(linkUrl))
        linkUrl = 'javascript:';
    link.href = linkUrl;
    link.innerHTML = linkText;
    link.className = 'dbl_menuLink';
    if (linkClick != null)
        link.onclick = function (evt) {
            if (evt == null) evt = window.event; return linkClick(link, evt);
        }

    var linkImg = null;
    if (!SM.IsNE(imageUrl)) {
        linkImg = window.document.createElement('img');
        tdImage.appendChild(linkImg);
        linkImg.className = 'dbl_menuLinkImage';
        linkImg.src = imageUrl;
        //в сафари без $ клик по ссылке не работал.
        if (linkClick != null)
            linkImg.onclick = function () {
                link.click();
            }
        link.Image = linkImg;
    }

    return link;
}


function DBLookupControl_OpenLookupWindow() {
    if (!this.Disabled)
        this.Settings.OpenLookupWindow(this.ControlName, this);
}

//debugger
function DBLookupControl_SetValueXml(xml) {
    if (!IsNullOrEmpty(xml)) {
        var axoResult = SM.LoadXML(xml);
        var resultDocument = axoResult.documentElement.ownerDocument;
        if (!this.Settings.IsMultiple) {
            var singleValueNode = resultDocument.selectSingleNode('LookupValue');
            if (singleValueNode != null) {
                //удаляем текущий контрол
                if (this.SingleValue != null) {
                    this.DisableChangeHandler = true;
                    this.SingleValue.DeleteValue();
                    this.DisableChangeHandler = false;
                }

                var singleValue = new DBLookupControlValue(singleValueNode, this);
                singleValue.CreateValueControl();
                singleValue.SetToControlValue();
                this.DefaultValueSet = false;
            }
        }
        else {
            var multiValueNodes = resultDocument.selectNodes('ReturnItems/LookupValue');
            if (this.Settings.EnableWindowLookupValueEdit) {
                var forDelete = new Array();
                var j, jlen = this.Value.length;
                for (j = 0; j < jlen; j++) {
                    var lookupValue = this.Value[j];
                    if (!lookupValue.Deleted) {
                        var resultNode = resultDocument.selectSingleNode("ReturnItems/LookupValue[@LookupID='" + lookupValue.LookupID + "']");
                        if (resultNode == null)
                            forDelete.push(lookupValue);
                    }
                }
                jlen = forDelete.length;
                for (j = 0; j < jlen; j++) {
                    var lookupValue = forDelete[j];
                    lookupValue.DeleteValue();
                }
            }
            var i, len = multiValueNodes.length;
            for (i = 0; i < len; i++) {
                var resultValueNode = multiValueNodes[i];
                var lookupID = DBLookup_GetIntegerAttributeValue(resultValueNode, 'LookupID');
                if (lookupID != 0) {
                    var lookupValueNode = this.MultiValueNode.selectSingleNode("LookupValue[@LookupID='" + lookupID + "']");
                    if (lookupValueNode == null) {
                        lookupValueNode = resultValueNode;

                        var singleValue = new DBLookupControlValue(lookupValueNode, this);
                        singleValue.CreateValueControl();
                        singleValue.SetToControlValue();
                    }
                }
            }
            this.DefaultValueSet = false;

            //обновляем табличные значения
            DBLookupControl_RefreshTableValues.call(this);
        }
        this.SaveValue();
    }
}

function DBLookupControl_DeleteSingleValue() {
    if (this.SingleValue != null)
        this.SingleValue.DeleteValue();
}

//DBField Interface
function DBLookupControl_Disable() {
    this.Disabled = true;
    if (this.Settings.ControlMode == 'DropDownList') {
        if (!(this.Settings.IsListControlMode && this.Settings.IsDropDownListControl))
            this.EditControl.disabled = true;
        else
            this.ListControl.Disable();
    }
    else if (this.Settings.ControlMode == 'LookupWindow') {
        if (this.OpenWindowControl != null)
            this.OpenWindowControl.style.display = 'none';
        if (this.MultiHeaderControl != null)
            this.MultiHeaderControl.style.display = 'none';
        if (!this.Settings.IsMultiple) {
            if (this.DeleteSingleValueControl != null)
                this.DeleteSingleValueControl.style.display = 'none';
            if (this.SingleValue != null)
                this.SingleValue.Disable();
        }
        else {
            var i, len = this.MultiValue.length;
            for (i = 0; i < len; i++) {
                var singleValue = this.MultiValue[i];
                if (singleValue != null)
                    singleValue.Disable();
            }
        }
        if (this.Settings.IsListControlMode && this.ListControl != null)
            this.ListControl.Disable();
    }
    if (this.CreateItemLinkDiv != null)
        this.CreateItemLinkDiv.style.display = 'none';
}

function DBLookupControl_Enable() {
    this.Disabled = false;
    if (this.Settings.ControlMode == 'DropDownList') {
        if (!(this.Settings.IsListControlMode && this.Settings.IsDropDownListControl))
            this.EditControl.disabled = false;
        else
            this.ListControl.Enable();
    }
    else if (this.Settings.ControlMode == 'LookupWindow') {
        if (this.OpenWindowControl != null)
            this.OpenWindowControl.style.display = '';
        if (this.MultiHeaderControl != null && !this.Settings.HideDeleteValuePicker)
            this.MultiHeaderControl.style.display = '';
        if (!this.Settings.IsMultiple) {
            if (this.DeleteSingleValueControl != null)
                this.DeleteSingleValueControl.style.display = '';
            if (this.SingleValue != null)
                this.SingleValue.Enable();
        }
        else {
            var i, len = this.MultiValue.length;
            for (i = 0; i < len; i++) {
                var singleValue = this.MultiValue[i];
                if (singleValue != null)
                    singleValue.Enable();
            }
        }
        if (this.Settings.IsListControlMode && this.ListControl != null)
            this.ListControl.Enable();
    }
    if (this.CreateItemLinkDiv != null)
        this.CreateItemLinkDiv.style.display = '';
}

function DBLookupControl_GetValue() {
    return this.Value;
}

function DBLookupControl_GetValueKey() {
    if (this.Settings.IsMultiple)
        throw new Error('Метод GetValueKey не поддерживается для множественного режима.');
    var valueKey = null;
    var lookupValue = this.Value;
    if (lookupValue != null) {
        if (!IsNullOrEmpty(lookupValue.LookupID))
            valueKey = lookupValue.LookupID.toString();
    }
    return valueKey;
}

//debugger
function DBLookupControl_SetValue(value, overrideMultiValue) {
    this.DisableChangeHandler = true;
    if (!this.Settings.IsMultiple) {
        var lookupID = 0;
        var lookupText = null;
        if (this.Settings.ControlMode == 'DropDownList') {
            var valueString = null;
            if (value != null) {
                valueString = value.toString();
                if (value.LookupID != null || value.LookupID == 0)
                    valueString = value.LookupID.toString();
            }

            if (valueString != null) {
                var regNum = new RegExp('^([0-9]+)$');
                var matchNum = valueString.match(regNum);
                var isNum = matchNum != null;
                if (isNum)
                    lookupID = parseInt(valueString);
            }

            //устанавливаем нужный option либо (нет)
            var lookupValue = this.DropDownValues[lookupID];
            if (lookupValue != null) {
                //дважды сбрасываем флаг - перед и после удаления.
                lookupValue.Deleted = false;
                if (this.SingleValue != null)
                    this.SingleValue.DeleteValue();
                lookupValue.Deleted = false;
                if (!(this.Settings.IsListControlMode && this.Settings.IsDropDownListControl)) {
                    lookupValue.SetToControlValue();
                    this.EditControl.selectedIndex = lookupValue.OptionIndex;
                }
                else {
                    lookupValue.CreateValueControl();
                    lookupValue.SetToControlValue();
                }
            }
            else if (this.Settings.IsListControlMode) {
                //удаляем текущий контрол
                if (this.SingleValue != null)
                    this.SingleValue.DeleteValue();
            }
        }
        else {
            var deleteValue = false;
            if (value != null) {
                var lookupValue = this.Settings.ParseLookupValue(value);

                //удаляем текущий контрол
                if (this.SingleValue != null)
                    this.SingleValue.DeleteValue();

                if (lookupValue != null) {
                    if (lookupValue.LookupID > 0 && !IsNullOrEmpty(lookupValue.LookupText)) {
                        var singleValueNode = this.CreateLookupValueNode(lookupValue.LookupID, lookupValue.LookupText);
                        var singleValue = new DBLookupControlValue(singleValueNode, this);
                        singleValue.CreateValueControl();
                        singleValue.SetToControlValue();
                    }
                }
            }
            else {
                //удаляем текущий контрол
                if (this.SingleValue != null)
                    this.SingleValue.DeleteValue();
            }
        }

    }
    else {
        if (value != null) {
            var isArray = value.constructor == Array;
            if (isArray) {
                if (overrideMultiValue) {
                    var i, len = this.MultiValue.length;
                    var valuesToDelete = new Array();
                    for (i = 0; i < len; i++) {
                        var singleValue = this.MultiValue[i];
                        if (singleValue != null)
                            valuesToDelete.push(singleValue);
                    }
                    while (valuesToDelete.length > 0) {
                        var singleValue = valuesToDelete.shift();
                        singleValue.DeleteValue();
                    }
                }

                var i, len = value.length;
                for (i = 0; i < len; i++) {
                    var lookupValue = value[i];
                    if (lookupValue != null) {
                        lookupValue = this.Settings.ParseLookupValue(lookupValue);
                        if (lookupValue != null) {
                            if (lookupValue.LookupID > 0 && !IsNullOrEmpty(lookupValue.LookupText)) {
                                var singleValueNode = this.MultiValueNode.selectSingleNode("LookupValue[@LookupID='" + lookupValue.LookupID + "']");
                                if (singleValueNode == null) {
                                    singleValueNode = this.CreateLookupValueNode(lookupValue.LookupID, lookupValue.LookupText);
                                    var singleValue = new DBLookupControlValue(singleValueNode, this);
                                    singleValue.CreateValueControl();
                                    singleValue.SetToControlValue();
                                }
                            }
                        }
                    }
                }

                //обновляем табличные значения.
                DBLookupControl_RefreshTableValues.call(this);
            }
            else
                throw new Error(window.TN.TranslateKey('LookupControl.SetValue.MultiValueFormatException'));
        }
        else {
            var i, len = this.MultiValue.length;
            var valuesToDelete = new Array();
            for (i = 0; i < len; i++) {
                var singleValue = this.MultiValue[i];
                if (singleValue != null)
                    valuesToDelete.push(singleValue);
            }
            while (valuesToDelete.length > 0) {
                var singleValue = valuesToDelete.shift();
                singleValue.DeleteValue();
            }
        }
    }
    this.DisableChangeHandler = false;
    this.SaveValue();
}

function DBLookupSettings_ParseLookupValue(value) {
    if (value == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'value'));

    var lookupID = 0;
    var lookupText = null;

    var valueString = null;
    if (value != null)
        valueString = value.toString();

    var isLookupID = false;
    if (valueString != null) {
        var regNum = new RegExp('^([0-9]+)$');
        var matchNum = valueString.match(regNum);
        var isLookupID = matchNum != null;
        if (isLookupID)
            lookupID = parseInt(valueString);
    }

    if (!isLookupID) {
        lookupID = value.LookupID;
        lookupText = value.LookupText;

        //lookupID
        if (lookupID != null)
            lookupID = parseInt(lookupID.toString());
        if (lookupID == null)
            lookupID = 0;

        //lookupText
        if (lookupText != null)
            lookupText = lookupText.toString();

        //check text
        if (lookupID != null && lookupID > 0 && lookupText == null)
            lookupText = this.GetLookupText(lookupID);
    }
    else
        lookupText = this.GetLookupText(lookupID);

    if (lookupID != null && lookupID > 0 && IsNullOrEmpty(lookupText) && lookupText != lookupItemDeletedText)
        throw new Error(window.TN.TranslateKey('LookupControl.SetValue.LookupTextUndefinedException') + lookupID + '.');

    var lookupValue = null;
    if (lookupText != lookupItemDeletedText) {
        lookupValue = new Object();
        lookupValue.LookupID = lookupID;
        lookupValue.LookupText = lookupText;
    }
    return lookupValue;
}

function DBLookupControl_OnSave(saveEventArgs) {
    if (this.ListFormField != null) {
        if (this.ListFormField.Required) {
            var canSave = false;
            var isEmptyValue = true;
            if (this.Value != null) {
                if (!this.Settings.IsMultiple) {
                    if (this.Value.LookupID != 0) {
                        canSave = true;
                        isEmptyValue = false;
                    }
                }
                else {
                    if (this.Value.length > 0) {
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

function DBLookupControl_IsEmptyValue() {
    var isEmptyValue = true;
    if (this.Value != null) {
        if (!this.Settings.IsMultiple) {
            if (this.Value.LookupID != 0) {
                isEmptyValue = false;
            }

        }
        else {
            if (this.Value.length > 0) {
                isEmptyValue = false;
            }
        }
    }
    return isEmptyValue;
}
//////////////////////////////////////////////////////////////////////////////////






/////////////////////////////////DBLookupControlValue/////////////////////////////
function DBLookupControlValue(xmlElement, control) {
    if (xmlElement == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'xmlElement'));

    if (control == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'control'));

    this.XmlElement = xmlElement.cloneNode(true);
    this.Control = control;
    this.Settings = control.Settings;
    this.GetAttribute = DBLookup_GetAttribute;
    this.GetBooleanAttribute = DBLookup_GetBooleanAttribute;
    this.GetIntegerAttribute = DBLookup_GetIntegerAttribute;

    //Properties
    this.LookupID = this.GetIntegerAttribute('LookupID');
    this.LookupText = this.GetAttribute('LookupText');
    if (this.LookupText == null)
        this.LookupText = '';
    this.UrlAccessCode = this.GetAttribute('UrlAccessCode');
    this.LookupItemDispUrl = this.Control.Settings.LookupListDispFormUrl + '?ID=' + this.LookupID;
    this.LookupItemEditUrl = this.Control.Settings.LookupListEditFormUrl + '?ID=' + this.LookupID;

    //Methods
    this.CreateValueControl = DBLookupControlValue_CreateValueControl;
    this.CreateLookupLink = DBLookupControlValue_CreateLookupLink;
    this.CreateDeleteLink = DBLookupControlValue_CreateDeleteLink;
    this.CreateMoveLink = DBLookupControlValue_CreateMoveLink;
    this.Move = DBLookupControlValue_Move;
    this.DeleteValue = DBLookupControlValue_DeleteValue;
    this.ProcessDeleteHandlers = DBLookupControlValue_ProcessDeleteHandlers;

    this.Disable = DBLookupControlValue_Disable;
    this.Enable = DBLookupControlValue_Enable;
    this.SetToControlValue = DBLookupControlValue_SetToControlValue;
    this.SaveValue = DBLookupControlValue_SaveValue;
}

//устанавлвает объект значения и значение главного контрола
function DBLookupControlValue_SetToControlValue() {
    if (!this.Settings.IsMultiple) {
        this.Control.SingleValue = this;

        //обновляем табличные значения
        DBLookupControl_RefreshTableValues.call(this.Control);
    }
    else {
        this.Index = this.Control.MultiValue.length;
        this.Control.MultiValue.push(this);
    }
}

//Создает контрол одного значение и добавляет его на форму
//debugger
function DBLookupControlValue_CreateValueControl() {
    if (this.Settings.ControlMode == 'LookupWindow') {
        if (this.Settings.WindowControlMode == 'RowView') {
            if (!this.Settings.IsListControlMode) {
                if (!this.Settings.IsMultiple) {
                    var divSingleValue = window.document.createElement('div');
                    this.Control.EditControl.appendChild(divSingleValue);
                    this.ValueControl = divSingleValue;
                    var lookupLink = this.CreateLookupLink();
                    divSingleValue.appendChild(lookupLink);
                    this.DeleteValueControl = this.Control.DeleteSingleValueControl;
                }
                else {
                    var trSingleValue = this.Control.MultiValueTable.insertRow(-1);
                    this.ValueControl = trSingleValue;

                    var tdDelete = trSingleValue.insertCell(-1);
                    this.DeleteValueControl = tdDelete;
                    tdDelete.className = 'dbf_lookup_rowView_deleteCell';

                    var imgDelete = this.CreateDeleteLink();
                    tdDelete.appendChild(imgDelete);

                    if (this.Settings.EnableMultiValueReorder) {
                        var tdMoveUp = trSingleValue.insertCell(-1);
                        tdMoveUp.className = 'dbf_lookup_rowView_moveCell';
                        var imgMoveUp = this.CreateMoveLink(true);
                        tdMoveUp.appendChild(imgMoveUp);

                        var tdMoveDown = trSingleValue.insertCell(-1);
                        tdMoveDown.className = 'dbf_lookup_rowView_moveCell';
                        var imgMoveDown = this.CreateMoveLink(false);
                        tdMoveDown.appendChild(imgMoveDown);
                    }

                    var tdLookupLink = trSingleValue.insertCell(-1);
                    tdLookupLink.className = 'dbf_lookup_rowView_lookupCell';
                    var lookupLink = this.CreateLookupLink();
                    tdLookupLink.appendChild(lookupLink);
                }
            }
            else {
                this.Control.ListControl.SetValue(this);
            }
        }
        else if (this.Settings.WindowControlMode == 'TableView') {
            var currentAlternateStyle = !this.Control.IsLastRowAlternate;
            this.Control.EditControl.style.display = '';

            var trSingleValue = null;
            //tbody уже создан
            if (this.Control.EditControl.tBodies != null && this.Control.EditControl.tBodies.length > 0)
                trSingleValue = this.Control.EditControl.tBodies[0].insertRow(-1);
            else {
                var tbody = document.createElement('tbody');
                this.Control.EditControl.appendChild(tbody);
                trSingleValue = tbody.insertRow(-1);
            }
            if (this.Settings.IsMultiple) {
                if (currentAlternateStyle)
                    trSingleValue.className = 'dbl_table_cell_alternate';
            }

            this.ValueControl = trSingleValue;
            var tdActions = trSingleValue.insertCell(-1);
            this.ValueActionsControl = tdActions;
            var hasActions = !this.Settings.HideDeleteValuePicker || this.Settings.EnableMultiValueReorder;
            if (this.Settings.Disabled || this.Control.Disabled || !hasActions)
                this.ValueActionsControl.style.display = 'none';
            tdActions.className = 'dbl_table_cell dbl_table_offset';

            var divActions = document.createElement('div');

            if (this.Settings.EnableMultiValueReorder) {
                if (this.Settings.HideDeleteValuePicker)
                    divActions.className = 'dbl_table_divActions_reorder_noDelete'
                else
                    divActions.className = 'dbl_table_divActions_reorder';
            }
            else
                divActions.className = 'dbl_table_divActions';

            if (this.Settings.HideDeleteValuePicker)
                divActions.className += ' dbl_table_divActions_noDelete';

            tdActions.appendChild(divActions);

            var imgDelete = this.CreateDeleteLink();
            divActions.appendChild(imgDelete);

            //создаём контролы перемещения строк табличной секции множественной подстановки.
            if (this.Settings.EnableMultiValueReorder) {
                var imgMoveUp = this.CreateMoveLink(true);
                divActions.appendChild(imgMoveUp);

                var imgMoveDown = this.CreateMoveLink(false);
                divActions.appendChild(imgMoveDown);
            }

            var i, len = this.Settings.ItemFields.length;
            this.Cells = new Array();
            for (i = 0; i < len; i++) {
                var itemField = this.Settings.ItemFields[i];
                if (itemField.ShowInTable) {
                    var tdField = trSingleValue.insertCell(-1);

                    var divWidth = document.createElement('div');
                    tdField.appendChild(divWidth);

                    var hasWidth = false;
                    if (itemField.TableColumnWidth != null && itemField.TableColumnWidth > 0) {
                        tdField.className = 'dbl_table_colWidth';
                        tdField.style.width = itemField.TableColumnWidth + 'px';
                        divWidth.style.width = itemField.TableColumnWidth + 'px';
                    }

                    var divContent = document.createElement('div');
                    divWidth.appendChild(divContent);
                    divContent.className = 'dbl_table_offset';


                    DBLookup_AddClass(tdField, 'dbl_table_cell');
                    if (itemField.IsItemLink) {
                        var lookupLink = this.CreateLookupLink();
                        divContent.appendChild(lookupLink);
                        tdField.LookupLink = lookupLink;
                    }
                    else
                        divContent.innerHTML = 'Загрузка...';

                    this.Cells[itemField.FieldName] = tdField;
                    tdField.DivContent = divContent;
                }
            }
            this.Control.IsLastRowAlternate = currentAlternateStyle;
        }
    }
    else if (this.Settings.ControlMode == 'DropDownList') {
        if (!this.Settings.IsDropDownListControl) {
            var optLookupValue = window.document.createElement('option');
            this.Control.EditControl.appendChild(optLookupValue);
            optLookupValue.text = this.LookupText;
            optLookupValue.title = this.LookupText;
            optLookupValue.value = this.LookupID;
            optLookupValue.LookupValue = this;
            this.Control.DropDownValues[this.LookupID] = this;
        }
        else {
            this.Control.ListControl.SetValue(this);
        }
    }
    if (this.ValueControl != null) {
        this.ValueControl.ControlValue = this;

        //запускаем событие обработки создания контрола значения.
        SM.FireEvent(this.Control, 'ValueControlCreated', { LookupValue: this });
    }
}

//debugger
function DBLookup_AddClass(htmlElement, className) {
    if (htmlElement == null)
        throw new Error('Не передан параметр htmlElement');
    if (SM.IsNE(className))
        throw new Error('Не передан параметр className');

    var currentClass = htmlElement.className;
    if (!SM.IsNE(currentClass))
        currentClass += ' ' + className;
    else
        currentClass = className;

    htmlElement.className = currentClass;
}


function DBLookupControlValueDeleteEventArgs(lookupValue) {
    if (lookupValue == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'lookupValue'));
    this.LookupValue = lookupValue;
    this.CanDelete = true;
    this.CommonAlertMessage = '';
    this.ConfirmMessage = '';
    this.SingleAlertMessage = '';
}


function DBLookupControlValue_ProcessDeleteHandlers() {
    var canDelete = true;

    if (this.Control.DeleteHandlers.length > 0) {
        var commonEventArgs = new DBLookupControlValueDeleteEventArgs(this);
        commonEventArgs.CommonAlert = new String();
        var i, len = this.Control.DeleteHandlers.length;
        for (i = 0; i < len; i++) {
            var handler = this.Control.DeleteHandlers[i];
            if (handler != null) {
                var deleteEventArgs = new DBLookupControlValueDeleteEventArgs(this);
                handler(deleteEventArgs);

                var stCommonAlert = commonEventArgs.CommonAlert;

                if (!deleteEventArgs.CanDelete)
                    commonEventArgs.CanDelete = false;

                //alerts
                if (!IsNullOrEmpty(deleteEventArgs.CommonAlertMessage)) {
                    if (stCommonAlert.length > 0)
                        stCommonAlert += '\n\r';
                    stCommonAlert += deleteEventArgs.CommonAlertMessage;
                }
                if (!IsNullOrEmpty(deleteEventArgs.SingleAlertMessage))
                    window.alert(deleteEventArgs.SingleAlertMessage);

                //confirm
                if (!IsNullOrEmpty(deleteEventArgs.ConfirmMessage)) {
                    if (!window.confirm(deleteEventArgs.ConfirmMessage))
                        commonEventArgs.CanDelete = false;
                }

                commonEventArgs.CommonAlert = stCommonAlert;
            }
        }
        if (!IsNullOrEmpty(commonEventArgs.CommonAlert))
            alert(commonEventArgs.CommonAlert);

        if (!commonEventArgs.CanDelete)
            canDelete = false;
    }

    return canDelete;
}

//debugger
//удаляет значение из ХМЛ результата, удаляет значение из значения главного контрола и скрывает контрол
function DBLookupControlValue_DeleteValue() {
    if (!this.Disabled) {
        if ((this.Settings.ControlMode == 'LookupWindow' || this.Settings.ControlMode == 'DropDownList' && this.Settings.IsListControlMode && this.Settings.IsDropDownListControl) && !this.Deleted) {
            var isProgrammListControlDeleting = false;
            if (this.Control.ListControl != null) {
                if (this.Settings.IsListControlMode && !this.Control.ListControl.IsDeletingValue && this.LookupID > 0)
                    isProgrammListControlDeleting = true;
            }

            if (this.Settings.WindowControlMode == 'TableView' || isProgrammListControlDeleting) {
                var canDelete = this.ProcessDeleteHandlers();
                if (!canDelete)
                    return;
            }

            this.Deleted = true;
            if (this.ValueControl != null)
                this.ValueControl.style.display = 'none';
            if (!this.Settings.IsMultiple)
                this.Control.SingleValue = null;
            else {
                this.Control.MultiValue.splice(this.Index, 1);
                var i, len = this.Control.MultiValue.length;
                //обновляем индексы
                for (i = 0; i < len; i++) {
                    var singleValue = this.Control.MultiValue[i];
                    singleValue.Index = i;
                }
            }
            if (this.Settings.WindowControlMode == 'TableView') {
                if (!this.Settings.IsMultiple)
                    this.Control.EditControl.style.display = 'none';
                else if (this.Control.MultiValue.length == 0)
                    this.Control.EditControl.style.display = 'none';
            }
            this.XmlElement.parentNode.removeChild(this.XmlElement);
            this.Control.SaveValue();
            if (this.Settings.IsMultiple)
                this.Control.ResetRowsLayout();

            this.DefaultValueSet = false;

            if (isProgrammListControlDeleting)
                this.Control.ListControl.ClearValue(this);
        }
    }
}

//debugger
function DBLookupControlValue_SaveValue() {
    if (!this.Settings.IsMultiple) {
        if (this.Control.SingleValueNode != null) {
            if (this.Control.SingleValueNode.parentNode != null)
                this.Control.SingleValueNode.parentNode.removeChild(this.Control.SingleValueNode);
        }
        this.Control.XmlElement.appendChild(this.XmlElement);
        this.Control.SingleValueNode = this.XmlElement;
    }
    else {
        this.Control.MultiValueNode.appendChild(this.XmlElement);
    }
}

function DBLookupControlValue_Disable() {
    if (this.ValueActionsControl != null)
        this.ValueActionsControl.style.display = 'none';
}

function DBLookupControlValue_Enable() {
    if (this.ValueActionsControl != null && (!this.Settings.HideDeleteValuePicker || this.Settings.EnableMultiValueReorder))
        this.ValueActionsControl.style.display = '';
}

//создает ссылку на подстановочный элемент
function DBLookupControlValue_CreateLookupLink() {
    var lookupItemControl = null;
    if (this.Control.Settings.ShowLookupLink && this.LookupID > 0) {
        var lnkLookupItem = window.document.createElement('a');
        lnkLookupItem.className = 'dbf_lookup_link';
        /*
        if(this.Settings.IsListControlMode)
            lnkLookupItem.className = 'lc_resultLink';
        */
        $(lnkLookupItem).text(this.LookupText);
        var lookupUrl = null;
        var params = '';
        if (IsNullOrEmpty(this.Settings.ItemBackUrl)) {
            if (this.Settings.WindowControlMode != 'TableView')
                params += '&closeOnUpdate=true&closeOnCancel=true';
            else {
                var updateParams = ''
                updateParams += '?lookupID=' + this.LookupID;
                updateParams += '&controlName=' + encodeURI(this.Control.ControlName);
                var updateValueControlUrl = this.Settings.ModulePath + '/UpdateLookupValueControl.aspx' + updateParams;
                params += '&Source=' + escape(updateValueControlUrl) + '&closeOnCancel=true';
            }
        }
        else
            params += '&Source=' + encodeURI(this.Settings.ItemBackUrl);

        if (this.Control.Settings.GrantAccessViaUrl && !IsNullOrEmpty(this.UrlAccessCode))
            params += '&ac=' + this.UrlAccessCode;

        if (!this.Control.Settings.IsEditFormLookupLink) {
            lnkLookupItem.href = this.LookupItemDispUrl;
            lookupUrl = this.LookupItemDispUrl + params;
        }
        else {
            params += '&showDispFormWithoutEditAccess=true';
            lookupUrl = this.LookupItemEditUrl + params;
            lnkLookupItem.href = this.LookupItemEditUrl;
        }
        if (this.Control.Settings.IsLookupOnGroups) {
            lookupUrl = this.Control.Settings.GroupMembersUrl + '?groupID=' + this.LookupID;
            lnkLookupItem.href = lookupUrl;
        }

        lnkLookupItem.onclick = function (evt) { DBLookup_OpenWin(lookupUrl); SM.CancelEvent(evt); return false; }
        lookupItemControl = lnkLookupItem;
    }
    else {
        var lblLookupItem = window.document.createElement('span');
        lblLookupItem.className = 'dbf_lookup_lable';
        /*
        if(this.Settings.IsListControlMode)
            lblLookupItem.className = 'lc_textValueControl';
        */
        $(lblLookupItem).text(this.LookupText);
        //lblLookupItem.title = 'Элемент: ' + this.LookupID;
        lookupItemControl = lblLookupItem;
    }
    return lookupItemControl;
}

//создает ссылку на удаление подстановочного элемента
function DBLookupControlValue_CreateDeleteLink() {
    var imgDelete = window.document.createElement('img');
    if (!this.Settings.IsNewWindowDesign)
        imgDelete.src = '/_layouts/images/delete.gif';
    else
        imgDelete.src = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/ListControl/Images/clearValue.png';
    imgDelete.style.cursor = 'pointer';
    var thisObj = this;
    imgDelete.onclick = function () { thisObj.DeleteValue(); }
    return imgDelete;
}

function DBLookupControlValue_CreateMoveLink(up) {
    if (!this.Control.Settings.IsListControlMode) {
        var imgMove = window.document.createElement('img');
        if (up)
            imgMove.src = '/_layouts/images/arrupi.gif';
        else
            imgMove.src = '/_layouts/images/arrdowni.gif';
        imgMove.border = 0;
        imgMove.style.cursor = 'pointer';
        var thisObj = this;
        imgMove.onclick = function (evt) { thisObj.Move(up); return SM.CancelEvent(evt); }
        return imgMove;
    }
    else {
        var divMove = document.createElement('div');
        if (up)
            divMove.className = 'dbl_moveUp';
        else
            divMove.className = 'dbl_moveDown';
        var thisObj = this;
        divMove.onclick = function (evt) { thisObj.Move(up); return SM.CancelEvent(evt); }
        return divMove;
    }
}

//debugger
function DBLookupControlValue_Move(up) {
    if (this.Control.Disabled)
        return;
    //var tbItems = this.parentElement.parentElement;
    var currentIndex = this.Index;
    var exchangeValue = null;
    var i = currentIndex;
    if (up) {
        while (exchangeValue == null && i >= 0) {
            i--;
            if (i >= 0) {
                var upRow = this.Control.MultiValue[i];
                if (!upRow.Deleted)
                    exchangeValue = upRow;
            }
        }
    }
    else {
        var len = this.Control.MultiValue.length;
        while (exchangeValue == null && i < len) {
            i++;
            if (i < len) {
                var downRow = this.Control.MultiValue[i];
                if (!downRow.Deleted)
                    exchangeValue = downRow;
            }
        }
    }
    if (exchangeValue != null) {
        var swapX = this.ValueControl;
        if (swapX == null)
            swapX = this.SwapControl;

        var swapY = exchangeValue.ValueControl;
        if (swapY == null)
            swapY = exchangeValue.SwapControl;
        swapX.swapNode(swapY);
        DBLookup_SwapXmlNodes(this.XmlElement, exchangeValue.XmlElement);

        this.Control.MultiValue[this.Index] = exchangeValue;
        this.Control.MultiValue[exchangeValue.Index] = this;
        var tmpIndex = this.Index;
        this.Index = exchangeValue.Index;
        exchangeValue.Index = tmpIndex;

        this.Control.ResetRowsLayout();
        this.Control.SaveValue();
    }
}
//////////////////////////////////////////////////////////////////////////////////






////////////////////////Common Methods//////////////////////////////
function DBLookup_GetAttribute(attributeName) {
    return DBLookup_GetAttributeValue(this.XmlElement, attributeName);
}

function DBLookup_GetBooleanAttribute(attributeName) {
    return DBLookup_GetBooleanAttributeValue(this.XmlElement, attributeName);
}

function DBLookup_GetIntegerAttribute(attributeName) {
    return DBLookup_GetIntegerAttributeValue(this.XmlElement, attributeName);
}

//проверка строки на пусто/нул
function IsNullOrEmpty(str) {
    if (str == null) return true; if (str.toString() == '') return true; return false;
}

//получение текстового атрибута ХМЛ-элемента
function DBLookup_GetAttributeValue(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function DBLookup_GetBooleanAttributeValue(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = DBLookup_GetAttributeValue(xmlElement, attributeName);
    if (!IsNullOrEmpty(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function DBLookup_GetIntegerAttributeValue(xmlElement, attributeName) {
    var intValue = 0;
    var value = DBLookup_GetAttributeValue(xmlElement, attributeName);
    if (!IsNullOrEmpty(value))
        intValue = parseInt(value);
    return intValue;
}

var isBrowserIE8 = null;
function IsIE8() {
    if (isBrowserIE8 == null)
        isBrowserIE8 = window.navigator.appVersion.toLowerCase().indexOf('trident/4.0') != -1;
    return isBrowserIE8;
}

function DBLookup_SwapXmlNodes(x, y) {
    if (x == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'x'));
    if (y == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'y'));
    if (x.parentNode == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'x.parentNode'));
    if (y.parentNode == null)
        throw new Error(SM.SR(window.TN.TranslateKey('LookupControl.EmptyParamException'), '{ParamName}', 'y.parentNode'));

    //XML: node Y заменяется node'ом X в функции replaceChild
    var nextSibling = x.nextSibling;
    var prevSibling = x.previousSibling;

    var parentNode = x.parentNode;
    y.parentNode.replaceChild(x, y);
    //последний Y наверх
    if (nextSibling == null)
        parentNode.appendChild(y);
    //первый Y вниз
    else if (prevSibling == null)
        parentNode.insertBefore(y, parentNode.firstChild);
    else {
        //средний Y наверх
        if (nextSibling.parentNode != null)
            parentNode.insertBefore(y, nextSibling);
        //средний Y вниз
        else if (prevSibling.parentNode != null)
            parentNode.insertBefore(y, prevSibling.nextSibling);
    }
}
////////////////////////////////////////////////////////////////////