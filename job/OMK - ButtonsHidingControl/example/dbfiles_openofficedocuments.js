var openOfficeActiveX3 = "SharePoint.OpenDocuments.3";
var openOfficeActiveX2 = "SharePoint.OpenDocuments.2";

function MultiBrowserFileClick(href) {
    var editDocument = StsOpenEnsureEx(openOfficeActiveX3);
    if (editDocument != null) {
        var result = editDocument.EditDocument2(window, href, '');
        if (result == null)
            alert("Can't open document");
    }
    return result;
}

var officeIntagerationNotSupportedAlert =
    'Не удалось открыть документ. \n\rУбедитесь в выполнении следующих пунктов, необходимых для открытия документа:\n\r' +
    '\n\r   - На Вашем компьютере должен быть установлен Microsoft Office.' +
    '\n\r   - В составе Microsoft Office должен быть установлен компонент: Поддержка Microsoft SharePoint.' +
    '\n\r   - Браузер Internet Explorer должен быть запущен в x32-разрядном режиме.' +
    '\n\r   - В браузере Internet Explorer для текущей зоны безопасности должно быть разрешено выполнение клиентских сценариев и использование ActiveX компонентов.';

function EditSharePointDocument(href, isDirectEdit) {
    var outParams = {};
    var editDocument = StsOpenEnsureEx(openOfficeActiveX3, outParams);
    var result = false;
    if (editDocument != null) {
        if (!SM.IsIE && editDocument.EditDocument2 == null) {
            alert(officeIntagerationNotSupportedAlert);
            return false;
        }
        if (SM.IsIE && !isDirectEdit && outParams.PluginVersion == 3)
            result = editDocument.ViewDocument3(window, href, 0, '');
        else
            result = editDocument.EditDocument2(window, href, '');
        if (result == null)
            alert("Can't open document");
    }
    return result;
}

function EditDocumentInFirefox(fileUrl, siteID) {
    if (SM.IsFF) {
        try {
            fileUrl = encodeURI(fileUrl)

            var winFirefoxPlugin = document.getElementById("winFirefoxPlugin");
            if (winFirefoxPlugin == null)
                winFirefoxPlugin = CreateFirefoxOnWindowsPlugin();

            var FFresult = true;

            if (fileUrl.length > 255) {
                alert("Длина url-адреса данного файла слишком велика для данного приложения. Браузер Mozilla Firefox не может открыть его на редактирование. По нажатию на кнопку 'ОК' файл будет открыт на чтение без возможности сохранения измененного файла в карточке документа.\n\nДля открытия данного файла на редактирование можно открыть карточку документа в браузере Internet Explorer.\nДля продолжения работы в браузере Mozilla Firefox необходимо сохранить файл в папку на локальный компьютер, внести изменения и загрузить файл поверх текущего.");
                FFresult = false;
            }

            if (winFirefoxPlugin != null && FFresult) {
                FFresult = winFirefoxPlugin.EditDocument(fileUrl);
            }

            if (!FFresult) {


                // ПРосто сохранение файла на локальный компьютер  
                var fileContentUrl = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/GetDocumentContent.aspx?fileSource=' + fileUrl + '&siteID=' + siteID + '&rnd=' + Math.random() + '&isInline=false';;

                window.location.href = fileContentUrl;
                SM.CancelEvent(null);
                return false;


            }
        } catch (e) {

            var fileContentUrl = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/GetDocumentContent.aspx?fileSource=' + fileUrl + '&siteID=' + siteID + '&rnd=' + Math.random() + '&isInline=false';;

            window.location.href = fileContentUrl;
            SM.CancelEvent(null);
            return false;
        }
    }
}


//=============== Открытие файлов на чтение.
function ViewSharePointDocument(href, link) {
    var editDocument = StsOpenEnsureEx(openOfficeActiveX3);
    if (editDocument != null) {
        if (!SM.IsIE && editDocument.ViewDocument2 == null) {
            alert(officeIntagerationNotSupportedAlert);
            return false;
        }
        var result = editDocument.ViewDocument2(window, href, '');
        if (result == null)
            alert("Can't open document");
    }
    return result;
}


//function OnFileClick(link, canEdit, openDirectly, FieldWebUrl) {
//debugger
// Клике на ссылку файла в превью. Открывает файл на редактирование или на просмотр.
//debugger
function OnFileClick(link, canEdit, canViewReal) {
    //debugger
    var officeIntergratedExts = '|doc|docx|docm|xls|xlsx|xlsm|ppt|pptx|mpp|vsd|vsdx|';
    var footerExts = '|doc|docx|docm|xls|xlsx|xlsm|pdf|bmp|jpg|jpeg|tiff|tif|gif|png|';
    var fileExtension = '';
    var fileName = link.getAttribute('FileName');
    if (SM.IsNE(fileName) && !SM.IsNE(link.innerHTML))
        fileName = link.innerHTML;

    var fileUrl = link.getAttribute('FileUrl');
    if (SM.IsNE(fileUrl))
        throw new Error('Не передан Url файла.');

    var enableFooterText = link.getAttribute('EnableFooterText');
    enableFooterText = !SM.IsNE(enableFooterText) && enableFooterText.toString().toLowerCase() == 'true' ? true : false;



    if (!SM.IsNE(fileName)) {
        var fileNameIndex = fileUrl.indexOf('/' + fileName.toLowerCase());
        if (fileNameIndex != -1) {
            fileUrl = fileUrl.substr(0, fileNameIndex) + '/' + fileName;
            if (!link.FileNameOriginaled) {
                var linkUrl = link.href;
                var fileUrlIndex = linkUrl.indexOf(fileUrl.toLowerCase());
                if (fileUrlIndex != -1)
                    link.href = linkUrl.substr(0, fileUrlIndex) + fileUrl;
                link.FileNameOriginaled = true;
            }
        }
    }

    var siteID = link.getAttribute('SiteID');
    if (IsNullOrEmpty(siteID))
        siteID = '';
    var ext = ''
    if (fileName != null && fileName != '') {
        var splExts = fileName.toLowerCase().split('.');
        ext = splExts[splExts.length - 1];
    }
    var isOfficeDocument = officeIntergratedExts.indexOf('|' + ext + '|') != -1;
    var isFooterDoc = footerExts.indexOf('|' + ext + '|') != -1;
    var isDirectEdit = window.Files_IsDirectEdit == true;
    canEdit = canEdit == true;
    var showDialog = false;
    var chromePluginInstalled = false;
    if (SM.IsChrome) {
        var pluginName = GetPluginTypeInstalled();
        if (!SM.IsNE(pluginName) && pluginName == "RENIT")
            chromePluginInstalled = true;
    }
    if (isOfficeDocument && (!SM.IsChrome || chromePluginInstalled)) {
        var oldBeforeUnload = window.onbeforeunload;
        var oldFocus = window.onfocus;
        var clickResult = false;

        var multiBrowserFileUrl = fileUrl; //должен быть абсолютным.
        // Открытие файла на редактирование
        if (canEdit) {
            try {
                if (SM.IsIE) {
                    if (!isDirectEdit) {
                        if (!window.Files_OpenFileInDialog || SM.IEVersion >= 10)
                            clickResult = EditSharePointDocument(multiBrowserFileUrl);
                        else
                            clickResult = DispEx(link, event, 'TRUE', 'FALSE', 'FALSE', '', '0', 'SharePoint.OpenDocuments', '', '', '', '1073741823', '0', '0', '0x7fffffffffffffff');
                    }
                    else {
                        if (!window.Files_OpenFileInDialog || SM.IEVersion >= 10)
                            clickResult = EditSharePointDocument(multiBrowserFileUrl, true);
                        else {
                            clickResult = window.editDocumentWithProgID2(fileUrl, '', 'SharePoint.OpenDocuments', '0', SM.GetServerUrl(fileUrl), '0');
                            clickResult = !SM.IsNE(clickResult);
                        }
                    }
                }
                else {
                    if (SM.IsFF) {

                        EditDocumentInFirefox(multiBrowserFileUrl, siteID);
                    }
                    else {
                        EditSharePointDocument(multiBrowserFileUrl);
                    }
                }
            }
            catch (e) {

                var noOffice = Files_IsNoOfficeError(e);
                if (noOffice) {
                    alert(officeIntagerationNotSupportedAlert);
                    showDialog = true;
                }
                else {
                    throw new Error(e.message + ' fullInfo:' + e.toString());
                }
            }
        }
        else {
            if (SM.IsIE && !window.Files_OpenFileInDialog && !(enableFooterText && isFooterDoc)) {
                try {
                    //проверяем доступ на чтение файла, и выдаем временный доступ при необходимости.
                    //вызываем, только если у пользователя нет реального доступа и если открытие происходит из карточки документа.
                    //TODO в текущем релизе пока отключаем такую проверку доступа на чтение.
                    var ac = link.getAttribute('ac');
                    if (!canViewReal && (window.ListForm != null || !SM.IsNE(ac))) {
                        var ensureViewAccessResult = Files_EnsureViewAccess(fileUrl, ac);
                        if (!ensureViewAccessResult)
                            return false;
                    }
                    ViewSharePointDocument(multiBrowserFileUrl);
                }
                catch (e) {
                    var noOffice = Files_IsNoOfficeError(e);
                    if (noOffice) {
                        alert(officeIntagerationNotSupportedAlert);
                        showDialog = true;
                    }
                    else {
                        throw new Error(e.message + ' fullInfo:' + e.toString());
                    }
                }
            }
            else
                showDialog = true;
        }

        window.onbeforeunload = oldBeforeUnload;
        window.onfocus = oldFocus;

        window.onbeforeunload = oldBeforeUnload;
        window.onfocus = oldFocus;
        SM.CancelEvent(null);

        //сделал возврат false, т.к. в ИЕ11 иначе открывется Open/Save dialog.
        if (!showDialog)
            return false;
    }
    else
        showDialog = true;

    var isXmlFile = ext == "xml";
    if (isXmlFile && canEdit) {
        showDialog = true;
        var url = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/FileOperation.ashx?rnd=' + Math.random();
        var params = '';
        params += '&fileUrl=' + encodeURIComponent(fileUrl);
        params += '&operation=IsXmlForm';
        url += params;

        var xmlRequest = SM.GetXmlRequest();
        xmlRequest.open("GET", url, false);
        xmlRequest.send(null);
        var responseText = xmlRequest.responseText;
        if (SM.IsNE(responseText))
            throw new Error('Результат запроса не может быть пустым.');
        if (responseText.indexOf('OperationError:') != -1) {
            alert(responseText);
            return false;
        }
        var isXmlForm = responseText == 'true';
        if (isXmlForm) {
            showDialog = false;
            var fileContentUrl = '/_layouts/FormServer.aspx';
            var fileParams = '';
            fileParams += '?XmlLocation=' + encodeURIComponent(fileUrl);
            fileParams += '&Source=' + '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/ClosePage.aspx';
            fileParams += '&DefaultItemOpen=1';
            fileParams += '&ClientInstalled=true';

            fileContentUrl += fileParams;

            var winFeatures = 'top=0,left=0,resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no,width=' + (window.screen.availWidth - 10) + ',height=' + window.screen.availHeight;
            var openedWin = window.open(fileContentUrl, '_blank', winFeatures);
            try {
                setTimeout(function () { openedWin.moveTo(0, 0) }, 100);
                setTimeout(function () { openedWin.resizeTo(screen.availWidth, screen.availHeight) }, 100);
                SM.CancelEvent(evt);
            }
            catch (e) {
            }
            return false;
        }
    }

    if (showDialog) {
        // ПРосто сохранение файла на локальный компьютер  
        var fileContentUrl = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/GetDocumentContent.aspx?fileSource=' + encodeURIComponent(fileUrl) + '&siteID=' + siteID + '&rnd=' + Math.random() + '&isInline=false';;
        if (enableFooterText && isFooterDoc)
            fileContentUrl = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/FileFooter/FileFooterPage.aspx?fileUrl=' + encodeURIComponent(fileUrl) + '&siteID=' + siteID + '&rnd=' + Math.random();

        //window.location.href = fileContentUrl;

        //  Для мобильных устройств выводим документ в отдельной вкладке браузера
        (SM.IsIpad) ? window.open(fileContentUrl, '_blank') : window.location.href = fileContentUrl;

        SM.CancelEvent(null);
        return false;
    }
}

function Files_EnsureViewAccess(fileUrl, ac) {
    var requestBuilder = null;
    if (SM.IsNE(ac))
        requestBuilder = SM.CreateRequestBuilder({ IncludedCurrentParams: ['ac'] });
    else {
        requestBuilder = SM.CreateRequestBuilder();
        requestBuilder.SetParam('ac', ac);
    }
    requestBuilder.SetParam('operation', 'EnsureViewAccess');
    requestBuilder.SetParam('fileUrl', fileUrl);


    var responseText = requestBuilder.SendRequest('/_layouts/WSS/WSSC.V4.SYS.Fields.Files/FileOperation.ashx');
    if (responseText != null && responseText.indexOf('OperationError:') != -1) {
        alert(responseText);
        return false;
    }
    return true;
}

function Files_IsNoOfficeError(e) {
    if (e == null)
        throw new Error('Не передан параметр e.');

    var msg = e.message;
    if (SM.IsNE(msg))
        throw new Error('Не удалось получить текст ошибки клика по файлу: ' + e);

    var number = e.number;
    var noOffice =
        number == -2146827859 ||
        msg.toLowerCase().indexOf('Automation server'.toLowerCase()) != -1 ||
        msg.toLowerCase().indexOf('Сервер программирования'.toLowerCase()) != -1 ||
        msg.toLowerCase().indexOf('Сервером программирования'.toLowerCase()) != -1;

    return noOffice;
}
//debugger



function StsOpenEnsureEx(pID, outParams) {
    var obj = null;
    if (window.ActiveXObject != null || SM.IsIE && SM.IEVersion >= 11) {
        var isVersion3 = pID.toLowerCase() == openOfficeActiveX3.toLowerCase();
        var isVersion2 = pID.toLowerCase() == openOfficeActiveX2.toLowerCase();
        try {
            obj = new ActiveXObject(pID);
            if (outParams != null) {
                if (isVersion3)
                    outParams.PluginVersion = 3;
                else if (isVersion2)
                    outParams.PluginVersion = 2;
            }
        }
        catch (e) {
            if (isVersion3) {
                obj = new ActiveXObject(openOfficeActiveX2);
                if (outParams != null)
                    outParams.PluginVersion = 2;
            }
            else
                throw new Error(e.message);
        }
    }
    else {
        var obj = document.createElement("embed");
        obj.type = "application/x-sharepoint";
        obj.setAttribute("hidden", "true");
        obj.id = "wssIntegration";
        document.body.appendChild(obj);
    }

    return obj;
}

function InitFileOverride() {
    InstallOpenDocumentsPluginIfMissing();
    DBFiles_OvverideOpenDocument();
    SetInitDivHandler();
}
InitFileOverride();

function DBFiles_OvverideOpenDocument() {
    window.DispDocItemEx = function (ele, fTransformServiceOn, fShouldTransformExtension, fTransformHandleUrl, strProgId) {
        itemTable = FindSTSMenuTable(ele, "CTXName");
        var stsOpen;
        var szHref;
        var szExt;
        var fRet = true;
        var szFileType = itemTable != null ? GetAttributeFromItemTable(itemTable, "Ext", "FileType") : "";
        var szAppId = "";
        var tblFileDlg = document.getElementById("FileDialogViewTable");
        if (tblFileDlg != null) {
            return true;
        }
        szHref = itemTable != null ? GetAttributeFromItemTable(itemTable, "Url", "ServerUrl") : "";
        if (szHref == null || szHref == "")
            szHref = ele.href;
        else
            szHref = SzServer(ele.href) + szHref;
        szExt = SzExtension(szHref);
        if ((currentItemProgId == null) && (itemTable != null))
            currentItemProgId = itemTable.getAttribute("HTMLType");
        if (currentItemProgId != null)
            szAppId = currentItemProgId;
        if (FDefaultOpenForReadOnly(szExt)) {
            if (strProgId.indexOf("SharePoint.OpenDocuments") >= 0)
                strProgId = "SharePoint.OpenDocuments.3";
        }
        else if (!FSupportCheckoutToLocal(szExt)) {
            strProgId = "";
        }
        if ((currentItemCheckedOutUserId == null) && (itemTable != null))
            currentItemCheckedOutUserId = itemTable.COUId;
        if ((currentItemCheckedoutToLocal == null) && (itemTable != null))
            currentItemCheckedoutToLocal = GetAttributeFromItemTable(itemTable, "COut", "IsCheckedoutToLocal ");
        if (((currentItemCheckedOutUserId != null) &&
        (currentItemCheckedOutUserId != "") &&
        (currentItemCheckedOutUserId == ctx.CurrentUserId) &&
        (strProgId == "" || ((strProgId.indexOf("SharePoint.OpenDocuments")) >= 0)) &&
        FSupportCheckoutToLocal(szExt)) ||
        (strProgId == "SharePoint.OpenDocuments")) {
            strProgId = "SharePoint.OpenDocuments.3";
        }
        var stsopenVersion = 2;
        if (strProgId != '' && HasRights(0x10, 0x0)) {
            if ((strProgId.indexOf(".3")) >= 0)
                stsopenVersion = 3;
            stsOpen = StsOpenEnsureEx(strProgId);
            if (stsOpen == null && stsopenVersion == 3) {
                strProgId = strProgId.replace(".3", ".2");
                stsOpen = StsOpenEnsureEx(strProgId);
                stsopenVersion = 2;
            }
        }
        if (stsOpen != null) {
            if (stsopenVersion == 2 ||
            ((itemTable == null) && (currentItemCheckedOutUserId == null)) ||
            (ctx.isVersions == 1 && (itemTable == null || itemTable.isMostCur == "0"))) {
                try {
                    if ((currentItemCheckedOutUserId != null) &&
                    (currentItemCheckedOutUserId != "") &&
                    (currentItemCheckedOutUserId == ctx.CurrentUserId ||
                    ctx.CurrentUserId == null)) {
                        if (currentItemCheckedoutToLocal == '1') {
                            alert(L_OpenDocumentLocalError_Text);
                            fRet = false;
                        }
                        else
                            fRet = stsOpen.EditDocument2(window, szHref, szAppId);
                    }
                    else {
                        fRet = stsOpen.ViewDocument2(window, szHref, szAppId);
                    }
                }
                catch (e) {
                    fRet = false;
                }
                if (fRet)
                    window.onfocus = RefreshOnNextFocus;
            }
            else {
                var iOpenFlag = 0;
                if (currentItemCheckedOutUserId != "") {
                    if ((currentItemCheckedOutUserId != ctx.CurrentUserId) && (ctx.CurrentUserId != null))
                        iOpenFlag = 1;
                    else if (currentItemCheckedoutToLocal == null ||
                    currentItemCheckedoutToLocal != '1')
                        iOpenFlag = 2;
                    else
                        iOpenFlag = 4;
                }
                else if (!HasRights(0x0, 0x4) || FDefaultOpenForReadOnly(szExt))
                    iOpenFlag = 1;
                else if (ctx.isForceCheckout == true)
                    iOpenFlag = 3;
                try {
                    fRet = stsOpen.ViewDocument3(window, szHref, iOpenFlag, szAppId);
                }
                catch (e) {
                    fRet = false;
                }
                if (fRet) {
                    var fRefreshOnNextFocus = stsOpen.PromptedOnLastOpen();
                    if (fRefreshOnNextFocus)
                        window.onfocus = RefreshOnNextFocus;
                    else
                        SetWindowRefreshOnFocus();
                }
            }
        }
        else if (currentItemCheckedoutToLocal == '1') {
            alert(L_OpenDocumentLocalError_Text);
        }
        if (stsOpen == null || !fRet) {
            if (fTransformServiceOn == 'TRUE' &&
            fShouldTransformExtension == 'TRUE' &&
            fTransformHandleUrl == 'TRUE') {
                if (itemTable == null)
                    return fRet;
                var getHttpRoot = new Function("return " + itemTable.getAttribute("CTXName") + ".HttpRoot;");
                GoToPage(getHttpRoot() + "/_layouts" + "/htmltrverify.aspx?doc=" + escapeProperly(szHref));
            }
            return;
        }
        stsOpen = null;
        return !fRet;
    };
}

function InstallOpenDocumentsPluginIfMissing() {
    var pluginPageUrl = '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Files/SetupPluginInfo.aspx';
    pluginPageUrl += '?source=' + escape(window.location.href);
    var typeInstalled = GetPluginTypeInstalled();
    if (window.SM.IsFF && typeInstalled == "NONE") {
        //для firefox плагин работает не стабильно, пока убираем поддержку ff
        return;
        //для firefox плагин работает не стабильно, пока убираем поддержку ff
        var params = {
            "Firefox Support for SharePoint": {
                URL: pluginPageUrl,
                toString: function () { return this.URL; }
            }
        };

        window.location.href = pluginPageUrl;
        //InstallTrigger.install(params);
    } else if (window.SM.IsChrome && typeInstalled != "RENIT") {
        //отключено, посколько теперь хром требует регистрации плагина в chromeStore.
        return;
        window.location.href = pluginPageUrl; 2
    }
}

function GetPluginTypeInstalled() {
    var anyVersionInstalled = navigator.mimeTypes && navigator.mimeTypes["application/x-sharepoint"] && navigator.mimeTypes["application/x-sharepoint"].enabledPlugin;
    if (anyVersionInstalled) {
        if (navigator.mimeTypes["application/x-sharepoint"].enabledPlugin.filename == 'NPSPWRAP.DLL') {
            return "MS";
        }
        else if (navigator.mimeTypes["application/x-sharepoint"].enabledPlugin.filename == 'npOpenDocuments.dll') {
            return "RENIT";
        }
    }
    return "NONE";
}

function SetInitDivHandler() {
    var div = window.document.getElementById('fileDiv');
    if (div != null)
        div.onclick = function () { fileClick(div.getAttribute('href')); };
}