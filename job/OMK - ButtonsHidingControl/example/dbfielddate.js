//debugger
function DBFieldDate(valueControlID, settings, defaultHours, defaultMinutes) {
    this.ValueControl = window.document.getElementById(valueControlID);

    //Properties
    this.DefaultHours = defaultHours;
    this.DefaultMinutes = defaultMinutes;
    this.IsChange = false;
    this.FieldName = settings.FieldName;
    this.ControlMode = settings.ControlMode;
    this.IsEditForm = this.ControlMode == 'Edit';
    if (this.IsEditForm)
        this.DateControl = this.ValueControl.DateControl;
    this.ShowTime = settings.ShowTime;

    //Interface
    this.IsChanged = DBFieldDate_IsChanged;
    this.OnInit = DBFieldDate_OnInit;
    this.OnSave = DBFieldDate_OnSave;
    this.Disable = DBFieldDate_Disable;
    this.Enable = DBFieldDate_Enable;
    this.GetValue = DBFieldDate_GetValue;
    this.SetValue = DBFieldDate_SetValue;
    this.ShowInformer = DBFieldDate_ShowInformer;
    this.IsEmptyValue = DBFieldDate_IsEmptyValue;

    //Methods
    this.Init = DBFieldDate_Init;

    //Initialization
    this.Init();

    if (this.DateControl != null) {
        var date = this.DateControl.GetDate();
        if (window.SM.IsNE(date))
            this.DateControl.SetTime(this.DefaultHours + ':' + this.DefaultMinutes);
    }
}

//Init
function DBFieldDate_Init() {
    if (window.DBFieldDateCollection == null)
        window.DBFieldDateCollection = new Array();
    if (!window.SM.IsNE(this.FieldName))
        window.DBFieldDateCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldDate_IsChanged() {
    return this.IsChange;
}

function DBFieldDate_GetField(fieldName) {
    var field = null;
    if (window.DBFieldDateCollection != null && !window.SM.IsNE(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldDateCollection[fieldName];
    }
    return field;
}

//Interface
function DBFieldDate_OnInit() {
    //Handlers
    if (this.DateControl != null) {
        var objRef = this;
        var dateCtrl = this.DateControl;

        var func = function() { objRef.IsChange = true; objRef.ListFormField.OnChange(); }
        this.DateControl.AddChangeHandler(func);
    }
}

function DBFieldDate_IsEmptyValue() {
    var value = this.GetValue();
    if (window.SM.IsNE(value)) {
        return true;
    }
    return false;
}

//debugger
function DBFieldDate_OnSave(saveEventArgs) {
    if (this.ListFormField.Required) {
        var value = this.GetValue();
        if (window.SM.IsNE(value)) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsEmptyValue = true;
        }
    }

    //проверка на корректность даты
    if (this.DateControl != null) {
        if (!this.DateControl.IsValid()) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsIncorrectValue = true;
            return;
        }
        else {
            var date = this.DateControl.GetDate();
            if (!window.SM.IsNE(date)) {
                var yearSpl = date.split('.');
                if (yearSpl.length == 3) {

                    var yearString = yearSpl[2];
                    var year = parseInt(yearString);

                    if (year < 1754 || year > 9999) {
                        saveEventArgs.CanSave = false;
                        saveEventArgs.IsIncorrectValue = true;
                        return;
                    }
                }
            }
        }
    }
}

function DBFieldDate_Disable() {
    if (this.DateControl != null)
        this.DateControl.Disable();
}

function DBFieldDate_Enable() {
    if (this.DateControl != null)
        this.DateControl.Enable();
}

function DBFieldDate_GetValue() {
    var value = null;
    if (this.IsEditForm && this.DateControl != null) {
        if (this.ShowTime)
            value = this.DateControl.GetDateTime();
        else
            value = this.DateControl.GetDate();
    }
    else
        value = $(this.ValueControl).text();
    return value;
}

function DBFieldDate_SetValue(value) {
    if (this.IsEditForm) {
        if (value == null)
            value = '';
        value = value.toString();

        if (window.SM.IsNE(value)) {
            if (this.DateControl != null) {
                this.DateControl.SetDate('');
                this.DateControl.SetTime('00:00');
            }
        }
        else {
            if (this.DateControl != null) {
                var temp = value.split(' ')[0];
                if (!window.SM.IsNE(temp)) {
                    var splits = temp.split('.');
                    if (splits.length == 3) {
                        var day = -1;
                        var month = -1;
                        var year = -1;

                        var dayStr = splits[0];
                        if (dayStr.charAt(0) == '0')
                            dayStr = dayStr.substring(1);
                        day = parseInt(dayStr);
                        var monthStr = splits[1];
                        if (monthStr.charAt(0) == '0')
                            monthStr = monthStr.substring(1);
                        month = parseInt(monthStr);
                        year = parseInt(splits[2]);

                        var hasAlert = false;
                        var correct = false;
                        if (year < 1753 || year > 9998) {
                            correct = false;
                            hasAlert = true;
                            alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '". Значение должно попадать в диапазон от 01.01.1753 до 31.12.9998');
                        }
                        else {
                            //функция для проверки даты и времени
                            if (this.DateControl.CheckDateTime != null)
                                correct = this.DateControl.CheckDateTime(value);
                            else
                                correct = this.DateControl.CheckDate(value);
                        }

                        if (correct) {
                            if (value.indexOf(" ") == -1)
                                this.DateControl.SetDate(value);
                            else {
                                var time = value.split(' ')[1];
                                if (!window.SM.IsNE(time)) {
                                    var tSplit = time.split(':');
                                    if (tSplit.length == 2) {
                                        var hour = -1;
                                        var min = -1;
                                        var hStr = tSplit[0];
                                        if (hStr.charAt(0) == '0')
                                            hStr = hStr.substring(1);
                                        hour = parseInt(hStr);

                                        var minStr = tSplit[1];
                                        if (minStr.charAt(0) == '0')
                                            minStr = minStr.substring(1);
                                        min = parseInt(minStr);

                                        if (hour > -1 && hour < 25 && min > -1 && min < 60)
                                            this.DateControl.SetDateTime(value);
                                        else
                                            alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
                                    }
                                    else
                                        alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
                                }
                                else
                                    alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
                            }
                        }
                        else {
                            if (!hasAlert)
                                alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
                        }
                    }
                    else
                        alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
                }
                else
                    alert('Значение: "' + value + '" не является допустимым для поля: "' + this.ListFormField.DisplayName + '".');
            }
        }
    }
}

function DBFieldDate_ShowInformer(message) {
}