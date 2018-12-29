using System;
using System.Collections.Generic;
using System.Linq;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport
{
	/// <summary>
	/// Класс построителя отчёта по согласованию ремонтных работ.
	/// </summary>
	internal class RepairsAgreementReportBuilder : RPCustomBuilder
	{
		/// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="builder"></param>
		public RepairsAgreementReportBuilder(RPTableBuilder builder) : base(builder)
		{
		}

		/// <summary>
		/// Возвращает кастомные строки для построения отчёта.
		/// </summary>
		/// <returns>Кастомные строки для построения отчёта.</returns>
		protected override IEnumerable<IRPDataRow> GetCustomSource()
		{
			if (this.Items == null || !this.Items.Any())
				return null;

			return this.Items.Select(dbItem => new DirectionInfo(dbItem)).Cast<IRPDataRow>().ToList();
		}

		/// <summary>
		/// Устанавливает значение в ячейку.
		/// </summary>
		/// <param name="tableCell">Ячейка таблицы отчёта.</param>
		/// <param name="setInfo">Метод установки значения.</param>
		private void SetCellValue(RPTableCell tableCell, Action<DirectionInfo, RPCell> setInfo)
		{
			if (tableCell == null) throw new ArgumentNullException("tableCell");
			if (setInfo == null) throw new ArgumentNullException("setInfo");

			RPRow row = tableCell.CreateRow();
			RPCell cell = row.CreateCell();

			DirectionInfo info = tableCell.TableRow.DataRow as DirectionInfo;
			if (info == null)
				throw new Exception("DirectionInfo info as IRPDataRow is null");

			setInfo(info, cell);
		}

		/// <summary>
		/// Возвращает дату отправки на согласование.
		/// </summary>
		/// <param name="tableCell">Ячейка таблицы отчёта.</param>
		[RPCustomColumn]
		private void GetSendForAgreementSolutionDate(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue
				(
					tableCell,
					(info, cell) =>
					{
						cell.SetValue(info.ReportData.SendToAgrSolutionDate, RPCellFormatType.DateTime);
					}
				);
		}

		/// <summary>
		/// Возвращает дату подписания.
		/// </summary>
		/// <param name="tableCell"></param>
		[RPCustomColumn]
		private void GetSignedDate(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.SignedSolutionDate, RPCellFormatType.DateTime);
				});
		}

		/// <summary>
		/// Возвращает дату согласования сотрудником ДпР или сотрудником дочернего подразделения.
		/// </summary>
		/// <param name="tableCell">Ячейка отчёта.</param>
		[RPCustomColumn]
		private void GetDpRSolutionDate(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.DpRSolutionDate, RPCellFormatType.DateTime);
				});
		}

		/// <summary>
		/// Возвращает продолжительность согласования сотрудником ДпР или сотрудником дочернего подразделения.
		/// </summary>
		/// <param name="tableCell">Ячейка отчёта.</param>
		[RPCustomColumn]
		private void GetDpRDuration(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.DpRAgreementDuration, RPCellFormatType.Integer);
				});
		}

		/// <summary>
		/// Возвращает дату согласования сотрудником ДЭ или сотрудником дочернего подразделения.
		/// </summary>
		/// <param name="tableCell">Ячейка отчёта.</param>
		[RPCustomColumn]
		private void GetDeSolutionDate(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.DESolutionDate, RPCellFormatType.DateTime);
				});
		}

		/// <summary>
		/// Возвращает продолжительность согласования сотрудником ДЭ или сотрудником дочернего подразделения.
		/// </summary>
		/// <param name="tableCell">Ячейка отчёта.</param>
		[RPCustomColumn]
		private void GetDeDuration(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.DEAgreementDuration, RPCellFormatType.Integer);
				});
		}

		/// <summary>
		/// Возвращает дату согласования сотрудником ДМТО или сотрудником дочернего подразделения.
		/// </summary>
		/// <param name="tableCell">Ячейка отчёта.</param>
		[RPCustomColumn]
		private void GetDmtoSolutionDate(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.DMTOSolutionDate, RPCellFormatType.DateTime);
				});
		}

		/// <summary>
		/// Возвращает продолжительность согласования сотрудником ДМТО или сотрудником дочернего подразделения.
		/// </summary>
		/// <param name="tableCell">Ячейка отчёта.</param>
		[RPCustomColumn]
		private void GetDmtoDuration(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.DMTOAgreementDuration, RPCellFormatType.Integer);
				});
		}

		/// <summary>
		/// Возвращает общую продолжительность согласования.
		/// </summary>
		/// <param name="tableCell"></param>
		[RPCustomColumn]
		private void GetTotalAgreementDuration(RPTableCell tableCell)
		{
			if (tableCell == null)
				throw new ArgumentNullException("tableCell");

			this.SetCellValue(tableCell,
				(info, cell) =>
				{
					cell.SetValue(info.ReportData.TotalDuration, RPCellFormatType.Integer);
				});
		}
	}
}