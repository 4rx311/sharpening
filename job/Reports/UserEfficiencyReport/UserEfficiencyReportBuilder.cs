using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Xml;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.SYS.Lib;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Fields.Text;
using WSSC.V4.SYS.Lib.Logging;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.Lib.DBObjects;
using WSSC.V4.SYS.Fields.Lookup;

namespace WSSC.V4.DMS.OMK
{
    /// <summary>
    /// Кастомный отчет по исполнительской дисциплине.
    /// </summary>
    public class UserEfficiencyReportBuilder : RPCustomBuilder
    {
        public UserEfficiencyReportBuilder(RPTableBuilder builder)
            : base(builder)
        { }

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

        private bool __init_PeriodFilter = false;
        private PFilterValue _PeriodFilter;
        /// <summary>
        /// Фильтр даты.
        /// </summary>
        private PFilterValue PeriodFilter
        {
            get
            {
                if (!__init_PeriodFilter)
                {
                    _PeriodFilter = this.Filters.FirstOrDefault(
                            filter => filter.DisplayName.Contains(_Consts.Reports.UserEfficiencyReport.PeriodFilterName));

                    if (_PeriodFilter == null)
                    {
                        throw new RPCustomException(new RPCustomExceptionData
                        {
                            AlertText = string.Format("Для формирования отчета необходимо указать значение в фильтре \"{0}\"", _Consts.Reports.UserEfficiencyReport.PeriodFilterName),
                            CloseWindow = true
                        });
                    }

                    __init_PeriodFilter = true;
                }
                return _PeriodFilter;
            }
        }

        private bool __init_DateStart = false;
        private DateTime _DateStart;
        /// <summary>
        /// 
        /// </summary>
        public DateTime DateStart
        {
            get
            {
                if (!__init_DateStart)
                {
                    if (this.PeriodFilter.SingleValue != null)
                        _DateStart = this.PeriodFilter.SingleValue.DateStart;
                    __init_DateStart = true;
                }
                return _DateStart;
            }
        }

        private bool __init_DateEnd = false;
        private DateTime _DateEnd;
        /// <summary>
        /// 
        /// </summary>
        public DateTime DateEnd
        {
            get
            {
                if (!__init_DateEnd)
                {
                    if (this.PeriodFilter.SingleValue != null)
                        _DateEnd = this.PeriodFilter.SingleValue.DateEnd;
                    __init_DateEnd = true;
                }
                return _DateEnd;
            }
        }
                
        private bool __init_Autor;
        private List<int> _Autor;
        private List<int> Autor
        {
            get
            {
                if (!__init_Autor)
                {
                    _Autor = new List<int>();

                    PFilterValue autorFilter = this.Filters.FirstOrDefault(
                            filter => filter.DisplayName.Contains(_Consts.Reports.UserEfficiencyReport.AuthorFilterName));

                    if (autorFilter != null) 
                    {
                        _Autor.AddRange(autorFilter.MultiValue.Select(i => i.LookupID));
                    }

                    __init_Autor = true;
                }
                return _Autor;
            }
        }
                
        private bool __init_Priority;
        private int? _Priority = null;
        private int? Priority
        {
            get
            {
                if (!__init_Priority)
                {
                    PFilterValue priorityFilter = this.Filters.FirstOrDefault(
                            filter => filter.DisplayName.Contains(_Consts.Reports.UserEfficiencyReport.PriorityFilterName));

                    if (priorityFilter != null)
                    {
                        _Priority = priorityFilter.SingleValue.LookupID;
                    }

                    __init_Priority = true;
                }
                return _Priority;
            }
        }

        private bool __init_ComissionsManager = false;
        private ComissionsDelayManager _ComissionsManager;
        /// <summary>
        /// 
        /// </summary>
        public ComissionsDelayManager ComissionsManager
        {
            get
            {
                if (!__init_ComissionsManager)
                {
                    _ComissionsManager = new ComissionsDelayManager(this.Site, this.Items.ToList(), this.DateStart, this.DateEnd, this.Autor, this.Priority);
                    __init_ComissionsManager = true;
                }
                return _ComissionsManager;
            }
        }

        private bool __init_DocumentsManager = false;
        private DocumentsDelayManager _DocumentsManager;
        /// <summary>
        /// 
        /// </summary>
        public DocumentsDelayManager DocumentsManager
        {
            get
            {
                if (!__init_DocumentsManager)
                {
                    _DocumentsManager = new DocumentsDelayManager(this.Site, this.Items.ToList(), this.DateStart, this.DateEnd);
                    __init_DocumentsManager = true;
                }
                return _DocumentsManager;
            }
        }

        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {   
            List<UserDataRow> source = new List<UserDataRow>();

            int counter = 0;
            foreach (DBItem item in this.Items)
            {
                UserDataRow row = new UserDataRow(item) { Number = ++counter };
                row.DocumentsInfo = this.DocumentsManager.GetUserInfo(item.ID);
                row.ComissionsInfo = this.ComissionsManager.GetUserInfo(item.ID);
                source.Add(row);
            }

            if (source.Count > 0){
                source.Add(new UserDataRow()
                {
                    DocumentsInfo = new UserDelaysInfo() 
                    {
                        Executed = source.Sum(s => s.DocumentsInfo.Executed),
                        InWork = source.Sum(s => s.DocumentsInfo.InWork),
                        Delayed = source.Sum(s => s.DocumentsInfo.Delayed),
                        DelayedHours = source.Sum(s => s.DocumentsInfo.DelayedHours),
                        SpentHours = source.Sum(s => s.DocumentsInfo.SpentHours)
                    },
                    ComissionsInfo = new UserDelaysInfo()
                    {
                        Executed = source.Sum(s => s.ComissionsInfo.Executed),
                        InWork = source.Sum(s => s.ComissionsInfo.InWork),
                        Delayed = source.Sum(s => s.ComissionsInfo.Delayed),
                        DelayedHours = source.Sum(s => s.ComissionsInfo.DelayedHours),
                        SpentHours = source.Sum(s => s.ComissionsInfo.SpentHours)
                    },
                });          
            }

            return source.Select(x => (IRPDataRow)x);
        }
                
        private List<string> _DocumentSubTitles;
        private List<string> DocumentSubTitles
        {
            get
            {
                if (_DocumentSubTitles == null)
                {
                    _DocumentSubTitles = new List<string>() 
                    {
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.Processed,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.InWork,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.Delayed,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.TotalDelay,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.AvgDelay, 
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.ProcessTime
                    };
                }
                return _DocumentSubTitles;
            }
        }

        
        private List<string> _ComissionSubTitles;
        private List<string> ComissionSubTitles
        {
            get
            {
                if (_ComissionSubTitles == null)
                {
                    _ComissionSubTitles = new List<string>()
                    {
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.Processed,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.InWork,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.Delayed,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.TotalDelay,
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.AvgDelay, 
                        _Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.ProcessTime
                    };
                }
                return _ComissionSubTitles;
            }
        }

        /// <summary>
        /// Получить заголовок для документов.
        /// </summary>        
        [RPCustomHeader]
        public void GetDocumentHeader(RPTableCell tableCell) 
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            RPRow headRow = tableCell.CreateRow();
            RPCell headCell = headRow.CreateCell(1, this.DocumentSubTitles.Count > 0 ? this.DocumentSubTitles.Count : 1);

            headCell.SetValue(_Consts.Reports.UserEfficiencyReport.ReportColumns.Documents.HeadTitle, RPCellFormatType.Text);

            if (this.DocumentSubTitles.Count > 0)
            {
                RPRow dependentRow = tableCell.CreateRow();
                foreach (string title in this.DocumentSubTitles)
                {
                    RPCell dependentCell = dependentRow.CreateCell();
                    dependentCell.SetValue(title, RPCellFormatType.Text);
                }
            }            
        }

        /// <summary>
        ///  Получить заголовок для поручений.
        /// </summary>        
        [RPCustomHeader]
        public void GetСomissionsHeader(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            RPRow headRow = tableCell.CreateRow();
            RPCell headCell = headRow.CreateCell(1, this.ComissionSubTitles.Count > 0 ? this.ComissionSubTitles.Count : 1);

            headCell.SetValue(_Consts.Reports.UserEfficiencyReport.ReportColumns.Commissions.HeadTitle, RPCellFormatType.Text);

            if (this.ComissionSubTitles.Count > 0)
            {
                RPRow dependentRow = tableCell.CreateRow();
                foreach (string title in this.ComissionSubTitles)
                {
                    RPCell dependentCell = dependentRow.CreateCell();
                    dependentCell.SetValue(title, RPCellFormatType.Text);
                }
            }            
        }

        /// <summary>
        /// Порядковый номер.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetNumber(RPTableCell tableCell) 
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            this.SetCellValue
                (
                    tableCell, (info, row) =>
                    {
                        RPCell nameCell = row.CreateCell();

                        if (!info.IsTotalRow)
                        {
                            nameCell.SetValue(info.Number, RPCellFormatType.Text);
                        }
                        else
                        {
                            nameCell.SetValue(string.Empty, RPCellFormatType.Text);
                        }
                    });
        }

        /// <summary>
        /// ФИО сотрудника.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetUserName(RPTableCell tableCell) 
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            this.SetCellValue
                (
                    tableCell, (info, row) =>
                    {
                        RPCell nameCell = row.CreateCell();

                        if (!info.IsTotalRow)
                        {
                            nameCell.SetValue(info.Item.GetStringValue(_Consts.Lists.Users.Fields.UserName), RPCellFormatType.Text);
                        }
                        else 
                        {
                            nameCell.SetValue(string.Empty, RPCellFormatType.Text);
                        }
                    });
        }

        /// <summary>
        /// Должность сотрудника.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetUserPost(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            this.SetCellValue
                (
                    tableCell, (info, row) => 
                    {
                        RPCell nameCell = row.CreateCell();
                        if (!info.IsTotalRow)
                        {
                            nameCell.SetValue(info.Item.GetStringValue(_Consts.Lists.Users.Fields.Position), RPCellFormatType.Text);
                        }
                        else 
                        {
                            nameCell.SetValue(_Consts.Reports.UserEfficiencyReport.ReportColumns.Total, RPCellFormatType.Text);
                        }
                    });
        }

        /// <summary>
        /// Кол-во обработанных документов.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetDocumentsInfo(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            this.SetCellValue
                (
                    tableCell,
                    (info, row) =>
                    {
                        //TODO: поля внутри кастомных полей наверное нужно сделать по настройке. 

                        RPCell executedCell = row.CreateCell();
                        executedCell.SetValue(info.DocumentsInfo.Executed, RPCellFormatType.Integer);

                        RPCell inWorkCell = row.CreateCell();
                        inWorkCell.SetValue(info.DocumentsInfo.InWork, RPCellFormatType.Integer);

                        RPCell delayedCell = row.CreateCell();
                        delayedCell.SetValue(info.DocumentsInfo.Delayed, RPCellFormatType.Integer);

                        RPCell delayedHoursCell = row.CreateCell();
                        delayedHoursCell.SetValue(info.DocumentsInfo.DelayedHours, RPCellFormatType.Number);

                        RPCell delayedAverageCell = row.CreateCell();
                        delayedAverageCell.SetValue(info.DocumentsInfo.DelayedHours / info.DocumentsInfo.Delayed, RPCellFormatType.Number);

                        RPCell executedAverageCell = row.CreateCell();
                        executedAverageCell.SetValue(info.DocumentsInfo.SpentHours / (info.DocumentsInfo.Executed + info.DocumentsInfo.InWork) , RPCellFormatType.Number);
                    }
                );
        }               

        /// <summary>
        /// Кол-во обработанных поручений.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetСomissionsInfo(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            this.SetCellValue
                (
                    tableCell,
                    (info, row) =>
                    {
                        //TODO: поля внутри кастомных полей наверное нужно сделать по настройке. 

                        RPCell executedCell = row.CreateCell();
                        executedCell.SetValue(info.ComissionsInfo.Executed, RPCellFormatType.Integer);

                        RPCell inWorkCell = row.CreateCell();
                        inWorkCell.SetValue(info.ComissionsInfo.InWork, RPCellFormatType.Integer);

                        RPCell delayedCell = row.CreateCell();
                        delayedCell.SetValue(info.ComissionsInfo.Delayed, RPCellFormatType.Integer);

                        RPCell delayedHoursCell = row.CreateCell();
                        delayedHoursCell.SetValue(info.ComissionsInfo.DelayedHours, RPCellFormatType.Number);

                        RPCell delayedAverageCell = row.CreateCell();
                        delayedAverageCell.SetValue(info.ComissionsInfo.DelayedHours / info.ComissionsInfo.Delayed, RPCellFormatType.Number);

                        RPCell executedAverageCell = row.CreateCell();
                        executedAverageCell.SetValue(info.ComissionsInfo.SpentHours / (info.ComissionsInfo.Executed + info.ComissionsInfo.InWork), RPCellFormatType.Number);
                    }
                );
        }

        /// <summary>
        /// Оценка испонительской дисциплины.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetUserRating(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            this.SetCellValue
                (
                    tableCell, (info, row) =>
                    {
                        RPCell nameCell = row.CreateCell();
                        nameCell.SetValue(info.GetRating(), RPCellFormatType.Text);
                    });
        }


        /// <summary>
        /// Устанавливает значение в ячейку.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        /// <param name="setInfo">Метод установки значения.</param>
        private void SetCellValue(RPTableCell tableCell, Action<UserDataRow, RPRow> setInfo)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            if (setInfo == null) throw new ArgumentNullException("setInfo");

            RPRow row = tableCell.CreateRow();            

            UserDataRow info = tableCell.TableRow.DataRow as UserDataRow;
            if (info == null)
                throw new Exception("DirectionInfo info as IRPDataRow is null");

            setInfo(info, row);
        }
    }
}
