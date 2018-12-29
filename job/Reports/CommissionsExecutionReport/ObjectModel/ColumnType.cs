using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Тип столбца.
    /// </summary>
    public enum ColumnType : int
    {
        TotalOut = 1,
        NotYet = 2,
        TotalCompleted = 3,
        CompletedInFirstTime = 4,
        CompletedCorrected = 5,
        CompletedNotInFirstTime = 6,
        CompletedIncorrect = 7,
        TotalCommissions = 8,
        OnExecutionExpired = 9,
        OnExecutionCorrected = 10,
        Controller = 11

        //Типы из обновлённого отчёта
        ,ShouldBeExecuted = 12,
        ExecutedInReportPeriod = 13,
        NotExecutedInReportPeriod = 14,
        AvarageTimeOut = 15,
        AvarageNotCriticalTimeOut = 16
    }
}
