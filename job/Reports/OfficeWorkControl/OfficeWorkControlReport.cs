using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.TableSection;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports.OfficeWorkControl
{
    /// <summary>
    /// Отчёт по проведению делопроизводственного контроля
    /// </summary>
    public class OfficeWorkControlReport : RPCustomBuilder
    {
        /// <summary>
        /// Инициализирует новый экземпляр класса OfficeWorkControlReport 
        /// </summary>
        /// <param name="builder">Построитель кастомного отчёта</param>
        public OfficeWorkControlReport(RPTableBuilder builder)
            : base(builder) { }

        private OfficeWorkControlReportFilter _Filter;
        /// <summary>
        /// Объект содержащий значения фильтров
        /// </summary>
        private OfficeWorkControlReportFilter Filter
        {
            get
            {
                return _Filter ?? (_Filter = new OfficeWorkControlReportFilter(this.PublishingQuery, this.Site));
            }
        }

        private OfficeWorkControlSetting _Setting;
        /// <summary>
        /// Настройка отчёта
        /// </summary>
        private OfficeWorkControlSetting Setting
        {
            get
            {
                return _Setting ?? (_Setting = new OfficeWorkControlSetting(this.CustomSettings));
            }
        }
        
        /// <summary>
        /// Получение набора строк для кастомного отчёта
        /// </summary>
        /// <returns>Набор кастомных строк, по которым будет строиться отчёт</returns>
        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {               
            IEnumerable<OfficeWorkControlRow> rows = OfficeWorkControlReportRowsProvider.GetRows(this.Items, this.Filter, this.Setting.SolutionNames, this.Site);
            return rows.Cast<IRPDataRow>(); 
        }                      

        /// <summary>
        /// Столбец "Дата поступления на согласование"
        /// </summary>
        /// <param name="tableCell">Ячейка отчёта</param>
        [RPCustomColumn]
        public void AgreementStartDateColumn(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            OfficeWorkControlRow row = (tableCell.TableRow.DataRow as OfficeWorkControlRow);
            if (row == null)
                throw new Exception("Не удалось получить строку данных для ячейки");

            tableCell.CreateRow().CreateCell().SetValue(row.StartDate, RPCellFormatType.DateTime);
        }

        /// <summary>
        /// Столбец "Дата принятия решения согласующим"
        /// </summary>
        /// <param name="tableCell">Ячейка отчёта</param>
        [RPCustomColumn]
        public void AgreementEndDateColumn(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            OfficeWorkControlRow row = (tableCell.TableRow.DataRow as OfficeWorkControlRow);
            if (row == null)
                throw new Exception("Не удалось получить строку данных для ячейки");

            tableCell.CreateRow().CreateCell().SetValue(row.EndDate, RPCellFormatType.DateTime);
        }

        /// <summary>
        /// Столбец "Количество рабочих часов, затраченных на согласование"
        /// </summary>
        /// <param name="tableCell">Ячейка отчёта</param>
        [RPCustomColumn]
        public void AgreementWorkHoursColumn(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            OfficeWorkControlRow row = (tableCell.TableRow.DataRow as OfficeWorkControlRow);
            if (row == null)
                throw new Exception("Не удалось получить строку данных для ячейки");

            tableCell.CreateRow().CreateCell().SetValue(row.WorkHours, RPCellFormatType.Number);
        }

        /// <summary>
        /// Столбец "Количество файлов приложений
        /// <param name="tableCell">Ячейка отчёта</param>
        [RPCustomColumn]
        public void FilesCountColumn(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            OfficeWorkControlRow row = (tableCell.TableRow.DataRow as OfficeWorkControlRow);
            if (row == null)
                throw new Exception("Не удалось получить строку данных для ячейки");

            tableCell.CreateRow().CreateCell().SetValue(row.FilesCount, RPCellFormatType.Integer);
        }
    }    
}
