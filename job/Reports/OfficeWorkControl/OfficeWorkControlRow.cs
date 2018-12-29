using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Files;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports.OfficeWorkControl
{
    /// <summary>
    /// Строка отчёта
    /// </summary>
    public class OfficeWorkControlRow : IRPDataRow
    {
        private readonly DBItem _Item;
        private readonly ProcessUser _ProcessUser;

        public OfficeWorkControlRow(DBItem item, DateTime dateStart, DateTime? dateEnd, double workHours)
        {
            if ((_Item = item) == null) throw new ArgumentNullException("item");
            _StartDate = dateStart;
            _EndDate = dateEnd;
            _WorkHours = workHours;
        }

        public DBItem Item { get { return _Item; } }
        public ProcessUser ProcessUser { get { return _ProcessUser; } }

        /// <summary>
        /// Количество файлов в поле "Файлы приложений"
        /// </summary>
        public int FilesCount
        {
            get
            {
                DBFieldFilesValueCollection files = this.Item.GetFilesValue(_Consts.Lists.Orders.Fields.ApplicationsFiles);

                return files == null ? 0 : files.Count;
            }
        }

        private readonly DateTime _StartDate;
        public DateTime StartDate { get { return _StartDate; } }

        private readonly DateTime? _EndDate;
        public DateTime? EndDate { get { return _EndDate; } }

        private readonly double _WorkHours;
        public double WorkHours { get { return _WorkHours; } }
    }
}
