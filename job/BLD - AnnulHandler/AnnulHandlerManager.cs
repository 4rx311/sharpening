using System;
using System.Collections.Generic;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;

using Const = WSSC.V4.DMS.BLD.Consts.Handler.AnnulHandler;

namespace WSSC.V4.DMS.BLD.Handlers
{
    /// <summary>
    /// Менеджер обработчика на решение "Запросить аннулирование" или "Отклонить аннулирование".
    /// </summary>
    internal class AnnulHandlerManager
    {

        #region Properties

        /// <summary>
        /// Флаг, определяющий, карточку аннулируют или наоборот
        /// </summary>
        bool AnnulFlag { get; set; }

        /// <summary>
        /// DMS-логика.
        /// </summary>
        private DMSLogic Logic { get; set; }

        private bool __init_Item;
        private DBItem _Item;
        /// <summary>
        /// DB-карточка, в которой принято решение.
        /// </summary>
        private DBItem Item
        {
            get
            {
                if (!__init_Item)
                {
                    _Item = this.Logic.DMSItem.Item;
                    __init_Item = true;
                }
                return _Item;
            }
        }


        private bool _init_Site;
        private DBSite _Site;
        /// <summary>
        /// Сайт.
        /// </summary>
        private DBSite Site
        {
            get
            {
                if (!_init_Site)
                {
                    _Site = this.Item.Site;
                    _init_Site = true;
                }
                return _Site;
            }
        }

        private bool _init_Web;
        private DBWeb _Web;
        /// <summary>
        /// Узел карточки.
        /// </summary>
        private DBWeb Web
        {
            get
            {
                if (!_init_Web)
                {
                    _Web = this.Item.Web;
                    if (_Web == null)
                        throw new DBException.MissingWeb(this.Site, this.Item.Web.Url);
                    _init_Web = true;
                }
                return _Web;
            }
        }

        private bool _init_Statuses;
        private DBList _Statuses;
        /// <summary>
        /// Список статусов карточки.
        /// </summary>
        private DBList Statuses
        {
            get
            {
                if (!_init_Statuses)
                {
                    _Statuses = this.Web.GetList(Const.ListStatuses);
                    if (_Statuses == null)
                        throw new DBException.MissingWeb(this.Site, this.Web.Url);
                    _init_Statuses = true;
                }
                return _Statuses;
            }
        }
        #endregion

        /// <summary>
        /// Конструктор.
        /// </summary>
        /// <param name="logic">DMS-логика</param>
        /// <param name="annulSolutionFlag">Флаг решения об аннулировании</param>
		internal AnnulHandlerManager(DMSLogic logic, bool annulSolutionFlag)
        {
            this.Logic = logic ?? throw new ArgumentNullException("logic");
            this.AnnulFlag = annulSolutionFlag;
        }

        /// <summary>
        /// Выполняет логику обработчика.
        /// </summary>
        internal void Process()
        {
            // TODO: CR: Тряхов Дмитрий: это настройка, не нужно
            // Если принято решение <Запросить аннулирование>
            if (this.AnnulFlag)
            {
                int i = 0;
                SolutionsHistory lastSolution = this.Logic.SolutionsHistoryManager.GetHistory()[i];

                // Узнаем статус документа до принятия решения об Аннулировании
                while (lastSolution.StatusID == this.GetStatusID(Const.StageAnnul))
                    lastSolution = this.Logic.SolutionsHistoryManager.GetHistory()[i++];

                // В поле <Статус аннулирования> передаем id статуса до аннулирования.
                this.Item.SetValue(Const.FiledAnnulStatus, lastSolution.StatusID);

                // Присваиваем карточке статус .
                this.Logic.FormResult.StatusID = this.GetStatusID(Const.StageAnnul);
            }
            // TODO: CR: Тряхов Дмитрий: не нужно усложнятть с флагом
            // Если принято решение <Отклонить аннулирование>
            else if (!this.AnnulFlag)
            {
                // Смотрим значение поля <Статус аннулирования>
                string previousStatus = this.Item.GetStringValue(Const.FiledAnnulStatus);
                int previousStatusID = 0;

                if (previousStatus != null)
                {
                    // Присваиваем карточке статус из поля <Статус аннулирования>.
                    previousStatusID = this.GetStatusID(previousStatus);
                    this.Logic.FormResult.StatusID = previousStatusID;
                }
                // TODO: CR: Тряхов Дмитрий: зачем тогда это? выше же проставили
                else if (previousStatus == null)
                {
                    int i = 0;
                    SolutionsHistory lastSolution = this.Logic.SolutionsHistoryManager.GetHistory()[i];

                    // Узнаем статус документа до принятия решения об Аннулировании
                    while (lastSolution.StatusID == this.GetStatusID(Const.StageAnnul))
                        lastSolution = this.Logic.SolutionsHistoryManager.GetHistory()[i++];

                    // Присваиваем карточке новый статус.
                    this.Logic.FormResult.StatusID = lastSolution.StatusID;
                }
            }
            this.Logic.WFUpdateItemInfo();
        }

        /// <summary>
        ///  Определяет id статуса по его названию.
        /// </summary>
        /// <param name="statusName">Название статуса</param>
        /// <returns>id</returns>
        private int GetStatusID(string statusName)
        {
            if (statusName == null)
                throw new ArgumentNullException(nameof(statusName));

            int annulStatusID = 0;

            string query = $"[{Const.DBFieldName}] = N'{statusName}'";
            annulStatusID = this.Statuses.GetItem(query).ID;

            return annulStatusID;
        }
    }
}
