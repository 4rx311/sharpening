function DBFieldMarkup(valueControlID, settings) {
    this.ValueControl = window.document.getElementById(valueControlID);

    //Properties
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.IsEditForm = this.ControlMode == 'Edit';

    //Interface
    this.OnInit = DBFieldMarkup_OnInit;
    this.Disable = DBFieldMarkup_Disable;
    this.ShowInformer = DBFieldMarkup_ShowInformer;
    this.IsChanged = DBFieldMarkup_IsChanged;
    this.Enable = DBFieldMarkup_Enable;

    //Methods
    this.Init = DBFieldMarkup_Init;

    //Initialization
    this.Init();
}

//Init
function DBFieldMarkup_Init() {
    if (window.DBFieldMarkupCollection == null)
        window.DBFieldMarkupCollection = new Array();
    if (!window.SM.IsNullOrEmpty(this.FieldName))
        window.DBFieldMarkupCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldMarkup_GetField(fieldName) {
    var field = null;
    if (window.DBFieldMarkupCollection != null && !window.SM.IsNullOrEmpty(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldMarkupCollection[fieldName];
    }
    return field;
}

//Interface
function DBFieldMarkup_OnInit() {
}

function DBFieldMarkup_IsChanged() {
    return false;
}

function DBFieldMarkup_Disable() {
}

function DBFieldMarkup_GetValue() {
    return null;
}

function DBFieldMarkup_SetValue(value) {
}

function DBFieldMarkup_ShowInformer(message) {
}

function DBFieldMarkup_Enable() {
}