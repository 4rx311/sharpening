//debugger
function NFField(pnlContainerID, hdnFormValueID, valueXml) {
    this.IsLoading = true;

    this.ControlContainer = window.document.getElementById(pnlContainerID);
    this.HiddenFormValue = window.document.getElementById(hdnFormValueID);
    this.ValueDocument = SM.LoadXML(valueXml);

    //Methods
    this.GetAttribute = NF_GetAttribute;
    this.GetBooleanAttribute = NF_GetBooleanAttribute;
    this.Disable = NF_Disable;
    this.Enable = NF_Enable;
    this.IsEmpty = NF_IsEmpty;
    this.OnSave = NF_OnSave;
    this.CreateFieldControl = NF_CreateFieldControl;
    this.SetLookupIDs = NF_SetLookupIDs;

    this.SetEmployees = NF_SetEmployees;
    this.SetGroups = NF_SetGroups;
    this.SetAddresses = NF_SetAddresses;

    this.ClearLookupValues = NF_ClearLookupValues;
    this.ClearEmployees = NF_ClearEmployees;
    this.ClearGroups = NF_ClearGroups;
    this.ClearAddresses = NF_ClearAddresses;

    this.UpdateValuesCount = NF_UpdateValuesCount;
    this.IsEmptyValue = NF_IsEmptyValue;

    //Properties
    this.ValueElement = this.ValueDocument.selectSingleNode('Value');

    if (this.WebUrl == null)
        this.WebUrl = '';

    if (window.SM.IsNE(this.WindowWidth) || this.WindowWidth == '0')
        this.WindowWidth = '600';

    if (window.SM.IsNE(this.WindowHeight) || this.WindowHeight == '0')
        this.WindowHeight = '670';

    //Initialisation
    this.FieldValue = new NFFieldValue(this.ValueElement, this);

    this.CreateFieldControl();
    this.UpdateValuesCount();
    this.FieldValue.Persist(true);

    NF_AddFieldToCollection(this);

    if (!this.IsEditMode)
        this.Disable();

    this.IsLoading = false;
}

function NF_OnSave(saveEventArgs) {
    if (this.ListFormField != null) {
        if (this.ListFormField.Required) {
            var isEmptyValue = this.IsEmpty();
            saveEventArgs.CanSave = !isEmptyValue;
            saveEventArgs.IsEmptyValue = isEmptyValue;
        }
    }
}

function NF_IsEmptyValue() {
    var isEmptyValue = this.IsEmpty();
    return isEmptyValue;
}

//debugger
function NF_CreateFieldControl() {
    var tbControl = window.document.createElement('table');
    this.ControlContainer.appendChild(tbControl);
    tbControl.border = 0;
    tbControl.cellPadding = 0;
    tbControl.cellSpacing = 0;

    var trControl = tbControl.insertRow(-1);

    var tdEdit = trControl.insertCell(-1);
    //tdEdit.style.paddingRight = '30px';
    this.EditCell = tdEdit;

    var linkOpenEdit = window.document.createElement('a');
    tdEdit.appendChild(linkOpenEdit);
    linkOpenEdit.className = 'nf_link';
    linkOpenEdit.href = 'javascript:';
    if (!this.IsNewWindowDesign)
        linkOpenEdit.innerHTML = window.TN.TranslateKey('NFField.Notify');
    else
        linkOpenEdit.innerHTML = window.TN.TranslateKey('NFField.AddressatsChoice');
    var thisObj = this;
    linkOpenEdit.onclick = function () { NF_OpenEditWindow(thisObj); }
    this.OpenEditLink = linkOpenEdit;

    var tdEditCount = trControl.insertCell(-1);
    this.EditCountCell = tdEditCount;
    tdEditCount.className = 'nf_countCell';
    tdEditCount.style.paddingRight = '30px';

    var tdView = trControl.insertCell(-1);
    var linkOpenView = window.document.createElement('a');
    tdView.appendChild(linkOpenView);
    linkOpenView.className = 'nf_link';
    linkOpenView.href = 'javascript:';
    if (!this.IsNewWindowDesign)
        linkOpenView.innerHTML = window.TN.TranslateKey('NFField.ShowNotified');
    else
        linkOpenView.innerHTML = window.TN.TranslateKey('NFField.Notified');
    var thisObj = this;
    linkOpenView.onclick = function () { NF_OpenViewWindow(thisObj, true); }
    this.OpenViewLink = linkOpenView;

    var tdViewCount = trControl.insertCell(-1);
    this.ViewCountCell = tdViewCount;
    tdViewCount.className = 'nf_countCell';
}

//debugger
function NF_UpdateValuesCount() {
    if (this.FieldValue != null) {
        var employeesCount = NF_GetChildNodesCount(this.FieldValue.EmployeesElement);
        var groupsCount = NF_GetChildNodesCount(this.FieldValue.GroupsElement);
        var addressesCount = NF_GetChildNodesCount(this.FieldValue.AddressesElement);
        var directAddressatsCount = 0;
        var addrText = SM.IsIE ? this.FieldValue.DirectAddressatsElement.text : this.FieldValue.DirectAddressatsElement.textContent;
        if (!window.SM.IsNE(addrText))
            directAddressatsCount = addrText.split(';').length;
        var editCount = employeesCount + groupsCount + addressesCount + directAddressatsCount;
        this.EditCountCell.innerHTML = '(' + editCount + ')';

        var employeesNotifiedCount = NF_GetChildNodesCount(this.FieldValue.EmployeesNotifiedElement)
        var groupsNotifiedCount = NF_GetChildNodesCount(this.FieldValue.GroupsNotifiedElement);
        var addressesNotifiedCount = NF_GetChildNodesCount(this.FieldValue.AddressesNotifiedElement);
        var directAddressatsNotifiedCount = 0;
        var addrNotifText = SM.IsIE ? this.FieldValue.DirectAddressatsNotifiedElement.text : this.FieldValue.DirectAddressatsNotifiedElement.textContent;
        if (!window.SM.IsNE(addrNotifText))
            directAddressatsNotifiedCount = addrNotifText.split(';').length;
        var viewCount = employeesNotifiedCount + groupsNotifiedCount + addressesNotifiedCount + directAddressatsNotifiedCount;
        this.ViewCountCell.innerHTML = '(' + viewCount + ')';
    }
}

function NF_GetChildNodesCount(node) {
    var childCount = 0;
    if (node != null)
        childCount = node.selectNodes('Item').length;
    return childCount;
}

function NF_OpenEditWindow(field) {
    if (field.IsEditMode && !field.Disabled) {

        var empIDs = field.FieldValue.GetEmployeesIDs();
        var groupsIDs = field.FieldValue.GetGroupsIDs();
        var addressesIDs = field.FieldValue.GetAddressesIDs();

        var directAddressats = ''
        if (field.FieldValue.DirectAddressatsElement != null) {
            if (SM.IsIE)
                directAddressats = field.FieldValue.DirectAddressatsElement.text;
            else
                directAddressats = field.FieldValue.DirectAddressatsElement.textContent;
        }

        var url = new String();
        var params = '?listID=' + field.ListID;
        params += '&fieldID=' + field.FieldID;
        params += '&employeesIDs=' + empIDs;
        params += '&groupsIDs=' + groupsIDs;
        params += '&addressesIDs=' + addressesIDs;
        params += '&directAddressats=' + encodeURIComponent(directAddressats);

        //добавляем идентификаторы формы для корректной инициализации настройки фильтра подстановки "Проставить значение из:"
        if (this.ListForm != null) {
            if (!SM.IsNE(this.ListForm.ItemID))
                params += '&listFormItemID=' + this.ListForm.ItemID.toString();
            if (!SM.IsNE(this.ListForm.ListID))
                params += '&listFormListID=' + this.ListForm.ListID.toString();
            if (!SM.IsNE(this.ListForm.WebID))
                params += '&listFormWebID=' + this.ListForm.WebID.toString();
        }

        var pageName = !field.IsNewWindowDesign ? 'NFEditWindow.aspx' : 'NFEditWindow.v2.aspx';
        url = url.concat(field.WebUrl + field.ModulePath, '/' + pageName, params);
        var winTitle = 'Выбор';

        if (field.IsNewWindowDesign)
            window.OpenPopupWindow(url, field.WindowWidth, field.WindowHeight, '19px 16px 10px 16px !important', null, true);
        else
            OpenFloatWindow(url, winTitle, field.WindowWidth, field.WindowHeight);
    }
    /*
    else
    {
        NF_OpenViewWindow(field, false);
    }
    */
}

//debugger
function NF_OpenViewWindow(field, isNotified) {
    var url = new String();
    var params = '?listID=' + field.ListID;
    params += '&fieldID=' + field.FieldID;
    params += '&isNotified=' + isNotified.toString().toLowerCase();
    params += '&isNewWindowDesign=' + field.IsNewWindowDesign;
    params = encodeURI(params);
    var pageName = !field.IsNewWindowDesign ? 'NFViewWindow.aspx' : 'NFViewWindow.v2.aspx';
    url = url.concat(field.WebUrl + field.ModulePath, '/' + pageName, params);
    var winTitle = 'Кому разослано';
    if (!isNotified)
        winTitle = 'Разослать';
    if (field.IsNewWindowDesign)
        window.OpenPopupWindow(url, 500, 102, '19px 16px 10px 16px !important', null, true);
    else
        OpenFloatWindow(url, winTitle, 500, 150);
}

var NF_fieldsByTitle = null;
var NF_fieldsByID = null;
function NF_AddFieldToCollection(field) {
    if (NF_fieldsByTitle == null)
        NF_fieldsByTitle = new Array();
    if (NF_fieldsByID == null)
        NF_fieldsByID = new Array();
    NF_fieldsByTitle[field.FieldTitle] = field;
    NF_fieldsByID[field.FieldID] = field;
}

function GetNotificationField(fieldTitle) {
    var field = null;
    if (NF_fieldsByTitle != null)
        field = NF_fieldsByTitle[fieldTitle];
    return field;
}

function DisableNotificationField(fieldTitle) {
    var field = GetNotificationField(fieldTitle);
    if (field != null)
        field.Disable();
}

function IsEmptyNotificationField(fieldTitle) {
    var isEmpty = true;
    var field = GetNotificationField(fieldTitle);
    if (field != null)
        isEmpty = field.IsEmpty();
    return isEmpty;
}

function GetNotificationFieldByID(fieldID) {
    var field = null;
    if (NF_fieldsByID != null)
        field = NF_fieldsByID[fieldID];
    return field;
}

function NF_SetEmployees(lookupIDs) {
    this.SetLookupIDs(lookupIDs, 'employees');
}

function NF_SetGroups(lookupIDs) {
    this.SetLookupIDs(lookupIDs, 'groups');
}

function NF_SetAddresses(lookupIDs) {
    this.SetLookupIDs(lookupIDs, 'addresses');
}

function NF_SetLookupIDs(lookupIDs, lookupName) {
    if (lookupIDs != null) {
        if (lookupIDs.length > 0) {
            var i, len = lookupIDs.length;
            var rgNum = new RegExp('^([0-9]+)$');
            var valueChanged = false;
            for (i = 0; i < len; i++) {
                var lookupID = lookupIDs[i];
                if (!window.SM.IsNE(lookupID)) {
                    if (rgNum.test(lookupID)) {
                        var collectionElement = null;
                        if (lookupName == 'employees')
                            collectionElement = this.FieldValue.EmployeesElement;
                        else if (lookupName == 'groups')
                            collectionElement = this.FieldValue.GroupsElement;
                        else if (lookupName == 'addresses')
                            collectionElement = this.FieldValue.AddressesElement;
                        var existingNode = collectionElement.selectSingleNode('Item[@LookupID="' + lookupID + '"]');
                        if (existingNode == null) {
                            var valueNode = this.ValueDocument.createElement('Item');
                            collectionElement.appendChild(valueNode);
                            valueNode.setAttribute('LookupID', lookupID);
                            valueNode.setAttribute('LookupText', '');
                            valueChanged = true;
                        }
                    }
                }
            }
            if (valueChanged)
                this.FieldValue.Persist();
        }
    }
}

function NF_ClearEmployees() {
    this.ClearLookupValues('employees');
}

function NF_ClearGroups() {
    this.ClearLookupValues('groups');
}

function NF_ClearAddresses() {
    this.ClearLookupValues('addresses');
}

function NF_ClearLookupValues(lookupName) {
    if (lookupName == 'employees')
        ClearChildNodes(this.FieldValue.EmployeesElement);
    else if (lookupName == 'groups')
        ClearChildNodes(this.FieldValue.GroupsElement);
    else if (lookupName == 'addresses')
        ClearChildNodes(this.FieldValue.AddressesElement);

    this.FieldValue.Persist();
}

//debugger
function NF_ReturnSelectResult(fieldID, employeesXml, groupsXml, addressesXml, directAddressats) {
    var field = GetNotificationFieldByID(fieldID);
    if (field != null) {
        var isEmpsXml = false;
        if (employeesXml != null) {
            if (employeesXml.ownerDocument != null)
                isEmpsXml = true;
        }
        else
            isEmpsXml = true;

        if (isEmpsXml) {
            ClearChildNodes(field.FieldValue.EmployeesElement);
            if (employeesXml != null)
                NF_FillValueXml(employeesXml, field.FieldValue.EmployeesElement);
        }

        var isGroupsXml = false;
        if (groupsXml != null) {
            if (groupsXml.ownerDocument != null)
                isGroupsXml = true;
        }
        else
            isGroupsXml = true;

        if (isGroupsXml) {
            ClearChildNodes(field.FieldValue.GroupsElement);
            if (groupsXml != null)
                NF_FillValueXml(groupsXml, field.FieldValue.GroupsElement);
        }

        var isAddressesXml = false;
        if (addressesXml != null) {
            if (addressesXml.ownerDocument != null)
                isAddressesXml = true;
        }
        else
            isAddressesXml = true;

        if (isAddressesXml) {
            ClearChildNodes(field.FieldValue.AddressesElement);
            if (addressesXml != null)
                NF_FillValueXml(addressesXml, field.FieldValue.AddressesElement);
        }

        if (directAddressats == null)
            directAddressats = '';
        if (SM.IsIE)
            field.FieldValue.DirectAddressatsElement.text = directAddressats;
        else
            field.FieldValue.DirectAddressatsElement.textContent = directAddressats;
        field.UpdateValuesCount();
        field.FieldValue.Persist();
    }
}

//debugger
function NF_FillValueXml(resultXml, collectionElement) {
    var resultNodes = resultXml.selectNodes('LookupValue');
    var i, len = resultNodes.length;
    for (i = 0; i < len; i++) {
        var resultNode = resultNodes[i]
        var itemID = GetAttributeValue(resultNode, 'LookupID');
        var title = GetAttributeValue(resultNode, 'LookupText');
        if (!window.SM.IsNE(itemID)) {
            var itemNode = collectionElement.ownerDocument.createElement('Item');
            itemNode.setAttribute('LookupID', itemID);
            itemNode.setAttribute('LookupText', title);
            collectionElement.appendChild(itemNode);
        }
    }
}

function NF_ClearValue(field) {
    if (!field.IsMultiple) {
        if (field.Value.SingleValueElement != null) {
            field.Value.SingleValueElement = null;
            field.Value.SingleValue = null;
            ClearChildNodes(field.Value.LookupItemsElement);
            if (field.EditControl.lastChild != null)
                field.EditControl.lastChild.style.display = 'none';
        }
    }
}


function NF_Disable() {
    this.Disabled = true;
    this.EditCell.style.display = 'none';
    if (this.EditCountCell != null)
        this.EditCountCell.style.display = 'none';
}

function NF_Enable() {
    this.Disabled = false;
    this.EditCell.style.display = '';
    if (this.EditCountCell != null)
        this.EditCountCell.style.display = '';
}

function NF_IsEmpty() {
    var addrText = SM.IsIE ? this.FieldValue.DirectAddressatsElement.text : this.FieldValue.DirectAddressatsElement.textContent;
    var isEmpty =
        this.FieldValue.EmployeesElement.childNodes.length == 0 &&
        this.FieldValue.GroupsElement.childNodes.length == 0 &&
        this.FieldValue.AddressesElement.childNodes.length == 0 &&
        window.SM.IsNE(addrText);
    return isEmpty;
}

/////////////////////END///////////////////////






////////////////////NFFieldValue - Methods//////////////////////

function NFFieldValue(xmlElement, field) {
    this.Field = field;
    this.XmlElement = xmlElement;

    //Methods
    this.GetAttribute = NF_GetAttribute;
    this.GetBooleanAttribute = NF_GetBooleanAttribute;
    this.GetItemsRequestString = NFFieldValue_GetItemsRequestString;

    this.GetEmployeesIDs = NFFieldValue_GetEmployeesIDs;
    this.GetGroupsIDs = NFFieldValue_GetGroupsIDs;
    this.GetAddressesIDs = NFFieldValue_GetAddressesIDs;

    this.Persist = NFFieldValue_Persist;

    //Properties
    this.DirectAddressatsElement = this.XmlElement.selectSingleNode('DirectAddressats');
    if (this.DirectAddressatsElement == null) {
        this.DirectAddressatsElement = this.XmlElement.ownerDocument.createElement('DirectAddressats');
        this.XmlElement.appendChild(this.DirectAddressatsElement);
    }

    this.DirectAddressatsNotifiedElement = this.XmlElement.selectSingleNode('DirectAddressatsNotified');
    if (this.DirectAddressatsNotifiedElement == null) {
        this.DirectAddressatsNotifiedElement = this.XmlElement.ownerDocument.createElement('DirectAddressatsNotified');
        this.XmlElement.appendChild(this.DirectAddressatsNotifiedElement);
    }

    this.EmployeesElement = this.XmlElement.selectSingleNode('Employees');
    this.EmployeesNotifiedElement = this.XmlElement.selectSingleNode('EmployeesNotified');
    this.GroupsElement = this.XmlElement.selectSingleNode('Groups');
    this.GroupsNotifiedElement = this.XmlElement.selectSingleNode('GroupsNotified');
    this.AddressesElement = this.XmlElement.selectSingleNode('Addresses');
    this.AddressesNotifiedElement = this.XmlElement.selectSingleNode('AddressesNotified');
}

function NFFieldValue_GetEmployeesIDs() {
    return this.GetItemsRequestString(this.EmployeesElement);
}

function NFFieldValue_GetGroupsIDs() {
    return this.GetItemsRequestString(this.GroupsElement);
}

function NFFieldValue_GetAddressesIDs() {
    return this.GetItemsRequestString(this.AddressesElement);
}

function NFFieldValue_GetItemsRequestString(itemsElement) {
    var resultString = '';
    if (itemsElement != null) {
        var stItems = '';
        var itemNodes = itemsElement.selectNodes('Item');
        var i, len = itemNodes.length;
        for (i = 0; i < len; i++) {
            var itemNode = itemNodes[i];
            var lookupID = GetAttributeValue(itemNode, 'LookupID');
            if (!window.SM.IsNE(lookupID)) {
                if (stItems.length > 0)
                    stItems += ',';
                stItems += lookupID;
            }
        }
        if (stItems.length > 0)
            resultString = stItems;
    }
    return resultString;
}

function NFFieldValue_Persist(isLoading) {
    this.Field.HiddenFormValue.value = SM.PersistXML(this.XmlElement);

    //инициируем событие изменения значения поля.
    if (!isLoading && this.Field.ListFormField != null)
        this.Field.ListFormField.OnChange();
}
/////////////////////////////////////////////////////////////////





///////////////////NFFieldValueItem////////////////////

function NFFieldValueItem(xmlElement, value) {
    this.Value = value;
    this.Field = value.Field;
    this.XmlElement = xmlElement;

    //Methods
    this.GetAttribute = NF_GetAttribute;
    this.GetBooleanAttribute = NF_GetBooleanAttribute;
    this.CreateLookupLink = NF_CreateLookupLink;

    //Properties
    this.LookupID = this.GetAttribute('LookupID');
    this.LookupText = this.GetAttribute('LookupText');

    //Initialisation

}

/////////////////////END///////////////////////





///////////////Common Methods//////////////////////
function NF_GetAttribute(attributeName) {
    return GetAttributeValue(this.XmlElement, attributeName);
}

function NF_GetBooleanAttribute(attributeName) {
    return GetBooleanAttributeValue(this.XmlElement, attributeName);
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

function ClearChildNodes(xmlElement) {
    if (xmlElement != null) {
        while (xmlElement.firstChild != null)
            xmlElement.removeChild(xmlElement.firstChild);
    }
}