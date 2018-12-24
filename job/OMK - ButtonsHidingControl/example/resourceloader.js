function RL_ResourceLoader() {
    window.RL = this;

    //асинхронный вызов скрипта при загрузке ресурса js/css
    this.CallAsync = RL_CallAsync;

    //асинхронный вызов скрипта при загрузке ресурса js/css без инициализации загрузки ресурсов js/css.
    this.CallDemand = RL_CallDemand;

    //асинхронный вызов скрипта при загрузке xap-приложения (Silverlight).
    this.OnXapLoad = RL_OnXapLoad;

    //асинхронный вызов скрипта при первичной инициализации загруженного xap-приложения (Silverlight).
    this.OnXapInit = RL_OnXapInit;

    //метод, который должен вызываться из xap-приложения окончании загрузки xap-приложения (Silverlight).
    this.OnXapLoadCompleted = RL_OnXapLoadCompleted;
}


//#region RL_GetScope

//получение области ресурсов по имени
function RL_GetScope(scopeName, throwNotFoundException) {
    if (SM.IsNE(scopeName))
        throw new Error('Не передан параметр scopeName.');
    scopeName = scopeName.toLowerCase();

    var result = null;

    //формируем словарь скопов по имени.
    if (this.ScopesByName == null) {
        this.ScopesByName = {};

        if (this.Scopes != null) {
            var i, len = this.Scopes.length;
            for (i = 0; i < len; i++) {
                var scope = this.Scopes[i];
                this.ScopesByName[scope.Name] = scope;
            }
        }
    }

    //получаем результат из словаря.
    result = this.ScopesByName[scopeName];

    //приводим undefined к null.
    if (result == null)
        result = null;

    if (result == null && throwNotFoundException)
        throw new Error('Не удалось получить область ресурсов по имени ' + scopeName + '. Необходима регистрация области ресурсов.');

    return result;
}

//#endregion

//#region RL_GetScopes

//получаем коллекцию скопов по коллекции имен скопов.
function RL_GetScopes(scopeNames, throwNotFoundException) {
    if (scopeNames == null || scopeNames.length == 0)
        throw new Error('Не передан параметр scopeNames.');

    var scopes = [];
    var isArray = false;
    if (SM_IsString(scopeNames)) {
        if (scopeNames.indexOf(',') == -1) {
            var singleScope = RL_GetScope.call(this, scopeNames, throwNotFoundException);
            if (singleScope != null)
                scopes.push(singleScope);
        }
        else {
            scopeNames = scopeNames.split(',');
            isArray = true;
        }
    }
    else
        isArray = true;
    if (isArray) {
        var i, len = scopeNames.length;
        for (i = 0; i < len; i++) {
            var scopeName = scopeNames[i];
            var scope = RL_GetScope.call(this, scopeName, throwNotFoundException);
            if (scope != null)
                scopes.push(scope);
        }
    }
    return scopes;
}

//#endregion

//#region RL_GetLoadEntry

//возвращает совокупность загружаемых областей ресурсов по именам областей ресурсов
//порядок имен ресурсов не имеет значение, для проверки уникальность данного набора скопов.
function RL_GetLoadEntry(scopeNames) {
    if (SM.IsNE(scopeNames))
        throw new Error('Не передан параметр scopeNames.');

    var entryKey = RL_GetScopesKey(scopeNames);

    if (this.LoadEntries == null)
        this.LoadEntries = [];

    var loadEntry = this.LoadEntries[entryKey];
    if (loadEntry == null) {
        loadEntry = new ResourceLoadEntry(entryKey, scopeNames);
        this.LoadEntries[entryKey] = loadEntry;
    }
    return loadEntry;
}

//#endregion

//#region RL_SortStringArray

//регистро-нечувствительная сортировка.
function RL_SortStringArray(a, b) {
    var compA = a.toLowerCase();
    var compB = b.toLowerCase();
    if (compA < compB)
        return -1;
    if (compA > compB)
        return 1;
    return 0;
}

//#endregion

//#region IsArray

//Возвращает true, если obj является массивом.
function RL_IsArray(obj) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    var isArray = Object.prototype.toString.call(obj) === '[object Array]';
    return isArray;
}


//#endregion

//#region RL_GetScopesKey

//возвращает уникальный ключ набора областей ресурсов (скопов)
//порядок следования названий скопов не влияет на уникальность ключа
//т.к. названия скопов будут отсортированы.
function RL_GetScopesKey(scopeNames) {
    if (scopeNames == null || scopeNames.length == 0)
        throw new Error('Не передан параметр scopeNames.');

    var scopeKey = null;
    var isArray = false;
    if (SM_IsString(scopeNames)) {
        if (scopeNames.indexOf(',') == -1)
            scopeKey = scopeNames.toLowerCase();
        else {
            scopeNames = scopeNames.split(',');
            isArray = true;
        }
    }
    else
        isArray = true;
    if (isArray) {
        //сортируем имена скопов без учета регистра
        if (scopeNames.length > 1) {
            scopeNames.sort(RL_SortStringArray);
            scopeKey = scopeNames.join('_').toLowerCase();
        }
        else
            scopeKey = scopeNames[0].toLowerCase();
    }
    return scopeKey;
}

//#endregion



//debugger
function RL_CallAsync(scopeNames, callBack, callInstance, args, loadDemand) {
    if (scopeNames == null || scopeNames.length == 0)
        throw new Error('Не передан параметр scopeNames.');

    if (callBack == null)
        throw new Error('Не передан параметр callBack.');

    //получаем уникальный ключ загрузки, на случай многократного вызова с одинаковыми параметром scopeNames
    //но данная проверка не проверяет загруженность уникального набора скопов, которые будут получены из scopeName
    //т.е. две загрузки с параметром {'DateControl'} или {'DateControl', 'ListControl'} инициируют дважды проверку
    //загруженности скопов DateControl и ListControl.
    //в то время как две загрузки с парамтром {'TextControl', 'ListControl'} или {'ListControl', 'TextControl'}
    //иницируют одну проверку загруженности ListControl и TextControl.
    var loadEntry = RL_GetLoadEntry.call(this, scopeNames);
    if (loadEntry.Loaded) {
        RL_CallScript(callBack, callInstance, args);
        return;
    }
    //добавляем callBack к загрузке loadingEntry, который параллельно загружаем из другого кода.
    loadEntry.CallBacks.push({
        CallBack: callBack,
        CallInstance: callInstance,
        Args: args
    });

    RLE_Load.call(loadEntry, loadDemand);
}

function RL_CallDemand(scopeNames, callBack, callInstance, args) {
    RL_CallAsync.call(this, scopeNames, callBack, callInstance, args, true);
}


/*------------ResourceLoadEntry-----------*/

function ResourceLoadEntry(key, scopeNames) {
    if (SM.IsNE(key))
        throw new Error('Не передан параметр key');
    if (SM.IsNE(scopeNames))
        throw new Error('Не передан параметр scopeNames');
    this.ScopeNames = scopeNames;
    this.Key = key;
    this.CallBacks = [];

    //незагруженные области ресурсов.
    this.UnloadedScopes = [];
}

//debugger
function RLE_Load(loadDemand) {
    //если неотложенная асинхронная закгрузка, только тогда забираем loadingEntry на загрузку.
    if (!loadDemand) {
        //выполняем загрузку, только если она уже не была забрана на загрузку
        var doLoad = RL_CheckLoadStart.call(this);
        if (!doLoad)
            return;
    }

    //проверяем флаг инициализации формирования незагруженных скопов loadingEntry/
    if (!this.__init_UnloadedScopes) {

        //получаем все скопы, которые перечислены в массиве имен  скопов.
        var scopes = RL_GetScopes.call(RL, this.ScopeNames, true);

        //формируем набор скопов для загрузки (при этом проверяем на повторение вложенных скопов.)
        var uniqueScopes = [];
        var i, len = scopes.length;
        for (i = 0; i < len; i++) {
            var entryScope = scopes[i];
            if (entryScope == null)
                throw new Error('Обнаружена ссылка на пустой объект области ресурсов.');

            //если скоп, который пытаются загрузить асинхронно уже загружен синхронно,
            //значит он и все его дети уже загружены, поэтому пропускам его.
            if (entryScope.Loaded)
                continue;

            //идем в цикле по дискретным скопам, включенным в скоп.
            //сначала нужно ПОЛНОСТЬЮ сформировать коллекцию незагруженных скопов, а потом вызывать их загрузку,
            //т.к. если вызвать загружку первого скопа сразу, то он может прогрузиться и тут же вызвать колбэки
            //текущей загрузки (loadingEntry), в то время как коллекция UnloadedScopes даже еще не сформирована -
            //по которой будет проверяться статус загрузки всего loadningEntry, а также колбэкам для работы нужны будут и остальные скопы, 
            //которые даже не начали прогружаться.
            var j, jlen = entryScope.IncludedAsyncScopes.length;
            for (j = 0; j < jlen; j++) {
                //добавляем имя скопа в словарь сразу, чтобы лишний раз не вызывать GetScope.
                var scopeName = entryScope.IncludedAsyncScopes[j];
                if (uniqueScopes[scopeName] != null)
                    continue;
                uniqueScopes[scopeName] = true;

                var scope = RL_GetScope.call(RL, scopeName, true);
                //если скоп не загружен и его никто не забрал на загрузку, то забираем его на загрузку.
                if (scope.Loaded)
                    continue;

                RS_AddLoadingEntry.call(scope, this);
            }
        }

        //выставляем флаг инициализации для UnloadedScopes.
        this.__init_UnloadedScopes = true;
    }

    //если неотложенная асинхронная закгрузка, только тогда загружаем скопы
    if (!loadDemand) {
        //почему вызов RS_Load расположен здесь - см. большой коммент повыше.
        var k, klen = this.UnloadedScopes.length;
        for (k = 0; k < klen; k++) {
            var unloadedScope = this.UnloadedScopes[k];
            RS_Load.call(unloadedScope, this);
        }
    }

    //запускаем выполенение CallBacks на случай параллельного вызова данного LoadEntry.
    //а также на случай, данный loadEntry включает в себя комбинацию скопов, КОТОРЫЕ УЖЕ БЫЛИ ЗАГРУЖЕНЫ
    //раннее по отдельности.
    RLE_LoadComplete.call(this, loadDemand);
}


function RLE_LoadComplete(loadDemand) {

    //проверяем признак загруженности всех загружаемых данным loadingEntry скопов.
    //(скоп сам вызовет обработчик конца загрузки для loadingEntry в случае своей загрузки, 
    //поэтому ретурнить здесь - можно)
    var scopesLoaded = RL_CheckLoadedChildren(this.UnloadedScopes);
    if (!scopesLoaded)
        return;

    //проверяем признак единоразового вызова колбэков окончания заргузки.
    //данная проверка может сработать если скоп загрузился настролько быстро, что код еще не успел
    //дойти до вызова RLE_LoadComplete в методе RLE_Load, а это значит, что когда код дойдет до вызова RLE_LoadComplete в методе RLE_Load,
    //не нужно еще раз вызывать колбэки для него.
    var doLoadComplete = true;
    if (!loadDemand)
        doLoadComplete = RL_CheckLoadComplete.call(this);
    else {
        //если loadingEntry уже загружен (параллельным потоком) - не нужно повторно вызывать его колбэки, так как тот параллельный
        //поток уже вызвал колбэки
        if (this.Loaded)
            doLoadComplete = false;

        //если загрузка demand и loadingEntry начал уже реально грузиться другим потоком, значит он еще не загружен
        //но при это грузится параллельным потоком и вызывать колбэки нельзя.
        if (this.LoadStarted || this.LoadCompleted)
            doLoadComplete = false;

        //если не сработали предыдущие запреты на выполнение колбэков, а при этом loadingEntry не содержит незагруженных скопов,
        //значит ему можно проставить признак Loaded=true (например для случая, когда он был загружен синхронно),
        //в ином случае колбэки вызывать нельзя, так как значит - никто еще не начал грузить этот loadingEntry.
        if (doLoadComplete && this.UnloadedScopes.length == 0)
            this.Loaded = true;
        else
            doLoadComplete = false;
    }

    if (!doLoadComplete)
        return;

    var i, len = this.CallBacks.length;
    for (i = 0; i < len; i++) {
        var callBack = this.CallBacks[i];
        if (callBack == null)
            throw new Error('Обнаружена ссылка на пустой объект CallBack.');
        RL_CallScript(callBack.CallBack, callBack.CallInstance, callBack.Args);
    }
}


/*------------------ ResourceScope --------------------*/
function RS_AddLoadingEntry(loadingEntry) {
    if (loadingEntry == null)
        throw new Error('Не передан параметр loadingEntry.');

    if (this.Loaded)
        return;

    //добавляем скоп к обратным callBack-ам из конца загрузки скопа в callBack для loadingEntry только 
    //для незагруженных скопов, т.к. их загрузка будет асинхронной
    //в свою очередь если скоп был загружен то в загрузке самого loadingEntry будет вызван loadingEntry.callBack
    //в самом конце метода загрузки и этот скоп.Loaded==true будет обработан.
    if (this.LoadingEntries == null)
        this.LoadingEntries = [];
    if (this.LoadingEntries[loadingEntry.Key] == null) {
        this.LoadingEntries[loadingEntry.Key] = loadingEntry;
        loadingEntry.UnloadedScopes.push(this);
    }
}

function RS_Load() {
    //return можно делать поскольку данный scope уже забрал себе LoadingEntry из которого был вызван Load
    //и соответсвтенно callBack для данного LoadingEntry вызовется в конце реальной загрузки scope.
    var doLoad = RL_CheckLoadStart.call(this);
    if (!doLoad)
        return;

    var i, len = this.AsyncLinks.length;
    for (i = 0; i < len; i++) {
        var asyncLink = this.AsyncLinks[i];
        RAL_Load.call(asyncLink);
    }

    //здесь не вызвыаем RS_LoadComplete т.к. ссылки на ресурсы расположен в одно экземпляре скопа - 
    //только этого скопа.
}

function RS_LoadComplete() {
    var linksLoaded = RL_CheckLoadedChildren(this.AsyncLinks);
    if (!linksLoaded)
        return;

    var doLoadComplete = RL_CheckLoadComplete.call(this);
    if (!doLoadComplete)
        return;

    for (var entryKey in this.LoadingEntries) {
        if (!this.LoadingEntries.hasOwnProperty(entryKey))
            continue;
        var loadingEntry = this.LoadingEntries[entryKey];
        RLE_LoadComplete.call(loadingEntry);
    }
}

//#region Check Load States

//Проверяет возможность начала ЕДИНОРАЗОВОЙ загрузки объекта и устанавливает признак процесса загрузки объекта.
function RL_CheckLoadStart() {
    //возвращаемое значение - признак - выполнять ли ЕДИНОРАЗОВЫЙ процесс загрузки объекта.
    var doLoadStart = true;

    //если объект уже загружен - не нужно его загружать повторно
    if (this.Loaded)
        doLoadStart = false;

    //если загрузка объекта начата - не нужно его пытаться загружать параллельно
    if (this.LoadStarted)
        doLoadStart = false;

    //если объект не загружен и не загружается, помечаем его как признаком процесса загрузки
    if (doLoadStart)
        this.LoadStarted = true;

    return doLoadStart;
}

//Проверяет возможность ЕДИНОРАЗОВОЙ обработки окончания загрузки объекта и устанавливает флаг окончания загрузки объекта.
function RL_CheckLoadComplete() {
    //возвращаемое значение - признак - выполнять ли ЕДИНОРАЗОВУЮ обработку окончания загрузки объекта.
    var doLoadComplete = true;

    //если объект уже загружен, значит обработчик окончания уже запускался
    if (this.Loaded)
        doLoadComplete = false;

    //если объект не в состоянии загрузки, значит это состояние уже было сброшено первым запуском окончания загрузки.
    //флаги LoadCompleted и LoadStarted нужны отдельны друг от друга, т.к. LoadCompleted может проставляться без явного вызова
    //старта загрузки объекта.
    if (this.LoadCompleted)
        doLoadComplete = false;

    //если оконачание загрузки объекта вызывается в первый раз - 
    //устанавливаем признак загруженности объект и снимаем признак процесса загрузки объекта.
    if (doLoadComplete) {
        this.Loaded = true;
        this.LoadCompleted = true;
    }

    return doLoadComplete;
}

//проверяет признак загруженности дочерних объектов, передаваемых в массиве childObjects
function RL_CheckLoadedChildren(childObjects) {
    if (childObjects == null)
        throw new Error('Не передан параметр childObjects.');

    if (!RL_IsArray(childObjects))
        throw new Error('Параметр childObjects должен быть типа Array.');

    var childrenLoaded = true;

    //если встретили хотя бы одного незагруженного ребенка, 
    //то устанавливаем признак незагруженности детей.
    var i, len = childObjects.length;
    for (i = 0; i < len; i++) {
        var childObject = childObjects[i];
        if (!childObject.Loaded) {
            childrenLoaded = false;
            break;
        }
    }

    return childrenLoaded;
}

//#endregion

/*---------------------- ResourceLink ------------------------*/

//загружает ссылку на ресурс в страницу если страница уже загружена пользователю
//либо дожидается загрузки страницы и загружает ссылку на ресурс.
function RAL_Load() {

    if (SM.PageLoaded) {
        //если страница уже загружена - сразу загружаем ссылку на скрипт
        RAL_RunLoad.call(this);
    }
    else {
        //если страница еще не загружена, добавляем обработчик на загрузку скрипта после загрузки страницы
        SM.OnPageLoad('RAL_RunLoad', this);
    }
}

//загружает ссылку на ресурс в страницу
function RAL_RunLoad() {


    if (!SM.PageLoaded)
        throw Error('Невозможно начать загрузку скрипта во время загрузки страницы.');

    var doLoad = RL_CheckLoadStart.call(this);
    if (!doLoad)
        return;

    var scopeName = this.Scope;
    var resourceLink = null;
    var urlAttributeName = null;
    //скрипты
    if (this.Type == 'Script') {
        //создаем ссылку на скрипт
        resourceLink = document.createElement('script');
        resourceLink.setAttribute('type', 'text/javascript');
        urlAttributeName = 'src'
    }
    else if (this.Type == 'Css') {
        //создаем ссылку на стили
        resourceLink = window.document.createElement('link');
        resourceLink.setAttribute('type', 'text/css');
        resourceLink.setAttribute('rel', 'stylesheet');
        urlAttributeName = 'href';
    }

    //устанавливаем вызов обработчика на конец загрузки ресурса.
    //даже для IE10 загрузка через onload не срабатывает (именно не вызывается) при асинхронной загрузке скрипта 
    //во время прогрузки страницы.
    var thisObj = this;
    if (SM.IsIE && SM.IEVersion <= 8) {
        resourceLink.onreadystatechange = function () {
            if (this.readyState == 'loaded' || this.readyState == 'complete')
                RAL_LoadCompleted.call(thisObj);
        }
    }
    else {
        resourceLink.onload = function () {
            RAL_LoadCompleted.call(thisObj);
        }
    }
    resourceLink.setAttribute('IsAsync', 'true');
    resourceLink.setAttribute('Scope', this.Scope);
    resourceLink.setAttribute('IncludedScopes', this.IncludedScopes);
    resourceLink.setAttribute('Resources', this.Resources);
    this.Link = resourceLink;
    resourceLink.setAttribute(urlAttributeName, this.Url);

    //добавляем ресурс к документу
    document.getElementsByTagName('head')[0].appendChild(resourceLink);
}

//debugger
function RAL_LoadCompleted() {
    var doLoadComplete = RL_CheckLoadComplete.call(this);
    if (!doLoadComplete)
        return;

    var scope = RL_GetScope.call(RL, this.Scope, true);
    RS_LoadComplete.call(scope);
}

function RL_CallScript(callBack, callInstance, args) {
    if (callBack == null)
        throw new Error('Не передан параметр callBack.');

    if (SM_IsString(callBack)) {
        //сохраняем в переменную имя функции
        var callBackName = callBack;

        //получаем функцию из окна
        callBack = window[callBackName];

        //проверяем наличие полученной функции.
        if (callBack == null)
            throw new Error('Не удалось получить функцию по имени ' + callBackName);
    }
    if (callBack != null) {
        if (callInstance == null)
            callBack(args);
        else
            callBack.call(callInstance, args);
    }
}

//#region Xap Load Handling

//прикрепляет обработчик первичной инициализации на окончание загрузки Silverlight-компонента.
function RL_OnXapInit(xapUrl, callBack, callInstance, args) {
    RL_AttachXapLoadEvent.call(this, 'OnInit', xapUrl, callBack, callInstance, args);
}

//прикрепляет обработчик на окончание загрузки Silverlight-компонента.
function RL_OnXapLoad(xapUrl, callBack, callInstance, args) {
    RL_AttachXapLoadEvent.call(this, 'OnLoad', xapUrl, callBack, callInstance, args);
}

//прикрепляет обработчик на определнное событие загрузки Silverlight-компонента.
function RL_AttachXapLoadEvent(eventName, xapUrl, callBack, callInstance, args) {
    if (SM.IsNE(eventName))
        throw new Error('Не передан параметр eventName.');
    if (SM.IsNE(xapUrl))
        throw new Error('Не передан параметр xapUrl.');
    if (SM.IsNE(callBack))
        throw new Error('Не передан параметр callBack.');

    if (this.XapStates == null)
        this.XapStates = {};

    //приводим адрес приложения к нижнему регистру
    xapUrl = xapUrl.toLowerCase();

    //получаем состояние загрузки xap-приложения.
    var xapState = this.XapStates[xapUrl];

    //если состояние не задано, значит - приложение не загружено.
    if (xapState == null) {

        //создаем состояние загрузки xap-приложения.
        xapState = {
            //адрес приложения.
            Url: xapUrl,

            //флаг загруженности приложения.
            Loaded: false
        };
        //добавляем состояние загрузки с словарь состояний
        this.XapStates[xapUrl] = xapState;
    }

    //если компонент пока загружен, вызываем его сразу
    //иначе - добавляем обработчик окончания загрузки в очередь обработчиков, 
    if (xapState.Loaded) {
        if (eventName == 'OnInit')
            throw new Error('Обработчик инициализации xap-компонента можно прикрепить только до загрузки xap-компонента.');

        //вызываем скрипт.
        RL_CallScript(callBack, callInstance, args);
    }
    else {
        //формируем название коллекции обработчиков данного события.
        var callBacksName = eventName + '_CallBacks';

        //получаем коллекцию обработчиков события.
        var eventCallBacks = xapState[callBacksName];
        if (eventCallBacks == null) {
            eventCallBacks = [];
            xapState[callBacksName] = eventCallBacks;
        }

        //добавляем обработчик в коллекцию обработчиков.
        eventCallBacks.push({
            CallBack: callBack,
            CallInstance: callInstance,
            Args: args
        });
    }
}

//вызывается при окончании загрузки сильверлайт-компонента.
//xapUrl - значение свойства в контексте Silverlight: Application.Current.Host.Source.AbsolutePath
function RL_OnXapLoadCompleted(xapUrl) {
    if (SM.IsNE(xapUrl))
        throw new Error('Не передан параметр xapUrl.');

    //если не был прикреплен ни один обработчик ни на одно xap-приложение - выходим из функции.
    if (this.XapStates == null)
        return;

    //приводим адрес приложения к нижнему регистру
    xapUrl = xapUrl.toLowerCase();

    //получаем состояние загрузки xap-приложения.
    var xapState = this.XapStates[xapUrl];

    //если состояние не задано, значит значит не был прикреплен ни один обработчик на данное xap-приложение.
    if (xapState == null)
        return;

    //устанавалием состоянии окончания загрузки xap-приложения.
    xapState.Loaded = true;

    //вызываем обработчики инициализации компонента,
    //их нужно вызывать первыми, например, чтобы получить глобальный объект из xap-компонента, и проставить на него ссылку
    //после чего остальные обработчики будут уже использовать данный компонент.
    RLXapState_CallXapLoadHandlers.call(xapState, 'OnInit');

    //вызываем функциональные обработчики.
    RLXapState_CallXapLoadHandlers.call(xapState, 'OnLoad');
}

function RLXapState_CallXapLoadHandlers(eventName) {
    if (SM.IsNE(eventName))
        throw new Error('Не передан параметр eventName.');

    //формируем название коллекции обработчиков данного события.
    var callBacksName = eventName + '_CallBacks';

    //получаем коллекцию обработчиков события.
    var eventCallBacks = this[callBacksName];

    //если коллекция обработчиков не задана, то выходим из функции.
    if (eventCallBacks == null)
        return;

    //вызываем обрабтчики событий.
    var i, len = eventCallBacks.length;
    for (i = 0; i < len; i++) {
        var callBack = eventCallBacks[i];
        if (callBack == null)
            throw new Error('Обнаружена ссылка на пустой объект CallBack.');
        RL_CallScript(callBack.CallBack, callBack.CallInstance, callBack.Args);
    }
}

//#endregion
