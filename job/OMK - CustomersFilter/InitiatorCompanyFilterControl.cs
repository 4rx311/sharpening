using System;
using WSSC.V4.SYS.DBFramework;

using Consts = WSSC.V4.DMS.OMK._Consts.Controls.InitiatorCompanyFilterControl;

namespace WSSC.V4.DMS.OMK.Controls.CustomersFilter
{
    // + TODO [CR, Куклин Илья]: добавить комментарий к классу (такой же, как у конструктора).
    /// <summary>
    /// Контрол фильтрации пользователей в поле "Заказчик"
    /// </summary>
    class InitiatorCompanyFilterControl : DBListFormWebControl
    {
        /// <summary>
        /// Контрол фильтрации пользователей в поле "Заказчик"
        /// </summary>
        protected InitiatorCompanyFilterControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            : base(metadata, listForm) { }

        protected class Factory : DBListFormWebControlFactory
        {
            protected override DBListFormWebControl CreateListFormWebControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            {
                return new InitiatorCompanyFilterControl(metadata, listForm);
            }
        }

        /// <summary>
        /// Регистрация JS-скрипта.
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            this.AppContext.ScriptManager.RegisterResource(Consts.SourseRef, VersionProvider.ModulePath);
        }

        /// <summary>
        /// Название скрипта, который будет вызван при инициализации формы.
        /// </summary>
        protected override string ClientInitHandler
        {
            get { return Consts.JSMethod; }
        }
    }
}
