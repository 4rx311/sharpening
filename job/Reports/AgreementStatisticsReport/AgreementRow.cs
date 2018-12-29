using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Fields.Choice;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports.AgreementReportData
{
    /// <summary>
    /// Класс, представляющий данные строки отчета
    /// </summary>
    public class AgreementRow : IRPDataRow
    {
        /// <summary>
        /// Конструктор строки отчета по документу
        /// </summary>
        /// <param name="item"></param>
        public AgreementRow(DBItem item)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            this.Item = item;
        }

        private bool _init_Agreements = false;
        private List<AgreementData> _Agreements;
        /// <summary>
        /// Набор договоров, относящихся к данной строке отчета
        /// </summary>
        public List<AgreementData> Agreements
        {
            get
            {
                if (!_init_Agreements)
                {
                    _Agreements = new List<AgreementData>();
                    _init_Agreements = true;
                }
                return _Agreements;
            }
        }

        public DBItem Item { get; private set; }
    }

}
