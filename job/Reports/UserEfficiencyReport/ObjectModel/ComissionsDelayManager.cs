using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.Lib.DBObjects;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib;

namespace WSSC.V4.DMS.OMK
{
    /// <summary>
    /// 
    /// </summary>
    public class ComissionsDelayManager : DelayManager<UserCommissionDelay>
    {
        private List<int> Aautor;
        private int? Priority;                       

        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="userItems"></param>
        /// <param name="dateStart"></param>
        /// <param name="dateEnd"></param>
        public ComissionsDelayManager(DBSite site, List<DBItem> userItems, DateTime dateStart, DateTime dateEnd, List<int> autor, int? priority)
            : base(site, userItems, dateStart, dateEnd)
        {
            this.Aautor = autor;
            this.Priority = priority;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        protected override string GetDatesQuery()
        {
            string query = String.Empty;
            string endDatePart = String.Empty;
            string startDatePart = String.Empty;

            if (this.DateStart > DateTime.MinValue)
            {
                startDatePart = " ([SendTime] is NULL or [SendTime] >= @startDate)";
                SqlParameter start = new SqlParameter("@startDate", this.DateStart);
                start.SqlDbType = System.Data.SqlDbType.DateTime;
                this.AddQueryParam(start);
            }

            if (this.DateEnd > DateTime.MinValue)
            {
                endDatePart = " [AcceptTime] <= @endDate";
                SqlParameter end = new SqlParameter("@endDate", this.DateEnd);
                end.SqlDbType = System.Data.SqlDbType.DateTime;
                this.AddQueryParam(end);
            }

            if (!String.IsNullOrEmpty(endDatePart))
                query = endDatePart;

            if (!String.IsNullOrEmpty(startDatePart))
            {
                if (!String.IsNullOrEmpty(query))
                    query += String.Format(" AND {0}", startDatePart);
                else
                    query = startDatePart;
            }

            // Фильтрация по кастомным фильтрам.      
            List<string> conditions = new List<string>(); 
                                
            if (this.Aautor.Count > 0)
            {
                string conditionOnAutor = this.GetConditionOnMultiLookupField(_Consts.Reports.UserEfficiencyReport.AuthorFieldName, this.Aautor);
                
                if (!string.IsNullOrEmpty(conditionOnAutor)) 
                {
                    conditions.Add(conditionOnAutor);
                }
            }
                                
            if (this.Priority.HasValue)
            {
                string conditionOnPriority = this.GetConditionOnLookupField(_Consts.Reports.UserEfficiencyReport.PriorityFieldName, this.Priority.Value);
                
                if (!string.IsNullOrEmpty(conditionOnPriority))
                {
                    conditions.Add(conditionOnPriority);
                }
            }        
  
            if (conditions.Count > 0)
            {
                conditions.Add("([Deleted] IS NULL OR [Deleted] = 0)");

                string customCondition = string.Format("[ItemID] IN (SELECT [ID] FROM [{0}] WITH(NOLOCK) WHERE {1})", 
                    _Consts.Lists.Commissions.ViewTableName, string.Join(" AND ", conditions.ToArray()));

                if (!string.IsNullOrEmpty(query))
                {
                    query += string.Format(" AND {0}", customCondition);
                }
                else
                {
                    query = customCondition;
                }
            }

            return query;
        }

        private string GetConditionOnLookupField(string fieldName, int lookupID) 
        {
            string condition = string.Empty;

            if (lookupID == -1) // все 
            {

            }
            else if (lookupID == -2) // любое значение
            {
                
            }
            else if (lookupID == -3) // пусто
            {
                condition = string.Format("([{0}] IS NULL OR [{0}] = 0)", fieldName);
            }
            else
            {
                condition = string.Format("[{0}] = {1}", fieldName, lookupID);
            }

            return condition;
        }
        
        private string GetConditionOnMultiLookupField(string fieldName, List<int> listOfLookupID)
        {
            string condition = string.Empty;

            if (listOfLookupID.Contains(-1)) // все 
            {

            }
            else if (listOfLookupID.Contains(-2)) // любое значение
            {

            }
            else if (listOfLookupID.Contains(-3)) // пусто
            {
                condition = string.Format("([{0}] IN ({1}) OR [{0}] IS NULL OR [{0}] = 0)", 
                    fieldName, string.Join(",", listOfLookupID.ConvertAll(i => i.ToString()).ToArray()));
            }
            else
            {
                condition = string.Format("[{0}] IN ({1})", 
                    fieldName, string.Join(",", listOfLookupID.ConvertAll(i => i.ToString()).ToArray()));
            }

            return condition;
        }        

        /// <summary>
        /// 
        /// </summary>
        /// <param name="delays"></param>
        /// <returns></returns>
        protected override Dictionary<int, List<UserCommissionDelay>> ToUserDictionary(List<UserCommissionDelay> delays)
        {
            if (delays == null)
                throw new ArgumentNullException("delays");

            return delays.GroupBy(x => x.UserID).ToDictionary(gr => gr.Key, y => y.ToList());
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userItem"></param>
        /// <param name="delays"></param>
        /// <returns></returns>
        protected override UserDelaysInfo GetUserInfo(DBItem userItem, List<UserCommissionDelay> delays)
        {
            if (userItem == null)
                throw new ArgumentNullException("userItem");

            if (delays == null)
                throw new ArgumentNullException("delays");

            UserDelaysInfo delaysInfo = new UserDelaysInfo(userItem)
            {               
                Executed = 0,
                InWork = 0,
                Delayed = 0,
                Returned = 0,
                DelayedBySolution = 0,
                DelayedHours = 0,
                SpentHours = 0
            };

            foreach (UserCommissionDelay delay in delays)
            {
                double hoursBack = this.MoveBackwardHours;
                double delayedHours = 0;

                if (delay.SendTime > DateTime.MinValue)
                {
                    delaysInfo.Executed++;
                    hoursBack = this.GetWorkHours(this.DateEnd, delay.SendTime);
                }
                else
                    delaysInfo.InWork++;

                if (hoursBack == 0)
                    delayedHours = delay.DelayedHours;
                else
                    if (delay.DelayedHours > hoursBack)
                        delayedHours = delay.DelayedHours - hoursBack;

                //просрочено
                if (delayedHours > 0)
                    delaysInfo.Delayed++;

                //возвращено
                if (delay.IsReturned)
                    delaysInfo.Returned++;

                //перенесен срок.
                if (delay.IsDelayed)
                    delaysInfo.DelayedBySolution++;

                delaysInfo.DelayedHours += delayedHours;
                delaysInfo.SpentHours += (delay.SpentHours > hoursBack) ? delay.SpentHours - hoursBack : 0;
            }            

            return delaysInfo;
        }
    }
}
