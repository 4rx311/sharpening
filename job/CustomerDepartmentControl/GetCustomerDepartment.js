OMK_CustomerDepartment_Consts = {
    Customer: "Заказчик",
    CustomersDepartment: "Подразделение-заказчик",
    CustomersResponsibilityZone: "Зона ответственности"
}

function OMK_GetCustomerDepartment() {

    // Поле "Подразделение-заказчик"
    var departmentField = OMK_GetField(OMK_CustomerDepartment_Consts.CustomersDepartment);
    if (departmentField == null) return;

    // Поле "Зона ответственности"
    var responsibilityField = OMK_GetField(OMK_ResponsibilityZone_Consts.CustomersResponsibilityZone);
    if (responsibilityField == null) return;

    // Проверка - если заказчиков нет, то значение поля "Исполнительный директор" = false
    var check = customerField.GetValue();
    if (check.length === 0) {
        departmentField.SetValue(null);
        return;
    }

    // Берем значения из поля "Заказчик"
    var customersList = new Array();
    var customersList = customerField.GetValue();

    // Записываем значения LookupID каждого из заказчиков
    var customersIDs = new Array();
        for (var i = 0; i < customersList.length; i++)
            customersIDs.push(customersList[i].LookupID);

    // Ajax-запрос на получение должности первого указанного Заказчика
    var url = "/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/CustomerDepartmentControl/CustomerDepartmentHandler.ashx";
    url = url + "?rnd=" + Math.random() + "&" + "customer=" + JSON.stringify(customersIDs[0]);

    $.ajax({
        url: url,
        async: false,
        success: function (response) {
            if (response.Exception)
                throw new Error(result.exception.DisplayText);
            else {
                departmentField.SetValue(response.Value);
                responsibilityField.SetValue(response.Value);
            }
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