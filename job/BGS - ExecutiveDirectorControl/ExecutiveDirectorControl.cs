using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using Const = WSSC.V4.DMS.BGS.Consts.Handlers.ExecutiveDirectorHandler;

namespace WSSC.V4.DMS.BGS.Controls
{
    /// <summary>
    /// Контрол отслеживает, занимает ли указанный в поле "адресат" должность "исполнительный директор" 
    /// </summary>
    class ExecutiveDirectorControl : DBListFormWebControl
    {
        protected ExecutiveDirectorControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
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
                return new ExecutiveDirectorControl(metadata, listform);
            }
        }

        /// <summary>
        /// Добавление обработчиков на поля
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            this.AppContext.ScriptManager.RegisterResource("SetExecutiveDirectorControl.js", "/_layouts/WSS/WSSC.V4.DMS.BGS/Controls/ExecutiveDirectorControl");
            this.AddFieldChangeHandler(Const.RecipientsField, "BGS_SetExecutiveDirectorControl");
        }
    }
}
