function NFEditWindow() {
    if (this.IsNewWindowDesign)
        this.PopupWindow = window.GetPopupWindow(0);
    window.NFWindow = this;

    //Methods
    this.GetElement = NFW_GetElement;
    this.OnPageLoad = NFW_OnPageLoad;
    this.OnMenuItemClick = NFW_OnMenuItemClick;
    this.OnClearClick = NFW_OnClearClick;
    this.OnOKClick = NFW_OnOKClick;
    this.Close = NFW_Close;
    this.OpenWindowCompleted = NFW_OpenWindowCompleted;
    this.OpenGroupMembers = NFW_OpenGroupMembers;
    this.OpenGroupMembersFrame = NFW_OpenGroupMembersFrame;
    this.OpenGroupMembersAjax = NFW_OpenGroupMembersAjax;
    this.OpenGroupMembersAjaxInternal = NFW_OpenGroupMembersAjaxInternal;
    this.OpenGroupMembersAjaxCompleted = NFW_OpenGroupMembersAjaxCompleted;
    this.ValidateOpenMembersLinks = NFW_ValidateOpenMembersLinks;

    //Properties
    this.ListForm = this.IsNewWindowDesign ? window.ListForm : window.parent.ListForm;

    this.EmployeesSettings = window.GetLookupSettings(this.EmployeesSettingsName);
    this.GroupsSettings = window.GetLookupSettings(this.GroupsSettingsName)
    this.AddressesSettings = window.GetLookupSettings(this.AddressesSettingsName)

    this.MainDiv = this.GetElement('divMain');
    this.MenuDiv = this.GetElement('divMenu');

    this.EmployeesHolder = this.IsNewWindowDesign ? this.GetElement('divEmployeesContent') : this.GetElement('ifrEmployees');
    this.GroupsHolder = this.IsNewWindowDesign ? this.GetElement('divGroupsContent') : this.GetElement('ifrGroups');
    this.AddressesHolder = this.GetElement('divAddressesContent');

    this.DirectAddressatsInput = this.GetElement('txtDirectAddressats');
    this.ButtonsDiv = this.GetElement('divButtons');
    this.DescriptionDiv = this.GetElement('divDescription');
    this.AddresatsRoundDiv = this.GetElement('divAddressatsRound');
    this.DirectAddresatsHolder = this.GetElement('divDirectAddressatsHolder');
    this.AddToResultDiv = this.GetElement('divAddToResult');

    if (this.IsNewWindowDesign)
        this.OnPageLoad();
}

function NFW_GetElement(elementID) {
    if (SM.IsNE(elementID))
        throw new Error('Не передан параметр elementID.');
    var element = null;
    if (this.IsNewWindowDesign)
        element = this.PopupWindow.GetElement(elementID);
    else
        element = window.document.getElementById(elementID);
    if (element == null)
        element = null;
    return element;
}




//var currentLookupWindow = null;

//debugger


//debugger
function NFW_OnMenuItemClick(tdMenu) {
    if (this.CurrentMenuItem != null) {
        var prevMenuItem = this.CurrentMenuItem;
        prevMenuItem.className = 'nf_tdMenuGrey';
        prevMenuItem.children[0].className = 'nf_tdMenuGreyText';
        var prevContent = this.GetElement(prevMenuItem.getAttribute('contentID'));
        if (prevContent != null)
            prevContent.style.display = 'none';
    }
    this.CurrentMenuItem = tdMenu;
    this.CurrentMenuItem.className = 'nf_tdMenuGrey_current';
    this.CurrentMenuItem.children[0].className = 'nf_tdMenuGreyText_current';
    this.CurrentContent = this.GetElement(this.CurrentMenuItem.getAttribute('contentID'));
    if (this.CurrentContent != null) {
        this.CurrentContent.style.display = 'inline-block';



        var contentSource = this.CurrentContent.contentSource;
        if (!SM.IsNE(contentSource)) {
            var contentHolder = this.CurrentContent.children[0];
            if (!contentHolder.Inited) {
                contentHolder.Inited = true;
                var xmlRequest = window.SM.GetXmlRequest();

                var splUrl = contentSource.split('?');
                var postUrl = splUrl[0] + '?rndPost=' + Math.random();
                var postParams = splUrl[1];

                xmlRequest.open('POST', postUrl, true);
                xmlRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                var thisObj = this;
                var lookupName = contentHolder.getAttribute('LookupName');
                if (SM.IsNE(lookupName))
                    throw new Error('Не задано имя настройки подстановки.');
                this.CurrentLookupName = lookupName;

                //инциализируем высоту для адресов (она отличается от групп и сотрудников)
                if (lookupName == 'Addresses') {
                    //устанавливаем высоту текст бокса адресатов.
                    NFW_SetDirectAddresatsHolder.call(this, this.AddressatsTextAreaHeight);

                    //устанавливаем высоту зоны подстановки, после установки высоты текст боска адресатов
                    var compatHeightOffset = 0;
                    if (SM.IsIE) {
                        if (SM.IEVersion >= 9)
                            compatHeightOffset = 2;
                    }
                    else if (SM.IsSafari)
                        compatHeightOffset = 2;

                    this.AddressesHolder.style.height = this.MenuContentHeight - this.DescriptionDiv.offsetHeight - this.AddresatsRoundDiv.offsetHeight + compatHeightOffset + 'px';
                }

                xmlRequest.onreadystatechange = function () {
                    if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
                        xmlRequest.onreadystatechange = new Function();
                        var responseText = xmlRequest.responseText;
                        thisObj.OpenWindowCompleted(responseText, contentHolder);
                    }
                };
                xmlRequest.send(postParams);
            }
        }
        else {
            if (!this.AddressatsInited) {
                //установка размеров адресатов.
                var descriptionHeight = this.DescriptionDiv.offsetHeight;

                //опеределяем высоту текст-бокса адресатов для режима без лукапа.
                var addressatsInputHeight = this.MenuContentHeight - descriptionHeight;
                NFW_SetDirectAddresatsHolder.call(this, addressatsInputHeight);

                //устанавливаем флаг инициализации, чтобы больше сюда не попадать.
                this.AddressatsInited = true;
            }
        }
        if (this.AddToResultDiv != null) {
            this.AddToResultDiv.style.display =
                this.CurrentContent.id == 'divAddressats' && this.AddressesSettings == null ?
                'none' : '';
        }
    }
}

function NFW_SetDirectAddresatsHolder(height) {
    if (height == null || height == 0)
        throw new Error('Не передан параметр height.');

    var compatHeightOffset = 0;
    if (SM.IsIE) {
        if (SM.IEVersion >= 9)
            compatHeightOffset = 8
        else
            compatHeightOffset = 10;
    }
    else if (SM.IsSafari)
        compatHeightOffset = 8;
    else
        compatHeightOffset = 10;

    height = height - compatHeightOffset;
    this.DirectAddresatsHolder.style.height = height + 'px';
}
//debugger

function NFW_OpenWindowCompleted(responseText, contentHolder) {
    contentHolder.innerHTML = responseText;
    SM.InvokeScripts(contentHolder);
    var lookupName = this.CurrentLookupName;
    if (lookupName == 'Employees') {
        this.EmployeesWindow = window.GetLookupWindow('0_NFEmployees');
        //set to CurrentContent
        contentHolder.parentNode.LookupWindow = this.EmployeesWindow;
    }
    else if (lookupName == 'Groups') {
        this.GroupsWindow = window.GetLookupWindow('0_NFGroups');
        //set to CurrentContent
        contentHolder.parentNode.LookupWindow = this.GroupsWindow;
    }
    else if (lookupName == 'Addresses') {
        this.AddressesWindow = window.GetLookupWindow('0_NFAddresses');
        //set to CurrentContent
        contentHolder.parentNode.LookupWindow = this.AddressesWindow;
    }
    else
        throw new Error('Не удалось определить контэйнер содержимого подстановки ' + lookupName);
}

function NFW_OnClearClick() {
    if (this.CurrentContent.LookupWindow == null) {
        var frame = this.CurrentContent.children[0];
        if (frame != null) {
            if (frame.tagName.toLowerCase() == 'iframe') {
                if (frame.contentWindow != null) {
                    if (this.CurrentContent.LookupWindow == null)
                        this.CurrentContent.LookupWindow = frame.contentWindow.LookupWindow;
                }
            }
        }
    }
    if (this.CurrentContent.LookupWindow != null) {
        this.CurrentContent.LookupWindow.ClearResult();
        if (this.CurrentLookupName == 'Addresses' && this.DirectAddressatsInput != null)
            this.DirectAddressatsInput.value = '';
    }
}

//debugger
function NFW_OnPageLoad() {
    var pageName = !this.IsNewWindowDesign ? 'NFLookupWindow.aspx' : 'NFLookupWindow.v2.aspx';
    var lookupPageUrl = this.WebUrl + this.ModulePath + '/' + pageName + '?rnd=' + Math.random();


    var commonParams = ''
    if (!this.IsNewWindowDesign && this.ListForm != null) {
        if (!SM.IsNE(this.ListForm.ItemID))
            commonParams += '&listFormItemID=' + this.ListForm.ItemID.toString();
        if (!SM.IsNE(this.ListForm.ListID))
            commonParams += '&listFormListID=' + this.ListForm.ListID.toString();
        if (!SM.IsNE(this.ListForm.WebID))
            commonParams += '&listFormWebID=' + this.ListForm.WebID.toString();
    }
    //commonParams += '&isNewWindowDesign=' + this.IsNewWindowDesign;
    var empsUrl = '';
    if (this.EmployeesSettings != null) {
        var resultKey = 'employees'
        var params = this.EmployeesSettings.GetLookupWindowParams(resultKey);
        params += '&defaultSelectedIDs=' + this.EmployeesIDs;
        params += '&contentHolderID=' + this.EmployeesHolder.id;
        empsUrl = lookupPageUrl + params + commonParams;
    }

    var groupsUrl = '';
    if (this.GroupsSettings != null) {
        var resultKey = 'groups'
        var params = this.GroupsSettings.GetLookupWindowParams(resultKey);
        var thisObj = this;
        this.GroupsSettings.AddSearchCompletedHandler(resultKey, function (lookupWindow) {
            thisObj.ValidateOpenMembersLinks(lookupWindow);
        });
        params += '&defaultSelectedIDs=' + this.GroupsIDs;
        params += '&contentHolderID=' + this.GroupsHolder.id;
        groupsUrl = lookupPageUrl + params + commonParams;

        if (!window.NFW_MembersTriggesAttached) {
            $(window.document.body).mousedown(function (evt) { NFW_OnMembersTrigger(evt); });
            window.NFW_MembersTriggesAttached = true;
        }
    }

    var addressesUrl = ''
    if (this.AddressesSettings != null) {
        var resultKey = 'addresses'
        var params = this.AddressesSettings.GetLookupWindowParams(resultKey);
        params += '&defaultSelectedIDs=' + this.AddressesIDs;
        params += '&contentHolderID=' + this.AddressesHolder.id;
        addressesUrl = lookupPageUrl + params + commonParams;
    }

    //установка размеров
    var divFloatContent = this.IsNewWindowDesign ? this.PopupWindow.ContentDiv : window.frameElement;
    var winHeight = divFloatContent.offsetHeight;
    var buttonsHeight = this.ButtonsDiv.offsetHeight;
    var menuHeight = this.MenuDiv.offsetHeight;

    this.MenuContentHeight = winHeight - buttonsHeight - menuHeight - 1;
    this.MenuContentWidth = divFloatContent.offsetWidth;

    this.EmployeesHolder.style.height = this.MenuContentHeight + 'px';
    this.GroupsHolder.style.height = this.MenuContentHeight + 'px';
    if (this.AddressesSettings != null) {
        this.AddressesHolder.parentNode.style.height = this.MenuContentHeight + 'px';
    }


    //проставляем contentSource чтобы при клике на пункт меню можно было понять, какой url открывать.
    this.EmployeesHolder.parentNode.contentSource = empsUrl;
    this.GroupsHolder.parentNode.contentSource = groupsUrl;
    this.AddressesHolder.parentNode.contentSource = addressesUrl;

    if (this.DirectAddressats != null)
        this.DirectAddressatsInput.value = this.DirectAddressats;

    this.OnMenuItemClick(this.GetElement('menuItemEmployees'));

}


function NFW_OnMembersTrigger(evt) {
    if (window.NFWindow != null) {
        var membersWindow = window.NFWindow.MembersWindow;
        if (membersWindow != null) {
            if (evt == null) evt = window.event;
            var clientX = evt.clientX;
            var clientY = evt.clientY;
            var divMembers = membersWindow.Container;
            var linkMembers = divMembers.GroupMembersLink;
            var rectDiv = divMembers.getBoundingClientRect();
            var rectLink = linkMembers.getBoundingClientRect();
            var isInDiv = clientX >= rectDiv.left && clientX <= rectDiv.right && clientY >= rectDiv.top && clientY <= rectDiv.bottom;
            var isInLink = clientX >= rectLink.left && clientX <= rectLink.right && clientY >= rectLink.top && clientY <= rectLink.bottom;
            if (isInLink && !membersWindow.Closed)
                linkMembers.ClosedByTrigger = true;
            if (!isInDiv)
                membersWindow.Close();

        }
    }
}
//debugger



function NFW_OnOKClick() {

    var empsXml = 'NotInited';
    if (this.EmployeesHolder.Inited) {
        var lookupWindow = this.IsNewWindowDesign ? this.EmployeesWindow : this.EmployeesHolder.contentWindow.LookupWindow;
        if (lookupWindow != null) {
            lookupWindow.AddToResult();
            empsXml = lookupWindow.ReturnItemsNode;
        }
    }

    var groupsXml = 'NotInited';
    if (this.GroupsHolder.Inited) {
        var lookupWindow = this.IsNewWindowDesign ? this.GroupsWindow : this.GroupsHolder.contentWindow.LookupWindow;
        if (lookupWindow != null) {
            lookupWindow.AddToResult();
            groupsXml = lookupWindow.ReturnItemsNode;
        }
    }

    var addressesXml = 'NotInited';
    if (this.AddressesHolder.Inited) {
        var lookupWindow = this.IsNewWindowDesign ? this.AddressesWindow : this.AddressesHolder.contentWindow.LookupWindow;
        if (lookupWindow != null) {
            lookupWindow.AddToResult();
            addressesXml = lookupWindow.ReturnItemsNode;
        }
    }

    var directAddressats = this.DirectAddressatsInput.value;

    window.NF_ReturnSelectResult(this.FieldID, empsXml, groupsXml, addressesXml, directAddressats);
    this.Close();

}


function NFW_Close() {
    this.NFWindow = null;
    this.PopupWindow.Hide();
}







/*---------------------- Group Members ---------------------*/

function NFW_OpenGroupMembers(webUrl, listID, itemID) {
    if (this.IsNewWindowDesign)
        this.OpenGroupMembersAjax(webUrl, listID, itemID);
    else
        this.OpenGroupMembersFrame(webUrl, listID, itemID);
}

function NFW_OpenGroupMembersFrame(webUrl, listID, itemID) {
    if (webUrl == '/')
        webUrl = '';
    var url = webUrl + '/_layouts/WSS/WSSC.V4.DMS.Fields.Notification/NFGroupMembers.aspx?rnd=' + Math.random();
    var params = '';
    params += '&groupListID=' + listID;
    params += '&groupItemID=' + itemID;
    url += params;
    var divGroupMembers = window.parent.document.getElementById('divGroupMembers');
    var ifrGroupMembers = window.parent.document.getElementById('ifrGroupMembers');

    var floatTop = 0;
    var floatLeft = 0;
    var floatTitleHeight = 0;
    if (!this.IsNewWindowDesign) {
        var divFloatWindow = window.parent.FloatWindow.FloatDiv;
        floatTop = divFloatWindow.offsetTop;
        floatLeft = divFloatWindow.offsetLeft;
        floatTitleHeight = window.parent.FloatWindow.TitleFrame.offsetHeight;
    }

    var groupsFrameTop = this.GroupsHolder.offsetTop;
    var groupsFrameLeft = this.GroupsHolder.offsetLeft;

    var divFiltersScope = this.GroupsHolder.contentWindow.document.getElementById('divFiltersScope');
    var filtersHeight = divFiltersScope.offsetHeight;

    var lookupDivMain = this.GroupsHolder.contentWindow.document.getElementById('divMain');
    var lookupLeftPadding = parseInt(lookupDivMain.currentStyle.paddingLeft);

    //var ifrGrid = this.GroupsHolder.contentWindow.document.getElementById('ifrGrid')
    var lnkGroupMembersID = 'lnkGroupMembers' + itemID;
    var lnkGroupMembers = this.GroupsHolder.contentWindow.document.getElementById(lnkGroupMembersID);
    var lnkGroupTop = lnkGroupMembers.offsetTop;
    var lnkGroupHeight = lnkGroupMembers.offsetHeight;
    var lnkGroupLeft = lnkGroupMembers.offsetLeft;

    if (!this.IsNewWindowDesign) {
        divGroupMembers.style.pixelTop = 2 + floatTop + groupsFrameTop + floatTitleHeight + filtersHeight + lnkGroupTop + lnkGroupHeight - lnkGroupMembers.offsetParent.scrollTop;
        divGroupMembers.style.pixelLeft = 2 + floatLeft + groupsFrameLeft + lookupLeftPadding + lnkGroupLeft;
    }
    else {
        divGroupMembers.style.pixelTop = lnkGroupHeight + $(lnkGroupMembers).offset().top/* + $(ifrGrid).offset().top*/ + $(this.GroupsHolder).offset().top + $(window.parent.Popup.ContentFrame).offset().top;
        divGroupMembers.currentLeftBase = $(lnkGroupMembers).offset().left/* + $(ifrGrid).offset().left*/ + $(this.GroupsHolder).offset().left + $(window.parent.Popup.ContentFrame).offset().left - 400 + lnkGroupMembers.offsetWidth;
        divGroupMembers.style.pixelLeft = divGroupMembers.currentLeftBase;
    }

    divGroupMembers.style.display = '';
    ifrGroupMembers.style.width = '0px';
    ifrGroupMembers.style.height = '0px';
    ifrGroupMembers.src = url;


    //window.parent.open(url, '_blank');
}

function NFW_OpenGroupMembersAjax(webUrl, listID, itemID) {
    if (webUrl == '/')
        webUrl = '';
    var url = webUrl + '/_layouts/WSS/WSSC.V4.DMS.Fields.Notification/NFGroupMembers.v2.aspx?rnd=' + Math.random();
    var params = '';
    params += '&groupListID=' + listID;
    params += '&groupItemID=' + itemID;
    url += params;

    var lnkGroupMembersID = 'lnkGroupMembers' + itemID;
    var lnkGroupMembers = this.GetElement(lnkGroupMembersID);
    if (lnkGroupMembers == null)
        throw new Error('Не удалось получить ссылку на открытие состава групп по id=' + lnkGroupMembersID);

    var divGroupMembers = lnkGroupMembers.GroupMembersDiv;
    if (divGroupMembers == null) {
        //var divGroupMembersPoint = window.document.createElement('div');
        //divGroupMembersPoint.className = 'nf_divGroupMembersPoint';
        var divGroupMembers = window.document.createElement('div');
        divGroupMembers.className = 'nf_divGroupMembers';
        //divGroupMembersPoint.appendChild(divGroupMembers);
        //$(divGroupMembersPoint).insertAfter(lnkGroupMembers);
        lnkGroupMembers.GroupMembersDiv = divGroupMembers;
        divGroupMembers.GroupMembersLink = lnkGroupMembers;
        //this.GroupsWindow.GridDiv.parentNode.appendChild(divGroupMembers);
        window.document.body.appendChild(divGroupMembers);
    }

    this.OpenGroupMembersAjaxInternal(url, divGroupMembers);
}

function NFW_OpenGroupMembersAjaxInternal(url, divGroupMembersParam) {
    if (SM.IsNE(url))
        throw new Error('Параметр url не может быть пустым');
    if (divGroupMembersParam == null)
        throw new Error('Параметр divGroupMembersParam не может быть пустым');

    var divGroupMembers = divGroupMembersParam;
    divGroupMembers.Url = url;
    var thisObj = this;
    var xmlRequest = window.SM.GetXmlRequest();
    xmlRequest.open('GET', url, true);
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            xmlRequest.onreadystatechange = new Function();
            var responseText = xmlRequest.responseText;
            thisObj.OpenGroupMembersAjaxCompleted(responseText, divGroupMembers);
        }
    };
    xmlRequest.send(null);
}

function NFW_OpenGroupMembersAjaxCompleted(responseText, divGroupMembers) {
    divGroupMembers.innerHTML = responseText;
    if (this.MembersWindow != null)
        this.MembersWindow.Close();
    this.MembersWindow = new NFGroupMembersWindow(divGroupMembers, this);
    SM.InvokeScripts(divGroupMembers);
}



function NFW_ValidateOpenMembersLinks(lookupWindow) {
    if (lookupWindow.GridTable != null && lookupWindow.Settings != null) {
        var thisObj = this;
        var lookupWin = lookupWindow;
        if (this.MembersWindow != null)
            this.MembersWindow.Close();
        $(lookupWindow.GridDiv).scroll(function () {
            if (thisObj.MembersWindow != null && !thisObj.MembersWindow.Closed) {
                thisObj.MembersWindow.SetPosition();
            }
        });
        var openMembersLinks = $(lookupWindow.GridTable).find("a[onclick*='parent.parent.OpenGroupMembers']");
        var i, len = openMembersLinks.length;
        for (i = 0; i < len; i++) {
            var link = openMembersLinks[i];
            var linkClickValue = link.getAttribute('onclick');
            if (linkClickValue != null) {
                var lookupID = link.parentNode.parentNode.cells[0].getAttribute('Identity');
                if (SM.IsNE(lookupID))
                    throw new Error('Не удалось получить ID подстановочного элемента из разметки грида.');

                lookupID = lookupID.toString();
                var lookupWebUrl = lookupWindow.Settings.LookupWebUrl;
                if (lookupWebUrl = '/')
                    lookupWebUrl = '';
                var lookupListID = lookupWindow.Settings.LookupListID.toString();

                link.setAttribute('webUrl', lookupWebUrl);
                link.setAttribute('listID', lookupListID);
                link.setAttribute('itemID', lookupID);

                if (this.IsNewWindowDesign)
                    link.style.position = 'relative';

                link.onclick = function (evt) {
                    if (!this.ClosedByTrigger)
                        thisObj.OpenGroupMembers(this.getAttribute('webUrl'), this.getAttribute('listID'), this.getAttribute('itemID'));
                    this.ClosedByTrigger = false;
                    if (!thisObj.IsNewWindowDesign) {
                        thisObj.GroupsHolder.contentWindow.event.cancelBubble = true;
                        thisObj.GroupsHolder.contentWindow.event.returnValue = false;
                    }
                    else {
                        if (evt == null) evt = window.event;
                        return SM.CancelEvent(evt);
                    }
                }

            }
        }
        //alert(openMembersLinks.length);
    }
}

function NFGroupMembersWindow(container, parentWindow) {
    if (container == null)
        throw new Error('Не передан параметр container');
    if (parentWindow == null)
        throw new Error('Не передан параметр parentWindow');

    this.Container = container;
    this.ParentWindow = parentWindow;

    //Methods
    this.GoSearch = GMW_GoSearch;
    this.GoContextSearch = GMW_GoContextSearch;
    this.InitFilters = GMW_InitFilters;
    this.OnPageLoad = GMW_OnPageLoad;
    this.OnPressKey = GMW_OnPressKey;
    this.SetPosition = GMW_SetPosition;
    this.Close = GMW_Close;
    //this.

    //Properties
    this.IsNewDesign = this.ParentWindow.IsNewWindowDesign;
    this.PressNumber = 0;

}

function GMW_Close() {
    this.Container.style.display = 'none';
    this.ParentWindow.MembersWindow = null;
    this.Closed = true;
}

function GMW_SetPosition() {
    var membersLink = this.Container.GroupMembersLink;
    var rect = membersLink.getBoundingClientRect();

    var divGrid = this.ParentWindow.GroupsWindow.GridDiv;
    var top = rect.bottom + SM.GetScrollTop();
    var left = rect.right + SM.GetScrollLeft() - this.Container.offsetWidth;
    if (SM.IsIE) {
        top -= 2
        left += 3;
    }
    else {
        left += 5;
    }
    this.Container.style.top = top + 'px';
    this.Container.style.left = left + 'px';
}

function GMW_OnPageLoad(filters) {
    this.Container.style.display = '';
    this.FiltersTable = SM.GetElement('tbFilters', this.Container);
    this.MainDiv = SM.GetElement('divMain', this.Container);
    this.MainDiv.onclick = function (evt) { return SM.CancelEvent(evt); }
    this.Filters = filters;
    this.InitFilters();

    this.GridDiv = SM.GetElement('divGrid', this.Container);
    this.GridTable = SM.GetElement('gridUsers', this.Container);
    this.FixedHeaderDiv = SM.GetElement('divFixedHeader', this.Container);
    if (this.GridDiv.offsetHeight > 350)
        this.GridDiv.style.height = 350 + 'px';
    SM.CreateFixedHeader(this.GridTable, this.FixedHeaderDiv);
    this.SetPosition();
}

function GMW_InitFilters() {
    var i, len = this.Filters.length;
    var trFilters = this.FiltersTable.insertRow(-1);
    var thisObj = this;
    var index = 0;
    var firstFilter = null;
    for (i = 0; i < len; i++) {
        var filter = this.Filters[i];
        var name = filter.Name;
        var displayName = filter.DisplayName;
        var defaultValue = filter.DefaultValue;
        if (!SM.IsNE(name)) {
            var tdFilter = trFilters.insertCell(-1);
            tdFilter.className = 'gmw_tdFilter';

            var textControl = new TextControl({
                DefaultText: displayName,
                ControlWidth: 150
            });
            tdFilter.appendChild(textControl.Container);
            filter.Control = textControl;
            var txtFilter = textControl.TextInput;
            $(txtFilter).keypress(function (evt) { return GMW_LockSubmit(evt); });
            $(txtFilter).keyup(function (evt) { return thisObj.OnPressKey(evt); });
            txtFilter.Filter = textControl;
            if (!SM.IsNE(defaultValue)) {
                txtFilter.value = defaultValue;
                textControl.ClearDefaultText();
            }
            if (index == 0)
                firstFilter = textControl;
            index++;
        }
    }
    if (firstFilter != null) {
        firstFilter.ClearDefaultText();
        firstFilter.TextInput.focus();
        NFW_MoveCaretToEnd(firstFilter.TextInput);
    }
}


function GMW_OnPressKey(evt) {
    if (evt == null) evt = window.event;
    var pressNumber = this.PressNumber;
    var result = true;
    var ck = evt.keyCode;
    if (ck == 13) {
        this.GoSearch(false);
        result = false;
    }
    else {
        pressNumber++;
        this.PressNumber = pressNumber;

        if (ck == 9 || ck == 16 || ck == 17 || ck == 18 || ck == 19 || ck == 20 ||
         ck == 33 || ck == 34 || ck == 35 || ck == 36 || ck == 37 || ck == 38 || ck == 39 || ck == 40)
            return false;

        window.setTimeout('if(window.NFWindow.MembersWindow != null) window.NFWindow.MembersWindow.GoContextSearch(' + pressNumber + ');', 400);
    }
    return result;
}

function GMW_GoContextSearch(pn) {
    if (pn != this.PressNumber)
        return;

    this.GoSearch();
}

function GMW_LockSubmit(evt) {
    if (evt == null) evt = window.event;
    var result = true;
    var ck = evt.keyCode;
    if (ck == 13)
        result = false;
    return result;
}

//debugger
function GMW_GoSearch() {
    if (this.Closed)
        return;
    var i, len = this.Filters.length;
    var stFilters = '';
    for (i = 0; i < len; i++) {
        var filter = this.Filters[i];
        var txtFilter = filter.Control.TextInput;
        if (txtFilter != null) {
            var filterName = filter.Name;
            var value = '';
            value = txtFilter.value;
            if (!SM.IsNE(filterName) && !SM.IsNE(value)) {
                if (stFilters.length > 0)
                    stFilters += '_f_';
                stFilters += filterName + '_v_' + value;
            }
        }
    }

    var url = this.Container.Url;
    var queryBuilder = new SM.GetRequestQueryBuilder();
    queryBuilder.Init(url);
    queryBuilder.SetParam('filters', stFilters);
    queryBuilder.SetParam('rnd', Math.random().toString());
    url = queryBuilder.GetUrl();

    this.ParentWindow.OpenGroupMembersAjaxInternal(url, this.Container);
}

function NFW_MoveCaretToEnd(inputObject) {
    if (inputObject.createTextRange) {
        var r = inputObject.createTextRange();
        r.collapse(false);
        r.select();
    }
    else if (SM.IsFF) {
        var tmp = inputObject.value;
        inputObject.value = '';
        inputObject.value = tmp;
    }
}







function NFViewWindowClass() {
    window.NFViewWindow = this;

    //Methods
    this.GetElement = NFView_GetElement;
    this.OnPageLoad = NFView_OnPageLoad;
    this.OnOKClick = NFView_OnOKClick;
    this.InitDivItems = NFView_InitDivItems;

    //Properties
    this.IsNewWindowDesign = window.frameElement == null;

    if (this.IsNewWindowDesign)
        this.OnPageLoad();
}

function NFView_GetElement(elementID) {
    if (SM.IsNE(elementID))
        throw new Error('Не передан параметр elementID.');
    var element = null;
    if (this.IsNewWindowDesign)
        element = this.PopupWindow.GetElement(elementID);
    else
        element = window.document.getElementById(elementID);
    if (element == null)
        element = null;
    return element;
}

function NFView_OnPageLoad() {

    this.PopupWindow = this.IsNewWindowDesign ? window.GetPopupWindow() : null;
    this.Url = this.IsNewWindowDesign ? this.PopupWindow.Url : window.location.href;
    this.Request = SM.GetRequestQueryBuilder();
    this.Request.Init(this.Url);
    this.FieldID = this.Request.GetParam('fieldID');

    var isNotifiedReq = this.Request.GetParam('isNotified');
    this.IsNotified = false;
    if (!SM.IsNE(isNotifiedReq))
        this.IsNotified = isNotifiedReq.toLowerCase() == 'true';

    this.MainDiv = this.GetElement('divMain');
    this.GroupsDiv = this.GetElement('divGroups');
    this.EmployeesDiv = this.GetElement('divEmployees');
    this.DirectAddressatsDiv = this.GetElement('divDirectAddressats');

    var divFloatWindow = null;
    var ifrFloatWin = null;
    if (!this.IsNewWindowDesign) {
        divFloatWindow = window.parent.FloatWindow.FloatDiv;
        ifrFloatWin = window.parent.FloatWindow.ContentFrame;
    }
    else {
        divFloatWindow = this.PopupWindow.Table;
        ifrFloatWin = this.PopupWindow.ContentDiv;
    }

    if (!SM.IsNE(this.FieldID)) {
        var field = this.IsNewWindowDesign ? window.GetNotificationFieldByID(this.FieldID) : window.parent.GetNotificationFieldByID(this.FieldID);
        var groupNodes = null;
        var employeeNodes = null;
        var addressesNodes = null;
        var directAddressatsElement = null;
        if (!this.IsNotified) {
            groupNodes = field.FieldValue.GroupsElement.selectNodes('Item');
            employeeNodes = field.FieldValue.EmployeesElement.selectNodes('Item');
            addressesNodes = field.FieldValue.AddressesElement.selectNodes('Item');

            directAddressatsElement = field.FieldValue.DirectAddressatsElement;
        }
        else {
            groupNodes = field.FieldValue.GroupsNotifiedElement.selectNodes('Item');
            employeeNodes = field.FieldValue.EmployeesNotifiedElement.selectNodes('Item');
            addressesNodes = field.FieldValue.AddressesNotifiedElement.selectNodes('Item');

            directAddressatsElement = field.FieldValue.DirectAddressatsNotifiedElement;
        }
        var contentWidth = this.EmployeesDiv.offsetWidth;
        if (!this.IsNewWindowDesign)
            contentWidth -= 5;
        this.EmployeesDiv.style.width = contentWidth + 'px';
        this.GroupsDiv.style.width = contentWidth + 'px';
        this.DirectAddressatsDiv.style.width = contentWidth + 'px';

        //todo - сделать отображение адресов
        this.InitDivItems(this.GroupsDiv, groupNodes);
        this.InitDivItems(this.EmployeesDiv, employeeNodes);

        var directAddrString = SM.IsIE ? directAddressatsElement.text : directAddressatsElement.textContent;
        if (addressesNodes != null) {
            var addressesText = NFView_GetNodesText(addressesNodes);
            if (!SM.IsNE(addressesText)) {
                if (SM.IsNE(directAddrString))
                    directAddrString = addressesText;
                else
                    directAddrString = addressesText + '; ' + directAddrString;
            }
        }
        if (!SM.IsNE(directAddrString)) {
            this.DirectAddressatsDiv.style.height = 'auto';
            var divAddr = window.document.createElement('div');
            this.DirectAddressatsDiv.appendChild(divAddr);
            divAddr.className = 'nf_divItem';
            divAddr.style.whiteSpace = 'normal';
            divAddr.innerHTML = directAddrString;
        }

        this.PopupWindow.ContentDiv.style.height = 'auto';
    }
}

function NFView_InitDivItems(divItems, itemNodes) {
    var i, len = itemNodes.length;
    if (len > 0)
        divItems.style.height = 'auto';
    for (i = 0; i < len; i++) {
        var itemNode = itemNodes[i];
        var itemTitle = itemNode.getAttribute('LookupText');
        if (!SM.IsNE(itemTitle)) {
            var divItem = window.document.createElement('div');
            divItem.className = 'nf_divItem';
            divItems.appendChild(divItem);
            divItem.innerHTML = itemTitle;
            if (i < len - 1)
                divItem.style.paddingBottom = '3px';

            //  Генерация собития создания элемента оповещения
            if (window.GetNotificationFieldByID != null)
                SM.FireEvent(GetNotificationFieldByID(this.FieldID), 'CreateNotificationItem', { Node: itemNode, ItemDiv: divItem });
        }
    }
}

function NFView_GetNodesText(itemNodes) {
    if (itemNodes == null)
        throw new Error('Не передан параметр itemNodes.');

    var i, len = itemNodes.length;
    var stNodesText = '';
    for (i = 0; i < len; i++) {
        var itemNode = itemNodes[i];
        var itemTitle = itemNode.getAttribute('LookupText');
        if (!SM.IsNE(itemTitle)) {
            if (stNodesText.length > 0)
                stNodesText += '; ';
            stNodesText += itemTitle;
        }
    }
    return stNodesText;
}

function NFView_OnOKClick() {

}