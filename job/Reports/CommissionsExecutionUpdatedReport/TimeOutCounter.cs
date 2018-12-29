using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport
{
    /// <summary>
    /// Класс для подсчёта просрочки
    /// </summary>
    public class TimeOutCounter
    {
        /// <summary>
        /// Конечная дата отчётного периода
        /// </summary>
        private DateTime ReportPeriodEnd;

        /// <summary>
        /// Карточка пользователя
        /// </summary>
        private DBItem UserItem;

        public TimeOutCounter(DateTime reportPeriodEnd, DBItem userItem)
        {
            if (userItem == null)
                throw new ArgumentNullException("userItem");

            this.ReportPeriodEnd = reportPeriodEnd;
            this.UserItem = userItem;
        }

        /// <summary>
        /// Считает для определенного типа приоритета
        /// </summary>
        /// <param name="priorityType"></param>
        /// <returns></returns>
        public int CountForPriorityType(string priorityType)
        {
            //Получить все карточки по запросу

            //Для каждой посчитать просрочку с учетом расписания и т.д.



            throw new NotImplementedException();
        }
    }
}
