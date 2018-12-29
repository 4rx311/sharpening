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
    public class DocumentsDelayManager : DelayManager<UserDocumentDelay>
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="userItems"></param>
        /// <param name="dateStart"></param>
        /// <param name="dateEnd"></param>
        public DocumentsDelayManager(DBSite site, List<DBItem> userItems, DateTime dateStart, DateTime dateEnd)
            : base(site, userItems, dateStart, dateEnd)
        { }

        protected override string GetDatesQuery()
        {
            string query = string.Empty;

            bool hasStartTime = false;
            bool hasEndTime = false;

            //задано начало периода
            if (this.DateStart != DateTime.MinValue)
            {
                SqlParameter start = new SqlParameter("@startDate", this.DateStart);
                start.SqlDbType = System.Data.SqlDbType.DateTime;
                this.AddQueryParam(start);
                hasStartTime = true;

            }

            //задано окончание периода
            if (this.DateEnd != DateTime.MinValue)
            {
                SqlParameter end = new SqlParameter("@endDate", this.DateEnd);
                end.SqlDbType = System.Data.SqlDbType.DateTime;
                this.AddQueryParam(end);
                hasEndTime = true;
            }

            //если документ не в работе, то он либо начался до конца интервала, либо он заканчивается в указанный интервал
            string queryPart = "";
            if (hasStartTime && hasEndTime)
                //НЕ  конец интервала меньше С и начало интервала больше До
                queryPart = " and ([StartTime] <= @endDate and [EndTime] >= @startDate) ";
            else
                if (hasStartTime && !hasEndTime)
                    queryPart = " and [EndTime] >= @startDate ";
                else
                    if (!hasStartTime && hasEndTime)
                        queryPart = " and [StartTime] <= @endDate ";


            query = " [StartTime] is not null and ([EndTime] is null " + (hasEndTime ? " and [StartTime] <= @endDate " : " ") +
                " or [EndTime] is not null " + queryPart + ")";

            return query;
        }

        protected override Dictionary<int, List<UserDocumentDelay>> ToUserDictionary(List<UserDocumentDelay> delays)
        {
            if (delays == null)
                throw new ArgumentNullException("delays");

            return delays.GroupBy(x => x.UserID).ToDictionary(gr => gr.Key, y => y.ToList());
        }

        /// <summary>
        /// Получение данных по пользователю.
        /// </summary>
        /// <param name="userItem"></param>
        /// <param name="delays"></param>
        /// <returns></returns>
        protected override UserDelaysInfo GetUserInfo(DBItem userItem, List<UserDocumentDelay> delays)
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
                DelayedHours = 0,
                SpentHours = 0
            };

            foreach (UserDocumentDelay delay in delays)
            {
                double delayedHours = 0;

                //кол-во часов, которые отсчитываются назад(если задана дата окончания отчета и в этот момент документ был в работе). 
                double hoursBack = this.MoveBackwardHours;

                //не в работе
                if (delay.ObtainStatus != WSSC.V4.DMS.Jobs.Consts.UserDelayStatistics.ObtainStatus.InWork)
                {
                    if (delay.ObtainStatus == WSSC.V4.DMS.Jobs.Consts.UserDelayStatistics.ObtainStatus.Obtained)
                        delaysInfo.Executed++;

                    //получение остатка часов
                    if (delay.EndTime != DateTime.MinValue)
                        hoursBack = this.GetWorkHours(this.DateEnd, delay.EndTime);
                }
                //в работе
                else
                {
                    delaysInfo.InWork++;
                }                

                //считаем на сколько часов документ просрочен
                if (hoursBack == 0)
                    delayedHours = delay.Delay;
                else
                    if (delay.Delay > hoursBack)
                        delayedHours = delay.Delay - hoursBack;

                if (delayedHours > 0)
                    delaysInfo.Delayed++;

                //всего просрочка
                delaysInfo.DelayedHours += delayedHours;

                //всего потрачено
                delaysInfo.SpentHours += (delay.TimeSpent > hoursBack) ? delay.TimeSpent - hoursBack : 0;
            }            

            return delaysInfo;
        }
    }
}
