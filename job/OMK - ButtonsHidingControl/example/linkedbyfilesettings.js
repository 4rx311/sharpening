//объект настроек простановки по шаблону файла
function LBFS_LinkedByFileSettings() {
    window.LinkedByFileSettings = this;
    //инициализация обработчиков на поля файлов
    LBFS_InitFilesHandlers.call(this);
}

//инициализация обработчиков на поля файлов
function LBFS_InitFilesHandlers() {
    if (this.FilesFields == null || window.ListForm == null || window.ListForm.GetField == null)
        return;

    var i, len = this.FilesFields.length;
    for (i = 0; i < len; i++) {
        var fieldProxy = this.FilesFields[i];
        if (fieldProxy == null || window.SM.IsNE(fieldProxy.Key))
            continue;

        //получаем поле файлов,
        //на которое будем вешать обработчик на изменение
        var dbField = window.ListForm.GetField(fieldProxy.Key);
        if (dbField == null || dbField.AddChangeHandler == null)
            continue;

        //вешаем обработчик на изменение поля
        dbField.AddChangeHandler(LBFS_FieldChangeHandler);
    }
}

//обработчик на изменение поля
function LBFS_FieldChangeHandler(field, file) {
    if (field == null || file == null || window.ListForm == null
        || window.LinkedByFileSettings == null)
        return;

    if (file.Deleted || file.ClientField == null)
        return;

    var listID = file.ClientField.TemplateListID;
    if (window.SM.IsNE(listID))
        return;

    var fileItemID = file.TemplateID;
    if (fileItemID < 1)
        return;

    //ajax запрос
    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.Controls/DocumentForm/LinkedByFileFields/GetFieldValuesByFile.aspx?';
    url += '&templateListID=' + file.ClientField.TemplateListID;
    url += '&listID=' + window.ListForm.ListID;
    url += '&settingsListID=' + window.LinkedByFileSettings.SettingsListID;
    url += '&fileItemID=' + file.TemplateID;
    url += '&rnd=' + Math.random();

    var ajax = window.SM.GetXmlRequest();
    ajax.open("GET", url, true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            ajax.onreadystatechange = new Function();
            var response = ajax.responseText;
            try {
                //десериализуем настройку
                var settings = JSON.parse(response);
                //проставляем поля в карточку
                LBFS_SetupValues(settings);
            }
            catch (ex) { }
        }
    }
    ajax.send(null);
}

//проставляем значения полей по настройке
function LBFS_SetupValues(settings) {
    if (settings == null)
        return;
    if (settings.SetupValues == null)
        return;

    //обходим все простановочные поля настройки
    var i, len = settings.SetupValues.length;
    for (i = 0; i < len; i++) {
        var setupValue = settings.SetupValues[i];

        if (setupValue == null || window.SM.IsNE(setupValue.Key))
            continue;

        //получаем поле списка
        var field = window.ListForm.GetField(setupValue.Key);
        if (field == null)
            continue;

        //типизированная обработка
        var sValue = null;
        if (setupValue.Value != null) {
            //текстовые поля
            if (field.Type == 'DBFieldText' || field.Type == 'DBFieldMultiLineText')
                sValue = setupValue.Value.StringValue;
            //ед. подстановка
            else if (field.Type == 'DBFieldLookupSingle') {
                //получаем первое значение
                //для единичное подстановки в коллекции всегда будет не больше одного значения
                if (setupValue.Value.LookupValues != null) {
                    if (setupValue.Value.LookupValues.length > 0)
                        sValue = setupValue.Value.LookupValues[0];
                }
            }
            //множ. подстановка
            else if (field.Type == 'DBFieldLookupMulti') {
                //очищаем предыдущие значения
                field.SetValue(null);
                sValue = setupValue.Value.LookupValues;
            }
            //числовые поля
            else if (field.Type == 'DBFieldInteger' || field.Type == 'DBFieldNumber')
                sValue = setupValue.Value.StringValue;
            //галочка
            else if (field.Type == 'DBFieldBoolean') {
                sValue = false;
                if (!window.SM.IsNE(setupValue.Value.StringValue))
                    sValue = setupValue.Value.StringValue.toLowerCase() == 'да';
            }
            //выбор
            else if (field.Type == 'DBFieldChoice')
                sValue = setupValue.Value.StringValue;
            //дата
            else if (field.Type == 'DBFieldDateTime')
                sValue = setupValue.Value.StringValue;
            else {
                alert('Простановка по шаблону файла не поддерживается для поля типа "' + field.Type + '"');
                continue;
            }
        }

        //устанавливаем значение
        field.SetValue(sValue);
    }
}