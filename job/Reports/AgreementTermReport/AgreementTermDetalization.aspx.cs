using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Страница детализации отчёта по поручениям.
    /// </summary>
    public class AgreementTermDetalization : Page
    {
        #region controls

        protected Literal ContentLiteral;
        protected Literal ReportTitleLiteral;

        #endregion

        private bool __init_AppContext;
        private DBAppContext _AppContext;
        /// <summary>
        /// Веб-контекст приложения.
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

        private bool __init_PublishingBuilder = false;
        private RPPublishingBuilder _PublishingBuilder;
        /// <summary>
        /// Построитель отчёта
        /// </summary>
        public RPPublishingBuilder PublishingBuilder
        {
            get
            {
                if (!__init_PublishingBuilder)
                {
                    RPProvider reportProvider = this.AppContext.Site.ReportProvider();
                    RPSettings reportSettings = reportProvider.GetReportSettings(_Consts.Reports.AgreementTermReport.DatalizationSettingName);

                    _PublishingBuilder = new RPPublishingBuilder(null, reportSettings);
                    __init_PublishingBuilder = true;
                }
                return _PublishingBuilder;
            }
        }

        /// <summary>
        /// Called by the ASP.NET page framework to notify server controls that use composition-based implementation to create any child controls they contain in preparation for posting back or rendering.
        /// </summary>
        protected override void CreateChildControls()
        {
            try
            {
                using (StringWriter sw = new StringWriter())
                {
                    using (HtmlTextWriter htw = new HtmlTextWriter(sw))
                    {
                        this.PublishingBuilder.RenderReport(htw);
                    }
                    //Скрываем коробочную ссылку, т.к. сохраняем не через сервис. (Из-за отсутствия HttpContext`а в сервисе)
                    this.ContentLiteral.Text = sw.ToString().Replace("Сохранить в Excel", "");
                }
            }
            catch (Exception ex)
            {
                this.Response.Write(ex.ToString());
            }
        }

        /// <summary>
        /// Сохранение в Excel.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        protected void DownloadLink_OnClick(object sender, EventArgs e)
        {
            byte[] content = this.PublishingBuilder.GetExcelContent();

            //Отсылаем файл отчёта
            this.Response.ClearContent();
            this.Response.ClearHeaders();
            this.Response.ContentType = "application/octet-stream";
            string reportName = this.PublishingBuilder.Settings.Name;
            string fileName = this.AppContext.BrowserIs.IE ? HttpUtility.UrlEncode(reportName).Replace("+", "%20") : reportName;
            this.Response.AddHeader("Content-Disposition", "attachment; filename=\"" + fileName + ".xlsx\"");
            this.Response.AppendHeader("Content-Length", content.Length.ToString());
            this.Response.Flush();
            this.Response.OutputStream.Write(content, 0, content.Length);
            this.Response.Flush();
        }
    }
}
