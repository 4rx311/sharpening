function InitDRLookupWindow() {
    window.DRLookupWindow = DRLookupWindow_Ctor.call(this);
}

//Конструктор окна выбора пользователей.
function DRLookupWindow_Ctor() {

    //props
    this.PopupWindow = window.GetPopupWindow();
    this.Container = this.PopupWindow.GetElement('content');
    this.FilterContainer = this.PopupWindow.GetElement('filtersContainer');

    //func    
    this.Init = DRLookupWindow_Init;
    this.Close = DRLookupWindow_Close;
    this.Review = DRLookupWindow_Review;
    this.Search = DRLookupWindow_Search;
    this.CheckItem = DRLookupWindow_CheckItem;
    this.OnRowClick = DRLookupWindow_OnRowClick;
    this.OnCheckAll = DRLookupWindow_OnCheckAll;
    this.ClearResults = DRLookupWindow_ClearResults;
    this.InitFilters = DRLookupWindow_InitFilters;
    this.GetFilterParamString = DRLookupWindow_GetFilterParamString;
    SM.ApplyEventModel(this);

    //init        
    this.CheckedRows = {};
    this.InitFilters();
    this.Init();
    this.Search();

    return this;
}

//Закрытие окна.
function DRLookupWindow_Close() {
    this.PopupWindow.Hide();
}

//Инициализация фильтров.
function DRLookupWindow_InitFilters() {
    var i, len = this.Filters.length;
    if (len > 0) {
        for (i = 0; i < len; i++) {
            var filter = this.Filters[i];
            DRLookupWindowFilter.call(filter);
            filter.Init(this.FilterContainer);
        }
    }
}

//Инициализация окна.
function DRLookupWindow_Init() {
    this.DivGrid = document.getElementById('divGrid');
    if (!this.DivGrid) {
        this.DivGrid = window.document.createElement('div');
        this.DivGrid.id = 'divGrid';
        this.DivGrid.className = 'dr_lookup_grid_div';
        this.Container.appendChild(this.DivGrid);
    }

    var top = 0;
    if (this.FilterContainer != null && this.FilterContainer.parentNode != null)
        top = this.FilterContainer.parentNode.offsetHeight;

    this.DivGrid.style.width = (this.PopupWindow.ContentDiv.offsetWidth) + 'px';
    //var resh = this.SelectResultContainer.offsetHeight;

    var wh = this.PopupWindow.ContentDiv.offsetHeight - 17;
    var fh = top;
    var grdHeight = wh - 55 - fh;
    grdHeight < 0 ? grdHeight = 0 : grdHeight = grdHeight;
    this.DivGrid.style.height = grdHeight + 'px';
}

//Производит ознакомление с документом.
function DRLookupWindow_Review() {
    var resultItems = [];

    var gridTable = this.DivGrid.children[0];
    if (!gridTable || !gridTable.rows)
        return;

    var rowsLength = gridTable.rows.length;
    for (var i = 0; i < rowsLength; i++) {
        var row = gridTable.rows[i];
        if (row.checked == true) {
            var identityStr = row.cells[0].innerText;
            identityStr = identityStr.replace(/ /g, '');
            var identity = parseInt(identityStr);

            resultItems.push(identity);
        }
    }

    var resultLength = resultItems.length;
    if (resultLength == 0) {
        this.Close();
        return;
    }

    var allChecked = resultLength == rowsLength - 1;

    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewDocument.aspx?';
    url += '&rnd=' + Math.random();

    var params = 'listID=' + this.ListID;
    params += '&itemID=' + this.ItemID;
    params += '&reviewersIDs=' + SM.Stringify(resultItems);

    var ajax = window.SM.GetXmlRequest();
    ajax.open("POST", url, true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var response = ajax.responseText;

            var successed = false;
            if (response.indexOf('exception') != -1)
                alert('Завершено с ошибками. Текст ошибки: ' + response);
            else if (response == 'ok') {
                successed = true;
            }

            window.DRLookupWindow.Close();
            window.DRLookupWindow.FireEvent('ReviewCompleated', { Successed: successed, CheckAll: allChecked }, true);
        }
    }
    ajax.send(params);
}

//Поиск пользователей (применение фильтров).
function DRLookupWindow_Search() {

    if (this.SortField = null && !window.SM.IsNE(this.DefaultSortField)) {
        this.SortField = this.DefaultSortField;
        this.SortDirection = 'Ascending';
    }

    DRLookupWindow_GetGridData.call(this);
}

//Получение данных таблицы.
function DRLookupWindow_GetGridData() {

    var container = this.PopupWindow.GetElement('content');
    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewersLookupWindow/ReviewersData.aspx?';
    url += 'rnd=' + Math.random();

    var params = new String();
    params = params.concat('listID=', this.ListID);
    params = params.concat('&itemID=', this.ItemID);

    var filterParams = this.GetFilterParamString();
    if (!window.SM.IsNE(filterParams))
        params = params.concat('&filters=', filterParams);

    var sortFieldParams = this.SortField;
    var sortDirectionParams = this.SortDirection;

    if (!window.SM.IsNE(sortFieldParams) && !window.SM.IsNE(sortDirectionParams)) {
        params = params.concat('&sortColumn=', sortFieldParams);
        params = params.concat('&sortDirection=', sortDirectionParams);
    }

    params = encodeURI(params);

    var ajax = window.SM.GetXmlRequest();
    ajax.open("POST", url, true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            ajax.onreadystatechange = new Function();
            var response = ajax.responseText;

            if (window.DRLookupWindow != null && window.DRLookupWindow.DivGrid != null)
                window.DRLookupWindow.DivGrid.innerHTML = response;
            DRLookupWindow_InitHeader.call(window.DRLookupWindow);
            DRLookupWindow_ProcessCheckedRows.call(window.DRLookupWindow);
        }
    }
    ajax.send(params);
}

//Инициализация заголовка таблицы.
function DRLookupWindow_InitHeader() {
    var headerDiv = this.PopupWindow.GetElement('headerDiv');
    var scrollView = this.PopupWindow.GetElement('divGrid');
    if (headerDiv == null || scrollView == null)
        return;

    var tbl = scrollView.children[0];
    if (tbl == null)
        return;

    this.CheckAllImage = tbl.rows[0].cells[1].children[0].children[0];
    window.SM.CreateFixedHeader(tbl, headerDiv, scrollView);
    this.CheckAllImageHeader = headerDiv.children[0].rows[0].cells[1].children[0].children[0];
}

//Получение строки параметра со значениями фильтров.
function DRLookupWindow_GetFilterParamString() {

    var fParams = '';
    var i, length = this.Filters.length;
    for (i = 0; i < length; i++) {
        var filter = this.Filters[i];

        var value = filter.GetFilterValue();
        if (!window.SM.IsNE(value)) {
            fParams += '_fld_' + filter.Name + '_val_' + value;
        }
    }

    if (!window.SM.IsNE(fParams))
        fParams = window.EncodeUrlParameter(fParams);

    return fParams;
}

//Сортировака данных.
function DRLookupWindow_SortData(link) {
    if (!link)
        throw new Error('link is null');

    var sortField = link.getAttribute('ColumnName');

    if (this.SortDirection == null || this.SortField != sortField || this.SortDirection == 'Descending')
        this.SortDirection = 'Ascending';
    else
        this.SortDirection = 'Descending';

    this.SortField = sortField;
    this.Search();
}

//Нажатие на строку данных.
function DRLookupWindow_OnRowClick(row) {
    if (!row)
        throw new Error('row is null');

    this.CheckItem(row);

    /*
    if (resultRow.checked) {        
        this.SetSelectResult(resultRow);
    }
    else {
        //получаем выбранный элемент.
        var itemID = parseInt(resultRow.cells[0].innerText);
        
            var tbResultItem = this.ResultRows[itemID];
            if (tbResultItem == null)
                throw new Error('Не удалось получить выбранный элемент результата по идентификатору ' + itemID);

            //удаляем элемент из результата.
            this.DeleteResultRow(tbResultItem);
        
    }
    */
}

//Отмечает строку выбранной, либо снимает отметку.
function DRLookupWindow_CheckItem(row) {
    if (!row)
        throw new Error('row is null');

    var identityStr = row.cells[0].innerText;
    identityStr = identityStr.replace(/ /g, '');

    var identity = parseInt(identityStr);
    var isAlternate = row.getAttribute('IsAlternate') == 'true';

    var checked = !row.checked;
    row.checked = checked;
    row.setAttribute('checked', checked.toString().toLowerCase());

    var className = '';
    if (checked)
        className = !isAlternate ? 'dbf_lookupGrid_selectedRow' : 'dbf_lookupGrid_selectedRow_alternate';
    else
        className = isAlternate ? 'grid_row_alternate' : '';

    row.className = className;

    if (checked)
        row.cells[1].children[0].src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png';
    else
        row.cells[1].children[0].src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';

    this.CheckedRows[identity] = checked;
}

//Отмечает все строки.
function DRLookupWindow_OnCheckAll() {
    var allChecked = this.CheckAllImage.checked == true;
    allChecked = !allChecked;

    this.CheckAllImage.src = allChecked ? '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_checked.png' : '/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/row_unchecked.png';
    this.CheckAllImageHeader.src = this.CheckAllImage.src;
    this.CheckAllImage.checked = allChecked;

    var gridTable = this.DivGrid.children[0];
    if (!gridTable || !gridTable.rows)
        return;

    var i, len = gridTable.rows.length;
    if (len > 1) {
        for (i = 1; i < len; i++) {
            var row = gridTable.rows[i];

            var rowChecked = row.checked == true;
            if (rowChecked != allChecked) {
                this.CheckItem(row);
                /*
                if (row.checked)
                    this.SetSelectResult(row);
                else {
                    //получаем выбранный элемент.
                    var itemID = row.cells[0].getAttribute('Identity');
                    var canChoice = row.getAttribute('canChoice') == 'true';
                    if (canChoice) {
                        var tbResultItem = this.ResultRows[itemID];
                        if (tbResultItem == null)
                            throw new Error('Не удалось получить выбранный элемент результата по идентификатору ' + itemID);

                        //удаляем элемент из результата.
                        this.DeleteResultRow(tbResultItem);
                    }
                }
                */
            }
        }
    }

}

//Отмечает выбранные строки после обновления данных.
function DRLookupWindow_ProcessCheckedRows() {
    var gridTable = this.DivGrid.children[0];
    if (!gridTable || !gridTable.rows)
        return;

    var i, len = gridTable.rows.length;
    if (len > 1) {
        for (i = 1; i < len; i++) {
            var row = gridTable.rows[i];
            var identityStr = row.cells[0].innerText;
            identityStr = identityStr.replace(/ /g, '');

            var identity = parseInt(identityStr);

            if (this.CheckedRows[identity]) {
                this.CheckItem(row);
                /*
                if (row.checked)
                    this.SetSelectResult(row);
                else {
                    //получаем выбранный элемент.
                    var itemID = row.cells[0].getAttribute('Identity');
                    var canChoice = row.getAttribute('canChoice') == 'true';
                    if (canChoice) {
                        var tbResultItem = this.ResultRows[itemID];
                        if (tbResultItem == null)
                            throw new Error('Не удалось получить выбранный элемент результата по идентификатору ' + itemID);

                        //удаляем элемент из результата.
                        this.DeleteResultRow(tbResultItem);
                    }
                }
                */
            }
        }
    }
}

//Очищает результаты выбора.
function DRLookupWindow_ClearResults() {
    var gridTable = this.DivGrid.children[0];
    if (!gridTable || !gridTable.rows)
        return;

    for (var i = 0; i < gridTable.rows.length; i++) {
        var row = gridTable.rows[i];
        if (row.checked == true)
            this.CheckItem(row);
    }
}

/****************************************************/
/*************** DRLookupWindowFilter ***************/
/****************************************************/

function DRLookupWindowFilter() {

    this.Init = DRLookupWindowFilter_Init;
    this.Hide = DRLookupWindowFilter_Hide;
    this.Display = DRLookupWindowFilter_Display;
    this.CreateFilterControl = DRLookupWindowFilter_CreateFilterControl;
    this.GetFilterValue = DRLookupWindowFilter_GetFilterValue;
    this.GetDate = DRLookupWindowFilter_GetDate;
}

//Инициализация фильтра.
function DRLookupWindowFilter_Init(container) {
    if (!container)
        throw new Error('container is null');

    this.DivFilter = window.document.createElement('div');
    this.DivFilter.className = 'dr_lookup_filter_div';

    this.DefaultValuePrepeared = this.DefaultValue;
    this.CreateFilterControl();

    if (this.Hidden)
        this.Hide();

    container.appendChild(this.DivFilter);
}

//Скрытие фильтра.
function DRLookupWindowFilter_Hide() {
    if (this.DivFilter == null)
        return;

    this.DivFilter.style.display = 'none';
}

//Отображение фильтра.
function DRLookupWindowFilter_Display() {
    if (this.DivFilter == null)
        return;

    this.DivFilter.style.display = '';
}

//Создание контрола фильтра.
function DRLookupWindowFilter_CreateFilterControl() {

    var thisObj = this;
    if (this.Type == 'Text' ||
        this.Type == 'Integer' ||
        this.Type == 'Number') {

        var textOptions = {
            Type: this.Type,
            AllowNegativeValues: false,
            NumberOfDecimals: 2,
            DefaultText: thisObj.DisplayName,
            ControlWidth: 180
        };

        var textControl = new TextControl(textOptions);
        this.DivFilter.appendChild(textControl.Container);
        txtFilter = textControl.Control;
        this.TextControl = textControl;

        if (textControl.Control != null) {
            textControl.Control.onchange = function () {
                window.DRLookupWindow.Search();
            }
            $(textControl.Control).keydown(function (ev) {
                var keyCode = ev.keyCode;
                if (keyCode != 13)
                    return;
                window.DRLookupWindow.Search();
            });

            if (!SM.IsNE(this.DefaultValue)) {
                textControl.Control.value = this.DefaultValuePrepeared;
                textControl.ClearDefaultText();
            }
        }
    }
    else if (this.Type == 'Lookup' && !window.SM.IsNE(this.LookupSettingName)) {
        var lookupSettings = window.GetLookupSettings(this.LookupSettingName);
        lookupSettings.ControlWidth = 180;
        lookupSettings.DefaultListControlText = this.DisplayName;
        var lookup = new DBLookupControl(this.Name, this.LookupSettingName);
        this.LookupControl = lookup;

        lookup.AddChangeHandler(function () {
            window.DRLookupWindow.Search();
        });

        var divCtrl = window.document.createElement('div');
        divCtrl.appendChild(lookup.Container);
        this.DivFilter.appendChild(divCtrl);
    }
    else if (this.Type == 'DateTime') {
        var picker = new DatePickerControl({
            DoubleDate: true,
            DefaultText: thisObj.DisplayName
        });
        this.DivFilter.appendChild(picker.Container);
        this.DatePicker = picker;
        picker.AddChangeHandler(function (datePicker) {
            window.DRLookupWindow.Search();
        });
    }
    else if (this.Type == 'Boolean') {

        var listControl = new ListControl();
        listControl.IsMultiple = false;
        listControl.IsDropDownList = true;
        listControl.WrapGrid = true;
        listControl.DefaultText = this.DisplayName;
        listControl.Init();
        listControl.SetControlWidth(180);
        listControl.OnSetGridValue = function (gridValue) {
            window.DRLookupWindow.Search();
        }
        listControl.OnDeleteValue = function (gridValue) {
            if (!thisObj.BooleanControl.IsDeletingPreviousValue)
                window.DRLookupWindow.Search();
        }
        this.DivFilter.appendChild(listControl.Container);

        var yesValue = window.TN.TranslateKey('dr.filters.yes');
        var noValue = window.TN.TranslateKey('dr.filters.no');
        listControl.AddGridRow(yesValue, '1');
        listControl.AddGridRow(noValue, '0');
        this.BooleanControl = listControl;

        if (!SM.IsNE(this.DefaultValue)) {
            this.DefaultFilterText = null;
            if (this.DefaultValue.toString().toLowerCase() == 'да') {
                this.DefaultValuePrepeared = 1;
                this.DefaultFilterText = yesValue;
            }
            else {
                this.DefaultValuePrepeared = 0;
                this.DefaultFilterText = noValue;
            }
            listControl.SetValue({
                Value: this.DefaultValuePrepeared,
                Text: this.DefaultFilterText
            });
        }
    }
}

//Получение значения фильтрации.
function DRLookupWindowFilter_GetFilterValue() {
    var value = '';
    if (this.Type == 'Text' ||
        this.Type == 'Integer' ||
        this.Type == 'Number') {
        var value = this.TextControl.GetValue();

        if (!IsNullOrEmpty(value)) {
            if (this.Type == 'Integer') {
                var rgInt = new RegExp('^-?(0|[1-9](\\d*|( \\d\\d\\d)*|\\d( \\d\\d\\d)*|\\d\\d( \\d\\d\\d)*))$');
                if (rgInt.test(value))
                    value = value.replace(/ /g, '');
                else
                    value = 'errorMessage:' + 'Некорретный формат значения фильтра типа Целое число';
            }
            else if (this.Type == 'Number') {
                var rgNum = new RegExp('^-?(0([.,]\\d+)?|[1-9](\\d*|( \\d\\d\\d)*|\\d( \\d\\d\\d)*|\\d\\d( \\d\\d\\d)*)([.,]\\d+)?)$');
                if (rgNum.test(value))
                    value = value.replace(/ /g, '');
                else
                    value = 'errorMessage:' + 'Некорретный формат значения фильтра типа Дробное число';
            }
        }
    }
    else if (this.Type == 'DateTime') {
        value = this.GetDate();
    }
    else if (this.Type == 'Lookup' && !SM.IsNE(this.LookupSettingName)) {
        if (this.LookupControl.Value != null) {
            if (this.LookupControl.Value.LookupID != null && this.LookupControl.Value.LookupID != 0)
                value = this.LookupControl.Value.LookupID.toString();
        }
    }
    else if (this.Type == 'Boolean') {
        var boolValue = this.BooleanControl.Value;
        if (boolValue != null)
            value = boolValue.Value;
    }

    if (value == null)
        value = '';
    return value;
}

//получение значения даты.
function DRLookupWindowFilter_GetDate() {
    var typedValue = '_dts_';
    var rgDate = new RegExp('^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)([0-9][0-9])$');

    var inpStartDate = this.DatePicker.StartDateInput;
    var inpEndDate = this.DatePicker.EndDateInput;

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

//Проверка кол-ва дней в месяце.
function DRLookupWindowFilter_CheckMonthMaxDay(day, month, year) {
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
