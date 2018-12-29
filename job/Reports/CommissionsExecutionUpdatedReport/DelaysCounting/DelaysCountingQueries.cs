using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport.DelaysCounting
{
    /// <summary>
    /// Основа запроса на задержку
    /// </summary>
    public abstract class DelaysCountingQueryBase
    {
        private DBSite Site { get; set; }
        private ReportParams ReportParams { get; set; }

        private bool __init_DBInfo = false;
        private DBInfo _DBInfo;
        /// <summary>
        /// Информация о базе данных
        /// </summary>
        public DBInfo DBInfo
        {
            get
            {
                if (!__init_DBInfo)
                {
                    _DBInfo = new DBInfo(this.Site);
                    __init_DBInfo = true;
                }
                return _DBInfo;
            }
        }

        /// <summary>
        /// Название типа приоритета, для которого получаем запрос
        /// </summary>
        protected abstract string PriorityType { get; }

        /// <summary>
        /// Запрос на подсчёт просрочки
        /// </summary>
        /// <param name="site"></param>
        /// <param name="reportParams"></param>
        public DelaysCountingQueryBase(DBSite site, ReportParams reportParams)
        {
            if (site == null)
                throw new ArgumentNullException("site");
            if (reportParams == null)
                throw new ArgumentNullException("reportParams");

            this.ReportParams = reportParams;
            this.Site = site;
        }

        private IEnumerable<int> CurrentIDsSlice
        {
            get
            {
                return this.IDSlices[CurrentSliceIndex];
            }
        }

        private int CurrentSliceIndex = -1;

        private bool __init_IDSlices = false;
        private List<List<int>> _IDSlices;
        /// <summary>
        /// Куски id
        /// </summary>
        public List<List<int>> IDSlices
        {
            get
            {
                if (!__init_IDSlices)
                {
                    IEnumerable<int> allIDs = this.ReportParams.Items.Select(i => i.ID);
                    if (!allIDs.Any())
                        throw new InvalidOperationException("Не удалось получить ни одного ID");

                    _IDSlices = allIDs.Slice(1000);
                    if (_IDSlices.Count < 1)
                        throw new InvalidOperationException("Не был извлечен ни один слайс");


                    __init_IDSlices = true;
                }
                return _IDSlices;
            }
        }


        /// <summary>
        /// Разделяет запрос во избежании отказа
        /// на меньшие куски и записывает запрос по следующему куску
        /// </summary>
        /// <returns></returns>
        public bool NextQueryString(out string query)
        {
            this.CurrentSliceIndex++;
            if (IDSlices.Count > this.CurrentSliceIndex)
            {
                query = this.ToString();
                return true;
            }
            else
            {
                query = String.Empty;
                return false;
            }
        }



        /// <summary>
        /// Возвращает строку запроса
        /// </summary>
        /// <param name="priorityName"></param>
        /// <returns></returns>
        public override string ToString()
        {
            if (this.CurrentSliceIndex < 0)
                throw new InvalidOperationException("Невозможно получить запрос при отрицательном индексе отрезка идентификаторов");

            StringBuilder queryBuilder = new StringBuilder();
            queryBuilder.Append(this.DBInfo.GetCommissionsWith(this.ReportParams.Filters, this.ReportParams.CheckAccess, this.CurrentIDsSlice));

            queryBuilder.AppendFormat(
                @"
SELECT 
HowToCountDelay = 
CASE 
WHEN StatisticTable.SendTime IS NOT NULL OR StatisticTable.DelayedHours = 0 THEN 0
WHEN StatisticTable.SendTime > @reportPeriodEnd THEN 1
WHEN StatisticTable.SendTime IS NULL AND StatisticTable.DelayedHours > 0 THEN 2
END,
StatisticTable.ItemID, StatisticTable.ListID, StatisticTable.ExecuteBefore, StatisticTable.UserID, StatisticTable.SendTime, StatisticTable.DelayedHours

FROM [WSSC_UserDelayCommissions_Statistics] AS StatisticTable
INNER JOIN Commissions
ON StatisticTable.ItemID = Commissions.ID
INNER JOIN @priorityList AS Priorities
ON Commissions.Приоритет = Priorities.ID
WHERE
(
(
 Commissions.Исполнено<=@reportPeriodEnd AND Исполнено>=@reportPeriodStart AND [Исполнено]>[Исполнить до]
 )
OR 
(
([Исполнено] IS NULL OR [Исполнено]>@reportPeriodEnd)
AND
([Исполнить до]<=@reportPeriodEnd)
)
)
AND Priorities.[Название] = N'@priorityName'");

            string queryTemplate = queryBuilder.ToString();
            string query = queryTemplate.
                Replace("@reportPeriodEnd", "'" + this.ReportParams.ReportPeriodEnd.ToString("yyyy-MM-dd HH:mm:ss") + "'")
                .Replace("@reportPeriodStart", "'" + this.ReportParams.ReportPeriodStart.ToString("yyyy-MM-dd HH:mm:ss") + "'")
                .Replace("@priorityList", this.DBInfo.PriorityTypesList.TableName)
                .Replace("@priorityName", this.PriorityType);

            return query;
        }
    }

    /// <summary>
    /// Запрос на просчрочки срочных документов
    /// </summary>
    public class CriticalDelaysCountingQuery : DelaysCountingQueryBase
    {
        public CriticalDelaysCountingQuery(DBSite site, ReportParams reportParams)
            : base(site, reportParams)
        {

        }

        protected override string PriorityType
        {
            get { return "Срочно"; }
        }
    }

    /// <summary>
    /// Запрос на некритичные просрочки
    /// </summary>
    public class NotCriticalDelaysCountingQuery : DelaysCountingQueryBase
    {
        public NotCriticalDelaysCountingQuery(DBSite site, ReportParams reportParams)
            : base(site, reportParams)
        {

        }

        protected override string PriorityType
        {
            get { return "Обычный"; }
        }
    }
}
