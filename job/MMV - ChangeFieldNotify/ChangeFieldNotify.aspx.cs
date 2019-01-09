using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Services;
using System.Web.UI;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify
{
    /// <summary>
    /// Страница для AJAX-запросов элемента управления.
    /// Запрос выполняет рассылку уведомлений об изменении пользователям
    /// </summary>
    public class ChangeFieldNotify : Page
    {
        /// <summary>
        /// Метод получает текущие версии файлов в карточке
        /// </summary>
        /// <param name="request">Параметры запроса</param>
        /// <returns>JSON-объект, в котором перечислены версии файлов в карточке</returns>
        [WebMethod]
        public static string CheckCurrentVersionFiles(JSClient.CheckFilesRequest request)
        {
            JSClient.CheckFilesResult result = new JSClient.CheckFilesResult();

            try
            {
                // Проверить, что пользователь прошел аутентификацию
                if (DBAppContext.Current.CurrentUser == null)
                {
                    throw new UnauthorizedAccessException();
                }

                // Получить элемент
                if (request.ListID <= 0 || request.ItemID <= 0)
                {
                    throw new ArgumentOutOfRangeException();
                }
                DBList list = DBAppContext.Current.Site.GetList(request.ListID, true);
                DBItem item = list.GetItem(request.ItemID);
                if (item == null)
                {
                    throw new DBException.MissingItem(list, request.ItemID);
                }

                // Проверить доступ к элементу
                if (!item.CurrentUserHasAccess(DBPermissionCode.Edit))
                {
                    throw new UnauthorizedAccessException();
                }

                // Получить элементы 
                FilesVersionSnapshotManager filesSnapshotManager = new FilesVersionSnapshotManager(item);
                result.CurrentFiles = filesSnapshotManager.GetSnapshot(request.FieldNames);
            }
            catch (Exception ex)
            {
                result.SetException(ex, JSExceptionDisplayMode.MessageOnly);
            }

            return result.Serialize();
        }

        [WebMethod]
        public static string SendNotification(JSClient.SendNotificationRequest request)
        {
            JSResultBoolean result = new JSResultBoolean();

            try
            {
                // Проверить, что пользователь прошел аутентификацию
                if (DBAppContext.Current.CurrentUser == null)
                {
                    throw new UnauthorizedAccessException();
                }

                // Получить элемент
                if (request.ListID <= 0 || request.ItemID <= 0)
                {
                    throw new ArgumentOutOfRangeException();
                }
                DBList list = DBAppContext.Current.Site.GetList(request.ListID, true);
                DBItem item = list.GetItem(request.ItemID);
                if (item == null)
                {
                    throw new DBException.MissingItem(list, request.ItemID);
                }

                // Проверить доступ к элементу
                if (!item.CurrentUserHasAccess(DBPermissionCode.Edit))
                {
                    throw new UnauthorizedAccessException();
                }

                NotificationManager notificationManager = new NotificationManager(item, request.ChangedFields);
                notificationManager.Send();
            }
            catch (Exception ex)
            {
                result.SetException(ex, JSExceptionDisplayMode.MessageOnly);
            }

            return result.Serialize();
        }
    }
}
