//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Web.UI;
//using WSSC.V4.SYS.DBFramework;



//namespace WSSC.V4.DMS.OMK.Controls.CustomersFilter
//{
//    /// <summary>
//    /// Контрол передачи текущий карточки в селектор фильтрации окна
//    /// </summary>
//    public class ItemForSelectorControl : Control
//    {
//        protected override void CreateChildControls()
//        {
//            try
//            {
//                if (FilterManager.Context == null)
//                    return;

//                // Инициализируем JavaScript Save Handler
//                FilterManager.Context.ScriptManager.RegisterResource("Controls/CustomersFilter/GetInitiatorCompany.js", VersionProvider.ModulePath);
//                FilterManager.Context.ScriptManager.RegisterScriptBlock("RSH_ItemForSelector_InitScript", "ListForm.AddInitHandler(RSH_ItemForSelector_Init);");
//            }
//            catch (Exception ex)
//            {
//                if (FilterManager.ListForm != null)
//                    FilterManager.ListForm.ProcessError(ex);
//                else
//                    this.Context.Response.Write(ex.ToString());
//            }
//        }
//    }
//}
