using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using WSSC.V4.SYS.Lib.Data;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport.DelaysCounting
{
    /// <summary>
    /// Осуществляет приведение строки БД
    /// к указанному типу по названиям свойств и столбцов
    /// </summary>
    public class DataTableMapper
    {
        /// <summary>
        /// Получает коллекцию объектов полученных
        /// из результата запроса переданного адаптером
        /// </summary>
        /// <param name="adapter"></param>
        /// <param name="query"></param>
        /// <returns></returns>
        public List<T> Query<T>(DBAdapter adapter, string query)
        {
            if (adapter == null)
                throw new ArgumentNullException("adapter");
            if (String.IsNullOrEmpty(query))
                throw new ArgumentNullException("query");

            DataTable dataTable = adapter.GetDataTable(query);
            return this.CreateObjects<T>(dataTable);
        }

        /// <summary>
        /// Создаёт коллекцию объектов указанного типа
        /// из переданной таблицы данных
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="dataTable"></param>
        /// <returns></returns>
        public List<T> CreateObjects<T>(DataTable dataTable)
        {
            if (dataTable == null)
                throw new ArgumentNullException("dataTable");

            List<T> result = new List<T>();

            foreach (DataRow dr in dataTable.Rows)
            {
                T obj = this.Create<T>(dr);
                result.Add(obj);
            }

            return result;
        }

        /// <summary>
        /// Создаёт объект из строки данных
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="dataRow"></param>
        /// <returns></returns>
        public T Create<T>(DataRow dataRow)
        {
            if (dataRow == null)
                throw new ArgumentNullException("dataRow");

            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in dataRow.Table.Columns)
            {
                string columnName = column.ColumnName;
                PropertyInfo propertyForColumn = obj.GetType().GetProperty(columnName);
                object value = dataRow[columnName]; 
                if (propertyForColumn != null && !(value is DBNull))
                {
                    propertyForColumn.SetValue(obj, value, null);
                }
            }

            return obj;
        }
    }
}
