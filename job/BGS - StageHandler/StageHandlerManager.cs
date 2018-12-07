using System;
using System.Collections.Generic;
using System.Linq;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;

using Const = WSSC.V4.DMS.BGS.Consts.Handlers.StageHandler;

namespace WSSC.V4.DMS.BGS
{
    internal class StageHandlerManager
    {
        #region Properties

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

        private bool _init_Stages;
        private DBList _Stages;
        /// <summary>
        /// Список этапов.
        /// </summary>
        private DBList Stages
        {
            get
            {
                if (!_init_Stages)
                {
                    _Stages = this.Web.GetList(Const.ListStages);
                    if (_Stages == null)
                        throw new DBException.MissingWeb(this.Site, this.Web.Url);
                    _init_Stages = true;
                }
                return _Stages;
            }
        }

        private bool _init_Context;
        private DMSContext _DMSContext;
        /// <summary>
        /// Контекст выполнения.
        /// </summary>
        private DMSContext DMSContext
        {
            get
            {
                if (!_init_Context)
                {
                    _DMSContext = new DMSContext(this.Web);
                    _init_Context = true;
                }
                return _DMSContext;
            }
        }

        private bool _init_DMSItem;
        private DMSDocument _DMSItem;
        /// <summary>
        /// Карточка документа в контексте выполнения.
        /// </summary>
        private DMSDocument DMSItem
        {
            get
            {
                if (!_init_DMSItem)
                {
                    _DMSItem = new DMSDocument(this.DMSContext, this.Item);
                    _init_DMSItem = true;
                }
                return _DMSItem;
            }
        }

        private bool _init_DMSLogic;
        private DMSLogic _DMSLogic;
        /// <summary>
        /// Логика выполнения кода.
        /// </summary>
        private DMSLogic DMSLogic
        {
            get
            {
                if (!_init_DMSLogic)
                {
                    _DMSLogic = new DMSLogic(this.DMSItem);
                    _init_DMSLogic = true;
                }
                return _DMSLogic;
            }
        }

        private bool _init_AgreementBlockLogic;
        private DMSAgreementBlockLogic _AgreementBlockLogic;
        /// <summary>
        /// Класс для реализации блока согласования.
        /// </summary>
        private DMSAgreementBlockLogic AgreementBlockLogic
        {
            get
            {
                if (!_init_AgreementBlockLogic)
                {
                    _AgreementBlockLogic = new DMSAgreementBlockLogic(this.DMSLogic);
                    _init_AgreementBlockLogic = true;
                }
                return _AgreementBlockLogic;
            }
        }

        private bool _init_AgreementMatrix;
        private MatrixResultInfo _AgreementMatrix;
        /// <summary>
        /// Настройки матрицы согласования.
        /// </summary>
        private MatrixResultInfo AgreementMatrix
        {
            get
            {
                if (!_init_AgreementMatrix)
                {
                    _AgreementMatrix = this.DMSLogic.GetProcessBlockByMatrixList(new Dictionary<string, string>());
                    _init_AgreementMatrix = true;
                }
                return _AgreementMatrix;
            }
        }
        #endregion

        /// <summary>
		/// Конструктор.
		/// </summary>
		/// <param name="logic">DMS-логика.</param>
		internal StageHandlerManager(DMSLogic logic)
        {
            this.Logic = logic ?? throw new ArgumentNullException("logic");
        }


        
        /// <summary>
        /// Выполняет логику обработчика.
        /// </summary>
        internal void Process()
        {
            int i = 0;
            string query = "";
            query = $"[Название] = N'{Const.Archive}'";
            int archiveStageID = this.Stages.GetItem(query).ID;
            query = $"[Название] = N'{Const.Agreement}'";
            int agreementStageID = this.Stages.GetItem(query).ID;
            query = $"[Название] = N'{Const.Refinement}'";
            int refinementStageID = this.Stages.GetItem(query).ID;

            SolutionsHistory lastSolution = this.Logic.SolutionsHistoryManager.GetHistory()[i];
            
            while (lastSolution.StageID == archiveStageID)
                lastSolution = this.Logic.SolutionsHistoryManager.GetHistory()[i++];

            // если ДС было отправлено на оперативное хранение в [этап] = согласование
            if (lastSolution.StageID == agreementStageID)
            {
                this.Logic.FormResult.StageID = refinementStageID;          //  вернуть на этап "Доработка" (id этапа = 13)
                
                this.ClearAgreementBlock();
            }
            else
            {
                this.Logic.FormResult.StageID = lastSolution.StageID;       // устанавливаем предыдущее значение Этапа
                this.Logic.FormResult.StatusID = lastSolution.StatusID;     // устанавливаем предыдущее значение Статуса
            }

            this.Logic.WFUpdateItemInfo();                      // сохраняем изменения
        }

        private void ClearAgreementBlock()
        {
            // Блок согласования в текущей карточке.
            ProcessPassageObject itemObject = this.AgreementBlockLogic.ProcessObj;
            // Если все блоки согласования были удалены на доработке, не выполнять логику.
            if (itemObject.CurrentBlock == null)
                return;

            // Список подблоков согласования.
            List<ProcessBlock> itemProcessBlocks = itemObject.Stages.First().ProcessBlocks;
            itemProcessBlocks.Clear();
        
            // Блок согласования по настройкам матрицы согласования.
            ProcessPassageObject matrixObject = this.AgreementMatrix.AgrBlock;
            // Список подблоков согласования.
            List<ProcessBlock> matrixProcessBlocks = matrixObject.Stages.First().ProcessBlocks;
            matrixProcessBlocks.Clear();

            

            // Простановка новых значений в блок согласования.
            itemObject.SaveToSolutionFld(this.Item);
            // Сохранение карточки.
            this.Item.Update();
        }
    }
}
