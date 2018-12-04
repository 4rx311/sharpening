//Клиентский обработчик инициализации
function OMK_CFN_Init() {
    this.ControlledField = ListForm.GetField(this.ControlledFieldName, true);    
    var controlling = ListForm.GetField(this.ControllingFieldName, true);    
    OMK_CFN_ProcessChange.call(this, controlling);
}

//Обработка изменений значения управляющего поля
function OMK_CFN_ProcessChange(field) {
    var value = field.GetValue();
    var name;
    if (value != null && !SM.IsNE(value.LookupText)) {
        for (var i = 0; i < this.ValueNameDictionary.length; i++) {
            if (this.ValueNameDictionary[i].Key == value.LookupText)
                name = this.ValueNameDictionary[i].Value;
        }
    }
    //Если нам ничего не подошло или если поле очистили - устанавливаем отображаемое название по умолчанию
    if (!name) {
        name = this.ControlledField.DisplayName;
    }
    OMK_CFN_SetFieldName(this.ControlledField, name);
}

//Меняет название поля через DOM
function OMK_CFN_SetFieldName(field, name) {
    if (!field)
        throw new Error("Не передано поле");
    if (SM.IsNE(name))
        throw new Error("Не передано новое название");
/*DOM-структура поля:
<div>           <-- parentDiv
    Кол-во листов   <-- parentDiv.childNodes[0]
    <span>          <-- parentDiv.childNodes[1]
        Приложений      <-- parentDiv.childNodes[1].childNodes[0]    
        <span>*</span>  <-- parentDiv.childNodes[1].childNodes[1], опциональный, его не трогаем
    </span> 
</div>*/
    var parentDiv = field.Container.firstChild.firstChild
    var lastSpace = name.lastIndexOf(' ');
    var lastWord = name.substr(lastSpace + 1);
    var rest = name.substring(0, lastSpace + 1);
    parentDiv.childNodes[0].textContent = rest;
    parentDiv.childNodes[1].childNodes[0].textContent = lastWord;
}