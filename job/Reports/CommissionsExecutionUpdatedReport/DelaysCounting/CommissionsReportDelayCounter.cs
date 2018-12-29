using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Logging;
using WSSC.V4.SYS.Lib.Utilities;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport.DelaysCounting
{
    public class CommissionsReportDelayCounter
    {
        private DBSite Site { get; set; }
        private ReportParams ReportParams { get; set; }


        private bool __init_WorkTimeService = false;
        private WorkTimeService _WorkTimeService;
        /// <summary>
        /// Сервис рабочего времени
        /// </summary>
        public WorkTimeService WorkTimeService
        {
            get
            {
                if (!__init_WorkTimeService)
                {
                    _WorkTimeService = this.Site.WorkTimeService();

                    __init_WorkTimeService = true;
                }
                return _WorkTimeService;
            }
        }



        private bool __init_Log = false;
        private Log _Log;
        /// <summary>
        /// Логи
        /// </summary>
        public Log Log
        {
            get
            {
                if (!__init_Log)
                {
                    _Log = new SYS.Lib.Logging.Log("CommissionsReportDelayCounter", VersionProvider.ModulName, this.Site);

                    __init_Log = true;
                }
                return _Log;
            }
        }

        private bool __init_UsersCriticalDelays = false;
        private Dictionary<int, double> _UsersCriticalDelays;
        /// <summary>
        /// Идентификатор пользователя - средняя просрочка по критическим поручениям
        /// </summary>
        public Dictionary<int, double> UsersCriticalDelays
        {
            get
            {
                if (!__init_UsersCriticalDelays)
                {
                    _UsersCriticalDelays = this.BuildDictionary(new CriticalDelaysCountingQuery(this.Site, this.ReportParams));
                    __init_UsersCriticalDelays = true;
                }
                return _UsersCriticalDelays;
            }
        }


        private bool __init_UsersNotCriticalDelays = false;
        private Dictionary<int, double> _UsersNotCriticalDelays;
        /// <summary>
        /// Пользователь - средняя просрочка по критическим поручениям
        /// </summary>
        public Dictionary<int, double> UsersNotCriticalDelays
        {
            get
            {
                if (!__init_UsersNotCriticalDelays)
                {
                    _UsersNotCriticalDelays = this.BuildDictionary(new NotCriticalDelaysCountingQuery(this.Site, this.ReportParams));
                    __init_UsersNotCriticalDelays = true;
                }
                return _UsersNotCriticalDelays;
            }
        }

        /// <summary>
        /// Создаёт подсчитывателя среднего времени просрочки
        /// для указанного сайта и настроек отчёта
        /// </summary>
        /// <param name="site"></param>
        /// <param name="reportParams"></param>
        public CommissionsReportDelayCounter(DBSite site, ReportParams reportParams)
        {
            if (site == null)
                throw new ArgumentNullException("site");
            if (reportParams == null)
                throw new ArgumentNullException("reportParams");

            this.Site = site;
            this.ReportParams = reportParams;
        }

        /// <summary>
        /// Получает среднее критическое время просрочки
        /// </summary>
        /// <param name="userID"></param>
        /// <returns></returns>
        public double GetAvarageCriticalDelay(int userID)
        {
            double result;
            if (!this.UsersCriticalDelays.TryGetValue(userID, out result))
                result = 0;

            return result;
        }

        /// <summary>
        /// Получает среднее не критическое время просрочки
        /// </summary>
        /// <param name="userID"></param>
        /// <returns></returns>
        public double GetAvarageNotCriticalDelay(int userID)
        {
            double result;
            if (!this.UsersNotCriticalDelays.TryGetValue(userID, out result))
                result = 0;

            return result;
        }

        /// <summary>
        /// Создаёт словарь пользователь - средняя просрочка
        /// </summary>
        /// <param name="countingQuery"></param>
        private Dictionary<int, double> BuildDictionary(DelaysCountingQueryBase countingQuery)
        {
            Dictionary<int, double> result = new Dictionary<int, double>();
            string query;

            while (countingQuery.NextQueryString(out query))
            {
                this.Log.Write(String.Format("Выполняем запрос для подсчёта просрочки:\n {0}", query));

                DataTableMapper mapper = new DataTableMapper();
                List<CommissionDelaysInfo> delays = mapper.Query<CommissionDelaysInfo>(this.Site.DataAdapter, query);

                foreach (var delaysGrouping in delays.GroupBy(d => d.UserID))
                {
                    double avarage = delaysGrouping.Average(d => d.GetDelayFor(this.ReportParams.ReportPeriodEnd, this.WorkTimeService));
                    result.Add(delaysGrouping.Key, avarage);
                }
            }

            return result;
        }
    }
}
