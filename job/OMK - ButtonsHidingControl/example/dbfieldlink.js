function DBFieldLink(valueControlID, hiddenValueControlID) {
    this.ServerContainer = window.document.getElementById(valueControlID);
    this.HiddenControlID = hiddenValueControlID;
    this.HiddenControl = window.document.getElementById(this.HiddenControlID);
    //св-ва
    this.Changed = false;

    //интерфейсы DBField
    this.OnInit = DBFieldLink_OnInit;
    this.OnSave = DBFieldLink_OnSave;
    this.Disable = DBFieldLink_Disable;
    this.Enable = DBFieldLink_Enable;
    this.GetValue = DBFieldLink_GetValue;
    this.SetValue = DBFieldLink_SetValue;
    this.ShowInformer = DBFieldLink_ShowInformer;
    this.IsChanged = DBFieldLink_IsChanged;
    this.IsEmptyValue = DBFieldLink_IsEmptyValue;
    //методы
    this.Init = DBFieldLink_Init;
    this.Initialize = DBFieldLink_Initialize;

    //инициализация
    this.Init();
    this.Initialize();
}

/**********/
/**********/
//Инциализация
function DBFieldLink_Init() {
    if (window.DBFieldLinkCollection == null)
        window.DBFieldLinkCollection = new Array();
    if (!window.SM.IsNE(this.FieldName))
        window.DBFieldLinkCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldLink_GetField(fieldName) {
    var field = null;
    if (window.DBFieldLinkCollection != null && !window.SM.IsNE(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldLinkCollection[fieldName];
    }
    return field;
}

/**********/
/**********/
//Интерфейсы
function DBFieldLink_OnInit() {
}

function DBFieldLink_OnSave(saveEventArgs) {
    try {
        //проверка заполненности поля
        if (this.ListFormField && this.ListFormField.Required) {
            if (DBFieldLink_IsEmptyValue.call(this)) {
                saveEventArgs.CanSave = false;
                saveEventArgs.IsEmptyValue = true;
            }
        }

        if (saveEventArgs.CanSave) {
            //сериализуем значения поля в json строку для сервера
            var value = this.GetValue();

            //делаем чистые копии объектов (без ссылок на UI элементы)
            var clearedValues = [];
            if (value != null) {
                var i, len = value.length;
                for (i = 0; i < len; i++) {
                    var linkValue = value[i];
                    var newObj = {
                        ID: linkValue.ID,
                        Title: linkValue.Title,
                        Tooltip: linkValue.Tooltip,
                        Url: linkValue.Url
                    };

                    //в ие8 баг JSON.stringify. Пустую строку преобразует в строку 'null'
                    //поэтому для пустых значений сделан псевдоним.
                    if (SM.IsNE(newObj.Tooltip))
                        newObj.Tooltip = 'WSSC.V4.SYS.Fields.Link.EmptyValue';

                    clearedValues.push(newObj);
                }
            }

            var jsonString = '';
            if (clearedValues.length > 0)
                jsonString = window.SM.Stringify(clearedValues);

            //записываем в скрытое поле
            this.HiddenControl.value = jsonString;
        }
    }
    catch (ex) {
        var errorText = '';
        if (ex != null)
            errorText = 'Произошла ошибка при сохранении поля "' + this.FieldName + '". Текст ошибки: ' + ex.message;
        else
            errorText = 'Произошла неизвестная ошибка при сохранении поля "' + this.FieldName + '"';

        alert(errorText);
        saveEventArgs.CanSave = false;
    }
}

//Проверка на заполненность поля
function DBFieldLink_IsEmptyValue() {
    var value = this.GetValue();
    //проверка на кол-во ссылок
    return value == null || value.length == 0;
}

//Дизейбл поля
function DBFieldLink_Disable() {
    if (this.IsEditForm) {
        //скрываем ссылку "Добавить ссылку"
        if (this.CreateLink != null)
            this.CreateLink.style.display = 'none';
        //скрываем иконки действий ссылок
        var value = this.GetValue();
        if (value != null && value.length > 0) {
            var i, len = value.length;
            for (i = 0; i < len; i++) {
                var dataLink = value[i];
                if (dataLink.Deleted || dataLink.ActionsContainer == null)
                    continue;

                dataLink.ActionsContainer.style.display = 'none';
            }
        }
    }
}

//енейбл поля
function DBFieldLink_Enable() {
    if (this.IsEditForm) {
        //открываем ссылку "Добавить ссылку"
        if (this.CreateLink != null)
            this.CreateLink.style.display = '';
        //открываем иконки действий ссылок
        var value = this.GetValue();
        if (value != null && value.length > 0) {
            var i, len = value.length;
            for (i = 0; i < len; i++) {
                var dataLink = value[i];
                if (dataLink.Deleted || dataLink.ActionsContainer == null)
                    continue;

                dataLink.ActionsContainer.style.display = '';
            }
        }
    }
}

//Получение значений поля
function DBFieldLink_GetValue() {
    var value = [];
    if (this.IsEditForm && this.Values != null) {
        var i, len = this.Values.length;
        for (i = 0; i < len; i++) {
            var val = this.Values[i];
            if (val.Deleted)
                continue;

            value.push(val);
        }
    }

    return value;
}

function DBFieldLink_SetValue(value) {
    if (this.IsEditForm) {
        alert('Поле "' + this.FieldName + '" не поддерживает установку значений.');
        return;

        //на будущее
        DBFieldLink_OnChange.call(this);
    }
    else
        alert('Поле "' + this.FieldName + '" не поддерживает установку значений на форме просмотра.');
}

function DBFieldLink_ShowInformer(message) {
}

function DBFieldLink_IsChanged() {
    return this.Changed == true;
}

function DBFieldLink_Initialize() {
    if (this.ServerContainer == null)
        return;

    if (this.HiddenControl == null) {
        alert('Не удалось найти контрол значений поля "' + this.FieldName + '" по ид:' + this.HiddenControlID);
        return;
    }
    this.FieldContainer = window.document.createElement('div');
    this.FieldContainer.className = 'dbflink_container';
    if (this.IsEditForm) {
        //ссылка добавления ссылок
        this.CreateLink = window.document.createElement('a');
        this.CreateLink.className = 'dbflink_link_create';
        this.CreateLink.href = 'javascript:void(0);';
        var thisObj = this;
        $(this.CreateLink).click(function () {
            DBFLink_OpenEditWindow(thisObj);
            return false;
        });
        var addLinkText = TN.TranslateKey('linkfield.texts.addlink');
        if (SM.IsNE(addLinkText))
            addLinkText = 'Не задано';
        $(this.CreateLink).text(addLinkText);
        this.FieldContainer.appendChild(this.CreateLink);

        //разделитель
        var divClear = window.document.createElement('div');
        divClear.className = 'dbflink_div_clear';
        this.FieldContainer.appendChild(divClear);
    }

    //инициализация ссылок поля (значения с сервера)
    if (this.Values != null) {
        var i, len = this.Values.length;
        for (i = 0; i < len; i++) {
            var linkValue = this.Values[i];
            if (window.SM.IsNE(linkValue.Url) || window.SM.IsNE(linkValue.Title))
                continue;

            //добавляем ссылку
            //иконки редактирования и удаления
            DBFLink_Link.call(linkValue, this);
        }
    }
    this.ServerContainer.appendChild(this.FieldContainer);
}

function DBFieldLink_OnChange() {
    this.ListFormField.OnChange();
}

/********* ССЫЛКА ********/
function DBFLink_Link(fieldDataObject) {
    //контейнер ссылки и иконок
    var thisObj = this;
    if (fieldDataObject.Index == null)
        fieldDataObject.Index = 0;

    this.Index = fieldDataObject.Index;
    fieldDataObject.Index++;
    this.DataLinkContainer = window.document.createElement('div');
    this.DataLinkContainer.NonSerialized = true; //не сериализуем ui
    this.DataLinkContainer.className = 'dbflink_linkandimgages_container';
    this.DataLinkContainer.style.width = fieldDataObject.ControlWidth + 'px';

    //иконки редактирования/удаления
    var imagesAdded = false; //добавлены ли иконки действий
    if (fieldDataObject.IsEditForm) {
        this.ActionsContainer = window.document.createElement('div');
        this.ActionsContainer.NonSerialized = true; //не сериализуем ui
        this.ActionsContainer.className = 'dbflink_linkaction_container'

        //редактировать
        var editImg = window.document.createElement('img');
        editImg.DataObject = {
            Field: fieldDataObject
        };
        $(editImg).click(function () {
            if (this.DataObject != null && this.DataObject.Field != null)
                DBFLink_OpenEditWindow(this.DataObject.Field, thisObj);
        });
        editImg.src = '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Link/Images/edit.png';
        editImg.className = 'dbflink_image';
        this.ActionsContainer.appendChild(editImg);

        //удалить
        var delImg = window.document.createElement('img');
        $(delImg).click(function () {
            if (thisObj.DataLinkContainer != null) {
                //удаленную ссылку не сохраняем как значение в поле
                thisObj.NonSerialized = true;
                thisObj.Deleted = true;
                thisObj.DataLinkContainer.style.display = 'none';

                if (window.SM.ResetFormLayout != null)
                    SM.ResetFormLayout();

                DBFieldLink_OnChange.call(fieldDataObject);
            }
        });
        delImg.src = '/_layouts/WSS/DBF/UI/Images/delete.png';
        delImg.className = 'dbflink_image';
        this.ActionsContainer.appendChild(delImg);
        this.DataLinkContainer.appendChild(this.ActionsContainer);
        imagesAdded = true;
    }

    //контейнер ссылок
    var linkContainer = window.document.createElement('div');
    linkContainer.className = 'dbflink_link_container';
    if (imagesAdded)
        linkContainer.style.width = (fieldDataObject.ControlWidth - 41) + 'px';
    else
        linkContainer.style.width = fieldDataObject.ControlWidth + 'px';

    //ссылка
    this.Link = window.document.createElement('a');
    this.Link.NonSerialized = true; //не сериализуем ui
    if (!window.SM.IsNE(this.Tooltip))
        this.Link.title = this.Tooltip;
    this.Link.className = 'dbflink_link';
    $(this.Link).text(this.Title);
    this.Link.href = thisObj.Url;
    //клик по ссылке
    $(this.Link).click(function (evt) {
        window.open(thisObj.Url, '_blank', 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no');
        return false;
    });

    linkContainer.appendChild(this.Link);
    this.DataLinkContainer.appendChild(linkContainer);
    //добавляем ссылку в DOM
    fieldDataObject.FieldContainer.appendChild(this.DataLinkContainer);
}

//связь окна с объектом поля и ссылки
function DBFLink_SaveLink(obj) {
    if (obj == null)
        throw Error('obj is null');

    var popupWindow = window.GetPopupWindow();
    if (popupWindow == null || popupWindow.DBFLinkData == null ||
        popupWindow.DBFLinkData.Field == null)
        return;

    var validationResult = '';
    if (SM.IsNE(obj.Url)) {
        if (!SM.IsNE(validationResult))
            validationResult += '\r\n';

        var missingLinkSource = TN.TranslateKey('linkfield.alerts.missinglinksource') + '.';
        validationResult += missingLinkSource;
    }
    else {
        //если не задан заголовок, то заголовок устанавливаем по адресу.
        if (SM.IsNE(obj.Title))
            obj.Title = obj.Url
    }

    if (SM.IsNE(validationResult)) {
        var isNew = popupWindow.DBFLinkData.Link == null;
        //создание ссылки
        if (isNew) {
            obj.ID = 0;
            DBFLink_Link.call(obj, popupWindow.DBFLinkData.Field);
            if (popupWindow.DBFLinkData.Field.Values == null)
                popupWindow.DBFLinkData.Field.Values = [];

            popupWindow.DBFLinkData.Field.Values.push(obj);

            //обновляем высоту колонок формы
            if (window.SM.ResetFormLayout != null)
                window.SM.ResetFormLayout();
        }
            //обновление существующей ссылки
        else {
            //копируем свойсвта в объект
            popupWindow.DBFLinkData.Link.Title = obj.Title;
            popupWindow.DBFLinkData.Link.Url = obj.Url;
            popupWindow.DBFLinkData.Link.Tooltip = obj.Tooltip;
            //копируем свойства в DOM
            $(popupWindow.DBFLinkData.Link.Link).text(obj.Title);
            popupWindow.DBFLinkData.Link.Link.title = obj.Tooltip;
        }

        window.HidePopupWindow();
        DBFieldLink_OnChange.call(popupWindow.DBFLinkData.Field);
    }
    else
        alert(validationResult);
}

function DBFLink_InitWindowData() {
    var txtTitle = window.document.getElementById('dbflink_txt_ttl');
    var txtUrl = window.document.getElementById('dbflink_txt_url');
    var txtTooltip = window.document.getElementById('dbflink_txt_tooltip');

    //заполняем результат по полям
    var title = '', url = '', tooltip = '';
    if (txtTitle != null)
        title = txtTitle.value;
    if (txtUrl != null)
        url = txtUrl.value;
    if (txtTooltip != null)
        tooltip = txtTooltip.value;

    var linkObj = {
        Title: title,
        Url: url,
        Tooltip: tooltip
    };
    return linkObj;
}

//открывает окошка создания/редактирования
function DBFLink_OpenEditWindow(field, link) {
    if (field == null)
        throw Error('field is null');

    var url = '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Link/EditLink.aspx?rnd=' + Math.random();
    var winTitle = 'Редактирование ссылки';
    var popupWindow = window.GetPopupWindow();

    //объект поля и редактируемой ссылки
    var currentData = {
        Field: field,
        Link: link
    };

    popupWindow.DBFLinkData = currentData;
    popupWindow.Open(url, 350, 147, '19px 16px 10px 16px !important');
    //window.OpenPopupWindow(url, 350, 110, '19px 16px 10px 16px !important');
}

function DBFieldLink_InitEditWindow() {
    //если редактируем существующую ссылку, то заполняем поля окошка
    var txtTitle = window.document.getElementById('dbflink_txt_ttl');
    var txtUrl = window.document.getElementById('dbflink_txt_url');
    var txtTooltip = window.document.getElementById('dbflink_txt_tooltip');

    //обновляем значения полей
    var popupWindow = window.GetPopupWindow();
    if (popupWindow == null || popupWindow.DBFLinkData == null ||
        popupWindow.DBFLinkData.Link == null)
        return;

    if (txtTitle != null)
        txtTitle.value = popupWindow.DBFLinkData.Link.Title;

    if (txtUrl != null)
        txtUrl.value = popupWindow.DBFLinkData.Link.Url;

    if (txtTooltip != null && !window.SM.IsNE(popupWindow.DBFLinkData.Link.Tooltip))
        txtTooltip.value = popupWindow.DBFLinkData.Link.Tooltip;
}