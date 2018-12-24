using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.DBObjects;
using WSSC.V4.SYS.Lib.Logging;

using Const = WSSC.V4.CST.WSS.Tasks.Consts.Handlers.TaskPathSwitcherHandler;

namespace WSSC.V4.CST.WSS.Tasks.Handlers.TaskPathSwitcher
{
    /// <summary>
    /// Вспомогательный класс
    /// </summary>
    internal class TaskPathSwitcher
    {
        #region Properties

        /// <summary>
        /// DmsLogic для элемента списка
        /// </summary>
        private readonly DMSLogic Logic;

        private bool __init_Item = false;
        private DBItem _Item;
        /// <summary>
        /// Обрабатываемый элемент
        /// </summary>
        public DBItem Item
        {
            get
            {
                if (!__init_Item)
                {
                    if (this.Logic.Item == null)
                        throw new Exception("Не удалось получить Item из [this.Logic].");
                    _Item = this.Logic.Item;

                    // Проверим поле
                    _Item.List.ContainsField(Const.FieldTaskType, true);

                    DBField theField = _Item.List.GetField(Const.FieldTaskType);
                    // Если поле не верного типа
                    if (!theField.IsTypeOfLookupSingle())
                        throw new Exception(string.Format($"В списке [{_Item.List.Name}] поле [{Const.FieldTaskType}] имеет тип [{theField.Type}]. Ожидаемый тип поля: [{"Единичная подстановка"}]"));

                    __init_Item = true;
                }
                return _Item;
            }
        }

        private bool __init_Settings = false;
        private TaskPathSettings _Settings;
        /// <summary>
        /// Класс с настройками
        /// </summary>
        public TaskPathSettings Settings
        {
            get
            {
                if (!__init_Settings)
                {
                    _Settings = new TaskPathSettings(this.Site);
                    __init_Settings = true;
                }
                return _Settings;
            }
        }

        private bool __init_Site = false;
        private DBSite _Site;
        /// <summary>
        /// Сайт
        /// </summary>
        public DBSite Site
        {
            get
            {
                if (!__init_Site)
                {
                    if (this.Item.Site == null)
                        throw new Exception("Не удалось получить [DBSite] из [this.Item.Site].");

                    _Site = Logic.Item.Site;
                    __init_Site = true;
                }
                return _Site;
            }
        }

        private bool __init_ItemInfoAdapter = false;
        private DBObjectAdapter<DMSItemInfo> _ItemInfoAdapter;
        /// <summary>
        /// Адаптер для DMSItemInfo
        /// </summary>
        public DBObjectAdapter<DMSItemInfo> ItemInfoAdapter
        {
            get
            {
                if (!__init_ItemInfoAdapter)
                {
                    _ItemInfoAdapter = new DBObjectAdapter<DMSItemInfo>(this.Site.SiteConnectionString);
                    __init_ItemInfoAdapter = true;
                }
                return _ItemInfoAdapter;
            }
        }

        #endregion

        /// <summary>
        /// Конструктор
        /// </summary>
        internal TaskPathSwitcher(DMSLogic Logic)
        {
            this.Logic = Logic ?? throw new ArgumentNullException("Logic");
        }

        /// <summary>
        /// Переключение маршрута по условию.
        /// </summary>
        internal void Process()
        {
            // Получаем сохраненный и выбранный маршруты документа
            string originalPath = this.Item.GetStringValue(Const.FieldTaskType, DBFieldValueVersion.Original);
            string currentPath = this.Item.GetStringValue(Const.FieldTaskType, DBFieldValueVersion.Current);

            // Если значение изменилось, то ищем ищем новое значение в константе и ставим название настройки маршрута для данного элемента списка
            if (originalPath != currentPath)
            {
                if (!this.Settings.ListsSettings.ContainsKey(this.Item.List.ID))
                    throw new Exception($"Не найдена настройка для списка с ID [{this.Item.List.ID}]. Отключите обработчик для данного списка или пропишите данный список в настройке.");

                TaskPathSettingsList listSetting = this.Settings.ListsSettings[this.Item.List.ID];

                if (listSetting == null)
                    throw new Exception(string.Format($"В словаре настроек списка при получении значения по ключу [{this.Item.List.ID}] вернулось нулевое значение"));

                // ищем совпадения со словарем
                IEnumerable<TaskPathSettingsItem> possibleSettingItems = listSetting
                    .Switches
                    .Where(x => x.PathName.ToLower() == currentPath.ToLower());

                // проверка на null и на повторения
                if (possibleSettingItems == null || !possibleSettingItems.Any())
                    throw new Exception(string.Format($"В константе [{Const.SettingName}] нет записей."));
                if (possibleSettingItems.Count() > 1)
                    throw new Exception(string.Format($"В настройке [{Const.SettingName}] элемент со значением PathName [{currentPath}] встречается больше одного раза."));

                // По выбранному пути выставление соответствующей настройки
                TaskPathSettingsItem newSettingPair = possibleSettingItems.First();
                try
                {
                    this.SetNewPathSettingNameForItem(this.Item, newSettingPair.SettingName);
                }
                catch (Exception ex)
                {
                    string errorMessage = string.Format($"Возникла ошибка при выставлении названия новой настройки для элемента (ListID: [{this.Item.List.ID}] ItemID: [{this.Item.ID}])");
                    throw new Exception(errorMessage, ex);
                }
            }

            //if (originalPath != currentPath)
            //{
            //    try
            //    {
            //        if (currentPath == Const.TaskTypeIsSettings)
            //            this.SetNewPathSettingNameForItem(this.Item, Const.ProcessSettingTask);
            //        else if (currentPath == Const.TaskTypeIsDev)
            //            this.SetNewPathSettingNameForItem(this.Item, Const.ProcessSettingDevTask);
            //    }
            //    catch (Exception ex)
            //    {
            //        string errorMessage = string.Format("Возникла ошибка при выставлении названия новой настройки для элемента (ListID: [{0}] ItemID: [{1}])"
            //            , this.Item.List.ID, this.Item.ID);
            //        throw new Exception(errorMessage, ex);
            //    }
            //}
        }

        /// <summary>
        /// Выставить для элемента нужный маршрут.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="newSettingName"></param>
        private void SetNewPathSettingNameForItem(DBItem item, string newSettingName)
        {
            if (item == null)
                throw new ArgumentNullException("item");
            if (string.IsNullOrEmpty(newSettingName))
                throw new ArgumentException("newSettingName is null or empty");


            string queryWhere = string.Format($"[WebID] = {item.Web.ID} AND [ListID] = {item.List.ID} AND [ItemID] = {item.ID}");

            DMSItemInfo foundItem = this.ItemInfoAdapter.GetObject(queryWhere);
            if (foundItem == null)
                throw new DBException.MissingItem(this.ItemInfoAdapter.List, queryWhere);

            foundItem.SettingName = newSettingName;
            this.ItemInfoAdapter.SaveObject(foundItem);
        }
    }
}
