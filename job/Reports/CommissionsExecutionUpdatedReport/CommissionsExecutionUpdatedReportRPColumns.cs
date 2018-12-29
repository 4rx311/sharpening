using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport
{
    public partial class CommissionsExecutionUpdatedReport
    {
        /// <summary>
        /// 4. Всего должно быть исполнено в отчетный период
        /// </summary>
        [RPCustomColumn]
        public void ShouldBeExecuted(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.ShouldBeExecuted);
        }

        /// <summary>
        /// Исполнено за отчетный период
        /// </summary>
        [RPCustomColumn]
        public void ExecutedInReportPeriod(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.ExecutedInReportPeriod);
        }

        /// <summary>
        /// Коэффициент исполненных поручений % (КИП):
        /// (Всего должно быть исполнено в отчетный период) / (Исполнено за отчетный период) * 100%
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void ExecutedCoefficient(RPTableCell tableCell)
        {
            double coefficient = this.GetKIP(tableCell);
            tableCell.CreateRow().CreateCell().SetValue(coefficient, RPCellFormatType.Number);
        }

        /// <summary>
        /// Не исполнено за отчетный период
        /// </summary>
        [RPCustomColumn]
        public void NotExecutedInReportPeriod(RPTableCell tableCell)
        {
            this.SetLinkToDetalize(tableCell, ColumnType.NotExecutedInReportPeriod);
        }

        /// <summary>
        /// Среднее время просрочки, раб.час./Критичные
        /// </summary>
        [RPCustomColumn]
        public void AvarageTimeOut(RPTableCell tableCell)
        {
            UserInfo userInformation = this.GetUI(tableCell);
            double avarage = this.DelayCounter.GetAvarageCriticalDelay(userInformation.UserID);

            tableCell.CreateRow().CreateCell().SetValue(avarage, RPCellFormatType.Number);
        }

        /// <summary>
        /// Среднее время просрочки, раб.час./Не критичные
        /// </summary>
        [RPCustomColumn]
        public void AvarageNotCriticalTimeOut(RPTableCell tableCell)
        {
            UserInfo userInformation = this.GetUI(tableCell);
            double avarage = this.DelayCounter.GetAvarageNotCriticalDelay(userInformation.UserID);

            tableCell.CreateRow().CreateCell().SetValue(avarage, RPCellFormatType.Number);
        }

        /// <summary>
        /// Коэффициент исполненных поручений % (КИП)
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void NotExecutedCriticalCoefficient(RPTableCell tableCell)
        {
            double coefficient = this.GetKNP1(tableCell);
            tableCell.CreateRow().CreateCell().SetValue(coefficient, RPCellFormatType.Number);
        }

        /// <summary>
        /// Коэффициент неисполненных поручений (КНП)/Не критичные (КНП2)
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void NotExecutedNotCriticalCoefficient(RPTableCell tableCell)
        {
            double coefficient = this.GetKNP2(tableCell);
            tableCell.CreateRow().CreateCell().SetValue(coefficient, RPCellFormatType.Number);
        }

        /// <summary>
        /// Коэффициент исполнительской дисциплины, % (КИД)
        /// КИП * (1 - (КНП1 + КНП2)/2) * 100,
        /// если (КНП1 + КНП2)/2 = 0, то возвращаем КИП
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void ExecutorDisciplineCoefficient(RPTableCell tableCell)
        {
            double coefficient = this.GetKID(tableCell);
            tableCell.CreateRow().CreateCell().SetValue(coefficient, RPCellFormatType.Number);
        }
    }
}
