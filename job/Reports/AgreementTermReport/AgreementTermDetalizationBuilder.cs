using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.DMS.Jobs;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет класс для построения детализации отчета по срокам согласования.
    /// </summary>
    public class AgreementTermDetalizationBuilder : AgrReportBuilder
    {
        public AgreementTermDetalizationBuilder(RPTableBuilder builder)
            : base(builder)
        { }


        #region RequestParams

        private bool __init_AppContext = false;
        private DBAppContext _AppContext;
        /// <summary>
        /// Контекст приложения.
        /// </summary>
        public DBAppContext AppContext
        {
            get
            {
                if (!__init_AppContext)
                {
                    _AppContext = DBAppContext.Current;
                    __init_AppContext = true;
                }
                return _AppContext;
            }
        }

        private bool __init_UserID = false;
        private int _UserID;
        /// <summary>
        /// Идентификатор пользователя.
        /// </summary>
        public int UserID
        {
            get
            {
                if (!__init_UserID)
                {
                    _UserID = this.AppContext.GetRequestValue<int>("userID", 0);
                    if (_UserID < 1)
                        throw new DBException.EmptyParameter("userID");

                    __init_UserID = true;
                }
                return _UserID;
            }
        }

        private bool __init_User = false;
        private DBUser _User;
        /// <summary>
        /// Пользователь.
        /// </summary>
        public DBUser User
        {
            get
            {
                if (!__init_User)
                {
                    _User = this.Site.GetUser(this.UserID);
                    __init_User = true;
                }
                return _User;
            }
        }

        private bool __init_PeriodStart = false;
        private DateTime _PeriodStart;
        /// <summary>
        /// Начало отчетного периода.
        /// </summary>
        public override DateTime PeriodStart
        {
            get
            {
                if (!__init_PeriodStart)
                {
                    string dateStr = this.AppContext.GetRequestValue<string>("dateStart");

                    if (!string.IsNullOrEmpty(dateStr))
                    {
                        if (!DateTime.TryParseExact(dateStr, "ddMMyyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out _PeriodStart))
                            throw new Exception("Некорректно передан параметр dateStart");
                    }

                    __init_PeriodStart = true;
                }
                return _PeriodStart;
            }
        }

        private bool __init_PeriodEnd = false;
        private DateTime _PeriodEnd;
        /// <summary>
        /// Конец отчетного периода.
        /// </summary>
        public override DateTime PeriodEnd
        {
            get
            {
                if (!__init_PeriodEnd)
                {
                    string dateStr = this.AppContext.GetRequestValue<string>("dateEnd");

                    if (!string.IsNullOrEmpty(dateStr))
                    {
                        if (!DateTime.TryParseExact(dateStr, "ddMMyyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out _PeriodEnd))
                            throw new Exception("Некорректно передан параметр dateEnd");
                    }

                    __init_PeriodEnd = true;
                }
                return _PeriodEnd;
            }
        }

        private bool __init_ReportColumn = false;
        private AgrTermReportColumn _ReportColumn;
        /// <summary>
        /// Столбец отчета по которому запрошена детализация.
        /// </summary>
        public AgrTermReportColumn ReportColumn
        {
            get
            {
                if (!__init_ReportColumn)
                {
                    int columnID = this.AppContext.GetRequestValue<int>("columnID", 0);
                    _ReportColumn = (AgrTermReportColumn)columnID;

                    __init_ReportColumn = true;
                }
                return _ReportColumn;
            }
        }

        #endregion


        private bool __init_ControlTimeManagersDict = false;
        private Dictionary<int, ControlTimeOnAgrStageManager> _ControlTimeManagersDict;
        /// <summary>
        /// Словарь менеджеров контроля сроков на согласовании по каждым узлам.
        /// </summary>
        private Dictionary<int, ControlTimeOnAgrStageManager> ControlTimeManagersDict
        {
            get
            {
                if (!__init_ControlTimeManagersDict)
                {
                    _ControlTimeManagersDict = new Dictionary<int, ControlTimeOnAgrStageManager>();
                    __init_ControlTimeManagersDict = true;
                }
                return _ControlTimeManagersDict;
            }
        }

        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            List<UserAgreementDelails> details = new List<UserAgreementDelails>();

            List<SqlParameter> delayParams = new List<SqlParameter>();
            string delayQuery = this.GetDelayStatQuery(out delayParams);
            List<UserDocumentDelay> allDelayInfo = this.DelayAdapter.GetObjects(delayQuery, "", -1, delayParams.ToArray());

            if (this.ReportColumn != AgrTermReportColumn.All)
                allDelayInfo = allDelayInfo.Where(x => x.ObtainStatus != WSSC.V4.DMS.Jobs.Consts.UserDelayStatistics.ObtainStatus.Canceled).ToList();
            Dictionary<int, List<UserDocumentDelay>> listDict = allDelayInfo.GroupBy(x => x.ListID).ToDictionary(gr => gr.Key, v => v.ToList());

            foreach (KeyValuePair<int, List<UserDocumentDelay>> listItems in listDict)
            {
                DBList list = this.Site.GetList(listItems.Key, true);

                List<SqlParameter> sqlParams = new List<SqlParameter>();
                string query = this.GetAgrStatQuery(listItems.Value.Select(x => x.ItemID).ToList(), out sqlParams);
                List<DMSAgrPersonStatistics> allStat = this.AgrStatAdapter.GetObjects(query, "", -1, sqlParams.ToArray());

                Dictionary<int, List<DMSAgrPersonStatistics>> allStatItemDict = allStat.GroupBy(x => x.ItemID).ToDictionary(gr => gr.Key, v => v.ToList());
                foreach (KeyValuePair<int, List<DMSAgrPersonStatistics>> itemPair in allStatItemDict)
                {
                    DBItem item = list.GetItem(itemPair.Key);
                    if (item == null)
                        continue;

                    UserAgreementDelails itemDetails = new UserAgreementDelails(item, this, itemPair.Value, listItems.Value.Where(x => x.ItemID == itemPair.Key).ToList());
                    details.Add(itemDetails);
                }
            }

            return details.Cast<IRPDataRow>();
        }


        /// <summary>
        /// Строит запрос на получение статистики просрочки по пользователю, периоду и столбцу основного отчета.
        /// </summary>
        /// <returns>Запрос на получение статистики просрочки.</returns>
        protected string GetDelayStatQuery(out List<SqlParameter> sqlParams)
        {
            //задаем условие по пользователю
            string query = String.Format("[UserID] = {0} AND [ListID] in ({1}) AND [ControlTimeType] = 'AgrStage'", this.UserID, this.ListsQueryString);
            sqlParams = new List<SqlParameter>();

            SqlParameter startDateParam = null;
            SqlParameter endDateParam = null;

            //добавляем условия по дате начала и окончания периода
            if (this.PeriodStart != DateTime.MinValue)
            {
                startDateParam = new SqlParameter("startDate", System.Data.SqlDbType.DateTime);
                startDateParam.Value = this.PeriodStart;
                sqlParams.Add(startDateParam);
                query = query + String.Format(" AND ([EndTime] is NULL OR [EndTime] > @{0})", startDateParam.ParameterName);
            }

            bool hasEndDate = this.PeriodEnd != DateTime.MinValue;
            if (hasEndDate)
            {
                endDateParam = new SqlParameter("endDate", System.Data.SqlDbType.DateTime);
                endDateParam.Value = this.PeriodEnd;
                sqlParams.Add(endDateParam);
                query = query + String.Format(" AND [StartTime] < @{0}", endDateParam.ParameterName);
            }

            //добавляем дополнительное условие в зависимости от столбца
            switch (this.ReportColumn)
            {
                case AgrTermReportColumn.InWork:
                    {
                        if (hasEndDate)
                            query = query + String.Format(" AND [Delay] = 0 AND ([EndTime] is NULL OR [EndTime] > @{0})", endDateParam.ParameterName);
                        else
                            query = query + " AND [Delay] = 0 AND [EndTime] is NULL";
                        break;
                    }
                case AgrTermReportColumn.Processed:
                case AgrTermReportColumn.ProcessedOnTime:
                    {
                        if (hasEndDate)
                            query = query + String.Format("  AND [EndTime] < @{0}", endDateParam.ParameterName);
                        else
                            query = query + " AND [EndTime] is not NULL";

                        if (this.ReportColumn == AgrTermReportColumn.ProcessedOnTime)
                            query = query + " AND [Delay] = 0";

                        break;
                    }
                case AgrTermReportColumn.Delayed:
                    {
                        query = query + " AND [Delay] > 0";
                        break;
                    }
                case AgrTermReportColumn.All:
                default:
                    break;
            }

            return query;
        }

        /// <summary>
        /// Строит запрос на получение статистики на согласовании по заданным документам и значениям фильтров.
        /// </summary>
        /// <param name="sqlParams"></param>
        /// <returns></returns>
        private string GetAgrStatQuery(List<int> itemsIDs, out List<SqlParameter> sqlParams)
        {
            if (itemsIDs == null)
                throw new ArgumentNullException("itemsIDs");

            string query = String.Format("[UserID] = {0} AND [ListID] in ({1}) AND [ItemID] in ({2})", this.UserID, this.ListsQueryString, String.Join(",", itemsIDs.ConvertAll(x => x.ToString()).ToArray()));
            sqlParams = new List<SqlParameter>();

            if (this.PeriodStart != DateTime.MinValue)
            {
                SqlParameter param = new SqlParameter("startDate", System.Data.SqlDbType.DateTime);
                param.Value = this.PeriodStart;
                sqlParams.Add(param);
                query = query + String.Format(" AND ([DateEnd] is NULL OR [DateEnd] > @{0})", param.ParameterName);
            }

            if (this.PeriodEnd != DateTime.MinValue)
            {
                SqlParameter param = new SqlParameter("endDate", System.Data.SqlDbType.DateTime);
                param.Value = this.PeriodEnd;
                sqlParams.Add(param);
                query = query + String.Format(" AND [DateStart] < @{0}", param.ParameterName);
            }

            return query;
        }

        /// <summary>
        /// Возвращает ControlTimeOnAgrStageManager для узла.
        /// </summary>
        /// <param name="web">Узел.</param>
        /// <returns></returns>
        public ControlTimeOnAgrStageManager GetControlTimeManager(DBWeb web)
        {
            if (web == null)
                throw new ArgumentNullException("web");

            ControlTimeOnAgrStageManager manager = null;

            if (this.ControlTimeManagersDict.ContainsKey(web.ID))
                manager = this.ControlTimeManagersDict[web.ID];
            else
            {
                manager = new ControlTimeOnAgrStageManager(web);
                this.ControlTimeManagersDict.Add(web.ID, manager);
            }

            return manager;
        }


        #region RPCustomColumns

        [RPCustomColumn]
        public void GetUserName(RPTableCell tableCell)
        {
            tableCell.CreateRow().CreateCell().SetValue(this.User.Name, RPCellFormatType.Text);
        }

        [RPCustomColumn]
        public void GetUserDepartment(RPTableCell tableCell)
        {
            tableCell.CreateRow().CreateCell().SetValue(this.User.UserItem.GetStringValue(_Consts.Lists.Users.Fields.Department), RPCellFormatType.Text);
        }

        [RPCustomColumn]
        public void GetAgrStartDate(RPTableCell tableCell)
        {
            UserAgreementDelails agrDetails = tableCell.TableRow.DataRow as UserAgreementDelails;
            if (agrDetails.AgrStatList.Count == 0)
                tableCell.CreateRow().CreateCell();
            else
            {
                foreach (DMSAgrPersonStatistics agrStat in agrDetails.AgrStatList)
                {
                    RPCell cell = tableCell.CreateRow().CreateCell();
                    cell.SetValue(agrStat.DateStart, RPCellFormatType.DateTime, new RPCellFormatOptions() { ShowTime = true });
                }
            }
        }

        [RPCustomColumn]
        public void GetAgrLimitDate(RPTableCell tableCell)
        {
            UserAgreementDelails agrDetails = tableCell.TableRow.DataRow as UserAgreementDelails;
            if (agrDetails.AgrStatList.Count == 0)
                tableCell.CreateRow().CreateCell();
            else
            {
                foreach (DMSAgrPersonStatistics agrStat in agrDetails.AgrStatList)
                {
                    RPCell cell = tableCell.CreateRow().CreateCell();

                    if (agrDetails.ControlTimeInfoDict.ContainsKey(agrStat.Id))
                        cell.SetValue(agrDetails.ControlTimeInfoDict[agrStat.Id].LimitDate, RPCellFormatType.DateTime, new RPCellFormatOptions() { ShowTime = true });
                }
            }
        }

        [RPCustomColumn]
        public void GetAgrEndDate(RPTableCell tableCell)
        {
            UserAgreementDelails agrDetails = tableCell.TableRow.DataRow as UserAgreementDelails;
            if (agrDetails.AgrStatList.Count == 0)
                tableCell.CreateRow().CreateCell();
            else
            {
                foreach (DMSAgrPersonStatistics agrStat in agrDetails.AgrStatList)
                {
                    RPCell cell = tableCell.CreateRow().CreateCell();
                    cell.SetValue(agrStat.DateEnd, RPCellFormatType.DateTime, new RPCellFormatOptions() { ShowTime = true });
                }
            }
        }

        [RPCustomColumn]
        public void GetDelay(RPTableCell tableCell)
        {
            UserAgreementDelails agrDetails = tableCell.TableRow.DataRow as UserAgreementDelails;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrDetails.UserDelays.Count != 0)
                cell.SetValue(agrDetails.UserDelays.Sum(x => x.Delay), RPCellFormatType.Number);

        }

        #endregion
    }
}
