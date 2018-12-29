using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK
{
    /// <summary>
    /// Представляет данные для строки отчета.
    /// </summary>
    public class UserDataRow : IRPDataRow
    {
        /// <summary>
        /// К-тор.
        /// </summary>
        /// <param name="item">Пользователь.</param>
        public UserDataRow(DBItem item)  
        {
            if (item == null)
                throw new ArgumentNullException("item");

            this.Item = item;

            this.IsTotalRow = false;
        }

        public UserDataRow() 
        {
            this.IsTotalRow = true;
        }

        public bool IsTotalRow { set; get; }

        public int Number { set; get; } 

        /// <summary>
        /// Пользователь.
        /// </summary>
        public DBItem Item { get; private set; }

        private UserDelaysInfo _DocumentsInfo;
        /// <summary>
        /// Данные по документам.
        /// </summary>
        public UserDelaysInfo DocumentsInfo
        {
            get { return _DocumentsInfo; }
            set { _DocumentsInfo = value; }
        }

        private UserDelaysInfo _ComissionsInfo;
        /// <summary>
        /// Данные по поручениям.
        /// </summary>
        public UserDelaysInfo ComissionsInfo
        {
            get { return _ComissionsInfo; }
            set { _ComissionsInfo = value; }
        }

        public string GetRating()
        {
            string result = string.Empty;

            int total = this.ComissionsInfo.Executed + this.ComissionsInfo.InWork + this.DocumentsInfo.Executed + this.DocumentsInfo.InWork;
            int delayed = this.ComissionsInfo.Delayed + this.DocumentsInfo.Delayed;

            if (total > 0)
            {
                double sum = ((double)delayed / total) * 100;

                if (sum <= 25)
                    result = "Высокая";
                if (sum <= 50 && sum > 25)
                    result = "Средняя";
                if (sum > 50)
                    result = "Низкая";
            }

            return result;
        }
    }
}
