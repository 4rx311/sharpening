using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.Lib.Data;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Столбец.
    /// </summary>
    public class Column
    {
        /// <summary>
        /// Тип столбца.
        /// </summary>
        public ColumnType Type { get; private set; }

        /// <summary>
        /// Строка подменяющяя конструкцию COUNT(ID),
        /// на другое агрегирующее условие при необходимости
        /// по-умолчанию (если не override) возвращает null
        /// </summary>
        internal virtual string CustomSelectCondition { get; set; }

        internal virtual string CustomJoinCondition { get; set; }


        /// <summary>
        /// Столбце.
        /// </summary>
        /// <param name="name">Название.</param>
        /// <param name="partitionType">Тип разрезания данных целевой таблицы.</param>
        /// <param name="baseCondition">Базовое условие выборки, касающееся только логики столбца</param>
        /// <param name="additionalCondition">Условие выборки, касающееся значений фильтра и доступа</param>
        /// <param name="type"></param>
        internal Column(string name, DBPartitionDataType partitionType, string baseCondition, ColumnType type)
        {
            this.Type = type;
            if (String.IsNullOrEmpty(name))
                throw new ArgumentNullException("name");

            this.PartitionType = partitionType;
            this.BaseCondition = baseCondition;
            this.Condition = baseCondition;
            /*if (!String.IsNullOrEmpty(additionalCondition))
            {
                if (!additionalCondition.StartsWith(" AND "))
                    this.Condition += " AND ";

                this.Condition += additionalCondition;
            }*/
            this.Name = name;
        }

        /// <summary>
        /// Тип разрезания данных целевой таблицы.
        /// </summary>
        internal readonly DBPartitionDataType PartitionType;

        /// <summary>
        /// Название столбца.
        /// </summary>
        internal readonly string Name;

        /// <summary>
        /// Условие выборки.
        /// </summary>
        internal readonly string Condition;

        /// <summary>
        /// Базовое условие выборки.
        /// </summary>
        internal readonly string BaseCondition;

        /// <summary>
        /// Returns the fully qualified type name of this instance.
        /// </summary>
        /// <returns>
        /// A <see cref="T:System.String"/> containing a fully qualified type name.
        /// </returns>
        /// <filterpriority>2</filterpriority>
        public override string ToString()
        {
            return this.Name +
                   (this.PartitionType == DBPartitionDataType.Archive
                       ? " Archive"
                       : (this.PartitionType == DBPartitionDataType.Primary ? " Primary" : " All"));
        }
    }
}
