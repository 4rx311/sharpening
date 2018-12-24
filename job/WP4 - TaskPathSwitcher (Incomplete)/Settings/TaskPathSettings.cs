using System;
using System.Collections.Generic;
using System.Xml;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Base;

using Const = WSSC.V4.CST.WSS.Tasks.Consts.Handlers.TaskPathSwitcherHandler;

namespace WSSC.V4.CST.WSS.Tasks.Handlers.TaskPathSwitcher
{
    /// <summary>
    /// Класс для работы с константой
    /// </summary>
    internal class TaskPathSettings
    {
        /// <summary>
        /// Сайт
        /// </summary>
        private readonly DBSite Site;

        private bool __init_xDoc = false;
        private XmlDocument _xDoc;
        /// <summary>
        /// XML документ настройки
        /// </summary>
        public XmlDocument xDoc
        {
            get
            {
                if (!__init_xDoc)
                {
                    if (!this.Site.ConfigParams.ContainsKey(Const.SettingName))
                        throw new Exception(string.Format($"Сайт [{this.Site.Url}] не содержит константы под названием [{Const.SettingName}]"));

                    _xDoc = this.Site.ConfigParams.GetXmlDocument(Const.SettingName);
                    __init_xDoc = true;
                }
                return _xDoc;
            }
        }

        private bool __init_ListsSettings = false;
        private Dictionary<int, TaskPathSettingsList> _ListsSettingsDic;
        /// <summary>
        /// Словарь [ID Списка] -> [Настройка списка]
        /// </summary>
        public Dictionary<int, TaskPathSettingsList> ListsSettings
        {
            get
            {
                if (!__init_ListsSettings)
                {
                    // получаем корневой узел
                    XmlNode rootNode = this.xDoc.SelectSingleNode(Const.RootNode);
                    if (rootNode == null)
                        throw new XmlException(string.Format($"У константы [{Const.SettingName}] отсутствует корневой нод [{Const.RootNode}]"));

                    // получаем значения web узла
                    XmlNodeList webNodes = rootNode.SelectNodes("web", true);
                    _ListsSettingsDic = new Dictionary<int, TaskPathSettingsList>();
                    foreach (XmlNode node in webNodes)
                    {
                        string webName = XmlAttributeReader.GetValue(node, Const.NameAttribute);
                        if (string.IsNullOrEmpty(webName))
                            throw new XmlException(string.Format($"Не указан атрибут [{webName}] (либо значение пустое) у нода [{node.OuterXml}]."));

                        DBWeb web = this.Site.GetWeb(webName, true);
                        XmlNodeList listNodes = node.SelectNodes(Const.ListNode, true);
                        foreach (XmlNode listNode in listNodes)
                        {
                            TaskPathSettingsList listSetting = new TaskPathSettingsList(web, listNode);
                            if (_ListsSettingsDic.ContainsKey(listSetting.List.ID))
                                throw new XmlException(string.Format($"В константе список [{listSetting.List.Name}] встречается более 1 раза."));

                            _ListsSettingsDic.Add(listSetting.List.ID, listSetting);
                        }
                    }

                    __init_ListsSettings = true;
                }
                return _ListsSettingsDic;
            }
        }


        /// <summary>
        /// Конструктор
        /// </summary>
        internal TaskPathSettings(DBSite site)
        {
            this.Site = site ?? throw new ArgumentNullException("site");
        }

    }
}
