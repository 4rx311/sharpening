using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Files;
using Consts = WSSC.V4.DMS.OMK._Consts.Lists.Orders.Fields;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Информация о поле "Файлы приложений"
    /// </summary>
    public class FilesCountRow : IRPDataRow
    {
        public FilesCountRow(DBItem item)
        {
            if (item == null) throw new ArgumentNullException("item");

            this._Item = item;
        }

        public DBItem Item
        {
            get { return this._Item; }
        }

        private DBItem _Item { get; set; }

        /// <summary>
        /// Количество файлов в поле "Файлы приложений"
        /// </summary>
        public int FilesCount 
        {
            get
            {
                DBFieldFilesValueCollection files = this.Item.GetFilesValue(Consts.ApplicationsFiles);
                if (files == null && files.Count == 0)
                    return 0;

                return files.Count;
            }
        }
    }
}
