function SM_ScriptManager() {
    window.SM = this;

    //props
    this.BrowserDetector = new SM_InitBrowserDetector();
    this.IsFF = this.BrowserDetector.IsFF;
    this.IsIE = this.BrowserDetector.IsIE;
    this.IsIE7 = this.BrowserDetector.IsIE7;
    this.IsIE8 = this.BrowserDetector.IsIE8;
    this.IsIE9 = this.BrowserDetector.IsIE9;
    this.IsIE10 = this.BrowserDetector.IsIE10;
    this.IsIE11 = this.BrowserDetector.IsIE11;
    this.IEVersion = this.BrowserDetector.IEVersion;
    this.IsSafari = this.BrowserDetector.IsSafari;
    this.IsChrome = this.BrowserDetector.IsChrome;

    this.IsIPad = this.BrowserDetector.IsIPad;
    this.IsMacOsX = this.BrowserDetector.IsMacOsX;
    this.IsAndroid = this.BrowserDetector.IsAndroid;
    this.IsTouchDevice = this.BrowserDetector.IsTouchDevice;
    this.IsWindowsTablet = this.BrowserDetector.OS == 'Windows' && this.IsTouchDevice;
    this.IsMobileDevice = this.IsMacOsX || this.IsIPad || this.IsAndroid || this.IsWindowsTablet;

    this.DTD = this.BrowserDetector.DTD;

    //functions
    this.IsNullOrEmpty = SM_IsNullOrEmpty;
    this.IsNE = SM_IsNullOrEmpty;
    this.SR = SM_StringReplace;
    this.StringReplace = SM_StringReplace;
    this.GetDocumentMetricElement = SM_BrowserDetector_GetDocumentMetricElement;
    this.GetClientHeight = SM_BrowserDetector_GetClientHeight;
    this.GetClientWidth = SM_BrowserDetector_GetClientWidth;
    this.GetScrollLeft = SM_BrowserDetector_GetScrollLeft;
    this.GetScrollTop = SM_BrowserDetector_GetScrollTop;
    this.DisableSelection = SM_DisableSelection;
    this.ResetFormLayout = SM_ResetFormLayout;
    this.GetXmlRequest = SM_GetXmlRequest;
    this.InvokeScripts = SM_InvokeScripts;
    this.CloneObject = SM_CloneObject;
    this.ParseInt = SM_ParseInt;
    this.ParseIntMetric = SM_ParseIntMetric;
    this.GetCurrentStyle = SM_GetCurrentStyle;
    this.WriteLog = SM_WriteLog;
    this.ClearLog = SM_ClearLog;
    this.ApplyOptions = SM_ApplyOptions;
    this.CancelEvent = SM_CancelEvent;
    this.GetRequestQueryBuilder = SM_GetRequestQueryBuilder;
    this.CreateRequestBuilder = SM_CreateRequestBuilder;
    this.GetCurrentParamsBuilder = SM_GetCurrentParamsBuilder;
    this.GetServerUrl = SM_GetServerUrl;
    this.GetRelativeUrl = SM_GetRelativeUrl;
    this.GetElement = SM_GetElement;
    this.CreateFixedHeader = SM_CreateFixedHeader;
    this.ApplyEventModel = SM_ApplyEventModelInternal;
    this.AttachEvent = SM_AttachEventInternal;
    this.FireEvent = SM_FireEventInternal;
    this.CallAsync = SM_CallAsync;
    this.CallScript = SM_CallScript;
    this.SerializeJson = SM_SerializeJson;
    this.CreateDataContract = SM_CreateDataContract;
    this.ArrayRemove = SM_ArrayRemove;
    this.GetUniqueID = SM_GetUniqueID;
    this.SetInnerText = SM_SetInnerText;
    this.AttachDomEvent = SM_AttachDomEvent;
    this.IsOverElement = SM_IsOverElement;

    //xml
    this.CreateXMLDocument = SM_CreateXMLDocument;
    this.LoadXML = SM_LoadXML;
    this.PersistXML = SM_PersistXML;
    this.IndentXML = SM_IndentXML;
    this.CheckActiveXObject = SM_CheckActiveXObject;

    //form
    this.PageForm = window.document.forms[0];


    SM_PreventEscapeHandle();

    this.ScriptBlocksOnLoad = [];
    this.OnPageLoadHandlers = [];

    //устанавливаем признак, что страница еще не загружена.
    this.PageLoaded = false;
    this.OnPageLoad = SM_OnPageLoad;
    this.AddScriptBlockOnLoad = SM_AddScriptBlockOnLoad;

    //проверяем наличие __doPostBack
    SM_CheckDoPostBackExists();

    return this;
}

//добавляем методы для всех string.
String.prototype.trim = function () { return this.replace(/(^\s+)|(\s+$)/g, ""); }
String.prototype.startsWith = function (str) { return (this.substr(0, str.length) == str); }

new SM_ScriptManager();

var SM_UniqueIDCounter = 0;
//возвращает уникальный идентификатор в рамках страницы.
function SM_GetUniqueID(idPrefix) {
    if (SM.IsNE(idPrefix))
        throw new Error('Не передан параметр idPrefix');
    SM_UniqueIDCounter++;
    return idPrefix + SM_UniqueIDCounter;
}

//устанавливает innerText в HTML-элемент.
function SM_SetInnerText(element, innerText) {
    if (element == null)
        throw new Error('element');

    if (innerText == null)
        innerText = '';
    if (SM.IsIE)
        element.innerText = innerText;
    else
        element.textContent = innerText;
}

function SM_AttachOnPageLoad() {
    if (window.addEventListener) {
        window.addEventListener("load", SM_HandlePageLoad, false);
    }
    else if (window.attachEvent) {
        window.attachEvent("onload", SM_HandlePageLoad);
    }
    else
        window.onload = SM_HandlePageLoad;
}

function SM_HandlePageLoad() {
    SM.PageLoaded = true;
    //сначала запускаем блоки зарегестированнных скриптов для WinXP/IE8.
    var j, jlen = SM.ScriptBlocksOnLoad.length;
    for (j = 0; j < jlen; j++) {
        var handler = SM.ScriptBlocksOnLoad[j];
        if (handler != null)
            handler();
    }

    //выполняем обработчики страницы.
    var i, len = SM.OnPageLoadHandlers.length;
    for (i = 0; i < len; i++) {
        var callBack = SM.OnPageLoadHandlers[i];
        if (callBack != null) {
            if (callBack.CallInstance == null)
                SM_CallScript(callBack, null, null);
            else
                SM_CallScript(callBack.Handler, callBack.CallInstance, null);
        }
    }
}

function SM_OnPageLoad(handler, callInstance) {
    if (handler != null) {
        if (!this.PageLoaded) {
            //если страница не загружена, добавляем обработчик.
            if (callInstance == null)
                this.OnPageLoadHandlers.push(handler)
            else {
                //если передан объект, для которого нужно вызвать метод - 
                //добавляем коллекцию обработчиков сопоставление объекта и метода.
                this.OnPageLoadHandlers.push({
                    Handler: handler,
                    CallInstance: callInstance
                });
            }
        }
        else {
            //иначе, если страница загружена - сразу выполняем обработчик.
            SM_CallScript(handler, callInstance, null);
        }
    }
}

function SM_CallScript(callBack, callInstance, args) {
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

function SM_AddScriptBlockOnLoad(handler) {
    if (handler != null)
        this.ScriptBlocksOnLoad.push(handler);
}

//предотвращаем ошибку ViewState по двойному escape в input'ах
function SM_PreventEscapeHandle() {
    //бага только в IE
    if (SM.IsIE) {
        //добавляем обработчик
        if (!SM.PreventEscapeHandleInited) {
            $(document).keydown(function (e) {
                //только по двойному escape происходит ошибка => даем
                //пользователю один раз его нажать
                if (SM.LastPressKeyCode == 27 && e.keyCode == 27)
                    return false;
                else {
                    SM.LastPressKeyCode = e.keyCode;
                    return true;
                }
            });
            SM.PreventEscapeHandleInited = true;
        }
    }
}

function SM_StringReplace(inputString, replacePhrase, resultPhrase) {
    if (SM.IsNE(inputString))
        return inputString;
    if (SM.IsNE(replacePhrase))
        return inputString;

    return inputString.split(replacePhrase).join(resultPhrase);
}

function SM_CreateFixedHeader(table, headerContainer, scrollContainer) {
    //debugger
    if (table == null)
        throw new Error('Не передан параметр table');
    if (headerContainer == null)
        throw new Error('Не передан параметр headerContainer');
    if (scrollContainer == null)
        scrollContainer = table.parentNode;
    if (scrollContainer == null)
        throw new Error('Не удалось определить scollContainer.');
    var scrollOverflow = SM.GetCurrentStyle(scrollContainer).overflow;
    if (!(scrollOverflow == 'scroll' || scrollOverflow == 'auto'))
        throw new Error('scollContainer не является скролируемым элементом.');
    headerContainer.innerHTML = '';

    var originalHeaderRow = table.rows[0];
    var headerHeight = originalHeaderRow.offsetHeight;

    var hasVerticalScroll = table.offsetHeight - headerHeight > scrollContainer.offsetHeight;
    if (hasVerticalScroll && SM.IsIE)
        table.style.width = (table.offsetWidth - 17) + 'px';

    var headerTable = table.cloneNode(false);
    scrollContainer.HeaderTable = headerTable;
    var headerTableBody = window.document.createElement('tbody');
    var headerRow = originalHeaderRow.cloneNode(true);
    var i, len = originalHeaderRow.cells.length;
    var lastCell = null, lastCellWidth = null;
    for (i = 0; i < len; i++) {
        var originalCell = originalHeaderRow.cells[i];
        var headerCell = headerRow.children[i];
        var originalCellWidth = originalCell.offsetWidth;
        headerCell.style.width = originalCellWidth + 'px';
        if (originalCellWidth > 0) {
            lastCellWidth = originalCellWidth;
            lastCell = headerCell;
        }
    }

    if (hasVerticalScroll && lastCell != null && lastCellWidth > 0) {
        lastCell.style.width = lastCellWidth + 17 + 'px';
        headerTable.style.width = table.offsetWidth + 17 + 'px';
    }
    else {
        headerTable.style.width = table.offsetWidth + 'px';
    }



    headerTableBody.appendChild(headerRow);
    headerTable.appendChild(headerTableBody);

    headerTable.style.marginLeft = -scrollContainer.scrollLeft + 'px';
    table.style.marginTop = -originalHeaderRow.offsetHeight + 'px';
    if (!scrollContainer.FixingHeaderHandlerAttached) {
        var scrollContainerVar = scrollContainer;
        $(scrollContainer).scroll(function () {
            var scrollLeft = scrollContainerVar.scrollLeft;
            var headerTable = scrollContainerVar.HeaderTable;
            if (headerTable.previousScrollLeft != scrollLeft) {
                headerTable.style.marginLeft = -scrollLeft + 'px';
                headerTable.previousScrollLeft = scrollLeft;
            }
        });
        scrollContainer.FixingHeaderHandlerAttached = true;
    }
    headerContainer.style.overflow = 'hidden';
    headerContainer.style.width = scrollContainer.offsetWidth + 'px';
    headerContainer.appendChild(headerTable);
}

function SM_GetElement(elementID, parentElement) {
    if (SM.IsNE(elementID))
        throw new Error('Не передан параметр elementID.');
    if (parentElement == null)
        throw new Error('Не передан параметр parentElement.');

    var element = $(parentElement).find('#' + elementID)[0];
    return element;
}

function SM_GetServerUrl(absoluteUrl) {
    if (SM.IsNE(absoluteUrl))
        throw new Error('Не передан параметр absoluteUrl');

    var len = absoluteUrl.length;
    var slashCount = 0;
    var i = 0;
    var stServerUrl = new String();
    while (slashCount < 3 && i < len) {
        var ch = absoluteUrl.charAt(i);
        if (ch == '/')
            slashCount++;
        if (slashCount < 3)
            stServerUrl += ch;
        i++;
    }
    return stServerUrl;
}


function SM_GetRelativeUrl(url) {
    if (url == null)
        throw new Error('Не передан параметр url');
    if (url == '')
        return '/';

    var isAbsUrl = webUrl.startsWith("http");
    var relativeUrl = webUrl;
    if (isAbsUrl) {
        var webServerUrl = SM.GetServerUrl(webUrl);
        var serverLen = webServerUrl.length;
        var webLen = webUrl.length;
        if (serverLen < webLen)
            relativeUrl = webUrl.substr(serverLen, webLen - serverLen);
        else
            relativeUrl = "/";
    }

    if (SM.IsNE(relativeUrl))
        relativeUrl = '/';
    else if (relativeUrl.charAt(0) != '/')
        relativeUrl = '/' + relativeUrl;

    return relativeUrl;
}

function SM_CancelEvent(evt) {
    if (evt == null) evt = window.event;
    if (evt != null) {
        evt.cancelBubble = true;
        evt.returnValue = false;
    }
    return false;
}

function SM_ApplyOptions(obj, defaultOptions, options) {
    if (obj == null)
        throw new Error('Параметр obj не может быть равен null.');
    if (defaultOptions == null)
        throw new Error('Параметр defaultOptions не может быть равен null.');

    if (options != null) {
        for (var optionKey in options) {
            if (!options.hasOwnProperty(optionKey))
                continue;
            defaultOptions[optionKey] = options[optionKey];
        }
    }
    for (var optionKey in defaultOptions) {
        if (!defaultOptions.hasOwnProperty(optionKey))
            continue;
        obj[optionKey] = defaultOptions[optionKey];
    }
}

function SM_GetCurrentStyle(element) {
    if (element == null)
        throw new Error('Параметр element не может быть равен null.');
    if (this.IsIE)
        return element.currentStyle;
    else
        return window.getComputedStyle(element);
}

function SM_ParseIntMetric(metric) {
    var result = 0;
    if (!SM.IsNE(metric)) {
        metric = metric.toString().toLowerCase();
        if (metric != 'auto') {
            var splMetric = metric.split('px');
            var number = splMetric[0];
            if (!SM.IsNE(number))
                result = parseInt(number);
        }
    }
    return result;
}

function SM_ParseInt(paramValue, defaultValue) {
    var intValue = 0;
    if (defaultValue != null)
        intValue = defaultValue;
    if (paramValue != null)
        intValue = parseInt(paramValue.toString());
    return intValue;
}

function SM_IsNullOrEmpty(str) {
    if (str == null)
        return true;
    if (str.toString() == '')
        return true;

    return false;
}

function SM_InitBrowserDetector() {
    var browserDetector = {
        Init: function () {
            this.Browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.Version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";

            this.IsIE = this.Browser == 'Explorer';
            this.IEVersion = null;
            if (this.IsIE) {
                var appVersion = window.navigator.appVersion.toLowerCase();
                this.IsIE7 = appVersion.indexOf('trident') == -1;
                this.IsIE8 = appVersion.indexOf('trident/4.0') != -1;
                this.IsIE9 = appVersion.indexOf('trident/5.0') != -1;
                this.IsIE10 = appVersion.indexOf('trident/6.0') != -1;
                this.IsIE11 = appVersion.indexOf('trident/7.0') != -1;

                if (this.IsIE7)
                    this.IEVersion = 7;
                else if (this.IsIE8)
                    this.IEVersion = 8;
                else if (this.IsIE9)
                    this.IEVersion = 9;
                else if (this.IsIE10)
                    this.IEVersion = 10;
                else if (this.IsIE11)
                    this.IEVersion = 11;
            }
            else {
                this.IsIE7 = false;
                this.IsIE8 = false;
                this.IsIE9 = false;
                this.IsIE10 = false;
            }
            this.IsChrome = this.Browser == 'Chrome';
            this.IsSafari = this.Browser == 'Safari';
            this.IsFF = this.Browser == 'Firefox';

            this.CompatMode = window.document.compatMode;
            this.DTD = this.CompatMode == 'CSS1Compat';

            //   Определение мобильных устройств
            this.IsAndroid = this.find('android');
            this.IsIPad = this.find('ipad');
            this.IsIPhone = this.find('iphone');
            this.IsMacOsX = this.find('mac') && !this.IsIPad;
            this.IsTouchDevice = this.find('touch') || 'ontouchstart' in window || navigator.MaxTouchPionts > 0 || navigator.msMaxTouchPoints > 0;
            //   end
        },
        searchString: function (data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                    else if (data[i].subStringAlt != null &&
                        dataString.indexOf(data[i].subStringAlt) != -1) {
                        return data[i].identity;
                    }

                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        },
        find: function (needle) {
            return navigator.userAgent.toLowerCase().indexOf(needle) !== -1;
        },

        dataBrowser: [{ string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
		{ string: navigator.userAgent, subString: "OmniWeb", versionSearch: "OmniWeb/", identity: "OmniWeb" },
		{ string: navigator.vendor, subString: "Apple", identity: "Safari", versionSearch: "Version" },
		{ prop: window.opera, identity: "Opera", versionSearch: "Version" },
		{ string: navigator.vendor, subString: "iCab", identity: "iCab" },
		{ string: navigator.vendor, subString: "KDE", identity: "Konqueror" },
		{ string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
		{ string: navigator.vendor, subString: "Camino", identity: "Camino" },
		{		// for newer Netscapes (6+)
		    string: navigator.userAgent, subString: "Netscape", identity: "Netscape"
		},
		{ string: navigator.userAgent, subString: "MSIE", subStringAlt: "Trident", identity: "Explorer", versionSearch: "MSIE" },
		{ string: navigator.userAgent, subString: "Gecko", identity: "Mozilla", versionSearch: "rv" },
		{ 		// for older Netscapes (4-)
		    string: navigator.userAgent, subString: "Mozilla", identity: "Netscape", versionSearch: "Mozilla"
		}
        ],
        dataOS: [{ string: navigator.platform, subString: "Win", identity: "Windows" },
		{ string: navigator.platform, subString: "Mac", identity: "Mac" },
		{ string: navigator.userAgent, subString: "iPhone", identity: "iPhone/iPod" },
		{ string: navigator.platform, subString: "Linux", identity: "Linux" }]
    };

    browserDetector.Init();
    return browserDetector;
}

function SM_BrowserDetector_GetDocumentMetricElement(isScrollMetric) {
    var result = null;
    if (this.BrowserDetector.IsIE) {
        if (this.BrowserDetector.DTD && this.BrowserDetector.OS != 'Mac') {
            result = window.document.documentElement;
        }
        else
            result = window.document.body;
    }
    else if (this.BrowserDetector.IsChrome || this.BrowserDetector.IsSafari) {
        //проверил - для хрома значение скролла и клиентских размеров окна берется из разных объектов
        if (isScrollMetric)
            result = window.document.body;
        else
            result = window.document.documentElement;
    }
    else if (this.BrowserDetector.IsFF) {
        //была ошибка: использование body вместо documentElement (проверил).
        result = window.document.documentElement;
    }

    return result;
}

function SM_BrowserDetector_GetScrollLeft() {
    var result = 0;
    var docMetricElement = this.GetDocumentMetricElement(true);
    if (docMetricElement != null)
        result = docMetricElement.scrollLeft;
    return result;
}

function SM_BrowserDetector_GetScrollTop() {
    var result = 0;
    var docMetricElement = this.GetDocumentMetricElement(true);
    if (docMetricElement != null)
        result = docMetricElement.scrollTop;
    return result;
}

function SM_BrowserDetector_GetClientHeight() {
    var result = 0;
    var docMetricElement = this.GetDocumentMetricElement();
    if (docMetricElement != null)
        result = docMetricElement.clientHeight;
    return result;
}

function SM_BrowserDetector_GetClientWidth() {
    var result = 0;
    var docMetricElement = this.GetDocumentMetricElement();
    if (docMetricElement != null)
        result = docMetricElement.clientWidth;
    return result;
}

function SM_ClearLog() {
    if (this.LogContainer != null)
        this.LogContainer.innerHTML = '';
}

function SM_WriteLog(message) {
    if (!this.IsNE(message)) {
        var isContainerCreation = false;
        var scrollTop = this.GetScrollTop();
        var scrollLeft = this.GetScrollLeft();
        if (this.LogContainer == null) {
            isContainerCreation = true;
            this.LogContainer = window.document.createElement('div');
            this.LogContainer.style.position = 'absolute';
            this.LogContainer.style.fontFamily = 'Tahoma';
            this.LogContainer.style.fontSize = '12px';
            this.LogContainer.style.color = '#000000';
            this.LogContainer.style.zIndex = 10000;
        }
        if (this.LogScrollTop != scrollTop) {
            this.LogContainer.style.top = scrollTop + 'px';
            this.LogScrollTop = scrollTop;
        }
        if (this.LogScrollLeft != scrollLeft) {
            this.LogContainer.style.left = scrollLeft + 'px';
            this.LogScrollLeft = scrollLeft;
        }

        var logNumber = this.LogNumber == null ? 1 : this.LogNumber;
        message = '[' + logNumber + ']: ' + message;
        logNumber++;
        this.LogNumber = logNumber;
        var divLog = window.document.createElement('div');
        $(divLog).text(message);
        this.LogContainer.appendChild(divLog);

        if (isContainerCreation)
            window.document.body.appendChild(this.LogContainer);
    }
}



/*-------------- RequestQueryBuilder --------------*/

function SM_GetRequestQueryBuilder(options) {
    return new SM_RequestQueryBuilder(options);
}

function SM_RequestQueryBuilder(options) {
    var defaultOptions = {
        AutoEncode: true,
        AutoEscape: false
    }
    SM.ApplyOptions(this, defaultOptions, options);
    this.ParamsByIndex = new Array();
    this.ParamsByName = new Array();

    var thisObj = this;
    this.SetParam = function (paramName, paramValue) {
        if (!SM.IsNE(paramName)) {
            var paramEntry = thisObj.ParamsByName[paramName];
            if (paramEntry != null)
                paramEntry.ParamValue = paramValue;
            else {
                paramEntry = new SM_RequestQueryEntry();
                paramEntry.ParamName = paramName;
                paramEntry.ParamValue = paramValue;
                thisObj.ParamsByName[paramName] = paramEntry;
                thisObj.ParamsByIndex.push(paramEntry);
            }
        }
    }

    this.GetParam = function (paramName) {
        var paramValue = null;
        if (!SM.IsNE(paramName)) {
            var paramEntry = thisObj.ParamsByName[paramName];
            if (paramEntry != null)
                paramValue = paramEntry.ParamValue;
        }
        return paramValue;
    }

    this.GetQueryString = function () {
        var i, len = thisObj.ParamsByIndex.length;
        var queryString = '';
        for (i = 0; i < len; i++) {
            var paramEntry = thisObj.ParamsByIndex[i];
            if (queryString.length > 0)
                queryString = queryString.concat('&');
            var paramValue = '';
            if (paramEntry.ParamValue != null)
                paramValue = paramEntry.ParamValue.toString();
            if (this.AutoEscape)
                paramValue = escape(paramValue);
            else if (this.AutoEncode)
                paramValue = encodeURIComponent(paramValue);
            queryString = queryString.concat(paramEntry.ParamName, '=', paramValue);
        }
        return queryString;
    }

    this.Init = function (url) {
        var splitedUrl = url.split('?');
        thisObj.InitUrl = url;
        if (splitedUrl[1] != null) {
            var stParams = splitedUrl[1];
            var arParams = stParams.split('&');
            var i, len = arParams.length;
            for (i = 0; i < len; i++) {
                var paramPair = arParams[i].split('=');
                if (paramPair.length == 2)
                    thisObj.SetParam(paramPair[0], paramPair[1]);
            }
        }
    }

    this.GetUrl = function (url) {
        if (SM.IsNE(url))
            url = thisObj.InitUrl;
        if (SM.IsNE(url))
            throw new Error('Не передан или не инициализирован параметр url.');

        var resultUrl = url.split('?')[0];
        var queryString = thisObj.GetQueryString();
        if (!SM.IsNE(queryString))
            resultUrl += '?' + queryString;
        return resultUrl;
    }
}

function SM_RequestQueryEntry() {
    this.ParamName = null;
    this.ParamValue = null;
}



/**********RequestBuilder************/

//создаёт построитель http-запросов.
function SM_CreateRequestBuilder(options) {
    return new SM_RequestBuilder(options);
}

//содержит методы формирования строки http-запроса.
function SM_RequestBuilder(options) {

    //устанавливаем параметры построителя.
    SM.ApplyOptions(this, {

        //при установленном true, параметры запроса автоматически кодируются функцией encodeURIComponent.
        EncodeParams: true,

        //при установленном значении true, параметры запроса с пустым значением/null/undefined добавляются в строку запроса со значением в виде пустой строки.
        IncludeEmptyParams: false,

        //строка, содержащая параметры по умолчанию, устанавливаемые в построитель запроса. В качестве значения можно указать Url страницы, 
        //параметры котоой будут использованы в качестве параметров по умолчанию, а также можно указать непосредственно строку, содержащую параметры по умолчанию
        //в формате param1=value1&param2=value2...
        DefaultParams: null,

        //при установленном значении true, добавляет параметр rnd=Math.random() к строке запроса.
        IncludeRandomParam: true,

        //при установленном значении true, запрещает устанавливать пераметры и отправлять запросы.
        ReadOnly: false,

        //набор параметров текущей страницы, устанавливаемых в построитель запроса.
        IncludedCurrentParams: null

    }, options);

    //создаем коллекции параметров.
    //коллекция параметров по имени параметра.
    this.ParamsByName = {};
    //коллекция параметров, передаваемых непосредственно в строке запроса.
    this.UrlParamsByIndex = [];
    //коллекция параметров, передаваемых в теле запрос методом POST.
    this.PostParamsByIndex = [];

    //инициализируем метода объекта.
    this.SetParam = RQB_SetParam;
    this.GetParam = RQB_GetParam;
    this.ContainsParam = RQB_ContainsParam;
    this.GetQueryString = RQB_GetQueryString;
    this.SendRequest = RQB_SendRequest;
    this.AppendParamEntry = RQB_AppendParamEntry;

    //если передан не пустой initUrl, инициализируем построитель запросов его параметрами.
    if (!SM.IsNE(this.DefaultParams)) {
        this.DefaultParamsLoading = true;
        RQB_InitDefaultParams.call(this, this.DefaultParams);
        this.DefaultParamsLoading = false;
    }
}

//иницилизирует построитель запроса адресом, содержащим параметры.
function RQB_InitDefaultParams(defaultParams) {
    if (SM.IsNE(defaultParams))
        throw new Error('Не паредан параметр defaultParams.');

    var queryPart = null;
    //если строка является адресом, то получаем параметры из запросной части адреса.
    if (defaultParams.toLowerCase().indexOf('http') == 0) {
        var splQueyPart = defaultParams.split('?');
        if (splQueyPart.length > 1) {
            queryPart = splQueyPart[1];
        }
    }
    else
        queryPart = defaultParams;

    //если в строке url присутствуют параметры запроса, тогда формируем параметры построителя.
    if (!SM.IsNE(queryPart)) {
        var splParams = queryPart.split('&');
        var i, len = splParams.length;
        for (i = 0; i < len; i++) {
            var splParam = splParams[i];
            if (SM.IsNE(splParam))
                continue;
            var splParamValue = splParam.split('=');
            if (splParamValue.length > 0) {
                var paramName = splParamValue[0];
                //если название параметра не задано, пропускаем его обработку.
                if (SM.IsNE(paramName))
                    continue;

                var paramValue = '';
                if (splParamValue.length > 1)
                    paramValue = splParamValue[1];

                //устанавливаем значение параметра в построитель.
                this.SetParam(paramName, paramValue);
            }
        }
    }
}

//устанавливает значение параметра.
function RQB_SetParam(paramName, paramValue, isPostParam) {
    //валидируем значения параметров метода.
    if (SM.IsNE(paramName))
        throw new Error('Не передан параметр paramName.');

    if (this.ReadOnly && !this.DefaultParamsLoading)
        throw new Error('Изменение параметров построителя запросов доступного только для чтения запрещено.');

    isPostParam = isPostParam == true;
    if (paramValue == null)
        paramValue = '';

    //получаем параметр названию.
    var paramNameLow = paramName.toLowerCase();
    //игнорируем установку параметра rnd.
    if (this.IncludeRandomParam && paramNameLow == 'rnd')
        return;

    var paramEntry = this.ParamsByName[paramNameLow];
    //если параметр отсутствует, создаём его.
    if (paramEntry == null) {
        paramEntry = {
            Name: paramName,
            Value: paramValue,
            IsPost: isPostParam
        };
        //добавляем параметр в коллекции построителя.
        if (!isPostParam)
            this.UrlParamsByIndex.push(paramEntry);
        else
            this.PostParamsByIndex.push(paramEntry);
        this.ParamsByName[paramNameLow] = paramEntry;
    }
        //устанавливаем новое значение параметра.
    else {
        if (paramEntry.IsPost != isPostParam)
            throw new Error('Признак отправки параметра методом POST не может быть изменён.');
        paramEntry.Value = paramValue;
    }
}

//возвращает значение параметра, установленного в построитель запроса.
function RQB_GetParam(paramName) {
    if (SM.IsNE(paramName))
        throw new Error('Не передан параметр paramName.');

    //получаем параметр названию.
    var paramNameLow = paramName.toLowerCase();
    var paramEntry = this.ParamsByName[paramNameLow];
    if (paramEntry != null && paramEntry.Value != null)
        return decodeURIComponent(paramEntry.Value);
    return null;
}

//возвращает true, если построитель запроса содержит параметр с заданным названием.
function RQB_ContainsParam(paramName) {
    if (SM.IsNE(paramName))
        throw new Error('Не передан параметр paramName.');

    //получаем параметр названию.
    var paramNameLow = paramName.toLowerCase();
    var paramEntry = this.ParamsByName[paramNameLow];

    var result = paramEntry != null;
    return result;
}

//формируем строку запроса.
function RQB_GetQueryString(includeUrlParams, includePostParams) {
    if (includeUrlParams == null)
        includeUrlParams = true;
    if (includePostParams == null)
        includePostParams = true;

    if (!includeUrlParams && !includePostParams)
        throw new Error('Хотя бы один из параметров includeUrlParams или includePostParams должен быть установлен в true.');

    var urlParams = '';
    //обрабтываем параметры строки запроса.
    if (includeUrlParams) {
        var i, len = this.UrlParamsByIndex.length;
        for (i = 0; i < len; i++) {
            //получаем параметр.
            var paramEntry = this.UrlParamsByIndex[i];

            //игнорируем пустой параметр.
            //проверку на пустоту осуществляем при помощи SM.IsNE, поскольку выражение (0 == '') возвращает true.
            if (!this.IncludeEmptyParams && SM.IsNE(paramEntry.Value))
                continue;

            //формируем значение параметра в запросе.
            var paramValue = this.EncodeParams ? encodeURIComponent(paramEntry.Value) : paramEntry.Value;
            var paramTextEntry = paramEntry.Name + '=' + paramValue;
            urlParams = this.AppendParamEntry(urlParams, paramTextEntry);
        }

        //добавляем дополнительные параметры с текущей страницы.
        if (this.IncludedCurrentParams != null && this.IncludedCurrentParams.length > 0) {
            var currentParamsBuilder = SM.GetCurrentParamsBuilder();
            var k, klen = this.IncludedCurrentParams.length;
            for (k = 0; k < klen; k++) {
                var includedCurrentParamName = this.IncludedCurrentParams[k];
                if (SM.IsNE(includedCurrentParamName))
                    continue;

                //пропускаем рандомный параметр.
                if (this.IncludeRandomParam && includedCurrentParamName.toLowerCase() == 'rnd')
                    continue;

                //перенаправляем дополнительный параметр, полученный их параметров текущей страницы, если он явно не установлен в данном построителе запроса.
                if (!this.ContainsParam(includedCurrentParamName)) {
                    var includedCurrentParamValue = currentParamsBuilder.GetParam(includedCurrentParamName);
                    if (!SM.IsNE(includedCurrentParamValue)) {
                        var includedCurrentParamEffectiveValue = this.EncodeParams ? encodeURIComponent(includedCurrentParamValue) : includedCurrentParamValue;
                        urlParams = this.AppendParamEntry(urlParams, includedCurrentParamName + '=' +includedCurrentParamEffectiveValue);
                    }
                }
            }
        }

        //для GET-запроса, добавляем параметр rnd, сбрасывающий кэш.
        if (this.IncludeRandomParam)
            urlParams = this.AppendParamEntry(urlParams, 'rnd=' + Math.random());
    }

    var postParams = '';
    //обрабатываем параметры, передаваемые в теле запроса.
    if (includePostParams) {
        var i, len = this.PostParamsByIndex.length;
        for (i = 0; i < len; i++) {
            //получаем параметр.
            var paramEntry = this.PostParamsByIndex[i];

            //игнорируем пустой параметр.
            //проверку на пустоту осуществляем при помощи SM.IsNE, поскольку выражение (0 == '') возвращает true.
            if (!this.IncludeEmptyParams && SM.IsNE(paramEntry.Value))
                continue;

            //формируем значение параметра в запросе.
            var paramValue = this.EncodeParams ? encodeURIComponent(paramEntry.Value) : paramEntry.Value;
            var paramTextEntry = paramEntry.Name + '=' + paramValue;
            postParams = this.AppendParamEntry(postParams, paramTextEntry);
        }
    }

    //возвращаем сформированную строку запроса.
    if (includeUrlParams && includePostParams) {
        var queryString = this.AppendParamEntry(urlParams, postParams);
        return queryString;
    }
    else if (includeUrlParams)
        return urlParams;
    else if (includePostParams)
        return postParams;
}

//добавляет пару название/значение параметра к строке запроса.
function RQB_AppendParamEntry(paramsBuilder, paramTextEntry) {
    if (paramsBuilder == null)
        throw new Error('Не передан параметр paramsBuilder.');
    if (SM.IsNE(paramTextEntry))
        return paramsBuilder;

    if (paramsBuilder.length > 0)
        paramsBuilder += '&';
    paramsBuilder += paramTextEntry;
    return paramsBuilder;
}

//посылвает синхронный или асинхронный аякс-запрос и вызывает callBack для асинхронного запроса.
function RQB_SendRequest(url, callBack, callInstance, args) {
    if (SM.IsNE(url))
        throw new Error('Не передан параметр url.');

    if (url.indexOf('?') != -1)
        throw new Error('Адрес запроса url не должен содержать GET-параметров.');

    if (this.ReadOnly)
        throw new Error('Отправка запросов при помощи построителя запросов доступного только для чтения запрещено.');

    //если передан callBack, значит вызов является асинхронным.
    var isAsync = callBack != null;

    //создаём запрос.
    var xmlRequest = SM.GetXmlRequest();

    //получаем параметры GET
    var urlParams = this.GetQueryString(true, false);

    //формируем URL запроса.
    if (!SM.IsNE(urlParams))
        url += '?' + urlParams;

    //получаем признак отправки запроса методом POST.
    var isPostQuery = this.PostParamsByIndex.length > 0;

    //получаем параметры
    var postParams = null;
    if (isPostQuery)
        postParams = this.GetQueryString(false, true);

    //создаём запрос
    if (!isPostQuery)
        xmlRequest.open('GET', url, isAsync);
    else {
        xmlRequest.open('POST', url, isAsync);
        xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }

    //посылаем синхронный или асинхронный запрос.
    if (isAsync) {
        var callBackLocal = callBack;
        var callInstanceLocal = callInstance;
        var argsLocal = args;

        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                var responseText = xmlRequest.responseText;
                xmlRequest.onreadystatechange = new Function();

                //вызываем обработчик ответа на запрос.
                if (callInstanceLocal != null)
                    callBackLocal.call(callInstanceLocal, responseText, argsLocal);
                else
                    callBackLocal(responseText, argsLocal);
            }
        };

        //отправляем асинхронный запрос.
        xmlRequest.send(postParams);
    }
    else {
        //отправляем синхронный запрос.
        xmlRequest.send(postParams);
        var responseText = xmlRequest.responseText;

        //возвращаем результат запроса.
        return responseText;
    }
}

function SM_GetCurrentParamsBuilder() {
    if (!this.__init_CurrentParamsBuilder) {
        this._CurrentParamsBuilder = this.CreateRequestBuilder({
            DefaultParams: location.href,
            ReadOnly: true,
            EncodeParams: false
        });

        this.__init_CurrentParamsBuilder = true;
    }
    return this._CurrentParamsBuilder;
}



/*********************   XML   *********************/

if (!window.crossFunctionsOverridden) {
    //debugger
    window.crossFunctionsOverridden = true;

    if (document.implementation.hasFeature("XPath", "3.0")) {
        // prototying the XMLDocument 
        XMLDocument.prototype.selectNodes = function (cXPathString, xNode) {
            if (!xNode) { xNode = this; }
            var oNSResolver = this.createNSResolver(this.documentElement)
            var aItems = this.evaluate(cXPathString, xNode, oNSResolver,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
            var aResult = [];
            for (var i = 0; i < aItems.snapshotLength; i++) {
                aResult[i] = aItems.snapshotItem(i);
            }
            return aResult;
        }

        // prototying the Element 
        Element.prototype.selectNodes = function (cXPathString) {
            if (this.ownerDocument.selectNodes) {
                return this.ownerDocument.selectNodes(cXPathString, this);
            }
            else {
                throw "For XML Elements Only";
            }
        }


        // prototying the XMLDocument 
        XMLDocument.prototype.selectSingleNode = function (cXPathString, xNode) {
            if (!xNode) { xNode = this; }
            var xItems = this.selectNodes(cXPathString, xNode);
            if (xItems.length > 0) {
                return xItems[0];
            }
            else {
                return null;
            }
        }


        // prototying the Element 
        Element.prototype.selectSingleNode = function (cXPathString) {
            if (this.ownerDocument.selectSingleNode) {
                return this.ownerDocument.selectSingleNode(cXPathString, this);
            }
            else {
                throw "For XML Elements Only";
            }
        }

        Element.prototype.swapNode = function (node) {
            var nextSibling = this.nextSibling;
            if (nextSibling == node)
                nextSibling = node.previousSibling;
            var parentNode = this.parentNode;
            node.parentNode.replaceChild(this, node);
            parentNode.insertBefore(node, nextSibling);
        }

        Element.prototype.fireEvent = function (eventName) {
            var e = document.createEvent('HTMLEvents');
            eventName = eventName.substr(2);
            e.initEvent(eventName, false, false);
            this.dispatchEvent(e);
        }
    }
}
//debugger

function SM_CreateXMLDocument() {
    var xmlDoc = null;

    if (SM.IsIE) {
        SM.CheckActiveXObject();
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    }
    else if (document.implementation && document.implementation.createDocument) {
        xmlDoc = document.implementation.createDocument('', '', null);
    }
    else {
        throw new Error('Your browser cannot to create XML Document.');
        return;
    }
    return xmlDoc;
}

function SM_CheckActiveXObject() {
    if (SM.IsIE && SM.IEVersion < 11 && window.ActiveXObject == null)
        throw new Error('Не удалось получить конструктор ActiveXObject в браузере Internet Explorer.');
}

function SM_LoadXML(xmlString) {
    if (SM.IsIE) {

        SM.CheckActiveXObject();
        var axoDoc = new ActiveXObject('Microsoft.XMLDOM');
        axoDoc.loadXML(xmlString);
        var xDoc = axoDoc;
        return xDoc;
    }
    else if (typeof (DOMParser) != 'undefined') {
        var parser = new DOMParser();
        var xDoc = parser.parseFromString(xmlString, "text/xml");
        return xDoc;
    }
    else
        throw new Error('Your browser cannot parse XML string.');
}

function SM_PersistXML(xmlElement) {
    var xml = null;
    if (SM.IsIE) {
        xml = xmlElement.xml;
    }
    else {
        var serializer = new XMLSerializer();
        xml = serializer.serializeToString(xmlElement);
    }
    return xml;
}

function SM_DisableSelection(elem) {
    if (elem == null)
        throw Error('elem is null');

    elem.onselectstart = function () {
        return false;
    }
    if (typeof elem.style.MozUserSelect != "undefined") {
        elem.style.MozUserSelect = "none";
    }
}

var _sm_first_reset_form_layout = true;
function SM_ResetFormLayout() {
    var tblLeft = window.document.getElementById('left_fields');
    var tblRight = window.document.getElementById('right_fields');

    if (tblLeft != null && tblRight != null) {
        var leftTR = window.document.getElementById('left_additional_row');
        var rightTR = window.document.getElementById('right_additional_row');
        if (rightTR != null)
            rightTR.style.height = '0px';
        if (leftTR != null)
            leftTR.style.height = '0px';

        var leftH = tblLeft.offsetHeight;
        var rightH = tblRight.offsetHeight;

        var dy = 0;
        var tr = null;
        if (leftH > rightH)
            dy = leftH - rightH;

        else
            dy = rightH - leftH;

        if (dy > 0) {
            var trAdded = false;
            if (leftH > rightH) {
                if (rightTR == null) {
                    tr = tblRight.insertRow(tblRight.rows.length);
                    tr.id = 'right_additional_row';
                    trAdded = true;
                }
                else
                    tr = rightTR;
            }
            else {
                if (leftTR == null) {
                    tr = tblLeft.insertRow(tblLeft.rows.length);
                    tr.id = 'left_additional_row';
                    trAdded = true;
                }
                else
                    tr = leftTR;
            }

            if (_sm_first_reset_form_layout) {
                _sm_first_reset_form_layout = false;
            }
            else
                ++dy;

            tr.style.height = dy + 'px';
            if (trAdded) {
                var ltd = tr.insertCell(tr.cells.length);
                var rtd = tr.insertCell(tr.cells.length);
                ltd.className = 'dbf_listform_title_empty';
                rtd.className = 'dbf_listform_control_empty';

                ltd.innerHTML = '&nbsp;';
                rtd.innerHTML = '&nbsp;';
            }
        }
    }
}



//#region Ajax

function SM_GetXmlRequest() {
    var xmlRequest = null;
    if (window.XMLHttpRequest != null)
        xmlRequest = new XMLHttpRequest();
    else
        xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");

    return xmlRequest;
}

function SM_InvokeScripts(responseContainer) {
    var scriptBlocks = responseContainer.getElementsByTagName('script');
    var len = scriptBlocks.length;
    for (var i = 0; i < len; i++) {
        eval(scriptBlocks[i].text);
    }
}

//#endregion


//#region CloneObject

function SM_CloneObject(sourceObject, arrayObject) {
    var cloneObject = new Object();

    var t = typeof (sourceObject);
    if (t != "object" || sourceObject === null) {
        // simple data type
        if (t == "string")
            cloneObject = sourceObject;
        return cloneObject;
    }
    else {
        // recurse array or object 
        var n, v, json = [], arr = (sourceObject && sourceObject.constructor == Array);
        for (n in sourceObject) {
            v = sourceObject[n];
            t = typeof (v);
            if (t == "string" || t == 'number' || t == 'boolean')
                cloneObject[n] = v;
            else if (t == "object" && v !== null) {
                if (!arrayObject && (v.length == null || v.length == 0))
                    continue;
                if (!SM.IsNE(v.tagName))
                    continue;

                cloneObject[n] = this.CloneObject(v, true);
            }
        }
        return cloneObject;
    }
}

//#endregion


//#region JSON.stringify

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z' : null;
        };
        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }

                if (value.NonSerialized)
                    return 'null';

                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
    }
    window.SM.Stringify = JSON.stringify;

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({ '': j }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
    /*if (!Object.prototype.toJSONString) {
    Object.prototype.toJSONString = function(filter) {
    return JSON.stringify(this, filter);
    };
    Object.prototype.parseJSON = function(filter) {
    return JSON.parse(this, filter);
    };
    }*/
}());

//#endregion


//#region Event Model

function SM_ApplyEventModelInternal(obj) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    SM_ApplyEventModel.call(obj);
}

function SM_ApplyEventModel() {
    if (this._EventModelApplied)
        return;

    //добавление события
    this.AttachEvent = SM_AttachEvent;

    //вызов обработчиков
    this.FireEvent = SM_FireEvent;

    this._EventModelApplied = true;
}

function SM_AttachEventInternal(obj, eventName, delegate, callInstance) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    SM_AttachEvent.call(obj, eventName, delegate, callInstance);
}

function SM_AttachEvent(eventName, delegate, callInstance) {
    if (SM.IsNE(eventName))
        throw Error('eventName is null');

    if (delegate == null)
        throw Error('delegate is null');

    //проверяем наличие контэйнера для коллекций обработчиков всех событий
    if (this._EventHandlers == null)
        this._EventHandlers = [];

    var handlers = this._EventHandlers[eventName];
    //если обработчиков на это событие нет
    if (handlers == null) {
        //создаем их
        handlers = [];
        this._EventHandlers[eventName] = handlers;
    }
    //добавляем текущий переданный обработчик
    if (callInstance == null)
        handlers.push(delegate);
    else {
        handlers.push({
            Handler: delegate,
            CallInstance: callInstance
        });
    }
}

function SM_FireEventInternal(obj, eventName, args, instanceCall) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    SM_FireEvent.call(obj, eventName, args, instanceCall);
}

function SM_FireEvent(eventName, args, instanceCall) {
    if (SM.IsNE(eventName))
        throw Error('eventName is null');

    //проверяем наличие контэйнера для коллекций обработчиков всех событий
    if (this._EventHandlers == null)
        this._EventHandlers = [];

    //устанавливаем в качестве аргументов сам объект, если аргументы не заданы, и вызов обработчика
    //производится не относительно объекта.
    if (args == null && !instanceCall)
        args = this;

    //получаем коллекцию обработчиков
    var handlers = this._EventHandlers[eventName];
    if (handlers != null) {
        var i, len = handlers.length;
        //вызываем обработчики
        for (i = 0; i < len; i++) {
            var handler = handlers[i];

            if (handler != null) {

                var callInstance = handler.CallInstance;
                if (callInstance == null) {
                    if (instanceCall)
                        callInstance = this;
                }
                else {
                    //если attachEvent был сделан с двумя параметрами: Handler и callBack, 
                    //то выполняем вызов заданного handler.
                    handler = handler.Handler;
                }

                if (callInstance != null)
                    SM_CallScript(handler, callInstance, args);
                else
                    handler(this, args);
            }
        }
    }
}

//#endregion


//#region Dom Handlers

//добавляет обработчик DOM-события к DOM-элементу.
function SM_AttachDomEvent(element, eventName, handler, useCapture) {
    if (element == null)
        throw new Error('Не передан параметр element.');

    if (SM.IsNE(eventName))
        throw new Error('Не передан параметр eventName.');

    if (handler == null)
        throw new Error('Не передан параметр handler.');

    if (element.addEventListener) {
        if (eventName.indexOf('on') == 0)
            eventName = eventName.substr(2);
        useCapture = useCapture == true;
        element.addEventListener(eventName, handler, useCapture);
    }
    else if (element.attachEvent) {
        if (eventName.indexOf('on') != 0)
            eventName = 'on' + eventName;
        element.attachEvent(eventName, handler);
    }
    else
        throw new Error('Не удалось определить способ прикрепления события.');
}

//#endregion

//#region SM_IsOverElement

//проверяет нахождение мышки над элементом.
function SM_IsOverElement(mouseX, mouseY, element, topOffset, rightOffset, bottomOffset, leftOffset) {
    if (mouseX == null)
        throw new Error('Не передан параметр mouseX.');
    if (mouseY == null)
        throw new Error('Не передан параметр mouseY.');
    if (element == null)
        throw new Error('Не передан параметр element.');

    var elementRect = element.getBoundingClientRect();

    //записываю данные о координатах в переменные, т.к. объект rect - защищен от записи
    //и прямо в нем значения поменять нельзя.

    var top = elementRect.top;
    //расширяем вверх верхнюю границу попадания мышки.
    if (topOffset != null)
        top -= topOffset;

    var right = elementRect.right;
    //расширяем вправо правую границу попадания мышки.
    if (rightOffset != null)
        right += rightOffset;

    var bottom = elementRect.bottom;
    //расширяем вниз нижнюю границу попадания мышки.
    if (bottomOffset != null)
        bottom += bottomOffset;

    var left = elementRect.left;
    //расширяем влево левую границу попадания мышки.
    if (leftOffset != null)
        left -= leftOffset;

    var isOverElement =
        mouseX >= left &&
        mouseX <= right &&
        mouseY >= top &&
        mouseY <= bottom;

    return isOverElement;
}

//#endregion


function SM_CallAsync(url, callBackParam, callInstanceParam, argsParam) {
    if (window.RL == null || RL_CallAsync == null)
        throw Error('На сервере не зарегистрировано ни одного асинхронного ресурса');

    RL_CallAsync.call(window.RL, url, callBackParam, callInstanceParam, argsParam);
}


//#region SerializeJson

function SM_SerializeJson(obj, dataMembers) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');

    //получаем объект-сериализуемую копию объекта obj.
    var dataContract = SM_CreateDataContract(obj, false, dataMembers);
    if (dataContract == null)
        throw new Error('Не удалось получить dataContract.');

    //сериализуем его.
    var objJson = JSON.stringify(dataContract);
    return objJson;
}

//проверяет, является ли объект obj массивом.
function SM_IsArray(obj) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    var typeValue = Object.prototype.toString.call(obj);

    var isArray = typeValue != null &&
        typeValue.toLowerCase() == '[object Array]'.toLowerCase();
    return isArray;
}

//проверяет, является ли объект obj объектом.
function SM_IsObject(obj) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    var typeValue = Object.prototype.toString.call(obj);

    var isObject = typeValue != null &&
        typeValue.toLowerCase() == '[object Object]'.toLowerCase()
    return isObject;
}

//проверяет, является ли объект obj строкой.
function SM_IsString(obj) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');
    var isString = false;

    //алгоритми определения является ли переданный объект строкой, 
    //реализован исходя из следующих условий:
    /*
    typeof('asdf') == 'string'
    typeof(new String('asdf')) == 'object'
    Object.prototype.toString.call('asdf') == '[object String]'
    Object.prototype.toString.call(new String('asdf')) == '[object String]'
    */

    if (typeof (obj) == 'string') {
        //провяряем тип простым способом
        isString = true;
    }
    else {
        //проверяем тип более сложным способом (соответственно, менее производительным)
        var typeValue = Object.prototype.toString.call(obj);

        isString = typeValue != null &&
            typeValue.toLowerCase() == '[object String]'.toLowerCase();
    }
    return isString;
}

//Возвращает сериализуемый объект, со всеми вложенными в него объектами, 
//наполненный свойствами, перечисленными в свойстве-массиве строк DataMembers каждого из объектов.
function SM_CreateDataContract(obj, extractSimpleValue, dataMembersParam) {
    if (obj == null)
        throw new Error('Не передан параметр obj.');

    var dataContract = null;
    //проверяем, является параметр obj объектом или массивом.
    var isObject = SM_IsObject(obj);
    var isArray = SM_IsArray(obj);

    if (isObject) {
        //получаем св-во DataMembers (берем из параметра функции или из объекта.), в котором в виде массива строк 
        //должны быть перечислены св-ва данного объекта, попадающие в сериализуемый объект
        var dataMembers = dataMembersParam;
        if (dataMembers == null)
            dataMembers = obj.DataMembers;

        //если dataMembers - пустой - ругаемся
        if (dataMembers == null)
            throw new Error('Не задана колекция сериализуемых свойств объекта.');

        //если dataMember - не массив - ругаемся
        var isDataMembersArray = SM_IsArray(dataMembers);
        if (!isDataMembersArray)
            throw new Error('Свойство DataMembers сериализуемого объекта должно быть массивом строк.');

        //если коллекция DataMembers - корректная - создаем сериализуемую копию объекта obj
        //и наполняем ее свойствами из коллекции DataMembers.
        dataContract = {};

        var i, len = dataMembers.length;
        for (i = 0; i < len; i++) {
            var dataMemberName = dataMembers[i];
            if (SM.IsNE(dataMemberName))
                throw new Error('Название сериализуемого свойства не может быть пустым.');
            var isDataMemberNameString = SM_IsString(dataMemberName);
            if (!isDataMemberNameString)
                throw new Error('Название сериализуемого свойства должно быть типа string.');

            //получаем значение свойста по имени.
            var propertyValue = obj[dataMemberName];

            //устанавливаем св-во только если оно явно задано, например
            //obj.MyProp = 'some text' - устанавливаем
            //obj.MyProp = null - устанавливаем
            //obj.MyProp = undefined - НЕ устанавливаем (т.е. свойство MyProp отсутствует в объекте)
            if (propertyValue !== undefined) {

                //проверяем если св-во является объектом или массивом, то применяем для него рекурсию.
                var dataMemberValue = null;
                if (propertyValue !== null)
                    dataMemberValue = SM_CreateDataContract(propertyValue, true);
                dataContract[dataMemberName] = dataMemberValue;
            }
        }
    }
    else if (isArray) {
        //создаем сериализуемый массив
        dataContract = [];
        var j, jlen = obj.length;
        for (j = 0; j < jlen; j++) {
            //получаем вложенные в массив объекты.
            var childObj = obj[j];
            var childObjContract = null;
            //получаем из вложенных объектов сериализуемые объекты
            //и кладем их в сериализуемый массив.
            if (childObj != null)
                childObjContract = SM_CreateDataContract(childObj, true);
            dataContract.push(childObjContract);
        }
    }
    else {
        //в случае когда свойство является простым типа возвращаем его "как есть".
        if (extractSimpleValue === true)
            dataContract = obj;
        else
            throw new Error('Объект obj должен быть объектом или массивом. Объект obj является простым типом.');
    }
    return dataContract;
}

//#endregion


function SM_ArrayRemove(array, isRemovingItemPredicate) {
    if (array == null)
        throw new Error('Не передан параметр array.');
    return SM_ArrayRemoveInternal.call(array, isRemovingItemPredicate);
}

function SM_ArrayRemoveInternal(isRemovingItemPredicate) {
    //устанавливается в true, если хотябы один элемент массива был удален.
    var removed = false;
    if (isRemovingItemPredicate == null)
        throw new Error('Не передан параметр isRemovingItemPredicate.');

    //перебираем элементы массива и удаляем элементы, удовлетворяющие предикату isRemovingItemPredicate.
    var j = 0;
    while (j < this.length) {

        //определяем, является ли элемент массива подлежащим удалению.
        var isRemovingItem = false;
        if (isRemovingItemPredicate(this[j]))
            isRemovingItem = true;

        //если элемент подлежит удалению - удаляем его.
        if (isRemovingItem) {
            this.splice(j, 1);
            removed = true;
        }
        else
            j++;
    }
    return removed;
}


//#region Actions

//#region IndentXML

function SM_IndentXML(indentingXmlText, callBack, callInstance, callArgs) {
    if (SM.IsNE(indentingXmlText))
        throw new Error('Не передан параметр indentingXmlText.');

    var params = '&indentingXml=' + encodeURIComponent(indentingXmlText);
    var result = SM_PerformActon('IndentXml', params, callBack, callInstance, callArgs);
    return result;
}

//#endregion


//#region PerformActon

//выполняет действие ScriptManager, опеределенное в ScriptManager.ashx.
function SM_PerformActon(actionName, params, callBack, callInstance, callArgs) {
    if (SM.IsNE(actionName))
        throw new Error('Не передан параметр actionName.');

    var url = '/_layouts/WSS/DBF/UI/ScriptManager.ashx?rnd=' + Math.random();

    //добавляем стартовый амперсанд, если он отсутсвует, для посылки методом POST.
    if (!SM.IsNE(params)) {
        if (params.charAt(0) != '&')
            params = '&' + params;
    }
    else
        params == '';

    //добавляем параметр названия операции к отправляемым параметрам операции
    params = 'action=' + actionName + params;

    //выполняем асинхронный запрос, если передан параметр callBack.
    var isAsync = callBack != null;

    //создаем аякс запрос для выполнения операции
    var xmlRequest = SM.GetXmlRequest();
    xmlRequest.open('POST', url, isAsync);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    //назначаем обработчик окончания асинхронного запроса
    if (isAsync) {
        //замыкаем переменные, чтобы не перезаписались другими операциями.
        var callBackLocal = callBack;
        var callInstanceLocal = callInstance;
        var callArgsLocal = callArgs;

        //обрабатываем асинхронный результат
        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                var responseText = xmlRequest.responseText;
                xmlRequest.onreadystatechange = new Function();

                //получаем результат операции
                var result = SM_GetActonResult(responseText);

                //вызываем обработчик результата.
                if (callInstanceLocal != null)
                    callBackLocal.call(callInstanceLocal, result, callArgsLocal);
                else
                    callBackLocal(result, callArgsLocal);
            }
        }
    }

    //посылаем аякс запрос.
    xmlRequest.send(params);

    //для синхронного запроса, сразу обрабатываем результат.
    if (!isAsync) {
        var responseText = xmlRequest.responseText;

        //получаем результат операции
        var result = SM_GetActonResult(responseText);

        //возвращаем результат синхронно.
        return result;
    }

    //возвращаем null для асинхронной операции.
    return null;
}

//возвращает объект результата операции, полученный с сервера.
function SM_GetActonResult(responseText) {
    if (SM.IsNE(responseText))
        throw new Error('Не передан параметр responseText.');

    var result = null;
    if (responseText.indexOf('UnhandledException') == 0) {

        //нелья формировать результат необработанной ошибки
        //т.к. этот результат не содердит всего интерфейса ошибки, из-за чего может отвалиться уже обработка самой ошибки
        //поэтому просто кидаем Exception
        throw new Error(responseText);
    }
    else {
        //парсим результат операции.
        result = JSON.parse(responseText);
    }

    //возвращаем результат операции
    return result;
}

//#endregion

//#endregion


//#region CheckDoPostBackExists

//проверяет наличие функции __doPostBack на странице, и в случае отсутствия этой функции,
//устанавливает функцию-заглушку в качестве __doPostBack, отображающую текст об ошибки отсутствия.
function SM_CheckDoPostBackExists() {
    //снимаем флаг, что функция __doPostBack является заглушкой.
    SM.IsDoPostBackDump = false;

    //при отсутствии __doPostBack устанавливаем заглушку.
    if (window.__doPostBack == null) {


        //устанавливаем флаг, что функция __doPostBack является заглушкой.
        SM.IsDoPostBackDump = true;
        SM.DoPostBackDumpError = 'Ошибка отправки формы на сервер: Отсутствует функция __doPostBack на странице.'
        + '\n\rВозможно ошибка вызвана некорректным определением веб-сервером версии Вашего браузера.'
        + '\n\rОбратитесь в службу поддержки.'

        window.__doPostBack = SM_DoPostBackDump;
    }
}

//заглушка функции для функциии __doPostBack, устанавливаемая в качестве функции __doPostBack при ее отсутствии.
function SM_DoPostBackDump(eventTarget, eventArgument) {
    if (SM.IsNE(SM.DoPostBackDumpError))
        throw new Error('Не задан текст ошибки отсутствия функции __doPostBack на странице.');

    //отображаем ошибку отправки формы.
    alert(SM.DoPostBackDumpError);

    //делаем генерацию ошибки, чтобы принудительно отменить отправку формы (не удалось проверить отменится отправка или нет).
    throw new Error(SM.DoPostBackDumpError);
}

//#endregion