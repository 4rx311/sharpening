using System;
using System.Xml;
using WSSC.V4.SYS.Lib.Base;

using Const = WSSC.V4.CST.WSS.Tasks.Consts.Handlers.TaskPathSwitcherHandler;

namespace WSSC.V4.CST.WSS.Tasks.Handlers.TaskPathSwitcher
{
    /// <summary>
    /// Класс, который из себя представляет переведённое в класс значение одного нода константы
    /// </summary>
    internal class TaskPathSettingsItem
    {
        /// <summary>
        /// Название маршрута
        /// </summary>
        public string PathName { get; private set; }

        /// <summary>
        /// Название настройки с маршрутом
        /// </summary>
        public string SettingName { get; private set; }

        /// <summary>
        /// Конструктор
        /// </summary>
        /// <param name="pathName">Название маршрута, при которому будет устанавливать другое название настройки</param>
        /// <param name="settingName">Новое название настройки</param>
        public TaskPathSettingsItem(string pathName, string settingName)
        {
            if (string.IsNullOrEmpty(pathName))
                throw new ArgumentException("pathName is null or empty");
            if (string.IsNullOrEmpty(settingName))
                throw new ArgumentException("settingName is null or empty");


            this.PathName = pathName;
            this.SettingName = settingName;
        }

        /// <summary>
        /// Конструктор
        /// </summary>
        /// <param name="node">XML node с элементом настройки</param>
        public TaskPathSettingsItem(XmlNode node)
        {
            if (node == null)
                throw new ArgumentNullException("node");


            string pathName = XmlAttributeReader.GetValue(node, Const.NodeAttributePath);
            string settingName = XmlAttributeReader.GetValue(node, Const.NodeAttributeSetting);

            if (string.IsNullOrEmpty(pathName) || string.IsNullOrEmpty(settingName))
                throw new XmlException(string.Format($"string.IsNullOrEmpty(pathName) || string.IsNullOrEmpty(settingName) В константе {Const.SettingName} Внутри узла {node.OuterXml}."));

            this.PathName = pathName;
            this.SettingName = settingName;
        }
    }
}
