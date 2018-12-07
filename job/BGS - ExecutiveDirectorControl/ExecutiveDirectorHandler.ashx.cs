using System;
using System.Collections.Generic;
using System.Collections;
using System.Text;
using System.Web;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib;
using Const = WSSC.V4.DMS.BGS.Consts.Controls.ExecutiveDirectorControl;
using System.IO;

namespace WSSC.V4.DMS.BGS.Controls
{    
    /// <summary>
    /// Обработчик Ajax запросов ExecutiveDirectorHandler.
    /// </summary>
    public class ExecutiveDirectorHandler : IHttpHandler
    {
        #region __init
        /// <summary>
        /// Gets a value indicating whether another request can use the <see cref="T:System.Web.IHttpHandler"/> instance.
        /// </summary>
        /// <returns>
        /// true if the <see cref="T:System.Web.IHttpHandler"/> instance is reusable; otherwise, false.
        /// </returns>
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

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
        #endregion

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/json";
            
            JSResultString jsResult = new JSResultString();

            try
            {
                if (context.Request.Params["recipients"] != null)
                {
                    string json = context.Request["recipients"];

                    // Преобразовываем строку из GET запроса
                    string result = json.Trim(new Char[] { '[', ']', '"', });
                    string[] arr = result.Split(new char[] { ',' });

                    // Ищем среди id адресатов "Исполнительного директора"
                    foreach (string element in arr)
                    {
                        result = this.Position(element);
                        if (result == "Исполнительный директор")
                        {
                            jsResult.Value = "true";
                            break;
                        }
                        else
                            jsResult.Value = "false";
                    }
                }
            }
            catch (Exception e)
            {
                jsResult.SetException(e, JSExceptionDisplayMode.FullInformation);
            }
            finally
            {
                string json = jsResult.Serialize();
                context.Response.Write(json);
            }
        }

        /// <summary>
        /// Возвращает должность пользователя
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns></returns>
        private string Position(string idUser)
        {
            string _position = "";
            
            try
            {
                int id = Convert.ToInt32(idUser);

                // Подключаемся к БД
                DBSite site = this.AppContext.Site;
                DBList listUsers = site.UsersList;
                DBItem user = listUsers.GetItem(id);

                _position = user.GetValue(Const.Position).ToString();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _position;
        }
    }
}