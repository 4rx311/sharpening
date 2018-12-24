function SolutionParamWindow(solutionName) {
    if (window.SolutionWindowSettingsArray == null) throw new Error("window.SolutionWindowSettingsArray = null");
    if (window.SM.IsNE(solutionName)) throw new Error("Параметр solutionName=null");
    if (window.SolutionWindowSettingsArray[solutionName] == null)
        throw new Error("Словарь window.SolutionWindowSettingsArray не содержит объекта настроек всплывающего окна для решения '" + solutionName + "'");

    var solWindowSettings = window.SolutionWindowSettingsArray[solutionName];

    this.SolutionWindowSettings = solWindowSettings;
    this.InitMethods = SW_InitMethod;
    this.InitMethods();

    this.IsEditForm = solWindowSettings.IsEditForm;
    this.CommentRequired = solWindowSettings.CommentRequired;
    this.IsCustomMarkup = solWindowSettings.IsCustomMarkup;
    this.CurrentWebUrl = solWindowSettings.CurrentWebUrl;
    this.ListID = solWindowSettings.ListID;
    this.ItemID = solWindowSettings.ItemID;
    this.SolutionID = solWindowSettings.SolutionID;

    this.FieldsContainer = window.document.getElementById('wkf_sp_tbFieldsContainer');
    if (this.IsCustomMarkup)
        this.FieldsContainer.style.display = 'none';
    this.DestinationDataContainer = window.document.getElementById('hdnDestinationData');

    this.InitFields();
    this.CustomInit = solWindowSettings.CustomInit;
    this.CustomOK = solWindowSettings.CustomOK;
    this.InitFieldsForPrevWindow = SW_InitFieldsForPrevWindow;
    if(window.SolutionWindow != null)
        this.InitFieldsForPrevWindow();
    
    this.PreviousWindow = window.SolutionWindow;
    window.SolutionWindow = this;

    if (this.CustomInit != null) {
        window.eval('window.' + this.CustomInit + '();');
    }
}

function SW_InitFieldsForPrevWindow()
{
    var i, len = this.IndexedFields.length;
    for (i = 0; i < len; i++) 
    {
        var sw = this.IndexedFields[i];
        var old_sw = window.SolutionWindow.IndexedFields[i];
        sw.OldValue = old_sw.OldValue;
    }
}

function SW_InitMethod() 
{
    this.GetAttribute = SW_GetAttribute;
    this.GetBooleanAttribute = SW_GetBooleanAttribute;
    this.InitFields = SW_InitFields;
    this.PersistData = SW_PersistData;
    this.ValidateFields = SW_ValidateFields;
}

function SW_ValidateFields()
{
    var validSuccess = true;
    var winResultError = '';
    var errorReq = '';
    var errorFormat = '';
    var i, len = this.IndexedFields.length;
    for (i = 0; i < len; i++) {
        var sw = this.IndexedFields[i];
        var checkReq = sw.CheckRequired();
        if (!checkReq) {
            if (!window.SM.IsNE(errorReq))
                errorReq += '\n';
            errorReq += '  - ' + window.TN.Translate(sw.DisplayName);
        }
        var checkFormatError = sw.CheckFormat();
        if (!window.SM.IsNE(checkFormatError)) {
            if (!window.SM.IsNE(errorFormat))
                errorFormat += '\n';
            errorFormat += window.TN.Translate(checkFormatError);
        }
    }
    if (!window.SM.IsNE(errorReq)) {
        winResultError += window.TN.Translate('Незаполнены следующие обязательные поля:') + '\n' + errorReq;
    }
    if (!window.SM.IsNE(errorFormat)) {
        if (!window.SM.IsNE(winResultError))
            winResultError += '\n\n';
        winResultError += errorFormat;
    }
    if (winResultError == '' && window.CustomValidate != null)
        winResultError = CustomValidate();

    if (!window.SM.IsNE(winResultError)) {
        if (winResultError.indexOf("Confirm:") >= 0) {
            if (window.confirm(winResultError.replace("Confirm:", "")))
                return true;
            else
                return false;
        }
        else
            window.alert(winResultError);
    }

    validSuccess = winResultError == '';
    return validSuccess;
}

function WKF_trim(str) {
    if (str == null) return str;
    return str.replace(/^\s+|\s+$/g, '');
}

function SW_InitFields() {
    this.IndexedFields = new Array();
    this.NamedFields = new Array();

    var fieldsCol = this.SolutionWindowSettings.Fields;
    var i, len = fieldsCol.length;
    for (i = 0; i < len; i++) {
        var fieldElement = fieldsCol[i];
        var solutionField = new SolutionWindowField(this, fieldElement);
        this.IndexedFields[i] = solutionField;
        this.NamedFields[solutionField.Name] = solutionField;
    }
    if (!this.IsEditForm && this.CommentRequired && !this.IsCustomMarkup) {
        var trComment = this.FieldsContainer.insertRow(this.FieldsContainer.rows.length);
        var tdHeader = trComment.insertCell(trComment.cells.length);
        tdHeader.align = 'right';
        tdHeader.className = 'wkf-sp-wssc-font';
        $(tdHeader).text(window.TN.Translate('Комментарий'));

        var tdControl = trComment.insertCell(trComment.cells.length);
        var txtComment = window.document.createElement('textarea');
        this.CommentInput = txtComment;
        tdControl.appendChild(txtComment);
    }
}

function SW_PersistData() {
    var i, len = this.IndexedFields.length;
    var axoData;
    var fieldsXml = '<DestinationFields></DestinationFields>';
    axoData = window.SM.LoadXML(fieldsXml);
    var fieldsNode = axoData.documentElement;
    var dataDocument = fieldsNode.ownerDocument;
    for (i = 0; i < len; i++) {
        var solField = this.IndexedFields[i];
        solField.SaveControlValue();
        if (!window.SM.IsNE(solField.DestinationField)) {
            var fieldElement = dataDocument.createElement('Field');
            fieldElement.setAttribute('Title', solField.DestinationField);
            fieldElement.setAttribute('Value', WKF_trim(solField.FieldValue.toString()));
            fieldsNode.appendChild(fieldElement);
        }
    }
    var persistedSuccessfully = true;

    if (this.CommentRequired && !this.IsEditForm) {
        var commentValue = this.CommentInput.value;
        if (!window.SM.IsNE(commentValue))
            fieldsNode.setAttribute('Comment', commentValue);
        else
            persistedSuccessfully = false;
    }

    if (persistedSuccessfully)
        this.DestinationDataContainer.value = window.SM.PersistXML(dataDocument);

    return persistedSuccessfully;
}

function SolutionWindowField(windowSettings, fieldElement) {
    this.SolutionWindowSettings = windowSettings;
    this.InitMethods = SWF_InitMethods;
    this.InitMethods();

    this.FieldElement = fieldElement;
    this.Name = fieldElement.Name;
    this.Type = fieldElement.Type;
    this.LookupSetting = fieldElement.LookupSetting;
    this.DefaultValue = null;
    var defValue = fieldElement.DefaultValue;
    if (!window.SM.IsNE(defValue))
        this.DefaultValue = defValue;
    this.OvverideMultiValue = fieldElement.OvverideMultiValue;
    this.DefaultValueField = fieldElement.DefaultValueField;
    this.DestinationField = fieldElement.DestinationField;
    this.DisplayName = fieldElement.DisplayName;
    this.OnChange = fieldElement.OnChange;
    this.IsRequired = fieldElement.IsRequired;
    this.CustomFormatCheck = fieldElement.CustomFormatCheck;
    this.ShowTime = fieldElement.ShowTime;
    this.CreateInputControl();
}

function SWF_InitMethods() {
    this.GetAttribute = SW_GetAttribute;
    this.GetBooleanAttribute = SW_GetBooleanAttribute;
    this.CreateInputControl = SWF_CreateInputControl;
    this.SaveControlValue = SWF_SaveControlValue;
    this.CheckRequired = SWF_CheckRequired;
    this.CheckFormat = SWF_CheckFormat;
}

function SWF_CreateInputControl()
{
    var fieldContainer = null;
    var titleContainer = null;
    if (!this.SolutionWindowSettings.IsCustomMarkup)
    {
        var trField = this.SolutionWindowSettings.FieldsContainer.insertRow(this.SolutionWindowSettings.FieldsContainer.rows.length);
        var tdHeader = trField.insertCell(trField.cells.length);
        tdHeader.align = 'right';
        tdHeader.className = 'wkf-sp-wssc-font';

        var tdControl = trField.insertCell(trField.cells.length);
        tdControl.style.width = "100%";
        fieldContainer = tdControl;
        titleContainer = tdHeader;
    }
    else
    {
        var cntID = 'cnt_' + this.Name;
        fieldContainer = window.document.getElementById(cntID);
        var titleID = 'title_' + this.Name;
        titleContainer = window.document.getElementById(titleID);
    }
    if (titleContainer != null)
        $(titleContainer).text(window.TN.Translate(this.DisplayName));

    if (fieldContainer != null)
    {
        var inputControl = null;
        var prevField = null;
        if (this.SolutionWindowSettings.PreviousWindow != null)
            prevField = this.SolutionWindowSettings.PreviousWindow.NamedFields[this.Name];

        if (this.Type == 'Text')
        {
            inputControl = window.document.createElement('input');
            inputControl.type = 'text';
            inputControl.className = 'wkf-sp-wssc-textfield';
            this.GetDefaultValue = SWF_GetDefaultValue_Text;
            this.GetControlValue = SWF_GetControlValue_Text;
            this.SetControlValue = SWF_SetControlValue_Text;
            this.GetControlDisplayValue = SWF_GetControlDisplayValue;
            fieldContainer.appendChild(inputControl);
        }
        if (this.Type == 'DateTime') 
        {
            var controlID = GenerateUniqueID('ctlDateTime_' + this.Name);
            
            var dateCtrlOptions = new Object();
            dateCtrlOptions.ShowTime = this.ShowTime;
            var dateControl = new DatePickerControl(dateCtrlOptions);

            this.DateControl = dateControl;
            //временно скрываем календарик даты
            //dateControl.Container.children[0].rows[0].cells[0].children[1].style.display = 'none';

            inputControl = dateControl.Container;
            //dateControl.DateInput.className = "wssc-datetimefield";

            this.GetDefaultValue = SWF_GetDefaultValue_DateTime;
            this.GetControlValue = SWF_GetControlValue_DateTime;
            this.SetControlValue = SWF_SetControlValue_DateTime;
            this.GetControlDisplayValue = SWF_GetControlDisplayValue;

            dateControl.Field = this;
            fieldContainer.appendChild(inputControl);
        }
        if (this.Type == 'Number') {
            var textControl = new TextControl({
                Type: 'Number',
                AllowNegativeValues: true,
                DefaultText: '',
                ControlWidth: (this.Width > 0) ? this.Width : 180
            });

            if (!SM.IsNE(this.DestinationField)) {
                var destinationFldName = this.DestinationField.replace('{', '').replace('}', '');
                var destinationFld = ListForm.GetField(destinationFldName);
                if (destinationFld != null && destinationFld.TypedField != null) {
                    textControl.SetNumberOfDecimals(destinationFld.TypedField.NumberOfDecimals);

                    if (destinationFld.TypedField.TextControl != null)
                        textControl.AllowNegativeValues = destinationFld.TypedField.TextControl.AllowNegativeValues;
                }
            }

            inputControl = textControl.TextInput;
            //inputControl.className += ' wkf-sp-wssc-textfield';

            this.GetDefaultValue = SWF_GetDefaultValue_Text;
            this.GetControlValue = SWF_GetControlValue_Text;
            this.SetControlValue = SWF_SetControlValue_Text;
            this.GetControlDisplayValue = SWF_GetControlDisplayValue;

            fieldContainer.appendChild(textControl.Container);
        }
        if (this.Type == 'Boolean')
        {
            inputControl = window.document.createElement('input');
            inputControl.type = 'checkbox';
            this.GetDefaultValue = SWF_GetDefaultValue_Boolean;
            this.GetControlValue = SWF_GetControlValue_Boolean;
            this.SetControlValue = SWF_SetControlValue_Boolean;
            this.GetControlDisplayValue = SWF_GetControlDisplayValue;

            fieldContainer.appendChild(inputControl);
        }
        if (this.Type.indexOf('Lookup') != -1)
        {

            //всплывающее окно по настройке
            inputControl = new DBLookupControl(this.LookupSetting, this.LookupSetting);

            this.GetDefaultValue = SWF_GetDefaultValue_ExtLookup;
            this.GetControlValue = SWF_GetControlValue_ExtLookup;
            this.SetControlValue = SWF_SetControlValue_ExtLookup;
            this.GetControlDisplayValue = SWF_GetControlDisplayValue_ExtLookup;

            fieldContainer.appendChild(inputControl.Container);
        }

        this.InputControl = inputControl;


        inputControl.id = this.Name;
        inputControl.Field = this;

        //установка значения по умолчанию
        if (prevField == null) {
            if (this.SolutionWindowSettings.IsEditForm && !window.SM.IsNE(this.DefaultValueField))
                this.DefaultValue = this.GetDefaultValue();
            if (this.DefaultValue != null)
                this.SetControlValue(this.DefaultValue);
        }
        else
            this.SetControlValue(prevField.FieldValue);

        //добавление обработчиков на изменение
        if (!window.SM.IsNE(this.OnChange))
            inputControl.onchange = SWF_OnChange;

        if (this.DateControl != null && !window.SM.IsNE(this.OnChange))
            this.DateControl.AddChangeHandler(SWF_OnChange);
    }
}

function SWF_CheckFormat() {
    var resultError = '';
    var formatSuccess = true;
    var controlValue = this.GetControlValue();
    if (!window.SM.IsNE(controlValue)) {
        switch (this.Type) {
            case 'Text':
                break;
            case 'DateTime':
                formatSuccess = this.DateControl.CheckDateTime(controlValue);
                if (!formatSuccess)
                    resultError = window.TN.Translate('Неправильный формат даты в поле') + ' "' + window.TN.Translate(this.DisplayName) + '".';
                break;
            case 'Boolean':
                break;
            //case 'WSSC_ExtendedLookupSingle': 
            //break; 
        }
        if (formatSuccess && !window.SM.IsNE(this.CustomFormatCheck)) {
            var funcObject = window.eval('window.' + this.CustomFormatCheck);
            if (funcObject == null)
            {
                alert("На странице отсутсвует функция '" + this.CustomFormatCheck + "'");
                throw Error("На странице отсутсвует функция '" + this.CustomFormatCheck + "'");
            }
            resultError = funcObject(controlValue);
            window.CustomFormatCheckResultError = resultError;
        }
    }
    return resultError;
}

function SWF_CheckRequired() {
    var requiredSuccess = true;
    if (this.IsRequired) {
        var controlValue = this.GetControlValue();
        switch (this.Type) {
            case 'Text':
                requiredSuccess = !window.SM.IsNE(controlValue);
                break;
            case 'DateTime':
                requiredSuccess = !window.SM.IsNE(controlValue);
                break;
            case 'Boolean':
                break;
        }
        if (this.Type.indexOf('WSSC_ExtendedLookupSingle') != -1)
            requiredSuccess = !window.SM.IsNE(controlValue);
    }
    return requiredSuccess;
}

function SWF_OnChange(control) 
{
   
    var field = control.Field;
    if (!window.SM.IsNE(field.OnChange))
        window.eval(field.OnChange);
}

function SWF_SaveControlValue() {
    this.FieldValue = this.GetControlValue();
    this.FieldDisplayValue = this.GetControlDisplayValue();
}

function SWF_GetControlDisplayValue() {
    return this.GetControlValue();
}

///Text///
function SWF_GetDefaultValue_Text() {
    var defaultValue = null;
    var defaultFieldFieldObj = window.ListForm.GetField(this.DefaultValueField);
    if (defaultFieldFieldObj != null)
        defaultValue = defaultFieldFieldObj.GetValue();
    return defaultValue;
}

function SWF_GetControlValue_Text() {
    var controlValue = this.InputControl.value;
    return controlValue;
}

function SWF_SetControlValue_Text(value) {
    if (value == null)
        value = '';
    this.InputControl.value = value;
}

///DateTime///
function SWF_GetDefaultValue_DateTime() {
    var defaultValue = null;
    var defaultValueField = window.ListForm.GetField(this.DefaultValueField);
    if (defaultValueField != null)
        defaultValue = defaultValueField.GetValue();
    return defaultValue;
}

function SWF_AddZero(val) {
    if (val == null) return val;
    if (val.length == 1) return "0" + val;
    return val;
}

function SWF_GetControlValue_DateTime() {
    if (this.ShowTime) {
        return this.DateControl.GetDateTime();
    }
    else {
        return this.DateControl.GetDate();
    }
}

function SWF_SetControlValue_DateTime(value) {
    if (value == null)
        value = '';
    if (this.ShowTime) {
        //this.DateControl.SetDate(value);
        this.DateControl.SetDateTime(value);
    }
    else {
        this.DateControl.SetDate(value);
    }
}

///Boolean///
function SWF_GetDefaultValue_Boolean() {
    var defaultValue = null;
    var defaultValueField = window.ListForm.GetField(this.DefaultValueField);
    if (defaultValueField != null)
        defaultValue = defaultValueField.GetValue();
    return defaultValue;
}

function SWF_GetControlValue_Boolean() {
    var controlValue = this.InputControl.checked;
    return controlValue;
}

function SWF_SetControlValue_Boolean(value) {
    if (value == 'true')
        value = true;
    if (value == 'false')
        value = false;
    if (value == null)
        value = false;
    this.InputControl.checked = value;
}

///ExtLookup///
function SWF_GetDefaultValue_ExtLookup() {
    var defaultValue = null;
    var defaultValueControl = window.GetExtendedLookupControlByDisplayName(this.DefaultValueField);
    if (defaultValueControl != null) {
        var lookupValue = defaultValueControl.ControlValue;
        if (lookupValue != null)
            defaultValue = lookupValue.LookupID;
    }
    return defaultValue;
}

function SWF_GetControlValue_ExtLookup() {
    var controlValue = this.InputControl.Value;
    return controlValue;
}

function SWF_GetControlDisplayValue_ExtLookup() {
    var controlDisplayValue = this.InputControl.Container.textContent;
    return controlDisplayValue;
}

function SWF_SetControlValue_ExtLookup(value) {
    var i, len = this.InputControl.options.length;
    var selectedIndex = -1;
    for (i = 0; i < len; i++) {
        var option = this.InputControl.options[i];
        if (option.value == value)
            selectedIndex = i;
    }
    if (selectedIndex > -1)
        this.InputControl.selectedIndex = selectedIndex;
}


function SW_GetAttribute(attributeName) {
    return SW_GetAttributeValueInner(this.XmlElement, attributeName);
}

function SW_GetBooleanAttribute(attributeName) {
    return SW_GetBooleanAttributeValueInner(this.XmlElement, attributeName);
}

//получение текстового атрибута ХМЛ-элемента
function SW_GetAttributeValueInner(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!window.SM.IsNE(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function SW_GetBooleanAttributeValueInner(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = SW_GetAttributeValueInner(xmlElement, attributeName);
    if (!window.SM.IsNE(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
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

function OnCancelClick() 
{
    window.SolutionWindow = null;
    SLFieldInstance.SetParamsFromFloatWindow = false;
    SLFieldInstance.SaveFormAfterCloseFloatWindow = true;
    SLFieldInstance.WaitSelectWindow = false;
    SLFieldInstance.SelectedSolution = null;
    SLFieldInstance.LastSolution = null;
    window.HidePopupWindow();
}

function OnOKClick() 
{
    var solWindow = window.SolutionWindow;
    var validSucces = solWindow.ValidateFields();

    if (validSucces) 
    {
        if (solWindow.CustomOK != null) 
        {
            window.eval('window.' + solWindow.CustomOK + '();');
        }
        if (window.SolutionWindow.IsEditForm) {
            var i, len = window.SolutionWindow.IndexedFields.length;
            for (i = 0; i < len; i++) {
                var solField = window.SolutionWindow.IndexedFields[i];
                solField.SaveControlValue();
                var WSSC_SolTooltip = '';
                if (solField.DestinationField != null && solField.DestinationField != "")
                    WSSC_SolTooltip += solField.DestinationField.replace('{', '').replace('}', '') + " - " + solField.FieldDisplayValue + "~";
            }

            SLFieldInstance.SolTooltip = WSSC_SolTooltip;
            SLFieldInstance.SetParamsFromFloatWindow = true;
            window.HidePopupWindow();
            SLFieldInstance.RestoreLastSolution();

            if (window.SLFieldInstance.SaveFormAfterCloseFloatWindow)
                ListForm.Update();

        }

    }
}


function OnSolutionWindowLoad(centerPosition, noChangeWidth) 
{
    var popupWindow = GetPopupWindow();
    var ppContentDiv = popupWindow.ContentDiv;
    var popupWindowWidth = ppContentDiv.offsetWidth;

    var tpContainer = document.getElementById('wkf_sp_top_left');
    var btContainer = document.getElementById('wkf_sp_bottom_left');
    var midDiv = window.document.getElementById('wkf_sp_divMid');

    if (!noChangeWidth)
    {
        tpContainer.style.width = popupWindowWidth + 'px';
        btContainer.style.width = popupWindowWidth + 'px';
        midDiv.style.width = (popupWindowWidth + 3) + 'px';
    }

    var midDivOffsetHeight = midDiv.offsetHeight;
    var buttonsTbl = document.getElementById('wkf_sp_buttons');
    var newHeight = midDivOffsetHeight + 10 + buttonsTbl.offsetHeight;
    ppContentDiv.style.height = newHeight + 'px';
    if (centerPosition) popupWindow.CenterPosition(true);

    /*var divFieldsScope = window.document.getElementById('wkf_sp_divFieldsScope');
    var divMain = window.document.getElementById('wkf_sp_divMain');
    var outerDiv = window.document.getElementById('wkf_sp_outerDiv');
    var offsetHeight = 36;
    if (!window.SM.IsIE) offsetHeight = 46;
    var offsetWidth = 0;
    if(!window.SM.IsIE) offsetWidth = 3;//24
    if(offsetWidthParam != null) offsetWidth = offsetWidthParam;
    
    var parentContainer = divMain.parentElement;
    parentContainer.style.width = divMain.offsetWidth + 'px';
    var tpContainer = window.document.getElementById('wkf_sp_top_left');
    var btContainer = window.document.getElementById('wkf_sp_bottom_left');
    var midDiv = window.document.getElementById('wkf_sp_divMid');
    
    var additionOffset = 5;
    var additionOffsetMidDiv = 4;
    if(doNotResize)
        {additionOffset = 0; additionOffsetMidDiv = 0;}
    
    tpContainer.style.width = (divMain.offsetWidth - offsetWidth - additionOffset) + 'px';
    btContainer.style.width = (divMain.offsetWidth - offsetWidth - additionOffset) + 'px';
    midDiv.style.width = (midDiv.offsetWidth - offsetWidth - additionOffsetMidDiv) + 'px';
    var height = outerDiv.offsetHeight;
    if (!window.SM.IsIE) height = midDiv.offsetHeight;
    popupWindow.ContentDiv.style.height = (height + offsetHeight) + 'px';*/

}