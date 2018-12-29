using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Data;
using WSSC.V4.SYS.Lib;
using Cols = WSSC.V4.DMS.OMK._Consts.Reports.CommissionsExecutionReport.Columns;
using System.Web;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport
{
    /// <summary>
    /// Отчёт по исполнению поручений.
    /// </summary>
    public class CommissionExecutionReport : CommissionReport, IReportFilterConditions
    {
        public CommissionExecutionReport(RPTableBuilder builder)
            : base(builder)
        {
        }

        #region PrivateStuff

        private bool __init_Columns;
        private Columns _Columns;
        /// <summary>
        /// Столбцы отчёта.
        /// </summary>
        public override Columns Columns
        {
            get
            {
                if (!__init_Columns)
                {
                    _Columns = new Columns(base.CommissionReportSettings, this.DBInfo, this);
                    __init_Columns = true;
                }
                return _Columns;
            }
        }

        /// <summary>
        /// Ссылка на строку с детализацией
        /// </summary>
        protected virtual string DetalizationLink
        {
            get
            {
                return "/_layouts/WSS/WSSC.V4.DMS.OMK/Reports/CommissionsExecutionReport/Detalization.aspx?user={0}&start={1}&end={2}&colType={3}";
            }
        }

        private bool __init_AuthorFilter;
        private string _AuthorFilter;
        /// <summary>
        /// Условие на автора поручений из фильтра.
        /// </summary>
        public string AuthorFilter
        {
            get
            {
                if (!__init_AuthorFilter)
                {
                    _AuthorFilter = this.GetCondition(_Consts.CommExecutionReport.Filters.Author, _Consts.CommExecutionReport.Instructions.Author);
                    __init_AuthorFilter = true;
                }
                return _AuthorFilter;
            }
        }

        private bool __init_CompaniesFilter;
        private string _CompaniesFilter;
        /// <summary>
        /// Условие на компании из фильтра.
        /// </summary>
        public string CompanyFilter
        {
            get
            {
                if (!__init_CompaniesFilter)
                {
                    _CompaniesFilter = this.GetCondition(_Consts.CommExecutionReport.Filters.Company, _Consts.CommExecutionReport.Instructions.Company);
                    __init_CompaniesFilter = true;
                }
                return _CompaniesFilter;
            }
        }

        private bool __init_ProtocolTypeFilter;
        private string _ProtocolTypeFilter;
        /// <summary>
        /// Условие на типы протоколов из фильтра.
        /// </summary>
        public string ProtocolTypeFilter
        {
            get
            {
                if (!__init_ProtocolTypeFilter)
                {
                    _ProtocolTypeFilter = this.GetCondition(_Consts.Lists.Commissions.Fields.ProtocolType,
                                                       _Consts.Lists.Commissions.Fields.ProtocolType);
                    __init_ProtocolTypeFilter = true;
                }
                return _ProtocolTypeFilter;
            }
        }

        public virtual string PriorityFilter { get { return String.Empty; } }

        /// <summary>
        /// Возвращает условие по фильтру для поля.
        /// </summary>
        /// <param name="filterName">Название фильтра.</param>
        /// <param name="fieldName">Название поля.</param>
        /// <returns></returns>
        protected string GetCondition(string filterName, string fieldName)
        {
            if (String.IsNullOrEmpty(filterName))
                throw new ArgumentNullException("filterName");
            if (String.IsNullOrEmpty(fieldName))
                throw new ArgumentNullException("fieldName");

            string condition = String.Empty;
            List<int> ids = this.GetMultiLookupFilterIds(filterName);
            if (ids != null && ids.Count > 0)
            {
                condition = " [" + fieldName + "] IN (" + String.Join(",", ids.Select(x => x.ToString()).ToArray()) +
                                    ")";
            }
            return condition;
        }

        /// <summary>
        /// Возвращает список ID для фильтра мн. подстановки.
        /// </summary>
        /// <param name="filterName">Название фильтра.</param>
        /// <returns></returns>
        private List<int> GetMultiLookupFilterIds(string filterName)
        {
            if (string.IsNullOrEmpty(filterName))
                throw new ArgumentNullException("filterName");

            PFilterValue filterValue = this.Filters.Find(x => x.Filter != null && x.Filter.Name == filterName);
            List<int> lookupIds = (filterValue != null && filterValue.MultiValue != null) ? filterValue.MultiValue.Select(x => x.LookupID).ToList() : null;
            return lookupIds;
        }

        private bool __init_StartDate;
        private DateTime _StartDate;
        /// <summary>
        /// Дата начала.
        /// </summary>
        internal DateTime StartDate
        {
            get
            {
                if (!__init_StartDate)
                {
                    bool toRedirect = false;
                    try
                    {
                        _StartDate = this.DateFilter.SingleValue.DateStart;
                        if (_StartDate == DateTime.MinValue)
                            toRedirect = true;
                    }
                    catch
                    {
                        toRedirect = true;
                    }
                    finally
                    {
                        if (toRedirect)
                            throw new RPCustomException(new RPCustomExceptionData
                            {
                                AlertText = "Для формирования отчета необходимо указать значение в фильтре отчетный период",
                                CloseWindow = true
                            });
                    }
                    __init_StartDate = true;
                }
                return _StartDate;
            }
        }

        private bool __init_EndDate;
        private DateTime _EndDate;
        /// <summary>
        /// Дата окончания.
        /// </summary>
        internal DateTime EndDate
        {
            get
            {
                if (!__init_EndDate)
                {
                    bool toRedirect = false;
                    try
                    {
                        _EndDate = this.DateFilter.SingleValue.DateEnd;
                        if (_EndDate == DateTime.MinValue)
                            toRedirect = true;
                    }
                    catch
                    {
                        toRedirect = true;
                    }
                    finally
                    {
                        if (toRedirect)
                            throw new RPCustomException(new RPCustomExceptionData
                            {
                                AlertText = "Для формирования отчета необходимо указать значение в фильтре отчетный период",
                                CloseWindow = true
                            });
                    }
                    __init_EndDate = true;
                }
                return _EndDate;
            }
        }

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
                    _DateFilter = this.Filters.FirstOrDefault(
                            filter => filter.DisplayName.Contains(_Consts.CommExecutionReport.Filters.Period));
                    if (_DateFilter == null || _DateFilter.SingleValue == null)
                        throw new Exception(String.Format("Фильтр '{0}' не задан.",
                                                          _Consts.CommExecutionReport.Filters.Period));

                    __init_DateFilter = true;
                }
                return _DateFilter;
            }
        }

        private bool __init_Filters;
        private List<PFilterValue> _Filters;
        /// <summary>
        /// Фильтры.
        /// </summary>
        private List<PFilterValue> Filters
        {
            get
            {
                if (!__init_Filters)
                {
                    _Filters = this.PublishingQuery.FilterValues;
                    if (_Filters == null)
                        throw new Exception("Фильтры не заданы.");

                    __init_Filters = true;
                }
                return _Filters;
            }
        }

        private bool __init_CurrentUserID;
        private int _CurrentUserID;
        /// <summary>
        /// ID текущего пользователя.
        /// </summary>
        internal int CurrentUserID
        {
            get
            {
                if (!__init_CurrentUserID)
                {
                    if (this.Site.CurrentUser == null)
                        throw new Exception("CurrentUser is null");

                    _CurrentUserID = this.Site.CurrentUser.ID;

                    __init_CurrentUserID = true;
                }
                return _CurrentUserID;
            }
        }

        private bool __init_DBInfo;
        private DBInfo _DBInfo;
        /// <summary>
        /// Информация о схеме сайта и процесса.
        /// </summary>
        internal DBInfo DBInfo
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
        /// Возвращает коллекцию строк данных, исользуемых в качестве источника данных при построении отчёта.
        /// </summary>
        /// <returns/>
        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            string idStr = null;
            if (this.Items.Count <= 100) //<=100 исполнителей
            {
                idStr = String.Join(",", this.Items.Select(x => x.ID.ToString()).ToArray());
            }

            DataTable table = this.DBInfo.GetDataTable(this.Columns, idStr, this.StartDate, this.EndDate, this.CommissionReportSettings.CheckAccess);
            if (table != null)
            {
                HashSet<int> identitiesForOutput = new HashSet<int>(this.Items.Select(x => x.ID));
                foreach (DataRow row in table.Rows)
                {
                    int userID = this.DBInfo.GetInteger(row, "Исполнитель");
                    if (userID == 0) continue;

                    if (!identitiesForOutput.Contains(userID)) continue;

                    UserInfo ui = new UserInfo(userID, row, this);

                    yield return ui;
                }
            }
        }

        #endregion

        #region Headers

        [RPCustomHeader]
        public void SetColumnNumber(RPTableCell tableCell)
        {
            RPCell cell1 = tableCell.CreateRow().CreateCell();
            cell1.SetValue(tableCell.Column.Name, RPCellFormatType.Text);
            RPCell cell2 = tableCell.CreateRow().CreateCell();
            int index = tableCell.Column.Index + 1;
            cell2.SetValue(index, RPCellFormatType.Integer);
        }

        #endregion

        #region Columns

        [RPCustomColumn]
        public void FIO(RPTableCell tableCell)
        {
            UserInfo ui = this.GetUI(tableCell);
            this.SetText(tableCell, ui == null ? null : ui.FIO);
        }

        [RPCustomColumn]
        public void Post(RPTableCell tableCell)
        {
            UserInfo ui = this.GetUI(tableCell);
            this.SetText(tableCell, ui == null ? null : ui.Post);
        }

        [RPCustomColumn]
        public void TotalAtWork(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.TotalCommissions);
        }

        [RPCustomColumn]
        public void NotYet(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.NotYet);
        }
        [RPCustomColumn]
        public void TotalCompleted(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.TotalCompleted);
        }
        [RPCustomColumn]
        public void CompletedInFirstTime(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.CompletedInFirstTime);
        }
        [RPCustomColumn]
        public void CompletedCorrected(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.CompletedCorrected);
        }
        [RPCustomColumn]
        public void CompletedNotInFirst(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.CompletedNotInFirstTime);
        }
        [RPCustomColumn]
        public void CompletedNotInCorrected(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.CompletedIncorrect);
        }
        [RPCustomColumn]
        public void OnExecutionExpired(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.OnExecutionExpired);
        }
        [RPCustomColumn]
        public void OnExecutionCorrected(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.OnExecutionCorrected);
        }

        [RPCustomColumn]
        public void TotalOut(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.TotalOut);
        }

        [RPCustomColumn]
        public void Controller(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.Controller);
        }

        [RPCustomColumn]
        public void CompletedInTimePercent(RPTableCell tableCell)
        {
            RPCell cell = tableCell.CreateRow().CreateCell();
            UserInfo ui = this.GetUI(tableCell);
            if (ui == null)
                return;

            int a = (int)ui.Values[ColumnType.CompletedInFirstTime];
            int b = (int)ui.Values[ColumnType.CompletedCorrected];
            int c = (int)ui.Values[ColumnType.TotalOut];
            int d = (int)ui.Values[ColumnType.NotYet];

            int value = 0;

            if (c - d != 0)
                value = (int)Math.Round((Convert.ToDouble(a) + b) / (c - d) * 100, 0);

            cell.SetValue(value, RPCellFormatType.Integer);
        }

        [RPCustomColumn]
        public void CompletedJustInTimePercent(RPTableCell tableCell)
        {
            RPCell cell = tableCell.CreateRow().CreateCell();
            UserInfo ui = this.GetUI(tableCell);
            if (ui == null)
                return;

            int a = (int)ui.Values[ColumnType.CompletedInFirstTime];
            int c = (int)ui.Values[ColumnType.TotalOut];
            int d = (int)ui.Values[ColumnType.NotYet];

            int value = 0;

            if (c - d != 0)
                value = (int)Math.Round(Convert.ToDouble(a) / (c - d) * 100, 0);

            cell.SetValue(value, RPCellFormatType.Integer);
        }

        [RPCustomColumn]
        public void CompletedPercent(RPTableCell tableCell)
        {
            RPCell cell = tableCell.CreateRow().CreateCell();
            UserInfo ui = this.GetUI(tableCell);
            if (ui == null)
                return;

            int e = (int)ui.Values[ColumnType.TotalCompleted];
            int c = (int)ui.Values[ColumnType.TotalOut];
            int d = (int)ui.Values[ColumnType.NotYet];

            int value = 0;

            if (c - d != 0)
                value = (int)Math.Round(Convert.ToDouble(e) / (c - d) * 100, 0);

            cell.SetValue(value, RPCellFormatType.Integer);
        }
        #endregion

        #region Helper Methods

        internal UserInfo GetUI(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            return tableCell.TableRow.DataRow as UserInfo;

            /*DBItem item = tableCell.TableRow.Item;
            UserInfo info = null;
            if (item != null && this.Infos.ContainsKey(item.ID))
                info = this.Infos[item.ID];

            return info;*/
        }

        private void SetText(RPTableCell tableCell, string text)
        {
            RPCell cell = tableCell.CreateRow().CreateCell();
            cell.SetValue(text, RPCellFormatType.Text);
        }

        /// <summary>
        /// Создаёт ячейку. Если значение в ячейке больше нуля, то это будет ссылка на детализацию/странуцу ошибки. Если 0, то это будет текст
        /// </summary>
        /// <param name="tableCell">Ячейка</param>
        /// <param name="key">Название колонки</param>
        protected void SetLinkToDetalize(RPTableCell tableCell, ColumnType type)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            UserInfo ui = this.GetUI(tableCell);

            string text = ui == null ? null : ui.Values[type].ToString();
            int i;
            if (!String.IsNullOrEmpty(text) && Int32.TryParse(text, out i) && i > 0)
            {
                //Есть значение - начинаем строить запрос
                StringBuilder queryBuilder = new StringBuilder();
                queryBuilder.Append(this.Site.Url);

                queryBuilder.Append(String.Format(
                        this.DetalizationLink,
                        ui.UserID,
                        this.StartDate.ToString("ddMMyyyy"),
                        this.EndDate.ToString("ddMMyyyy"),
                        (int)type));

                List<int> ids;
                if ((ids = this.GetMultiLookupFilterIds(_Consts.CommExecutionReport.Filters.Author)) != null)
                {
                    queryBuilder.Append("&author=" + HttpUtility.UrlEncode(String.Join(" ", ids.Select(id => Convert.ToString(id, 16)).ToArray())));
                }
                if ((ids = this.GetMultiLookupFilterIds(_Consts.Lists.Commissions.Fields.ProtocolType)) != null)
                {
                    queryBuilder.Append("&type=" + HttpUtility.UrlEncode(String.Join(" ", ids.Select(id => Convert.ToString(id, 16)).ToArray())));
                }
                if ((ids = this.GetMultiLookupFilterIds(_Consts.CommExecutionReport.Filters.Company)) != null)
                {
                    queryBuilder.Append("&company=" + HttpUtility.UrlEncode(String.Join(" ", ids.Select(id => Convert.ToString(id, 16)).ToArray())));
                }
                if (!String.IsNullOrEmpty(this.PriorityFilter) && ((ids = this.GetMultiLookupFilterIds("Приоритет")) != null))
                {
                    queryBuilder.Append("&priority=" + HttpUtility.UrlEncode(String.Join(" ", ids.Select(id => Convert.ToString(id, 16)).ToArray())));
                }

                //Проверяем максимальную длину запроса
                string query = (queryBuilder.Length > 2048 && this.AppContext.BrowserIs.IE)
                    ? this.Site.Url + "/_layouts/WSS/WSSC.V4.DMS.OMK/Reports/CommissionsExecutionReport/FiltersOverflownPage.html" : queryBuilder.ToString();
                RPCell cell = tableCell.CreateRow().CreateCell();
                RPLinkCellValue linkValue = cell.CreateLinkValue();
                RPLink link = linkValue.CreateLink();
                link.Target = "_blank";
                link.Text = text;
                link.Url = query;
                linkValue.AddLink(link);
                cell.SetValue(linkValue);
            }
            else
            {
                this.SetText(tableCell, text);
            }
        }

        #endregion
    }
}
