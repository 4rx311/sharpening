using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.SYS.DBFramework;
using ObtainStatus = WSSC.V4.DMS.Jobs.Consts.UserDelayStatistics.ObtainStatus;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет коллекцию просрочек пользователя за определенный период.
    /// </summary>
    public class UserDelaysCollection
    {
        /// <summary>
        /// К-тор.
        /// </summary>
        /// <param name="user">Пользователь.</param>
        /// <param name="startTime">Дата начала периода.</param>
        /// <param name="endTime">Дата окончания периода.</param>
        internal UserDelaysCollection(DBItem userItem, DateTime startTime, DateTime endTime)
        {
            if (userItem == null)
                throw new ArgumentNullException("userItem");

            this.UserItem = userItem;
            this.PeriodStart = startTime;
            this.PeriodEnd = endTime;
        }

        /// <summary>
        /// Пользователь.
        /// </summary>
        private DBItem UserItem { get; set; }

        /// <summary>
        /// Дата начала периода.
        /// </summary>
        internal DateTime PeriodStart { get; private set; }

        /// <summary>
        /// Дата окончания периода.
        /// </summary>
        internal DateTime PeriodEnd { get; private set; }

        private bool __init_DelaysList = false;
        private List<UserDocumentDelay> _DelaysList;
        /// <summary>
        /// Список просрочки по документам.
        /// </summary>
        public List<UserDocumentDelay> DelaysList
        {
            get
            {
                if (!__init_DelaysList)
                {
                    _DelaysList = new List<UserDocumentDelay>();
                    __init_DelaysList = true;
                }
                return _DelaysList;
            }
        }

        private bool __init_TotalDelay;
        private double _TotalDelay;
        /// <summary>
        /// Суммарная просрочка.
        /// </summary>
        internal double TotalDelay
        {
            get
            {
                if (!__init_TotalDelay)
                {
                    _TotalDelay = this.DelaysList.Sum(x => x.Delay);
                    __init_TotalDelay = true;
                }
                return _TotalDelay;
            }
        }

        private bool __init_TotalSpentTime;
        private double _TotalSpentTime;
        /// <summary>
        /// Суммарное время обработки.
        /// </summary>
        internal double TotalSpentTime
        {
            get
            {
                if (!__init_TotalSpentTime)
                {
                    _TotalSpentTime = this.DelaysList.Sum(x => x.TimeSpent);
                    __init_TotalSpentTime = true;
                }
                return _TotalSpentTime;
            }
        }

        private bool __init_ItemsDict = false;
        private Dictionary<int, List<int>> _ItemsDict;
        /// <summary>
        /// Словарь идентификаторов документов по спискам.
        /// </summary>
        public Dictionary<int, List<int>> ItemsDict
        {
            get
            {
                if (!__init_ItemsDict)
                {
                    _ItemsDict = this.DelaysList.GroupBy(x => x.ListID).ToDictionary(gr => gr.Key, v => v.Select(y => y.ItemID).Distinct().ToList());
                    __init_ItemsDict = true;
                }
                return _ItemsDict;
            }
        }

        /// <summary>
        /// Добавляет новые данные о просрочке в коллекцию.
        /// </summary>
        /// <param name="delay"></param>
        internal void AddDelay(UserDocumentDelay delay)
        {
            if (delay == null)
                throw new ArgumentNullException("delay");

            if (delay.UserID != this.UserItem.ID)
                return;

            this.DelaysList.Add(delay);
            this.ResetDelaysInfo();
        }

        /// <summary>
        /// Очищает рассчитанные результаты по добавленным просрочкам.
        /// </summary>
        private void ResetDelaysInfo()
        {
            __init_ItemsDict = false;
            __init_TotalDelay = false;
            __init_TotalSpentTime = false;
        }

        /// <summary>
        /// Возвращает общее кол-во документов.
        /// </summary>
        /// <returns></returns>
        internal int GetAllCount()
        {
            return this.ItemsDict.Sum(x => x.Value.Count);
        }

        /// <summary>
        /// Возвращает кол-во документов в работе.
        /// </summary>
        /// <returns></returns>
        internal int GetInWorkCount()
        {
            IEnumerable<UserDocumentDelay> delays = null;
            if (this.PeriodEnd != DateTime.MinValue)
                delays = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.Delay == 0 && (x.EndTime > this.PeriodEnd || x.EndTime == DateTime.MinValue));
            else
                delays = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.Delay == 0 && x.EndTime == DateTime.MinValue);

            Dictionary<int, List<int>> itemsDict = delays.GroupBy(y => y.ListID).ToDictionary(gr => gr.Key, val => val.Select(c => c.ItemID).Distinct().ToList());

            return itemsDict.Sum(x => x.Value.Count);
        }

        /// <summary>
        /// Возвращает кол-во обработанных документов.
        /// </summary>
        /// <returns></returns>
        internal int GetProcessedCount()
        {
            IEnumerable<UserDocumentDelay> delays = null;
            if (this.PeriodEnd != DateTime.MinValue)
                delays = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.EndTime != DateTime.MinValue && x.EndTime < this.PeriodEnd);
            else
                delays = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.EndTime != DateTime.MinValue);

            Dictionary<int, List<int>> itemsDict = delays.GroupBy(y => y.ListID).ToDictionary(gr => gr.Key, val => val.Select(c => c.ItemID).Distinct().ToList());

            return itemsDict.Sum(x => x.Value.Count);
        }

        /// <summary>
        /// Возвращает кол-во документов, обработанных в срок.
        /// </summary>
        /// <returns></returns>
        internal int GetProcessedOnTimeCount()
        {
            IEnumerable<UserDocumentDelay> delays = null;
            if (this.PeriodEnd != DateTime.MinValue)
                delays = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.Delay == 0 && (x.EndTime != DateTime.MinValue && x.EndTime < this.PeriodEnd));
            else
                delays = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.Delay == 0 && (x.EndTime != DateTime.MinValue));

            Dictionary<int, List<int>> itemsDict = delays.GroupBy(y => y.ListID).ToDictionary(gr => gr.Key, val => val.Select(c => c.ItemID).Distinct().ToList());

            return itemsDict.Sum(x => x.Value.Count);
        }

        /// <summary>
        /// Возвращает кол-во просроченных документов.
        /// </summary>
        /// <returns></returns>
        internal int GetDelayedCount()
        {
            Dictionary<int, List<int>> itemsDict = this.DelaysList.Where(x => x.ObtainStatus != ObtainStatus.Canceled && x.Delay > 0)
                   .GroupBy(y => y.ListID).ToDictionary(gr => gr.Key, val => val.Select(c => c.ItemID).Distinct().ToList());

            return itemsDict.Sum(x => x.Value.Count);
        }
    }
}
