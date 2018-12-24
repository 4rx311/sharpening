function ReviewInfoAdapter(settings, saveToWordControlID) {
    RIAdapter.call(settings, saveToWordControlID);
}

function RIAdapter(saveToWordControlID) {
    window.RDAdapter = this;
    this.SaveToWordControl = window.document.getElementById(saveToWordControlID);
    if (this.SaveToWordControl != null) {
        window.SM.ApplyEventModel(this.SaveToWordControl);
        //сохранить в Word
        //обработка фильтров по клику
        this.SaveToWordControl.AttachEvent('Click', function (sender, args) {
            if (args == null)
                throw Error('args is null');

            window.location.href = args.Url;
        });

        //по клику на сохранить в Word
        //собираем параметры поиска и сортировки
        $(this.SaveToWordControl).click(function () {
            var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewReport.aspx?';
            url += '&listID=' + window.RDAdapter.ListID;
            url += '&itemID=' + window.RDAdapter.ItemID;
            if (!window.SM.IsNE(window.RDAdapter.ReportSettings))
                url += '&reportSetting=' + window.RDAdapter.ReportSettings;
            url += '&rnd=' + Math.random();


            //фильтры
            var filterParams = DR_GetFilterParamString();
            if (!window.SM.IsNE(filterParams))
                url += '&filters=' + filterParams;

            //сортировка
            var sortFieldParams = DR_GetSortFieldParamString();
            var sortDirectionParams = DR_GetSortDirectionParamString();

            if (!window.SM.IsNE(sortFieldParams) && !window.SM.IsNE(sortDirectionParams)) {
                url += '&sortColumn=' + sortFieldParams;
                url += '&sortDirection=' + sortDirectionParams;
            }
            url = encodeURI(url);

            var args = { Url: url };
            //вызываем событие
            window.RDAdapter.SaveToWordControl.FireEvent('Click', args);
        });
    }

    //props
    this.PopupWindow = window.GetPopupWindow();
    this.Container = this.PopupWindow.GetElement('content');
    this.FilterContainer = this.PopupWindow.GetElement('filtersContainer');

    //func
    this.InitFilters = DR_InitFilters;
    this.Init = DR_Init;
    this.Search = DR_Search;
    this.Close = DR_Close;

    //init
    this.InitFilters();
    this.Init();

    //test
    this.Search(true);
    return this;
}

function DR_Close() {
    this.PopupWindow.Hide();
}

function DR_Init() {
    this.DivGrid = window.document.createElement('div');
    this.DivGrid.id = 'divGrid';
    this.DivGrid.className = 'dr_grid_div';
    this.Container.appendChild(this.DivGrid);

    //var top = $(this.DivGrid).offset().top;
    var top = 0;
    if (this.FilterContainer != null && this.FilterContainer.parentNode != null)
        top = this.FilterContainer.parentNode.offsetHeight;

    this.DivGrid.style.width = (this.PopupWindow.ContentDiv.offsetWidth) + 'px';

    var wh = this.PopupWindow.ContentDiv.offsetHeight - 17;
    var fh = top;
    var grdHeight = wh - 55 - fh;
    grdHeight < 0 ? grdHeight = 0 : grdHeight = grdHeight;
    this.DivGrid.style.height = grdHeight + 'px';
}

function DR_Search(clearSortParams) {
    if (clearSortParams) {
        this.SortField = null;
        this.SortDirection = null;
    }

    if (!window.SM.IsNE(this.DefaultSortField) && clearSortParams) {
        this.SortField = this.DefaultSortField;
        this.SortDirection = 'Ascending';
    }

    DR_GetGridData();
}

function DR_InitFilters() {
    var i, len = this.Filters.length;
    if (len > 0) {
        for (i = 0; i < len; i++) {
            var filter = this.Filters[i];
            DR_Filter.call(filter, this);
        }
    }
}

//*** DRFilter
function DR_Filter(adapter) {
    //prop
    this.Adapter = adapter;
    this.EName = escape(this.Name);
    //func
    this.InitFilter = DRFilter_Init;

    //init
    this.InitFilter();
}

function DRFilter_Init() {
    this.DivFilter = window.document.createElement('div');
    this.DivFilter.className = 'dr_filter_div';
    var filObj = this;
    this.DefaultValuePrepeared = this.DefaultValue;

    this.Hide = DRFilter_Hide;
    this.Display = DRFilter_Display;

    if (this.Type == 'Text' ||
        this.Type == 'Integer' ||
        this.Type == 'Number') {
        var textControl = new TextControl({ DefaultText: filObj.DisplayName, ControlWidth: 180 });
        this.DivFilter.appendChild(textControl.Container);
        txtFilter = textControl.Control;
        this.TextControl = textControl;


        if (textControl.Control != null) {
            textControl.Control.onchange = function () {
                filObj.Adapter.Search();
            }
            $(textControl.Control).keydown(function (ev) {
                var keyCode = ev.keyCode;
                if (keyCode != 13)
                    return;
                filObj.Adapter.Search();
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
            filObj.Adapter.Search();
        });

        var divCtrl = window.document.createElement('div');
        divCtrl.appendChild(lookup.Container);
        this.DivFilter.appendChild(divCtrl);
    }
    else if (this.Type == 'DateTime') {
        var picker = new DatePickerControl({
            DoubleDate: true,
            DefaultText: filObj.DisplayName
        });
        this.DivFilter.appendChild(picker.Container);
        this.DatePicker = picker;
        picker.AddChangeHandler(function (datePicker) {
            filObj.Adapter.Search();
        });
    }
    else if (this.Type == 'Boolean') {
        var thisObj = this;
        var listControl = new ListControl();
        listControl.IsMultiple = false;
        listControl.IsDropDownList = true;
        listControl.WrapGrid = true;
        listControl.DefaultText = this.DisplayName;
        listControl.Init();
        listControl.SetControlWidth(180);
        listControl.OnSetGridValue = function (gridValue) {
            filObj.Adapter.Search();
        }
        listControl.OnDeleteValue = function (gridValue) {
            if (!thisObj.BooleanControl.IsDeletingPreviousValue)
                filObj.Adapter.Search();
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
    this.Adapter.FilterContainer.appendChild(this.DivFilter);

    if (this.Hidden)
        this.Hide();
}

function DRFilter_Hide() {
    if (this.DivFilter == null)
        return;

    this.DivFilter.style.display = 'none';
}

function DRFilter_Display() {
    if (this.DivFilter == null)
        return;

    this.DivFilter.style.display = '';
}


//*** --- SEARCH
function DR_GetGridData() {
    var adapter = window.RDAdapter;

    var container = adapter.PopupWindow.GetElement('content');
    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewData.aspx?';
    url += 'rnd=' + Math.random();

    var params = new String();
    params = params.concat('listID=', adapter.ListID);
    params = params.concat('&itemID=', adapter.ItemID);

    var filterParams = DR_GetFilterParamString();
    if (!window.SM.IsNE(filterParams))
        params = params.concat('&filters=', filterParams);

    var sortFieldParams = DR_GetSortFieldParamString();
    var sortDirectionParams = DR_GetSortDirectionParamString();

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

            if (window.RDAdapter != null && window.RDAdapter.DivGrid != null)
                window.RDAdapter.DivGrid.innerHTML = response;
            DR_InitHeader();
        }
    }
    ajax.send(params);
}

function DR_InitHeader() {
    var headerDiv = window.RDAdapter.PopupWindow.GetElement('headerDiv');
    var scrollView = window.RDAdapter.PopupWindow.GetElement('divGrid');
    if (headerDiv == null || scrollView == null)
        return;

    var tbl = scrollView.children[0];
    if (tbl == null)
        return;

    window.SM.CreateFixedHeader(tbl, headerDiv, scrollView)
}

function DR_GetFilterParamString() {
    var fParams = '';
    var adapter = window.RDAdapter;

    var i, length = adapter.Filters.length;
    for (i = 0; i < length; i++) {
        var filter = adapter.Filters[i];

        var value = '';
        if (filter.Type == 'Text' ||
            filter.Type == 'Integer' ||
            filter.Type == 'Number') {
            value = filter.TextControl.TextInput.value;
        }
        else if (filter.Type == 'Lookup') {
            var lookupID = 0;
            if (filter.LookupControl != null) {
                var sValue = filter.LookupControl.SingleValue;
                if (sValue != null)
                    lookupID = sValue.LookupID;
            }
            if (lookupID > 0)
                value = lookupID;
        }
        else if (filter.Type == 'DateTime') {
            var sInp = filter.DatePicker.StartDateInput;
            var eInp = filter.DatePicker.EndDateInput;

            if (sInp != null && eInp) {
                if (!window.SM.IsNE(sInp.value) || !window.SM.IsNE(eInp.value))
                    value = sInp.value + '~' + eInp.value;
            }
        }
        else if (filter.Type == 'Boolean') {
            var tValue = filter.BooleanControl.Value;
            if (tValue != null) {
                if (tValue.Value == '0')
                    value = 'false';
                else
                    value = 'true';
            }
        }

        if (!window.SM.IsNE(value)) {
            fParams += '_fld_' + filter.Name + '_val_' + value;
        }
    }

    if (!window.SM.IsNE(fParams))
        fParams = window.EncodeUrlParameter(fParams);

    return fParams;
}

function DR_GetSortFieldParamString() {
    var sp = window.RDAdapter.SortField;
    return sp;
}

function DR_GetSortDirectionParamString() {
    var sd = window.RDAdapter.SortDirection;
    return sd;
}

function DR_SortData(link) {
    var oldSortField = window.RDAdapter.SortField;
    window.RDAdapter.SortField = link.getAttribute('ColumnName');

    if (oldSortField != window.RDAdapter.SortField)
        window.RDAdapter.SortDirection = 'Ascending';
    else {
        if (window.RDAdapter.SortDirection == null)
            window.RDAdapter.SortDirection = 'Ascending';
        else {
            if (window.RDAdapter.SortDirection == 'Ascending')
                window.RDAdapter.SortDirection = 'Descending';
            else
                window.RDAdapter.SortDirection = 'Ascending';
        }
    }

    window.RDAdapter.Search();
}