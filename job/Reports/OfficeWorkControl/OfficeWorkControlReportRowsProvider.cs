using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.TableSection;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports.OfficeWorkControl
{
    /// <summary>
    /// Класс для получения строк отчёта
    /// </summary>
    internal static class OfficeWorkControlReportRowsProvider
    {
        /// <summary>
        /// Получить строки
        /// </summary>
        /// <param name="items">Коллекция карточек, по которым строится отчёт</param>
        /// <param name="filter">Фильтры картотеки</param>
        /// <param name="solutions">Коллекция решений о согласовании</param>
        /// <returns>Строки, сформированные по карточкам, отфильтрованные по фильтру</returns>
        internal static IEnumerable<OfficeWorkControlRow> GetRows(IEnumerable<DBItem> items, OfficeWorkControlReportFilter filter, IEnumerable<string> solutions, DBSite site)
        {
            if (items == null)
                throw new ArgumentNullException("items");

            if (filter == null)
                throw new ArgumentNullException("filter");

            if (solutions == null)
                throw new ArgumentNullException("solutions");

            List<OfficeWorkControlRow> toret = new List<OfficeWorkControlRow>();

            DBObjectAdapter<DMSAgrPersonStatistics> statisticsAdapter = new DBObjectAdapter<DMSAgrPersonStatistics>(site.SiteConnectionString);
            DBObjectAdapter<SolutionsHistory> historyAdapter = new DBObjectAdapter<SolutionsHistory>(site.SiteConnectionString);

            List<SqlParameter> sqlParameters = new List<SqlParameter>() {
                new SqlParameter("@userId", filter.AgreementPerson.ID),
                new SqlParameter("@dateStart", filter.StartPeriod),
                new SqlParameter("@dateEnd", filter.EndPeriod)
            };

            List<SqlParameter> sqlSolutionsParameters = new List<SqlParameter>() {
                new SqlParameter("@userId", filter.AgreementPerson.ID),
                new SqlParameter("@dateStart", filter.StartPeriod),
                new SqlParameter("@dateEnd", filter.EndPeriod)
            };

            string itemsCondition = String.Join(" OR ", items.GroupBy(i => i.List.ID).Select(g =>
            {
                return String.Format("([ListID] = {0} AND [ItemID] IN ({1}))", g.Key, String.Join(", ", g.Select(i => i.ID.ToString()).ToArray()));
            }).ToArray());

            string solutionsCondition = String.Join(", ", solutions.Select(x => String.Format("N'{0}'", x)).ToArray());

            string statQuery = String.Format(@"[UserID] = @userId AND [DateEnd] BETWEEN @dateStart AND @dateEnd AND ({0})", itemsCondition);
            string solutionsQuery = String.Format("[Date] BETWEEN @dateStart AND @dateEnd AND [SolutionName] IN ({0}) AND ({1})", solutionsCondition, itemsCondition);

            Dictionary<string, DBItem> itemsDict = items.ToDictionary(x => String.Format("{0}_{1}", x.List.ID, x.ID));
            Dictionary<string, List<DMSAgrPersonStatistics>> statDict = statisticsAdapter.GetObjects(statQuery, null, -1, sqlParameters.ToArray())
                .GroupBy(x => String.Format("{0}_{1}", x.ListID, x.ItemID)).ToDictionary(gr => gr.Key, val => val.ToList());
            Dictionary<string, List<SolutionsHistory>> historiesDict = historyAdapter.GetObjects(solutionsQuery, null, -1, sqlSolutionsParameters.ToArray())
                .GroupBy(x => String.Format("{0}_{1}", x.ListID, x.ItemID)).ToDictionary(gr => gr.Key, val => val.ToList());

            List<OfficeWorkControlRow> result = new List<OfficeWorkControlRow>();

            foreach (KeyValuePair<string, DBItem> pair in itemsDict)
            {
                if (!statDict.ContainsKey(pair.Key) || !historiesDict.ContainsKey(pair.Key))
                    continue;

                List<DMSAgrPersonStatistics> userStat = statDict[pair.Key];
                foreach (SolutionsHistory history in historiesDict[pair.Key])
                {
                    //находим запись, которая закрылась по решению, проверяя что она существует
                    DMSAgrPersonStatistics endStat = userStat.FirstOrDefault(x => x.DateEnd == history.Date);
                    if (endStat == null)
                        continue;

                    //находим все записи для согласующего для данной итерации
                    List<DMSAgrPersonStatistics> statistics = userStat
                        .Where(x => x.AgrBlockID == endStat.AgrBlockID && x.ProcessUserID == endStat.ProcessUserID
                            && x.Iteration == endStat.Iteration && x.RoleType == Workflow.Consts.DMSAgrPersonStatistics.RoleTypes.AgrRoleType)
                        .ToList();

                    if (statistics.Count == 0)
                        continue;

                    result.Add(new OfficeWorkControlRow(
                        pair.Value,
                        statistics.Min(x => x.DateStart),
                        endStat.DateEnd,
                        statistics.Sum(x => x.Time)));
                }
            }

            return result;
        }

        /// <summary>
        /// Проверяет строку поля "Заместители" версии элемента списка пользователей
        /// </summary>
        /// <param name="row">Строка</param>
        /// <param name="web">Узел карточки</param>
        /// <param name="solutionDate">Дата принятия решения</param>
        /// <param name="userId">Искомый заместитель</param>
        /// <returns>True, если искомый заместитель был актуален на переданную дату на переданном узле, иначе False</returns>
        private static bool CheckDeputyRow(TSRow row, DBWeb web, DateTime solutionDate, int userId)
        {
            if (row == null)
                throw new ArgumentNullException("row");
            if (web == null)
                throw new ArgumentNullException("web");
            if (userId < 1)
                throw new ArgumentOutOfRangeException("userId", userId, "ID должен быть натуральным числом");

            DBList processesList = web.Site.RootWeb.GetList(Workflow.Consts.listName_ProcessList, true);
            DBItem processItem = processesList.GetItem(Workflow.Consts.list_ProcessList_col_ProcessUrl, web.RelativeUrl);
            if (processItem == null)
                throw new Exception("В списке процессов не задан элемент для узла " + web.RelativeUrl);
            DBItem allProcessesItem = processesList.GetItem(String.Format("[{0}] IS NULL OR [{0}] = ''", WSSC.V4.DMS.Workflow.Consts.list_ProcessList_col_ProcessUrl));
            if (allProcessesItem == null)
                throw new Exception("В списке процессов не задан элемент для всех процессов");

            if (row[Workflow.Consts.list_AllUsers_col_Deputies_TS_User] != userId.ToString())
                return false;
            if (row[Workflow.Consts.list_AllUsers_col_Deputies_TS_Process] != processItem.ID.ToString() && row[Workflow.Consts.list_AllUsers_col_Deputies_TS_Process] != allProcessesItem.ID.ToString())
                return false;
            if (row[Workflow.Consts.list_AllUsers_col_Deputies_TS_IsActive] != "true")
                return false;
            string startDateString = row[WSSC.V4.DMS.Workflow.Consts.list_AllUsers_col_Deputies_TS_StartDate];
            string endDateString = row[WSSC.V4.DMS.Workflow.Consts.list_AllUsers_col_Deputies_TS_EndDate];
            DateTime startDate;
            DateTime endDate;
            if (String.IsNullOrEmpty(startDateString))
                startDate = DateTime.MinValue;
            else
                startDate = DateTime.Parse(startDateString);
            if (String.IsNullOrEmpty(endDateString))
                endDate = DateTime.MaxValue;
            else
                endDate = DateTime.Parse(endDateString);
            if (solutionDate < startDate || solutionDate > endDate)
                return false;

            return true;
        }
    }
}
