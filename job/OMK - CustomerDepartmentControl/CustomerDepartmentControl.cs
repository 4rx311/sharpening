using WSSC.V4.SYS.DBFramework;
using Consts = WSSC.V4.DMS.OMK._Consts.Controls.CustomerDepartmentControl;

namespace WSSC.V4.DMS.OMK.Controls.CustomerDepartment
{
    /// <summary>
    /// Контрол просматривает первого пользователя в поле "Заказчик" и проставляет поля "Подразделение заказчик" и "Зона ответственности" по условию.
    /// </summary>
    class CustomerDepartmentControl : DBListFormWebControl
    {
        /// <summary>
        /// Контрол просматривает первого пользователя в поле "Заказчик" и проставляет поля "Подразделение заказчик" и "Зона ответственности" по условию.
        /// </summary>
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
            string stage = this.Item.GetStringValue(Consts.FieldStage);
            if (stage == Consts.StageValue)
            {
                this.AppContext.ScriptManager.RegisterResource(Consts.SourseRef, VersionProvider.ModulePath);
                this.AddFieldChangeHandler(Consts.FieldSettingValue, Consts.JSMethod);
            }
        }
    }
}



