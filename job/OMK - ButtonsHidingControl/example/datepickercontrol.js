//debugger
function DatePickerControl(options) {
    var defaultOptions =
    {
        DoubleDate: false,
        ShowTime: false,
        ShowDayOfWeek: false,
        ControlWidth: 85,
        DefaultText: null,
        TimeVertical: false,
        TrimDisabledWidth: true,
        DefaultValue: null,
        ContainerID: null
    }
    SM.ApplyOptions(this, defaultOptions, options);

    if (this.ShowDayOfWeek)
        this.ControlWidth = 95;

    if (!SM.IsNE(this.ControlWidth)) {
        this.ControlWidth = SM.ParseIntMetric(this.ControlWidth);
        if (this.ControlWidth < 85)
            this.ControlWidth = 85
    }
    else
        this.ControlWidth = 85;

    var thisObj = this;

    this.ChangeHandlers = new Array();
    this.AddChangeHandler = DP_AddChangeHandler;
    this.OnChange = DP_OnChange;
    this.Disable = DP_Disable;
    this.Enable = DP_Enable;
    this.Hide = DP_Hide;
    this.Display = DP_Display;
    this.SetDefaultText = DP_SetDefaultText;
    this.ClearDefaultText = DP_ClearDefaultText;
    this.UpdateDayOfWeek = DP_UpdateDayOfWeek;

    //Initialization
    if (this.ShowTime) {
        this.DoubleDate = false;
        _DateTimeControl.call(this, {
            ControlWidth: thisObj.ControlWidth,
            DefaultText: thisObj.DefaultText,
            TimeVertical: thisObj.TimeVertical,
            TrimDisabledWidth: thisObj.TrimDisabledWidth,
            ShowDayOfWeek: thisObj.ShowDayOfWeek
        });
        this.DateInput = this.DateControl.DateInput;
    }
    else if (this.DoubleDate) {
        _DoubleDateControl.call(this, {
            DefaultText: thisObj.DefaultText,
            ShowDayOfWeek: false
        });
    }
    else {
        this.DateControl = new _DateControl({
            DefaultText: thisObj.DefaultText,
            ControlWidth: thisObj.ControlWidth,
            TrimDisabledWidth: thisObj.TrimDisabledWidth,
            ShowDayOfWeek: thisObj.ShowDayOfWeek
        }, this);
        this.Container = this.DateControl.Container;
        this.DateInput = this.DateControl.DateInput;
    }
    if (!this.DoubleDate) {
        this.SetValue = DP_SetValue;
        this.SetDateObject = DP_SetDateObject;
        this.SetDateTime = DP_SetDateTime;
        this.SetDate = DP_SetDate;
        this.SetTime = DP_SetTime;
        this.SetHour = DP_SetHour;
        this.SetMinute = DP_SetMinute;
        this.IsValid = DP_IsValid;
        this.CheckDate = DP_CheckDate;
        this.CheckDateTime = DP_CheckDateTime;
        this.InvokeSetValue = DP_InvokeSetValue;

        this.GetDate = DP_GetDate;
        this.GetDateObject = DP_GetDateObject;
        this.GetValue = DP_GetValue;
        this.GetDateTime = DP_GetDateTime;
    }
    if (!SM.IsNE(this.ContainerID)) {
        var externalContainer = window.document.getElementById(this.ContainerID);
        if (externalContainer == null)
            throw new Error('Не удалось получить контэйнер контрола поля даты.');

        this.ValueHidden = window.document.createElement('input');
        this.ValueHidden.type = 'hidden';
        var valueHiddenID = this.ContainerID + '_valueInput';
        this.ValueHidden.id = valueHiddenID;
        this.ValueHidden.name = valueHiddenID;
        this.Container.appendChild(this.ValueHidden);

        externalContainer.appendChild(this.Container);
        externalContainer.DateControl = this;
    }
    if (!this.DoubleDate) {
        if (!SM.IsNE(this.DefaultValue))
            this.SetDateTime(this.DefaultValue);
    }
}

/*------------------------DayOfWeek---------------------*/
function DP_UpdateDayOfWeek() {
    if (this.DateControl == null || this.DateControl.DivWeekDay == null || this.DateInput == null)
        return;

    var dateString = this.DateInput.value;

    var newDate = null;
    var valid = false;
    if (!window.SM.IsNE(dateString)) {
        var splits = dateString.split('.');
        if (splits.length == 3) {
            var day = -1;
            var month = -1;

            var dayStr = splits[0];
            if (dayStr.charAt(0) == '0' && dayStr.length == 2)
                dayStr = dayStr.substring(1);
            day = parseInt(dayStr);
            var monthStr = splits[1];
            if (monthStr.charAt(0) == '0' && monthStr.length == 2)
                monthStr = monthStr.substring(1);
            month = parseInt(monthStr);

            var year = -1;
            year = parseInt(splits[2]);
            try {
                newDate = new Date(year, month - 1, day, 1, 1, 1);
                if (DP_CheckDateTimeValue(day, month, year))
                    valid = true;
            }
            catch (e) { }
        }
    }

    if (newDate != null) {
        var index = newDate.getDay();
        if (index == 0)
            index = 6
        else
            index--;
        result = GetStringDayOfWeek(index);
    }

    if (valid)
        $(this.DateControl.DivWeekDay).text(result);
    else
        $(this.DateControl.DivWeekDay).text('');
}

function GetStringDayOfWeek(index) {
    var result = '';
    if (index == 0)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.monday');
    else if (index == 1)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.tuesday');
    else if (index == 2)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.wednesday');
    else if (index == 3)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.thursday');
    else if (index == 4)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.friday');
    else if (index == 5)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.saturday');
    else if (index == 6)
        result = window.TN.TranslateKey('ui.datecontrol.weekdays.sunday');

    return result;
}

/*------------------------Common------------------------*/
//debugger
function DP_Disable() {
    if (this.DoubleDate || this.Disabled)
        return;
    $(this.Container).addClass('dp_disabled');
    this.Disabled = true;
    if (this.DateControl != null) {
        this.DateControl.DateInput.readOnly = true;
        this.DateControl.ClearDefaultText();
        if (this.TrimDisabledWidth) {
            this.DateControl.SetControlWidth(this.DateControl.ControlWidth - 18);
            if (this.DateControl.DivWeekDay != null)
                this.DateControl.DivWeekDay.style.right = '1px';
        }
    }
    if (this.ShowTime) {
        this.Hours.Disable();
        this.Minutes.Disable();
        if (this.TrimDisabledWidth) {
            var widthOffset = this.TimeVertical ? 9 : 18;
            this.Hours.SetControlWidth(this.Hours.ControlWidth - widthOffset);
            this.Minutes.SetControlWidth(this.Minutes.ControlWidth - widthOffset);
        }
    }
}

function DP_Enable() {
    if (this.DoubleDate || !this.Disabled)
        return;
    $(this.Container).removeClass('dp_disabled');
    this.Disabled = false;
    if (this.DateControl != null) {
        this.DateControl.DateInput.readOnly = false;
        this.DateControl.SetDefaultText();
        if (this.TrimDisabledWidth) {
            this.DateControl.SetControlWidth(this.DateControl.ControlWidth + 18);
            if (this.DateControl.DivWeekDay != null)
                this.DateControl.DivWeekDay.style.right = '18px';
        }
    }
    if (this.ShowTime) {
        this.Hours.Enable();
        this.Minutes.Enable();
        if (this.TrimDisabledWidth) {
            var widthOffset = this.TimeVertical ? 9 : 18;
            this.Hours.SetControlWidth(this.Hours.ControlWidth + widthOffset);
            this.Minutes.SetControlWidth(this.Minutes.ControlWidth + widthOffset);
        }
    }
}

function DP_CheckLongTitle(longTitleElement, defaultTitle) {
    if (!longTitleElement.titleChecked) {
        if (longTitleElement.offsetWidth > longTitleElement.parentNode.offsetWidth)
            longTitleElement.title = defaultTitle != null ? defaultTitle : (longTitleElement.innerText != null ? longTitleElement.innerText : longTitleElement.textContent);
        longTitleElement.titleChecked = true;
    }
}

function DP_AddChangeHandler(handler) {
    if (handler != null)
        this.ChangeHandlers.push(handler);
}

//debugger
function DP_OnChange(isPressEnter) {
    this.UpdateDayOfWeek();
    this.IsPressEnterChange = isPressEnter == true;
    if (this.ValueHidden != null)
        this.ValueHidden.value = this.GetValue();

    var i, len = this.ChangeHandlers.length;
    for (i = 0; i < len; i++) {
        var handler = this.ChangeHandlers[i];
        if (handler != null)
            handler(this, isPressEnter);
    }
}

function DP_MoveCaretToStart(inputObject) {
    if (inputObject.createTextRange) {
        var r = inputObject.createTextRange();
        r.collapse(true);
        r.select();
    }
    else if (inputObject.selectionStart) {
        inputObject.setSelectionRange(0, 0);
        //inputObject.focus();
    }
}

function DP_Hide() {
    if (this.Container != null)
        this.Container.style.display = "none";
}

function DP_Display() {
    if (this.Container != null)
        this.Container.style.display = "block";
}

function DP_SetDefaultText() {
    if (this.DoubleDate)
        this.SetDefaultTextVisible();
    else
        this.DateControl.SetDefaultText();
}

function DP_ClearDefaultText() {
    if (this.DoubleDate)
        this.SetDefaultTextVisible();
    else
        this.DateControl.ClearDefaultText();
}

function DP_IsValid() {
    var isValid = true;
    if (this.DateInput != null) {
        var date = this.DateInput.value;
        isValid = DP_IsValidDate(date);
    }
    return isValid;
}

function DP_CheckDate(dateString) {
    var result = DP_IsValidDate(dateString);
    return result;
}

function DP_CheckDateTime(dateString) {
    var result = DP_IsValidDateTime(dateString);
    return result;
}

/*------------------------Date------------------------*/
//debugger
function _DateControl(options, control) {
    var defaultOptions =
    {
        ControlWidth: 85,
        DefaultText: null,
        TrimDisabledWidth: true,
        ShowDayOfWeek: false
    }
    SM.ApplyOptions(this, defaultOptions, options);

    this.Control = control;

    //Methods
    this.SetDefaultText = DPDate_SetDefaultText;
    this.ClearDefaultText = DPDate_ClearDefaultText;
    this.SetControlWidth = DPDate_SetControlWidth;
    this.InitPicker = DPDate_InitPicker;

    //Initialization
    var thisObj = this;
    this.Container = window.document.createElement('div');
    var controlWidth = this.ControlWidth;
    this.SetControlWidth(controlWidth);

    var className = 'dp_divDate';
    if (this.ShowDayOfWeek)
        className += '_withWeekDay';

    this.Container.className = className;

    this.ContentsDiv = window.document.createElement('div');
    this.ContentsDiv.className = 'dp_divContents';
    this.Container.appendChild(this.ContentsDiv);

    if (!SM.IsNE(this.DefaultText)) {
        this.DefaultTextDiv = window.document.createElement('div');
        this.DefaultTextDiv.className = 'dp_divDefaultText';
        var defaultTextContent = window.document.createElement('span');
        defaultTextContent.innerHTML = this.DefaultText + '...';
        this.DefaultTextDiv.tabIndex = 0;
        this.DefaultTextDiv.onfocus = function () { thisObj.ClearDefaultText(); }
        $(this.DefaultTextDiv).mouseover(function () {
            DP_CheckLongTitle(defaultTextContent, thisObj.DefaultText);
        });

        this.DefaultTextDiv.appendChild(defaultTextContent);
        this.ContentsDiv.appendChild(this.DefaultTextDiv);
    }

    this.DateInput = window.document.createElement('input');
    this.DateInput.maxLength = 10;
    this.DateInput.className = 'dp_text';
    this.DateInput.autocomplete = 'off';
    this.ContentsDiv.appendChild(this.DateInput);

    var textInput = this.DateInput;

    SM.AttachDomEvent(this.DateInput, 'focus', function () {
        if (thisObj.Control.Disabled) {
            thisObj.DateInput.blur();
            return;
        }
        thisObj.InitPicker();
        if (!SM.IsNE(thisObj.DefaultText))
            thisObj.ClearDefaultText();
        if (thisObj.Control.DoubleDate) {
            textInput.IsFocused = true;
            thisObj.Control.EditorFocusing = false;
        }
        if (SM.IsMobileDevice) { //   Для мобильных устройств
            $(textInput).datepicker('show');
            textInput.PickerOpened = true;
        }
    }, false);

    if (!SM.IsNE(this.DefaultText)) {
        this.DateInput.onblur = function () {
            thisObj.SetDefaultText();
        }
        this.SetDefaultText();
    }

    this.PickerDiv = window.document.createElement('div');
    this.PickerDiv.className = 'dp_divPicker';
    this.Container.appendChild(this.PickerDiv);

    //день недели
    if (this.ShowDayOfWeek) {
        this.DivWeekDay = window.document.createElement('div');
        this.DivWeekDay.className = 'dp_divWeekDay';
        this.Container.appendChild(this.DivWeekDay);
    }

    /*-----text input-----*/
    $(textInput).keypress(function (ev) {
        var keyCode = ev.keyCode;
        if (keyCode == 13)
            thisObj.Control.OnChange(true);
    });

    if (this.Control.DoubleDate) {
        $(textInput).mousedown(function () {
            thisObj.Control.EditorFocusing = true;
        });
        $(textInput).blur(function (ev) {
            textInput.IsFocused = false;
            thisObj.Control.SetDefaultTextVisible(ev);
            textInput.IsTabPressed = false;
        });


        //Обработка TAB
        $(textInput).keydown(function (ev) {
            var shiftKey = ev.shiftKey;
            var keyCode = ev.keyCode;
            if (keyCode == 9 && (thisObj.IsStartDate && !shiftKey ||
                !thisObj.IsStartDate && shiftKey)) {
                textInput.IsTabPressed = true;
            }
        });

        this.SetValue = DP_SetValue;
        this.SetDateTime = DP_SetDateTime;
        this.SetDate = DP_SetDate;
        this.InvokeSetValue = DP_InvokeSetValue;

        this.GetDate = DP_GetDate;
        this.GetValue = DP_GetValue;
        this.GetDateTime = DP_GetDateTime;
    }

    textInput.OnTextChange = function () {
        if (thisObj.Control.DoubleDate) {
            if (thisObj.IsStartDate && thisObj.Control.CopyFirstToLast) {
                if (window.SM.IsNE(thisObj.Control.EndDate.DateInput.value)) {
                    var startValue = thisObj.Control.StartDate.DateInput.value;
                    if (!window.SM.IsNE(startValue))
                        thisObj.Control.EndDate.DateInput.value = startValue;
                }
            }
            else if (!thisObj.IsStartDate && thisObj.Control.CopyLastToFirst) {
                if (window.SM.IsNE(thisObj.Control.StartDate.DateInput.value)) {
                    var endValue = thisObj.Control.EndDate.DateInput.value;
                    if (!window.SM.IsNE(endValue))
                        thisObj.Control.StartDate.DateInput.value = endValue;
                }
            }
        }
        thisObj.Control.OnChange();
    }

    textInput.onchange = function () {
        if (!thisObj.IsPressEnterChange)
            textInput.OnTextChange();
        else
            thisObj.IsPressEnterChange = false;
    }

    this.PickerDiv.onmousedown = function () {
        textInput.isTrigger = true;
        textInput.closedByTrigger = false;
        if (thisObj.Control.DoubleDate)
            thisObj.Control.EditorFocusing = true;
    }
    if (thisObj.Control.DoubleDate) {
        this.PickerDiv.onfocus = function () {
            thisObj.Control.EditorFocusing = false;
        }
    }
    this.PickerDiv.onclick = function () {
        thisObj.InitPicker();
        if (!textInput.closedByTrigger) {
            thisObj.ClearDefaultText();
            DP_MoveCaretToStart(textInput);
            InitDatePickerLocale();

            $(textInput).datepicker('show');
            if (SM.IsWindowsTablet && SM.IsIE) textInput.blur();
            textInput.PickerOpened = true;
        }
        textInput.isTrigger = false;
    }
    /*--------------------*/

}

//debugger
function DPDate_InitPicker() {
    if (!this.PickerInited) {
        var textInput = this.DateInput;
        textInput.closedByTrigger = false;
        InitDatePickerLocale();
        $(textInput).datepicker({
            beforeShow: function (input, inst) {
                $(inst.dpDiv).addClass('dp_picker');
            },
            onClose: function (dateText, inst) {
                textInput = inst.input[0];
                if (textInput.isTrigger)
                    textInput.closedByTrigger = true;
                textInput.PickerOpened = false;
            },
            onSelect: function () { if (textInput.OnTextChange != null) textInput.OnTextChange(); },
            showOn: (!SM.IsMobileDevice) ? 'button' : 'both',
            buttonImage: '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/DatePickerControl/picker.png',
            buttonImageOnly: (!SM.IsMobileDevice) ? true : false
        });
        if (textInput.nextSibling != null)
            textInput.nextSibling.style.display = 'none';
        this.PickerInited = true;
    }
}

function DPDate_SetDefaultText() {
    if (!SM.IsNE(this.DefaultText) && SM.IsNE(this.DateInput.value) && !this.Control.Disabled && !this.IsDefaultText && !this.DateInput.PickerOpened) {
        $(this.Container).addClass('dp_showDefaultText');
        this.Container.title = '';
        this.IsDefaultText = true;
    }
}

function DPDate_ClearDefaultText() {
    if (!SM.IsNE(this.DefaultText) && this.IsDefaultText) {
        if (!this.IsDefaultTextClearing) {
            this.IsDefaultTextClearing = true;

            $(this.Container).removeClass('dp_showDefaultText');
            this.Container.title = this.DefaultText;
            if (this.DateInput.offsetWidth > 0)
                this.DateInput.focus();
            this.IsDefaultText = false;

            this.IsDefaultTextClearing = false;
        }
    }
}

function DPDate_SetControlWidth(controlWidth) {
    if (!this.ControlWidthInited && (controlWidth != 85 || !SM.DTD) || this.ControlWidthInited) {
        var calculatedWidth = controlWidth
        if (SM.DTD)
            calculatedWidth = controlWidth - 2;
        this.Container.style.width = calculatedWidth + 'px';
    }
    this.ControlWidth = controlWidth;
    this.ControlWidthInited = true;
}




//debugger
/*------------------------DateTime------------------------*/
function _DateTimeControl(options) {
    var defaultOptions = {
        ControlWidth: 85,
        DefaultText: null,
        TimeVertical: false,
        TrimDisabledWidth: true,
        ShowDayOfWeek: false
    }
    SM.ApplyOptions(this, defaultOptions, options);

    this.Container = window.document.createElement('div');
    var containerClassName = 'dp_divDateTime';
    if (this.ShowDayOfWeek)
        containerClassName += '_withWeekDay';
    if (this.TimeVertical)
        containerClassName += ' dp_timeVertical';
    this.Container.className = containerClassName;

    var thisObj = this;

    if (this.TimeVertical) {
        if (this.ControlWidth % 2 == 0)
            this.ControlWidth += 1;
        this.TimeControlWidth = parseInt((this.ControlWidth - 5) / 2);
    }
    else {
        if (this.ControlWidth < 85)
            this.ControlWidth = 85;
        this.TimeControlWidth = 40;
    }

    this.DateControl = new _DateControl({
        DefaultText: thisObj.DefaultText,
        ControlWidth: thisObj.ControlWidth,
        ShowDayOfWeek: thisObj.ShowDayOfWeek
    }, this);
    this.Container.appendChild(this.DateControl.Container);

    this.Hours = new ListControl();
    this.Hours.IsDropDownList = true;
    this.Hours.IsMultiple = false;
    this.Hours.RemovableValue = false;
    this.Hours.Init();
    this.Hours.SetControlWidth(this.TimeControlWidth);
    this.Hours.OnSetGridValue = function () {
        thisObj.OnChange();
    }
    for (var i = 0; i < 24; i++) {
        var value = i.toString();
        var text = i < 10 ? '0' + i : i.toString();
        this.Hours.AddGridRow(text, value);
    }
    this.Hours.SetValue({ Text: '00', Value: '0' });
    $(this.Hours.Container).addClass('dp_hours');
    this.Container.appendChild(this.Hours.Container);

    this.Minutes = new ListControl();
    this.Minutes.IsDropDownList = true;
    this.Minutes.IsMultiple = false;
    this.Minutes.RemovableValue = false;
    this.Minutes.Init();
    this.Minutes.SetControlWidth(this.TimeControlWidth);
    this.Minutes.OnSetGridValue = function () {
        thisObj.OnChange();
    }
    var i = 0;
    while (i < 60) {
        var value = i.toString();
        var text = i < 10 ? '0' + i : i.toString();
        this.Minutes.AddGridRow(text, value);
        i = i + 5;
    }
    this.Minutes.SetValue({ Text: '00', Value: '0' });
    $(this.Minutes.Container).addClass('dp_minutes');

    this.TimeSepDiv = window.document.createElement('div');
    this.TimeSepDiv.className = 'dp_divTimeSep';
    this.TimeSepDiv.innerHTML = ':';
    this.Container.appendChild(this.TimeSepDiv);

    this.Container.appendChild(this.Minutes.Container);
}


/*------------------------DoubleDate------------------------*/
function _DoubleDateControl(options) {
    var defaultOptions = {
        DefaultText: null,
        ShowDayOfWeek: false
    }
    SM.ApplyOptions(this, defaultOptions, options);
    this.ControlWidth = 180;

    //Methods
    this.SetDefaultTextVisible = DPDouble_SetDefaultTextVisible;

    var thisObj = this;
    //Initialization
    this.Container = window.document.createElement('div');
    this.Container.className = 'dp_doubleFilter';

    if (!SM.IsNE(this.DefaultText)) {
        this.DefaultTextDiv = window.document.createElement('div');
        this.DefaultTextDiv.className = 'dp_doubleDefaultText';
        var defaultTextContentContainer = window.document.createElement('div');
        defaultTextContentContainer.className = 'dp_divDefaultText';
        var defaultTextContent = window.document.createElement('span');
        defaultTextContent.innerHTML = this.DefaultText + '...';
        defaultTextContentContainer.appendChild(defaultTextContent);
        this.DefaultTextDiv.appendChild(defaultTextContentContainer);
        this.DefaultTextDiv.tabIndex = 0;
        this.DefaultTextDiv.onfocus = function (evt) {
            thisObj.DefaultTextDiv.style.display = 'none';
            thisObj.StartDate.DateInput.focus();
        }
        this.Container.onmouseover = function (evt) {
            thisObj.SetDefaultTextVisible(evt);
        }
        this.Container.onmouseout = function (evt) {
            thisObj.SetDefaultTextVisible(evt);
        }
        this.Container.appendChild(this.DefaultTextDiv);
    }

    this.StartDate = new _DateControl(null, this);
    this.StartDateInput = this.StartDate.DateInput;
    this.StartDate.IsStartDate = true;
    this.Container.appendChild(this.StartDate.Container);

    this.SepDiv = window.document.createElement('div');
    this.SepDiv.className = 'dp_filterSep';
    this.SepLineDiv = window.document.createElement('div');
    this.SepLineDiv.className = 'dp_filterSepLine';
    this.SepDiv.appendChild(this.SepLineDiv);
    this.Container.appendChild(this.SepDiv);

    this.EndDate = new _DateControl(null, this);
    this.EndDateInput = this.EndDate.DateInput;
    this.Container.appendChild(this.EndDate.Container);
}

function DPDouble_SetDefaultTextVisible(evt) {
    if (!SM.IsNE(this.DefaultText)) {
        var isOverControl = false;
        if (evt == null) evt = window.event;
        if (evt != null) {
            var mouseX = evt.clientX;
            var mouseY = evt.clientY;
            var controlScope = this.Container.getBoundingClientRect();
            isOverControl =
                mouseX >= controlScope.left &&
                mouseX <= controlScope.right - 1 &&
                mouseY >= controlScope.top &&
                mouseY <= controlScope.bottom - 1;
        }

        var isStartCanShowDefaultText = DPDouble_CanShowDefaultText(this.StartDate.DateInput);
        var isEndCanShowDefaultText = DPDouble_CanShowDefaultText(this.EndDate.DateInput);

        //if(!isOverControl)
        //SM.WriteLog('mouseX:' + mouseX + ' mouseY:' + mouseY);

        if (!isOverControl && isStartCanShowDefaultText && isEndCanShowDefaultText && !this.EditorFocusing) {
            //показываем дефалтовый текст
            this.DefaultTextDiv.style.display = 'block';
        }
        else {
            //скрываем дефалтовый текст
            this.DefaultTextDiv.style.display = 'none';
        }
    }
}

function DPDouble_CanShowDefaultText(textFilter) {
    if (textFilter.IsFocused || textFilter.PickerOpened || !window.SM.IsNE(textFilter.value) || textFilter.IsTabPressed)
        return false;
    return true;
}




/*-----------------------------------------------------------*/
/*-----------------------------------------------------------*/
/*-----------------------VALUE METHODS----------------------*/
function DP_IsValidDate(dateString) {
    var result = true;
    if (!SM.IsNE(dateString)) {
        result = false;
        var splits = dateString.split('.');
        if (splits != null && splits.length == 3) {
            var dayStr = splits[0];
            if (dayStr.charAt(0) == '0' && dayStr.length == 2)
                dayStr = dayStr.substring(1);
            day = parseInt(dayStr);
            var monthStr = splits[1];
            if (monthStr.charAt(0) == '0' && monthStr.length == 2)
                monthStr = monthStr.substring(1);
            month = parseInt(monthStr);

            var year = -1;
            year = parseInt(splits[2]);

            if (year < 1753 || year > 9999)
                result = false;
            else
                result = DP_CheckDateTimeValue(day, month, year);
        }
    }
    return result;
}

function DP_IsValidDateTime(dateString) {
    var dSplits = dateString.split(' ');
    if (dSplits.length == 2) {
        dateString = dSplits[0];
        var splits = dateString.split('.');
        if (splits.length == 3) {
            var dayStr = splits[0];
            if (dayStr.charAt(0) == '0' && dayStr.length == 2)
                dayStr = dayStr.substring(1);
            day = parseInt(dayStr);
            var monthStr = splits[1];
            if (monthStr.charAt(0) == '0' && monthStr.length == 2)
                monthStr = monthStr.substring(1);
            month = parseInt(monthStr);

            var year = -1;
            year = parseInt(splits[2]);

            result = DP_CheckDateTimeValue(day, month, year);
        }

        return result;
    }
    else return DP_IsValidDate(dateString);

}

function DP_CheckDateTimeValue(day, month, year) {

    if (day == null)
        day = "";
    var dayStr = day.toString();
    if (dayStr.charAt(0) == '0' && dayStr.length == 2)
        dayStr = dayStr.substring(1);
    var intDay = parseInt(dayStr);
    if (intDay <= 0) return false;

    var valid = false;
    switch (month) {
        case 1:
            valid = intDay <= 31;
            break;

        case 2:
            var isLeapYear = parseInt(year) % 4 == 0;
            if (isLeapYear)
                valid = intDay <= 29;
            else
                valid = intDay <= 28;
            break;

        case 3:
            valid = intDay <= 31;
            break;

        case 4:
            valid = intDay <= 30;
            break;

        case 5:
            valid = intDay <= 31;
            break;

        case 6:
            valid = intDay <= 30;
            break;

        case 7:
            valid = intDay <= 31;
            break;

        case 8:
            valid = intDay <= 31;
            break;

        case 9:
            valid = intDay <= 30;
            break;

        case 10:
            valid = intDay <= 31;
            break;

        case 11:
            valid = intDay <= 30;
            break;

        case 12:
            valid = intDay <= 31;
            break;
    }
    return valid;
}

function DP_CheckMonthDay(day, month, year) {
    var valid = false;

    var intDay = DP_GetDigitFromText(day);
    var intMonth = DP_GetDigitFromText(month);
    var intYear = DP_GetDigitFromText(year);
    if (intYear < 1754 || intYear > 9999)
        return false;
    switch (intMonth) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            valid = intDay <= 31;
            break;

        case 4:
        case 6:
        case 9:
        case 11:
            valid = intDay <= 30;
            break;

        case 2:
            var isLeapYear = intYear % 4 == 0;
            if (isLeapYear)
                valid = intDay <= 29;
            else
                valid = intDay <= 28;
            break;

    }
    return valid;
}

function DP_GetTimeText(text) {
    var result = null;
    if (!SM.IsNE(text)) {
        text = text.toString();
        if (text.length == 2)
            result = text;
        else if (text.length == 1)
            result = DP_GetTextFromDigit(parseInt(text));
        else
            throw new Error('Не корректная строка установки времени');
    }
    return result;
}

function DP_GetTextFromDigit(digit) {
    var text = digit < 10 ? '0' + digit : digit.toString();
    return text;
}

function DP_GetDigitFromText(text) {
    var digit = null;
    if (!SM.IsNE(text)) {
        if (text.charAt(0) == '0' && text.length == 2)
            text = text.substring(1);
        digit = parseInt(text);
    }
    return digit;
}

function DP_InvokeSetValue(value, setValueFunction) {
    if (setValueFunction == null)
        throw new Error('Параметр setValueFunction не может быть пустым.');

    var isSelfChange = !this.IsExternalChange;
    if (isSelfChange)
        this.IsExternalChange = true;

    var isChanged = setValueFunction(value);

    isChanged = true;
    if (isSelfChange) {
        this.IsExternalChange = false;
        if (isChanged)
            this.OnChange();
    }
}

function DP_SetValue(dateString) {
    this.SetDateTime(dateString);
}

function DP_SetDateObject(valueParam) {
    var thisObj = this;
    this.InvokeSetValue(valueParam, function (dateObj) {
        if (dateObj != null) {
            var day = dateObj.getDate();
            var month = dateObj.getMonth() + 1;
            var year = dateObj.getFullYear();

            if (day < 10)
                day = '0' + day;
            if (month < 10)
                month = '0' + month;

            var dateString = day + '.' + month + '.' + year;
            thisObj.DateInput.value = dateString;
        }

        return true;
    });
}

function DP_SetDateTime(valueParam) {
    var thisObj = this;
    this.InvokeSetValue(valueParam, function (valueString) {
        if (!window.SM.IsNE(valueString)) {
            var dateString = ''
            var timeString = '';
            var timeSep = 'T';
            if (valueString.indexOf(' ') != -1)
                timeSep = ' '
            else if (valueString.indexOf('T') != -1)
                timeSep = 'T';
            var splValue = valueString.split(timeSep);
            if (splValue.length == 1)
                dateString = splValue[0];
            else if (splValue.length == 2) {
                dateString = splValue[0];
                timeString = splValue[1];
            }
            thisObj.SetDate(dateString);
            if (!window.SM.IsNE(timeString) && thisObj.ShowTime)
                thisObj.SetTime(timeString);
        }
        else {
            thisObj.DateInput.value = '';
            if (thisObj.ShowTime) {
                thisObj.Hours.SetValue({ Text: '00', Value: '0' });
                thisObj.Minutes.SetValue({ Text: '00', Value: '0' });
            }
        }
        return true;
    });
}



function DP_SetDate(valueParam) {
    var thisObj = this;
    this.InvokeSetValue(valueParam, function (dateString) {
        if (dateString == null)
            dateString = '';

        thisObj.DateInput.value = dateString;
        return true;
    });
}

function DP_SetTime(valueParam) {
    var thisObj = this;

    this.InvokeSetValue(valueParam, function (timeString) {
        var isChanged = false;
        if (!window.SM.IsNE(timeString)) {
            timeString = timeString.trim();
            var splTime = timeString.split(':');
            if (splTime.length == 2) {
                //установка часов
                var hour = splTime[0];
                var hChanged = thisObj.SetHour(hour);

                //установка минут
                var minute = splTime[1];
                var mChanged = thisObj.SetMinute(minute);

                isChanged = hChanged || mChanged;
            }
        }
        return isChanged;
    });

}

function DP_SetHour(valueParam) {
    var thisObj = this;
    this.InvokeSetValue(valueParam, function (text) {
        var isChanged = false;
        if (thisObj.ShowTime && !SM.IsNE(text)) {
            var controlValue = DP_GetDigitFromText(text);
            var controlText = DP_GetTimeText(text);
            thisObj.Hours.SetValue({ Text: controlText, Value: controlValue });
            isChanged = true;
        }
        return isChanged;
    });
}

function DP_SetMinute(valueParam) {
    var thisObj = this;
    this.InvokeSetValue(valueParam, function (text) {
        var isChanged = false;
        if (thisObj.ShowTime && !SM.IsNE(text)) {
            var controlValue = DP_GetDigitFromText(text);
            var controlText = DP_GetTimeText(text);
            thisObj.Minutes.SetValue({ Text: controlText, Value: controlValue });
            isChanged = true;
        }
        return isChanged;
    });
}


function DP_GetValue() {
    return this.GetDateTime();
}

function DP_GetDate() {
    var result = '';
    if (this.DateInput != null) {
        var dateString = this.DateInput.value;
        var isValidDate = DP_IsValidDate(dateString);
        if (!window.SM.IsNE(dateString) && isValidDate)
            result = dateString;
    }
    return result;
}

function DP_GetDateObject() {
    var result = null;
    if (this.DateInput != null) {
        var dateString = this.DateInput.value;
        var isValidDate = DP_IsValidDate(dateString);
        if (!window.SM.IsNE(dateString) && isValidDate) {
            var splitDate = dateString.split(".");
            result = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
        }
    }
    return result;
}

function DP_GetDateTime(timeSeparator) {
    var result = '';
    var result = this.GetDate();
    if (!window.SM.IsNE(result)) {
        if (this.Hours != null && this.Minutes != null) {
            var hour = '00';
            if (this.Hours.Value != null)
                hour = this.Hours.Value.Text;

            var minute = '00';
            if (this.Minutes.Value != null)
                minute = this.Minutes.Value.Text;

            if (SM.IsNE(timeSeparator))
                timeSeparator = ' ';
            result += timeSeparator + hour + ':' + minute;
        }
    }
    return result;
}

function InitDatePickerLocale() {
    if (window.__init_DatePickerLocale)
        return;
    window.__init_DatePickerLocale = true;

    var localeSettings = window.DatePickerLocaleSettings;
    if (localeSettings == null)
        throw new Error('Не удалось получить window.DatePickerLocaleSettings.');

    if (SM.IsNE(localeSettings.LanguageCode))
        throw new Error('Не задан LanguageCode');
    if (localeSettings.Settings == null)
        throw new Error('Не заданы языковые настройки DatePicker.');

    $.datepicker.regional[localeSettings.LanguageCode] = localeSettings.Settings;
    $.datepicker.setDefaults($.datepicker.regional[localeSettings.LanguageCode]);
}