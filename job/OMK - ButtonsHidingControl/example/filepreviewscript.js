var WSSC_FilePreviewDiv = "WSSC_FilePreviewDiv";
var WSSC_FilePreviewArrow = "WSSC_FilePreviewArrow";
var WSSC_ShowFilePreview = true;
var WSSC_DefaultWebUrl = "/_layouts/WSS/WSSC.V4.SYS.Fields.Files";
var documentElement = window.document;
var windowElement = window;
var frameElement = null;
window.WSSC_InitPreviewHandlers = new Array();
window.WSSC_InitPreviewHandlers.AddHandler = function (handler) { WSSC_InitPreviewHandlers.push(handler); };

//Определение где открывается превью во фрейме или просто в окне.
try {
    frameElement = window.frameElement;
}
catch (e) {
}
if (frameElement != null) {
    documentElement = window.parent.document;
    windowElement = window.parent;
}
//Определение используется ли доктайп
var DCT = (documentElement.compatMode == 'CSS1Compat');
var body = documentElement.body;
if (DCT) {
    body = documentElement.documentElement;
}

//Основная функция создания и/или отрисовки превью.
function ShowFilePreview(FileWebID, FileListID, FileItemID, element, showFileLink, checkAccess, siteID, itemID, listID, fileFields) {
    // Получение объекта превью.
    var previewDBObject = GetFilePreviewDBObject(FileWebID, FileListID, FileItemID, siteID);
    // Отображение превью по полученному объекту
    if (previewDBObject != null)
        ShowFilePreviewGuid(previewDBObject, element, showFileLink, checkAccess, siteID, itemID, listID, fileFields);
}
// Отображение превью
function ShowFilePreviewGuid(previewDBObject, parentNode, showFileLink, checkAccess, siteID, itemID, listID, fileFields) {
    var _checkAccess = checkAccess;
    if (_checkAccess == undefined)
        _checkAccess = true;
    if (window.FilePreview == null) {
        // Создание превью и инициализация контролов.
        window.FilePreview = CreateNewFilePreview(parentNode, showFileLink, previewDBObject.CreateFileLink);
        FilePreview.CreatePreviewControls();
    }
    else {
        // Установка стандартной иконки превью в карточке
        if (FilePreview.CanChangeParentSrc)
            FilePreview.parent.src = WSSC_DefaultWebUrl + "/arrow_medium_right.png?rnd=" + Math.random();
    }
    // Открытие превью.
    FilePreview.ShowNewFile(previewDBObject, parentNode, showFileLink, _checkAccess, siteID, itemID, listID, fileFields);
    SM.FireEvent(parentNode, 'OnFilePreviewOpened', FilePreview);
}

function ShowNewFile(previewDBObject, parentNode, showFileLink, checkAccess, siteID, itemID, listID, fileFields) {
    this.showFileLink = showFileLink;
    this.CanChangeParentSrc = false;
    this.FileFields = fileFields;
    this.checkAccess = checkAccess;

    if (listID != null)
        this.ListID = listID;
    else
        this.ListID = previewDBObject.ListID;

    if (itemID != null)
        this.ItemID = itemID;
    else
        this.ItemID = previewDBObject.ItemID;

    this.parent = parentNode;
    if ((this.outerDiv.style.display == "") && (this.guid == previewDBObject.Guid)) {
        // Если кликнули на иконку открытия превью повторно.
        this.Hide();
        return;
    }
    if (this.parent.src != null) {
        if (this.parent.src.indexOf("arrow_medium_right.png") >= 0) {
            this.CanChangeParentSrc = true;
        }
    }
    // Передача значений объекта параметра в созданый объект превью.
    this.guid = previewDBObject.Guid;
    this.name = previewDBObject.Name;
    this.enableFooterText = previewDBObject.EnableFooterText;
    this.fileUrl = previewDBObject.Url;
    this.align = previewDBObject.Align;
    this.fileAccess = previewDBObject.HasAccess.toString().toLowerCase() == 'true';
    if (!checkAccess) {
        this.fileAccess = true;
    }
    //this.fileParentUrl = previewDBObject.selectSingleNode('PreviewData/FileParentWeb').text;
    var previewPageCount = parseInt(previewDBObject.PreviewPageCount);
    this.pageCountTotal = parseInt(previewDBObject.PageCount);
    if (previewPageCount < this.pageCountTotal)
        this.pageCountLimit = previewPageCount;
    else {
        this.pageCountLimit = this.pageCountTotal;
    }
    var src = "";
    var contextSiteUrl = ''
    if (window.Context != null) {
        if (!IsNullOrEmpty(window.Context().ContextSiteUrl))
            contextSiteUrl = window.Context().ContextSiteUrl;
    }
    // Установка пути к aspx странице с превью но с другим GUID открываемого превью файла.
    if (siteID != null) {
        src = WSSC_DefaultWebUrl + "/FilePreview/FilePreviewPage.aspx?guid=" + this.guid + "&contextSiteUrl=" + encodeURI(contextSiteUrl) + "&rnd=" + Math.random() + "&siteID=" + siteID;
        this.SiteID = siteID;
    }
    else
        src = WSSC_DefaultWebUrl + "/FilePreview/FilePreviewPage.aspx?guid=" + this.guid + "&contextSiteUrl=" + encodeURI(contextSiteUrl) + "&rnd=" + Math.random();
    // Отображение нового превью
    this.SetNewFileSource(src);
    for (i = 0; i < this.ShowHandlers.length; i++) {
        if (this.ShowHandlers[i] != null)
            this.ShowHandlers[i](this);
    }

}
// Создание нового превью
function CreateNewFilePreview(parentNode, showFileLink, createFileLink) {
    var preview = new Object();
    preview.CreatePreviewControls = CreatePreviewControls;
    preview.show = true;
    preview.showFileLink = showFileLink;
    preview.CreateFileLink = createFileLink;
    preview.parent = parentNode;
    preview.SetNewFileSource = SetNewFileSource;
    preview.ShowNewFile = ShowNewFile;
    preview.Hide = Hide;
    preview.SetNewPosition = SetNewPosition;
    preview.SetEmptyPage = SetEmptyPage;
    preview.SetPageNumberText = SetPageNumberText;
    preview.page = 1;
    preview.HideHandlers = new Array();
    preview.ShowHandlers = new Array();
    preview.AddShowHandler = function (handler) { preview.ShowHandlers.push(handler); };
    preview.AddHideHandler = function (handler) { preview.HideHandlers.push(handler); };
    for (i = 0; i < window.WSSC_InitPreviewHandlers.length; i++) {
        if (WSSC_InitPreviewHandlers[i] != null)
            WSSC_InitPreviewHandlers[i](preview);
    }
    return preview;
}
// Обновление текста текущего номера страницы.
function SetPageNumberText() {
    FilePreview.textField.innerHTML = window.TN.TranslateKey("files.preview.page") + " " + FilePreview.page + " " + window.TN.TranslateKey("files.preview.from") + " " + this.pageCountTotal;
}
// Установка начального положения открываемого окна превью
function SetNewPosition() {
    this.outerDiv.style.position = "absolute";
    this.outerDiv.style.top = (window.SM.GetScrollTop() + 3) + "px";

    var clientWidth, offsetLeft;
    clientWidth = (self.innerWidth > 0) ? self.innerWidth : body.clientWidth;
    
    if (this.align == 'right') {
        if (WindowHasScrollbarY())
            //this.outerDiv.style.left = (window.SM.GetScrollLeft() + parseInt(body.clientWidth / 2) - 3) + "px";
            //   Поменял body.clientWidth на self.innerWidth, т.к. в мобильных body.clientWidth постоянна при изменении размеров клиентской области, что приводит к сдвигу окна за границу
            offsetLeft = window.SM.GetScrollLeft() + parseInt(clientWidth / 2) - 13;
        else
            //this.outerDiv.style.left = (window.SM.GetScrollLeft() + parseInt(body.clientWidth / 2) - 13) + "px";
            offsetLeft = window.SM.GetScrollLeft() + parseInt(clientWidth / 2) - 23;
    }
    else if (this.align == 'left') {
        if (window.ListForm != null)
            offsetLeft = 10;
        else {
            if (WindowHasScrollbarY())
                offsetLeft = window.SM.GetScrollLeft() + parseInt(clientWidth / 2) - 13;
            else
                offsetLeft = window.SM.GetScrollLeft() + parseInt(clientWidth / 2) - 23;
        }
    }
    
    if (offsetLeft != null) {
        if(offsetLeft >= ($(document).width() - 100))    {
            offsetLeft = 0;
            this.outerDiv.style.margin = 'auto';
            this.outerDiv.style.right = 0 + 'px';
        }

        this.outerDiv.style.left = offsetLeft + "px";
    }
        

    this.outerDiv.style.display = "";
}
//Проверка наличичия вертикального скролбара у окна
function WindowHasScrollbarY() {
    if (window.SM.isIE == true || window.SM.isIE == undefined) {
        if (window.SM.isIE == undefined) {
            if (!window.DCT)
                return true;
            else {
                return false;
            }
        }
        else {
            if (window.SM.GetClientHeight() < documentElement.body.offsetHeight || documentElement.body.currentStyle.overflowY == "visible")
                return false;
            else
                return true;
        }
    }
    else {
        return false;
    }
}


// Создание контролов Превью
function CreatePreviewControls() {
    this.div = CreateMainDiv();
    this.outerDiv = CreateRoundForm();
    AddImage(this);
    AddPageCountText(this);
    AddNameText(this);
    createCloseImg(this);

    //this.outerDiv.ondragenter = function (e) { PreviewTouchStart(e, this); }
    this.outerDiv.ontouchstart = function (e) { PreviewTouchStart(e, this); }
}
// Создание разметки превью с округлыми краями и тенями.
function CreateRoundForm() {
    var roundDiv = documentElement.createElement("div");
    roundDiv.className = 'filterPreview_round_div';
    // roundDiv.onselectstart = function() { return false; };
    documentElement.body.appendChild(roundDiv);

    var topDiv = CreateRoundTopDiv();
    var middleDiv = CreateRoundMiddleDiv();
    var bottomDiv = CreateRoundBottomDiv();

    dragMaster.makeDraggable(roundDiv);

    roundDiv.appendChild(topDiv);
    roundDiv.appendChild(middleDiv);
    roundDiv.appendChild(bottomDiv);

    return roundDiv;
}
// Создание разметки превью с округлыми краями и тенями. Середина
function CreateRoundMiddleDiv() {
    var LeftDiv = documentElement.createElement("div");
    LeftDiv.className = 'middle_left h';
    var RightDiv = documentElement.createElement("div");
    RightDiv.className = 'middle_right h';
    LeftDiv.appendChild(RightDiv);
    RightDiv.appendChild(FilePreview.div);
    return LeftDiv;
}
// Создание разметки превью с округлыми краями и тенями. Низ
function CreateRoundBottomDiv() {
    var botDiv = documentElement.createElement("div");
    botDiv.className = 'bottom_left h';
    var botRight = documentElement.createElement("div");
    botRight.className = 'bottom_right h';
    botDiv.appendChild(botRight);
    var div = documentElement.createElement("div");
    div.className = 'bottom_mid h';
    botRight.appendChild(div);
    return botDiv;
}
// Создание разметки превью с округлыми краями и тенями. Верх
function CreateRoundTopDiv() {
    var topDiv = documentElement.createElement("div");
    topDiv.className = 'top_left h';
    var rightDiv = documentElement.createElement("div");
    rightDiv.className = 'prev_top_right h';
    topDiv.appendChild(rightDiv);
    var div = documentElement.createElement("div");
    div.className = 'top_mid h';
    rightDiv.appendChild(div);
    return topDiv;
}
// Открытие превью с новым изображением.
function SetNewFileSource(src) {
    this.defaultSrc = src;
    this.page = 1;
    //Обновление текста
    var oldSkipValue = this.SkipUpdateFileName;
    this.SkipUpdateFileName = false;
    UpdateFileName(this, 54);
    this.SkipUpdateFileName = oldSkipValue;

    // Установка размеров.
    SetDefaultSizes(this);
    // Загрузка изображения
    this.outerDiv.style.display = "none";
    if (this.pageCountTotal > this.pageCountLimit)
        this.pageCount = this.pageCountLimit;
    else
        this.pageCount = this.pageCountTotal;
    if (this.pageCount > 0) {
        this.mainImg.style.display = "";
        this.mainImg.src = src;
        // Установка положения.
        this.SetNewPosition();
        // Установка текста текущей страницы
        this.SetPageNumberText();
        this.mainImg.parentNode.scrollTop = 0;
    }
    else {
        // Пустое превью
        this.SetEmptyPage();
        this.SetNewPosition();
    }
    // Установка иконки открытого превью в карточке
    if (this.CanChangeParentSrc)
        this.parent.src = WSSC_DefaultWebUrl + "/blue_arrow_medium_right.png?rnd=" + Math.random();
}
// Обновление названия файла превью.
function UpdateFileName(preview, length) {
    if (!preview.SkipUpdateFileName) {
        // Обрезание имени файла.
        var name = preview.name;
        if (preview.name.length > length) {
            var fileNames = name.split('.');
            if (fileNames.length > 1) {
                name = "";
                for (i = 0; i < fileNames.length - 1; i++) {
                    name += fileNames[i];
                    if (i < fileNames.length - 2)
                        name += '.';
                }
                name = name.substring(0, length - 4) + "..." + fileNames[fileNames.length - 1];
            }
            else {
                name = name.substring(0, length - 4);
            }
        }
        
        if (preview.CreateFileLink == false) {
            preview.nameField.innerText = name;
        }
        else {
            //Установка текста с названием файла в контрол.
            preview.nameField.style.display = "";
            preview.nameField.setAttribute("EnableFooterText", preview.enableFooterText);
            preview.nameField.innerHTML = name;
            preview.nameField.title = preview.name;
            preview.nameField.href = preview.fileUrl;
            preview.nameField.style.display = "";
            preview.nameField.setAttribute('FileUrl', preview.fileUrl);
            if (preview.SiteID != null)
                preview.nameField.setAttribute('SiteID', preview.SiteID);
            preview.nameField.onclick = function () { return OnFileClick(preview.nameField, preview.fileAccess); }
        }

        //Установка текста об ограничении числа страниц
        if (preview.PageCountTotal > preview.PageCountLimit)
            preview.PageLimitDiv.innerHTML = window.TN.TranslateKey("files.preview.pageLimitText").replace("{0}", preview.pageCountLimit);
    }
}
// Пустое превью
function SetEmptyPage() {
    this.textField.innerText = "Для данного документа не найдено ни одной страницы превью";
    this.mainImg.style.display = "none";
    this.mainImg.parentNode.style.width = "150px";
    this.mainImg.parentNode.style.height = "35px";
    this.nameField.style.display = "none";
}
// Скрытие превью.
function Hide() {
    FilePreview.outerDiv.style.display = "none";
    FilePreview.mainImg.src = WSSC_DefaultWebUrl + "/Images/Preview/_empty.png";
    if (FilePreview.CanChangeParentSrc)
        FilePreview.parent.src = WSSC_DefaultWebUrl + "/arrow_medium_right.png?rnd=" + Math.random();
    // Выполнение обработчиков на закрытие превью.
    var i, len = FilePreview.HideHandlers.length;
    for (i = 0; i < len; i++) {
        var hideHandler = FilePreview.HideHandlers[i];
        if (hideHandler != null)
            hideHandler(FilePreview);
    }
}

// Получение объекта превью с сервера
function GetFilePreviewDBObject(FileWebID, FileListID, FileItemID, siteID) {
    var url = WSSC_DefaultWebUrl + '/FilePreview/FileGuidPage.aspx?rnd=' + Math.random();
    var params = new String();
    params = params.concat('FileWebID=', FileWebID);
    params = params.concat('&FileListID=', FileListID);
    params = params.concat('&FileItemID=', FileItemID);
    var contextSiteUrl = ''
    if (window.Context != null) {
        if (!IsNullOrEmpty(window.Context().ContextSiteUrl))
            contextSiteUrl = window.Context().ContextSiteUrl;
    }
    params = params.concat('&contextSiteUrl=', contextSiteUrl);
    if (siteID != null)
        params = params.concat('&siteID=', siteID);
    params = encodeURI(params);
    var result = $.ajax({
        url: url,
        data: params,
        async: false,
        dataType: 'text'
    });
    return $.parseJSON(result.responseText);
}

// Создание основного контейнера для превью
function CreateMainDiv() {
    var div = documentElement.createElement("div");
    div.id = WSSC_FilePreviewDiv;
    div.className = "mid";
    var controlsDiv = documentElement.createElement("div");
    div.appendChild(controlsDiv);
    div.controlsDiv = controlsDiv;
    return div;
}
// Создание крестика закрытия превью
function createCloseImg(preview) {
    var closeImg = documentElement.createElement("img");
    closeImg.src = "/_layouts/WSS/WSSC.V4.SYS.UI.Controls/ListControl/Images/clearValue.png?rnd=" + Math.random();
    closeImg.className = "preview_CloseImg";
    preview.div.controlsDiv.appendChild(closeImg);
    closeImg.onclick = preview.Hide;
    preview.closeImg = closeImg;
}

// Создание ссылки с именем файла.
function AddNameText(preview) {
    var field = null;

    if (preview.CreateFileLink == false) {
        var textDiv = documentElement.createElement("div");
        textDiv.className = "pageCountText";
        textDiv.innerText = preview.name;
        field = textDiv;
    }
    else {
        var link = documentElement.createElement("a");
        link.className = "fileLink";
        link.href = preview.fileUrl;
        link.innerText = preview.name;
        link.title = preview.name;
        link.setAttribute('EnableFooterText', preview.enableFooterText);
        link.onclick = function () {
            return OnFileClick(link, preview.fileAccess);
        }
        field = link;
    }

    preview.div.controlsDiv.appendChild(field);
    preview.nameField = field;

}
// Создание дива с номером страницы
function AddPageCountText(preview) {
    var text = documentElement.createElement("div");
    text.className = "pageCountText";
    preview.div.controlsDiv.appendChild(text);
    preview.textField = text;
}
// Создание дива с картинкой превью
function AddImage(preview) {
    var img = documentElement.createElement("img");
    img.className = "mainImage";
    //   img.align = "middle";

    var div = documentElement.createElement("div");
    div.style.overflow = "hidden";
    div.className = "mainImageDiv";
    //div.onmousewheel = imageScroll;
    // Скролл картинки.
    hookEvent(div, "mousewheel", imageScroll);
    preview.div.appendChild(div);
    div.appendChild(img);
    var pageLimitDiv = document.createElement("div");
    pageLimitDiv.className = "pageCountText";
    pageLimitDiv.style.cssFloat = "none";
    pageLimitDiv.style.display = "none";
    pageLimitDiv.style.top = "-20px";
    preview.PageLimitDiv = pageLimitDiv;
    div.appendChild(pageLimitDiv);
    preview.mainImg = img;
}
// Установка размеров превью
function SetDefaultSizes(preview) {
    var divWidth = parseInt(0.5 * body.clientWidth);
    var divHeight = parseInt(0.75 * body.clientHeight);
    var ctrlDivHeight = 35; //   Высота div перечисления страниц и крестика
    preview.outerDiv.style.width = divWidth + "px";

    //preview.outerDiv.style.height = divHeight + "px";
    //preview.div.style.width = divWidth - 20;
    preview.div.controlsDiv.style.height = ctrlDivHeight + "px";
    preview.mainImg.parentNode.style.width = (divWidth - 25) + "px";
    preview.mainImg.parentNode.style.maxHeight = (divHeight - ctrlDivHeight) + "px";
}

function cancelEvent(e) {
    e = e ? e : window.event;
    if (e.stopPropagation)
        e.stopPropagation();
    if (e.preventDefault)
        e.preventDefault();
    e.cancelBubble = true;
    e.cancel = true;
    e.returnValue = false;
    return false;
}
//Хук скрола мышкой
function hookEvent(element, eventName, callback) {
    if (typeof (element) == "string")
        element = document.getElementById(element);
    if (element == null)
        return;
    if (element.addEventListener) {
        if (eventName == 'mousewheel')
            element.addEventListener('DOMMouseScroll', callback, false);
        element.addEventListener(eventName, callback, false);
    }
    else if (element.attachEvent)
        element.attachEvent("on" + eventName, callback);
}
// Прокрутка превью
function imageScroll(e) {
    e = fixEvent(e);
    var scrollDiv = FilePreview.mainImg.parentNode;
    var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40;
    var speed = 10;
    MoveImgInY(wheelData * speed, scrollDiv);
    cancelEvent(e);
}
// Перемещение превью вверх и вниз.
function MoveImgInY(data, scrollDiv) {
    var availScrollDelta = scrollDiv.scrollHeight - scrollDiv.clientHeight - scrollDiv.scrollTop;
    if (data > 0) {
        if (data < scrollDiv.scrollTop) {
            scrollDiv.scrollTop = scrollDiv.scrollTop - data;
        }
        else {
            scrollDiv.scrollTop = 0;
        }
    }
    else {
        if (Math.abs(data) < availScrollDelta) {
            scrollDiv.scrollTop = scrollDiv.scrollTop - data;
        }
        else {
            scrollDiv.scrollTop = scrollDiv.scrollHeight - scrollDiv.clientHeight;
        }
    }
    CheckPageNumber(scrollDiv)
}

// Изменение текста страницы превью
function CheckPageNumber(div) {
    var pageDistance = div.scrollHeight / FilePreview.pageCount;
    var position = div.scrollTop + div.offsetHeight;

    var page = 1;
    if (div.scrollTop > 5)
        page = parseInt((position - 1) / pageDistance) + 1;

    if (page > FilePreview.pageCount)
        page = FilePreview.pageCount;
    if (page != FilePreview.page) {
        FilePreview.page = page;
        FilePreview.SetPageNumberText();
    }
    if (position == div.scrollHeight) {
        if (FilePreview.pageCountTotal > FilePreview.pageCount) {
            FilePreview.PageLimitDiv.innerHTML = window.TN.TranslateKey("files.preview.pageLimitText").replace("{0}", page);
            //FilePreview.PageLimitDiv.innerHTML = "При предварительном просмотре отображается " + page + " первых страниц";
            FilePreview.PageLimitDiv.style.display = "block";
        }
    }
    else {
        if (FilePreview.PageLimitDiv.style.display != "none")
            FilePreview.PageLimitDiv.style.display = "none";
    }
}
//Перетаскивание превью касанием к экрану.
function PreviewTouchMove(e, preview) {
    try {
        e = e || window.event;
        var x = e.pageX || e.clientX;
        var y = e.pageY || e.clientY;

        if (e.touches.length == 1) {
            var touch = e.touches[0];
            var pose = getPosition(preview.outerDiv);
            preview.outerDiv.style.top = y - preview.outerDiv.touchOffset.y + 'px';
            preview.outerDiv.style.left = x - preview.outerDiv.touchOffset.x + 'px';
        }
    }
    catch (er) {
        alert('PreviewTouchMove ' + er);
    }
}
//Начало перетаскивания превью
function PreviewTouchStart(e) {
    //Число точек соприкосновения
    if (e.touches.length == 1) {
        var preview = window.FilePreview;
        var touch = e.touches[0];
        if (preview.outerDiv.touchOffset == null) {
            preview.outerDiv.touchOffset = new Object();
        }
        var pose = getPosition(preview.outerDiv);
        preview.outerDiv.touchOffset.x = touch.pageX - pose.x;
        preview.outerDiv.touchOffset.y = touch.pageY - pose.y;
        //Расчет касания по крестику 
        if ((preview.outerDiv.touchOffset.x > preview.div.offsetLeft + preview.closeImg.offsetLeft - 10) &&
        (preview.outerDiv.touchOffset.y < preview.div.offsetTop + preview.closeImg.offsetTop + preview.closeImg.offsetWidth + 10)) {
            preview.Hide();
            return;
        }
        //Расчет касания по изображению превью
        if ((preview.outerDiv.touchOffset.y > preview.div.controlsDiv.offsetHeight) &&
            (preview.outerDiv.touchOffset.y < preview.div.offsetHeight + preview.div.controlsDiv.offsetHeight - 30) &&
            (preview.outerDiv.touchOffset.x > 30) &&
            (preview.outerDiv.touchOffset.x < preview.div.offsetLeft + preview.div.offsetWidth - 30)) {
            //Если попали в картинку, двигаем картинку
            preview.outerDiv.ontouchmove = function (e) { ImageTouchMove(preview.outerDiv.touchOffset, e.touches[0]); };
        }
        else {
            //Если попали в другое место, двигаем само превью
            preview.outerDiv.ontouchmove = function (e) { PreviewTouchMove(e, preview); };
        }
        //Обнуляем другие функции
        preview.outerDiv.ontouchend = function (e) { PreviewTouchEnd(preview); };
        document.ontouchmove = function () { return false; };
        for (i = 0; i < document.body.childNodes.length; i++) {
            if (document.body.childNodes[i] != preview.outerDiv) {
                document.body.childNodes[i].ontouchstart = function () { return false; };
                document.body.childNodes[i].ontouchend = function () { return false; };
            }
        }
    }
}
//Окончание перетаскивания превью
function PreviewTouchEnd(preview) {
    document.ontouchmove = null;
    for (i = 0; i < document.body.childNodes.length; i++) {
        if (document.body.childNodes[i] != preview.outerDiv) {
            document.body.childNodes[i].ontouchstart = null;
            document.body.childNodes[i].ontouchend = null;
        }
    }
}

// Перемещение превью вправо и влево
function MoveImgInX(data, scrollDiv) {
    var availScrollDelta = scrollDiv.scrollWidth - scrollDiv.clientWidth - scrollDiv.scrollLeft;
    if (data > 0) {
        if (data < scrollDiv.scrollLeft) {
            scrollDiv.scrollLeft = scrollDiv.scrollLeft - data;
        }
        else {
            scrollDiv.scrollLeft = 0;
        }
    }
    else {
        if (Math.abs(data) < availScrollDelta) {
            scrollDiv.scrollLeft = scrollDiv.scrollLeft - data;
        }
        else {
            scrollDiv.scrollLeft = scrollDiv.scrollWidth - scrollDiv.clientWidth;
        }
    }
}
//Передвижение изображения при касании
function ImageTouchMove(offset, e) {
    var div = FilePreview.mainImg.parentNode;
    var mouseNotInPreview = ((offset.x < FilePreview.mainImg.parentNode.offsetLeft) ||
                             (offset.y < FilePreview.mainImg.parentNode.offsetTop) ||
                             (offset.x > FilePreview.mainImg.parentNode.offsetWidth + FilePreview.mainImg.parentNode.offsetLeft) ||
                             (offset.y > FilePreview.mainImg.parentNode.offsetHeight + FilePreview.mainImg.parentNode.offsetTop));
    if (!mouseNotInPreview) {
        var xMove = e.pageX - offset.x - FilePreview.outerDiv.offsetLeft;
        var yMove = e.pageY - offset.y - FilePreview.outerDiv.offsetTop;
        MoveImgInY(yMove, div);
        MoveImgInX(xMove, div);
        offset.x += xMove;
        offset.y += yMove;
    }
}
// Перемещение превью мышкой.
function ImageMouseMove(offset, e) {
    var e = fixEvent(e);
    var div = FilePreview.mainImg.parentNode;
    var mouseNotInPreview = ((offset.x < FilePreview.mainImg.parentNode.offsetLeft) ||
                             (offset.y < FilePreview.mainImg.parentNode.offsetTop) ||
                             (offset.x > FilePreview.mainImg.parentNode.offsetWidth + FilePreview.mainImg.parentNode.offsetLeft) ||
                             (offset.y > FilePreview.mainImg.parentNode.offsetHeight + FilePreview.mainImg.parentNode.offsetTop));
    if (!mouseNotInPreview) {
        var xMove = e.pageX - offset.x - FilePreview.outerDiv.offsetLeft;
        var yMove = e.pageY - offset.y - FilePreview.outerDiv.offsetTop;
        MoveImgInY(yMove, div);
        MoveImgInX(xMove, div);
        offset.x += xMove;
        offset.y += yMove;
    }
}
// Позволяет перемещать превью по странице.
var dragMaster = (function () {
    
    var dragObject
    var mouseOffset
    // получить сдвиг target относительно курсора мыши
    function getMouseOffset(target, e) {
        var docPos = getPosition(target);
        return { x: e.pageX - docPos.x, y: e.pageY - docPos.y }
    }
    // Поднятие мышки
    function mouseUp() {
        dragObject = null;
        // очистить обработчики, т.к перенос закончен
        documentElement.onmousemove = null;
        documentElement.onmouseup = null;
        documentElement.ondragstart = null;
    }
    // Перемещение мышки
    function mouseMove(e) {
        e = fixEvent(e);
        with (dragObject.style) {
            top = e.pageY - mouseOffset.y + 'px';
            left = e.pageX - mouseOffset.x + 'px';
        }
        return false;
    }
    // Клик мышкой на превью
    function mouseDown(e) {
        e = fixEvent(e);
        if (e.which != 1) return;
        dragObject = this;
        // получить сдвиг элемента относительно курсора мыши
        mouseOffset = getMouseOffset(this, e);
        documentElement.ondragstart = function () { return false; };
        if ((mouseOffset.y > FilePreview.div.controlsDiv.offsetHeight) &&
            (mouseOffset.y < FilePreview.div.offsetHeight + FilePreview.div.controlsDiv.offsetHeight - 30) &&
            (mouseOffset.x > 30) &&
            (mouseOffset.x < FilePreview.div.offsetLeft + FilePreview.div.offsetWidth - 30)) {
            // Если произошел клик в области изображения
            if (!ClickInCommissionDiv(mouseOffset)) {
                //Если произошел клик в области изображения превью, включаем обработчики.                
                documentElement.onmousemove = function (e) { ImageMouseMove(mouseOffset, e); }
            }
            else
                // Произошел клик в области поручений, ничего не делаем.
                documentElement.ondragstart = null;
        }
        else {
            // Клик на границе превью,         
            documentElement.onmousemove = mouseMove;
        }
        documentElement.onmouseup = mouseUp;
        return true;
    }
    // Определение попал ли клик мышкой в область поручений.    
    function ClickInCommissionDiv(mouseOffset) {
        if (FilePreview.div.children.length < 3)
            return false;
        var comDiv = FilePreview.div.children[FilePreview.div.children.length - 1];
        if ((mouseOffset.x > comDiv.offsetLeft && mouseOffset.x < (comDiv.offsetLeft + comDiv.offsetWidth)) &&
        (mouseOffset.y > comDiv.offsetTop && mouseOffset.y < (comDiv.offsetTop + comDiv.offsetHeight)))
            return true;
        else
            return false;
    }

    function MoveTouchObject(e) {
        console.log('MoveTouchObject');
        e.preventDefault();
        var touch = (e.targetTouches != null) ? e.targetTouches[0] : e;
        // Place element where the finger is
        this.style.left = touch.pageX - mouseOffset.x + 'px';
        this.style.top = touch.pageY - mouseOffset.y + 'px';
        console.log('dragObject.style.left (' + this.style.left + ')' + ' = touch.pageX (' + touch.pageX + ') - mouseOffset.x (' + mouseOffset.x + ')');
    }

    function getTouchMouseOffset(target, e) {
        var touch = (e.targetTouches != null) ? e.targetTouches[0] : e;
        var docPos = getPosition(target);
        return { x: touch.pageX - docPos.x, y: touch.pageY - docPos.y }
    }

    // Опускание
    function TouchUp() {
        // очистить обработчики, т.к перенос закончен
        if (window.navigator.msPointerEnabled)  //   IE
            this.removeEventListener('MSPointerMove', MoveTouchObject, false);
        else if ('ontouchmove' in this)
            this.removeEventListener('touchmove', MoveTouchObject, false);
    }

    function StartTouchMove(e) {
        e = fixEvent(e);
        dragObject = this;

        mouseOffset = getTouchMouseOffset(this, e);

        if ((mouseOffset.y > FilePreview.div.controlsDiv.offsetHeight) &&
        (mouseOffset.y < FilePreview.div.offsetHeight + FilePreview.div.controlsDiv.offsetHeight - 30) &&
        (mouseOffset.x > 30) &&
        (mouseOffset.x < FilePreview.div.offsetLeft + FilePreview.div.offsetWidth - 30)) {
            return false;
        }
        else {
            // Клик на границе превью,    
            if (window.navigator.msPointerEnabled)  //   IE
                this.addEventListener('MSPointerMove', MoveTouchObject, false);
            else if('ontouchmove' in this)
                this.addEventListener('touchmove', MoveTouchObject, false);
        }

        if (window.navigator.msPointerEnabled)  //   IE
            this.addEventListener('MSPointerUp', TouchUp, false);
        else if ('ontouchend' in this)
            this.addEventListener('touchend', TouchUp, false);
    }

    return {
        makeDraggable: function (element) {
            element.onmousedown = mouseDown;

            //   Реализация для мобильных устройств
            if (window.navigator.msPointerEnabled)  //   IE
                element.addEventListener("MSPointerDown", StartTouchMove, false);
            else if ('ontouchstart' in element) //   others
                element.addEventListener('touchstart', StartTouchMove, false);
        }
    }
}())

function getPosition(e) {
    var left = 0;
    var top = 0;
    while (e.offsetParent) {
        left += e.offsetLeft;
        top += e.offsetTop;
        e = e.offsetParent;
    }
    left += e.offsetLeft;
    top += e.offsetTop;
    return { x: left, y: top }
}

function fixEvent(e) {
    // получить объект событие для IE
    e = e || windowElement.event;
    // добавить pageX/pageY для IE
    if (e.pageX == null && e.clientX != null) {
        var html = documentElement.documentElement;
        var body = documentElement.body;
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
        e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
    }
    // добавить which для IE
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));
    }
    return e;
}

//проверка строки на пусто/нул
function IsNullOrEmpty(str) {
    if (str == null) return true; if (str.toString() == '') return true; return false;
}


