using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Xml;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Files;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify
{
    /// <summary>
    /// Элемент управления создающий уведомления об изменении полей
    /// </summary>
    internal class ChangeFieldNotifyControl : DBListFormWebControl
    {
        /// <summary>
        /// Конструктор элемента управления
        /// </summary>
        internal ChangeFieldNotifyControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm) : base(metadata, listForm) { }
        /// <summary>
        /// Фабрика, создающая элемент управления
        /// </summary>
        protected class Factory : DBListFormWebControlFactory
        {
            protected override DBListFormWebControl CreateListFormWebControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            {
                return new ChangeFieldNotifyControl(metadata, listForm);
            }
        }
        /// <summary>
        /// Название функции, которая будет вызвана на клиенте при инициализации
        /// </summary>
        protected override string ClientInitHandler { get { return "ChangeFieldNotify_Init"; } }
        /// <summary>
        /// Название функции, которая будет вызвана на клиенте перед сохранением
        /// </summary>
        protected override string ClientPreSaveHandler { get { return "ChangeFieldNotify_BeforeSave"; } }
        /// <summary>
        /// Название функции, которая будет вызвана при сохранении
        /// </summary>
        protected override string ClientSaveHandler { get { return "ChangeFieldNotify_OnSave"; } }
        /// <summary>
        /// Регистрация файла скриптов
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            this.AppContext.ScriptManager.RegisterResource("Controls/ChangeFieldNotify/ChangeFieldNotify.js", VersionProvider.ModulePath);
        }
        /// <summary>
        /// Метод создает объект, который будет передан на клиент при инициализации
        /// </summary>
        /// <returns>Объект, который будет передан как контекст выполнения клиентской инициализирующей функцией</returns>
        protected override object CreateClientInstance()
        {
            JSClient.InitConsts result = new JSClient.InitConsts();

            // Если этап подготовка, то элемент управления деактивируется
            if (this.Item.GetStringValue(Consts.Controls.ChangeFieldNotify.StageField) == Consts.Controls.ChangeFieldNotify.PreparationStage)
            {
                result.Active = false;
                return result;
            }
            result.Active = true;

            // Считать настройки
            if (!this.AppContext.Site.ConfigParams.ContainsKey(Consts.ConfigParams.ChangeFieldNotify))
            {
                throw new DBException.MissingConfigParam(Consts.ConfigParams.ChangeFieldNotify);
            }
            string fieldsNames = this.AppContext.Site.ConfigParams.GetStringValue(Consts.ConfigParams.ChangeFieldNotify);
            
            // Разделить поля и убрать []
            result.FieldNames = fieldsNames
                .Split(new string[] { ";" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(x => {
                    int posS = x.IndexOf('[');
                    int posE = x.LastIndexOf(']');
                    if (posS >= 0 && posE >= 0)
                    {
                        return x.Substring(posS, posE - posS).Trim();
                    }
                    return x.Trim();
                }).ToArray();

            // Получить версии всех файлов
            FilesVersionSnapshotManager filesSnapshotMenegers = new FilesVersionSnapshotManager(this.Item);
            result.FilesOrigin = filesSnapshotMenegers.GetSnapshot(result.FieldNames);

            // Требуется отклонить сохранение при отмене оповещения об изменении полей или нет
            result.RejectSave = false;
            if (!String.IsNullOrEmpty(this.Metadata.SettingsData))
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(this.Metadata.SettingsData);
                XmlNode node = doc.SelectSingleNode("/Settings/RejectSave");
                result.RejectSave = node != null;
            }

            return result;
        }
    }
}
