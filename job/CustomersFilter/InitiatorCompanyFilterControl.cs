using System;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Controls.CustomersFilter
{
    class InitiatorCompanyFilterControl : DBListFormWebControl
    {
        /// <summary>
        /// Контрол фильтрации компаний пользователя
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
            this.AppContext.ScriptManager.RegisterResource("Controls/CustomersFilter/InitiatorCompanyFilter.js", VersionProvider.ModulePath);
        }

        /// <summary>
        /// Название скрипта, который будет вызван при инициализации формы.
        /// </summary>
        protected override string ClientInitHandler
        {
            get { return "OMK_InitiatorCompanyFilter_Init"; }
        }
    }
}
