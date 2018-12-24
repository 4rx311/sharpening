//parentPopupLevel - уровень родительского окна (необязательный параметр)
function PopupWindow(parentPopupLevelParam, canSelectTextParam) {
    var thisObj = this;

    //Methods
    this.IsOpen = false;
    this.Open = PPW_Open;
    this.HideInternal = PPW_HideInternal;
    this.CenterPosition = PPW_CenterPosition;
    this.CenterPositionInternal = PPW_CenterPositionInternal;
    this.HidePopupWindow = PPW_HidePopupWindow;
    this.Hide = PPW_HidePopupWindow;
    this.ChangeWindowCoordinatesByLevel = PPW_ChangeWindowCoordinatesByLevel;
    this.GetElement = PPW_GetElement;

    //проставляем уровень родительского ParentPopupLevel
    this.ParentPopupLevel = window.SM.ParseInt(parentPopupLevelParam);

    //Initialization
    this.Table = window.document.createElement('table');
    this.Table.border = 0;
    this.Table.cellPadding = 0;
    this.Table.cellSpacing = 0;
    this.Table.className = 'pp_table';
    this.Table.style.zIndex = parseInt(1000 * (this.ParentPopupLevel + 1)) + 1;
    //window.SM.DisableSelection(this.Table);

    //header
    this.HeaderRow = this.Table.insertRow(this.Table.rows.length);

    this.TopLeftCell = this.HeaderRow.insertCell(this.HeaderRow.cells.length);
    this.TopLeftCell.className = 'pp_top_left';
    this.TopLeftCell.innerHTML = "<div class='pp_border_h pp_border_w'></div>";

    this.TopMiddleCell = this.HeaderRow.insertCell(this.HeaderRow.cells.length);
    this.TopMiddleCell.className = 'pp_top_mid';
    this.TopMiddleCell.innerHTML = "<div class=' pp_border_h'></div>";

    this.TopRightCell = this.HeaderRow.insertCell(this.HeaderRow.cells.length);
    this.TopRightCell.className = 'pp_top_right';
    this.TopRightCell.innerHTML = "<div class=' pp_border_h  pp_border_w'></div>";


    //content
    this.MiddleRow = this.Table.insertRow(this.Table.rows.length);

    this.LeftMiddleCell = this.MiddleRow.insertCell(this.MiddleRow.cells.length);
    this.LeftMiddleCell.className = 'pp_left_mid';
    this.LeftMiddleCell.innerHTML = "<div class=' pp_border_w'></div>";

    this.ContentCell = this.MiddleRow.insertCell(this.MiddleRow.cells.length);
    this.ContentCell.className = 'pp_mid';
    this.ContentCell.innerHTML = "<div class='pp_content'></div>";
    this.ContentDiv = this.ContentCell.children[0];

    this.RightMiddleCell = this.MiddleRow.insertCell(this.MiddleRow.cells.length);
    this.RightMiddleCell.className = 'pp_right_mid';
    this.RightMiddleCell.innerHTML = "<div class=' pp_border_w'></div>";

    //footer
    this.FooterRow = this.Table.insertRow(this.Table.rows.length);

    this.BottomLeftCell = this.FooterRow.insertCell(this.FooterRow.cells.length);
    this.BottomLeftCell.className = 'pp_bottom_left';
    this.BottomLeftCell.innerHTML = "<div class='pp_border_h  pp_border_w'></div>";

    this.BottomMiddleCell = this.FooterRow.insertCell(this.FooterRow.cells.length);
    this.BottomMiddleCell.className = 'pp_bottom_mid';
    this.BottomMiddleCell.innerHTML = "<div class='pp_border_w'></div>";

    this.BottomRightCell = this.FooterRow.insertCell(this.FooterRow.cells.length);
    this.BottomRightCell.className = 'pp_bottom_right';
    this.BottomRightCell.innerHTML = "<div class='pp_border_h  pp_border_w'></div>";

    window.document.body.appendChild(this.Table);

    //PW_DragMaster.makeDraggable(thisObj.Table);
    this.InitializeDrag = PPW_InitializeDrag;
    this.Table.onmousedown = function(e) { thisObj.InitializeDrag(e, thisObj.TopMiddleCell); }

    //disable выделения IE, Chrome
    var canSelectText = false;
    if (canSelectTextParam != null) canSelectText = canSelectTextParam;
    this.CanSelectText = canSelectText;
    this.ApplyCancelSelect = PPW_ApplyCancelSelect;
    this.ApplyCancelSelect();
}

function PPW_ApplyCancelSelect()
{
    var thisObj = this;
    if (!this.CanSelectText)
    {
        //устанавливаем запрет выделения
        if (!window.SM.IsFF)
        {
            var cancelSelectContentFunc = function (e) { return CancelSelectContent(e, thisObj); }
            this.CancelSelectContent = cancelSelectContentFunc;
            window.document.body.onselectstart = cancelSelectContentFunc;
        }
        else
        {
            this.CancelSelection = PPW_CancelSelectionFF;
        }
    }
    else
    {
        //отключаем запрет выделения, если он был
        if (!window.SM.IsFF)
            window.document.body.onselectstart = null;
        else
        {
            this.CancelSelection = null;
            this.Table.style.MozUserSelect = '';
            window.document.body.style.MozUserSelect = '';
        }
    }
}

function PPW_GetElement(elementID)
{
    if (SM.IsNE(elementID))
        throw new Error('Не задан парметр elementID.');
    element = $(this.ContentDiv).find('#' + elementID)[0];
    return element;
}

function PPW_CancelSelectionFF() {
    //если есть хотя бы одно открытое окно, то
    var hasOpenWindow = false;
    var currentVal = window.document.body.style.MozUserSelect;
    if (window.PopupWindows != null) {
        for (var i = 0; i < window.PopupWindows.length; i++)
            if (window.PopupWindows[i].IsOpen) hasOpenWindow = true;
    }
    if (hasOpenWindow && currentVal != '-moz-none') {
        window.document.body.style.MozUserSelect = '-moz-none';
    }
    else
        if (!hasOpenWindow && currentVal != null)
        window.document.body.style.MozUserSelect = null;
    this.Table.style.MozUserSelect = '-moz-none';
}

function CancelSelectContent(e, popupWindow)
{

    if (!popupWindow.IsOpen) {
        return true;
    }
    
    e = e || window.event;
    var activeElement = e.srcElement;
    if (!SM.IsIE) activeElement = e.target;
    if (activeElement == null) {
        return false;
    }

    var tagName = activeElement.tagName;
    //пустое значение для текста-заголовка в хроме
    if (tagName != null) tagName = tagName.toLowerCase();
    
    var type = activeElement.type;
    if (type != null) type = type.toLowerCase();

    var elPos = GetElementCoordinates(activeElement);
    if (elPos != null) {
        var bcr = popupWindow.ContentDiv.getBoundingClientRect();
		//находимся во вне всплывающего окна
        if (elPos.y >= (bcr.top) && elPos.y <= (bcr.bottom) && elPos.x >= (bcr.left) &&
            elPos.x <= (bcr.right))
        {
			//текстовое поле
			if(tagName == "input" && type == "text" || tagName == "textarea")
				return true;
        }
        //внутри всплывающего окна
        else
        {
			//текстовое поле
			if(tagName == "input" && type == "text" || tagName == "textarea")
				return true;
        }
    }
    return false;
}

function GetElementCoordinates(el) {
    var elPos = { x: 0, y: 0 };
    if (el.offsetParent) {
        elPos.x = el.offsetLeft;
        elPos.y = el.offsetTop;

        while (el = el.offsetParent) {
            elPos.x += el.offsetLeft;
            elPos.y += el.offsetTop;
        }
    }
    return elPos;

}

function IsPopupWindowsInArray(parentPopupLevelParam) {
    var parentPopupLevel = SM.ParseInt(parentPopupLevelParam);

    if (window.PopupWindows == null) window.PopupWindows = new Array();

    //максимальный index
    var maxIndex = window.PopupWindows.length;
    //добавляем новый элемент в массив
    if (maxIndex == parentPopupLevel) {
        return false;
    }
    else {
        if (maxIndex < parentPopupLevel)
            throw new Error("Вызов окна с большим parentPopupLevel чем максимальный. parentPopupLevel = " + parentPopupLevel + ", максимальный parentPopupLevel " + maxIndex);
        else {
            //если объект уже есть в коллекции PopupWindow - возвращаем его
            if (maxIndex > parentPopupLevel) {
                var tmpObj = window.PopupWindows[parentPopupLevel];
                if (tmpObj != null) return true;
                else {
                    throw new Error("Объект PopupWindow с уровнем " + parentPopupLevel + " = null");
                }
            }
        }
    }
}

function GetPopupWindow(parentPopupLevelParam) {
    if (window.PopupWindows == null) window.PopupWindows = new Array();

    var parentPopupLevel = window.SM.ParseInt(parentPopupLevelParam);

    //есть ли объект в массисе окон
    var isPopupWindowsInArray = IsPopupWindowsInArray(parentPopupLevel);
    if (isPopupWindowsInArray)
    {
        return window.PopupWindows[parentPopupLevel];
    }
    else
    {
        var popupWindow = new PopupWindow(parentPopupLevel);
        window.PopupWindows.push(popupWindow);
        return popupWindow;
    }

}

function OpenPopupWindow(url, w, h, contentMargin, parentPopupLevelParam, isPost, canSelectTextParam) {
    var popup = window.GetPopupWindow(parentPopupLevelParam);
    if (popup == null)
        throw new Error("Функция GetPopupWindow вернула null");

    //закрываем все открытые окна из текущего level
    var parentPopupLevel = window.SM.ParseInt(parentPopupLevelParam);
    var nextChildPopupLevel = parentPopupLevel + 1;

    if (IsPopupWindowsInArray(nextChildPopupLevel)) {
        var nextChildPopup = window.GetPopupWindow(nextChildPopupLevel);
        if (nextChildPopup != null)
            nextChildPopup.HidePopupWindow();
    }


    var canSelectText = false;
    if (canSelectTextParam != null) canSelectText = canSelectTextParam;
    popup.CanSelectText = canSelectText;
    popup.ApplyCancelSelect();

    //открываем окошко
    popup.Open(url, w, h, contentMargin, isPost);
}

function HidePopupWindow(parentPopupLevelParam) {
    var popup = GetPopupWindow(parentPopupLevelParam);
    if (popup == null)
        throw new Error("Функция GetPopupWindow вернула null");
    popup.HidePopupWindow();
}

function PPW_HidePopupWindow() {
    //смотрим какие окна открыты и закрываем все окна с большим parentPopupLevel
    var thisParentPopupLevel = this.ParentPopupLevel;
    if (window.PopupWindows == null) return;
    for (var i = window.PopupWindows.length - 1; i >= thisParentPopupLevel; i--) {
        var tmpPopupWin = window.PopupWindows[i];
        tmpPopupWin.HideInternal();
    }
}

function PPW_Open(url, w, h, contentMargin, isPost) {
    if (window.SM.IsNE(w))
        throw new Error('Параметр w не может быть пустым.');
    if (window.SM.IsNE(h))
        throw new Error('Параметр h не может быть пустым.');

    w = parseInt(w.toString().split('px')[0]);
    h = parseInt(h.toString().split('px')[0]);

    if (w == 0)
        throw new Error('Параметр w должен быть отличен от 0.');
    if (h == 0)
        throw new Error('Параметр h должен быть отличен от 0.');

    //Адаптация для мобильных устройств
    //если высота окна больше высоты экрана то заменяется на экранную высоту
    if (SM.IsMobileDevice) {
        var windowHeight;
        if (self.innerHeight) { // all except Explorer
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowHeight = document.body.clientHeight;
        }

        h = (windowHeight < h) ? windowHeight : h;
    }

    if (contentMargin != null) {
        contentMargin = contentMargin.split('!important')[0];
        this.ContentDiv.style.margin = contentMargin;
    }

    //var contentDivW = w - (window.SM.ParseIntMetric(window.SM.GetCurrentStyle(this.ContentDiv).marginLeft) + window.SM.ParseIntMetric(window.SM.GetCurrentStyle(this.ContentDiv).marginRight));
    var contentDivH = h - (window.SM.ParseIntMetric(window.SM.GetCurrentStyle(this.ContentDiv).marginTop) + window.SM.ParseIntMetric(window.SM.GetCurrentStyle(this.ContentDiv).marginBottom));

    //this.ContentDiv.style.width = contentDivW + 'px';
    this.ContentDiv.style.height = contentDivH + 'px';

    this.ContentCell.style.width = w + 'px';
    //this.ContentCell.style.height = h + 'px';

    //this.CenterPositionInternal(w, h, true);
    //this.ChangeWindowCoordinatesByLevel();
    this.ContentDiv.innerHTML = '';
    this.Table.style.display = 'block';

    if (this.ParentPopupLevel == 0) this.CenterPosition(true);
    if (this.ParentPopupLevel >= 1) this.ChangeWindowCoordinatesByLevel();
    this.IsOpen = true;
    if (window.SM.IsFF && !this.CanSelectText) this.CancelSelection();

    //получение html через ajax
    if (url.indexOf('?') != -1)
        url += '&rndPopup=' + Math.random().toString();
    else
        url += '?rndPopup=' + Math.random().toString();
    url += '&parentPopupLevel=' + this.ParentPopupLevel;

    var contentDiv = this.ContentDiv;

    this.Url = url;
    this.ContentDiv.setAttribute('parentPopupLevel', this.ParentPopupLevel.toString());
    var ajax = window.SM.GetXmlRequest();
    var postParams = null;
    if(!isPost)
        ajax.open("GET", url, true);
    else
    {
        var splUrl = url.split('?');
        var postUrl = splUrl[0] + '?rndPost=' + Math.random();
        postParams = splUrl[1];
        
        ajax.open("POST", postUrl, true);
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }

    var thisObj = this;
    ajax.onreadystatechange = function() 
    {
        if (ajax.readyState == 4 && ajax.status == 200) 
        {
            ajax.onreadystatechange = new Function();
            var response = ajax.responseText;
            thisObj.ContentDiv.innerHTML = response;
            //вызов скриптов для открываемого окна
            window.SM.InvokeScripts(contentDiv);
            if (thisObj.ParentPopupLevel == 0) thisObj.CenterPosition(true);
            if (thisObj.ParentPopupLevel >= 1) thisObj.ChangeWindowCoordinatesByLevel();
        }
    }
    ajax.send(postParams);
}

function PPW_CenterPosition(withVertical) {
    this.CenterPositionInternal(this.Table.offsetWidth, this.Table.offsetHeight, withVertical);
}

function PPW_CenterPositionInternal(w, h, withVertical) {
    var clientW = PPW_GetClientWidth(); //   Ширина клиента
    var clientH = PPW_GetClientHeight();    //   Высота клиента

    var offsetX = Math.abs(clientW / 2 - w / 2);    //   Сдвиг по оси X
    var offsetY = PPW_GetScrollTop() + 70;  //   Сдвиг по оси Y

    var xPos = (PPW_GetClientWidth() - w) / 2;
    this.Table.style.left = offsetX + 'px';

    if (withVertical) {
        var yPos = PPW_GetScrollTop() + 70;
        this.Table.style.top = offsetY + 'px';
    }
}

function PPW_ChangeWindowCoordinatesByLevel() {
    //получаем таблицу более высокого уровня
    var popupLevel = this.ParentPopupLevel;
    //если уже открыто окно родительское окно, то координаты отсчитываем от него
    var table = this.Table;
    var isChildWindow = false;
    if (popupLevel >= 1) { popupLevel--; isChildWindow = true; }
    var parentPopupWindow = GetPopupWindow(popupLevel);
    if (parentPopupWindow != null)
        table = parentPopupWindow.Table;

    var initLeft = table.style.left.replace('px', '');
    if (popupLevel == 0 && !isChildWindow) initLeft = window.SM.GetScrollLeft(table);

    this.Table.style.left = (new Number(initLeft) + 25) + 'px';

    var initTop = table.style.top.replace('px', '');
    if (popupLevel == 0 && !isChildWindow) initTop = window.SM.GetScrollTop(table);

    this.Table.style.top = (new Number(initTop) + 25) + 'px';
}

function PPW_GetClientWidth() {
    var clientWidth = window.document.compatMode != 'CSS1Compat' ? window.document.body.clientWidth : window.document.documentElement.clientWidth;
    return clientWidth;
}

function PPW_GetClientHeight() {
    var clientHeight = window.document.compatMode != 'CSS1Compat' ? window.document.body.clientHeight : window.document.documentElement.clientHeight;
    return clientHeight;
}

function PPW_GetScrollTop() {
    var scrollTop = window.SM.GetScrollTop(window.document.body);
    //window.document.compatMode != 'CSS1Compat' ? window.document.body.scrollTop : window.document.documentElement.scrollTop;
    return scrollTop;
}

function PPW_GetScrollLeft() {
    var scrollLeft = window.SM.GetScrollLeft(window.document.body);
    //var scrollLeft = window.document.compatMode != 'CSS1Compat' ? window.document.body.scrollLeft : window.document.documentElement.scrollLeft;
    return scrollLeft;
}

function CenterPopupPosition(withVertical) {
    var popup = GetPopupWindow();
    if (popup == null) throw new Error("Функция GetPopupWindow вернула null");
    popup.CenterPosition(withVertical);
}

function PPW_HideInternal() {
    this.Table.style.display = 'none';
    this.ContentDiv.innerHTML = '';
    this.IsOpen = false;
    if (window.SM.IsFF && !this.CanSelectText) this.CancelSelection();


}

function PPW_IsDragScope(e, dragableObject) {
    var isDragScope = true;
    var bcr = dragableObject.getBoundingClientRect();
    
    //данные об активном элементе  
    e = e || window.event;  
    var activeElement = e.srcElement;
    if (!SM.IsIE) activeElement = e.target;
    var type = activeElement.type;
    if (type != null) type = type.toLowerCase();
    
    var tagName = activeElement.tagName;
    //пустое значение для текста-заголовка в хроме
    if (tagName != null) tagName = tagName.toLowerCase();
    //смотрим попали ли мы в ContentDiv (двигаемся из всплывающего окна)
    if (e.clientY >= bcr.top && e.clientY <= bcr.bottom && e.clientX >= bcr.left &&
         e.clientX <= bcr.right) isDragScope = false;
	
	//текстовое поле
	if(tagName == "input" && type== "text" || tagName == "textarea") isDragScope = false;
    
    return isDragScope;
}



function PPW_InitializeDrag(e, dragableObject) {

    e = e || window.event;
    var mouseX = e.clientX + PPW_GetScrollLeft();
    var mouseY = e.clientY + PPW_GetScrollTop();

    var thisObj = this;
    var tbPopup = this.Table;
    var tdLeftDrag = this.TopLeftCell;
    var tdRightDrag = this.BottomRightCell;
    var contentDiv = this.ContentDiv;

    var isDragScope = PPW_IsDragScope(e, contentDiv);
    if (isDragScope) {
        var thisObj = this;

        thisObj.Table.focus();
        thisObj.initMouseX = e.clientX;
        thisObj.initMouseY = e.clientY;
        thisObj.initTop = tbPopup.offsetTop;
        thisObj.initLeft = tbPopup.offsetLeft;
        thisObj.DragApproved = true;
        var mouseMoveFunc = function(ev) {
            if (thisObj.DragApproved) {
                ev = ev || window.event;
                tbPopup.style.top = (thisObj.initTop + ev.clientY - thisObj.initMouseY) + 'px';
                tbPopup.style.left = (thisObj.initLeft + ev.clientX - thisObj.initMouseX) + 'px';
            }
        }

        dragableObject.onmousemove = mouseMoveFunc;

        var mouseUpFunc = function(ev) {
            thisObj.DragApproved = false;

            if (window.removeEventListener) {
                // all browsers except IE before version 9
                window.removeEventListener("mousemove", mouseMoveFunc, true);
                window.removeEventListener("mouseup", mouseUpFunc, true);
                if (!window.SM.IsFF) window.removeEventListener("selectstart", thisObj.CancelSelectContent, true);
            }
            else {
                if (dragableObject.releaseCapture) {
                    // IE before version 9
                    dragableObject.releaseCapture();
                }
            }

            dragableObject.onmousemove = null;
        }


        dragableObject.onmouseup = mouseUpFunc;

        if (window.addEventListener) {
            // all browsers except IE before version 9
            window.addEventListener("mousemove", mouseMoveFunc, true);
            window.addEventListener("mouseup", mouseUpFunc, true);
            if (!window.SM.IsFF) window.addEventListener("selectstart", thisObj.CancelSelectContent, true);
        }
        else {
            if (dragableObject.setCapture) {
                // IE before version 9
                dragableObject.setCapture();
            }
        }

    }

    return;
}