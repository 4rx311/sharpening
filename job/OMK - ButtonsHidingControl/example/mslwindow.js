//debugger
function MSLLookupWindow() {
    if (window.MSLLookupWindows == null)
        window.MSLLookupWindows = new Array();
    window.MSLLookupWindows[this.ParentPopupLevel] = this;
    if (!this.IsNewWindowDesign)
        window.LookupWindow = this;

    this.XmlDocument = window.SM.LoadXML('<LookupWindow></LookupWindow>');
    this.XmlElement = this.XmlDocument.selectSingleNode('LookupWindow');

    //Properties
    var thisObj = this;

    this.__init_FieldWeb = false;
    this._FieldWeb = null;
    this.FieldWeb = function () {
        if (!thisObj.__init_FieldWeb) {
            if (window.Context().Site() != null)
                thisObj._FieldWeb = window.Context().Site().GetWebByID(thisObj.WebID);
            thisObj.__init_FieldWeb = true;
        }
        return thisObj._FieldWeb;
    }

    this.__init_FieldList = false;
    this._FieldList = null;
    this.FieldList = function () {
        if (!thisObj.__init_FieldList) {
            if (thisObj.FieldWeb() != null)
                thisObj._FieldList = thisObj.FieldWeb().GetListByID(thisObj.ListID);
            thisObj.__init_FieldList = true;
        }
        return thisObj._FieldList;
    }

    if (this.IsNewWindowDesign) {
        this.PopupWindow = window.GetPopupWindow(this.ParentPopupLevel);
        this.PopupWindow.LookupWindow = this;
    }

    //Methods
    this.GetElement = MSLLookupWindow_GetElement;
    this.InitFields = MSLLookupWindow_InitFields;
    this.InitFilters = MSLLookupWindow_InitFilters;
    this.GoSearch = MSLLookupWindow_GoSearch;
    this.GoSearchCompleted = MSLLookupWindow_GoSearchCompleted;
    this.SortGrid = MSLLookupWindow_SortGrid;
    this.OnOkClick = MSLLookupWindow_OnOkClick;
    this.OnCancelClick = MSLLookupWindow_OnCancelClick;
    this.OnSelectPageLoad = MSLLookupWindow_OnSelectPageLoad;
    this.OnGridPageLoad = MSLLookupWindow_OnGridPageLoad;

    this.OnCheckAll = MSLLookupWindow_OnCheckAll;
    this.OnResultRowClick = MSLLookupWindow_OnResultRowClick;
    this.OnResultRowDoubleClick = MSLLookupWindow_OnResultRowDoubleClick;
    this.CheckItem = MSLLookupWindow_CheckItem;
    this.TestCheckAllImage = MSLLookupWindow_TestCheckAllImage;
    this.TestResultButtons = MSLLookupWindow_TestResultButtons;
    this.SetSelectResult = MSLLookupWindow_SetSelectResult;
    this.DeleteResultRow = MSLLookupWindow_DeleteResultRow;
    //this.TestOkButton = MSLLookupWindow_TestOkButton;
    this.AddToResult = MSLLookupWindow_AddToResult;
    this.ClearResult = MSLLookupWindow_ClearResult;
    this.CreateLookupLink = MSLLookupWindow_CreateLookupLink;
    this.ResetResultAlternating = MSLLookupWindow_ResetResultAlternating;
    this.GetField = MSLLookupWindow_GetField;


    //Controls
    this.MainDiv = this.GetElement('divMain');
    this.FiltersScopeDiv = this.GetElement('divFiltersScope');
    this.FiltersTable = this.GetElement('tbFilters');
    this.GoSearchButton = this.GetElement('btnGoSearch');
    this.GridDiv = this.GetElement('divGrid');
    if (this.IsNewWindowDesign) {
        this.GridHeaderDiv = this.GetElement('divGridHeader');
        this.GridDiv.onscroll = function () {
            var scrollLeft = thisObj.GridDiv.scrollLeft;
            if (thisObj.GridHeaderTable.previousScrollLeft != scrollLeft)
                thisObj.GridHeaderTable.style.left = -scrollLeft + 'px';
        }
    }
    if (this.IsMultiple) {
        this.AddToResultDiv = this.GetElement('divAddToResult');
        this.AddToResultButton = this.GetElement('btnAddToResult');
        this.SelectResultDiv = this.GetElement('divSelectResult');
        if (!this.IsNewWindowDesign) {
            var selectResultGridID = this.SelectResultGridID;
            this.SelectResultTable = this.GetElement(selectResultGridID);
            this.SelectResultTable.IsLastRowAlternate = true;
            if (this.SelectResultTable != null) {
                if (this.SelectResultTable.rows.length > 0)
                    this.SelectResultRow = this.SelectResultTable.rows[0];
            }
        }
    }
    this.OkButton = this.GetElement('btnOk');
    this.CancelButton = this.GetElement('btnCancel');
    this.MSLField = null;
    if (window.GetMultiSourceField != null)
        this.MSLField = window.GetMultiSourceField(this.FieldName);

    //Xml
    var axoReturnItems = SM.LoadXML('<ReturnItems></ReturnItems>');
    this.ReturnItemsNode = axoReturnItems.selectSingleNode('ReturnItems');





    //Initialization
    this.InitFields();
    this.InitFilters();

    this.OnSelectPageLoad();
}

function GetMSLLookupWindow(parentPopupLevel) {
    var lookupWindow = null;
    if (window.MSLLookupWindows != null) {
        if (parentPopupLevel != null)
            parentPopupLevel = parseInt(parentPopupLevel.toString());
        if (parentPopupLevel == null)
            parentPopupLevel = 0;

        lookupWindow = window.MSLLookupWindows[parentPopupLevel];
    }
    return lookupWindow;
}

function MSLLookupWindow_GetElement(elementID) {
    if (IsNullOrEmpty(elementID))
        throw new Error('Не передан параметр elementID.');
    var element = null;
    if (this.IsNewWindowDesign)
        element = $(this.PopupWindow.ContentDiv).find('#' + elementID)[0];
    else
        element = window.document.getElementById(elementID);
    if (element == null)
        element = null;
    return element;
}

function MSLLookupWindow_InitFields() {
    this.FieldsByUniqueName = new Array();

    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        MSLLookupWindowField.call(field, this);
        if (!window.SM.IsNE(field.UniqueName))
            this.FieldsByUniqueName[field.UniqueName.toLowerCase()] = field;
    }
}

function MSLLookupWindow_GetField(uniqueName) {
    var field = null;
    if (!window.SM.IsNE(uniqueName))
        field = this.FieldsByUniqueName[uniqueName.toLowerCase()];
    return field;
}

function MSLLookupWindow_InitFilters() {

    var i, len = this.Fields.length;
    var filtersRow = null;
    var rowFiltersCount = 0;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        if (field.IsFilter) {

            //создаем строку для вставки фильтров, если она отсутвует.
            if (filtersRow == null)
                filtersRow = this.FiltersTable.insertRow(-1);

            field.CreateFilterControl(filtersRow);
            rowFiltersCount++;

            if (this.MaxRowFiltersCount > 0 && rowFiltersCount >= this.MaxRowFiltersCount) {
                //если накопилось макисмальное количество фильтров на одну строку, сбрасываем строку с фильтрами и накопленное количество.
                filtersRow = null;
                rowFiltersCount = 0;
            }
        }
    }
}

/////Handlers////

function MSLLookupWindow_GetFiltersQuery(searchOptions) {
    if (searchOptions == null)
        searchOptions = {};
    var stFiltersQuery = '';
    var i, len = this.Fields.length;
    var errors = '';
    var hasError = false;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        if (field.IsFilter && field.FilterControlCreated) {
            var filterValue = field.GetFilterValue();
            if (!SM.IsNE(filterValue) && filterValue.indexOf('errorMessage:') == 0) {
                hasError = true;
                if (!searchOptions.IsContextSearch) {

                    //формируем текст ошибки некорректных фильтров.
                    var errorMessage = filterValue.split('errorMessage:')[1];
                    if (!SM.IsNE(errorMessage)) {
                        if (errors.length > 0)
                            errors += '\r\n';
                        errors += errorMessage;
                    }
                }
                filterValue = ''
            }
            if (stFiltersQuery.length > 0)
                stFiltersQuery += '_sf_';
            stFiltersQuery += field.UniqueName + '_sv_' + filterValue;
        }
    }
    searchOptions.Errors = errors;
    searchOptions.HasError = hasError;
    return stFiltersQuery;
}

//debugger
function MSLLookupWindow_GoSearch(isInit, sortColumn, sortDirection, getMoreResults, isContextSearch) {
    var thisObj = this;
    var searchOptions = { IsContextSearch: isContextSearch };
    var stFiltersQuery = MSLLookupWindow_GetFiltersQuery.call(this, searchOptions);

    var url = this.WebUrl + this.ModulePath + '/MSLWindowGrid.aspx?rnd=' + Math.random();
    var params = '';
    params += 'fieldID=' + this.FieldID;
    params += '&listID=' + this.ListID;
    params += '&filters=' + encodeURIComponent(stFiltersQuery);

    if (window.ListForm != null && !IsNullOrEmpty(window.ListForm.ItemID))
        params += '&listFormItemID=' + window.ListForm.ItemID;

    //добавляем фильтрацию значений по умолчанию
    var defaultFilterValues = MSL_GetDefaultFilterValues.call(this.MSLField);
    if (!SM.IsNE(defaultFilterValues))
        params += '&defaultFilterValues=' + encodeURIComponent(defaultFilterValues);

    //получаем клиентские значения полей для их использования в SQL-фильтрации
    var clientValues = MSL_GetClientFilterValues.call(this.MSLField);
    if (!SM.IsNE(clientValues))
        params += '&clientValues=' + clientValues;

    if (this.IsNewWindowDesign)
        params += '&parentPopupLevel=' + this.ParentPopupLevel;

    //задаем параметры пэйджинга, если не задана сортировка, а также параметры сортировки при пэйджинге.
    if (SM.IsNE(sortColumn) && SM.IsNE(sortDirection) && this.SearchResultParams != null && getMoreResults) {
        params += '&currentTopCount=' + this.SearchResultParams.TopCount;
        sortColumn = this.SearchResultParams.SortFieldName;
        sortDirection = this.SearchResultParams.SortDirection;
    }

    //sorting
    if (!IsNullOrEmpty(sortColumn) && !IsNullOrEmpty(sortDirection)) {
        params += '&sortColumn=' + encodeURIComponent(sortColumn);
        params += '&sortDirection=' + sortDirection;
    }

    if (searchOptions.HasError)
        params += '&disableSearch=true';

    //отображаем текст ошибки с таймаутом, чтобы поиск уже успел произвестись.
    if (!SM.IsNE(searchOptions.Errors))
        window.setTimeout(function () { alert(searchOptions.Errors) }, 10);

    var xmlRequest = window.SM.GetXmlRequest();
    xmlRequest.open('POST', url, true);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var thisObj = this;
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            thisObj.GoSearchCompleted(responseText);
        }
    };
    xmlRequest.send(params);
}

//debugger
function MSLLookupWindow_GoSearchCompleted(responseText) {
    if (IsNullOrEmpty(responseText))
        throw new Error('Параметр responseText не может быть пустым.');

    var splResponse = responseText.split('_renderSplitter_');
    if (splResponse.length == 0)
        throw new Error('Отсутствует результат поиска докуметов.');

    //получаем параметры результата поиска.
    var searchParamsJson = splResponse[0];
    if (SM.IsNE(searchParamsJson))
        throw new Error('Отсутствуют параметры результат поиска докуметов.');
    var searchParams = JSON.parse(searchParamsJson);
    if (searchParams.Exception != null) {
        //отображаем ошибку.
        alert(searchParams.Exception.DisplayText);
        return;
    }
    if (splResponse.length != 3)
        throw new Error('Некорректный резултат поиска докуметов.');
    //устанавливаем ссылку на результат.
    this.SearchResultParams = searchParams;


    //получаем разметку грида
    var gridHtml = splResponse[1];
    if (gridHtml == null)
        throw new Error('Не удалось получить разметку отображаемых документов.');

    //получаем данные о загруженных документах.
    var resultXml = splResponse[2];
    if (SM.IsNE(resultXml))
        throw new Error('Не удалось получить данные xml загруженных документов.');

    if (searchParams.IsFirstPage) {
        //для первой страницы инициализируем грид и данные
        this.GridDiv.innerHTML = gridHtml;
        this.ResultDocument = SM.LoadXML(resultXml);

        //обнуляем панель пэджинга (она скрывается за счет операции this.GridDiv.innerHTML = ...)
        this.PagingHolder = null;
    }
    else {
        //для следуюущих страниц дополняем грид и данные.
        if (this.GridTable == null)
            throw new Error('Не задана таблица отображения документов.');
        if (this.ResultDocument == null)
            throw new Error('Не заданы данные xml, отображаемых документов.');
        var rootResultNode = this.ResultDocument.selectSingleNode('ArrayOfControlValue');
        if (rootResultNode == null)
            throw new Error('Не удалось получить коренвой элемент ArrayOfControlValue данных загруженных документов.');

        //скрываем панель пэйджинга, которая откроется при необходимости.
        if (this.PagingHolder != null)
            this.PagingHolder.style.display = 'none';

        //добавляем разметку подгруженных документов в грид.

        var pageGridBody = null;
        if (!SM.IsIE || SM.IEVersion >= 10) {
            var tableActivator = document.createElement('table');
            tableActivator.innerHTML = gridHtml;
            pageGridBody = tableActivator.firstChild;
        }
        else {
            //правим багу с невозможностью установить table.innerHTML в IE8, IE9
            gridHtml = '<table>' + gridHtml + '</table>';
            var divActivator = document.createElement('div');
            divActivator.innerHTML = gridHtml;
            pageGridBody = divActivator.firstChild.firstChild;
        }
        if (pageGridBody != null) {
            pageGridBody.parentNode.removeChild(pageGridBody);
            this.GridTable.appendChild(pageGridBody);
        }

        //добавляем данные xml подгруженных докуметов в общий xml.
        var pageDocument = SM.LoadXML(resultXml);
        var controlValues = pageDocument.selectNodes('ArrayOfControlValue/ControlValue');
        var i, len = controlValues.length;
        for (i = 0; i < len; i++) {
            var controlValue = controlValues[i];
            controlValue.parentNode.removeChild(controlValue);
            rootResultNode.appendChild(controlValue);
        }
    }
    //выполняем подсчет количества документов при необходимости,
    //вслед за которым может отобразится фраза внизу грида "Отображено X документов из XXX. Отобразить еще XX."
    if (searchParams.MoreResultsPossible)
        MSLLookupWindow_CalculateItemsCount.call(this);

    this.OnGridPageLoad();
}

function MSLLookupWindow_CalculateItemsCount() {
    var thisObj = this;
    var stFiltersQuery = MSLLookupWindow_GetFiltersQuery.call(this);

    if (this.SearchResultParams == null)
        throw new Error('Не заданы параметры результата поиска.');

    var url = this.WebUrl + this.ModulePath + '/MSLWindowService.ashx?rnd=' + Math.random();
    var params = '';
    params += 'operation=CalculateItemsCount';
    params += '&fieldID=' + this.FieldID;
    params += '&listID=' + this.ListID;
    params += '&filters=' + encodeURIComponent(stFiltersQuery);
    params += '&transactionID=' + this.SearchResultParams.TransactionID;

    var xmlRequest = window.SM.GetXmlRequest();
    xmlRequest.open('POST', url, true);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var thisObj = this;
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            MSLLookupWindow_CalculateItemsCountCompleted.call(thisObj, responseText);
        }
    };
    xmlRequest.send(params);
}

function MSLLookupWindow_CalculateItemsCountCompleted(responseText) {
    if (SM.IsNE(responseText))
        throw new Error('Параметр responseText не может быть пустым.');
    var result = JSON.parse(responseText);
    if (result.Exception != null) {
        alert(result.Exception.DisplayText);
        return;
    }
    if (this.SearchResultParams == null)
        throw new Error('Не заданы параметры результата поиска.');

    //если результат с количество пришел не для текущей транзакции поиска, то игнорируем этот результат
    if (result.TransactionID != this.SearchResultParams.TransactionID)
        return;

    //получаем количество документов
    var itemsCount = result.ItemsCount;
    this.SearchResultParams.ItemsCount = itemsCount;

    MSLLookupWindow_DisplayPaging.call(this);
}

function MSLLookupWindow_DisplayPaging() {
    if (this.SearchResultParams.ItemsCount == null)
        throw new Error('Не вычислено полное количество элементов, удовлетворяющих условиям фильтрации.');

    if (this.SearchResultParams.SummaryLoadedCount < this.SearchResultParams.ItemsCount) {
        //если отображается документов меньше чем полное количество 
        //или документов отображается столько же сколько полное количество, но не на первой странице, то отображаем панель пэйджинга.
        if (this.PagingHolder != null)
            this.PagingHolder.style.display = '';
        else {
            //создаем панель пэйджинга
            this.PagingHolder = document.createElement('div');
            this.PagingHolder.className = 'msl_divPaging';

            var divPagingOffset = document.createElement('div');
            this.PagingHolder.appendChild(divPagingOffset);
            divPagingOffset.className = 'msl_divPagingOffset';

            var divItemsCountHolder = document.createElement('div');
            divPagingOffset.appendChild(divItemsCountHolder);
            divItemsCountHolder.className = 'msl_divItemsCountHolder';

            //фраза "Отображено X из XXX"
            //текст "Отображено "
            var text0 = document.createTextNode('Отображено ');
            divItemsCountHolder.appendChild(text0);

            //сколько всего загружено в гриде
            var textSummaryLoadedCount = document.createElement('b');
            this.PagingHolder.SummaryLoadedCount = textSummaryLoadedCount;
            divItemsCountHolder.appendChild(textSummaryLoadedCount);

            //текст " из "
            var text1 = document.createTextNode(' из ');
            divItemsCountHolder.appendChild(text1);

            //полное количество документов
            var textItemsCount = document.createElement('b');
            this.PagingHolder.ItemsCount = textItemsCount;
            divItemsCountHolder.appendChild(textItemsCount);


            //ссылка подгрузки документов "Отобразить еще XX".
            var divPagingLink = document.createElement('div');
            divPagingOffset.appendChild(divPagingLink);
            divPagingLink.className = 'msl_divPagingLink';
            var moreDocsLink = document.createElement('a');
            divPagingLink.appendChild(moreDocsLink);
            moreDocsLink.className = 'msl_moreDocsLink';
            moreDocsLink.href = 'javascript:';
            //обработчик ссылки
            var thisObj = this;
            moreDocsLink.onclick = function () { MSLLookupWindow_GoSearch.call(thisObj, false, null, null, true); };
            var linkTitle = document.createTextNode('Отобразить еще ');
            moreDocsLink.appendChild(linkTitle);
            //текст с количеством возможных подгружаемых элементов
            var moreCount = document.createElement('span');
            moreDocsLink.appendChild(moreCount);
            this.PagingHolder.MoreCount = moreCount;
            this.PagingHolder.PagingLink = divPagingLink;

            //добавляем панель пэйджинга к гриду.
            this.GridDiv.appendChild(this.PagingHolder);
        }

        if (this.SearchResultParams.SummaryLoadedCount % 2 == 0)
            this.PagingHolder.className = 'msl_divPaging msl_divPaging_alternate';
        else
            this.PagingHolder.className = 'msl_divPaging';

        SM.SetInnerText(this.PagingHolder.SummaryLoadedCount, this.SearchResultParams.SummaryLoadedCount);
        SM.SetInnerText(this.PagingHolder.ItemsCount, this.SearchResultParams.ItemsCount);

        //расчитываем, сколько можно "Отобразить еще XX".
        if (this.SearchResultParams.SummaryLoadedCount < this.SearchResultParams.ItemsCount) {
            if (this.SearchResultParams.SummaryLoadedCount + this.PageSize > this.SearchResultParams.ItemsCount)
                this.SearchResultParams.MoreCount = this.SearchResultParams.ItemsCount - this.SearchResultParams.SummaryLoadedCount;
            else
                this.SearchResultParams.MoreCount = this.PageSize;
        }
        else
            this.SearchResultParams.MoreCount = 0;

        //отображаем ссылку "Отобразить еще XX".
        if (this.SearchResultParams.MoreCount > 0) {
            this.PagingHolder.PagingLink.style.display = '';
            SM.SetInnerText(this.PagingHolder.MoreCount, this.SearchResultParams.MoreCount);
        }
        else
            this.PagingHolder.PagingLink.style.display = 'none';
    }
}

function MSLLookupWindow_SortGrid(sortColumn, sortDirection) {
    this.GoSearch(false, sortColumn, sortDirection);
}

//debugger
function MSLLookupWindow_OnOkClick() {
    if (!this.CanClickOk) {
        if (this.IsNewWindowDesign)
            this.PopupWindow.Hide();
        return false;
    }
    if (this.MSLField != null) {
        var xml = null;
        if (this.IsMultiple) {
            this.AddToResult();
            xml = SM.PersistXML(this.ReturnItemsNode);
        }
        else if (this.ReturnItemNode != null)
            xml = SM.PersistXML(this.ReturnItemNode);

        if (!window.SM.IsNE(xml)) {
            this.MSLField.ReturnLookupResult(xml);

            if (!this.IsNewWindowDesign) {
                if (window.parent.CloseFloatWindow != null)
                    window.parent.CloseFloatWindow();
            }
            else {
                this.PopupWindow.Hide();
            }
        }
    }
}

function MSLLookupWindow_OnCancelClick() {
    if (!this.IsNewWindowDesign) {
        if (window.parent.CloseFloatWindow != null)
            window.parent.CloseFloatWindow();
    }
    else {
        this.PopupWindow.Hide();
    }
}

function MSLLookupWindow_OnSelectPageLoad() {
    var windowContainer = !this.IsNewWindowDesign ? window.frameElement : this.PopupWindow.ContentDiv;
    var contentDivWidth = windowContainer.offsetWidth;
    var contentDivHeight = windowContainer.offsetHeight;
    var mainDivWidth = this.MainDiv.offsetWidth;
    var mainDivHeight = this.MainDiv.offsetHeight;

    var heightInterval = contentDivHeight - mainDivHeight;
    if (heightInterval > 0) {   //  Окно больше содержимого. Ок!
        var gridHeight = this.GridDiv.offsetHeight + heightInterval;
        this.GridDiv.style.height = gridHeight + 'px';
    }
    else {//   FIX: в режиме выбора нескольких элементов если размеры содержимого превышают размеры окна, то необходимо явно указывать высоту окна.
        var minGridHeight = 50; //  Устанавливаем значение минимальной высоты грида с содержимым (в гриде примерно 2 элемента).
        this.GridDiv.style.height = minGridHeight + 'px';  //  Изменяем высоту грида.
        windowContainer.style.height = mainDivHeight + minGridHeight + 'px'; //  К высоте контейнера прибавляем высоту грида
    }

    if (mainDivWidth > contentDivWidth && !this.IsNewWindowDesign) {
        var maxSelectWidth = 250;
        var allSelects = window.document.getElementsByTagName('select');
        var i, len = allSelects.length;
        for (i = 0; i < len; i++) {
            var ddl = allSelects[i];
            if (ddl.offsetWidth > maxSelectWidth)
                ddl.style.width = maxSelectWidth;
        }

        contentDivWidth = window.frameElement.offsetWidth;
        mainDivWidth = this.MainDiv.offsetWidth;
    }
    if (mainDivWidth > 0) {
        if (this.IsNewWindowDesign) {
            this.GridDiv.style.width = mainDivWidth - 2 + 'px';
            this.GridHeaderDiv.style.width = mainDivWidth - 2 - 8 + 'px';//8 на отступ справа
        }
        else
            this.GridDiv.style.width = mainDivWidth - 2 - 26 + 'px';
    }
    if (mainDivWidth > contentDivWidth && !this.IsNewWindowDesign) {
        window.frameElement.style.width = mainDivWidth;
        window.parent.CenterFloatWindow();
    }
    this.GoSearch(true);
}

function MSLLookupWindow_OnGridPageLoad(gridWindow) {
    this.GridTable = this.GetElement('gridLookupItems');
    this.GridRows = new Array();

    var thisObj = this;
    if (this.IsNewWindowDesign) {
        this.GridHeaderDiv.innerHTML = '';

        //иногда грид оказывается пустой, пока не понял почему.
        if (this.GridTable == null)
            return;

        var headerRow = this.GridTable.rows[0];
        var headerHeight = headerRow.offsetHeight;
        //this.GridTable.style.marginTop = -headerHeight + 'px';

        var hasVerticalScroll = this.GridTable.offsetHeight - headerHeight > this.GridDiv.offsetHeight;
        if (SM.IsIE7 && hasVerticalScroll)
            this.GridTable.style.width = (this.GridTable.offsetWidth - 16) + 'px';

        var tbOuterHeader = window.document.createElement('table');
        this.GridHeaderTable = tbOuterHeader;
        tbOuterHeader.className = this.GridTable.className;
        tbOuterHeader.style.width = this.GridTable.offsetWidth + 'px';
        tbOuterHeader.border = 0;
        tbOuterHeader.cellSpacing = 0;
        tbOuterHeader.cellPadding = 0;
        var trOuterHeader = tbOuterHeader.insertRow(-1);
        var i, len = headerRow.cells.length;
        for (i = 0; i < len; i++) {
            var headerCell = headerRow.cells[i];
            var tdOuterHeader = trOuterHeader.insertCell(-1);
            tdOuterHeader.className = headerCell.className;
            tdOuterHeader.innerHTML = headerCell.innerHTML;
            //Поправлена бага с разъехавшимся заголовком окошка в IE8.
            if (!(SM.IsIE && headerCell.currentStyle.display == 'none'))
                tdOuterHeader.style.width = headerCell.offsetWidth + 'px';
            if (i == 1 && this.IsMultiple)
                tdOuterHeader.onclick = function () { thisObj.OnCheckAll(); }
        }
        this.GridHeaderDiv.appendChild(tbOuterHeader);
        tbOuterHeader.style.left = -this.GridDiv.scrollLeft + 'px';
    }
    else
        this.GridHeaderTable = this.GridTable;

    if (this.SearchResultParams.IsFirstPage) {
        //для первой страницы обнуляем параметры отображения 
        if (this.IsMultiple) {
            this.CheckAllImage = this.GridHeaderTable.rows[0].cells[1].children[0].children[0];
            var axoCheckedItems = SM.LoadXML('<CheckedItems></CheckedItems>');
            this.CheckedItemsNode = axoCheckedItems.selectSingleNode('CheckedItems');
        }
        else {
            this.PreviousCheckedRow = null;
            this.ReturnItemNode = null;
        }

        this.TestResultButtons();
    }
    else {
        //для следующих страниц, для мн. выбора, если выбрано "отметить все", то нужно "доотметить" подгруженное.
    }
}

//debugger
function MSLLookupWindow_CheckItem(resultRow) {
    var attrContainer = resultRow.cells[0];
    var identity = attrContainer.getAttribute('Identity');

    if (this.IsMultiple) {
        if (this.GridRows[identity] == null)
            this.GridRows[identity] = resultRow;

        var checked = !resultRow.checked;
        resultRow.checked = checked;
        var checkedItem = this.CheckedItemsNode.selectSingleNode('CheckedItem[@Identity="' + identity + '"]');
        if (checked) {
            if (resultRow.originalClassName == null)
                resultRow.originalClassName = resultRow.className;
            var className = window.SM.IsNE(resultRow.originalClassName) ? 'msl_lookupGrid_selectedRow' : 'msl_lookupGrid_selectedRow_alternate';
            resultRow.className = className;
            if (this.IsNewWindowDesign)
                resultRow.cells[1].children[0].src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png';
            else
                resultRow.cells[1].children[0].src = '/_layouts/Images/check.gif';
            if (checkedItem == null) {
                checkedItem = this.CheckedItemsNode.ownerDocument.createElement('CheckedItem');
                checkedItem.setAttribute('Identity', identity);
                checkedItem.setAttribute('RowIndex', resultRow.rowIndex.toString());
                this.CheckedItemsNode.appendChild(checkedItem);
            }
        }
        else {
            resultRow.className = resultRow.originalClassName;
            if (this.IsNewWindowDesign)
                resultRow.cells[1].children[0].src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
            else
                resultRow.cells[1].children[0].src = '/_layouts/Images/uncheck.gif';
            if (checkedItem != null)
                this.CheckedItemsNode.removeChild(checkedItem);
        }
    }
    else {

        if (this.PreviousCheckedRow != null)
            this.PreviousCheckedRow.className = this.PreviousCheckedRow.originalClassName;

        this.PreviousCheckedRow = resultRow;
        this.ReturnItemNode = this.ResultDocument.selectSingleNode("ArrayOfControlValue/ControlValue[@Identity='" + identity + "']");
        if (this.ReturnItemNode != null) {
            if (resultRow.originalClassName == null)
                resultRow.originalClassName = resultRow.className;
            var className = 'msl_lookupGrid_selectedRow_alternate';
            resultRow.className = className;
        }
    }
}

function MSLLookupWindow_TestCheckAllImage() {
    var allChecked = this.GridTable.rows.length - 1 == this.CheckedItemsNode.childNodes.length;
    if (this.IsNewWindowDesign)
        this.CheckAllImage.src = allChecked ? '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png' : '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
    else
        this.CheckAllImage.src = allChecked ? '/_layouts/images/checkall.gif' : '/_layouts/images/unchecka.gif';
    this.CheckAllImage.checked = allChecked;
}

function MSLLookupWindow_TestResultButtons() {
    if (this.IsMultiple) {
        var hasChecked = this.CheckedItemsNode.childNodes.length > 0;
        var hasResult = hasChecked || this.ReturnItemsNode.childNodes.length > 0 || this.EnableWindowLookupValueEdit;
        if (!this.IsNewWindowDesign) {
            this.AddToResultButton.disabled = !hasChecked;
            if (this.OkButton != null)
                this.OkButton.disabled = !hasResult;
        }

        this.CanAddToResult = hasChecked;
        this.CanClickOk = hasResult;
    }
    else {
        var hasResult = this.ReturnItemNode != null;
        if (this.OkButton != null) {
            if (!this.IsNewWindowDesign)
                this.OkButton.disabled = !hasResult;
            this.CanClickOk = hasResult;
        }
    }
}


//debugger
function MSLLookupWindow_SetSelectResult(resultRow) {
    var attrContainer = resultRow.cells[0];
    var identity = attrContainer.getAttribute('Identity');
    var returnNode = this.ReturnItemsNode.selectSingleNode("ControlValue[@Identity='" + identity + "']");
    if (returnNode == null) {
        var resultNode = this.ResultDocument.selectSingleNode("ArrayOfControlValue/ControlValue[@Identity='" + identity + "']");
        if (resultNode != null) {
            returnNode = resultNode.cloneNode(true);
            this.ReturnItemsNode.appendChild(returnNode);

            if (!this.IsNewWindowDesign) {
                var trReturn = this.SelectResultTable.insertRow(-1);
                var isAlternate = !this.SelectResultTable.IsLastRowAlternate;
                this.SelectResultTable.IsLastRowAlternate = isAlternate;
                trReturn.className = isAlternate ? 'msl_lookup_trResultAlternate' : '';

                var tdDelete = trReturn.insertCell(-1);
                tdDelete.className = 'msl_lookup_tdDeleteResult';
                tdDelete.innerHTML = "<img border='0' src='/_layouts/images/delete.gif' onclick='window.GetMSLLookupWindow(" + this.ParentPopupLevel + ").DeleteResultRow(this.parentNode.parentNode);' style='cursor:pointer' ></img>";
                tdDelete.Identity = identity;
                var i, len = resultRow.cells.length;
                if (len > 2) {
                    for (i = 2; i < len; i++) {
                        var tdResult = resultRow.cells[i];
                        var tdReturn = trReturn.insertCell(-1);
                        tdReturn.innerHTML = tdResult.innerHTML;
                        tdReturn.className = tdResult.className;
                    }
                }
            }
            else {
                if (this.ReturnItemsNode.childNodes.length > 1) {
                    var lastItemTable = this.SelectResultDiv.LastItemTable;
                    if (lastItemTable == null)
                        lastItemTable = this.GetElement('lastItemTable');
                    if (lastItemTable != null)
                        lastItemTable.rows[0].cells[2].style.display = '';
                }

                //var spnItem = window.document.createElement('span');
                //this.SelectResultDiv.appendChild(spnItem);
                var tbItem = window.document.createElement('table');
                this.SelectResultDiv.appendChild(tbItem);
                tbItem.className = 'msl_lookup_resultItemTable';


                tbItem.setAttribute('Identity', identity);
                tbItem.border = 0;
                tbItem.cellSpacing = 0;
                tbItem.cellPadding = 0;
                var trItem = tbItem.insertRow(-1);
                var tdDelete = trItem.insertCell(-1);
                tdDelete.innerHTML = "<img border='0' src='/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/delete.png' onclick='window.GetMSLLookupWindow(" + this.ParentPopupLevel + ").DeleteResultRow(this.parentNode.parentNode.parentNode.parentNode);' style='cursor:pointer' ></img>";
                tdDelete.className = 'msl_lookup_resultItemDeleteCell'
                var tdItem = trItem.insertCell(-1);
                var lookupLink = this.CreateLookupLink(returnNode);
                tdItem.appendChild(lookupLink);
                /*
                var divLookupItem = window.document.createElement('div');
                tdItem.appendChild(divLookupItem);
                divLookupItem.innerHTML = returnNode.getAttribute('LookupText');;
                divLookupItem.style.whiteSpace = 'nowrap';
                */
                tdItem.className = 'msl_lookup_resultItemCell';
                var tdSeparator = trItem.insertCell(-1);
                if (!this.MSLField.ShowLookupLink)
                    tdSeparator.className = 'msl_lookup_resultItemSeparator';
                else
                    tdSeparator.className = 'msl_lookup_resultItemSeparatorLink';
                tdSeparator.style.display = 'none';
                tdSeparator.innerHTML = ';';
                this.SelectResultDiv.LastItemTable = tbItem;
            }
        }
    }
}

//debugger
function MSLLookupWindow_DeleteResultRow(returnControl) {
    var attrContainer = null;
    if (!this.IsNewWindowDesign)
        attrContainer = returnControl.cells[0];
    else
        attrContainer = returnControl;
    var identity = attrContainer.getAttribute('Identity');
    var returnNode = this.ReturnItemsNode.selectSingleNode("ControlValue[@Identity='" + identity + "']");
    if (returnNode != null)
        this.ReturnItemsNode.removeChild(returnNode);
    returnControl.style.display = 'none';
    returnControl.Deleted = true;

    var resultRow = this.GridRows[identity];
    if (resultRow != null) {
        //снимаем выделение с выбранного элемента
        if (resultRow.checked) {
            this.CheckItem(resultRow);
            this.TestCheckAllImage();
        }
    }

    this.TestResultButtons();
    if (!this.IsNewWindowDesign)
        this.ResetResultAlternating();
    else {
        var i, len = this.SelectResultDiv.children.length;
        for (i = len - 1; i >= 0; i--) {
            var child = this.SelectResultDiv.children[i];
            var separator = child.rows[0].cells[2];
            if (separator != null && child.style.display != 'none') {
                separator.style.display = 'none';
                this.SelectResultDiv.LastItemTable = child;
                break;
            }
        }
    }
}

//debugger
function MSLLookupWindow_OnCheckAll() {
    var allChecked = this.CheckAllImage.checked == true;
    allChecked = !allChecked;

    if (this.IsNewWindowDesign)
        this.CheckAllImage.src = allChecked ? '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png' : '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
    else
        this.CheckAllImage.src = allChecked ? '/_layouts/images/checkall.gif' : '/_layouts/images/unchecka.gif';

    this.CheckAllImage.checked = allChecked;
    var i, len = this.GridTable.rows.length;
    if (len > 1) {
        for (i = 1; i < len; i++) {
            var resultRow = this.GridTable.rows[i];
            var resultRowChecked = resultRow.checked == true;
            if (resultRowChecked != allChecked) {
                this.CheckItem(resultRow);
                if (this.IsNewWindowDesign && resultRow.checked)
                    this.SetSelectResult(resultRow);
            }
        }
    }
    this.TestResultButtons();
}

function MSLLookupWindow_OnResultRowClick(resultRow) {
    this.CheckItem(resultRow);
    if (this.IsMultiple) {
        this.TestCheckAllImage();
        if (this.IsNewWindowDesign && resultRow.checked)
            this.SetSelectResult(resultRow);
    }
    this.TestResultButtons();
}

//debugger
function MSLLookupWindow_OnResultRowDoubleClick(resultRow) {
    if (this.IsMultiple) {
        if (!this.IsNewWindowDesign) {
            this.SetSelectResult(resultRow);
            this.TestResultButtons();
        }
    }
    else
        this.OnOkClick();
}

function MSLLookupWindow_AddToResult() {
    if (!this.CanAddToResult)
        return;
    var i, len = this.CheckedItemsNode.childNodes.length;
    for (i = 0; i < len; i++) {
        var checkedNode = this.CheckedItemsNode.childNodes[i];
        var rowIndexString = checkedNode.getAttribute('RowIndex');
        if (!window.SM.IsNE(rowIndexString)) {
            var rowIndex = parseInt(rowIndexString);
            if (rowIndex > 0) {
                var resultRow = this.GridTable.rows[rowIndex];
                if (resultRow != null) {
                    this.SetSelectResult(resultRow);
                }
            }
        }
    }
    this.TestResultButtons();
}

function MSLLookupWindow_ClearResult() {
    var i, len = this.SelectResultDiv.children.length;
    for (i = 0; i < len; i++) {
        var childItem = this.SelectResultDiv.children[i];
        if (!childItem.Deleted)
            this.DeleteResultRow(childItem);
    }
}

/*
function MSLLookupWindow_TestOkButton()
{
    //debugger
    if(this.OkButton != null)
        this.OkButton.disabled = this.ReturnItemsNode.childNodes.length == 0;
}
*/

function MSLLookupWindow_ResetResultAlternating() {
    var i, len = this.SelectResultTable.rows.length;
    if (len > 1) {
        this.SelectResultTable.IsLastRowAlternate = true;
        for (i = 1; i < len; i++) {
            var returnRow = this.SelectResultTable.rows[i];
            if (!returnRow.Deleted) {
                var isAlternate = !this.SelectResultTable.IsLastRowAlternate;
                this.SelectResultTable.IsLastRowAlternate = isAlternate;
                returnRow.className = isAlternate ? 'msl_lookup_trResultAlternate' : '';
            }
        }
    }
}

function MSLLookupWindow_OnPressEnter(evt, field) {
    var result = true;
    if (evt == null) evt = window.event;
    var ck = evt.keyCode;
    if (ck == 13) {

        field.LookupWindow.GoSearch(false);
        result = false;
    }

    return result;
}

//создает ссылку на подстановочный элемент
function MSLLookupWindow_CreateLookupLink(resultNode) {
    var lookupItemControl = null;

    var lookupID = parseInt(resultNode.getAttribute('LookupID'));
    var lookupText = resultNode.getAttribute('LookupText');
    var lookupListID = resultNode.getAttribute('LookupListID');
    var urlAccessCode = resultNode.getAttribute('UrlAccessCode');
    var lookupSection = this.MSLField.GetLookupSection(lookupListID);
    if (this.MSLField.ShowLookupLink && lookupID > 0 && lookupSection != null) {
        var lookupItemDispUrl = lookupSection.DispFormUrl + '?ID=' + lookupID;
        var lookupItemEditUrl = lookupSection.EditFormUrl + '?ID=' + lookupID;

        var lnkLookupItem = window.document.createElement('a');
        lnkLookupItem.className = 'msl_lookup_link';

        lnkLookupItem.innerHTML = lookupText;
        var lookupUrl = null;
        var params = '';
        if (window.SM.IsNE(this.MSLField.ItemBackUrl))
            params += '&closeOnUpdate=true&closeOnCancel=true';
        else
            params += '&Source=' + encodeURI(this.MSLField.ItemBackUrl);

        if (this.MSLField.GrantAccessViaUrl && !window.SM.IsNE(urlAccessCode))
            params += '&ac=' + urlAccessCode;

        if (!this.MSLField.IsEditFormLookupLink) {
            lnkLookupItem.href = lookupItemDispUrl;
            lookupUrl = lookupItemDispUrl + params;
        }
        else {
            params += '&showDispFormWithoutEditAccess=true';
            lookupUrl = lookupItemEditUrl + params;
            lnkLookupItem.href = lookupItemEditUrl;
        }
        if (this.MSLField.IsLookupOnGroups) {
            lookupUrl = this.MSLField.GroupMembersUrl + '?groupID=' + lookupID;
            lnkLookupItem.href = lookupUrl;
        }

        lnkLookupItem.onclick = function () { MSL_OpenWin(lookupUrl); return false; }
        lookupItemControl = lnkLookupItem;
    }
    else {
        var lblLookupItem = window.document.createElement('span');
        lblLookupItem.className = 'msl_lookup_lable';
        lblLookupItem.innerHTML = lookupText;
        lblLookupItem.title = lookupID + ' (' + lookupSection.LookupListName + ')';
        lookupItemControl = lblLookupItem;
    }
    return lookupItemControl;
}

function MSL_OpenWin(url) {
    if (window.SM.IsNE(url))
        throw new Error('Параметр url не может быть пустым.');

    var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
    var openedWin = window.open(url, '_blank', winFeatures);
}

/////////////////////////MSLLookupWindowField/////////////////////////////////
function MSLLookupWindowField(lookupWindow) {
    this.LookupWindow = lookupWindow;

    //Properties
    this.IsLookupControl = !window.SM.IsNE(this.LookupSettingsName);

    this.FilterControlCreated = false;


    //Methods
    this.CreateFilterControl = MSLLookupWindowField_CreateFilterControl;
    this.GetFilterValue = MSLLookupWindowField_GetFilterValue;
    this.OnTextPress = MSLLookupWindowField_OnTextPress;
    this.GetDate = MSLLookupWindowField_GetDate;
}

//debugger
function MSLLookupWindowField_CreateFilterControl(filtersRow) {
    if (filtersRow == null)
        throw new Error('Не передан параметр filtersRow.');

    var thisObj = this;
    //перечиляем типы на которые сделана поддержка филтров
    if (this.FilterType == 'Text'
        || this.FilterType == 'MultiText'
        || this.FilterType == 'Number'
        || this.FilterType == 'Integer'
        || this.FilterType == 'DateTime'
        || this.FilterType == 'Lookup'
        || this.FilterType == 'LookupMulti') {
        //создаем ячейку в переданной строке фильтров.
        var tdFilter = filtersRow.insertCell(-1);
        tdFilter.className = 'msl_lookup_tdFilter';
        if (this.HideFilter)
            tdFilter.style.display = 'none';

        if (!this.LookupWindow.IsNewWindowDesign) {
            var divTitle = window.document.createElement('div');
            tdFilter.appendChild(divTitle);
            divTitle.className = 'msl_lookup_divFilterTitle';
            divTitle.innerHTML = this.DisplayName;
        }

        var divFilter = window.document.createElement('div');
        tdFilter.appendChild(divFilter);
        divFilter.className = 'msl_lookup_divFilter';

        var defaultValue = null;
        if (!window.SM.IsNE(this.DefaultSourceFieldName)) {
            if (window.parent != null) {
                if (window.parent.ListForm != null) {
                    var listFormField = window.parent.ListForm.GetField(this.DefaultSourceFieldName);
                    var getFromServer = true;
                    if (listFormField != null) {
                        if (!listFormField.ReadOnly) {
                            defaultValue = listFormField.GetValue();
                            if (defaultValue != null && !this.IsLookupControl)
                                defaultValue = defaultValue.LookupText;
                            getFromServer = false;
                        }
                    }
                    if (getFromServer) {
                        //получаем аяксом значение поля
                        if (this.LookupWindow.FieldList() != null) {
                            var loadedFields = new Array();
                            loadedFields.push(this.DefaultSourceFieldName);
                            var sourceItem = this.LookupWindow.FieldList().GetItemByID(window.parent.ListForm.ItemID, loadedFields);
                            if (sourceItem != null) {
                                defaultValue = sourceItem.GetValue(this.DefaultSourceFieldName);
                                if (defaultValue != null) {
                                    if (this.DefaultSourceFieldType == 'DBFieldLookupSingle') {
                                        var lookupID = defaultValue.getAttribute('LookupID');
                                        var lookupText = defaultValue.getAttribute('LookupText');
                                        if (!window.SM.IsNE(lookupID) && !window.SM.IsNE(lookupText)) {
                                            var lookupValue = new Object();
                                            lookupValue.LookupID = lookupID;
                                            lookupValue.LookupText = lookupText;
                                            if (this.IsLookupControl)
                                                defaultValue = lookupValue;
                                            else
                                                defaultValue = lookupText;
                                        }
                                        else
                                            defaultValue = null;
                                    }
                                    else if (this.DefaultSourceFieldType == 'DBFieldLookupMulti')
                                        defaultValue = null;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (window.SM.IsNE(defaultValue) && !window.SM.IsNE(this.DefaultValue) && !this.IsLookupControl)
            defaultValue = this.DefaultValue;

        if (this.FilterType == 'Text'
            || this.FilterType == 'MultiText'
            || this.FilterType == 'Number'
            || this.FilterType == 'Integer') {
            //TextBox Control

            var txtFilter = null;
            var txtControl = null;
            var textControl = new TextControl({ DefaultText: thisObj.DisplayName, ControlWidth: 160 });
            divFilter.appendChild(textControl.Container);
            txtFilter = textControl.Control
            txtControl = textControl;
            this.TextControl = textControl;


            txtFilter.onkeydown = function (evt) { thisObj.OnTextPress(evt, thisObj); }
            //txtFilter.onkeypress = function(){ return MSLLookupWindow_OnPressEnter(window.event); }
            if (defaultValue != null) {
                defaultValue = defaultValue.toString();
                txtFilter.value = defaultValue;
            }
            if (this.LookupWindow.FirstTextFilter == null) {
                this.LookupWindow.FirstTextFilter = txtFilter;
                this.LookupWindow.FirstTextFilter.Control = txtControl;
                $(function () {
                    if (!SM.IsMobileDevice) {
                        if (thisObj.LookupWindow.IsNewWindowDesign)
                            thisObj.LookupWindow.FirstTextFilter.Control.ClearDefaultText();
                        if (thisObj.LookupWindow.FirstTextFilter.offsetWidth > 0)
                            thisObj.LookupWindow.FirstTextFilter.focus();
                    }
                });
            }
        }
        else if (this.FilterType == 'DateTime') {
            var picker = new DatePickerControl({
                DoubleDate: true,
                DefaultText: thisObj.DisplayName
            });
            divFilter.appendChild(picker.Container);
            this.DatePicker = picker;
            var defaultDateSet = false;
            if (!IsNullOrEmpty(this.DefaultStartDate)) {
                picker.StartDateInput.value = this.DefaultStartDate;
                defaultDateSet = true;
            }
            if (!IsNullOrEmpty(this.DefaultEndDate)) {
                picker.EndDateInput.value = this.DefaultEndDate;
                defaultDateSet = true;
            }
            if (defaultDateSet)
                picker.SetDefaultTextVisible();
            picker.AddChangeHandler(function (datePicker, isPressEnter) {
                thisObj.LookupWindow.GoSearch(false);
            });
        }
        else if (this.FilterType == 'Lookup'
            || this.FilterType == 'LookupMulti') {
            if (!this.IsLookupControl) {
                var thisObj = this;
                var listControl = new ListControl();
                listControl.IsMultiple = false;
                listControl.IsDropDownList = true;
                listControl.DefaultText = this.DisplayName;
                listControl.WrapGrid = true;
                listControl.Init();
                listControl.SetControlWidth(160);
                listControl.OnSetGridValue = function (gridValue) {
                    thisObj.LookupWindow.GoSearch(false);
                }
                listControl.OnDeleteValue = function (gridValue) {
                    if (!thisObj.LookupFilterControl.IsDeletingPreviousValue)
                        thisObj.LookupWindow.GoSearch(false);
                }
                this.Control = listControl;
                divFilter.appendChild(listControl.Container);



                var i, len = this.LookupFilterValues.length;
                var selectedValue = null;
                var index = 1;
                for (i = 0; i < len; i++) {
                    var lookupFilterValue = this.LookupFilterValues[i];
                    MSLLookupFilterValue.call(this);
                    if (!window.SM.IsNE(lookupFilterValue.LookupText)) {
                        listControl.AddGridRow(lookupFilterValue.LookupText, lookupFilterValue.LookupText);
                        if (lookupFilterValue.LookupText == defaultValue)
                            selectedValue = { Value: lookupFilterValue.LookupText, Text: lookupFilterValue.LookupText };
                        index++;
                    }
                }
                if (selectedValue != null)
                    listControl.SetValue(selectedValue);
                this.LookupFilterControl = listControl;
            }
            else {
                var lookupSettings = window.GetLookupSettings(this.LookupSettingsName);
                if (lookupSettings == null)
                    throw new Error('Не удалось получить настройку подстановки' + this.LookupSettingsName);
                lookupSettings.IsListControlMode = true;
                lookupSettings.DefaultListControlText = this.DisplayName;
                if (lookupSettings.ControlMode == 'DropDownList')
                    lookupSettings.IsDropDownListControl = true;
                lookupSettings.ShowLookupLink = false;

                var lookupControl = new DBLookupControl(this.LookupSettingsName, this.LookupSettingsName);

                divFilter.appendChild(lookupControl.Container);
                this.LookupControl = lookupControl;

                if (defaultValue != null)
                    lookupControl.SetValue(defaultValue);

                this.LookupControl.AddChangeHandler(function () { thisObj.LookupWindow.GoSearch(false); })
                this.LookupControl.ListControl.SetControlWidth(160);
            }
        }
        this.FilterControlCreated = true;
    }
}
//debugger

function MSLLookupWindowField_OnTextPress(evt, field) {
    if (evt == null) evt = window.event;
    var lookupWindow = field.LookupWindow;

    if (this.PressNumber == null)
        this.PressNumber = 0;

    var ck = evt.keyCode;

    if (ck == 9 || ck == 16 || ck == 17 || ck == 18 || ck == 19 || ck == 20 ||
        ck == 33 || ck == 35 || ck == 36 || ck == 37 || ck == 38 || ck == 39) {
        return false;
    }
    if (ck == 27)
        return false;
    this.PressNumber++;
    if (ck != 13)
        window.setTimeout('MSLLookupWindowField_OnTextPressTimeout("' + this.UniqueName + '",' + this.PressNumber + ', ' + lookupWindow.ParentPopupLevel + ')', 400);
    else
        lookupWindow.GoSearch(false);
}

//debugger
function MSLLookupWindowField_OnTextPressTimeout(uniqueName, pn, parentPopupLevel) {
    var lookupWindow = window.GetMSLLookupWindow(parentPopupLevel);
    if (lookupWindow != null) {
        var filter = lookupWindow.GetField(uniqueName);
        if (filter != null) {
            if (pn != filter.PressNumber)
                return;
            filter.PressNumber++;

            //перегружаем этот метод
            lookupWindow.GoSearch(false, null, null, false, true);
        }
    }
}

function MSLLookupWindowField_GetFilterValue() {
    var value = '';
    if (this.FilterType == 'Text'
        || this.FilterType == 'MultiText'
        || this.FilterType == 'Number'
        || this.FilterType == 'Integer') {
        value = this.TextControl.GetValue();

        if (!window.SM.IsNE(value)) {
            if (this.FilterType == 'Integer') {
                var rgInt = new RegExp('^-?(0|[1-9](\\d*|( \\d\\d\\d)*|\\d( \\d\\d\\d)*|\\d\\d( \\d\\d\\d)*))$');
                if (rgInt.test(value))
                    value = value.replace(/ /g, '');
                else
                    value = 'errorMessage:' + 'Некорретный формат значения фильтра типа Целое число';
            }
            else if (this.FilterType == 'Number') {
                var rgNum = new RegExp('^-?(0([.,]\\d+)?|[1-9](\\d*|( \\d\\d\\d)*|\\d( \\d\\d\\d)*|\\d\\d( \\d\\d\\d)*)([.,]\\d+)?)$');
                if (rgNum.test(value))
                    value = value.replace(/ /g, '');
                else
                    value = 'errorMessage:' + 'Некорретный формат значения фильтра типа Дробное число';
            }
        }
    }
    else if (this.FilterType == 'DateTime') {
        value = this.GetDate();
    }
    else if (this.FilterType == 'Lookup'
        || this.FilterType == 'LookupMulti') {
        if (!this.IsLookupControl) {
            var lookupValue = this.LookupFilterControl.Value;
            if (lookupValue != null)
                value = lookupValue.Value;
        }
        else {
            var lookupValue = this.LookupControl.Value;
            if (lookupValue != null) {
                if (!window.SM.IsNE(lookupValue.LookupText))
                    value = lookupValue.LookupText + '_lid_' + lookupValue.LookupID;
            }
        }
    }
    return value;
}

function MSLLookupWindowField_GetDate() {
    var typedValue = '_dts_';
    var rgDate = new RegExp('^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)([0-9][0-9])$');

    var inpStartDate = null;
    var inpEndDate = null;

    inpStartDate = this.DatePicker.StartDateInput;
    inpEndDate = this.DatePicker.EndDateInput;

    //проверяем начальную дату
    var inpStartDateValue = inpStartDate.value;
    if (this.ShowSingleDate && inpStartDateValue == this.DefaultText)
        inpStartDateValue = '';
    var startDateValue = '';
    var matchStart = inpStartDateValue.match(rgDate);
    var validStart = matchStart != null;
    if (validStart) {
        var day = matchStart[1];
        var month = matchStart[2];
        var year = matchStart[3] + matchStart[4];
        validStart = MSL_CheckMonthMaxDay(day, month, year);
    }
    if (validStart)
        startDateValue = inpStartDateValue;
    else if (!this.ShowSingleDate || !window.SM.IsNE(inpStartDateValue))
        inpStartDate.value = '';

    var endDateValue = '';
    if (!this.ShowSingleDate) {
        //проверяем конечную дату    
        var matchEnd = inpEndDate.value.match(rgDate);
        var validEnd = matchEnd != null;
        if (validEnd) {
            var day = matchEnd[1];
            var month = matchEnd[2];
            var year = matchEnd[3] + matchEnd[4];
            validEnd = MSL_CheckMonthMaxDay(day, month, year);
        }
        if (validEnd)
            endDateValue = inpEndDate.value;
        else
            inpEndDate.value = '';
    }

    typedValue = startDateValue + '_dts_' + endDateValue;
    return typedValue;
}

function MSL_CheckMonthMaxDay(day, month, year) {
    var valid = false;
    var intDay = parseInt(day);
    switch (month) {
        case '01':
            valid = intDay <= 31;
            break;

        case '02':
            var isLeapYear = parseInt(year) % 4 == 0;
            if (isLeapYear)
                valid = intDay <= 29;
            else
                valid = intDay <= 28;
            break;

        case '03':
            valid = intDay <= 31;
            break;

        case '04':
            valid = intDay <= 30;
            break;

        case '05':
            valid = intDay <= 31;
            break;

        case '06':
            valid = intDay <= 30;
            break;

        case '07':
            valid = intDay <= 31;
            break;

        case '08':
            valid = intDay <= 31;
            break;

        case '09':
            valid = intDay <= 30;
            break;

        case '10':
            valid = intDay <= 31;
            break;

        case '11':
            valid = intDay <= 30;
            break;

        case '12':
            valid = intDay <= 31;
            break;
    }
    return valid;
}

////////////////////////////////////////////////////////////////////





/////////////////////////MSLLookupFilterValue/////////////////////////////////
function MSLLookupFilterValue(field) {
    this.Field = field;
}

////////////////////////////////////////////////////////////////////
