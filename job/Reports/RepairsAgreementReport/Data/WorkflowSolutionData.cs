using System;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Data
{
	/// <summary>
	/// Класс информации от решениях.
	/// </summary>
	internal class WorkflowSolutionData
	{
		/// <summary>
		/// Название роли.
		/// </summary>
		internal string Role { get; private set; }
		/// <summary>
		/// Системное название решения.
		/// </summary>
		internal string SolutionName { get; private set; }

		/// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="role">Название роли.</param>
		/// <param name="solutionName">Системное название решения.</param>
		internal WorkflowSolutionData(string role, string solutionName)
		{
			if (string.IsNullOrEmpty(role)) throw new ArgumentException("Value cannot be null or empty.", "role");
			if (string.IsNullOrEmpty(solutionName)) throw new ArgumentException("Value cannot be null or empty.", "solutionName");

			this.Role = role;
			this.SolutionName = solutionName;
		}
	}
}