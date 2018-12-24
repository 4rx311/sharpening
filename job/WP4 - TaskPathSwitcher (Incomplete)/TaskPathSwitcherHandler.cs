using System;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib.Logging;

namespace WSSC.V4.CST.WSS.Tasks.Handlers.TaskPathSwitcher
{
    class TaskPathSwitcherHandler
    {
        /// <summary>
        /// Обработчик на изменения в поле "Тип задачи" (после изменения карточки).
        /// </summary>
        public static void SolutionCustomAction(DMSCustomActionParam solParam)
        {
            if (solParam == null)
                throw new ArgumentNullException("solParam");

            // Привязываемся на принятое решение
            DMSLogic logic = solParam.DMSLogic;
            DBItem item = logic.Item;
            if (item == null)
                return;

            // Создаём помощника и выполняем операции.
            TaskPathSwitcher switcher = new TaskPathSwitcher(logic);
            switcher.Process();
        }
    }
}