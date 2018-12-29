using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport
{
    public class UpdatedCommisionsExecutionDetalization : CommissiongsExecutionReportDetalization
    {
        public override string PriorityFilter
        {
            get
            {
                if (this.PriorityIDs == null || !this.PriorityIDs.Any())
                    return String.Empty;

                return String.Format("[{0}] IN ({1})", "Приоритет", String.Join(",",
                                                                        this.PriorityIDs));
            }
        }


        private bool __init_PriorityIDs = false;
        private string[] _PriorityIDs;
        /// <summary>
        /// Массив, содержащий переданые ID видов протоколов из фильтра по виду протокола поручения
        /// </summary>
        private string[] PriorityIDs
        {
            get
            {
                if (!__init_PriorityIDs)
                {
                    _PriorityIDs = this.GetIDArrayFromHexQuery("priority");
                    __init_PriorityIDs = true;
                }
                return _PriorityIDs;
            }
        }



        public UpdatedCommisionsExecutionDetalization(RPTableBuilder builder) : base(builder)
        {
        }

        public override Columns Columns
        {
            get
            {
                return new UpdatedColumns(base.CommissionReportSettings, new DBInfo(this.AppContext.Site), this);
            }
        }
    }
}
