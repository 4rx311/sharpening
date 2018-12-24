/************************ FIELD *******************/
/************************************************/
/************************************************/
function TIField() {
    var s = new Date();
    this.AlertForSaveDisabled = "Невозможно сохранить строки с заблокированным сохранением.";

    if (window.TIFields == null)
        window.TIFields = [];
    window.TIFields[this.FieldName] = this;

    this.RowIndex = 0;
    this.Counter = 0;

    this.IsAlternate = true;

    if (!SM.IsNE(this.ClientCustomizerCtor)) {
        var functionInstance = window[this.ClientCustomizerCtor];
        if (!functionInstance)
            throw new Error('Клиентский конструктор менеджера кастомизаций должен быть глобальной функцией. Не найдена функция '
            + this.ClientCustomizerCtor + ' не найдена');

        //вызываем конструктор менеджера кастомизации.
        this.CustomManager = functionInstance.call(this);
    }

    //дефолтный менеджер кастомизации
    if (!this.CustomManager) {
        this.CustomManager = {
            CreateRow: null,
            EditRow: null,
            GetCellAccess: null,
            GetRowAccess: null,
            HideDeleteIcons: false
        };
    }

    //Interface
    this.OnInit = TIField_OnInit;
    this.OnSave = TIField_OnSave;
    this.Disable = TIField_Disable;
    this.Enable = TIField_Enable;
    this.GetValue = TIField_GetValue;
    this.SetValue = TIField_SetValue;
    this.ShowInformer = TIField_ShowInformer;
    this.IsChanged = TIField_IsChanged;
    this.IsEmptyValue = TIField_IsEmptyValue;

    this.HideEditIcons = TIF_HideEditIcons;
    this.ShowEditIcons = TIF_ShowEditIcons;
    this.HideSaveIcons = TIF_HideSaveIcons;
    this.ShowSaveIcons = TIF_ShowSaveIcons;
    this.HideDeleteIcons = TIF_HideDeleteIcons;
    this.ShowDeleteIcons = TIF_ShowDeleteIcons;

    //Methods
    this.Init = TIF_Init;
    this.AddInitHandler = TIF_AddInitHandler;
    this.CreateRow = TIF_AddRow;
    this.DeleteRow = TIF_DeleteRow;
    this.CreateCell = TIF_CreateCell;

    this.GetColumn = TIF_GetColumn;
    this.GetRow = TIF_GetRow;
    this.GetCell = TIF_GetCell;
    this.AddValidationHandler = TIF_AddValidationHandler;

    //устанавливаем свойство-заглушку Settings для совместимости с существующим кастомным кодом,
    //использующим свойство Settings.
    this.Settings = {
        Rows: this.Rows,
        Columns: this.Columns
    }

    //initialization
    this.Init();

    if (this.Columns == null || this.Columns.length == 0) {
        var container = window.document.getElementById(this.ContainerID);
        if (container != null)
            $(container).text(' ');
    }

    var e = new Date();
    var ts = e.getTime() - s.getTime();
    //document.title += '_ts' + ts;

    return this;
}

function TIF_HideEditIcons() {
    if (this.Rows == null)
        return;

    this.Rows.ForEach(function (row) {
        if (row)
            row.HideEditIcon();
    });

    this.EditIconsHidden = true;
}

function TIF_ShowEditIcons() {
    if (this.Rows == null)
        return;

    this.Rows.ForEach(function (row) {
        if (row)
            row.ShowEditIcon();
    });

    this.EditIconsHidden = false;
}

function TIF_HideSaveIcons() {
    if (this.Rows == null)
        return;

    this.Rows.ForEach(function (row) {
        if (row)
            row.HideSaveIcon();
    });

    this.SaveIconsHidden = true;
}

function TIF_ShowSaveIcons() {
    if (this.Rows == null)
        return;

    this.Rows.ForEach(function (row) {
        if (row)
            row.ShowSaveIcon();
    });

    this.SaveIconsHidden = false;
}

function TIF_HideDeleteIcons() {
    if (this.Rows == null)
        return;

    this.Rows.ForEach(function (row) {
        if (row)
            row.HideDeleteIcon();
    });

    this.DeleteIconsHidden = true;
}

function TIF_ShowDeleteIcons() {
    if (this.Rows == null)
        return;

    this.Rows.ForEach(function (row) {
        if (row)
            row.ShowDeleteIcon();
    });

    this.DeleteIconsHidden = false;
}


function TIF_Init() {
    if (this.Columns == null || this.Columns.length == 0 || this.TabManager == null)
        return;

    this.Rows.ForEach = function (handler, instance) {
        var i, len = this.length;
        for (i = 0; i < len; i++) {
            var row = this[i];
            if (row.Deleted)
                continue;

            if (instance == null)
                instance = window;

            handler.call(instance, row);
        }
    };

    this.TabManager.ContainerID = this.ContainerID;
    this.TabManager.TableFieldName = this.FieldName;

    SM.ApplyEventModel(this.TabManager);
    SM.ApplyEventModel(this);

    var thisObj = this;
    this.TableID = 'tif_table_' + this.FieldID;
    var container = window.document.getElementById(this.ContainerID);
    //инициализация ссылки добавления строк.
    var createLink = null;

    //пользователь может создавать строки
    if (this.CanCreate && this.IsEditMode) {
        var createContainer = window.document.createElement('div');
        createContainer.className = 'tif_create_container';
        SM.DisableSelection(createContainer);

        var createImg = window.document.createElement('img');
        createImg.className = 'tif_create_img';
        createImg.src = '/_layouts/images/newitem.gif';

        createLink = window.document.createElement('a');
        createLink.className = 'tif_link tif_createLink';
        $(createLink).text(TN.TranslateKey('tif.createLink'));
        $(createLink).click(function () {
            thisObj.CreateRow();
        });
        $(createImg).click(function () {
            $(createLink).click();
        });

        createContainer.appendChild(createImg);
        createContainer.appendChild(createLink);
        container.appendChild(createContainer);
    }

    //инициализация вкладок.
    TabManager_Init.call(this.TabManager);

    var firstTab = null;
    if (this.TabManager.Tabs != null && this.TabManager.Tabs.length > 0)
        firstTab = this.TabManager.Tabs[0];

    //инициализация таблицы.
    var tableBody = window.document.createElement('tbody'),
    headerRow = window.document.createElement('tr'),
    cssSuffix = 'f';
    headerRow.className = 't_row';

    this.ColumnIndex = 0;
    if ((this.CanCreate || this.CanEditAnyRow) && this.IsEditMode) {
        var editHeader = window.document.createElement('td');
        editHeader.className = 'tif_header_f';
        cssSuffix = 'nf';
        $(editHeader).text(' ');
        headerRow.appendChild(editHeader);

        this.ColumnIndex++;
    }

    var counterHeader = window.document.createElement('td');
    counterHeader.className = 'tif_header_' + cssSuffix;
    $(counterHeader).text('№');
    headerRow.appendChild(counterHeader);
    this.ColumnIndex++;

    var i, len = this.Columns.length;
    for (i = 0; i < len; i++) {
        var column = this.Columns[i];
        column.IsEventColumn = (column.SummRules != null && column.SummRules.length > 0) || !SM.IsNE(column.CalcucateExpression);
        if (!SM.IsNE(column.CalcucateExpression))
            TIF_ParseExpression.call(this, column);

        var columnVisible = false;
        if (!column.Hidden && !SM.IsNE(column.Access))
            columnVisible = column.Access == 'View' || column.Access == 'Edit';

        if (!columnVisible)
            continue;

        column.TableIndex = this.ColumnIndex;

        var headerCell = window.document.createElement('td');
        var emptyWidthDiv = window.document.createElement('div');
        emptyWidthDiv.className = 'tif_empty';
        emptyWidthDiv.style.width = (column.Width - 8) + 'px';
        if (column.Required) {
            $(headerCell).html(column.DisplayName + ' <span style="color:red">*</span>');
        }
        else
            $(headerCell).text(column.DisplayName);
        headerCell.className = 'tif_header_nf';
        headerCell.appendChild(emptyWidthDiv);
        headerRow.appendChild(headerCell);

        var contains;
        if (firstTab == null)
            contains = true;
        else
            contains = firstTab.ContainsColumn(column.Name);
        if (!contains)
            headerCell.style.display = 'none';

        this.ColumnIndex++;
    }
    tableBody.appendChild(headerRow);

    if (this.InitHandlers != null) {
        var hi, hlen = this.InitHandlers.length;
        for (var hi = 0; hi < hlen; hi++) {
            var handler = this.InitHandlers[hi];
            if (handler != null)
                handler();
        }
    }

    //Создание строк.
    var s = new Date();
    i, len = this.Rows.length;
    var table = window.document.createElement('table');
    table.id = this.TableID;
    table.className = 'tif_table';
    table.cellPadding = 0;
    table.cellSpacing = 0;

    if (len > 0) {
        for (i = 0; i < len; i++) {
            var row = this.Rows[i];
            var access = 'None';
            if (!SM.IsNE(row.Access))
                access = row.Access;

            row = TIF_CreateRowObject.call(this, row, i);
            if (access == 'None')
                continue;

            TIF_CreateRow.call(this, row, tableBody);
            this.FireEvent('RowAdded', { Row: row }, true);
        }
    }
    //обновляем разметку.
    table.appendChild(tableBody);
    container.appendChild(table);

    if (this.IsEditMode) {
        for (i = 0; i < len; i++) {
            var row = this.Rows[i];
            if (row.Deleted)
                continue;

            if (!row.IsClientRow) {
                //если у пользователя есть доступ на редактирование
                //то переводим строку в редактирование сразу, чтобы пользователь понимал, что может редактировать строку.
                if (row.HasEditAccess())
                    TIF_ChangeRowMode.call(this, row);
            }
        }
    }

    var initHandler = function () {
        //Если нет ни одной строки, создаем одну
        if (len == 0 && createLink != null && !thisObj.CustomManager.CreateRow)
            createLink.click();

        TIF_UpdateSummColumns.call(thisObj, true);
    };

    if (ListForm.InitCompleted)
        initHandler();
    else
        ListForm.AddInitHandler(initHandler);
}


function TIF_AddInitHandler(handler) {
    if (this.InitHandlers == null)
        this.InitHandlers = [];

    this.InitHandlers.push(handler);
}

function TIF_ParseExpression(column) {
    if (column == null)
        throw new Error('column is null');

    if (SM.IsNE(column.CalcucateExpression))
        return;

    if (column.CalculateColumns == null)
        column.CalculateColumns = [];

    var expression = column.CalcucateExpression;
    var tmpExpression = expression;
    var limit = 10;
    var counter = 0;

    while (tmpExpression.indexOf('[') != -1) {
        var index = tmpExpression.indexOf('[');
        //ищем первый индекс закрывающей скобки
        var lastIndex = tmpExpression.indexOf(']');
        if (index < lastIndex < tmpExpression.length) {
            var columnName = tmpExpression.substr(index + 1, lastIndex - index - 1);
            if (columnName == column.Name)
                throw new Error('В выражении для колонки "' + column.Name + '" указана сама колонка, что невозможно.');
            //получаем колонку, по которой высчитывается значение текущей колонки
            var calculateColumn = TIF_GetColumn.call(this, columnName, true);
            calculateColumn.CalculateTargetColumnName = column.Name;
            column.CalculateColumns.push(calculateColumn);
            tmpExpression = tmpExpression.substr(lastIndex + 1);
            if (counter++ > limit)
                throw new Error('Невозможно составить выражение. Максимальное количество столбцов, по которым вычисляется значение: ' + limit);
        }
    }

    var i, len = column.CalculateColumns.length;
    for (i = 0; i < len; i++) {
        var calculateColumn = column.CalculateColumns[i];
        calculateColumn.IsEventColumn = true;
    }
}

function TIF_AddRow() {
    var tbl = window.document.getElementById(this.TableID);
    var row;
    if (tbl != null && tbl.firstChild != null) {
        var rowLen = 0;
        if (this.Rows != null)
            rowLen = this.Rows.length;
        else {
            //инициализируем новую коллекцию строк.
            this.Rows = [];

            //устанавливаем значение свойства Settings.Rows для совместимости.
            this.Settings.Rows = this.Rows;
        }

        row = TIF_CreateRowObject.call(this, row, rowLen);

        if (this.CustomManager.CreateRow) {
            var thisObj = this;
            this.CustomManager.CreateRow(row, function (createdRow) {
                //on complete
                createdRow = TIF_CreateRow.call(thisObj, createdRow, tbl.firstChild);
                thisObj.Rows.push(createdRow);
                thisObj.FireEvent('RowAdded', { Row: createdRow }, true);
            });
        }
        else {
            row = TIF_CreateRow.call(this, row, tbl.firstChild);
            this.Rows.push(row);
            this.FireEvent('RowAdded', { Row: row }, true);
        }

    }
    return row;
}

function TIF_GetRow(index) {
    if (index < 0)
        throw new Error('Параметр index не может быть меньше 0');

    var row = null;
    if (this.Rows != null) {
        var i, len = this.Rows.length;
        if (index > -1 && len > index)
            row = this.Rows[index];
    }
    return row;
}

function TIF_UpdateSummColumns(isInit) {
    var i, len = this.Columns.length;
    for (i = 0; i < len; i++) {
        var column = this.Columns[i];
        if (column.Access == 'None')
            continue;

        var requiredSummUpdate = false;
        var isSummColumn = column.SummRules != null && column.SummRules.length > 0;
        if (isSummColumn) {
            //если это инициализация, то обновляем только те столбцы, в которых это указано в настройке.
            if (isInit)
                requiredSummUpdate = column.UpdateOnLoading;
                //иначе обновляем всегда (подразумевается осмысленный вызов тек. функции)
            else
                requiredSummUpdate = true;

            if (requiredSummUpdate)
                TIF_OnEventColumnChangeHandler.call(this, column.Name);
        }
    }
}

function TIF_GetColumn(colName, thrownException) {
    if (this.Columns == null)
        return;

    var i, len = this.Columns.length, result = null;
    for (i = 0; i < len; i++) {
        if (this.Columns[i].Name == colName) {
            result = this.Columns[i];
            break;
        }
    }

    if (result == null && thrownException)
        throw new Error('Не удалось найти колонку с именем "' + colName + '".');

    return result;
}

function TIF_ChangeRowMode(row) {
    if (row == null)
        throw Error('row is null');

    //если строка согласована, то она уже недоступна для редактирования
    if (!row.IsEditMode && !row.AllowEditing())
        return;

    //скрываем иконки управления строкой
    //с учетом их программного признака Hidden. Если он выставлен программно, то не показываем его
    var saveImg = row.SaveIcon();
    var editImg = row.EditIcon();
    if (row.AllowEditing()) {
        if (row.IsEditMode) {
            if (saveImg != null)
                saveImg.style.display = 'none';
            if (editImg != null && !editImg.Hidden)
                editImg.style.display = '';
        }
        else {
            if (saveImg != null && !saveImg.Hidden)
                saveImg.style.display = '';
            if (editImg != null)
                editImg.style.display = 'none';
        }
    }

    var i, len = row.Cells.length;
    for (i = 0; i < len; i++) {
        TIFRow_ChangeCellMode.call(row, row.Cells[i]);
    }

    row.IsEditMode = !row.IsEditMode;
}

function TIF_MatchNumber(value) {
    var result = false;
    var regEx = /^(([-]?[1-9]+\d*[\.\,]{1,1}\d+)|([-]?0\d*[\.\,]\d+)|(0{1,1})|([-]?[1-9]+\d*))$/

    if (!SM.IsNullOrEmpty(value)) {
        var tempVal = TIF_RemoveSpaces(value).replace(",", ".");
        var valDouble = parseFloat(tempVal);
        if (regEx.test(tempVal) && valDouble != null) {
            result = true;
        }
    }

    return result;
}

function TIF_MatchInteger(value) {
    var result = { OutOfRange: false, Complete: false };
    var valTrim = TIF_RemoveSpaces(value);
    if (!window.SM.IsNullOrEmpty(valTrim)) {
        //проверка на покрректность
        var regEx = /^[-]?[\d]+$/

        var maxInt = 2147483647;
        var minInt = -2147483648;

        var valInteger = parseInt(valTrim);
        var tempResult = false;
        if (regEx.test(valTrim) && valInteger != null)
            tempResult = true;

        if (tempResult) {
            if (valInteger > maxInt)
                result.OutOfRange = true;
            else if (valInteger < minInt) {
                result.OutOfRange = true;
            }
            else
                result.Complete = true;
        }
    }

    return result;
}

function TIF_CreateRowObject(row, collectionIndex) {
    if (row == null)
        row = { IsClientRow: true, IsEditMode: true, ItemID: 0 };

    var rowID = this.TableID + '_row_' + this.RowIndex;
    row.RowID = rowID;
    row.CellIndex = 0;
    row.CollectionIndex = collectionIndex;
    row.RowIndex = this.RowIndex;
    row.Counter = this.Counter;
    row.FieldName = this.FieldName;

    if (this.RowsByID == null)
        this.RowsByID = [];

    this.RowsByID[row.RowID] = row;
    TIFRow_InitializeInterfaces.call(row);

    if (row.IsClientRow) {
        //строка создана на клиенте.
        var i, len = this.Columns.length;
        row.Cells = [];

        //сначала создаем все ячейки
        for (i = 0; i < len; i++) {
            var column = this.Columns[i];
            //создаем новый объект ячейки
            var cell = TIF_CreateCellObject.call(this, row, column, null);
            row.Cells.push(cell);
        }
    }
    else {
        //строка создана на сервере.
        var i, len = row.Cells.length;
        for (i = 0; i < len; i++) {
            var cell = row.Cells[i];
            var column = this.GetColumn(cell.ColumnName);
            if (column == null)
                continue;

            //добавляем свойства к существующему объекту ячейки
            TIF_CreateCellObject.call(this, row, column, cell);
        }
    }

    return row;
}

function TIF_CreateRow(row, element, disableSetDefaultValue) {
    if (!row)
        throw new Error('row is null');

    var tableRow = window.document.createElement('tr'),
    thisObj = this;
    tableRow.Row = row;
    tableRow.id = row.RowID;

    var className = '',
    cssSuffix = 'f';
    if (this.IsAlternate) {
        tableRow.className = 't_row tif_row_alternate';
        className = 'tif_cell_alternate_'
    }
    else {
        tableRow.className = 't_row tif_row';
        className = 'tif_cell_';
    }

    //edit/disp mode picker
    if ((this.CanCreate || this.CanEditAnyRow) && this.IsEditMode) {
        var editDispCell = window.document.createElement('td');
        editDispCell.className = className + cssSuffix;

        var imgContainer = window.document.createElement('div');
        var containerClassName = 'tif_img_container';
        if (this.AllowCopyRows)
            containerClassName = 'tif_img_container_withCopy';;

        imgContainer.className = containerClassName;

        var hasEditAccess = row.IsClientRow || row.Access == 'Edit';
        var hasDeleteAccess = row.IsClientRow || row.Access == 'Full';

        if (row.AllowEditing() && (hasEditAccess || hasDeleteAccess)) {
            //copy
            if (this.CanCreate && this.AllowCopyRows) {
                var copyImg = window.document.createElement('img');
                row.CopyImgID = 'tif_copy_img' + row.RowID;
                copyImg.id = row.CopyImgID;
                copyImg.className = 'tif_save_img';
                copyImg.src = '/_layouts/WSS/WSSC.V4.DMS.Fields.TableItems/images/copyitem.png';

                $(copyImg).click(function () {
                    row.Copy();
                });

                imgContainer.appendChild(copyImg);
            }

            //save
            var saveImg = window.document.createElement('img');
            row.SaveImgID = 'tif_save_img' + row.RowID;
            saveImg.id = row.SaveImgID;
            saveImg.className = 'tif_save_img';
            saveImg.src = '/_layouts/images/saveitem.gif';

            if (!row.IsClientRow || this.SaveIconsHidden || row.SaveIconHidden) {
                saveImg.style.display = 'none';
                if (this.SaveIconsHidden || row.SaveIconHidden)
                    saveImg.Hidden = true;
            }

            $(saveImg).click(function () {
                row.Save();
            });

            //edit
            var editImg = window.document.createElement('img');
            editImg.className = 'tif_edit_img';
            editImg.src = '/_layouts/images/edititem.gif';
            $(editImg).click(function () {
                if (thisObj.CustomManager.EditRow)
                    thisObj.CustomManager.EditRow(row);
                else
                    TIF_ChangeRowMode.call(thisObj, row);
            });

            row.EditImgID = 'tif_edit_img' + row.RowID;
            editImg.id = row.EditImgID;
            if (row.IsClientRow || this.EditIconsHidden || row.EditIconHidden) {
                editImg.style.display = 'none';
                if (this.EditIconsHidden || row.EditIconHidden)
                    editImg.Hidden = true;
            }

            //delete
            var showDeleteIcon = hasDeleteAccess && !this.CustomManager.HideDeleteIcons;
            var delImg;
            if (showDeleteIcon) {
                delImg = window.document.createElement('img');
                delImg.className = 'tif_delete_img';
                delImg.src = '/_layouts/images/delete.gif';
                row.DeleteImgID = 'tif_delete_img' + row.RowID;
                delImg.id = row.DeleteImgID;

                if (this.DeleteIconsHidden || row.DeleteIconHidden) {
                    delImg.style.display = 'none';
                    delImg.Hidden = true;
                }

                $(delImg).click(function () {
                    thisObj.DeleteRow(row, true);
                });
            }

            imgContainer.appendChild(saveImg);
            imgContainer.appendChild(editImg);

            if (showDeleteIcon && delImg)
                imgContainer.appendChild(delImg);

        }

        editDispCell.appendChild(imgContainer);
        tableRow.appendChild(editDispCell);
        cssSuffix = 'nf';
    }

    //counter cell
    var counterCell = window.document.createElement('td');
    counterCell.className = className + cssSuffix;
    row.CounterCellID = row.RowID + '_counterCell';
    counterCell.id = row.CounterCellID;
    counterCell.Index = this.Counter + 1;
    $(counterCell).text(counterCell.Index);
    tableRow.appendChild(counterCell);

    var i, len = row.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = row.Cells[i];
        var column = this.GetColumn(cell.ColumnName);
        if (column == null)
            continue;

        var columnVisible = false;
        if (!column.Hidden && !SM.IsNE(column.Access))
            columnVisible = column.Access == 'View' || column.Access == 'Edit';

        if (!columnVisible)
            continue;

        this.CreateCell(row, cell, column, tableRow);
    }

    if (element != null)
        element.appendChild(tableRow);

    TIF_InitLinkedHandlers.call(this, row);

    this.RowIndex++;
    this.Counter++;
    this.IsAlternate = !this.IsAlternate;

    //после добавления в разметку все edit контролы уже можно получить в коде
    //поэтому только после этого устанавливаем default value в ячейки
    if (row.IsClientRow && !disableSetDefaultValue) {
        //потом только устанавливаем в них default value
        //это нужно для того, чтобы в обработчике OnChange мы могли оперировать с любыми ячейками
        var i, len = this.Columns.length;
        for (i = 0; i < len; i++) {
            if (row.Cells.length < i)
                continue;

            var cell = row.Cells[i];
            var column = this.Columns[i];
            var columnVisible = false;
            if (!SM.IsNE(column.Access))
                columnVisible = column.Access == 'View' || column.Access == 'Edit';

            if (!columnVisible)
                continue;

            if (!SM.IsNE(column.DefaultValueFieldName)) {
                //поле-источник для значения по умолчанию
                var defaultValueField = ListForm.GetField(column.DefaultValueFieldName);
                if (defaultValueField) {
                    var defaultValue = defaultValueField.GetValue();
                    cell.SetValue(defaultValue);
                }
            }
            else {
                //константное значение по умолчанию
                if (column.Type == 'Lookup') {
                    if (column.DefaultLookupValue)
                        cell.SetValue(column.DefaultLookupValue);
                }
                else {
                    if (column.DefaultValue)
                        cell.SetValue(column.DefaultValue);
                }
            }
        }
    }

    return row;
}

function TIF_CreateCellObject(row, column, cell) {
    if (!row)
        throw new Error('row is null');

    if (!column)
        throw new Error('column is null');

    if (!cell)
        cell = { IsClientCell: true, IsEditMode: false, ColumnName: column.Name };
    else
        cell.ColumnName = cell.ColumnName;

    cellID = this.TableID + '_cell_' + this.RowIndex + '_' + row.CellIndex;
    cell.CellID = cellID;
    cell.RowID = row.RowID;
    cell.FieldName = this.FieldName;

    TIFCell_InitializeInterfaces.call(cell);
    if (column.IsEventColumn)
        cell.AttachEvent('EventCellChanged', TIFRow_OnEventColumnChange, row);

    row.CellIndex++;

    return cell;
}

function TIF_CreateCell(row, cell, column, element) {
    if (!row)
        throw new Error('row is null');

    if (!cell)
        throw new Error('cell is null');

    if (!column)
        throw new Error('column is null');

    var tableCell = window.document.createElement('td');
    this.IsAlternate ? tableCell.className = 'tif_cell_alternate_nf' : tableCell.className = 'tif_cell_nf';

    tableCell.id = cell.CellID;
    if (element != null)
        element.appendChild(tableCell);

    var access = column.Access;
    if (access == 'None')
        return;

    var currentTab = this.CurrentTab;
    if (currentTab == null) {
        if (this.TabManager.Tabs != null && this.TabManager.Tabs.length > 0)
            currentTab = this.TabManager.Tabs[0];
    }

    var contains;
    if (currentTab == null)
        contains = !column.Hidden;
    else
        contains = currentTab.ContainsColumn(column.Name);
    if (!contains)
        tableCell.style.display = 'none';

    if (cell.IsClientCell) {
        //переопределена ф-ия доступа к ячейке
        if (this.CustomManager.GetCellAccess)
            access = this.CustomManager.GetCellAccess(cell, column);

        if (access == 'Edit' && this.IsEditMode) {
            TIFCell_InitEditControl.call(cell, tableCell);
            cell.IsEditMode = cell.EditControlInited;
        }
        else
            TIFCell_InitViewControl.call(cell, tableCell);
    }
    else
        TIFCell_InitViewControl.call(cell, tableCell);

    return cell;
}

function TIF_InitLinkedHandlers(row) {
    if (row == null)
        throw new Error('row is null');

    //вешаем обработчики на ячейки, по которым проставляются связанные поля.
    if (this.Columns != null) {
        var i, len = this.Columns.length;
        var linkedParams = [];
        for (i = 0; i < len; i++) {
            var column = this.Columns[i];
            if (!column.IsLinked)
                continue;

            var linkedCell = TIFRow_GetCell.call(row, column.Name);
            //связанная колонка может быть недоступна, поэтому и ячейки может не быть.
            if (linkedCell == null)
                continue;

            if (SM.IsNE(column.LinkedBy))
                continue;

            var linkedByColumn = this.GetColumn(column.LinkedBy);
            if (linkedByColumn == null)
                continue;

            linkedByColumn.IsEventColumn = true;

            var linkedColumns = linkedParams[linkedByColumn.Name];
            if (linkedColumns == null) {
                linkedColumns = [];
                linkedParams[linkedByColumn.Name] = linkedColumns;
            }

            linkedColumns.push(column);
        }

        for (var linkedByColumnName in linkedParams) {
            var linkedByColumnTmp = this.GetColumn(linkedByColumnName);
            if (linkedByColumnTmp == null)
                continue;

            var linkedColumnsTmp = linkedParams[linkedByColumnTmp.Name];
            if (linkedColumnsTmp == null || linkedColumnsTmp.length == 0)
                continue;

            TIF_AddLinkedHandler.call(this, row, linkedByColumnTmp, linkedColumnsTmp);
        }
    }
}

function TIF_OnEventColumnChangeHandler(columnName) {
    if (SM.IsNE(columnName))
        throw new Error('columnName is null');

    var column = this.GetColumn(columnName);
    if (column == null)
        throw new Error('Не удалось найти столбец с именем "' + this.ColumnName + '".');

    //если по текущему столбцу вычисляется сумма для поля карточки.
    if (column.SummRules != null && column.SummRules.length > 0) {
        //подсчет общей суммы столбца.
        var columnSumm = 0;
        var r, rlen = this.Rows.length;
        var allCount = 0, emptyCount = 0;

        for (r = 0; r < rlen; r++) {
            var row = this.Rows[r]
            if (row.Deleted)
                continue;

            allCount++;
            var rowCell = TIFRow_GetCell.call(row, column.Name);
            if (rowCell != null) {
                var cellValue = TIFCell_GetValue.call(rowCell);
                cellValue = TIF_RemoveSpaces(cellValue);
                if (!SM.IsNE(cellValue))
                    columnSumm = TIF_DoubleStringAddition(columnSumm.toString(), cellValue);
                else
                    emptyCount++;
            }
        }

        if (allCount == emptyCount)
            columnSumm = null;

        //проставляем сумму в поля.
        var i, len = column.SummRules.length;
        for (i = 0; i < len; i++) {
            var rule = column.SummRules[i];
            var handler = function () {
                var field = ListForm.GetField(rule.TargetFieldName);
                if (field == null)
                    throw new Error('Для одного из правил не удалось найти поле документа с именем "' + rule.TargetFieldName + '".');

                var isNumber = field.Type == 'DBFieldNumber';

                var columnSummString = null;
                if (columnSumm != null)
                    columnSummString = TIF_FormatNumber(columnSumm, isNumber);
                field.SetValue(columnSummString);
            }

            if (ListForm.InitCompleted)
                handler();
            else
                ListForm.AddInitHandler(handler);
        }
    }
}

function TIF_AddLinkedHandler(row, linkedByColumn, linkedColumns) {
    if (row == null)
        throw new Error('row is null');

    if (linkedByColumn == null)
        throw new Error('linkedByColumn is null');

    if (linkedColumns == null)
        throw new Error('linkedColumns is null');

    //получаем ячейку колонки, по которой происходит связывание.
    var linkedByCell = TIFRow_GetCell.call(row, linkedByColumn.Name);
    if (linkedByCell == null)
        return;

    //обработчик уже добавлен
    var linkedHandlerInited = row.LinkedHandlerInited && linkedByCell.LinkedHandlerInited;
    if (linkedHandlerInited)
        return;

    var loadedFields = [];
    if (linkedColumns != null) {
        var i, len = linkedColumns.length;
        for (i = 0; i < len; i++) {
            loadedFields.push(linkedColumns[i].Name);
        }
    }

    if (linkedByCell.IsEditMode) {
        //#region Добавляем обработчик на контрол редактирования.
        //получаем контрол подстановки, по которому необходимо проставлять связанные значения.
        var cellLookupControl = null;
        var cellLookupContainer = window.document.getElementById(linkedByCell.LookupControlID);
        if (cellLookupContainer != null && cellLookupContainer.Control != null)
            cellLookupControl = cellLookupContainer.Control;

        if (cellLookupControl == null)
            return;

        cellLookupControl.AddChangeHandler(function () {
            if (cellLookupControl == null || cellLookupControl.Settings == null)
                return;

            //получаем подстановочное значение.
            var lookupIdentities = [];
            if (cellLookupControl.Settings) {
                if (!cellLookupControl.Settings.IsMultiple) {
                    if (cellLookupControl.SingleValue && cellLookupControl.SingleValue.LookupID > 0)
                        lookupIdentities.push(cellLookupControl.SingleValue.LookupID);
                }
                else {
                    if (cellLookupControl.MultiValue) {
                        var i, len = cellLookupControl.MultiValue.length;
                        for (i = 0; i < len; i++) {
                            var lv = cellLookupControl.MultiValue[i];
                            if (lv.LookupID > 0)
                                lookupIdentities.push(lv.LookupID);
                        }
                    }
                }
            }

            TIFRow_UpdateLinkedFields.call(row, cellLookupControl.Settings, lookupIdentities, loadedFields);
        });
        //#endregion
    }
    else {
        //#region Добавляем обработчик на контрол просмотра
        SM.ApplyEventModel(linkedByCell);
        var callInstance = {
            Row: row,
            LinkedByColumn: linkedByColumn,
            LoadedFields: loadedFields,
            LinkedByCell: linkedByCell
        }
        linkedByCell.AttachEvent('EventCellChanged', TIF_OnLinkedCellChange, callInstance);
        //#endregion
    }

    row.LinkedHandlerInited = true;
    linkedByCell.LinkedHandlerInited = true;
}

function TIF_OnLinkedCellChange(args) {
    if (args == null)
        throw new Error('args is null');

    if (args.Field == null)
        throw new Error('args.Field is null');

    if (this.LinkedByColumn == null)
        throw new Error('this.LinkedByColumn is null');

    if (this.LoadedFields == null)
        throw new Error('this.LoadedFields is null');

    if (this.LinkedByCell == null)
        throw new Error('this.LinkedByCell is null');

    if (this.Row == null)
        throw new Error('this.Row is null');

    if (!SM.IsNE(this.LinkedByColumn.LookupControlName)) {
        var lookupSettings = window.GetLookupSettings(this.LinkedByColumn.LookupControlName)
        if (lookupSettings != null) {

            var value = TIFCell_GetValue.call(this.LinkedByCell);
            var lookupIdentities = [];
            if (value != null) {
                if (value.length > 0) {
                    var i, len = value.length;
                    for (i = 0; i < len; i++) {
                        var lv = value[i];
                        if (lv.LookupID > 0)
                            lookupIdentities.push(lv.LookupID);
                    }
                }
                else if (value.LookupID > 0)
                    lookupIdentities.push(value.LookupID);
            }

            TIFRow_UpdateLinkedFields.call(this.Row, lookupSettings, lookupIdentities, this.LoadedFields);
        }
    }
}

function TIF_GetCell(rowIndex, columnName) {
    if (rowIndex < 0)
        throw new Error('Параметр rowIndex не может быть меньше 0');

    if (SM.IsNE(columnName))
        throw new Error('columnName is null');

    var cell = null;
    if (this.Rows != null) {
        var i, len = this.Rows.length;
        if (rowIndex > -1 && rowIndex < len) {
            var row = this.Rows[rowIndex];
            cell = TIFRow_GetCell.call(row, columnName);
        }
    }

    return cell;
}

function TIF_DoubleStringAddition(x, y) {
    var rgSep = /([,])/g;
    var stX = x.toString().replace(rgSep, '.');
    var stY = y.toString().replace(rgSep, '.');
    var splX = stX.split('.');
    var splY = stY.split('.');
    var fractX = '0';
    var fractY = '0';
    if (splX.length > 1)
        fractX = splX[1];
    if (splY.length > 1)
        fractY = splY[1];

    var fractDifference = Math.abs(fractX.length - fractY.length);
    var fractLength = Math.max(fractX.length, fractY.length);
    var multiplier = Math.pow(10, fractDifference);
    var rgFirstZero = /(^0+)/g;

    var fractXFormated = fractX.replace(rgFirstZero, '');
    if (fractXFormated == '')
        fractXFormated = '0';
    var fractXlong = parseInt(fractXFormated);

    var fractYFormated = fractY.replace(rgFirstZero, '');
    if (fractYFormated == '')
        fractYFormated = '0';
    var fractYlong = parseInt(fractYFormated);

    if (multiplier > 1) {
        if (fractX.length > fractY.length)
            fractYlong = fractYlong * multiplier;
        else
            fractXlong = fractXlong * multiplier;
    }
    var fractSum = fractXlong + fractYlong;

    var mainX = parseInt(splX[0]);
    var mainY = parseInt(splY[0]);
    var mainSum = mainX + mainY;
    var fractSumReal = fractSum * Math.pow(10, -fractLength);
    var result = mainSum + fractSumReal;
    return result;
}

function TIF_RemoveSpaces(str) {
    if (str == null)
        str = '';
    else
        str = str.toString();

    var newString = '';
    if (!SM.IsNE(str)) {
        var i, len = str.length;
        for (i = 0; i < len; i++) {
            var chCode = str.charCodeAt(i);
            if (chCode != 8195 && chCode != 8194 && chCode != 160 && chCode != 32)
                newString += str.charAt(i);
        }
    }

    return newString;
}

function TIF_DeleteRow(row, showConfirm) {
    if (row == null)
        throw Error('row is null');

    if (row.Deleted)
        return;

    if (showConfirm == null)
        showConfirm = false;

    //удаление строки на сервере
    if (row.ItemID > 0) {
        if (showConfirm) {
            if (!confirm('Вы действительно хотите удалить строку?'))
                return false;
        }

        var ajax = SM.GetXmlRequest(),
        url = this.SiteUrl + this.ModulPath + '/DeleteRow.aspx?webID=';
        url += this.LookupWebID;
        url += '&listID=' + this.LookupListID;
        url += '&itemID=' + row.ItemID;
        ajax.open("GET", url, false);
        ajax.send(null);

        var jsonString = ajax.responseText;
        var jsonResponse = jQuery.parseJSON(jsonString);
        if (jsonResponse != null) {
            if (jsonResponse.IsError) {
                alert(jsonResponse.CallStack);
                return;
            }
            else {
                if (!jsonResponse.Result) {
                    alert('При удалении строки возникла неожиданная ошибка. Попробуйте повторить позже.');
                    return;
                }
            }
        }
    }

    //удаление разметки строки
    var table = document.getElementById(this.TableID),
    tableRow = document.getElementById(row.RowID);

    var index = tableRow.rowIndex;
    table.deleteRow(index);
    var i, len = table.rows.length,
    rowClassName = 't_row tif_row',
    rowClassNameAlternate = 't_row tif_row_alternate',
    collectionIndex = row.CollectionIndex;

    if (index % 2 == 0) {
        var temp = rowClassName;
        rowClassName = rowClassNameAlternate;
        rowClassNameAlternate = temp;
    }

    //начиная со следующей строки за удаленной меняем 
    var rowToChangeCount = table.rows.length - index;
    for (i = 0; i < rowToChangeCount; i++) {
        var tRow = table.rows[index + i];
        if (tRow == null || tRow.Row == null)
            continue;

        var counterCell = window.document.getElementById(tRow.Row.CounterCellID);
        //уменьшаем индекс каждой послеующей строки.
        $(counterCell).text(--counterCell.Index);

        if (i % 2 == 1)
            tRow.className = rowClassName;
        else
            tRow.className = rowClassNameAlternate;
    }

    row.Deleted = true;
    this.Counter--;
    this.IsAlternate = !this.Alternate;

    //Вызов обработчиков на изменение по столбцам.
    TIF_UpdateSummColumns.call(this, false);

    var deleteArgs = {
        Row: row
    };
    this.FireEvent('RowDeleted', { Row: row }, true);

    return true;
}

function TIF_SaveAllRows(saveArgs) {
    if (this.ListFormField.Required) {
        if (this.Columns == null || this.Columns.length == 0 ||
            this.Rows == null || this.Rows.length == 0) {
            saveArgs.CanSave = false;
            saveArgs.IsEmptyValue = true;
            return;
        }

        var i, len = this.Rows.length;
        var allRowsDeleted = true;
        var allRowsIsEmpty = true;
        for (i = 0; i < len; i++) {
            var row = this.Rows[i];
            if (!row.Deleted) {
                allRowsDeleted = false;

                //isFilled - отредактировано пользователем или карточка уже была создана
                if (row.IsFilled()) {
                    allRowsIsEmpty = false;
                    var errStr = '';
                    var j, length = row.Cells.length;
                    for (j = 0; j < length; j++) {
                        var cell = row.Cells[j];

                        if (cell.IsEditMode) {
                            var empty = TIFCell_IsEmptyCell.call(cell);
                            var column = cell.ParentColumn();
                            if (empty && column.Required) {
                                if (SM.IsNE(errStr))
                                    errStr += 'Невозможно сохранить ' + row.GetNumber() + ' строку в поле \'' + this.FieldName + '\'. Не заполнены обязательные столбцы: \n- ' + column.Name;
                                else
                                    errStr += '\n- ' + column.Name;
                            }
                        }
                    }
                    if (!SM.IsNE(errStr)) {
                        saveArgs.CanSave = false;
                        alert(errStr);
                        return;
                    }
                }
            }
        }
        if (allRowsDeleted || allRowsIsEmpty) {
            saveArgs.CanSave = false;
            saveArgs.IsEmptyValue = true;
            return;
        }
    }

    if (this.Rows == null || this.Rows.length == 0)
        return;

    var i, len = this.Rows.length;
    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        if (!row.IsEditMode || row.Deleted)
            continue;
        if (row.SaveDisabled) {
            saveArgs.CanSave = false;
            alert(this.AlertForSaveDisabled);
            return;
        }
    }

    //validate
    var commonMessage = '',
    complete = true;

    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        if (!row.IsEditMode || row.Deleted)
            continue;

        //если строка не новая , то => заполнена
        var rowFilled = !row.IsNew();
        var rowMessage = '';
        var rowComplete = true;

        var k, klen = row.Cells.length;
        for (k = 0; k < klen; k++) {
            var cell = row.Cells[k];

            //проверка заполненности строки (если все ячейки не заполнены, то и строку не сохраняем)
            if (!rowFilled && cell.IsEditMode) {
                var column = cell.ParentColumn();
                var cellFilled = false
                if (column.Type != 'Boolean')
                    cellFilled = !TIFCell_IsEmptyCell.call(cell);
                if (cellFilled)
                    rowFilled = true;
            }

            var res = TIFCell_ValidateCell.call(cell);
            if (!res.Complete) {
                rowComplete = false;
                rowMessage += res.Message + '\r\n';
            }
        }

        if (rowFilled) {
            commonMessage += rowMessage;
            if (complete)
                complete = rowComplete;
        }

        row.Filled = rowFilled;
    }

    //кастомная валидация
    if (complete) {
        var customValidationResult = TIF_ValidateByCustomHandlers.call(this);
        if (!customValidationResult.CanSave) {
            complete = false;
            commonMessage += customValidationResult.Message + '\r\n';
        }

        this.Rows.ForEach(function (row) {
            if (!row.IsEditMode)
                return;

            var rowValidationResult = TIFRow_ValidateByCustomHandlers.call(row);
            if (rowValidationResult.CanSave != null && rowValidationResult.CanSave === false) {
                complete = false;
                commonMessage += rowValidationResult.Message + '\r\n';
            }
        });
    }

    if (!complete) {
        saveArgs.CanSave = false;
        alert(commonMessage);
        return;
    }

    var rowsToSave = [];
    //client save
    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        if ((!row.IsEditMode && !row.RequiredUpdate) || row.Deleted || row.SaveDisabled ||
        (!row.Filled && !row.RequiredUpdate))
            continue;

        row.RequiredUpdate = true;
        row.ClientID = Math.random().toString();
        var k, klen = row.Cells.length;
        for (k = 0; k < klen; k++) {
            var cell = row.Cells[k];
            TIFCell_SaveCell.call(cell);
        }
        rowsToSave.push(row);
    }

    if (rowsToSave == null || rowsToSave.length == 0)
        return;

    //server save
    var ajax = SM.GetXmlRequest();
    var url = this.SiteUrl + this.ModulPath + '/SaveRows.aspx?rnd=' + Math.random();

    var clientField = { Rows: rowsToSave };
    var clientFieldJson = SM.Stringify(clientField);
    clientFieldJson = encodeURIComponent(clientFieldJson);

    var params = new String();
    params = params.concat('listID=', this.ListID);
    params = params.concat('&itemID=', this.ItemID);
    params = params.concat('&fieldID=', this.FieldID);
    params = params.concat('&clientField=', clientFieldJson);
    params = encodeURI(params);

    ajax.open("POST", url, false);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    ajax.send(params);

    //reset save flag
    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        row.RequiredUpdate = false;
    }

    var jsonString = ajax.responseText;
    var jsonResponse = jQuery.parseJSON(jsonString);
    if (jsonResponse != null) {
        if (jsonResponse.IsError) {
            saveArgs.CanSave = false;
            alert(jsonResponse.CallStack);
            return;
        }
        else {
            var callbackResult = TIF_UpdateRowsIdentities.call(this, jsonResponse);
            if (callbackResult.IsError) {
                var errorMsg = null;
                if (!SM.IsNE(callbackResult.Message))
                    errorMsg = callbackResult.Message;

                if (SM.IsNE(callbackResult.Message))
                    errorMsg = 'Не удалось сопоставить идентификаторы сохраненных строк.';

                alert(errorMsg);
                return;
            }
        }
    }

    //обработчик на сохранение
    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        if (row.ItemID > 0)
            row.FireEvent('Saved', { SaveAll: true }, true);
    }

    //change mode
    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        if (!row.IsEditMode || row.Deleted || row.SaveDisabled)
            continue;

        if (row.ItemID > 0)
            TIF_ChangeRowMode.call(this, row);
    }
}

function TIF_ReverseString(value) {
    if (SM.IsNE(value))
        throw new Error('value is null');

    var result = '';
    var arr = [];
    var i, len = value.length;
    for (i = 0; i < len; i++)
        arr.push(value[i]);

    arr = arr.reverse();

    i, len = arr.length;
    for (i = 0; i < len; i++)
        result += arr[i];

    return result;
}

function TIF_FormatNumber(value, formatFractionPart) {
    if (value == null)
        throw new Error('value is null');

    var valueString = value.toString();
    valueString = TIF_RemoveSpaces(valueString);
    valueString = valueString.replace(',', '.');
    var dotIndex = valueString.indexOf('.');
    var intPart = valueString;
    var fractionPart = '00';

    //обрезаем дробную часть до двух знаков
    if (dotIndex != -1) {
        intPart = valueString.substr(0, dotIndex);
        fractionPart = valueString.substr(dotIndex + 1);
        if (!SM.IsNE(fractionPart)) {
            if (fractionPart.length == 1)
                fractionPart = fractionPart + '0';
            else if (fractionPart.length > 2) {
                fractionPart = fractionPart.charAt(0) + fractionPart.charAt(1);
            }
        }
        else
            fractionPart = '00';


    }
    else {
        //дробной части нет
        valueString += '.00';
    }

    //форматируем целую часть
    if (intPart.length > 3) {
        var intPartReverse = TIF_ReverseString(intPart);
        var i, len = intPartReverse.length;
        var intPartReverseFormat = '';
        var spacesCount = 0;

        for (i = 0; i < len; i++) {
            intPartReverseFormat += intPartReverse[i];
            if ((intPartReverseFormat.length - spacesCount) % 3 == 0) {
                intPartReverseFormat += ' ';
                spacesCount++;
            }
        }

        intPartReverseFormat = intPartReverseFormat.trim(' ');
        intPart = TIF_ReverseString(intPartReverseFormat);
    }

    valueString = intPart;
    if (formatFractionPart)
        valueString += '.' + fractionPart;
    return valueString;
}

function TIF_UpdateRowsIdentities(response) {
    var result = {
        IsError: false,
        Message: ''
    };

    try {
        if (response == null)
            throw new Error('response is null');

        if (SM.IsNE(response.Result))
            throw new Error('response.Result is null');

        var rowsByClientID = [];
        if (this.Rows != null) {
            var i, len = this.Rows.length;
            for (i = 0; i < len; i++) {
                var row = this.Rows[i];
                if (!SM.IsNE(row.ClientID))
                    rowsByClientID[row.ClientID] = row;
            }
        }

        //обходим серверный словарь
        var identities = JSON.parse(response.Result);
        if (identities == null)
            throw new Error('Не удалось получить массив идентификаторов строк с сервера.');

        var j, jlen = identities.length;
        for (j = 0; j < jlen; j++) {
            var identity = identities[j];
            if (SM.IsNE(identity.Key))
                throw new Error('Для одной из сохраненных строк не был задан клиентский идентификатор');

            if (SM.IsNE(identity.Value))
                throw new Error('Для одной из сохраненных строк на сервере не был получен идентификатор');

            var row = rowsByClientID[identity.Key];
            if (row == null)
                throw new Error('Для одной из сохраненных строк не найдено сопоставление по идентификатору сохранения: ' + identity.Key);

            row.ItemID = identity.Value;

            //accepted
            if (identity.Accepted) {
                row.Accepted = true;
                var saveImg = document.getElementById(row.SaveImgID);
                var editImg = document.getElementById(row.EditImgID);
                var delImg = document.getElementById(row.DeleteImgID);

                if (delImg != null)
                    delImg.style.display = 'none';
                if (saveImg != null)
                    saveImg.style.display = 'none';
                if (editImg != null)
                    editImg.style.display = 'none';
            }
        }
    }
    catch (ex) {
        result.IsError = true;
        result.Message = ex.message;
    }

    return result;
}

///Добавляет кастомный обработчик валидации.
function TIF_AddValidationHandler(handler) {
    try {
        if (handler == null)
            throw new Error('handler is null');

        if (this.ValidationHandlers == null)
            this.ValidationHandlers = [];

        this.ValidationHandlers.push(handler);
    }
    catch (ex) {
        alert('Не удалось добавить обработчик валидации поля. Текст ошибки: ' + ex.message);
    }
}

///Валидация поля по кастомным обработчикам.
function TIF_ValidateByCustomHandlers() {
    var result = {
        CanSave: true,
        Message: ''
    };

    //кастом валидация
    if (this.ValidationHandlers != null) {
        var vi, vlen = this.ValidationHandlers.length;
        for (vi = 0; vi < vlen; vi++) {
            var validationHandler = this.ValidationHandlers[vi];

            //validationResult = {Message = '', CanSave = false/true }
            var validationResult = validationHandler.call(this);
            if (validationResult != null && !validationResult.CanSave) {
                result.CanSave = false;
                result.Message = validationResult.Message;
            }
        }
    }

    //кастомный обработчик не задал текст валидации, устанавливаем текст по умолчанию.
    if (!result.CanSave && SM.IsNE(result.Message)) {
        var rowNumber = this.GetNumber();
        result.Message = 'Невозможно сохранить поле ' + this.FieldName + ', неизвестная ошибка.';
    }

    return result;
}

/************************ ROW *******************/
/************************************************/
/************************************************/

function TIFRow_InitializeInterfaces() {
    this.GetCell = TIFRow_GetCell;
    this.ParentField = TIFRow_ParentField;
    this.DisableSave = TIFRow_DisableSave;
    this.EnableSave = TIFRow_EnableSave;
    this.AddValidationHandler = TIFRow_AddValidationHandler;
    this.GetNumber = TIFRow_GetNumber;
    this.SetNumber = TIFRow_SetNumber;
    this.Save = TIFRow_Save;

    this.EditIcon = TIFRow_EditIcon;
    this.SaveIcon = TIFRow_SaveIcon;
    this.DeleteIcon = TIFRow_DeleteIcon;

    this.HideEditIcon = TIFRow_HideEditIcon;
    this.ShowEditIcon = TIFRow_ShowEditIcon;
    this.HideSaveIcon = TIFRow_HideSaveIcon;
    this.ShowSaveIcon = TIFRow_ShowSaveIcon;
    this.HideDeleteIcon = TIFRow_HideDeleteIcon;
    this.ShowDeleteIcon = TIFRow_ShowDeleteIcon;
    this.IsNew = TIFRow_IsNew;

    this.TableRow = TIFRow_TableRow;
    this.Hide = TIFRow_Hide;
    this.Show = TIFRow_Show;
    this.IsFilled = TIFRow_IsFilled;
    this.HasEditAccess = TIFRow_HasEditAccess;
    this.AllowEditing = TIFRow_AllowEditing;
    this.Copy = TIFRow_Copy;

    SM.ApplyEventModel(this);
}

function TIFRow_Copy() {

    var field = this.ParentField();
    //пустой объект строки
    var rowLen = 0;
    if (field.Rows)
        rowLen = field.Rows.length;

    //создание объекта строки
    var row = TIF_CreateRowObject.call(field, null, rowLen);

    if (field.Columns) {
        var i, len = field.Columns.length;
        for (i = 0; i < len; i++) {
            var column = field.Columns[i];
            if (column.DenyCopy)
                continue;

            //копирование значений столбца
            var sourceCell = this.GetCell(column.Name);
            var targetCell = row.GetCell(column.Name);

            if (sourceCell && targetCell) {
                switch (column.Type) {
                    case 'Lookup':
                    case 'Choice':
                    case 'Boolean':
                    case 'MultiText':
                    case 'Text':
                    case 'Integer':
                    case 'Number':
                        {
                            var isNumber = column.Type == 'Number';
                            var isInteger = column.Type == 'Integer';

                            var sourceValue = sourceCell.GetValue();
                            if ((isInteger || isNumber) && !SM.IsNE(sourceValue)) {
                                var numberOfDecimals = column.NumberOfDecimal;
                                var isAutoFormat = false;
                                if (!numberOfDecimals)
                                    numberOfDecimals = 0;
                                else
                                    isAutoFormat = numberOfDecimals == -1;

                                var formatParams = {
                                    NumberOfDecimals: numberOfDecimals,
                                    AutoNumberOfDecimals: isAutoFormat,
                                };
                                sourceValue = TextControl_FormatNumber.call(formatParams, sourceValue);
                            }

                            targetCell.SetValue(sourceValue);

                            break;
                        }
                    case 'DateTime':
                        {
                            var sourceValue = sourceCell.GetStringValue();
                            targetCell.SetValue(sourceValue);
                            break;
                        }
                    default:
                        break;//копирование столбца не поддерживается
                }
            }
        }
    }

    //создание UI строки
    var table = window.document.getElementById(field.TableID);
    if (!table)
        throw new Error('Не удалось получить таблицу поля.');

    row = TIF_CreateRow.call(field, row, table.firstChild, true);

    field.Rows.push(row);
    field.FireEvent('RowAdded', { Row: row }, true);

    return row;
}

function TIFRow_AllowEditing() {
    var allowEditing = !this.Accepted;
    if (!allowEditing) {
        var field = this.ParentField();
        allowEditing = field.AllowEditAcceptedRows;
    }

    return allowEditing;
}

function TIFRow_HasEditAccess() {
    var field = this.ParentField();
    var access = this.Access;
    var hasEditAccess = false;

    if (field.CustomManager.GetRowAccess)
        access = field.CustomManager.GetRowAccess(this);

    hasEditAccess = access == 'Edit' || access == 'Full';

    return hasEditAccess;
}

function TIFRow_IsFilled() {
    if (!this.IsNew())
        return true;

    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];

        if (cell.IsEditMode) {
            var cellFilled = !TIFCell_IsEmptyCell.call(cell);
            if (cellFilled)
                return true;
        }
    }
    return false;
}

function TIFRow_IsNew() {
    var itemCreated = this.ItemID > 0;
    return !itemCreated;
}

function TIFRow_EditIcon() {
    var editImg = null;
    if (!SM.IsNE(this.EditImgID))
        editImg = document.getElementById(this.EditImgID);

    return editImg;
}

function TIFRow_SaveIcon() {
    var editImg = null;
    if (!SM.IsNE(this.SaveImgID))
        editImg = document.getElementById(this.SaveImgID);

    return editImg;
}

function TIFRow_DeleteIcon() {
    var deleteImg = null;
    if (!SM.IsNE(this.DeleteImgID))
        deleteImg = document.getElementById(this.DeleteImgID);

    return deleteImg;
}

function TIFRow_HideEditIcon() {
    var editIcon = this.EditIcon();
    if (editIcon && !editIcon.Hidden) {
        editIcon.style.display = 'none';
        editIcon.Hidden = true;
    }
}

function TIFRow_ShowEditIcon() {
    //нельзя показать иконку редактирования находясь в режиме редактирования.
    if (this.IsEditMode)
        return;

    var editIcon = this.EditIcon();
    if (editIcon && editIcon.Hidden) {
        editIcon.style.display = '';
        editIcon.Hidden = false;
    }
}

function TIFRow_HideSaveIcon() {
    var saveIcon = this.SaveIcon();
    if (saveIcon && !saveIcon.Hidden) {
        saveIcon.style.display = 'none';
        saveIcon.Hidden = true;
    }
}

function TIFRow_ShowSaveIcon() {
    //нельзя показать иконку сохранения находясь в режиме просмотра.
    if (!this.IsEditMode)
        return;

    var saveIcon = this.SaveIcon();
    if (saveIcon && saveIcon.Hidden) {
        saveIcon.style.display = '';
        saveIcon.Hidden = false;
    }
}

function TIFRow_HideDeleteIcon() {
    var deleteIcon = this.DeleteIcon();
    if (deleteIcon && !deleteIcon.Hidden) {
        deleteIcon.style.display = 'none';
        deleteIcon.Hidden = true;
    }
}

function TIFRow_ShowDeleteIcon() {
    var deleteIcon = this.DeleteIcon();
    if (deleteIcon && deleteIcon.Hidden) {
        deleteIcon.style.display = '';
        deleteIcon.Hidden = false;
    }
}

function TIFRow_TableRow() {
    if (SM.IsNE(this.RowID))
        throw new Error('Для строки не задан идентификатор');

    if (this.Deleted)
        throw new Error('Строка была удалена. Невозможно получить строку из таблицы.');

    var tableRow = window.document.getElementById(this.RowID);
    if (tableRow == null)
        throw new Error('Не удалось найти строку с идентификатором ' + this.RowID + '. Возможна она еще не была добавлена в разметку.');

    return tableRow;
}

function TIFRow_Hide() {
    //если строка уже скрыта, то скрывать ее еще раз не нужно.
    if (this.Hidden)
        return;

    this.TableRow().style.display = 'none';
    this.Hidden = true;
}

function TIFRow_Show() {
    //если есть явный признак что строка не скрыта, то и открывать ее нет необходимости, она уже отображается.
    if (this.Hidden != null && !this.Hidden)
        return;

    this.TableRow().style.display = '';
    this.Hidden = false;
}

function TIFRow_GetNumber() {
    var number = 0;

    if (!SM.IsNE(this.CounterCellID)) {
        var counterCell = window.document.getElementById(this.CounterCellID);
        if (counterCell != null)
            number = counterCell.Index;
    }
    return number;
}

function TIFRow_SetNumber(number) {
    if (number < 1)
        throw new Error('Параметр number должен быть больше 0');

    if (!SM.IsNE(this.CounterCellID)) {
        var counterCell = window.document.getElementById(this.CounterCellID);
        if (counterCell != null) {
            counterCell.Index = number;
            SM.SetInnerText(counterCell, number.toString());
        }
    }
    return number;
}

function TIFRow_ParentField() {
    var field = null;
    if (!SM.IsNE(this.FieldName))
        field = GetTIField(this.FieldName);

    if (field == null)
        throw new Error('Не удалось найти поле табличных элементов с именем "' + this.FieldName + '"');

    return field;
}

function TIFRow_AddValidationHandler(handler) {
    try {
        if (handler == null)
            throw new Error('handler is null');

        if (this.Deleted)
            throw new Error('Нельзя добавить обработчик валидации на удаленную строку (row.Deleted).');

        if (this.ValidationHandlers == null)
            this.ValidationHandlers = [];

        this.ValidationHandlers.push(handler);
    }
    catch (ex) {
        alert('Не удалось добавить обработчик валидации строки. Текст ошибки: ' + ex.message);
    }
}

function TIFRow_DisableSave() {
    if (this.SaveDisabled)
        return;

    this.SaveDisabled = true;
    var disabledIconUrl = '/_LAYOUTS/WSS/WSSC.V4.DMS.Fields.TableItems/images/saveitem_disabled.png';
    var saveImg = null;
    if (!SM.IsNE(this.SaveImgID)) {
        saveImg = document.getElementById(this.SaveImgID);
        if (saveImg != null)
            saveImg.src = disabledIconUrl;
    }
}

function TIFRow_EnableSave() {
    if (!this.SaveDisabled)
        return;

    this.SaveDisabled = false;

    var enabledIconUrl = '/_layouts/images/saveitem.gif';
    var saveImg = null;
    if (!SM.IsNE(this.SaveImgID)) {
        saveImg = document.getElementById(this.SaveImgID);
        if (saveImg != null)
            saveImg.src = enabledIconUrl;
    }
}

function TIFRow_OnEventColumnChange(args) {
    if (args == null)
        throw new Error('args is null');

    if (args.Field == null)
        throw new Error('args.Field is null');

    if (SM.IsNE(args.ColumnName))
        throw new Error('args.ColumnName is null');

    //сначала вызываем обработчик на изменение по строке
    TIFRow_OnEventColumnChangeHandler.call(this, args.ColumnName);

    //потом уже тот, который считает общие суммы
    TIF_OnEventColumnChangeHandler.call(args.Field, args.ColumnName);
}

function TIFRow_UpdateLinkedFields(lookupSettings, lookupIdentities, loadedFields) {
    if (lookupSettings == null)
        throw new Error('lookupSettings is null');

    if (lookupIdentities == null)
        throw new Error('lookupIdentities is null');

    if (loadedFields == null)
        throw new Error('loadedFields is null');

    var field = this.ParentField();
    if (lookupIdentities.length < 1) {
        //значение удалено, проставляем везде null
        var j, jlen = loadedFields.length;
        for (j = 0; j < jlen; j++) {
            var linkedColumnName = loadedFields[j];
            var linkedCell = TIFRow_GetCell.call(this, linkedColumnName);
            if (linkedCell == null)
                continue;

            TIFCell_SetValue.call(linkedCell, null);
        }
        return;
    }

    var lookupList = lookupSettings.LookupList();
    if (lookupList == null)
        return;

    var thisObj = this;
    var query;
    if (lookupIdentities.length == 1)
        query = 'ID = ' + lookupIdentities[0];
    else {
        var identitiesString = lookupIdentities.join(',');
        query = 'ID IN (' + identitiesString + ')';
    }

    //обработчик получения значений на сервере
    var handler = function (lookupItems) {
        var j, jlen = loadedFields.length;
        for (j = 0; j < jlen; j++) {
            var linkedColumnName = loadedFields[j];
            var linkedCell = TIFRow_GetCell.call(thisObj, linkedColumnName);
            if (linkedCell == null)
                continue;

            var valueToSet = null;
            var column = field.GetColumn(linkedCell.ColumnName);
            if (!column)
                continue;

            if (lookupItems && lookupItems.length > 0) {
                var i, len = lookupItems.length;
                for (i = 0; i < len; i++) {
                    var lookupItem = lookupItems[i];
                    var value = lookupItem.GetValue(linkedColumnName);

                    //подстановка
                    if (column.Type == 'Lookup') {
                        if (column.IsMultiple && !valueToSet)
                            valueToSet = [];

                        if (value) {
                            var attrID = value.getAttribute('LookupID');
                            var attrText = value.getAttribute('LookupText');
                            var attrUrl = value.getAttribute('LookupUrl');

                            value = {
                                LookupID: attrID,
                                LookupText: attrText,
                                Url: attrUrl
                            };

                            if (column.IsMultiple)
                                valueToSet.push(value);
                            else
                                valueToSet = value;
                        }
                    }
                    else {
                        if (value) {
                            if (value.toString)
                                value = value.toString();
                            else {
                                //проверка на xml document
                                var isXmlDocument = !SM.IsNE(value.xml);
                                if (isXmlDocument) {
                                    var attrID = value.getAttribute('LookupID');
                                    var attrText = value.getAttribute('LookupText');
                                    if (attrID > 0 && !SM.IsNE(attrText))
                                        value = attrText;
                                }
                                else
                                    value = null;
                            }
                        }

                        if (!value)
                            value = '';

                        //складываем только столбцы с определенными типами ("складываемые")
                        if (column.Type == 'MultiText' || column.Type == 'Text') {
                            if (!valueToSet)
                                valueToSet = '';

                            if (!SM.IsNE(value)) {
                                if (!SM.IsNE(valueToSet))
                                    valueToSet += ';';

                                valueToSet += value;
                            }
                        }
                        else
                            valueToSet = value;
                    }
                }
            }

            TIFCell_SetValue.call(linkedCell, valueToSet);
        }
    };

    //получаем выбранный элемент(ы) с полями.
    //async
    //lookupList.GetItems(query, loadedFields, handler);

    //sync
    var syncResult = lookupList.GetItems(query, loadedFields);
    handler(syncResult);
}

function TIFRow_OnEventColumnChangeHandler(columnName) {
    if (SM.IsNE(columnName))
        throw new Error('columnName is null');

    var field = this.ParentField();
    var column = TIF_GetColumn.call(field, columnName, true);
    //если по текущему столбцу вычисляется значение других столбцов
    if (!SM.IsNE(column.CalculateTargetColumnName)) {
        //получаем столбец, в который нужно установить результат
        var calculateTargetColumn = TIF_GetColumn.call(field, column.CalculateTargetColumnName, true);
        if (calculateTargetColumn.Access == 'None')
            return;

        //ячейка, в которую нужно установить значение.
        var targetCell = TIFRow_GetCell.call(this, calculateTargetColumn.Name);
        if (targetCell == null)
            throw new Error('Не удалось получить ячейку для установки значения для столбца ' + calculateTargetColumn.Name);

        if (calculateTargetColumn.CalculateColumns == null)
            throw new Error('Для столбца "' + calculateTargetColumn.Name + '" не найдено ни одного столбца, по которому вычисляется значение данного столбца.');

        var expression = calculateTargetColumn.CalcucateExpression;
        if (SM.IsNE(expression))
            throw new Error('Не удалось получить вычислительное выражения для столбца ' + calculateTargetColumn.Name);

        var expressionContainsReadOnlyColumns = false;
        var i, len = calculateTargetColumn.CalculateColumns.length;
        for (i = 0; i < len; i++) {
            var calcColumn = calculateTargetColumn.CalculateColumns[i];
            if (calcColumn.Access == 'None') {
                expressionContainsReadOnlyColumns = true;
                break;
            }

            var expressionColumnName = '[' + calcColumn.Name + ']';
            var calcCell = TIFRow_GetCell.call(this, calcColumn.Name);
            var calcCellValue = TIFCell_GetValue.call(calcCell);
            calcCellValue = TIF_RemoveSpaces(calcCellValue);
            if (SM.IsNE(calcCellValue))
                calcCellValue = 0;

            expression = expression.replace(expressionColumnName, calcCellValue);
        }

        if (expressionContainsReadOnlyColumns)
            return;

        //для корректного eval меняем , на .
        expression = expression.replace(/,/gm, '.')
        var value = eval(expression);
        var valid = TIF_MatchNumber(value);
        if (!valid)
            throw new Error('Не удалось вычислить выражение для столбца "' + calculateTargetColumn.Name + '".');

        //форматируем число.
        var formatFractionPart = calculateTargetColumn.Type == 'Number';
        var valueString = TIF_FormatNumber(value, formatFractionPart);

        //устанавливаем значение
        TIFCell_SetValue.call(targetCell, valueString);
    }
}

function TIFRow_GetCell(columnName) {
    if (SM.IsNE(columnName))
        throw new Error('columnName is null');

    var resultCell = null;
    if (this.Cells != null) {
        var i, len = this.Cells.length;
        for (i = 0; i < len; i++) {
            var cell = this.Cells[i];
            if (cell.ColumnName == columnName) {
                resultCell = cell;
                break;
            }
        }
    }

    return resultCell;
}

function TIFRow_ValidateByCustomHandlers() {
    var field = this.ParentField();

    var result = {
        CanSave: true,
        Message: ''
    };

    //кастом валидация
    if (this.ValidationHandlers != null) {
        var vi, vlen = this.ValidationHandlers.length;
        for (vi = 0; vi < vlen; vi++) {
            var validationHandler = this.ValidationHandlers[vi];

            //validationResult = {Message = '', CanSave = false/true }
            var validationResult = validationHandler.call(this, field);
            if (validationResult != null && !validationResult.CanSave) {
                result.CanSave = false;
                result.Message = validationResult.Message;
            }
        }
    }

    //кастомный обработчик не задал текст валидации, устанавливаем текст по умолчанию.
    if (!result.CanSave && SM.IsNE(result.Message)) {
        var rowNumber = this.GetNumber();
        result.Message = 'Невозможно сохранить строку ' + rowNumber + ', неизвестная ошибка.';
    }

    return result;
}

function TIFRow_Save() {
    //сохранение запрещено.
    if (this.SaveDisabled)
        return;

    var field = this.ParentField();

    if (this.Cells == null)
        throw Error('this.Cells is null');

    //валидация
    var i, len = this.Cells.length,
    commonMessage = '', complete = true;

    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        var res = TIFCell_ValidateCell.call(cell);
        if (!res.Complete) {
            complete = false;
            commonMessage += res.Message + '\r\n';
        }
    }

    //кастомная валидация
    if (complete) {
        var customValidationResult = TIFRow_ValidateByCustomHandlers.call(this);
        if (!customValidationResult.CanSave) {
            complete = false;
            commonMessage = customValidationResult.Message;
        }
    }

    //сохранение значения ячейки
    if (complete) {
        for (i = 0; i < len; i++) {
            var cell = this.Cells[i];
            TIFCell_SaveCell.call(cell);
        }
    }

    if (complete) {
        this.RequiredUpdate = true;
        //save on server
        var ajax = SM.GetXmlRequest();
        var url = field.SiteUrl + field.ModulPath + '/SaveRows.aspx?rnd=' + Math.random();

        var clientField = { Rows: [] };
        this.ClientID = Math.random().toString();
        clientField.Rows.push(this);

        var clientFieldJson = SM.Stringify(clientField);
        clientFieldJson = encodeURIComponent(clientFieldJson);

        var params = new String();
        params = params.concat('listID=', field.ListID);
        params = params.concat('&itemID=', field.ItemID);
        params = params.concat('&fieldID=', field.FieldID);
        params = params.concat('&clientField=', clientFieldJson);
        params = encodeURI(params);

        ajax.open("POST", url, false);
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        ajax.send(params);

        this.RequiredUpdate = false;
        var jsonString = ajax.responseText;
        var jsonResponse = jQuery.parseJSON(jsonString);
        if (jsonResponse != null) {
            if (jsonResponse.IsError) {
                alert(jsonResponse.CallStack);
                return;
            }
            else {
                var callbackResult = TIF_UpdateRowsIdentities.call(field, jsonResponse);
                if (callbackResult.IsError) {
                    var errorMsg = null;
                    if (!SM.IsNE(callbackResult.Message))
                        errorMsg = callbackResult.Message;

                    if (SM.IsNE(callbackResult.Message))
                        errorMsg = 'Не удалось сопоставить идентификаторы сохраненных строк.';

                    alert(errorMsg);
                    return;
                }
            }
        }

        if (this.IsEditMode)
            TIF_ChangeRowMode.call(field, this);

        this.FireEvent('Saved', { SaveAll: false }, true);
    }
    else
        alert(commonMessage);
}

function TIFRow_ChangeCellMode(cell) {
    if (cell == null)
        throw Error('cell is null');

    if (!TIFCell_IsValid.call(cell))
        return;

    var field = this.ParentField();
    var column = cell.ParentColumn();

    var dispContainer = cell.DispControlContainer();
    var editContainer = cell.EditControlContainer();

    if (this.IsEditMode) {
        //переходим в режим просмотра (проверка достпупа не требуется, т.к. на ячейку уже есть доступ на редактирование)
        var tableCell = cell.TableCell();
        if (!cell.ViewControlInited)
            TIFCell_InitViewControl.call(cell, tableCell);

        TIFCell_UpdateViewControl.call(cell);
        if (!column.Disabled) {
            //показываем disp контролы 
            if (dispContainer != null)
                dispContainer.style.display = '';

            //скрываем edit контролы
            if (editContainer != null)
                editContainer.style.display = 'none';
        }
        cell.IsEditMode = false;
    }
    else {
        //переходим в режим редактирования (доступа на редактирование может не быть)
        var hasEditAccess = TIFCell_HasEditAccess.call(cell, column) && field.IsEditMode;

        if (hasEditAccess) {
            var editControlinitedNow = false;
            if (!cell.EditControlInited) {
                var tableCell = cell.TableCell();
                TIFCell_InitEditControl.call(cell, tableCell);
                editControlinitedNow = true;
            }

            if (!column.Disabled) {
                //скрываем disp контролы 
                if (dispContainer != null)
                    dispContainer.style.display = 'none';

                if (!editControlinitedNow) {
                    //показываем edit контролы
                    if (editContainer != null)
                        editContainer.style.display = '';
                }
            }
        }

        cell.IsEditMode = cell.EditControlInited;
    }
}

function TIFRow_CheckSelectedSolution(solution) {
    if (SM.IsNE(solution))
        throw new Error('solution is null');

    var field = this.ParentField();

    var result = false;
    var i, len = this.Cells.length;
    for (i = 0; i < len; i++) {
        var cell = this.Cells[i];
        if (cell.ColumnName == field.SolutionColumnName) {
            result = cell.ClientSolution == solution;
            break;
        }
    }

    return result;
}

/************************ CELL *******************/
/************************ CELL *******************/
/************************ CELL *******************/
function TIFCell_InitializeInterfaces() {
    this.GetValue = TIFCell_GetTypedValue;
    this.SetValue = TIFCell_SetTypedValue;
    this.ParentField = TIFCell_ParentField;
    this.ParentRow = TIFCell_ParentRow;
    this.IsEmpty = TIFCell_IsEmptyCell;
    this.TableCell = TIFCell_TableCell;
    this.DispControl = TIFCell_DispControl;
    this.EditControl = TIFCell_EditControl;

    this.EditControlContainer = TIFCell_EditControlContainer;
    this.DispControlContainer = TIFCell_DispControlContainer;

    this.ParentColumn = TIFCell_ParentColumn;
    this.GetStringValue = TIFCell_GetStringValue;

    SM.ApplyEventModel(this);
}

function TIFCell_OnChange(cellArgs) {
    var field = this.ParentField(),
    row = this.ParentRow(),
    column = this.ParentColumn();

    var eventArgs = {
        Field: field,
        ColumnName: this.ColumnName,
        Cell: this,
    };

    if (this.FireEvent == null) {
        var cellID = this.ID;
        throw new Error('Для ячейки столбца "' + column.Name + '" невозможно вызвать FireEvent(). Необходимо сначала реализовать модель обработчиков.');
    }

    //вызов обработчика колонок, изменения в которых необходимо отслеживать.
    if (column.IsEventColumn)
        this.FireEvent('EventCellChanged', eventArgs);

    //вызов общего обработчика изменения ячейки и строки
    this.FireEvent('Changed', cellArgs, true);

    //вызов общего обработчика изменения ячейки и строки
    //складываем все аргументы (в обработчике изменения строки пригодится все)
    SM.ApplyOptions(eventArgs, cellArgs, null);
    row.FireEvent('Changed', eventArgs, true);
}

function TIFCell_EditControlContainer() {
    var editControlContainer = null;
    if (!SM.IsNE(this.EditControlContainerID))
        editControlContainer = document.getElementById(this.EditControlContainerID);

    return editControlContainer;
}

function TIFCell_DispControlContainer() {
    var dispControlContainer = null;
    if (!SM.IsNE(this.DispControlContainerID))
        dispControlContainer = document.getElementById(this.DispControlContainerID);

    return dispControlContainer;
}

function TIFCell_ParentColumn() {
    var field = this.ParentField();
    var column = field.GetColumn(this.ColumnName, true);

    return column;
}

function TIFCell_ParentField() {
    var field = null;
    if (!SM.IsNE(this.FieldName))
        field = GetTIField(this.FieldName);

    if (field == null)
        throw new Error('Не удалось найти поле для ячейки строки');

    return field;
}

function TIFCell_ParentRow() {
    var row = null;
    if (!SM.IsNE(this.RowID)) {
        var field = GetTIField(this.FieldName);
        if (field.RowsByID != null) {
            row = field.RowsByID[this.RowID];
        }
    }

    return row;
}

function TIFCell_DispControl(trownException) {
    var dispControl = null;
    if (!SM.IsNE(this.ViewControlID))
        dispControl = document.getElementById(this.ViewControlID);

    if (dispControl == null && trownException)
        throw new Error('Не удалось найти контрол просмотра для ячейки' + this.CellID);

    return dispControl;
}

function TIFCell_EditControl(trownException) {
    var editControl = null;
    if (!SM.IsNE(this.EditControlID))
        editControl = document.getElementById(this.EditControlID);

    if (editControl == null && trownException)
        throw new Error('Не удалось найти контрол редактирования для ячейки' + this.CellID);

    return editControl;
}

function TIFCell_GetTypedValue() {
    var field = GetTIField(this.FieldName);
    var value = TIFCell_GetValue.call(this, true);

    var typedValue = null;
    if (!SM.IsNE(value)) {
        var column = this.ParentColumn();
        switch (column.Type) {
            case 'DateTime':
                {
                    var dateString = '';
                    var timeString = '';
                    if (value.indexOf(' ') != -1) {
                        var parts = value.split(' ');
                        if (parts.length > 0)
                            dateString = parts[0];
                        if (parts.length > 1)
                            timeString = parts[1];
                    }

                    var year = NaN, month = NaN, day = NaN;
                    var hours = 0, minutes = 0, seconds = 0;

                    if (!SM.IsNE(dateString)) {
                        var dateParts = dateString.split('.');
                        if (dateParts != null && dateParts.length == 3) {
                            day = dateParts[0] | 0;
                            month = dateParts[1] | 0;
                            year = dateParts[2] | 0;
                        }
                    }

                    if (!SM.IsNE(timeString)) {
                        var timeParts = timeString.split(':');
                        if (timeParts != null && timeParts.length > 0) {
                            hours = timeParts[0] | 0;
                            if (timeParts.length > 1)
                                minutes = timeParts[1] | 0;
                            if (timeParts.length > 3)
                                seconds = timeParts[2] | 0;
                        }
                    }

                    month -= 1;

                    if (year > 0 && month > 0 && month < 13 && day > 0 && day < 32 && hours > -1 && hours < 25
                    && minutes > -1 && minutes < 61 && seconds > -1 && seconds < 61)
                        typedValue = new Date(year, month, day, hours, minutes, seconds);
                    break
                }
            case 'Integer':
                {
                    value = TIF_RemoveSpaces(value);
                    typedValue = SM.IsNE(value) ? null : value | 0;
                    break;
                }
            case 'Number':
                {
                    value = TIF_RemoveSpaces(value);
                    if (!SM.IsNE(value))
                        value = value.replace(',', '.');

                    typedValue = SM.IsNE(value) ? null : parseFloat(value);
                    break;
                }
            case 'Lookup':
                {
                    if (value) {
                        if (!column.IsMultiple) {
                            typedValue = {
                                LookupID: value.LookupID,
                                LookupText: value.LookupText
                            };
                        }
                        else {
                            typedValue = [];
                            var i, len = value.length;
                            for (i = 0; i < len; i++) {
                                var singleValue = value[i];
                                typedValue.push({
                                    LookupID: singleValue.LookupID,
                                    LookupText: singleValue.LookupText
                                });
                            }
                        }
                    }

                    break;
                }
            case 'Boolean':
                {
                    typedValue = false;
                    if (value)
                        typedValue = true;
                    break;
                }
            default:
                {
                    typedValue = value; //  Для всего остального возвращаем полученное значение по умолчанию.
                    break;
                }
        }
    }

    return typedValue;
}

function TIFCell_SetTypedValue(value) {
    TIFCell_SetValue.call(this, value);
}

function TIFCell_IsValid() {
    return this.EditControlInited || this.ViewControlInited;
}

function TIFCell_ValidateCell() {
    var result = { Complete: true, Message: '' };

    //общая валидация
    if (TIFCell_IsValid.call(this)) {
        var field = this.ParentField();
        var row = this.ParentRow();

        var field = GetTIField(this.FieldName),
        column = field.GetColumn(this.ColumnName, true),
        counterCell = null, editControl = null;

        var rowNumber = row.GetNumber();

        var currentSolution = null;
        if (window.SLFieldInstance)
            currentSolution = window.SLFieldInstance.SelectedSolutionName;

        var dynamicRequired = false;
        if (!SM.IsNE(currentSolution) && column.RequiredBySolutions) {
            var i, len = column.RequiredBySolutions.length;
            for (i = 0; i < len; i++) {
                var solutionName = column.RequiredBySolutions[i];
                if (!SM.IsNE(solutionName) && solutionName.toString().toLowerCase() == currentSolution.toLowerCase()) {
                    dynamicRequired = true;
                    break;
                }
            }
        }

        ///валидация на обязательность
        if ((dynamicRequired || column.Required) && !column.Disabled) {
            var isEmpty = TIFCell_IsEmptyCell.call(this);
            if (isEmpty) {
                result.Complete = false;
                result.Message = 'Не возможно сохранить строку ' + rowNumber + ', не заполнен столбец "' + column.DisplayName + '"';
            }
        }

        //валидация по типам
        if (result.Complete) {
            if (this.IsEditMode) {
                editControl = window.document.getElementById(this.EditControlID);
                if (editControl != null) {
                    var isDigitField = false;
                    var typedValue = NaN;
                    var baseMessage = 'Некорректно заполнен столбец "' + column.DisplayName + '" в строке ' + rowNumber;

                    switch (column.Type) {
                        case 'DateTime':
                            {
                                if (!editControl.DateControl.IsValid()) {
                                    result.Complete = false;
                                    result.Message = 'Некорректно заполнен столбец "' + column.DisplayName + '" в строке ' + rowNumber;
                                }
                                break;
                            }
                        case 'Integer':
                            {
                                isDigitField = true;
                                var textValue = $(editControl).val();
                                textValue = TIF_RemoveSpaces(textValue);
                                if (!SM.IsNE(textValue)) {
                                    var tempResult = TIF_MatchInteger(textValue);
                                    if (!tempResult.Complete) {
                                        result.Complete = false;
                                        result.Message = 'Некорректно заполнен столбец "' + column.DisplayName + '" в строке ' + rowNumber;
                                        if (tempResult.OutOfRange)
                                            result.Message += '. Значение не попадает в диапазон допустимых значений';
                                    }
                                    else
                                        typedValue = parseInt(textValue);
                                }
                                break;
                            }
                        case 'Number':
                            {
                                isDigitField = true;
                                var textValue = $(editControl).val();
                                textValue = TIF_RemoveSpaces(textValue);
                                if (!SM.IsNE(textValue)) {
                                    //проверка на корректное дробное число (регулярным выражением)
                                    if (!TIF_MatchNumber(textValue)) {
                                        result.Complete = false;
                                        result.Message = baseMessage;
                                    }
                                    else {
                                        var doubleValueString = textValue.replace(',', '.');
                                        typedValue = parseFloat(doubleValueString);
                                    }
                                }
                                break;
                            }
                        default:
                            break;
                    }

                    if (isDigitField) {
                        //для числовых полей еще нужно проверить вхождение в диапозон
                        var colMinVal = NaN;
                        var colMaxVal = NaN;
                        if (!isNaN(column.MinValue))
                            colMinVal = column.MinValue;
                        if (!isNaN(column.MaxValue))
                            colMaxVal = column.MaxValue;

                        //проверка max & min допустимых значений
                        if (!isNaN(colMinVal) && colMinVal > typedValue) {
                            result.Complete = false;
                            result.Message = baseMessage + '. Указано число, которое меньше минимально допустимого значения(' + colMinVal + ').';
                        }
                        else if (!isNaN(colMaxVal) && colMaxVal < typedValue) {
                            result.Complete = false;
                            result.Message = baseMessage + '. Указано число, которое больше максимально допустимого значения(' + colMaxVal + ').';
                        }
                    }
                }
            }
        }

        //валидация на комментарий (при принятии решения)
        if (result.Complete) {
            if (this.ColumnName == field.CommentColumnName) {
                //ячейка с комментарием найдена, проверяем выбранное решение на "Отклонено" ?
                var isClientCanceled = TIFRow_CheckSelectedSolution.call(row, field.RowCancelSolution);
                if (isClientCanceled) {
                    var comment = TIFCell_GetValue.call(this);
                    if (SM.IsNE(comment)) {
                        result.Complete = false;
                        result.Message = 'Невозможно отклонить строку ' + rowNumber + ', так как не задан комментарий.';
                    }
                }
            }
        }
    }

    return result;
}

///Устанавливает значение в ячейку.
function TIFCell_SetValue(value) {
    try {
        var field = this.ParentField();
        var row = this.ParentRow();
        var column = this.ParentColumn();

        var editControl = document.getElementById(this.EditControlID);
        var dispControl = this.DispControl();

        var cellArgs = {
            EditControl: null
        }

        var isNullValue = value == null;

        switch (column.Type) {
            case 'Choice':
                {
                    var choiceValue = null;
                    if (!SM.IsNE(value)) {
                        choiceValue = {
                            Text: value,
                            Value: value
                        };
                    }

                    if (this.IsEditMode) {
                        var listControl = null;
                        if (window.TIFListControls != null)
                            listControl = TIFListControls[this.EditControlID];

                        if (listControl != null)
                            listControl.SetValue(choiceValue);
                    }
                    this.Value = value;
                    break;
                }
            case 'MultiText':
                {
                    if (value == null)
                        value = '';

                    if (this.IsEditMode) {
                        if (editControl != null) {
                            cellArgs.EditControl = editControl;
                            editControl.value = value;
                        }
                    }

                    this.Value = value;
                    break;
                }
            case 'Text':
            case 'Integer':
            case 'Number':
                {
                    //установка в контрол (не важно какой сейчас режим.
                    var textControl = null;
                    if (window.TextControls)
                        textControl = window.TextControls[this.EditControlID];

                    if (textControl)
                        textControl.SetValue(value);

                    //установка значения.
                    this.Value = value;
                    break;
                }
            case 'Lookup':
                {
                    this.LookupValue = { Values: [] };

                    if (value != null) {
                        if (column.IsMultiple) {
                            var i, len = value.length;
                            for (i = 0; i < len; i++) {
                                var singleValue = value[i];
                                this.LookupValue.Values.push({
                                    LookupID: singleValue.LookupID,
                                    LookupText: singleValue.LookupText,
                                });
                            }
                        }
                        else {
                            this.LookupValue.Values.push({
                                LookupID: value.LookupID,
                                LookupText: value.LookupText,
                            });
                        }
                    }

                    //если создан контрол подстановки, то у в него устанавливаем значение.
                    if (!SM.IsNE(this.LookupControlID)) {
                        var lookupContainer = window.document.getElementById(this.LookupControlID);
                        var lookupControl = null;
                        if (lookupContainer != null)
                            lookupControl = lookupContainer.Control;

                        if (lookupControl != null) {
                            cellArgs.EditControl = lookupControl;

                            var valueToSet = null;
                            if (column.IsMultiple)
                                valueToSet = this.LookupValue.Values;
                            else {
                                if (this.LookupValue.Values.length > 0)
                                    valueToSet = this.LookupValue.Values[0];
                            }

                            lookupControl.SetValue(valueToSet, true);
                        }
                    }

                    break;
                }
            case 'Boolean':
                {
                    var bValue = false;
                    if (value)
                        bValue = true;

                    if (this.IsEditMode) {
                        var listControl = null;
                        if (window.TIFListControls != null)
                            listControl = window.TIFListControls[this.EditControlID];

                        if (listControl != null) {
                            var noValue = { Text: TN.TranslateKey('tif.bool.no'), Value: false };
                            var yesValue = { Text: TN.TranslateKey('tif.bool.yes'), Value: true };
                            var currentValue;
                            if (bValue)
                                currentValue = yesValue;
                            else
                                currentValue = noValue;

                            listControl.SetValue({
                                Value: currentValue.Value,
                                Text: currentValue.Text
                            });
                        }
                    }
                    this.Value = bValue;
                    break;
                }
            case 'DateTime':
                {
                    //валидация даты
                    var valid = false;
                    if (DP_IsValidDate != null)
                        valid = DP_IsValidDate(value);

                    if (!valid)
                        return;

                    //установка в контрол (не важно какой сейчас режим.
                    var dtControl = null;
                    if (window.TIFDTControls != null)
                        dtControl = window.TIFDTControls[this.EditControlID];

                    if (dtControl != null)
                        dtControl.SetValue(value);

                    //установка значения.
                    this.Value = value;

                    break;
                }
            default:
                {
                    throw new Error('Неизвестный тип столбца. Тип: "' + column.Type + '"');
                }
        }

        //проставляем флаг, для того чтобы строка сохранялась, если она в режиме отображения, но ей установили значение через API
        if (row.ItemID > 0 || !isNullValue)
            row.RequiredUpdate = true;

        TIFCell_OnChange.call(this, cellArgs);
        if (!this.IsEditMode) {
            var tableCell = document.getElementById(this.CellID);
            if (tableCell != null)
                TIFCell_UpdateViewControl.call(this);
        }
    }
    catch (ex) {
        alert('Возникла ошибка при установке значения в столбец "' + this.ColumnName + '". Текст ошибки: ' + ex.message);
    }
}

function TIFCell_InitViewControl(tableCell) {
    if (this.ViewControlInited)
        return;

    if (tableCell == null)
        throw Error('tableCell is null');

    var field = this.ParentField(), column = this.ParentColumn();
    if (column.Access == 'None')
        return;

    this.ViewControlID = this.CellID + '_viewcontrol';
    var textInited = false;

    var dispControlContainer = document.createElement('div');
    dispControlContainer.className = 'tcell_disp_container'
    this.DispControlContainerID = this.CellID + '_viewcontrol_container';
    dispControlContainer.id = this.DispControlContainerID;

    switch (column.Type) {
        case 'DateTime':
        case 'MultiText':
        case 'Integer':
        case 'Number':
        case 'Choice':
        case 'Boolean':
        case 'Text':
        case 'Lookup':
            {
                var dispControl = TIFCell_BuildViewControl.call(this);
                TIFCell_UpdateViewControlValue.call(this, this.Value, dispControl);
                dispControlContainer.appendChild(dispControl);
                break;
            }
        default:
            {
                alert('Неизвестный тип колонки: ' + column.Type);
                break
            }
    }

    tableCell.appendChild(dispControlContainer);

    this.ViewControlInited = true;
}

///Обновляет значение View контрола ячейки после сохранения значения
function TIFCell_UpdateViewControl() {
    var field = GetTIField(this.FieldName),
    column = this.ParentColumn();

    var textInited = false,
    editControl = window.document.getElementById(this.EditControlID),
    dispControl = this.DispControl(true);

    var valueToSet = null;

    switch (column.Type) {
        case 'MultiText':
            {
                var txtVal = '';
                if (this.EditControlInited)
                    txtVal = $(editControl).val();
                else
                    txtVal = this.Value;

                if (!SM.IsNE(txtVal)) {
                    var regLT = /&lt;/g;
                    var regRT = /&gt;/g;
                    txtVal = txtVal.replace(regLT, "<").replace(regRT, ">");
                }

                valueToSet = txtVal;
                break;
            };
        case 'Integer':
        case 'Number':
        case 'Text':
            {
                valueToSet = this.GetStringValue();
                break;
            }
        case 'Lookup':
            {
                if (this.LookupValue) {
                    if (column.IsMultiple)
                        valueToSet = this.LookupValue.Values;
                    else {
                        if (this.LookupValue.Values && this.LookupValue.Values.length > 0)
                            valueToSet = this.LookupValue.Values[0];
                    }
                }
                break;
            }
        case 'DateTime':
            {
                valueToSet = this.GetStringValue();
                break;
            }
        case 'Boolean':
            {
                valueToSet = this.GetValue();
                break;
            }
        case 'Choice':
            {
                var value = TIFCell_GetValue.call(this);
                var displayValue = value;

                var isSolutionColumn = column.Name == field.SolutionColumnName;
                if (isSolutionColumn && displayValue == field.DefaultVariantSolutionName)
                    displayValue = '';

                valueToSet = displayValue;
                break;
            }
        default:
            {
                alert('Неизвестный тип колонки: ' + column.Type);
                break
            }
    }

    TIFCell_UpdateViewControlValue.call(this, valueToSet, dispControl);
}

///генерирует контрол отображения для ячейки.
function TIFCell_BuildViewControl() {
    var field = this.ParentField(), column = this.ParentColumn();
    var row = this.ParentRow();

    var control = null;
    switch (column.Type) {
        case 'DateTime':
        case 'MultiText':
        case 'Integer':
        case 'Number':
        case 'Choice':
        case 'Boolean':
        case 'Text':
            {
                if (column.LinkToItem) {
                    //создаем ссылку
                    var thisObj = this;
                    control = TIFCell_CreateLink.call(this, {
                        id: this.ViewControlID,
                        onclick: function () {
                            //проверяем isNew каждый клик потому что строка с текущим контролом может быть в какой-то момент уже сохранена
                            if (!row.IsNew()) {
                                var grantAccessUrlCode = null;
                                if (column.GrantAccessByUrl && !SM.IsNE(thisObj.UrlAccessCode))
                                    grantAccessUrlCode = '&ac=' + thisObj.UrlAccessCode;

                                //открываем карточку элемента строки
                                var params = '&closeOnUpdate=true&closeOnCancel=true&showDispFormWithoutEditAccess=true';
                                if (!SM.IsNE(grantAccessUrlCode))
                                    params += grantAccessUrlCode;

                                var rowItemUrl = field.RowsListEditFormUrl + '?ID=' + row.ItemID + params;
                                window.open(rowItemUrl);
                            }
                        }
                    });
                }
                else {
                    //создаем блок с текстом
                    control = window.document.createElement('div')
                    control.className = 'tfield_view_div';
                    control.id = this.ViewControlID;
                }

                break;
            }
        case 'Lookup':
            {
                if (!column.IsMultiple) {
                    var thisObj = this;
                    control = TIFCell_CreateLink.call(this, {
                        id: this.ViewControlID,
                        onclick: function () {
                            TIFCell_LookupLinkClick.call(thisObj, this);
                        }
                    });
                }
                else {
                    //создаем контейнер для ссылок
                    control = window.document.createElement('div');
                    control.className = 'tfield_view_div';
                    control.id = this.ViewControlID;

                    var linkContainer = window.document.createElement('div');
                    control.appendChild(linkContainer);
                }
                break;
            }
        default:
            {
                alert('Неизвестный тип колонки: ' + column.Type);
                break
            }
    }

    return control;
}

function TIFCell_CreateLink(params) {
    var link = window.document.createElement('a');
    link.className = 'tif_link';
    link.href = 'javascript:void(0);';

    if (params) {
        for (var paramName in params) {
            if (!params.hasOwnProperty(paramName))
                continue;

            var paramValue = params[paramName];
            link[paramName] = paramValue;
        }
    }

    return link;
}

function TIFCell_UpdateViewControlValue(value, dispControl) {
    var column = this.ParentColumn();
    //если контрола нет еще в разметке, то он передается параметром
    //если параметр пустой, то уже можно получить из разметки.
    if (!dispControl)
        dispControl = this.DispControl(true);

    switch (column.Type) {
        case 'DateTime':
        case 'MultiText':
        case 'Integer':
        case 'Number':
        case 'Choice':
        case 'Boolean':
        case 'Text':
            {
                TIFCell_UpdateViewControlSingleValue.call(this, value, column, dispControl);
                break;
            }
        case 'Lookup':
            {
                if (!column.IsMultiple)
                    TIFCell_UpdateViewControlSingleValue.call(this, value, column, dispControl);
                else
                    TIFCell_UpdateViewControlMultipleValue.call(this, value, column, dispControl);

                break;
            }
        default:
            {
                alert('Неизвестный тип колонки: ' + column.Type);
                break
            }
    }
}

function TIFCell_UpdateViewControlSingleValue(value, column, dispControl) {
    if (column == null)
        throw new Error('column is null');

    if (dispControl == null)
        throw new Error('dispControl is null');

    if (value == null)
        value = '';

    var isHtml = false;
    if (column.Type == 'MultiText' && !SM.IsNE(value)) {
        var regEx = /\r\n/g;
        value = value.replace(regEx, '<br />');
        isHtml = true;
    }

    if (column.Type == 'Choice') {
        var field = this.ParentField();
        if (column.Name == field.SolutionColumnName) {
            if (value == field.DefaultVariantSolutionName)
                value = '';
        }
    }
    else if (column.Type == 'Lookup') {
        if (column.IsMultiple)
            throw new Error('Ожидается единичная подстановка.');

        var lookupID = 0;
        if (this.LookupValue && this.LookupValue.Values && this.LookupValue.Values.length > 0) {
            var lookupValue = this.LookupValue.Values[0];
            value = lookupValue.LookupText;
            lookupID = lookupValue.LookupID;
        }

        dispControl.LookupID = lookupID;
    }
    else if (column.Type == 'Boolean') {
        var displayValue = TN.TranslateKey('tif.bool.no');
        if (typeof (value) == 'boolean' && value)
            displayValue = TN.TranslateKey('tif.bool.yes');

        value = displayValue;
    }

    if (SM.IsNE(value))
        value = ' ';

    if (isHtml)
        $(dispControl).html(value);
    else
        $(dispControl).text(value);
}

function TIFCell_UpdateViewControlMultipleValue(value, column, dispControl) {
    if (column == null)
        throw new Error('column is null');

    if (dispControl == null)
        throw new Error('dispControl is null');

    if (value == null)
        value = null;

    if (dispControl.children && dispControl.children.length > 0) {
        //удаляем контейнер ссылок и пересоздаем новый 
        dispControl.removeChild(dispControl.children[0]);
    }

    if (!column.IsMultiple)
        throw new Error('Ожидается множественная подстановка.');

    //в контейнер ссылок добавляем ссылки
    var linkContainer = window.document.createElement('div');
    if (this.LookupValue && this.LookupValue.Values && this.LookupValue.Values.length > 0) {
        var thisObj = this;
        var i, len = this.LookupValue.Values.length;
        for (var i = 0; i < len; i++) {
            var singleValue = this.LookupValue.Values[i];
            var lookupLink = TIFCell_CreateLink.call(this, {
                LookupID: singleValue.LookupID,
                onclick: function () {
                    TIFCell_LookupLinkClick.call(thisObj, this);
                }
            });
            $(lookupLink).text(singleValue.LookupText);
            linkContainer.appendChild(lookupLink);
        }
    }

    dispControl.appendChild(linkContainer);
}

function TIFCell_LookupLinkClick(link) {
    if (link == null)
        throw new Error('link is null');

    var lookupID = link.LookupID;
    if (lookupID < 1)
        return;

    var column = this.ParentColumn();
    if (!SM.IsNE(column.LookupControlName)) {
        var lookupSettings = window.GetLookupSettings(column.LookupControlName)
        if (lookupSettings != null) {
            var webUrl = '';
            if (lookupSettings.LookupWebUrl != '/')
                webUrl = lookupSettings.LookupWebUrl;

            var showParams = '&showDispFormWithoutEditAccess=true&closeOnCancel=true&closeOnUpdate=true';
            var itemUrl = lookupSettings.LookupListEditFormUrl + '?ID=' + lookupID + showParams;
            window.open(itemUrl);

        }
    }
}

function TIFCell_GetStringValue() {
    return TIFCell_GetValue.call(this);
}

function TIFCell_GetValue(objValue) {
    var column = this.ParentColumn();

    var editControl = document.getElementById(this.EditControlID);

    var value = null;
    switch (column.Type) {
        case 'DateTime':
            {
                if (this.IsEditMode) {
                    var dtControl = null;
                    if (window.TIFDTControls != null)
                        dtControl = window.TIFDTControls[this.EditControlID];
                    if (dtControl != null)
                        value = dtControl.GetValue();
                }
                else
                    value = this.Value;

                break;
            }
        case 'Text':
        case 'Integer':
        case 'Number':
            {
                if (this.IsEditMode) {
                    var textControl = null;
                    if (window.TextControls)
                        textControl = window.TextControls[this.EditControlID];
                    if (textControl)
                        value = textControl.GetValue();
                }
                else
                    value = this.Value;
                break;
            }
        case 'Choice':
        case 'Boolean':
            {
                if (this.IsEditMode) {
                    var listControl = null;
                    if (window.TIFListControls != null)
                        listControl = window.TIFListControls[this.EditControlID];

                    if (listControl != null && listControl.Value != null) {
                        if (objValue)
                            value = listControl.Value.Value;
                        else
                            value = listControl.Value.Text;
                    }
                    else {
                        if (column.Type == 'Boolean') {
                            if (objValue)
                                value = false;
                            else
                                value = TN.TranslateKey('tif.bool.no');
                        }
                        else {
                            value = null;
                        }
                    }
                }
                else
                    value = this.Value;
                break;
            }
        case 'MultiText':
            {
                if (this.IsEditMode) {
                    if (editControl != null)
                        value = editControl.value;
                }
                else
                    value = this.Value;

                break;
            }
        case 'Lookup':
            {
                if (this.IsEditMode) {
                    var lookupContainer = window.document.getElementById(this.LookupControlID);
                    if (lookupContainer != null && lookupContainer.Control != null) {
                        if (column.IsMultiple)
                            value = lookupContainer.Control.MultiValue;
                        else
                            value = lookupContainer.Control.SingleValue;
                    }
                }
                else {
                    if (this.LookupValue && this.LookupValue.Values && this.LookupValue.Values.length > 0) {
                        if (column.IsMultiple)
                            value = this.LookupValue.Values;
                        else
                            value = value = this.LookupValue.Values[0];
                    }
                }

                break;
            }
        default:
            {
                throw new Error('Неизвестный тип столбца. Тип: "' + column.Type + '"');
            }
    }

    return value;
}

function TIFCell_OnSolutionSelect() {
    var rowSolution = TIFCell_GetValue.call(this);
    if (SM.IsNE(rowSolution))
        return;

    this.ClientSolution = rowSolution;
}

function TIFCell_HasEditAccess(column) {
    if (column == null)
        throw new Error('column is null');

    var hasEditAccess = column.Access == 'Edit';
    if (this.RowRoleOverrideCellAccess)
        hasEditAccess = this.Access == 'Edit';

    return hasEditAccess;
}

function TIFCell_InitEditControl(tableCell) {
    if (this.EditControlInited)
        return;

    this.EditControlInited = false;

    if (tableCell == null)
        throw Error('tableCell is null');

    var row = this.ParentRow(),
    field = this.ParentField(),
    column = this.ParentColumn();

    if (!TIFCell_HasEditAccess.call(this, column))
        return;

    this.EditControlID = this.CellID + '_editcontrol';

    var editContainer = window.document.createElement('div')
    editContainer.className = 'tif_view_div';
    editContainer.id = this.EditControlID;

    if (column.Disabled) {
        if (!this.ViewControlInited)
            $(tableCell).text(' ');
        return;
    }
    var thisObj = this;

    var cellArgs = {
        EditControl: null
    };

    var editControlContainer = document.createElement('div');
    editControlContainer.className = 'tcell_edit_container'
    this.EditControlContainerID = this.CellID + '_editcontrol_container';
    editControlContainer.id = this.EditControlContainerID;

    switch (column.Type) {
        case 'Choice':
            {
                var controlWidth = 150;
                if (column.Width != null)
                    controlWidth = column.Width;

                var listControl = new ListControl();
                listControl.IsMultiple = false;
                listControl.IsDropDownList = true;
                listControl.WrapGrid = false;
                listControl.DefaultText = this.DisplayName;
                listControl.Init();
                listControl.SetControlWidth(controlWidth);

                //если поле с решением, то запрещаем удалять значения
                var isSolutionColumn = this.ColumnName == field.SolutionColumnName;
                if (isSolutionColumn)
                    listControl.RemovableValue = false;

                listControl.OnSetGridValue = function (gridValue) {
                    if (isSolutionColumn)
                        TIFCell_OnSolutionSelect.call(thisObj, field);

                    cellArgs.EditControl = listControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                }

                listControl.OnDeleteValue = function (gridValue) {
                    if (isSolutionColumn)
                        TIFCell_OnSolutionSelect.call(thisObj, field);

                    cellArgs.EditControl = listControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                }

                if (column.Variants != null) {
                    var i, len = column.Variants.length;
                    for (i = 0; i < len; i++) {
                        var variant = column.Variants[i];
                        listControl.AddGridRow(variant.Text, variant.Value);
                    }
                }

                if (!window.SM.IsNE(this.Value))
                    listControl.SetValue({
                        Value: this.Value,
                        Text: this.Value
                    });

                editControlContainer.appendChild(listControl.Container);

                if (window.TIFListControls == null)
                    window.TIFListControls = [];

                window.TIFListControls[this.EditControlID] = listControl;
                break;
            }
        case 'MultiText':
            {
                var multiTextControl = window.document.createElement('textarea');
                multiTextControl.style.width = (column.Width - 4) + 'px';
                multiTextControl.id = this.EditControlID;
                multiTextControl.className = 'tif_multiTextControl';
                if (!SM.IsNE(this.Value))
                    $(multiTextControl).val(this.Value);

                editControlContainer.appendChild(multiTextControl);

                multiTextControl.onchange = function () {
                    cellArgs.EditControl = multiTextControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                };

                break;
            }
        case 'Text':
        case 'Integer':
        case 'Number':
            {
                var numberOfDecimals = column.NumberOfDecimal;
                if (!numberOfDecimals)
                    numberOfDecimals = 0;

                var textOptions = {
                    Type: column.Type,
                    AllowNegativeValues: true,
                    NumberOfDecimals: numberOfDecimals,
                    //***Общие параметры
                    ControlWidth: column.Width
                };

                var textControl = new TextControl(textOptions);
                if (this.Value)
                    textControl.SetValue(this.Value);

                if (window.TextControls == null)
                    window.TextControls = [];

                window.TextControls[this.EditControlID] = textControl;
                editControlContainer.appendChild(textControl.Container);

                if (textControl.TextInput) {
                    textControl.TextInput.onchange = function () {
                        cellArgs.EditControl = textControl;
                        TIFCell_OnChange.call(thisObj, cellArgs);
                    };
                }
                break;
            }
        case 'Lookup':
            {
                var lookupControl = new DBLookupControl(column.LookupControlName + this.EditControlID, column.LookupControlName);
                this.LookupControlID = this.EditControlID + '_lookup_control'
                lookupControl.Container.id = this.LookupControlID;

                if (this.LookupValue && this.LookupValue.Values && this.LookupValue.Values.length > 0) {
                    if (column.IsMultiple)
                        lookupControl.SetValue(this.LookupValue.Values);
                    else
                        lookupControl.SetValue(this.LookupValue.Values[0]);
                }

                lookupControl.AddChangeHandler(function () {
                    cellArgs.EditControl = lookupControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                });

                editControlContainer.appendChild(lookupControl.Container);
                break;
            }
        case 'DateTime':
            {
                var dateControl = new DatePickerControl({
                    DoubleDate: false,
                    ShowTime: column.ShowTime
                });

                if (!SM.IsNE(this.Value))
                    dateControl.SetValue(this.Value);

                editControlContainer.appendChild(dateControl.Container);

                if (window.TIFDTControls == null)
                    window.TIFDTControls = [];

                dateControl.AddChangeHandler(function () {
                    cellArgs.EditControl = dateControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                });

                window.TIFDTControls[this.EditControlID] = dateControl;
                break;
            }
        case 'Boolean':
            {
                var controlWidth = 150;
                if (column.Width != null)
                    controlWidth = column.Width;

                var listControl = new ListControl();
                listControl.RemovableValue = false;
                listControl.IsMultiple = false;
                listControl.IsDropDownList = true;
                listControl.WrapGrid = false;
                listControl.DefaultText = this.DisplayName;
                listControl.Init();
                listControl.SetControlWidth(controlWidth);

                listControl.OnSetGridValue = function (gridValue) {
                    if (thisObj.ColumnName == field.SolutionColumnName)
                        TIFCell_OnSolutionSelect.call(thisObj, field);

                    cellArgs.EditControl = listControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                }

                listControl.OnDeleteValue = function (gridValue) {
                    if (thisObj.ColumnName == field.SolutionColumnName)
                        TIFCell_OnSolutionSelect.call(thisObj, field);

                    cellArgs.EditControl = listControl;
                    TIFCell_OnChange.call(thisObj, cellArgs);
                }

                var noValue = { Text: TN.TranslateKey('tif.bool.no'), Value: false };
                var yesValue = { Text: TN.TranslateKey('tif.bool.yes'), Value: true };
                listControl.AddGridRow(noValue.Text, noValue.Value);
                listControl.AddGridRow(yesValue.Text, yesValue.Value);

                var currentValue = noValue;
                if (this.Value != null && typeof (this.Value) == 'boolean') {
                    if (this.Value)
                        currentValue = yesValue;
                }

                listControl.SetValue({
                    Value: currentValue.Value,
                    Text: currentValue.Text
                });

                editControlContainer.appendChild(listControl.Container);

                if (window.TIFListControls == null)
                    window.TIFListControls = [];

                window.TIFListControls[this.EditControlID] = listControl;
                break;
            }
        default:
            {
                alert('Неизвестный тип колонки: ' + column.Type);
                break
            }
    }
    tableCell.appendChild(editControlContainer);
    this.EditControlInited = true;
}

function TIFCell_SaveCell() {
    if (!this.IsEditMode)
        return;

    var field = GetTIField(this.FieldName),
    column = field.GetColumn(this.ColumnName),
    editControl = window.document.getElementById(this.EditControlID);

    switch (column.Type) {
        case 'MultiText':
            {
                this.Value = editControl.value;
                break;
            }
        case 'Text':
        case 'Integer':
        case 'Number':
            {
                this.Value = TIFCell_GetValue.call(this);
                break;
            }
        case 'Lookup':
            {
                this.LookupValue = { Values: [] };

                var lookupContainer = window.document.getElementById(this.LookupControlID);
                if (lookupContainer != null && lookupContainer.Control != null) {
                    if (column.IsMultiple) {
                        if (lookupContainer.Control.MultiValue && lookupContainer.Control.MultiValue.length > 0) {
                            var i, len = lookupContainer.Control.MultiValue.length;
                            for (i = 0; i < len; i++) {
                                var singleValue = lookupContainer.Control.MultiValue[i];
                                this.LookupValue.Values.push({
                                    LookupID: singleValue.LookupID,
                                    LookupText: singleValue.LookupText
                                });
                            }
                        }
                    }
                    else {
                        if (lookupContainer.Control.SingleValue != null && lookupContainer.Control.SingleValue.LookupID > 0) {
                            this.LookupValue.Values.push({
                                LookupID: lookupContainer.Control.SingleValue.LookupID,
                                LookupText: lookupContainer.Control.SingleValue.LookupText
                            });
                        }
                    }
                }

                break;
            }
        case 'Choice':
        case 'Boolean':
            //присваиваем типизированное значение.
            this.Value = this.GetValue();
            break;
        case 'DateTime':
            {
                this.Value = TIFCell_GetValue.call(this);
                break;
            }
        default:
            break;
    }
}

function TIFCell_IsEmptyCell() {
    var result = true;
    var field = GetTIField(this.FieldName);
    var column = field.GetColumn(this.ColumnName, true);
    var cellValue = TIFCell_GetValue.call(this);

    switch (column.Type) {
        case 'MultiText':
        case 'Text':
        case 'Integer':
        case 'Number':
        case 'Choice':
        case 'DateTime':
            {
                //result = SM.IsNE(cellValue);
                if (!SM.IsNE(cellValue))
                    result = !/[^\s]+/g.test(cellValue);    //   Проверка наличия только пробелов
                break;
            }
        case 'Lookup':
            {
                if (column.IsMultiple)
                    result = cellValue == null || cellValue.length < 1;
                else
                    result = cellValue == null || cellValue.LookupID == 0;
                break;
            }
        case 'Boolean':
            {
                //булевский столбец никогда не может содержать пустое значение.
                result = false;
            }
        default:
            break;
    }

    return result;
}

function TIFCell_TableCell() {
    if (SM.IsNE(this.CellID))
        throw new Error('Для ячейки не задан идентификатор');

    var tableCell = window.document.getElementById(this.CellID);
    if (tableCell == null)
        throw new Error('Не удалось найти ячейку с идентификатором ' + this.CellID + '. Возможна она еще не была добавлена в разметку.');

    return tableCell;
}

/************************ TABS *******************/
/************************************************/
/************************************************/
function TabManager_Init() {
    if (this.TabsByID == null)
        this.TabsByID = [];

    this.CurrentTab = TabManager_CurrentTab;
    this.HasTabs = TabManager_HasTabs;
    this.Field = TabManager_GetField;

    if (this.Tabs != null) {
        var i, len = this.Tabs.length;
        for (i = 0; i < len; i++) {
            var tab = this.Tabs[i];
            if (SM.IsNE(tab.ID) || SM.IsNE(tab.Title))
                continue;

            tab.TableFieldName = this.TableFieldName;
            tab.ContainsColumn = Tab_ContainsColumn;
            tab.Field = TabManager_GetField;
            tab.Page = Tab_Page;

            this.TabsByID[tab.ID] = tab;
        }

        //генерация интерфейса вкладок.
        TabManager_InitTableControl.call(this);

        this.SelectTab = TabManager_SelectTab;
        this.ShowColumn = TabManager_ShowColumn;
        this.HideColumn = TabManager_HideColumn;
    }
}

function TabManager_InitTableControl() {
    var container = window.document.getElementById(this.ContainerID);
    if (container == null)
        return;

    var field = this.Field();
    var uniqueIdentityPrefix = field.TableID;

    var tabsTableControl = document.createElement('table');
    tabsTableControl.className = 'tif_tabs_table';
    var tabsRow = document.createElement('tr');
    tabsRow.className = 'tif_tabs_row';
    tabsTableControl.appendChild(tabsRow);
    var tabsCell = document.createElement('td');
    tabsCell.className = 'tif_tabs_cell';
    tabsRow.appendChild(tabsCell);

    var tabControlPanelCell = document.createElement('td');
    tabControlPanelCell.className = 'tif_tabs_cell tif_tabs_cell_control_panel';
    tabsRow.appendChild(tabControlPanelCell);

    var tabsList = document.createElement('ul');
    tabsList.className = 'tif_tabs_list';
    tabsCell.appendChild(tabsList);

    var i, len = this.Tabs.length;
    for (i = 0; i < len; i++) {
        var tab = this.Tabs[i];

        var tabPage = document.createElement('li');
        if (i == 0)
            tabPage.className = 'current';
        else
            tabPage.className = 'default';

        var tabPageID = uniqueIdentityPrefix + '_' + tab.ID + '_page';
        tabPage.id = tabPageID;
        tab.PageID = tabPageID;
        tabsList.appendChild(tabPage);

        var tabLink = document.createElement('a');
        tabLink.innerHTML = tab.Title;
        tabLink.className = 'tif_tabs_link';
        tabLink.href = 'javascript:void(0);';
        tabLink.TabID = tab.ID;
        tabLink.TableFieldName = this.TableFieldName;
        tabLink.onclick = Tab_LinkClick;

        var tabLinkID = uniqueIdentityPrefix + '_' + tab.ID + '_link';
        tabLink.id = tabLinkID;
        tab.LinkID = tabLinkID;
        tabPage.appendChild(tabLink);

        //контрольная панель вкладки еще не сгенерирована
        tab.ControlPanelID = null;
        tab.ControlPanel = function () {
            var controlPanel = null;

            if (SM.IsNE(this.ControlPanelID)) {
                controlPanel = document.createElement('div');
                this.ControlPanelID = this.ID + '_control_panel';
                controlPanel.id = this.ControlPanelID;

                tabControlPanelCell.appendChild(controlPanel);
            }
            else
                controlPanel = document.getElementById(this.ControlPanelID);

            if (controlPanel == null)
                throw new Error('Не удалось создать/получить панель управления для вкладки с идентификатором ' + this.ID);

            return controlPanel;
        };
    }


    container.appendChild(tabsTableControl);
}

function TabManager_GetTab(tabID) {
    if (SM.IsNE(tabID))
        throw new Error('tabID is null');

    var tab = null;
    if (this.TabsByID != null)
        tab = this.TabsByID[tabID];

    return tab;
}

function TabManager_HasTabs() {
    var hasTabs = this.Tabs != null && this.Tabs.length > 0;
    return hasTabs;
}

function TabManager_SelectTab(tab) {
    if (tab == null)
        throw new Error('tab is null');

    if (this.Tabs == null)
        return;

    var field = null;
    if (!SM.IsNE(this.TableFieldName))
        field = GetTIField(this.TableFieldName);

    if (field == null)
        throw new Error('Не удалось найти поле табличной части с именем ' + this.TableFieldName);

    field.CurrentTab = tab;
    //если у столбца есть TableIndex, то значит он присутствует в таблице и это его индекс в коллекции столбцов таблицы.
    if (field.Columns != null) {
        var i, len = field.Columns.length;
        for (i = 0; i < len; i++) {
            var column = field.Columns[i];
            //столбец не присутствует в таблице
            if (column.TableIndex == null || column.TableIndex < 0)
                continue;

            //определяем принадлежность к выделенной вкладке
            var contains = tab.ContainsColumn(column.Name);
            if (contains)
                this.ShowColumn(column);
            else
                this.HideColumn(column);
        }
    }

    this.FireEvent('CurrentTabChanged', { Tab: tab }, true);
}

function TabManager_CurrentTab() {
    var field = null;
    if (!SM.IsNE(this.TableFieldName))
        field = GetTIField(this.TableFieldName);

    if (field == null)
        throw new Error('Не удалось найти поле табличной части с именем ' + this.TableFieldName);

    var tab = field.CurrentTab;
    //если Select еще не был вызван, то берем первую вкладку
    if (tab == null) {
        if (this.HasTabs())
            tab = this.Tabs[0];
    }

    return tab;
}

function TabManager_ShowColumn(column) {
    if (column == null)
        throw new Error('column is null');

    var field = this.Field();
    var columnIndex = (column.TableIndex + 1);
    if (column.Hidden == null || column.Hidden) {
        var rowsSelector = '#' + field.TableID + ' .t_row';
        $(rowsSelector + ' td:nth-child(' + columnIndex + ')').show();
        column.Hidden = false;
    }
}

function TabManager_HideColumn(column) {
    if (column == null)
        throw new Error('column is null');

    var field = this.Field();
    var columnIndex = (column.TableIndex + 1);
    if (!column.Hidden) {
        var rowsSelector = '#' + field.TableID + ' .t_row';
        $(rowsSelector + ' td:nth-child(' + columnIndex + ')').hide();
        column.Hidden = true;
    }
}

function TabManager_GetField() {
    var field = GetTIField(this.TableFieldName);
    if (field == null)
        throw new Error('Не удалось найти поле табличной части с именем ' + this.TableFieldName);

    return field;
}

function Tab_Page() {
    var page = null;
    if (!SM.IsNE(this.PageID))
        page = document.getElementById(this.PageID);

    if (page == null)
        throw new Error('Не удалось найти интерфейсный элемент вкладки "' + this.Title + '"');

    return page;
}

function Tab_LinkClick() {
    var tabID = this.TabID;
    if (SM.IsNE(tabID) || SM.IsNE(this.TableFieldName))
        return;

    var field = GetTIField(this.TableFieldName);
    if (field == null)
        return;

    var currentTab = TabManager_GetTab.call(field.TabManager, this.TabID);
    if (currentTab == null)
        return;

    currentTab.Page().className = 'current';
    //устанавливаем current/default для каждой ссылки
    var i, len = field.TabManager.Tabs.length;
    for (i = 0; i < len; i++) {
        var tab = field.TabManager.Tabs[i];

        if (tab !== currentTab)
            tab.Page().className = 'default';
    }

    field.TabManager.SelectTab(currentTab);
}

function Tab_ContainsColumn(columnName) {
    if (SM.IsNE(columnName))
        throw new Error('columnName is null');

    var contains = false;
    if (!SM.IsNE(this.Columns)) {
        var columnNameToSearch = '|' + columnName + '|'
        contains = this.Columns.indexOf(columnNameToSearch) > -1;
    }

    return contains;
}

/************************ INTERFACE *******************/
/************************ INTERFACE *******************/
/************************ INTERFACE *******************/
function GetTIField(fieldName) {
    if (window.TIFields != null)
        return window.TIFields[fieldName];
}

function TIField_OnInit() {
}

function TIField_Disable() {
}

function TIField_Enable() {
}

function TIField_GetValue() {
}

function TIField_SetValue() {
}

function TIField_ShowInformer() {
}

function TIField_IsChanged() {
    return this.IsChange;
}

function TIField_IsEmptyValue() {
    if (this.Columns == null || this.Columns.length == 0 ||
            this.Rows == null || this.Rows.length == 0)
        return true;

    var i, len = this.Rows.length;
    var allRowsDeleted = true;
    for (i = 0; i < len; i++) {
        var row = this.Rows[i];
        if (!row.Deleted && row.IsFilled()) {
            allRowsDeleted = false;
            break;
        }
    }

    return allRowsDeleted;
}

function TIField_OnSave(saveArgs) {
    TIF_SaveAllRows.call(this, saveArgs);
}