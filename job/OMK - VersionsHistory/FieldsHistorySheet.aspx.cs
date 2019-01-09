using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using WSSC.V4.DMS.Fields.TableItems;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.Data;


namespace WSSC.V4.DMS.OMK.Reports.VersionsHistory
{
    /// <summary>
    /// Обработчик Ajax запросов FieldsHistorySheet.
    /// </summary>
    public class FieldsHistorySheet : Page
    {
        #region Properties

        private bool __init_AppContext;
        private DBAppContext _AppContext;
        /// <summary>
        /// Веб контекст приложения.
        /// </summary>
        private DBAppContext AppContext
        {
            get
            {
                if (!__init_AppContext)
                {
                    _AppContext = DBAppContext.Current;
                    __init_AppContext = true;
                }
                return _AppContext;
            }
        }

        private bool _InitItem;
        private DBItem _Item;
        /// <summary>
        /// Карточка документа
        /// </summary>
        internal DBItem Item
        {
            get
            {
                if (!_InitItem)
                {
                    int listID = DBAppContext.Current.GetRequestValue<int>("listID");
                    if (listID == 0)
                        throw new Exception("Ошибка получения списка");

                    int itemID = DBAppContext.Current.GetRequestValue<int>("itemID");
                    if (itemID == 0)
                        throw new Exception("Ошибка получения карточки");

                    DBList list = DBAppContext.Current.Site.GetList(listID);
                    if (list == null)
                        throw new DBException.MissingList(DBAppContext.Current.Site, listID);

                    _Item = list.GetItem(itemID);
                    if (_Item == null)
                        throw new DBException.MissingItem(list, itemID);

                    _InitItem = true;
                }

                return _Item;
            }
        }

        private bool __init_Builder = false;
        private HistoryBuilder _Builder;
        /// <summary>
        /// Класс создания отчета об измененных полях документа
        /// </summary>
        private HistoryBuilder Builder
        {
            get
            {
                if (!__init_Builder)
                {
                    _Builder = new HistoryBuilder(this.Item);
                    __init_Builder = true;
                }
                return _Builder;
            }
        }

        private bool __init_itemVersion = false;
        private int _itemVerison;
        /// <summary>
        /// Версия документа
        /// </summary>
        /// <returns></returns>
        private int ItemVersion
        {
            get
            {
                if (!__init_itemVersion)
                {
                    string index = this.Request.QueryString["versionIDX"];
                    _itemVerison = Convert.ToInt32(index);
                    __init_itemVersion = true;
                }
                return _itemVerison;
            }
        }
        #endregion


        private string BuildTable()
        {
            Table table = new Table();
            Table tableFields = new Table();
            TableRow row = new TableRow();

            table.CssClass = "tableMain";
            table.CellPadding = 0;
            table.CellSpacing = 0;

            table.Rows.Add(row);

            // получаем данные из которых строим таблицу
            Dictionary<string, string> fieldsHistory = this.Builder.BuildFieldsHistory(this.ItemVersion);
            if (fieldsHistory.Count > 0)
                foreach (KeyValuePair<string, string> field in fieldsHistory)
                {
                    TableRow rowFields = new TableRow();
                    rowFields.Cells.AddRange(new TableCell[]
                    {
                        new TableCell() { Text = field.Key,         VerticalAlign = VerticalAlign.Top, CssClass = "fieldsTD" },
                        new TableCell() { Text = field.Value,       VerticalAlign = VerticalAlign.Top, CssClass = "fieldsTD" }
                    });

                    table.Rows.Add(rowFields);
                }
            else
            {
                TableRow failed = new TableRow();
                TableCell cell = new TableCell();
                cell.Text = "Измененных полей не найдено";
                failed.Cells.Add(cell);
                table.Rows.Add(failed);
            }

            // Конвертируем asp.net таблицу в строку и возвращаем 
            using (StringWriter sw = new StringWriter())
            {
                HtmlTextWriter hw = new HtmlTextWriter(sw);
                table.RenderControl(hw);

                return sw.ToString();
            }
        }

        /// <summary>
        /// Called by the ASP.NET page framework to notify server controls that use composition-based implementation to create any child controls they contain in preparation for posting back or rendering.
        /// </summary>
        protected override void CreateChildControls()
        {
            try
            {
                string regNumber = this.Item.List.ContainsField("Регистрационный номер") ?
                                   this.Item.GetStringValue("Регистрационный номер") :
                                   this.Item.GetStringValue("Название");

                this.Response.Write(this.PageDraw(regNumber));
            }
            catch (Exception ex)
            {
                this.Response.Write(ex.ToString());
            }
        }

        /// <summary>
        /// Создание html кода страницы.
        /// </summary>
        /// <param name="regNumber">Регистрационный номер</param>
        /// <returns>html</returns>
        private string PageDraw(string regNumber)
        {
            #region title
            StringBuilder html = new StringBuilder();
            html.AppendFormat(@"
                            <head>
                                <title>История полей {0}</title>
                                <link rel=""stylesheet"" href=""VersionsHistoryPage.css"">
                            </head>                            
                ", regNumber);
            #endregion

            #region header
            string header = string.Format(@"
               <p class='page_header' align='center'><b>ИСТОРИЯ ПОЛЕЙ</b></p>
               <p class='page_header' align='center'>Рег. номер: {0}</p>
               <table style='width:100%;' cellspacing='0' cellpadding='0'></table>
            ", regNumber);
            #endregion

            #region contentBody
            string contentBody = string.Format(@"
             <div id='contentBody'>
               <table class='h_div' cellpadding='0' cellspacing='0' style='width:620px;' align='center'>
               <tbody>
                <tr>
                    <td>
                        {0} 
                        <br>
                        {1}
                    </td>
                </tr>
               </tbody>
               </table>
             </div>
            ", header, this.BuildTable());
            #endregion

            #region trTop
            string trTop = @"
            <tr>
                <td class='bg_top_left'>
                    <div class='bg_border_h border_w'></div>
                </td>
                <td class='bg_top_mid'>
                    <div class='bg_border_h'></div>
                </td>
                <td class='bg_top_right'>
                    <div class='bg_border_h border_w'></div>
                </td>
            </tr>";
            #endregion

            #region trBottom
            string trBottom = @"
            <tr>
                <td class='bg_bottom_left'>
                    <div class='bg_border_h border_w'></div>
                </td>
                <td class='bg_bottom_mid'>
                    <div class='bg_border_h'></div>
                </td>
                <td class='bg_bottom_right'>
                    <div class='bg_border_h border_w'></div>
                </td>
            </tr>";
            #endregion

            #region trMid
            string trMid = string.Format(@"
            <td class='bg_left_mid'>
                <div class='bg_border_w'></div>
            </td>
            <td class='bg_mid'>
                {0}
            </td>
            <td class='bg_right_mid'>
                <div class='bg_border_w'></div>
            </td>
            ", contentBody);
            #endregion

            #region reportContainer
            string reportContainer = string.Format(@"
                <table border='0' cellpadding='0' cellspacing='0' class='history_report_container_tbl'>
                    <tbody>
                        {0}
                        {1}
                        {2}
                    </tbody>
                </table>
            ", trTop, trMid, trBottom);
            #endregion

            #region pageHTML
            html.AppendFormat(@"
            <body class = 'page_body'>
             <div class = 'history_report_container'>
                {0}
             </div>
            </body>
            ", reportContainer);
            #endregion
            return html.ToString();
        }
    }
}