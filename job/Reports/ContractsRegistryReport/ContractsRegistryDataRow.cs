using System;
using System.Collections.Generic;
using System.Linq;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет строку отчета реестра договоров.
    /// </summary>
    public class ContractsRegistryDataRow : IRPDataRow
    {
        /// <summary>
        /// К-тор.
        /// </summary>
        /// <param name="item">Документ.</param>
        internal ContractsRegistryDataRow(DBItem item)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            this.Item = item;
        }

        /// <summary>
        /// Пользователь.
        /// </summary>
        public DBItem Item { get; private set; }

        private double _AgrWorkHours;
        /// <summary>
        /// Кол-во часов на этапе согласования.
        /// </summary>
        public double AgrWorkHours
        {
            get { return _AgrWorkHours; }
            set { _AgrWorkHours = value; }
        }

        private double _SignWorkHours;
        /// <summary>
        /// Кол-во часов этапе подписания.
        /// </summary>
        public double SignWorkHours
        {
            get { return _SignWorkHours; }
            set { _SignWorkHours = value; }
        }
    }
}
