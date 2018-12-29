using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Обновлённая страница детализации отчёта по поручениям.
    /// </summary>
    public class UpdatedDetalization : Detalization
    {
        protected override string ReportSettingsName
        {
            get
            {
                return "OMK_UpdatedDetalizationSetting";
            }
        }
         
    }
}
