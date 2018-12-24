function DragUploadControl(options) {
    var defaultOptions = {
        Trigger: null
    };

    SM.ApplyOptions(this, defaultOptions, options);

    this.Init = DUC_Init;
    this.Drop = DUC_Drop;
    this.DragEnter = DUC_DragEnter;
    this.DragOver = DUC_DragOver;
    this.DragExit = DUC_DragExit;
    this.GetDroppedFile = DUC_GetDroppedFile;
}

function DUC_Init() {
    if (this.Trigger == null)
        throw new Error('Не задана область загрузки файлов');

    var thisObj = this;

    this.Trigger.addEventListener("dragenter", function (evt) { thisObj.DragEnter(evt); }, false);
    this.Trigger.addEventListener("dragleave", function (evt) { thisObj.DragExit(evt); }, false);
    this.Trigger.addEventListener("dragover", function (evt) { thisObj.DragOver(evt); }, false);
    this.Trigger.addEventListener("drop", function (evt) { thisObj.Drop(evt); }, false);
}

function DUC_DragEnter(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    SM.FireEvent(this, 'DragEnter', evt, true);
}

function DUC_DragExit(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    SM.FireEvent(this, 'DragExit', evt, true);
}

function DUC_DragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    SM.FireEvent(this, 'DragOver', evt, true);
}

function DUC_Drop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;
    if (files == null || files.length == 0)
        return;

    if (this.Files == null)
        this.Files = [];
    if (this.Files.length > 0) {
        alert('Дождитесь окончания загрузки файлов для совершения следующей загрузки.');
        return;
    }

    var i, len = files.length;
    for (i = 0; i < len; i++) {
        var file = files[i];
        if (file.size > 0)
            this.Files.push(file);
    }
    if (this.Files.length == 0)
        return;

    SM.FireEvent(this, 'Drop', null, true);
}

function DUC_GetDroppedFile() {
    if (this.Files == null || this.Files.length == 0)
        return null;
    var file = this.Files.shift();
    return file;
}




/*--------------------------- DBFieldFiles - DragUpload -----------------------------------*/
function OnFilesFieldDrop() {
    //SM.WriteLog('Drop File at field');
    FDC_HideDragState.call(this);
    FDC_ProcessDroppedFile.call(this);

    return;
}

function FDC_ProcessDroppedFile() {
    var file = this.GetDroppedFile();
    if (file == null)
        return;

    var field = this.FilesField;
    var fileName = field.FixRussianSpecChars(file.name);
    var iconUrl = GetIconUrl(fileName);
    var canUpload = MultiFileUploadStart(fileName, field.FieldTitle, iconUrl, true);
    if (canUpload)
        FDC_UploadDroppedFile.call(this, file);
    else
        FDC_ProcessDroppedFile.call(this);
}

function FDC_UploadDroppedFile(file) {
    var field = this.FilesField;
    var fileName = field.FixRussianSpecChars(file.name);

    var url = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/UploadHandler.ashx?rnd=' + Math.random();
    var params = '';
    params += '&fieldWebID=' + field.FieldWebID;
    params += '&fieldListID=' + field.FieldListID;
    params += '&fieldID=' + field.FieldID;
    params += '&itemFolderName=' + field.ItemFolderName;
    params += '&isMultiple=' + 'true';
    params += '&isDroppedFile=' + 'true';
    //params += '&droppedContent=' + fileDropContent;
    params += '&fileName=' + encodeURI(field.EncodeFileName(fileName));

    url += params;

    var xmlRequest = SM.GetXmlRequest();
    xmlRequest.open('POST', url, true);
    xmlRequest.setRequestHeader('Content-Type', 'multipart/form-data');
    xmlRequest.setRequestHeader('X-File-Name', 'PostingFile');
    xmlRequest.setRequestHeader('X-File-Size', file.size);
    var thisObj = this;
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            var responseText = xmlRequest.responseText;
            xmlRequest.onreadystatechange = new Function();
            field.OnUpload(null, responseText);
        }
    }
    xmlRequest.send(file);
}



function OnFilesDragEnter(evt) {
    FDC_SetDragState.call(this, evt);
}

function OnFilesDragOver(evt) {
    FDC_SetDragState.call(this, evt);
}

function OnFilesDragExit(evt) {
    FDC_HideDragState.call(this, evt);
}

function FDC_SetDragState(evt) {
    var hasFiles = false;
    if (evt.dataTransfer.types != null) {
        var i, len = evt.dataTransfer.types.length;
        for (i = 0; i < len; i++) {
            var typeString = evt.dataTransfer.types[i];
            if (!SM.IsNE(typeString) && typeString.toLowerCase() == 'files') {
                hasFiles = true;
                break;
            }
        }

    }

    if (!hasFiles)
        return;

    $(this.Trigger).addClass('files_dragPanel');
    this.LastDragTime = new Date().getTime();

    if (this.FilesField.MultiUploadControl != null)
        this.FilesField.MultiUploadControl.UploadDisabled = true;
    if (this.FilesField.MultiUploadControlImage != null)
        this.FilesField.MultiUploadControlImage.UploadDisabled = true;
}

function FDC_HideDragState(evt) {
    var thisObj = this;
    if (!this.HasHideDragStyleHandler) {
        this.HasHideDragStyleHandler = true;
        window.setInterval(function () {
            if (thisObj.LastDragTime != null) {
                var currentTime = new Date().getTime();
                if (currentTime - thisObj.LastDragTime > 70) {
                    $(thisObj.Trigger).removeClass('files_dragPanel');

                    if (thisObj.FilesField.MultiUploadControl != null)
                        thisObj.FilesField.MultiUploadControl.UploadDisabled = false;
                    if (thisObj.FilesField.MultiUploadControlImage != null)
                        thisObj.FilesField.MultiUploadControlImage.UploadDisabled = false;
                }
                thisObj.HasHideDragStyleHandler = false;
            }
        }, 30);
    }
}