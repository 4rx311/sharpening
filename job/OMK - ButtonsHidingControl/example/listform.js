function DBLF_CatchError(msg, url, line) {
    window.ListForm_HasPageError = true;
    if (window.ListForm_PageErrors == null)
        window.ListForm_PageErrors = [];
    window.ListForm_PageErrors.push({
        Message: msg,
        Url: url,
        Line: line
    });

    var infoMessage =
        '\n\r\n\r  Message: ' + msg
        + '\n\r  Url: ' + url
        + '\n\r  Line: ' + line;

    alert('Возникла неожиданная ошибка: ' + infoMessage);
}
//для safari такой обработки ошибок не существует
//safari генерирует в данном месте ошибку.
if (!SM.IsSafari)
    window.onerror = DBLF_CatchError;

//debugger
function DBListForm(listFormStateXml) {
    document.forms[0].setAttribute('autocomplete', 'off');
    var thisObj = this;
    window.ListForm = this;

    //debugger;
    this.GetAttribute = DBLF_GetAttribute;
    this.GetBooleanAttribute = DBLF_GetBooleanAttribute;
    this.GetIntegerAttribute = DBLF_GetIntegerAttribute;

    this.IsEditForm = this.ControlMode == 'Edit';

    //Methods
    this.OnInit = DBLF_OnInit;
    this.AddInitHandler = DBLF_AddInitHandler;
    this.InitFields = DBLF_InitFields;
    this.GetField = DBLF_GetField;
    this.GetFieldByID = DBLF_GetFieldByID;
    this.AddSaveHandler = DBLF_AddSaveHandler;
    this.AddPreSaveHandler = DBLF_AddPreSaveHandler;
    this.OnSave = DBLF_OnSave;
    this.ProcessSaveEventArgs = DBLF_ProcessSaveEventArgs;
    this.ShowInformer = DBLF_ShowInformer;
    this.SaveListFormState = DBLF_SaveListFormState;
    this.Update = DBLF_Update;
    this.IsChanged = DBLF_IsChanged;
    this.AddTypedField = DBLF_AddTypedField;
    this.SetUpdateButtonDisabled = DBLF_SetUpdateButtonDisabled;

    //Properties
    this.__init_Web = false;
    this._Web = null;
    this.Web = function () {
        if (!thisObj.__init_Web) {
            if (window.Context().Site() != null)
                thisObj._Web = window.Context().Site().GetWebByID(thisObj.WebID);
            thisObj.__init_Web = true;
        }
        return thisObj._Web;
    }

    this.__init_List = false;
    this._List = null;
    this.List = function () {
        if (!thisObj.__init_List) {
            if (thisObj.Web() != null)
                thisObj._List = thisObj.Web().GetListByID(thisObj.ListID);
            thisObj.__init_List = true;
        }
        return thisObj._List;
    }

    //Initialization
    this.InitHandlers = [];
    this.SaveHandlers = [];
    this.PreSaveHandlers = [];
    this.FieldsByName = [];
    this.FieldsByID = [];

    //словарь типизированных полей по имени.
    this.TypedFieldsByName = {};

    //инициализируем коллекции полей, для того чтобы метод AddTypedField был досупен еще на этапе создания типизированных экземпляров полей.
    DBLF_InitFieldCollections.call(this);

    //инициализация объекта формы идет самым первым скриптом на форме: new DBListForm();
    //инициализация общая+полей идет в конце после загрузки полей и их скриптов: window.ListForm.OnInit();
}

//Логика инициализации формы:
//Метод DBListForm.OnInit вызвается после серверной инициализации всех полей и вызов размещается в самом низу страницы
//Это сделано для того чтобы к моменту вызова метода все серверные поля зарегали свои клиентские контролы и создали клиентские объекты
//После этого в цикле создаем интерфейсные поля и каждое поле вызывает функцию ClientInitFieldFunction, получая типизированный объект поля.
//После получения типизированного объекта добавляем встроенный обработчик поля DBField.OnInit в коллекцию обработчиков DBListForm.InitHandlers
//Т.е., например, если текущее поле в инициализации должно будет выполнить действия с другими полями то в методе DBField.OnInit полю уже будут доступны другие поля
//После инициализации поля проходим в цикле по обработчикам DBListForm.InitHandlers и вызываем их.
function DBLF_OnInit() {
    DBLF_InitAccessMode.call(this);

    this.UpdateButton = window.document.getElementById(this.UpdateButtonID);
    this.UpdateButtonTop = document.getElementById('btnUpdateTop');
    this.CancelButton = window.document.getElementById(this.CancelButtonID);
    this.ListFormStateHidden = window.document.getElementById(this.ListFormStateHiddenID);

    this.InitFields();

    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        if (field != null) {
            try {
                field.OnInit();
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при обработке инициализации карточки полем ' + field.Name);
            }
        }
    }


    //выполняем инициализацию контролов.
    var j, jlen = this.WebControls.length;
    for (j = 0; j < jlen; j++) {
        var webControl = this.WebControls[j];

        //если для контрола не задано клиентское представление его экземпляра, создаем его пустым объетом.
        if (webControl.Instance == null)
            webControl.Instance = {};

        //устанавливаем ссылку на форму
        webControl.Instance.ListForm = this;

        //если у контрола задано уникальное имя, устанавливаем его в качестве свойства объекта window.
        if (!SM.IsNE(webControl.InstanceName))
            window[webControl.InstanceName] = webControl.Instance;

        //инициализируем коллекцию контролов-обработчиков полей для каждого поля
        if (webControl.FieldChangeHandlers != null && webControl.FieldChangeHandlers.length > 0) {
            var jj, jjLen = webControl.FieldChangeHandlers.length;
            for (jj = 0; jj < jjLen; jj++) {
                var fieldHandlerDefinition = webControl.FieldChangeHandlers[jj];
                var field = this.GetField(fieldHandlerDefinition.FieldName);
                if (field == null)
                    throw new Error('Не удалось получить поле "' + fieldHandlerDefinition.FieldName + '" на форме для прикрепления контрола-обработчика изменения типа ' + webControl.Type + '.');

                //еслли поле недоступно на клиенте, пропускаем его обработку.
                if (field.ReadOnly)
                    continue;

                //создаем коллекцию обработчиков для данного поля.
                if (field.WebControlHandlers == null)
                    field.WebControlHandlers = [];

                //добавляем в коллекцию обработчиков название функции и экземпляр обработчика, 
                //само получение функции будет производиться во время обработки изменения значения.
                field.WebControlHandlers.push({
                    WebControl: webControl,
                    FunctionName: fieldHandlerDefinition.FunctionName
                });
            }
        }

        //если задана функция инициализации формы, выполняем его обработку.
        if (!SM.IsNE(webControl.InitHandler)) {
            var initHandler = window[webControl.InitHandler];
            if (initHandler == null)
                throw new Error('Не удалось получить обработчик инициализации формы ' + webControl.InitHandler + ' для контрола типа ' + webControl.Type + '.');

            try {
                //вызываем обработчик относительно экземпляра контрола
                initHandler.call(webControl.Instance);
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при обработке инициализации формы контролом типа ' + webControl.Type);
            }
        }
    }


    len = this.InitHandlers.length;
    for (i = 0; i < len; i++) {
        var handler = this.InitHandlers[i];
        if (handler != null) {
            try {
                handler();
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при выполнении обработчика InitHandler.', handler.toString());
            }
        }
    }
    this.SaveListFormState();
    this.InitCompleted = true;

    $(document).ready(function () {
        dblf_resetformlayout_timeout_id = window.setTimeout(function () {
            DBLF_ClearResetFormTimeout();
            window.SM.ResetFormLayout();
            DBLF_InitPageSize.call(ListForm);
        }, 300);
    });
}

//инициализирует размер окна карточки после загрузки страницы.
function DBLF_InitPageSize() {
    //получаем параметры текущей страницы.
    var currentParams = SM.GetCurrentParamsBuilder();

    //определяем, требуется ли подгонять размер страницы под размер карточки.
    var ensureSize = currentParams.GetParam('ensureSize');
    ensureSize = !SM.IsNE(ensureSize) && ensureSize.toLowerCase() == 'true';

    //выходим, если не требуется корректировка размеров карточки.
    if (!ensureSize)
        return;

    //определяем размер границ карточки.
    //получаем таблицу с рамкой карточки.
    var formTable = document.querySelector('.dbf_tbForm');

    //если рамка отсутсвует, используем таблицу без рамки из старого дизайна.
    if (formTable == null)
        formTable = document.querySelector('.dbf_listform_root');

    //ругаемся, если рамка отсутсвует
    if (formTable == null)
        throw new Error('Не удалось получить Html-элемент, соответствующий границам карточки.');

    //определяем размер окна через свойство window.innerWidth/innerHeight для всех браузеров, кроме IE8.
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;

    //ругаемся, если не удалось определить внутренный размер окна.
    if (windowWidth == null || windowHeight == null)
        throw new Error('Не удалось определить внутренние размеры окна браузера.');

    var windowOuterWidth = window.outerWidth;
    var windowOuterHeight = window.outerHeight;

    //определяем разницу между рамкой и окном.
    var xDifference = (formTable.offsetWidth + 40) - windowWidth;
    var yDifference = (formTable.offsetHeight + 40) - windowHeight;

    //если рамка меньше открывшегося окна по какой либо из сторон, обнуляем отрицательную разницу.
    if (xDifference < 0)
        xDifference = 0;
    if (yDifference < 0)
        yDifference = 0;

    //обрабатываем наличие внешних размеров окна.
    if (windowOuterWidth > 0 && windowOuterHeight > 0) {
        //признак растягивания во весь экран по осям.
        var stretchX = false;
        var stretchY = false;

        //обрабатываем превышение размеров экрана, если задана настройка размеров только по одной оси.
        //то есть, если размер по оси больше чем размер экрана, растягиваем на весь экран по этой оси 
        //и далее для этой оси разницу между рамкой и окном не обрабатываем.
        if (windowOuterWidth >= screen.availWidth)
            stretchX = true;
        if (windowOuterHeight >= screen.availHeight)
            stretchY = true;

        //обрабатываем превышение рамкой границ окна по горизонтали.
        if (!stretchX && xDifference > 0 && windowOuterWidth + xDifference > screen.availWidth) {
            stretchX = true;
            stretchY = true;
        }

        //обрабатываем превышение рамкой границ окна по горизонтали.
        if (!stretchY && yDifference > 0 && windowOuterHeight + yDifference > screen.availHeight) {
            stretchX = true;
            stretchY = true;
        }

        try {
            //далее по коду - обработку текущих координат окна и перемещение не осуществляем, 
            //поскольку на момент выполнения метода значения screenX и screenY равны 0.
            //обрабатываем полноэкранный режим.
            if (stretchX && stretchY) {
                moveTo(0, 0);
                resizeTo(screen.availWidth, screen.availHeight);
            }
                //обрабатываем полноразмерное растягивание по оси X и возможное "дотягивание" по оси Y.
            else if (stretchX)
                resizeTo(screen.availWidth, windowOuterHeight + yDifference);
                //обрабатываем полноразмерное растягивание по оси Y и возможное "дотягивание" по оси X.
            else if (stretchY)
                resizeTo(windowOuterWidth + xDifference, screen.availHeight);
                //обрабатываем "дотягивание" по сторонам без полноразмерного растягивания.
            else if (xDifference > 0 || yDifference > 0)
                resizeTo(windowOuterWidth + xDifference, windowOuterHeight + yDifference);
        }
        catch (e) {
        }
    }
        //иначе, если отсутсвуют внешние границы окна и рамка превышает окно (например, в IE8), растягиваем во весь экран.
    else if (xDifference > 0 || yDifference > 0) {
        try {
            moveTo(0, 0);
            resizeTo(screen.availWidth, screen.availHeight);
        }
        catch (e) {
        }
    }
}

//устанавливает признак disabled для кнопок сохранения карточки.
function DBLF_SetUpdateButtonDisabled(disabled) {
    disabled = disabled == true;

    //дизэйблим/открываем основную кнопку.
    if (this.UpdateButton != null)
        this.UpdateButton.disabled = disabled;

    //дизэйблим/открываем дополнительную кнопку.
    if (this.UpdateButtonTop != null)
        this.UpdateButtonTop.disabled = disabled;
}

var dblf_resetformlayout_timeout_id = 0;
function DBLF_ClearResetFormTimeout() {
    window.clearTimeout(dblf_resetformlayout_timeout_id);
}

function DBLF_AddInitHandler(handler) {
    if (handler != null)
        this.InitHandlers.push(handler);
}


//инициализируем коллекции полей, для того, чтобы они были доступны еще на этапе создания полей.
function DBLF_InitFieldCollections() {
    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        //вызываем конструктор поля, чтобы при получении объекта поля, не могло появится необработанных ошибок, из-за отсутствия в них методов,
        //таких как GetValue, SetValue и т.п.
        DBField.call(field, this);
        this.FieldsByName[field.Name.toLowerCase()] = field;
        this.FieldsByID[field.ID] = field;
    }
}

function DBLF_InitFields() {
    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];

        //инициализируем поле.
        field.Init();
    }
}

//возвращает поле по названию, переданному в параметре fieldName
//при установленном значении true параметра throwNotFoundException, генерирует исключение если поле отсутствует на форме либо если поле скрыто на сервере.
function DBLF_GetField(fieldName, throwNotFoundException) {
    var field = null;

    //ругаемся, если не передали название поля.
    if (throwNotFoundException && SM.IsNE(fieldName))
        throw new Error('Не передан параметр fieldName.');
    if (!SM.IsNE(fieldName))
        field = this.FieldsByName[fieldName.toLowerCase()];

    //ругаемся если не удалось получить поле.
    if (throwNotFoundException) {
        if (field == null)
            throw new Error('Не удалось получить поле [' + fieldName + '] на форме элемента списка.');
        if (field.ReadOnly)
            throw new Error('Поле [' + fieldName + '] скрыто на сервере.');
    }

    return field;
}


function DBLF_GetFieldByID(fieldID) {
    var field = null;
    if (!window.SM.IsNullOrEmpty(fieldID) && fieldID != 0) {
        fieldID = parseInt(fieldID.toString())
        field = this.FieldsByID[fieldID];
    }
    return field;
}

function DBLF_AddSaveHandler(handler) {
    if (handler != null)
        this.SaveHandlers.push(handler);
}

function DBLF_AddPreSaveHandler(handler) {
    if (handler != null)
        this.PreSaveHandlers.push(handler);
}

function DBLF_OnUpdateTopClick() {
    if (this.UpdateButtonTop == null)
        throw new Error('Не передан параметр this.UpdateButtonTop.');
    //нажимаем на основную кнопку.
    if (this.UpdateButton != null)
        this.UpdateButton.click();
}

function DBLF_Update() {
    var result = this.OnSave();
    if (result) {
        //дизэйблим кнопки сохранения карточки.
        this.SetUpdateButtonDisabled(true);

        //логируем значения всех инпутов формы.
        var resultMessage = null;
        if (this.TracePostBackValues)
            resultMessage = DBLF_TraceInputValues.call(this);

        if (!this.TracePostBackValues || !SM.IsNE(resultMessage) && resultMessage.indexOf('success:') != -1)
            window.DBLF_UpdateListForm();
        else {
            var summaryMessage = 'Сохранение карточки невозможно из-за ошибок трассировки сохранения: ' + resultMessage;
            alert(summaryMessage);

            //сохраняем ошибку на сервер
            try {
                var url = '/_LAYOUTS/WSS/DBF/ListForm/PostBackTrace.ashx?rnd=' + Math.random();

                var ajax = window.SM.GetXmlRequest();
                ajax.open("POST", url, false);
                ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                var params = '';
                params += 'listID=' + this.ListID;
                params += '&itemID=' + this.ItemID;
                params += '&action=LogError';
                params += '&errorMessage=' + encodeURIComponent(summaryMessage);
                ajax.send(params);

                //отображаем неожиданную ошибку
                var responseText = ajax.responseText;
                if (!SM.IsNE(responseText) && responseText.indexOf('ResponseWriteError') != -1) {
                    var traceLogError = 'Возникла ошибка при сохранении ошибки: ' + responseText;
                    alert(traceLogError);
                }
            }
            catch (exx) {
                alert('Возникла ошибка при сохранении ошибки: ' + exx.message);
            }
        }
    }
    return result;
}

function DBLF_TraceInputValues() {
    var resultMessage = null;
    try {
        var currentForm = window.theForm;
        if (currentForm == null) {
            resultMessage = 'Не удалось получить отправляемую форму.';
            return resultMessage;
        }

        var transactionID = Math.random().toString().replace(',', '.');

        //добавляем transactionID к форме запросу, чтобы он был залогирован в случае ошибки.
        try {
            var thisForm = document.forms['form1'];
            if (!thisForm)
                thisForm = document.form1;

            //создаем два тестовых input-hidden для дублирования значения состояния формы.
            var hdnUpdateTransactionID = this.PostTraceIDHidden;
            if (hdnUpdateTransactionID == null) {
                var hdnUpdateTransactionID = document.createElement('input');
                hdnUpdateTransactionID.type = 'hidden';
                hdnUpdateTransactionID.name = 'hdnPostTraceID';
                hdnUpdateTransactionID.id = 'hdnPostTraceID';
                this.PostTraceIDHidden = hdnUpdateTransactionID;
                thisForm.appendChild(hdnUpdateTransactionID);
            }
        }
        catch (exx) {
        }

        if (this.PostTraceIDHidden == null)
            return;

        var url = '/_LAYOUTS/WSS/DBF/ListForm/PostBackTrace.ashx?rnd=' + Math.random();

        var ajax = window.SM.GetXmlRequest();
        ajax.open("POST", url, false);
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        var params = '';
        params += 'listID=' + this.ListID;
        params += '&itemID=' + this.ItemID;
        params += '&action=TraceParams';


        //собираем значения всех хидденов и текст-боксов.
        var inputValues = '';

        var formHiddens = $(currentForm).find('input[type="hidden"]');
        var i, len = formHiddens.length;
        for (i = 0; i < len; i++) {
            var formHidden = formHiddens[i];
            var inputName = formHidden.name;
            if (!SM.IsNE(inputName)) {
                var inputValue = formHidden.value;

                if (inputValues.length > 0)
                    inputValues = inputValues.concat('&');
                inputValues = inputValues.concat(encodeURIComponent(inputName) + '=' + encodeURIComponent(inputValue));
            }
        }

        var formTextboxes = $(currentForm).find('input[type="text"]');
        len = formTextboxes.length;
        for (i = 0; i < len; i++) {
            var formTextbox = formTextboxes[i];
            var inputName = formTextbox.name;
            if (!SM.IsNE(inputName)) {
                var inputValue = formTextbox.value;

                if (inputValues.length > 0)
                    inputValues = inputValues.concat('&');
                inputValues = inputValues.concat(encodeURIComponent(inputName) + '=' + encodeURIComponent(inputValue));
            }
        }

        //трассируем данные многострочного текста.
        var fromTextAreas = $(currentForm).find('textarea');
        len = fromTextAreas.length;
        for (i = 0; i < len; i++) {
            var formTextArea = fromTextAreas[i];
            var inputName = formTextArea.name;
            if (!SM.IsNE(inputName)) {
                var inputValue = formTextArea.value;

                if (inputValues.length > 0)
                    inputValues = inputValues.concat('&');
                inputValues = inputValues.concat(encodeURIComponent(inputName) + '=' + encodeURIComponent(inputValue));
            }
        }

        if (inputValues.length > 0)
            params += '&inputValues=' + encodeURIComponent(inputValues);
        else {
            resultMessage = 'Отсутствуют сохраняемые данные формы.';
            return resultMessage;
        }

        //посылаем запрос на сохренение трассировки
        ajax.send(params);

        //отображаем неожиданную ошибку
        var responseText = ajax.responseText;
        if (!SM.IsNE(responseText) && responseText.indexOf('ResponseWriteError') != -1) {
            resultMessage = 'Возникла ошибка при сохранении трассировки сохранения формы: ' + responseText;
            return resultMessage;
        }
        if (!SM.IsNE(responseText) && responseText.indexOf('success:' != -1))
            this.PostTraceIDHidden.value = responseText.substr(8);
        resultMessage = responseText;
    }
    catch (ex) {
        resultMessage = 'Возникла ошибка в трассировке значений формы: ' + ex.message;
        return resultMessage;
    }
    return resultMessage;
}

function DBLF_UpdateListForm() { __doPostBack(window.ListForm.UpdateButtonName, '') }

function DBLF_IsChanged() {
    var isChanged = false;
    if (this.IsEditForm) {
        var i, len = this.Fields.length;
        for (i = 0; i < len; i++) {
            var field = this.Fields[i];
            if (!isChanged)
                isChanged = field.IsChanged();
            if (isChanged)
                break;
        }
    }
    isChanged = isChanged == true;
    return isChanged;
}


function DBLF_ProccessError(ex, description, footer) {
    if (ex == null)
        throw new Error('Не передан параметр ex.');
    if (SM.IsNE(description))
        throw new Error('Не передан параметр description.');

    var userMessage = description + '\n message: ' + ex.message + '\n fileName: ' + ex.fileName + '\n lineNumber: ' + ex.lineNumber + '\n stack: ' + ex.stack;
    if (!SM.IsNE(footer))
        userMessage += '\n\n' + footer;

    alert(userMessage);
}

//debugger
function DBLF_OnSave() {
    var canSave = true;

    var commonEventArgs = new DBListFormSaveEventArgs();
    commonEventArgs.CommonInformer = new String();
    commonEventArgs.CommonAlert = new String();
    commonEventArgs.IncorrectFields = new String();
    commonEventArgs.EmptyFields = new String();

    //обрабатываем предсохранение контролами.
    var j, jlen = this.WebControls.length;
    for (j = 0; j < jlen; j++) {
        var webControl = this.WebControls[j];
        // TODO: CR: Владимир Мишанин: не инициализация, а предсохранение
        //если задана функция инициализации формы, выполняем его обработку.
        if (!SM.IsNE(webControl.PreSaveHandler)) {
            var preSaveHandler = window[webControl.PreSaveHandler];
            if (preSaveHandler == null)
                throw new Error('Не удалось получить обработчик предсохранения формы ' + webControl.PreSaveHandler + ' для контрола типа ' + webControl.Type + '.');

            try {
                //вызываем обработчик относительно экземпляра контрола
                preSaveHandler.call(webControl.Instance);
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при обработке предсохранения формы контролом типа ' + webControl.Type);
                return false;
            }
        }
    }

    //выполняем обработку которая может менять состояние полей (например простановка Required)
    var k, klen = this.PreSaveHandlers.length;
    for (k = 0; k < klen; k++) {
        var preSaveHandler = this.PreSaveHandlers[k];
        if (preSaveHandler != null) {
            try {
                preSaveHandler();
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при выполнении обработчика PreSaveHandler.', preSaveHandler.toString());
                return false;
            }
        }
    }

    //обрабатываем поля
    var itemUniqueCheck = false;
    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        if (field != null) {
            var saveEventArgs = new DBListFormSaveEventArgs(commonEventArgs);
            try {
                field.OnSave(saveEventArgs);
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при обработке сохранения карточки полем ' + field.Name);
                return false;
            }
            this.ProcessSaveEventArgs(saveEventArgs, commonEventArgs);

            if (field.IsIdentity)
                itemUniqueCheck = true;
        }
    }

    //выполняем проверку наличия функции __doPostBack на странице
    if (SM.IsDoPostBackDump) {
        var doPostBackDumpArgs = new DBListFormSaveEventArgs(commonEventArgs);
        doPostBackDumpArgs.CanSave = false;
        doPostBackDumpArgs.CommonAlertMessage = SM.DoPostBackDumpError;
        this.ProcessSaveEventArgs(doPostBackDumpArgs, commonEventArgs);
    }

    //получаем флаг возможности сохранения формы.
    canSave = commonEventArgs.CanSave;


    //обрабатываем сохранение контролами.
    if (canSave) {
        var j, jlen = this.WebControls.length;
        for (j = 0; j < jlen; j++) {
            var webControl = this.WebControls[j];
            // TODO: CR: Владимир Мишанин: сохранение формы, а не инициализация.
            //если задана функция инициализации формы, выполняем его обработку.
            if (!SM.IsNE(webControl.SaveHandler)) {
                var saveHandler = window[webControl.SaveHandler];
                if (saveHandler == null)
                    throw new Error('Не удалось получить обработчик сохранения формы ' + webControl.SaveHandler + ' для контрола типа ' + webControl.Type + '.');

                var saveEventArgs = new DBListFormSaveEventArgs(commonEventArgs);
                try {
                    //вызываем обработчик относительно экземпляра контрола
                    saveHandler.call(webControl.Instance, saveEventArgs);
                }
                catch (ex) {
                    DBLF_ProccessError(ex, 'Ошибка при обработке сохранения формы контролом типа ' + webControl.Type);
                    return false;
                }
                this.ProcessSaveEventArgs(saveEventArgs, commonEventArgs);
            }
        }
    }
    canSave = commonEventArgs.CanSave;

    //если поля корректны (или любые другие обработки корректны), выполняем остальные обработчики
    if (canSave) {
        len = this.SaveHandlers.length;
        for (i = 0; i < len; i++) {
            var handler = this.SaveHandlers[i];
            if (handler != null) {
                var saveEventArgs = new DBListFormSaveEventArgs(commonEventArgs);
                try {
                    handler(saveEventArgs);
                }
                catch (ex) {
                    DBLF_ProccessError(ex, 'Ошибка при выполнении обработчика SaveHandler.', handler.toString());
                    return false;
                }
                this.ProcessSaveEventArgs(saveEventArgs, commonEventArgs);
            }
        }
    }
    canSave = commonEventArgs.CanSave;

    var stCommonInformer = commonEventArgs.CommonInformer;
    var stCommonAlert = commonEventArgs.CommonAlert;
    var stIncorrectFields = commonEventArgs.IncorrectFields;
    var stEmptyFields = commonEventArgs.EmptyFields;

    //формируем тексты сообщений и алертов        
    if (stIncorrectFields.length > 0 || stEmptyFields.length > 0) {
        if (stEmptyFields.length > 0) {
            if (stCommonAlert.length > 0)
                stCommonAlert += '\n\r\n\r';

            stCommonAlert += window.TN.TranslateKey('ListForm.Alerts.RequiredFields') + '\n\r';
            stCommonAlert += stEmptyFields;
        }

        if (stIncorrectFields.length > 0) {
            if (stCommonAlert.length > 0)
                stCommonAlert += '\n\r\n\r';

            stCommonAlert += window.TN.TranslateKey('ListForm.Alerts.IncorrecFields') + '\n\r';
            stCommonAlert += stIncorrectFields;
        }
    }

    //отображаем сообщения и алерты
    if (stCommonInformer.length > 0)
        this.ShowInformer(stCommonInformer);

    if (stCommonAlert.length > 0)
        window.alert(stCommonAlert);

    if (commonEventArgs.SingleAlerts != null && commonEventArgs.SingleAlerts.length > 0) {
        var j, jlen = commonEventArgs.SingleAlerts.length;
        for (j = 0; j < jlen; j++) {
            var singleAlert = commonEventArgs.SingleAlerts[j];
            if (!SM.IsNE(singleAlert))
                alert(singleAlert);
        }
    }

    //восстанавливаем оригинальное состояние полей
    /*var j, jlen = this.Fields.length;
    for (j = 0; j < jlen; j++) {
        var field = this.Fields[j];
        field.SetOriginalRequired();
    }*/

    //проверка уникальности
    if (itemUniqueCheck) {
        //debugger;
        var params = new String();
        var url = '/_LAYOUTS/WSS/DBF/UI/IdentitySection/CheckUniqueItem.aspx';

        //var ajax = new ActiveXObject("Microsoft.XMLHTTP");
        var ajax = window.SM.GetXmlRequest();
        ajax.open("POST", url, false);
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

        var fvParam = '';
        var n, nlen = this.Fields.length;
        for (n = 0; n < nlen; n++) {
            var field = this.Fields[n];
            if (field != null) {
                if (!field.IsIdentity)
                    continue;

                if (!window.SM.IsNullOrEmpty(fvParam))
                    fvParam += '_fs_';

                var valueKey = null;
                if (field.ReadOnly)
                    valueKey = '[RO]';
                else
                    valueKey = field.GetValueKey();
                if (valueKey == null)
                    valueKey = '';

                if (valueKey.toString().toLowerCase() == 'null')
                    valueKey = '';

                fvParam += field.ID + '_fv_' + valueKey;
            }
        }
        fvParam = window.EncodeUrlParameter(fvParam);

        params = params.concat('&listID=', this.ListID);
        params = params.concat('&itemID=', this.ItemID);
        params = params.concat('&fvParam=', fvParam);
        params = encodeURI(params);

        ajax.send(params);
        var response = ajax.responseText;
        if (!SM.IsNullOrEmpty(response)) {
            if (response.length > 8 && response.substr(0, 8) == 'confirm:') {
                var jsonResponse = response.substr(9);
                var confirmMessages = JSON.parse(jsonResponse);
                if (confirmMessages != null && confirmMessages.length > 0) {
                    var c, clen = confirmMessages.length;
                    for (c = 0; c < clen; c++) {
                        var confirmMessage = confirmMessages[c];
                        if (SM.IsNE(confirmMessage))
                            continue;

                        if (!confirm(confirmMessage)) {
                            canSave = false;
                            break;
                        }
                    }
                }
            }
            else {
                canSave = false;
                alert(response);
            }
        }
    }
    if (canSave)
        this.SaveListFormState(commonEventArgs);

    if (window.ListForm_HasPageError) {
        canSave = false;
        var i, len = window.ListForm_PageErrors.length;
        var errorsSummary = 'Сохранение карточки невозможно из-за наличия ошибок на странице:';
        for (i = 0; i < len; i++) {
            var pageError = window.ListForm_PageErrors[i];
            errorsSummary += '\n\r\n\r  Message: ' + pageError.Message
                + '\n\r  Url: ' + pageError.Url
                + '\n\r  Line: ' + pageError.Line;
        }
        alert(errorsSummary);
    }

    if (canSave) {
        //диагностика заполнения обязательных хидденов.
        try {
            var hiddenIdentities = '';
            if (DBLF_IsEmptyHidden(this.ListFormStateHidden)) {
                canSave = false;
                hiddenIdentities += 'ListFormStateHidden';
            }
            var requiredHiddens = ListForm_RequiredHiddens;//$("input[IsLookupValueHidden='true']");
            var h, hlen = requiredHiddens.length;
            for (h = 0; h < hlen; h++) {
                var requiredHidden = requiredHiddens[h];

                if (DBLF_IsEmptyHidden(requiredHidden)) {
                    var controlName = requiredHidden.getAttribute('ControlName');
                    if (SM.IsNE(controlName))
                        controlName = 'No ControlName';

                    if (hiddenIdentities.length > 0)
                        hiddenIdentities += '; ';
                    hiddenIdentities += controlName;

                    canSave = false;
                }
            }
            if (!canSave) {
                var errorHiddenMessage = 'Возникла неожиданная ошибка (код: 810). Обратитесь к разработчику.\nДля продолжения работы нажмите Enter в адресной строке браузера и повторите операцию.';
                if (!SM.IsNE(hiddenIdentities))
                    errorHiddenMessage += '\nДополнительные сведения: ' + hiddenIdentities;
                alert(errorHiddenMessage);
            }
        }
        catch (e) {
            canSave = false;
            alert('Ошибка проверки заполненности ListForm_RequiredHiddens: \n\r' + e.message);
        }
    }

    //вызываем событие окончания обработки
    var onSaveCompletedArgs = { CanSave: canSave };

    //обрабатываем окончание сохранения контролами.
    var j, jlen = this.WebControls.length;
    for (j = 0; j < jlen; j++) {
        var webControl = this.WebControls[j];

        //если задана функция инициализации формы, выполняем его обработку.
        if (!SM.IsNE(webControl.SaveCompletedHandler)) {
            var saveCompletedHandler = window[webControl.SaveCompletedHandler];
            if (saveCompletedHandler == null)
                throw new Error('Не удалось получить обработчик окончания сохранения формы ' + webControl.SaveCompletedHandler + ' для контрола типа ' + webControl.Type + '.');

            try {
                //вызываем обработчик относительно экземпляра контрола
                saveCompletedHandler.call(webControl.Instance, onSaveCompletedArgs);
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при обработке окончания сохранения формы контролом типа ' + webControl.Type);
            }
        }
    }

    SM.FireEvent(this, 'OnSaveCompleted', onSaveCompletedArgs);

    return canSave;
}
window.ListForm_RequiredHiddens = [];

function DBLF_IsEmptyHidden(hidden) {
    if (hidden == null)
        throw new Error('Не передан параметр hidden.');

    var isEmpty = SM.IsNE(hidden.value);
    if (!isEmpty)
        isEmpty = DBLF_IsDisalbled(hidden);

    if (!isEmpty) {
        var parentHiddenNode = hidden.parentNode;
        while (parentHiddenNode != null) {
            if (parentHiddenNode.nodeType != 1)
                break;

            var isParentDisabled = DBLF_IsDisalbled(parentHiddenNode);
            if (isParentDisabled) {
                isEmpty = true;
                break;
            }
            else
                parentHiddenNode = parentHiddenNode.parentNode;
        }
    }

    return isEmpty;
}

//проверяет, задизэйблен ли html-элемент.
function DBLF_IsDisalbled(element) {
    if (element == null)
        throw new Error('Не передан параметр element');

    var disabledElement = element.disabled === true;
    if (!disabledElement) {
        //получаем значение атрибута disabled.
        var disabledAttr = element.getAttribute('disabled');

        //проверяем, что значение атрибута имеет булевский тип
        //для режима браузера IE7 и ниже, значение атрибута возвращается именно в виде булевского типа

        //в IE7 после операции document.body.setAttribute('disabled', 'asdf') 
        //выражение document.body.getAttribute('disabled') вернет true и страница БУДЕТ задизэйбленной.
        //в IE7 после операции document.body.setAttribute('disabled', false) 
        //выражение document.body.getAttribute('disabled') вернет false и страница НЕ БУДЕТ задизэйбленной.

        //в IE10 после операции document.body.setAttribute('disabled', 'asdf') 
        //выражение document.body.getAttribute('disabled') вернет 'asdf' и страница БУДЕТ задизэйбленной.
        //в IE10 после операции document.body.setAttribute('disabled', false) 
        //выражение document.body.getAttribute('disabled') вернет 'false' и страница БУДЕТ задизэйбленной.

        //в свою очередь свойство document.body.disabled для всех вариантов IE, вернет реальное состояние дизэйбла.

        var isDisabledAttr = disabledAttr === true;
        var isNotDisabledAttr = disabledAttr === false;

        if (isDisabledAttr || isNotDisabledAttr) {
            //если значение атрибута - булевский тип, то проверяем именно по нему.
            disabledElement = isDisabledAttr;
        }
        else {
            //иначе задизэйбленность определяем просто по наличию любого значение в атрибуте disabled.
            disabledElement = !SM.IsNE(disabledAttr);
        }

        if (!disabledElement)
            disabledElement
    }

    return disabledElement;
}

function DBLF_ProcessSaveEventArgs(saveEventArgs, commonEventArgs) {
    var stCommonInformer = commonEventArgs.CommonInformer;
    var stCommonAlert = commonEventArgs.CommonAlert;
    var stIncorrectFields = commonEventArgs.IncorrectFields;
    var stEmptyFields = commonEventArgs.EmptyFields;

    //задаем коллекцию одиночный алертов, которые будут отображены после общих алертов.
    if (commonEventArgs.SingleAlerts == null)
        commonEventArgs.SingleAlerts = [];

    if (!saveEventArgs.CanSave)
        commonEventArgs.CanSave = false;

    //alerts
    if (!window.SM.IsNullOrEmpty(saveEventArgs.CommonAlertMessage)) {
        if (stCommonAlert.length > 0)
            stCommonAlert += '\n\r';
        stCommonAlert += saveEventArgs.CommonAlertMessage;
    }
    if (!window.SM.IsNullOrEmpty(saveEventArgs.SingleAlertMessage))
        commonEventArgs.SingleAlerts.push(saveEventArgs.SingleAlertMessage);

    //informers
    if (!window.SM.IsNullOrEmpty(saveEventArgs.CommonInformerMessage)) {
        if (stCommonInformer.length > 0)
            stCommonInformer += '<br/>';
        stCommonInformer += saveEventArgs.CommonInformerMessage;
    }
    if (!window.SM.IsNullOrEmpty(saveEventArgs.SingleInformerMessage) && saveEventArgs.ShowSingleInformer != null)
        saveEventArgs.ShowSingleInformer(saveEventArgs.SingleInformerMessage);

    //confirm
    if (!window.SM.IsNullOrEmpty(saveEventArgs.ConfirmMessage)) {
        if (!window.confirm(saveEventArgs.ConfirmMessage))
            commonEventArgs.CanSave = false;
    }

    //empty Required fields/Incorrect values
    if (saveEventArgs.Field != null) {
        var field = saveEventArgs.Field;
        var tabChar = '                ';
        if (saveEventArgs.IsIncorrectValue) {
            if (stIncorrectFields.length > 0)
                stIncorrectFields += '\n\r';
            stIncorrectFields += tabChar + ' - ' + field.DisplayName;
        }
        if (saveEventArgs.IsEmptyValue && field.Required) {
            if (SM.IsNE(field.CustomRequiredAlert)) {
                if (stEmptyFields.length > 0)
                    stEmptyFields += '\n\r';
                stEmptyFields += tabChar + ' - ' + field.DisplayName;
            }
            else
                commonEventArgs.SingleAlerts.push(field.CustomRequiredAlert);
            DBField_ShowRequired.call(field);
        }
        else {
            DBField_HideRequired.call(field);
        }
    }
    if (saveEventArgs.UnsafeUpdate)
        commonEventArgs.UnsafeUpdate = true;
    if (saveEventArgs.CloseOnUpdate)
        commonEventArgs.CloseOnUpdate = true;
    if (!window.SM.IsNullOrEmpty(saveEventArgs.RedirectOnFailedUrl))
        commonEventArgs.RedirectOnFailedUrl = saveEventArgs.RedirectOnFailedUrl;
    if (!window.SM.IsNullOrEmpty(saveEventArgs.RedirectOnSuccessUrl))
        commonEventArgs.RedirectOnSuccessUrl = saveEventArgs.RedirectOnSuccessUrl;
    if (saveEventArgs.StayOnForm)
        commonEventArgs.StayOnForm = true;

    commonEventArgs.CommonInformer = stCommonInformer;
    commonEventArgs.CommonAlert = stCommonAlert;
    commonEventArgs.IncorrectFields = stIncorrectFields;
    commonEventArgs.EmptyFields = stEmptyFields;
}

function DBLF_ShowInformer(message) {
}

function DBLF_SaveListFormState(saveEventArgs) {
    //debugger;
    if (this.ListFormStateHidden != null) {

        if (this.ListFormState == null)
            throw new Error('Отсутствует объект состояния формы элемента списка.');

        if (saveEventArgs != null) {

            if (!SM.IsNE(saveEventArgs.RedirectOnSuccessUrl))
                this.ListFormState.RedirectOnSuccessUrl = saveEventArgs.RedirectOnSuccessUrl.toString();

            if (!SM.IsNE(saveEventArgs.RedirectOnFailedUrl))
                this.ListFormState.RedirectOnFailedUrl = saveEventArgs.RedirectOnFailedUrl.toString();

            if (saveEventArgs.StayOnForm)
                this.ListFormState.StayOnForm = saveEventArgs.StayOnForm.toString().toLowerCase() === 'true';

            if (saveEventArgs.CloseOnUpdate)
                this.ListFormState.CloseOnUpdate = saveEventArgs.CloseOnUpdate.toString().toLowerCase() === 'true';

            if (saveEventArgs.UnsafeUpdate)
                this.ListFormState.UnsafeUpdate = saveEventArgs.UnsafeUpdate.toString().toLowerCase() === 'true';
        }

        //инициализируем коллекцию сериализуемых свойств формы.
        var dataMembers = [
            'OptimisticLockID',
            'StayOnForm',
            'RedirectOnSuccessUrl',
            'RedirectOnFailedUrl',
            'CloseOnUpdate',
            'UnsafeUpdate',
            'CurrentUserID',
            'InitialFields'
        ];

        //сериализуем состояние формы.
        this.ListFormStateHidden.value = SM.SerializeJson(this.ListFormState, dataMembers);
    }
}


function DBLF_ShowFieldTooltip(fieldID) {
    var field = window.ListForm.GetFieldByID(fieldID);
    if (field == null)
        throw new Error('Не удалось получить поле по ID=' + fieldID);
    DBField_ShowTooltip.call(field);
}

function DBLF_InitAccessMode() {
    //инициализация режима доступа к форме
    this.AccessModeEnum = {
        Regular: { Code: 0, Title: 'Режим сотрудника' },
        Administrator: { Code: 1, Title: 'Режим администратора' },
        SystemAccount: { Code: 2, Title: 'Системная учетная запись' }
    }

    switch (this.AccessMode) {
        case 1:
            this.AccessMode = this.AccessModeEnum.Administrator;
            break;
        case 2:
            this.AccessMode = this.AccessModeEnum.SystemAccount;
            break;
        case 0:
        default:
            this.AccessMode = this.AccessModeEnum.Regular;
            break;
    }
}

function DBLF_UpdateAdminModeAllowed(field) {
    if (field == null || SM.IsNE(field.ID) || field.ID < 1 || window.ListForm == null)
        return;

    //если ссылка вообще не разрешена на сервере, то на клиенте запрещаем обновление ссылки.
    if (!ListForm.AccessModeLinkAllowed)
        return;

    //если сервер уже разрешил режим администратора, то на клиенте его не повторяем
    if (ListForm.AccessModeLinkVisible || window.DBToolbar == null)
        return;

    //словарь полей с ограниченным доступом
    //учитывает только поля ограниченные на клиенте.
    if (ListForm.AccessibilityLimitedFields == null)
        ListForm.AccessibilityLimitedFields = [];

    var accessLimited = field.Hidden || field.Disabled;
    ListForm.AccessibilityLimitedFields[field.ID] = accessLimited;

    //состояние общей доступности всех полей изменилось
    var accessibilityLimitedFieldsExistsChanged = false;
    if (ListForm.PreviousStateOfAccessibilityLimitedFieldsExists == null)
        ListForm.PreviousStateOfAccessibilityLimitedFieldsExists = false;

    //до вычисления признаков доступности, приравниваем флаги наличия таких полей 
    //(флаги которые отображают доступность до и после проверки)
    ListForm.AccessibilityLimitedFieldsExists = ListForm.PreviousStateOfAccessibilityLimitedFieldsExists;

    var listFormContainsAccessibilityLimitedFields = false;
    for (var fieldID in ListForm.AccessibilityLimitedFields) {
        //игнорируем прототипные свойства
        if (!ListForm.AccessibilityLimitedFields.hasOwnProperty(fieldID))
            continue;

        var fieldAccessLimited = ListForm.AccessibilityLimitedFields[fieldID];
        if (fieldAccessLimited) {
            listFormContainsAccessibilityLimitedFields = true;
            break;
        }
    }

    accessibilityLimitedFieldsExistsChanged = listFormContainsAccessibilityLimitedFields != ListForm.AccessibilityLimitedFieldsExists;
    ListForm.PreviousStateOfAccessibilityLimitedFieldsExists = listFormContainsAccessibilityLimitedFields;

    //если состояние поменялось, то удаляем/добавляем ссылку в тулбаре на режим администратора/сотрудника.
    if (accessibilityLimitedFieldsExistsChanged) {
        var goToAdminModeLinkID = 'dbf.listform.adminmodelink';
        if (listFormContainsAccessibilityLimitedFields) {
            //текущее состояник: форма содержит поля, ограниченные в доступности
            //добавляем ссылку в тулбар
            var originalUrl = location.href;
            var targetUrl = '';
            var url = originalUrl.toLowerCase();
            var urlWithQuestion = url.indexOf('?') != -1;
            if (!SM.IsNE(url) && urlWithQuestion) {
                var falseParamValue = 'isadminmode=false';
                var trueParam = 'isadminmode=true';

                var paramIndex = url.indexOf(falseParamValue);
                if (paramIndex != -1) {
                    var parts = url.split(falseParamValue);
                    var urlBeforeParam = '';
                    var urlAfterParam = '';

                    if (parts != null && parts.length > 0) {
                        urlBeforeParam = parts[0];
                        if (parts.length > 1)
                            urlAfterParam = parts[1];
                    }

                    var beforeParamStringLength = urlBeforeParam.length;
                    var afterParamStartIndex = beforeParamStringLength + falseParamValue.length;

                    var originalUrlBefore = originalUrl.substr(0, beforeParamStringLength)
                    var originalUrlAfter = '';
                    if (!SM.IsNE(urlAfterParam) && originalUrl.length > afterParamStartIndex)
                        originalUrlAfter = originalUrl.substr(afterParamStartIndex)

                    targetUrl = originalUrlBefore + trueParam + originalUrlAfter;
                }
                else
                    targetUrl += originalUrl + '&' + trueParam;
            }
            else
                targetUrl += originalUrl + '?' + trueParam;

            DBToolbar.AddItem({
                Title: TN.TranslateKey('db.toolbar.adminmodelinktext'),
                Href: targetUrl
            }, goToAdminModeLinkID);
        }
        else {
            //текущее состояник: форма НЕ содержит поля, ограниченные в доступности
            //убираем ссылку из тулбара
            DBToolbar.RemoveItem(goToAdminModeLinkID);
        }

        DBToolbar.Update();
    }
}

/////////////////////////////DBField////////////////////////////////////////
function DBField(listForm) {
    this.ListForm = listForm;

    this.OriginalRequired = this.Required;
    var thisObj = this;

    //Properties
    this.__init_Field = false;
    this._Field = null;
    this.Field = DBField_Field;

    //abstract interface
    this.OnInit = DBField_OnInit;
    this.Disable = DBField_Disable;
    this.Enable = DBField_Enable;
    this.GetValue = DBField_GetValue;
    this.GetValueKey = DBField_GetValueKey;
    this.SetValue = DBField_SetValue;
    this.OnSave = DBField_OnSave;
    this.ShowInformer = DBField_ShowInformer;
    this.IsChanged = DBField_IsChanged;
    this.IsEmptyValue = DBField_IsEmptyValue;

    //implemented interface
    this.CheckRequired = DBField_CheckRequired;
    this.SetRequired = DBField_SetRequired;
    this.SetOriginalRequired = DBField_SetOriginalRequired;
    this.ShowRequired = DBField_ShowRequired;
    this.HideRequired = DBField_HideRequired;

    //Methods
    this.Init = DBField_Init;
    this.Hide = DBField_Hide;
    this.Display = DBField_Display;
    this.AddChangeHandler = DBField_AddChangeHandler;
    this.OnChange = DBField_OnChange;
    this.ResetServerValue = DBField_ResetServerValue;

}

//представляет свойство Field(), возвращающее поле клиентской модели DBFramework.js.
function DBField_Field() {
    if (!this.__init_Field) {
        if (this.ListForm.List() != null)
            this._Field = this.ListForm.List().GetFieldByID(this.ID);
        this.__init_Field = true;
    }
    return this._Field;
}


//добавляет типизированное поле в коллкцию типизированных полей формы.
function DBLF_AddTypedField(fieldName, typedField) {
    if (SM.IsNE(fieldName))
        throw new Error('Не передан параметр fieldName.');
    if (typedField == null)
        throw new Error('Не передан параметр typedField.');

    //получаем экземпляр поля.
    var field = this.GetField(fieldName);
    //если поле отсутствует на форме, ругаемся.
    if (field == null)
        throw new Error('Отсутсвтует поле [' + fieldName + '] на форме элемента списка.');
    if (field.ReadOnly)
        throw new Error('Операция недопустима для поля [' + fieldName + '], скрытого на сервере.');

    //получаем название поля в нижнем регистре.
    var fieldNameLow = fieldName.toLowerCase();

    //проверяем отсутствие типизированного поля, уже добавленного в коллекцию.
    var existingTypedField = this.TypedFieldsByName[fieldNameLow];
    if (existingTypedField != null)
        throw new Error('Типизированное поле [' + fieldName + '] уже добавлено в коллекцию типизированных полей формы.');

    //добавляем поле в коллекцию типизированных полей.
    this.TypedFieldsByName[fieldNameLow] = typedField;

    //устанавливаем ссылки на типизированное поле и на поле формы.
    field.TypedField = typedField;
    typedField.ListFormField = field;
}

function DBField_Init() {
    if (this.ListForm.IsEditForm && this.IsEditMode && !window.SM.IsNullOrEmpty(this.ClientInitFieldFunction) && !this.ReadOnly) {
        var initFunction = window[this.ClientInitFieldFunction];
        if (initFunction == null)
            throw new Error('Не удалось получить функцию инициализации поля "' + this.ClientInitFieldFunction + '".');
        var typedField = initFunction(this.Name);
        if (typedField != null)
            this.ListForm.AddTypedField(this.Name, typedField);
    }
    //присваиваем значение null свойству TypedField, если оно не инициализировано.
    if (this.TypedField == null)
        this.TypedField = null;

    //Создаем коллекцию обработчиков на изменени
    this.ChangeHandlers = new Array();

    this.Container = window.document.getElementById(this.ContainerID);

    //устанавливаем флаг инициализации поля (перед дизэйблом, т.к. в нём уже осуществлятся проверка обязательности).
    this.Inited = true;

    //Дизэйблим поле с сервера
    if (this.Disabled)
        this.Disable();
}

function DBField_Hide() {
    //скрываем поле если:
    //форма в режиме доступа сотрудника
    if (this.ListForm.AccessMode == this.ListForm.AccessModeEnum.Regular) {
        if (this.Container != null) {
            this.Container.style.display = 'none';
            this.Hidden = true;

            DBLF_UpdateAdminModeAllowed(this);
        }
    }
}

function DBField_Display() {
    if (this.ListForm.AccessMode == this.ListForm.AccessModeEnum.Regular) {
        if (this.Container != null) {
            this.Container.style.display = '';
            this.Hidden = false;

            DBLF_UpdateAdminModeAllowed(this);
        }
    }
}

function DBField_OnInit() {
    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.OnInit != null)
                this.TypedField.OnInit();
        }
    }
}

//проверяет факт инициализации поля.
function DBField_CheckInited() {
    if (!this.Inited)
        throw new Error('Операция недоступна, поскольку поле [' + this.Name + '] еще не инициализировано.');
}

function DBField_Disable() {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    //дизейблим поле если:
    //1 - форма редактирования
    //2 - форма в режиме доступа сотрудника
    if (this.ListForm.IsEditForm && this.ListForm.AccessMode == this.ListForm.AccessModeEnum.Regular) {
        if (this.TypedField != null) {
            if (this.TypedField.Disable != null) {
                this.TypedField.Disable();
                this.Disabled = true;

                DBLF_UpdateAdminModeAllowed(this);
            }
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода Disable.');
        }
        //else
        //alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
}

function DBField_IsChanged() {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.IsChanged != null)
                return this.TypedField.IsChanged();
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода IsChanged.');
        }
    }
    return false;
}

function DBField_Enable() {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    if (this.ListForm.IsEditForm && this.ListForm.AccessMode == this.ListForm.AccessModeEnum.Regular) {
        if (this.TypedField != null) {
            if (this.TypedField.Enable != null) {
                this.TypedField.Enable();
                this.Disabled = false;

                DBLF_UpdateAdminModeAllowed(this);
            }
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода Enable.');
        }
        else
            alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
}

function DBField_IsEmptyValue() {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.IsEmptyValue != null)
                return this.TypedField.IsEmptyValue();
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода IsEmptyValue.');
        }
        else
            alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
}

function DBField_GetValue() {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    var value = null;
    if (this.ListForm.IsEditForm && !this.ReadOnly) {
        if (this.TypedField != null) {
            if (this.TypedField.GetValue != null)
                value = this.TypedField.GetValue();
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода GetValue.');
        }
        else
            alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
    else {
        if (!this.__init_ServerValue) {
            this._ServerValue = null;
            if (this.ListForm.List() != null) {
                var loadedFields = new Array();
                loadedFields.push(this.Name);
                var item = this.ListForm.List().GetItemByID(this.ListForm.ItemID, loadedFields);
                if (item != null)
                    this._ServerValue = item.GetValue(this.Name);
            }
            this.__init_ServerValue = true;
        }
        value = this._ServerValue;
    }
    return value;
}

function DBField_ResetServerValue() {
    this.__init_ServerValue = false;
}

function DBField_GetValueKey() {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    var value = null;
    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.GetValueKey != null)
                value = this.TypedField.GetValueKey();
            else {
                if (this.TypedField.GetValue != null)
                    value = this.TypedField.GetValue();
                else
                    alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода GetValue.');
            }
        }
        else
            alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
    return value;
}

function DBField_SetValue(value) {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.SetValue != null)
                this.TypedField.SetValue(value);
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода SetValue.');
        }
        else
            alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
}

function DBField_ShowInformer(message) {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.ShowInformer != null)
                this.TypedField.ShowInformer(message);
            else
                alert('Поле "' + this.Name + '" типа "' + this.Type + '" не содержит определение метода ShowInformer.');
        }
        else
            alert('Поле "' + this.Name + '" типа "' + this.Type + '" не поддерживает клиентскую модель.');
    }
}

function DBField_OnSave(saveEventArgs) {
    //проверяем факт инициализации поля.
    DBField_CheckInited.call(this);

    if (this.ListForm.IsEditForm) {
        if (this.TypedField != null) {
            if (this.TypedField.OnSave != null) {
                saveEventArgs.Field = this;
                //устанавливаем стандартную функцию отрисовки идивидуального информера
                saveEventArgs.ShowSingleInformer = this.ShowInformer;
                //вызваем типизированный обработчик
                this.TypedField.OnSave(saveEventArgs);
            }
        }
    }
}

function DBField_AddChangeHandler(handler) {
    if (handler != null)
        this.ChangeHandlers.push(handler);
}

function DBField_OnChange(args) {

    //выполяем обработку изменения контролами.
    if (this.WebControlHandlers != null) {
        var j, jlen = this.WebControlHandlers.length;
        for (j = 0; j < jlen; j++) {
            var changeHandlerDefinition = this.WebControlHandlers[j];
            if (changeHandlerDefinition == null)
                continue;

            //получаем контрол
            var webControl = changeHandlerDefinition.WebControl;

            //получаем функцию-обработчик изменения поля.
            var changeHandler = window[changeHandlerDefinition.FunctionName];
            if (changeHandler == null)
                throw new Error('Не удалось получить обработчик изменения поля "' + this.Name + '" с названием ' + changeHandlerDefinition.FunctionName + ' для контрола типа ' + webControl.Type + '.');

            //вызываем обработчик изменения
            try {
                changeHandler.call(webControl.Instance, this, args);
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при обработке изменения поля "' + this.Name + '" контролом типа ' + webControl.Type + '.');
            }
        }
    }

    var i, len = this.ChangeHandlers.length;
    for (i = 0; i < len; i++) {
        var handler = this.ChangeHandlers[i];
        if (handler != null) {
            try {
                handler(this, args);
            }
            catch (ex) {
                DBLF_ProccessError(ex, 'Ошибка при выполнении обработчика изменения поля "' + this.Name + '".', handler.toString());
            }
        }
    }
}

function DBField_InitTitleControl() {
    if (!this.__init_TitleControl) {
        this.TitleControl = null;
        if (this.Container != null) {
            var titleContainer = this.Container.children[0];
            if (titleContainer != null) {
                var titleControl = titleContainer.children[0];
                if (titleControl != null) {
                    if (titleControl.className.toLowerCase().indexOf('dbf_listform_fieldTitleControl'.toLowerCase()) != -1)
                        this.TitleControl = titleControl;
                }
            }
        }
        this.__init_TitleControl = true;
    }
}

//#region CheckRequired

function DBField_CheckRequired(hideOnly) {
    /// <summary>Проверяет обязательность заполнения поля. 
    /// В случае, если обязательное поле незаполнено - отображает информер обязательности. 
    /// В случае, если обязательное поле заполнено - скрывает информер обязательности.
    /// В случае, если поле необязательное - скрывает информер обязательности.</summary>

    //для ReadOnly-поелй ничего не делаем.
    if (this.ReadOnly)
        return;

    //для обязательного поля проверяем заполненность поля.
    if (this.Required) {
        var isEmptyValue = DBField_IsEmptyValue.call(this);
        //если значение поле пустое - отображаем подсказку.
        //если значение поле заполнено - скрываем подсказку.
        if (isEmptyValue) {
            if (!hideOnly)
                DBField_ShowRequired.call(this);
        }
        else
            DBField_HideRequired.call(this);
    }
    else {
        //если поле необязательное, то внезависимости от заполненности поля скрываем подсказку.
        DBField_HideRequired.call(this);
    }
}

function DBField_ShowRequired() {
    /// <summary>Отображает подсказку "Вы не заполнили обязательное поле" под полем.</summary>
    if (this.ReadOnly)
        return;

    //если подсказка уже отображена - выходим из метода.
    if (this.RequiredInformerVisible)
        return;

    //созадем контрол подсказки.
    if (this.RequiredInformer == null) {
        if (this.Container != null) {
            if (this.Container.cells != null) {
                var tdControl = this.Container.cells[1];
                if (tdControl != null) {
                    var divRequired = window.document.createElement('div');
                    tdControl.appendChild(divRequired);
                    divRequired.className = 'dbf_listform_requiredInformer';

                    //дефалтовый текст, отображаемый под полем
                    var requiredText = TN.TranslateKey('ListForm.Informers.RequiredField');

                    //если задан кастомный текст, то отображаем его.
                    if (!SM.IsNE(this.CustomRequiredInformer))
                        requiredText = this.CustomRequiredInformer;

                    if (SM.IsIE)
                        divRequired.innerText = requiredText;
                    else
                        divRequired.textContent = requiredText;
                    this.RequiredInformer = divRequired;
                }
            }
        }
    }
    if (this.RequiredInformer != null) {
        this.RequiredInformer.style.display = 'block';

        //при первом отображении подсказки обязательности, вешаем обработчик на скрытие обязательности.
        if (!this.IsSetHideRequiredHandler) {
            this.AddChangeHandler(DBField_OnEmptyValueChanged)
            this.IsSetHideRequiredHandler = true;
        }
    }

    this.RequiredInformerVisible = true;
}

//скрывает/показывает отображение подсказки обязательности при ее отображении.
function DBField_OnEmptyValueChanged(field) {
    if (field == null)
        throw new Error('Не передан параметр field.');
    DBField_CheckRequired.call(field);
}

function DBField_HideRequired() {
    /// <summary>Скрывает подсказку "Вы не заполнили обязательное поле" под полем.</summary>

    if (this.ReadOnly)
        return;

    //если подсказка уже скрыта - выходим из метода.
    if (!this.RequiredInformerVisible)
        return;

    if (this.RequiredInformer != null)
        this.RequiredInformer.style.display = 'none';

    this.RequiredInformerVisible = false;
}

//#endregion

//#region SetRequired

function DBField_SetRequired(requiredValue) {
    /// <summary>Устанавливает/снимает признак обязательности заполнения поля. 
    /// Отображает/скрывает "звездочку" обязательности в соответствии с признаком.
    /// Скрывает подсказку "Required" в случае, если значение признака обязательности устанавливается в false.
    /// Возвращает управление без нагрузки на производительность в случае, 
    /// если устаналиваемое значение признака обязательности 
    /// не отличается от текущего установленного значения признака обязательности.</summary>

    //приводим значения к типу bool
    requiredValue = requiredValue == true;
    if (this.Required == null)
        this.Required = this.Required == true;

    //если выставлена обязательность, всегда сбрасываем кастомные алерты/информеры.
    if (this.Required) {
        this.CustomRequiredAlert = null;
        this.CustomRequiredInformer = null;
    }

    //если значение обязательности не изменилось - ничего не делаем
    //если значение обязательности поменялось - идем дальше.
    if (this.Required == requiredValue)
        return;

    //сохраняем оригнальное значение обязательности поля
    if (this.OriginalRequired == null)
        this.OriginalRequired = this.Required;

    //получаем контрол обязательности.
    var requiredStar = DBField_InitRequiredStar.call(this);

    //устанавливаем видимость звездочки.
    if (requiredStar != null) {
        if (requiredValue)
            requiredStar.style.display = '';
        else
            requiredStar.style.display = 'none';
    }
    //устанавливаем признак обязательности.
    this.Required = requiredValue;

    //скрываем подсказку обязательности при необходимости.
    DBField_CheckRequired.call(this, true);
}

//инициализирует (получает или создает) звездочку обязательности поля
function DBField_InitRequiredStar() {
    var requiredStar = this.RequiredStar;
    if (requiredStar == null) {
        DBField_InitTitleControl.call(this);
        if (this.TitleControl != null) {
            //ищем звездочку в разметке.
            requiredStar = $(this.TitleControl).find('.dbf_listform_requiredTitle')[0];
            if (requiredStar == null) {
                //создаем контрол звездочки
                requiredStar = document.createElement('span');
                requiredStar.className = 'dbf_listform_requiredTitle';
                SM.SetInnerText(requiredStar, '*');

                //добавляем звездочку в контрол последнего слова.
                var lastWordControl = $(this.TitleControl).find('.dbf_listform_lastTitleWord')[0];
                if (lastWordControl == null)
                    throw new Error('Не удалось получить контрол последнего слова заголовка поля.');
                lastWordControl.appendChild(requiredStar);

                this.RequiredStar = requiredStar;
            }
            this.RequiredStar = requiredStar;
        }
    }
    if (requiredStar == null)
        throw new Error('Не удалось инициализировать звездочку обязательности для поля ' + this.Name);
    return requiredStar;
}

function DBField_SetOriginalRequired() {
    /// <summary>Устанавливает оригинальное значение признака обязательности поля, загруженное с сервера. 
    /// Установка обязательности производится методом SetRequired().</summary>

    DBField_SetRequired.call(this, this.OriginalRequired);
}

//#endregion

function DBField_ShowTooltip() {
    RL.CallAsync('Tooltip', 'DBField_ShowTooltipAsync', this);
}

//возвращает триггер тултипа
function DBField_GetTooltipTrigger() {
    var tooltipTrigger = this.TooltipTrigger;
    if (tooltipTrigger == null) {
        tooltipTrigger = $(this.Container).find('.dbf_listform_fieldTooltip')[0];
        this.TooltipTrigger = tooltipTrigger;
    }
    return tooltipTrigger;
}

function DBField_ShowTooltipAsync() {
    var parentElement = DBField_GetTooltipTrigger.call(this);
    if (!parentElement.ToolTip) {
        parentElement.ToolTip = new Tooltip({
            isVertical: true,
            parentElement: parentElement,
            hideOnMouseOut: false,
            relativeX: 0,
            relativeY: 0,
            relativeLeft: 0
        });
        var divTooltipContent = document.createElement('div');
        divTooltipContent.className = 'dbf_listform_fieldTooltip_content';
        divTooltipContent.innerHTML = this.Tooltip;
        parentElement.ToolTip.Container.className += ' dbf_listform_fieldTooltip_container';


        parentElement.ToolTip.DivContent.appendChild(divTooltipContent);
    }

    parentElement.ToolTip.ShowTrigger();
    parentElement.ToolTip.Container.style.width = 'auto';
}

////////////////////////////////////////////////////////////////////////////





///////////////////////////////DBListFormSaveEventArgs//////////////////////////////////

function DBListFormSaveEventArgs(commonArgs) {

    //устанавливаем ссылку на общие аргументы
    if (commonArgs != null)
        this.CommonArgs = commonArgs;

    this.CanSave = true;

    this.CommonAlertMessage = null;
    this.SingleAlertMessage = null;

    this.CommonInformerMessage = null;
    this.SingleInformerMessage = null;

    //ссылка на функцию
    this.ShowSingleInformer = null;

    this.ConfirmMessage = null;

    this.Field = null;
    this.IsIncorrectValue = false;
    this.IsEmptyValue = false;
    this.RedirectOnSuccessUrl = null;
    this.RedirectOnFailedUrl = null;
    this.StayOnForm = false;
    this.CloseOnUpdate = false;
    this.UnsafeUpdate = false;
}

////////////////////////////////////////////////////////////////////////////





////////////////////////Common Methods//////////////////////////////
function DBLF_GetAttribute(attributeName) {
    return DBLF_GetAttributeValue(this.XmlElement, attributeName);
}

function DBLF_GetBooleanAttribute(attributeName) {
    return DBLF_GetBooleanAttributeValue(this.XmlElement, attributeName);
}

function DBLF_GetIntegerAttribute(attributeName) {
    return DBLF_GetIntegerAttributeValue(this.XmlElement, attributeName);
}

//получение текстового атрибута ХМЛ-элемента
function DBLF_GetAttributeValue(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!window.SM.IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function DBLF_GetBooleanAttributeValue(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = DBLF_GetAttributeValue(xmlElement, attributeName);
    if (!window.SM.IsNullOrEmpty(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function DBLF_GetIntegerAttributeValue(xmlElement, attributeName) {
    var intValue = 0;
    var value = DBLF_GetAttributeValue(xmlElement, attributeName);
    if (!window.SM.IsNullOrEmpty(value))
        intValue = parseInt(value);
    return intValue;
}
////////////////////////////////////////////////////////////////////