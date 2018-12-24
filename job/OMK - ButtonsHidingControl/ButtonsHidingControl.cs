using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.UI.WebControls;
using WSSC.V4.SYS.DBFramework;

namespace WSSC.V4.DMS.OMK.Controls.ButtonsHidingControl
{
    /// <summary>
    /// Контрол скрывающий кнопки.
    /// </summary>
    class ButtonsHidingControl : DBListFormWebControl
    {
        /// <summary>
        /// Контрол скрывающий кнопки.
        /// </summary>
        protected ButtonsHidingControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            : base(metadata, listForm) { }

        /// <summary>
        /// Фабрика для создания контрола.
        /// </summary>
        protected class Factory : DBListFormWebControlFactory
        {
            /// <summary>
            /// Создает экземпляр контрола на форме элемента списка.
            /// </summary>
            /// <param name="metadata">Метаданные контрола.</param>
            /// <param name="listForm">Форма элемента списка.</param>
            /// <returns/>
            protected override DBListFormWebControl CreateListFormWebControl(DBListFormWebControlMetadata metadata, DBListFormControl listForm)
            {
                return new ButtonsHidingControl(metadata, listForm);
            }
        }

        /// <summary>
        /// Вызывается при инициализации формы, до инициализации полей.
        /// </summary>
        protected override void OnListFormInitCompleted()
        {
            this.AppContext.ScriptManager.RegisterResource(@"Controls\ButtonsHidingControl\OMK_ButtonsHider.js", VersionProvider.ModulePath);
        }

        protected override string ClientInitHandler
        {
            get
            {
                return "OMK_ButtonsHider_Init";
            }
        }
    }
}
