using System;
using System.Collections.Generic;
using WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Adapters;
using WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Data;
using WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Settings;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport
{
	/// <summary>
	/// Класс с информацией о распоряжении.
	/// </summary>
	internal class DirectionInfo : IRPDataRow
	{
		/// <summary>
		/// DB-карточка распоряжения.
		/// </summary>
		public DBItem Item { get; private set; }

		// DB-сайт.
		private DBSite Site { get; set; }

		/// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="item">DB-карточка распоряжения.</param>
		internal DirectionInfo(DBItem item)
		{
			if (item == null) throw new ArgumentNullException("item");

			this.Item = item;
			this.Site = this.Item.Site;

			this.GetReportInfo();
		}

		#region DMSLogicProperties

		private bool __init_DmsContext;
		private DMSContext _DmsContext;
		/// <summary>
		/// DMS-контекст выполнения операции.
		/// </summary>
		private DMSContext DmsContext
		{
			get
			{
				if (!__init_DmsContext)
				{
					_DmsContext = new DMSContext(this.Item.Web);
					__init_DmsContext = true;
				}
				return _DmsContext;
			}
		}

		private bool __init_DmsItem;
		private DMSDocument _DmsItem;
		/// <summary>
		/// DMS-документ, соответствующий DB-карточке документа.
		/// </summary>
		private DMSDocument DmsItem
		{
			get
			{
				if (!__init_DmsItem)
				{
					_DmsItem = new DMSDocument(this.DmsContext, this.Item);
					__init_DmsItem = true;
				}
				return _DmsItem;
			}
		}

		private bool __init_DmsLogic;
		private DMSLogic _DmsLogic;
		/// <summary>
		/// DMS-логика выполнения операции.
		/// </summary>
		private DMSLogic DmsLogic
		{
			get
			{
				if (!__init_DmsLogic)
				{
					_DmsLogic = new DMSLogic(this.DmsItem);
					__init_DmsLogic = true;
				}
				return _DmsLogic;
			}
		}
		#endregion

		private bool __init_Settings;
		private ReportSettings _Settings;
		/// <summary>
		/// Настройки отчёта.
		/// </summary>
		private ReportSettings Settings
		{
			get
			{
				if (!__init_Settings)
				{
					_Settings = new ReportSettings(this.Site);
					__init_Settings = true;
				}
				return _Settings;
			}
		}

		private bool __init_DatabaseAdapter;
		private DatabaseAdapter _DatabaseAdapter;
		/// <summary>
		/// Объект для работы с базой данных.
		/// </summary>
		private DatabaseAdapter DatabaseAdapter
		{
			get
			{
				if (!__init_DatabaseAdapter)
				{
					_DatabaseAdapter = new DatabaseAdapter(this.Item.Site);
					__init_DatabaseAdapter = true;
				}
				return _DatabaseAdapter;
			}
		}

		private bool __init_AgrBlockAdapter;
		private AgreementBlockAdapter _AgrBlockAdapter;
		/// <summary>
		/// Объект для работы с блоком согласования.
		/// </summary>
		private AgreementBlockAdapter AgrBlockAdapter
		{
			get
			{
				if (!__init_AgrBlockAdapter)
				{
					_AgrBlockAdapter = new AgreementBlockAdapter(this.Site, this.DmsLogic, this.Settings);
					__init_AgrBlockAdapter = true;
				}
				return _AgrBlockAdapter;
			}
		}

		/// <summary>
		/// Данные для формирования отчёта.
		/// </summary>
		internal ReportData ReportData { get; private set; }

		/// <summary>
		/// Возвращает данные для отчёта.
		/// </summary>
		private void GetReportInfo()
		{
			this.ReportData = new ReportData();

			this.ReportData.SendToAgrSolutionDate = this.GetSolutionDate(this.Settings.SendToAgreementSolutionData.Role,
				this.Settings.SendToAgreementSolutionData.SolutionName);
			this.ReportData.SignedSolutionDate = this.GetSolutionDate(this.Settings.SigningSolutionData.Role,
				this.Settings.SigningSolutionData.SolutionName);

			List<DepartmentAgreementData> departmentAgreementData = this.AgrBlockAdapter.GetSolutionsData();
			if (departmentAgreementData != null)
			{
				foreach (DepartmentAgreementData agreementData in departmentAgreementData)
				{
					switch (agreementData.DepartmentCode)
					{
						case DepartmentCode.DpR:
							this.ReportData.DpRSolutionDate = agreementData.SolutionDate;
							this.ReportData.DpRAgreementDuration = agreementData.AgreementDuration;
							break;
						case DepartmentCode.De:
							this.ReportData.DESolutionDate = agreementData.SolutionDate;
							this.ReportData.DEAgreementDuration = agreementData.AgreementDuration;
							break;
						case DepartmentCode.Dmto:
							this.ReportData.DMTOSolutionDate = agreementData.SolutionDate;
							this.ReportData.DMTOAgreementDuration = agreementData.AgreementDuration;
							break;
					}
				}
			}
		}

		/// <summary>
		/// Возвращает дату последнего решения с заданным названием.
		/// </summary>
		/// <param name="roleName">Название роли, принявшей решение.</param>
		/// <param name="solutionName">Название решения.</param>
		/// <returns>Дату последнего решения с заданным названием.</returns>
		private DateTime GetSolutionDate(string roleName, string solutionName)
		{
			if (string.IsNullOrEmpty(roleName)) throw new ArgumentException("Value cannot be null or empty.", "roleName");
			if (string.IsNullOrEmpty(solutionName)) throw new ArgumentException("Value cannot be null or empty.", "solutionName");

			return this.DatabaseAdapter.GetSolutionsDateTime(this.Item.List.ID, this.Item.ID, roleName, solutionName);
		}
	}
}
