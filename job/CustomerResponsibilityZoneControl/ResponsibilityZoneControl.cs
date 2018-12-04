using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Controls.CustomerResponsibilityZoneControl
{
    /// <summary>
    /// Контрол отслеживает, занимает ли указанный в поле "адресат" должность "исполнительный директор" 
    /// </summary>
    class ResponsibilityZoneControl : DBListFormWebControl
    {
        protected ResponsibilityZoneControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
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
                return new ResponsibilityZoneControl(metadata, listform);
            }
        }

        /// <summary>
        /// Добавление обработчиков на поля
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            this.AppContext.ScriptManager.RegisterResource("GetResponsibilityZone.js", "/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/CustomerResponsibilityZoneControl");
            this.AddFieldChangeHandler("Заказчик", "OMK_GetResponsibilityZone");
        }
    }
}




