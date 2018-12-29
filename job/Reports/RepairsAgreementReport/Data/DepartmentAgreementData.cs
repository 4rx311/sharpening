using System;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Data
{
	/// <summary>
	/// Структура данных по согласованию подразеделением или дочерним подразеделением.
	/// </summary>
	internal struct DepartmentAgreementData
	{
		/// <summary>
		/// Код подразеделения
		/// </summary>
		internal DepartmentCode DepartmentCode { get; set; }
		/// <summary>
		/// Время принятия решения согласования.
		/// </summary>
		internal DateTime SolutionDate { get; set; }
		/// <summary>
		/// Длительность согласования.
		/// </summary>
		internal int AgreementDuration { get; set; }
	}
}