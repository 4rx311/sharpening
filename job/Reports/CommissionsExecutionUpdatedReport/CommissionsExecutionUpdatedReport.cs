using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport.DelaysCounting;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.Lib.Logging;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport
{
    /// <summary>
    /// Обновленный отчет по исполнению поручений
    /// </summary>
    public partial class CommissionsExecutionUpdatedReport : CommissionExecutionReport
    {
        public CommissionsExecutionUpdatedReport(RPTableBuilder builder)
            : base(builder)
        {
            if (this.EndDate.Date > DateTime.Now.Date){

                RPCustomExceptionData exceptionData = new RPCustomExceptionData();
                exceptionData.AlertText = "Конечное значение Отчетного периода не может быть больше текущей даты";
                throw new RPCustomException(exceptionData);
            }
            else if (this.StartDate.Date > this.EndDate.Date)
            {
                RPCustomExceptionData exceptionData = new RPCustomExceptionData();
                exceptionData.AlertText = "Начальная дата отчетного периода не может быть больше конечной";
                throw new RPCustomException(exceptionData);
            }
        }


        private bool __init_DelayCounter = false;
        private CommissionsReportDelayCounter _DelayCounter;
        /// <summary>
        /// Класс отвечающий за подсчёт просрочки
        /// </summary>
        public CommissionsReportDelayCounter DelayCounter
        {
            get
            {
                if (!__init_DelayCounter)
                {
                    ReportParams reportParams = new ReportParams();
                    reportParams.Filters = this;
                    reportParams.CheckAccess = this.CommissionReportSettings.CheckAccess;
                    reportParams.Items = this.Items;
                    reportParams.ReportPeriodEnd = this.EndDate;
                    reportParams.ReportPeriodStart = this.StartDate;

                    _DelayCounter = new CommissionsReportDelayCounter(this.Site, reportParams);

                    __init_DelayCounter = true;
                }
                return _DelayCounter;
            }
        }



        private bool __init_PriorityFilter = false;
        private string _PriorityFilter;
        /// <summary>
        /// Условие фильтра по приопритетам
        /// </summary>
        public override string PriorityFilter
        {
            get
            {
                if (!__init_PriorityFilter)
                {
                    _PriorityFilter = this.GetCondition("Приоритет", "Приоритет");

                    __init_PriorityFilter = true;
                }
                return _PriorityFilter;
            }
        }



        /// <summary>
        /// Добавляет строку даты формирования отчёта
        /// </summary>
        /// <param name="writer"></param>
        protected override void RenderHeader(System.Web.UI.HtmlTextWriter writer)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<div style='padding:3px'>");
            sb.Append("<b>Дата формирования отчёта: </b>");
            sb.Append(DateTime.Now.ToString("dd.MM.yyyy"));
            sb.Append("</div>");
            writer.WriteLine(sb.ToString());
        }

        /// <summary>
        /// Обвновлённые колонки
        /// </summary>
        public override Columns Columns
        {
            get { return this.UpdatedColumns; }
        }


        private UpdatedColumns _UpdatedColumns;
        public UpdatedColumns UpdatedColumns
        {
            get
            {
                return _UpdatedColumns ?? (_UpdatedColumns = new UpdatedColumns(base.CommissionReportSettings, this.DBInfo, this));
            }
        }

        /// <summary>
        /// Ссылка на страницу с детализацией
        /// </summary>
        protected override string DetalizationLink
        {
            get
            {
                return "/_layouts/WSS/WSSC.V4.DMS.OMK/Reports/CommissionsExecutionReport/UpdatedDetalization.aspx?user={0}&start={1}&end={2}&colType={3}";
            }
        }


        /// <summary>
        /// Коэффициент исполненных поручений % (КИП):
        /// (Исполнено за отчетный период) / (Всего должно быть исполнено в отчетный период) * 100%
        /// </summary>
        /// <param name="tableCell"></param>
        /// <returns></returns>
        private double GetKIP(RPTableCell tableCell)
        {
            double total = this.GetDoubleValue(tableCell, ColumnType.ShouldBeExecuted);
            double executed = this.GetDoubleValue(tableCell, ColumnType.ExecutedInReportPeriod);

            if (executed >= total)
                return 1;

            if (total != 0)
                return (executed / total);
            else
                return 0;
        }

        /// <summary>
        /// Коэффициент неисполненных поручений (КНП)/Критичные (КНП1)
        /// Если среднее время просрочки
        /// от 0 до 16 раб.часов включительно -> КНП1 = 0, 
        /// от 16 до 40 раб.часов включительно -> КНП1  = 0,25, 
        /// более 40 раб.часов -> КНП1 = 0,5
        /// </summary>
        private double GetKNP1(RPTableCell tableCell)
        {
            double avarageCritical = this.GetAvarageCriticalDelay(tableCell);
            if (avarageCritical <= 16)
                return 0;
            else if (avarageCritical <= 40)
                return 0.25;
            else 
                return 0.5;
        }

        /// <summary>
        /// Коэффициент неисполненных поручений (КНП)/Не критичные (КНП2)
        /// Если среднее время просрочки
        /// от 0 до 40 раб.часов включительно -> КНП2 = 0, 
        /// от 41 до 80 раб.часов включительно -> КНП2 = 0,15, 
        /// от 81 до 120 раб.часов включительно -> КНП2 = 0,25, 
        /// более 120 раб.часов -> КНП2 = 0,5
        /// </summary>
        /// <param name="tableCell"></param>
        private double GetKNP2(RPTableCell tableCell)
        {
            double avarageNotCritical = this.GetAvarageNotCriticalDelay(tableCell);

            if (avarageNotCritical <= 40)
                return 0;
            else if (avarageNotCritical <= 81)
                return 0.15;
            else if (avarageNotCritical <= 120)
                return 0.25;
            else
                return 0.5;

        }

        private double GetAvarageNotCriticalDelay(RPTableCell tableCell)
        {
            UserInfo userInformation = this.GetUI(tableCell);
            return this.DelayCounter.GetAvarageNotCriticalDelay(userInformation.UserID);
        }

        private double GetAvarageCriticalDelay(RPTableCell tableCell)
        {
            UserInfo userInformation = this.GetUI(tableCell);
            return this.DelayCounter.GetAvarageCriticalDelay(userInformation.UserID);
        }

        /// <summary>
        /// Коэффициент исполнительской дисциплины, % (КИД)
        /// КИП * (1 - (КНП1 + КНП2)/2) * 100,
        /// если (КНП1 + КНП2)/2 = 0, то возвращаем КИП
        /// </summary>
        /// <param name="tableCell"></param>
        private double GetKID(RPTableCell tableCell)
        {
            double kip = this.GetKIP(tableCell);
            double knp1 = this.GetKNP1(tableCell);
            double knp2 = this.GetKNP2(tableCell);

            double kid = kip * (1 - (knp1 + knp2) / 2) * 100;

            if (kid > 100)
                kid = 100;

            return kid;
        }


        /// <summary>
        /// Получает числовое (double) значение ячейки
        /// </summary>
        /// <param name="tableCell"></param>
        /// <param name="columnType"></param>
        /// <returns></returns>
        private double GetDoubleValue(RPTableCell tableCell, ColumnType type)
        {
            UserInfo ui = this.GetUI(tableCell);

            string text = ui == null ? null : ui.Values[type].ToString();
            return Double.Parse(text);
        }
    }
}
