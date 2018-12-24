using System;
using System.Xml;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.CST.WSS.Tasks.Handlers.TaskPathSwitcher
{
    public static class TaskSettingsExtensions
    {
        /// <summary>
        /// Получить дочерние узлы.
        /// </summary>
        /// <param name="node">Узел, где нужно найти дочерние элементы</param>
        /// <param name="childrenNodeName">Название дочерних элементов</param>
        /// <param name="throwExceptionIfNone">Выбросить Exception, если не найдено ни одного элемента</param>
        /// <returns>Список нодов, где гарантированно есть хоть 1 элемент</returns>
        public static XmlNodeList SelectNodes(this XmlNode node, string childrenNodeName, bool throwExceptionIfNone)
        {
            if (node == null)
                throw new ArgumentNullException("node");
            if (string.IsNullOrEmpty(childrenNodeName))
                throw new ArgumentException("childrenNodeName is null or empty");


            XmlNodeList result = node.SelectNodes(childrenNodeName);
            if (result == null || (result.Count == 0 && throwExceptionIfNone))
                throw new XmlException(string.Format($"У узла [{node.Name}] отсутствуют дочерние узлы [{childrenNodeName}]."));

            return result;
        }
    }
}
