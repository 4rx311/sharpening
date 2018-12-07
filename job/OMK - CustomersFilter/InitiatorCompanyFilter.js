var OMK_CustomersFilter_Consts = {
    fieldInitiator: "Инициатор",
    fieldCustomer: "Заказчик"
};

/// фильтрация компаний пользователя
function OMK_InitiatorCompanyFilter_Init() {

    // Поле "Инициатор"
    var initiatorField = ListForm.GetField(OMK_CustomersFilter_Consts.fieldInitiator);
    if (initiatorField == null) return;

    // Значение поля "Инициатор"
    var initiatorValue = initiatorField.GetValue();
    var initiatorID = initiatorValue.LookupID;

    // установка поля по изменению которого будет происходить отправка на сервер
    var lookupSetting = window.GetLookupSettings(OMK_CustomersFilter_Consts.fieldCustomer);
    if (!lookupSetting)
        return;

    SM.AttachEvent(lookupSetting, "OnSearchRequest", function (setting, eventArgs) {
        eventArgs.QueryBuilder.SetParam('initiatorID', initiatorID, true);
    });
}