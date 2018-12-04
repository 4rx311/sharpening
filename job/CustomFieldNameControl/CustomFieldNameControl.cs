using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Controls
{
    /// <summary>
    /// Контрол кастомного переименования полей
    /// </summary>
    public class CustomFieldNameControl : DBListFormWebControl
    {
        /// <summary>
        /// Инициализирует новый экземпляр класса CustomFieldAccessControl
        /// </summary>
        /// <param name="metadata">Метаданные контрола</param>
        /// <param name="listform">Лист форма</param>
        protected CustomFieldNameControl(DBListFormWebControlMetadata metadata, DBListFormControl listform)
            : base(metadata, listform) { }

        /// <summary>
        /// Фабрика
        /// </summary>        
        protected class Factory : DBListFormWebControlFactory
        {
            protected override DBListFormWebControl CreateListFormWebControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            {
                return new CustomFieldNameControl(metadata, listForm);
            }
        }

        private bool __init_Settings = false;
        private CustomFieldNameSettings _Settings;
        /// <summary>
        /// Настройки контрола
        /// </summary>
        private CustomFieldNameSettings Settings
        {
            get
            {
                if (!__init_Settings)
                {
                    _Settings = new CustomFieldNameSettings(DBAppContext.Current.Site);
                    __init_Settings = true;
                }
                return _Settings;
            }
        }

        /// <summary>
        /// Создание клиентской модели
        /// </summary>
        protected override object CreateClientInstance()
        {
            return this.Settings;
        }

        /// <summary>
        /// Клиентский обработчик инициализации
        /// </summary>
        protected override string ClientInitHandler
        {
            get
            {
                return "OMK_CFN_Init";
            }
        }

        /// <summary>
        /// Действие по окончанию инициализации
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            this.AppContext.ScriptManager.RegisterResource("/Controls/CustomFieldNameControl/CustomFieldNameControl.js", VersionProvider.ModulePath);
            this.AddFieldChangeHandler(this.Settings.ControllingFieldName, "OMK_CFN_ProcessChange");
        }
    }
}
