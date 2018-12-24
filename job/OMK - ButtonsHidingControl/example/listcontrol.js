function ListControl() {
    /*
    if(isMultiple == null)
        isMultiple = false;
    if(isDropDownList == null)
        isDropDownList = true;
    */

    this.IsMultiple = false;
    this.IsDropDownList = true;
    this.EnableOpenWin = true;
    this.FixControlWidth = true;
    this.WrapGrid = false;

    this.ModulePath = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/ListControl';

    /////////////////////
    /////////Methods/////

    //Control
    this.Init = LC_Init;
    this.SetDefaultText = LC_SetDefaultText;
    this.ClearDefaultText = LC_ClearDefaultText;

    //DropDown
    this.OnDropDownMouseDown = LC_OnDropDownMouseDown;
    this.SetDropDownOpened = LC_SetDropDownOpened;
    this.SetDropDownDefault = LC_SetDropDownDefault;
    this.OnDropDownClick = LC_OnDropDownClick;
    this.OnDropDownBlur = LC_OnDropDownBlur;
    this.OnDefaultTextDivMouseDown = LC_OnDefaultTextDivMouseDown;
    this.OnDropDownOver = LC_OnDropDownOver;
    this.OnDropDownOut = LC_OnDropDownOut;
    this.OnDropDownKeyDown = LC_OnDropDownKeyDown;

    //TextFilter
    this.OnTextKeyUp = LC_OnTextKeyUp;
    this.OnTextKeyDown = LC_OnTextKeyDown;
    this.OnTextBlur = LC_OnTextBlur;
    this.OnTextFocus = LC_OnTextFocus;
    //this.OnTextDown = LC_OnTextDown;
    this.OnStartEditClick = LC_OnStartEditClick;
    this.StartEdit = LC_StartEdit;
    this.HideEdit = LC_HideEdit;
    this.ShowTextFilter = LC_ShowTextFilter;

    //Grid
    this.CheckGrid = LC_CheckGrid;
    this.CheckEmptyRows = LC_CheckEmptyRows;
    this.InitGrid = LC_InitGrid;
    this.SetSelectionGrid = LC_SetSelectionGrid;
    this.OnRowOver = LC_OnRowOver;
    this.OnRowOut = LC_OnRowOut;
    this.OpenContextGridInternal = LC_OpenContextGridInternal;
    this.FocusGrid = LC_FocusGrid;
    this.BlurGrid = LC_BlurGrid;
    this.SelectGridRow = LC_SelectGridRow;
    this.UnSelectGridRow = LC_UnSelectGridRow;
    this.OnGridMove = LC_OnGridMove;
    this.OnGridBlur = LC_OnGridBlur;
    this.SetResultRow = LC_SetResultRow;
    this.OnRowDown = LC_OnRowDown;
    this.OpenGrid = LC_OpenGrid;
    this.ClearValue = LC_ClearValue;
    this.HideGrid = LC_HideGrid;
    this.AddGridRow = LC_AddGridRow;
    this.SetValue = LC_SetValue;
    this.ShowGrid = LC_ShowGrid;
    this.CheckGridWidth = LC_CheckGridWidth;
    this.SetGridPosition = LC_SetGridPosition;
    this.ChangeDisableState = LC_ChangeDisableState;
    this.Disable = LC_Disable;
    this.Enable = LC_Enable;
    this.SetControlWidth = LC_SetControlWidth;
    this.GetGridChildren = LC_GetGridChildren;


    //Interface

    //создает контрол выбранного элемента вып. списка
    this.CreateValueControl = LC_CreateValueControl;
    //создает полный контрол выбранного элемента вып. списка (с крестиком, с увеличением счетчика)
    this.CreateResultControl = LC_CreateResultControl;
    //инициализирует контрол удаления
    this.InitDeleteValueControl = LC_InitDeleteValueControl;
    //инициализирует контрол перемещения значения
    this.InitMoveValueControl = LC_InitMoveValueControl;
    //возвращает уникальный идентификатор строки вып. списка
    this.GetGridValueKey = LC_GetGridValueKey;
    //возвращает значение сопоставленное с выбранной строкой вып. списка
    this.GetGridRowValue = LC_GetGridRowValue;
    //открытие грида
    this.OpenContextGrid = LC_OpenContextGrid;



    ///////////////////////////////
    ///////States Properties///////
    this.States = new Object();

    //DropDown
    this.IsDropMouseDown = false;

    //TextFilter
    this.PressNumber = 0;
    this.DownPressed = false;
    this.IsTextEdit = false;
    this.IsTextFocused = false;
    this.DefaultText = '';
    this.UseDefaultTextDots = true;
    this.ShowDefaultTextTooltip = true;
    this.RemovableValue = true;

    //Grid
    this.States.GridFocused = false;
    this.States.GridOpened = false;
    this.OveredRowsCount = 0;
    this.CurrentRow = null;
    this.IsGridRowClick = false;
    this.CurrentResultControl = null;
    this.IsSetResult = false;
    this.ControlsCount = 0;
    this.IsEmptyGrid = false;


    ///////////////////////////////////
    ///////////Initialization//////////

    //Control
    if (window.ListControlUniqueID == null)
        window.ListControlUniqueID = 0;
    window.ListControlUniqueID++;
    this.UniqueID = window.ListControlUniqueID;
    if (window.ListControls == null)
        window.ListControls = new Array();
    window.ListControls[this.UniqueID] = this;

    //this.Init();
}

///////////////////////////////////////
/////////////Control///////////////////

function GetListControl(uniqueID) {
    var listControl = null;
    if (!window.SM.IsNE(uniqueID) && window.ListControls != null)
        listControl = window.ListControls[uniqueID];
    return listControl;
}

//debugger
function LC_Init() {
    var thisObj = this;
    this.IsDTD = window.document.compatMode == 'CSS1Compat';
    this.Container = window.document.createElement('div');
    var controlClassName = 'lc'
    if (this.IsMultiple) {
        if (!this.IsDropDownList)
            controlClassName += ' lc_multiText';
        else
            controlClassName += ' lc_multiDropDown';
    }
    if (this.IsDropDownList)
        controlClassName += ' lc_dropDown';
    if (!this.RemovableValue)
        controlClassName += ' lc_nonRemovable';
    if (!this.EnableOpenWin)
        controlClassName += ' lc_disabledOpenWin';
    this.Container.className = controlClassName;

    this.ControlDiv = window.document.createElement('div');
    this.ControlDiv.className = 'lc_div';

    this.ContentsDiv = window.document.createElement('div');
    this.ContentsDiv.className = 'lc_divContents';
    this.ControlDiv.appendChild(this.ContentsDiv);

    this.ResultDiv = window.document.createElement('div');
    this.ResultDiv.className = 'lc_divResult';
    this.ContentsDiv.appendChild(this.ResultDiv);

    if (!window.SM.IsNE(this.DefaultText)) {
        this.DefaultTextDiv = window.document.createElement('div');
        this.DefaultTextDiv.className = 'lc_divDefaultText';
        var defaultTextContent = window.document.createElement('span');
        defaultTextContent.innerHTML = this.UseDefaultTextDots ? this.DefaultText + '...' : this.DefaultText;
        this.DefaultTextDiv.tabIndex = 0;
        this.DefaultTextDiv.onfocus = function () { thisObj.OnStartEditClick(); }
        $(this.DefaultTextDiv).mouseover(function () {
            LC_CheckLongTitle(defaultTextContent, thisObj.DefaultText);
        });

        this.DefaultTextDiv.appendChild(defaultTextContent);
        this.ContentsDiv.appendChild(this.DefaultTextDiv);

    }

    if (!this.IsDropDownList) {
        if (this.IsMultiple) {
            this.ControlDiv.onmousedown = function () {
                if (thisObj.IsTextFocused)
                    thisObj.TextBlurDisabled = true;
            }
        }
        this.ControlDiv.onclick = function () { thisObj.OnStartEditClick(); }

        this.TextDiv = window.document.createElement('div');
        this.TextDiv.className = 'lc_divText';

        this.TextFilter = window.document.createElement('input');
        this.TextFilter.type = 'text';
        this.TextFilter.className = 'lc_text';
        this.TextFilter.onfocus = function (evt) { thisObj.OnTextFocus(evt); }
        this.TextFilter.onkeydown = function (evt) { return thisObj.OnTextKeyDown(evt); }
        this.TextFilter.onkeyup = function (evt) { return thisObj.OnTextKeyUp(evt); }
        this.TextFilter.onblur = function (evt) { thisObj.OnTextBlur(evt); }

        this.OpenWinDiv = window.document.createElement('div');
        this.OpenWinDiv.className = 'lc_divSelector lc_divOpenWin';

        this.TextDiv.appendChild(this.TextFilter);
        this.ContentsDiv.appendChild(this.TextDiv);
        this.ControlDiv.appendChild(this.OpenWinDiv);

        if (!window.ListContro_TextBlurUpAttached) {
            //костыль
            $(window.document).mouseup(function (evt) {
                if (evt == null) evt = window.event;
                try {
                    LC_OnTextBlurUp(evt);
                }
                catch (e) { }
            });
            window.ListContro_TextBlurUpAttached = true;
        }
    }
    else {
        this.DropDownDiv = window.document.createElement('div');
        this.DropDownDiv.className = 'lc_divDropDown';
        this.ContentsDiv.appendChild(this.DropDownDiv);

        this.OpenDropDownDiv = window.document.createElement('div');
        this.OpenDropDownDiv.className = 'lc_divSelector lc_divOpenDropDown';
        this.ControlDiv.appendChild(this.OpenDropDownDiv);
        this.ControlDiv.onmouseover = function () { thisObj.OnDropDownOver(); }
        this.ControlDiv.onmouseout = function () { thisObj.OnDropDownOut(); }


        this.ControlDiv.onclick = function () { thisObj.OnDropDownClick(); }
        this.ControlDiv.onblur = function (evt) { thisObj.OnDropDownBlur(evt); }
        this.ControlDiv.onmousedown = function () { thisObj.OnDropDownMouseDown(); }
        this.ControlDiv.onkeydown = function (evt) { thisObj.OnDropDownKeyDown(evt); return SM.CancelEvent(evt); }
        if (!window.SM.IsIE)
            this.ControlDiv.tabIndex = 5;
        if (!window.SM.IsNE(this.DefaultText)) {
            this.DefaultTextDiv.onmousedown = function (evt) { thisObj.OnDefaultTextDivMouseDown(evt); }
            if (!window.ListControlBlurDownAttached) {
                $(window.document).mousedown(function (evt) {
                    if (evt == null) evt = window.event;
                    window.ListControlBlurDownX = evt.clientX;
                    window.ListControlBlurDownY = evt.clientY;
                });
                window.ListControlBlurDownAttached = true;
            }
        }
    }

    this.Container.appendChild(this.ControlDiv);



    this.ContextHolderDiv = window.document.createElement('div');
    this.ContextHolderDiv.className = 'lc_divContextHolder';


    this.ContextDiv = window.document.createElement('div');
    this.ContextDiv.className = 'lc_divContext';
    if (this.WrapGrid) {
        //!!!!!!!!!!!!!!сделать обработку обвалакивания ячеек!!!!!!!!!!!!!!!!!!!
        //this.ContextDiv.className += ' lc_divSelection_wrappedGrid';
    }

    this.ContextHolderDiv.appendChild(this.ContextDiv);
    this.Container.appendChild(this.ContextHolderDiv);

    this.SelectedRows = new Array();
    this.SelectedValues = new Array();
    this.SelectedValuesByKey = new Array();
    if (this.IsMultiple)
        this.Value = new Array();
    else
        this.Value = null;

    this.SetDefaultText();
    //this.CheckGrid();
}

function LC_OnTextBlurUp(evt) {

    /*
    if (evt != null)
        SM.WriteLog('x: ' + evt.clientX + ' y: ' + evt.clientY);
    */

    if (window.ListControl_CheckingControls != null && evt != null) {

        var clientX = evt.clientX;
        var clientY = evt.clientY;

        if (clientX == null && clientY == null)
            return;

        for (var uniqueID in window.ListControl_CheckingControls) {
            if (!window.ListControl_CheckingControls.hasOwnProperty(uniqueID))
                continue;
            var listControl = window.ListControl_CheckingControls[uniqueID];
            if (listControl != null) {

                //SM.WriteLog(i + ' blur ' + listControl + ' ' + listControl.GridOpened + ' ' + listControl.IsTextEdit);


                var rect = listControl.ControlDiv.getBoundingClientRect();

                //если попали в квадрат контрола, то не скрываем режим текстового редактирования.
                var isOverControl = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

                if (listControl.TextFilter != null &&
                    listControl.IsTextEdit) {

                    if (!isOverControl)
                        listControl.HideEdit();
                }
                if (!isOverControl)
                    LC_OnGridBlur.call(listControl, evt);
            }
        }
    }
}

//debugger
function LC_SetControlWidth(filterWidth) {
    if (window.SM.IsNE(filterWidth))
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'filterWidth'));
    filterWidth = parseInt(filterWidth.toString().split('px')[0]);
    if (filterWidth == 0)
        return;

    this.ControlDiv.style.width = (!this.IsDTD ? filterWidth : filterWidth - 2) + 'px';
    this.Container.style.width = filterWidth + 'px';
    this.ControlWidth = filterWidth;
}

//debugger
function LC_SetDefaultText() {
    if (!window.SM.IsNE(this.DefaultText) && this.ControlsCount == 0 &&
        (this.IsDropDownList || window.SM.IsNE(this.TextFilter.value))) {
        $(this.Container).addClass('lc_showDefaultText');
        if (this.ShowDefaultTextTooltip)
            this.ControlDiv.title = '';
        this.IsDefaultText = true;
    }
}

//debugger
function LC_ClearDefaultText() {
    if (!window.SM.IsNE(this.DefaultText)) {
        $(this.Container).removeClass('lc_showDefaultText');
        if (this.ShowDefaultTextTooltip)
            this.ControlDiv.title = this.DefaultText;
        this.IsDefaultText = false;
    }
}

//////////////////////////////////////
/////////////////DropDown/////////////
function LC_OnDropDownMouseDown() {
    if (this.Disabled)
        return;
    this.IsDropMouseDown = true;
}

function LC_SetDropDownOpened() {
    this.OpenDropDownDiv.style.backgroundImage = 'url(' + this.ModulePath + '/Images/dropDownOpened.png)';
}

function LC_SetDropDownDefault() {
    this.OpenDropDownDiv.style.backgroundImage = 'url(' + this.ModulePath + '/Images/dropDown.png)';
}

function LC_OnDefaultTextDivMouseDown(evt) {
    if (evt == null) evt = window.event;
    this.States.IsDefaultTextDown = true;
}

//debugger
function LC_OnDropDownBlur(evt) {
    if (evt == null) evt = window.event;

    var clientX = evt.clientX;
    var clientY = evt.clientY;
    if (clientX == null && clientY == null) {
        clientX = window.ListControlBlurDownX;
        clientY = window.ListControlBlurDownY;
    }
    var rect = this.ControlDiv.getBoundingClientRect();

    //если попали в квадрат контрола, то не воспринимаем событие как blur.
    var isControlDown = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

    if (isControlDown && !this.States.IsDefaultTextDown)
        return;

    if (this.States.IsDefaultTextDown && isControlDown) {
        this.States.IsDefaultTextDown = false;
        return;
    }

    if (this.OveredRowsCount == 0 && !this.States.IsContextMouseDown) {
        this.HideGrid();
    }
    this.States.IsContextMouseDown = false;
}

function LC_OnDropDownOver() {
    if (!this.States.GridOpened)
        this.OpenDropDownDiv.style.backgroundImage = 'url(' + this.ModulePath + '/Images/dropDownHover.png)';
}

function LC_OnDropDownOut() {
    if (!this.States.GridOpened)
        this.OpenDropDownDiv.style.backgroundImage = 'url(' + this.ModulePath + '/Images/dropDown.png)';
}



//debugger
function LC_OnDropDownClick() {
    if (this.Disabled)
        return;
    if (!this.States.GridOpened) {
        this.SetDropDownOpened();
        this.OpenGrid();
    }
    else {
        this.HideGrid();
        this.SetDropDownDefault();
    }
    this.IsDropMouseDown = false;
}

function LC_OnDropDownKeyDown(evt) {
    if (evt == null) evt = window.event;
    if (!this.HasEmptyRow) {
        if (!this.States.GridFocused)
            this.FocusGrid();
        if (this.States.GridFocused)
            this.OnGridMove(evt);
    }
    else {
        var ck = evt.keyCode;
        if (ck == 27) {
            this.OnGridBlur();
            return false;
        }
    }
}



/////////////////////////////////////////////////////
///////////////////TextFilter////////////////////////

function LC_OnTextFocus() {
    if (this.Disabled)
        this.TextFilter.blur();
    this.ClearDefaultText();
}

function LC_OnTextBlur() {
    if (this.TextBlurDisabled)
        return;
    this.IsTextFocused = false;
    if (this.OveredRowsCount == 0) {
        this.HideGrid();
        this.TextFilter.value = '';
    }
    this.HideEdit();
    this.SetDefaultText();
    this.States.IsContextMouseDown = false;
}

function LC_OnTextKeyUp(evt) {
    if (evt == null) evt = window.event;
    var ck = evt.keyCode;

    //скрываем грид при пустом фильтре
    if (window.SM.IsNE(this.TextFilter.value) && this.States.GridOpened) {
        this.HideGrid();
        this.States.DoKeyUp = false;
    }
    //выход по Esc
    if (ck == 27) {
        this.TextFilter.value = '';
        this.HideGrid();
        this.HideEdit();
        this.States.DoKeyUp = false;
    }

    if (this.States.DoKeyUp && !window.SM.IsNE(this.TextFilter.value)) {
        this.PressNumber++;
        window.setTimeout('LC_OpenContextGridTimeout(' + this.UniqueID + ',' + this.PressNumber + ')', 400);
        this.DownPressed = false;
    }
    this.States.DoKeyUp = true;

    //disable form submit
    if (ck == 13)
        return SM.CancelEvent(evt);

    return true;
}

//debugger
function LC_OnTextKeyDown(evt) {
    if (evt == null) evt = window.event;
    var ck = evt.keyCode;

    this.States.DoKeyUp = true;

    //Delete By Backspace
    if (ck == 8 &&
        this.IsMultiple &&
        this.ControlsCount > 0 &&
        window.SM.IsNE(this.TextFilter.value) &&
        this.RemovableValue) {
        var i, len = this.ResultDiv.children.length;
        for (i = len - 1; i >= 0; i--) {
            var resultControl = this.ResultDiv.children[i];
            if (resultControl.style.display != 'none') {
                this.ClearValue(resultControl.Value, true);
                break;
            }
        }
        this.States.DoKeyUp = false;
    }

    //посторонние символы
    if (ck == 9 || ck == 16 || ck == 17 || ck == 18 || ck == 19 || ck == 20 ||
     ck == 33 || ck == 35 || ck == 36 || ck == 37 || ck == 38 || ck == 39) {
        this.States.DoKeyUp = false;
    }

    //если грид открыт и нажали клавишу вниз, делаем фокусировку
    if (this.States.GridOpened && !this.States.GridFocused && (ck == 40 || ck == 34 || ck == 38 || ck == 33)) {
        this.FocusGrid();
        this.States.DoKeyUp = false;
    }

    //если нажали вниз или Enter делаем прямой поиск
    //и если грид не в режиме Hover
    //помечаем состояние флагом, чтобы при повторном нажатии вниз не было повторого поиска
    if (ck == 13 || (ck == 40 || ck == 34) && !this.States.GridDirectlyOpened) {
        if (!this.States.TimeoutOpening && !this.States.GridFocused && !window.SM.IsNE(this.TextFilter.value)) {
            this.OpenContextGridInternal(this.PressNumber);
            this.States.GridDirectlyOpened = true;
            this.States.DoKeyUp = false;
            if (ck == 40 || ck == 34)
                this.States.DirectlyDown = true;
        }
    }

    //если есть фокусировка на гриде делаем перемещение по нему.
    if (this.States.GridFocused) {
        if (ck == 40 || ck == 38 || ck == 33 || ck == 34 || ck == 13) {
            this.OnGridMove(evt);
            this.States.DoKeyUp = false;
        }
    }

    //disable form submit
    if (ck == 13) {
        this.States.DoKeyUp = false;
        return SM.CancelEvent(evt);;
    }
    return true;
}



/*
//debugger
function LC_OnTextDown()
{
    if(!this.HasEmptyRow)
    {
        var firstRow = this.GridChildHolder.children[0];
        this.TextFilter.isTextDown = true;
        
        
        if(!this.States.GridFocused)
        {
            this.FocusGrid();
            this.SelectGridRow(firstRow);
        }
        
        this.TextFilter.isTextDown = false;
    }
}
*/


function LC_OnStartEditClick() {
    if (this.IsMultiple || this.IsDefaultText)
        this.StartEdit(this.TextBlurDisabled);
    if (this.TextBlurDisabled)
        this.TextBlurDisabled = false;
}

function LC_ShowTextFilter() {
    //отключен return при Disabled, поскольку схлопывается контрол в полосочку.
    /*
    if(this.Disabled)
        return;
    */
    if (!this.IsDropDownList) {
        this.TextFilter.style.display = '';
    }
}

//debugger
function LC_StartEdit(directly) {
    if (this.Disabled)
        return;
    if (!this.IsDropDownList && (!this.IsTextFocused || directly)) {
        this.ClearDefaultText();
        this.ShowTextFilter();
        this.TextFilter.value = '';
        this.TextFilter.focus();
        this.IsTextEdit = true;
        this.IsTextFocused = true;

        if (window.ListControl_CheckingControls == null)
            window.ListControl_CheckingControls = {};
        window.ListControl_CheckingControls[this.UniqueID] = this;
    }
}

function LC_HideEdit() {
    if (this.TextFilter != null && this.ControlsCount > 0 && !this.States.GridOpened) {
        this.TextFilter.style.display = 'none';
        this.TextFilter.value = '';
        this.IsTextEdit = false;
    }
}


////////////////////////////////////////////////////////
////////////////////////Grid////////////////////////////

function LC_CheckGrid() {
    var thisObj = this;
    if (this.Grid == null) {
        this.Grid = window.document.createElement('div');
        this.GridChildHolder = this.Grid;
        this.IsGridTable = false;
        this.Grid.className = 'lc_divContextItems';
        this.ContextDiv.appendChild(this.Grid);
        var thisObj = this;
        //this.Grid.onkeydown = function(evt){ thisObj.OnGridMove(evt); }
        //this.Grid.onblur = function(evt){ thisObj.OnGridBlur(evt); }
        this.Grid.onselectstart = function () { return false; }
        this.Grid.oncontextmenu = function (evt) { return LC_CancelBubbleEvent(evt); }

        this.IsEmptyGrid = true;
    }
    this.ContextDiv.onmousedown = function () { thisObj.States.IsContextMouseDown = true; }
}

function LC_CheckEmptyRows() {

    if (this.Grid != null) {
        this.Grid.Control = this;
        if (!this.IsGridTable) {
            var gridChildren = this.GetGridChildren();
            var len = gridChildren.length;
            this.IsEmptyGrid = false;
            this.HasEmptyRow = false;
            if (len == 0) {
                this.IsEmptyGrid = true;
                if (!this.InsertEmptyRowDisabled) {
                    var emptyRow = window.document.createElement('div');
                    emptyRow.className = 'lc_emptyValue';
                    emptyRow.innerHTML = window.TN.TranslateKey('ListControl.NoValuesAvailable');
                    emptyRow.IsEmptyRow = true;
                    this.HasEmptyRow = true;
                    this.Grid.appendChild(emptyRow);
                }
            }
            else if (len == 1) {
                var firstRow = gridChildren[0];
                if (firstRow.IsEmptyRow) {
                    this.HasEmptyRow = true;
                    this.IsEmptyGrid = true
                }
            }
        }
        else {
            var len = this.Grid.rows.length;
            this.IsEmptyGrid = false;
            this.HasEmptyRow = false;
            if (len == 0) {
                this.IsEmptyGrid = true;
                if (!this.InsertEmptyRowDisabled) {
                    var emptyRow = this.Grid.insertRow(-1);
                    emptyRow.className = 'lc_emptyValue';
                    emptyRow.IsEmptyRow = true;
                    var emptyCell = emptyRow.insertCell(-1);
                    //emptyCell.className = 'lc_selectionCell';
                    $(emptyCell).text(window.TN.TranslateKey('ListControl.NoValuesAvailable'));
                    this.HasEmptyRow = true;
                }
            }
            else if (len == 1) {
                var firstRow = this.Grid.rows[0];
                if (firstRow.IsEmptyRow) {
                    this.HasEmptyRow = true;
                    this.IsEmptyGrid = true
                }
            }
        }
    }

}

//debugger
function LC_InitGrid() {
    this.CheckGrid();
    if (this.Grid != null) {
        this.Grid.Control = this;
        this.CheckEmptyRows();
    }
}

function LC_SetSelectionGrid(gridHTML) {
    if (window.SM.IsNE(gridHTML))
        gridHTML = '';
    this.ContextDiv.innerHTML = gridHTML;
    this.Grid = this.ContextDiv.children[0];
    this.IsGridTable = this.Grid.tagName.toLowerCase() == 'table';
    this.GridChildHolder = this.IsGridTable ? this.Grid.children[0] : this.Grid;
    this.IsEmptyGrid = false;
    this.HasEmptyRow = false;
    this.InitGrid();
    this.CheckGridWidth();
    this.SetGridPosition();
}

//сделать установку признака this.OveredRowsCount
function LC_OnRowOver(selectedRow) {
    this.OveredRowsCount++;
    this.SelectGridRow(selectedRow)
}

function LC_OnRowOut(selectedRow) {
    this.OveredRowsCount--;
}

function LC_OpenContextGridTimeout(controlID, pn) {
    var listControl = GetListControl(controlID);
    if (listControl != null) {
        if (!listControl.States.GridDirectlyOpened) {
            listControl.States.TimeoutOpening = true;
            listControl.OpenContextGridInternal(pn);
        }
    }
}

//debugger
function LC_OpenContextGridInternal(pn) {
    if (pn != this.PressNumber)
        return;
    this.PressNumber++;

    //перегружаем этот метод
    if (!this.States.GridFocused) {
        this.OpenContextGrid();
    }
}

function LC_OpenContextGrid() {
    this.ShowGrid();
}

//debugger
function LC_ShowGrid() {
    this.OpenGrid();
    if (this.States.DirectlyDown && this.States.GridOpened)
        this.OnGridMove();
}


function LC_FocusGrid() {
    if (this.Grid != null) {
        this.States.GridFocused = true;
        this.IsTextFocused = false;
    }
}

function LC_BlurGrid() {
    if (this.Grid != null)
        this.States.GridFocused = false;
}

function LC_SelectGridRow(selectedRow) {
    if (selectedRow == null)
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'selectedRow'));

    var canSelect = true;
    if (this.CurrentRow != null) {
        var isCurrentRow = this.IsGridTable ? this.CurrentRow.rowIndex == selectedRow.rowIndex : this.CurrentRow == selectedRow;
        if (!isCurrentRow)
            this.UnSelectGridRow(this.CurrentRow);
        else
            canSelect = false;
    }

    if (canSelect) {
        selectedRow.className = 'lc_selectedRow';
    }

    this.CurrentRow = selectedRow;
}

function LC_UnSelectGridRow(selectedRow) {
    selectedRow.className = '';
    this.CurrentRow = null;
}

function LC_GetGridChildren() {
    //возвращаем пустой массив, если GridChildHolder недоступен.
    if (this.GridChildHolder == null)
        return [];

    //сделана выборка детей грида, исключая вставленные невыбираемые html-элементы.
    if (this.GridChildHolder.children.length > 0)
        return $(this.GridChildHolder).children(':not([NotContextItem])');
    else
        return $(this.GridChildHolder).children();
}

//debugger
function LC_OnGridMove(evt) {

    if (evt == null) evt = window.event;
    var ck = evt.keyCode;

    if (this.IsEmptyGrid && (ck == 40 || ck == 34 || ck == 38 || ck == 33 || this.States.DirectlyDown)) {
        if (this.TextFilter != null)
            var filterValue = this.TextFilter.value;
        this.BlurGrid();
        this.StartEdit();
        if (this.TextFilter != null)
            this.TextFilter.value = filterValue;
        return false;
    }

    if (ck == 27) {
        this.OnGridBlur();
        return false;
    }

    var gridChildren = this.GetGridChildren();
    var len = gridChildren.length;
    if (len > 0) {
        if (this.CurrentRow == null) {
            if (ck == 40 || ck == 34 || this.States.DirectlyDown) {
                var firstRow = gridChildren[0];
                this.SelectGridRow(firstRow);
            }
            else if (ck == 38 || ck == 33) {
                var firstRow = gridChildren[gridChildren.length - 1];
                this.SelectGridRow(firstRow);
            }
        }
        else {
            /*
            var prev = this.CurrentRow.previousSibling;
            var next = this.CurrentRow.nextSibling;
            */
            var currentIndex = gridChildren.index($(this.CurrentRow));
            //SM.WriteLog(currentIndex);
            if (currentIndex == -1) {
                //заново выбираем первую строку.
                currentIndex = 0;
                var firstRow = gridChildren[currentIndex];
                this.SelectGridRow(firstRow);
            }
            var prev = gridChildren[currentIndex - 1];
            var next = gridChildren[currentIndex + 1];

            if (prev != null && prev.tagName != this.CurrentRow.tagName)
                prev = null;
            var next = this.CurrentRow.nextSibling;
            if (next != null && next.tagName != this.CurrentRow.tagName)
                next = null;

            if (ck == 40 || ck == 38 || ck == 33 || ck == 34 || ck == 13) {
                var nextRow = null;
                if (ck == 40) {
                    //если есть следующий
                    if (next)
                        nextRow = next;
                }
                else if (ck == 38) {
                    //если есть предыдущий
                    if (prev)
                        nextRow = prev;
                    else {
                        this.UnSelectGridRow(gridChildren[0]);
                        this.IsKeyUp = true;
                        if (this.TextFilter != null)
                            var filterValue = this.TextFilter.value;
                        this.BlurGrid();
                        this.StartEdit();
                        this.IsKeyUp = false;
                        if (this.TextFilter != null)
                            this.TextFilter.value = filterValue;
                    }
                }
                else if (ck == 33)
                    nextRow = gridChildren[0];
                else if (ck == 34)
                    nextRow = gridChildren[len - 1];
                else if (ck == 13) {
                    this.SetResultRow(this.CurrentRow);
                    if (this.IsMultiple)
                        this.StartEdit();
                    LC_CancelBubbleEvent(evt);
                }
                if (nextRow != null) {
                    this.SelectGridRow(nextRow);
                }
            }
        }
        LC_CancelBubbleEvent(evt);
    }
}
//debugger

function LC_OnGridBlur(evt) {
    if (evt == null) evt = window.event;
    var mouseX = 0;
    var mouseY = 0;
    if (evt != null) {
        mouseX = evt.clientX + window.SM.GetScrollLeft();
        mouseY = evt.clientY + window.SM.GetScrollTop();
    }

    var positionControl = this.ContextDiv;
    var positionOffset = $(positionControl).offset();

    var left = positionOffset.left;
    var top = positionOffset.top;
    var right = left + positionControl.offsetWidth;
    var bottom = top + positionControl.offsetHeight;

    var isOverPositionControl = mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom;

    if ((!this.IsGridRowClick || !isOverPositionControl) && !this.IsDropMouseDown && !this.IsKeyUp) {
        this.HideGrid();
        if (this.TextFilter != null) {
            this.TextFilter.value = '';
            if (!this.IsTextFocused)
                this.HideEdit();
        }
    }
}

//debugger
function LC_SetResultRow(selectedRow) {
    this.IsSetResult = true;

    var rowValue = this.GetGridRowValue(selectedRow);
    /*
    if (rowValue == null)
        throw new Error('Не удалось получить значение выпадающего списка для строки ' + selectedRow.rowIndex + ' ' + selectedRow.innerText);
    */

    if (rowValue != null) {
        var valueKey = this.GetGridValueKey(rowValue);
        if (window.SM.IsNE(valueKey))
            throw new Error('Идентификатор строки выпадающего списка не может быть пустым.');

        valueKey = valueKey.toString();
        selectedRow.ValueKey = valueKey;
        var isSelected = this.SelectedRows[valueKey];
        if (!isSelected) {
            this.UnSelectGridRow(selectedRow);

            this.SetValue(rowValue);

            if (this.OnSetGridValue != null)
                this.OnSetGridValue(rowValue);
        }
        this.ResultDiv.style.display = 'block';

    }

    this.HideGrid();

    if (!this.IsMultiple) {
        this.HideEdit();
        if (this.CurrentResultControl != null && this.CurrentResultControl.offsetWidth > 0) {
            this.CurrentResultControl.tabIndex = 0;

            var linkControls = $(this.CurrentResultControl).find('a');
            if (linkControls.length > 0) {
                var linkControl = linkControls[0];
                linkControl.tabIndex = -1;
            }

            this.CurrentResultControl.focus();
        }
    }
    else
        this.StartEdit();

    this.IsSetResult = false;
    this.IsGridRowClick = false;
}

function LC_OnRowDown(selectedRow) {
    this.IsGridRowClick = true;
}

function LC_CreateResultControl(rowValue) {
    var resultControl = window.document.createElement('div');
    resultControl.className = 'lc_divValue';

    if (this.RemovableValue) {
        var divDeleteValue = window.document.createElement('div');
        divDeleteValue.className = 'lc_divDeleteValue';
        if (!SM.DTD)
            divDeleteValue.style.left = '-14px';
        this.InitDeleteValueControl(divDeleteValue, rowValue);
        resultControl.appendChild(divDeleteValue);
    }
    var divValueContent = window.document.createElement('div');
    divValueContent.className = 'lc_divValueContent';
    resultControl.appendChild(divValueContent);

    var valueControl = this.CreateValueControl(rowValue, resultControl);
    if (valueControl == null)
        throw new Error('Не удалось создать контрол значения');
    $(valueControl).mouseover(function () {
        LC_CheckLongTitle(valueControl);
    });
    divValueContent.appendChild(valueControl);

    return resultControl;
}

function LC_CheckLongTitle(longTitleElement, defaultTitle) {
    if (!longTitleElement.titleChecked) {
        if (longTitleElement.parentNode.scrollWidth > longTitleElement.parentNode.offsetWidth)
            longTitleElement.title = defaultTitle != null ? defaultTitle : (longTitleElement.innerText != null ? longTitleElement.innerText : longTitleElement.textContent);
        longTitleElement.titleChecked = true;
    }
}

function LC_InitDeleteValueControl(divDeleteValue, rowValue) {
    var thisObj = this;
    var controlValue = rowValue;
    var deleteControl = divDeleteValue;
    deleteControl.onclick = function (evt) {
        thisObj.ClearValue(controlValue, true);
        LC_CancelBubbleEvent(evt);
    }
}

function LC_InitMoveValueControl(divMoveValue, up) {
}

function LC_CreateValueControl(rowValue) {
    var lookupText = rowValue.Text;
    if (window.SM.IsNE(lookupText))
        lookupText = window.TN.TranslateKey('ListControl.TitleUndefined');
    var valueControl = window.document.createElement('span');
    $(valueControl).text(lookupText);
    valueControl.className = 'lc_label';
    return valueControl;
}

function LC_CancelBubbleEvent(evt) {
    if (evt == null) evt = window.event;
    evt.cancelBubble = true; evt.returnValue = false;
    return false;
}

function LC_CheckGridWidth() {
    if (this.Grid.offsetWidth < this.ControlDiv.offsetWidth || this.WrapGrid)
        this.Grid.style.width = (this.ControlDiv.offsetWidth - 4) + 'px';
}

//debugger
function LC_SetGridPosition() {
    //обнуляем позицию вып. списка.
    this.ContextDiv.style.top = '0px';

    var contextOffset = $(this.ContextDiv).offset();
    var topDown = 0;
    var topUp = -(this.ContextDiv.offsetHeight + this.ControlDiv.offsetHeight - 2);

    var topPixel = contextOffset.top + topUp - 1;
    var bottomPixel = contextOffset.top + this.ContextDiv.offsetHeight;
    var screenTop = window.SM.GetScrollTop();
    var screenBottom = screenTop + window.SM.GetClientHeight();

    //открываем вниз всегда когда нижняя точка попадает в экран, или видимого места внизу больше чем вверху
    //или верхняя абсолютная точка улетает за экран (имеет отрицательную координату)
    //отладил на трех браузерах на всех случаях - работает (проверял только с DTD).
    if (bottomPixel <= screenBottom || (screenBottom - bottomPixel >= topPixel - screenTop) || topPixel < 0)
        this.ContextDiv.style.top = topDown + 'px';
    else
        this.ContextDiv.style.top = topUp + 'px';
}

//debugger
function LC_OpenGrid() {
    this.States.GridDirectlyOpened = false;
    this.States.DirectlyDown = false;
    this.States.TimeoutOpening = false;

    this.InitGrid();
    if (!this.States.GridOpened && this.Grid != null) {
        var filterValue = null;
        if (this.TextFilter != null)
            filterValue = this.TextFilter.value;
        if (!window.SM.IsNE(filterValue) || this.IsDropDownList) {


            if (window.ListControl_CheckingControls == null)
                window.ListControl_CheckingControls = {};
            window.ListControl_CheckingControls[this.UniqueID] = this;

            this.ContextHolderDiv.style.display = 'block';
            if (this.IsEmptyGrid && !this.HasEmptyRow)
                this.Grid.style.height = '0px';
            this.CheckGridWidth();
            this.SetGridPosition();
            this.States.GridOpened = true;
            this.CurrentRow = null;
            if (this.IsDropDownList)
                this.ControlDiv.focus();
        }
        else {
            this.HideGrid();
        }
    }
}

//debugger
function LC_ClearValue(rowValue, isUserEvent) {
    if (this.Disabled && isUserEvent)
        return;

    var valueKey = this.GetGridValueKey(rowValue);
    var deletingValue = this.SelectedValuesByKey[valueKey];
    var resultControl = deletingValue.ResultControl;
    this.ControlsCount--;
    if (this.ControlsCount == 0)
        this.SetDefaultText();
    if (!this.IsMultiple) {
        resultControl = this.CurrentResultControl;
        this.CurrentResultControl = null;
    }
    if (resultControl != null)
        resultControl.style.display = 'none';
    if (!this.IsMultiple || this.ControlsCount == 0) {
        this.ResultDiv.style.display = 'none';
        this.ResultDiv.innerHTML = '';
    }
    /*else if (this.IsMultiple && this.ControlsCount > 0) {
        var i, len = this.ResultDiv.children.length;
        for (i = 0; i < len; i++) {
            var resultLinkControl = this.ResultDiv.children[i];
            if (resultLinkControl.style.display != 'none') {
                resultLinkControl.style.marginTop = '0px';
                break;
            }
        }
    }*/
    this.SelectedRows[resultControl.ValueKey] = false;
    var newSelectedValues = new Array();
    var newMultiValue = new Array();
    var i, len = this.SelectedValues.length;
    for (i = 0; i < len; i++) {
        var controlValue = this.SelectedValues[i];
        if (controlValue.ValueKey != valueKey) {
            newSelectedValues.push(controlValue);
            if (this.IsMultiple)
                newMultiValue.push(controlValue.Value);
        }
    }

    this.SelectedValues = newSelectedValues;
    if (!this.IsMultiple)
        this.Value = null;
    else
        this.Value = newMultiValue;

    if (this.ControlsCount == 0) {
        if (isUserEvent)
            this.StartEdit(true);
        else
            this.ShowTextFilter();
        if (this.IsDropDownList && !this.IsDefaultText)
            this.DropDownDiv.style.display = '';
    }

    this.HideGrid();

    this.IsDeletingValue = true;
    if (this.OnDeleteValue != null)
        this.OnDeleteValue(resultControl.Value, isUserEvent);
    this.IsDeletingValue = false;
}

//debugger
function LC_HideGrid() {
    this.ContextHolderDiv.style.display = 'none';
    this.States.GridOpened = false;
    this.BlurGrid();
    if (this.CurrentRow != null)
        this.UnSelectGridRow(this.CurrentRow);

    if (this.IsDropDownList)
        this.OnDropDownOut();
}


function LC_AddGridRow(text, value, control) {
    if (window.SM.IsNE(text))
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'text'));
    if (window.SM.IsNE(value))
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'value'));
    this.CheckGrid();
    if (this.HasEmptyRow) {
        this.Grid.innerHTML = '';
        this.HasEmptyRow = false;
    }
    var trGrid = null;
    if (this.IsGridTable)
        trGrid = this.Grid.insertRow(-1);
    else
        trGrid = window.document.createElement('div');
    var thisObj = this;
    trGrid.onmouseover = function () { thisObj.OnRowOver(trGrid); }
    trGrid.onmouseout = function () { thisObj.OnRowOut(trGrid); }
    trGrid.onmousedown = function () { thisObj.OnRowDown(trGrid); }
    trGrid.onclick = function () { thisObj.SetResultRow(trGrid); }
    trGrid.Value = new LCRowSimpleValue(text, value);
    if (this.IsGridTable) {
        var tdGrid = trGrid.insertCell(-1);
        if (control == null)
            $(tdGrid).text(text);
        else
            tdGrid.appendChild(control);
    }
    else {
        if (control == null)
            $(trGrid).text(text);
        else
            trGrid.appendChild(control);
        this.Grid.appendChild(trGrid);
    }
    return trGrid;
}

function LC_GetGridValueKey(rowValue) {
    if (rowValue == null)
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'rowValue'));
    var valueKey = null;
    if (typeof (rowValue) != 'string') {
        var value = rowValue.Value;
        if (value != null)
            valueKey = value;
    }
    else
        valueKey = rowValue;

    if (!window.SM.IsNE(valueKey))
        valueKey = valueKey.toString();

    return valueKey;
}

function LC_GetGridRowValue(row) {
    if (row == null)
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'row'));
    var value = row.Value;
    if (value == null && row.cells.length > 0) {
        var text = $(row.cells[0]).text();
        value = new LCRowSimpleValue(text, text);
    }
    return value;
}

function LCRowSimpleValue(text, value) {
    if (window.SM.IsNE(text))
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'text'));
    if (window.SM.IsNE(value))
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'value'));
    this.Text = text;
    this.Value = value;
}

function LCRowValue(valueKey, value) {
    if (window.SM.IsNE(valueKey))
        throw new Error(SM.SR(window.TN.TranslateKey('ListControl.EmptyParamException'), '{ParamName}', 'valueKey'));
    this.ValueKey = valueKey;
    this.Value = value;
}

//debugger
function LC_SetValue(rowValue) {
    if (rowValue != null) {
        var valueKey = this.GetGridValueKey(rowValue);
        this.SelectedRows[valueKey] = true;
        var controlValue = new LCRowValue(valueKey, rowValue);
        var resultControl = this.CreateResultControl(rowValue);
        if (resultControl != null) {
            this.ControlsCount++;
            this.ClearDefaultText();
        }

        if (!this.IsMultiple) {
            if (this.CurrentResultControl != null) {
                this.IsDeletingPreviousValue = true;
                this.ClearValue(this.CurrentResultControl.Value);
                this.IsDeletingPreviousValue = false;
            }
            this.CurrentResultControl = resultControl;
        }

        /*if (this.ControlsCount == 1)
            resultControl.style.marginTop = '0px';*/

        this.ResultDiv.appendChild(resultControl);

        if (!this.IsMultiple)
            this.Value = rowValue;
        else
            this.Value.push(rowValue);
        this.SelectedValues.push(controlValue);
        this.SelectedValuesByKey[valueKey] = controlValue;
        resultControl.Value = rowValue;
        resultControl.ValueKey = valueKey;
        controlValue.ResultControl = resultControl;

        if (this.ResultDiv.style.display != 'block')
            this.ResultDiv.style.display = 'block';
        if (this.IsDropDownList && !this.IsDefaultText)
            this.DropDownDiv.style.display = 'none';
    }
    else {
        var i, len = this.SelectedValues.length;
        var toDelete = new Array();
        for (i = 0; i < len; i++) {
            var value = this.SelectedValues[i];
            if (value != null)
                toDelete.push(value);
        }
        while (toDelete.length > 0) {
            var value = toDelete.shift();
            this.ClearValue(value.Value);
        }

    }

    if (!this.IsSetResult)
        this.HideEdit();
}

//debugger
function LC_Disable() {
    this.ChangeDisableState(true);
}

function LC_Enable() {
    this.ChangeDisableState(false);
}

//debugger
function LC_ChangeDisableState(disabled) {
    this.Disabled = disabled;
    if (this.Disabled)
        $(this.Container).addClass('lc_disabled');
    else
        $(this.Container).removeClass('lc_disabled');
    if (this.TextFilter != null)
        this.TextFilter.readOnly = disabled;
}

//////////////////////////////////////////////////
//////////////////Common Methods//////////////////
var lc_canWrite = true;
function LC_WriteLog(message) {
    if (lc_canWrite)
        window.SM.WriteLog(message);
}