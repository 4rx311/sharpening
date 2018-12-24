function DBFieldBoolean(valueControlID, settings, hiddenID) {
    this.ValueControl = window.document.getElementById(valueControlID);
    this.HiddenInput = window.document.getElementById(hiddenID);

    //Properties
    this.IsChange = false;
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.IsEditForm = this.ControlMode == 'Edit';

    //Interface
    this.OnInit = DBFieldBoolean_OnInit;
    this.OnSave = DBFieldBoolean_OnSave;
    this.Disable = DBFieldBoolean_Disable;
    this.Enable = DBFieldBoolean_Enable;
    this.GetValue = DBFieldBoolean_GetValue;
    this.SetValue = DBFieldBoolean_SetValue;
    this.ShowInformer = DBFieldBoolean_ShowInformer;
    this.InitValue = DBFieldBoolean_InitFieldValue;
    this.IsChanged = DBFieldBoolean_IsChanged;
    this.IsEmptyValue = DBFieldBoolean_IsEmptyValue;

    //Methods
    this.Init = DBFieldBoolean_Init;

    //Initialization
    this.Init();
    //Init Value
    this.InitValue();
}

//Init
function DBFieldBoolean_Init() {
    if (window.DBFieldBooleanCollection == null)
        window.DBFieldBooleanCollection = new Array();
    if (!window.SM.IsNullOrEmpty(this.FieldName))
        window.DBFieldBooleanCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldBoolean_GetField(fieldName) {
    var field = null;
    if (window.DBFieldBooleanCollection != null && !window.SM.IsNullOrEmpty(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldBooleanCollection[fieldName];
    }
    return field;
}

function DBFieldBoolean_IsChanged() {
    return this.IsChange;
}

//Interface
function DBFieldBoolean_OnInit() {
    //Handlers
    if (this.ValueControl != null) {
        var objRef = this;
        this.ValueControl.onclick = function() { objRef.IsChange = true; objRef.InitValue(); objRef.ListFormField.OnChange(); }
    }
}

function DBFieldBoolean_OnSave(saveEventArgs) {
}

function DBFieldBoolean_Disable() {
    if (this.ValueControl != null)
        this.ValueControl.disabled = true;
}

function DBFieldBoolean_Enable() {
    if (this.ValueControl != null)
        this.ValueControl.disabled = false;
}

function DBFieldBoolean_GetValue() {
    var value = null;
    if (this.IsEditForm)
        value = this.ValueControl.checked;
    return value;
}

function DBFieldBoolean_SetValue(value) {
    if (this.IsEditForm) {
        if (this.ValueControl != null) {
            if (value != null) {
                var valString = value.toString();
                if (!window.SM.IsNullOrEmpty(valString) && valString.toLowerCase() == "true") {
                    this.ValueControl.checked = true;
                    this.InitValue(null, true);
                }
                else if (!window.SM.IsNullOrEmpty(valString) && valString.toLowerCase() == "false") {
                    this.ValueControl.checked = false;
                    this.InitValue(null, true);
                }
            }
        }
    }
}

function DBFieldBoolean_ShowInformer(message) {
}

function DBFieldBoolean_IsEmptyValue() {
    return false;
}

function DBFieldBoolean_InitFieldValue(fldName, pSet) {
    var field;
    var tField;
    if (!window.SM.IsNullOrEmpty(fldName) && pSet == null) {
        fldName = DBFieldBoolean_DecodeQuotes(fldName);
        field = window.ListForm.GetField(fldName);
        if (field != null && field.TypedField != null)
            tField = field.TypedField;
    }
    else
        tField = this;

    if (tField != null && tField.HiddenInput != null) {
        var value = '';
        xmldoc = window.SM.LoadXML('<BooleanValues></BooleanValues>');
        var xmlValue = xmldoc.documentElement.ownerDocument.createElement('BooleanValue');
        xmldoc.documentElement.appendChild(xmlValue);

        if (tField.ValueControl.checked)
            value = "true";
        else
            value = "false";

        xmlValue.setAttribute("value", value);
        $(tField.HiddenInput).val(window.SM.PersistXML(xmldoc));

        if (tField != null && pSet != null)
            tField.ListFormField.OnChange();
    }
}

function DBFieldBoolean_DecodeQuotes(inputString) {
    if (window.SM.IsNullOrEmpty(inputString))
        throw new Error('Параметр inputString не может быть пустым.');
    var rgSQuot = /(_squot_)/g;
    var rgDQuot = /(_dquot_)/g
    var result = inputString.replace(rgSQuot, "'").replace(rgDQuot, '"');
    return result;
}
////////////////////////////////////////////////////////////////////