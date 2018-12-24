var cmConsts = new TTP_Consts();
window.TTP_Consts = cmConsts;

function TTP_Consts() {
    this.ModulPath = '/_LAYOUTS/WSS/WSSC.V4.SYS.UI.Controls/Tooltip';

    return this;
}

//содание или открытие существующего контрола
//debugger
function Tooltip(options) {
    if (options == null)
        throw new Error('Параметр options может быть равен null');

    var thisObj = this;
    this.ParentElement = options.parentElement;
    if (this.ParentElement == null)
        throw new Error('Параметр parentElement не может быть равен null');
    var frameElement = null;
    try {
        frameElement = this.ParentElement.ownerDocument.parentWindow.frameElement;
    }
    catch (e) {
    }
    if (frameElement != null)
        this.ParentWindow = this.ParentElement.ownerDocument.parentWindow;
    this.RelativeX = TTP_GetInt(options.relativeX);
    this.RelativeY = TTP_GetInt(options.relativeY);

    this.Vertical = options.isVertical;
    this.AutoHide = true;
    if (options.autoHide != null)
        this.AutoHide = options.autoHide;

    this.ParentLeft = options.parentLeft;
    if (this.ParentLeft == null && !this.Vertical)
        throw new Error('Параметр parentLeft не может быть равен null');
    this.ParentWidth = options.parentWidth;
    this.RelativeLeft = TTP_GetInt(options.relativeLeft);
    if (this.RelativeLeft + 4 > this.RelativeX)
        this.RelativeX += this.RelativeLeft + 4;


    this.HideOnMouseOut = options.hideOnMouseOut;
    if (window.SM.IsNE(this.HideOnMouseOut))
        this.HideOnMouseOut = false;

    //functions
    this.Show = TTP_ShowTooltip;
    this.ShowTrigger = TTP_ShowTrigger;
    this.Disable = TTP_Disable;
    this.Enable = TTP_Enable;
    this.Hide = TTP_HideTooltip;
    this.InitHideEvent = TTP_InitHideEvent;
    this.InitShowParams = TTP_InitShowParams;

    this.Consts = window.TTP_Consts;
    //this.ParentElement = parentElement;
    if (window.document.compatMode == 'CSS1Compat')
        this.DTD = true;

    //container
    this.Container = window.document.createElement('div');
    this.Container.className = 'tt_div_container';
    this.Container.Tooltip = this;

    this.EnableSelection = options.enableSelection;
    if (!this.EnableSelection)
        window.SM.DisableSelection(this.Container);

    this.HideHandlers = new Array();
    this.AddHideHandler = function (handler) { thisObj.HideHandlers.push(handler); }

    //div img
    this.DivImg = window.document.createElement('div');
    this.DivImg.id = 'tt_div_img';
    this.DivImg.className = 'tt_div_img';
    //this.Container.appendChild(this.DivImg);
    //alert(this.DivImg.offsetWidth);

    if (!this.Vertical) {
        this.DivImgConteiner = window.document.createElement('div');
        this.DivImgConteiner.className = 'tt_div_img_container';
        this.DivImg.appendChild(this.DivImgConteiner);
    }

    this.Img = window.document.createElement('img');
    var imgUrl = this.Consts.ModulPath;
    if (!this.Vertical)
        imgUrl += '/pipka-up.png';
    else
        imgUrl += '/pipka-down.png';

    this.Img.src = imgUrl;
    if (!this.Vertical)
        this.Img.className = 'tt_pipka';
    else
        this.Img.className = 'tt_pipka_vertical';
    if (!this.Vertical)
        this.DivImgConteiner.appendChild(this.Img);
    else
        this.DivImg.appendChild(this.Img);
    if (window.SM.IsIE)
        this.Img.style.left = '-6px';

    //table
    this.Table = window.document.createElement('table');
    this.Table.className = 'tt_tbl_content';
    this.Table.cellSpacing = 0;
    this.Table.cellPadding = 0;
    this.Table.id = 'tt_tbl_content';

    this.Container.style.display = 'none';

    /*
    NEW *********************/
    //img

    if (!this.Vertical) {
        var trPic = this.Table.insertRow(-1);
        var tdPic = trPic.insertCell(-1);
        tdPic.appendChild(this.DivImg);
        tdPic.colSpan = 3;
    }
    else {
        this.DivImg.className = 'tt_div_img_vertical';
        this.Container.appendChild(this.DivImg);
    }

    //top border tr
    var trBorder1 = this.Table.insertRow(-1);


    var leftTopBorder = trBorder1.insertCell(-1);
    leftTopBorder.className = 'ttp_lt_border';
    var emptyDiv = window.document.createElement('div');
    emptyDiv.className = 'ttp_empty';
    leftTopBorder.appendChild(emptyDiv);

    var topBorder = trBorder1.insertCell(-1);
    topBorder.className = 'ttp_top_border_cell';
    var divTB = window.document.createElement('div');
    divTB.className = 'ttp_top_border';
    topBorder.appendChild(divTB);

    var rightTopBorder = trBorder1.insertCell(-1);
    rightTopBorder.className = 'ttp_rt_border';
    emptyDiv = window.document.createElement('div');
    emptyDiv.className = 'ttp_empty';
    rightTopBorder.appendChild(emptyDiv);

    //content tr
    var trContent = this.Table.insertRow(-1);
    var leftBorder = trContent.insertCell(-1);
    leftBorder.className = 'ttp_l_border';

    var contentTD = trContent.insertCell(-1);
    contentTD.className = 'ttp_content_cell';
    var divContent = window.document.createElement('div');
    divContent.className = 'tt_content';
    divContent.id = 'tt_content';
    contentTD.appendChild(divContent);
    this.DivContent = divContent;

    var rightBorder = trContent.insertCell(-1);
    rightBorder.className = 'ttp_r_border';

    //bottom border tr
    var trBorder2 = this.Table.insertRow(-1);
    var leftBottomBorder = trBorder2.insertCell(-1);
    leftBottomBorder.className = 'ttp_lb_border';

    var bottomBorder = trBorder2.insertCell(-1);
    bottomBorder.className = 'ttp_bottom_border';

    var rightBottomBorder = trBorder2.insertCell(-1);
    rightBottomBorder.className = 'ttp_rb_border';

    this.ParentElement.Tooltip = this;

    //this.InitShowParams();

    this.Container.appendChild(this.Table);
    window.document.body.appendChild(this.Container);

    this.InitHideEvent();
    return this;
}

function TTP_GetInt(digit) {
    if (digit != null)
        digit = parseInt(digit);
    else
        digit = 0;
    return digit;
}

function TTP_Disable() {
    this.Disabled = true;
}

function TTP_Enable() {
    this.Disabled = false;
}

function TTP_ShowTrigger() {
    if (!this.IsTriggerHide && !this.Disabled) {
        this.Show();
        this.IsTriggerHide = true;
    }
}

function TTP_ShowTooltip() {
    if (!this.Disabled) {
        this.InitShowParams();
        if (this.Container != null) {
            this.Container.style.width = '';
            this.Container.style.display = '';
            this.Container.style.width = this.Table.offsetWidth + 'px';
        }
        this.Visible = true;
    }
}

function TTP_HideTooltip() {
    //debugger
    if (this.Container != null)
        this.Container.style.display = 'none';
    this.Visible = false;
    var i, len = this.HideHandlers.length;
    for (i = 0; i < len; i++) {
        var handler = this.HideHandlers[i];
        if (handler != null)
            handler(this);
    }
}

function TTP_InitHideEvent() {
    if (this.ParentElement == null)
        return;
    var obj = this;

    if (!this.AutoHide)
        return;

    if (this.HideOnMouseOut) {

        if (this.Container != null) {
            $(obj.Container).mousemove(function (event) {
                var x = event.clientX;
                var y = event.clientY;
                if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                    this.Tooltip.Hide();
            });

            $(obj.Container).mouseover(function (event) {
                var x = event.clientX;
                var y = event.clientY;
                if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                    this.Tooltip.Hide();
            });

            $(obj.Container).mouseout(function (event) {
                var x = event.clientX;
                var y = event.clientY;
                if (!TTP_InClientRect(this.Tooltip.ParentElement, x, y, true) &&
                        !TTP_InClientRect(this, x, y))
                    this.Tooltip.Hide();
            });
        }

        this.ParentElement.onmouseout = function (ev) {
            if (this.Tooltip != null) {
                var x = 0, y = 0;
                if (window.SM.IsFF) {
                    x = ev.clientX;
                    y = ev.clientY;
                }
                else {
                    x = event.clientX;
                    y = event.clientY;
                }

                //return;
                if (!TTP_InClientRect(obj.Container, x, y) &&
                    !TTP_InClientRect(obj.ParentElement, x, y, true))
                    this.Tooltip.Hide();
            }
        }
    }
    else {
        var onMouseDownClick = function (event) {
            TTP_OnDocumentMouseDown(event, obj);
        }

        var thisObj = this;
        //для сафари последовательность вызовов событий 'oncontextmenu' и 'mouseup'
        //не такая как у всех остальных поддерживаемых браузеров
        //в сафари сначала вызывается oncontextmenu, а потом mousup
        if (SM.IsSafari) {
            $(document).mousedown(function (event) {
                onMouseDownClick(event);
            });
        }
        else {
            $(document).mouseup(function (event) {
                onMouseDownClick(event);
            });
        }

        if (thisObj.ParentWindow != null) {
            if (thisObj.ParentWindow.document != null) {
                //для сафари последовательность вызовов событий 'oncontextmenu' и 'mouseup'
                //не такая как у всех остальных поддерживаемых браузеров
                //в сафари сначала вызывается oncontextmenu, а потом mousup
                if (SM.IsSafari) {
                    $(thisObj.ParentWindow.document).mousedown(function (event) {
                        onMouseDownClick(event);
                    });
                }
                else {
                    $(thisObj.ParentWindow.document).mouseup(function (event) {
                        onMouseDownClick(event);
                    });
                }
            }

            $(thisObj.ParentWindow).unload(function () {
                TTP_OnUnload(thisObj);
            });
        }
    }
}

//debugger
function TTP_OnUnload(obj) {
    obj.Hide();
}

//debugger
function TTP_OnDocumentMouseDown(event, obj) {
    //var objBr = obj.ParentElement.getBoundingClientRect();
    //alert(' left:' + objBr.left + ' right:' + objBr.right + ' top:' + objBr.top + ' bottom:' + objBr.bottom);
    //alert(t.y);

    var frameElement = null;
    try {
        frameElement = event.srcElement.ownerDocument.parentWindow.frameElement;
    }
    catch (e) {
    }
    var isFrameEvent = frameElement != null;
    var x = event.clientX;
    var y = event.clientY;

    var missSelf = false;
    var missParent = false;

    var parentX = x;
    var parentY = y;

    if (!TTP_InClientRect(obj.ParentElement, x, y, true))
        missParent = true;

    var containerX = x;
    var containerY = y;
    if (obj.ParentWindow != null && isFrameEvent) {
        var frameOffset = $(obj.ParentWindow.frameElement).offset();
        containerX = x + frameOffset.left;
        containerY = y + frameOffset.top;
    }
    if (!TTP_InClientRect(obj.Container, containerX, containerY, isFrameEvent))
        missSelf = true;

    if (missSelf)//if (missParent && missSelf)
    {
        if (obj.Visible) {
            obj.Hide();

            if (!missParent)
                obj.IsTriggerHide = true;
            else
                obj.IsTriggerHide = false;
        }
        else
            obj.IsTriggerHide = false;
    }
}

//debugger
function TTP_InitShowParams() {
    if (this.Container == null)
        return;

    var parentOffset = $(this.ParentElement).offset();
    if (this.ParentWindow != null) {
        var frameOffset = $(this.ParentWindow.frameElement).offset();
        parentOffset.top += frameOffset.top;
        parentOffset.left += frameOffset.left;
    }
    var parentLeftOffset = $(this.ParentLeft).offset();

    if (!this.Vertical) {
        var absLeft = parentLeftOffset.left + this.RelativeLeft;
        this.Container.style.top = parentOffset.top + this.RelativeY + 'px';
    }
    else {
        //top position
        var parentRect = this.ParentElement.getBoundingClientRect();
        var parentHeight = this.ParentElement.offsetHeight;
        var top = parentOffset.top + (parentHeight / 2) + this.RelativeY - 19;
        this.Container.style.top = top + 'px';//parentOffset.top + (parentHeight / 2) + this.RelativeY - 23 + 'px';

        absLeft = parentOffset.left + this.ParentElement.offsetWidth + 9;
    }
    absLeft -= 4;

    this.Container.style.left = absLeft + 'px';

    if (this.ParentWidth != null)
        this.Table.style.width = this.ParentWidth.offsetWidth + 12 + 'px';

    if (this.DivImg != null && !this.Vertical) {
        var absX = parentOffset.left + this.RelativeX;
        var paddingLeft = absX - absLeft - 9;
        this.DivImg.style.paddingLeft = paddingLeft + 'px';
    }
}

//debugger
function TTP_InClientRect(element, x, y, isFrameEvent, isParent) {
    try {
        if (element.parentNode == null)
            return false;
        if (window.SM.IsNE(element.parentNode.tagName))
            return false;
    }
    catch (e) {
        return false;
    }

    var br = element.getBoundingClientRect();
    if (element.Tooltip != null && element.Tooltip.ParentWindow != null) {
        var scrollTop = element.Tooltip.ParentWindow.SM.GetScrollTop();
        if (scrollTop > 0)
            br.top += scrollTop;
    }
    var offset = $(element).offset();

    /*
    var right = offset.left + element.offsetWidth//br.right;
    var left = offset.left; //br.left;
    var top = offset.top//br.top;
    var bottom = offset.top + element.offsetHeight; //br.bottom;
    
    //debugger;
    if (!isFrameEvent) {
    x += window.SM.GetScrollLeft();
    y += TT_GetScrollTop(element);
    }
    */

    var right = br.right;
    var left = br.left;
    var top = br.top;
    var bottom = br.bottom;

    //debugger;
    if (x >= right || x <= left
        || y >= bottom || y <= top) {
        return false;
    }

    return true;
}