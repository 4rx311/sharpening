using System;
using WSSC.V4.DMS.Workflow;

using Const = WSSC.V4.DMS.BGS.Consts.Handlers.StageHandler;

namespace WSSC.V4.DMS.BGS
{
    /// <summary>
	/// Класс обработчика на решение "Вернуть из архива".
	/// </summary>
    public class StageHandler
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
                if (solutionParameters.DMSLogic.Solution.Name == Const.RollBack)
                {
                    StageHandlerManager manager = new StageHandlerManager(solutionParameters.DMSLogic);
                    manager.Process();
                }
            }
        }
    }
}