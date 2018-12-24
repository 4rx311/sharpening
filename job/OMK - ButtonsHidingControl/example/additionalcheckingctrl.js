/* Инициализация:
    - Добавление обработчика на изменение полей;
    - Переопределение функции ознакомления с документом.*/
function OMK_AdditionalCheckingCtrl_InitHandler() {
    var message = 'В карточку были внесены изменения. Сохранить?';
    var listFormHasChanged = false;
    var changeSolutionCounter = 0;

    for (var i = 0; i < ListForm.Fields.length; i++) {
        ListForm.Fields[i].AddChangeHandler(function (e) {
            if (e.Name == "Решения") {
                if (changeSolutionCounter > 0)
                    listFormHasChanged = true;
                else
                    changeSolutionCounter += 1;
            }
            else
                listFormHasChanged = true;
        });
    }

    if (window.DR_ReviewDocument) {
        window.DR_ReviewDocument = function () {
            return function (link, options, callback) {
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

                                var cmRes = OMK_CheckCommissionsFilled();

                                if (successed && (listFormHasChanged || (cmRes.Commissions.length > 0)) && confirm(message)) {

                                    var cmUpdateRes = OMK_UpdateFilledCommissions(cmRes.Commissions);
                                    if (cmUpdateRes) {
                                        alert(cmUpdateRes);
                                    }
                                    else {
                                        ListForm.Update();
                                    }
                                }
                                else
                                    window.location.href = options.ClosePageUrl;
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

                            var cmRes = OMK_CheckCommissionsFilled();

                            if (successed && (listFormHasChanged || (cmRes.Commissions.length > 0)) && confirm(message)) {

                                var cmUpdateRes = OMK_UpdateFilledCommissions(cmRes.Commissions);
                                if (cmUpdateRes) {
                                    alert(cmUpdateRes);
                                }
                                else {
                                    ListForm.Update();
                                }
                            }
                            else
                                window.location.href = options.ClosePageUrl;
                        }
                    }
                    ajax.send(null);
                }
            }
        }();
    }
}

// массив поручений.
function OMK_CheckCommissionsFilled() {
    var res = Array();

    var commissionsField = ListForm.GetField("Поручения");

    var isValid = true;

    if (commissionsField) {
        if (commissionsField.TypedField.Commissions) {
            var coms = commissionsField.TypedField.Commissions;

            var i = 0, len = coms.length;
            for (; i < len; i++) {
                if (coms[i].IsFilled() && coms[i].IsEditMode) {
                    res.push({ Commission: coms[i], IsValid: coms[i].Validate() });
                }
            }
        }
    }

    var resObj = { Commissions: res, IsValid: isValid };

    return resObj;
}

// обновление измененных поручений
function OMK_UpdateFilledCommissions(commissions) {
    var errMessage = '';

    var len = commissions.length;
    var i = 0;
    if (commissions) {
        for (; i < len; i++) {
            if (commissions[i].IsValid) {
                if (!errMessage)
                    errMessage = 'Невозможно заполнить поле поручения:\n';
                errMessage += commissions[i].IsValid + '\n';
            }
        }
    }

    if (!errMessage) {
        i = 0;
        for (; i < len; i++) {
            commissions[i].Commission.SaveClick();
        }
    }

    return errMessage;
}


