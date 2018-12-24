var OMK_SetValueMaskField_Consts =
{
    FieldCondition: null,
    FieldNameMask: "Маска номера",
}

//обработчик на инициализацию
function OMK_SetValueMaskField_Init() {
    if (this != null) {
        OMK_SetValueMaskField_Consts.FieldCondition = this;
    }
}
//обработчик на изменение поля
function OMK_SetValueMaskField_FieldChangeHandler() {

    var settings = OMK_SetValueMaskField_Consts;
    if (settings.FieldCondition == null) return;
    var valueCollection = new Object();
    //соберм значения в словарь
    for (var i = 0; i < settings.FieldCondition.length; i++) {
        var fieldName = settings.FieldCondition[i];
        var field = ListForm.GetField(fieldName);
        if (field) {
            var value = OMK_SetValueMaskField_GetFieldValue(field);
            valueCollection[fieldName] = value;
        }
    }
    OMK_SetValueMaskField_SendAjax(valueCollection);
}

//получение значения поля
function OMK_SetValueMaskField_GetFieldValue(field) {
    if (field == null)
        return;
    var value = field.GetValue();
    //значение для ед. подстановки
    if (field.Type == "DBFieldLookupSingle") {
        if (value && value.LookupID)
            return value.LookupID;
        else
            return null;
    }
    //список подстановочных id через , для мн. подстановки
    if (field.Type == "DBFieldLookupMulti") {
        if (value && value.length > 0) {
            var arr = [];
            for (var i = 0; i < value.length; i++) {
                arr.push(value[i].LookupID);
            }
            return arr.join(',');
        }
        else
            return null;
    }
    return value;
}

//отправка значений на сервер
function OMK_SetValueMaskField_SendAjax(data) {
    var jsonText = JSON.stringify(data);
    var ajax = SM.GetXmlRequest();
    var params = "data=" + encodeURIComponent(jsonText);
    params = params.concat("&ListID=" + ListForm.ListID);
    params = params.concat("&ItemID=" + ListForm.ItemID);
    var field = ListForm.GetField('Название списка');
    if (field)
        params = params.concat("&sourceList=" + field.GetValue());
    params = encodeURI(params);
    ajax = SM.GetXmlRequest();
    var flag = !window.OMK_SetValueMaskField_SyncMode;
    ajax.open("POST", "/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/Controls/SetValueMaskField/SetValueMaskField.ashx?rnd=" + Math.random(), flag);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.setRequestHeader("Content-length", params.length);
    ajax.onreadystatechange = OMK_SetValueMaskField_GetAjax;
    ajax.send(params);
}

//установка значений на клиенте из ответа сервера
function OMK_SetValueMaskField_GetAjax() {

    if (this.readyState == 4 && this.status == 200) {
        var response = this.responseText;
        var obj = JSON.parse(response);
        if (obj.Exception) {
            alert(obj.Exception.DisplayText);
            return;
        }

        if (obj.IsSuccessfulMask) { 
            var fieldMask = ListForm.GetField(OMK_SetValueMaskField_Consts.FieldNameMask);
            if (fieldMask == null)
                alert("не удалось найти поле с маской");
            fieldMask = fieldMask.TypedField;
            if (fieldMask == null)
                alert("поле с маской должно быть доступно для редактирования");

            fieldMask.SetValue(obj.Mask);
        }
        else {
            alert("Не удалось получить маску для рег номера");
        }
    } 
}
