var Nomenclature_RegisterSolution_Name = "Зарегистрировать;Подписано сторонами, зарегистрировать;Подписано в компании, зарегистрировать;Подписать (последний подписант);Подписать c ЭЦП (последний подписант);Отправить на согласование (РМ)";
var Nomenclature_BusinessField_Name = "Направлен в дело";
var Nomenclature_ListCount_FieldName = "Кол-во листов";
var Nomenclature_AdditionalListCount_FieldName = "Кол-во листов приложений";
var Nomenclature_TomeField = "Том";
var Nomenclature_RegisterStageField = "Регистрация";

function Nomenclature_InitScript(useSCCAdapter, registrationSolution) {

    if (registrationSolution != "" && registrationSolution != null)
        Nomenclature_RegisterSolution_Name = registrationSolution;
    //Установка обработчика на решение
    if (useSCCAdapter) {
        window.SSCHandlers.Add(NomenclatureSCCHandler);
    }

    var businessField = ListForm.GetField(Nomenclature_BusinessField_Name);
    if (businessField != null)
        if (businessField.ReadOnly)
            return;
    //Установка обработчика на изменение полей
    Nomenclature_AddBusinessTomeInfoChangeHanlder(Nomenclature_BusinessField_Name);
    Nomenclature_AddBusinessTomeInfoChangeHanlder(Nomenclature_AdditionalListCount_FieldName);
    Nomenclature_AddBusinessTomeInfoChangeHanlder(Nomenclature_ListCount_FieldName);

    //Создание контейнера тома дела
    businessField.TomeDiv = Nomenclature_CreateTomeDiv(businessField);
    //Установка метода обновления контейнера тома дела.
    businessField.SetTomeDivValue = Nomenclature_SetTomeDivValue;
    //Задаем начальное значение тому.
    var tomeValue = ListForm.GetField(Nomenclature_TomeField).GetValue();
    var stageLookupText = ListForm.GetField('Этап').GetValue().LookupText;
    if (stageLookupText == null)
        stageLookupText = ListForm.GetField('Этап').GetValue().getAttribute('LookupText');
    if (tomeValue == "" && stageLookupText == Nomenclature_RegisterStageField)
        Nomenclature_BusinessField_ChangeHandler();
    else
        businessField.SetTomeDivValue(tomeValue);



}

//Установка обрабочтика просчета номера тома дела на указанное поле
function Nomenclature_AddBusinessTomeInfoChangeHanlder(feildName) {
    var field = ListForm.GetField(feildName);
    if (field == null) {
        return;
    }
    field.AddChangeHandler(Nomenclature_BusinessField_ChangeHandler);
}

//Создание дива тома около поля "Направлен в дело"
function Nomenclature_CreateTomeDiv(field) {
    var div = document.createElement("div");
    div.className = "TomeDiv";
    var container = field.Container.children[1].children[0].children[0];
    container.appendChild(div);
    container.children[0].style.display = "block";
    container.children[0].style.styleFloat = "left";
    container.children[0].style.position = "relative";
    return div;
}

//Установка дива тома около поля "Направлен в дело"
function Nomenclature_SetTomeDivValue(value) {
    if (value == null || value == "") {
        this.TomeDiv.innerHTML = "";
    }
    else {
        this.TomeDiv.innerHTML = "Том " + value;
    }
}

//Обрабочтик просчета номера тома дела
function Nomenclature_BusinessField_ChangeHandler() {
    var businessField = ListForm.GetField(Nomenclature_BusinessField_Name);
    var businessFieldValue = businessField.GetValue();
    var businessID = 0;
    var businessListID = 0;
    if (businessFieldValue != null) {
        if (businessFieldValue.LookupID != null) {
            businessID = businessFieldValue.LookupID;
            businessListID = businessFieldValue.Settings.LookupListID;
        }
    }
    //Если дело не выбрано
    if (businessID == 0) {
        businessField.SetTomeDivValue(null);
    }
    else {
        $.ajax({
            url: "/_layouts/WSS/WSSC.V4.DMS.Nomenclature/NomenclatureTome/CurrentTomePage.aspx?rnd=" + Math.random(),
            data: encodeURI("itemID=" + ListForm.ItemID + "&listID=" + ListForm.ListID + "&nomenklaturaID=" + businessID + "&lists=" + Nomenclature_GetBusinessListsCount() + '&nomenListID=' + businessListID),
            success: function (data) {
                if (data.charAt(0) == "!")
                    alert(data.substring(1));
                else
                    businessField.SetTomeDivValue(data);
            }
        });
    }
}
//Получение числа листов документа для добавления в дело
function Nomenclature_GetBusinessListsCount() {
    var listsCount = Nomenclature_GetIntValueFromField(Nomenclature_ListCount_FieldName);
    var additionalListsCount = Nomenclature_GetIntValueFromField(Nomenclature_AdditionalListCount_FieldName);

    if (isNaN(listsCount))
        listsCount = 0;

    if (isNaN(additionalListsCount))
        additionalListsCount = 0;

    return listsCount + additionalListsCount;
}
//Получение целочисленного значения из поля
function Nomenclature_GetIntValueFromField(fieldName) {
    var field = ListForm.GetField(fieldName);
    if (field != null) {
        var value = field.GetValue();
        if (value != null && value != "")
            return parseInt(value);
    }
    return 0;
}
function Nomenclature_SolutionIsCorrect(solution) {
    var solutionArray = Nomenclature_RegisterSolution_Name.split(';');
    for (i = 0; i < solutionArray.length; i++) {
        if (solutionArray[i] == solution) {
            return true;
        }
    }
    return false;
}

//Обработчик принятия решения
function NomenclatureSCCHandler(solution) {
    if (Nomenclature_SolutionIsCorrect(solution)) {
        var businessField = ListForm.GetField(Nomenclature_BusinessField_Name);
        var businessFieldValue = businessField.GetValue();
        var businessID = 0;
        var businessListID = 0;
        if (businessFieldValue != null) {
            if (businessFieldValue.LookupID != null) {
                businessID = businessFieldValue.LookupID;
                businessListID = businessFieldValue.Settings.LookupListID;
            }
        }
        var result = $.ajax({
            url: "/_layouts/WSS/WSSC.V4.DMS.Nomenclature/NomenclatureTome/AddListsToCurrentTomePage.aspx?rnd=" + Math.random(),
            data: encodeURI("itemID=" + ListForm.ItemID + "&listID=" + ListForm.ListID + "&webID=" + ListForm.WebID + "&lists=" + Nomenclature_GetBusinessListsCount() + "&nomenklaturaID=" + businessID + '&nomenListID=' + businessListID),
            async: false
        }).responseText;
        var resObject = $.parseJSON(result);
        if (resObject.status != "Error")
            ListForm.GetField(Nomenclature_TomeField).SetValue(resObject.tome);
        return resObject;
    }
}