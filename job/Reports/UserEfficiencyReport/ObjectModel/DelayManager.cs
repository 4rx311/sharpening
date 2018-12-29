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
    /// <typeparam name="T"></typeparam>
    public abstract class DelayManager<T>
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="userItems"></param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        public DelayManager(DBSite site, List<DBItem> userItems, DateTime startDate, DateTime endDate)
        {
            if (site == null)
                throw new ArgumentNullException("site");

            if (userItems == null || userItems.Count == 0)
                throw new ArgumentNullException("userItems");

            this.Site = site;
            this.UsersDict = userItems.ToDictionary(x => x.ID);
            this.DateStart = startDate;
            this.Now = DateTime.Now;
            this.DateEnd = endDate != DateTime.MinValue ? endDate : this.Now;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="userItems"></param>
        /// <param name="startDate"></param>
        public DelayManager(DBSite site, List<DBItem> userItems, DateTime startDate)
        {
            if (site == null)
                throw new ArgumentNullException("site");

            if (userItems == null)
                throw new ArgumentNullException("userItems");

            this.Site = site;
            this.UsersDict = userItems.ToDictionary(x => x.ID);
            this.DateStart = startDate;
            this.Now = DateTime.Now;
            this.DateEnd = this.Now;
        }


        /// <summary>
        /// 
        /// </summary>
        protected DBSite Site { get; set; }

        private Dictionary<int, DBItem> _UsersDict;
        /// <summary>
        /// 
        /// </summary>
        public Dictionary<int, DBItem> UsersDict
        {
            get { return _UsersDict; }
            private set { _UsersDict = value; }
        }

        private DateTime _DateStart;
        /// <summary>
        /// 
        /// </summary>
        public DateTime DateStart
        {
            get { return _DateStart; }
            set { _DateStart = value; }
        }

        private DateTime _DateEnd;
        /// <summary>
        /// 
        /// </summary>
        public DateTime DateEnd
        {
            get { return _DateEnd; }
            set { _DateEnd = value; }
        }

        private DateTime _Now;

        public DateTime Now
        {
            get { return _Now; }
            set { _Now = value; }
        }

        private bool __init_DBAdapter = false;
        private DBObjectAdapter<T> _DBAdapter;
        /// <summary>
        /// 
        /// </summary>
        protected DBObjectAdapter<T> DBAdapter
        {
            get
            {
                if (!__init_DBAdapter)
                {
                    _DBAdapter = new DBObjectAdapter<T>(this.Site.SiteConnectionString);
                    __init_DBAdapter = true;
                }
                return _DBAdapter;
            }
        }

        private bool __init_EDMSWeb = false;
        private DBWeb _EDMSWeb;
        /// <summary>
        /// 
        /// </summary>
        public DBWeb EDMSWeb
        {
            get
            {
                if (!__init_EDMSWeb)
                {
                    _EDMSWeb = this.Site.RootWeb.Webs.First(t => t.Url.ToLower().Contains("dms"));
                    __init_EDMSWeb = true;
                }
                return _EDMSWeb;
            }
        }

        private bool __init_DelaysQuery = false;
        private string _DelaysQuery;
        /// <summary>
        /// Запрос на получение объектов просрочки.
        /// </summary>
        private string DelaysQuery
        {
            get
            {
                if (!__init_DelaysQuery)
                {
                    _DelaysQuery = string.Format("[UserID] in ({0}) ",
                        String.Join(",", this.UsersDict.Keys.Select(x => x.ToString()).ToArray()));

                    string additionalQuery = this.GetDatesQuery();
                    if (!String.IsNullOrEmpty(additionalQuery))
                        _DelaysQuery += String.Format(" AND {0}", additionalQuery);

                    __init_DelaysQuery = true;
                }
                return _DelaysQuery;
            }
        }

        protected abstract string GetDatesQuery();

        private bool __init_QueryParams = false;
        private Dictionary<string, SqlParameter> _QueryParams;
        /// <summary>
        /// Параметры запроса на получение объектов просрочки.
        /// </summary>
        private Dictionary<string, SqlParameter> QueryParams
        {
            get
            {
                if (!__init_QueryParams)
                {
                    _QueryParams = new Dictionary<string, SqlParameter>();
                    __init_QueryParams = true;
                }
                return _QueryParams;
            }
        }

        /// <summary>
        /// Добавляет параметр в коллекцию параметров запроса объектов просрочки.
        /// </summary>
        /// <param name="param"></param>
        protected void AddQueryParam(SqlParameter param)
        {
            if (param == null)
                throw new ArgumentNullException("param");

            if (this.QueryParams.ContainsKey(param.ParameterName))
                throw new Exception(String.Format("Коллекция уже содержит параметр c именем: {0}", param.ParameterName));

            this.QueryParams.Add(param.ParameterName, param);
        }

        private bool __init_DelaysByUserID = false;
        private Dictionary<int, List<T>> _DelaysByUserID;
        /// <summary>
        /// 
        /// </summary>
        public Dictionary<int, List<T>> DelaysByUserID
        {
            get
            {
                if (!__init_DelaysByUserID)
                {
                    _DelaysByUserID = new Dictionary<int, List<T>>();
                    List<T> delays = null;

                    string selectCondition = this.DelaysQuery;

                    if (this.QueryParams.Count == 0)
                        delays = this.DBAdapter.GetObjects(selectCondition);
                    else
                        delays = this.DBAdapter.GetObjects(selectCondition, String.Empty, -1, this.QueryParams.Values.ToArray());

                    if (delays != null && delays.Count > 0)
                        _DelaysByUserID = this.ToUserDictionary(delays);

                    __init_DelaysByUserID = true;
                }
                return _DelaysByUserID;
            }
        }

        private bool __init_MoveBackwardHours = false;
        private double _MoveBackwardHours;
        /// <summary>
        /// 
        /// </summary>
        protected double MoveBackwardHours
        {
            get
            {
                if (!__init_MoveBackwardHours)
                {
                    _MoveBackwardHours = 0;

                    if (this.DateEnd != DateTime.MinValue && this.DateEnd != this.Now)
                        _MoveBackwardHours = this.GetWorkHours(this.DateEnd, DateTime.Now);
                    __init_MoveBackwardHours = true;
                }
                return _MoveBackwardHours;
            }
        }

        protected double GetWorkHours(DateTime startDate, DateTime endDate)
        {
            if (startDate > DateTime.Now)
                return 0;
            if (startDate > endDate)
                return 0;
            return WorkTimeServices.GetWorkHours(startDate, endDate, this.EDMSWeb, true);
        }

        public UserDelaysInfo GetUserInfo(int itemID)
        {
            //по пользователю не получались данные по просрочке.
            if (!this.UsersDict.ContainsKey(itemID))
                return null;

            //данные о просрочке отсутствуют, возвращаем пустуб строку. 
            if (!this.DelaysByUserID.ContainsKey(itemID))
                return new UserDelaysInfo(this.UsersDict[itemID])
                {
                    DelayedHours = 0,
                    SpentHours = 0
                };

            return this.GetUserInfo(this.UsersDict[itemID], this.DelaysByUserID[itemID]);
        }

        protected abstract Dictionary<int, List<T>> ToUserDictionary(List<T> delays);

        protected abstract UserDelaysInfo GetUserInfo(DBItem userItem, List<T> delays);
    }
}
