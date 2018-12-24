using System;
using System.Collections.Generic;
using System.Xml;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Base;

using Const = WSSC.V4.CST.WSS.Tasks.Consts.Handlers.TaskPathSwitcherHandler;

namespace WSSC.V4.CST.WSS.Tasks.Handlers.TaskPathSwitcher
{
    /// <summary>
    /// Класс для хранения информации узла list настройки
    /// </summary>
    internal class TaskPathSettingsList
    {
        /// <summary>
        /// Список
        /// </summary>
        internal DBList List { get; private set; }

        /// <summary>
        /// Узел списка
        /// </summary>
        private readonly XmlNode ListNode;

        private bool __init_Switches = false;
        private List<TaskPathSettingsItem> _Switches;
        /// <summary>
        /// Список переходов текущего списка
        /// </summary>
        internal List<TaskPathSettingsItem> Switches
        {
            get
            {
                if (!__init_Switches)
                {
                    // получим список переходов
                    XmlNodeList linkNodes = this.ListNode.SelectNodes(Const.ListNodesName);
                    if (linkNodes == null || linkNodes.Count <= 0)
                        throw new XmlException(string.Format($"Отсутствуют дочерние узлы [{Const.ListNodesName}] у узла [{this.ListNode.OuterXml}]."));

                    _Switches = new List<TaskPathSettingsItem>();
                    foreach (XmlNode link in linkNodes)
                        this._Switches.Add(new TaskPathSettingsItem(link));

                    __init_Switches = true;
                }
                return _Switches;
            }
        }

        /// <summary>
        /// Конструктор
        /// </summary>
        internal TaskPathSettingsList(DBWeb web, XmlNode listNode)
        {
            if (web == null)
                throw new ArgumentNullException("web");
            this.ListNode = listNode ?? throw new ArgumentNullException("listNode");

            // Получим список
            string listName = XmlAttributeReader.GetValue(listNode, Const.NameAttribute);
            if (string.IsNullOrEmpty(listName))
                throw new XmlException(string.Format($"Отсутствует атрибут [{Const.NameAttribute}] у узла [{listNode.OuterXml}]."));

            this.List = web.GetList(listName);
            if (this.List == null)
                throw new DBException.MissingList(web, listName);
        }
    }
}
