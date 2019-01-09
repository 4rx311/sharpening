/// <var type="ChangeFieldNotify">Экземпляр клиентского класса элемента управления</var>
var ChangeFieldNotify_Instance;

function ChangeFieldNotify_Init() {
    /// <summary>
    /// Обработчик, вызываемый при инициализации формы
    /// </summary>
    ChangeFieldNotify_Instance = new ChangeFieldNotify(this);
}

function ChangeFieldNotify_BeforeSave() {
    /// <summary>
    /// Обработчик, вызываемый перед сохранением формы
    /// </summary>
    ChangeFieldNotify_Instance.BeforeSaveHandler();
}

function ChangeFieldNotify_OnSave(e) {
    /// <summary>
    /// Обработчик, вызываемый по сохранению формы
    /// </summary>
    ChangeFieldNotify_Instance.OnSave(e);
}

var ChangeFieldNotify = (function () {
    /// <summary>
    /// Область видимости класса
    /// </summary>    

    /// <var>Константы</var>
    ChangeFieldNotify.CONST = {
        CONFIRMMESSAGE: "Вами были изменено значение в следующих полях: [Название полей]. Уведомить заинтересованных лиц (Инициатора и Авторов материала, Секретаря заседания) об изменениях?"
    }

    function ChangeFieldNotify(initInstance) {
        /// <summary>
        /// Класс элемента управления
        /// </summary>
        /// <param name="initInstance" type="InitConsts">Переданные с сервера настройки элемента управления</param>

        /// <field name="_Settings" type="InitConsts">Настройки с сервера</field>
        /// <field name="_OriginalValues" type="Object">Сохраненные значения полей и сами поля.</field>
        /// <field name="NotificationNotSend" type="Boolean">Пользователь отклонил отправку уведомления об изменении</field>

        if (!initInstance) {
            throw new Error("В метод не передан параметр initInstance");
        }

        this._Settings = initInstance;
        this._OriginalValues = {};

        this.NotificationNotSend = false;

        this.DataForMailSending = null;

        // Инициализировать полифиллы
        this.InitializePollyfilles();

        if (this._Settings.Active) {
            // Сохранить первоначальные значения полей
            this.SaveOriginalValues();
            // Обработчик после сохранения карточки
            SM.AttachEvent(window.ListForm, "OnSubmitCompleted", this.AfterSaveHandler, this);
        }
    }

    ChangeFieldNotify.prototype.SaveOriginalValues = function () {
        /// <summary>
        /// Метод сохраняет все начальные значения полей
        /// </summary>
        for (var i = 0; i < this._Settings.FieldNames.length; i++) {
            var saveFieldName = this._Settings.FieldNames[i];
            this._OriginalValues[saveFieldName] = this.GetFieldValue(saveFieldName);
        }
    }

    ChangeFieldNotify.prototype.GetFieldValue = function (field) {
        /// <signature>
        /// <summary>
        /// Метод получает значение поля по его имени
        /// </summary>
        /// <param name="field" type="String">Название поля</param>
        /// <returns type="FieldValue">Объект, содержащий поле и значение поля</returns>
        /// </signature>
        /// <signature>
        /// <summary>
        /// Метод получает значение поля
        /// </summary>
        /// <param name="field" type="Object">Объект поля</param>
        /// <returns type="FieldValue">Объект, содержащий поле и значение поля</returns>
        /// </signature>

        var prField;

        if (field && typeof (field) == "string") {
            prField = ListForm.GetField(field);
        }
        else if (field && typeof (field) == "object") {
            prField = field;
        }
        else {
            throw new Error("Такой тип параметра не поддерживается");
        }
        
        if (!prField) {
            throw new Error("Поле не найдено " + prField);
        }

        var retVal = null;
        var valueCaption = null;

        switch (prField.Type) {
            case 'DBFieldText':
            case 'DBFieldMultiLineText':
            case 'DBFieldChoice':
            case 'DBFieldDateTime':
                {
                    retVal = prField.GetValue();
                    retVal = retVal == null ? "" : retVal;
                    valueCaption = retVal;
                    break;
                }
            case 'DBFieldNumber':
            case 'DBFieldInteger':
                {
                    retVal = prField.GetValue();
                    retVal = retVal == null ? (prField.TypedField && prField.TypedField.MinValue && prField.TypedField.MinValue > 0 ? prField.TypedField.MinValue : 0) : retVal;
                    valueCaption = retVal.toString();
                    break;
                }
            case 'DBFieldBoolean':
                {
                    retVal = prField.GetValue();
                    retVal = retVal == null ? false : retVal;
                    valueCaption = retVal.toString();
                    break;
                }
            case 'DBFieldLookupSingle':
                {
                    var val = prField.GetValue();
                    retVal = val == null ? null : val.LookupID;
                    valueCaption = val == null ? "" : val.LookupText;
                    break;
                }
            case 'DBFieldLookupMulti':
                {
                    var val = prField.GetValue();
                    if (val != null) {
                        var retValArr = [];
                        for (var i = 0; i < val.length; i++) {
                            var lookupNode = val[i];
                            retValArr.push(lookupNode.LookupID);
                        }
                        retValArr = retValArr.sort(function (a, b) { return a - b; });
                        retVal = retValArr.join(",");
                    }
                    break;
                }
            case "DBFieldFiles":
                {
                    // Изменение файлов проверяется Ajax-сом на сервере
                    break;
                }
            default:
                {
                    throw new Error("Для поля типа " + prField.Type + " не определена процедура сохранения");
                }
        }

        var result = new FieldValue();
        result.Field = prField;
        result.Value = retVal;
        result.Caption = valueCaption;

        return result;
    }

    ChangeFieldNotify.prototype.BeforeSaveHandler = function () {
        /// <summary>
        /// Внутренний обработчик перед сохранением
        /// </summary>

        // Если контрол не активен, то ничего не делать
        if (!this._Settings.Active) {
            return;
        }
        this.NotificationNotSend = false;

        // Проверить, изменились поля или нет
        /// <var type="Array" elementType="ChangeFieldItem" />
        var changedValues = [];
        for (var fieldName in this._OriginalValues) {
            var oldVal = this._OriginalValues[fieldName];
            var newVal = this.GetFieldValue(oldVal.Field);

            // Если поле изменилось, то добавить его в список измененных полей, добавить Название, ЗначениеДо и ЗначениеПосле
            if (oldVal.Value != newVal.Value) {

                var changeFieldItem = new ChangeFieldItem();
                changeFieldItem.FieldName = fieldName;
                changeFieldItem.ValueBefore = oldVal.Caption;
                changeFieldItem.CurrentValue = newVal.Caption;

                changedValues.push(changeFieldItem);
            }
        }

        // Проверка изменения файлов
        var changedFilesFields = this.CheckFiles();
        for (var i = 0; i < changedFilesFields.length; i++) {
            changedValues.push(changedFilesFields[i]);
        }

        if (changedValues.length <= 0) {
            return;
        }

        // Если есть измененные поля, спрашиваем пользователя: надо разослать уведомления или нет
        var message = ChangeFieldNotify.CONST.CONFIRMMESSAGE.replace("[Название полей]",
            changedValues.map(function(x){ return x.FieldName; }).join(", "));

        var answer = confirm(message);
        if (!answer) {
            this.NotificationNotSend = true;
            return;
        }

        this.DataForMailSending = {
            ChangedFields: changedValues,
            ListID: ListForm.ListID,
            ItemID: ListForm.ItemID
        };
    }

    ChangeFieldNotify.prototype.OnSave = function (e) {
        if (this._Settings.Active && this._Settings.RejectSave && this.NotificationNotSend) {
            e.CanSave = false;
            window.close();
        }
    };

    ChangeFieldNotify.prototype.AfterSaveHandler = function () {
        if (!this._Settings.Active || this.NotificationNotSend || !this.DataForMailSending)
            return;

        // Отправляем запрос на создание уведомлений на сервер
        var url = "/_layouts/WSS/WSSC.V4.DMS.MMV/Controls/ChangeFieldNotify/ChangeFieldNotify.aspx/SendNotification";
        // Вызвать синхронно веб-сервис
        $.ajax({
            url: url,
            dataType: "json",
            data: JSON.stringify({ request: this.DataForMailSending }),
            method: 'POST',
            async: false,
            contentType: 'application/json; charset=utf-8',
            success: ajaxSuccess.bind(this)
        }).fail(function (xhr, textStatus) { throw new Error("Ошибка обработки на сервере. " + [xhr, textStatus]); });

        function ajaxSuccess(serverAnswer) {
            if (!serverAnswer || !serverAnswer.d) {
                throw new Error("Ошибка, неправильный ответ сервера");
            }
            var serverData = JSON.parse(serverAnswer.d);

            // На сервере произошла ошибка
            if (serverData.Exception) {
                throw new Error(serverData.Exception.DisplayText);
            }
        }

        this.DataForMailSending = null;
    };

    ChangeFieldNotify.prototype.CheckFiles = function () {
        /// <summary>
        /// Метод отправляет запрос на сервер и определяет, изменялись файлы или нет
        /// </summary>
        /// <returns type="Array" elementType="ChangeFieldItem">Массив измененных полей типа Файлы</returns>

        // Отправить названия полей обратно на сервер, чтобы получить текущие версии файлов
        var sendData = {
            FieldNames: this._Settings.FieldNames,
            ListID: ListForm.ListID,
            ItemID: ListForm.ItemID
        };

        /// <var type="Array" elementType="ChangeFieldItem" />
        var changedFieldsItems = [];
        var changedFieldsIDs = [];
        var serverData;
        var successfulRequest = false;
        var findNewValues = [];

        var url = "/_layouts/WSS/WSSC.V4.DMS.MMV/Controls/ChangeFieldNotify/ChangeFieldNotify.aspx/CheckCurrentVersionFiles";
        // Вызвать синхронно веб-сервис
        $.ajax({
            url: url,
            dataType: "json",
            data: JSON.stringify({ request: sendData }),
            method: 'POST',
            async: false,
            contentType: 'application/json; charset=utf-8',
            success: ajaxSuccess.bind(this)
        }).fail(function (xhr, textStatus) { throw new Error("Ошибка обработки на сервере. " + [xhr, textStatus]); });

        // Обработать ответ сервера
        function ajaxSuccess(serverAnswer) {

            if (!serverAnswer || !serverAnswer.d) {
                throw new Error("Ошибка, неправильный ответ сервера");
            }
            serverData = JSON.parse(serverAnswer.d);

            // На сервере произошла ошибка
            if (serverData.Exception) {
                throw new Error(serverData.Exception.DisplayText);
            }
            successfulRequest = true;
        }

        // Если запрос прошел успешно
        if (successfulRequest) {
            // Перебрать начальные значения файлов
            for (var i = 0; i < this._Settings.FilesOrigin.length; i++) {
                var originalFileDescription = this._Settings.FilesOrigin[i];
                var fileFound = false;

                // Если поле уже в списке измененных, то пропускаем файл
                if (changedFieldsIDs.indexOf(originalFileDescription.FieldID) >= 0) {
                    continue;
                }

                // Перебрать текущие версии файлов
                for (var j = 0; j < serverData.CurrentFiles.length; j++) {
                    var currentFileDescription = serverData.CurrentFiles[j];

                    // Если найдено соответствие между оригинальной версией и текущей, то
                    if (originalFileDescription.FieldID == currentFileDescription.FieldID &&
                        originalFileDescription.FileID == currentFileDescription.FileID) {

                        fileFound = true;
                        findNewValues.push(currentFileDescription);
                        // Проверить, что номера версий файлов совпадают
                        if (originalFileDescription.Version != currentFileDescription.Version) {

                            var field = ListForm.GetFieldByID(currentFileDescription.FieldID);
                            if (!field) {
                                throw new Error("Поле файлов с ID = " + currentFileDescription.FieldID + " не найдено");
                            }

                            // Если номера версий не совпадают, то название поля добавляется в список измененных полей файлов
                            var changeFieldItem = new ChangeFieldItem();
                            changeFieldItem.FieldName = field.DisplayName;

                            changedFieldsItems.push(changeFieldItem);
                            changedFieldsIDs.push(field.ID);
                        }
                        break;
                    }
                }

                // Если файл в текущей версии не найден, то добавляем поле в список измененных
                if (!fileFound) {
                    var field = ListForm.GetFieldByID(originalFileDescription.FieldID);

                    var changeFieldItem = new ChangeFieldItem();
                    changeFieldItem.FieldName = field.DisplayName;

                    changedFieldsItems.push(changeFieldItem);
                    changedFieldsIDs.push(field.ID);
                }
            }

            // Проверить, что обработаны все новые значения. Если нет, то добавить в список измененных полей
            for (var j = 0; j < serverData.CurrentFiles.length; j++) {
                var currentFileDescription = serverData.CurrentFiles[j];

                // Если такое поле уже есть в списке измененных - пропускаем
                if (changedFieldsIDs.indexOf(currentFileDescription.FieldID) >= 0) {
                    continue;
                }

                // Если этот файл обрабатывали уже - пропускаем
                if (findNewValues.indexOf(currentFileDescription) >= 0) {
                    continue;
                }

                // Этот файл новый, добавляем поле в список измененных полей
                var field = ListForm.GetFieldByID(currentFileDescription.FieldID);

                var changeFieldItem = new ChangeFieldItem();
                changeFieldItem.FieldName = field.DisplayName;

                changedFieldsItems.push(changeFieldItem);
                changedFieldsIDs.push(field.ID);
            }
        }

        return changedFieldsItems;
    }

    var InitConsts = (function () {
        function InitConsts() {
            /// <summary>
            /// Структура настроек, передаваемая с сервера
            /// </summary>
            /// <field name="FieldNames" type="Array" elementType="String">Названия полей</field>
            /// <field name="FilesOrigin" type="Array" elementType="FileDescription">Описание файлов на момент открытия карточки</field>
            /// <field name="Active" type="Boolean">Элемент управления работает или нет</field>
            /// <field name="RejectSave" type="Boolean">Отклонить сохранение, если пользователь отказывается от отправки оповещения</field>
        }

        return InitConsts;
    }());

    var FileDescription = (function () {
        function FileDescription() {
            /// <summary>
            /// Структура данных, описывающая сохраненный на сервере файл
            /// </summary>
            /// <field name="FieldID" type="Number" integer="true">Идентификатор поля, в котором хранится файл</field>
            /// <field name="FileID" type="Number" integer="true">Идентификатор файла</field>
            /// <field name="Version" type="Number" integer="true">Версия файла</field>
        }
        return FileDescription;
    }());

    var FieldValue = (function () {
        function FieldValue(){
            /// <summary>
            /// Сохраненное значение поля
            /// </summary>
            /// <field name="Field" type="Object">Поле, которому принадлежит значение</field>
            /// <field name="Value" type="Any">
            /// Значение поля. Для полей различного типа будут возвращаться различные значения:
            /// DBFieldText, DBFieldMultiLineText, DBFieldChoice, DBFieldNumber, DBFieldInteger, DBFieldDateTime, DBFieldBoolean - их значение;
            /// DBFieldLookupSingle - LookupID или null;
            /// DBFieldLookupMulti - строка с последовательностью LookupID через запятую;
            /// DBFieldFiles - null;
            /// Для остальных типов полей будет вызвана ошибка.
            /// </field>
            /// <field name="Caption" type="String">Текстовое представление значение. Для DBFieldLookupMulti и DBFieldFiles будет null</field>
        }
        return FieldValue;
    }());

    var ChangeFieldItem = (function () {
        function ChangeFieldItem() {
            /// <summary>
            /// Структура, описывающая изменение поля
            /// </summary>
            /// <field name="FieldName" type="String">Название поля.</field>
            /// <field name="ValueBefore" type="String">Текстовое представление значения до изменения. Если null, то не используется.</field>
            /// <field name="CurrentValue" type="String">Текстовое представление значения после изменения. Если null, то не используется.</field>
            this.ValueBefore = null;
            this.CurrentValue = null;
        }
        return ChangeFieldItem;
    }());

    ChangeFieldNotify.prototype.InitializePollyfilles = function () {
        /// <summary>
        /// Метод проверяет наличие необходимых стандартных методов и, в случае их отсутствия, определяет их
        /// </summary>

        // Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.14
        // Ссылка (en): http://es5.github.io/#x15.4.4.14
        // Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.14
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement, fromIndex) {
                var k;

                // 1. Положим O равным результату вызова ToObject с передачей ему
                //    значения this в качестве аргумента.
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var O = Object(this);

                // 2. Положим lenValue равным результату вызова внутреннего метода Get
                //    объекта O с аргументом "length".
                // 3. Положим len равным ToUint32(lenValue).
                var len = O.length >>> 0;

                // 4. Если len равен 0, вернём -1.
                if (len === 0) {
                    return -1;
                }

                // 5. Если был передан аргумент fromIndex, положим n равным
                //    ToInteger(fromIndex); иначе положим n равным 0.
                var n = +fromIndex || 0;

                if (Math.abs(n) === Infinity) {
                    n = 0;
                }

                // 6. Если n >= len, вернём -1.
                if (n >= len) {
                    return -1;
                }

                // 7. Если n >= 0, положим k равным n.
                // 8. Иначе, n<0, положим k равным len - abs(n).
                //    Если k меньше нуля 0, положим k равным 0.
                k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

                // 9. Пока k < len, будем повторять
                while (k < len) {
                    // a. Положим Pk равным ToString(k).
                    //   Это неявное преобразование для левостороннего операнда в операторе in
                    // b. Положим kPresent равным результату вызова внутреннего метода
                    //    HasProperty объекта O с аргументом Pk.
                    //   Этот шаг может быть объединён с шагом c
                    // c. Если kPresent равен true, выполним
                    //    i.  Положим elementK равным результату вызова внутреннего метода Get
                    //        объекта O с аргументом ToString(k).
                    //   ii.  Положим same равным результату применения
                    //        Алгоритма строгого сравнения на равенство между
                    //        searchElement и elementK.
                    //  iii.  Если same равен true, вернём k.
                    if (k in O && O[k] === searchElement) {
                        return k;
                    }
                    k++;
                }
                return -1;
            };
        }
        // Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.19
        // Ссылка (en): http://es5.github.com/#x15.4.4.19
        // Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.19
        if (!Array.prototype.map) {

            Array.prototype.map = function (callback, thisArg) {

                var T, A, k;

                if (this == null) {
                    throw new TypeError(' this is null or not defined');
                }

                // 1. Положим O равным результату вызова ToObject с передачей ему
                //    значения |this| в качестве аргумента.
                var O = Object(this);

                // 2. Положим lenValue равным результату вызова внутреннего метода Get
                //    объекта O с аргументом "length".
                // 3. Положим len равным ToUint32(lenValue).
                var len = O.length >>> 0;

                // 4. Если вызов IsCallable(callback) равен false, выкидываем исключение TypeError.
                // Смотрите (en): http://es5.github.com/#x9.11
                // Смотрите (ru): http://es5.javascript.ru/x9.html#x9.11
                if (typeof callback !== 'function') {
                    throw new TypeError(callback + ' is not a function');
                }

                // 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
                if (arguments.length > 1) {
                    T = thisArg;
                }

                // 6. Положим A равным новому масиву, как если бы он был создан выражением new Array(len),
                //    где Array является стандартным встроенным конструктором с этим именем,
                //    а len является значением len.
                A = new Array(len);

                // 7. Положим k равным 0
                k = 0;

                // 8. Пока k < len, будем повторять
                while (k < len) {

                    var kValue, mappedValue;

                    // a. Положим Pk равным ToString(k).
                    //   Это неявное преобразование для левостороннего операнда в операторе in
                    // b. Положим kPresent равным результату вызова внутреннего метода HasProperty
                    //    объекта O с аргументом Pk.
                    //   Этот шаг может быть объединён с шагом c
                    // c. Если kPresent равен true, то
                    if (k in O) {

                        // i. Положим kValue равным результату вызова внутреннего метода Get
                        //    объекта O с аргументом Pk.
                        kValue = O[k];

                        // ii. Положим mappedValue равным результату вызова внутреннего метода Call
                        //     функции callback со значением T в качестве значения this и списком
                        //     аргументов, содержащим kValue, k и O.
                        mappedValue = callback.call(T, kValue, k, O);

                        // iii. Вызовем внутренний метод DefineOwnProperty объекта A с аргументами
                        // Pk, Описатель Свойства
                        // { Value: mappedValue,
                        //   Writable: true,
                        //   Enumerable: true,
                        //   Configurable: true }
                        // и false.

                        // В браузерах, поддерживающих Object.defineProperty, используем следующий код:
                        // Object.defineProperty(A, k, {
                        //   value: mappedValue,
                        //   writable: true,
                        //   enumerable: true,
                        //   configurable: true
                        // });

                        // Для лучшей поддержки браузерами, используем следующий код:
                        A[k] = mappedValue;
                    }
                    // d. Увеличим k на 1.
                    k++;
                }

                // 9. Вернём A.
                return A;
            };
        }
    }

    return ChangeFieldNotify;
}());