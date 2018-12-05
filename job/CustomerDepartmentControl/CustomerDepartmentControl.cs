using WSSC.V4.SYS.DBFramework;

//todo названия полей в константы

namespace WSSC.V4.DMS.OMK.Controls.CustomerDepartment
{
    /// <summary>
    /// Контрол отслеживает, занимает ли указанный в поле "адресат" должность "исполнительный директор" 
    /// </summary>
    class CustomerDepartmentControl : DBListFormWebControl
    {
        protected CustomerDepartmentControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            : base(metadata, listForm) { }

        /// <summary>
        /// Фабрика, создающая экземпляр контрола
        /// </summary>
        protected class Factory : DBListFormWebControlFactory
        {
            /// <summary>
            /// Создает экземпляр контрола на форме элемента списка 
            /// </summary>
            /// <param name="metadata">Метаданные контрола</param>
            /// <param name="listForm">Форма элемента списка</param>
            protected override DBListFormWebControl CreateListFormWebControl(DBListFormWebControlMetadata metadata, DBListFormControl listform)
            {
                return new CustomerDepartmentControl(metadata, listform);
            }
        }

        /// <summary>
        /// Добавление обработчиков на поля
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            // todo получить этап на сервере, если этап != Подготовка, то не регистрировать ресурсы.
            var stage = this.Item.GetStringValue("Этап");
            if (stage == "Подготовка")
            {
                // todo задать путь через VersionProvider.ModulePath.
                this.AppContext.ScriptManager.RegisterResource("GetCustomerDepartment.js", "/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/CustomerDepartmentControl");
                this.AddFieldChangeHandler("Заказчик", "OMK_GetCustomerDepartment");
            }
        }
    }
}




