using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport
{
    public abstract class CommissionReport : RPCustomBuilder
    {
        /// <summary>
        /// Абстрактный класс для реализации кастомного отчёта.
        /// </summary>
        /// <param name="builder">Построитель отчёта.</param>
        public CommissionReport(RPTableBuilder builder)
            : base(builder)
        {
        }

        /// <summary>
        /// Столбцы отчёта.
        /// </summary>
        public abstract Columns Columns { get; }

        private bool __init_CommissionReportSettings;
        private CommissionReportSettings _CommissionReportSettings;
        /// <summary>
        /// Настройка формирования отчёта по поручениям.
        /// </summary>
        protected CommissionReportSettings CommissionReportSettings
        {
            get
            {
                if (!__init_CommissionReportSettings)
                {
                    _CommissionReportSettings = new CommissionReportSettings(this.CustomSettings);
                    __init_CommissionReportSettings = true;
                }
                return _CommissionReportSettings;
            }
        }
    }
}
