using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Источник фильтров.
    /// </summary>
    public interface IReportFilterConditions
    {
        /// <summary>
        /// Фильтр по компании.
        /// </summary>
        string CompanyFilter { get; }

        /// <summary>
        /// Фильтр по автору.
        /// </summary>
        string AuthorFilter { get; }

        /// <summary>
        /// Фильтр по протоколу.
        /// </summary>
        string ProtocolTypeFilter { get; }

        /// <summary>
        /// Фильтр по приоритету
        /// </summary>
        string PriorityFilter { get; }
    }
}
