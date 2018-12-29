using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Data;
using WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Settings;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.Data;
using WSSC.V4.SYS.Lib.DBObjects;
using WSSC.V4.SYS.Lib.Utilities;


namespace WSSC.V4.DMS.OMK.Reports.RepairsAgreementReport.Adapters
{
	/// <summary>
	/// Класс для работы с блоком согласования в карточке.
	/// </summary>
	internal class AgreementBlockAdapter
	{
		// DB-сайт.
		private DBSite Site { get; set; }
		// DMS-логика.
		private DMSLogic Logic{ get; set; }
		// Настройки отчёта.
		private ReportSettings Settings { get; set; }

		/// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="site">DB-сайт.</param>
		/// <param name="logic">DMS-логика.</param>
		/// <param name="settings">Настройки отчёта.</param>
		internal AgreementBlockAdapter(DBSite site, DMSLogic logic, ReportSettings settings)
		{
			if (site == null) throw new ArgumentNullException("site");
			if (logic == null) throw new ArgumentNullException("logic");
			if (settings == null) throw new ArgumentNullException("settings");

			this.Site = site;
			this.Logic = logic;
			this.Settings = settings;
		}

		private bool __init_AgreementBlock;
		private ProcessPassageObject _AgreementBlock;
		/// <summary>
		/// Блок согласования.
		/// </summary>
		private ProcessPassageObject AgreementBlock
		{
			get
			{
				if (!__init_AgreementBlock)
				{
					DMSAgreementBlockLogic agreementBlockLogic = new DMSAgreementBlockLogic(this.Logic);
					_AgreementBlock = agreementBlockLogic.ProcessObj;
					__init_AgreementBlock = true;
				}
				return _AgreementBlock;
			}
		}

		private bool __init_WorkTimeService;
		private WorkTimeService _WorkTimeService;
		/// <summary>
		/// Экземпляр сервиса для учёта рабочих дней.
		/// </summary>
		private WorkTimeService WorkTimeService
		{
			get
			{
				if (!__init_WorkTimeService)
				{
					_WorkTimeService = this.Site.WorkTimeService();
					__init_WorkTimeService = true;
				}
				return _WorkTimeService;
			}
		}

		/// <summary>
		/// Возвращает данные по согласованию подразделениями.
		/// </summary>
		/// <returns>Данные по согласованию подразделениями.</returns>
		internal List<DepartmentAgreementData> GetSolutionsData()
		{
			List<ProcessUser> allUsers = new List<ProcessUser>();
			List<ProcessBlock> processBlocks = this.AgreementBlock.Stages.First().ProcessBlocks;

			foreach (ProcessBlock processBlock in processBlocks)
			{
				allUsers.AddRange(processBlock.ProcessUsers);
			}

			return allUsers.Any() ? this.GetDepartmentAgreementData(allUsers) : null;
		}

		/// <summary>
		/// Возвращает данные по согласованию подразделениями.
		/// </summary>
		/// <param name="allUsers">Коллекция всех согласующих.</param>
		/// <returns>Данные по согласованию подразделениями.</returns>
		private List<DepartmentAgreementData> GetDepartmentAgreementData(List<ProcessUser> allUsers)
		{
			if (allUsers == null) throw new ArgumentNullException("allUsers");

			// Объект для хранения информации о пользователях.
			ProcessUsersData processUsersData = new ProcessUsersData();

			foreach (ProcessUser processUser in allUsers)
			{
				// Не указанные в настройке решения не обрабатываются.
				if (!this.Settings.SolutionNames.Contains(processUser.Solution)) continue;
				// Обработка пользователей не из роли.
				if (processUser.UserID != 0)
				{
					DBItem userItem = this.Site.UsersList.GetItem(processUser.UserID);
					if (userItem == null)
						throw new DBException.MissingItem(this.Site.UsersList, processUser.UserID);
					this.AllocateProcessUsers(userItem, processUser, processUsersData);
				}
				// Обработка пользователей из роли.
				else if (!string.IsNullOrEmpty(processUser.UserFIO))
				{
					// Получение ID пользователей из роли.
					List<int> roleUserIds = new List<int>();

					int roleId = processUser.MatrixPerson.RoleID;
					if (roleId != 0)
					{
						List<DBUser> roleUsers = this.Logic.GetUsersInRole(roleId);
						roleUserIds.AddRange(roleUsers.Select(dbUser => dbUser.ID));
					}

					// Если пользователь, фактически принявший решение, входит в роль по матрице.
					if (roleUserIds.Contains(processUser.FactUserID))
					{
						DBItem userItem = this.Site.UsersList.GetItem(processUser.FactUserID);
						if (userItem == null)
							throw new DBException.MissingItem(this.Site.UsersList, processUser.FactUserID);
						this.AllocateProcessUsers(userItem, processUser, processUsersData);
					}
					// Если нет, ищем заместителя.
					else
					{
						foreach (int roleUserId in roleUserIds)
						{
							List<DBDeputy> deputies = this.Logic.GetDeputies(roleUserId, this.Logic.Item.Web.ID);
							IEnumerable<int> deputyIds = deputies.Select(x => x.DeputyID);
							if (deputyIds.Contains(processUser.FactUserID))
							{
								DBItem userItem = this.Site.UsersList.GetItem(roleUserId);
								if (userItem == null)
									throw new DBException.MissingItem(this.Site.UsersList, processUser.UserID);
								this.AllocateProcessUsers(userItem, processUser, processUsersData);
								break;
							}
						}
					}
				}
			}

			List<DepartmentAgreementData> departmentAgreementData = new List<DepartmentAgreementData>();

			// Заполнение списка с информацией по согласованию подразделениями.
			if (processUsersData.DpRUsers.Any())
				departmentAgreementData.Add(this.GetDepartmentAgreementData(DepartmentCode.DpR, processUsersData.DpRUsers));
			if (processUsersData.DeUsers.Any())
				departmentAgreementData.Add(this.GetDepartmentAgreementData(DepartmentCode.De, processUsersData.DeUsers));
			if (processUsersData.DmtoUsers.Any())
				departmentAgreementData.Add(this.GetDepartmentAgreementData(DepartmentCode.Dmto, processUsersData.DmtoUsers));

			return departmentAgreementData;
		}
		
		/// <summary>
		/// Распределяет согласующих по спискам в зависимости от подразделения.
		/// </summary>
		/// <param name="userItem">DB-пользователь.</param>
		/// <param name="processUser">Согласующий.</param>
		/// <param name="processUsersData">Объект для хранения информации о пользователях.</param>
		private void AllocateProcessUsers(DBItem userItem, ProcessUser processUser, ProcessUsersData processUsersData)
		{
			if (userItem == null) throw new ArgumentNullException("userItem");
			if (processUser == null) throw new ArgumentNullException("processUser");
			if (processUsersData == null) throw new ArgumentNullException("processUsersData");

			DBItem departmentItem = userItem.GetLookupItem("Подразделение");
			if (departmentItem != null)
			{
				switch (this.ResolveDepartment(departmentItem))
				{
					case DepartmentCode.DpR:
						processUsersData.DpRUsers.Add(processUser);
						break;
					case DepartmentCode.De:
						processUsersData.DeUsers.Add(processUser);
						break;
					case DepartmentCode.Dmto:
						processUsersData.DmtoUsers.Add(processUser);
						break;
					case DepartmentCode.Undefined:
						return;
					default:
						throw new Exception("Ошибка при получении ID подразделения");
				}
			}
		}

		/// <summary>
		/// Возвращает код родительского подразделения.
		/// </summary>
		/// <param name="departmentItem">DB-карточка подразделения согласующего.</param>
		/// <returns>Код родительского подразделения.</returns>
		private DepartmentCode ResolveDepartment(DBItem departmentItem)
		{
			if (departmentItem == null) throw new ArgumentNullException("departmentItem");

			if (departmentItem.ID == this.Settings.DpRId)
				return DepartmentCode.DpR;
			if (departmentItem.ID == this.Settings.DeId)
				return DepartmentCode.De;
			if (departmentItem.ID == this.Settings.DmtoId)
				return DepartmentCode.Dmto;

			DBItem parentDepartmentItem = departmentItem.GetLookupItem("Родительское подразделение");
			return parentDepartmentItem == null ? 
				DepartmentCode.Undefined : 
				this.ResolveDepartment(parentDepartmentItem);
		}

		/// <summary>
		/// Получает данные о согласовании по одному подразделению.
		/// </summary>
		/// <param name="departmentCode">Код подразделения.</param>
		/// <param name="departmentUsers">Согласующие, относящиеся к данному подразделению / дочерним подразделениям данного подразделения.</param>
		/// <returns>Данные о согласовании по одному подразделению.</returns>
		private DepartmentAgreementData GetDepartmentAgreementData(DepartmentCode departmentCode, List<ProcessUser> departmentUsers)
		{
			if (!Enum.IsDefined(typeof(DepartmentCode), departmentCode))
				throw new InvalidEnumArgumentException("departmentCode", (int) departmentCode, typeof(DepartmentCode));
			if (departmentUsers == null) throw new ArgumentNullException("departmentUsers");

			departmentUsers = departmentUsers.OrderByDescending(x => x.EndDate).ToList();
			ProcessUser agreementPerson = departmentUsers.First();
			DateTime solutionTime = agreementPerson.EndDate;

			DBObjectAdapter<DMSAgrPersonStatistics> adapter = new DBObjectAdapter<DMSAgrPersonStatistics>(this.Site.SiteConnectionString);
			string query = string.Format("[ItemID]={0} AND [ProcessUserID]={1}", this.Logic.Item.ID, agreementPerson.ID);
			DMSAgrPersonStatistics dmsAgrPersonStatistics = adapter.GetObject(query);
			if (dmsAgrPersonStatistics == null)
				throw new Exception(string.Format(
					"В таблице [WSSC_DMS_WKF_AgrBlock_UserTimeOnStage] не найден элемент с [ItemID] = {0} и [ProcessUserID] = {1}",
					this.Logic.Item.ID, agreementPerson.ID));

			TimeSpan duration = TimeSpan.FromHours(dmsAgrPersonStatistics.Time);
			double workDays = this.WorkTimeService.ToWorkDays(duration);

			DepartmentAgreementData data = new DepartmentAgreementData
			{
				DepartmentCode = departmentCode,
				SolutionDate = solutionTime,
				AgreementDuration = (int)workDays
			};

			return data;
		}

		/// <summary>
		/// Внутренний класс информации о согласующих.
		/// </summary>
		private class ProcessUsersData
		{
			private bool __init_DpRUsers;
			private List<ProcessUser> _DpRUsers;
			/// <summary>
			/// Согласующие подразделения "Дирекция по ремонтам" и дочерних подразделений.
			/// </summary>
			internal List<ProcessUser> DpRUsers
			{
				get
				{
					if (!__init_DpRUsers)
					{
						_DpRUsers = new List<ProcessUser>();
						__init_DpRUsers = true;
					}
					return _DpRUsers;
				}
			}

			private bool __init_DeUsers;
			private List<ProcessUser> _DeUsers;
			/// <summary>
			/// Согласующие подразделения "Дирекция по экономике" и дочерних подразделений.
			/// </summary>
			internal List<ProcessUser> DeUsers
			{
				get
				{
					if (!__init_DeUsers)
					{
						_DeUsers = new List<ProcessUser>();
						__init_DeUsers = true;
					}
					return _DeUsers;
				}
			}

			private bool __init_DmtoUsers;
			private List<ProcessUser> _DmtoUsers;
			/// <summary>
			/// Согласующие подразделения "ДМТО" и дочерних подразделений.
			/// </summary>
			internal List<ProcessUser> DmtoUsers
			{
				get
				{
					if (!__init_DmtoUsers)
					{
						_DmtoUsers = new List<ProcessUser>();
						__init_DmtoUsers = true;
					}
					return _DmtoUsers;
				}
			}
		}
	}
}
