//Тулбар (инициализируется сервером)
function DB_Toolbar(tblID, settings, delLinkID) {
    window.DBToolbar = this;
    this.Toolbar = window.document.getElementById(tblID);
    if (this.Toolbar.rows != null && this.Toolbar.rows.length > 0)
        this.ToolbarRow = this.Toolbar.rows[0];

    this.Settings = settings;

    //св-ва
    this.HideOnMouseOut = false;
    this.DeleteLinkID = delLinkID;
    this.Items = [];
    this.UniqueItems = [];
    this.ClientItems = [];
    this.ClientFirstItems = [];
    this.ItemIndex = 1;
    this.VisibleItemsCount = 3;
    if (settings.VisibleItemsCount > 0)
        this.VisibleItemsCount = settings.VisibleItemsCount;

    //функции
    this.DeleteItem = DBT_DeleteItem;
    this.InitItems = DBT_InitItems;
    this.AddSeparator = DBT_AddSeparator;

    this.AddMenuItem = DBT_AddMenuItem;
    this.AddToolbarItem = DBT_AddToolbarItem;
    this.RemoveItem = DBT_RemoveItem;
    this.Show = DBT_ShowMenu;
    this.Hide = DBT_HideMenu;
    this.InClientRect = DBT_InClientRect;
    this.InitHideEvent = DBT_InitHideEvent;
    this.Update = DBT_ReInitItems;

    //интерфейсы для внешнего кода
    this.AddFirstItem = DBT_AddFirstItem;
    this.AddItem = DBT_AddItem;

    this.InitItems();
    return this;
}

//добавляет элемент в тулбар в начало
function DBT_AddFirstItem(item, uniqueID) {
    if (window.SM.IsNullOrEmpty(uniqueID))
        alert('uniqueID is null at AddFirstItem');

    var uItem = this.ClientFirstItems[uniqueID];
    if (uItem != null) {
        alert('В тулбаре уже имеется элемент с uniqueID="' + uniqueID + '"');
        return;
    }

    this.ClientFirstItems[uniqueID] = item;
}

//общая функция добавления элемента в тулбар
function DBT_AddItem(item, uniqueID) {
    if (window.SM.IsNullOrEmpty(uniqueID))
        alert('uniqueID is null at AddFirstItem');

    var uItem = this.ClientItems[uniqueID];
    if (uItem != null) {
        alert('В тулбаре уже имеется элемент с uniqueID="' + uniqueID + '"');
        return;
    }

    this.ClientItems[uniqueID] = item;
}

//Перерисовывает тулбар, после добавления в него элементов
function DBT_ReInitItems() {
    if (this.ToolbarRow == null)
        return;

    this.UniqueItems = [];

    //удаляем все элементы
    var cells = this.ToolbarRow.cells;
    if (cells != null) {
        var i, len = cells.length;
        for (i = 0; i < len; i++) {
            if (cells.length > 1) {
                var cell = cells[1];
                this.ToolbarRow.removeChild(cell);
            }
        }
    }

    if (this.Menu != null && this.Menu.parentNode != null) {
        window.document.body.removeChild(this.Menu);
        this.Menu = null;
        this.MenuAdded = false;
    }

    //сбрасываем индекс
    this.ItemIndex = 1;
    //очищаем буффер элементов тулбара
    this.Items = [];
    //this.UniqueItems = [];
    //заново инициализируем коллекцию элементов тулбара
    this.InitItems();
}

//проверка на пересечение плоскости выпадающего меню с мышкой
function DBT_InClientRect(element, x, y, menuElement) {
    if (element.parentNode == null)
        return false;
    if (window.SM.IsNullOrEmpty(element.parentNode.tagName))
        return false;

    //получаем область элемента (выпадающее меню)
    var br = element.getBoundingClientRect();

    var right = br.right;
    var left = br.left;
    var top = br.top;
    var bottom = br.bottom;

    //проверяем вхождение координат мыши в область элемента
    //с учетом границ и т.п.
    if (!menuElement)
        y -= 2;

    if (x >= right || x <= left
        || y > bottom - 2 || y < top)
        return false;

    return true;
}

//определяем событие скрытия выпадающего меню
function DBT_InitHideEvent() {
    if (this.MenuCell == null)
        return;
    var obj = this;

    //если нужно скрывать по уводу мышки с области выпадающего меню
    if (this.HideOnMouseOut) {
        //отслеживаем движение мыши по ячейки с надписьмю "Другое..."
        //с этой ячейки открывается выпадающее меню
        $(obj.MenuCell).mousemove(function(ev) {
            var x = 0, y = 0;
            if (window.SM.IsFF) {
                x = ev.clientX;
                y = ev.clientY;
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }
            if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                this.Tooltip.Hide();
        });

        //событие попадания мыши в ячейку "Другое..."
        $(obj.MenuCell).mouseover(function(ev) {
            var x = 0, y = 0;
            if (window.SM.IsFF) {
                x = ev.clientX;
                y = ev.clientY;
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }
            if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                this.Tooltip.Hide();
        });

        //событие увода мыши с ячейки "Другое..."
        $(obj.MenuCell).mouseout(function(ev) {
            var x = 0, y = 0;
            if (window.SM.IsFF) {
                x = ev.clientX;
                y = ev.clientY;
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }
            if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                this.Tooltip.Hide();
        });

        //повторяем идентичные события для области выпадающего меню
        $(obj.Menu).mousemove(function(ev) {
            var x = 0, y = 0;
            if (window.SM.IsFF) {
                x = ev.clientX;
                y = ev.clientY;
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }
            if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                this.Tooltip.Hide();
        });

        $(obj.Menu).mouseover(function(ev) {
            var x = 0, y = 0;
            if (window.SM.IsFF) {
                x = ev.clientX;
                y = ev.clientY;
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }
            if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                this.Tooltip.Hide();
        });

        $(obj.Menu).mouseout(function(ev) {
            var x = 0, y = 0;
            if (window.SM.IsFF) {
                x = ev.clientX;
                y = ev.clientY;
            }
            else {
                x = event.clientX;
                y = event.clientY;
            }
            if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                this.Tooltip.Hide();
        });
    }
    //если нужно скрывать меню по клику на документ (клик вне области меню)
    else {
        var onMouseDownClick = function (ev) {
            if (obj.Menu != null && obj.MenuHeader != null) {
                var x = 0, y = 0;
                if (window.SM.IsFF) {
                    x = ev.clientX;
                    y = ev.clientY;
                } else {
                    x = event.clientX;
                    y = event.clientY;
                }
                if (!obj.InClientRect(obj.MenuHeader, x, y) &&
                    !obj.InClientRect(obj.Menu, x, y))
                    obj.Hide();
            }
        }

        $(document).mousedown(function(event) {
            onMouseDownClick(event);
        });
    }
}

///Добавляет разделитель между элементами тулбара
function DBT_AddSeparator() {
    if (this.ToolbarRow == null)
        return null;

    var separatorCell = window.document.createElement('td');
    $(separatorCell).text('|');
    separatorCell.className = 'dbf_listform_toolbar_tdseparator';
    this.ToolbarRow.appendChild(separatorCell);
    return separatorCell;
}

//добавляем элемент в выпадающее меню
function DBT_AddMenuItem(item, uniqueID, serverItem) {
    var thisObj = this;
    if (this.Menu == null) {
        var separator = this.AddSeparator();

        this.MenuHeader = window.document.createElement('a');
        this.MenuHeader.href = 'javascript:void(0);';
        this.MenuHeader.className = 'dbf_listform_toolbarLink';
        //перевод титла элемента
        $(this.MenuHeader).text(window.TN.TranslateKey('db.toolbar.otheritem'));
        this.MenuHeader.Toolbar = this;
        //функция клика на элемент
        this.MenuHeader.onclick = function() {
            if (!this.Toolbar.Display)
                this.Toolbar.Show();
            else
                this.Toolbar.Hide();
        }

        //добавляем ячейку в строку тулбара
        this.MenuCell = this.ToolbarRow.insertCell(this.ToolbarRow.cells.length);
        this.MenuCell.className = 'dbf_listform_toolbar_tdlink';
        this.MenuCell.appendChild(this.MenuHeader);
        this.Menu = window.document.createElement('div');
        this.MenuHeader.Menu = this.MenuHeader;
        this.Menu.style.display = 'none';
        this.Menu.className = 'dbf_listform_toolbar_menu';

        window.SM.DisableSelection(this.Menu);
        this.InitHideEvent();
    }

    var added = true;
    //добавляет элемент в uniqueID - элемент добавлен на клиенте
    if (!window.SM.IsNullOrEmpty(uniqueID) && !serverItem) {
        var uniqueItem = this.UniqueItems[uniqueID.toString()];
        if (uniqueItem != null) {
            alert('В тулбаре уже имеется элемент с uniqueID="' + uniqueID + '"');
            added = false;
        }
    }

    if (added) {
        var itemLink = window.document.createElement('a');
        //определяем объект, который потом будет выгружен из памяти
        var o = new Object();
        o.IFaces = [];
        o.IFaces[o.IFaces.length] = itemLink;
        if (!serverItem)
            this.UniqueItems[uniqueID.toString()] = o;

        itemLink.className = 'dbf_listform_toolbar_menu_link';
        if (!window.SM.IsNullOrEmpty(item.ImageUrl)) {
            itemLink.style.background = 'url("' + item.ImageUrl + '") 7px center no-repeat #ebf3ff';
        }
        else {
            //иконка пункта
            itemLink.style.background = 'url("/_LAYOUTS/WSS/DBF/ListForm/arrow_right.png") 7px center no-repeat #ebf3ff';
        }

        //клик по элементу меню
        if (!window.SM.IsNullOrEmpty(item.OnClick)) {
            itemLink.href = 'javascript:void(0);';
            itemLink.onclick = function() {
                eval(item.OnClick);
                thisObj.Hide();
            }
        }
        else {
            if (!window.SM.IsNullOrEmpty(item.Href))
                itemLink.href = item.Href;
            else
                itemLink.href = 'javascript:void(0);';
        }
        if (!serverItem) {
            //если элемент создан на клиенте, то переводим его
            var jqItemLink = $(itemLink);
            window.TN.TranslateOnLoad(item.Title, function(e) {
                jqItemLink.text(e);
            });
        }
        //на сервере элемент приходит сразу с переводом
        else
            $(itemLink).text(item.Title);
        //добавляем элемент в меню
        this.Menu.appendChild(itemLink);
    }
}

//добавляет элемент в тулбар (НЕ в выпадающее меню)
function DBT_AddToolbarItem(item, uniqueID, serverItem) {
    var added = true;
    //проверка уникальности на клиенте
    if (!window.SM.IsNullOrEmpty(uniqueID) && !serverItem) {
        //debugger;
        var uniqueItem = this.UniqueItems[uniqueID.toString()];
        if (uniqueItem != null) {
            alert('В тулбаре уже имеется элемент с uniqueID="' + uniqueID + '"');
            added = false;
        }
    }

    if (added) {
        //объект для выгрузки из памяти в случае перестроения тулбара
        var o = new Object()
        o.IFaces = [];

        item.Separator = null;
        if (this.ItemIndex > 1) {
            item.Separator = this.AddSeparator();
            o.IFaces[o.IFaces.length] = item.Separator;
        }

        var link = window.document.createElement('a');
        link.className = 'dbf_listform_toolbarLink';

        if (!serverItem) {
            var jqItemLink = $(link);
            window.TN.TranslateOnLoad(item.Title, function(e) {
                jqItemLink.text(e);
            });
        }
        else
            $(link).text(item.Title);

        var thisObj = item;
        //клик по элементу тулбара
        if (!window.SM.IsNullOrEmpty(item.OnClick)) {
            link.href = 'javascript:void(0);';
            link.onclick = function() {
                eval(thisObj.OnClick);
            }
        }
        else {
            if (!window.SM.IsNullOrEmpty(item.Href))
                link.onclick = function() {
                    window.location.href = thisObj.Href;
                }
            else
                link.href = 'javascript:void(0);';
        }

        //добавляем пункт в тулбар
        var imgCell = null;
        if (!window.SM.IsNullOrEmpty(item.ImageUrl)) {
            imgCell = window.document.createElement('td');
            o.IFaces[o.IFaces.length] = imgCell;
            item.ImgCell = imgCell;
            imgCell.className = 'dbf_listform_toolbar_tdimage';
            var img = window.document.createElement('img');
            img.src = item.ImageUrl;
            img.className = 'dbf_listform_toolbar_img';
            img.onclick = function() {
                $(link).click();
            }
            imgCell.appendChild(img);
            this.ToolbarRow.appendChild(imgCell);
        }

        var linkCell = window.document.createElement('td');
        o.IFaces[o.IFaces.length] = linkCell;
        item.LinkCell = linkCell;
        linkCell.className = 'dbf_listform_toolbar_tdlink';
        linkCell.appendChild(link);
        this.ToolbarRow.appendChild(linkCell);

        this.ItemIndex++;
        if (!serverItem)
            this.UniqueItems[uniqueID.toString()] = o;
    }
}

//удаляем клиентский элемент тулбара
function DBT_RemoveItem(uniqueID) {
    if (uniqueID == null)
        uniqueID = '';

    //находим элементв в коллекции
    var uniqueItem = this.UniqueItems[uniqueID];
    this.UniqueItems[uniqueID] = null;
    if (uniqueItem == null)
        alert('по ид ' + uniqueID + ' не удалось найти ни одного элемента в тулбаре');

    //удаляем его UI элементы, для выгрузки из памяти браузера
    var elems = uniqueItem.IFaces;
    if (elems != null) {
        var i, len = elems.length;

        for (i = 0; i < len; i++) {
            var elem = elems[i];
            var parent = elem.parentNode;
            if (parent != null)
                parent.removeChild(elem);
        }
    }

    //удаляем из коллекций
    this.ClientItems[uniqueID] = null;
    this.ClientFirstItems[uniqueID] = null;
}

//скрывает меню
function DBT_HideMenu() {
    if (this.MenuCell == null || this.Menu == null)
        return;
    this.Menu.style.display = 'none';
    this.Display = false;
}

//показывает меню
function DBT_ShowMenu() {
    if (this.MenuCell == null || this.Menu == null)
        return;

    //определяем область выпадающего меню
    var br = this.MenuCell.getBoundingClientRect();
    var dtd = false;
    if (window.document.compatMode == 'CSS1Compat')
        dtd = true;

    var leftShift = window.SM.GetScrollLeft(this.Menu);
    var topShift = window.SM.GetScrollTop(this.Menu);

    this.Menu.style.top = br.bottom - 4 + topShift + 'px';
    this.Menu.style.left = br.left - 5 + leftShift + 'px';
    this.Menu.style.display = '';
    this.Display = true;
}


//элемент "Удалить" - серверное удаление элемента
function DBT_DeleteItem() {
    //ищем скрытую ссылку "Удалить" - сервеная ссылка, с серверным кодом
    var delLink = window.document.getElementById(this.DeleteLinkID);
    if (delLink != null) {
        var tagName = delLink.tagName;
        if (!window.SM.IsNullOrEmpty(tagName)) {
            //кликаем ссылку
            if (tagName.toString().toLowerCase() == 'a')
                delLink.click();
        }
    }
}


//инициализация элементов тулбара
function DBT_InitItems() {
    if (this.Settings.Items == null)
        return;

    var i, len = this.Settings.Items.length;
    //первые системные элементы
    for (i = 0; i < len; i++) {
        var toolbarItem = this.Settings.Items[i];
        if (window.SM.IsNullOrEmpty(toolbarItem.Title) || toolbarItem.Position != 'First')
            continue;

        toolbarItem.Toolbar = this;
        toolbarItem.Init = DBTItem_Init;
        toolbarItem.InitLast = DBTItem_InitLast;
        toolbarItem.Index = this.ItemIndex;

        toolbarItem.Init('', true);
        this.Items[this.Items.length] = toolbarItem;
        break;
    }

    //первые клиентские элементы
    for (var uniqueID in this.ClientFirstItems) {
        if (!this.ClientFirstItems.hasOwnProperty(uniqueID))
            continue;
        if (uniqueID == 'containsKey' || uniqueID == 'remove')
            continue;

        var toolbarItem = this.ClientFirstItems[uniqueID];
        if (toolbarItem == null)
            continue;

        toolbarItem.Toolbar = this;
        toolbarItem.ToolbarRow = this.ToolbarRow;
        toolbarItem.Init = DBTItem_Init;
        toolbarItem.Init(uniqueID, false);
        this.Items[this.Items.length] = toolbarItem;
    }

    //стандартные элементы с сервера
    for (i = 0; i < len; i++) {
        var toolbarItem = this.Settings.Items[i];
        toolbarItem.Toolbar = this;
        toolbarItem.Init = DBTItem_Init;
        toolbarItem.InitLast = DBTItem_InitLast;
        toolbarItem.Index = this.ItemIndex;
        if (window.SM.IsNullOrEmpty(toolbarItem.Title) || toolbarItem.Position != 'ByOrderNumber')
            continue;

        toolbarItem.Init('', true);
        this.Items[this.Items.length] = toolbarItem;
    }

    //стандарнтые клиентские элементы
    for (var uniqueID in this.ClientItems) {
        if (!this.ClientItems.hasOwnProperty(uniqueID))
            continue;
        if (uniqueID == 'containsKey' || uniqueID == 'remove')
            continue;

        var toolbarItem = this.ClientItems[uniqueID];
        if (toolbarItem == null)
            continue;

        toolbarItem.Toolbar = this;
        toolbarItem.ToolbarRow = this.ToolbarRow;
        toolbarItem.Init = DBTItem_Init;
        toolbarItem.Init(uniqueID, false);
        this.Items[this.Items.length] = toolbarItem;
    }

    //последние системные элементы (пользователь)
    var lastCellInited = false;
    for (i = 0; i < len; i++) {
        var toolbarItem = this.Settings.Items[i];
        toolbarItem.Toolbar = this;
        toolbarItem.Init = DBTItem_Init;
        toolbarItem.InitLast = DBTItem_InitLast;
        toolbarItem.Index = this.ItemIndex;
        if (window.SM.IsNullOrEmpty(toolbarItem.Title) || toolbarItem.Position != 'Last')
            continue;

        toolbarItem.InitLast();
        this.Items[this.Items.length] = toolbarItem;
        lastCellInited = true;
        break;
    }

    if (!lastCellInited) {
        var emptyCell = this.ToolbarRow.insertCell(this.ToolbarRow.cells.length);
        emptyCell.innerHTML = '&nbsp;';
        emptyCell.className = 'dbf_listform_toolbar_tdclose';
    }

    if (this.Menu != null && !this.MenuAdded) {
        window.document.body.appendChild(this.Menu);
        this.MenuAdded = true;
    }
}

//Добавления элемента в тулбар
function DBTItem_Init(uniqueID, serverItem) {
    if (this.Toolbar == null || this.Toolbar.ToolbarRow == null)
        return;

    //добавляем в выпадающее меню
    var menuItem = this;
    if (window.SM.IsNullOrEmpty(menuItem.Title))
        return;

    if (menuItem.Toolbar.ItemIndex > menuItem.Toolbar.VisibleItemsCount)
        menuItem.Toolbar.AddMenuItem(menuItem, uniqueID, serverItem);
    //добавляем в тулбар
    else
        menuItem.Toolbar.AddToolbarItem(menuItem, uniqueID, serverItem);
}

//инициализирует завершающие UI элементы строки тулбара
//ячейка с пользвоателем
function DBTItem_InitLast() {
    if (this.Toolbar == null || this.Toolbar.ToolbarRow == null)
        return;

    //пустая ячейка, которая занимает всю ширину, для того, 
    //чтобы раздвинуть и выровнять все остальные ячейки
    var widthCell = window.document.createElement('td');
    widthCell.innerHTML = '&nbsp;';
    widthCell.className = 'dbf_listform_toolbar_tdwidth';
    this.Toolbar.ToolbarRow.appendChild(widthCell);

    var lastCell = window.document.createElement('td');
    lastCell.className = 'dbf_listform_toolbar_tduser';

    //имя пользователя
    var divUser = window.document.createElement('div');
    divUser.className = 'dbf_listform_toolbar_user_control';
    $(divUser).text(this.Title);
    lastCell.appendChild(divUser);

    this.Toolbar.ToolbarRow.appendChild(lastCell);
    this.Toolbar.Lastcell = lastCell;

    //если текст превысил максимальную ширину и обрезался, то задаем тултип
    if (divUser.scrollWidth > divUser.offsetWidth)
        divUser.title = this.Title;
}