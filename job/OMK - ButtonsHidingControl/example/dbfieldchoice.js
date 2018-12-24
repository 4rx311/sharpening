function DBFieldChoice(valueControlID, settings, hiddenID) {
    if (settings.DesignVersion == 'v2' && settings.DisplayType == 'DropDownList') {
        this.IsListControl = true;
        this.ValueControlContainer = window.document.getElementById(settings.ContainerID);
    }
    else
        this.ValueControl = window.document.getElementById(valueControlID);
    this.HiddenInput = window.document.getElementById(hiddenID);

    //Properties
    this.IsChange = false;
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.IsEditForm = this.ControlMode == 'Edit';
    this.DisplayType = settings.DisplayType;
    this.Separator = settings.Separator;
    this.Variants = settings.Variants;
    this.DefaultValue = settings.DefaultValue;
    this.ControlWidth = settings.ControlWidth;
    this.Value = settings.Value;
    this.EmptyValueTitle = window.TN.TranslateKey('dbfield.choice.emptyvalue');
    this.EmptyValue = settings.EmptyValue;

    //Interface
    this.IsChanged = DBFieldChoice_IsChanged;
    this.OnInit = DBFieldChoice_OnInit;
    this.OnSave = DBFieldChoice_OnSave;
    this.Disable = DBFieldChoice_Disable;
    this.Enable = DBFieldChoice_Enable;
    this.GetValue = DBFieldChoice_GetValue;
    this.SetValue = DBFieldChoice_SetValue;
    this.ShowInformer = DBFieldChoice_ShowInformer;
    this.IsEmptyValue = DBFieldChoice_IsEmptyValue;

    //Methods
    this.Init = DBFieldChoice_Init;
    this.InitValue = DBFieldChoice_InitFieldValue;
    //Initialization
    this.Init();
    //Init Value
    this.InitValue();
}

//Init
function DBFieldChoice_Init() {
    if (window.DBFieldChoiceCollection == null)
        window.DBFieldChoiceCollection = new Array();
    if (!window.SM.IsNE(this.FieldName))
        window.DBFieldChoiceCollection[this.FieldName.toLowerCase()] = this;

    //признак множественности
    var displayTypeLower = '';
    var isMultiple = false;
    if (!SM.IsNE(this.DisplayType))
        displayTypeLower = this.DisplayType.toLowerCase();

    if (displayTypeLower == "checkboxes")
        isMultiple = true;

    this.IsMultiple = isMultiple;

    //создание контрола выпадающего списка (определенные кейсы)
    if (this.ValueControlContainer == null || !this.IsListControl)
        return;

    //debugger;
    var listControl = new ListControl();
    this.ValueControl = listControl;
    listControl.IsMultiple = false;
    listControl.IsDropDownList = true;
    listControl.WrapGrid = true;
    listControl.RemovableValue = false;

    listControl.Init();

    listControl.SetControlWidth(this.ControlWidth);
    var thisObj = this;
    listControl.OnSetGridValue = function (gridValue) {
        thisObj.ListFormField.OnChange();
        thisObj.IsChange = true;

        if (thisObj.HiddenInput == null)
            return;

        var xd = window.SM.LoadXML('<ChoiceValues></ChoiceValues>');
        var xmlValue = xd.documentElement.ownerDocument.createElement('ChoiceValue');
        xd.documentElement.appendChild(xmlValue);

        xmlValue.setAttribute("value", gridValue.Value);
        thisObj.HiddenInput.value = window.SM.PersistXML(xd);
    }

    var i, len = this.Variants.length;
    listControl.AddGridRow(this.EmptyValue.Text, this.EmptyValue.Value);
    for (i = 0; i < len; i++) {
        var variant = this.Variants[i];
        if (window.SM.IsNE(variant.Text) || window.SM.IsNE(variant.Value))
            continue;

        listControl.AddGridRow(variant.Text, variant.Value);
    }

    if (this.Value != null && !window.SM.IsNE(this.Value.Text) && !window.SM.IsNE(this.Value.Value))
        this.SetValue(this.Value);
    else {
        if (this.DefaultValue != null && !window.SM.IsNE(this.DefaultValue.Text) && !window.SM.IsNE(this.DefaultValue.Value))
            this.SetValue(this.DefaultValue);
        else
            this.SetValue(this.EmptyValue.Text);
    }

    this.ValueControlContainer.appendChild(listControl.Container);
}

function DBFieldChoice_GetField(fieldName) {
    var field = null;
    if (window.DBFieldChoiceCollection != null && !window.SM.IsNE(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldChoiceCollection[fieldName];
    }
    return field;
}

//Interface
function DBFieldChoice_OnInit() {
}

function DBFieldChoice_IsChanged() {
    return this.IsChange;
}

function DBFieldChoice_OnSave(saveEventArgs) {
    if (this.ListFormField.Required) {
        if (this.IsEmptyValue()) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsEmptyValue = true;
        }
    }
}

function DBFieldChoice_IsEmptyValue() {
    var value = this.GetValue();
    if (window.SM.IsNE(value) || value == this.EmptyValueTitle) {
        return true;
    }
    return false;
}

function DBFieldChoice_Disable() {
    //debugger;
    if (this.IsListControl) {
        //list control new design
        if (this.ValueControl != null) {
            if (this.IsEmptyValue())
                this.ValueControl.SetValue(null);
            this.ValueControl.Disable();
        }
    }
    else {
        //вып. список
        if (this.DisplayType.toLowerCase() == "dropdownlist") {
            this.ValueControl.disabled = true;
        }
        else if (this.DisplayType.toLowerCase() == "radiobuttons"
    || this.DisplayType.toLowerCase() == "checkboxes") {
            var rows = this.ValueControl.rows;
            if (rows != null) {
                for (var i = 0; i < rows.length; i++) {
                    var cell = rows[i].cells[0];
                    if (cell != null) {
                        var input = cell.children[0];
                        if (input != null)
                            input.disabled = true;
                    }
                }
            }
        }
    }
}

function DBFieldChoice_Enable() {
    if (this.IsListControl) {
        //list control new design
        if (this.ValueControl != null) {
            this.ValueControl.Enable();
            if (this.IsEmptyValue())
                this.ValueControl.SetValue(this.EmptyValueTitle);
        }
    }
    else {
        //вып. список
        if (this.DisplayType.toLowerCase() == "dropdownlist") {
            this.ValueControl.disabled = false;
        }
        else if (this.DisplayType.toLowerCase() == "radiobuttons"
    || this.DisplayType.toLowerCase() == "checkboxes") {
            var rows = this.ValueControl.rows;
            if (rows != null) {
                for (var i = 0; i < rows.length; i++) {
                    var cell = rows[i].cells[0];
                    if (cell != null) {
                        var input = cell.children[0];
                        if (input != null)
                            input.disabled = false;
                    }
                }
            }
        }
    }
}

function DBFieldChoice_GetValue() {
    var value = '';
    if (this.IsEditForm) {
        if (this.IsListControl) {
            var valObj = this.ValueControl.Value;
            if (valObj != null && valObj.Value != null) {
                if (this.EmptyValue != null && this.EmptyValue.Value == valObj.Value)
                    ;
                else
                    value = valObj.Text;
            }
        }
        else {
            if (this.DisplayType.toLowerCase() == "dropdownlist" && this.HiddenInput != null) {
                var temp = this.ValueControl.value;
                if (temp == this.EmptyValueTitle)
                    value = null;
                else
                    value = temp;
            }
            else if (this.DisplayType.toLowerCase() == "radiobuttons") {
                var rows = this.ValueControl.rows;
                if (rows != null) {
                    for (var i = 0; i < rows.length; i++) {
                        var cell = rows[i].cells[0];
                        if (cell != null) {
                            var input = cell.children[0];
                            if (input != null && input.checked && input.tagName.toLowerCase() == "input")
                                value = input.value;
                        }
                    }
                }
            }
                //множ. выбор
            else if (this.DisplayType.toLowerCase() == "checkboxes") {
                var rows = this.ValueControl.rows;
                if (rows != null) {
                    for (var i = 0; i < rows.length; i++) {
                        var cell = rows[i].cells[0];
                        if (cell != null) {
                            var input, lbl;
                            var valueElement = null;
                            var span = cell.children[0];
                            if (span != null && !window.SM.IsNE(span.tagName) && span.tagName.toLowerCase() == 'span') {
                                if (span.children != null && span.children.length > 1) {
                                    valueElement = span;
                                    input = span.children[0];
                                    lbl = span.children[1];
                                }
                            }
                            else {
                                if (cell.children != null && cell.children.length > 1) {
                                    input = cell.children[0];
                                    valueElement = input;
                                    lbl = cell.children[1];
                                }
                            }
                            if (input != null && lbl != null && input.tagName.toLowerCase() == "input") {
                                if (input.checked) {
                                    if (window.SM.IsNE(value))
                                        value += $(valueElement).attr('ChoiceValue');
                                    else
                                        value += this.Separator + $(valueElement).attr('ChoiceValue');
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else
        value = $(this.ValueControl).text();
    return value;
}

//установка значений в полей
function DBFieldChoice_SetValue(value) {
    if (this.IsEditForm) {
        //установка в ListControl (select для нового дизайна)
        if (this.IsListControl) {
            //устанавливаемое значение - объект коллекции ListControl.Items
            var setValueObj = {
                Value: '',
                Text: ''
            };

            var valueContainsInVariants = false;
            if (window.SM.IsNE(value)) {
                valueContainsInVariants = true;
                value = this.EmptyValue;
                setValueObj = this.EmptyValue;
            }
            else {
                //если пришел уже объект
                if (!window.SM.IsNE(value.Value) && !window.SM.IsNE(value.Text)) {
                    valueContainsInVariants = true;
                    setValueObj = value;
                }
                    //пришло только значение, без перевода (обычная строка)
                else {
                    //ищем в вариантах, т.к. приходит русское значение
                    if (this.Variants != null) {
                        var i, len = this.Variants.length;
                        for (i = 0; i < len; i++) {
                            var variant = this.Variants[i];
                            if (window.SM.IsNE(variant.Text) || window.SM.IsNE(variant.Value))
                                continue;

                            if (variant.Value == value) {
                                setValueObj = variant;
                                valueContainsInVariants = true;
                                break;
                            }
                        }
                    }

                    //проверяем пустой вариант
                    if (!valueContainsInVariants && this.EmptyValue != null) {
                        if (this.EmptyValue.Value == value) {
                            setValueObj = this.EmptyValue;
                            valueContainsInVariants = true;
                        }
                    }

                    //если по русскому слову не найден элемент в вариантах
                    if (!valueContainsInVariants)
                        throw Error("DBFieldChoice.SetValue: value.Text или value.Value is null");
                }
            }
            this.ValueControl.SetValue(setValueObj);
            this.InitValue(null, true);
        }
            //установка в остальные контролы (select - старый дизайн, radioButtons и checkBoxes)
        else {
            if (value == null)
                value = '';
            else
                value = value.toString();
            if (value == '')
                value = this.EmptyValueTitle;

            //старый select
            if (this.DisplayType.toLowerCase() == "dropdownlist" && this.HiddenInput != null) {
                if (value == '')
                    value = this.EmptyValueTitle;

                //ищем значение по option'ам select'а
                var options = this.ValueControl.options;
                var i, len = options.length;
                for (i = 0; i < len; i++) {
                    if (options[i].value == value) {
                        options[i].selected = true;
                        break;
                    }
                }
                this.InitValue(null, true);
            }
                //выбор (radiobuttons)
            else if (this.DisplayType.toLowerCase() == "radiobuttons") {
                var rows = this.ValueControl.rows;
                if (rows != null) {
                    for (var i = 0; i < rows.length; i++) {
                        var cell = rows[i].cells[0];
                        if (cell != null) {
                            var input = cell.children[0];
                            var lbl = cell.children[1];
                            if (input != null && input.tagName.toLowerCase() == "input"
                                && input.value == value) {
                                input.checked = true;
                                break;
                            }
                        }
                    }
                }
                this.InitValue(null, true);
            }
                //множ. выбор (галочки)
            else if (this.DisplayType.toLowerCase() == "checkboxes") {
                var rows = this.ValueControl.rows;
                if (rows != null) {
                    var vals = value.split(this.Separator);
                    for (var s = 0; s < vals.length; s++) {
                        var setVal = vals[s];
                        if (window.SM.IsNE(setVal))
                            continue;
                        for (var i = 0; i < rows.length; i++) {
                            var cell = rows[i].cells[0];
                            if (cell == null)
                                continue;

                            var input = null;
                            var span = cell.children[0];
                            if (span != null && !window.SM.IsNE(span.tagName) && span.tagName.toLowerCase() == 'span') {
                                if (span.children != null && span.children.length > 1)
                                    input = span.children[0];
                            }
                            //установка в checkboxes
                            if (input != null && input.tagName.toLowerCase() == "input" && span != null) {
                                var inputValue = span.getAttribute('ChoiceValue');
                                if (!window.SM.IsNE(inputValue) && inputValue == setVal)
                                    input.checked = true;
                            }
                        }
                    }
                }
                //записываем значение в скрытый текстбокс
                this.InitValue(null, true);
            }
        }
    }
}

function DBFieldChoice_ShowInformer(message) {
}

//обновляем скрытое xml значение контрола
function DBFieldChoice_InitFieldValue(fldName, pSet) {
    try {
        var field;
        var tField;
        //onchange
        var isFieldChanged = false;
        if (!window.SM.IsNE(fldName) && window.ListForm != null
                && window.ListForm.GetField != null && pSet == null) {
            fldName = DBFieldChoice_DecodeQuotes(fldName);
            field = window.ListForm.GetField(fldName);
            if (field != null && field.TypedField != null) {
                tField = field.TypedField;
                isFieldChanged = true;
            }
        }
        else
            tField = this;


        if (tField != null && tField.HiddenInput != null) {
            var value = '';
            xmldoc = window.SM.LoadXML('<ChoiceValues></ChoiceValues>');
            var xmlValue = xmldoc.documentElement.ownerDocument.createElement('ChoiceValue');
            xmldoc.documentElement.appendChild(xmlValue);

            if (tField.DisplayType.toLowerCase() == "dropdownlist") {
                if (this.IsListControl) {
                    var valObj = this.ValueControl.Value;
                    if (valObj != null)
                        value = valObj.Value;
                }
                else
                    value = tField.ValueControl.value;
            }
            else if (tField.DisplayType.toLowerCase() == "radiobuttons") {
                var rows = tField.ValueControl.rows;
                if (rows != null) {
                    for (var i = 0; i < rows.length; i++) {
                        var cell = rows[i].cells[0];
                        if (cell != null) {
                            var input = cell.children[0];
                            if (input != null && input.tagName.toLowerCase() == "input") {
                                if (input.checked) {
                                    if (window.SM.IsNE(value))
                                        value += input.value;
                                    else
                                        value += this.Separator + input.value;
                                }
                            }
                        }
                    }
                }
            }
                //множественный выбор
            else if (tField.DisplayType.toLowerCase() == "checkboxes") {
                //debugger;
                var rows = tField.ValueControl.rows;
                if (rows != null) {
                    for (var i = 0; i < rows.length; i++) {
                        var cell = rows[i].cells[0];
                        if (cell != null) {
                            //если есть парметр на сервере ChoiceValue, то генерится обертка asp.net (тег span)
                            var input, lbl;
                            var valueElement = null;
                            var span = cell.children[0];
                            if (span != null && !window.SM.IsNE(span.tagName) && span.tagName.toLowerCase() == 'span') {
                                if (span.children != null && span.children.length > 1) {
                                    valueElement = span;
                                    input = span.children[0];
                                    lbl = span.children[1];
                                }
                            }
                            else {
                                if (cell.children != null && cell.children.length > 1) {
                                    input = cell.children[0];
                                    valueElement = input;
                                    lbl = cell.children[1];
                                }
                            }
                            if (input != null && lbl != null && input.tagName.toLowerCase() == "input") {
                                if (input.checked) {
                                    if (window.SM.IsNE(value))
                                        value += $(valueElement).attr('ChoiceValue');
                                    else
                                        value += tField.Separator + $(valueElement).attr('ChoiceValue');;
                                }
                            }
                        }
                    }
                }
            }

            xmlValue.setAttribute("value", value);
            tField.HiddenInput.value = window.SM.PersistXML(xmldoc);

            if (isFieldChanged && tField != null) {
                tField.IsChange = true;
                tField.ListFormField.OnChange();
            }

            //Handlers
            if ((tField != null && isFieldChanged) || (tField != null && pSet != null)) {
                tField.IsChange = true;
                tField.ListFormField.OnChange();
            }
        }
    }
    catch (e) { }
}

//декодирует кавычки
function DBFieldChoice_DecodeQuotes(inputString) {
    if (window.SM.IsNE(inputString))
        throw new Error('Параметр inputString не может быть пустым.');
    var rgSQuot = /(_squot_)/g;
    var rgDQuot = /(_dquot_)/g
    var result = inputString.replace(rgSQuot, "'").replace(rgDQuot, '"');
    return result;
}

////////////////////////////////////////////////////////////////////