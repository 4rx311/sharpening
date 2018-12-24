//debugger
function DBLookupWindow() {
    if (window.LookupWindows == null)
        window.LookupWindows = new Array();
    window.LookupWindows[this.PopupKey] = this;
    this.Closed = false;
    if (!this.IsNewWindowDesign)
        window.LookupWindow = this;

    this.XmlDocument = window.SM.LoadXML('<LookupWindow></LookupWindow>');
    this.XmlElement = this.XmlDocument.selectSingleNode('LookupWindow');

    //Properties
    var thisObj = this;

    if (!IsNullOrEmpty(this.ContextSiteUrl))
        window.Context().SetContextSite(this.ContextSiteUrl);

    if (this.IsNewWindowDesign && this.ContextSearchTimeout == 700)
        this.ContextSearchTimeout = 400;

    this.__init_FieldWeb = false;
    this._FieldWeb = null;
    this.FieldWeb = function () {
        if (!thisObj.__init_FieldWeb) {
            if (window.Context().Site() != null)
                thisObj._FieldWeb = window.Context().Site().GetWebByID(thisObj.FieldWebID);
            thisObj.__init_FieldWeb = true;
        }
        return thisObj._FieldWeb;
    }

    this.__init_FieldList = false;
    this._FieldList = null;
    this.FieldList = function () {
        if (!thisObj.__init_FieldList) {
            if (thisObj.FieldWeb() != null)
                thisObj._FieldList = thisObj.FieldWeb().GetListByID(thisObj.FieldListID);
            thisObj.__init_FieldList = true;
        }
        return thisObj._FieldList;
    }

    if (this.IsNewWindowDesign) {
        this.PopupWindow = window.GetPopupWindow(this.ParentPopupLevel);
        this.PopupWindow.LookupWindow = this;
    }


    //Methods
    this.GetElement = DBLookupWindow_GetElement;
    this.InitFields = DBLookupWindow_InitFields;
    this.InitFilters = DBLookupWindow_InitFilters;
    this.GoSearch = DBLookupWindow_GoSearch;
    this.GoSearchCompleted = DBLookupWindow_GoSearchCompleted;
    this.SortGrid = DBLookupWindow_SortGrid;
    this.OnOkClick = DBLookupWindow_OnOkClick;
    this.OnCancelClick = DBLookupWindow_OnCancelClick;
    this.OnSelectPageLoad = DBLookupWindow_OnSelectPageLoad;
    this.OnGridPageLoad = DBLookupWindow_OnGridPageLoad;

    this.OnCheckAll = DBLookupWindow_OnCheckAll;
    this.OnResultRowClick = DBLookupWindow_OnResultRowClick;
    this.OnResultRowDoubleClick = DBLookupWindow_OnResultRowDoubleClick;
    this.CheckItem = DBLookupWindow_CheckItem;
    this.TestCheckAllImage = DBLookupWindow_TestCheckAllImage;
    this.TestResultButtons = DBLookupWindow_TestResultButtons;
    this.SetSelectResult = DBLookupWindow_SetSelectResult;
    this.DeleteResultRow = DBLookupWindow_DeleteResultRow;
    //this.TestOkButton = DBLookupWindow_TestOkButton;
    this.AddToResult = DBLookupWindow_AddToResult;
    this.ClearResult = DBLookupWindow_ClearResult;
    this.CreateLookupLink = DBLookupWindow_CreateLookupLink;
    this.ResetResultAlternating = DBLookupWindow_ResetResultAlternating;
    this.InitDefaultItems = DBLookupWindow_InitDefaultItems;
    this.OnHierarchyRowClick = DBLookupWindow_OnHierarchyRowClick;
    this.ExpandCollapseGroup = DBLookupWindow_ExpandCollapseGroup;
    this.InitGridHeader = DBLookupWindow_InitGridHeader;


    //ContentHolder
    if (this.IsNewWindowDesign) {
        this.ContentHolder = SM.IsNE(this.ContentHolderID) ? this.PopupWindow.ContentDiv : this.PopupWindow.GetElement(this.ContentHolderID);
        if (this.ContentHolder == null)
            throw new Error('Не удалось получить ContentHolder');
    }

    //Controls
    this.MainDiv = this.GetElement('divMain');
    this.FiltersScopeDiv = this.GetElement('divFiltersScope');
    this.FiltersTable = this.GetElement('tbFilters');
    this.FiltersScopeTable = this.GetElement('tbFiltersScope');
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
    this.Settings = window.GetLookupSettings(this.SettingsName, true);
    this.OpenerControl = this.Settings.LookupWindowOpener;

    //Xml
    var axoReturnItems = SM.LoadXML('<ReturnItems></ReturnItems>');
    this.ReturnItemsNode = axoReturnItems.selectSingleNode('ReturnItems');
    //Добавляем дефалтовые элементы
    if (this.IsMultiple)
        this.InitDefaultItems();




    //Initialization
    this.InitFields();
    this.InitFilters();

    this.OnSelectPageLoad();
}
//debugger

function GetLookupWindow(popupKey) {
    var lookupWindow = null;
    if (window.LookupWindows != null) {
        if (SM.IsNE(popupKey))
            popupKey = '0';
        else
            popupKey = popupKey.toString();

        lookupWindow = window.LookupWindows[popupKey];
    }
    return lookupWindow;
}

function DBLookupWindow_GetElement(elementID) {
    if (IsNullOrEmpty(elementID))
        throw new Error('Не передан параметр elementID.');
    var element = null;
    if (this.IsNewWindowDesign)
        element = $(this.ContentHolder).find('#' + elementID)[0];
    else
        element = window.document.getElementById(elementID);
    if (element == null)
        element = null;
    return element;
}

function DBLookupWindow_InitFields() {
    this.FieldsByName = new Array();

    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        DBLookupWindowField.call(field, this);
        if (!IsNullOrEmpty(field.FieldName))
            this.FieldsByName[field.FieldName.toLowerCase()] = field;
    }
}

function DBLookupWindow_InitFilters() {
    var i, len = this.Fields.length;
    var filtersRow = null;
    var rowFiltersCount = 0;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        if (field.IsFilter) {

            if (filtersRow == null)
                filtersRow = this.FiltersTable.insertRow(-1);

            field.CreateFilterControl(filtersRow);
            rowFiltersCount++;

            if (this.MaxRowFiltersCount > 0 && rowFiltersCount >= this.MaxRowFiltersCount) {
                filtersRow = null;
                rowFiltersCount = 0;
            }
        }
    }
}

//debugger
function DBLookupWindow_OnHierarchyRowClick(gridRow) {
    var nodeID = gridRow.getAttribute('id');
    this.ExpandCollapseGroup(nodeID, null);
}

function DBLookupWindow_SetHierarchyAlternating(offsetRow) {
    if (offsetRow == null)
        throw new Error('Не передан параметр offsetRow.');

    //перекрашиваем строки
    var i = offsetRow.rowIndex + 1, len = this.GridTable.rows.length;
    var rows = this.GridTable.rows;
    var isAlternate = offsetRow.getAttribute('IsAlternate') == 'true';
    var altClassName = 'grid_row_alternate';
    while (i < len) {
        var row = rows[i];
        if (row.style.display == 'none') {
            i++;
            continue;
        }
        isAlternate = !isAlternate;
        var rowClassName = row.className;
        var isRowAlternate = row.getAttribute('IsAlternate') == 'true';
        if (isAlternate != isRowAlternate) {
            if (!row.checked) {
                if (SM.IsNE(rowClassName) || rowClassName == altClassName) {
                    if (isAlternate)
                        row.className = altClassName;
                    else
                        row.className = '';
                }
                else {
                    if (isAlternate)
                        $(row).addClass(altClassName);
                    else
                        $(row).removeClass(altClassName);
                }
            }
            row.setAttribute('IsAlternate', isAlternate.toString().toLowerCase());
            row.originalClassName = null;
        }
        i++;
    }
}

function DBLookupWindow_ExpandCollapseGroup(parentNodeID, parentCollapsed) {
    var trGroup = window.document.getElementById(parentNodeID);
    if (trGroup == null)
        throw new Error('Не удалось получить строку группировки по id=' + parentNodeID);

    //действие, выполняемое по клику по собственной кнопке +- у строки.
    var isSelfAction = parentCollapsed == null;

    //признак указываюший, на свернутость/развернутость родительского узла.
    parentCollapsed = parentCollapsed == true;

    var selfCollapsed = trGroup.getAttribute('isCollapsed') == 'true';

    if (isSelfAction) {
        selfCollapsed = !selfCollapsed;
        parentCollapsed = selfCollapsed;
        trGroup.setAttribute('isCollapsed', selfCollapsed.toString().toLowerCase());
        var imgCollapse = trGroup.CollapseImage;
        if (trGroup.CollapseImage == null) {
            imgCollapse = window.document.getElementById(parentNodeID + '_CollapseImage');
            trGroup.CollapseImage = imgCollapse;
        }
        if (imgCollapse != null)
            imgCollapse.src = selfCollapsed ? '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/TreeControl/Images/plus.png' : '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/TreeControl/Images/minus.png';
    }
    var lookupWindow = this;
    if (this.IsTextHierarchy || trGroup.ChildNodesLoaded || !isSelfAction) {
        $('tr[parentID="' + parentNodeID + '"]').each(function () {
            if (isSelfAction)
                this.style.display = selfCollapsed ? 'none' : '';
            else {
                if (parentCollapsed)
                    this.style.display = 'none';
                else
                    this.style.display = selfCollapsed ? 'none' : '';
            }
            var childNodeID = this.id;
            parentCollapsed = this.style.display == 'none';
            if (!SM.IsNE(childNodeID))
                lookupWindow.ExpandCollapseGroup(childNodeID, parentCollapsed);
        });

        if (isSelfAction) {
            //перекрашиваем строки.
            DBLookupWindow_SetHierarchyAlternating.call(this, trGroup);

            //выравниваем заголовок грида.
            this.InitGridHeader();
        }
    }
    else {
        //загружаем данные дочерних элементов
        //проставляем флаг загруженности детей.
        trGroup.ChildNodesLoaded = true;

        //делаем запрос на получение детей.
        var attrContainer = trGroup.cells[0];
        var identity = attrContainer.getAttribute('Identity');
        var nodeLevel = trGroup.getAttribute('level');
        var isAlternate = trGroup.getAttribute('IsAlternate') == 'true';

        var queryParams = {
            ParentNodeID: identity,
            ParentNodeLevel: nodeLevel,
            IsParentNodeAlternate: isAlternate
        };
        if (this.LastSortParams != null) {
            queryParams.SortColumn = this.LastSortParams.SortColumn;
            queryParams.SortDirection = this.LastSortParams.SortDirection;
        }
        this.GoSearch(null, queryParams);
    }
}

/////Handlers////

function DBLookupWindow_InitDefaultItems() {
    var i, len = this.ReturnItems.length;
    for (i = 0; i < len; i++) {
        var defaultItem = this.ReturnItems[i];
        var defaultItemNode = this.ReturnItemsNode.ownerDocument.createElement('LookupValue');
        defaultItemNode.setAttribute('LookupID', defaultItem.LookupID.toString());
        defaultItemNode.setAttribute('LookupText', defaultItem.LookupText);
        var ac = defaultItem.UrlAccessCode;
        if (ac != null)
            defaultItemNode.setAttribute('UrlAccessCode', ac);
        this.ReturnItemsNode.appendChild(defaultItemNode);
    }
}

function DBLookupWindow_GetSearchQuery(lastResultParams, queryParams) {
    var stFiltersQuery = '';
    var i, len = this.Fields.length;
    for (i = 0; i < len; i++) {
        var field = this.Fields[i];
        if (field.IsFilter && field.FilterControlCreated) {
            var filterValue = field.GetFilterValue();
            if (stFiltersQuery.length > 0)
                stFiltersQuery += '_sf_';
            stFiltersQuery += field.FieldName + '_sv_' + filterValue;
        }
    }

    var params = '';
    params += 'contextSiteUrl=' + encodeURI(this.ContextSiteUrl);
    params += '&sourceParameters=' + escape(this.SourceParameters);
    params += '&settingsAssemblyName=' + escape(this.SettingsAssemblyName);
    params += '&settingsTypeName=' + escape(this.SettingsTypeName);

    var parentParams = this.Settings.GetParentFilterParams(this.OpenerControl);
    if (!SM.IsNE(parentParams))
        params += parentParams;

    if (this.IsNewWindowDesign)
        params += '&parentPopupLevel=' + this.ParentPopupLevel;
    if (!SM.IsNE(this.WindowKey))
        params += '&windowKey=' + this.WindowKey;

    if (window.ListForm != null) {
        var defaultFilterValues = this.Settings.GetDefaultFilterValues();
        if (!SM.IsNE(defaultFilterValues))
            params += '&defaultFilterValues=' + encodeURIComponent(defaultFilterValues);
    }

    params += '&isMultiple=' + escape(this.IsMultiple.toString());
    params += '&listFormItemID=' + this.ListFormItemID;
    params += '&listFormListID=' + this.ListFormListID;
    params += '&listFormWebID=' + this.ListFormWebID;
    params += '&filters=' + encodeURIComponent(stFiltersQuery);
    params += '&isNewWindowDesign=' + this.IsNewWindowDesign;


    //задаем параметры пэйджинга, и иерархии
    var parentNodeID = null;
    var parentNodeLevel = null;
    if (lastResultParams != null) {
        parentNodeID = lastResultParams.ParentNodeID;
        parentNodeLevel = lastResultParams.ParentNodeLevel;
    }
    else if (queryParams != null) {
        parentNodeID = queryParams.ParentNodeID;
        parentNodeLevel = queryParams.ParentNodeLevel;
    }

    //загрузка детей в иерархии
    if (!SM.IsNE(parentNodeID))
        params += '&parentNodeID=' + parentNodeID;
    if (!SM.IsNE(parentNodeLevel))
        params += '&parentNodeLevel=' + parentNodeLevel;

    //получаем клиентские значения полей для их использования в SQL-фильтрации
    var clientValues = DBLookupSettings_GetClientFilterValues.call(this.Settings);
    if (!SM.IsNE(clientValues))
        params += '&clientValues=' + clientValues;

    return params;
}

//debugger
function DBLookupWindow_GoSearch(lastResultParams, queryParams) {
    var thisObj = this;

    var url = this.CurrentWebUrl + this.ModulePath + '/LookupGrid.aspx?rnd=' + Math.random();
    var params = DBLookupWindow_GetSearchQuery.call(this, lastResultParams, queryParams);

    //задаем параметры пэйджинга, и иерархии
    if (lastResultParams != null) {
        params += '&currentTopCount=' + lastResultParams.TopCount;
    }

    //задаем параметры альтернативных строк в зависимости от родителя
    var parentNodeAlternate = null;
    var sortColumn = null;
    var sortDirection = null;
    if (lastResultParams != null) {
        parentNodeAlternate = lastResultParams.IsParentNodeAlternate;
        sortColumn = lastResultParams.SortColumn;
        sortDirection = lastResultParams.SortDirection;
    }
    else if (queryParams != null) {
        parentNodeAlternate = queryParams.IsParentNodeAlternate;
        sortColumn = queryParams.SortColumn;
        sortDirection = queryParams.SortDirection;
    }

    if (parentNodeAlternate != null) {
        parentNodeAlternate = parentNodeAlternate === true;
        params += '&isParentNodeAlternate=' + parentNodeAlternate;
    }

    //sorting
    if (!SM.IsNE(sortColumn) && !SM.IsNE(sortDirection)) {
        params += '&sortColumn=' + encodeURIComponent(sortColumn);
        params += '&sortDirection=' + sortDirection;

        this.LastSortParams = {
            SortColumn: sortColumn,
            SortDirection: sortDirection
        };
    }
    else
        this.LastSortParams = null;

    if (this.Settings != null)
        params = DBLookupSettings_CustomizeSearchRequest.call(this.Settings, params, this.ResultUniqueKey);

    var xmlRequest = window.SM.GetXmlRequest();
    xmlRequest.open('POST', url, true);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var thisObj = this;
    var lastSearchQueryID = Math.random().toString();
    this.LastSearchQueryID = lastSearchQueryID;
    var responseParams = {
        LastResultParams: lastResultParams,
        LastSearchQueryID: lastSearchQueryID
    }
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            thisObj.GoSearchCompleted(responseText, responseParams);
        }
    };
    xmlRequest.send(params);
}

function DBLookupWindow_GoSearchCompleted(responseText, responseParams) {
    if (responseParams == null)
        throw new Error('Не передан параметр responseParams.');

    //проверяем что данный запрос ответ на запрос является ответом на последний запрос поиска.
    if (this.LastSearchQueryID != responseParams.LastSearchQueryID)
        return;

    var lastResultParams = responseParams.LastResultParams;
    if (IsNullOrEmpty(responseText))
        throw new Error('Параметр responseText не может быть пустым.');

    //выходим, если окно закрыто.
    if (this.Closed)
        return;

    var splResponse = responseText.split('_renderSplitter_');
    if (splResponse.length == 0)
        throw new Error('Отсутствует результат поиска докуметов.');

    //получаем параметры результата поиска.
    var searchParamsJson = splResponse[0];
    if (SM.IsNE(searchParamsJson))
        throw new Error('Отсутствуют параметры результат поиска докуметов.');
    var searchParams = JSON.parse(searchParamsJson);
    if (searchParams == null)
        throw new Error('Не удалось инициализировать объект результата.');

    if (searchParams.Exception != null) {
        //отображаем ошибку.
        alert(searchParams.Exception.DisplayText);
        return;
    }
    if (splResponse.length != 3)
        throw new Error('Некорректный резултат поиска докуметов.');

    //получаем разметку грида
    var gridHtml = splResponse[1];
    if (gridHtml == null)
        throw new Error('Не удалось получить разметку отображаемых документов.');

    //получаем данные о загруженных документах.
    var resultXml = splResponse[2];
    if (SM.IsNE(resultXml))
        throw new Error('Не удалось получить данные xml загруженных документов.');

    if (searchParams.IsFirstPage && searchParams.ParentNodeID == 0) {
        //для первой страницы инициализируем грид и данные
        this.GridDiv.innerHTML = gridHtml;
        this.ResultDocument = SM.LoadXML(resultXml);
    }
    else {
        //для следуюущих страниц дополняем грид и данные.
        if (this.GridTable == null)
            throw new Error('Не задана таблица отображения документов.');
        if (this.ResultDocument == null)
            throw new Error('Не заданы данные xml, отображаемых документов.');
        var rootResultNode = this.ResultDocument.selectSingleNode('ArrayOfLookupValue');
        if (rootResultNode == null)
            throw new Error('Не удалось получить корневой элемент ArrayOfLookupValue данных загруженных документов.');

        //переназначаем pagingHolder
        if (lastResultParams != null)
            searchParams.PagingHolder = lastResultParams.PagingHolder;

        //скрываем панель пэйджинга, которая откроется при необходимости.
        if (searchParams.PagingHolder != null) {
            searchParams.PagingHolder.style.display = 'none';
            if (searchParams.PagingHolder.PagingRow != null)
                searchParams.PagingHolder.PagingRow.style.display = 'none';
        }

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

            if (searchParams.ParentNodeID == 0) {
                //для стандартного (неиерархического окна) просто добавляем записи в конец
                pageGridBody.parentNode.removeChild(pageGridBody);
                this.GridTable.appendChild(pageGridBody);
            }
            else {
                //для иерархического окна добавляем записи после родителя.
                //получаем родителя
                var lastNodeRow = lastResultParams != null ? lastResultParams.LastNodeRow : null;
                if (lastNodeRow == null)
                    lastNodeRow = document.getElementById(searchParams.ParentNodeClientID);
                if (lastNodeRow == null)
                    throw new Error('Не удалось получить последнюю строку иерархии по ID=' + searchParams.ParentNodeClientID);
                var lastNodeIndex = lastNodeRow.rowIndex;

                //определяем строку, следующую за строкой родителя, чтобы для нее вызвать insertBefore.
                var nextNodeRow = null;
                if (lastNodeIndex < this.GridTable.rows.length - 1)
                    nextNodeRow = this.GridTable.rows[lastNodeIndex + 1];

                //контэйнер для добавляния детей
                var childNodesHolder = nextNodeRow != null ?
                    nextNodeRow.parentNode :
                    lastNodeRow.parentNode;

                //задаем параметры расположения детей в окошке, для того чтобы затем разместить панель с пэйджингом
                searchParams.NextNodeRow = nextNodeRow;
                searchParams.ChildNodesHolder = childNodesHolder;

                //добавляем детей в цикле.
                var childNodesTable = pageGridBody.parentNode;
                while (childNodesTable.rows.length > 0) {
                    var childNodeRow = childNodesTable.rows[0];
                    childNodeRow.parentNode.removeChild(childNodeRow);

                    if (nextNodeRow == null)
                        childNodesHolder.appendChild(childNodeRow);
                    else
                        childNodesHolder.insertBefore(childNodeRow, nextNodeRow);

                    searchParams.LastNodeRow = childNodeRow;
                }

            }
        }


        //добавляем данные xml подгруженных докуметов в общий xml.
        var pageDocument = SM.LoadXML(resultXml);
        var controlValues = pageDocument.selectNodes('ArrayOfLookupValue/LookupValue');
        var i, len = controlValues.length;
        for (i = 0; i < len; i++) {
            var controlValue = controlValues[i];
            controlValue.parentNode.removeChild(controlValue);
            rootResultNode.appendChild(controlValue);
        }
    }

    this.OnGridPageLoad(searchParams);

    //свойством LastNoeRow может стать только строка с данными, но не Строка "Отобразить еще XX".
    if (searchParams.IsHierarchyQuery && searchParams.LastNodeRow == null)
        searchParams.LastNodeRow = this.GridTable.rows[this.GridTable.rows.length - 1];

    //выполняем подсчет количества документов при необходимости,
    //вслед за которым может отобразится фраза внизу грида "Отображено X документов из XXX. Отобразить еще XX."
    if (searchParams.MoreResultsPossible)
        DBLookupWindow_CalculateItemsCount.call(this, searchParams);
    else {
        //перекрашиваем строки от последнего
        if (searchParams.LastNodeRow != null)
            DBLookupWindow_SetHierarchyAlternating.call(this, searchParams.LastNodeRow);
    }

    if (this.Settings != null)
        this.Settings.ExecuteSearchCompletedHandlers(this.ResultUniqueKey, this, searchParams);
}


function DBLookupWindow_CalculateItemsCount(lastResultParams) {
    if (lastResultParams == null)
        throw new Error('Не передан параметр lastResultParams.');

    var thisObj = this;

    var url = this.CurrentWebUrl + this.ModulePath + '/LookupWindowService.ashx?rnd=' + Math.random();
    var params = DBLookupWindow_GetSearchQuery.call(this, lastResultParams);
    params += '&operation=CalculateItemsCount';
    params += '&transactionID=' + lastResultParams.TransactionID;
    if (this.Settings != null)
        params = DBLookupSettings_CustomizeSearchRequest.call(this.Settings, params, this.ResultUniqueKey);

    var xmlRequest = window.SM.GetXmlRequest();
    xmlRequest.open('POST', url, true);
    xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var thisObj = this;
    var lastResultParamsLocal = lastResultParams;
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            DBLookupWindow_CalculateItemsCountCompleted.call(thisObj, responseText, lastResultParamsLocal);
        }
    };
    xmlRequest.send(params);
}

function DBLookupWindow_CalculateItemsCountCompleted(responseText, lastResultParams) {
    if (lastResultParams == null)
        throw new Error('Не передан параметр lastResultParams.');

    //выходим, если окно закрыто.
    if (this.Closed)
        return;

    if (SM.IsNE(responseText))
        throw new Error('Параметр responseText не может быть пустым.');
    var result = JSON.parse(responseText);
    if (result.Exception != null) {
        alert(result.Exception.DisplayText);
        return;
    }

    //если результат с количество пришел не для текущей транзакции поиска, то игнорируем этот результат
    if (result.TransactionID != lastResultParams.TransactionID)
        return;

    //получаем количество документов
    var itemsCount = result.ItemsCount;
    lastResultParams.ItemsCount = itemsCount;

    DBLookupWindow_DisplayPaging.call(this, lastResultParams);
}

function DBLookupWindow_DisplayPaging(resultParams) {
    if (resultParams == null)
        throw new Error('Не передан параметр resultParams.');

    //для текстовой иерархии пэйджинг не предусмотрен.
    if (resultParams.IsTextHierarchyQuery)
        return;

    if (resultParams.ItemsCount == null)
        throw new Error('Не вычислено полное количество элементов, удовлетворяющих условиям фильтрации.');

    if (resultParams.SummaryLoadedCount < resultParams.ItemsCount) {
        //если отображается документов меньше чем полное количество 
        //или документов отображается столько же сколько полное количество, но не на первой странице, то отображаем панель пэйджинга.
        var pagingHolder = resultParams.PagingHolder;
        if (pagingHolder != null) {
            pagingHolder.style.display = '';
            if (pagingHolder.PagingRow != null) {
                pagingHolder.PagingRow.style.display = '';

                //перемещаем вниз сроку с пэджингом.
                //вычисляем индекс вставки панель пэйджинга, смещая ее от последнего

                if (resultParams.LastNodeRow != null) {
                    var pagingInsertRow = null;

                    //удаляем из таблицы строку с пэйджингом, чтобы расчет индекса вставки не позиционировался относительно этой строки с пэйджингом.
                    pagingHolder.PagingRow.parentNode.removeChild(pagingHolder.PagingRow);

                    if (resultParams.LastNodeRow.rowIndex < this.GridTable.rows.length - 1) {
                        var pagingInsertIndex = resultParams.LastNodeRow.rowIndex + 1;
                        pagingInsertRow = this.GridTable.rows[pagingInsertIndex];
                    }

                    var parentInsertRow = null;
                    if (pagingInsertRow != null)
                        parentInsertRow = pagingInsertRow.parentNode;
                    else
                        parentInsertRow = resultParams.LastNodeRow.parentNode;

                    if (pagingInsertRow != null)
                        parentInsertRow.insertBefore(pagingHolder.PagingRow, pagingInsertRow)
                    else
                        parentInsertRow.appendChild(pagingHolder.PagingRow);
                }
            }
            pagingHolder.MoreDocsLink.LastResultParams = resultParams;
        }
        else {
            //создаем панель пэйджинга
            pagingHolder = document.createElement('div');
            pagingHolder.className = 'dbf_lookupWindow_divPaging';

            //устанавливаем ссылку на панель пэйджинга в результат
            resultParams.PagingHolder = pagingHolder;

            var divPagingOffset = document.createElement('div');
            pagingHolder.appendChild(divPagingOffset);
            divPagingOffset.className = resultParams.IsHierarchyQuery ?
                'dbf_lookupWindow_divPagingOffset_Hierarchy' :
                'dbf_lookupWindow_divPagingOffset';

            var divItemsCountHolder = document.createElement('div');
            divPagingOffset.appendChild(divItemsCountHolder);
            divItemsCountHolder.className = 'dbf_lookupWindow_divItemsCountHolder';

            //фраза "Отображено X из XXX"
            //текст "Отображено "
            var text0 = document.createTextNode('Отображено ');
            divItemsCountHolder.appendChild(text0);

            //сколько всего загружено в гриде
            var textSummaryLoadedCount = document.createElement('b');
            pagingHolder.SummaryLoadedCount = textSummaryLoadedCount;
            divItemsCountHolder.appendChild(textSummaryLoadedCount);

            //текст " из "
            var text1 = document.createTextNode(' из ');
            divItemsCountHolder.appendChild(text1);

            //полное количество документов
            var textItemsCount = document.createElement('b');
            pagingHolder.ItemsCount = textItemsCount;
            divItemsCountHolder.appendChild(textItemsCount);


            //ссылка подгрузки документов "Отобразить еще XX".
            var divPagingLink = document.createElement('div');
            divPagingOffset.appendChild(divPagingLink);
            divPagingLink.className = 'dbf_lookupWindow_divPagingLink';
            var moreDocsLink = document.createElement('a');
            divPagingLink.appendChild(moreDocsLink);
            moreDocsLink.className = 'dbf_lookupWindow_moreDocsLink';
            moreDocsLink.href = 'javascript:';
            //обработчик ссылки
            var thisObj = this;
            moreDocsLink.LastResultParams = resultParams;
            moreDocsLink.onclick = function () {
                DBLookupWindow_GoSearch.call(thisObj, this.LastResultParams);
            };
            var linkTitle = document.createTextNode('Отобразить еще ');
            moreDocsLink.appendChild(linkTitle);
            //текст с количеством возможных подгружаемых элементов
            var moreCount = document.createElement('span');
            moreDocsLink.appendChild(moreCount);
            pagingHolder.MoreCount = moreCount;
            pagingHolder.PagingLink = divPagingLink;
            pagingHolder.MoreDocsLink = moreDocsLink;

            if (resultParams.IsHierarchyQuery) {

                //вычисляем индекс вставки панель пэйджинга, смещая ее от последнего
                var pagingInsertIndex = -1;
                if (resultParams.LastNodeRow != null &&
                    resultParams.LastNodeRow.rowIndex < this.GridTable.rows.length - 1) {
                    pagingInsertIndex = resultParams.LastNodeRow.rowIndex + 1;
                }

                //создаем ячейку-контэйнер панели пэйджинга.
                var trPagingContainer = this.GridTable.insertRow(pagingInsertIndex);
                trPagingContainer.setAttribute('checkable', false);
                //устанавливаем идентификатор родительского нода, чтобы работал collapse/expand
                trPagingContainer.setAttribute('parentID', resultParams.ParentNodeClientID);
                //устанавливаем признак перекраски строки.
                var isAlternateLastRow = resultParams.LastNodeRow != null && resultParams.LastNodeRow.getAttribute('IsAlternate') === 'true';
                var isAlternatePagingRow = !isAlternateLastRow;
                trPagingContainer.setAttribute('IsAlternate', isAlternatePagingRow.toString().toLowerCase());
                if (isAlternatePagingRow)
                    trPagingContainer.className = 'grid_row_alternate';

                var tdPagingContainer = trPagingContainer.insertCell(-1);
                tdPagingContainer.className = 'dbf_lookupWindow_pagingCell';

                //устанавливаем безрамерную ячейку.
                tdPagingContainer.colSpan = 100;



                //размещаем панель пэйджинга.
                tdPagingContainer.appendChild(pagingHolder);

                //устанававливаем ссылку на строку с пэйджингом.
                pagingHolder.PagingRow = trPagingContainer;

                var pagingPadding = 0;
                var pagingPaddingStep = 20;
                //вычисляем отступ панели пэйджинга от левого края с учетом иерархии.
                if (resultParams.ParentNodeID != 0)
                    pagingPadding = (resultParams.ParentNodeLevel + 1) * pagingPaddingStep + (8 + 5);
                else
                    pagingPadding = 8 + (8 + 5);

                //устанавливаем отсуп для панели в иерархическом окне.
                pagingHolder.style.paddingLeft = pagingPadding + 'px';
            }
            else {
                //добавляем панель пэйджинга в конец грида.
                this.GridDiv.appendChild(pagingHolder);
            }

        }

        if (!resultParams.IsHierarchyQuery) {
            if ((resultParams.SummaryLoadedCount + resultParams.AlternateOffset) % 2 == 0)
                pagingHolder.className = 'dbf_lookupWindow_divPaging dbf_lookupWindow_divPaging_alternate';
            else
                pagingHolder.className = 'dbf_lookupWindow_divPaging';
        }

        SM.SetInnerText(pagingHolder.SummaryLoadedCount, resultParams.SummaryLoadedCount);
        SM.SetInnerText(pagingHolder.ItemsCount, resultParams.ItemsCount);

        //расчитываем, сколько можно "Отобразить еще XX".
        if (resultParams.SummaryLoadedCount < resultParams.ItemsCount) {
            if (resultParams.SummaryLoadedCount + this.PageSize > resultParams.ItemsCount)
                resultParams.MoreCount = resultParams.ItemsCount - resultParams.SummaryLoadedCount;
            else
                resultParams.MoreCount = this.PageSize;
        }
        else
            resultParams.MoreCount = 0;

        //отображаем ссылку "Отобразить еще XX".
        if (resultParams.MoreCount > 0) {
            pagingHolder.PagingLink.style.display = '';
            SM.SetInnerText(pagingHolder.MoreCount, resultParams.MoreCount);
        }
        else
            pagingHolder.PagingLink.style.display = 'none';
    }

    //изменяем закраску грида.
    if (resultParams.LastNodeRow != null) {
        //перекрашиваем строки от последнего
        if (resultParams.LastNodeRow != null)
            DBLookupWindow_SetHierarchyAlternating.call(this, resultParams.LastNodeRow);
    }
}

function DBLookupWindow_SortGrid(sortColumn, sortDirection) {
    var queryParams = {
        SortColumn: sortColumn,
        SortDirection: sortDirection
    };
    this.GoSearch(null, queryParams);
}

//debugger
function DBLookupWindow_OnOkClick() {
    if (!this.CanClickOk) {
        if (this.IsNewWindowDesign)
            DBLookupWindow_Close.call(this);
        SM.FireEvent(this.Settings, 'OnLookupWindowSave', { LookupWindow: this, HasResult: this.CanClickOk });
        return false;
    }
    if (this.Settings != null) {
        var xml = null;
        if (this.IsMultiple) {
            this.AddToResult();
            xml = SM.PersistXML(this.ReturnItemsNode);
        }
        else if (this.ReturnItemNode != null)
            xml = SM.PersistXML(this.ReturnItemNode);

        if (!IsNullOrEmpty(xml)) {
            this.Settings.SetValueXml(this.ResultUniqueKey, xml);
            DBLookupWindow_Close.call(this);
        }

        SM.FireEvent(this.Settings, 'OnLookupWindowSave', { LookupWindow: this, HasResult: this.CanClickOk });
    }
}

//закрывает окно подстановки.
function DBLookupWindow_Close() {
    this.Closed = true;
    this.PopupWindow.Hide();
}

function DBLookupWindow_OnCancelClick() {
    DBLookupWindow_Close.call(this);
    SM.FireEvent(this.Settings, 'OnLookupWindowCancel', this);
}

//debugger
function DBLookupWindow_OnSelectPageLoad() {
    //устанавливаем 0px зоне выбора, для того чтобы при наличии длинных предвыбранных элементов, 
    //ширина окошка не улетела вправо при открытии окошка.
    if (this.IsMultiple && this.SelectResultDiv != null)
        this.SelectResultDiv.style.width = '0px';

    SM.FireEvent(this.Settings, 'OnLookupWindowLoad', this);

    var windowContainer = !this.IsNewWindowDesign ? window.frameElement : this.ContentHolder;
    var contentDivWidth = windowContainer.offsetWidth;
    var contentDivHeight = windowContainer.offsetHeight;    //  Высота PopupWindow
    var mainDivWidth = this.MainDiv.offsetWidth;
    var mainDivHeight = this.MainDiv.offsetHeight;  //  Высота содержимого без грида


    var heightInterval = contentDivHeight - mainDivHeight;

    if (heightInterval > 0) {
        var gridHeight = this.GridDiv.offsetHeight + heightInterval;
        this.GridDiv.style.height = gridHeight + 'px';
    }
    else {
        if (SM.IsMobileDevice) {    //  Изменение высоты экрана PopupWindow при измененном масштабе
            var minGridHeight = 50;
            this.GridDiv.style.height = minGridHeight + 'px';  //  В данном случае увеличиваем высоту грида для отображения элементов
            windowContainer.style.height = mainDivHeight + minGridHeight + 'px'; //  К высоте контейнера прибавляем высоту грида
        }
    }
    if (mainDivWidth > 0) {
        if (this.IsNewWindowDesign) {
            this.GridDiv.style.width = mainDivWidth - 2 + 'px';
            if (this.IsMultiple && this.SelectResultDiv != null)
                this.SelectResultDiv.style.width = mainDivWidth - 2 - 16 + 'px';
            this.GridHeaderDiv.style.width = mainDivWidth - 2 - 8 + 'px';//8 на отступ справа
        }
        else
            this.GridDiv.style.width = mainDivWidth - 2 - 26 + 'px';
    }


    if (mainDivWidth > contentDivWidth && !this.IsNewWindowDesign) {
        window.frameElement.style.width = mainDivWidth + 'px';
        window.parent.CenterFloatWindow();
    }

    this.GoSearch();
}

function DBLookupWindow_InitGridHeader() {
    var thisObj = this;
    this.GridHeaderDiv.innerHTML = '';

    //иногда грид оказывается пустой, пока не понял почему.
    if (this.GridTable == null)
        return;

    this.GridTable.style.width = '100%';
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
    if (this.IsMultiple && tbOuterHeader.rows[0].cells.length > 1 && tbOuterHeader.rows[0].cells[1].children.length > 0)
        this.CheckAllImageHeader = tbOuterHeader.rows[0].cells[1].children[0].children[0];
}

function DBLookupWindow_OnGridPageLoad(resultParams) {
    if (resultParams == null)
        throw new Error('Не передан параметр resultParams.');
    this.GridTable = this.GetElement('gridLookupItems');
    //выходим из аякс-ответа - например если нажали поиск и недождавшись результата закрыли окошко.
    if (this.GridTable == null)
        return;

    var thisObj = this;
    if (this.IsNewWindowDesign)
        this.InitGridHeader();
    else
        this.GridHeaderTable = this.GridTable;

    if (resultParams.IsFirstPage && resultParams.ParentNodeID == 0) {
        this.GridRows = new Array();

        if (this.IsMultiple) {
            this.CheckAllImage = this.GridTable.rows[0].cells[1].children[0].children[0];
            var axoCheckedItems = SM.LoadXML('<CheckedItems></CheckedItems>');
            this.CheckedItemsNode = axoCheckedItems.selectSingleNode('CheckedItems');
        }
        else {
            this.PreviousCheckedRow = null;
            this.ReturnItemNode = null;
        }
        this.TestResultButtons();
    }
    if ((!resultParams.IsFirstPage && resultParams.ParentNodeID == 0 || resultParams.ParentNodeID > 0) && this.IsMultiple) {
        //для следующих страниц просто проверяем, что не все отмечено.
        this.TestCheckAllImage();
    }
}

//debugger
function DBLookupWindow_CheckItem(resultRow) {
    var attrContainer = resultRow.cells[0];
    var identity = attrContainer.getAttribute('Identity');

    var isAlternate = resultRow.getAttribute('IsAlternate') == 'true';

    if (this.IsMultiple) {
        if (this.GridRows[identity] == null)
            this.GridRows[identity] = resultRow;

        var checked = !resultRow.checked;
        resultRow.checked = checked;
        var checkedItem = this.CheckedItemsNode.selectSingleNode('CheckedItem[@Identity="' + identity + '"]');
        var className = '';
        if (checked)
            className = !isAlternate ? 'dbf_lookupGrid_selectedRow' : 'dbf_lookupGrid_selectedRow_alternate';
        else
            className = isAlternate ? 'grid_row_alternate' : '';

        resultRow.className = className;

        if (checked) {
            if (this.IsNewWindowDesign)
                resultRow.cells[1].children[0].src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png';
            else
                resultRow.cells[1].children[0].src = '/_layouts/Images/check.gif';
            if (checkedItem == null) {
                checkedItem = this.CheckedItemsNode.ownerDocument.createElement('CheckedItem');
                checkedItem.setAttribute('Identity', identity);
                checkedItem.setAttribute('GridRowID', resultRow.getAttribute('id'));
                this.CheckedItemsNode.appendChild(checkedItem);
            }
        }
        else {
            if (this.IsNewWindowDesign)
                resultRow.cells[1].children[0].src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
            else
                resultRow.cells[1].children[0].src = '/_layouts/Images/uncheck.gif';
            if (checkedItem != null)
                this.CheckedItemsNode.removeChild(checkedItem);
        }
    }
    else {

        if (this.PreviousCheckedRow != null) {
            var isAlternatePrev = this.PreviousCheckedRow.getAttribute('IsAlternate') == 'true';
            this.PreviousCheckedRow.className = isAlternatePrev ? 'grid_row_alternate' : '';
        }

        this.PreviousCheckedRow = resultRow;
        this.ReturnItemNode = this.ResultDocument.selectSingleNode("ArrayOfLookupValue/LookupValue[@LookupID='" + identity + "']");
        if (this.ReturnItemNode != null) {
            if (resultRow.originalClassName == null)
                resultRow.originalClassName = resultRow.className;
            resultRow.className = !isAlternate ? 'dbf_lookupGrid_selectedRow' : 'dbf_lookupGrid_selectedRow_alternate';
        }
    }
}

//debugger
function DBLookupWindow_TestCheckAllImage() {
    var allChecked = false;
    if (SM.IsNE(this.HierarchyFieldName))
        allChecked = this.GridTable.rows.length - 1 == this.CheckedItemsNode.childNodes.length;
    else {
        var checkableRowsCount = $(this.GridTable).find('tr[checkable="true"]').length;
        allChecked = checkableRowsCount == this.CheckedItemsNode.childNodes.length && checkableRowsCount > 0;
    }
    if (this.IsNewWindowDesign)
        this.CheckAllImage.src = allChecked ? '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png' : '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
    else
        this.CheckAllImage.src = allChecked ? '/_layouts/images/checkall.gif' : '/_layouts/images/unchecka.gif';
    if (this.IsNewWindowDesign)
        this.CheckAllImageHeader.src = this.CheckAllImage.src;
    this.CheckAllImage.checked = allChecked;
}

function DBLookupWindow_TestResultButtons() {
    if (this.IsMultiple) {
        //обрабатываем удаления выбранного элемента, пока окошко еще не прогрузилось
        if (this.CheckedItemsNode == null)
            return;

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
function DBLookupWindow_SetSelectResult(resultRow) {
    var attrContainer = resultRow.cells[0];
    var identity = attrContainer.getAttribute('Identity');
    var returnNode = this.ReturnItemsNode.selectSingleNode("LookupValue[@LookupID='" + identity + "']");
    if (returnNode == null) {
        var resultNode = this.ResultDocument.selectSingleNode("ArrayOfLookupValue/LookupValue[@LookupID='" + identity + "']");
        if (resultNode != null) {
            returnNode = resultNode.cloneNode(true);
            this.ReturnItemsNode.appendChild(returnNode);

            var thisObj = this;
            if (!this.IsNewWindowDesign) {
                var trReturn = this.SelectResultTable.insertRow(-1);
                var isAlternate = !this.SelectResultTable.IsLastRowAlternate;
                this.SelectResultTable.IsLastRowAlternate = isAlternate;
                trReturn.className = isAlternate ? 'dbf_lookup_trResultAlternate' : '';

                var tdDelete = trReturn.insertCell(-1);
                tdDelete.className = 'dbf_lookup_tdDeleteResult';
                tdDelete.innerHTML = "<img border='0' src='/_layouts/images/delete.gif' style='cursor:pointer' ></img>";
                var imgDelete = tdDelete.children[0];
                imgDelete.onclick = function () { thisObj.DeleteResultRow(trReturn); }
                tdDelete.Identity = identity;
                var i, len = resultRow.cells.length;
                if (len > 2) {
                    for (i = 2; i < len; i++) {
                        var tdResult = resultRow.cells[i];
                        var isMarkupCell = tdResult.getAttribute('isMarkupCell') == 'true';
                        if (!isMarkupCell) {
                            var tdReturn = trReturn.insertCell(-1);
                            tdReturn.innerHTML = tdResult.innerHTML;
                            tdReturn.className = tdResult.className;
                        }
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
                tbItem.className = 'dbf_lookup_resultItemTable';


                tbItem.setAttribute('Identity', identity);
                tbItem.border = 0;
                tbItem.cellSpacing = 0;
                tbItem.cellPadding = 0;
                var trItem = tbItem.insertRow(-1);
                var tdDelete = trItem.insertCell(-1);
                tdDelete.innerHTML = "<img border='0' src='/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/delete.png' style='cursor:pointer' ></img>";
                var imgDelete = tdDelete.children[0];
                imgDelete.onclick = function () { thisObj.DeleteResultRow(tbItem); }
                tdDelete.className = 'dbf_lookup_resultItemDeleteCell'
                var tdItem = trItem.insertCell(-1);
                var lookupLink = this.CreateLookupLink(returnNode);
                tdItem.appendChild(lookupLink);
                /*
                var divLookupItem = window.document.createElement('div');
                tdItem.appendChild(divLookupItem);
                divLookupItem.innerText = returnNode.getAttribute('LookupText');
                divLookupItem.style.whiteSpace = 'nowrap';
                */
                tdItem.className = 'dbf_lookup_resultItemCell';
                var tdSeparator = trItem.insertCell(-1);
                if (!this.Settings.ShowLookupLink)
                    tdSeparator.className = 'dbf_lookup_resultItemSeparator';
                else
                    tdSeparator.className = 'dbf_lookup_resultItemSeparatorLink';
                tdSeparator.style.display = 'none';
                tdSeparator.innerHTML = ';'
                this.SelectResultDiv.LastItemTable = tbItem;

                SM.FireEvent(this.Settings, "AddResultItem", { ID: identity });
            }
        }
    }
}

//debugger
function DBLookupWindow_DeleteResultRow(returnControl) {
    var attrContainer = null;
    if (!this.IsNewWindowDesign)
        attrContainer = returnControl.cells[0];
    else
        attrContainer = returnControl;
    var identity = attrContainer.getAttribute('Identity');
    var returnNode = this.ReturnItemsNode.selectSingleNode("LookupValue[@LookupID='" + identity + "']");
    if (returnNode != null)
        this.ReturnItemsNode.removeChild(returnNode);
    returnControl.style.display = 'none';
    returnControl.Deleted = true;

    if (this.GridRows != null) {
        var resultRow = this.GridRows[identity];
        if (resultRow != null) {
            //снимаем выделение с выбранного элемента
            if (resultRow.checked) {
                this.CheckItem(resultRow);
                this.TestCheckAllImage();
            }
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

    SM.FireEvent(this.Settings, "DeleteResultItem", { ID: identity });
}

//debugger
function DBLookupWindow_OnCheckAll() {
    var allChecked = this.CheckAllImage.checked == true;
    allChecked = !allChecked;

    if (this.IsNewWindowDesign)
        this.CheckAllImage.src = allChecked ? '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png' : '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
    else
        this.CheckAllImage.src = allChecked ? '/_layouts/images/checkall.gif' : '/_layouts/images/unchecka.gif';
    if (this.IsNewWindowDesign)
        this.CheckAllImageHeader.src = this.CheckAllImage.src;

    this.CheckAllImage.checked = allChecked;
    var i, len = this.GridTable.rows.length;
    if (len > 1) {
        for (i = 1; i < len; i++) {
            var resultRow = this.GridTable.rows[i];
            var checkable = resultRow.getAttribute('checkable');
            checkable = SM.IsNE(checkable) || checkable == 'true';
            if (!checkable)
                continue;
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

function DBLookupWindow_OnResultRowClick(resultRow) {
    this.CheckItem(resultRow);
    if (this.IsMultiple) {
        this.TestCheckAllImage();
        if (this.IsNewWindowDesign && resultRow.checked)
            this.SetSelectResult(resultRow);
    }
    this.TestResultButtons();
}

//debugger
function DBLookupWindow_OnResultRowDoubleClick(resultRow) {
    if (this.IsMultiple) {
        if (!this.IsNewWindowDesign) {
            this.SetSelectResult(resultRow);
            this.TestResultButtons();
        }
    }
    else
        this.OnOkClick();
}

function DBLookupWindow_AddToResult() {
    if (!this.CanAddToResult)
        return;
    var i, len = this.CheckedItemsNode.childNodes.length;
    for (i = 0; i < len; i++) {
        var checkedNode = this.CheckedItemsNode.childNodes[i];
        var gridRowID = checkedNode.getAttribute('GridRowID');
        if (!IsNullOrEmpty(gridRowID)) {
            var resultRow = document.getElementById(gridRowID);
            if (resultRow != null) {
                this.SetSelectResult(resultRow);
            }
        }
    }
    this.TestResultButtons();
}

function DBLookupWindow_ClearResult() {
    var i, len = this.SelectResultDiv.children.length;
    for (i = 0; i < len; i++) {
        var childItem = this.SelectResultDiv.children[i];
        if (!childItem.Deleted)
            this.DeleteResultRow(childItem);
    }
}

/*
function DBLookupWindow_TestOkButton()
{
    //debugger
    if(this.OkButton != null)
        this.OkButton.disabled = this.ReturnItemsNode.childNodes.length == 0;
}
*/

function DBLookupWindow_ResetResultAlternating() {
    var i, len = this.SelectResultTable.rows.length;
    if (len > 1) {
        this.SelectResultTable.IsLastRowAlternate = true;
        for (i = 1; i < len; i++) {
            var returnRow = this.SelectResultTable.rows[i];
            if (!returnRow.Deleted) {
                var isAlternate = !this.SelectResultTable.IsLastRowAlternate;
                this.SelectResultTable.IsLastRowAlternate = isAlternate;
                returnRow.className = isAlternate ? 'dbf_lookup_trResultAlternate' : '';
            }
        }
    }
}

function DBLookupWindow_OnPressKey(evt, field) {
    if (evt == null) evt = window.event;
    var lookupWindow = field.LookupWindow;
    var result = true;
    var ck = evt.keyCode;
    if (lookupWindow.pressNumber == null)
        lookupWindow.pressNumber = 0;
    lookupWindow.pressNumber++;
    if (ck == 13) {
        lookupWindow.GoSearch();
        result = false;
    }
    else if (field.EnableContextSearch) {
        if (ck == 9 || ck == 16 || ck == 17 || ck == 18 || ck == 19 || ck == 20 ||
         ck == 33 || ck == 34 || ck == 35 || ck == 36 || ck == 37 || ck == 38 || ck == 39 || ck == 40)
            return false;

        window.setTimeout('GoContextSearch(' + lookupWindow.pressNumber + ', "' + lookupWindow.PopupKey + '")', lookupWindow.ContextSearchTimeout);
    }
    return result;
}

function GoContextSearch(pn, popupKey) {
    var lookupWindow = window.GetLookupWindow(popupKey);
    if (lookupWindow != null) {
        if (pn != lookupWindow.pressNumber)
            return;

        lookupWindow.GoSearch();
    }
}

function DBLookupWindow_OnPressEnter(evt, filter) {
    if (evt == null) evt = window.event;
    var result = true;
    var ck = evt.keyCode;
    var lookupWindow = filter.LookupWindow;
    if (ck == 13) {
        lookupWindow.GoSearch();
        result = false;
    }
    return result;
}

function DBLookupWindow_OnPressEnterTxt(evt, filter) {
    if (evt == null) evt = window.event;
    var result = true;
    var ck = evt.keyCode;
    var lookupWindow = filter.LookupWindow;
    if (ck == 13)
        result = false;
    return result;
}

//создает ссылку на подстановочный элемент
function DBLookupWindow_CreateLookupLink(resultNode) {
    var lookupItemControl = null;

    var lookupID = parseInt(resultNode.getAttribute('LookupID'));
    var lookupText = resultNode.getAttribute('LookupText');
    var urlAccessCode = resultNode.getAttribute('UrlAccessCode');

    if (this.Settings.ShowLookupLink && lookupID > 0) {
        var lookupItemDispUrl = this.Settings.LookupListDispFormUrl + '?ID=' + lookupID;
        var lookupItemEditUrl = this.Settings.LookupListEditFormUrl + '?ID=' + lookupID;

        var lnkLookupItem = window.document.createElement('a');
        lnkLookupItem.className = 'lookup_link';

        lnkLookupItem.innerHTML = lookupText;
        var lookupUrl = null;
        var params = '';
        if (IsNullOrEmpty(this.Settings.ItemBackUrl))
            params += '&closeOnUpdate=true&closeOnCancel=true';
        else
            params += '&Source=' + encodeURI(this.Settings.ItemBackUrl);

        if (this.Settings.GrantAccessViaUrl && !IsNullOrEmpty(urlAccessCode))
            params += '&ac=' + urlAccessCode;

        if (!this.Settings.IsEditFormLookupLink) {
            lnkLookupItem.href = lookupItemDispUrl;
            lookupUrl = lookupItemDispUrl + params;
        }
        else {
            params += '&showDispFormWithoutEditAccess=true';
            lookupUrl = lookupItemEditUrl + params;
            lnkLookupItem.href = lookupItemEditUrl;
        }
        if (this.Settings.IsLookupOnGroups) {
            lookupUrl = this.Settings.GroupMembersUrl + '?groupID=' + lookupID;
            lnkLookupItem.href = lookupUrl;
        }

        lnkLookupItem.onclick = function () { DBLookup_OpenWin(lookupUrl); return false; }
        lookupItemControl = lnkLookupItem;
    }
    else {
        var lblLookupItem = window.document.createElement('span');
        lblLookupItem.className = 'lookup_lable';
        lblLookupItem.innerHTML = lookupText;
        lblLookupItem.title = 'Элемент: ' + lookupID;
        lookupItemControl = lblLookupItem;
    }
    return lookupItemControl;
}

function DBLookup_OpenWin(url) {
    if (IsNullOrEmpty(url))
        throw new Error('Параметр url не может быть пустым.');

    var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
    var openedWin = window.open(url, '_blank', winFeatures);
}

/////////////////////////DBLookupWindowField/////////////////////////////////
//debugger
function DBLookupWindowField(lookupWindow) {
    this.LookupWindow = lookupWindow;
    this.FilterControlCreated = false;
    this.IsLookupControl = !window.SM.IsNE(this.LookupSettingsName);

    //SqlField
    this.IsSqlField = this.FilterType == 'SqlField';
    if (this.IsSqlField) {
        this.VariantsByName = new Array();
        var i, len = this.Variants.length;
        for (i = 0; i < len; i++) {
            var variant = this.Variants[i];
            if (!SM.IsNE(variant.Name)) {
                this.VariantsByName[variant.Name.toLowerCase()] = variant;
            }
        }
        this.GetVariant = DBLookupSqlField_GetVariant;
    }

    //Methods
    this.CreateFilterControl = DBLookupWindowField_CreateFilterControl;
    this.GetFilterValue = DBLookupWindowField_GetFilterValue;
    this.GetDate = DBLookupWindowField_GetDate;
}

function DBLookupSqlField_GetVariant(variantName) {
    var variant = null;
    if (this.VariantsByName != null && !SM.IsNE(variantName))
        variant = this.VariantsByName[variantName.toLowerCase()];
    return variant;
}

//debugger
function DBLookupWindowField_CreateFilterControl(filtersRow) {
    if (filtersRow == null)
        throw new Error('Не передан параметр filtersRow.');

    var thisObj = this;
    //перечиляем типы на которые сделана поддержка филтров
    if (this.FilterType == 'Text' ||
        this.FilterType == 'Lookup' ||
        this.FilterType == 'Integer' ||
        this.FilterType == 'DateTime' ||
        this.FilterType == 'Boolean' ||
        this.FilterType == 'Number' ||
        this.FilterType == 'SqlField' && this.LookupWindow.IsNewWindowDesign) {
        var tdFilter = filtersRow.insertCell(-1);
        tdFilter.className = 'dbf_lookup_tdFilter';
        if (this.HideFilter)
            tdFilter.style.display = 'none';

        if (!this.LookupWindow.IsNewWindowDesign) {
            var divTitle = window.document.createElement('div');
            tdFilter.appendChild(divTitle);
            divTitle.className = 'dbf_lookup_divFilterTitle';
            divTitle.innerHTML = this.DisplayName;
        }

        var divFilter = window.document.createElement('div');
        tdFilter.appendChild(divFilter);
        divFilter.className = 'dbf_lookup_divFilter';

        var defaultValue = null;
        if (!IsNullOrEmpty(this.DefaultSourceFieldName))
            defaultValue = this.LookupWindow.Settings.GetDefaultFilterValue(this.DefaultSourceFieldName);

        if (IsNullOrEmpty(defaultValue) && !IsNullOrEmpty(this.DefaultValue) && !this.IsLookupControl)
            defaultValue = this.DefaultValue;

        if (this.FilterType == 'Text' ||
            this.FilterType == 'Integer' ||
            this.FilterType == 'Number') {
            //TextBox Control

            var txtFilter = null;
            var txtControl = null;
            if (this.LookupWindow.IsNewWindowDesign) {
                var textControl = new TextControl({ DefaultText: thisObj.DisplayName, ControlWidth: 160 });
                divFilter.appendChild(textControl.Container);
                txtFilter = textControl.Control;
                txtControl = textControl;
                this.TextControl = textControl;
            }
            else {
                var divText = window.document.createElement('div');
                divFilter.appendChild(divText);
                divText.className = 'dbf_lookup_textFilterDiv';

                var txtFilter = window.document.createElement('input');
                txtFilter.type = 'text';
                divText.appendChild(txtFilter);
                txtFilter.className = 'dbf_lookup_textFilter';
                this.TextControl = txtFilter;
            }


            txtFilter.onkeypress = function (evt) { return DBLookupWindow_OnPressEnterTxt(evt, thisObj); }
            txtFilter.onkeyup = function (evt) { return DBLookupWindow_OnPressKey(evt, thisObj); }
            if (!SM.IsNE(defaultValue)) {
                defaultValue = defaultValue.toString();
                txtFilter.value = defaultValue;
                if (this.LookupWindow.IsNewWindowDesign && !SM.IsMobileDevice)
                    txtControl.ClearDefaultText();
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

            if (!this.LookupWindow.IsNewWindowDesign) {
                var tbDate = window.document.createElement('table');
                divFilter.appendChild(tbDate);
                tbDate.border = 0;
                tbDate.cellSpacing = 0;
                tbDate.cellPadding = 0;
                var trDate = tbDate.insertRow(-1);

                var tdStartDate = trDate.insertCell(-1);
                var startDateControl = new DateTimeControl(null, false);
                tdStartDate.appendChild(startDateControl.Container);
                startDateControl.DateInput.className = 'lookup_dateControl';
                this.StartDateControl = startDateControl;

                var tdDateSep = trDate.insertCell(-1);
                tdDateSep.innerHTML = "<div class='lookup_dateSeparator'></div>";
                tdDateSep.style.padding = '0px 3px';

                var tdEndDate = trDate.insertCell(-1);
                var endDateControl = new DateTimeControl(null, false);
                tdEndDate.appendChild(endDateControl.Container);
                endDateControl.DateInput.className = 'lookup_dateControl';
                this.EndDateControl = endDateControl;

                startDateControl.AddChangeHandler(function (datePicker, isPressEnter) {
                    if (thisObj.EnableContextSearch || isPressEnter)
                        thisObj.LookupWindow.GoSearch();
                });
                endDateControl.AddChangeHandler(function (datePicker, isPressEnter) {
                    if (thisObj.EnableContextSearch || isPressEnter)
                        thisObj.LookupWindow.GoSearch();
                });
            }
            else {
                var picker = new DatePickerControl({
                    DoubleDate: true,
                    DefaultText: thisObj.DisplayName
                });
                divFilter.appendChild(picker.Container);
                thisObj.DatePicker = picker;
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
                    if (thisObj.EnableContextSearch || isPressEnter)
                        thisObj.LookupWindow.GoSearch();
                });
            }
        }
        else if (this.FilterType == 'Lookup') {
            var lookupSettings = window.GetLookupSettings(this.LookupSettingsName);
            if (lookupSettings == null)
                throw new Error('Не удалось получить настройку подстановки' + this.LookupSettingsName);
            if (this.LookupWindow.IsNewWindowDesign) {
                lookupSettings.IsListControlMode = true;
                lookupSettings.DefaultListControlText = this.DisplayName;
                lookupSettings.ShowLookupLink = false;
                if (lookupSettings.ControlMode == 'DropDownList')
                    lookupSettings.IsDropDownListControl = true;
            }

            var lookupControl = new DBLookupControl(this.LookupSettingsName, this.LookupSettingsName);
            if (this.LookupWindow.IsNewWindowDesign && lookupSettings.IsListControlMode)
                lookupControl.Container.title = this.DisplayName;
            divFilter.appendChild(lookupControl.Container);
            this.LookupControl = lookupControl;

            if (defaultValue != null)
                lookupControl.SetValue(defaultValue);

            if (this.EnableContextSearch)
                this.LookupControl.AddChangeHandler(function () { thisObj.LookupWindow.GoSearch(); })

            if (this.LookupControl.Settings.IsListControlMode && (this.LookupControl.Settings.IsDropDownListControl || this.LookupControl.Settings.ControlMode == 'LookupWindow')) {
                this.LookupControl.ListControl.SetControlWidth(160);
            }
            else
                this.LookupControl.EditControl.onkeypress = function (evt) { DBLookupWindow_OnPressEnter(evt, thisObj); }
        }
        else if (this.FilterType == 'Boolean') {
            if (this.LookupWindow.IsNewWindowDesign) {

                var listControl = new ListControl();
                listControl.IsMultiple = false;
                listControl.IsDropDownList = true;
                listControl.WrapGrid = true;
                listControl.DefaultText = this.DisplayName;
                listControl.Init();
                listControl.Container.title = this.DisplayName;
                listControl.ControlDiv.className += ' dbf_lookup_boolFilter';
                listControl.SetControlWidth(160);
                listControl.OnSetGridValue = function (gridValue) {
                    thisObj.LookupWindow.GoSearch();
                }
                listControl.OnDeleteValue = function (gridValue) {
                    if (!thisObj.BooleanControl.IsDeletingPreviousValue)
                        thisObj.LookupWindow.GoSearch();
                }
                this.Control = listControl;
                divFilter.appendChild(listControl.Container);

                listControl.AddGridRow('Да', '1');
                listControl.AddGridRow('Нет', '0');

                if (defaultValue != null) {
                    //debugger
                    var lowTypedValue = defaultValue.toLowerCase();
                    if (lowTypedValue == 'да' || lowTypedValue == '1' || lowTypedValue == 'true')
                        listControl.SetValue({ Value: '1', Text: 'Да' });
                    else if (lowTypedValue == 'нет' || lowTypedValue == '0' || lowTypedValue == 'false')
                        listControl.SetValue({ Value: '0', Text: 'Нет' });
                }

                this.BooleanControl = listControl;
            }
            else {
                var ddlBoolean = window.document.createElement('select');
                divFilter.appendChild(ddlBoolean);
                ddlBoolean.className = 'dbf_lookup_boolFilter';

                AppendOption(ddlBoolean, '(любое значение)', '');
                AppendOption(ddlBoolean, 'Да', '1');
                AppendOption(ddlBoolean, 'Нет', '0');


                ddlBoolean.onkeyup = function (evt) { return DBLookupWindow_OnPressKey(evt, thisObj); }

                if (defaultValue != null) {
                    if (defaultValue.toLowerCase() == 'да')
                        ddlBoolean.selectedIndex = 1;
                    else if (defaultValue.toLowerCase() == 'нет')
                        ddlBoolean.selectedIndex = 2;
                }

                this.BooleanControl = ddlBoolean;
            }
        }
        else if (this.FilterType == 'SqlField') {
            if (this.LookupWindow.IsNewWindowDesign) {
                var listControl = new ListControl();
                listControl.IsMultiple = false;
                listControl.IsDropDownList = true;
                listControl.WrapGrid = true;
                listControl.DefaultText = this.DisplayName;
                listControl.RemovableValue = this.RemovableFilterValue;
                listControl.Init();
                listControl.Container.title = this.DisplayName;
                listControl.SetControlWidth(160);
                listControl.OnSetGridValue = function (gridValue) {
                    thisObj.LookupWindow.GoSearch();
                }
                listControl.OnDeleteValue = function (gridValue) {
                    if (!thisObj.BooleanControl.IsDeletingPreviousValue)
                        thisObj.LookupWindow.GoSearch();
                }
                this.Control = listControl;
                divFilter.appendChild(listControl.Container);

                var j, jlen = this.Variants.length;
                for (j = 0; j < jlen; j++) {
                    var variant = this.Variants[j];
                    if (!SM.IsNE(variant.Name) && !SM.IsNE(variant.DisplayName)) {
                        listControl.AddGridRow(variant.DisplayName, variant.Name);
                    }
                }

                if (defaultValue != null) {
                    var defaultVariant = this.GetVariant(defaultValue);
                    if (defaultVariant != null)
                        listControl.SetValue({ Value: defaultVariant.Name, Text: defaultVariant.DisplayName });
                }

                this.BooleanControl = listControl;
            }
        }
        this.FilterControlCreated = true;
    }
}
//debugger

var isBrowserIE8 = null;
function IsIE8() {
    if (isBrowserIE8 == null)
        isBrowserIE8 = window.navigator.appVersion.toLowerCase().indexOf('trident/4.0') != -1;
    return isBrowserIE8;
}

function AppendOption(selectControl, optionText, optionValue) {
    var option = window.document.createElement('option');
    option.innerText = optionText;
    option.value = optionValue;
    selectControl.appendChild(option);
    return option;
}

//debugger
function DBLookupWindowField_GetFilterValue() {
    var value = '';
    if (this.FilterType == 'Text' ||
        this.FilterType == 'Integer' ||
        this.FilterType == 'Number') {
        var value = null;
        if (this.LookupWindow.IsNewWindowDesign)
            value = this.TextControl.GetValue();
        else if (this.TextControl.value != null)
            value = this.TextControl.value;

        if (!IsNullOrEmpty(value)) {
            if (this.FilterType == 'Integer') {
                var rgInt = new RegExp('^([0-9]+)$');
                if (!rgInt.test(value)) {
                    value = '';
                    if (this.LookupWindow.IsNewWindowDesign) {
                        this.TextControl.Control.value = '';
                        this.TextControl.SetDefaultText();
                    }
                    else
                        this.TextControl.value = '';
                }
            }
            else if (this.FilterType == 'Number') {
                if (!MatchNumber(value)) {
                    value = '';
                    if (this.LookupWindow.IsNewWindowDesign) {
                        this.TextControl.Control.value = '';
                        this.TextControl.SetDefaultText();
                    }
                    else
                        this.TextControl.value = '';
                }
            }
        }
    }
    else if (this.FilterType == 'DateTime') {
        value = this.GetDate();
    }
    else if (this.FilterType == 'Lookup') {
        if (this.LookupControl.Value != null) {
            if (this.LookupControl.Value.LookupID != null && this.LookupControl.Value.LookupID != 0)
                value = this.LookupControl.Value.LookupID.toString();
        }
    }
    else if (this.FilterType == 'Boolean') {
        if (this.LookupWindow.IsNewWindowDesign) {
            var boolValue = this.BooleanControl.Value;
            if (boolValue != null)
                value = boolValue.Value;
        }
        else {
            var boolValue = this.BooleanControl.value;
            if (!IsNullOrEmpty(boolValue))
                value = boolValue;
        }
    }
    else if (this.FilterType == 'SqlField') {
        if (this.LookupWindow.IsNewWindowDesign) {
            var typedValue = this.BooleanControl.Value;
            if (typedValue != null)
                value = typedValue.Value;
        }
    }
    if (value == null)
        value = '';
    return value;
}

function DBLookupWindowField_GetDate() {
    var typedValue = '_dts_';
    var rgDate = new RegExp('^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)([0-9][0-9])$');

    var inpStartDate = null;
    var inpEndDate = null;

    if (!this.LookupWindow.IsNewWindowDesign) {
        inpStartDate = this.StartDateControl.DateInput;
        inpEndDate = this.EndDateControl.DateInput;
    }
    else {
        inpStartDate = this.DatePicker.StartDateInput;
        inpEndDate = this.DatePicker.EndDateInput;
    }

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
        validStart = Lookup_CheckMonthMaxDay(day, month, year);
    }
    if (validStart)
        startDateValue = inpStartDateValue;
    else if (!this.ShowSingleDate || !IsNullOrEmpty(inpStartDateValue))
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
            validEnd = Lookup_CheckMonthMaxDay(day, month, year);
        }
        if (validEnd)
            endDateValue = inpEndDate.value;
        else
            inpEndDate.value = '';
    }

    typedValue = startDateValue + '_dts_' + endDateValue;
    return typedValue;
}

function Lookup_CheckMonthMaxDay(day, month, year) {
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

function MatchNumber(value) {
    var rgNum = new RegExp('^([-])?([0-9]+)([.,][0-9]+)?$');
    var isMatch = rgNum.test(value);
    if (isMatch) {
        var rgFirstZeros = new RegExp('^([-])?([0]+)([0-9])');
        isMatch = !rgFirstZeros.test(value);
        if (isMatch) {
            var rgEndZeros = new RegExp('([.,])([0-9]+)?([0]+)$');
            isMatch = !rgEndZeros.test(value);
        }
    }
    return isMatch;
}

////////////////////////////////////////////////////////////////////



////////////////////////Common Methods//////////////////////////////
function DBLookup_CancelBubbleEvent() {
    window.event.cancelBubble = true; window.event.returnValue = false;
}
////////////////////////////////////////////////////////////////////