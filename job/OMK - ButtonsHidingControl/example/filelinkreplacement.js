/// <reference path="~/Controls/PastePaperWatermark/OMK_PastePaperWatermark.js" />

function FRM_FileReplacementManager() {
    window.SapManager = this;
    this.IsListForm = window.ListForm != null;
    FRM_Init.call(this);
}

//инициализация состояния объекта.
function FRM_Init() {
    try {
        OMK.FileLinkReplacementControl_Instance = new OMK.FileLinkReplacementControl();

        var thisObj = this;
        var handler = function () {
            //клик по файлу
            if (window.OnFileClick) {
                SapManager.OriginalOnFileClick = window.OnFileClick
                window.OnFileClick = FRM_OnFileClick;
            }

            //клик по версии
            if (window.OnFileVersionsClick) {
                SapManager.OriginalOnFileVersionsClick = window.OnFileVersionsClick;
                window.OnFileVersionsClick = FRM_OnFileVersionsClick;
            }

            //клик по файлу связанного документа
            if (window.PD_OnFileLinkClick != null) {
                SapManager.OriginalPD_OnFileLinkClick = window.PD_OnFileLinkClick;
                window.PD_OnFileLinkClick = FRM_OnPDFileClick;
            }

            //клик по версии файла связанного документа
            if (window.PD_OnFileVersionsClick != null) {
                SapManager.OriginalPD_OnFileVersionsClick = window.PD_OnFileVersionsClick;
                window.PD_OnFileVersionsClick = FRM_OnPDFileVersionsClick;
            }
        }

        SM.OnPageLoad(handler);
    }
    catch (ex) {
        alert('При формировании ссылок на файлы произошла ошибка. Текст ошибки: ' + ex.message);
    }
}

function Saperion_NeedWatermark(target, fileUrl) {
    if (target) {

        if (!this.WatermarkFields) {
            return false;
        }

        // Проверить расширение файла
        if (!OMK.FileLinkReplacementControl_Instance.CheckFormat(fileUrl)) {
            return false;
        }

        // Проверить, что поле в списке полей, в которые устанавливается водяной знак
        var findField = false;
        for (var i = 0; i < this.WatermarkFields.length; i++) {
            if (this.WatermarkFields[i] == target.Name) {
                findField = true;
                break;
            }
        }
        if (!findField) {
            return false;
        }

        // Проверить, что выполняются условия на карточку
        var i, len = this.Conditions.length;

        for (i = 0; i < len; i++) {
            var condField = ListForm.GetField(this.Conditions[i].FieldName, true);
            var value = null;
            var textValue;
            if (condField) {
                value = condField.GetValue();
                if (condField.Type === "DBFieldLookupSingle")
                    textValue = value == null ? "" : value.LookupText;
                else
                    textValue = value;
            }

            if (this.Conditions[i].Value === (textValue || this.Conditions[i].DispValue)) {
                return true;
            }
        }

        return false;
    }
}

function FRM_IsSaperionFile(fileUrl) {
    var replacementrequired = false;
    try {
        if (fileUrl == null)
            throw new Error('fileUrl is null');

        if (SapManager == null)
            return;

        if (SapManager.FileStates == null)
            SapManager.FileStates = [];

        var fileEntryState = SapManager.FileStates[fileUrl];

        if (fileEntryState == null) {
            var ajax = SM.GetXmlRequest();
            var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/FileLinkReplacement/GetReplacementDocumentState.aspx?';
            url += '&rnd=' + Math.random();
            url += '&fileUrl=' + encodeURIComponent(fileUrl);
            ajax.open("GET", url, false);
            ajax.send(null);

            var replacementrequired = false;
            if (!SM.IsNE(ajax.responseText)) {
                if (ajax.responseText == 'true') {
                    replacementrequired = true;
                    fileEntryState = true;
                }
                else
                    fileEntryState = false;
            }

            SapManager.FileStates[fileUrl] = fileEntryState;
        }
        else
            replacementrequired = fileEntryState;
    }
    catch (ex) {
        alert('Не удалось проверить место хранения файла. Текст ошибки: ' + ex.message);
        replacementrequired = false;
    }

    return replacementrequired;
}

function FRM_OnFileClick(link, canEdit, canViewReal, isListForm) {
    var returnValue = false;

    try {
        if (link != null) {
            var fileUrl;
            if (this.IsPDField)
                fileUrl = FRM_GetFileUrl(link.FileItem);
            else
                fileUrl = link.getAttribute('FileUrl');
            var useOriginalFileClick = false;

            //проверка необходимости подмены ссылки.
            //если файл не в Saperion, то используем стандартный клик по файлу.
            if (!FRM_IsSaperionFile(fileUrl))
                useOriginalFileClick = true;

            if (useOriginalFileClick) {
                if (!this.IsPDField)
                    returnValue = SapManager.OriginalOnFileClick(link, canEdit, canViewReal, isListForm);
                else
                    returnValue = SapManager.OriginalPD_OnFileLinkClick(link);
            }
            else {
                //адрес страницы получения контента файла.
                var sapUrl = FRM_GetSaperionLink(fileUrl);
                if (SM.IsNE(sapUrl))
                    throw new Error('Не удалось получить ссылку на файл в системе Saperion.');

                var fileItem = FRM_GetFileItem(link);
                var notShowProgress = false;
                if (fileItem && fileItem.ClientField && fileItem.ClientField.ListFormField && window.SapManager) {
                    notShowProgress = !Saperion_NeedWatermark.call(SapManager, fileItem.ClientField.ListFormField, fileUrl);
                }

                OMK.FileLinkReplacementControl_Instance.StartDownloadSaperion(sapUrl, notShowProgress);
                return false;
            }
        }
    }
    catch (ex) {
        alert('При формировании ссылок на файлы произошла ошибка. Текст ошибки: ' + ex.message);
    }
    finally {
        return returnValue;
    }
}

function FRM_OnPDFileClick(fileLink) {
    if (fileLink != null && fileLink.FileItem != null) {
        return FRM_OnFileClick.call({
            IsPDField: true
        }, fileLink);
    }
}



function FRM_GetSaperionLink(fileUrl) {
    if (SM.IsNE(fileUrl))
        throw new Error('fileUrl is null');

    if (window.SapManager == null)
        throw new Error('window.SapManager is null');

    var url = SapManager.GetSaperionFileLink + '?';
    url += 'fileUrl=' + encodeURIComponent(fileUrl);
    return url;
}

function FRM_GetContextParams(file) {
    if (file.ClientField != null) {
        var params = {
            ListID: ListForm.ListID,
            ItemID: ListForm.ItemID,
            FileListID: file.FileListID,
            FileItemID: file.FileItemID,
            FieldID: file.ClientField.FieldID
        };
    }
    else {
        var params = {
            ListID: file.ItemListID,
            ItemID: file.ItemID,
            FileListID: file.FileListID,
            FileItemID: file.FileItemID,
            FieldID: file.FieldID
        };
    }

    return params;
}

function FRM_GetFileUrl(file) {
    if (file == null)
        throw new Error('file is null');
    var fileUrl = ListForm.SiteUrl + file.FileUrl;

    return fileUrl;
}

//#region versions
function FRM_GetVersionsPageUrl(file) {
    if (file == null)
        throw new Error('file is null');

    if (window.SapManager == null)
        throw new Error('window.SapManager is null');

    var contextParams = FRM_GetContextParams(file);
    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/FileVersions/DBFieldFilesVersionsJournal.aspx?'
    url += 'listID=' + contextParams.ListID;
    url += '&itemID=' + contextParams.ItemID;
    url += '&fieldID=' + contextParams.FieldID;
    url += '&fileListID=' + contextParams.FileListID;
    url += '&fileItemID=' + contextParams.FileItemID;

    return url;
}

//Получает объект файла из контрола 
function FRM_GetFileItem(htmlControl) {
    var fileItem = null;
    if (htmlControl != null)
        fileItem = htmlControl.FileItem;

    return fileItem;
}

function FRM_OnFileVersionsClick(versionsImage) {
    if (versionsImage == null)
        return;

    try {
        //получаем объект файла
        var file = FRM_GetFileItem(versionsImage);
        if (file == null)
            return;

        var fileUrl = FRM_GetFileUrl(file);
        var useOriginalFileClick = false;
        //проверка необходимости подмены ссылки.
        //если файл не в Saperion, то используем стандартный клик по файлу.
        if (!FRM_IsSaperionFile(fileUrl))
            useOriginalFileClick = true;

        if (useOriginalFileClick) {
            if (!this.IsPDField)
                returnValue = SapManager.OriginalOnFileVersionsClick(versionsImage, 'v2');
            else
                returnValue = SapManager.OriginalPD_OnFileVersionsClick(versionsImage);
        }
        else {
            var versionsPageUrl = FRM_GetVersionsPageUrl(file);
            var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
            var openedWin = window.open(versionsPageUrl, '_blank', winFeatures);
        }
    }
    catch (ex) {
        alert('При формировании ссылок на файлы произошла ошибка. Текст ошибки: ' + ex.message);
    }
    finally {
        return false;
    }
}

function FRM_OnPDFileVersionsClick(versionsImage) {
    return FRM_OnFileVersionsClick.call({
        IsPDField: true
    }, versionsImage);
}
//#endregion

var OMK;
// Namespace OMK
(function (OMK) {
    var FileLinkReplacementControl = function () {
        function FileLinkReplacementControl() {
            /// <summary>
            /// Конструктор клиентского экземпляра контрола
            /// </summary>
            /// <field name="PasteWatermarkControlExist" type="Boolean">Существует на форме контрол добавления водяного знака или нет</field>
            /// <field name="CookieWatchTimerID" type="Number">Идентификатор таймера поиска </field>
            /// <field name="CookieWatchUUIDs" type="Object">Словарь UUID, которые должен ожидать таймер</field>

            this.PasteWatermarkControlExist = false;
            if (OMK.PastePaperWatermarkControl_Instance) {
                this.PasteWatermarkControlExist = true;
            }
            this.CookieWatchTimerID = -1;
            this.CookieWatchUUIDs = {};
        }

        FileLinkReplacementControl.prototype.StartDownloadSaperion = function (link, notShowProgress) {
            /// <summary>
            /// Функция начинает скачивания файла по url
            /// </summary>
            /// <param name="link" type="String">Адрес получения файла</param>

            if (!link) {
                throw new Error("Parameter link is empty");
            }

            // Использовать логику из того контрола
            if (this.PasteWatermarkControlExist) {
                OMK.PastePaperWatermarkControl_Instance.StartDownloadWatermark(link, notShowProgress);
                return;
            }

            // Иначе - используем этот контрол
            if (!notShowProgress) {
                this.ShowFileProcessingDialog();
            }

            var iframe = document.createElement("iframe");
            iframe.style.display = "none";
            document.body.appendChild(iframe);

            // Добавить параметр с идентифицирующим загрузку cookie
            if (link.indexOf("?") < 0) {
                link += "?";
            }
            else {
                link += "&";
            }
            // Запомнить iframe для последующего удаления
            var cookieUUID = this.GenerateUUID();
            this.CookieWatchUUIDs[cookieUUID] = iframe;

            if (this.CookieWatchTimerID == -1) {
                this.CookieWatchTimerID = setInterval(FileLinkReplace_CookieWatch, 200);
            }

            link += "StartID=" + cookieUUID;
            // Начать загрузку
            iframe.src = link;
        }

        FileLinkReplacementControl.prototype.ShowFileProcessingDialog = function () {
            /// <summary>
            /// Функция отображает панель подготовки файлов к загрузке
            /// </summary>

            var genCont = document.getElementById("OMK_ProcessFileFrame");

            if (genCont == null) {
                genCont = document.createElement("div");
                genCont.innerHTML = '<div id="OMK_ProcessFileFrame" style="position: absolute; z-index: 1001; border-radius: 7px; border: 1px solid; background-color: #deecfa; width: 250px; height: 60px;">' +
                    '<div style="left: 75px; top: 10px; font-size: 14pt; position: relative; display: inline-block; font-family: Verdana">Генерация...</div></div>';

                var processPanel = genCont.childNodes[0];
                document.body.appendChild(processPanel);

                // Добавляем крутилку
                this.AddOrUpdateProcessBar();

                var jWindow = $(processPanel);

                // Разместить по середине окна
                jWindow.offset({
                    top: Math.max($(window).height() / 2 - jWindow.outerHeight() / 2, 0),
                    left: Math.max($(window).width() / 2 - jWindow.outerWidth() / 2, 0)
                });
                window.scrollTo(0, 0);
                jWindow.css({ display: 'none' }).fadeIn(400);
            }
        }

        FileLinkReplacementControl.prototype.AddOrUpdateProcessBar = function () {
            /// <summary>
            /// Функция добавляет или заново создает крутилку (в IE по окончанию загрузки одного из IFram'ов анимация перестает работать)
            /// </summary>

            // Получить крутилку по ID
            var processBar = document.getElementById("OMK_ProcessFileFrame_ProgressBar");
            var messagePanel = undefined;
            // Если она существует, то запомнить её родителя (панель сообщения) и удалить её
            if (processBar && processBar.parentElement) {
                messagePanel = processBar.parentElement;
                messagePanel.removeChild(processBar);
            }
            // Если панель крутилки ещё не найдена - найти её
            if (!messagePanel) {
                messagePanel = document.getElementById("OMK_ProcessFileFrame");

                // Если не нашли - то выход
                if (!messagePanel) {
                    return;
                }
            }

            // Создать ProcessBar
            var genCont = document.createElement("div");
            genCont.innerHTML = '<img id="OMK_ProcessFileFrame_ProgressBar" src="/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/PastePaperWatermark/ProcessingFiles.gif" style="position: relative; top: 11px; left: 15px" Alt="Пожалуйста подождите..."></img>';
            var processBar = genCont.childNodes[0];

            messagePanel.appendChild(processBar);
        }

        FileLinkReplacementControl.prototype.HideFileProcessingDialog = function () {
            /// <summary>
            /// Метод удаляет iframe загрузки
            /// </summary>

            var elemPanel = document.getElementById("OMK_ProcessFileFrame");
            if (elemPanel) {
                $(elemPanel).fadeOut(300, function () { $(this).remove(); });
            }
        }

        FileLinkReplacementControl.prototype.GenerateUUID = function () { // Public Domain/MIT
            /// <summary>
            /// Генерировать UUID
            /// </summary>

            var d = new Date().getTime();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
                d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        FileLinkReplacementControl.prototype.FileReady = function (fileGenerateID) {
            /// <summary>
            /// Метод удаляет заданный UUID из списка ожидаемых файлов и проверяет, нужно отключить таймер или нет
            /// </summary>
            /// <param name="fileGenerateID">UUID ожидаемого файла</param>

            // Удалить из списка ожидаемых UUID
            var cookieFrame = this.CookieWatchUUIDs[fileGenerateID];
            if (cookieFrame) {

                if (cookieFrame
                    && cookieFrame.parentElement
                    && !SM.IsChrome) { // В хроме iframe не удаляется, т.к. нет способа точно определить, работает загрузка файла или на сервере произошла ошибка
                    cookieFrame.parentElement.removeChild(cookieFrame);
                }
                this.CookieWatchUUIDs[fileGenerateID] = undefined;
                delete this.CookieWatchUUIDs[fileGenerateID];
            }

            var anyProcessFile = false;
            // Проверить, надо отключить таймер или нет
            for (var prop in this.CookieWatchUUIDs) {
                if (this.CookieWatchUUIDs.hasOwnProperty(prop)) {
                    anyProcessFile = true;
                    break;
                }
            }

            if (!anyProcessFile && this.CookieWatchTimerID != -1) {

                clearInterval(this.CookieWatchTimerID);
                this.CookieWatchTimerID = -1;
                // Удалить iframe
                this.HideFileProcessingDialog();
            }
            else if (anyProcessFile) {
                // Обновляем крутилку
                this.AddOrUpdateProcessBar();
            }
        }

        FileLinkReplacementControl.prototype.ShowErrorMessage = function (msg) {
            /// <summary>
            /// Метод выводит сообщение об ошибке во всплывающей панели
            /// </summary>
            /// <param name="msg" type="String">Сообщение, которое надо вывести</param>

            var errorPanel = document.getElementById("OMK_ErrorPanel");
            var jErrorPanel;

            if (errorPanel) {
                jErrorPanel = $(errorPanel);
            }
            else {
                var divCont = document.createElement("div");
                divCont.innerHTML = "<div id='OMK_ErrorPanel' class='dbf_errorpanel dbf_errorpanel_noMessage'" +
                    " style='position: absolute; z-index: 1000; border-bottom-left-radius: 7px; border-bottom-right-radius: 7px; " +
                    "border: 1px solid; width: 500px; height: auto; top: 0px'><div class='attention'></div><div class='title'><div id='OMK_ErrorPanel_Message'></div></div></div>";

                errorPanel = divCont.childNodes[0];
                document.body.appendChild(errorPanel);

                // Разместить панель по середине
                jErrorPanel = $(errorPanel);
                jErrorPanel.offset({
                    left: Math.max($(window).width() / 2 - jErrorPanel.outerWidth() / 2, 0)
                });
            }

            var errorTextPanel = document.getElementById("OMK_ErrorPanel_Message");
            if (errorTextPanel) {
                errorTextPanel.innerHTML = msg;
            }

            // Показать с анимацией выезда сверху
            jErrorPanel.css({ display: 'none' }).slideDown(400);
        }

        FileLinkReplacementControl.prototype.CheckFormat = function (fileUrl) {
            /// <summary>
            /// Проверка формата файла (для водяного знака).
            /// </summary>
            /// <param name="fileUrl" type="String"></param>
            /// <returns type="Boolean"></returns>

            if (SM.IsNE(fileUrl))
                throw new Error('Не удалось получить параметр fileUrl');

            var fileExtensionInd = fileUrl.lastIndexOf(".");

            if (fileExtensionInd < 0) {
                // Не указано расширение
                return false;
            }

            // Расширение получено
            var fileExtension = fileUrl.substring(fileExtensionInd + 1);
            fileExtension = fileExtension.toLowerCase();
            
            if (fileExtension == 'pdf' ||
                fileExtension == 'bmp' ||
                fileExtension == 'jpg' ||
                fileExtension == 'jpeg' ||
                fileExtension == 'tif' ||
                fileExtension == 'tiff') // Формат файла не поддерживается для простановки водяного знака

                return true;
            else
                return false;
        }

        return FileLinkReplacementControl;
    }();
    OMK.FileLinkReplacementControl = FileLinkReplacementControl;
    OMK.FileLinkReplacementControl_Instance = null;
    
    function FileLinkReplace_CookieWatch() {
        /// <summary>
        /// Метод проверяет наличие куков с именем cookieName, если такие найдены - то они удаляются, вызывается метод закрытия iframe и удаления таймера
        /// </summary>
        /// <param name="cookieName">название куков</param>

        if (OMK.FileLinkReplacementControl_Instance == null) {
            return;
        }

        for (var cookieName in OMK.FileLinkReplacementControl_Instance.CookieWatchUUIDs) {
            if (!OMK.FileLinkReplacementControl_Instance.CookieWatchUUIDs.hasOwnProperty(cookieName)) {
                continue;
            }

            // Проверить наличие куков
            var cookieExist = (new RegExp("(?:^|;\\s*)" + encodeURIComponent(cookieName).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            if (!cookieExist) {

                // Проверяем статус фрейма, если загружен и нет куков - то значит ошибка запроса
                var iframe = OMK.FileLinkReplacementControl_Instance.CookieWatchUUIDs[cookieName]; // Получить связанный iframe
                try {
                    if (iframe &&
                        iframe.contentWindow &&
                        iframe.contentWindow.document &&
                        iframe.contentWindow.document.readyState == "complete" &&
                        iframe.contentWindow.document.body
                        && !SM.IsChrome) { // В хроме readyState у iFrame не меняется, поэтому просто пропуск

                        var errorMsg = "";

                        var iFrameBody = iframe.contentWindow.document.body;
                        if (iFrameBody.textContent) {
                            errorMsg = iFrameBody.textContent;
                        } else if (iFrameBody.innerText) {
                            errorMsg = iFrameBody.innerText;
                        }
                        else {
                            errorMsg = iFrameBody.innerHTML;
                        }

                        // Вывод сообщения об ошибке
                        OMK.FileLinkReplacementControl_Instance.ShowErrorMessage(errorMsg);
                    }
                    else {
                        // Если фрейм не загружен - пропускаем его обработку
                        continue;
                    }
                } catch (e) {
                    // Если произошла ошибка - просто гасим iframe
                }
            }
            else {
                // Если куки есть - удаляем их
                document.cookie = encodeURIComponent(cookieName) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }

            // Сообщаем о готовности файла с заданным UUID
            OMK.FileLinkReplacementControl_Instance.FileReady(cookieName);
        }
    }

})(OMK || (OMK = {}));