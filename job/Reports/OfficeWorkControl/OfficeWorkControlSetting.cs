using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;

namespace WSSC.V4.DMS.OMK.Reports.OfficeWorkControl
{
    /// <summary>
    /// Настройка отчёта
    /// </summary>
    internal class OfficeWorkControlSetting
    {
        private readonly XmlDocument _XmlDocument;

        /// <summary>
        /// Инициализирует новый экземпляр класса OfficeWorkControlSetting 
        /// </summary>
        /// <param name="xmlDoc">Xml настройки</param>
        internal OfficeWorkControlSetting(XmlDocument xmlDoc)
        {
            if ((_XmlDocument = xmlDoc) == null)
                throw new ArgumentNullException("xmlDoc");
        }

        private IEnumerable<string> _SolutionNames;
        /// <summary>
        /// Решения о согласовании
        /// </summary>
        internal IEnumerable<string> SolutionNames
        {
            get
            {
                if (_SolutionNames == null)
                {
                    _SolutionNames = _XmlDocument.SelectNodes("Settings/Solutions/Solution").Cast<XmlNode>().Select(n => n.InnerText);
                    if (!_SolutionNames.Any())
                        throw new Exception("Не указано ни одного решения о согласовании");
                }
                return _SolutionNames;
            }
        }
    }
}
