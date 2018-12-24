function DBFieldInteger(valueControlID, settings) {
    //Properties
    this.Settings = settings;
    this.IsChange = false;
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.IsEditForm = this.ControlMode == 'Edit';
    this.AllowNegativeValues = settings.AllowNegativeValues;
    this.IsNewDesign = settings.IsNewDesign;

    if (this.IsEditForm) {
        if (!this.IsNewDesign)
            this.ValueControl = window.document.getElementById(valueControlID);
            //для нового дизайна и однострочного режима используем новый TextControl
        else {
            //получаем контейнер контрола значений
            this.TextControlContainer = window.document.getElementById(valueControlID);
            this.HiddenValue = window.document.getElementById(settings.HiddenValueID);
            //и контрол для передачи значений на сервер

            this.TextControl = new TextControl({
                Type: 'Integer',
                AllowNegativeValues: this.AllowNegativeValues,
                MaxValue: this.Settings.MaxValue,
                MinValue: this.Settings.MinValue,
                DefaultText: '',
                ControlWidth: 100
            });
            this.ValueControl = this.TextControl.TextInput;
            //устанавливаем значение с сервера
            if (!window.SM.IsNE(settings.Value))
                this.ValueControl.value = settings.Value;

            //добавляем контрол в разметку поля
            this.TextControlContainer.appendChild(this.TextControl.Container);
        }
        if (window.SM.DTD && !this.IsNewDesign) {
            var width = 96;
            var height = 15;
            if (window.SM.IsFF) {
                width = 98;
                height = 17;
            }

            this.ValueControl.style.width = width + 'px';
            this.ValueControl.style.height = height + 'px';
        }
    }

    //сброс фокуса для неактивного поля
    if (this.IsEditForm && this.ValueControl != null) {
        this.ValueControl.onfocus = function () {
            if (this.readOnly)
                this.blur();
        }
    }

    //Interface
    this.IsChanged = DBFieldInteger_IsChanged;
    this.OnInit = DBFieldInteger_OnInit;
    this.OnSave = DBFieldInteger_OnSave;
    this.Disable = DBFieldInteger_Disable;
    this.Enable = DBFieldInteger_Enable;
    this.GetValue = DBFieldInteger_GetValue;
    this.SetValue = DBFieldInteger_SetValue;
    this.ShowInformer = DBFieldInteger_ShowInformer;
    this.IsEmptyValue = DBFieldInteger_IsEmptyValue;

    //Methods
    this.Init = DBFieldInteger_Init;

    //Initialization
    this.Init();
}

//Init
function DBFieldInteger_Init() {
    if (window.DBFieldIntegerCollection == null)
        window.DBFieldIntegerCollection = new Array();
    if (!window.SM.IsNullOrEmpty(this.FieldName))
        window.DBFieldIntegerCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldInteger_IsChanged() {
    return this.IsChange;
}

function DBFieldInteger_GetField(fieldName) {
    var field = null;
    if (window.DBFieldIntegerCollection != null && !window.SM.IsNullOrEmpty(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldIntegerCollection[fieldName];
    }
    return field;
}

//Interface
function DBFieldInteger_OnInit() {
    //Handlers
    if (this.ValueControl != null) {
        var objRef = this;
        this.ValueControl.onchange = function () { objRef.IsChange = true; objRef.ListFormField.OnChange(); }
    }
}

function DBFieldInteger_RemoveSpaces(str) {
    var newString = '';
    if (!SM.IsNullOrEmpty(str)) {
        var i, len = str.length;
        for (i = 0; i < len; i++) {
            var chCode = str.charCodeAt(i);
            if (chCode != 8195 && chCode != 8194 && chCode != 160 && chCode != 32)
                newString += str.charAt(i);
        }
    }
    return newString;
}

function DBFieldInteger_IsEmptyValue() {
    var value = this.GetValue();
    var valTrim = DBFieldInteger_RemoveSpaces(value);
    if (window.SM.IsNullOrEmpty(valTrim)) return true;
    return false;
}

function DBFieldInteger_OnSave(saveEventArgs) {
    var valTrim = '';
    var value = this.GetValue();
    valTrim = DBFieldInteger_RemoveSpaces(value);
    if (this.ListFormField.Required) {
        if (window.SM.IsNullOrEmpty(valTrim)) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsEmptyValue = true;
        }
    }

    //копируем в скрытое поле
    if (this.IsNewDesign)
        this.HiddenValue.value = valTrim;

    if (!window.SM.IsNullOrEmpty(valTrim)) {
        //проверка на покрректность
        var regEx = /^[-]?[\d]+$/

        var maxInt = 2147483647;
        if (this.Settings != null && !SM.IsNE(this.Settings.MaxValue))
            maxInt = parseInt(this.Settings.MaxValue);

        var minInt = -2147483648;
        if (this.Settings != null && !SM.IsNE(this.Settings.MinValue))
            minInt = parseInt(this.Settings.MinValue);

        var valInteger = parseInt(valTrim);
        if (!regEx.test(valTrim) || valInteger == null) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsIncorrectValue = true;
            return;
        }

        if (!this.AllowNegativeValues && valInteger < 0) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = 'В поле "' + this.ListFormField.DisplayName + '" может быть указано только положительное число.';
            return;
        }

        if (valInteger > maxInt) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = 'В поле "' + this.ListFormField.DisplayName + '" указано число, которое больше максимального допустимого числа (' + maxInt + ') для поля типа "Целое число".';
            return;
        }
        else if (valInteger < minInt) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = 'В поле "' + this.ListFormField.DisplayName + '" указано число, которое меньше минимального допустимого числа (' + minInt + ') для поля типа "Целое число".';
            return;
        }
    }
}

function DBFieldInteger_Disable() {
    if (this.ValueControl != null) {
        //для старого дизайна устанавливаем цвет неактивного контрола
        //для нового дизайна он будет установлен с дизейблом контрола TextConrtol
        if (!this.IsNewDesign) {
            this.ValueControl.style.color = "#808080";
            this.ValueControl.readOnly = true;
        }
        else
            this.TextControl.Disable();
    }
}

function DBFieldInteger_Enable() {
    if (this.ValueControl != null) {
        //для старого дизайна устанавливаем цвет активного контрола
        //для нового дизайна он будет установлен с энейблом контрола TextConrtol
        if (!this.IsNewDesign) {
            this.ValueControl.readOnly = false;
            this.ValueControl.style.color = "#000000";
        }
        else
            this.TextControl.Enable();
    }
}

function DBFieldInteger_GetValue() {
    var value = null;
    if (this.IsEditForm)
        value = this.ValueControl.value;
    else
        value = $(this.ValueControl).text();

    value = DBFieldInteger_RemoveSpaces(value);
    return value;
}

function DBFieldInteger_SetValue(value) {
    if (this.IsEditForm) {
        if (value == null)
            value = '';
        value = value.toString();

        var error = false;
        var valTrim = DBFieldInteger_RemoveSpaces(value);

        if (!window.SM.IsNullOrEmpty(valTrim)) {
            //проверка на покрректность
            var regEx = /^([-]?[1-9]+)|0$/

            var valInteger = parseFloat(valTrim);
            if (!regEx.test(valTrim) || valInteger == null) {
                error = true;
                alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
            }
        }

        if (!error) {

            if (window.TextControl_FormatNumber != null)
                value = TextControl_FormatNumber(value);

            $(this.ValueControl).val(value);
            this.IsChange = true;
            this.ListFormField.OnChange();

            if (this.IsNewDesign)
                this.HiddenValue.value = value;
        }
    }
}

function DBFieldInteger_ShowInformer(message) {
}