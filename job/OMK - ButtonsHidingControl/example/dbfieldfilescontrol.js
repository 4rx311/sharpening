//debugger
function FilesClientField(pnlContainerID, hdnFormValueID, settingsXML, dataXML) {
    this.IsLoading = true;

    this.PanelContainer = window.document.getElementById(pnlContainerID);
    this.HiddenFormValue = window.document.getElementById(hdnFormValueID);

    this.SettingsDocument = window.SM.LoadXML(settingsXML);
    this.DataDocument = window.SM.LoadXML(dataXML);

    this.XmlElement = this.SettingsDocument.selectSingleNode('FieldControl');
    this.DataElement = this.DataDocument.selectSingleNode('FilesValueCollection');
    this.DataFilesElement = this.DataElement.selectSingleNode('Collection');

    this.NewDesign = this.XmlElement.getAttribute('NewDesign').toLowerCase() == 'true';
    this.InitMethods = FCF_InitMethods;
    this.InitMethods();



    if (this.DataFilesElement == null) {
        this.DataFilesElement = this.DataDocument.createElement('Collection');
        this.DataElement.appendChild(this.DataFilesElement);
    }


    //this.PropertiesElement = this.XmlElement.selectSingleNode('Properties');
    this.SourceFolder = '/_LAYOUTS/WSS/WSSC.V4.SYS.Fields.Files';
    this.StorageWebID = this.GetAttribute('StorageWebID');
    this.StorageWebUrl = this.GetAttribute('StorageWebUrl');
    this.StorageListID = this.GetAttribute('StorageListID');
    this.StorageListName = this.GetAttribute('StorageListName');
    this.TemplateWebID = this.GetAttribute('TemplateWebID');
    this.TemplateWebUrl = this.GetAttribute('TemplateWebUrl');
    this.TemplateListID = this.GetAttribute('TemplateListID');
    this.TemplateListName = this.GetAttribute('TemplateListName');
    this.EnableTemplateUpload = this.GetBooleanAttribute('EnableTemplateUpload');
    this.IsXmlTemplate = this.GetBooleanAttribute('IsXmlTemplate');
    this.CurrentUserCanCreate = this.GetBooleanAttribute('CurrentUserCanCreate');

    this.FilesCount = 0;
    this.ModulePath = this.GetAttribute('ModulePath');
    this.CurrentUser = this.GetAttribute('CurrentUser');
    this.EditMode = this.GetBooleanAttribute('EditMode');
    this.DropXapCacheParam = this.GetAttribute('DropXapCacheParam');
    this.ItemID = this.GetAttribute('ItemID');
    this.FieldWebUrl = this.GetAttribute('FieldWebUrl');
    this.FieldWebID = this.GetAttribute('FieldWebID');
    this.SiteUrl = this.GetAttribute('SiteUrl');
    this.FieldListName = this.GetAttribute('FieldListName');
    this.FieldListID = this.GetAttribute('FieldListID');
    this.FieldTitle = this.GetAttribute('FieldTitle');
    this.FieldInternalName = this.GetAttribute('FieldInternalName');
    this.FieldID = this.GetAttribute('FieldID');
    this.HostUrl = this.GetAttribute('HostUrl');
    this.ItemFolderName = this.GetAttribute('ItemFolderName');
    this.CellClass = 'files-cell';
    this.CellClassAlternate = 'files-cell-alternate';
    this.FileVersionsEnabled = this.GetBooleanAttribute('FileVersionsEnabled');
    this.EnableOverwriteWithAnotherName = this.GetBooleanAttribute('EnableOverwriteWithAnotherName');
    this.EnableOverwriteWithoutDeleteAccess = this.GetBooleanAttribute('EnableOverwriteWithoutDeleteAccess');
    this.EnableTrackRevisionsOnItemUpdate = this.GetBooleanAttribute('EnableTrackRevisionsOnItemUpdate');
    this.ReplaceHttpsByHttp = this.GetBooleanAttribute('ReplaceHttpsByHttp');
    this.SaveFileOnUpload = this.GetBooleanAttribute('SaveFileOnUpload');
    this.Changed = false;
    this.EnableScan = this.GetBooleanAttribute('EnableScan');
    this.EnableBarCodePrint = this.GetBooleanAttribute('EnableBarCodePrint');
    this.EnablePreview = this.GetBooleanAttribute('EnablePreview');
    this.EnableFooterText = this.GetBooleanAttribute('EnableFooterText');
    this.EnableFilesSending = this.GetBooleanAttribute('EnableFilesSending');
    this.EnableSigning = this.GetBooleanAttribute('EnableSigning');
    this.PreviewPagesCountLimit = this.GetAttribute('PreviewPagesCountLimit');
    this.BarCodePrinterParamsNode = this.XmlElement.selectSingleNode('BarCodePrinterParams');
    this.HideUploadButton = this.GetBooleanAttribute('HideUploadButton');
   // this.BarCodeXapVersion = this.GetAttribute('BarCodeXapVersion');
    this.OpenOfficeDocumentsForEditDirectly = this.GetBooleanAttribute('OpenOfficeDocumentsForEditDirectly');
    this.ControlWidth = this.GetIntegerAttribute('ControlWidth');
    this.WindowWidth = this.GetIntegerAttribute('WindowWidth');
    this.WindowHeight = this.GetIntegerAttribute('WindowHeight');
    this.DownloadEnabled = this.GetBooleanAttribute('DownloadEnabled');

    this.DenyFileEdit = this.GetBooleanAttribute('DenyFileEdit');
    this.DenyFileCopy = this.GetBooleanAttribute('DenyFileCopy');
    this.DenyFilePrint = this.GetBooleanAttribute('DenyFilePrint');
    this.HasFileDeny = this.DenyFileEdit || this.DenyFileCopy || this.DenyFilePrint;

    this.SilverlightLoadingQueue = new Array();

    if (window.FilesForm == null) {
        window.FilesForm = new FilesFormObject(this.NewDesign);
        window.FilesForm.DropXapCacheParam = this.DropXapCacheParam;
        window.FilesForm.FirstField = this;
    }

    this.FilesForm = window.FilesForm;
    this.FilesForm.AddField(this);

    if (this.FilesForm.UploadControl == null) {
        if (this.FilesForm.UploadObject == null)
            this.FilesForm.CreateUploadObject();
    }
    if (this.EnableScan && this.FilesForm.ExtensionsControl == null) {
        if (this.FilesForm.ExtensionsObject == null)
            this.FilesForm.CreateExtensionsObject();
    }

    this.AddToFormCollection();
    this.CreateMainPanel();
    this.InitFiles();
    this.PersistData();

    if (this.EditMode) {
        this.FilesForm.LoadingQueue.push(this);
        this.FilesForm.LoadField();
    }

    this.IsLoading = false;
}

function FCF_IsChanged() {
    return this.Changed == true;
}

//debugger
function FCF_SendFiles() {
    var url = this.SourceFolder + '/SendFilesPage.aspx?';
    url += 'webID=' + window.ListForm.WebID;
    url += '&listID=' + window.ListForm.ListID;
    url += '&itemID=' + window.ListForm.ItemID;
    url += '&fieldID=' + this.FieldID;
    url += '&rnd=' + Math.random()

    //var ajax = new ActiveXObject("Microsoft.XMLHTTP");
    var ajax = window.SM.GetXmlRequest();
    ajax.open("GET", url, true);

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            ajax.onreadystatechange = new Function();
            var response = ajax.responseText;
            if (!IsNullOrEmpty(response)) {
                if (response.indexOf('exception:') == -1)
                    alert(response);
                else
                    alert(window.TN.TranslateKey('files.alerts.senderror') + ' \r\n\r\n' + response);
            }
            else
                alert(window.TN.TranslateKey('files.alerts.senderror'));
        }
    }

    ajax.send(null);
}

function FilesFormObject(newDesign) {
    //debugger
    this.CurrentLoadingField = null;
    this.LoadingQueue = new Array();
    this.AllFields = new Array();
    this.AddField = FF_AddField;
    this.LoadField = FF_LoadField;
    this.CreateUploadObject = FF_CreateUploadObject;
    this.CreateExtensionsObject = FF_CreateExtensionsObject;
    this.NewDesign = newDesign;
    this.UseHttpUpload = !(SM.IsIE && Silverlight.isInstalled(null));

    this.FilesLoadingCount = 0;
    this.InitIOButtonts = FF_InitIOButtonts;
    this.DisableOK = FF_DisableOK;
    this.EnableOK = FF_EnableOK;
    this.IsFileUploading = FF_IsFileUploading;
    this.OnListFormInit = FF_OnListFormInit;

    var thisObj = this;
    window.ListForm.AddInitHandler(function () { thisObj.InitIOButtonts(); })

    String.prototype.trimSpace = function () { return this.replace(/(^\s+)|(\s+$)/g, ""); }
}

function FF_OnListFormInit() {
    this.InitIOButtonts();
}

function FF_AddField(filesField) {
    this.AllFields.push(filesField);
}

function FF_InitIOButtonts() {
    //debugger
    var inps = window.document.getElementsByTagName('input');
    var i, len = inps.length;
    this.CancelButtons = new Array();
    this.SaveButtons = new Array();

    if (window.ListForm.UpdateButton != null)
        this.SaveButtons.push(window.ListForm.UpdateButton);
    if (window.ListForm.CancelButton != null)
        this.CancelButtons.push(window.ListForm.CancelButton);
}

window.FLS_DisableOKOnFileUploading = true;
function FF_DisableOK() {
    this.FilesLoadingCount++;
    if (window.FLS_DisableOKOnFileUploading) {
        if (this.SaveButtons.length > 0) {
            var i, len = this.SaveButtons.length;
            for (i = 0; i < len; i++) {
                var btnOk = this.SaveButtons[i];
                btnOk.title = 'Подождите, пожалуйста. Идет загрузка файла.';
                btnOk.disabled = true;
            }
        }
    }
}

function FF_EnableOK() {
    if (this.FilesLoadingCount > 0)
        this.FilesLoadingCount--;
    if (window.FLS_DisableOKOnFileUploading) {
        if (this.SaveButtons.length > 0) {
            if (this.FilesLoadingCount == 0) {
                var i, len = this.SaveButtons.length;
                for (i = 0; i < len; i++) {
                    var btnOk = this.SaveButtons[i];
                    btnOk.title = '';
                    btnOk.disabled = false;
                }
            }
        }
    }
}

function FF_IsFileUploading() {
    var result = this.FilesLoadingCount > 0;
    return result;
}

function FF_CreateUploadObject() {
    if (!this.UseHttpUpload) {
        var divUploadContainer = window.document.getElementById('divFilesFormUploadContainer');

        var controlWidth = '0';
        var controlHeight = '0';
        if (!Silverlight.isInstalled(null)) {
            controlWidth = '100';
            controlHeight = '100';
        }
        var params = '';
        var objectName = 'WSSC_Fields_FilesForm';
        var objectSrc = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/WSSC.V4.SYS.Fields.Files.Client.xap?rev=' + this.DropXapCacheParam;
        var altHTML = '';

        Silverlight.createObject(
            objectSrc,
            divUploadContainer,
            objectName,
            {
                width: controlWidth,
                height: controlHeight,
                background: 'white',
                version: '2.0.31005.0',
                windowless: 'true',
                alt: altHTML
            },
            {
                onError: null,
                onLoad: null
            },
            params,
            null);

        if (window.Silverlight == null || !window.Silverlight.isInstalled(null))
            divUploadContainer.style.display = 'none';

        this.UploadObject = window.document.getElementById(objectName);
    }
    else {
        this.UploadObject = new DBFieldFilesHttpUploadControl(this);
        FilesForm_InitUploadControl();
    }

}

//debugger
function FF_CreateExtensionsObject() {
    var divExtensionsContainer = window.document.getElementById('divFilesFormExtensionsContainer');

    var controlWidth = '0';
    var controlHeight = '0';
    if (!Silverlight.isInstalled(null)) {
        controlWidth = '100';
        controlHeight = '100';
    }
    var params = '';
    var objectName = 'WSSC_Fields_FilesForm_Extensions';
    var objectSrc = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/WSSC.V4.SYS.Fields.Files.Extensions.xap?rev=20' + this.DropXapCacheParam;
    var altHTML = '';

    Silverlight.createObject(
        objectSrc,
        divExtensionsContainer,
        objectName,
        {
            width: controlWidth,
            height: controlHeight,
            background: 'white',
            version: '5.0.61118.0',
            windowless: 'true',
            alt: altHTML
        },
        {
            onError: null,
            onLoad: null
        },
        params,
        null);

    if (window.Silverlight == null || !window.Silverlight.isInstalled(null))
        divExtensionsContainer.style.display = 'none';

    this.ExtensionsObject = window.document.getElementById(objectName);
}

//catch silverlight memory leak
$(window).unload(function () {
    if (window.FilesForm != null && !window.FilesForm.UseHttpUpload) {
        var divUploadContainer = window.document.getElementById('divFilesFormUploadContainer');
        if (divUploadContainer != null) {
            var pn = divUploadContainer.parentNode;
            if (pn != null)
                pn.removeChild(divUploadContainer);
            delete divUploadContainer;
        }
    }
});

//debugger
function FilesForm_InitExtensions() {
    window.FilesForm.ScanControl = window.FilesForm.ExtensionsObject.content.ScanControl;

    window.FilesForm.ScanAllowed = false;
    if (window.FilesForm.ScanControl != null) {
        try {
            var allowed = window.FilesForm.ScanControl.ScanAllowed();
            window.FilesForm.ScanAllowed = allowed;
        }
        catch (ex) {
        }
    }
}

//debugger
function FilesForm_InitUploadControl() {
    if (!window.FilesForm.UseHttpUpload)
        window.FilesForm.UploadControl = window.FilesForm.UploadObject.content.pageObject;
    else
        window.FilesForm.UploadControl = window.FilesForm.UploadObject;

    window.FilesForm.BarCodePrinter = window.document.getElementById('axoBarCodePrinter');
    if (window.FilesForm.BarCodePrinter != null) {
        try {
            var allowed = window.FilesForm.BarCodePrinter.PrintAllowed();
            window.FilesForm.BarCodePrintAllowed = allowed;
        }
        catch (ex) {
        }
        if (window.FilesForm.BarCodePrintAllowed) {
            window.FilesForm.BarCodePrinter.attachEvent('OnCompletePrint', function (fieldID, completedSuccessfully) {
                PrintBarCodeCompleted(fieldID, completedSuccessfully);
            });
            window.FilesForm.BarCodePrinter.attachEvent('OnError', function (error) { window.alert(error); });

            window.FilesForm.BarCodePrinter.SetParam("SiteUrl", window.FilesForm.FirstField.SiteUrl);
            window.FilesForm.BarCodePrinter.SetParam("WebID", window.FilesForm.FirstField.FieldWebID);
            window.FilesForm.BarCodePrinter.SetParam("ListID", window.FilesForm.FirstField.FieldListID);
            window.FilesForm.BarCodePrinter.SetParam("ItemID", window.ListForm.ItemID.toString());            

            if (window.FilesForm.FirstField.BarCodePrinterParamsNode != null) {
                var paramNodes = window.FilesForm.FirstField.BarCodePrinterParamsNode.selectNodes('Param');
                var i, len = paramNodes.length;
                for (i = 0; i < len; i++) {
                    var paramNode = paramNodes[i];
                    var paramName = paramNode.getAttribute('ParamName');
                    var paramValue = paramNode.getAttribute('ParamValue');
                    if (!IsNullOrEmpty(paramName)) {
                        if (IsNullOrEmpty(paramValue))
                            paramValue = '';
                        window.FilesForm.BarCodePrinter.SetParam(paramName, paramValue);
                    }
                }
            }
        }
    }

    window.FilesForm.LoadField();
}


function FF_LoadField() {
    if (this.UploadControl != null && this.CurrentLoadingField == null) {
        var clientField = this.LoadingQueue.shift();
        if (clientField != null) {
            this.CurrentLoadingField = clientField;
            clientField.InitUploadControls();
        }
    }
}

/*--------------------- HttpUploadControl ----------------------*/

function FCF_OnSelectFiles(uploadControl, isMultiple, fileIndex) {
    var files = null;
    if (!SM.IsIE || SM.IEVersion >= 10)
        files = uploadControl.Input.files;
    else {
        files = new Array();
        var fileValue = uploadControl.Input.value;
        if (!SM.IsNE(fileValue)) {
            var splPath = fileValue.split('\\');
            if (splPath.length > 0) {
                var fileName = splPath[splPath.length - 1];
                if (!SM.IsNE(fileName)) {
                    var file = new Object();
                    file.name = fileName;
                    file.size = 1;
                    files.push(file);
                }
            }
        }
    }
    if (files != null && files.length > 0) {
        var field = this;
        if (fileIndex == null)
            fileIndex = -1;

        var i, len = files.length;
        var fileItemID = -1;
        var uploadCount = 0;
        var validFiles = '';
        for (i = 0; i < len; i++) {
            var file = files[i];
            var fileName = file.fileName != null ? file.fileName : file.name;
            var fileSize = file.fileSize != null ? file.fileSize : file.size;
            fileName = field.FixRussianSpecChars(fileName);
            var iconUrl = GetIconUrl(fileName);

            if (isMultiple) {
                var canUpload = MultiFileUploadStart(fileName, field.FieldTitle, iconUrl);
                if (canUpload) {
                    if (validFiles.length > 0)
                        validFiles += '_fn_';
                    validFiles += fileName;
                    uploadCount++;
                }
            }
            else {
                fileItemID = SingleFileUploadStart(fileIndex, fileName, field.FieldTitle, iconUrl);
                if (fileItemID > 0) {
                    if (validFiles.length > 0)
                        validFiles += '_fn_';
                    validFiles += fileName;
                    uploadCount++;
                }
                else
                    fileItemID = -1;
                break;
            }
        }
        var doUpload = uploadCount > 0;

        if (doUpload) {
            var url = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/UploadHandler.ashx?rnd=' + Math.random();
            var params = '';
            params += '&fieldWebID=' + field.FieldWebID;
            params += '&fieldListID=' + field.FieldListID;
            params += '&fieldID=' + field.FieldID;
            params += '&itemFolderName=' + field.ItemFolderName;
            params += '&fileIndex=' + fileIndex;
            params += '&fileItemID=' + fileItemID;
            
            if (!uploadControl.IsMultiple && uploadControl.IsMultiCompatible) {
                params += '&isMultiple=true'
            }
            else {
                params += '&isMultiple=' + uploadControl.IsMultiple;
            }

            
            params += '&validFiles=' + encodeURI(field.EncodeFileName(validFiles));

            url += params;

            uploadControl.SubmitFiles(url);
        }
        else {
            if (isMultiple)
                EnableMultiUploadControl(field.FieldTitle);
        }
    }
}

function FCF_FixRussianSpecChars(fileName) {
    if (!SM.IsNE(fileName)) {
        //правка баги с буквами ё,Й в сафари
        fileName = FCF_FixSpecChar(fileName, 1077, 776, 'ё');
        fileName = FCF_FixSpecChar(fileName, 1045, 776, 'Ё');
        fileName = FCF_FixSpecChar(fileName, 1080, 774, 'й');
        fileName = FCF_FixSpecChar(fileName, 1048, 774, 'Й');
    }
    return fileName;
}

function FCF_FixSpecChar(fileName, simpleCharCode, suffixCharCode, correctChar) {
    if (!SM.IsNE(fileName)) {
        //правка баги с буквой ё в сафари
        var cc0 = String.fromCharCode(simpleCharCode);
        var cc1 = String.fromCharCode(suffixCharCode);
        var cc = cc0 + cc1;
        if (fileName.indexOf(cc) != -1) {
            while (fileName.indexOf(cc) != -1)
                fileName = fileName.replace(cc, correctChar);
        }
    }
    return fileName;
}

//debugger
function FCF_EncodeFileName(fileName) {
    if (!SM.IsNE(fileName)) {
        var rgQ = /([?])/g;
        var rgSharp = /([#])/g;
        var rgAmp = /([&])/g;
        fileName = fileName.replace(rgQ, 'q_smb');
        fileName = fileName.replace(rgSharp, 'sh_smb');
        fileName = fileName.replace(rgAmp, 'amp_smb');
    }
    return fileName;
}

function FCF_OnUpload(uploadControl, responseText) {
    if (SM.IsNE(responseText))
        return;
    if (responseText.indexOf('UploadError:') != -1) {
        alert(responseText);
        return;
    }
    var result = $.parseJSON(responseText);
    if (result == null)
        throw new Error('Не удалось получить результат загрузки файлов по JSON:' + responseText);
    var i, len = result.UploadedFiles.length;
    for (i = 0; i < len; i++) {
        var fileUploadResult = result.UploadedFiles[i];
        var fileName = fileUploadResult.FileName;
        if (!SM.IsNE(fileUploadResult.Error)) {
            var errorText = fileUploadResult.Error;
            var lowError = errorText.toLowerCase();
            var loadFileErrorText = window.TN.TranslateKey('files.alerts.loaderror') + ' "' + fileName + '". ';
            if (lowError.indexOf("0x800401e6") != -1 || lowError.indexOf("0x81070964") != -1) {
                var fileTypeBlockedText = window.TN.TranslateKey('files.alerts.filetypeblocked');
                errorText = loadFileErrorText + fileTypeBlockedText;
                //errorText = 'Ошибка загрузки файла "' + fileName + '". Тип файла заблокирован для загрузки.';
            }
            else if (lowError.indexOf("timeoutexception") != -1)
                errorText = window.TN.TranslateKey('files.alerts.timeout');
                //errorText = "Сервер не отвечает. Попробуйте повторить операцию позже.";
            else if (lowError.indexOf("0x81020036") != -1) {
                var fileBlockedText = window.TN.TranslateKey('files.alerts.fileblocked');
                errorText = loadFileErrorText + fileBlockedText;
                //errorText = 'Ошибка загрузки файла "' + fileName + '". Невозможно перезаписать файл, поскольку он извлечен или заблокирован для редактирования другим пользователем.';
            }
            else if (lowError.indexOf("0x80070018") != -1) {
                var fileContentLimitOverflowText = window.TN.TranslateKey('files.alerts.filecontentlimitoverflow');
                errorText = loadFileErrorText + fileContentLimitOverflowText;
                //errorText = 'Ошибка загрузки файла "' + fileName + '". Превышен установленный администратором максимальный допустимый размер загружаемого файла.';
            }
            else if (lowError.indexOf("pathtoolongexception") != -1 || lowError.indexOf("0x81070968") != -1) {
                var fileNameLimitOverflowText = window.TN.TranslateKey('files.alerts.filenamelimitoverflow');
                errorText = loadFileErrorText + fileNameLimitOverflowText;
                //errorText = 'Ошибка загрузки файла "' + fileName + '". Указанное имя файла имеет слишком большую длину. Имя файла может содержать не более 128 знаков.';
            }
            alert(errorText);
        }
        if (!result.IsTemplate) {
            if (result.IsMultiple) {
                MultiFileUploadCompleted(result.FieldName, fileUploadResult.FileAdded, fileUploadResult.FileName, fileUploadResult.FileUrl, fileUploadResult.FileItemID, fileUploadResult.IconUrl);
                if (result.IsDroppedFile)
                    FDC_ProcessDroppedFile.call(this.DragControl);
            }
            else {
                SingleFileUploadCompleted(result.FieldName, fileUploadResult.FileAdded, fileUploadResult.FileName, fileUploadResult.FileUrl, fileUploadResult.FileItemID, fileUploadResult.IconUrl, fileUploadResult.FileIndex);
                break;
            }
        }
        else
            TemplateUploadCompleted(result.FieldName, fileUploadResult.FileAdded, fileUploadResult.FileName, fileUploadResult.FileUrl, fileUploadResult.FileItemID, fileUploadResult.IconUrl);
    }
    if (result.IsMultiple || result.IsTemplate)
        EnableMultiUploadControl(result.FieldName);
}

function FCF_OnUploadInputHover(lnkUpload) {
    lnkUpload.style.textDecoration = 'none';
}

function FCF_OnUploadInputOut(lnkUpload) {
    lnkUpload.style.textDecoration = '';
}

function DBFieldFilesHttpUploadControl() {
    this.EnableUpload = function () { }
    this.DisableUpload = function () { }
}

/*--------------------- FilesClientField -----------------------*/
function FCF_InitMethods() {
    if (!this.NewDesign) {
        this.GetAttribute = FCF_GetAttribute;
        this.GetBooleanAttribute = FCF_GetBooleanAttribute;
        this.GetIntegerAttribute = FCF_GetIntegerAttribute;
        this.CreateMainPanel = FCF_CreateMainPanel;
        this.InitFiles = FCF_InitFiles;
        this.AddToFormCollection = FCF_AddToFormCollection;
        this.PersistData = FCF_PersistData;
        this.AddFile = FCF_AddFile;
        this.GetFile = FCF_GetFile;
        this.GetFileByIndex = FCF_GetFileByIndex;
        this.ResetRowAlternating = FCF_ResetRowAlternating;
        this.Disable = FCF_Disable;
        this.Enable = FCF_Enable;
        this.InitUploadControls = FCF_InitUploadControls;
        this.InitScanControl = FCF_InitScanControl;
        this.HasFiles = FCF_HasFiles;
        this.OnSave = FCF_OnSave;
        this.IsEmptyValue = FCF_IsEmptyValue;
        this.IsChanged = FCF_IsChanged;
        this.SendFiles = FCF_SendFiles;
        this.CheckFilesVisibility = FCF_CheckFilesVisibility;
        this.IgnoreFormValue = FCF_IgnoreFormValue;
    }
    else {
        this.GetAttribute = FCF_GetAttribute;
        this.GetBooleanAttribute = FCF_GetBooleanAttribute;
        this.GetIntegerAttribute = FCF_GetIntegerAttribute;
        this.AddToFormCollection = FCF_AddToFormCollection;
        this.PersistData = FCF_PersistData;
        this.AddFile = FCF_AddFile;
        this.GetFile = FCF_GetFile;
        this.GetFileByIndex = FCF_GetFileByIndex;
        this.ResetRowAlternating = FCF_ResetRowAlternating;
        this.InitUploadControls = FCF_InitUploadControls;
        this.InitScanControl = FCF_InitScanControl;
        this.HasFiles = FCF_HasFiles;
        this.OnSave = FCF_OnSave;
        this.IsEmptyValue = FCF_IsEmptyValue;
        this.IsChanged = FCF_IsChanged;
        this.IgnoreFormValue = FCF_IgnoreFormValue;
        this.SendFiles = FCF_SendFiles;

        //ovveride
        this.InitFiles = FCF_InitFiles_Des1;
        this.ResetLayout = FCF_ResetLayout_Des1;
        this.CreateMainPanel = FCF_CreateMainPanel_Des1;
        this.CheckFilesVisibility = FCF_CheckFilesVisibility_Des1;
        this.Disable = FCF_Disable_Des1;
        this.Enable = FCF_Enable_Des1;
    }
    this.OnSelectFiles = FCF_OnSelectFiles;
    this.OnUpload = FCF_OnUpload;
    this.OnUploadInputHover = FCF_OnUploadInputHover;
    this.OnUploadInputOut = FCF_OnUploadInputOut;
    this.SignFiles = FCF_SignFiles;
    this.EncodeFileName = FCF_EncodeFileName;
    this.FixRussianSpecChars = FCF_FixRussianSpecChars;
}

function FCF_SignFiles(signer) {
    var isSelfSigner = false;
    var fullResult = { ResultCode: 0, ErrorMessage: null };
    if (!this.EnableSigning) {
        fullResult.ErrorMessage = 'Поле ' + this.FieldTitle + ' не поддерживает функциональность ЭЦП.';
        fullResult.ResultCode = 2;
        return fullResult;
    }
    if (signer == null) {
        var checkAllowedResult = window.Crypto.CheckSignAllowed(false);
        if (checkAllowedResult.Exception != null) {
            fullResult.ResultCode = 2;
            fullResult.ErrorMessage = checkAllowedResult.Exception.DisplayText;
            return fullResult;
        }

        //если свой signer - отображаем ошибку. Хотя нет, ведь на Cancel ошибка не отображается.
        var signerResult = window.Crypto.GetSigner(false);
        if (signerResult.Exception != null) {
            fullResult.ResultCode = 2;
            fullResult.ErrorMessage = signerResult.Exception.DisplayText;
            return fullResult;
        }
        if (signerResult.Canceled)
            signer = null;

        signer = signerResult.Signer;
        isSelfSigner = true;
    }
    if (signer == null) {
        fullResult.ResultCode = 1;
        fullResult.ErrorMessage = window.TN.TranslateKey('files.alerts.nosigner');
        return fullResult;
    }

    var i, len = this.FilesByIndex.length;
    for (i = 0; i < len; i++) {
        var file = this.FilesByIndex[i];
        if (!file.Deleted) {
            if (file.CryptoFileVersion == null) {
                file.CryptoFileVersion = {
                    FileItemID: file.FileItemID,
                    FileListID: file.FileListID
                };
            }
            var result = CryptoFileVersion.Sign(file.CryptoFileVersion, signer);
            //в случае ошибки делаем возврат управления.
            if (result.ResultCode != 0)
                return result;
        }
    }
    if (isSelfSigner && signer != null) {
        var disposeResult = signer.Dispose();
        if (window.Crypto.HasError(disposeResult))
            return;
        signer = null;
    }

    return fullResult;
}

function FCF_OnSave(saveEventArgs) {
    if (this.ListFormField != null) {
        if (this.ListFormField.Required) {
            var isEmptyValue = !this.HasFiles();
            saveEventArgs.CanSave = !isEmptyValue;
            saveEventArgs.IsEmptyValue = isEmptyValue;
        }
    }
}

function FCF_IsEmptyValue() {
    var isEmptyValue = !this.HasFiles();
    return isEmptyValue;
}

function FCF_HasFiles() {
    var i, len = this.FilesByIndex.length;
    var filesCount = 0;
    var result = false;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (!fileItem.Deleted)
            filesCount++;
    }
    if (filesCount > 0)
        result = true;
    return result;
}

function CheckFilesCount(fieldTitle) {
    var result = false;
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null)
        result = clientField.HasFiles();
    return result;
}

//debugger
function FCF_InitUploadControls() {
    //инициализация контролов загрузки
    if (!window.FilesForm.UseHttpUpload) {
        var params = '';
        params = SetParamValue(params, 'webServiceUrl', this.HostUrl + '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/FilesUploadService.asmx');
        params = SetParamValue(params, 'fieldWebUrl', this.FieldWebUrl);
        params = SetParamValue(params, 'fieldListName', this.FieldListName);
        params = SetParamValue(params, 'fieldTitle', this.FieldTitle);
        params = SetParamValue(params, 'itemFolderName', this.ItemFolderName);

        this.FilesForm.UploadControl.CreateFieldLoader(this.FieldTitle, params);
    }

    if (this.MultiUploadControl != null)
        this.MultiUploadControl.EnableUpload();
    if (this.EnableTemplateUpload && this.TemplateUploadControl != null)
        this.TemplateUploadControl.EnableUpload();
    var i, len = this.FilesByIndex.length;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (fileItem != null) {
            if (!fileItem.Deleted && fileItem.CanView && fileItem.UploadControl != null)
                fileItem.UploadControl.EnableUpload();
        }
    }
    if (this.EnableBarCodePrint && this.FilesForm.BarCodePrinter != null) {
        //(в режиме запрета загрузки новых файлов он может быть равен null.)
        if (this.BarCodePrinterControl != null)
            this.BarCodePrinterControl.EnableUpload();
    }


    this.FilesForm.CurrentLoadingField = null;
    this.FilesForm.LoadField();
}

function FCF_InitScanControl() {
    if (!this.__init_InitScanControl) {
        if (this.EnableScan && this.FilesForm.ScanControl != null) {
            //(в режиме запрета загрузки новых файлов он может быть равен null.)
            if (this.ScanUploadControl != null)
                this.ScanUploadControl.EnableUpload();

            if (this.FilesForm.ScanAllowed) {
                var params = '';
                params = SetParamValue(params, 'webServiceUrl', this.HostUrl + '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/FilesUploadService.asmx');
                params = SetParamValue(params, 'fieldWebUrl', this.FieldWebUrl);
                params = SetParamValue(params, 'fieldListName', this.FieldListName);
                params = SetParamValue(params, 'fieldTitle', this.FieldTitle);
                params = SetParamValue(params, 'itemFolderName', this.ItemFolderName);

                this.FilesForm.ScanControl.CreateFieldScanner(this.FieldTitle, params);
            }
        }
        this.__init_InitScanControl = true;
    }
}


function SetParamValue(paramString, paramKey, paramValue) {
    if (paramString == null)
        paramString = '';
    if (paramString.length > 0)
        paramString += '_prm_';
    paramString += paramKey + '_prmv_' + paramValue;
    return paramString;
}

function FCF_Disable() {
    if (this.MainPanel != null)
        this.MainPanel.style.display = 'none';
    if (this.MultiUploadControl != null)
        this.MultiUploadControl.DisableUpload();
    if (this.EnableTemplateUpload && this.TemplateUploadControl != null)
        this.TemplateUploadControl.DisableUpload();
    if (this.EnableScan && this.ScanUploadControl != null && this.FilesForm.ScanControl != null)
        this.ScanUploadControl.DisableUpload();
    if (this.EnableBarCodePrint && this.BarCodePrinterControl != null && this.FilesForm.BarCodePrinter != null)
        this.BarCodePrinterControl.DisableUpload();
    var i, len = this.FilesByIndex.length;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (fileItem != null) {
            if (!fileItem.Deleted && fileItem.CanView)
                fileItem.Disable();
        }
    }
}

function FCF_Enable() {
    if (this.MainPanel != null)
        this.MainPanel.style.display = '';
    if (this.MultiUploadControl != null)
        this.MultiUploadControl.EnableUpload();
    if (this.EnableTemplateUpload && this.TemplateUploadControl != null)
        this.TemplateUploadControl.EnableUpload();
    if (this.EnableScan && this.ScanUploadControl != null && this.FilesForm.ScanControl != null)
        this.ScanUploadControl.EnableUpload();
    if (this.EnableBarCodePrint && this.BarCodePrinterControl != null && this.FilesForm.BarCodePrinter != null)
        this.BarCodePrinterControl.EnableUpload();
    var i, len = this.FilesByIndex.length;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (fileItem != null) {
            if (!fileItem.Deleted && fileItem.CanView)
                fileItem.Enable();
        }
    }
}

function FCF_GetFile(fileName) {
    var fileItem = null;
    if (!IsNullOrEmpty(fileName))
        fileItem = this.FilesByName[fileName.toLowerCase()];
    return fileItem;
}

function FCF_GetFileByIndex(fileIndex) {
    var fileItem = this.FilesByIndex[fileIndex];
    return fileItem;
}

function FCF_AddFile(fileName) {
    var fileItem = new FilesClientItem(this);
    fileItem.FileName = fileName;
    fileItem.FileIndex = this.FilesByIndex.length;
    this.FilesByIndex[fileItem.FileIndex] = fileItem;
    this.FilesByName[fileName.toLowerCase()] = fileItem;

    var ext = GetFileExtenstion(fileItem.FileName);
    if (!IsNullOrEmpty(ext))
        fileItem.IsPdf = ext.toLowerCase() == 'pdf';
    else
        fileItem.IsPdf = false;

    this.FilesCount++;
    this.CheckFilesVisibility();
    return fileItem;
}

function FCF_CheckFilesVisibility() {
    if (this.FilesCount > 0)
        this.TableFiles.style.display = '';
    else
        this.TableFiles.style.display = 'none';
}

function FCF_PersistData() {
    this.HiddenFormValue.value = window.SM.PersistXML(this.DataDocument);
    if (!this.IsLoading)
        this.Changed = true;
}

var _filesUploadFieldCollection = null;
var _filesUploadFieldCollectionByID = null;
function FCF_AddToFormCollection() {
    if (_filesUploadFieldCollection == null)
        _filesUploadFieldCollection = new Array();
    if (_filesUploadFieldCollectionByID == null)
        _filesUploadFieldCollectionByID = new Array();
    if (_filesUploadFieldCollection[this.FieldTitle] == null)
        _filesUploadFieldCollection[this.FieldTitle] = this;
    if (_filesUploadFieldCollectionByID[this.FieldID] == null)
        _filesUploadFieldCollectionByID[this.FieldID] = this;
}

function GetFilesClientField(fieldTitle) {
    var filesField = null;
    if (_filesUploadFieldCollection != null)
        filesField = _filesUploadFieldCollection[fieldTitle];
    return filesField;
}

function GetFilesField(fieldID) {
    var field = null;
    if (_filesUploadFieldCollectionByID != null) {
        if (!IsNullOrEmpty(fieldID)) {
            fieldID = fieldID.toString();
            field = _filesUploadFieldCollectionByID[fieldID];
        }
    }
    return field;
}

function FCF_InitFiles() {
    var fileNodes = this.DataFilesElement.selectNodes('FilesValue');
    var i, len = fileNodes.length;
    this.FilesByIndex = new Array();
    this.FilesByName = new Array();
    for (i = 0; i < len; i++) {
        var fileNode = fileNodes[i];
        var fileName = GetAttributeValue(fileNode, 'FileName');
        var file = this.AddFile(fileName);
        file.Existing = true;
        file.XmlElement = fileNode;
        file.SetProperties(fileNode);
        if (file.CanView) {
            file.CreateContainer(true);
            file.InitSignatures();
        }
    }
}

function FCF_CreateMainPanel() {
    var clientField = this;
    if (this.EditMode && this.CurrentUserCanCreate) {
        var divMainPanel = window.document.createElement('div');
        this.PanelContainer.appendChild(divMainPanel);
        this.MainPanel = divMainPanel;
        divMainPanel.style.paddingTop = '2px';
        divMainPanel.style.paddingBottom = '2px';
        var tbMainPanel = window.document.createElement('table');
        divMainPanel.appendChild(tbMainPanel);
        tbMainPanel.border = 0;
        tbMainPanel.cellPadding = 0;
        tbMainPanel.cellSpacing = 0;
        //tbMainPanel.style.width = '100%';
        var trMainPanel = tbMainPanel.insertRow();
        var tdUploadFiles = trMainPanel.insertCell();
        var uploadFilesContainerID = 'uploadFilesContainerID_' + this.FieldInternalName;
        tdUploadFiles.id = uploadFilesContainerID;
        tdUploadFiles.style.width = '0%';

        var btnMultiUpload = window.document.createElement('input');
        btnMultiUpload.type = 'button';
        tdUploadFiles.appendChild(btnMultiUpload);
        btnMultiUpload.className = 'files-uploadButton';
        btnMultiUpload.style.width = '110px';
        //btnMultiUpload.style.height = '26px';
        btnMultiUpload.value = 'Загрузить файлы';
        btnMultiUpload.DisableUpload = function () { btnMultiUpload.disabled = true; }
        btnMultiUpload.EnableUpload = function () { btnMultiUpload.disabled = false; }
        btnMultiUpload.onclick = function () { window.FilesForm.UploadControl.OpenMultiFileDialog(clientField.FieldTitle); }
        btnMultiUpload.DisableUpload();
        this.MultiUploadControl = btnMultiUpload;


        if (this.EnableTemplateUpload) {
            var tdTemplateUpload = trMainPanel.insertCell();
            tdTemplateUpload.id = 'templateFilesUploadContainer_' + this.FieldInternalName;
            tdTemplateUpload.style.width = '0%';
            tdTemplateUpload.style.paddingLeft = '7px';

            var btnTemplateUpload = window.document.createElement('input');
            btnTemplateUpload.type = 'button';
            tdTemplateUpload.appendChild(btnTemplateUpload);
            btnTemplateUpload.className = 'files-uploadButton';
            btnTemplateUpload.style.width = '135px';
            //btnTemplateUpload.style.height = '26px';
            btnTemplateUpload.value = 'Загрузить из шаблона';
            btnTemplateUpload.DisableUpload = function () { btnTemplateUpload.disabled = true; }
            btnTemplateUpload.EnableUpload = function () { btnTemplateUpload.disabled = false; }
            btnTemplateUpload.onclick = function () { OpenTemplateWindow(clientField.FieldTitle); }
            btnTemplateUpload.DisableUpload();
            this.TemplateUploadControl = btnTemplateUpload;
        }

        if (this.EnableScan) {
            var tdScanUpload = trMainPanel.insertCell();
            tdScanUpload.id = 'scanFilesUploadContainer_' + this.FieldInternalName;
            tdScanUpload.style.width = '0%';
            tdScanUpload.style.paddingLeft = '7px';

            var btnScanUpload = window.document.createElement('input');
            btnScanUpload.type = 'button';
            tdScanUpload.appendChild(btnScanUpload);
            btnScanUpload.className = 'files-uploadButton';
            btnScanUpload.style.width = '145px';
            //btnScanUpload.style.height = '26px';
            btnScanUpload.value = 'Загрузить скан. копию';
            btnScanUpload.DisableUpload = function () { btnScanUpload.disabled = true; }
            btnScanUpload.EnableUpload = function () { btnScanUpload.disabled = false; }
            btnScanUpload.onmousedown = function (evt) { ScanNewFileStart(clientField.FieldTitle, evt); }
            btnScanUpload.DisableUpload();
            btnScanUpload.style.position = 'relative';
            this.ScanUploadControl = btnScanUpload;
        }
        if (this.EnableBarCodePrint) {
            var tdBarCodePrint = trMainPanel.insertCell();
            tdBarCodePrint.id = 'scanFilesUploadContainer_' + this.FieldInternalName;
            tdBarCodePrint.style.width = '0%';
            tdBarCodePrint.style.paddingLeft = '7px';

            var btnBarCodePrint = window.document.createElement('input');
            btnBarCodePrint.type = 'button';
            tdBarCodePrint.appendChild(btnBarCodePrint);
            btnBarCodePrint.className = 'files-uploadButton';
            btnBarCodePrint.style.width = '140px';
            //btnBarCodePrint.style.height = '26px';
            btnBarCodePrint.value = 'Распечатать штрих-код';
            btnBarCodePrint.DisableUpload = function () { btnBarCodePrint.disabled = true; }
            btnBarCodePrint.EnableUpload = function () { btnBarCodePrint.disabled = false; }
            btnBarCodePrint.onclick = function () { PrintBarCode(clientField.FieldTitle); }
            btnBarCodePrint.DisableUpload();
            btnBarCodePrint.style.position = 'relative';
            this.BarCodePrinterControl = btnBarCodePrint;
        }
    }



    var divFiles = window.document.createElement('div');
    this.PanelContainer.appendChild(divFiles);
    divFiles.style.paddingTop = '3px';
    var tbFiles = window.document.createElement('table');
    if (this.ControlWidth > 0)
        tbFiles.style.width = this.ControlWidth + 'px';
    divFiles.appendChild(tbFiles);
    tbFiles.border = 0;
    tbFiles.cellPadding = 0;
    tbFiles.cellSpacing = 1;
    tbFiles.className = 'files-table';
    this.TableFiles = tbFiles;
    tbFiles.style.display = 'none';

    /*
    var trHeader = tbFiles.insertRow();
    var tdFileLink = trHeader.insertCell();
    tdFileLink.innerText = 'Файл';
    tdFileLink.className = 'files-colheader';
    
    var tdFileDescription = trHeader.insertCell();
    tdFileDescription.innerText = 'Комментарий';
    tdFileDescription.className = 'files-colheader files-colcomment';
    */
}

function FCF_ResetRowAlternating() {
    if (this.NewDesign)
        return;

    this.IsAlternateCurrentRow = false;
    var i, len = this.FilesByIndex.length;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (!fileItem.Deleted && fileItem.CanView) {
            var className = this.CellClass;
            if (this.IsAlternateCurrentRow)
                className = this.CellClassAlternate;
            var j, jlen = fileItem.FileRow.cells.length;
            for (j = 0; j < jlen; j++) {
                var htmlCell = fileItem.FileRow.cells[j];
                htmlCell.className = className;
            }
            this.IsAlternateCurrentRow = !this.IsAlternateCurrentRow;
        }
    }
}

function FCF_IgnoreFormValue(ignore) {
    var ignoreValue = 'false';
    if (ignore != null)
        ignoreValue = ignore.toString().toLowerCase();
    this.DataElement.setAttribute('IgnoreFormValue', ignoreValue);
    this.PersistData();
}

function FilesClientItem(clientField) {
    this.ClientField = clientField;
    this.InitMethods = FCI_InitMethods;
    this.InitMethods();
}

function FCI_InitMethods() {
    this.GetAttribute = FCF_GetAttribute;
    this.GetBooleanAttribute = FCF_GetBooleanAttribute;
    this.SetProperties = FCI_SetProperties;
    this.SetFileData = FCI_SetFileData;

    this.SetDefaultAccess = FCI_SetDefaultAccess;
    this.OnFileDeleteCompleted = FCI_OnFileDeleteCompleted;
    this.InitSignatures = FCI_InitSignatures;

    if (!this.ClientField.NewDesign) {
        this.CreateContainer = FCI_CreateContainer;
        this.ShowUploading = FCI_ShowUploading;
        this.HideUploading = FCI_HideUploading;
        this.Delete = FCI_Delete;
        this.SetDisplayProperties = FCI_SetDisplayProperties;
        this.Disable = FCI_Disable;
        this.Enable = FCI_Enable;
    }
    else {
        //new design function
        this.CreateContainer = FCI_CreateContainer_Des1;
        this.ShowUploading = FCI_ShowUploading_Des1;
        this.HideUploading = FCI_HideUploading_Des1;
        this.Delete = FCI_Delete_Des1;
        this.SetDisplayProperties = FCI_SetDisplayProperties_Des1;
        this.ChangeCommentMode = FCI_ChangeCommentMode_Des1;
        this.Disable = FCI_Disable_Des1;
        this.Enable = FCI_Enable_Des1;
    }
}

//debugger
function FCI_InitSignatures() {

    this.CryptoFileVersion = {
        FileItemID: this.FileItemID,
        FileListID: this.FileListID,
        FieldID: this.ClientField.FieldID,
        File: this
    };
    if (this.ClientField.NewDesign && this.IsSignAllowed) {
        CryptoFileVersion.CreateSignControl(this.CryptoFileVersion);
        this.DivFileImages.appendChild(this.CryptoFileVersion.SignContainer);
        if (this.ImagesCount < 3)
            this.ImagesCount++;
        SM.AttachEvent(this.CryptoFileVersion, 'SignCompleted', CFV_SignFileCompleted);
    }
    if (this.HasSignatures) {

        CryptoFileVersion.CreateVerifyControl(this.CryptoFileVersion);

        if (this.ClientField.NewDesign) {
            this.DivFileImages.appendChild(this.CryptoFileVersion.VerifyContainer);
            if (this.ImagesCount < 3)
                this.ImagesCount++;
        }
        else {
            var tdSignatures = this.FileLinkRow.insertCell(-1);
            divSignKey.style.margin = 'auto 0px';
            tdSignatures.appendChild(this.CryptoFileVersion.VerifyContainer);
        }
        CryptoFileVersion.Verify(this.CryptoFileVersion);
    }
}

function CFV_SignFileCompleted(result) {
    FCI_SignCompleted.call(this.File, result);
}

function FCI_SignCompleted(result) {
    if (result != null && result.ResultCode == 0 && this.CryptoFileVersion.SignContainer != null) {
        this.CryptoFileVersion.SignContainer.style.display = 'none';

        if (this.CryptoFileVersion.VerifyContainer == null) {
            CryptoFileVersion.CreateVerifyControl(this.CryptoFileVersion);
            this.DivFileImages.appendChild(this.CryptoFileVersion.VerifyContainer);
            if (this.ImagesCount < 3)
                this.ImagesCount++;
        }
        CryptoFileVersion.Verify(this.CryptoFileVersion);
    }
}
//debugger

function FCI_Disable() {
    if (this.ImageDelete != null) {
        this.ImageDelete.originalClick = this.ImageDelete.onclick;
        this.ImageDelete.onclick = null;
        this.ImageDelete.src = '/_layouts/images/deletegray.gif';
        this.ImageDelete.style.cursor = 'default';
        this.ImageDelete.parentElement.style.display = 'none';
    }

    /*
    this.LinkIcon.originalClick = this.LinkIcon.onclick;
    this.LinkIcon.onclick = null;
    
    this.LinkFile.originalClick = this.LinkFile.onclick;
    this.LinkFile.onclick = null;
    */

    if (this.UploadControlContainer != null) {
        this.UploadControlContainer.style.display = 'none';
        if (this.UploadControl != null)
            this.UploadControl.DisableUpload();
    }

    this.TextComment.disabled = true;
    this.TextComment.style.display = 'none';
    $(this.CommentDiv).text(this.TextComment.value);
    this.CommentDiv.style.display = '';
    this.Disabled = true;
}

function FCI_Enable() {
    if (this.ImageDelete != null) {
        if (this.ImageDelete.originalClick != null)
            this.ImageDelete.onclick = this.ImageDelete.originalClick;
        this.ImageDelete.src = '/_layouts/images/delete.gif';
        this.ImageDelete.style.cursor = 'pointer';
        this.ImageDelete.parentElement.style.display = '';
    }

    /*
    if(this.LinkIcon.originalClick != null)
        this.LinkIcon.onclick = this.LinkIcon.originalClick;
        
    if(this.LinkFile.originalClick != null)
        this.LinkFile.onclick = this.LinkFile.originalClick;
    */

    if (this.UploadControlContainer != null) {
        this.UploadControlContainer.style.display = '';
        if (this.UploadControl != null)
            this.UploadControl.EnableUpload();
        this.TextComment.disabled = false;
        this.TextComment.style.display = '';
        this.CommentDiv.style.display = 'none';
    }
    this.Disabled = false;
}

function FCI_SetProperties() {
    var stFileItemID = this.GetAttribute('FileItemID');
    this.FileItemID = parseInt(stFileItemID);
    this.FileListID = this.GetAttribute('FileListID');
    this.FileListName = this.GetAttribute('FileListName');
    this.FileWebID = this.GetAttribute('FileWebID');
    this.FileWebUrl = this.GetAttribute('FileWebUrl');
    //this.Modified = this.GetAttribute('Modified');
    //this.ModifiedBy = this.GetAttribute('ModifiedBy');
    this.FileUrl = this.GetAttribute('FileUrl');
    this.IconUrl = this.GetAttribute('IconUrl');
    this.FileName = this.GetAttribute('FileName');
    this.Comment = this.GetAttribute('Comment');
    this.CanView = this.GetBooleanAttribute('CanView');
    this.CanViewReal = this.GetBooleanAttribute('CanViewReal');
    this.CanEdit = this.GetBooleanAttribute('CanEdit');
    this.PreviewPagesCount = this.GetAttribute('PreviewPagesCount');
    this.CanDelete = this.GetBooleanAttribute('CanDelete');
    this.IsImage = this.GetBooleanAttribute('IsImage');
    this.HasSignatures = this.GetBooleanAttribute('HasSignatures');
    this.IsSignAllowed = this.GetBooleanAttribute('IsSignAllowed');

    var ext = GetFileExtenstion(this.FileName);
    if (!IsNullOrEmpty(ext))
        this.IsPdf = ext.toLowerCase() == 'pdf';
    else
        this.IsPdf = false;
}

function FCI_CreateContainer(uploadEnabled) {
    var clientField = this.ClientField;
    var trFile = this.ClientField.TableFiles.insertRow();
    this.FileRow = trFile;

    var cellClass = this.ClientField.CellClass;
    if (this.ClientField.IsAlternateCurrentRow)
        var cellClass = this.ClientField.CellClassAlternate;

    var tdFileLink = trFile.insertCell();
    tdFileLink.className = cellClass;

    var tbFileLink = window.document.createElement('table');
    tdFileLink.appendChild(tbFileLink);
    tdFileLink.TableFileLink = tbFileLink;
    tbFileLink.border = 0;
    tbFileLink.cellSpacing = 0;
    tbFileLink.cellPadding = 0;
    tbFileLink.className = 'files_fileTable';
    var trFileLink = tbFileLink.insertRow();
    this.FileLinkRow = trFileLink;

    if (this.ClientField.EditMode && this.CanDelete) {
        var tdDelete = trFileLink.insertCell();
        tdDelete.innerHTML = "<img border='0' src='/_layouts/images/delete.gif' onclick='OnFileDeleteClick(this);' style='cursor:hand'/>";
        this.ImageDelete = tdDelete.firstChild;
        this.ImageDelete.FileItem = this;
        tdDelete.style.width = '0%';
        tdDelete.style.paddingRight = '5px';
        tdDelete.vAlign = 'middle';
    }

    var tdIcon = trFileLink.insertCell();
    tdIcon.style.width = '0%';
    tdIcon.style.paddingRight = '3px';
    tdIcon.vAlign = 'middle';
    tdIcon.innerHTML = "<a onclick='return OnFileLinkClick(this);'></a>";
    /*
    if(this.ClientField.EditMode)
        tdIcon.innerHTML = "<a onclick='return OnFileLinkClick(this);'></a>";
    else
        tdIcon.innerHTML = "<a></a>";
    */
    var linkIcon = tdIcon.firstChild;
    var fileUrl = '#';
    if (!IsNullOrEmpty(this.FileUrl)) {
        fileUrl = this.ClientField.HostUrl + this.FileUrl;
        if (this.ClientField.ReplaceHttpsByHttp) {
            var rgHttps = /(https:)/g;
            fileUrl = this.ClientField.HostUrl.toLowerCase().replace(rgHttps, 'http:') + this.FileUrl;
        }
    }
    linkIcon.href = !clientField.HasFileDeny ? fileUrl : 'javascript:';
    this.LinkIcon = linkIcon;
    linkIcon.FileItem = this;
    var imgIcon = window.document.createElement('img');
    linkIcon.appendChild(imgIcon);
    imgIcon.src = GetIconUrl(this.FileName);
    imgIcon.border = 0;
    this.ImageIcon = imgIcon;

    var tdFile = trFileLink.insertCell();
    tdFile.vAlign = 'middle';
    //tdFile.noWrap = true;
    tdFile.innerHTML = "<a onclick='return OnFileLinkClick(this);'></a>";
    /*
    if(this.ClientField.EditMode)
        tdFile.innerHTML = "<a onclick='return OnFileLinkClick(this);'></a>";
    else
        tdFile.innerHTML = "<a></a>";
    */
    tdFile.style.width = '100%';
    var linkFile = tdFile.firstChild;
    linkFile.className = 'files-link';
    linkFile.innerHTML = '<span>' + this.FileName + '</span>';
    linkFile.href = !clientField.HasFileDeny ? fileUrl : 'javascript:';
    this.LinkFile = linkFile;
    linkFile.FileItem = this;

    var canUpload = this.ClientField.EditMode && this.CanEdit && (this.CanDelete || this.ClientField.EnableOverwriteWithoutDeleteAccess);
    if (canUpload) {
        var tdImgUploading = trFileLink.insertCell();
        tdImgUploading.innerHTML = "<img border='0' src='/_layouts/WSS/WSSC.V4.SYS.Fields.Files/file_uploading.gif'/>";
        this.ImageUploading = tdImgUploading.firstChild;
        this.ImageUploading.style.display = 'none';
        tdImgUploading.align = 'right';
        tdImgUploading.style.paddingLeft = '24px';


        var tdFileUpload = trFileLink.insertCell();
        this.UploadControlContainer = tdFileUpload;
        tdFileUpload.style.width = '0%';
        tdFileUpload.vAlign = 'middle';

        var btnFileUpload = window.document.createElement('input');
        btnFileUpload.type = 'button';
        tdFileUpload.appendChild(btnFileUpload);
        btnFileUpload.className = 'files-uploadButton';
        btnFileUpload.style.width = '70px';
        //btnFileUpload.style.height = '26px';
        btnFileUpload.value = 'Загрузить';
        btnFileUpload.DisableUpload = function () { btnFileUpload.disabled = true; }
        btnFileUpload.EnableUpload = function () { btnFileUpload.disabled = false; }
        var fileIndex = this.FileIndex;
        btnFileUpload.onclick = function () { window.FilesForm.UploadControl.OpenSingleFileDialog(clientField.FieldTitle, fileIndex); }
        btnFileUpload.DisableUpload();
        this.UploadControl = btnFileUpload;
    }

    if (this.ClientField.FileVersionsEnabled) {
        var tdVersions = trFileLink.insertCell();
        tdVersions.style.width = '0%';
        tdVersions.style.paddingLeft = '5px';
        tdVersions.vAlign = 'middle';
        tdVersions.innerHTML = "<img src='/_layouts/images/versions.gif' title='Журнал версий' style='cursor:hand' onclick='OnFileVersionsClick(this)' />";
        this.ImageVersions = tdVersions.firstChild;
        this.ImageVersions.FileItem = this;
    }

    if (canUpload && clientField.EnableScan) {
        var tdAddPdfPage = trFileLink.insertCell();
        tdAddPdfPage.style.width = '0%';
        tdAddPdfPage.style.paddingLeft = '5px';
        tdAddPdfPage.vAlign = 'middle';
        if (this.IsPdf) {
            tdAddPdfPage.innerHTML = "<img src='/_layouts/WSS/WSSC.V4.SYS.Fields.Files/addPdfPage.png' title='Добавить отсканированную страницу в файл' style='cursor:hand' onclick='OnAddPdfPageClick(this)' />";
            this.ImageAddPdfPage = tdAddPdfPage.firstChild;
            this.ImageAddPdfPage.FileItem = this;
        }
        else {
            tdAddPdfPage.innerHTML = "<img src='/_layouts/images/blank.gif' style='width:16px' border='0' />";
        }
    }
    if (clientField.EnablePreview) {
        var tdPreview = trFileLink.insertCell();
        tdPreview.style.width = '0%';
        tdPreview.style.paddingLeft = '5px';
        tdPreview.vAlign = 'middle';
        this.PreviewEnable = false;
        if (clientField.IsLoading) {

            //preview
            if (!IsNullOrEmpty(this.FileName)) {
                var previewExts = '|doc|docx|docm|xls|xlsx|xlsm|pdf|jpg|jpeg|bmp|png|tif|tiff|gif|';
                var fileExtension = '';
                var splExts = this.FileName.toLowerCase().split('.');
                var ext = splExts[splExts.length - 1];
                var isPreviewDocument = previewExts.indexOf('|' + ext + '|') != -1;
                if (isPreviewDocument)
                    this.PreviewEnable = true;

                // Максимов К. - создание кнопки превью.
                if (this.PreviewEnable && this.FileItemID != null && this.ClientField.EnablePreview
                    && (this.PreviewPagesCount > 0)) {
                    var self = this;
                    var previewImg = window.document.createElement('img');
                    previewImg.style.cursor = 'pointer';
                    previewImg.className = 'files-fileImages';
                    previewImg.src = self.ClientField.SourceFolder + '/arrow_medium_right.png';
                    previewImg.FileItem = self;
                    previewImg.onclick = function () {
                        ShowFilePreview(self.FileWebID, self.FileListID, self.FileItemID, this);
                    }

                    tdPreview.appendChild(previewImg);
                }
            }
        }
        if (!this.PreviewEnable) {
            tdPreview.innerHTML = "<img src='/_layouts/images/blank.gif' style='width:19px' border='0' />";
        }
    }

    var tdComment = trFile.insertCell();
    tdComment.className = cellClass + ' files-colcomment';
    tdComment.title = 'Комментарий';
    if (this.ClientField.EditMode) {
        var txtComment = window.document.createElement('textarea');
        tdComment.appendChild(txtComment);
        txtComment.className = 'files-comment';
        txtComment.onfocusout = SaveFileComment;
        txtComment.onchange = SaveFileComment;
        txtComment.FileItem = this;
        txtComment.disabled = !this.CanEdit;
        this.TextComment = txtComment;
        if (!IsNullOrEmpty(this.Comment))
            txtComment.value = this.Comment;
        this.CommentDiv = window.document.createElement('div');
        tdComment.appendChild(this.CommentDiv);
        this.CommentDiv.style.display = 'none';
        this.CommentDiv.className = 'files_commentDiv';

        if (!this.CanEdit) {
            txtComment.disabled = true;
            $(this.CommentDiv).text(txtComment.value);
            this.CommentDiv.style.display = '';
            this.TextComment.style.display = 'none';
        }

    }
    else {
        this.CommentDiv = window.document.createElement('div');
        tdComment.appendChild(this.CommentDiv);
        this.CommentDiv.style.display = '';
        this.CommentDiv.className = 'files_commentDiv';

        if (!IsNullOrEmpty(this.Comment))
            $(this.CommentDiv).text(this.Comment);
    }

    this.ClientField.IsAlternateCurrentRow = !this.ClientField.IsAlternateCurrentRow;
}
//debugger
function OnFileVersionsClick(imageVersions, designVersion) {
    var fileItem = imageVersions.FileItem;
    if (!fileItem.IsUploading) {
        var clientField = fileItem.ClientField;
        var url = '';
        if (!clientField.NewDesign)
            url = clientField.StorageWebUrl + '/_layouts/Versions.aspx?list={' + clientField.StorageListID + '}&ID=' + fileItem.FileItemID + '&FileName=' + encodeURI(fileItem.FileUrl) + '&Source=/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/ClosePage.aspx';
        else
            url = clientField.ModulePath + '/VersionsJournal/DBFieldFilesVersionsJournal.aspx?WebID=' + ListForm.WebID + '&ItemID=' + ListForm.ItemID + '&FieldID=' + clientField.FieldID + '&ListID=' + ListForm.ListID + '&FileItemID=' + fileItem.FileItemID + '&rnd=' + Math.random().toString();

        if (designVersion != null && designVersion == 'v2') {
            var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
            var openedWin = window.open(url, '_blank', winFeatures);
        }
        else
            window.open(url, '_blank');
    }
    return false;
}


function SaveFileComment(ev) {
    var txtComment = null;
    if (window.SM.IsIE)
        txtComment = event.srcElement;
    else
        txtComment = ev.target;

    var fileItem = txtComment.FileItem;
    if (fileItem.XmlElement != null) {
        var comment = $(txtComment).val();
        fileItem.XmlElement.setAttribute('Comment', comment);
        fileItem.ClientField.PersistData();
    }
}

function OnFileDeleteClick(imgDelete) {
    //debugger
    var fileItem = imgDelete.FileItem;
    if (!fileItem.Deleted && !fileItem.IsUploading) {
        if (window.confirm(window.TN.TranslateKey('files.alerts.DeleteFileConfirmation'))) {
            if (!fileItem.ClientField.SaveFileOnUpload)
                fileItem.Delete();
            else {
                fileItem.ShowUploading();

                //var xmlRequest = new ActiveXObject('Microsoft.XMLHTTP');
                var xmlRequest = window.SM.GetXmlRequest();
                var url = fileItem.ClientField.FieldWebUrl + fileItem.ClientField.ModulePath + '/DBFieldFilesDirectAdapter.aspx?rnd=' + Math.random();
                var params = '';
                params += '&itemID=' + fileItem.ClientField.ItemID;
                params += '&listID=' + fileItem.ClientField.FieldListID;
                params += '&fieldID=' + fileItem.ClientField.FieldID;
                params += '&fileItemID=' + fileItem.FileItemID;
                params += '&action=DeleteFile';

                url += params;

                xmlRequest.open('GET', url, true);
                xmlRequest.onreadystatechange = function () {
                    if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                        var responseXml = xmlRequest.responseText;
                        fileItem.OnFileDeleteCompleted(responseXml);
                    }
                };
                xmlRequest.send(null);
            }
        }
    }
}

function FCI_OnFileDeleteCompleted(responseText) {
    if (responseText == 'success') {
        this.HideUploading();
        this.Delete();
        window.SM.ResetFormLayout();
    }
    else {
        alert(responseText);
        this.HideUploading();
    }
}

//debugger
function OnFileLinkClick(link) {
    //debugger
    var fileItem = link.FileItem;
    var clientField = fileItem.ClientField;

    if (device.android()) {
        this.AnonymousFileDownload(link)
        return false;
    }

    if (!fileItem.IsUploading) {
        if (clientField.HasFileDeny) {

            var fileUrl = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/GetDocumentContent.aspx?fileSource=' + encodeURIComponent(clientField.HostUrl + fileItem.FileUrl) + '&rnd=' + Math.random().toString();
            var params = '';
            params += '&denyEdit=' + (clientField.DenyFileEdit == true).toString();
            params += '&denyCopy=' + (clientField.DenyFileCopy == true).toString();
            params += '&denyPrint=' + (clientField.DenyFilePrint == true).toString();
            fileUrl += params;
            window.location.href = fileUrl;
            return false;
        }

        var canEdit = clientField.EditMode && fileItem.CanEdit && !fileItem.Disabled;
        var canViewReal = fileItem.CanViewReal;
        var multiBrowserFileUrl = link.FileItem.ClientField.HostUrl + link.FileItem.FileUrl;
        link.setAttribute('FileName', fileItem.FileName);
        link.setAttribute('FileUrl', multiBrowserFileUrl);
        link.setAttribute('EnableFooterText', clientField.EnableFooterText);
        return OnFileClick(link, canEdit, canViewReal);
    }
    else
        return false;
}






function FCI_ShowUploading() {
    this.ImageUploading.parentElement.style.paddingLeft = '4px';
    this.ImageUploading.parentElement.style.paddingRight = '4px';
    this.ImageUploading.style.display = '';
    if (this.ImageDelete != null) {
        this.ImageDelete.src = '/_layouts/images/deletegray.gif';
        this.ImageDelete.style.cursor = 'default';
    }
    this.TextComment.disabled = true;
    this.LinkFile.className = 'files-link-uploading';
    this.LinkIcon.className = 'files-link-uploading';
    if (this.ImageVersions != null)
        this.ImageVersions.style.cursor = 'default';
    if (this.UploadControl != null)
        this.UploadControl.DisableUpload();
    this.IsUploading = true;
}

function FCI_HideUploading() {
    this.ImageUploading.style.display = 'none';
    //this.ImageUploading.nextSibling.style.display = '';
    this.ImageUploading.parentElement.style.paddingLeft = '24px';
    this.ImageUploading.parentElement.style.paddingRight = '0px';
    if (this.ImageDelete != null) {
        this.ImageDelete.src = '/_layouts/images/delete.gif';
        this.ImageDelete.style.cursor = 'pointer';
    }
    this.TextComment.disabled = false;
    this.LinkFile.className = 'files-link';
    this.LinkIcon.className = 'files-link';
    if (this.ImageVersions != null)
        this.ImageVersions.style.cursor = 'pointer';

    this.UploadControl.EnableUpload();
    this.SetDisplayProperties(this.FileName, this.FileUrl, this.IconUrl);
    this.IsUploading = false;
}

function FCI_SetDisplayProperties(fileName, fileUrl, iconUrl) {
    this.LinkFile.innerHTML = '<span>' + fileName + '</span>';
    this.ImageIcon.src = iconUrl;

    var fullUrl = '#';
    if (!IsNullOrEmpty(fileUrl)) {
        var fullUrl = this.ClientField.HostUrl + fileUrl;
        if (this.ClientField.ReplaceHttpsByHttp) {
            var rgHttps = /(https:)/g;
            fileUrl = this.ClientField.HostUrl.toLowerCase().replace(rgHttps, 'http:') + this.FileUrl;
        }
    }
    this.LinkFile.href = !this.ClientField.HasFileDeny ? fullUrl : 'javascript:';
    this.LinkIcon.href = !this.ClientField.HasFileDeny ? fullUrl : 'javascript:';
}

function FCI_SetFileData(fileName, fileUrl, fileItemID) {
    if (this.XmlElement == null) {
        this.XmlElement = this.ClientField.DataDocument.createElement('FilesValue');
        this.ClientField.DataFilesElement.appendChild(this.XmlElement);
    }
    this.XmlElement.setAttribute('FileName', fileName);
    this.XmlElement.setAttribute('FileUrl', fileUrl);
    this.XmlElement.setAttribute('IconUrl', GetIconUrl(fileName, null, true));
    this.XmlElement.setAttribute('FileItemID', fileItemID);
    this.XmlElement.setAttribute('FileListID', this.ClientField.StorageListID);
    this.XmlElement.setAttribute('FileListName', this.ClientField.StorageListName);
    this.XmlElement.setAttribute('FileWebID', this.ClientField.StorageWebID);
    this.XmlElement.setAttribute('FileWebUrl', this.ClientField.StorageWebUrl);

    var canView = true;
    if (this.CanView != null)
        canView = this.CanView;
    this.XmlElement.setAttribute('CanView', canView.toString().toLowerCase());

    var canEdit = true;
    if (this.CanEdit != null)
        canEdit = this.CanEdit;
    this.XmlElement.setAttribute('CanEdit', canEdit.toString().toLowerCase());

    var canDelete = true;
    if (this.CanDelete != null)
        canDelete = this.CanDelete;
    this.XmlElement.setAttribute('CanDelete', canDelete.toString().toLowerCase());

    this.SetProperties();
    this.ClientField.PersistData();
}

function FCI_Delete() {
    this.Deleted = true;
    if (this.XmlElement != null) {
        this.ClientField.DataFilesElement.removeChild(this.XmlElement);
        this.ClientField.PersistData();
        this.XmlElement = null;
    }
    this.FileRow.style.display = 'none';
    this.ClientField.FilesByName[this.FileName.toLowerCase()] = null;
    this.ClientField.ResetRowAlternating();
    if (this.ClientField.ListFormField != null)
        this.ClientField.ListFormField.OnChange(this);
    this.ClientField.FilesCount--;
    this.ClientField.CheckFilesVisibility();
}

function FCI_SetDefaultAccess() {
    this.CanView = true;
    this.CanEdit = true;
    this.CanDelete = true;
}

//debugger
function DisableMultiUploadControl(fieldTitle) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        if (clientField.NewDesign)
            DisableMultiUploadControl_Des1(clientField);
        else
            clientField.MultiUploadControl.DisableUpload();
    }
}

//debugger
function EnableMultiUploadControl(fieldTitle) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        if (clientField.NewDesign)
            EnableMultiUploadControl_Des1(clientField);
        else
            clientField.MultiUploadControl.EnableUpload();
    }
}


function MultiFileUploadStart(fileName, fieldTitle, iconUrl, useHttpUpload) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        var doUpload = true;
        fileName = DecodeFileName(fileName);
        var isValidFileName = IsValidFileName(fileName);
        if (isValidFileName) {
            var fileItem = clientField.GetFile(fileName);
            if (fileItem != null) {
                if (fileItem.CanView && fileItem.CanEdit && (fileItem.CanDelete || clientField.EnableOverwriteWithoutDeleteAccess)) {
                    if (window.UseSafeAlerts) {
                        this.SafeAlert(SM.SR(window.TN.TranslateKey("files.alerts.FileOverwriteDeniedSameNameExists"), '{FileName}', fileName))
                        doUpload = false;
                    }
                    else {
                        if (!window.confirm(SM.SR(window.TN.TranslateKey("files.alerts.FileOverwriteConfirmation"), '{FileName}', fileName)))
                            doUpload = false;
                    }
                }
                else {
                    this.SafeAlert(SM.SR(window.TN.TranslateKey("files.alerts.FileOverwriteDeniedWOPermissions"), '{FileName}', fileName));
                    doUpload = false;
                }
            }
            else {
                fileItem = clientField.AddFile(fileName);
                fileItem.FileName = fileName;
                //преносим получение иконки файла на клиент.
                iconUrl = GetIconUrl(fileName);
                fileItem.IconUrl = iconUrl;
                fileItem.SetDefaultAccess();
                fileItem.CreateContainer(false);
            }


            if (fileItem != null && doUpload)
                fileItem.ShowUploading();
        }
        else {
            doUpload = false;
        }

        fileName = EncodeFileName(fileName);

        if (doUpload && window.FilesForm != null)
            window.FilesForm.DisableOK();

        if (!(clientField.FilesForm.UseHttpUpload || useHttpUpload))
            clientField.FilesForm.UploadControl.UploadMultiFile(clientField.FieldTitle, fileName, doUpload);
        else
            return doUpload;
    }
}

function MultiFileUploadCompleted(fieldTitle, fileAdded, fileName, fileUrl, fileItemID, iconUrl) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        fileName = DecodeFileName(fileName);
        fileUrl = DecodeFileName(fileUrl);
        var fileItem = clientField.GetFile(fileName);
        if (fileItem != null) {
            if (fileAdded) {
                //преносим получение иконки файла на клиент.
                iconUrl = GetIconUrl(fileName);
                fileItem.SetFileData(fileName, fileUrl, fileItemID, iconUrl);
                fileItem.HideUploading();

                if (clientField.ListFormField != null)
                    clientField.ListFormField.OnChange(fileItem);
            }
            else {
                //произошла ошибка
                fileItem.Delete();
            }
        }
        fileName = EncodeFileName(fileName);
        if (!clientField.FilesForm.UseHttpUpload)
            clientField.FilesForm.UploadControl.MultiFileUploadCompleted(clientField.FieldTitle, fileName);
        if (window.FilesForm != null)
            window.FilesForm.EnableOK();
    }
}


function SingleFileUploadStart(fileIndex, newFileName, fieldTitle, iconUrl) {
    //debugger
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        var fileItem = clientField.GetFileByIndex(fileIndex);
        if (fileItem != null) {
            newFileName = DecodeFileName(newFileName);
            var isValidFileName = IsValidFileName(newFileName);
            if (isValidFileName) {
                if (!clientField.EnableOverwriteWithAnotherName && newFileName.toLowerCase() != fileItem.FileName.toLowerCase()) {
                    fileItem.UploadControl.EnableUpload();
                    window.alert(window.TN.TranslateKey("files.alerts.FileOverwriteDeniedAnotherName"));
                    return;
                }
                if (newFileName.toLowerCase() == fileItem.FileName.toLowerCase())
                    newFileName = fileItem.FileName;
                var fileWithNewName = clientField.GetFile(newFileName);
                if (fileWithNewName != null) {
                    if (fileWithNewName.FileIndex != fileItem.FileIndex) {
                        fileItem.UploadControl.EnableUpload();
                        window.alert(SM.SR(window.TN.TranslateKey("files.alerts.FileOverwriteDeniedSameNameExists"), '{FileName}', newFileName));
                        return;
                    }
                }
                //преносим получение иконки файла на клиент.
                iconUrl = GetIconUrl(newFileName);
                fileItem.SetDisplayProperties(newFileName, null, iconUrl);
                fileItem.ShowUploading();

                if (window.FilesForm != null)
                    window.FilesForm.DisableOK();

                if (!clientField.FilesForm.UseHttpUpload)
                    clientField.FilesForm.UploadControl.UploadSingleFile(clientField.FieldTitle, fileItem.FileItemID);
                else
                    return fileItem.FileItemID;
            }
        }
    }
}

function SingleFileUploadCompleted(fieldTitle, fileAdded, fileName, fileUrl, fileItemID, iconUrl, fileIndex) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        var fileItem = clientField.GetFileByIndex(fileIndex);
        if (fileItem != null) {
            if (fileAdded) {
                fileName = DecodeFileName(fileName);
                fileUrl = DecodeFileName(fileUrl);
                if (fileName.toLowerCase() == fileItem.FileName.toLowerCase())
                    fileName = fileItem.FileName;
                clientField.FilesByName[fileItem.FileName.toLowerCase()] = null;
                //преносим получение иконки файла на клиент.
                iconUrl = GetIconUrl(fileName);
                fileItem.SetFileData(fileName, fileUrl, fileItemID, iconUrl);
                clientField.FilesByName[fileItem.FileName.toLowerCase()] = fileItem;
                //уставливает ссылку на файл из текущих свойств
                fileItem.HideUploading();

                if (clientField.ListFormField != null)
                    clientField.ListFormField.OnChange(fileItem);
            }
            else {
                //произошла ошибка, откатываем на предыдущий файл
                //уставливает ссылку на файл из текущих свойств
                fileItem.HideUploading();
            }
            fileName = EncodeFileName(fileName);
            //fileItem.UploadControl.EnableUpload();

            if (window.FilesForm != null)
                window.FilesForm.EnableOK();
        }
    }
}


//debugger
function OpenTemplateWindow(fieldTitle, isTemplateUploadLink, evt) {
    //функцию OpenTemplateWindow пока оставляем в основном js, т.к. она должна передавать
    //переменную evt в след. функцию FCF_OpenXmlTemplateDialog
    //и эта функция является обработчиком для кнопок.
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        if (!clientField.IsXmlTemplate) {

            RL.CallAsync('FilesTemplateWindow', function () {
                FTW_OpenTemplateWindow(fieldTitle);
            });
        }
        else {
            FCF_OpenXmlTemplateDialog.call(clientField, isTemplateUploadLink, evt);
        }
    }
}

//функция OnTemplateSelect сделана синхронной, т.к. через нее загружаются файлы по простановке из подстановки
//и эта загрузка может быть инициирована во время загрузки страницы.
function OnTemplateSelect(fieldTitle, fileName, templateItemID, iconUrl) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        if (!clientField.NewDesign)
            window.CloseFloatWindow();
        else if (window.FilesTemplateWindow != null)
            window.FilesTemplateWindow.Close();
        if (!SM.IsNE(fileName) && !SM.IsNE(templateItemID)) {
            var fileItem = clientField.AddFile(fileName);
            fileItem.FileName = fileName;
            fileItem.TemplateID = templateItemID;
            //преносим получение иконки файла на клиент.
            iconUrl = GetIconUrl(fileName);
            fileItem.IconUrl = iconUrl;
            fileItem.SetDefaultAccess();
            fileItem.CreateContainer(false);
            fileItem.ShowUploading();

            if (window.FilesForm != null)
                window.FilesForm.DisableOK();

            var url = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/UploadHandler.ashx?rnd=' + Math.random();
            var params = '';
            params += 'fieldWebID=' + clientField.FieldWebID;
            params += '&fieldListID=' + clientField.FieldListID;
            params += '&fieldID=' + clientField.FieldID;
            params += '&itemFolderName=' + clientField.ItemFolderName;
            params += '&fileIndex=-1';
            params += '&fileItemID=-1';
            params += '&isMultiple=false';
            params += '&isTemplate=true';
            params += '&validFiles=' + encodeURI(clientField.EncodeFileName(fileName));
            params += '&fileName=' + encodeURI(clientField.EncodeFileName(fileName));
            params += '&templateItemID=' + templateItemID;

            var xmlRequest = SM.GetXmlRequest();
            xmlRequest.open('POST', url, true);
            xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            var thisObj = this;
            xmlRequest.onreadystatechange = function () {
                if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                    var responseText = xmlRequest.responseText;
                    xmlRequest.onreadystatechange = new Function();
                    clientField.OnUpload(null, responseText);
                }
            }
            xmlRequest.send(params);
        }
    }
}

function TemplateUploadCompleted(fieldTitle, fileAdded, fileName, fileUrl, fileItemID, iconUrl) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        fileName = DecodeFileName(fileName);
        fileUrl = DecodeFileName(fileUrl);
        var fileItem = clientField.GetFile(fileName);
        if (fileItem != null) {
            if (fileAdded) {
                //преносим получение иконки файла на клиент.
                iconUrl = GetIconUrl(fileName);
                fileItem.SetFileData(fileName, fileUrl, fileItemID, iconUrl);
                fileItem.HideUploading();
                if (clientField.ListFormField != null)
                    clientField.ListFormField.OnChange(fileItem);
            }
            else {
                //произошла ошибка
                fileItem.Delete();
            }

            if (window.FilesForm != null)
                window.FilesForm.EnableOK();
        }
    }
}

function FCF_OpenXmlTemplateDialog(isTemplateUploadLink, evt) {
    if (this.Disabled || !this.NewDesign)
        return;



    var trigger = isTemplateUploadLink ? this.TemplateUploadLink : this.TemplateUploadImgLink;
    var anotherTrigger = !isTemplateUploadLink ? this.TemplateUploadLink : this.TemplateUploadImgLink;

    //SM.WriteLog(this.DragControl);
    if (evt == null)
        evt = window.event;

    var srcElement = evt.srcElement;
    if (!srcElement)
        srcElement = evt.target;

    if (srcElement == null)
        return;

    var srcTagName = srcElement.tagName.toLowerCase();

    if (trigger.FileNameDialog == null &&
        (anotherTrigger.FileNameDialog == null || !anotherTrigger.FileNameDialog.Visible)
        && (srcTagName == 'img' || srcTagName == 'a')
        ) {
        //SM.WriteLog('show trig');
        var thisObj = this;
        RL.CallAsync(['FileNameDialog', 'FilesTemplateWindow'], function () {
            var fileDialog = window.FileNameDialog.CreateDialog({
                Trigger: trigger,
                TriggerTooltip: TN.TranslateKey('files.titles.loadfromtemplate'),
                OnFileNameEnter: function (fileName) {
                    OnTemplateSelect(thisObj.FieldTitle, fileName, -1, null)
                },
                FilesField: thisObj,
                DefaultFileName: 'InfoPathForm.xml',
                RelativePosition: {
                    Top: '100%',
                    Left: '0px'
                },
                ParentContainer: thisObj.TemplateUploadImgLink
            });
            //window.FileNameDialog.Show(fileDialog);
        });

        if (evt != null)
            SM.CancelEvent(evt);
    }
}





//debugger
function ScanNewFileStart(fieldTitle, evt) {
    if (SM.IsSafari) {
        alert(TN.Translate('Загрузка отсканированных файлов не поддерживается в браузере Safari.'));
        return;
    }
    if (!window.FilesForm.ScanAllowed) {
        var scannerAddinNotFoundTitle = window.TN.TranslateKey('files.titles.scanneraddinnotfound');
        alert(scannerAddinNotFoundTitle);
        return;
    }
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null)
        clientField.InitScanControl();

    //проверяем св-во инициализированного диалога именно по триггеру, 
    //потому что в него прописывается свойство FileNameDialog.

    //для NewDesign делаем тригером картинку, чтобы диалог открывался по полным границам картинкам, 
    //а не по невидимой ссылке, чьи границы отличаются от границ картинки.
    var fileNameTrigger = clientField.NewDesign ? clientField.ScanUploadControl.Image : clientField.ScanUploadControl;
    if (fileNameTrigger.FileNameDialog == null) {

        RL.CallAsync('FileNameDialog', function () {
            var fileDialog = window.FileNameDialog.CreateDialog({
                Trigger: fileNameTrigger,
                ParentContainer: clientField.ScanUploadControl,
                TriggerTooltip: TN.TranslateKey('files.titles.loadscan'),
                OnFileNameEnter: function (fileName) {
                    ScanNewFile(this.FilesField.FieldTitle, fileName)
                },
                FilesField: clientField,
                DefaultFileName: TN.TranslateKey('files.tw.ScanCopyName'),
                RelativePosition: {
                    Top: '100%',
                    Right: '0px'
                }
            });
        });

        if (evt == null)
            evt = window.event;

        if (evt != null)
            SM.CancelEvent(evt);
    }

}

function ScanNewFile(fieldTitle, fileName) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        if (!IsNullOrEmpty(fileName)) {
            var fileItem = clientField.AddFile(fileName);
            fileItem.FileName = fileName;
            var iconUrl = GetIconUrl(fileName);
            fileItem.IconUrl = iconUrl;
            fileItem.SetDefaultAccess();
            fileItem.CreateContainer(false);
            fileItem.ShowUploading();
            fileName = EncodeFileName(fileName);

            if (window.FilesForm != null)
                window.FilesForm.DisableOK();

            clientField.FilesForm.ScanControl.ScanNewFile(fieldTitle, fileName);
        }
    }
}

function ScanNewFileCompleted(fieldTitle, fileAdded, fileName, fileUrl, fileItemID, iconUrl) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        fileName = DecodeFileName(fileName);
        fileUrl = DecodeFileName(fileUrl);
        var fileItem = clientField.GetFile(fileName);
        if (fileItem != null) {
            if (fileAdded) {
                //преносим получение иконки файла на клиент.
                iconUrl = GetIconUrl(fileName);
                fileItem.SetFileData(fileName, fileUrl, fileItemID, iconUrl);
                fileItem.HideUploading();
                if (clientField.ListFormField != null)
                    clientField.ListFormField.OnChange(fileItem);
            }
            else {
                //произошла ошибка
                fileItem.Delete();
            }

            if (window.FilesForm != null)
                window.FilesForm.EnableOK();
        }
    }
}


function OnAddPdfPageClick(imgAddPdfPage) {
    if (!window.FilesForm.ScanAllowed) {
        alert(window.TN.TranslateKey('files.alerts.ScanControlNotInstalled'));
        return;
    }

    var fileItem = imgAddPdfPage.FileItem;
    if (!fileItem.IsUploading) {
        var clientField = fileItem.ClientField;

        if (clientField != null)
            clientField.InitScanControl();

        fileItem.ShowUploading();
        if (window.FilesForm != null)
            window.FilesForm.DisableOK();

        clientField.FilesForm.ScanControl.AddPdfPage(clientField.FieldTitle, fileItem.FileName, fileItem.FileItemID);
    }
}

function AddPdfPageCompleted(fieldTitle, fileAdded, fileName) {
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        fileName = DecodeFileName(fileName);
        var fileItem = clientField.GetFile(fileName);
        if (fileItem != null) {
            if (fileAdded) {
                fileItem.HideUploading();
                if (clientField.ListFormField != null)
                    clientField.ListFormField.OnChange(fileItem);
            }
            else {
                //произошла ошибка
                fileItem.HideUploading();
            }

            if (window.FilesForm != null)
                window.FilesForm.EnableOK();
        }
    }
}

//debugger
function PrintBarCode(fieldTitle) {
    if (SM.IsSafari) {
        alert(TN.Translate('Печать штрих-кодов не поддерживается в браузере Safari.'));
        return;
    }
    if (!window.FilesForm.BarCodePrintAllowed) {
        alert(window.TN.TranslateKey('files.alerts.BarCodePrinterControlNotInstalled'));
        return;
    }
    var clientField = GetFilesClientField(fieldTitle);
    if (clientField != null) {
        var fieldID = parseInt(clientField.FieldID);
        clientField.FilesForm.BarCodePrinter.PrintBarCode(fieldID);
    }
}

function PrintBarCodeCompleted(fieldID, completedSuccessfully) {

}


/*----------------------------FilesTemplateWindow-----------------------------*/








function EncodeFileName(fileName) {
    if (!SM.IsNE(fileName)) {
        var rgQuotes = /(['])/g;
        fileName = fileName.replace(rgQuotes, '_sQuote_');
    }
    return fileName;
}

function DecodeFileName(fileName) {
    if (!SM.IsNE(fileName)) {
        var rgQuotes = /(_sQuote_)/g;
        fileName = fileName.replace(rgQuotes, "'");
    }
    return fileName;
}

function IsValidFileName(fileName) {
    var isValid = false;
    if (!IsNullOrEmpty(fileName)) {
        var rgValid = /[~"#%&*:<>?/\\{|}+]/g;
        var result = fileName.match(rgValid);
        if (result == null) {
            var rgPoints = new RegExp('([.])([.])');
            result = fileName.match(rgPoints);
            if (result == null) {
                var firstChar = fileName.charAt(0);
                var lastChar = fileName.charAt(fileName.length - 1);
                if (firstChar != '.' && lastChar != '.')
                    isValid = true;
            }
        }
        if (!isValid) {
            var msg = SM.SR(window.TN.TranslateKey('files.alerts.NotValidFileName'), '{FileName}', fileName);
            window.alert(msg);
        }
    }
    return isValid;
}
function SafeAlert(msg) { // Для исправления ошибки с зависанием в IOS

    if (window.UseSafeAlerts)
    {
        setTimeout('alert("'+  msg + '")', 1)
    }
    else
    {
        window.alert(msg);
    }
}





function GetFileExtenstion(fileName) {
    var extIndex = fileName.lastIndexOf('.');
    var ext = '';
    if (extIndex != -1 && extIndex != fileName.length - 1)
        ext = fileName.substring(extIndex + 1, fileName.length);
    return ext;
}

function GetIconUrl(fileName, backgroundColor, returnEmptyIfNull) {
    if (SM.IsNE(fileName))
        throw new Error('Не передан параметр fileName.')
    if (SM.IsNE(backgroundColor))
        backgroundColor = 'white';
    backgroundColor = backgroundColor.toLowerCase();

    switch (backgroundColor) {
        case 'white':
        case 'blue':
            break;
        default:
            throw new Error('Недопустимое значение параметра backgroundColor. Допустимые значения: white, blue.');
            break;
    }

    var docIconsFolderUrl = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/DocIcons/' + backgroundColor;

    var icUrl = null;

    var ext = GetFileExtenstion(fileName);
    var isDocIcon = false;
    if (!SM.IsNE(ext)) {
        ext = ext.toLowerCase();
        switch (ext) {
            case "doc":
            case "docm":
            case "docx":
                icUrl = "icdoc.png";
                isDocIcon = true;
                break;

            case "gif":
            case "jpg":
            case "jpeg":
            case "bmp":
            case "tif":
            case "tiff":
            case "png":
            case "psd":
                icUrl = "icimg.png";
                isDocIcon = true;
                break;

            case "ppt":
            case "pptm":
            case "pptx":
                icUrl = "icppt.png";
                isDocIcon = true;
                break;

            case "txt":
            case "log":
                icUrl = "ictxt.png";
                isDocIcon = true;
                break;

            case "xls":
            case "xlsm":
            case "xlsx":
            case "xlsm":
                icUrl = "icxls.png";
                isDocIcon = true;
                break;

            case "pdf":
                icUrl = "icpdf.png";
                isDocIcon = true;
                break;

            case "mpp":
            case "mppx":
                icUrl = "icmpp.png";
                isDocIcon = true;
                break;

            case "vsd":
            case "vsdx":
            case "vdx":
                icUrl = "icvsd.png";
                isDocIcon = true;
                break;


            case "ascx":
                icUrl = "icascx.gif";
                break;
            case "asp":
                icUrl = "ichtm.gif";
                break;
            case "aspx":
                icUrl = "ichtm.gif";
                break;
            case "dot":
                icUrl = "icdot.gif";
                break;
            case "eml":
                icUrl = "iceml.gif";
                break;
            case "htm":
                icUrl = "ichtm.gif";
                break;
            case "html":
                icUrl = "ichtm.gif";
                break;
            case "mht":
                icUrl = "icmht.gif";
                break;
            case "mhtml":
                icUrl = "icmht.gif";
                break;
            case "msg":
                icUrl = "icmsg.gif";
                break;
            case "odc":
                icUrl = "icodc.gif";
                break;
            case "pub":
                icUrl = "icpub.gif";
                break;
            case "vss":
                icUrl = "icvss.gif";
                break;
            case "vst":
                icUrl = "icvst.gif";
                break;
            case "vsx":
                icUrl = "icvsx.gif";
                break;
            case "vtx":
                icUrl = "icvtx.gif";
                break;
            case "xml":
                icUrl = "icxml.gif";
                break;
            case "zip":
                icUrl = "iczip.gif";
                break;
            case "mp3":
                icUrl = "icwma.gif";
                break;
            case "wav":
                icUrl = "icwma.gif";
                break;
            case "wma":
                icUrl = "icwma.gif";
                break;
            case "wmv":
                icUrl = "icwma.gif";
                break;
            case "avi":
                icUrl = "icwma.gif";
                break;
            case "mpg":
                icUrl = "icwma.gif";
                break;
            case "mpeg":
                icUrl = "icwma.gif";
                break;
            case "mpeg4":
                icUrl = "icwma.gif";
                break;
        }
    }
    if (SM.IsNE(icUrl)) {
        icUrl = "icgen.png";
        isDocIcon = true;
    }
    if (isDocIcon)
        icUrl = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/DocIcons/' + backgroundColor + '/' + icUrl;
    else
        icUrl = '/_layouts/images/' + icUrl;
    if (returnEmptyIfNull == true && icUrl == null)
        icUrl = '';
    return icUrl;
}



function FCF_GetAttribute(attributeName) {
    return GetAttributeValue(this.XmlElement, attributeName);
}

function FCF_GetBooleanAttribute(attributeName) {
    return GetBooleanAttributeValue(this.XmlElement, attributeName);
}

function FCF_GetIntegerAttribute(attributeName) {
    return GetIntegerAttributeValue(this.XmlElement, attributeName);
}

//проверка строки на пусто/нул
function IsNullOrEmpty(str) {
    if (str == null) return true; if (str.toString() == '') return true; return false;
}

//получение текстового атрибута ХМЛ-элемента
function GetAttributeValue(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function GetBooleanAttributeValue(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = GetAttributeValue(xmlElement, attributeName);
    if (!IsNullOrEmpty(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

//получение булевого атрибута ХМЛ-элемента
function GetIntegerAttributeValue(xmlElement, attributeName) {
    var typedValue = 0;
    var attrValue = GetAttributeValue(xmlElement, attributeName);
    if (!IsNullOrEmpty(attrValue))
        typedValue = parseInt(attrValue);
    return typedValue;
}