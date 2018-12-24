function DR_ReviewDocument(link, options, callback) {
    if (link == null) {
        alert('Не удалось определить источник события клика по ссылке.');
        return;
    }

    if (options == null) {
        alert('Возможность ознакомления отключена для документа. Параметр options не может быть равен null.');
        return;
    }

    var hasReviewed = options.HasReview;
    var hasReviewedAnyTime = options.HasReviewAnyTime;
    var disableConfirm = options.DisableConfirm;
    var repeatedReviewEnabled = options.RepeatedReviewEnabled;

    var itemID = '0';
    var listID = '0';
    if (options.ListID != null && options.ListID > 0)
        listID = options.ListID.toString();
    if (options.ItemID != null && options.ItemID > 0)
        itemID = options.ItemID.toString();

    var key = listID + '_' + itemID;
    if (window.DocumentReviewStates == null)
        window.DocumentReviewStates = [];

    var hasReviewState = window.DocumentReviewStates[key];
    if (hasReviewState == null)
        hasReviewState = false;

    var cont = false;
    var confText = '';
    if (!hasReviewed && hasReviewState)
        hasReviewed = hasReviewState;

    //ознакомление через окно выбора пользователей.
    if (options.CanSelectUser) {
        var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewersLookupWindow/ReviewersLookupWindow.aspx?';
        url += 'listID=' + options.ListID;
        url += '&itemID=' + options.ItemID;
        url += '&rnd=' + Math.random();
        window.OpenPopupWindow(url, options.LookupWindowWidth, options.LookupWindowHeight, '19px 16px 10px 16px !important');

        setTimeout(function () {
            if (window.DRLookupWindow != null)
                window.DRLookupWindow.AttachEvent("ReviewCompleated", function (args) {
                    if (!args)
                        throw new Error('args is null');

                    var successed = args.Successed != null ? args.Successed : false;
                    if (successed) {
                        var allChecked = args.CheckAll == true;
                        window.DocumentReviewStates[key] = allChecked;
                        DR_DocumentReviewCompleated(link, options, allChecked);
                    }

                    if (callback != null) {
                        //передаем флаг результата операции и страницу закрытия, если необходимо.
                        callback(successed, options.ClosePageUrl);
                    }
                    else {
                        //если указана страница закрытия документа, то переходим на нее.
                        if (!SM.IsNE(options.ClosePageUrl))
                            window.location.href = options.ClosePageUrl;
                    }
                });
        }, 3000);
    }
        //обычное ознакомление
    else {

        if (hasReviewed)
            confText = window.TN.TranslateKey('dr.confirm.again');
        else {
            if (hasReviewedAnyTime)
                confText = window.TN.TranslateKey('dr.confirm.change');
            else
                confText = window.TN.TranslateKey('dr.confirm.regular');
        }

        if (!disableConfirm)
            cont = confirm(confText);
        else
            cont = true;

        if (!cont)
            return;

        var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewDocument.aspx?';
        url += 'listID=' + options.ListID;
        url += '&itemID=' + options.ItemID;
        url += '&rnd=' + Math.random();

        var ajax = window.SM.GetXmlRequest();
        ajax.open("POST", url, true);
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                ajax.onreadystatechange = new Function();
                var response = ajax.responseText;

                var successed = false;
                if (response.indexOf('exception') != -1)
                    alert('Завершено с ошибками. Текст ошибки: ' + response);
                else if (response == 'ok') {
                    window.DocumentReviewStates[key] = true;
                    DR_DocumentReviewCompleated(link, options);
                    successed = true;
                }

                if (callback != null) {
                    //передаем флаг результата операции и страницу закрытия, если необходимо.
                    callback(successed, options.ClosePageUrl);
                }
                else {
                    //если указана страница закрытия документа, то переходим на нее.
                    if (!SM.IsNE(options.ClosePageUrl))
                        window.location.href = options.ClosePageUrl;
                }
            }
        }
        ajax.send(null);
    }
}

//Скрытие либо изменение текста ссылки после ознакомления.
function DR_DocumentReviewCompleated(link, options, hideLink) {
    if (!options)
        throw new Error('options is null');

    if (!link)
        throw new Error('link is null');

    //если разрешено повторное ознакомление
    if (options.RepeatedReviewEnabled && !options.CanSelectUser)
        $(link).text(window.TN.TranslateKey('dr.linktext.again'));
    else if (!options.CanSelectUser || hideLink) {
        var linkClass = link.className;
        if (!SM.IsNE(linkClass)) {
            linkClass = linkClass.toString().toLowerCase();

            if (linkClass == 'dbf_listform_toolbarlink') {
                //#region скрытие ссылки в тулбаре
                //скрываем ссылку, т.к. повторное ознакомление не доступно.
                var parentContainer = link.parentNode;
                var tryIndex = 0;
                while (parentContainer != null && parentContainer.className != 'dbf_listform_toolbar_tdlink' && tryIndex < 5) {
                    parentContainer = parentContainer.parentNode;
                    tryIndex++;
                }

                //нашли ячейку с контейнером ссылки тулбара
                if (parentContainer != null &&
                    parentContainer.className == 'dbf_listform_toolbar_tdlink'
                    && DBToolbar != null) {

                    parentContainer.style.display = 'none';

                    var toolbarRow = DBToolbar.ToolbarRow;
                    if (toolbarRow != null && toolbarRow.cells != null) {
                        var nextSplitter = null;
                        var i, len = toolbarRow.cells.length;
                        for (var i = 0; i < len; i++) {
                            var toolbarCell = toolbarRow.cells[i];
                            if (toolbarCell === parentContainer) {
                                //нашли текущую ячейку с ссылкой
                                //берем следующую ячейку разделителя и скрываем ее
                                var nextCellIndex = i + 1;
                                if (toolbarRow.cells.length > nextCellIndex) {
                                    nextSplitter = toolbarRow.cells[nextCellIndex];
                                    break;
                                }
                            }
                        }

                        //следующую ячейку скрываем, только если она разделитель
                        //чтобы при скрытии ссылок два разделителя не оказались вместе.
                        if (nextSplitter != null && !SM.IsNE(nextSplitter.className)
                            && nextSplitter.className.toString().toLowerCase() == 'dbf_listform_toolbar_tdseparator')
                            nextSplitter.style.display = 'none';
                    }
                }
                //#endregion
            }
            else if (linkClass == 'dbf_listform_toolbar_menu_link') {
                //скрытие ссылки в меню
                link.style.display = 'none';
            }
        }
    }

    alert(window.TN.TranslateKey('dr.alert.regular'));
}

function DR_ShowReviewUsers(listID, itemID, width, height) {
    var url = '/_LAYOUTS/WSS/WSSC.V4.DMS.EDMS/DocumentReview/ReviewinfoND.aspx?';
    url += 'listID=' + listID;
    url += '&itemID=' + itemID;
    url += '&rnd=' + Math.random();

    //popupWindow
    window.OpenPopupWindow(url, width, height, '19px 16px 10px 16px !important');
}