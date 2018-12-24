var OMK_NRDConsts = {
    Fields: {
        TIFieldName: "Назначение НРД в Перечень к МОД",
        TICellFunc1: "Функция 1-го уровня",
        TICellFunc2: "Функция 2-го уровня",
        TICellFunc3: "Функция 3-го уровня",
        TICellFunc4: "Функция 4-го уровня",
        TICellAction: "Список действий",
        TICellCompany: "БЕ",
        TICellDepartment: "Подразделение",
        TICellUsersCategory: "Категория сотрудников",
        TICellAllValues: "(все значения)",
        TICellPurpose: "Вид назначения"
    },


    Urls: {
        NRDPurposePopup: "/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/Controls/NRDPurposePopup/NRDPurposePopup.aspx",
        NRDFuncsPurposePopup: "/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/Controls/NRDPurposePopup/NRDFunctionsPurposePopup.aspx"
    },

    BackgroundImages: {
        Plus: "url(/_layouts/WSS/WSSC.V4.SYS.UI.Controls/TreeControl/Images/plus.png);",
        Minus: "url(/_layouts/WSS/WSSC.V4.SYS.UI.Controls/TreeControl/Images/minus.png);"
    },

    Purpose: {
        Test: "Тест",
        Course: "Курс",
        Empty: ""
    },
    LookupAllItemsId: "-1",
    OnInit: true
}

var OMK_NRDGlobal = {
    purposeTextControl: "",
    TIFOldCreateRowFunc: "",
    CompanyFilteredItemsCount: 0,
    DepartmentFilteredItemsCount: 0,
    CategoryFilteredItemsCount: 0,
    AllValuesIds: {
        Func1Id: "-1",
        Func2Id: "-1",
        Func3Id: "-1",
        Func4Id: "-1",
        ActionId: "-1",
        CompanyId: "-1",
        DepartmentId: "-1",
        CategoryId: "-1",
    }
}

function OMK_NRDExpandCollapseItem(element) {
    var childNodes = element.parentElement.childNodes;

    if (element.getAttribute("collapsed") == "true") {
        element.style.backgroundImage = OMK_NRDConsts.BackgroundImages.Minus;
        element.setAttribute("collapsed", "false");
    }
    else {
        element.style.backgroundImage = OMK_NRDConsts.BackgroundImages.Plus;
        element.setAttribute("collapsed", "true");
    }

    for (var i = 0; i < childNodes.length; i++) {
        if (childNodes[i] instanceof HTMLUListElement) {
            if (childNodes[i].style.display === "none") {
                childNodes[i].style.display = "";
            }
            else {
                childNodes[i].style.display = "none";
            }
            noOneElement = false;
        }
    }
}

// Установка автоматической высоты окна
function OMK_NRDSetAuthoHeight() {
    var main = document.getElementById("main-div");
    var parentDiv = $(main).closest(".pp_content");
    if (parentDiv.length === 0) throw new Error("Не найден родительский div с классом pp_content для #main-div");
    parentDiv = parentDiv[0];
    parentDiv.style.height = "auto";
}

/**
* Возвращает DOM-элемент по ID.
* @param {String} id ID элемента.
*/
function OMK_NRDGetElementById(id) {
    var element = document.getElementById(id);
    if (element == null)
        throw new Error("Не найден элемент с id '" + id + "'");
    return element;
}

// функция установки значения в LookupControl
function OMK_NRDSetValueInDBLookupCell(row, cell, value) {
    // на эцп3 не работает
    //var column = row.ParentControl().GetColumn(cell.ColumnName);
    //эцп3
    var column = row.ParentField().GetColumn(cell.ColumnName);
    var lookupSettings = window.GetLookupSettings(column.LookupControlName);

    //если передали массив, считаем что подстановка множественная
    if (value instanceof Array) {
        var valuesArray = [];
        for (var i = 0; i < value.length; i++) {
            valuesArray.push({ LookupID: value[i], LookupText: lookupSettings.GetLookupText(value[i]) });
        }
        cell.SetValue(valuesArray);
    }
    // иначе еденичная
    else {
        cell.SetValue({ LookupID: value, LookupText: lookupSettings.GetLookupText(value) });
    }
}

//инициализация контрола
function OMK_NRDPurposePopup_Init() {

    //получим поле табличные элементы
    var TIFField = ListForm.GetField(OMK_NRDConsts.Fields.TIFieldName);
    if (TIFField == null) {
        return;
    }
    var typedField = TIFField.TypedField;

    if (typedField.Rows.length === 0) {
        OMK_NRDConsts.OnInit = false;
    }
    //поменяем название ссылки
    //РД2
    var elements;
    elements = TIFField.Container.getElementsByClassName("def_ti_link def_ti_createLink");
    // ЭЦП3
    if (elements.length === 0) {
        elements = TIFField.Container.getElementsByClassName("tif_link tif_createLink");
    }
    var createLink = elements[0];
    if (createLink != null) {
        if (createLink.innerText != null) {
            createLink.innerText = "Создать";
        }

        // переопределим функцию создания строки
        OMK_NRDGlobal.TIFOldCreateRowFunc = typedField.CreateRow;
        typedField.CreateRow = OMK_NRDPurposePopup_OnClick;
    }
}

// при нажатии на ссылку
function OMK_NRDPurposePopup_OnClick() {

    if (OMK_NRDConsts.OnInit === false) {
        OMK_NRDConsts.OnInit = true;
        return;
    }
    window.OpenPopupWindow(OMK_NRDConsts.Urls.NRDPurposePopup +
        "?rnd=" + Math.random() +
        "&listId=" + window.ListForm.ListID +
        "&itemId=" + window.ListForm.ItemID, 300,
        "auto !important", "10px 16px 10px 16px", 0, false, true);
    // для отладки сразу второго окна
    //window.OpenPopupWindow(OMK_NRDConsts.Urls.NRDFuncsPurposePopup +
    //    "?rnd=" + Math.random() +
    //    "&listId=" + window.ListForm.ListID +
    //    "&itemId=" + window.ListForm.ItemID, 300,
    //    "auto !important", "10px 16px 10px 16px", 0, false, true);

}

//отмечаем все функции 1-ого уровня
function OMK_NRD_OnSelectAllClick() {
    var elementsFunc1Collection = document.getElementsByClassName("Func1");
    var elementsFunc1 = Array.prototype.slice.call(elementsFunc1Collection);
    var checkbox = OMK_NRDGetElementById("CheckAllFunc1Checkbox");
    for (var i = 0; i < elementsFunc1.length; i++) {
        elementsFunc1[i].checked = checkbox.checked;
        elementsFunc1[i].onchange();
    }
}
// второе всплывающее окно
var OMK_NRDFunctionsPurposePopupManager = new (function () {

    var CompanyField;
    var DepartmentField;
    var UsersCategoryField;
    var PurposeField;

    // при его открытии
    this.OnOpenPopup = function (args) {
        if (args == null) throw new Error("args = null");

        var TIFTypedField = ListForm.GetField(OMK_NRDConsts.Fields.TIFieldName).TypedField;

        InitializeCompanyLookupControl();
        InitializeDepartmentLookupControl();
        InitializeUsersCategoryLookupControl();
        InitializePurposeTextControl();

        // тут передаём html с разметкой чекбоксов
        InitializeCheckBoxes(args.CheckBoxesContent);

        function InitializeCompanyLookupControl() {
            var companyColumn = TIFTypedField.GetColumn(OMK_NRDConsts.Fields.TICellCompany);
            var lookupSettings = window.GetLookupSettings(companyColumn.LookupControlName);

            //var lookupList = lookupSettings.LookupList();
            var container = OMK_NRDGetElementById("company-div");
            CompanyField = new window.DBLookupControl("company", lookupSettings.SettingsName);
            CompanyField.Settings.ParentPopupLevel = 1;
            container.appendChild(CompanyField.Container);
        }
        function InitializeDepartmentLookupControl() {
            var departmentColumn = TIFTypedField.GetColumn(OMK_NRDConsts.Fields.TICellDepartment);
            var lookupSettings = window.GetLookupSettings(departmentColumn.LookupControlName);
            var container = OMK_NRDGetElementById("department-div");
            DepartmentField = new window.DBLookupControl("department", lookupSettings.SettingsName);
            DepartmentField.Settings.ParentPopupLevel = 1;
            container.appendChild(DepartmentField.Container);
        }
        function InitializeUsersCategoryLookupControl() {
            var usersCategoryColumn = TIFTypedField.GetColumn(OMK_NRDConsts.Fields.TICellUsersCategory);
            var lookupSettings = window.GetLookupSettings(usersCategoryColumn.LookupControlName);
            var container = OMK_NRDGetElementById("usersCategory-div");
            UsersCategoryField = new window.DBLookupControl("usersCategory", lookupSettings.SettingsName);
            UsersCategoryField.Settings.ParentPopupLevel = 1;
            container.appendChild(UsersCategoryField.Container);
        }

        // текстовое поле инициализируем значением, заполненым на первой форме
        function InitializePurposeTextControl() {
            var container = OMK_NRDGetElementById("purpose-div");
            PurposeField = new window.TextControl();
            PurposeField.SetControlWidth(90);
            PurposeField.Disable();
            if (OMK_NRDGlobal.purposeTextControl instanceof TextControl) {
                PurposeField.SetValue(OMK_NRDGlobal.purposeTextControl.GetValue());
            }
            container.appendChild(PurposeField.Container);
        }

        OMK_NRDSetAuthoHeight();
    }

    function InitializeCheckBoxes(checkBoxesContent) {
        var treeContainer = OMK_NRDGetElementById("treeCheckboxes-div");
        treeContainer.innerHTML = checkBoxesContent;

        // для каждого чекбокса определяем событие onchange
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type.toLowerCase() == 'checkbox') {
                if (inputs[i].onchange == undefined) {
                    inputs[i].onchange = OnChangeCheckbox;
                }
            }
        }
    }

    // событие нажатия на чекбокс
    // если отмечен, то отмечаем всю иерархию вверх
    // и всю вниз
    function OnChangeCheckbox() {
        if (this.checked === true) {
            CheckParentCheckbox(this);

        }

        var childCheckboxes = $("#" + this.parentElement.id + " :input");
        for (var i = 0; i < childCheckboxes.length; i++) {
            if ("checkbox" == childCheckboxes[i].getAttribute("type")) {
                childCheckboxes[i].checked = this.checked;
            }
        }
    }

    function CheckParentCheckbox(checkbox) {
        var parentCheckbox = GetParentCheckbox(checkbox);
        if (parentCheckbox != null) {
            parentCheckbox.checked = true;
            CheckParentCheckbox(parentCheckbox);
        }
    }

    //получаем родительский чекбокс, если он существует
    function GetParentCheckbox(child) {
        var childNodes = child.parentElement.parentElement.parentElement.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i] instanceof HTMLInputElement) {
                if ("checkbox" == childNodes[i].getAttribute("type") && childNodes[i].getAttribute("class") != "CheckAllFunc1Checkbox") {
                    return childNodes[i];
                }
            }
        }
        return null;
    }

    /** Вызывается при нажатии на "Ок" */
    this.OnOkClick = function () {

        var TIFField = ListForm.GetField(OMK_NRDConsts.Fields.TIFieldName);
        var typedField = TIFField.TypedField;

        typedField.CreateRow = OMK_NRDGlobal.TIFOldCreateRowFunc;

        // вычисляем массив id
        var checkedIDsStruct = GetCheckedCheckboxStruct();

        // для каждого элемента массива создаём строку в табличном элементе
        for (var i = 0; i < checkedIDsStruct.length; i++) {

            var row = typedField.CreateRow();
            SetTIRowValues(row, checkedIDsStruct[i]);
        }

        typedField.CreateRow = OMK_NRDPurposePopup_OnClick;
        window.HidePopupWindow();

        function SetTIRowValues(row, elements) {

            // получаем LookupID из ID чекбокса и устанавливаем его в поле
            var cellFunc1 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc1);
            OMK_NRDSetValueInDBLookupCell(row, cellFunc1, elements[0]);

            var cellFunc2 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc2);
            OMK_NRDSetValueInDBLookupCell(row, cellFunc2, elements[1]);

            var cellFunc3 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc3);
            OMK_NRDSetValueInDBLookupCell(row, cellFunc3, elements[2]);

            var cellAction = row.GetCell(OMK_NRDConsts.Fields.TICellAction);
            OMK_NRDSetValueInDBLookupCell(row, cellAction, elements[3]);

            var cellFunc4 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc4);
            OMK_NRDSetValueInDBLookupCell(row, cellFunc4, elements[4]);

            // в остальные поля проставляем что выбрано во всплывающем окне
            SetAllValues(row, OMK_NRDConsts.Fields.TICellCompany, CompanyField, OMK_NRDGlobal.CompanyFilteredItemsCount, OMK_NRDGlobal.AllValuesIds.CompanyId);
            SetAllValues(row, OMK_NRDConsts.Fields.TICellDepartment, DepartmentField, OMK_NRDGlobal.DepartmentFilteredItemsCount, OMK_NRDGlobal.AllValuesIds.DepartmentId);
            SetAllValues(row, OMK_NRDConsts.Fields.TICellUsersCategory, UsersCategoryField, OMK_NRDGlobal.CategoryFilteredItemsCount, OMK_NRDGlobal.AllValuesIds.CategoryId);

            var cellPurpose = row.GetCell(OMK_NRDConsts.Fields.TICellPurpose);
            cellPurpose.SetValue(OMK_NRDGlobal.purposeTextControl.GetValue());
        }

        function SetAllValues(row, cellName, field, filteredItemsCount, allValuesId) {
            var cell = row.GetCell(cellName);
            var value = field.GetValue();
            var extendexAllValues = FindIndexByProp(value, function (x) { return x.LookupID === -1 });
            // если выбраны все значения, то проставляем одно значение "(все значения)"
            if (extendexAllValues !== -1 || value.length === filteredItemsCount) {
                OMK_NRDSetValueInDBLookupCell(row, cell, [allValuesId]);
            }

            else {
                cell.SetValue(field.GetValue());
            }
        }

        function FindIndexByProp(arr, func) {
            for (var i = 0; i < arr.length; i++) {
                if (func.call(this, arr[i])) {
                    return i;
                }
            }
            return -1;
        };

        function GetCheckedCheckboxStruct() {
            var allIDsToSet = [];
            var all1Func = $("#treeCheckboxes-div :checkbox");
            var allCheckded1Func = $("#treeCheckboxes-div :checkbox:checked");
            // если отмечны все потомки корневого div, то запишем (все значения)
            if (allCheckded1Func.length === all1Func.length) {
                allIDsToSet.push(
                    [OMK_NRDGlobal.AllValuesIds.Func1Id,
                    OMK_NRDGlobal.AllValuesIds.Func2Id,
                    OMK_NRDGlobal.AllValuesIds.Func3Id,
                    OMK_NRDGlobal.AllValuesIds.ActionId,
                    OMK_NRDGlobal.AllValuesIds.Func4Id]
                );
            }
            else {
                //иначе возьмем всех прямых потомков этого div
                var level1Funcs = $("#treeCheckboxes-div .Func1:checkbox:checked");
                for (var index1Level = 0; index1Level < level1Funcs.length; index1Level++) {
                    var all2Func = $("#" + level1Funcs[index1Level].parentElement.id + " :checkbox");
                    var allCheckded2Func = $("#" + level1Funcs[index1Level].parentElement.id + " :checkbox:checked");

                    var level2FuncClass = "Func2" + level1Funcs[index1Level].id;
                    var level2FuncSelector = "#" + level1Funcs[index1Level].parentElement.id + " ." + level2FuncClass + ":checkbox";
                    var level2Funcs = $(level2FuncSelector + ":checked");

                    // если у текущего потомка нет потомков и он отмечен, то добавляем строку в массив
                    if (level2Funcs.length === 0 && (allCheckded2Func.length === all2Func.length)) {
                        allIDsToSet.push(
                            [level1Funcs[index1Level].id,
                                null,
                                null,
                                null,
                                null]
                        );
                    }
                    else {
                        // если отмечены все потомки, то пишем (все значения)
                        if (allCheckded2Func.length === all2Func.length) {

                            allIDsToSet.push(
                                [level1Funcs[index1Level].id,
                                OMK_NRDGlobal.AllValuesIds.Func2Id,
                                OMK_NRDGlobal.AllValuesIds.Func3Id,
                                OMK_NRDGlobal.AllValuesIds.ActionId,
                                OMK_NRDGlobal.AllValuesIds.Func4Id]
                            );
                        }
                        else {
                            //иначе берём всех прямых потомков и то же самое
                            for (var index2Level = 0; index2Level < level2Funcs.length; index2Level++) {
                                var all3Func = $("#" + level2Funcs[index2Level].parentElement.id + " :checkbox");
                                var allCheckded3Func = $("#" + level2Funcs[index2Level].parentElement.id + " :checkbox:checked");

                                var lastIndex = level2Funcs[index2Level].id.lastIndexOf("-");
                                var level2FuncId = level2Funcs[index2Level].id.substring(lastIndex + 1);

                                var level3FuncClass = "Func3" + level2Funcs[index2Level].id;
                                var level3FuncSelector = "#" + level2Funcs[index2Level].parentElement.id + " ." + level3FuncClass + ":checkbox";
                                var level3Funcs = $(level3FuncSelector + ":checked");

                                if (level3Funcs.length === 0 && (allCheckded3Func.length === all3Func.length)) {
                                    allIDsToSet.push(
                                        [level1Funcs[index1Level].id,
                                            level2FuncId,
                                            null,
                                            null,
                                            null]
                                    );
                                }
                                else {
                                    if (allCheckded3Func.length === all3Func.length) {
                                        allIDsToSet.push(
                                            [level1Funcs[index1Level].id,
                                                level2FuncId,
                                            OMK_NRDGlobal.AllValuesIds.Func3Id,
                                            OMK_NRDGlobal.AllValuesIds.ActionId,
                                            OMK_NRDGlobal.AllValuesIds.Func4Id]
                                        );
                                    }
                                    else {
                                        for (var index3Level = 0; index3Level < level3Funcs.length; index3Level++) {
                                            var allActions = $("#" + level3Funcs[index3Level].parentElement.id + " :checkbox");
                                            var allCheckdedActions = $("#" + level3Funcs[index3Level].parentElement.id + " :checkbox:checked");

                                            var lastIndex = level3Funcs[index3Level].id.lastIndexOf("-");
                                            var level3FuncId = level3Funcs[index3Level].id.substring(lastIndex + 1);

                                            var levelActionClass = "Action" + level3Funcs[index3Level].id;
                                            var levelActionSelector = "#" + level3Funcs[index3Level].parentElement.id + " ." + levelActionClass + ":checkbox";
                                            var levelActions = $(levelActionSelector + ":checked");

                                            if (levelActions.length === 0 && (allCheckdedActions.length === allActions.length)) {
                                                allIDsToSet.push(
                                                    [level1Funcs[index1Level].id,
                                                        level2FuncId,
                                                        level3FuncId,
                                                        null,
                                                        null]
                                                );
                                            }
                                            else {
                                                if (allCheckdedActions.length === allActions.length) {
                                                    allIDsToSet.push(
                                                        [level1Funcs[index1Level].id,
                                                            level2FuncId,
                                                            level3FuncId,
                                                        OMK_NRDGlobal.AllValuesIds.ActionId,
                                                        OMK_NRDGlobal.AllValuesIds.Func4Id]
                                                    );
                                                }
                                                else {
                                                    for (var index4Level = 0; index4Level < levelActions.length; index4Level++) {
                                                        var all4Func = $("#" + levelActions[index4Level].parentElement.id + " :checkbox");
                                                        var allCheckded4Func = $("#" + levelActions[index4Level].parentElement.id + " :checkbox:checked");

                                                        var lastIndex = levelActions[index4Level].id.lastIndexOf("-");
                                                        var levelActionsId = levelActions[index4Level].id.substring(lastIndex + 1);

                                                        var level4FuncClass = "Func4" + levelActions[index4Level].id;
                                                        var level4FuncSelector = "#" + levelActions[index4Level].parentElement.id + " ." + level4FuncClass + ":checkbox";
                                                        var level4Funcs = $(level4FuncSelector + ":checked");

                                                        if (level4Funcs.length === 0 && (allCheckded4Func.length === all4Func.length)) {
                                                            allIDsToSet.push(
                                                                [level1Funcs[index1Level].id,
                                                                    level2FuncId,
                                                                    level3FuncId,
                                                                    levelActionsId,
                                                                    null]
                                                            );
                                                        }
                                                        else {
                                                            if (allCheckded4Func.length === all4Func.length) {
                                                                allIDsToSet.push(
                                                                    [level1Funcs[index1Level].id,
                                                                        level2FuncId,
                                                                        level3FuncId,
                                                                        levelActionsId,
                                                                    OMK_NRDGlobal.AllValuesIds.Func4Id]
                                                                );
                                                            }
                                                            else {

                                                                for (var index5Level = 0; index5Level < level4Funcs.length; index5Level++) {
                                                                    var lastIndex = level4Funcs[index5Level].id.lastIndexOf("-");
                                                                    var level4FuncId = level4Funcs[index5Level].id.substring(lastIndex + 1);

                                                                    allIDsToSet.push(
                                                                        [level1Funcs[index1Level].id,
                                                                            level2FuncId,
                                                                            level3FuncId,
                                                                            levelActionsId,
                                                                            level4FuncId]
                                                                    );
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return allIDsToSet;
        }

    }

    /** Вызывается при закрытии всплывающего окна */
    this.OnClosePopup = function () {
        window.HidePopupWindow();
    }


});

// первое всплывающее окно
var OMK_NRDPurposePopupManager = new (function () {

    var DropDownFields = [];

    // при открытии
    this.OnOpenPopup = function (args) {

        // заберём из аргументов id для значений "(все значения)"
        OMK_NRDGlobal.AllValuesIds.Func1Id = args.AllValuesFunc1Id;
        OMK_NRDGlobal.AllValuesIds.Func2Id = args.AllValuesFunc2Id;
        OMK_NRDGlobal.AllValuesIds.Func3Id = args.AllValuesFunc3Id;
        OMK_NRDGlobal.AllValuesIds.Func4Id = args.AllValuesFunc4Id;
        OMK_NRDGlobal.AllValuesIds.ActionId = args.AllValuesActionsId;

        OMK_NRDGlobal.AllValuesIds.CompanyId = args.AllValuesCompanyId;
        OMK_NRDGlobal.AllValuesIds.DepartmentId = args.AllValuesDepartmentId;
        OMK_NRDGlobal.AllValuesIds.CategoryId = args.AllValuesUsersCategoryId;

        OMK_NRDGlobal.CompanyFilteredItemsCount = args.CompanyFilteredItemsCount;
        OMK_NRDGlobal.DepartmentFilteredItemsCount = args.DepartmentFilteredItemsCount;
        OMK_NRDGlobal.CategoryFilteredItemsCount = args.CategoryFilteredItemsCount;

        InitializeTextAndDropDownFields();
        InitializeTextControl()

        // инициализация выпадающих списков
        function InitializeTextAndDropDownFields() {
            for (var i = 0; i < 5; i++) {
                dropDownFieldID = i + 1 + "ControlQuestion-div";
                var container = OMK_NRDGetElementById(dropDownFieldID);
                DropDownFields[dropDownFieldID] = new window.ListControl();
                DropDownFields[dropDownFieldID].IsMultiple = false;
                DropDownFields[dropDownFieldID].IsDropDownList = true;
                DropDownFields[dropDownFieldID].WrapGrid = true;
                DropDownFields[dropDownFieldID].RemovableValue = false;
                DropDownFields[dropDownFieldID].Init();

                DropDownFields[dropDownFieldID].AddGridRow("Да", 1);
                DropDownFields[dropDownFieldID].AddGridRow("Нет", 0);


                if (dropDownFieldID !== "1ControlQuestion-div") {
                    DropDownFields[dropDownFieldID].Container.hidden = true;
                }
                container.appendChild(DropDownFields[dropDownFieldID].Container);

                DropDownFields[dropDownFieldID].dropDownFieldID = dropDownFieldID;
                DropDownFields[dropDownFieldID].SetControlWidth(90);
                DropDownFields[dropDownFieldID].OnSetGridValue = OnDropDownChange;

                // связываем тест с выпадающим списком
                var questionFieldID = i + 1 + "Question-div";
                var questionContainer = OMK_NRDGetElementById(questionFieldID);
                DropDownFields[dropDownFieldID].questionTextField = questionContainer;
                if (questionFieldID !== "1Question-div") {
                    DropDownFields[dropDownFieldID].questionTextField.hidden = true;
                }
            }
        }

        // инициализация текстового поля
        function InitializeTextControl() {
            var container = OMK_NRDGetElementById("purpose-div");

            OMK_NRDGlobal.purposeTextControl = new window.TextControl();
            OMK_NRDGlobal.purposeTextControl.Disable();
            OMK_NRDGlobal.purposeTextControl.SetControlWidth(90);
            container.appendChild(OMK_NRDGlobal.purposeTextControl.Container);
        }
        OMK_NRDSetAuthoHeight();
    }

    // скрытие и очистка значений у выпадающих списков и связанного с ними теста
    function HideAndClearFields(from) {
        for (var i = from; i <= 5; i++) {
            DropDownFields[i + "ControlQuestion-div"].Container.hidden = true;
            DropDownFields[i + "ControlQuestion-div"].questionTextField.hidden = true;
            DropDownFields[i + "ControlQuestion-div"].SetValue(null);
        }
    }

    // показываем выпадающий список и связанный текст
    function ShowField(i) {
        DropDownFields[i + "ControlQuestion-div"].Container.hidden = false;
        DropDownFields[i + "ControlQuestion-div"].questionTextField.hidden = false;
    }

    // логика при выборе элементов в выпадающих списках
    function OnDropDownChange(gridValue) {

        var value = gridValue.Value;

        switch (this.dropDownFieldID) {
            case "1ControlQuestion-div":
                if (value == true) {
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Test);
                    HideAndClearFields(2);
                }
                else {
                    ShowField(2);
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Empty);
                }
                break;
            case "2ControlQuestion-div":
                if (value == true) {
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Test);
                    HideAndClearFields(3);
                }
                else {
                    ShowField(3);
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Empty);
                }
                break;
            case "3ControlQuestion-div":
                if (value == true) {
                    ShowField(4);
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Empty);
                }
                else {
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Empty);
                    HideAndClearFields(4);
                }
                break;
            case "4ControlQuestion-div":
                if (value == true) {
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Empty);
                    HideAndClearFields(5);
                }
                else {
                    ShowField(5);
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Empty);
                }
                break;
            case "5ControlQuestion-div":
                if (value == true) {
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Test);
                }
                else {
                    OMK_NRDGlobal.purposeTextControl.SetValue(OMK_NRDConsts.Purpose.Course);
                }
                break;
        }
        OMK_NRDSetAuthoHeight();
    }

    /** Вызывается при нажатии на "Ок" */
    this.OnOkClick = function () {

        var TIFField = ListForm.GetField(OMK_NRDConsts.Fields.TIFieldName);
        var typedField = TIFField.TypedField;

        var createNewEmptyRow = false;
        // к пустому полю "Вид назначения" могут привести только 3(ответ нет) и 4(ответ да) вопросы
        if (OMK_NRDGlobal.purposeTextControl.GetValue() === OMK_NRDConsts.Purpose.Empty) {
            if (DropDownFields["3ControlQuestion-div"].Value !== null && DropDownFields["3ControlQuestion-div"].Value.Value == false) {
                createNewEmptyRow = true;
            }
            if (DropDownFields["4ControlQuestion-div"].Value !== null && DropDownFields["4ControlQuestion-div"].Value.Value == true) {
                createNewEmptyRow = true;
            }
        }

        //создаём пустую строку и обратно переопределяем функцию создания пустой строки
        if (createNewEmptyRow) {
            typedField.CreateRow = OMK_NRDGlobal.TIFOldCreateRowFunc;
            typedField.CreateRow();
            typedField.CreateRow = OMK_NRDPurposePopup_OnClick;
            window.HidePopupWindow();
        }

        // если в первом выпадающем списке выбран ответ "Да"
        if (DropDownFields["1ControlQuestion-div"].Value !== null) {
            if (DropDownFields["1ControlQuestion-div"].Value.Value == true) {
                typedField.CreateRow = OMK_NRDGlobal.TIFOldCreateRowFunc;

                var row = typedField.CreateRow();
                //заполняем все поля функций значением "(все значения)"
                var cellFunc1 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc1);
                OMK_NRDSetValueInDBLookupCell(row, cellFunc1, OMK_NRDGlobal.AllValuesIds.Func1Id);
                var cellFunc2 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc2);
                OMK_NRDSetValueInDBLookupCell(row, cellFunc2, OMK_NRDGlobal.AllValuesIds.Func2Id);
                var cellFunc3 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc3);
                OMK_NRDSetValueInDBLookupCell(row, cellFunc3, OMK_NRDGlobal.AllValuesIds.Func3Id);
                var cellFunc4 = row.GetCell(OMK_NRDConsts.Fields.TICellFunc4);
                OMK_NRDSetValueInDBLookupCell(row, cellFunc4, OMK_NRDGlobal.AllValuesIds.Func4Id);

                var cellAction = row.GetCell(OMK_NRDConsts.Fields.TICellAction);
                OMK_NRDSetValueInDBLookupCell(row, cellAction, OMK_NRDGlobal.AllValuesIds.ActionId);

                var cellCompany = row.GetCell(OMK_NRDConsts.Fields.TICellCompany);
                OMK_NRDSetValueInDBLookupCell(row, cellCompany, [OMK_NRDGlobal.AllValuesIds.CompanyId]);

                var cellDepartment = row.GetCell(OMK_NRDConsts.Fields.TICellDepartment);
                OMK_NRDSetValueInDBLookupCell(row, cellDepartment, [OMK_NRDGlobal.AllValuesIds.DepartmentId]);

                var cellCategory = row.GetCell(OMK_NRDConsts.Fields.TICellUsersCategory);
                OMK_NRDSetValueInDBLookupCell(row, cellCategory, [OMK_NRDGlobal.AllValuesIds.CategoryId]);

                var cellPurpose = row.GetCell(OMK_NRDConsts.Fields.TICellPurpose);
                cellPurpose.SetValue(OMK_NRDGlobal.purposeTextControl.GetValue());

                typedField.CreateRow = OMK_NRDPurposePopup_OnClick;
                window.HidePopupWindow();
                return;
            }

        }

        // если текстовое поле заполнилось в результате логики по выпадающим спискам
        // открываем новое окно
        if (OMK_NRDGlobal.purposeTextControl.GetValue() !== OMK_NRDConsts.Purpose.Empty) {
            window.OpenPopupWindow(OMK_NRDConsts.Urls.NRDFuncsPurposePopup +
                "?rnd=" + Math.random() +
                "&listId=" + window.ListForm.ListID +
                "&itemId=" + window.ListForm.ItemID, 300,
                "auto !important", "10px 16px 10px 16px", 0, false, true);
        }

        // простановка всех возможных значений поля DBLookupMulti
        function SetDBLookupAllValues(row, cell) {
            var column = row.ParentControl().GetColumn(cell.ColumnName);
            var lookupSettings = window.GetLookupSettings(column.LookupControlName);
            var LookupList = lookupSettings.LookupList();
            // получаем все элементы
            var items = LookupList.GetItems();
            var lookup = [];
            // по каждому из них формируем массив
            for (var i = 0; i < items.length; i++) {

                lookup.push({ LookupID: items[i].ID, LookupText: lookupSettings.GetLookupText(items[i].ID) });
            }
            cell.SetValue(lookup);
        }
    }

    /** Вызывается при закрытии всплывающего окна */
    this.OnClosePopup = function () {
        window.HidePopupWindow();
    }
});
