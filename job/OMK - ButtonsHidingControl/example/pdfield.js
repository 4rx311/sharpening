function PDField(xml, fieldName) {
    this.XDocument = window.SM.LoadXML(xml);
    this.RootNode = this.XDocument.selectSingleNode('PDFileCollection');
    if (this.RootNode != null) {
        this.ParentDocumentFieldName = this.RootNode.getAttribute('ParentDocumentFieldName');

        this.ContainerID = this.RootNode.getAttribute('ContainerID');
        this.ControlWidth = this.RootNode.getAttribute('ControlWidth');
        this.FieldID = this.RootNode.getAttribute('FieldID');

        var showComissionFiles = this.RootNode.getAttribute('ShowComissionFiles');
        if (showComissionFiles != null && showComissionFiles.toString().toLowerCase() == 'true')
            this.ShowComissionFiles = true;
    }

    this.FieldName = fieldName;

    //props
    this.Files = new Array();
    this.FieldContainer = window.document.getElementById(this.ContainerID);
    this.FilesModulePath = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files';
    this.SourceFolder = '/_LAYOUTS/WSS/WSSC.V4.DMS.Fields.ParentDocumentFiles';
    this.IsChanged = false;

    this.NewDesign = true; //only for new design
    this.FileIndex = 0;

    //func
    this.Init = PD_Init;
    this.Reset = PD_Reset;
    this.ResetLayout = PD_ResetLayout_Des1;
    this.InitParentDocumentField = PD_InitParentDocumentField;
    this.ParentDocumentChangeHandler = PD_ParentDocumentChangeHandler;

    this.Init(this.RootNode);
    this.InitParentDocumentField();

    //interface
    this.OnInit = PDField_OnInit;
    this.OnSave = PDField_OnSave;
    this.Disable = PDField_Disable;
    this.Enable = PDField_Enable;
    this.GetValue = PD_GetValue;
    this.SetValue = PDField_SetValue;
    this.ShowInformer = PDField_ShowInformer;
    this.IsChanged = PDField_IsChanged;
    this.IsEmptyValue = PDField_IsEmptyValue;

    //add to window pdfield collection
    if (window.PDFieldsCollection == null)
        window.PDFieldsCollection = new Array();

    if (window.PDFieldsCollection[this.FieldName] == null)
        window.PDFieldsCollection[this.FieldName] = this;

    return this;
}

function PDField_GetField(fieldName) {
    return window.PDFieldsCollection[fieldName];
}

//заглушки интерфейсов
function PDField_OnSave(saveArgs) {
    return;
}
function PDField_Disable() { return; }
function PDField_Enable() { return; }
function PDField_ShowInformer() { return; }
function PDField_IsChanged() { return this.IsChanged; }
function PDField_OnInit() { return; }

function PDField_SetValue() {
    var unsupportedErrorText = window.TN.TranslateKey("pdf.alerts.setvaluenotsupported");
    alert(unsupportedErrorText);
}

function PDField_IsEmptyValue() {
    var result = true;
    var val = this.GetValue();
    if (val != null) {
        if (val.length > 0)
            result = false;
    }

    return result;
}

function PD_Init(rootNode) {
    this.Reset();

    if (rootNode == null) {
        this.Files = [];
        window.SM.ResetFormLayout();
        return;
    }

    this.Files = [];
    this.FilesContainer = window.document.createElement('div');
    this.FilesContainer.className = 'pd_files_container';

    var fileNodes = rootNode.selectNodes('Files/PDFile');
    var i, len = fileNodes.length;
    for (i = 0; i < len; i++) {
        var node = fileNodes[i];
        var pdFile = new PD_File(node, this);
        this.Files[this.Files.length] = pdFile;
    }

    this.ResetLayout();
    this.FieldContainer.appendChild(this.FilesContainer);
    window.SM.ResetFormLayout();
}

function PD_Reset() {
    this.FileIndex = 0;
    if (this.FieldContainer != null && this.FilesContainer != null && this.FilesContainer.parentElement != null
            && this.FieldContainer.id == this.FilesContainer.parentElement.id)
        this.FieldContainer.removeChild(this.FilesContainer);
}

function PD_InitParentDocumentField() {
    this.ListForm = window.ListForm;
    if (this.ListForm == null)
        return;

    var thisobj = this;

    if (this.ListForm.AddInitHandler != null) {
        //добавление обработчика формы, который
        //добавляем обработчик на поле-источник значений файлов
        this.ListForm.AddInitHandler(
            function () {
                if (!window.SM.IsNE(thisobj.ParentDocumentFieldName)) {
                    var pdField = thisobj.ListForm.GetField(thisobj.ParentDocumentFieldName);
                    if (pdField != null) {
                        pdField.PDFilesField = thisobj;
                        //обработчик на смену источника с фалами
                        if (pdField.AddChangeHandler != null) {
                            pdField.AddChangeHandler(function () {
                                thisobj.ParentDocumentChangeHandler(pdField);
                            });
                        }
                    }
                }
            });
    }
}

function PD_ParentDocumentChangeHandler(field) {
    if (field == null)
        return;

    var typedField = field.TypedField;
    if (typedField == null)
        return;

    var response = '';

    var value = field.GetValue();
    //запрос на сервер посылаем когда есть значение мультиисточника,
    //либо в поле файлов связанных списков настроено так же отображение файлов из поручений.
    if (value != null || this.ShowComissionFiles) {
        var xd = window.SM.LoadXML('<LookupItems></LookupItems>');
        var xdRootNode = xd.selectSingleNode('LookupItems');

        var isMultiple = false;
        var typeOfLookupSingle = 'DBFieldLookupSingle';
        var typeOfLookupMulti = 'DBFieldLookupMulti';
        var isMSLField = field.Type == 'MSLField';

        var lookupListID = 0;
        if (isMSLField)
            isMultiple = typedField.IsMultiple;
        else {
            if (typedField.Settings != null) {
                isMultiple = typedField.Settings.IsMultiple;
                lookupListID = typedField.Settings.LookupListID;
            }
        }

        //обработка значений мультиисточника
        if (value != null) {
            if (isMultiple) {
                var i, len = value.length;
                for (i = 0; i < len; i++) {
                    var val = value[i];
                    if (val == null)
                        continue;

                    var valueLookupListID = val.LookupListID;
                    if (!isMSLField)
                        valueLookupListID = lookupListID;

                    var lookupNode = xd.documentElement.ownerDocument.createElement('LookupItem');
                    lookupNode.setAttribute('ListID', valueLookupListID);
                    lookupNode.setAttribute('ItemID', val.LookupID);
                    xdRootNode.appendChild(lookupNode);
                }
            }
            else {
                var valueLookupListID = value.LookupListID;
                if (!isMSLField)
                    valueLookupListID = lookupListID;

                var lookupNode = xd.documentElement.ownerDocument.createElement('LookupItem');
                lookupNode.setAttribute('ListID', valueLookupListID);
                lookupNode.setAttribute('ItemID', value.LookupID);
                xdRootNode.appendChild(lookupNode);
            }
        }

        var url = this.SourceFolder + '/GetPDFiles.aspx?';
        url += 'rnd=' + Math.random();
        var params = new String();
        params = params.concat('&lookupItems=', window.EncodeUrlParameter(window.SM.PersistXML(xd)));
        params = params.concat('&listID=', this.ListForm.ListID);
        params = params.concat('&itemID=', this.ListForm.ItemID);
        params = params.concat('&fieldID=', field.ID);
        params = params.concat('&pdFieldID=', this.FieldID);
        params = encodeURI(params);

        //var ajax = new ActiveXObject("Microsoft.XMLHTTP");
        var ajax = window.SM.GetXmlRequest();
        ajax.open("POST", url, true);
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

        var thisObj = this;

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                ajax.onreadystatechange = new Function();
                response = ajax.responseText;
                if (response.toLowerCase().indexOf('exception') != -1) {
                    var unknownErrorText = window.TN.TranslateKey('pdf.alerts.unknownerror');
                    alert(unknownErrorText + response);
                    return;
                }
                else {
                    //init files field
                    var rootNode = null;
                    if (!window.SM.IsNE(response)) {
                        var outputXD = window.SM.LoadXML(response);
                        rootNode = outputXD.selectSingleNode('PDFileCollection');
                    }

                    thisObj.Init(rootNode);
                    thisObj.IsChanged = true;
                    thisObj.ListFormField.OnChange();
                }
            }
        }
        ajax.send(params);
    }
    else {
        this.Init(null);
        this.IsChanged = true;
        this.ListFormField.OnChange();
    }
}

function PD_GetValue() {
    var result = null;
    if (this.Files != null) {
        if (this.Files.length > 0)
            result = this.Files;
    }

    return result;
}



//***********File
function PD_File(node, pdField) {
    this.Node = node;
    this.PDField = pdField;
    this.CommentNode = this.Node.selectSingleNode('Comment');
    if (this.CommentNode != null)
        this.Comment = this.CommentNode.text;
    this.FileName = this.Node.getAttribute('FileName');
    this.FileUrl = this.Node.getAttribute('FileUrl');
    this.ID = this.Node.getAttribute('ID');
    this.FieldID = this.Node.getAttribute('FieldID');
    this.FileWebID = this.Node.getAttribute('FileWebID');
    this.FileListID = this.Node.getAttribute('FileListID');
    this.FileItemID = this.Node.getAttribute('FileItemID');
    this.PreviewPageCount = this.Node.getAttribute('PreviewPageCount');
    var previewEnableAttrValue = this.Node.getAttribute('PreviewEnable');
    if (!window.SM.IsNE(previewEnableAttrValue))
        this.PreviewEnable = previewEnableAttrValue.toString().toLowerCase() == 'true';
    this.IconUrl = this.Node.getAttribute('IconUrl');
    this.FileIndex = this.PDField.FileIndex;

    //version
    this.ItemWebID = this.Node.getAttribute('ItemWebID');
    this.ItemListID = this.Node.getAttribute('ItemListID');
    this.ItemID = this.Node.getAttribute('ItemID');

    //func
    this.Init = PDFile_Init_Des1;

    this.Init();
    this.PDField.FileIndex++;
    return this;
}

function PDFile_Init_Des1() {
    var divFileContainer = window.document.createElement('div');
    this.PDField.FilesContainer.appendChild(divFileContainer);
    this.FileDiv = divFileContainer;
    this.FileDiv.className = 'pd_file_container';

    var divBorder = window.document.createElement('div');
    divBorder.className = 'pd_top_border_div'
    this.FileDiv.appendChild(divBorder);
    if (this.FileIndex == 0)
        divBorder.style.display = 'none';

    var divFileProp = window.document.createElement('div');
    this.DivFileProperties = divFileProp;
    divFileProp.className = 'pd_file_prop_div';
    var divFileImages = window.document.createElement('div');
    divFileImages.className = 'pd_file_img_div';
    this.DivFileImages = divFileImages;
    var imagesCount = 0;

    this.FileDiv.appendChild(divFileProp);
    this.FileDiv.appendChild(divFileImages);

    //div с названием файла и комментом (ссылка)
    var divFileName = window.document.createElement('div');
    this.DivFileName = divFileName;
    divFileProp.appendChild(divFileName);

    //div с названием файла
    divFileName.className = 'pd_file_comment_div';

    var linkIcon = window.document.createElement('a');
    divFileName.appendChild(linkIcon);
    var fileUrl = '#';
    if (!window.SM.IsNE(this.FileUrl)) {
        fileUrl = this.FileUrl;
        //fileUrl = this.PDField.HostUrl + this.FileUrl;
        if (this.PDField.ReplaceHttpsByHttp) {
            var rgHttps = /(https:)/g;
            //fileUrl = this.PDField.HostUrl.toLowerCase().replace(rgHttps, 'http:') + this.FileUrl;
            fileUrl = 'http://' + this.FileUrl;
        }
    }
    linkIcon.onclick = function () { return PD_OnFileLinkClick(this); }
    linkIcon.href = fileUrl;

    this.LinkIcon = linkIcon;
    linkIcon.FileItem = this;
    var imgIcon = window.document.createElement('img');
    imgIcon.className = 'pd_file_icon';
    linkIcon.className = 'pd_file_icon_link';
    linkIcon.appendChild(imgIcon);
    imgIcon.src = this.IconUrl;
    imgIcon.border = 0;
    this.ImageIcon = imgIcon;

    var linkFile = window.document.createElement('a');
    linkFile.className = 'pd_file_link';
    this.LinkContainer = window.document.createElement('div');
    this.LinkContainer.className = 'pd_filelink_container';
    divFileName.appendChild(this.LinkContainer);
    this.LinkContainer.appendChild(linkFile);

    /*
    var linkFile = window.document.createElement('a');
    linkFile.className = 'pd_file_link';
    divFileName.appendChild(linkFile);
    */
    linkFile.onclick = function () { return PD_OnFileLinkClick(this); }
    var linkSpan = window.document.createElement('span');
    linkSpan.className = 'pd_file_span';
    $(linkSpan).text(this.FileName);
    this.LinkSpan = linkSpan;
    linkFile.appendChild(linkSpan);
    linkFile.href = fileUrl;
    this.LinkFile = linkFile;
    linkFile.FileItem = this;

    //comments
    if (this.DivCommentText == null) {
        var divComment = window.document.createElement('div');
        divComment.className = 'pd_comment_div';
        this.FileDiv.appendChild(divComment);

        var spanCommentText = window.document.createElement('div');
        spanCommentText.className = 'pd_comment_span';
        this.SpanCommentText = spanCommentText;
        this.SpanCommentText.style.width = this.PDField.ControlWidth + 'px';
        $(this.SpanCommentText).text(this.Comment);
        this.SpanCommentText.PDFile = this;
        divComment.appendChild(spanCommentText);
        this.DivCommentText = divComment;
        if (window.SM.IsNE(this.Comment))
            this.DivCommentText.style.display = 'none';
    }

    //images
    this.PDField.FileVersionsEnabled = true;
    if (this.PDField.FileVersionsEnabled) {
        var versionImg = window.document.createElement('img');
        versionImg.src = '/_layouts/images/versions.gif';
        var versionsJournalTitle = window.TN.TranslateKey('pdf.titles.versionsjournal');
        versionImg.title = versionsJournalTitle;
        versionImg.style.cursor = 'pointer';
        versionImg.className = 'pd_file_images';
        versionImg.onclick = function () {
            PD_OnFileVersionsClick(this);
        }
        this.ImageVersions = versionImg;
        divFileImages.appendChild(versionImg);
        imagesCount++;
        this.ImageVersions.FileItem = this;
    }

    //preview
    if (this.PreviewEnable) {
        var filePreviewEnable = false;
        if (!window.SM.IsNE(this.FileName)) {
            var len = this.FileName.length;
            var previeEnabledExtensions = '.doc|.docx|.xls|.xlsx|.pdf|.png|.jpg|.tif|.gif|.bmp';

            var extension = '';
            var lastIndexOfDot = this.FileName.lastIndexOf('.');
            if (lastIndexOfDot > 0 && this.FileName.length > lastIndexOfDot) {
                extension = this.FileName.toLowerCase().substring(lastIndexOfDot);
                if (!window.SM.IsNE(extension))
                    filePreviewEnable = previeEnabledExtensions.indexOf(extension) != -1;
            }

            if (this.PreviewEnable && this.FileItemID != null && filePreviewEnable) {
                if (this.PreviewPageCount > 0) {
                    var self = this;
                    var previewImg = window.document.createElement('img');
                    previewImg.style.cursor = 'pointer';
                    previewImg.className = 'pd_file_images';
                    previewImg.src = self.PDField.FilesModulePath + '/arrow_medium_right.png';
                    previewImg.FileItem = self;
                    previewImg.onclick = function () {
                        ShowFilePreview(self.FileWebID, self.FileListID, self.FileItemID, this);
                    }

                    divFileImages.appendChild(previewImg);
                    imagesCount++;
                }
            }
        }
    }

    if (imagesCount > 3)
        imagesCount = 3;
    this.ImagesCount = imagesCount;
}


function PD_OnFileVersionsClick(imageVersions) {
    var fileItem = imageVersions.FileItem;
    if (!fileItem.IsUploading) {
        var pdField = fileItem.PDField;
        var url = '';
        if (!pdField.NewDesign)
            url = pdField.StorageWebUrl + '/_layouts/Versions.aspx?list={' + pdField.StorageListID + '}&ID=' + fileItem.FileItemID + '&FileName=' + encodeURI(fileItem.FileUrl) + '&Source=/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/ClosePage.aspx';
        else
            url = pdField.FilesModulePath + '/VersionsJournal/DBFieldFilesVersionsJournal.aspx?WebID=' + fileItem.ItemWebID + '&ItemID=' + fileItem.ItemID + '&FieldID=' + fileItem.FieldID + '&ListID=' + fileItem.ItemListID + '&FileItemID=' + fileItem.FileItemID + '&rnd=' + Math.random().toString();

        var winFeatures = 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no';
        window.open(url, '_blank', winFeatures);
    }
}


function PD_ResetLayout_Des1() {
    var i, len = this.Files.length;
    var controlWidth = this.ControlWidth;
    if (controlWidth == null)
        controlWidth = 0;

    if (controlWidth == 0)
        controlWidth = 140;

    var nameMaxWidth = 0;
    var fileMaxWidth = 0;

    var maxFileWidth = 0;

    for (i = 0; i < len; i++) {
        var fileItem = this.Files[i];
        if (fileItem.Deleted || fileItem.DivFileProperties == null)
            continue;

        //ширина картинок
        var imgDivWidth = (fileItem.ImagesCount * (16 + 3)) + 10;
        fileItem.DivFileImages.style.width = imgDivWidth + 'px';

        var fImagesWidth = imgDivWidth;
        if (fImagesWidth > maxFileWidth)
            maxFileWidth = fImagesWidth;
    }

    var isDefWidth = false;
    var specifiedWidth = 0;

    if (controlWidth < fImagesWidth) {
        isDefWidth = true;
        controlWidth = fImagesWidth + 30;
    }
    else
        specifiedWidth = controlWidth - maxFileWidth;

    this.ContainerMaxWidth = controlWidth;

    for (i = 0; i < len; i++) {
        var fileItem = this.Files[i];
        if (fileItem.Deleted || fileItem.DivFileProperties == null)
            continue;

        if (isDefWidth)
            fileItem.DivFileProperties.style.width = '30px';
        else
            fileItem.DivFileProperties.style.width = specifiedWidth + 'px';

        fileItem.LinkContainer.style.width = (specifiedWidth - 16) + 'px';
        //fileItem.LinkFile.style.width = (specifiedWidth - 16) + 'px';
        fileItem.FileDiv.style.width = controlWidth + 'px';
    }
}

function PD_OnFileLinkClick(link) {
    var fileItem = link.FileItem;
    var pdField = fileItem.PDField;


    var fileUrl = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/Pages/GetDocumentContent.aspx?fileUniqueID=' + fileItem.ID + '&rnd=' + Math.random().toString();
    window.location.href = fileUrl;
    return false;
}