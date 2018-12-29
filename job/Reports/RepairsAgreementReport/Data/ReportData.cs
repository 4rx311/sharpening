using System;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Data
{
	/// <summary>
	/// Класс с информацией для отчёта по одной карточке.
	/// </summary>
	internal class ReportData
	{
		/// <summary>
		/// Дата отправки на согласование.
		/// </summary>
		internal DateTime SendToAgrSolutionDate { get; set; }

		/// <summary>
		/// Дата принятия решения сотрудником подразделения "Дирекция по ремонту" или сотрудником дочернего подразделения.
		/// </summary>
		internal DateTime DpRSolutionDate { get; set; }
		/// <summary>
		/// Продолжительность согласования сотрудником подразделения "Дирекция по ремонту" или сотрудником дочернего подразделения.
		/// </summary>
		internal int DpRAgreementDuration { get; set; }

		/// <summary>
		/// Дата принятия решения сотрудником подразделения "Дирекция по экономике" или сотрудником дочернего подразделения.
		/// </summary>
		internal DateTime DESolutionDate { get; set; }
		/// <summary>
		/// Продолжительность согласования сотрудником подразделения "Дирекция по экономике" или сотрудником дочернего подразделения.
		/// </summary>
		internal int DEAgreementDuration { get; set; }

		/// <summary>
		/// Дата принятия решения сотрудником подразделения "ДМТО" или сотрудником дочернего подразделения.
		/// </summary>
		internal DateTime DMTOSolutionDate { get; set; }
		/// <summary>
		/// Продолжительность согласования сотрудником подразделения "ДМТО" или сотрудником дочернего подразделения.
		/// </summary>
		internal int DMTOAgreementDuration { get; set; }

		/// <summary>
		/// Дата подписания.
		/// </summary>
		internal DateTime SignedSolutionDate { get; set; }

		/// <summary>
		/// Общая продолжительность согласования.
		/// </summary>
		internal int TotalDuration
		{
			get { return this.DpRAgreementDuration + this.DEAgreementDuration + this.DMTOAgreementDuration; }
		}
	}
}