using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK
{
    /// <summary>
    /// Данные по просрочке пользователя.
    /// </summary>
    public class UserDelaysInfo
    {
        /// <summary>
        /// К-тор.
        /// </summary>
        /// <param name="user">Пользователь.</param>
        public UserDelaysInfo(DBItem user)
        {
            if (user == null)
                throw new ArgumentNullException("user");

            this.Item = user;
        }

        public UserDelaysInfo()
        {
            
        }

        /// <summary>
        /// Пользователь.
        /// </summary>
        public DBItem Item { get; private set; }
        
        private int _Executed;
        /// <summary>
        /// Кол-во обработанных документов .
        /// </summary>
        public int Executed
        {
            get { return _Executed; }
            set { _Executed = value; }
        }

        private int _InWork;
        /// <summary>
        /// Кол-во документов в работе.
        /// </summary>
        public int InWork
        {
            get { return _InWork; }
            set { _InWork = value; }
        }
        private int _Delayed;
        /// <summary>
        /// Кол-во просроченных документов.
        /// </summary>
        public int Delayed
        {
            get { return _Delayed; }
            set { _Delayed = value; }
        }

        private int _Returned;
        /// <summary>
        /// Кол-во возвращенных документов.
        /// </summary>
        public int Returned
        {
            get { return _Returned; }
            set { _Returned = value; }
        }

        private int _DelayedBySolution;
        /// <summary>
        /// Кол-во просроченных по решению документов.
        /// </summary>
        public int DelayedBySolution
        {
            get { return _DelayedBySolution; }
            set { _DelayedBySolution = value; }
        }

        private double _DelayedHours;
        /// <summary>
        /// Общее время просрочки.
        /// </summary>
        public double DelayedHours
        {
            get { return _DelayedHours; }
            set { _DelayedHours = value; }
        }

        private double _SpentHours;
        /// <summary>
        /// Общее время работы с документом.
        /// </summary>
        public double SpentHours
        {
            get { return _SpentHours; }
            set { _SpentHours = value; }
        }
    }
}
