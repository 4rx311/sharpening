using System;
using System.Collections.Generic;
using System.Linq;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Adapters
{
	/// <summary>
	/// Класс для работы с базой данных.
	/// </summary>
	internal class DatabaseAdapter
	{
		// DB-сайт.
		private DBSite Site { get; set; }

		/// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="site">DB-сайт.</param>
		internal DatabaseAdapter(DBSite site)
		{
			if (site == null) throw new ArgumentNullException("site");

			this.Site = site;
		}

		private bool __init_SolutionHistoryAdapter;
		private DBObjectAdapter<SolutionsHistory> _SolutionHistoryAdapter;
		/// <summary>
		/// Адаптер для работы с таблицей "История решений".
		/// </summary>
		private DBObjectAdapter<SolutionsHistory> SolutionHistoryAdapter
		{
			get
			{
				if (!__init_SolutionHistoryAdapter)
				{
					_SolutionHistoryAdapter = new DBObjectAdapter<SolutionsHistory>(this.Site.SiteConnectionString);
					__init_SolutionHistoryAdapter = true;
				}
				return _SolutionHistoryAdapter;
			}
		}

		/// <summary>
		/// Возвращает дату принятия решения.
		/// </summary>
		/// <param name="listId">ID DB-списка.</param>
		/// <param name="itemId">ID DB-карточки.</param>
		/// <param name="role">Название роли.</param>
		/// <param name="solutionName">Название решения.</param>
		/// <returns>Дату принятия решения.</returns>
		internal DateTime GetSolutionsDateTime(int listId, int itemId, string role, string solutionName)
		{
			if (string.IsNullOrEmpty(role)) throw new ArgumentException("Value cannot be null or empty.", "role");
			if (string.IsNullOrEmpty(solutionName)) throw new ArgumentException("Value cannot be null or empty.", "solutionName");

			string query = string.Format
			(
				"[ListID] = {0} AND [ItemID] = {1} AND [Roles] LIKE N'%{2}%' AND [SolutionName] = N'{3}'",
				listId,
				itemId,
				role,
				solutionName
			);

			DateTime solutiondate = new DateTime();
			List<SolutionsHistory> result = this.SolutionHistoryAdapter.GetObjects(query);
			
			if (result.Any())
			{
				result = result.OrderByDescending(x => x.Date).ToList();
				solutiondate = result.First().Date;
			}
			return solutiondate;
		}
	}
}
