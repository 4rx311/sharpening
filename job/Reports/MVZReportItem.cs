using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.OMK.ComplexReports
{
    public class MVZReportItem
    {
         public string MVZ;
      
        public double Amount;

        public MVZReportItem(string mvz, double amount)
        {
            this.MVZ = mvz;
            this.Amount = amount;
        }
    }
}
