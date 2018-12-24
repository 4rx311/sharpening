//debugger
String.prototype.trim = function() { return this.replace(/(^\s+)|(\s+$)/g, ""); }

function DateTimeControl(containerID, withTime, withDayOfWeek, dateString, timeVertical) {
    try {
        window.GetDateTimeControl = DateTimeControl_GetDateTimeControl;

        this.IsClientControl = false;
        if (containerID == null) {
            this.IsClientControl = true;
        }

        if (withTime == null)
            withTime = "";
        if (withDayOfWeek == null)
            withDayOfWeek = "";


        if (withTime.toString().toLowerCase() == "true")
            withTime = true;
        else
            withTime = false;

        if (withDayOfWeek.toString().toLowerCase() == "true")
            withDayOfWeek = true;
        else
            withDayOfWeek = false;

        //пробуем сначала получить из коллекции
        var tempCtrl = null;
        if (window.DateTimeControls != null)
            tempCtrl = window.DateTimeControls[containerID];

        if (tempCtrl != null)
            return tempCtrl;

        var dateInput = null;
        var dayOfWeekInput = null;
        var selectHours = null;
        var selectMinutes = null;
        var table = null;
        var row = null;
        var cellTime = null;
        var cellDate = null;

        var container = null;
        if (!this.IsClientControl) {
            var container = window.document.getElementById(containerID);
            if (container == null)
                alert('Контейнер для контрола даты не может быть null.');
        }
        else {
            container = window.document.createElement('span');
            var rnd = Math.random().toString().substring(3);
            container.id = "_date_ctrl_" + rnd;
        }

        if (container != null) {
            container.DateControl = this;

            //func
            var thisObj = this;
            this.SetDateTime = DateTimeControl_SetDateTime;
            this.CheckDate = CheckDateTime;
            this.AddChangeHandler = DateTimeControl_AddChangeHandler;
            this.OnChange = DateTimeControl_OnChange;
            this.SetDate = DateTimeControl_SetDate;
            this.SetTime = DateTimeControl_SetTime;
            this.InitValue = DateTimeControl_InitValue;
            this.InitHiddenValue = DateTimeControl_InitHiddenValue;
            this.SetHour = DateTimeControl_SetHour;
            this.SetMinute = DateTimeControl_SetMinute;
            //получение
            this.GetDate = DateTimeControl_GetDate;
            this.GetDateTime = DateTimeControl_GetDateTime;
            this.IsValid = DateTimeControl_IsValid;
            //отображение
            this.Hide = DateTimeControl_Hide;
            this.Display = DateTimeControl_Display;
            //доступ
            this.Disable = DateTimeControl_Disable;
            this.Enable = DateTimeControl_Enable;
            //prop
            this.ChangeHandlers = new Array();
            this.IsChange = false;

            this.Container = container;
            var ctrlID = container.id;
            table = window.document.createElement('table');
            table.className = "DateTimeControl_tbl";
            table.id = ctrlID + "_tbl";
            container.appendChild(table);

            row = table.insertRow();
            cellDate = row.insertCell();
            cellDate.id = ctrlID + "_cellDate";
            cellDate.className = "DateTimeControl_cell_date";

            dateInput = window.document.createElement('input');
            this.DateInput = dateInput;
            dateInput.DateControl = this;
            dateInput.type = 'text';
            dateInput.maxLength = 10;
            dateInput.id = ctrlID + "_dateInput";
            dateInput.className = "DateTimeControl_date_input";
            dateInput.onkeypress = function(){ if(window.event.keyCode == 13) thisObj.OnChange(true); }
            cellDate.appendChild(dateInput);

            //значение (текст бокс для сервера)
            var valueInput = window.document.createElement('input');
            valueInput.name = ctrlID + "_valueInput";
            valueInput.id = ctrlID + "_valueInput";
            valueInput.type = 'text';
            valueInput.style.display = 'none';
            this.ValueControl = valueInput;
            cellDate.appendChild(valueInput);
            //Handlers
            var objRef = this;

            if (withDayOfWeek) {
                dayOfWeekInput = window.document.createElement('input');
                this.DayOfWeekInput = dayOfWeekInput;
                dayOfWeekInput.DateControl = this;
                dayOfWeekInput.type = 'text';
                dayOfWeekInput.id = ctrlID + "_dayOfWeek_input";
                dayOfWeekInput.className = "day-of-week-input";
                dayOfWeekInput.setAttribute('disabled', 'disabled');
                cellDate.appendChild(dayOfWeekInput);

                this.DateInput.onchange = function() {
                    if(!objRef.IsPressEnterChange)
                        objRef.OnChange();
                    else
                        objRef.IsPressEnterChange = false;
                    SetDayOfWeek(this.value, dayOfWeekInput.id)
                    //dayOfWeekInput.DateControl.OnChange()
                }
            }
            else
                this.DateInput.onchange = function() { 
                    if(!objRef.IsPressEnterChange)
                        objRef.OnChange(); 
                    else
                        objRef.IsPressEnterChange = false;
                }

            if (withTime) {
                var timeRow = row;
                if(timeVertical)
                    timeRow = table.insertRow();
                cellTime = timeRow.insertCell();
                cellTime.className = "DateTimeControl_cell_time";
                cellTime.id = ctrlID + "_cellTime";

                //часы
                selectHours = window.document.createElement('select');
                this.Hours = selectHours;
                selectHours.DateControl = this;
                selectHours.className = "DateTimeControl_ddl_hours";
                selectHours.id = ctrlID + "_hours";
                selectHours.onchange = DateTimeControl_Selects_Onchange;
                cellTime.appendChild(selectHours);

                if (!withDayOfWeek && !timeVertical)
                    cellTime.style.paddingLeft = "2px";

                for (var i = 0; i < 24; i++) {
                    var optHour = window.document.createElement('option');
                    optHour.value = i.toString();
                    var text = "";
                    if (i < 10)
                        text += "0";
                    text += i.toString();
                    optHour.innerText = text;
                    selectHours.appendChild(optHour);
                }

                //минуты
                selectMinutes = window.document.createElement('select');
                selectMinutes.className = "DateTimeControl_ddl_minutes";
                this.Minutes = selectMinutes;
                selectMinutes.DateControl = this;
                selectMinutes.onchange = DateTimeControl_Selects_Onchange;
                selectMinutes.id = ctrlID + "_minutes";
                cellTime.appendChild(selectMinutes);

                i = 0;
                while (i < 60) {
                    var optMinute = window.document.createElement('option');
                    optMinute.value = i.toString();
                    var text = "";
                    if (i < 10)
                        text += "0";
                    text += i.toString();

                    optMinute.innerText = text;
                    selectMinutes.appendChild(optMinute);

                    i = i + 5;
                }
            }

            if (dayOfWeekInput != null) {
                InitDatePickerLocale();
                $(dateInput).datepicker({
                    showOn: "button",
                    buttonImage: "/_layouts/images/calendar.gif",
                    buttonImageOnly: true,
                    onSelect: function(dateText, inst) { SetDayOfWeek(dateText, dayOfWeekInput.id); dayOfWeekInput.DateControl.OnChange(); }
                });
                var datePicker = this.Container.children[0].rows[0].cells[0].children[1];
                dayOfWeekInput.swapNode(datePicker);
            }
            else {
                InitDatePickerLocale();
                $(dateInput).datepicker({
                    showOn: "button",
                    buttonImage: "/_layouts/images/calendar.gif",
                    buttonImageOnly: true,
                    onSelect: function(dateText, inst) { dateInput.DateControl.OnChange(); }
                });
            }
        }

        if (window.DateTimeControls == null)
            window.DateTimeControls = new Array();

        window.DateTimeControls[ctrlID] = this;

        if (!window.SM.IsNE(dateString)) {
            this.IsChange = true;

            if (dateString.indexOf(" ") != -1)
                this.SetDateTime(dateString);
            else
                this.SetDate(dateString);

            this.IsChange = false;
            if (this.DayOfWeekInput != null)
                SetDayOfWeek(dateString, this.DayOfWeekInput.id);
        }

        this.InitValue();
        return this;
    }
    catch (e) { }
}

function DateTimeControl_InitHiddenValue() {
}

//Interface
function DateTimeControl_AddChangeHandler(func) {
    this.ChangeHandlers[this.ChangeHandlers.length] = func;
}

function DateTimeControl_OnChange(isPressEnter) {
    this.IsPressEnterChange = isPressEnter;
    this.InitValue();
    var i, len = this.ChangeHandlers.length;
    for (i = 0; i < len; i++) {
        var func = this.ChangeHandlers[i];
        if (func != null)
            func(this, isPressEnter);
    }

    this.IsChange = false;
}

function DateTimeControl_Selects_Onchange() {
    //debugger;
    if (window.event != null && window.event.srcElement != null) {
        var evElement = window.event.srcElement;
        if (evElement != null && evElement.DateControl != null)
            evElement.DateControl.OnChange();
    }
}

function DateTimeControl_InitValue() {
    if (this.DateInput != null && this.ValueControl != null) {
        var dateString = this.DateInput.value;
        if (dateString == null)
            dateString = "";

        this.ValueControl.value = this.DateInput.value
        if (!window.SM.IsNE(dateString)) {
            if (this.Hours != null && this.Minutes != null && this.Hours.selectedIndex != null
                && this.Minutes.selectedIndex != null)
                this.ValueControl.value += " " + this.Hours[this.Hours.selectedIndex].text + ":" + this.Minutes[this.Minutes.selectedIndex].text;
        }
    }
}

function DateTimeControl_GetDateTimeControl(controlID) {
    var obj = null;
    if (window.DateTimeControls != null) {
        obj = window.DateTimeControls[controlID];
    }
    return obj;
}

//Interface
function DateTimeControl_SetDateTime(dateString) {
    if (!window.SM.IsNE(dateString)) 
    {
        try {
            dateString = dateString.trim();
            var splits = dateString.split(' ');

            if (splits.length == 2) {
                var splitsDate = splits[0].split('.');
                if (splitsDate.length == 3) {
                    var day = -1;
                    var month = -1;
                    var year = -1;

                    var dayStr = splitsDate[0];
                    if (dayStr.charAt(0) == '0' && dayStr.length == 2)
                        dayStr = dayStr.substring(1);
                    day = parseInt(dayStr);
                    var monthStr = splitsDate[1];
                    if (monthStr.charAt(0) == '0' && monthStr.length == 2)
                        monthStr = monthStr.substring(1);
                    month = parseInt(monthStr);
                    year = parseInt(splitsDate[2]);

                    var splitTime = splits[1].split(':');
                    if (splitTime.length == 2) {

                        var hour = -1;
                        var min = -1;
                        var hStr = splitTime[0];
                        if (hStr.charAt(0) == '0' && hStr.length == 2)
                            hStr = hStr.substring(1);
                        hour = parseInt(hStr);

                        var minStr = splitTime[1];
                        if (minStr.charAt(0) == '0' && minStr.length == 2)
                            minStr = minStr.substring(1);
                        min = parseInt(minStr);

                        if (hour > -1 && hour < 24 && min > -1 && min < 60) {
                            if (CheckDateTimeValue(day, month, year)) {

                                this.IsChange = true;

                                if (this.SetDate != null)
                                    this.SetDate(splits[0]);
                                if (this.SetTime != null)
                                    this.SetTime(splits[1]);

                                //this.ValueControl.value = dateString;
                                this.OnChange();
                            }
                        }
                    }
                }
            }
        }
        catch (e) { }
    }
    else
    {
        this.SetDate(null)
        this.SetTime(null);
    }
}

//Interface
function DateTimeControl_SetDate(dateString) {
    if (!window.SM.IsNE(dateString)) 
    {
        try {
            dateString = dateString.trim();
            dateString = dateString.split(' ')[0];
            var splits = dateString.split('.');
            if (splits.length == 3) {
                var day = -1;
                var month = -1;
                var year = -1;

                var dayStr = splits[0];
                if (dayStr.charAt(0) == '0' && dayStr.length == 2)
                    dayStr = dayStr.substring(1);
                day = parseInt(dayStr);
                var monthStr = splits[1];
                if (monthStr.charAt(0) == '0' && monthStr.length == 2)
                    monthStr = monthStr.substring(1);
                month = parseInt(monthStr);
                year = parseInt(splits[2]);

                var valid = CheckDateTimeValue(day, month, year);

                if (this.DateInput != null && valid) {
                    if (day < 10)
                        day = "0" + day;
                    if (month < 10)
                        month = "0" + month;
                    var resultString = day + "." + month + "." + year;
                    this.DateInput.value = resultString;
                    //this.ValueControl.value = resultString;
                    if (this.DayOfWeekInput != null) {
                        SetDayOfWeek(resultString, this.DayOfWeekInput.id);
                    }
                    if (!this.IsChange)
                        this.OnChange();
                }
            }
        }
        catch (e) { }
    }
    else
    {
        this.DateInput.value = '';
    }
}

//Interface
function DateTimeControl_SetTime(timeString) {
    if (!window.SM.IsNE(timeString)) 
    {
        try {
            timeString = timeString.trim();
            var splits = timeString.split(':');
            if (splits.length == 2) {
                var hour = -1;
                var min = -1;
                var hStr = splits[0];
                if (hStr.charAt(0) == '0' && hStr.length == 2)
                    hStr = hStr.substring(1);
                hour = parseInt(hStr);

                var minStr = splits[1];
                if (minStr.charAt(0) == '0' && minStr.length == 2)
                    minStr = minStr.substring(1);
                min = parseInt(minStr);

                var isSetTime = !this.IsChange;
                if (isSetTime)
                    this.IsChange = true;

                //установка часов
                this.SetHour(hour);

                //установка минут
                this.SetMinute(min);

                //if (this.CheckDate(this.DateInput.value))
                //  this.ValueControl.value = this.DateInput.value + " " + timeString;
                if (isSetTime)
                    this.OnChange();
            }
        }
        catch (e) { }
    }
    else
    {
        this.SetHour('0');
        this.SetMinute('0');
    }
}

//Interface
function DateTimeControl_SetHour(hourString) {
    if (hourString != null)
        hourString = hourString.toString();
    if (!window.SM.IsNE(hourString)) {
        try {
            var hour = -1;
            var hStr = hourString;
            if (hStr.charAt(0) == '0' && hStr.length == 2)
                hStr = hStr.substring(1);
            hour = parseInt(hStr);

            var regEx = /^[\d]+$/
            if (regEx.test(hourString)) {
                if (hour > -1 && hour < 24) {
                    //установка часов
                    if (this.Hours != null) {
                        var hOptions = this.Hours.options;
                        for (var i = 0; i < hOptions.length; i++) {
                            var optVal = parseInt(hOptions[i].value);
                            if (optVal > -1 && optVal < 25 && optVal == hour) {
                                hOptions[i].selected = "selected";
                                //  if (this.CheckDate(this.DateInput.value) && this.Minutes != null && this.Minutes.selectedIndex != null)
                                //    this.ValueControl.value = this.DateInput.value + " " + hourString + ":" + this.Minutes[this.Minutes.selectedIndex].text;
                            }
                        }
                    }
                }
            }
        }
        catch (e) { }

        if (!this.IsChange)
            this.OnChange();
    }
}

//Interface
function DateTimeControl_SetMinute(minuteString) {
    if (minuteString != null)
        minuteString = minuteString.toString();
    if (!window.SM.IsNE(minuteString)) {
        try {
            var minutes = -1;
            if (minuteString.charAt(0) == '0' && minuteString.length == 2)
                minuteString = minuteString.substring(1);
            minutes = parseInt(minuteString);

            var regEx = /^[\d]+$/
            if (regEx.test(minuteString)) {
                if (minutes > -1 && minutes < 60) {
                    //установка минут
                    if (this.Minutes != null) {
                        var mOptions = this.Minutes.options;
                        var contains = false;
                        for (var i = 0; i < mOptions.length; i++) {
                            var optVal = parseInt(mOptions[i].value);
                            if (optVal > -1 && optVal < 60 && optVal == minutes) {
                                contains = true;
                                mOptions[i].selected = "selected";
                            }
                        }
                        if (!contains) {
                            var minuteString = "";
                            if (minutes < 10)
                                minuteString += "0";
                            minuteString += minutes.toString();

                            var newOption = document.createElement("OPTION");
                            this.Minutes.options.add(newOption);
                            newOption.innerText = minuteString;
                            newOption.value = minutes.toString();
                            newOption.selected = "selected";
                        }

                        //  if (this.CheckDate(this.DateInput.value) && this.Hours != null && this.Hours.selectedIndex != null)
                        //    this.ValueControl.value = this.DateInput.value + " " + this.Hours[this.Hours.selectedIndex].text + ":" + minuteString;
                    }
                }
            }
        }
        catch (e) { }

        if (!this.IsChange)
            this.OnChange();
    }
}

//Interface
function DateTimeControl_GetDate() {
    var result = "";
    try {
        if (this.DateInput != null) {
            var newDate = null;
            var dateString = this.DateInput.value;
            if (!window.SM.IsNE(dateString) && this.IsValid()) {
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

                    if (day < 10)
                        day = "0" + day;
                    if (month < 10)
                        month = "0" + month;
                    var resultString = day + "." + month + "." + year;
                    result = resultString;
                }
            }
        }
    }
    catch (e) { }
    return result;
}

//Interface
function DateTimeControl_GetDateTime() {
    var result = "";
    try {
        var result = this.GetDate();
        if (!window.SM.IsNE(result)) {
            if (this.Hours != null && this.Hours.options != null && this.Hours.options.length > 0
            && this.Minutes != null && this.Minutes.options != null && this.Minutes.options.length > 0) {
                result += " " + this.Hours.options[this.Hours.selectedIndex].text;
                result += ":" + this.Minutes.options[this.Minutes.selectedIndex].text;
            }
        }
    }
    catch (e) { }
    return result;
}

//Interface
function DateTimeControl_IsValid() {
    var valid = false;
    try {
        var dateString = "";
        if (this.DateInput != null)
            dateString = this.DateInput.value;
        if (!window.SM.IsNE(dateString)) {
            dateString = dateString.split(' ')[0];
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
                    if (CheckDateTimeValue(day, month, year))
                        valid = true;
                }
                catch (e) { }
            }
        }
        else
            valid = true;
        return valid;
    }
    catch (e) { return valid; }
}

//Interface
function DateTimeControl_Hide() {
    if (this.Container != null)
        this.Container.style.display = "none";
}

//Interface
function DateTimeControl_Display() {
    if (this.Container != null)
        this.Container.style.display = "block";
}

//Interface
function DateTimeControl_Disable() {
    if (this.DateInput != null) {
        this.DateInput.readOnly = true;
        this.DateInput.style.color = "#808080";
    }

    if (this.Hours != null)
        this.Hours.setAttribute('disabled', 'disabled');

    if (this.Minutes != null)
        this.Minutes.setAttribute('disabled', 'disabled');
}

//Interface
function DateTimeControl_Enable() {
    if (this.DateInput != null) {
        this.DateInput.readOnly = false;
        this.DateInput.style.color = "#000000";
    }

    if (this.Hours != null)
        this.Hours.removeAttribute('disabled');

    if (this.Minutes != null)
        this.Minutes.removeAttribute('disabled');

    if (this.Container != null) {
        try {
            var datePicker = this.Container.children[0].rows[0].cells[0].children[3];
            if (datePicker != null)
                datePicker.removeAttribute('disabled');
        } catch (e) { }
    }
}

//Interface
function SetDayOfWeek(dateText, DayOfWeekBoxID) {
    var result = "";
    var dateString;
    var dateInput;
    var dayOfWeekInput;
    var dayOfWeekBoxID = window.document.getElementById(DayOfWeekBoxID);
    if (dayOfWeekBoxID == null) return;

    if (window.SM.IsNE(dateText)) {
        dateInput = window.event.srcElement;
        if (dateInput != null) {
            dateString = dateInput.value;
        }
    }
    else
        dateString = dateText;

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
                if (CheckDateTimeValue(day, month, year))
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

    if (dayOfWeekBoxID != null && valid)
        dayOfWeekBoxID.value = result;
    else
        dayOfWeekBoxID.value = "";
}

function GetStringDayOfWeek(ind) {
    var days = new Array();
    days[0] = "Пн";
    days[1] = "Вт";
    days[2] = "Ср";
    days[3] = "Чт";
    days[4] = "Пт";
    days[5] = "Сб";
    days[6] = "Вс";

    var result = "";
    if (ind > -1 && ind < 7)
        result = days[ind];

    return result;
}


function CheckDateTimeValue(day, month, year) {

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
    return valid && intDay > 0;
}


function CheckDateTime(dateString) {
    var result = false;

    var dSplits = dateString.split(' ');
    if (dSplits.length == 2)
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

        result = CheckDateTimeValue(day, month, year);
    }

    return result;
}

function InitDatePickerLocale()
{
    if(window.__init_DatePickerLocale)
        return;
    window.__init_DatePickerLocale = true;
    
    var localeSettings = window.DatePickerLocaleSettings;
    if(localeSettings == null)
        throw new Error('Не удалось получить window.DatePickerLocaleSettings.');
    
    if(SM.IsNE(localeSettings.LanguageCode))
        throw new Error('Не задан LanguageCode');
    if(localeSettings.Settings == null)
        throw new Error('Не заданы языковые настройки DatePicker.');
    
    $.datepicker.regional[localeSettings.LanguageCode] = localeSettings.Settings;
    $.datepicker.setDefaults($.datepicker.regional[localeSettings.LanguageCode]);
}