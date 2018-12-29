using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.DBObjects;
using WSSC.V4.SYS.Lib;
using System.Data;
using WSSC.V4.SYS.Lib.Data;
namespace WSSC.V4.DMS.OMK.ComplexReports
{
    /// <summary>
    /// Отчет по исполнению поручений
    /// </summary>
    public class CommissionsExecutionReportManager
    {//todo: привести здесь все в порядок

        /// <summary>
        /// Список поручений
        /// </summary>
        public readonly DBList CommissionsList;
        /// <summary>
        /// Начало отчетного периода
        /// </summary>
        public readonly DateTime StartDate;
        /// <summary>
        /// Конец отчетного периода
        /// </summary>
        public readonly DateTime EndDate;
        /// <summary>
        /// Список id выбранных компаний
        /// </summary>
        public readonly List<int> Companies;
        /// <summary>
        /// Список id выбранных авторов
        /// </summary>
        public readonly List<int> Authors;
        /// <summary>
        /// Выводить всех
        /// </summary>
        public readonly bool ShowAll;
        /// <summary>
        /// Значение фильтра вид протокола
        /// </summary>
        public readonly List<int> ProtocolTypes;

        public CommissionsExecutionReportManager(DBList commissionsList, DateTime startDate, DateTime endDate, List<int> companies, List<int> authors,List<int> protocolTypes, bool checkAccess, bool showAll)
        {
            if (commissionsList == null)
                throw new ArgumentNullException("commissionsList");
            CommissionsList = commissionsList;
            StartDate = startDate;
            EndDate = endDate;
            Companies = companies;
            Authors = authors;
            CheckAccess = checkAccess;
            ShowAll = showAll;
            this.ProtocolTypes = protocolTypes;
        }



        private bool __init_ProtocolsCondition = false;
        private string _ProtocolsCondition;
        /// <summary>
        /// Доп. условие на поле "Вид протокола" карточки
        /// </summary>
        public string ProtocolsCondition
        {
            get
            {
                if (!__init_ProtocolsCondition)
                {
                    if (this.ProtocolTypes != null && this.ProtocolTypes.Any()) {
                        _ProtocolsCondition = string.Format("[{0}] IN ({1})", _Consts.Lists.Commissions.Fields.ProtocolType, ProtocolTypes.Select(x => x.ToString()).Aggregate((x, y) => x + "," + y));
                    }
                    else {
                        _ProtocolsCondition = string.Empty;
                    }
                    __init_ProtocolsCondition = true;
                }
                return _ProtocolsCondition;
            }
        }



        private bool __init_CompaniesSelectCondition = false;
        private string _CompaniesSelectCondition;
        /// <summary>
        /// Доп. условие на поле "Компания" карточки
        /// </summary>
        public string CompaniesSelectCondition
        {
            get
            {
                if (!__init_CompaniesSelectCondition)
                {
                    if (Companies != null && Companies.Any())
                    {
                        _CompaniesSelectCondition = string.Format("[{0}] IN ({1})", _Consts.CommExecutionReport.Instructions.Company, Companies.Select(x => x.ToString()).Aggregate((x, y) => x + "," + y));
                    }
                    else
                    {
                        _CompaniesSelectCondition = string.Empty;
                    }
                    __init_CompaniesSelectCondition = true;
                }
                return _CompaniesSelectCondition;
            }
        }

        private bool __init_AuthorsCondition = false;
        private string _AuthorsCondition;
        /// <summary>
        /// Условие на авторов поручения
        /// </summary>
        public string AuthorsCondition
        {
            get
            {
                if (!__init_AuthorsCondition)
                {
                    if (Authors != null && Authors.Any())
                    {
                        _AuthorsCondition = string.Format("[{0}] IN ({1})", _Consts.CommExecutionReport.Instructions.Author, Authors.Select(x => x.ToString()).Aggregate((x, y) => x + "," + y));
                    }
                    else
                    {
                        _AuthorsCondition = string.Empty;
                    }
                    __init_AuthorsCondition = true;
                }
                return _AuthorsCondition;
            }
        }

        private bool __init_StageIdLookup = false;
        private Dictionary<string, int> _StageIdLookup;
        /// <summary>
        /// Словарь подстановочных id для этапов 
        /// </summary>
        public Dictionary<string, int> StageIdLookup
        {
            get
            {
                if (!__init_StageIdLookup)
                {
                    try
                    {
                        DBList stageList = CommissionsList.Web.GetList(_Consts.Lists.Stages.ListName);
                        string formatQuery = "[" + _Consts.Lists.CommonFields.Name + "] = N'{0}'";
                        _StageIdLookup = new Dictionary<string, int>();
                        _StageIdLookup.Add(_Consts.Lists.Stages.Execution, GetItemIdWithCheck(stageList, string.Format(formatQuery, _Consts.Lists.Stages.Execution)));
                        _StageIdLookup.Add(_Consts.Lists.Stages.ExecutonCtrl, GetItemIdWithCheck(stageList, string.Format(formatQuery, _Consts.Lists.Stages.ExecutonCtrl)));
                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Ошибка заполнения словаря подстановочных id для этапов.", ex);
                    }
                    __init_StageIdLookup = true;
                }
                return _StageIdLookup;
            }
        }

        private bool __init_StatusIdLookup = false;
        private Dictionary<string, int> _StatusIdLookup;
        /// <summary>
        /// Подстановочные id для статусов
        /// </summary>
        public Dictionary<string, int> StatusIdLookup
        {
            get
            {
                if (!__init_StatusIdLookup)
                {
                    try
                    {
                        DBList statusList = CommissionsList.Web.GetList(_Consts.Lists.Statuses.ListName);
                        string formatQuery = "[" + _Consts.Lists.CommonFields.Name + "] = N'{0}'";
                        _StatusIdLookup = new Dictionary<string, int>() { };
                        _StatusIdLookup.Add(_Consts.Lists.Statuses.Completed, GetItemIdWithCheck(statusList, string.Format(formatQuery, _Consts.Lists.Statuses.Completed)));
                        _StatusIdLookup.Add(_Consts.Lists.Statuses.Executed, GetItemIdWithCheck(statusList, string.Format(formatQuery, _Consts.Lists.Statuses.Executed)));
                        _StatusIdLookup.Add(_Consts.Lists.Statuses.ExecutedAndApproved, GetItemIdWithCheck(statusList, string.Format(formatQuery, _Consts.Lists.Statuses.ExecutedAndApproved)));
                        _StatusIdLookup.Add(_Consts.Lists.Statuses.Annulirovano, GetItemIdWithCheck(statusList, string.Format(formatQuery, _Consts.Lists.Statuses.Annulirovano)));

                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Ошибка заполнения словаря подстановочных id для статусов.", ex);
                    }
                    __init_StatusIdLookup = true;
                }
                return _StatusIdLookup;
            }
        }

        /// <summary>
        /// Получить ID элемента по запросу
        /// </summary>
        int GetItemIdWithCheck(DBList list, string query)
        {
            if (list == null)
                throw new ArgumentNullException("list");
            if (string.IsNullOrEmpty(query))
                throw new ArgumentNullException("query");
            DBItem item = list.GetItem(query);
            if (item == null)
                throw new DBException.MissingItem(list, query);
            return item.ID;
        }

        /// <summary>
        /// Сформировать отчет по исполнению поручений пользователями.
        /// </summary>
        public List<List<DataField>> GetReport(List<DBItem> users)
        {
            var t = CommissionsList.GetHasAccessCondition(this.User.ID);

            if (users == null)
                throw new ArgumentNullException("users");

            List<List<DataField>> table = new List<List<DataField>>();
            int rowNumber = 1;
            //номера столбцов
            table.Add(Enumerable.Range(1, 17).Select(x => new DataField() { value = x.ToString() }).ToList());

            FillDictionary(users.Select(x => x.ID).ToList());

            foreach (DBItem user in users)
            {
                DataRow commList = null;
                if (CommissionsDictionary.ContainsKey(user.ID))
                    commList = CommissionsDictionary[user.ID];
                if ((commList == null && ShowAll) || commList != null)
                {
                    List<DataField> row = GenerateReportRow(rowNumber, user, commList);
                    table.Add(row);
                    rowNumber++;
                }
            }

            return table;
        }

        string GetUsersCondition(List<int> users)
        {
            return string.Format(" [Исполнитель] IN ({0}) ", string.Join(",", users.Select(x => x.ToString()).ToArray()));
        }

        public bool CheckAccess;

        private bool __init_User = false;
        private DBUser _User;
        public DBUser User
        {
            get
            {
                if (!__init_User)
                {
                    _User = DBSite.Current.Context.CurrentUser;
                    if (_User == null)
                        throw new Exception("Не удалось получить текущего пользователя");
                    __init_User = true;
                }
                return _User;
            }
        }


        // заполнить словарь
        void FillDictionary(List<int> users)
        {
            //slice
            BuildQuriesDict();
            if (((double)users.Count / this.CommissionsList.Site.UsersList.ItemsCount) < 0.8)
            {
                List<List<int>> slices = users.Slice(500);
                foreach (List<int> slice in slices)
                {
                    var userCond = string.Join(",", slice.Select(x => x.ToString()).ToArray());
                    FillDict(string.Format("[Исполнитель] IN ({0})", userCond));
                }
            }
            else
            {
                FillDict();
            }
        }

        private void FillDict(string usersCond = "")
        {

            List<string> s = new List<string>();
            var access = (this.CheckAccess) ? " AND " + this.CommissionsList.GetHasAccessCondition(this.User.ID, "Instructions") : string.Empty;
            foreach (var item in queriesDict)
            {
                s.Add(GetColumnQuery(item.Key, item.Value + Environment.NewLine + GetFilterCond() + access+ " AND ([Deleted] is null OR [Deleted]=0)", usersCond));
            }

            string query = GetQueryWrapper(s);
            DataTable dataTable = this.CommissionsList.Site.DataAdapter.GetDataTable(query, new SqlParameter("@endDate", this.EndDate), new SqlParameter("@startDate", this.StartDate));
            foreach (DataRow datarow in dataTable.Rows)
            {
                var executorID = datarow.Field<int?>("Исполнитель");
                if (executorID != null)
                    if (!this.CommissionsDictionary.ContainsKey((int)executorID))
                        this.CommissionsDictionary.Add((int)executorID, datarow);
            }
        }


        string GetFilterCond()
        {
            return string.Format("{0} {1} {2}",
                /*0*/ string.IsNullOrEmpty(AuthorsCondition) ? string.Empty : "and " + AuthorsCondition,
                /*1*/ string.IsNullOrEmpty(CompaniesSelectCondition) ? string.Empty : "and " + CompaniesSelectCondition,
                /*2*/ string.IsNullOrEmpty(ProtocolsCondition) ? string.Empty : "and " + ProtocolsCondition);

        }

        //словарь  id исполнителя
        public Dictionary<int, DataRow> CommissionsDictionary = new Dictionary<int, DataRow>();


        Dictionary<int, string> queriesDict = new Dictionary<int, string>();


        /// <summary>
        /// Строка отчета по 1 пользователю
        /// </summary>
        private List<DataField> GenerateReportRow(int rowNumber, DBItem userItem, DataRow userCommissions)
        {
            if (userItem == null)
                throw new ArgumentNullException("userItem");

            List<DataField> row = new List<DataField>();
            //1 №
            AddDataToRow(row, rowNumber.ToString());

            //2 ФИО
            AddDataToRow(row, userItem.GetStringValue(_Consts.Lists.Users.Fields.UserName));

            //3 Должность
            AddDataToRow(row, userItem.GetStringValue(_Consts.Lists.Users.Fields.Position));

            if (userCommissions == null)
            {
                Enumerable.Repeat(0, 14).ToList().ForEach(x => AddDataToRow(row, 0));
                return row;
            }
            int row4Value = userCommissions.Field<int?>(1) ?? 0;
            AddDataToRow(row, row4Value);

            int row5Value = userCommissions.Field<int?>(2) ?? 0;
            AddDataToRow(row, row5Value);


            int row6Value = userCommissions.Field<int?>(3) ?? 0;
            AddDataToRow(row, row6Value);


            int row7Value = userCommissions.Field<int?>(4) ?? 0;
            AddDataToRow(row, row7Value);




            int row8Value = userCommissions.Field<int?>(5) ?? 0;
            AddDataToRow(row, row8Value);


            int row9Value = userCommissions.Field<int?>(6) ?? 0;
            AddDataToRow(row, row9Value);


            int row10Value = userCommissions.Field<int?>(7) ?? 0;
            AddDataToRow(row, row10Value);


            int row11Value = userCommissions.Field<int?>(8) ?? 0;
            AddDataToRow(row, row11Value);

            int row12Value = userCommissions.Field<int?>(9) ?? 0;
            AddDataToRow(row, row12Value);

            int row13Value = userCommissions.Field<int?>(10) ?? 0;
            AddDataToRow(row, row13Value);

            int row14Value = userCommissions.Field<int?>(12) ?? 0;
            AddDataToRow(row, row14Value);

            //15 % выполненных в срок поручений
            int row15value = (row4Value - row5Value) > 0 ? (int)(((double)(row7Value + row8Value) / (row4Value - row5Value)) * 100) : 0;
            AddDataToRow(row, row15value);


            //16 % выполненных точно в срок поручений
            int row16value = (row4Value - row5Value) > 0 ? (int)(((double)(row7Value) / (row4Value - row5Value)) * 100) : 0;
            AddDataToRow(row, row16value);


            //17 % выполненных
            int row17value = row4Value - row5Value > 0 ? (int)(((double)(row6Value) / (row4Value - row5Value)) * 100) : 0;
            AddDataToRow(row, row17value);

            return row;
        }

        private void BuildQuriesDict()
        {
            //проверка пустого фильтра для отчетного периода
            var resolverExecuted = " AND [" + _Consts.Lists.Commissions.Fields.Executed + "] <= @endDate AND [" + _Consts.Lists.Commissions.Fields.Executed + "] >= @startDate ";

            var subquery = string.Format(
                "(([" + _Consts.CommExecutionReport.Instructions.Ordered + "] <= @endDate  AND [" + _Consts.CommExecutionReport.Instructions.Ordered + "] >= @startDate ) OR ({0}))",

                string.Format("([{0}] < @startDate AND ([{1}] is null OR [{1}] > @startDate))", _Consts.CommExecutionReport.Instructions.Ordered, _Consts.Lists.Commissions.Fields.Executed));

            //4 Всего выдано в отчетном периоде
            var query4 = string.Format(
                "[{0}] <> {1} AND {2}  ",
                /*0*/_Consts.Lists.Commissions.Fields.Status,
                /*1*/StatusIdLookup[_Consts.Lists.Statuses.Annulirovano],
                /*2*/subquery);

            this.queriesDict.Add(0, query4);

            //5  Срок не наступил
            var executedBeforeCondition = "AND [" + _Consts.Lists.Commissions.Fields.ExecuteBefore + "] < @endDate";

            var query5 = string.Format(
                "[{0}] <> {1} AND {2}  AND ([{3}] > @endDate)",
                /*0*/_Consts.Lists.Commissions.Fields.Status,
                /*1*/StatusIdLookup[_Consts.Lists.Statuses.Annulirovano],
                /*2*/subquery,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(1, query5);

            //6  Выполнено – Всего в отчетном периоде
            string statusInQuery = string.Format(" [{0}] IN ({1},{2},{3}) {4}  ",
                /*0*/_Consts.Lists.Commissions.Fields.Status,
                /*1*/StatusIdLookup[_Consts.Lists.Statuses.Executed],
                /*2*/StatusIdLookup[_Consts.Lists.Statuses.Completed],
                /*3*/StatusIdLookup[_Consts.Lists.Statuses.ExecutedAndApproved],
                /*4*/resolverExecuted);

            var stBig = statusInQuery + resolverExecuted.Replace(_Consts.Lists.Commissions.Fields.Executed, _Consts.Lists.Commissions.Fields.ExecuteBefore);
            var query6 = statusInQuery + executedBeforeCondition;

            this.queriesDict.Add(2, query6);



            //7  Выполнено – из них в срок – первоначальный срок - в отчетном периоде
            var query7 = string.Format(
                "{0} AND ([{1}] <> 1 OR [{1}] IS NULL) AND [{2}] < [{3}]  ",
                /*0*/stBig,
                /*1*/_Consts.CommExecutionReport.Instructions.DeadlineChanged,
                /*2*/_Consts.Lists.Commissions.Fields.Executed,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(3, query7);

            //8  Выполнено – из них в срок – скорректированный срок (перенос срока) - в отчетном периоде
            var query8 = string.Format(
                "{0} AND [{1}] = 1 AND [{2}] < [{3}] ",
                /*0*/stBig,
                /*1*/_Consts.CommExecutionReport.Instructions.DeadlineChanged,
                /*2*/_Consts.Lists.Commissions.Fields.Executed,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(4, query8);

            //9  Выполнено - из них не в срок (первоначальный срок) - в отчетном периоде
            var query9 = string.Format(
                "{0} AND ([{1}] <> 1 OR [{1}] IS NULL)  AND [{2}] > [{3}] ",
                /*0*/query6,
                /*1*/_Consts.CommExecutionReport.Instructions.DeadlineChanged,
                /*2*/_Consts.Lists.Commissions.Fields.Executed,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(5, query9);


            //10 Выполнено – из них не в срок (перенесенный срок) - в отчетном периоде
            var query10 = string.Format(
                "{0} AND ([{1}] = 1) AND [{2}] > [{3}]",
                /*0*/stBig,
                /*1*/_Consts.CommExecutionReport.Instructions.DeadlineChanged,
                /*2*/_Consts.Lists.Commissions.Fields.Executed,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(6, query10);

            //11 Всего поручений, находящихся в работе за отчетный период
            var query11 = string.Format(
                "[{0}] = {1} AND {2} <= @endDate",
                /*0*/_Consts.Lists.Commissions.Fields.Stage,
                /*1*/StageIdLookup[_Consts.Lists.Stages.Execution],
                /*2*/_Consts.CommExecutionReport.Instructions.Ordered);
            this.queriesDict.Add(7, query11);



            //12  На исполнении – срок истек на конец отчетного периода (запроса на перенос срока не было)
            var query12 =
                string.Format(
                "[{0}] = {1} AND ([{2}] <> 1 OR [{2}] IS NULL)  AND [{3}] < @endDate",
                /*0*/_Consts.Lists.Commissions.Fields.Stage,
                /*1*/StageIdLookup[_Consts.Lists.Stages.Execution],
                /*2*/_Consts.CommExecutionReport.Instructions.DeadlineChanged,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(8, query12);

            // 13 На исполнении – скорректированный срок (перенос срока истек)
            var query13 =
                string.Format(
                "[{0}] = {1} AND [{2}] = 1   AND [{3}] < @endDate",
                /*0*/_Consts.Lists.Commissions.Fields.Stage,
                /*1*/StageIdLookup[_Consts.Lists.Stages.Execution],
                /*2*/_Consts.CommExecutionReport.Instructions.DeadlineChanged,
                /*3*/_Consts.Lists.Commissions.Fields.ExecuteBefore);

            this.queriesDict.Add(9, query13);

            // 14 Поручения, находящиеся на контроле у Автора в статусе "исполнено", "исполнено и подтверждено"	 
            var query14 = string.Format(
                "[{0}] = {1} AND ([{2}] IS NULL ) {3}",
                /*0*/_Consts.Lists.Commissions.Fields.Stage,
                /*1*/StageIdLookup[_Consts.Lists.Stages.ExecutonCtrl],
                /*2*/_Consts.Lists.Commissions.Fields.Controller,
                /*3*/ "AND [" + _Consts.CommExecutionReport.Instructions.Ordered + "] <= @endDate");

            this.queriesDict.Add(10, query14);
        }


        int allcolCount = 14;
        // var userconcat = string.Join(",", userIds.Select(x => x.ToString()).ToArray());


        string getCountstring(int colIndexFormZero, int allcolCount)
        {
            var sb = new List<string>();
            for (int i = 0; i < allcolCount; i++)
            {
                if (colIndexFormZero == i)
                {
                    sb.Add(string.Format("  COUNT(ID)  AS Col{0}  ", i));
                }
                else
                {
                    sb.Add(string.Format("  0 AS Col{0}  ", i));
                }
            }
            return string.Join(" , ", sb.ToArray());
        }

        string GetSumString(int allcolCount)
        {
            var sb = new List<string>();
            for (int i = 0; i < allcolCount; i++)
            {
                sb.Add(string.Format("  SUM(Col{0})  AS Column{0}  ", i));
            }
            return string.Join(" , ", sb.ToArray());
        }
        private string GetColumnQuery(int colIndexFromZero, string columnQuery, string userCondition)
        {
            var countStr = getCountstring(colIndexFromZero, allcolCount);
            if (!string.IsNullOrEmpty(columnQuery))
                columnQuery = " AND " + columnQuery;
            if (!string.IsNullOrEmpty(userCondition))
                userCondition = " AND " + userCondition;
            var querty = string.Format(@"
                SELECT [Исполнитель] , {0}
                FROM {1} AS Instructions WITH(NOLOCK)
                WHERE 
                [Исполнитель] IS NOT NUll
                {2} 
                {3}
                GROUP BY [Исполнитель]",
                                       countStr,
                                       CommissionsList.TableInfo.AggregatedName,
                                       userCondition,
                                       columnQuery);
            return querty;
        }

        private string GetQueryWrapper(IEnumerable<string> queries)
        {
            if (queries == null)
                throw new ArgumentNullException("queries");

            string withInnerText = string.Join("   UNION ALL   ", queries.ToArray());
            string sumStr = GetSumString(allcolCount);
            string query = string.Format(@"
                WITH UserInstructionsState AS(
                    {0}
                )
                SELECT [Исполнитель], {1}
                FROM UserInstructionsState
                GROUP BY [Исполнитель]
            ", withInnerText, sumStr);
            return query;
        }



        private void AddDataToRow(List<DataField> row, int intValue)
        {
            AddDataToRow(row, intValue.ToString());
        }

        private void AddDataToRow(List<DataField> row, string stringValue)
        {
            if (row == null)
                throw new ArgumentNullException("row");
            row.Add(new DataField()
                {
                    value = stringValue ?? string.Empty
                }
            );
        }


    }
}
