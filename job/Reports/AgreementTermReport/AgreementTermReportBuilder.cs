using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib;
using WSSC.V4.SYS.Lib.Data;
using WSSC.V4.SYS.Fields.Lookup;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет класс для построения отчета по срокам согласования.
    /// </summary>
    public class AgreementTermReportBuilder : AgrReportBuilder
    {
        public AgreementTermReportBuilder(RPTableBuilder builder)
            : base(builder)
        { }

        private bool __init_DateFilter;
        private PFilterValue _DateFilter;
        /// <summary>
        /// Фильтр даты.
        /// </summary>
        private PFilterValue DateFilter
        {
            get
            {
                if (!__init_DateFilter)
                {
                    if (this.PublishingQuery.FilterValues != null)
                    {
                        _DateFilter = this.PublishingQuery.FilterValues.FirstOrDefault(filter => filter.DisplayName.Contains(_Consts.Reports.AgreementTermReport.Filters.Period));
                    }
                    __init_DateFilter = true;
                }
                return _DateFilter;
            }
        }

        private bool __init_PeriodStart = false;
        private DateTime _PeriodStart;
        /// <summary>
        /// Дата начала периода.
        /// </summary>
        public override DateTime PeriodStart
        {
            get
            {
                if (!__init_PeriodStart)
                {
                    if (this.DateFilter != null && this.DateFilter.SingleValue != null)
                        _PeriodStart = this.DateFilter.SingleValue.DateStart;
                    __init_PeriodStart = true;
                }
                return _PeriodStart;
            }
        }

        private bool __init_PeriodEnd = false;
        private DateTime _PeriodEnd;
        /// <summary>
        /// Дата окончания периода.
        /// </summary>
        public override DateTime PeriodEnd
        {
            get
            {
                if (!__init_PeriodEnd)
                {
                    if (this.DateFilter != null && this.DateFilter.SingleValue != null)
                        _PeriodEnd = this.DateFilter.SingleValue.DateEnd;
                    __init_PeriodEnd = true;
                }
                return _PeriodEnd;
            }
        }

        private bool __init_CompanyField = false;
        private DBFieldLookupSingle _CompanyField;
        /// <summary>
        /// Поле подстановки на компанию списка пользователей.
        /// </summary>
        public DBFieldLookupSingle CompanyField
        {
            get
            {
                if (!__init_CompanyField)
                {
                    DBField companyField = this.Site.UsersList.GetField(_Consts.Lists.Users.Fields.Company, true);
                    if (!companyField.IsTypeOfLookupSingle())
                        throw new Exception(String.Format("Поле [{0}] списка [{1}] ожидается единичной подстановкой.", _Consts.Lists.Users.Fields.Company, this.Site.UsersList.Name));

                    _CompanyField = companyField.As<DBFieldLookupSingle>();
                    _CompanyField.ValueLoadingType = DBFieldValueIOType.Directly;
                    __init_CompanyField = true;
                }
                return _CompanyField;
            }
        }

        private bool __init_DocsCountByCompany = false;
        private Dictionary<int, int> _DocsCountByCompany;
        /// <summary>
        /// Словарь кол-ва документов по компании.
        /// </summary>
        public Dictionary<int, int> DocsCountByCompany
        {
            get
            {
                if (!__init_DocsCountByCompany)
                {
                    _DocsCountByCompany = new Dictionary<int, int>();
                    __init_DocsCountByCompany = true;
                }
                return _DocsCountByCompany;
            }
        }

        /// <summary>
        /// Возвращает кол-во документов на согласовании в заданный период, у пользователей, относящихся к определенной компании.
        /// </summary>
        /// <param name="company">Элемент списка компаний.</param>
        /// <returns></returns>
        private int GetDocsCountByCompany(DBItem company)
        {
            if (company == null)
                throw new ArgumentNullException("company");

            int docsCount = 0;

            if (this.DocsCountByCompany.ContainsKey(company.ID))
                docsCount = this.DocsCountByCompany[company.ID];
            else
            {
                List<int> companyUsers = this.GetUsersByCompany(company);
                Dictionary<int, List<int>> usersDocsDict = this.GetDocsByUsersIDs(companyUsers);
                docsCount = usersDocsDict.Sum(x => x.Value.Count);
                this.DocsCountByCompany.Add(company.ID, docsCount);
            }

            return docsCount;
        }

        /// <summary>
        /// Возвращает кол-во пользователей, относящихся к определенной компании.
        /// </summary>
        /// <param name="company">Элемент списка компаний.</param>
        /// <returns></returns>
        private List<int> GetUsersByCompany(DBItem company)
        {
            if (company == null)
                throw new ArgumentNullException("company");

            string query = String.Format("[{0}] = {1}", this.CompanyField.Name, company.ID);
            DBItemCollection userItems = this.Site.UsersList.GetItems(query);

            if (userItems != null)
                return userItems.Select(x => x.ID).ToList();
            else
                return new List<int>();
        }

        /// <summary>
        /// Возвращает кол-во документов на согласовании в заданный период, у определенных пользователей.
        /// </summary>
        /// <param name="usersIDs">Список идентификаторов пользователей.</param>
        /// <returns></returns>
        private Dictionary<int, List<int>> GetDocsByUsersIDs(List<int> usersIDs)
        {
            if (usersIDs == null)
                throw new ArgumentNullException("usersIDs");

            Dictionary<int, List<int>> result = new Dictionary<int, List<int>>();

            List<List<int>> usersIDsCollections = usersIDs.Slice(1000);
            foreach (List<int> userIDs in usersIDsCollections)
            {
                List<SqlParameter> sqlParams = null;
                string periodCondition = this.GetDelayStatCondition(out sqlParams);

                string query = String.Format("[UserID] in ({0}) AND [ListID] in ({1}) AND [ControlTimeType] = 'AgrStage'", String.Join(",", userIDs.ConvertAll(x => x.ToString()).ToArray()), this.ListsQueryString);
                if (!String.IsNullOrEmpty(periodCondition))
                    query = query + " AND " + periodCondition;

                List<UserDocumentDelay> delaysPart = this.DelayAdapter.GetObjects(query, "", -1, sqlParams.ToArray());
                Dictionary<int, List<int>> idsDict = delaysPart.GroupBy(x => x.ListID).ToDictionary(gr => gr.Key, val => val.Select(v => v.ItemID).Distinct().ToList());
                foreach (KeyValuePair<int, List<int>> pair in idsDict)
                {
                    if (!result.ContainsKey(pair.Key))
                        result.Add(pair.Key, pair.Value);
                    else
                    {
                        result[pair.Key] = result[pair.Key].Concat<int>(pair.Value).Distinct().ToList();
                    }
                }
            }

            return result;
        }

        /*         
        private bool __init_AllDocsCount = false;
        private int _AllDocsCount;
        /// <summary>
        /// Общее кол-во договорных документов по компании.
        /// </summary>
        public int AllDocsCount
        {
            get
            {
                if (!__init_AllDocsCount)
                {
                    List<SqlParameter> sqlParams = null;
                    string condition = GetDelayStatCondition(out sqlParams);

                    string query = String.Format(@"SELECT 1
  FROM {0}
  WHERE [ListID] in ({1}) {2}
  group by ListID, ItemID",
                          this.DelayAdapter.TableInfo.AggregatedName,
                          this.ListsQueryString,
                          !String.IsNullOrEmpty(condition) ? String.Format(" AND {0}", condition) : String.Empty);

                    DBConnection connection = DBConnectionContext.Current.GetConnection(this.Site.SiteConnectionString);
                    DataTable table = connection.DataAdapter.GetDataTable(query, sqlParams.ToArray());

                    if (table != null)
                        _AllDocsCount = table.Rows.Count;
                    __init_AllDocsCount = true;
                }
                return _AllDocsCount;
            }
        }
        */

        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            List<UserAgreementInfo> result = new List<UserAgreementInfo>();
            List<UserDocumentDelay> allDelays = new List<UserDocumentDelay>();

            //формируем словарь всей найденной статистике по просрочкам
            List<int> userIDsList = this.Items.Select(y => y.ID).ToList();

            List<List<int>> itemsIDsCollections = userIDsList.Slice(1000);
            foreach (List<int> userIDs in itemsIDsCollections)
            {
                List<SqlParameter> sqlParams = null;
                List<SqlParameter> agrStatParams = null;

                string periodCondition = this.GetDelayStatCondition(out sqlParams);

                string query = String.Format("[UserID] in ({0}) AND [ListID] in ({1}) AND [ControlTimeType] = 'AgrStage'", String.Join(",", userIDs.ConvertAll(x => x.ToString()).ToArray()), this.ListsQueryString);
                if (!String.IsNullOrEmpty(periodCondition))
                    query = query + " AND " + periodCondition;

                List<UserDocumentDelay> delaysPart = this.DelayAdapter.GetObjects(query, "", -1, sqlParams.ToArray());

                //получаем статистику на согласовании
                string agrStatQuery = this.GetAgrCondition(userIDs, out agrStatParams);
                List<DMSAgrPersonStatistics> agrStat = this.AgrStatAdapter.GetObjects(agrStatQuery, "", -1, agrStatParams.ToArray());
                Dictionary<int, List<int>> agrDocsDict = agrStat.GroupBy(x => x.UserID).ToDictionary(gr => gr.Key, v => v.Select(val => val.ItemID).ToList());

                //проверка на то, что пользователь действительно являлся согласующим.
                delaysPart = delaysPart.Where(x => agrDocsDict.ContainsKey(x.UserID) && agrDocsDict[x.UserID].Contains(x.ItemID)).ToList();

                allDelays.AddRange(delaysPart);
            }

            //формируем данные для строк отчета
            Dictionary<int, List<UserDocumentDelay>> delaysDict = allDelays.GroupBy(x => x.UserID).ToDictionary(gr => gr.Key, val => val.ToList());
            foreach (DBItem item in this.Items)
            {
                UserAgreementInfo info = new UserAgreementInfo(item, this);
                if (delaysDict.ContainsKey(item.ID))
                {
                    foreach (UserDocumentDelay delay in delaysDict[item.ID])
                        info.DelaysCollection.AddDelay(delay);
                }

                result.Add(info);
            }

            return result.Cast<IRPDataRow>();
        }

        /// <summary>
        ///  Строит запрос на получение статистики просрочки по заданным документам и значениям фильтров.
        /// </summary>
        /// <param name="sqlParams">Sql-параметры запроса.</param>
        /// <returns></returns>
        private string GetDelayStatCondition(out List<SqlParameter> sqlParams)
        {
            string condition = String.Empty;
            sqlParams = new List<SqlParameter>();

            //добавляем условия по дате начала и окончания периода
            if (this.PeriodStart != DateTime.MinValue)
            {
                SqlParameter startDateParam = new SqlParameter("startDate", System.Data.SqlDbType.DateTime);
                startDateParam.Value = this.PeriodStart;
                sqlParams.Add(startDateParam);
                condition = String.Format("([EndTime] is NULL OR [EndTime] > @{0})", startDateParam.ParameterName);
            }

            bool hasEndDate = this.PeriodEnd != DateTime.MinValue;
            if (hasEndDate)
            {
                SqlParameter endDateParam = new SqlParameter("endDate", System.Data.SqlDbType.DateTime);
                endDateParam.Value = this.PeriodEnd;
                sqlParams.Add(endDateParam);
                string query = String.Format("[StartTime] < @{0}", endDateParam.ParameterName);
                if (!String.IsNullOrEmpty(condition))
                    condition = String.Format("{0} AND {1}", condition, query);
                else
                    condition = query;
            }

            return condition;
        }

        /// <summary>
        /// Строит запрос на получение статистики на согласовании по заданным документам и значениям фильтров.
        /// </summary>
        /// <param name="usersIDs">Идентификаторы пользователей.</param>
        /// <param name="sqlParams">Sql-параметры запроса.</param>
        /// <returns></returns>
        private string GetAgrCondition(List<int> usersIDs, out List<SqlParameter> sqlParams)
        {
            if (usersIDs == null)
                throw new ArgumentNullException("usersIDs");

            string query = String.Format("[UserID] in ({0}) AND [ListID] in ({1}) AND [RoleType] = 'AgrRole'", String.Join(",", usersIDs.ConvertAll(x => x.ToString()).ToArray()), this.ListsQueryString);
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


        #region RPCustomColumns

        [RPCustomColumn]
        public void AllPersonDocs(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.All > 0)
            {
                RPLinkCellValue value = cell.CreateLinkValue();
                RPLink link = value.CreateLink();
                link.Target = "_blank";

                link.Text = agrInfo.All.ToString();
                link.Url = this.GetDetalizationLink(agrInfo.Item.ID, AgrTermReportColumn.All);

                value.AddLink(link);
                cell.SetValue(value);
            }
        }

        [RPCustomColumn]
        public void AllDocs(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            DBItem company = this.CompanyField.GetLookupItem(agrInfo.Item);
            if (company != null)
                cell.SetValue(this.GetDocsCountByCompany(company), RPCellFormatType.Integer);
        }

        [RPCustomColumn]
        public void InWorkDocs(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.InWork > 0)
            {
                RPLinkCellValue value = cell.CreateLinkValue();
                RPLink link = value.CreateLink();
                link.Target = "_blank";

                link.Text = agrInfo.InWork.ToString();
                link.Url = this.GetDetalizationLink(agrInfo.Item.ID, AgrTermReportColumn.InWork);

                value.AddLink(link);
                cell.SetValue(value);
            }
        }

        [RPCustomColumn]
        public void ProcessedDocs(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.Processed > 0)
            {
                RPLinkCellValue value = cell.CreateLinkValue();
                RPLink link = value.CreateLink();
                link.Target = "_blank";

                link.Text = agrInfo.Processed.ToString();
                link.Url = this.GetDetalizationLink(agrInfo.Item.ID, AgrTermReportColumn.Processed);

                value.AddLink(link);
                cell.SetValue(value);
            }
        }

        [RPCustomColumn]
        public void ProcessedOnTimeDocs(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.ProcessedOnTime > 0)
            {
                RPLinkCellValue value = cell.CreateLinkValue();
                RPLink link = value.CreateLink();
                link.Target = "_blank";

                link.Text = agrInfo.ProcessedOnTime.ToString();
                link.Url = this.GetDetalizationLink(agrInfo.Item.ID, AgrTermReportColumn.ProcessedOnTime);

                value.AddLink(link);
                cell.SetValue(value);
            }
        }

        [RPCustomColumn]
        public void DelayedHours(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.DelaysCollection.TotalDelay > 0)
            {
                cell.SetValue(agrInfo.DelaysCollection.TotalDelay, RPCellFormatType.Number);
            }
        }

        [RPCustomColumn]
        public void DelayedDocs(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.Delayed > 0)
            {
                RPLinkCellValue value = cell.CreateLinkValue();
                RPLink link = value.CreateLink();
                link.Target = "_blank";

                link.Text = agrInfo.Delayed.ToString();
                link.Url = this.GetDetalizationLink(agrInfo.Item.ID, AgrTermReportColumn.Delayed);

                value.AddLink(link);
                cell.SetValue(value);
            }
        }

        [RPCustomColumn]
        public void OnTimePercent(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.All > 0)
            {
                cell.SetValue((double)agrInfo.ProcessedOnTime / agrInfo.All * 100, RPCellFormatType.Number);
            }
        }

        [RPCustomColumn]
        public void DelayedPercent(RPTableCell tableCell)
        {
            UserAgreementInfo agrInfo = tableCell.TableRow.DataRow as UserAgreementInfo;
            RPCell cell = tableCell.CreateRow().CreateCell();

            if (agrInfo.All > 0)
            {
                cell.SetValue((double)agrInfo.Delayed / agrInfo.All * 100, RPCellFormatType.Number);
            }
        }

        private string GetDetalizationLink(int userID, AgrTermReportColumn column)
        {
            return String.Format("{4}/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/Reports/AgreementTermReport/AgreementTermDetalization.aspx?userID={0}&dateStart={1}&dateEnd={2}&columnID={3}",
                userID,
                this.PeriodStart.ToString("ddMMyyyy"),
                this.PeriodEnd.ToString("ddMMyyyy"),
                (int)column,
                this.Site.Url);
        }

        #endregion
    }
}
