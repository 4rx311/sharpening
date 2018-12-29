using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Files;
using Consts = WSSC.V4.DMS.OMK._Consts.Lists.Orders.Fields;

namespace WSSC.V4.DMS.OMK
{
    public class RegisterOfOrdersReport : RPCustomBuilder
    {
        /// <summary>
        /// Конструктор.
        /// </summary>
        /// <param name="builder">Построитель отчёта.</param>
        public RegisterOfOrdersReport(RPTableBuilder builder) : base(builder) { }

        /// <summary>
        /// Возвращает коллекцию строк данных, используемых в качестве источника данных при построении отчёта.
        /// </summary>
        /// <returns/>
        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            if (this.Items == null || this.Items.Count < 1)
            {
                RPCustomExceptionData exData = new RPCustomExceptionData();
                exData.AlertText = "В папке отсутствуют элементы для формирования отчёта";
                exData.CloseWindow = true;
                throw new RPCustomException(exData);
            }

            return this.Items.Select(i => new FilesCountRow(i) as IRPDataRow);
        }    

        /// <summary>
        /// Простановка в ячейку отчета кол-ва файлов приложений
        /// </summary>
        /// <param name="tableCell">Ячейка отчёта.</param>
        [RPCustomColumn]
        internal void WriteFileCount(RPTableCell tableCell)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");

            tableCell.CreateRow().CreateCell().SetValue(((FilesCountRow)tableCell.TableRow.DataRow).FilesCount, RPCellFormatType.Integer);
        }

        /// <summary>
        /// Устанавливаем тип загрузки значения поля "Файлы приложений"        
        /// </summary>
        protected override void OnInit()
        {
            foreach (DBList list in this.PublishingQuery.ResultLists.Select(x => x.List))
            {
                DBField filesField = list.GetField(Consts.ApplicationsFiles, true) as DBFieldFiles;
                filesField.ValueLoadingType = DBFieldValueIOType.Directly;
            }
        }
    }
}
