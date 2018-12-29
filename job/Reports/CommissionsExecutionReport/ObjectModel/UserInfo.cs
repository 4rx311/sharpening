using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.ComplexReports;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;

//Константы Workflow.
using Consts = WSSC.V4.DMS.OMK._Consts.Reports.CommissionsExecutionReport;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Информация о пользователе.
    /// </summary>
    internal class UserInfo : IRPDataRow
    {
        /// <summary>
        /// ID пользователя.
        /// </summary>
        internal readonly int UserID;

        /// <summary>
        /// Отчёт.
        /// </summary>
        private readonly CommissionExecutionReport Report;


        /// <summary>
        /// Строка данных.
        /// </summary>
        internal readonly DataRow Row;

        internal UserInfo(int userID, CommissionExecutionReport report)
        {
            if (report == null)
                throw new ArgumentNullException("report");

            this.Report = report;
            this.UserID = userID;
        }

        /// <summary>
        /// Информация о пользователе.
        /// </summary>
        /// <param name="userID">ID пользователя.</param>
        /// <param name="row">Строка данных.</param>
        /// <param name="report">Отчёт.</param>
        internal UserInfo(int userID, DataRow row, CommissionExecutionReport report)
            : this(userID, report)
        {
            this.Row = row;
        }

        /// <summary>
        /// Информация о пользователе, без DataRow по поручениям.
        /// </summary>
        /// <param name="userItem"></param>
        /// <param name="report">Отчёт.</param>
        /*internal UserInfo(DBItem userItem, CommissionExecutionReport report)
            : this(userItem.ID, null, report)
        {
            if (userItem == null)
                throw new ArgumentNullException("userItem");

            this._UserItem = userItem;
            this.__init_UserItem = true;
        }*/

        /// <summary>
        /// Элемент списка, сопоставленный со строкой отчёта.
        ///             Значение может отсутствовать, в случае если строка отчёта не сопоставлена с элементом списка.
        /// </summary>
        public DBItem Item
        {
            get { return this.UserItem; }
        }

        private bool __init_User;
        private DBUser _User;
        /// <summary>
        /// Пользователь.
        /// </summary>
        private DBUser User
        {
            get
            {
                if (!__init_User)
                {
                    _User = this.Report.DBInfo.Site.GetUser(this.UserID, true);
                    if (_User == null)
                        throw new Exception("Пользователь с ID=" + this.UserID + " - не найден.");

                    __init_User = true;
                }
                return _User;
            }
        }

        private bool __init_UserItem;
        private DBItem _UserItem;
        /// <summary>
        /// Карточка пользователя.
        /// </summary>
        private DBItem UserItem
        {
            get
            {
                if (!__init_UserItem)
                {
                    _UserItem = this.User.UserItem;
                    __init_UserItem = true;
                }
                return _UserItem;
            }
        }

        private bool __init_FIO;
        private string _FIO;
        /// <summary>
        /// Имя пользователя.
        /// </summary>
        internal string FIO
        {
            get
            {
                if (!__init_FIO)
                {
                    _FIO = this.User.Name ?? String.Empty;
                    __init_FIO = true;
                }
                return _FIO;
            }
        }

        private bool __init_Post;
        private string _Post;
        /// <summary>
        /// Должность.
        /// </summary>
        internal string Post
        {
            get
            {
                if (!__init_Post)
                {
                    _Post = this.UserItem.GetStringValue(Consts.Post) ?? "";
                    __init_Post = true;
                }
                return _Post;
            }
        }

        private bool __init_Values;
        private Dictionary<ColumnType, object> _Values;
        /// <summary>
        /// Значения.
        /// </summary>
        internal Dictionary<ColumnType, object> Values
        {
            get
            {
                if (!__init_Values)
                {
                    _Values = new Dictionary<ColumnType, object>();
                    if (this.Row == null)
                    {
                        foreach (Column col in this.Report.Columns)
                        {
                            _Values.Add(col.Type, 0);
                        }
                    }
                    else
                    {
                        if (this.Row.ItemArray.Length - 1 != this.Report.Columns.Count)
                            throw new Exception("Неверная длина полученной строки.");

                        //skip ID исполнителя
                        for (int i = 1; i < this.Row.ItemArray.Length; i++)
                        {
                            object value = this.Row.ItemArray[i];
                            Column column = this.Report.Columns[i - 1];

                            ColumnType columnType = column.Type;
                            if (!_Values.ContainsKey(columnType))
                                _Values.Add(columnType, value);
                        }
                    }
                    __init_Values = true;
                }
                return _Values;
            }
        }
    }
}