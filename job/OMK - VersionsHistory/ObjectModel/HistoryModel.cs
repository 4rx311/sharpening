using System;
using System.Collections.Generic;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Reports.VersionsHistory
{
    /// <summary>
    /// Класс данных о версии карточки
    /// </summary>
    internal class HistoryModel
    {
        /// <summary>
        /// Версия
        /// </summary>
        internal int Version { get; set; }

        /// <summary>
        /// Дата изменения
        /// </summary>
        internal DateTime Date { get; set; }

        /// <summary>
        /// Автор изменений
        /// </summary>
        internal DBUser Author { get; set; }

        /// <summary>
        /// Этап
        /// </summary>
        internal string Stage { get; set; }

        /// <summary>
        /// Перечень измененных полей
        /// </summary>
        internal List<string> ChangedFields { get; set; }

        /// <summary>
        /// Удалено?
        /// </summary>
        internal bool Deleted { get; set; }
    }
}
