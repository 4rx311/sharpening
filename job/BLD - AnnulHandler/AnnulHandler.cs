using System;
using WSSC.V4.DMS.Workflow;

using Const = WSSC.V4.DMS.BLD.Consts.Handler.AnnulHandler;

namespace WSSC.V4.DMS.BLD.Handlers
{
    /// <summary>
    /// Класс обработчик на решение "Запросить аннулирование" или "Отклонить аннулирование"..
    /// </summary>
    class AnnulHandler
    {
        /// <summary>
        /// Срабатывает при сохранении карточки.
        /// </summary>
        /// <param name="solutionParameters">Параметры решения.</param>
        public static void SolutionCustomAction(DMSCustomActionParam solutionParameters)
        {
            if (solutionParameters == null) throw new ArgumentNullException("solutionParameters");

            if (solutionParameters.DMSLogic.Solution != null)
            {
                // TODO: CR: Тряхов Дмитрий: только часть с отклонением аннулирования
                if (solutionParameters.DMSLogic.Solution.Name == Const.SolutionAnnul || solutionParameters.DMSLogic.Solution.Name == "Аннулировать")
                {
                    AnnulHandlerManager manager = new AnnulHandlerManager(solutionParameters.DMSLogic, true);
                    manager.Process();
                }
                else if(solutionParameters.DMSLogic.Solution.Name == Const.SolutionRollBack)
                {
                    AnnulHandlerManager manager = new AnnulHandlerManager(solutionParameters.DMSLogic, false);
                    manager.Process();
                }
            }
        }
    }
}
