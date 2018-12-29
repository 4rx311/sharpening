using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.SYS.Lib.Data;
using __Consts = WSSC.V4.DMS.OMK._Consts.Reports.UpdatedCommissionExecutionReport;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionUpdatedReport
{
	/// <summary>
	/// Колонки обновлённого отчёта по исполнению поручений
	/// </summary>
	public class UpdatedColumns : Columns
	{
		public UpdatedColumns(CommissionReportSettings settings, DBInfo dbInfo, IReportFilterConditions filters) : base(settings, dbInfo, filters)
		{
		}


		/// <summary>
		/// Возвращаем все колонки, для которых строится кастомный запрос к БД
		/// </summary>
		/// <returns></returns>
		protected override List<Column> InitColumns()
		{
			return new List<Column>()
			{
				this.ShouldBeExecuted,
				this.ExecutedInReportPeriod,
				this.NotExecutedInReportPeriod,
                //this.AvarageTimeOut,
                //this.AvarageNotCriticalTimeOut,
            };
		}

		/// <summary>
		/// 4. Всего должно быть исполнено в отчетный период
		/// </summary>
		private Column ShouldBeExecuted
		{
			get
			{
				StringBuilder query = new StringBuilder();
				query.Append("(");
				////ИЛИ 1
				////(«Исполнить до» принадлежит отчетному периоду И Статус <> «Создание» или «Аннулировано»)
				query.AppendFormat("([Статус] NOT IN ({0}, {1}) AND ([Исполнить до]<=@endDate AND [Исполнить До]>=@startDate)" +
					"AND ([Исполнено] IS NULL OR [Исполнено] >= @startDate))",
					this.DBInfo.GetStatusID(__Consts.Statuses.Annuled), this.DBInfo.GetStatusID(__Consts.Statuses.OnRegistration));


				//ИЛИ 2
				//(«Исполнить до» принадлежит ранее отчетного периода И «Исполнено» = NULL)
				query.Append(" OR ");
				query.AppendFormat("([Исполнить До]<@startDate AND [Исполнено] IS NULL AND [Статус] NOT IN ({0}, {1}))",
					this.DBInfo.GetStatusID(__Consts.Statuses.Annuled), this.DBInfo.GetStatusID(__Consts.Statuses.OnRegistration));

				//ИЛИ 3
				//(«Исполнить до» принадлежит ранее отчетного периода И «Исполнено» принято в отчетном периоде).
				query.Append(" OR ");
				query.Append("([Исполнить До]<@startDate AND Исполнено<=@endDate AND Исполнено>=@startDate)");

				//query.Append("[Исполнено] IS NULL");
				//query.Append(" AND [Исполнить до]<=@endDate");

				query.Append(")");

				return new Column(__Consts.ShouldBeExecuted, DBPartitionDataType.All, query.ToString(), ColumnType.ShouldBeExecuted);
			}
		}

		/// <summary>
		/// 5. Исполнено за отчетный период
		/// Решение «Исполнено» принято в Отчетном периоде
		/// </summary>
		private Column ExecutedInReportPeriod
		{
			get
			{
				StringBuilder query = new StringBuilder();
				query.Append("(Исполнено<=@endDate AND Исполнено>=@startDate)");
				return new Column(__Consts.ExecutedInReportPeriod, DBPartitionDataType.All, query.ToString(), ColumnType.ExecutedInReportPeriod);
			}
		}

		/// <summary>
		/// 7. Не исполнено за отчетный период
		/// «Этап» = «Исполнение»;
		/// «Исполнить до» <  конечное значение в фильтре «Отчетный период» 
		/// </summary>
		private Column NotExecutedInReportPeriod
		{
			get
			{
				StringBuilder query = new StringBuilder();
				query.Append("([Исполнено] IS NULL OR [Исполнено] > @endDate)");
				query.Append(" AND [Исполнить до]<=@endDate");
				query.AppendFormat(" AND [Статус] NOT IN ({0}, {1})",
					this.DBInfo.GetStatusID(__Consts.Statuses.Annuled), this.DBInfo.GetStatusID(__Consts.Statuses.OnRegistration));
				return new Column(__Consts.NotExecutedInReportPeriod, DBPartitionDataType.All, query.ToString(), ColumnType.NotExecutedInReportPeriod);
			}
		}

		/// <summary>
		/// 8. Среднее время просрочки, раб.час./Критичные
		/// </summary>
		private Column AvarageTimeOut
		{
			get
			{
				return this.GetTimeOutColumn("Срочно");
			}
		}

		/// <summary>
		/// 9. Среднее время просрочки, раб.час./Не критичные
		/// </summary>
		private Column AvarageNotCriticalTimeOut
		{
			get
			{
				return this.GetTimeOutColumn("Обычный");
			}
		}

		/// <summary>
		/// Получает условие просрочки
		/// </summary>
		/// <param name="priorityTypeName"></param>
		/// <returns></returns>
		public string GetTimeOutCondition(string priorityTypeName)
		{
			StringBuilder query = new StringBuilder();

			//«Приоритет» = «Срок критичен»
			query.AppendFormat("[Приоритет] = {0}", this.DBInfo.GetPriorityTypeID(priorityTypeName));

			query.Append(@" AND (
(
 Исполнено<=@endDate AND Исполнено>=@startDate AND [Исполнено]>[Исполнить до]
 )
OR 
(
([Исполнено] IS NULL OR [Исполнено]>@endDate)
AND
([Исполнить до]<=@endDate)
)
)");

			return query.ToString();
		}

		/// <summary>
		/// Получает колонку просрочки для указанного приоритета
		/// </summary>
		/// <param name="priorityTypeName"></param>
		/// <returns></returns>
		private Column GetTimeOutColumn(string priorityTypeName)
		{
			Column column = new Column(__Consts.AvarageTimeOut, DBPartitionDataType.All, this.GetTimeOutCondition(priorityTypeName), ColumnType.AvarageTimeOut);
			column.CustomSelectCondition = "AVG([WSSC_UserDelayCommissions_Statistics].[DelayedHours] + (DATEDIFF(hour, Convert(date, GETDATE()), @endDate)))";
			column.CustomJoinCondition = @"INNER JOIN [WSSC_UserDelayCommissions_Statistics] ON [WSSC_UserDelayCommissions_Statistics].[ItemID] = Instructions.[ID]";
			return column;
		}

	}
}
