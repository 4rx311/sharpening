using System;
using System.Collections.Generic;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports.TestsReport
{
    internal class RowData : IRPDataRow
    {
        /// <summary>
        /// DB-карточка, по которой строится отчёт.
        /// </summary>
        public DBItem Item { get; private set; }

        // Адаптер истории решений.
        private DBObjectAdapter<SolutionsHistory> SolutionsHistoryAdapter { get; set; }

        // Коллекция пользователей.
        private DBUserCollection Users { get; set; }

        /// <summary>
        /// Конструктор.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="solutionsHistoryAdapter"></param>
        /// <param name="solutionNamesById"></param>
        /// <param name="users"></param>
        internal RowData(DBItem item, DBObjectAdapter<SolutionsHistory> solutionsHistoryAdapter,
            DBUserCollection users)
        {
            this.Item = item ?? throw new ArgumentNullException("item");
            this.SolutionsHistoryAdapter = solutionsHistoryAdapter ?? throw new ArgumentNullException("solutionsHistoryAdapter");
            this.Users = users ?? throw new ArgumentNullException("users");
        }

        private bool __init_Solutions;
        private IEnumerable<SolutionsHistory> _Solutions;
        /// <summary>
        /// Коллекция решений по карточке в соответствии с условиями.
        /// </summary>
        private IEnumerable<SolutionsHistory> Solutions
        {
            get {
                if (!__init_Solutions) {
                    _Solutions = this.SolutionsHistoryAdapter.GetObjects(
                        string.Format("[ListID] = {0} AND [ItemID] = {1}", this.Item.List.ID, this.Item.ID),
                        "ORDER BY [Date] DESC",
                        -1);
                    __init_Solutions = true;
                }
                return _Solutions;
            }
        }

        private bool __init_SolutionEventDataCollection;
        private List<SolutionEventData> _SolutionEventDataCollection;
        /// <summary>
        /// Коллекция данных по решениям.
        /// </summary>
        internal IEnumerable<SolutionEventData> SolutionEventDataCollection
        {
            get {
                if (!__init_SolutionEventDataCollection) {
                    _SolutionEventDataCollection = new List<SolutionEventData>();
                    foreach (SolutionsHistory solution in this.Solutions) {
                        DBUser user = this.Users[solution.UserLogin];
                        if (user == null || user.UserItem == null) {
                            continue;
                        }

                        string userName = user.Name;

                        DBItem userItem = user.UserItem;
                        string personnelNumber = userItem.GetStringValue(_Consts.Reports.TestsReport.PersonnelNumber);
                        string position = userItem.GetStringValue(_Consts.Reports.TestsReport.Position);
                        string department = userItem.GetStringValue(_Consts.Reports.TestsReport.Department);
                        string company = userItem.GetStringValue(_Consts.Reports.TestsReport.Company);

                        _SolutionEventDataCollection.Add(new SolutionEventData(solution.SolutionDisplayName, solution.Date, userName,
                            personnelNumber, position, department, company, solution.Roles, solution.Comment));
                    }
                    __init_SolutionEventDataCollection = true;
                }
                return _SolutionEventDataCollection;
            }
        }
    }

    /// <summary>
    /// Структрура данных по решению.
    /// </summary>
    internal struct SolutionEventData
    {
        /// <summary>
        /// Название решения.
        /// </summary>
        internal string SolutionName { get; set; }

        /// <summary>
        /// Название решения.
        /// </summary>
        internal DateTime SolutionDate { get; set; }

        /// <summary>
        /// Имя пользователя решения.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Табельный номер пользователя решения.
        /// </summary>
        public string PersonnelNumber { get; set; }

        /// <summary>
        /// Должность пользователя решения.
        /// </summary>
        public string Position { get; set; }

        /// <summary>
        /// Подразделение пользователя решения.
        /// </summary>
        public string Department { get; set; }

        /// <summary>
        /// Компания пользователя решения.
        /// </summary>
        public string Company { get; set; }

        /// <summary>
        /// Роль пользователя решения.
        /// </summary>
        public string Role { get; set; }

        /// <summary>
        /// Комментарий к решению.
        /// </summary>
        public string Comment { get; set; }

        /// <summary>
        /// Конструктор.
        /// </summary>
        /// <param name="solutionName"></param>
        /// <param name="userName"></param>
        /// <param name="comment"></param>
        internal SolutionEventData(string solutionName, DateTime solutionDate, string userName, string personnelNumber, string position,
            string department, string company, string role, string comment)
        {
            SolutionName = solutionName ?? throw new ArgumentNullException("solutionName");
            if (solutionDate == DateTime.MinValue) {
                throw new ArgumentException("solutionDate");
            }
            SolutionDate = solutionDate;
            UserName = userName ?? throw new ArgumentNullException("userName");
            PersonnelNumber = personnelNumber ?? "";
            Position = position ?? "";
            Department = department ?? "";
            Company = company ?? "";
            Role = role ?? throw new ArgumentNullException("role");
            Comment = comment;
        }
    }
}
