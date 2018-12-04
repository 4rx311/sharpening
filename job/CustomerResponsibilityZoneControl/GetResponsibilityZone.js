OMK_ResponsibilityZone_Consts = {
    Customer: "Заказчик",
    CustomersDepartment: "Зона ответственности"
}

function OMK_GetResponsibilityZone() {

    // Поле "Заказчик"
    var customerField = OMK_GetField(OMK_ResponsibilityZone_Consts.Customer);
    if (customerField == null) return;

    // Поле "Зона ответственности"
    var responsibilityField = OMK_GetField(OMK_ResponsibilityZone_Consts.CustomersDepartment);
    if (responsibilityField == null) return;


    // Проверка - если заказчиков нет, то значение поля "Зона ответственности" - пустое
    var check = customerField.GetValue();
    if (check.length === 0) {
        responsibilityField.SetValue("");
        return;
    }

    // Берем значения поля "Заказчик"
    var customersList = new Array();
    var customersList = customerField.GetValue();

    // Записываем значения LookupID каждого из заказчиков
    var customersIDs = new Array();
    if (customersList != null)
        if (customersList.length > 0)
            for (var i = 0; i < customersList.length; i++)
                customersIDs.push(customersList[i].LookupID);

    // Ajax-запрос на получение должности нулевого Заказчика
    var url = "/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/CustomerResponsibilityZoneControl/ResponsibilityZoneHandler.ashx";
    url = url + "?rnd=" + Math.random() + "&" + "customer=" + JSON.stringify(customersIDs[0]);

    $.ajax({
        url: url,
        success: function (response) {
            if (response.Exception)
                throw new Error(result.exception.DisplayText);
            else
                responsibilityField.SetValue(response.Value);
        }
    });
}

//функция безопасного получения значения поля
function OMK_GetField(fieldName) {
    //получение значения поля
    var field = ListForm.GetField(fieldName);
    //вывод сообщения о нахождении пустого поля
    if (field === null) {
        alert("Поле {0} не найдено.".Format(fieldName));
    }
    return field;
}