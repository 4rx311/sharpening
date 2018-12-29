using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.OMK.Reports.AgreementReportData;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Построитель отчета по статистике договоров
    /// </summary>
    class AgreementStatisticsReport : RPCustomBuilder
    {
        public AgreementStatisticsReport(RPTableBuilder builder)
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

        private bool __init_CompanyFilter = false;
        private PFilterValue _CompanyFilter;
        /// <summary>
        /// Фильтр даты.
        /// </summary>
        private PFilterValue CompanyFilter
        {
            get
            {
                if (!__init_CompanyFilter)
                {
                    _CompanyFilter = this.Filters.FirstOrDefault(
                            filter => filter.DisplayName.Contains(_Consts.Reports.AgreementStatisticsReport.FilterCompanyName));

                    if (_CompanyFilter == null || (_CompanyFilter.MultiValue == null && _CompanyFilter.SingleValue == null))
                        this.AppContext.HttpContext.Response.Redirect(this.AppContext.CurrentWeb.Url + VersionProvider.ModulePath + "/Reports/AgreementStatisticsReport/ReportWarningPage.html", true);
                    __init_CompanyFilter = true;
                }
                return _CompanyFilter;
            }
        }

        /// <summary>
        /// Получение кастомных данных для построения таблицы
        /// </summary>
        /// <returns>Набор строк</returns>
        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            if (this.Items == null || this.Items.Count == 0)
                return new List<IRPDataRow>();

            AgreementManager agrData = new AgreementManager(this.Items);

            if (CompanyFilter == null)
                return null;

            return agrData.GetAgreementRows();
        }

        private void SetCellValue(RPTableCell tableCell, AgreementMask mask)
        {
            AgreementRow row = (AgreementRow)tableCell.TableRow.DataRow;

            RPCell cell = tableCell.CreateRow().CreateCell();

            int value = AgreementManager.GetAgreementAmountByMask(row.Agreements, mask);

            cell.SetValue(value, RPCellFormatType.Integer);
        }

        /// <summary>
        /// Кол-во договоров по подразделению
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void DepartmentAgreementAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName, 
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во операционных договоров
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void OperationalAgreementAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName,
                FinSource = _Consts.Reports.AgreementStatisticsReport.MaskValues.FinSourceOperational };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во инвестиционных договоров
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void InvestAgreementAmount(RPTableCell tableCell)
        {

            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName,
                FinSource = _Consts.Reports.AgreementStatisticsReport.MaskValues.FinSourceInvest };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во типовых договоров
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void TypicalAgreementAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName,
                Form = _Consts.Reports.AgreementStatisticsReport.MaskValues.FormTypical };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во нетиповых договоров
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void NonTypicalAgreementAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName,
                Form = _Consts.Reports.AgreementStatisticsReport.MaskValues.FormNonTypical };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во внешнеэкономических контрактов
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void OuterContractAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName,
                OuterInner = _Consts.Reports.AgreementStatisticsReport.MaskValues.Inner };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во договоров с протоколам разногласий/урегулирования разногласий
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void DisagreementAgreementsAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName, 
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AgreementName,
                DisagreementProtocol = true };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во типовых дополнительных соглашений к договорам/спецификациям
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void TypicalAddAgreementsAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AddAgreementName,
                Form = _Consts.Reports.AgreementStatisticsReport.MaskValues.FormTypical };

            this.SetCellValue(tableCell, mask);
        }

        /// <summary>
        /// Кол-во нетиповых дополнительных соглашений к договорам/спецификациям
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void NonTypicalAddAgreementsAmount(RPTableCell tableCell)
        {
            AgreementMask mask = new AgreementMask { Stage = _Consts.Reports.AgreementStatisticsReport.MaskValues.StageName,
                DocType = _Consts.Reports.AgreementStatisticsReport.MaskValues.AddAgreementName,
                Form = _Consts.Reports.AgreementStatisticsReport.MaskValues.FormNonTypical };

            this.SetCellValue(tableCell, mask);
        }
    }
}
