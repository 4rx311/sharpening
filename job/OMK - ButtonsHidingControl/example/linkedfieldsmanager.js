//конструкор главного объекта (создается на сервере)
function LinkedFieldsManager() {
    if (ListForm == null)
        return;

    window.LinkedFieldManager = this;
    LF_Init.call(this);
}

function LF_Init() {
    try {
        if (ListForm.InitCompleted) {
            //инициализация отслеживаемых полей
            LF_InitFields.call(this);
            //добавляем обработчики на отслеживаемые поля
            LF_AddChangeHandlers.call(this);
        }
        else {
            ListForm.AddInitHandler(function () {
                //инициализация отслеживаемых полей
                LF_InitFields.call(window.LinkedFieldManager);
                //добавляем обработчики на отслеживаемые поля
                LF_AddChangeHandlers.call(window.LinkedFieldManager);
            });
        }
    }
    catch (ex) {
        var msg = 'Не удалось обработать настройки простановки из подстановки. Текст ошибки: ' + ex.message;
        alert(msg);
    }
}

//инициализация полей
function LF_InitFields() {
    this.Fields = [];

    //временная функция обработки коллекции полей.
    var collectionHandler = function (collection) {
        if (collection == null)
            return;

        var uniqueAjaxField = [];
        var i, len = collection.length;
        for (i = 0; i < len; i++) {
            var linkedField = collection[i];
            if (SM.IsNE(linkedField.SourceFieldName) || SM.IsNE(linkedField.DestinationFieldName))
                continue;

            //получаем объект поля источника
            var sourceField = ListForm.GetField(linkedField.SourceFieldName);
            var destinationField = ListForm.GetField(linkedField.DestinationFieldName);

            if (sourceField == null || destinationField == null)
                continue;

            linkedField.SourceListField = sourceField;
            linkedField.DestinationListField = destinationField;
            linkedField.InitIndex = this.Fields.length;

            //если поле требует ajax запроса
            var addHandler = false;
            if (linkedField.AjaxField) {
                //то проверяем есть ли другая настройка с таким же источником
                var ajaxDestinationField = uniqueAjaxField[linkedField.SourceListField.Name];
                if (ajaxDestinationField == null) {
                    //источник текущей настройки встретился первый раз
                    //считаем его за "носителя" всех полей назначений по данному источнику
                    addHandler = true;
                    ajaxDestinationField = linkedField;
                    uniqueAjaxField[linkedField.SourceListField.Name] = ajaxDestinationField;
                }

                if (ajaxDestinationField.AjaxDestinationFields == null)
                    ajaxDestinationField.AjaxDestinationFields = [];

                ajaxDestinationField.AjaxDestinationFields.push(linkedField);
            }
            else {
                //для offline полей всегда добавляем поле в коллекцию
                //т.к. в этом случае если существуют два источника с одинаковым именем
                //два обработчика не создадут нагрузку, т.к. нет ajax запросов.
                addHandler = true;
            }

            if (addHandler) {
                //добавляем в коллекцию полей объект поля с настройками.
                this.Fields[this.Fields.length] = linkedField;
                //инициализация прокси поля
                LF_FieldProxy.call(linkedField);
            }
        }
    }

    //инициализация ajax полей
    collectionHandler.call(this, this.OnlineFields);
    //инициализация offline полей
    collectionHandler.call(this, this.OfflineFields);
}

//прокси поле
function LF_FieldProxy() {
    var thisObj = this;
    //функция создания обработчика
    this.AddHandler = function () {
        thisObj.SourceListField.AddChangeHandler(function (field) {
            LF_WriteLog(thisObj.ID);
            LF_UpdateDestinationFieldValue.call(thisObj);
        });
    };
}

//логи
function LF_WriteLog(msg) {
    var logEnabled = false;//логи выключены.
    if (!logEnabled)
        return;

    if (SM.IsNE(msg))
        return;

    SM.WriteLog(msg.toString());
}

//инициализация обработчиков всех полей
function LF_AddChangeHandlers() {
    var initFieldsOnLoad = window.location.href.toLowerCase().indexOf('initfields=true') != -1;
    LF_WriteLog('инициализация полей по параметру адресной строки:' + initFieldsOnLoad);

    if (this.Fields != null) {
        var i, len = this.Fields.length;
        for (i = 0; i < len; i++) {
            var linkedField = this.Fields[i];
            linkedField.AddHandler();

            if (initFieldsOnLoad)
                linkedField.SourceListField.OnChange();
        }
    }
}

//обработчик на изменение поля, которое отслеживается тек. модулем
function LF_UpdateDestinationFieldValue() {
    if (window.ListForm == null || this.SourceListField == null || this.DestinationListField == null)
        return;

    //если не используется ajax, то нужно копировать в поле карточки тек. значения поля
    var value = this.SourceListField.GetValue();
    //определяем тип подстановки (ед./мн ?)
    var multiple = true;
    var lookupListID = 0;
    if (!SM.IsNE(this.SourceListField.Type)) {
        if (this.SourceListField.Type == 'MSLField') {
            if (this.SourceListField.TypedField != null) {
                multiple = this.SourceListField.TypedField.IsMultiple;
                //lookupListID получаем по значению, потому что это мультиисточник
                //и значения могут ссылаться на разные списки.
                if (value != null) {
                    if (!multiple)
                        lookupListID = value.LookupListID;
                    else {
                        if (value.length > 0)
                            lookupListID = value[0].LookupListID;
                    }
                }
            }
        }
        else if (this.SourceListField.Type == 'DBFieldLookupMulti' || this.SourceListField.Type == 'DBFieldLookupSingle') {
            if (this.SourceListField.TypedField != null && this.SourceListField.TypedField.Settings != null) {
                multiple = this.SourceListField.TypedField.Settings.IsMultiple;
                lookupListID = this.SourceListField.TypedField.Settings.LookupListID;
            }
        }
    }

    if (!this.AjaxField) {
        //проверяем заполненность поля, если его не нужно перезаписывать
        //и его значение не пусто, то останавливаем простановку.
        if (!this.OverwriteDestinationField && !this.DestinationListField.IsEmptyValue())
            return;

        var valString = '';
        //получаем из подстановки значения
        if (value != null) {
            if (multiple) {
                var i, len = value.length;
                for (i = 0; i < len; i++) {
                    var lv = value[i];
                    valString += '_vi_' + lv.LookupID + '_vt_' + lv.LookupText;
                }
            }
            else {
                valString = '_vi_' + value.LookupID + '_vt_' + value.LookupText;
            }
        }

        //определяем тип поля назначения
        var valueType = 'Text';
        if (!SM.IsNE(this.DestinationListField.Type)) {
            if (this.DestinationListField.Type == 'DBFieldText')
                valueType = 'Text';
            else if (this.DestinationListField.Type == 'DBFieldLookupMulti' || this.DestinationListField.Type == 'DBFieldLookupSingle')
                valueType = 'Lookup';
        }

        //устанавливаем значения
        LC_SetFieldValue({
            Value: valString,
            Field: this.DestinationListField,
            ValueType: valueType
        });
    }
        //если нужно взять значения из подстановочного элемента, то делаем ajax на сервер
    else {
        //формируем параметры запроса
        var url = "/_layouts/WSS/WSSC.V4.DMS.Controls/DocumentForm/LinkedFields/GetLinkedFieldsValues.aspx?";
        url += "&webID=" + ListForm.WebID;
        url += "&lstID=" + ListForm.ListID;
        url += "&fldID=" + this.SourceListField.ID;
        url += "&lookupListID=" + lookupListID;

        //получаем значения, которые установили в подстановке
        //потому что на сервере их еще нет
        var identities = '';
        if (value != null) {
            if (!multiple)
                identities += value.LookupID;
            else {
                var vi, vlen = value.length;
                for (vi = 0; vi < vlen; vi++) {
                    if (identities.length > 0)
                        identities += ';';

                    identities += value[vi].LookupID;
                }
            }
        }

        if (SM.IsNE(identities))
            identities += '0';

        url += "&lookupID=" + identities;
        url += "&rnd=" + Math.random();

        //отправляем запрос на сервер
        var ajax = SM.GetXmlRequest();
        ajax.open("GET", url, false);
        ajax.send(null);

        var response = ajax.responseText;
        //обработка серверного ответа
        LF_UpdateDestinationFieldValueCallBack.call(this, response);
    }
}

///ответ от ajax страницы со значениями, которые нужно проставить в поля назначения
function LF_UpdateDestinationFieldValueCallBack(responseXML) {
    try {
        if (SM.IsNE(responseXML))
            return;

        //если ответ без ошибок
        if (responseXML.toLowerCase().indexOf("exception") == -1) {
            //получаем xml документ
            var xmlDoc = SM.LoadXML(responseXML);
            //гланый узел xml
            var rootNode = xmlDoc.selectSingleNode("ArrayOfResponseField");
            if (rootNode == null)
                return;

            //получаем xml узел полей
            var fields = rootNode.selectNodes("ResponseField");
            var i, len = fields.length;

            //обрабатываем все поля, ответ по которым пришел с сервера
            for (i = 0; i < len; i++) {
                var responseField = fields[i];

                var sourceFieldName = responseField.getAttribute("SourceField");
                var destFieldName = responseField.getAttribute("DestinationField");

                if (SM.IsNE(sourceFieldName) || SM.IsNE(destFieldName))
                    continue;

                var destinationLinkedField = null;
                if (this.AjaxDestinationFields != null) {
                    var di, dlen = this.AjaxDestinationFields.length;
                    for (di = 0; di < dlen; di++) {
                        var ajaxDestinationField = this.AjaxDestinationFields[di];
                        if (ajaxDestinationField.DestinationListField.Name == destFieldName) {
                            destinationLinkedField = ajaxDestinationField;
                            break;
                        }
                    }
                }

                //не удалось найти настройку простановки поля
                //возможно между вызовом обработчика изменения поля источника и ответом от сервера
                //настройки были изменены.
                if (ajaxDestinationField == null)
                    continue;

                //объект поля назначения уже должен быть получен ранее
                var listField = ajaxDestinationField.DestinationListField;
                if (listField == null)
                    continue;

                //проверяем заполненность поля, если его не нужно перезаписывать
                //и его значение не пусто, то останавливаем простановку.
                if (!ajaxDestinationField.OverwriteDestinationField &&
                    !ajaxDestinationField.DestinationListField.IsEmptyValue())
                    continue;

                //тип значения для поля назначения
                //по умолчанию = текст
                var valueType = "Text";
                if (responseField.getAttribute("DestinationFieldValueType") != null)
                    valueType = responseField.getAttribute("DestinationFieldValueType");

                //значение
                var valString = '';
                if (listField.Type == 'TSField') {
                    var valNode = responseField.selectSingleNode('Rows');
                    if (valNode != null)
                        valString = window.SM.PersistXML(valNode);
                }
                else {
                    if (responseField.getAttribute("FieldValue") != null)
                        valString = responseField.getAttribute("FieldValue");
                }

                if (valString == null)
                    continue;

                //проставляем значения в поле назначение
                LC_SetFieldValue({
                    Value: valString,
                    Field: listField,
                    ValueType: valueType
                });
            }
        }
    }
    catch (ex) {
        var msg = 'Не удалось обработать выполнить простановку из подстановки. Текст ошибки: ' + ex.message;
        alert(msg);
    }
}


//простановка значений в поле назначения
function LC_SetFieldValue(options) {
    try {
        //валидация
        if (options == null)
            throw Error('options is null');

        if (options.Field == null)
            throw Error('options.Field is null');

        if (window.SM.IsNE(options.ValueType))
            throw Error('options.ValueType is null');

        //поля нет на форме, выдаем предупреждение
        if (options.Field.ReadOnly) {
            var alertMsg = TN.TranslateKey('edms.linkedfields.missingfield.start');
            alertMsg += ' "' + options.Field.Name + '" ';
            alertMsg += TN.TranslateKey('edms.linkedfields.missingfield.end');
            alertMsg += ' ' + TN.TranslateKey('edms.commonuseralert');
            alert(alertMsg);
            return;
        }

        //генерация массива подстановочных элементов и 
        //массива элементов значений поля рассылки
        var lvals = [];
        var nfVals = [];
        var lookups = options.Value.split('_vi_');
        var uniqueIdArray = new Array();
        for (var k = 0; k < lookups.length; k++) {
            if (window.SM.IsNE(lookups[k]))
                continue;

            var splits = lookups[k].split('_vt_');
            if (splits.length == 2) {
                var lval = new Object();
                nfVals[nfVals.length] = splits[0];
                lval.LookupID = splits[0];
                if (uniqueIdArray[lval.LookupID] != null)
                    continue;

                uniqueIdArray[lval.LookupID] = lval.LookupID;
                lval.LookupText = splits[1];
                lvals[lvals.length] = lval;
            }
        }

        //типизированная обработка полей
        //рассылка
        if (options.Field.Type == 'NFField') {
            if (options.Field.TypedField != null) {
                //очищаем предыдущие значения
                options.Field.TypedField.ClearEmployees();
                //установка значений
                options.Field.TypedField.SetEmployees(nfVals);
                //обновляем кол-во в поле
                options.Field.TypedField.UpdateValuesCount();
            }
        }
        else if (options.Field.Type == 'DBFieldFiles') {
            //загрузка файлов из поля Ссылка на файл.
            var linksValueText = options.Value;
            var filesField = options.Field.TypedField;
            if (!SM.IsNE(linksValueText) && filesField != null) {
                var linksDocument = SM.LoadXML(linksValueText);
                var linksRoot = linksDocument.selectSingleNode('FileLinks');
                var linkNodes = linksRoot.selectNodes('FileLink');
                var templateListID = linksRoot.getAttribute('TemplateListID');

                if (templateListID != filesField.TemplateListID)
                    throw new Error('Библиотека файлов источника на совпадает с библиотекой шаблонов поля файлов ' + filesField.FieldTitle);


                var i, len = linkNodes.length;
                for (i = 0; i < len; i++) {
                    var linkNode = linkNodes[i];
                    var templateName = linkNode.getAttribute('FileName');
                    var templateID = linkNode.getAttribute('FileItemID');

                    if (!SM.IsNE(templateName) && !SM.IsNE(templateID)) {
                        var existingFile = filesField.GetFile(templateName);
                        if (existingFile != null)
                            throw new Error('Ошибка простановки файлов по простановке из подстановки. Файл ' + templateName + ' уже добавлен в поле файлов ' + filesField.FieldTitle);

                        var fieldTitleLocal = filesField.FieldTitle;
                        OnTemplateSelect(fieldTitleLocal, templateName, templateID);
                    }

                    break;
                }
            }
        }
        else {
            //устанавливаем текст в поле
            if (options.ValueType == 'Text') {
                var textVal = '';
                if (options.Value.indexOf("_vi_") != -1) {
                    for (var j = 0; j < lvals.length; j++) {
                        if (j > 0)
                            textVal += "; ";
                        textVal += lvals[j].LookupText;
                    }
                }
                else
                    textVal = options.Value;

                options.Field.SetValue(textVal);
            }
                //поле - галочка
            else if (options.ValueType == "Boolean") {
                var boolValue = false;
                if (!window.SM.IsNE(options.Value))
                    boolValue = options.Value.toString().toLowerCase() == 'true';

                options.Field.SetValue(boolValue);
            }
            else if (options.ValueType == "Lookup" && options.Field.Type.indexOf("DBFieldLookup") != -1) {
                //установка подстановок
                //мн.
                if (options.Field.TypedField == null) {
                    var errorMsg = 'В поле "' + options.Field.Name + '" не реализовано интерфейсное свойство TypedField.';
                    throw new Error(errorMsg);
                }

                if (options.Field.TypedField.Settings.IsMultiple) {
                    options.Field.TypedField.DisableChangeHandler = true;
                    options.Field.SetValue(null);
                    options.Field.TypedField.DisableChangeHandler = false;
                    if (lvals.length > 0)
                        options.Field.SetValue(lvals);
                }
                    //ед.
                else {
                    if (lvals.length > 0)
                        options.Field.SetValue(lvals[0]);
                    else
                        options.Field.SetValue(null);
                }
            }
        }
    }
    catch (ex) {
        var fieldName = null;
        if (options != null && options.Field != null)
            fieldName = options.Field.Name;

        if (SM.IsNE(fieldName))
            fieldName = 'не определено';

        var userMsg = 'Возникла неожиданная ошибка при простановке поля "' + fieldName + '". Текст ошибки: ' + ex.message;
        userMsg += '\r';
        userMsg += 'Обратитесь к администратору.'
        alert(userMsg);
    }
}