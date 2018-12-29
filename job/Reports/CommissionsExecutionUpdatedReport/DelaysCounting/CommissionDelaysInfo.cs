using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.Lib.Utilities;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport.DelaysCounting
{
    /// <summary>
    /// Информация по просрочке получаемая из БД
    /// </summary>
    public class CommissionDelaysInfo
    {
        /// <summary>
        /// Как должна рассчитываться задержка
        /// </summary>
        public HowToCountDelay HowToCountDelay { get; set; }

        /// <summary>
        /// Дата, до которой необходимо было исполнить поручение
        /// </summary>
        public DateTime ExecuteBefore { get; set; }

        /// <summary>
        /// ID пользователя для которого рассчитывается просрочка
        /// </summary>
        public int UserID { get; set; }

        /// <summary>
        /// Просрочка из таблицы
        /// </summary>
        public double DelayedHours { get; set; }

        /// <summary>
        /// Высчитывает просрочку за указанный период
        /// </summary>
        /// <returns></returns>
        public double GetDelayFor(DateTime reportEndDate, WorkTimeService worktimeService)
        {
            if (worktimeService == null)
                throw new ArgumentNullException("worktimeService");

            switch (this.HowToCountDelay)
            {
                case HowToCountDelay.FromTable:
                    return this.DelayedHours;
                case HowToCountDelay.ExecutedAfterReportPeriod:
                    return worktimeService.GetWorkTime(this.ExecuteBefore, reportEndDate).TotalHours;
                case HowToCountDelay.NotExecuted:
                    return worktimeService.GetWorkTime(this.ExecuteBefore, reportEndDate).TotalHours;
                default:
                    throw new InvalidOperationException("Не известное состояние расчёта");
            }
        }
    }

    /// <summary>
    /// Как считать просрочку
    /// </summary>
    public enum HowToCountDelay
    {
        FromTable = 0,
        ExecutedAfterReportPeriod = 1,
        NotExecuted = 2
    }
}
