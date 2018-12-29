using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет объект данных для строки отчета по согласованию.
    /// </summary>
    public class UserAgreementInfo : IRPDataRow
    {
        /// <summary>
        /// К-тор.
        /// </summary>
        /// <param name="item">Пользователь.</param>
        internal UserAgreementInfo(DBItem item, AgrReportBuilder reportBuilder)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            if (reportBuilder == null)
                throw new ArgumentNullException("reportBuilder");

            this.ReportBuilder = reportBuilder;
            this.Item = item;
        }

        /// <summary>
        /// Пользователь.
        /// </summary>
        public DBItem Item { get; private set; }

        /// <summary>
        /// Построитель отчета.
        /// </summary>
        public AgrReportBuilder ReportBuilder { get; set; }

        private bool __init_DelaysCollection = false;
        private UserDelaysCollection _DelaysCollection;
        /// <summary>
        /// Коллекция записей просрочки по документам.
        /// </summary>
        public UserDelaysCollection DelaysCollection
        {
            get
            {
                if (!__init_DelaysCollection)
                {
                    _DelaysCollection = new UserDelaysCollection(this.Item, this.ReportBuilder.PeriodStart, this.ReportBuilder.PeriodEnd);
                    __init_DelaysCollection = true;
                }
                return _DelaysCollection;
            }
        }

        private bool __init_All = false;
        private int _All;
        /// <summary>
        /// Общее кол-во документов по согласующему.
        /// </summary>
        public int All
        {
            get
            {
                if (!__init_All)
                {
                    _All = this.DelaysCollection.GetAllCount();
                    __init_All = true;
                }
                return _All;
            }
        }

        private bool __init_InWork = false;
        private int _InWork;
        /// <summary>
        /// Кол-во документов работе у согласующего.
        /// </summary>
        public int InWork
        {
            get
            {
                if (!__init_InWork)
                {
                    _InWork = this.DelaysCollection.GetInWorkCount();
                    __init_InWork = true;
                }
                return _InWork;
            }
        }

        private bool __init_Processed = false;
        private int _Processed;
        /// <summary>
        /// Кол-во обработанных документов.
        /// </summary>
        public int Processed
        {
            get
            {
                if (!__init_Processed)
                {
                    _Processed = this.DelaysCollection.GetProcessedCount();
                    __init_Processed = true;
                }
                return _Processed;
            }
        }

        private bool __init_ProcessedOnTime = false;
        private int _ProcessedOnTime;
        /// <summary>
        /// Кол-во документов, обработанных без просрочки.
        /// </summary>
        public int ProcessedOnTime
        {
            get
            {
                if (!__init_ProcessedOnTime)
                {
                    _ProcessedOnTime = this.DelaysCollection.GetProcessedOnTimeCount();
                    __init_ProcessedOnTime = true;
                }
                return _ProcessedOnTime;
            }
        }

        private bool __init_Delayed = false;
        private int _Delayed;
        /// <summary>
        /// Кол-во просроченных документов.
        /// </summary>
        public int Delayed
        {
            get
            {
                if (!__init_Delayed)
                {
                    _Delayed = this.DelaysCollection.GetDelayedCount();
                    __init_Delayed = true;
                }
                return _Delayed;
            }
        }
    }
}
