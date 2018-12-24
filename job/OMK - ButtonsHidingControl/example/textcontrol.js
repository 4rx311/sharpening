function TextControl(options) {
    var defaultOptions =
    {
        //***Параметры типизированного контрола (необязательные)
        Type: 'Text',// 'Integer', 'Number' --> тип контрола
        AllowNegativeValues: true, //--> работает для числовых контролов. Признак, который позволяет задавать отрицательные значения
        MaxValue: null,
        MinValue: null,
        NumberOfDecimals: 2,//по умолчанию два знака после запятой.
        OnInvalidPaste: null,//вызывается если с помощью ctrl+v вставить неудовлетворяющее число,
        //по умолчанию возвращает старое значение, но можно назначить свою функцию

        //***Общие параметры
        DefaultText: null,
        ControlWidth: 200,
        Templates: null,
        TemplateSeparator: null
    }
    SM.ApplyOptions(this, defaultOptions, options);

    var thisObj = this;
    this.SetDefaultText = TextControl_SetDefaultText;
    this.ClearDefaultText = TextControl_ClearDefaultText;
    this.IsEmptyTextValue = TextControl_IsEmptyTextValue;
    this.SetNumberOfDecimals = TextControl_SetNumberOfDecimals;
    this.SetControlWidth = TextControl_SetControlWidth;
    this.Disable = TextControl_Disable;
    this.Enable = TextControl_Enable;
    this.GetValue = TextControl_GetValue;
    this.SetValue = TextControl_SetValue;

    this.HasTemplates = this.Templates != null && this.Templates.length > 0;

    this.Container = window.document.createElement('div');

    var textDiv = window.document.createElement('div');
    this.Holder = textDiv;
    this.Container.appendChild(this.Holder);
    textDiv.className = 'txt_container';

    this.ContentsDiv = window.document.createElement('div');
    this.ContentsDiv.className = 'txt_divContents';
    this.Holder.appendChild(this.ContentsDiv);


    if (!SM.IsNE(this.DefaultText)) {
        this.DefaultTextDiv = window.document.createElement('div');
        this.DefaultTextDiv.className = 'txt_divDefaultText';
        var defaultTextContent = window.document.createElement('span');
        defaultTextContent.innerHTML = this.DefaultText + '...';
        this.DefaultTextDiv.tabIndex = 0;
        this.DefaultTextDiv.onfocus = function () { thisObj.ClearDefaultText(); }
        $(this.DefaultTextDiv).mouseover(function () {
            TextControl_CheckLongTitle(defaultTextContent, thisObj.DefaultText);
        });

        this.DefaultTextDiv.appendChild(defaultTextContent);
        this.ContentsDiv.appendChild(this.DefaultTextDiv);
    }

    this.TextInput = window.document.createElement('input');

    this.Control = this.TextInput;
    this.TextInput.type = 'text';
    this.TextInput.className = 'txt_input';
    this.ContentsDiv.appendChild(this.TextInput);

    if (!SM.IsNE(this.DefaultText)) {
        this.TextInput.onblur = function () {
            thisObj.SetDefaultText();
        }
        this.TextInput.onfocus = function () {
            thisObj.ClearDefaultText();
        }
    }

    if (!SM.IsNE(this.ControlWidth))
        this.ControlWidth = SM.ParseIntMetric(this.ControlWidth);
    if (!(this.ControlWidth > 0))
        this.ControlWidth = 200;
    this.SetControlWidth(this.ControlWidth);

    if (!SM.IsNE(this.DefaultText))
        this.SetDefaultText();

    //шаблоны
    if (this.HasTemplates) {
        this.OpenTemplatesDiv = window.document.createElement('div');
        this.OpenTemplatesDiv.className = 'txt_imageSelector txt_divOpenWin';
        this.Holder.appendChild(this.OpenTemplatesDiv);

        this.DropDownTemplates = new DropDownControl({
            ParentControl: this.Holder,
            Trigger: this.OpenTemplatesDiv,
            Items: this.Templates
        });
        this.DropDownTemplates.AttachEvent(this.DropDownTemplates.HandlerNames.OnChange, function (sender) {
            var value = sender.Value;
            if (SM.IsNE(value))
                value = '';
            if (!SM.IsNE(thisObj.TemplateSeparator)) {
                if (thisObj.TextInput.value.length > 0)
                    value = thisObj.TextInput.value + thisObj.TemplateSeparator + value;
            }
            thisObj.TextInput.value = value;
            if (thisObj.TextInput.onchange != null)
                thisObj.TextInput.onchange();
            if (!SM.IsNE(value))
                thisObj.ClearDefaultText();
        });
        this.Container.appendChild(this.DropDownTemplates.Container);
    }

    //тип контрола
    if (this.Type == 'Integer' || this.Type == 'Number') {
        TextControl_PrepareTypedControl.call(this);
    }
    else {
        if (this.MaxLength > 0)
            this.TextInput.maxLength = this.MaxLength;
    }
}

function TextControl_SetControlWidth(controlWidth) {
    if (!SM.IsNE(controlWidth)) {
        controlWidth = SM.ParseIntMetric(controlWidth);
        if (controlWidth > 10) {
            if (SM.DTD)
                controlWidth -= 2;
            this.Holder.style.width = controlWidth + 'px';
            if (this.HasTemplates)
                this.ContentsDiv.style.width = controlWidth - 22 + 'px';
        }
    }
}

function TextControl_CheckLongTitle(longTitleElement, defaultTitle) {
    if (!longTitleElement.titleChecked) {
        if (longTitleElement.offsetWidth > longTitleElement.parentNode.offsetWidth)
            longTitleElement.title = defaultTitle != null ? defaultTitle : (longTitleElement.innerText != null ? longTitleElement.innerText : longTitleElement.textContent);
        longTitleElement.titleChecked = true;
    }
}

function TextControl_GetValue() {
    var value = this.TextInput.value;
    if (value == this.DefaultText)
        value = '';
    return value;
}

function TextControl_SetValue(value) {
    var valueToSet = '';
    if (this.Type == 'Integer' || this.Type == 'Number') {
        var valid = TextControl_CheckData.call(this, value);
        if (valid && !SM.IsNE(value))
            valueToSet = TextControl_FormatNumber.call(this, value);
    }
    else
        valueToSet = value;

    this.TextInput.value = valueToSet;
}


function TextControl_SetDefaultText() {
    if (!SM.IsNE(this.DefaultText) && SM.IsNE(this.TextInput.value)) {
        $(this.Holder).addClass('txt_showDefaultText');
        this.Holder.title = '';
        this.IsDefaultText = true;
    }
}

function TextControl_ClearDefaultText() {
    if (!SM.IsNE(this.DefaultText)) {
        if (!this.IsDefaultTextClearing) {
            this.IsDefaultTextClearing = true;

            $(this.Holder).removeClass('txt_showDefaultText');
            this.Holder.title = this.DefaultText;
            if (this.TextInput.offsetWidth > 0)
                this.TextInput.focus();
            this.IsDefaultText = false;

            this.IsDefaultTextClearing = false;
        }
    }
}

function TextControl_SetNumberOfDecimals(value) {
    if (this.Type == 'Number' && !SM.IsNE(value)) {
        this.NumberOfDecimals = value;
        this.AutoNumberOfDecimals = this.NumberOfDecimals == -1;
    }
}

function TextControl_IsEmptyTextValue() {
    return !(/[^\s]+/g.test(this.TextInput.value));
}

function TextControl_Disable() {
    this.TextInput.readOnly = true;
    this.TextInput.style.color = "#4a4a4a";

    if (this.HasTemplates) {
        this.OpenTemplatesDiv.style.display = 'none';
        if (this.ContentsDiv != null) {
            var controlWidth = this.ControlWidth;
            if (SM.DTD)
                controlWidth -= 2;
            this.ContentsDiv.style.width = controlWidth + 'px';
        }
    }
}

function TextControl_Enable() {
    this.TextInput.readOnly = false;
    this.TextInput.style.color = "#000";

    if (this.HasTemplates) {
        this.OpenTemplatesDiv.style.display = '';
        if (this.ContentsDiv != null) {
            var controlWidth = this.ControlWidth;
            if (SM.DTD)
                controlWidth -= 2;
            this.ContentsDiv.style.width = controlWidth - 22 + 'px';
        }
    }
}

/****** FORMATTING ******/
function TextControl_FormatNumber(value) {
    if (value == null)
        throw new Error('value is null');

    var valueString = value.toString();
    valueString = TextControl_RemoveSpaces(valueString);

    var intPart = valueString;
    var fractionPart = '';

    if (this.NumberOfDecimals > 0 || this.AutoNumberOfDecimals) {
        var dotSymbol = '';
        var decimalSepIndex = TextControl_GetDecimalSeparatorPosition(valueString);
        if (decimalSepIndex > -1)
            dotSymbol = valueString[decimalSepIndex];

        var formatFractionPart = decimalSepIndex > -1;
        //Приводим дробную часть к виду формата
        if (formatFractionPart) {
            intPart = valueString.substr(0, decimalSepIndex);
            fractionPart = valueString.substr(decimalSepIndex + 1);
            if (!this.AutoNumberOfDecimals) {
                var fpLen = 0;
                if (!SM.IsNE(fractionPart))
                    fpLen = fractionPart.length;

                if (fpLen > this.NumberOfDecimals)
                    fractionPart = fractionPart.substr(0, this.NumberOfDecimals);
                else if (fpLen < this.NumberOfDecimals) {
                    var delta = this.NumberOfDecimals - fpLen;
                    for (i = 0; i < delta; i++)
                        fractionPart += '0';
                }
            }
        }
    }

    // не позволяем вводить больше одного нуля.
    if (!SM.IsNE(intPart)) {
        //смотрим на предмет составления числа из одних нулей (в этом случае нужно не допустить более одного 0)
        var i, len = intPart.length;

        if (len > 1) {
            var intPartContainsOnlyZero = true;
            var signPosition = intPart.indexOf('-');
            var intPartContainsSign = signPosition > -1;
            var intPartContainsOnlyZeroAndSign = intPartContainsSign;

            for (i = 0; i < len; i++) {
                var symbol = intPart[i];
                if (symbol != '0')
                    intPartContainsOnlyZero = false;

                if (intPartContainsOnlyZeroAndSign) {
                    if (symbol == '-')
                        continue;

                    if (symbol != '0')
                        intPartContainsOnlyZeroAndSign = false;
                }
            }

            if (intPartContainsOnlyZeroAndSign)//-000
                intPart = '-0';
            else if (intPartContainsOnlyZero)//000
                intPart = '0';
            else {
                //-000x
                //000x
                var tmpIntPart;
                if (intPartContainsSign)
                    tmpIntPart = intPart.substr(signPosition + 1);
                else
                    tmpIntPart = intPart;

                //убираем первый 0, если вводят 0, а затем любое число от 1 до 9
                while (tmpIntPart != null && tmpIntPart.charAt(0) == '0')
                    tmpIntPart = tmpIntPart.substr(1);

                if (intPartContainsSign)
                    intPart = '-';
                else
                    intPart = '';

                intPart += tmpIntPart;
            }
        }
    }

    //форматируем целую часть
    if (intPart.length > 3) {
        var intPartReverse = TextControl_ReverseString(intPart);
        var i, len = intPartReverse.length;
        var intPartReverseFormat = '';
        var spacesCount = 0;

        for (i = 0; i < len; i++) {
            intPartReverseFormat += intPartReverse[i];
            if ((intPartReverseFormat.length - spacesCount) % 3 == 0) {
                intPartReverseFormat += ' ';
                spacesCount++;
            }
        }

        intPartReverseFormat = intPartReverseFormat.trim(' ');
        intPart = TextControl_ReverseString(intPartReverseFormat);
    }

    valueString = intPart;
    if (formatFractionPart) {
        //целая часть пустая, добавляем сначала 0
        if (SM.IsNE(intPart))
            valueString += '0';

        valueString += '.' + fractionPart;
    }

    //если начинается с минуса и пробела, то удаляем пробел после минуса
    if (valueString.indexOf('- ') == 0)
        valueString = '-' + valueString.substr(2);

    return valueString;
}

function TextControl_RemoveSpaces(str) {
    if (str == null)
        str = '';
    else
        str = str.toString();

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

function TextControl_ReverseString(value) {
    if (SM.IsNE(value))
        throw new Error('value is null');

    var result = '';
    var arr = [];
    var i, len = value.length;
    for (i = 0; i < len; i++)
        arr.push(value[i]);

    arr = arr.reverse();

    i, len = arr.length;
    for (i = 0; i < len; i++)
        result += arr[i];

    return result;
}

function TextControl_GetTypedCharParam(e) {
    var typedSymbol;
    if (SM.IsIE)
        typedSymbol = e.char;
    else
        typedSymbol = e.key;

    var isBackSpaceKey = e.which == 8 && !SM.IsNE(typedSymbol) && typedSymbol.toLowerCase() == 'backspace';/*backspace*/
    var isDeleteKey = e.which == 46 && !SM.IsNE(typedSymbol) && typedSymbol.toLowerCase() == 'del';/*delete*/

    return {
        Which: e.which,
        Symbol: typedSymbol,
        IsDeleteKey: isDeleteKey,
        IsBackspaceKey: isBackSpaceKey
    };
}

function TextControl_PrepareTypedControl() {
    var thisObj = this;
    if (this.Type == 'Integer') {
        TextControl_UpdateMaxLength.call(thisObj);
    }
    else if (this.Type == 'Number') {
        this.AutoNumberOfDecimals = this.NumberOfDecimals == -1;
    }
    //delete or backspace or insert
    $(this.TextInput).keydown(function (e) {
        //insert
        if (e.which == 45)
            return false;

        var selectionStart, selectionEnd;
        if (SM.IsIE8) {
            var selectionOptions = TextControl_GetInputSelection(this);
            selectionStart = selectionOptions.Start;
            selectionEnd = selectionOptions.End;
        }
        else {
            selectionStart = this.selectionStart;
            selectionEnd = this.selectionEnd;
        }

        var selectionValue = '';
        if (!SM.IsNE(thisObj.TextInput.value)) {
            var previousLength = thisObj.TextInput.value.length;
            if (previousLength >= selectionEnd && selectionStart >= 0)
                selectionValue = thisObj.TextInput.value.substring(selectionStart, selectionEnd);
        }


        return TextControl_OnModified.call(thisObj, {
            Operation: 'Delete',
            PreviousValue: thisObj.TextInput.value,
            Event: e,
            Which: e.which,
            PositionStart: selectionStart,
            PositionEnd: selectionEnd,
            SelectionCount: selectionEnd - selectionStart,
            SelectionValue: selectionValue
        });
    });

    //запрещенные символы и форматирование значения
    $(this.TextInput).keypress(function (e) {
        var selectionStart, selectionEnd;
        if (SM.IsIE8) {
            var selectionOptions = TextControl_GetInputSelection(this);
            selectionStart = selectionOptions.Start;
            selectionEnd = selectionOptions.End;
        }
        else {
            selectionStart = this.selectionStart;
            selectionEnd = this.selectionEnd;
        }

        var selectionValue = '';
        if (!SM.IsNE(thisObj.TextInput.value)) {
            var previousLength = thisObj.TextInput.value.length;
            if (previousLength >= selectionEnd && selectionStart >= 0)
                selectionValue = thisObj.TextInput.value.substring(selectionStart, selectionEnd);
        }

        return TextControl_OnModified.call(thisObj, {
            Operation: 'Modify',
            PreviousValue: thisObj.TextInput.value,
            Event: e,
            Which: e.which,
            PositionStart: selectionStart,
            PositionEnd: selectionEnd,
            SelectionCount: selectionEnd - selectionStart,
            SelectionValue: selectionValue
        });
    });

    //запрет на вставку некорректных данных
    $(this.TextInput).bind('paste', function (e) {
        TextControl_OnModified.call(thisObj, {
            Event: e,
            Operation: 'Paste',
            PreviousValue: thisObj.TextInput.value
        });
    });
}

function TextControl_GetSpacesCount(str) {
    var count = 0;
    if (!SM.IsNE(str)) {
        var i, len = str.length;
        for (i = 0; i < len; i++) {
            var symbol = str[i];
            if (symbol == ' ')
                count++;
        }
    }

    return count;
}

function TextControl_GetDecimalSeparatorPosition(str) {
    var position = -1;
    if (!SM.IsNE(str)) {
        position = str.indexOf(',');
        if (position == -1)
            position = str.indexOf('.');
    }

    return position;
}

function TextControl_OnModified(options) {
    if (options == null)
        throw new Error('options is null');

    if (options.PreviousValue == null)
        options.PreviousValue = '';

    var thisObj = this;
    this.LastTimeOutID = 0;
    if (options.Operation == 'Paste') {
        thisObj.LastTimeOutID = setTimeout(function () {
            clearTimeout(thisObj.LastTimeOutID);
            var valid = TextControl_CorrectInvalidValue.call(thisObj, options);
            var currentValue = thisObj.TextInput.value;
            var formattedValue = '';
            if (!SM.IsNE(currentValue))
                formattedValue = TextControl_FormatNumber.call(thisObj, currentValue);
            thisObj.TextInput.value = formattedValue;
            TextControl_UpdateMaxLength.call(thisObj);
            TextControl_OnModifiedHandler.call(thisObj);
        }, 5);
    }
    else if (options.Operation == 'Delete') {
        var isBackSpace = options.Which == 8;/*backspace*/
        var isDelete = options.Which == 46;/*delete*/
        if (isDelete || isBackSpace) {
            this.LastTimeOutID = setTimeout(function () {
                clearTimeout(thisObj.LastTimeOutID);
                //получаем новое значение с учетом добавленного символа
                var currentValue = thisObj.TextInput.value;
                if (currentValue == null)
                    currentValue = '';
                var formattedValue = TextControl_FormatNumber.call(thisObj, currentValue);

                var selectionCount = 0;
                if (options.SelectionCount > 0)
                    selectionCount = options.SelectionCount;

                var positionCalculated = false;
                var previousValueContainsDecimalSep = false;
                var currentValueContainsDecimalSep = false;
                if (!SM.IsNE(options.PreviousValue))
                    previousValueContainsDecimalSep = TextControl_GetDecimalSeparatorPosition(options.PreviousValue) > -1;
                if (!SM.IsNE(formattedValue))
                    currentValueContainsDecimalSep = TextControl_GetDecimalSeparatorPosition(formattedValue) > -1;

                //если разделитель был и его не стало => его удалили
                var isDecimalSepDeleted = previousValueContainsDecimalSep && !currentValueContainsDecimalSep;
                //удален разделитель
                if (isDecimalSepDeleted) {
                    //позиция зависящая от нажатой клавиши(если backspace, то нужно убрать один символ)
                    var positionByWhich = options.PositionStart;
                    if (isBackSpace && selectionCount == 0)
                        positionByWhich -= 1;

                    var tmpValue = '';
                    if (positionByWhich > 0 && options.PreviousValue.length > positionByWhich)
                        tmpValue = options.PreviousValue.substr(0, positionByWhich);

                    formattedValue = TextControl_FormatNumber.call(thisObj, tmpValue);
                    newPosition = 1000;
                    positionCalculated = true;
                }

                if (!positionCalculated) {
                    var oldPosition = 0;
                    if (options.PositionEnd > 0)
                        oldPosition = options.PositionEnd;

                    var oldLength = options.PreviousValue.length;
                    var unsigned = options.PreviousValue.indexOf('-') == -1;
                    //только числовая длина (без учета символа)
                    var digitOldLength = 0;
                    if (oldLength > 0) {
                        digitOldLength = oldLength;
                        if (!unsigned)
                            digitOldLength -= 1;
                    }

                    var newPosition = oldPosition - selectionCount;

                    var spacesCount = 0;
                    var selectionContainsSpaces = false;
                    if (selectionCount > 0) {
                        if (!SM.IsNE(options.SelectionValue))
                            spacesCount = TextControl_GetSpacesCount(options.SelectionValue);

                        selectionContainsSpaces = spacesCount > 0;
                    }

                    if (selectionCount >= 5) {
                        //выделены могут быть сразу два пробела, но один из них уберется при форматировании
                        //так что реальный selectionCount нужно убавить на 1

                        //если в строке больше одного пробела, то прибавляем +1 к текущей позиции
                        if (spacesCount > 1)
                            newPosition++;
                    }
                    else if (selectionCount < 4 && selectionCount > 0) {
                        //количество пробелов до курсора увеличилось в результате форматирования.
                        var spacesBeforeIncrease = false;
                        var spaceBeforeCount = 0;
                        var spaceBeforeCurrentCount = 0;

                        if (options.PreviousValue.length > options.PositionStart) {
                            var stringBeforeCursor = options.PreviousValue.substr(0, options.PositionStart);
                            spaceBeforeCount = TextControl_GetSpacesCount(stringBeforeCursor);
                        }

                        if (formattedValue.length > newPosition) {
                            var currentStringBeforeCursor = formattedValue.substr(0, newPosition);
                            spaceBeforeCurrentCount = TextControl_GetSpacesCount(currentStringBeforeCursor);
                        }

                        if (spaceBeforeCurrentCount > spaceBeforeCount)
                            spacesBeforeIncrease = true;

                        if (spacesBeforeIncrease)
                            newPosition += 1;
                    }
                    else if (selectionCount == 0) {
                        //если ничего не выделено и соседний символ = пробел, то нужно удалить соседний символ.
                        //для backspace это будет -1 сдвиг влево, для delete будет +1 вправо
                        //1 проверяем, что предыдущий символ это пробел
                        var edgePosition = newPosition;
                        if (isBackSpace)
                            edgePosition -= 1;

                        var edgeSpace = false;
                        if (oldLength > edgePosition && edgePosition > 0) {
                            var edgeSymbol = options.PreviousValue.substr(edgePosition, 1);
                            if (edgeSymbol == ' ')
                                edgeSpace = true;
                        }


                        if (edgeSpace) {
                            if (isBackSpace) {
                                newPosition -= 1;

                                //проверяем, что соседний с удаленным символом символ существует, его и нужно удалить
                                edgePosition -= 1;
                            }

                            if (oldLength > edgePosition && currentValue.length > edgePosition) {
                                //удаляем символ перед пробелом
                                var newValue = currentValue.substr(0, edgePosition);
                                newValue += currentValue.substr(edgePosition + 1);

                                //и заного форматируем новое значение
                                formattedValue = TextControl_FormatNumber.call(thisObj, newValue);
                            }

                            if (isDelete)
                                newPosition += 1;
                        }
                        //сдвигаем курсор, в зависимости от клавиши удаления
                        if (isBackSpace)
                            newPosition -= 1;
                    }

                    //если удалился пробел в результате форматирования
                    if (currentValue.length > formattedValue.length)
                        newPosition -= 1;
                }

                thisObj.TextInput.value = formattedValue;
                TextControl_SetCaretPosition.call(thisObj.TextInput, newPosition);
                TextControl_UpdateMaxLength.call(thisObj);
                TextControl_OnModifiedHandler.call(thisObj);
            }, 5, null);
        }
    }
    else if (options.Operation == 'Modify') {
        //#region Проверка возможности ввода символа
        //в браузере FireFox стрелки и Delete возвращают нулевой код.
        if (SM.IsFF && options.Which == 0)
            return true;

        //debugger
        var typedParam = TextControl_GetTypedCharParam(options.Event);
        //запятая и точка в разных раскладкаъ имеет тот же код, что и в другой раскладке, но другой символ
        //поэтому сравниваем коды и символы. Б и Ю не разрешены в числовых полях.
        if (typedParam.Which == 1041 && typedParam.Symbol == "Б" ||
        typedParam.Which == 1070 && typedParam.Symbol == "Ю")
            return false;

        //debugger
        //SM.WriteLog("code:" + typedParam.Which + ", symbol:" + typedParam.Symbol);

        /*if (options.Which == 8 || options.Which == 46) {
            
            if (typedParam.IsDeleteKey || typedParam.IsBackspaceKey)
                return false;
        }*/

        //символ пробела (пробелы форматируются автоматически)
        if (options.Which == 32)
            return false;

        if (thisObj.Type == 'Integer') {
            //если превышена длина поля, то оставляем каретку на месте
            if (SM.IsNE(options.SelectionValue) && !SM.IsNE(thisObj.TextInput.value)
            && thisObj.TextInput.value.length >= thisObj.TextInput.maxLength) {
                return false;
            }
        }

        var minusPosition = options.PreviousValue.indexOf('-');
        var currentPosition = options.PositionStart
        var currentEndPosition = options.PositionEnd;

        //смотрим если минус выделен, то можно добавить цифру
        var minusSelected = false;
        if (!SM.IsNE(options.SelectionValue))
            minusSelected = options.SelectionValue.indexOf('-') != -1;

        var spaceTyped = options.Which == 45;
        var decimalSepTyped = options.Which == 46 || options.Which == 44 ||
                            options.Which == 1041 || options.Which == 1070;

        //-1 это режим автознаком, сколько введено, столько и видно.
        if (decimalSepTyped && this.NumberOfDecimals < 1 && !this.AutoNumberOfDecimals)
            return false;

        //минус можно только добавить сначала
        if (spaceTyped) {
            if (!thisObj.AllowNegativeValues)
                return false;

            if (currentPosition != 0)
                return false;

            //минус уже может быть добавлен
            if (minusPosition != -1) {
                if (!minusSelected)
                    return false;
            }
        }

        //0 нельзя вводить если коретка вначале и уже есть какие-то символы
        //при этом вся строка не должна быть выделенной и строка должна уже быть
        var typedSymbol = String.fromCharCode(options.Which);
        if (currentPosition == 0 && options.SelectionValue != options.PreviousValue
            && !SM.IsNE(options.PreviousValue) && typedSymbol == '0')
            return false;

        if (thisObj.Type == 'Number') {
            if (!(options.Which == 8 || options.Which == 44 || options.Which == 45 ||
            options.Which == 46 || options.Which == 32 || (options.Which > 47 && options.Which < 58)
            || options.Which == 1041 || options.Which == 1070))
                return false;

            if (decimalSepTyped) {
                var decimalSepPosition = TextControl_GetDecimalSeparatorPosition(options.PreviousValue);
                //нельзя дописать разделитель дробной части если он уже есть и не выделен
                if (decimalSepPosition > -1) {
                    var decimalSepSelected = false;
                    if (!SM.IsNE(options.SelectionValue)) {
                        var selectedDecimalSepPosition = TextControl_GetDecimalSeparatorPosition(options.SelectionValue);
                        decimalSepSelected = selectedDecimalSepPosition > -1;
                    }

                    if (!decimalSepSelected)
                        return false;
                }
            }
        }
        else if (thisObj.Type == 'Integer') {
            if (!spaceTyped) {
                if (!(options.Which == 8 || (options.Which > 47 && options.Which < 58)))
                    return false;
            }

            //нельзя добавить символы впереди минуса
            //только если текущая позиция в самом начале и после нее нет символов минуса
            if (minusPosition > -1 && currentPosition <= minusPosition) {
                if (!minusSelected)
                    return false;
            }

            var valueLen = options.PreviousValue.length;
            var inputMaxlen = thisObj.TextInput.maxLength;
            //достигнуто максимальная длина поля, но если был введен минус, то его нужно увеличить.
            if (valueLen == inputMaxlen && inputMaxlen > 0) {
                if (spaceTyped)
                    thisObj.TextInput.maxLength++;
            }
        }
        //#endregion

        this.LastTimeOutID = setTimeout(function () {
            clearTimeout(this.LastTimeOutID);
            //получаем новое значение с учетом добавленного символа
            var currentValue = thisObj.TextInput.value;
            if (currentValue == null)
                currentValue = '';

            var formattedValue = TextControl_FormatNumber.call(thisObj, currentValue);

            var oldPosition = 0;
            if (options.PositionEnd > 0)
                oldPosition = options.PositionEnd;

            var selectionCount = 0;
            if (options.SelectionCount > 0)
                selectionCount = options.SelectionCount;

            var spacesCount = 0;
            var selectionContainsSpaces = false;
            if (selectionCount > 0) {
                if (!SM.IsNE(options.SelectionValue))
                    spacesCount = TextControl_GetSpacesCount(options.SelectionValue);

                selectionContainsSpaces = spacesCount > 0;
            }

            var selectionCount = 0;
            if (options.SelectionCount > 0)
                selectionCount = options.SelectionCount;

            var newPosition = oldPosition + 1 - selectionCount;
            if (selectionContainsSpaces > 1)
                newPosition -= 1;

            //если текущее неформатированное значение подходит под формат: 0*,ххх
            //где звездочка позиция курсора, т.е. курсор был после 0, 
            //то 0 обрежется и позицию курсора нужно уменьшить на единицу
            //но только в том случае, если курсор стоит сразу после 0 и после 0 есть еще другие цифры
            //если курсор стоит в дробной части, то позицию от курсора отнимать не нужно
            var positionCalculated = false;
            if (thisObj.Type == 'Number') {
                if (currentValue.length > 1 && currentValue.indexOf('0') == 0
                    && selectionCount == 0 && oldPosition < 2) {
                    //oldPosition < 2 - значит курсор до знака разделителя
                    newPosition -= 1;
                }

                var currentValueContainsDecimalSep = false;
                var decimalSepPosition = -1;
                if (!SM.IsNE(formattedValue)) {
                    decimalSepPosition = TextControl_GetDecimalSeparatorPosition(formattedValue)
                    currentValueContainsDecimalSep = decimalSepPosition > -1;
                }

                //если был введен разделитель
                if (decimalSepTyped) {
                    //нужно установить курсор сразу после разделителя
                    if (currentValueContainsDecimalSep > -1) {
                        newPosition = decimalSepPosition + 1;
                        positionCalculated = true;
                    }
                }
                else {
                    var previousValueContainsDecimalSep = false;
                    if (!SM.IsNE(options.PreviousValue))
                        previousValueContainsDecimalSep = TextControl_GetDecimalSeparatorPosition(options.PreviousValue) > -1;

                    //если разделитель был и его не стало => его удалили
                    var isDecimalSepDeleted = previousValueContainsDecimalSep && !currentValueContainsDecimalSep;
                    //удален разделитель
                    if (isDecimalSepDeleted) {
                        var tmpValue = '';
                        if (options.PositionStart > 0 && options.PreviousValue.length > options.PositionStart)
                            tmpValue = options.PreviousValue.substr(0, options.PositionStart);

                        tmpValue += String.fromCharCode(options.Which);
                        formattedValue = TextControl_FormatNumber.call(thisObj, tmpValue);
                        newPosition = 1000;
                        positionCalculated = true;
                    }
                }
            }

            if (!positionCalculated) {
                //количество пробелов до курсора уменьшилось в результате форматирования.
                var spaceBeforeCount = 0;
                var spaceBeforeCurrentCount = 0;
                var deltaSpaces = 0;

                if (options.PreviousValue.length > options.PositionStart) {
                    var stringBeforeCursor = options.PreviousValue.substr(0, options.PositionStart);
                    spaceBeforeCount = TextControl_GetSpacesCount(stringBeforeCursor);
                }

                if (formattedValue.length > 0) {
                    var currentStringBeforeCursor = formattedValue.substr(0, newPosition);
                    spaceBeforeCurrentCount = TextControl_GetSpacesCount(currentStringBeforeCursor);
                }

                //разница между текущим кол-вом пробелов до курсора и между тем, что было до редактирования
                deltaSpaces = spaceBeforeCurrentCount - spaceBeforeCount;
                newPosition += deltaSpaces;
            }

            thisObj.TextInput.value = formattedValue;
            TextControl_SetCaretPosition.call(thisObj.TextInput, newPosition);
            TextControl_UpdateMaxLength.call(thisObj);
            TextControl_OnModifiedHandler.call(thisObj);
        }, 5);
    }
}

function TextControl_OnModifiedHandler() {
    if (this.TextInput.onchange != null)
        this.TextInput.onchange();
}

function TextControl_UpdateMaxLength() {
    if (this.Type == 'Integer') {
        var currentValue = this.TextInput.value;
        var minusExists = false;
        if (!SM.IsNE(currentValue))
            minusExists = currentValue.indexOf('-') != -1;

        var maxLen = 0;
        //больше в int не помещается
        if (this.AllowNegativeValues)
            maxLen = 14;
        else
            maxLen = 13;

        if (!minusExists)
            maxLen -= 1;

        if (this.MaxLength > 0 && maxLen > this.MaxLength)
            maxLen = this.MaxLength;

        this.TextInput.maxLength = maxLen;
    }
}

function TextControl_SetCaretPosition(caretPos) {
    if (this.createTextRange) {
        var range = this.createTextRange();
        range.move('character', caretPos);
        range.select();
    }
    else {
        if (this.selectionStart) {
            this.focus();
            this.setSelectionRange(caretPos, caretPos);
        }
        else
            this.focus();
    }
}

function TextControl_CorrectInvalidValue(options) {
    var currentValue = this.TextInput.value;
    var valid = true;
    if (!SM.IsNE(currentValue)) {
        valid = TextControl_CheckData.call(this, currentValue);
        if (!valid) {
            //пришло неправильное число
            if (this.OnInvalidPaste != null)
                this.OnInvalidPaste(options);
                //по умолчанию вставляем предыдущее значение
            else
                $(this.TextInput).val(options.PreviousValue);
        }
    }

    return valid;
}

function TextControl_CheckData(value) {
    var valid;
    var handler = null;

    if (this.Type == 'Integer')
        handler = TextControl_CheckPasteIntegerData;
    else
        handler = TextControl_CheckPasteNumberData;

    valid = handler.call(this, value);
    return valid;
}

function TextControl_CheckPasteIntegerData(value) {
    var valid = true;
    if (!SM.IsNullOrEmpty(value)) {
        var valTrim = TextControl_RemoveSpaces(value);
        if (!SM.IsNullOrEmpty(valTrim)) {
            //проверка на покрректность
            var regEx = /^[-]?[\d]+$/

            var maxInt = 2147483647;
            if (!SM.IsNE(this.MaxValue))
                maxInt = parseInt(this.MaxValue);

            var minInt = -2147483648;
            if (!SM.IsNE(this.MinValue))
                minInt = parseInt(this.MinValue);

            var valInteger = parseInt(valTrim);
            if (!regEx.test(valTrim) || valInteger == null) {
                //ввели только символ знака.
                if (valTrim != '-')
                    valid = false;
                else {
                    if (!this.AllowNegativeValues)
                        valid = false;
                }
            }

            if (valid) {
                if (!this.AllowNegativeValues && valInteger < 0)
                    valid = false;

                if (valInteger > maxInt)
                    valid = false;

                else if (valInteger < minInt)
                    valid = false;
            }
        }
    }

    return valid;
}

function TextControl_CheckPasteNumberData(value) {
    var valid = true;
    if (!SM.IsNullOrEmpty(value)) {
        var valTrim = TextControl_RemoveSpaces(value);
        if (!SM.IsNullOrEmpty(valTrim)) {
            //проверка на покрректность
            var regEx = /^(([-]?[1-9]+\d*[\.\,]{1,1}\d+)|([-]?0\d*[\.\,]\d+)|(0{1,1})|([-]?[1-9]+\d*))$/

            var valid = true;
            var tempVal = TextControl_RemoveSpaces(value).replace(",", ".");
            var valDouble = parseFloat(tempVal);
            var minVal = parseFloat(this.MinValue);
            var maxVal = parseFloat(this.MaxValue);
            if (!regEx.test(tempVal) || valDouble == null)
                valid = false;

            if (valid) {
                if (regEx.test(minVal) && minVal > valDouble)
                    valid = false;

                if (regEx.test(maxVal) && maxVal < valDouble)
                    valid = false;
            }
        }
    }

    return valid;
}

///Возвращает параметры выделения для input в IE8 (в IE8 нет стандартной el.positionStart и el.positionEnd)
function TextControl_GetInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        Start: start,
        End: end
    };
}