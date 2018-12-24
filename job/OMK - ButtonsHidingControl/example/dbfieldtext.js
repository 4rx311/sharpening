function DBFieldText(valueControlID, settings) {
    //св-ва
    this.Settings = settings;
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.ControlWidth = settings.ControlWidth;
    this.IsEditForm = settings.ControlMode == 'Edit';
    this.Changed = false;
    this.IsNewDesign = settings.IsNewDesign;
    this.IsMultiLine = settings.MultiLine;
    this.Templates = settings.Templates;
    this.TemplateSeparator = settings.TemplateSeparator;

    this.IsTextControl = this.IsNewDesign && !this.IsMultiLine;

    //интерфейсы DBField
    this.OnInit = DBFieldText_OnInit;
    this.OnSave = DBFieldText_OnSave;
    this.Disable = DBFieldText_Disable;
    this.Enable = DBFieldText_Enable;
    this.GetValue = DBFieldText_GetValue;
    this.SetValue = DBFieldText_SetValue;
    this.ShowInformer = DBFieldText_ShowInformer;
    this.IsChanged = DBFieldText_IsChanged;
    this.IsEmptyValue = DBFieldText_IsEmptyValue;
    //методы
    this.Init = DBFieldText_Init;

    if (this.IsEditForm) {
        if (!this.IsTextControl) {
            this.ValueControl = window.document.getElementById(valueControlID);
            var controlMaxLength = DBFieldText_InitMaxLength.call(this);
            this.ManualLengthControl = controlMaxLength;
        }
        else {
            //для нового дизайна и однострочного режима используем новый TextControl
            //получаем контейнер контрола значений
            this.TextControlContainer = window.document.getElementById(valueControlID);
            this.HiddenValue = window.document.getElementById(settings.HiddenValueID);
            //и контрол для передачи значений на сервер

            this.TextControl = new TextControl({
                DefaultText: '',
                ControlWidth: this.ControlWidth,
                Templates: this.Templates,
                TemplateSeparator: this.TemplateSeparator
            });
            this.ValueControl = this.TextControl.TextInput;
            DBFieldText_InitMaxLength.call(this);
            //устанавливаем значение с сервера
            if (!window.SM.IsNE(settings.Value))
                this.ValueControl.value = settings.Value;

            //добавляем контрол в разметку поля
            this.TextControlContainer.appendChild(this.TextControl.Container);
        }
    }
    else
        this.ValueControl = window.document.getElementById(valueControlID);

    if (this.IsEditForm) {
        //для режима однострочного текста выставляем высоту в зависимости от браузера и doctype
        if (!this.IsTextControl) {
            if (window.SM.DTD) {
                this.ValueControl.style.width = (this.ControlWidth - 2) + 'px';
                if (!this.IsMultiLine)
                    this.ValueControl.style.height = '15px';
            }
        }

        if (this.ValueControl != null) {
            this.ValueControl.onfocus = function () {
                if (this.readOnly)
                    this.blur();
            }

            var objRef = this.ValueControl;
            objRef.Field = this;

            //disable copypaste incorrect values
            $(this.ValueControl).bind('paste', function (e) {
                objRef.PreviosValue = $(objRef).val();
                var timeoutID = window.setTimeout(function () {
                    if (timeoutID > 0)
                        window.clearTimeout(timeoutID);

                    var currentValue = $(objRef).val();
                    //текущее значение поля содержит запрещенные символы
                    var contains = DBFieldText_StringContainsDisabledSymbols.call(objRef.Field, currentValue);
                    if (contains)
                        $(objRef).val(objRef.PreviosValue);
                    else {
                        //проверка на длину
                        if (DBFieldText_CheckLength.call(objRef.Field, currentValue)) {
                            currentValue = DBFieldText_PrepareValue.call(objRef.Field, currentValue);
                            $(objRef).val(currentValue);
                        }
                    }
                }, 5);
            });

            $(document).ready(function (objref) {
                $(objRef).keypress(function (e) {
                    var isDisabledSymbol = DBFieldText_IsDisabledSymbol.call(objRef.Field, e.which);
                    if (isDisabledSymbol)
                        return false;

                    if (objRef.Field.ManualLengthControl) {
                        var timeoutID = window.setTimeout(function () {
                            if (timeoutID > 0)
                                window.clearTimeout(timeoutID);

                            var currentValue = $(objRef).val();
                            if (DBFieldText_CheckLength.call(objRef.Field, currentValue)) {
                                currentValue = DBFieldText_PrepareValue.call(objRef.Field, currentValue);
                                $(objRef).val(currentValue);
                            }
                        });
                    }
                });
            });
        }
    }

    //инициализация
    this.Init();
}

function DBFieldText_CheckLength(value) {
    if (value == null)
        value = '';

    var overflow = false;
    if (this.ManualLengthControl)
        overflow = value.length > this.Settings.Size;

    return overflow;
}

function DBFieldText_PrepareValue(value) {
    var newValue = value;
    if (newValue == null)
        newValue = '';
    if (this.ManualLengthControl) {
        if (newValue.length > this.Settings.Size)
            newValue = newValue.substr(0, this.Settings.Size);
    }

    return newValue;
}

function DBFieldText_InitMaxLength() {
    var controlMaxLength = false;
    if (this.Settings != null && this.Settings.Size > 0) {
        this.ValueControl.maxLength = this.Settings.Size;
        //для IE версий ниже 10 ↑ не работает для textarea
        //поэтому включаем для поля режим ручного управления контролем длины.
        var oldIE = SM.IsIE7 || SM.IsIE8 || SM.IsIE9;
        if (this.Settings.MultiLine && oldIE)
            controlMaxLength = true;
    }
    return controlMaxLength;
}

//Init
function DBFieldText_Init() {
    if (window.DBFieldTextCollection == null)
        window.DBFieldTextCollection = new Array();
    if (!window.SM.IsNullOrEmpty(this.FieldName))
        window.DBFieldTextCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldText_GetField(fieldName) {
    var field = null;
    if (window.DBFieldTextCollection != null && !window.SM.IsNullOrEmpty(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldTextCollection[fieldName];
    }
    return field;
}

//Interface
function DBFieldText_OnInit() {
    //Handlers
    if (this.ValueControl != null) {
        var objRef = this;
        this.ValueControl.onchange = function () { objRef.Changed = true; objRef.ListFormField.OnChange(); }
    }
}

function DBFieldText_OnSave(saveEventArgs) {
    var value = this.GetValue();
    //если поле обязательное, либо подлежит диагностике пустых значений
    //на клиенте, то проверяем значение контрола поля.
    if (this.ListFormField.Required || this.Settings.ClientDiagnostic) {
        if (window.SM.IsNullOrEmpty(value)) {
            //проверка обязательности
            if (this.ListFormField.Required) {
                saveEventArgs.CanSave = false;
                saveEventArgs.IsEmptyValue = true;
            }
            //диагностика
            if (this.Settings.ClientDiagnostic) {
                saveEventArgs.CanSave = false;
                var commonMessage = 'Не заполнено диагностируемое поле: "' + this.FieldName + '".';
                saveEventArgs.CommonAlertMessage = commonMessage;
            }
        }
    }

    //проверка на запрещенные символы.
    //только если включена валидация ранее сохраненных элементов
    if (!SM.IsNE(value) && this.Settings.ValidateSavedItems) {
        //текущее значение поля содержит запрещенные символы
        var contains = DBFieldText_StringContainsDisabledSymbols.call(this, value);
        if (contains) {
            //коллекция запрещенных символов
            var disabledSymbols = [];
            for (var i = 0; i < value.length; i++) {
                var valueSymbol = value[i];
                if (DBFieldText_IsDisabledSymbol.call(this, valueSymbol))
                    disabledSymbols[valueSymbol] = valueSymbol;
            }

            var disabledSymbolsString = '';
            for (var symbol in disabledSymbols) {

                if (!disabledSymbols.hasOwnProperty(symbol))
                    continue;

                var disabledSymbol = disabledSymbols[symbol];
                if (disabledSymbolsString.length > 0)
                    disabledSymbolsString += ", ";

                disabledSymbolsString += '"' + disabledSymbol + '"';
            }

            saveEventArgs.CanSave = false;
            var commonMessage = 'В поле: "' + this.FieldName + '" содержатся символы, запрещенные для ввода. Запрещенные символы: ' + disabledSymbolsString + '.';
            saveEventArgs.CommonAlertMessage = commonMessage;
        }
    }

    //если используется клиентский TextControl
    //копируем его значение в скрытое поле для считывания значений на сервере
    if (this.IsTextControl) {
        if (value == null)
            value = '';
        this.HiddenValue.value = value;
    }
}

function DBFieldText_IsEmptyValue() {
    var value = this.GetValue();
    if (window.SM.IsNullOrEmpty(value)) return true;
    return false;
}

function DBFieldText_Disable() {
    if (this.ValueControl != null) {
        if (this.IsTextControl)
            this.TextControl.Disable();
        else {
            this.ValueControl.readOnly = true;
            this.ValueControl.style.color = "#808080";
        }
    }
}

function DBFieldText_Enable() {
    if (this.ValueControl != null) {
        if (this.IsTextControl)
            this.TextControl.Enable();
        else {
            this.ValueControl.readOnly = false;
            this.ValueControl.style.color = "#000000";
        }
    }
}

function DBFieldText_GetValue() {
    var value = null;
    if (this.IsEditForm)
        value = this.ValueControl.value;

    return value;
}

function DBFieldText_SetValue(value) {
    if (this.IsEditForm) {
        if (value == null)
            value = '';
        value = value.toString();
        this.ValueControl.value = value;
        this.Changed = true;
        this.ListFormField.OnChange();

        //если используется клиентский TextControl
        //копируем его значение в скрытое поле для считывания значений на сервере
        if (this.IsTextControl)
            this.HiddenValue.value = this.ValueControl.value;
    }
}

function DBFieldText_ShowInformer(message) {
}

function DBFieldText_IsChanged() {
    return this.Changed == true;
}

function DBFieldText_InitDisabledSymbols() {
    try {
        if (this.DisabledSymbolsInited)
            return;

        //создаем именованный массив запрещенных символов.
        this.DisabledSymbols = [];
        if (this.Settings.DisabledClientSymbols != null) {
            var i, len = this.Settings.DisabledClientSymbols.length;
            for (i = 0; i < len; i++) {
                var disabledSymbol = this.Settings.DisabledClientSymbols[i];
                this.DisabledSymbols[disabledSymbol.toString()] = disabledSymbol;
            }
        }

        this.DisabledSymbolsInited = true;
    }
    catch (ex) {
        alert('Возникла неожиданная ошибка. Текст ошибки: ' + ex.message);
    }
}

function DBFieldText_StringContainsDisabledSymbols(string) {
    var contains = false;
    try {
        if (string == null)
            string = '';
        else
            string = string.toString();

        if (!SM.IsNE(string)) {
            //инициализация запрещенных символов
            DBFieldText_InitDisabledSymbols.call(this);
            for (var i = 0; i < string.length; i++) {
                var symbol = string[i];
                if (!SM.IsNE(symbol) && this.DisabledSymbols != null
                    && this.DisabledSymbols[symbol] != null) {
                    contains = true;
                    break;
                }
            }
        }
    }
    catch (ex) {
        alert('Возникла неожиданная ошибка. Текст ошибки: ' + ex.message);
    }

    return contains;
}

function DBFieldText_IsDisabledSymbol(symbol) {
    var disabled = false;
    try {
        if (symbol == null)
            symbol = '';
        else {
            //если пришло число, то считаем, что это код символа
            //если пришла строка, то считаем ее символом.
            if (typeof symbol == 'number')
                symbol = String.fromCharCode(symbol);
            else
                symbol = symbol.toString();

            if (symbol.length != 1)
                throw new Error('Для проверки символа на запрещенность необходимо передавть только один символ');
        }

        if (!SM.IsNE(symbol)) {
            //инициализация запрещенных символов
            DBFieldText_InitDisabledSymbols.call(this);
            if (this.DisabledSymbols != null && this.DisabledSymbols[symbol] != null)
                disabled = true;
        }
    }
    catch (ex) {
        alert('Возникла неожиданная ошибка. Текст ошибки: ' + ex.message);
    }

    return disabled;
}