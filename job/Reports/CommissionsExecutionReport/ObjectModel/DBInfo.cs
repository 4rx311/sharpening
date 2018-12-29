using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Data;
using WSSC.V4.SYS.Lib;

//Константы Workflow.
using WorkflowConsts = WSSC.V4.DMS.Workflow.Consts;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Информация о схеме сайта процесса.
    /// </summary>
    public class DBInfo
    {
        /// <summary>
        /// Сайт.
        /// </summary>
        internal DBSite Site { get; private set; }

        /// <summary>
        /// Информация о схеме сайта процесса.
        /// </summary>
        /// <param name="site">Сайт.</param>
        public DBInfo(DBSite site)
        {
            if (site == null)
                throw new ArgumentNullException("site");

            this.Site = site;
        }

        private bool __init_CurrentUserID;
        private int _CurrentUserID;

        internal int CurrentUserID
        {
            get
            {
                if (!__init_CurrentUserID)
                {
                    if (this.Site.CurrentUser == null)
                        throw new Exception("Текущий пользователь не задан");

                    _CurrentUserID = this.Site.CurrentUser.ID;
                    __init_CurrentUserID = true;
                }
                return _CurrentUserID;
            }
        }

        private bool __init_CommissionsList;
        private DBList _CommissionsList;

        /// <summary>
        /// Список поручений.
        /// </summary>
        internal DBList CommissionsList
        {
            get
            {
                if (!__init_CommissionsList)
                {
                    _CommissionsList = this.CommissionsWeb.GetList("Instructions");
                    if (_CommissionsList == null)
                        throw new DBException.MissingList(this.CommissionsWeb, "Instructions");

                    __init_CommissionsList = true;
                }
                return _CommissionsList;
            }
        }

        private bool __init_CommissionsWeb;
        private DBWeb _CommissionsWeb;

        /// <summary>
        /// Узел поручений.
        /// </summary>
        private DBWeb CommissionsWeb
        {
            get
            {
                if (!__init_CommissionsWeb)
                {
                    _CommissionsWeb = this.Site.GetWeb("/dms/instructions");
                    if (_CommissionsWeb == null)
                        throw new DBException.MissingWeb(this.Site, "/dms/instructions");

                    __init_CommissionsWeb = true;
                }
                return _CommissionsWeb;
            }
        }

        private bool __init_StagesList;
        private DBList _StagesList;

        /// <summary>
        /// Список этапов поручений.
        /// </summary>
        private DBList StagesList
        {
            get
            {
                if (!__init_StagesList)
                {
                    _StagesList = this.CommissionsWeb.GetList(WorkflowConsts.listName_Stages);
                    if (_StagesList == null)
                        throw new DBException.MissingList(this.CommissionsWeb, WorkflowConsts.listName_Stages);


                    __init_StagesList = true;
                }
                return _StagesList;
            }
        }

        private bool __init_StatusesList;
        private DBList _StatusesList;

        /// <summary>
        /// Список статусов поручений.
        /// </summary>
        private DBList StatusesList
        {
            get
            {
                if (!__init_StatusesList)
                {
                    _StatusesList = this.CommissionsWeb.GetList(WorkflowConsts.listName_Statuses);
                    if (_StatusesList == null)
                        throw new DBException.MissingList(this.CommissionsWeb, WorkflowConsts.listName_Statuses);

                    __init_StatusesList = true;
                }
                return _StatusesList;
            }
        }


        private bool __init_PriorityTypesList = false;
        private DBList _PriorityTypesList;
        /// <summary>
        /// Список типов приоритетов
        /// </summary>
        public DBList PriorityTypesList
        {
            get
            {
                if (!__init_PriorityTypesList)
                {
                    DBWeb dmsWeb = this.Site.GetWeb("/dms", true);
                    _PriorityTypesList = dmsWeb.GetList("PriorityTypes", true);

                    __init_PriorityTypesList = true;
                }
                return _PriorityTypesList;
            }
        }



        /// <summary>
        /// Словарь статусов.
        /// </summary>
        private readonly Dictionary<string, int> _StatusesByName = new Dictionary<string, int>();

        /// <summary>
        /// Словарь этапов.
        /// </summary>
        private readonly Dictionary<string, int> _StagesByName = new Dictionary<string, int>();

        /// <summary>
        /// Вощвращает ID статуса с системным названием <paramref name="statusName"/>.
        /// </summary>
        /// <param name="statusName">Название статуса.</param>
        internal int GetStatusID(string statusName)
        {
            if (String.IsNullOrEmpty(statusName))
                throw new ArgumentNullException("statusName");

            if (!this._StatusesByName.ContainsKey(statusName))
            {
                string condition = String.Format("[{0}] = N'{1}'", WorkflowConsts.list_Statuses_col_Name, statusName);
                DBItem statusItem = this.StatusesList.GetItem(condition);
                if (statusItem == null)
                    throw new Exception(String.Format("Статус '{0}' не найден в списке '{1}' узла '{2}'", statusName, this.StatusesList.Name, this.StatusesList.Web.Url));

                this._StatusesByName.Add(statusName, statusItem.ID);
            }
            return this._StatusesByName[statusName];
        }

        /// <summary>
        /// Возвращает ID типа приоритета по имени
        /// </summary>
        /// <param name="priorityTypeName"></param>
        /// <returns></returns>
        internal int GetPriorityTypeID(string priorityTypeName)
        {
            if (String.IsNullOrEmpty(priorityTypeName))
                throw new ArgumentNullException("priorityTypeName");

            string condition = String.Format("[Название] = N'{0}'", priorityTypeName);
            DBItem priorityType = this.PriorityTypesList.GetItem(condition);
            if (priorityType == null)
                throw new Exception(String.Format("Тип приоритета '{0}' не найден в списке '{1}'", priorityType, this.PriorityTypesList.DisplayName));

            return priorityType.ID;
        }


        /// <summary>
        /// Возвращает ID этапа с системным названием <paramref name="stageName"/>.
        /// </summary>
        /// <param name="stageName">Название этапа.</param>
        internal int GetStageID(string stageName)
        {
            if (String.IsNullOrEmpty(stageName))
                throw new ArgumentNullException("stageName");

            if (!this._StagesByName.ContainsKey(stageName))
            {
                string condition = String.Format("[{0}] = N'{1}'", WorkflowConsts.list_Stages_col_Name, stageName);
                DBItem stageItem = this.StagesList.GetItem(condition);
                if (stageItem == null)
                    throw new Exception(String.Format("Этап '{0}' не найден на узле /dms/Instructions.", stageName));

                this._StagesByName.Add(stageName, stageItem.ID);
            }
            return this._StagesByName[stageName];
        }

        /// <summary>
        /// Возвращает значение ячейки столбца <paramref name="columnName"/> в строке поручения.
        /// </summary>
        /// <typeparam name="T">Тип значения.</typeparam>
        /// <param name="row">Строка из БД.</param>
        /// <param name="columnName">Название столбца.</param>
        internal T GetValue<T>(DataRow row, string columnName)
        {
            if (row == null)
                throw new ArgumentNullException("row");
            if (String.IsNullOrEmpty(columnName))
                throw new ArgumentNullException("columnName");

            T value = row.Field<T>(columnName);
            return value;
        }

        /// <summary>
        /// Возвращает целочисленное значение ячейки столбца <paramref name="columnName"/> в строке поручения.
        /// </summary>
        /// <param name="row">Строка из БД.</param>
        /// <param name="columnName">Название столбца.</param>
        internal int GetInteger(DataRow row, string columnName)
        {
            return this.GetValue<int?>(row, columnName) ?? 0;
        }

        /// <summary>
        /// Возвращает значение типа Дата и время ячейки столбца <paramref name="columnName"/> в строке поручения.
        /// </summary>
        /// <param name="row">Строка из БД.</param>
        /// <param name="columnName">Название столбца.</param>
        internal DateTime GetDateTime(DataRow row, string columnName)
        {
            return this.GetValue<DateTime?>(row, columnName) ?? DateTime.MinValue;
        }

        /// <summary>
        /// Преобразует условия по фильтрам в одно условие
        /// </summary>
        /// <param name="filterConditions"></param>
        /// <returns></returns>
        public string ToSqlFiltersCondition(IReportFilterConditions filterConditions)
        {
            if (filterConditions == null)
                throw new ArgumentNullException("filterConditions");

            List<string> filters = new List<string>();

            if (!String.IsNullOrEmpty(filterConditions.CompanyFilter))
                filters.Add(String.Format("({0})", filterConditions.CompanyFilter));

            if (!String.IsNullOrEmpty(filterConditions.AuthorFilter))
                filters.Add(String.Format("({0})", filterConditions.AuthorFilter));

            if (!String.IsNullOrEmpty(filterConditions.ProtocolTypeFilter))
                filters.Add(String.Format("({0})", filterConditions.ProtocolTypeFilter));

            if (!String.IsNullOrEmpty(filterConditions.PriorityFilter))
                filters.Add(String.Format("({0})", filterConditions.PriorityFilter));

            if (!filters.Any())
                return "1 = 1";

            return String.Join(" AND ", filters.ToArray());
        }

        /// <summary>
        /// Получает элемент запроса WITH выбирающий входные поручения
        /// для рассмотрения
        /// </summary>
        /// <returns></returns>
        public string GetCommissionsWith(IReportFilterConditions filterConditions, bool checkAccess, IEnumerable<int> executorIDs)
        {
            StringBuilder withBuilder = new StringBuilder();
            withBuilder.AppendFormat(@"
WITH CommissionsAll AS (
SELECT * FROM {0}
WHERE (Deleted = 0 OR Deleted IS NULL) AND ({1}) AND ([Исполнитель] {2})
), 
", this.CommissionsList.TableInfo.AggregatedName,
  this.ToSqlFiltersCondition(filterConditions),
  this.SqlINFrom(executorIDs));

            if (checkAccess)
            {
                withBuilder.AppendFormat(@"
Commissions AS (
SELECT * FROM CommissionsAll
WHERE {0}
)
",
 this.CommissionsList.GetHasAccessCondition(this.CurrentUserID, "CommissionsAll",
 DBPartitionDataType.All, this.Site.DataAdapter.Connection));
            }
            else
            {
                withBuilder.Append(@"
Commissions AS (
SELECT * FROM CommissionsAll
WHERE (1 = 1)
)
");
            }


            return withBuilder.ToString();
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="columns"></param>
        /// <param name="idStr"></param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <param name="checkAccess"></param>
        /// <returns></returns>
        internal DataTable GetDataTable(Columns columns, string idStr, DateTime startDate, DateTime endDate,
                                        bool checkAccess)
        {
            if (columns == null)
                throw new ArgumentNullException("columns");
            StringBuilder queryBuilder = new StringBuilder();


            queryBuilder.AppendFormat(@"
WITH FilteredInstructions_Primary AS (
SELECT * FROM {0}
WHERE (Deleted = 0 OR Deleted IS NULL) AND ({2})
),

FilteredInstructions_All AS (
SELECT * FROM {1}
WHERE (Deleted = 0 OR Deleted IS NULL) AND ({2})
)",
                                      this.CommissionsList.TableInfo.GetTable(DBPartitionDataType.Primary),
                                      this.CommissionsList.TableInfo.AggregatedName,
                                      String.IsNullOrEmpty(columns.FilterCondition.Trim())
                                          ? "1=1"
                                          : columns.FilterCondition);

            //Если надо проверять доступ доступ
            if (checkAccess)
            {
                queryBuilder.AppendFormat(@",
AccessibleInstructions_Primary AS (
SELECT * FROM FilteredInstructions_Primary
WHERE {0}
),


AccessibleInstructions_All AS (
SELECT * FROM FilteredInstructions_All
WHERE {1}
)",
                                          this.CommissionsList.GetHasAccessCondition(this.CurrentUserID,
                                                                                     "FilteredInstructions_Primary",
                                                                                     DBPartitionDataType.Primary,
                                                                                     this.Site.DataAdapter.Connection),
                                          this.CommissionsList.GetHasAccessCondition(this.CurrentUserID,
                                                                                     "FilteredInstructions_All",
                                                                                     DBPartitionDataType.All,
                                                                                     this.Site.DataAdapter.Connection));

            }

            queryBuilder.Append(@"
, UserInstructionsState AS(");
            for (int i = 0; i < columns.Count; i++)
            {
                string partQuery = this.CreateQueryByColumn(columns, i, idStr, checkAccess);
                queryBuilder.Append(partQuery);

                if (i != columns.Count - 1)
                    queryBuilder.Append(@"
UNION ALL ");
            }
            queryBuilder.Append(@"
) 


SELECT Исполнитель,");
            for (int i = 0; i < columns.Count; i++)
            {
                Column column = columns[i];
                //Суммируем значения по каждой колонке в конце
                queryBuilder.AppendFormat(@"
SUM([{0}]) AS [{0}]", column.Name);
                if (i != columns.Count - 1)
                    queryBuilder.Append(@"
,");
            }
            queryBuilder.Append(@"
FROM UserInstructionsState WITH(NOLOCK) " +

                                //строки, где хотя бы один столбец > 0
                                "WHERE (" + String.Join(" OR ", columns.Select(x => "[" + x.Name + "]>0").ToArray()) +
                                ")" +
                                "GROUP BY Исполнитель");

            string endDateStr = "'" + endDate.ToString("yyyy-MM-dd HH:mm:ss") + "'";
            string startDateStr = "'" + startDate.ToString("yyyy-MM-dd HH:mm:ss") + "'";
            queryBuilder = queryBuilder.Replace("@endDate", endDateStr).Replace("@startDate", startDateStr);
            string query = queryBuilder.ToString();
            this.Site.DataAdapter.CommandTimeout = 5 * 60; //5мин
            DataTable table = this.Site.DataAdapter.GetDataTable(query);
            return table;
        }

        /// <summary>
        /// Часть IN запроса из чисел
        /// </summary>
        /// <param name="integers"></param>
        /// <returns></returns>
        public  string SqlINFrom(IEnumerable<int> integers)
        {
            if (integers == null || !integers.Any())
                throw new ArgumentNullException("integers");

            return String.Format(" IN ({0})", String.Join(", ", integers.Select(i => i.ToString()).ToArray()));
        }

        /// <summary>
        /// Возвращает запрос(ы) для столбца.
        /// </summary>
        /// <param name="columns">Столбцы.</param>
        /// <param name="index">Индекс текущего столбца.</param>
        /// <param name="idStr"></param>
        /// <param name="checkAccess"></param>
        /// <returns>Запрос для столбца.</returns>
        internal string CreateQueryByColumn(Columns columns, int index, string idStr, bool checkAccess)
        {
            if (columns == null)
                throw new ArgumentNullException("columns");
            if (index < 0)
                throw new ArgumentNullException("index", "Индекс не должен быть отрицательным");
            if (index >= columns.Count)
                throw new ArgumentNullException("index", "Переданный индекс находится вне границ массива");

            Column currentColumn = columns[index];
            StringBuilder sb = new StringBuilder();
            string templateQuery = @"
SELECT [Исполнитель], @countQuery 
FROM @tableName AS Instructions WITH(NOLOCK)
@optionalJoin
WHERE @condition 
@executionerCondition
GROUP BY [Исполнитель]";

            if (String.IsNullOrEmpty(currentColumn.CustomJoinCondition))
            {
                templateQuery = templateQuery.Replace("@optionalJoin", "");
            }
            else
            {
                templateQuery = templateQuery.Replace("@optionalJoin", currentColumn.CustomJoinCondition);
            }

            string primaryTableName;
            if (checkAccess)
            {
                primaryTableName = currentColumn.PartitionType == DBPartitionDataType.All
                    ? "AccessibleInstructions_All"
                    : "AccessibleInstructions_Primary";
            }
            else
            {
                primaryTableName = currentColumn.PartitionType == DBPartitionDataType.All
                    ? "FilteredInstructions_All"
                    : "FilteredInstructions_Primary";
            }

            //Задаём условие для выборки из основной таблицы, т.к. для всех столбцов основная точно используется
            sb.Append(templateQuery.Replace("@tableName", primaryTableName));

            //Добавляем архивное условие, если необходимо
            /*
            if (currentColumn.PartitionType == DBPartitionDataType.All &&
                this.CommissionsList.TableInfo.ArchiveTable != null)
            {
                string archiveTableName =
                    this.CommissionsList.TableInfo.ArchiveTable.GetQueryName(this.CommissionsList.TableInfo.Connection);

                sb.Append(@"
UNION ALL
" + templateQuery.Replace("@tableName", archiveTableName));
            }
            */
             
            string executionerCondition = String.IsNullOrEmpty(idStr)
                ? ""
                : String.Format(" AND [Исполнитель] IN ({0})", idStr);
            primaryTableName += ")";

            sb.Replace("@countQuery", this.GetCountQuery(columns, index))
              .Replace("@condition", currentColumn.Condition)
              .Replace("@accessCondition", primaryTableName)
              .Replace("@executionerCondition", executionerCondition);
            return sb.ToString();
        }

        /// <summary>
        /// Возвращает часть выборки количеств (после SELECT [Исполнитель],).
        /// </summary>
        /// <param name="columns">Столбцы отчёта.</param>
        /// <param name="index">Индекс текущего столбца.</param>
        /// <returns>Часть условия по выборке количеств.</returns>
        private string GetCountQuery(Columns columns, int index)
        {
            StringBuilder countQueryBuilder = new StringBuilder();
            for (int i = 0; i < columns.Count; i++)
            {
                Column currentColumn = columns[i];

                string countStr = "0";
                if (index == i)
                {
                    if (String.IsNullOrEmpty(currentColumn.CustomSelectCondition))
                        countStr = "COUNT(ID)";
                    else
                        countStr = currentColumn.CustomSelectCondition;
                }
                    

                countQueryBuilder.Append(countStr + " AS [" + currentColumn.Name + "]");

                if (i != columns.Count - 1)
                    countQueryBuilder.Append(",");
            }
            return countQueryBuilder.ToString();
        }
    }
}