using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.OMK.Reports.AgreementReportData
{
    /// <summary>
    /// Класс маски для модели договора
    /// </summary>
    public class AgreementMask
    {
        /// <summary>
        /// Значение поля "Этап"
        /// </summary>
        public string Stage = "";
        /// <summary>
        /// Значение поля "Вид документа"
        /// </summary>
        public string DocType = "";
        /// <summary>
        /// Значение поля "Источник финансирования"
        /// </summary>
        public string FinSource = "";
        /// <summary>
        /// Значения поля "Форма договора"
        /// </summary>
        public string Form = "";
        /// <summary>
        /// Значение поля "Внутренний_Внешний"
        /// </summary>
        public string OuterInner = "";
        /// <summary>
        /// Значение поля "Есть протокол разногласий"
        /// </summary>
        public bool DisagreementProtocol;
    }
}
