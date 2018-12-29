using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Настройка отчёта.
    /// </summary>
    public class CommissionReportSettings
    {
        /// <summary>
        /// XML настройка.
        /// </summary>
        internal XmlDocument XmlDoc { get; private set; }

        /// <summary>
        /// Настройка отчёта.
        /// </summary>
        /// <param name="xml">XML настройка.</param>
        public CommissionReportSettings(XmlDocument xml)
        {
            if (xml == null)
                throw new ArgumentNullException("xml");

            this.XmlDoc = xml;
        }

        private bool __init_CheckAccess;
        private bool _CheckAccess;
        /// <summary>
        /// Возвращает True, если необходимо проверять доступ.
        /// </summary>
        internal bool CheckAccess
        {
            get
            {
                if (!__init_CheckAccess)
                {
                    XmlNode accessNode = this.XmlDoc.SelectSingleNode("Settings/CheckAccess");
                    if (accessNode == null)
                        throw new Exception("В настройке отчёта отсутствует элемент 'CheckAccess'.");

                    string check = accessNode.InnerText;
                    if (String.IsNullOrEmpty(check))
                        throw new Exception("В настройке отсутствует значение в элементе 'CheckAccess'.");

                    if (!Boolean.TryParse(check.ToLower(), out _CheckAccess))
                        throw new Exception("Не удалось распознать значение в элементе 'CheckAccess'.");

                    __init_CheckAccess = true;
                }
                return _CheckAccess;
            }
        }
    }
}
