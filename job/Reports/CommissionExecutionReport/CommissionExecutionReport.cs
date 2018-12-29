using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
namespace WSSC.V4.DMS.OMK.ComplexReports
{
    /// <summary>
    /// Отчет по исполнению поручений - с проверкой доступа пользователя к документам 
    /// </summary>
    public class CommissionExecutionReportAccess : CommissionExecutionReport
    {
        public override bool CheckAccess
        {
            get
            {
                return true;
            }
        }
    }

    /// <summary>
    /// Отчет по исполенению поручений
    /// </summary>
    public class CommissionExecutionReport
    {
        public List<List<DataField>> CustomTableValue(ListDataFields reportTbl, List<DBItem> itemsToProcess, List<PFilterValue> filters)
        {
            DateTime start = DateTime.MinValue;
            DateTime end = DateTime.MinValue;
            var period = filters.Find(x => x.Filter != null &&
                                           x.Filter.DataType == typeof(DateTime) &&
                                           x.Filter.Name == _Consts.CommExecutionReport.Filters.Period);

            if (period != null && period.SingleValue != null)
            {
                start = period.SingleValue.DateStart;
                end = period.SingleValue.DateEnd;
            }

            //проверка что   значение фильтра "Отчетный период" установленно -если нет  - редирект на страницу с сообщением
            if (end == DateTime.MinValue || start == DateTime.MinValue)
                WebContext.Page.Response.Redirect(WebContext.CurrentWeb.Url + VersionProvider.ModulePath + "/Reports/CommissionExecutionReport/ReportWarningPage.html", true);

            List<int> authors = this.GetMultiLookupFilterIds(filters, _Consts.CommExecutionReport.Filters.Author);

            List<int> companies = this.GetMultiLookupFilterIds(filters, _Consts.CommExecutionReport.Filters.Company);
            List<int> fioIds = this.GetMultiLookupFilterIds(filters, _Consts.CommExecutionReport.Filters.Fio);
            List<int> protocolTypes = this.GetMultiLookupFilterIds(filters, _Consts.Lists.Commissions.Fields.ProtocolType);

            var hasFioFilterSet = (fioIds == null || fioIds.Count == 0) ? false : true;
            var showAll = false;
            if (hasFioFilterSet)
                showAll = true;

            CommissionsExecutionReportManager manager = new CommissionsExecutionReportManager(this.InstructionsList, start, end, companies, authors,protocolTypes, this.CheckAccess, showAll);

            List<List<DataField>> report = manager.GetReport(itemsToProcess);
            var count = report.Count-1;

            if (count <= _ReportConsts.Reports.InstructionReport.MaxLinesInReport && 
                itemsToProcess.Count > _ReportConsts.Reports.InstructionReport.MaxLinesInReport)
            {
                string message = string.Empty;
                reportTbl.ReportBuilder.DrawErrorMessage(message);
            }
            else if (count > _ReportConsts.Reports.InstructionReport.MaxLinesInReport)
            {
                string message = string.Format(
                    Translator.Translate("Выведены {0} строк. Всего в отчете {1} строк.   Чтобы просмотреть все строки перейдите по ссылке «Сохранить в Excel»",
                    /*0*/_ReportConsts.Reports.InstructionReport.TranslaterNamespace),
                    /*1*/_ReportConsts.Reports.InstructionReport.MaxLinesInReport, 
                    /*2*/count);
                reportTbl.ReportBuilder.DrawErrorMessage(message);
            } 
            return report;
        }

        List<int> GetMultiLookupFilterIds(List<PFilterValue> filters, string fieldName)
        {
            if (filters == null)
                throw new ArgumentNullException("filters");
            if (string.IsNullOrEmpty(fieldName))
                throw new ArgumentNullException("fieldName");
            PFilterValue filterValue = filters.Find(x => x.Filter != null && x.Filter.Name == fieldName);
            List<int> lookupIds = (filterValue != null && filterValue.MultiValue != null) ? filterValue.MultiValue.Select(x => x.LookupID).ToList() : null;
            return lookupIds;
        }

        /// <summary>
        /// Свойство, показывающее, что надо формировать отчет спроверкой доступа
        /// </summary>
        public virtual bool CheckAccess
        {
            get
            {
                return false;
            }
        }


        private bool __init_WebContext = false;
        private DBAppContext _WebContext;
        /// <summary>
        /// Контекст
        /// </summary>
        public DBAppContext WebContext
        {
            get
            {
                if (!__init_WebContext)
                {
                    _WebContext = DBAppContext.Current;
                    __init_WebContext = true;
                }
                return _WebContext;
            }
        }


        private bool __init_InstructionsList = false;
        private DBList _InstructionsList;
        /// <summary>
        /// Список поруений
        /// </summary>
        public DBList InstructionsList
        {
            get
            {
                if (!__init_InstructionsList)
                {
                    _InstructionsList = this.InstructionsWeb.GetList(_Consts.CommExecutionReport.Instructions.CommissionListName);
                    if (_InstructionsList == null)
                        throw new DBException.MissingList(this.InstructionsWeb, _Consts.CommExecutionReport.Instructions.CommissionListName);
                    __init_InstructionsList = true;
                }
                return _InstructionsList;
            }
        }

        private bool __init_InstructionsWeb = false;
        private DBWeb _InstructionsWeb;
        /// <summary>
        /// Узел поручений
        /// </summary>
        public DBWeb InstructionsWeb
        {
            get
            {
                if (!__init_InstructionsWeb)
                {
                    _InstructionsWeb = DBSite.Current.GetWeb(_Consts.CommExecutionReport.Instructions.CommissionWebUrl);
                    if (_InstructionsWeb == null)
                        throw new DBException.MissingWeb(DBSite.Current, _Consts.CommExecutionReport.Instructions.CommissionWebUrl);
                    __init_InstructionsWeb = true;
                }
                return _InstructionsWeb;
            }
        }
    }
}
