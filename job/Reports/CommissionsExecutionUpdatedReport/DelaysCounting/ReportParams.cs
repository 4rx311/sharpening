using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport.DelaysCounting
{
    /// <summary>
    /// Параметры отчёта
    /// </summary>
    public class ReportParams
    {
        public IReportFilterConditions Filters { get; set; }
        public IEnumerable<DBItem> Items { get; set; }
        public DateTime ReportPeriodEnd { get; set; }
        public DateTime ReportPeriodStart { get; set; }

        public bool CheckAccess { get; set; }
    }
}
