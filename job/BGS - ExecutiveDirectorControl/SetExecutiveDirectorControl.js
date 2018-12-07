BGS_Consts = {
    Recipients: "Адресаты",
    ExecutiveDirector: "Исполнительный директор"
}

function BGS_SetExecutiveDirectorControl() {

    // Поле "Адресаты"
    var recipientsField = BGS_GetField(BGS_Consts.Recipients);
    if (recipientsField == null) return;

    // Поле "Исполнительный директор"
    var directorField = BGS_GetField(BGS_Consts.ExecutiveDirector);
    if (directorField == null) return;


    // Проверка - если адресатов нет, то значение поля "Исполнительный директор" = false
    var recipientsCheck = recipientsField.GetValue();
    if (recipientsCheck.length === 0) {
        directorField.SetValue(false);
        return;
    }

    // Берем значения поля "Адресаты"
    var recipientsList = new Array();
    var recipientsList = recipientsField.GetValue();

    // Записываем значения LookupID каждого из адресатов
    var recipientsIDs = new Array();                    
    if (recipientsList != null)
        if (recipientsList.length > 0)
            for (var i = 0; i < recipientsList.length; i++)
                recipientsIDs.push(recipientsList[i].LookupID);

    // Ajax-запрос на получение должности Адресата
    var url = "/_layouts/WSS/WSSC.V4.DMS.BGS/Controls/ExecutiveDirectorControl/ExecutiveDirectorHandler.ashx";
    url = url + "?rnd=" + Math.random() + "&" + "recipients=" + JSON.stringify(recipientsIDs);

    $.ajax({
        url: url,
        success: function (response) {
            if (response.Exception)
                throw new Error(result.exception.DisplayText);
            else if (response.Value === "true")
                directorField.SetValue(true);
            else
                directorField.SetValue(false);
        }
    });
}

//функция безопасного получения значения поля
function BGS_GetField(fieldName) {
    //получение значения поля
    var field = ListForm.GetField(fieldName);
    //вывод сообщения о нахождении пустого поля
    if (field === null) {
        alert("Поле {0} не найдено.".Format(fieldName));
    }
    return field;
}