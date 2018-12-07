OMK_CustomerDepartment_Consts = {
    Customers: "Заказчик",
    CustomersDepartment: "Подразделение-заказчик",
    CustomersResponsibilityZone: "Зона ответственности",
    Url: "/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/CustomerDepartmentControl/CustomerDepartmentHandler.ashx"
}

function OMK_GetCustomerDepartment() {

    // Поле "Заказчик"
    var customerField = OMK_GetField(OMK_CustomerDepartment_Consts.Customers);

    // Поле "Подразделение-заказчик"
    var departmentField = OMK_GetField(OMK_CustomerDepartment_Consts.CustomersDepartment);
    if (departmentField == null) return;

    // Поле "Зона ответственности"
    var responsibilityField = OMK_GetField(OMK_CustomerDepartment_Consts.CustomersResponsibilityZone);
    if (responsibilityField == null) return;

    // Проверка - если заказчиков нет, то поля обнуляются
    var check = customerField.GetValue();
    if (check.length === 0) {
        responsibilityField.SetValue(null);
        departmentField.SetValue(null);
        return;
    }

    // TODO [CR, Куклин Илья]: у тебя уже есть значение поля customerField в переменной check, второй раз получать не надо
    // в строке 'var customersList = new Array()' нет смысла, т.к. ты тут же меняешь значение переменной.

    // Берем значения из поля "Заказчик"
    var customersList = new Array();
    var customersList = customerField.GetValue();

    // Записываем значения LookupID каждого из заказчиков
    var customersIDs = new Array();
        for (var i = 0; i < customersList.length; i++)
        customersIDs.push(customersList[i].LookupID);

    // TODO [CR, Куклин Илья]: сделать проверку, что в customerIDs есть элементы. Если там ничего нет, то будет ошибка при обращении к элементу массива по индексу [0].

    // Ajax-запрос на получение должности первого указанного Заказчика
    url = OMK_CustomerDepartment_Consts.Url + "?rnd=" + Math.random() + "&" + "customer=" + JSON.stringify(customersIDs[0]);

    $.ajax({
        url: url,
        async: false,
        success: function (response) {
            if (response.Exception)
                throw new Error(response.Exception.DisplayText);
            else {
                departmentField.SetValue(response.CustomerDepartment);
                responsibilityField.SetValue(response.CustomerResponsibilityZone);
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