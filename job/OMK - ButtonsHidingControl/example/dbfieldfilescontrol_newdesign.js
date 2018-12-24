var dispose_count = 0;

//   Определение типа устройства
(function () {
    var previousDevice, _doc_element, _find, _user_agent;
    previousDevice = window.device;
    window.device = {};
    _doc_element = window.document.documentElement;
    _user_agent = window.navigator.userAgent.toLowerCase();
    device.ipad = function () {
        return _find('ipad');
    };
    device.android = function () {
        return _find('android');
    };
    device.androidPhone = function () {
        return device.android() && _find('mobile');
    };
    device.androidTablet = function () {
        return device.android() && !_find('mobile');
    };
    device.windows = function () {
        return _find('windows');
    };
    device.macosx = function () {
        return _find('mac');
    };
    device.windowsPhone = function () {
        return device.windows() && _find('phone');
    };
    device.windowsTablet = function () {
        return device.windows() && ((_find('touch') || _find('chrome')) && !device.windowsPhone());
    };
    device.nodeWebkit = function () {
        return typeof window.process === 'object';
    };
    device.tablet = function () {
        return device.ipad() || device.androidTablet() || device.windowsTablet();
    };
    device.desktop = function () {
        return !device.tablet() && !device.mobile();
    };
    device.portrait = function () {
        return (window.innerHeight / window.innerWidth) > 1;
    };
    device.landscape = function () {
        return (window.innerHeight / window.innerWidth) < 1;
    };
    device.noConflict = function () {
        window.device = previousDevice;
        return this;
    };
    _find = function (needle) {
        return _user_agent.indexOf(needle) !== -1;
    };
}).call(this);

function FCF_Dispose(obj) {
    if (obj == null)
        return;

    if (obj.toString().toLowerCase() == 'settingsdocument')
        return;

    for (var prop in obj) {
        obj[prop] = null;
        dispose_count++;
    }
    obj = null;
}

$(window).unload(function () {
    if (_filesUploadFieldCollection != null) {
        for (var prop in _filesUploadFieldCollection) {
            if (!window.SM.IsNE(prop)) {
                if (prop.toLowerCase() == 'files') {
                    var files = _filesUploadFieldCollection[prop];
                    for (var fProp in files) {
                        FCF_Dispose(files[fProp]);
                        FCF_Dispose(files);
                    }
                }
            }

            FCF_Dispose(_filesUploadFieldCollection[prop]);
        }
        FCF_Dispose(_filesUploadFieldCollection);
    }
    dispose_count;
    delete dispose_count;
});

//var BRC_ButtonCreated = false;

function FCF_CreateMainPanel_Des1() {
    var clientField = this;
    var divMainPanel = window.document.createElement('div');
    this.MainPanel = divMainPanel;

    if (this.EditMode && this.CurrentUserCanCreate) {
        divMainPanel.className = 'files-mainpanel-container';
        var tbMainPanel = window.document.createElement('table');
        tbMainPanel.className = 'files-mainPanel';
        if (this.ControlWidth > 0) {
            divMainPanel.style.width = this.ControlWidth + 'px';
            tbMainPanel.style.width = this.ControlWidth + 'px';
        }
        else
            tbMainPanel.style.width = '100%';
        this.TableMainPanel = tbMainPanel;
        // tbMainPanel.FilesField = this;
        divMainPanel.appendChild(tbMainPanel);
        tbMainPanel.border = 0;
        tbMainPanel.cellPadding = 0;
        tbMainPanel.cellSpacing = 0;
        var trMainPanel = tbMainPanel.insertRow(tbMainPanel.rows.length);
        this.TRMainPanel = trMainPanel;
        var uploadImageIndex = 0;

        var isIOS = (navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1)

        var enableMultiUploadForIOS = true;
        if (isIOS)
            enableMultiUploadForIOS = false;

        if (!this.HideUploadButton) {
            var tdImgUploadFiles = trMainPanel.insertCell(trMainPanel.cells.length);
            this.TDImgUploadFiles = tdImgUploadFiles;

            //определение отступа картинки загрузки
            var imageCellClassName = null;
            if (uploadImageIndex == 0)
                imageCellClassName = 'files-uploadtdimg-first';
            else
                imageCellClassName = 'files-uploadtdimg';
            uploadImageIndex++;

            tdImgUploadFiles.className = imageCellClassName;

            var tdUploadFiles = trMainPanel.insertCell(trMainPanel.cells.length);
            this.TDUploadFiles = tdUploadFiles;
            tdUploadFiles.className = 'files-uploadtd';
            var uploadFilesContainerID = 'uploadFilesContainerID_' + this.FieldInternalName;
            tdUploadFiles.id = uploadFilesContainerID;

            var uploadimgLink = window.document.createElement('a');
            this.UploadImgLink = uploadimgLink;
            uploadimgLink.className = 'files-uploadImgLink';
            uploadimgLink.href = 'javascript:';
            var uploadImg = window.document.createElement('img');
            uploadImg.style.border = 'none';
            uploadImg.className = 'files-other-icons';
            uploadImg.src = this.SourceFolder + '/attach.png';
            uploadimgLink.appendChild(uploadImg);
            uploadimgLink.ClientField = clientField;
            uploadimgLink.DisableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = true;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = true;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = true;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = true;
            }
            uploadimgLink.EnableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = false;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = false;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = false;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = false;
            }
            if (!this.FilesForm.UseHttpUpload) {
                uploadimgLink.onclick = function () {
                    if (this.disabled)
                        return;

                    window.FilesForm.UploadControl.OpenMultiFileDialog(clientField.FieldTitle);
                }
            }
            else {
                this.MultiUploadControlImage = uploadImg;
                window.AddFileUploadTrigger({
                    Trigger: uploadImg,
                    TriggerActivator: tdImgUploadFiles,
                    IsMultiple: true,
                    OnSelectFiles: function (uploadControl) { clientField.OnSelectFiles(uploadControl, true); },
                    OnUpload: function (uploadControl, responseText) { clientField.OnUpload(uploadControl, responseText, true); }
                });
            }
            if (window.addEventListener != null && (
                SM.IEVersion >= 10 || SM.IsChrome || SM.IsFF || SM.IsSafari
            )) {
                this.DragControl = new DragUploadControl({
                    Trigger: this.MainPanel
                });
                this.DragControl.FilesField = this;
                this.DragControl.Init();
                SM.AttachEvent(this.DragControl, 'Drop', OnFilesFieldDrop);
                SM.AttachEvent(this.DragControl, 'DragEnter', OnFilesDragEnter);
                SM.AttachEvent(this.DragControl, 'DragOver', OnFilesDragOver);
                SM.AttachEvent(this.DragControl, 'DragExit', OnFilesDragExit);
            }
            uploadimgLink.DisableUpload();
            tdImgUploadFiles.appendChild(uploadimgLink);

            var lnkMultiUpload = window.document.createElement('a');
            this.UploadLink = lnkMultiUpload;
            lnkMultiUpload.href = 'javascript:';
            tdUploadFiles.appendChild(lnkMultiUpload);
            lnkMultiUpload.className = 'files-uploadLink';
            var loadFilesTitle = window.TN.TranslateKey('files.titles.loadfiles');
            $(lnkMultiUpload).text(loadFilesTitle);
            lnkMultiUpload.ClientField = clientField;
            lnkMultiUpload.DisableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = true;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = true;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = true;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = true;
            }
            lnkMultiUpload.EnableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = false;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = false;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = false;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = false;
            }

            if (!this.FilesForm.UseHttpUpload) {
                lnkMultiUpload.onclick = function () {
                    if (this.disabled)
                        return;
                    window.FilesForm.UploadControl.OpenMultiFileDialog(clientField.FieldTitle);
                }
            }
            else {
                window.AddFileUploadTrigger({
                    Trigger: lnkMultiUpload,
                    TriggerActivator: tdUploadFiles,
                    IsMultiple: enableMultiUploadForIOS,
                    IsMultiCompatible: !enableMultiUploadForIOS,
                    OnSelectFiles: function (uploadControl) { clientField.OnSelectFiles(uploadControl, true); },
                    OnUpload: function (uploadControl, responseText) { clientField.OnUpload(uploadControl, responseText, true); },
                    OnTriggerHover: function () { clientField.OnUploadInputHover(lnkMultiUpload); },
                    OnTriggerOut: function () { clientField.OnUploadInputOut(lnkMultiUpload); }
                });
            }

            lnkMultiUpload.DisableUpload();
            this.MultiUploadControl = lnkMultiUpload;
        }
        //template upload
        if (this.EnableTemplateUpload) {
            var tdImgTemplateUpload = trMainPanel.insertCell(trMainPanel.cells.length);
            this.TDImgTemplateUpload = tdImgTemplateUpload;

            //определение отступа картинки загрузки
            var imageCellClassName = null;
            if (uploadImageIndex == 0)
                imageCellClassName = 'files-uploadtdimg-first';
            else
                imageCellClassName = 'files-uploadtdimg';
            uploadImageIndex++;

            tdImgTemplateUpload.className = imageCellClassName;

            var tdTemplateUpload = trMainPanel.insertCell(trMainPanel.cells.length);
            this.TDTemplateUpload = tdTemplateUpload;

            tdTemplateUpload.className = 'files-uploadtd';
            tdTemplateUpload.id = 'templateFilesUploadContainer_' + this.FieldInternalName;

            var templateUploadimgLink = window.document.createElement('a');
            templateUploadimgLink.className = 'files-uploadImgLink';
            //из-за строчки href='javascript:' пропадало выделение во вложенном диалоге.
            var templateUploadImg = window.document.createElement('img');
            this.TemplateUploadImgLink = templateUploadimgLink;
            templateUploadImg.style.border = 'none';
            templateUploadImg.src = this.SourceFolder + '/attach.png';
            templateUploadImg.className = 'files-other-icons';
            templateUploadImg.ClientField = clientField;
            templateUploadimgLink.ClientField = clientField;
            templateUploadimgLink.appendChild(templateUploadImg);
            templateUploadimgLink.DisableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = true;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = true;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = true;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = true;
            }
            templateUploadimgLink.EnableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = false;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = false;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = false;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = false;
            }
            templateUploadimgLink.onclick = function (evt) {
                if (this.disabled)
                    return;

                OpenTemplateWindow(clientField.FieldTitle, false, evt);
            }
            templateUploadimgLink.DisableUpload();
            tdImgTemplateUpload.appendChild(templateUploadimgLink);


            var lnkTemplateUpload = window.document.createElement('a');
            this.TemplateUploadLink = lnkTemplateUpload;
            lnkTemplateUpload.href = 'javascript:';
            tdTemplateUpload.appendChild(lnkTemplateUpload);
            lnkTemplateUpload.className = 'files-uploadLink';
            var loadFilesFromTemplateTitle = window.TN.TranslateKey('files.titles.loadfromtemplate');
            $(lnkTemplateUpload).text(loadFilesFromTemplateTitle);
            lnkTemplateUpload.ClientField = clientField;
            lnkTemplateUpload.DisableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = true;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = true;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = true;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = true;
            }
            lnkTemplateUpload.EnableUpload = function () {
                if (this.ClientField.UploadImgLink != null)
                    this.ClientField.UploadImgLink.disabled = false;

                if (this.ClientField.UploadLink != null)
                    this.ClientField.UploadLink.disabled = false;

                if (this.ClientField.TemplateUploadImgLink != null)
                    this.ClientField.TemplateUploadImgLink.disabled = false;

                if (this.ClientField.TemplateUploadLink != null)
                    this.ClientField.TemplateUploadLink.disabled = false;
            }
            lnkTemplateUpload.onclick = function (evt) {
                if (this.disabled)
                    return;

                OpenTemplateWindow(clientField.FieldTitle, true, evt);
            }
            lnkTemplateUpload.DisableUpload();
            this.TemplateUploadControl = lnkTemplateUpload;
        }
    }

    //последняя ячейка вставлена с шириной в 100%
    var lastWidthCellInserted = false;
    //добавляем панель кнопок, для режима Только чтение.
    if (this.EnableFilesSending || this.EnableBarCodePrint || this.DownloadEnabled) {
        if (this.TableMainPanel == null) {
            var tbMainPanel = window.document.createElement('table');
            tbMainPanel.className = 'files-mainPanel';
            if (this.ControlWidth > 0)
                tbMainPanel.style.width = this.ControlWidth + 'px';
            else
                tbMainPanel.style.width = '100%';
            this.TableMainPanel = tbMainPanel;

            tbMainPanel.border = 0;
            tbMainPanel.cellPadding = 0;
            tbMainPanel.cellSpacing = 0;
            var trMainPanel = tbMainPanel.insertRow(tbMainPanel.rows.length);
            this.TRMainPanel = trMainPanel;
            divMainPanel.appendChild(tbMainPanel);
        }
    }

    if (this.DownloadEnabled) {
        var thisObj = this;
        var tdDownload = this.TRMainPanel.insertCell(-1);
        this.TDDownload = tdDownload;
        tdDownload.className = 'files-scan-td';
        var imgDownload = document.createElement('img');
        imgDownload.src = this.ModulePath + '/Images/download.png';
        imgDownload.title = 'Сохранить файлы как ZIP-архив.';
        imgDownload.style.cursor = 'pointer';

        imgDownload.onclick = function () {
            FilesField_DownloadFiles.call(thisObj);
        }

        tdDownload.appendChild(imgDownload);
        lastWidthCellInserted = true;
    }

    if (this.EditMode && this.CurrentUserCanCreate) {
        //scan
        if (this.EnableScan) {
            var tdScanUpload = trMainPanel.insertCell(-1);
            this.TDScanUpload = tdScanUpload;
            tdScanUpload.className = 'files-scan-td';

            tdScanUpload.id = 'scanFilesUploadContainer_' + this.FieldInternalName;

            var imgScanUploadLink = window.document.createElement('a');
            imgScanUploadLink.style.cursor = 'pointer';
            var loadScanTitle = window.TN.TranslateKey('files.titles.loadscan');
            imgScanUploadLink.title = loadScanTitle;
            var imgScanUpload = window.document.createElement('img');
            imgScanUpload.style.border = 0 + 'px';
            imgScanUpload.src = this.SourceFolder + '/addscan.png';
            imgScanUploadLink.appendChild(imgScanUpload);
            imgScanUploadLink.Image = imgScanUpload;

            tdScanUpload.appendChild(imgScanUploadLink);

            imgScanUploadLink.onmousedown = function (evt) {
                ScanNewFileStart(clientField.FieldTitle, evt);
            }

            imgScanUploadLink.DisableUpload = function () {
                this.disabled = true;
            }
            imgScanUploadLink.EnableUpload = function () {
                this.disabled = false;
            }
            if (!SM.IsIE8)
                imgScanUploadLink.DisableUpload();

            imgScanUploadLink.style.position = 'relative'
            this.ScanUploadControl = imgScanUploadLink;
            lastWidthCellInserted = true;
        }

    }

    //bar code
    if (this.EnableBarCodePrint) {
        var tdBarCodePrint = this.TRMainPanel.insertCell(this.TRMainPanel.cells.length);
        this.TDBarCodePrint = tdBarCodePrint;
        tdBarCodePrint.className = 'files-scan-td';
        tdBarCodePrint.id = 'scanFilesUploadContainer_' + this.FieldInternalName;

        var imgBarCodePrintLink = window.document.createElement('a');
        imgBarCodePrintLink.style.cursor = 'pointer';
        var printBarCodeTitle = window.TN.TranslateKey('files.titles.printbarcode');
        imgBarCodePrintLink.title = printBarCodeTitle;
        var imgBarCodePrint = window.document.createElement('img');
        imgBarCodePrint.style.border = 0 + 'px';
        imgBarCodePrint.src = this.SourceFolder + '/barcode.png';

        //прописываем в объект поля ссылку на картинку, чтобы в обрабобтчике проверки координаты получить ссылку на эту картинку.
        //    clientField.BarCodePrintImage = imgBarCodePrint;
        imgBarCodePrintLink.appendChild(imgBarCodePrint);

        tdBarCodePrint.appendChild(imgBarCodePrintLink);

        //   imgBarCodePrint.FieldID = clientField.FieldID;

        imgBarCodePrintLink.onclick = function () {
            if (this.disabled)
                return;

            PrintBarCode(clientField.FieldTitle);
            //alert('Дождитесь загрузки компонента печати штрих-кодов.');
            //alert('Не установлен компонент печати штрих-кодов.');


        }

        /*this.TableMainPanel.onmouseover = BRC_CheckBarCodePrinterPosition;
        this.TableMainPanel.onmouseout = BRC_CheckBarCodePrinterPosition;
        if (this.TableMainPanel.FilesField == null)
            this.TableMainPanel.FilesField = this;*/

        imgBarCodePrintLink.DisableUpload = function () {
            this.disabled = true;
        }
        imgBarCodePrintLink.EnableUpload = function () {
            this.disabled = false;
        }
        imgBarCodePrintLink.DisableUpload();

        imgBarCodePrintLink.style.position = 'relative';

        imgBarCodePrintLink.disabled = true;

        this.BarCodePrinterControl = imgBarCodePrintLink;
        lastWidthCellInserted = true;
    }
    //else if (device.tablet() || device.macosx())    //   Для MacOsX и планшетников
     //   imgBarCodePrintLink.style.display = 'none'; //   Скрываем иконку если отсутствует Silverlight


    //mail
    if (this.EnableFilesSending) {
        var tdMailSend = this.TRMainPanel.insertCell(this.TRMainPanel.cells.length);
        this.TDFilesSending = tdMailSend;
        tdMailSend.className = 'files-scan-td';


        var imgSend = window.document.createElement('img');
        var sentToMyEmailTitle = window.TN.TranslateKey('files.titles.sendmail');
        imgSend.title = sentToMyEmailTitle;
        imgSend.src = this.SourceFolder + '/mail.png';
        imgSend.className = 'files-other-icons';
        imgSend.ClientField = this;
        imgSend.onclick = function () {
            this.ClientField.SendFiles();
        }
        tdMailSend.appendChild(imgSend);
        lastWidthCellInserted = true;
    }

    if (!lastWidthCellInserted && this.TRMainPanel != null) {
        //если видны только стандартные ячейки кнопок и нет ячеек со 100% шириной, которая будет ужимать остальные ячейки справа
        //то добавляем пустую ячейку
        var tdEmpty = this.TRMainPanel.insertCell(-1);
        tdEmpty.style.width = '100%';
        tdEmpty.innerHTML = '&nbsp;';
    }

    //если нет ячеек загрузки файлов, то двигаем иконки поля влево
    var userCanViewUploadLinks = false;
    if (this.EditMode && this.CurrentUserCanCreate && (!this.HideUploadButton || this.EnableTemplateUpload))
        userCanViewUploadLinks = true;

    if (!userCanViewUploadLinks)
        FCF_ShiftSysImages_Left_Des1.call(this);

    //files div
    var allFilesContainer = window.document.createElement('div');
    this.DivFiles = allFilesContainer;
    this.DivFiles.className = 'files-allfiles_container';
    this.DivFiles.style.width = this.ControlWidth + 'px';
    this.MainPanel.appendChild(this.DivFiles);
}

function FilesField_DownloadFiles() {

    var i, len = this.FilesByIndex.length;
    var hasFiles = false;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (!fileItem.Deleted) {
            hasFiles = true;
            break;
        }
    }
    if (!hasFiles) {
        alert('Отустствуют файлы для загрузки в архив.');
        return;
    }

    var url = this.ModulePath + '/DownloadFiles.ashx?rnd=' + Math.random();
    var params = '';
    params += '&listID=' + ListForm.ListID;
    params += '&itemID=' + ListForm.ItemID;
    params += '&fieldID=' + this.FieldID;

    url += params;
    location.href = url;
}

/*function BRC_CheckBarCodePrinterPosition(evt) {
    if (evt == null)
        evt = window.event;

    var mouseX = evt.clientX;
    var mouseY = evt.clientY;

    //this - большой див к которому прикреплен обработчик
    //объект поля файлов
    var filesField = this.FilesField;

    var divBarCodePrint = document.getElementById('divBarCodePrint');
    if (divBarCodePrint == null)
        throw new Error('Не удалось получить divBarCodePrint.');

    //картинка печати штрих-кодов
    var imgBarCodePrint = filesField.BarCodePrintImage;

    if (SM.IsOverElement(mouseX, mouseY, imgBarCodePrint)) {
        //если попали над картинкой открываем СЛ-компонент печати.
        var buttonRect = imgBarCodePrint.getBoundingClientRect();
        //SM.WriteLog(buttonRect.top + ':' + buttonRect.left);
        divBarCodePrint.style.top = buttonRect.top + SM.GetScrollTop() + 1 + 'px';
        divBarCodePrint.style.left = buttonRect.left + SM.GetScrollLeft() + 'px';
        divBarCodePrint.style.width = '16px';
        divBarCodePrint.style.height = '15px';

        divBarCodePrint.FieldID = filesField.FieldID;
    }
    else {
        divBarCodePrint.style.top = '0px';
        divBarCodePrint.style.left = '0px';
        divBarCodePrint.style.width = '0px';
        divBarCodePrint.style.height = '0px';
    }
}

function BRC_ChangeCoords(evt, imgBarCodePrint) {
    var divBarCodePrint = document.getElementById('divBarCodePrint');
    var mouseX = evt.clientX;
    var mouseY = evt.clientY;

    if (!SM.IsOverElement(mouseX, mouseY, imgBarCodePrint)) {
        divBarCodePrint.style.top = 0 + 'px';
        divBarCodePrint.style.left = 0 + 'px';
    }

}

function WriteLog(mes) {
    window.SM.WriteLog(mes);
}
function BRC_GetBase64Image() {
    var containerST = document.getElementById('divBarCodePrint');
    var fieldID = containerST.FieldID;
    var xmlRequest = SM.GetXmlRequest();

    var url = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/Client/BarCodePrint/GetBarCodeImage.ashx?';
    url = url + 'itemID=' + this.ListForm.ItemID;
    url += '&webID=' + this.ListForm.WebID;
    url += '&listid=' + this.ListForm.ListID;
    url += '&fieldID=' + fieldID + '&rand=' + Math.random();

    xmlRequest.open('GET', url, false);
    xmlRequest.send(null);

    var responseText = xmlRequest.responseText;

    if (SM.IsNE(responseText))
        throw new Error('Отсутсвует результат операции генерации изображения штрих-кода в параметре responseText.');

    var result = JSON.parse(responseText);

    if (result == null)
        throw new Error('Не удалось получить объект результата генерации изображения штрих-кода');

    if (result.Exception != null) {
        alert(result.Exception.DisplayText);
        if (SM.IsNE(result.Value))
            return;
    }
    var imageBase64 = result.Value;

    return imageBase64;
}

*/
function FCF_ResetLayout_Des1() {
    var i, len = this.FilesByIndex.length;
    var controlWidth = this.ControlWidth;
    if (controlWidth == null)
        controlWidth = 0;

    if (controlWidth == 0)
        controlWidth = 140;

    var nameMaxWidth = 0;
    var fileMaxWidth = 0;

    var maxFileWidth = 0;

    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
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
        var fileItem = this.FilesByIndex[i];
        if (fileItem.Deleted || fileItem.DivFileProperties == null)
            continue;

        if (isDefWidth)
            fileItem.DivFileProperties.style.width = '30px';
        else
            fileItem.DivFileProperties.style.width = specifiedWidth + 'px';

        fileItem.LinkContainer.style.width = (specifiedWidth - 16) + 'px';
        //if (i == len - 1)
        fileItem.FileDiv.style.width = controlWidth + 'px';
    }
}

function FCF_CheckFilesVisibility_Des1() {
    if (this.FilesCount > 0)
        this.DivFiles.style.display = '';
    else
        this.DivFiles.style.display = 'none';
}

function FCF_InitFiles_Des1() {
    var fileNodes = this.DataFilesElement.selectNodes('FilesValue');
    var i, len = fileNodes.length;
    this.FilesByIndex = new Array();
    this.FilesByName = new Array();

    for (i = 0; i < len; i++) {
        //break;

        var fileNode = fileNodes[i];
        var fileName = GetAttributeValue(fileNode, 'FileName');
        var file = this.AddFile(fileName);
        file.Existing = true;
        file.XmlElement = fileNode;
        file.SetProperties(fileNode);
        file.CanView = true;
        if (file.CanView) {
            file.CreateContainer(true, true);
            file.InitSignatures();
        }

        if (this.TableMainPanel == null && i == 0 && !this.EnableFilesSending && !this.EnableBarCodePrint) {
            if (file.FileDiv != null) {
                var border = file.FileDiv.firstChild;
                if (border != null)
                    border.style.display = 'none';
            }
        }
    }


    //текст если файлов нет
    if (len == 0) {
        //if ((!this.EditMode || !this.CurrentUserCanCreate) && len == 0) {
        this.EmptyDiv = window.document.createElement('div');
        this.EmptyDiv.className = 'files-emptyfiles_div';
        this.DivFiles.appendChild(this.EmptyDiv);
        var emptyValueTitle = window.TN.TranslateKey('files.titles.emptyvalue');
        $(this.EmptyDiv).text(emptyValueTitle);

        if (this.CurrentUserCanCreate && this.EditMode)
            FCF_HideElement(this.EmptyDiv);
    }
    //выставить ширину дива с файлами.
    this.ResetLayout();
    this.PanelContainer.appendChild(this.MainPanel);
}

function FCI_IsNullOrWhiteSpaces(str) {
    if (SM.IsNE(str))
        return true;

    var i, len = str.length;
    var emptyString = true;
    for (i = 0; i < len; i++) {
        var char = str.charAt(i);
        //проверка на "невидимый символ"
        if (char != ' ' && char != '\r' && char != '\n' && char != '\t') {
            emptyString = false;
            break
        }
    }

    return emptyString;
}

function FCI_ChangeCommentMode_Des1(isEditMode) {
    if (isEditMode) {
        if (this.DivComment == null) {
            this.DivComment = window.document.createElement('div');
            this.DivComment.className = 'files-commentContainer';
            var styles = {};
            //styles.width = this.ClientField.ContainerMaxWidth;
            var controlWidth = this.ClientField.ControlWidth;
            if (this.ClientField.ContainerMaxWidth > controlWidth)
                controlWidth = this.ClientField.ContainerMaxWidth;
            controlWidth = controlWidth + 17 - 3; //

            //            styles.width = (controlWidth) + 'px';
            styles.width = (this.FileDiv.offsetWidth) + 'px';
            styles.maxHeight = '3600px';
            styles.color = '#515459';

            var raOptions = {
                Container: this.DivComment,
                Templates: null,
                TemplateSeparator: null,
                Styles: styles,
                IsBlue: true,
                NoRounded: true,
                Rows: 1
            };

            var commentControl = new ResizableAreaControl(raOptions);
            //var commentControl = new ResizableArea(this.DivComment, styles, true, true);
            this.FileDiv.appendChild(this.DivComment);

            commentControl.TextArea.FileItem = this;
            this.CommentControl = commentControl;
            this.TextArea = commentControl.TextArea;

            //commentControl.InitControl();
            this.TextArea.FileItem = this;
            $(commentControl.TextArea).focusout(function (ev) {
                SaveFileComment(ev);
                window.SM.ResetFormLayout();
                var fi = this.FileItem;

                window.LastFocusoutID = window.setTimeout(function () {
                    fi.ChangeCommentMode(false);
                    window.clearTimeout(window.LastFocusoutID);
                }, 150);
            });
        }

        this.DivComment.style.display = '';
        if (this.DivCommentText != null)
            this.DivCommentText.style.display = 'none';

        if (this.DivCommentLink != null)
            this.DivCommentLink.style.display = 'none';

        var fComment = this.XmlElement.getAttribute('Comment');
        if (!window.SM.IsNE(fComment))
            $(this.TextArea).val(fComment);
        if (!this.CommentControlInited) {
            this.CommentControlInited = true;
            this.CommentControl.InitControl();
        }
        this.TextArea.focus();
    }
    else {
        //текст комментария
        if (this.DivCommentText == null) {
            var divComment = window.document.createElement('div');
            divComment.className = 'files-divComment';
            this.FileDiv.appendChild(divComment);

            var divCommentElement = window.document.createElement('div');
            divCommentElement.className = 'files-spanComment';
            this.DivCommentElement.style.width = this.ClientField.DivFiles.offsetWidth + 'px';
            this.DivCommentElement = divCommentElement;
            this.DivCommentElement.FileItem = this;
            divComment.appendChild(divCommentElement);

            $(this.DivCommentElement).text(this.Comment);
            this.DivCommentElement.style.cursor = 'pointer';
            this.DivCommentElement.FileItem = this;
            this.DivCommentElement.onclick = function () {
                if (this.Disabled)
                    return;

                this.FileItem.ChangeCommentMode(true);
            }

            this.DivCommentText = divComment;
        }

        if (this.DivComment != null)
            this.DivComment.style.display = 'none';


        var fComment = this.XmlElement.getAttribute('Comment');
        //проверка на значение состоящее только из пробелов либо символов переносов строк (невидимых символов).
        //если значение состоит только из невидимых символов, отоборажаем ссылку "Комментарий".
        var isEmptyContent = FCI_IsNullOrWhiteSpaces(fComment);;
        if (!isEmptyContent && !window.SM.IsNE(fComment)) {
            $(this.DivCommentElement).text(fComment.replace(/\r\n/g, ' '));
            this.DivCommentText.style.display = '';
        }
        else {
            //ссылка
            if (this.ClientField.EditMode) {
                if (this.DivCommentLink == null) {
                    var divCommentLink = window.document.createElement('div');
                    divCommentLink.className = 'files-divCommentLink';
                    this.DivFileName.appendChild(divCommentLink);
                    var commentTitle = window.TN.TranslateKey('files.titles.comment');
                    $(divCommentLink).text(commentTitle);
                    divCommentLink.FileItem = this;
                    this.DivCommentLink = divCommentLink;
                    divCommentLink.onclick = function () {
                        this.FileItem.ChangeCommentMode(true);
                    }
                }

                this.DivCommentLink.style.display = '';
            }

            this.DivCommentText.style.display = 'none';

            if (this.DivCommentLink != null)
                this.DivCommentLink.style.display = '';
        }

        this.ClientField.ResetLayout();
    }

    window.SM.ResetFormLayout();
}

function FCI_CreateContainer_Des1(uploadEnabled, serverRow) {
    var divFileContainer = window.document.createElement('div');
    //this.ServerRow = serverRow;
    this.FileDiv = divFileContainer;
    this.FileDiv.className = 'files-filecontainer';

    var divBorder = window.document.createElement('div');
    divBorder.className = 'files-topBorderDiv'
    this.FileDiv.appendChild(divBorder);

    var divFileProp = window.document.createElement('div');
    this.DivFileProperties = divFileProp;
    divFileProp.className = 'files-filePropDiv';
    var divFileImages = window.document.createElement('div');
    divFileImages.className = 'files-fileImgDiv';
    this.DivFileImages = divFileImages;
    var imagesCount = 0;

    this.FileDiv.appendChild(divFileProp);
    this.FileDiv.appendChild(divFileImages);

    //div с названием файла и комментом (ссылка)
    var divFileName = window.document.createElement('div');
    this.DivFileName = divFileName;
    divFileProp.appendChild(divFileName);

    //div с названием файла
    divFileName.className = 'files-fileAndCommentDiv';

    var fileUrl = '#', linkIcon = window.document.createElement('a');
    divFileName.appendChild(linkIcon);

    if (!window.SM.IsNE(this.FileUrl)) {
        fileUrl = this.ClientField.HostUrl + this.FileUrl;
        if (this.ClientField.ReplaceHttpsByHttp) {
            var rgHttps = /(https:)/g;
            fileUrl = this.ClientField.HostUrl.toLowerCase().replace(rgHttps, 'http:') + this.FileUrl;
        }
    }
    linkIcon.onclick = function () { return OnFileLinkClick(this); }
    linkIcon.href = !this.ClientField.HasFileDeny ? fileUrl : 'javascript:';

    this.LinkIcon = linkIcon;
    linkIcon.FileItem = this;
    var imgIcon = window.document.createElement('img');
    imgIcon.className = 'files-fileImgIcon';
    linkIcon.className = 'files-fileImgLinkIcon';
    linkIcon.appendChild(imgIcon);
    imgIcon.src = GetIconUrl(this.FileName);
    this.ImageIcon = imgIcon;


    var linkFile = window.document.createElement('a');
    linkFile.className = 'files-link-new';
    this.LinkContainer = window.document.createElement('div');
    this.LinkContainer.className = 'files-link-container';
    divFileName.appendChild(this.LinkContainer);
    this.LinkContainer.appendChild(linkFile);

    linkFile.onclick = function () { return OnFileLinkClick(this); }
    //linkFile.onclick = function () { document.execCommand('SaveAs', null, encodeURI(fileUrl)); alert(fileUrl); }

    //if (!device.android()) {
    //   // 
    //    alert('ok')
    //}
    //else {

    //    alert('okk')
    //}

    //  Возвращаем название файла ссылки в исходный регистр
    var fileNameToLower = this.FileName.toLowerCase();
    if (fileNameToLower != this.FileName)
        fileUrl = fileUrl.replace(fileNameToLower, this.FileName);

    var linkSpan = window.document.createElement('span');
    linkSpan.className = 'files-filespan';
    $(linkSpan).text(this.FileName);
    this.LinkSpan = linkSpan;
    linkFile.appendChild(linkSpan);
    linkFile.href = !this.ClientField.HasFileDeny ? fileUrl : 'javascript:';
    this.LinkFile = linkFile;
    linkFile.FileItem = this;

    //comment
    if (this.DivCommentText == null) {
        var divComment = window.document.createElement('div');
        divComment.className = 'files-divComment';
        this.FileDiv.appendChild(divComment);

        var divCommentElement = window.document.createElement('div');
        divCommentElement.className = 'files-spanComment';
        this.DivCommentElement = divCommentElement;

        this.DivCommentElement.style.width = this.ClientField.ControlWidth + 'px';
        $(this.DivCommentElement).text(this.Comment);
        this.DivCommentElement.FileItem = this;
        divComment.appendChild(divCommentElement);

        if (this.ClientField.EditMode && this.CanEdit) {
            divCommentElement.style.cursor = 'pointer';
            divCommentElement.onclick = function () {
                if (this.Disabled)
                    return;

                this.FileItem.ChangeCommentMode(true);
            }
        }

        this.DivCommentText = divComment;
        if (window.SM.IsNE(this.Comment))
            this.DivCommentText.style.display = 'none';
    }

    var isEmptyContent = FCI_IsNullOrWhiteSpaces(this.Comment);
    if (!isEmptyContent && !window.SM.IsNE(this.Comment)) {
        $(this.DivCommentElement).text(this.Comment.replace(/\r\n/g, ' '));
        this.DivCommentText.style.display = '';
    }
    else {
        if (this.CanEdit) {
            if (this.ClientField.EditMode && this.DivCommentLink == null) {
                var divCommentLink = window.document.createElement('div');
                divCommentLink.className = 'files-divCommentLink';
                divFileName.appendChild(divCommentLink);
                var commentTitle = window.TN.TranslateKey('files.titles.comment');
                $(divCommentLink).text(commentTitle);
                var tmpFileItem = this;
                this.DivCommentLink = divCommentLink;
                divCommentLink.onclick = function () {
                    tmpFileItem.ChangeCommentMode(true);
                }
            }
        }
    }


    //images
    //delete img
    if (this.ClientField.EditMode && this.CanDelete) {
        var delImg = window.document.createElement('img')
        delImg.src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/Images/deletend.png';
        var deleteFileTitle = window.TN.TranslateKey('files.titles.deletefile');
        delImg.title = deleteFileTitle;
        delImg.onclick = function () { OnFileDeleteClick(this); }
        delImg.className = 'files-fileImages';
        this.ImageDelete = delImg;
        this.ImageDelete.FileItem = this;
        divFileImages.appendChild(this.ImageDelete);
        imagesCount++;
    }

    //upload
    var canUpload = this.ClientField.EditMode && this.CanEdit && (this.CanDelete || this.ClientField.EnableOverwriteWithoutDeleteAccess);
    if (canUpload) {
        var imgFileUpload = window.document.createElement('img');
        imgFileUpload.src = this.ClientField.SourceFolder + '/attach.png';
        var overrideThisFileTitle = window.TN.TranslateKey('files.titles.loadoverride');
        imgFileUpload.title = overrideThisFileTitle;
        imgFileUpload.className = 'files-fileImages';
        divFileImages.appendChild(imgFileUpload);
        imagesCount++;

        var imgUploading = window.document.createElement('img');
        imgUploading.className = 'files-other-icons';
        imgUploading.src = this.ClientField.SourceFolder + '/upload.gif';
        this.ImageUploading = imgUploading;
        this.ImageUploading.FileItem = this;
        this.ImageUploading.style.display = 'none';
        divFileImages.appendChild(this.ImageUploading);

        imgFileUpload.DisableUpload = function () { imgFileUpload.disabled = true; }
        imgFileUpload.EnableUpload = function () { imgFileUpload.disabled = false; }
        var fileIndex = this.FileIndex;
        var thisObj = this;
        if (!window.FilesForm.UseHttpUpload) {
            imgFileUpload.onclick = function () {
                window.FilesForm.UploadControl.OpenSingleFileDialog(thisObj.ClientField.FieldTitle, fileIndex);
            }
        }
        else {
            window.AddFileUploadTrigger({
                Trigger: imgFileUpload,
                TriggerActivator: divFileImages,
                IsMultiple: false,
                OnSelectFiles: function (uploadControl) { thisObj.ClientField.OnSelectFiles(uploadControl, false, fileIndex); },
                OnUpload: function (uploadControl, responseText) { thisObj.ClientField.OnUpload(uploadControl, responseText, false); }
            });
        }
        //imgFileUpload.DisableUpload();
        this.UploadControl = imgFileUpload;
    }

    //versions
    if (this.ClientField.FileVersionsEnabled) {

        var versionImg = window.document.createElement('img');
        versionImg.src = '/_layouts/images/versions.gif';
        var versionsJournalTitle = window.TN.TranslateKey('files.titles.versionsjournal');
        versionImg.title = versionsJournalTitle;
        versionImg.className = 'files-fileImages';
        versionImg.onclick = function (ev) {
            OnFileVersionsClick(this, 'v2');
        }
        this.ImageVersions = versionImg;
        divFileImages.appendChild(versionImg);
        imagesCount++;
        this.ImageVersions.FileItem = this;
    }


    //preview
    this.PreviewEnable = false;
    if (!window.SM.IsNE(this.FileName)) {
        var len = this.FileName.length;
        var fName = this.FileName.toLowerCase();

        var lastDotIndex = fName.lastIndexOf('.');
        var previewExstensions = '|doc|docx|docm|xls|xlsx|xlsm|pdf|png|jpg|tif|tiff|gif|bmp|ppt|pptx|vsd|vsdx|mpp||';
        if (lastDotIndex > 0 && fName.length > lastDotIndex) {
            var extesion = fName.substr(lastDotIndex + 1);
            this.PreviewEnable = previewExstensions.indexOf('|' + extesion + '|') != -1;
        }

        // Максимов К. - создание кнопки превью.
        if (this.PreviewEnable && this.FileItemID != null && this.ClientField.EnablePreview) {
            if (this.PreviewPagesCount > 0) {
                var self = this;
                var previewImg = window.document.createElement('img');
                previewImg.IsPreviewIcon = true;
                previewImg.className = 'files-fileImages';
                previewImg.src = self.ClientField.SourceFolder + '/arrow_medium_right.png';
                previewImg.FileItem = self;
                previewImg.onclick = function () {
                    ShowFilePreview(self.FileWebID, self.FileListID, self.FileItemID, this);
                }

                divFileImages.appendChild(previewImg);
                imagesCount++;
            }
        }
    }

    //scan
    if (canUpload && this.ClientField.EnableScan) {
        var scanImg = window.document.createElement('img');
        var addScanPageTitle = window.TN.TranslateKey('files.titles.addscanpage');
        scanImg.title = addScanPageTitle;
        scanImg.className = 'files-fileImages';

        if (this.IsPdf) {
            scanImg.src = this.ClientField.SourceFolder + '/addPdfPage.png';
            scanImg.onclick = function () {
                OnAddPdfPageClick(this);
            }

            this.ImageAddPdfPage = scanImg;
            this.ImageAddPdfPage.FileItem = this;
            divFileImages.appendChild(scanImg);
            imagesCount++;
        }
    }



    if (imagesCount > 3)
        imagesCount = 3;
    this.ImagesCount = imagesCount;

    if (!serverRow)
        this.ClientField.ResetLayout();

    this.ClientField.DivFiles.appendChild(divFileContainer);
}

function DisableMultiUploadControl_Des1(clientField) {
    if (clientField.UploadControl != null)
        clientField.UploadControl.DisableUpload();

    if (clientField.UploadImgLink != null)
        clientField.UploadImgLink.DisableUpload();

    if (clientField.UploadLink != null)
        clientField.UploadLink.DisableUpload();

    if (clientField.TemplateUploadImgLink != null)
        clientField.TemplateUploadImgLink.DisableUpload();

    if (clientField.TemplateUploadLink != null)
        clientField.TemplateUploadLink.DisableUpload();

    if (clientField.ScanUploadControl != null)
        clientField.ScanUploadControl.DisableUpload();
}

function EnableMultiUploadControl_Des1(clientField) {
    if (clientField.UploadControl != null)
        clientField.UploadControl.EnableUpload();

    if (clientField.UploadImgLink != null)
        clientField.UploadImgLink.EnableUpload();

    if (clientField.UploadLink != null)
        clientField.UploadLink.EnableUpload();

    if (clientField.TemplateUploadImgLink != null)
        clientField.TemplateUploadImgLink.EnableUpload();

    if (clientField.TemplateUploadLink != null)
        clientField.TemplateUploadLink.EnableUpload();

    if (clientField.ScanUploadControl != null)
        clientField.ScanUploadControl.EnableUpload();
}

function FCI_ShowUploading_Des1() {
    var images = this.DivFileImages.children;
    var i, len = images.length;
    var previewImg = null;

    for (i = 0; i < len; i++) {
        var img = images[i];

        if (img.IsPreviewIcon)
            previewImg = img;

        img.style.display = 'none';
    }

    if (previewImg != null) {
        //если иконка превью, то вырезаем ее после загрузки файла
        this.DivFileImages.removeChild(img);
    }


    this.ImageUploading.style.display = '';

    if (this.ImageDelete != null) {
        this.ImageDelete.src = '/_layouts/images/deletegray.gif';
        this.ImageDelete.style.cursor = 'default';
    }
    /*
    this.TextComment.disabled = true;
    */
    this.LinkFile.className = 'files-link-uploading-new';
    this.LinkIcon.className = 'files-link-uploading-new';
    if (this.ImageVersions != null)
        this.ImageVersions.style.cursor = 'default';

    if (this.DivCommentLink != null)
        this.DivCommentLink.style.display = 'none';

    this.IsUploading = true;

}

function FCI_HideUploading_Des1() {
    var images = this.DivFileImages.children;
    var i, len = images.length;
    for (i = 0; i < len; i++) {
        var img = images[i];
        img.style.display = '';
    }

    this.ImageUploading.style.display = 'none';
    if (this.ImageDelete != null) {
        //this.ImageDelete.src = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/ListControl/Images/clearValue.png';
        this.ImageDelete.src = '/_layouts/WSS/WSSC.V4.SYS.Fields.Files/Images/deletend.png';
        this.ImageDelete.style.cursor = 'pointer';
    }
    /*
    this.TextComment.disabled = false;
    */
    this.LinkFile.className = 'files-link-new';
    this.LinkIcon.className = 'files-linkpic-new';
    if (this.ImageVersions != null)
        this.ImageVersions.style.cursor = 'pointer';

    this.SetDisplayProperties(this.FileName, this.FileUrl, this.IconUrl);
    this.IsUploading = false;

    if (this.DivCommentLink != null) {
        if (this.DivCommentElement != null && this.DivCommentElement.style.dispay != 'none'
        && !window.SM.IsNE($(this.DivCommentElement).text()))
            ;
        else
            this.DivCommentLink.style.display = '';
    }

    this.ClientField.ResetLayout();
    window.SM.ResetFormLayout();
}

function FCI_Delete_Des1() {
    this.Deleted = true;
    if (this.XmlElement != null) {
        this.ClientField.DataFilesElement.removeChild(this.XmlElement);
        this.ClientField.PersistData();
        this.XmlElement = null;
    }

    this.FileDiv.style.display = 'none';
    this.ClientField.FilesByName[this.FileName.toLowerCase()] = null;
    this.ClientField.ResetRowAlternating();
    if (this.ClientField.ListFormField != null)
        this.ClientField.ListFormField.OnChange(this);
    this.ClientField.FilesCount--;
    this.ClientField.CheckFilesVisibility();
    this.ClientField.ResetLayout();
}

function FCI_SetDisplayProperties_Des1(fileName, fileUrl, iconUrl) {
    var linkSpan = this.LinkFile.firstChild;
    if (linkSpan == null)
        linkSpan = window.document.createElement('span');
    linkSpan.className = 'files-filespan';
    $(linkSpan).text(fileName);
    this.LinkSpan = linkSpan;
    this.LinkFile.appendChild(linkSpan);
    this.ImageIcon.src = GetIconUrl(fileName);

    var fullUrl = '#';
    if (!window.SM.IsNE(fileUrl)) {
        var fullUrl = this.ClientField.HostUrl + fileUrl;
        if (this.ClientField.ReplaceHttpsByHttp) {
            var rgHttps = /(https:)/g;
            fileUrl = this.ClientField.HostUrl.toLowerCase().replace(rgHttps, 'http:') + this.FileUrl;
        }
    }
    this.LinkFile.href = !this.ClientField.HasFileDeny ? fullUrl : 'javascript:';
    this.LinkIcon.href = !this.ClientField.HasFileDeny ? fullUrl : 'javascript:';
}

function FCI_Disable_Des1() {
    FCF_HideElement(this.ImageDelete);
    FCF_HideElement(this.UploadControl);
    FCF_HideElement(this.ImageAddPdfPage);
    FCF_HideElement(this.DivCommentLink);

    if (this.DivCommentElement != null) {
        this.DivCommentElement.Disabled = true;
        this.DivCommentElement.style.cursor = 'normal';
    }

    this.Disabled = true;
}

function FCI_Enable_Des1() {
    FCF_ShowElement(this.ImageDelete);
    FCF_ShowElement(this.UploadControl);
    FCF_ShowElement(this.ImageAddPdfPage);
    FCF_ShowElement(this.DivCommentLink);

    if (this.DivCommentElement != null) {
        this.DivCommentElement.Disabled = false;
        this.DivCommentElement.style.cursor = 'pointer';
    }

    this.Disabled = false;
}

function FCF_HideElement(element) {
    if (element != null)
        element.style.display = 'none';
}

function FCF_ShowElement(element) {
    if (element != null)
        element.style.display = '';
}

function FCF_ShiftSysImages_Left_Des1() {
    var tdNode = null;
    if (this.TDFilesSending != null)
        tdNode = this.TDFilesSending;
    else if (this.TDBarCodePrint != null)
        tdNode = this.TDBarCodePrint;
    else if (this.TDDownload != null)
        tdNode = this.TDDownload;
    else if (this.TDScanUpload != null)
        tdNode = this.TDScanUpload;

    if (tdNode == null)
        return;

    if (this.TDFilesSending != null) {
        this.TDFilesSending.style.width = '1px';
        this.TDFilesSending.style.textAlign = 'left';
    }
    if (this.TDBarCodePrint != null) {
        this.TDBarCodePrint.style.width = '1px';
        this.TDBarCodePrint.style.textAlign = 'left';
    }
    if (this.TDDownload != null) {
        this.TDDownload.style.width = '1px';
        this.TDDownload.style.textAlign = 'left';
    }
    if (this.TDScanUpload != null) {
        this.TDScanUpload.style.width = '1px';
        this.TDScanUpload.style.textAlign = 'left';
    }

    var row = tdNode.parentElement;
    if (row == null)
        return;

    //добавляем последнюю ячейку для ужатия текущих.
    if (this.LastWidthCell == null) {
        this.LastWidthCell = row.insertCell();
        SM.SetInnerText(this.LastWidthCell, ' ');
        this.LastWidthCell.style.width = '100%';
    }
    else
        this.LastWidthCell.style.display = '';
}

function FCF_ShiftSysImages_Right_Des1() {
    if (this.TDFilesSending != null) {
        this.TDFilesSending.style.width = '100%';
        this.TDFilesSending.style.textAlign = 'right';
    }
    if (this.TDBarCodePrint != null) {
        this.TDBarCodePrint.style.width = '100%';
        this.TDBarCodePrint.style.textAlign = 'right';
    }
    if (this.TDDownload != null) {
        this.TDDownload.style.width = '100%';
        this.TDDownload.style.textAlign = 'right';
    }
    if (this.TDScanUpload != null) {
        this.TDScanUpload.style.width = '100%';
        this.TDScanUpload.style.textAlign = 'right';
    }

    if (this.LastWidthCell != null)
        this.LastWidthCell.style.display = 'none';
}

function FCF_Disable_Des1() {
    FCF_HideElement(this.TDImgUploadFiles);
    FCF_HideElement(this.TDUploadFiles);
    FCF_HideElement(this.TDImgTemplateUpload);
    FCF_HideElement(this.TDTemplateUpload);
    FCF_HideElement(this.TDScanUpload);

    FCF_ShiftSysImages_Left_Des1.call(this);

    var i, len = this.FilesByIndex.length;
    if (len == 0)
        FCF_ShowElement(this.EmptyDiv);

    var first = true;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (fileItem != null) {
            if (!fileItem.Deleted && fileItem.CanView) {
                fileItem.Disable();

                //скрываем бордер от первого файла
                if (first && !this.EnableFilesSending && !this.EnableBarCodePrint) {
                    first = false;

                    var border = fileItem.FileDiv.firstChild;
                    if (border != null)
                        border.style.display = 'none';
                }
            }
        }
    }
}

function FCF_Enable_Des1() {
    //if (this.TableMainPanel != null)
    //this.TableMainPanel.style.display = '';

    FCF_ShowElement(this.TDImgUploadFiles);
    FCF_ShowElement(this.TDUploadFiles);
    FCF_ShowElement(this.TDImgTemplateUpload);
    FCF_ShowElement(this.TDTemplateUpload);
    FCF_ShowElement(this.TDScanUpload);

    FCF_ShiftSysImages_Right_Des1.call(this);

    var i, len = this.FilesByIndex.length;
    if (len == 0)
        FCF_HideElement(this.EmptyDiv);

    var first = true;
    for (i = 0; i < len; i++) {
        var fileItem = this.FilesByIndex[i];
        if (fileItem != null) {
            if (!fileItem.Deleted && fileItem.CanView)
                fileItem.Enable();

            //открываем бордер от первого файла
            if (first && !this.EnableFilesSending && !this.EnableBarCodePrint) {
                first = false;

                var border = fileItem.FileDiv.firstChild;
                if (border != null)
                    border.style.display = '';
            }
        }
    }
}