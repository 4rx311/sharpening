using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Base;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет базовый класс построителя отчета по срокам согласования.
    /// </summary>
    public abstract class AgrReportBuilder : RPCustomBuilder
    {
        public AgrReportBuilder(RPTableBuilder builder)
            : base(builder)
        { }

        private bool __init_AgrStatAdapter = false;
        private DBObjectAdapter<DMSAgrPersonStatistics> _AgrStatAdapter;
        /// <summary>
        /// Адаптер статистики по согласующим.
        /// </summary>
        public DBObjectAdapter<DMSAgrPersonStatistics> AgrStatAdapter
        {
            get
            {
                if (!__init_AgrStatAdapter)
                {
                    _AgrStatAdapter = new DBObjectAdapter<DMSAgrPersonStatistics>(this.Site.SiteConnectionString);
                    __init_AgrStatAdapter = true;
                }
                return _AgrStatAdapter;
            }
        }

        private bool __init_DelayAdapter = false;
        private DBObjectAdapter<UserDocumentDelay> _DelayAdapter;
        /// <summary>
        /// Адаптер записей статистики просрочки документов.
        /// </summary>
        public DBObjectAdapter<UserDocumentDelay> DelayAdapter
        {
            get
            {
                if (!__init_DelayAdapter)
                {
                    _DelayAdapter = new DBObjectAdapter<UserDocumentDelay>(this.Site.SiteConnectionString);
                    __init_DelayAdapter = true;
                }
                return _DelayAdapter;
            }
        }

        /// <summary>
        /// Дата начала отчетного периода.
        /// </summary>
        public abstract DateTime PeriodStart { get; }

        /// <summary>
        /// Дата окончания отчетного периода.
        /// </summary>
        public abstract DateTime PeriodEnd { get; }

        private bool __init_ListIDs = false;
        private List<int> _ListIDs;
        /// <summary>
        /// Идентификаторы списков по которым считается статистика.
        /// </summary>
        public List<int> ListIDs
        {
            get
            {
                if (!__init_ListIDs)
                {
                    _ListIDs = new List<int>();

                    if (this.CustomSettings != null && this.CustomSettings.HasChildNodes)
                    {
                        XmlNodeList listNodes = this.CustomSettings.DocumentElement.SelectNodes("Lists/List");
                        foreach (XmlNode node in listNodes)
                        {
                            string webUrl = XmlAttributeReader.GetValue(node, "WebUrl");
                            if (!String.IsNullOrEmpty(webUrl))
                            {
                                DBWeb web = this.Site.GetWeb(webUrl, true);

                                string listName = XmlAttributeReader.GetValue(node, "Name");
                                if (!String.IsNullOrEmpty(listName))
                                {
                                    DBList list = web.GetList(listName, true);
                                    if (!_ListIDs.Contains(list.ID))
                                        _ListIDs.Add(list.ID);
                                }
                            }
                        }
                    }

                    if (_ListIDs.Count == 0)
                        _ListIDs.Add(120);

                    __init_ListIDs = true;
                }
                return _ListIDs;
            }
        }

        private bool __init_ListsQueryString = false;
        private string _ListsQueryString;
        /// <summary>
        /// 
        /// </summary>
        public string ListsQueryString
        {
            get
            {
                if (!__init_ListsQueryString)
                {
                    _ListsQueryString = String.Join(",", this.ListIDs.ConvertAll(x => x.ToString()).ToArray());
                    __init_ListsQueryString = true;
                }
                return _ListsQueryString;
            }
        }        
    }
}
