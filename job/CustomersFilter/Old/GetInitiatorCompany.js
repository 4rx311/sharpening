function RSH_ItemForSelector_Init() {
    var lookupSettings = window.GetLookupSettings("OpenNotifiersSelectUser");
    if (!lookupSettings) {
        alert("Не найдена системная константа 'OpenNotifiersSelectUser'");
        return;
    }

    SM.AttachEvent(lookupSettings, 'OnSearchRequest', RSH_ItemForSelector_OnSearchRequest);
}

function RSH_ItemForSelector_OnSearchRequest(lookupSettings, eventArgs) {
    eventArgs.QueryBuilder.SetParam('itemId', ListForm.ItemID);
    eventArgs.QueryBuilder.SetParam('listId', ListForm.ListID);
    eventArgs.QueryBuilder.SetParam('currentUserID', ListForm.CurrentUserID);
}











////Константы
//var OMK_Consts = {
//    InitiatorCompany: "Компания",
//    UserIDParam: "userId"
//};

////Вызывается при инициации 
////Передаёт параметр userId в аргументы при выводе всплывающего окна подстановки "Руководитель инициатора"
//function TRC_InitiatorChief_Init() {

//    var userId = ListForm.CurrentUserID;

//    var chiefField = OMK_InitiatorCompany_GetField(OMK_Consts.InitiatorCompany).TypedField;
//    var settingsName = chiefField.SettingsName;
//    if (!settingsName || settingsName === "")
//        throw new Error("Не найдено имя настройки поля подстановки " + TRC_IC_Consts.InitiatorChief);
//    var lookupSetting = window.GetLookupSettings(settingsName);

//    SM.AttachEvent(lookupSetting, "OnSearchRequest",
//        function (c, userId) {
//            return function (lookupSettings, eventArgs) {
//                return TRC_InitiatorChief_OnSearchRequest.call(c, lookupSetting, eventArgs, userId);
//            };
//        }(this, userId))
//}

////Вызывается при выводе всплывающего окна подстановки "Руководитель инициатора"
//function TRC_InitiatorChief_OnSearchRequest(lookupSettings, eventArgs, userId) {
//    eventArgs.QueryBuilder.SetParam(TRC_IC_Consts.UserIDParam, userId);
//}

////Возвращает поле
//function OMK_InitiatorCompany_GetField(fieldName) {
//    if (fieldName === null)
//        throw new Error("Отсутствует входной параметр 'fieldName'.");

//    var field = ListForm.GetField(fieldName);
//    if (field === null)
//        throw new Error("Поле '" + fieldName + "' не найдено.");

//    return field;
}