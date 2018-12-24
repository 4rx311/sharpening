function DBFieldNumber(valueControlID, settings) {
    //this.ValueControl = window.document.getElementById(valueControlID);
    //Properties
    this.IsChange = false;
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.IsEditForm = this.ControlMode == 'Edit';
    this.MaxValue = settings.MaxValue;
    this.MinValue = settings.MinValue;
    this.IsNewDesign = settings.IsNewDesign;

    var numberOfDecimal = 0;
    if (!SM.IsNE(settings.NumberOfDecimals))
        numberOfDecimal = settings.NumberOfDecimals | 0
    else
        //режим авто (сохраняются все символы)
        numberOfDecimal = -1;

    this.NumberOfDecimals = numberOfDecimal;

    if (this.IsEditForm) {
        if (!this.IsNewDesign)
            this.ValueControl = window.document.getElementById(valueControlID);
            //для нового дизайна и однострочного режима используем новый TextControl
        else {
            //получаем контейнер контрола значений
            this.TextControlContainer = window.document.getElementById(valueControlID);
            this.HiddenValue = window.document.getElementById(settings.HiddenValueID);
            //и контрол для передачи значений на сервер

            var allowNegativeValues = true;
            if (this.MinValue != null && !isNaN(this.MinValue))
                allowNegativeValues = this.MinValue < 0;

            this.TextControl = new TextControl({
                Type: 'Number',
                AllowNegativeValues: allowNegativeValues,
                MaxValue: this.MaxValue,
                MinValue: this.MinValue,
                NumberOfDecimals: this.NumberOfDecimals,

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
    }


    //Interface
    this.IsChanged = DBFieldNumber_IsChanged;
    this.OnInit = DBFieldNumber_OnInit;
    this.OnSave = DBFieldNumber_OnSave;
    this.Disable = DBFieldNumber_Disable;
    this.Enable = DBFieldNumber_Enable;
    this.GetValue = DBFieldNumber_GetValue;
    this.SetValue = DBFieldNumber_SetValue;
    this.ShowInformer = DBFieldNumber_ShowInformer;
    this.IsEmptyValue = DBFieldNumber_IsEmptyValue;

    //Methods
    this.Init = DBFieldNumber_Init;

    //Initialization
    this.Init();

    if (window.SM.DTD && !this.IsNewDesign) {
        var width = 96;
        var height = 15;
        if (window.SM.IsFF) {
            width = 98;
            height = 17
        }

        this.ValueControl.style.width = width + 'px';
        this.ValueControl.style.height = height + 'px';
    }

    //сброс фокуса для неактивного поля
    if (this.IsEditForm && this.ValueControl != null) {
        this.ValueControl.onfocus = function () {
            if (this.readOnly)
                this.blur();
        }
    }
}

//Init
function DBFieldNumber_Init() {
    if (window.DBFieldNumberCollection == null)
        window.DBFieldNumberCollection = new Array();
    if (!window.SM.IsNullOrEmpty(this.FieldName))
        window.DBFieldNumberCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldNumber_GetField(fieldName) {
    var field = null;
    if (window.DBFieldNumberCollection != null && !window.SM.IsNullOrEmpty(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldNumberCollection[fieldName];
    }
    return field;
}

function DBFieldNumber_IsChanged() {
    return this.IsChange;
}

//Interface
function DBFieldNumber_OnInit() {
    //Handlers
    if (this.ValueControl != null) {
        var objRef = this;
        this.ValueControl.onchange = function () { objRef.IsChange = true; objRef.ListFormField.OnChange(); }
    }
}

function DBFieldNumber_RemoveSpaces(str) {
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

function DBFieldNumber_IsEmptyValue() {
    var value = this.GetValue();
    if (window.SM.IsNullOrEmpty(value)) {
        return true;
    }
    return false;
}

function DBFieldNumber_OnSave(saveEventArgs) {
    var value = this.GetValue();

    var valTrim = '';
    if (!SM.IsNE(value))
        valTrim = DBFieldNumber_RemoveSpaces(value);

    if (this.ListFormField.Required) {
        if (SM.IsNullOrEmpty(valTrim)) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsEmptyValue = true;
            return;
        }
    }

    if (!SM.IsNE(valTrim))
        valTrim = valTrim.replace(",", ".");

    //копируем в скрытое поле
    if (this.IsNewDesign)
        this.HiddenValue.value = valTrim;

    //проверка на покрректность
    var regEx = /^(([-]?[1-9]+\d*[\.\,]{1,1}\d+)|([-]?0\d*[\.\,]\d+)|(0{1,1})|([-]?[1-9]+\d*))$/
    if (!SM.IsNullOrEmpty(valTrim)) {
        //обрезаем символы разделителей (число могут не ввести до конца, пример: 20.)
        if (valTrim[valTrim.length - 1] == '.')
            valTrim = valTrim.substr(0, valTrim.length - 1);

        var valDouble = parseFloat(valTrim);
        var minVal = parseFloat(this.MinValue);
        var maxVal = parseFloat(this.MaxValue);



        if (!regEx.test(valTrim) || valDouble == null) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = 'В поле "' + this.ListFormField.DisplayName + '" указано некорректное значение.';
            return;
        }

        if (regEx.test(minVal) && minVal > valDouble) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = 'В поле "' + this.ListFormField.DisplayName + '" указано число, которое меньше минимально допустимого значения.';
            return;
        }

        if (regEx.test(maxVal) && maxVal < valDouble) {
            saveEventArgs.CanSave = false;
            saveEventArgs.CommonAlertMessage = 'В поле "' + this.ListFormField.DisplayName + '" указано число, превышающее максимально допустимое значение.';
            return;
        }
    }
}

function DBFieldNumber_Disable() {
    if (this.ValueControl != null) {
        if (!this.IsNewDesign) {
            this.ValueControl.readOnly = true;
            this.ValueControl.style.color = "#808080";
        }
        else
            this.TextControl.Disable();
    }
}

function DBFieldNumber_Enable() {
    if (this.ValueControl != null) {
        if (!this.IsNewDesign) {
            this.ValueControl.readOnly = false;
            this.ValueControl.style.color = "#000000";
        }
        else
            this.TextControl.Enable();
    }
}

function DBFieldNumber_GetValue(returnValueAsNumber) {

    var value = this.IsEditForm ? this.ValueControl.value : $(this.ValueControl).text();
    value = DBFieldNumber_RemoveSpaces(value);

    if (returnValueAsNumber)
        value = SM.IsNullOrEmpty(value) ? 0 : parseFloat(value.replace(",", "."));

    return value;
}

function DBFieldNumber_SetValue(value) {
    if (this.IsEditForm) {
        if (value == null)
            value = '';
        value = value.toString();
        var error = false;
        //проверка на покрректность
        var regEx = /^(([-]?[1-9]+\d*[\.\,]{1,1}\d+)|([-]?0\d*[\.\,]\d+)|(0{1,1})|([-]?[1-9]+\d*))$/

        if (!window.SM.IsNullOrEmpty(value)) {
            var tempVal = DBFieldNumber_RemoveSpaces(value).replace(",", ".");
            var valDouble = parseFloat(tempVal);
            var minVal = parseFloat(this.MinValue);
            var maxVal = parseFloat(this.MaxValue);
            if (!regEx.test(tempVal) || valDouble == null) {
                error = true;
                alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
            }
        }

        if (!error) {
            if (this.TextControl != null) {
                if (window.TextControl_FormatNumber != null)
                    value = TextControl_FormatNumber.call(this.TextControl, value);
            }

            this.ValueControl.value = value;
            this.IsChange = true;
            this.ListFormField.OnChange();

            if (this.IsNewDesign)
                this.HiddenValue.value = value;
        }
    }
}

function DBFieldNumber_ShowInformer(message) {
}