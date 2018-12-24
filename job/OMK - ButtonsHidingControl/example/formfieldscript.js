function SLField(itemInfo) {
    window.SLFConsts = new SLFConsts();
    window.SLFieldInstance = this;
    this.DBField = null;
    this.Changed = false;
    this.Hidden = false;
    this.IsChanged = SLField_IsChanged;
    this.SaveHandlers = new Array();
    this.InitHandlers = new Array
    this.AddSaveHandler = SLField_AddSaveHandler;
    this.AddInitHandler = SLField_AddInitHandler;
    this.ProcessSaveHandlers = SLField_ProcessSaveHandlers;
    this.ProcessInitHandlers = SLField_ProcessInitHandlers;
    this.ProcessSaveEventArgs = SLField_ProcessSaveEventArgs;
    this.Disable = SLField_Disable;
    this.Enable = SLField_Enable;
    this.IsEmptyValue = SLField_IsEmptyValue;

    //данные о карточке и базовые настройки
    this.ItemInfo = itemInfo;

    //результиющие значения поля "Решения"
    this.ResultInfo = new ResulInfo();
    this.HdnResultInfo = null;//хидден с параметрами поля решения

    this.SolutionTooltip = '';//подсказка к выбранному текущему решению
    this.SetParamsFromFloatWindow = false;//параметры всплывающего окна для выбранного решения
    this.SaveFormAfterCloseFloatWindow = true;//закрывать форму после закрытия всклывающего окна по решению
    this.WarningMode = 1; //0-показываем tooltip на решения, 1 - пишем красным под dropdownlist с решениями

    //разметка поля решения
    this.SolutionControl = null;//для нового дизайна ListControl
    this.SolutionCtrlDivContainer = null;
    this.SolutionHint = null;
    this.EditSolutionLink = null; //ссылка "Редатировать решение для нового дизайна"
    this.DivContainer = null;//контейнер в который добавляется список с решениями
    this.HiddenSolutionsDivContainer = null;
    this.HiddenSolutionsDivContainerTitle = null;
    this.SolutionButtonsDiv = null;

    //комментарии
    this.CommentBlock = null;
    this.CommentTR = null;
    this.CommentTD = null;
    this.V1_CommentTB = null;//text-box с комментарием (старый дизайн)
    this.CommentTA = null;//text-area с комментарием (новый дизайн)
    this.GetComment = SLField_GetComment;
    this.GetRemark = SLField_GetRemark;
    this.ReqiredCommemtMark = null;

    //замечания
    this.RemarkTR = null;
    this.RemarkTD = null;
    this.V1_RemarkTB = null;//text-box с комментарием (старый дизайн)
    this.RemarkTA = null;//text-area с комментарием (новый дизайн)
    this.RemarkCB = null;//чек-бокс "С замечаниями"

    //оповещения
    this.NotifyBlockTD = null;
    this.NotifyTitleNoBR = null;
    this.NotifyUsersTD = null;
    this.NotifyTitleTD = null;
    this.V1_NotifiersTB = null;
    this.OpenNotifiersBT = null;
    this.HdnSelectedNotifiers = null;
    this.HdnSelectedNotifiersNames = null;
    this.V1_SelectedNotifiersTooltip = null;

    //кнопка "Принять решение"
    this.IsSolutionChangedManual = false;//решение было изменено вручную

    this.CheckActualSolution = false;
    this.GetNewCondAccessToFieldsDisabled = false;

    //поля условий
    this.CondRequiredFields = new Array();
    this.CondRequiredFieldsStr = '';

    //выбранное решение
    this.SelectedSolution = null;
    this.SelectedSolutionName = '';

    this.StopCheckSaveConflict = false;

    //специальные функции
    this.InitProperties = SLField_InitProperties;

    //функции
    this.AddEmptyOption = SLField_AddEmptyOption;
    this.AddNoSolutionsOption = SLField_AddNoSolutionsOption;
    this.SaveResultInfo = SLField_SaveResultInfo;

    this.SetRequiredTooltip = SLField_SetRequiredTooltip;
    this.ChangeHistoryTBL = SLField_ChangeHistoryTBL;
    this.NeedChangeResetLayoutSizes = SLField_NeedChangeResetLayoutSizes;
    this.SetClientFieldValues = SLField_SetClientFieldValues;
    this.GenerateECP = WKF_ECP_Generate;
    this.SetValuesToFormFromSolutionWindow = SLField_SetValuesToFormFromSolutionWindow;
    this.OnSolutionChangeMain = SLField_OnSolutionChangeMain;
    this.ClearNotifyers = SLField_ClearNotifyers;
    this.GetFieldValue = SLField_GetFieldValue;
    this.IsEmptyMultiLookup = SLField_IsEmptyMultiLookup;
    this.SetRequiredFields = SLField_SetRequiredFields;
    this.CheckNotEmpties = SLField_CheckNotEmpties
    this.MeetUnitCondition = SLField_MeetUnitCondition;
    this.MeetCondition = SLField_MeetCondition;
    this.MeetNotEmpty = SLField_MeetNotEmpty;
    this.TestFieldByCondition = SLField_TestFieldByCondition;
    this.GetNewCondAccessToFields = SLField_GetNewCondAccessToFields;
    this.AddCondAccessFieldsHandlers = SLField_AddCondAccessFieldsHandlers;
    this.AddCondRequiredFieldsHandlers = SLField_AddCondRequiredFieldsHandlers;
    this.TestFieldByNotEmpty = SLField_TestFieldByNotEmpty;
    this.ShowNotifiersTooltip = SLField_ShowNotifiersTooltip;
    this.HideNotifiersTooltip = SLField_HideNotifiersTooltip;
    this.AddSolutionOption = SLField_AddSolutionOption;
    this.ClearSelectedSolution = SLField_ClearSelectedSolution;
    this.SetRemarkMode = SLField_SetRemarkMode;
    this.GetRequest = SLField_GetRequest;
    this.GetCurrentStage = SLField_GetCurrentStage;
    this.SetNextStage = SLField_SetNextStage;
    this.GetSelectedSolution = SPList_GetSelectedSolution;
    this.HideSolutionTooltip = SLField_HideSolutionTooltip
    this.ShowSolutionTooltip = SLField_ShowSolutionTooltip;
    this.CheckNotEmpties = SLField_CheckNotEmpties;
    this.GetDMSStateItem = SLField_GetDMSStateItem;
    this.GetDMSFieldValue = SLField_GetDMSFieldValue;
    this.GetDMSField = SLField_GetDMSField;
    this.SetSolutionHint = SLField_SetSolutionHint;
    this.CheckSaveConflict = SLField_CheckSaveConflict;
    this.GetSolutionFieldState = SLField_GetSolutionFieldState;
    this.CheckDelegateSolution = SLField_CheckDelegateSolution;
    this.CheckNotifySolution = SLField_CheckNotifySolution;
    this.CheckSolutionWithUsersChoise = SLField_CheckSolutionWithUsersChoise;
    this.IsSolutionWithMultipleChoise = SLField_IsSolutionWithMultipleChoise;
    this.HideSolution = SLField_HideSolution;
    this.ShowSolution = SLField_ShowSolution;
    this.OnSolutionChangeMain = SLField_OnSolutionChangeMain;
    this.SetSolutions = SLField_SetSolutions;
    this.SetDefaultSolution = SLField_SetDefaultSolution;
    this.InitSolutionAfterPostBack = SLField_InitSolutionAfterPostBack;
    this.CreateSolutionButton = SLField_CreateSolutionButton;
    this.RestoreLastSolution = SLField_RestoreLastSolution;

    //параметры из строки Request
    this.RequestParams = this.GetRequest();
    this.CheckIsCardWasUpdatedLimit = 3;

    //конфликт сохранения
    this.SaveConflictTimerID = null;

    this.Dispose = SLField_Dispose;
    this.Init = SLField_Init;

    //режим инициализации
    this.InitMode = false;
    //словарь с общими настройками окон подстановки для выбора значений из всплывающего окна
    this.WindowCommonSettingDic = new Array();

    this.DefaultCommentText = TN.Translate("Комментарий") + "...";
}

function SLField_Init() {
    this.InitMode = true;
    this.DBField = ListForm.GetField(SLFConsts.SolutionsConsts.FieldName);
    SM.AttachEvent(ListForm, 'OnSaveCompleted', WKF_DisableButton, this);

    if (ListForm.IsEditForm) {
        this.InitProperties();
        this.SetSolutions();
        this.InitSolutionAfterPostBack();

        //если не PostBack и не стоит отрисовка решений кнопками, то выставляем решение по умолчанию
        if (!this.ItemInfo.IsPostBack && !SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable)
            this.SetDefaultSolution();

        OnSolutionChange();

        this.SetRequiredFields();
        this.SetRequiredTooltip();
    }
    else {
        if (!this.Hidden)
            this.ChangeHistoryTBL();
    }
    //открываем поле Решения
    document.getElementById('mainSLFieldTbl').style.marginTop = 0;

    this.InitMode = false;
}

function SLField_InitSolutionAfterPostBack() {
    var xmlResult = this.HdnResultInfo.value;
    if (xmlResult == '') return false;

    var resultXmlDoc = SM.LoadXML(xmlResult);
    var solutionNode = resultXmlDoc.selectSingleNode("ResultInfo/Solution");
    var commentNode = resultXmlDoc.selectSingleNode("ResultInfo/Comment");
    if (solutionNode != null) {
        var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
        if (!solutionButtons) {
            var solutionName = '';
            if (SM.IsIE)
                solutionName = solutionNode.text;
            else
                solutionName = solutionNode.textContent;

            var tmpSolution = this.GetDMSStateItem(solutionName, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
            if (tmpSolution != null) {
                var tmpSolutionDispName = this.GetDMSFieldValue(tmpSolution, SLFConsts.SolutionsConsts.DisplayName);

                if (tmpSolution != null)
                    this.SolutionControl.SetValue({ Text: tmpSolutionDispName, Value: solutionName });

                this.SelectedSolution = tmpSolution;
                this.SelectedSolutionName = solutionName;
            }
        }
    }
    if (commentNode != null) {
        this.CommentTA.TextArea.value = $(commentNode).text();
    }
    return true;
}

function SLField_Disable() {
    var txtComments = this.CommentsBlock.children[0];
    if (this.NotifyUsersTD != null) {
        var txtNotifyUsers = this.NotifyUsersTD.children[0]; //input c id txtNotifiers
        var tdNotifyUsers = txtNotifyUsers.parentElement;

        txtNotifyUsers.onmouseover = null;
        tdNotifyUsers.onmouseout = null;
        this.OpenNotifiersBT.disabled = true;
    }
    this.SolutionControl.Disable();
    txtComments.readOnly = true;
}

function SLField_Enable() {
}

function SLField_AddSaveHandler(handler) {
    this.SaveHandlers.push(handler);
}

function SLField_AddInitHandler(handler) {
    this.InitHandlers.push(handler);
}

function SLField_IsChanged() {
    return this.Changed == true;
}

function GetSolutionField() {
    return window.SLFieldInstance;
}

//получение объекта основного окна (для вложенных окон - старый и новый дизайн)
function WKF_MainWindow_Popup() {
    if (WKF_IsNewDesign) return window;
    else return window.parent;
}

//обработчики для поля решения
function SLField_ProcessSaveHandlers(commonEventArgs) {
    var canSave = commonEventArgs.CanSave;

    var commonAlertMessage = commonEventArgs.CommonAlert;

    //запуск обработчиков на поле Решения
    if (canSave) {
        len = this.SaveHandlers.length;
        for (i = 0; i < len; i++) {
            var handler = this.SaveHandlers[i];
            if (handler != null) {
                var saveEventArgs = new DBListFormSaveEventArgs();
                handler(saveEventArgs);
                this.ProcessSaveEventArgs(saveEventArgs, commonEventArgs);
            }
        }
    }
}

function SLField_ProcessSaveEventArgs(saveEventArgs, commonEventArgs) {
    var stCommonAlert = commonEventArgs.CommonAlert;
    if (stCommonAlert == null) stCommonAlert = "";

    if (!saveEventArgs.CanSave)
        commonEventArgs.CanSave = false;

    //alerts
    if (!window.SM.IsNE(saveEventArgs.CommonAlertMessage)) {
        if (stCommonAlert.length > 0)
            stCommonAlert += '\n\r';
        stCommonAlert += saveEventArgs.CommonAlertMessage;
    }

    commonEventArgs.CommonAlert = stCommonAlert;
}

function SLField_ProcessInitHandlers() {
    var len = this.InitHandlers.length;
    for (i = 0; i < len; i++) {
        var handler = this.InitHandlers[i];
        if (handler != null)
            handler();
    }
}

function SLField_IsEmptyValue() {
    //решение
    if (this.SelectedSolution != null) return true;
    return false;
}




//-------------------------------------------------------------------------------------------
//инициализация контролов решения
function WKF_InitSolutionControl() {

    var thisObj = window.SLFieldInstance;
    if (thisObj.SolutionCtrlDivContainer != null) {
        var oldSolutionListCtrl = thisObj.SolutionCtrlDivContainer.children[0];
        if (oldSolutionListCtrl != null)
            thisObj.SolutionCtrlDivContainer.removeChild(oldSolutionListCtrl);
    }
    var listControl = new ListControl();
    thisObj.SolutionControl = listControl;
    listControl.IsMultiple = false;
    listControl.IsDropDownList = true;
    listControl.WrapGrid = true;
    listControl.RemovableValue = false;
    listControl.Init();
    thisObj.SolutionCtrlDivContainer.appendChild(listControl.Container);

    listControl.OnSetGridValue = function (objVal) {
        var solutionName = objVal.Value;
        thisObj.IsChange = true;
        thisObj.SelectedSolution = thisObj.GetDMSStateItem(solutionName, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
        thisObj.SelectedSolutionName = solutionName;
        OnSolutionChange();
    }
    listControl.SetControlWidth(thisObj.ItemInfo._SolutionListWidth + 'px');

}

function WKF_ShowExtentedSolutionHistoryLink() {
    //открытие ссылки "Расширенная история решений"
    var lnkHistoryTD = document.getElementById('lnkHistoryTD');
    if (lnkHistoryTD != null) {
        var nobrElem = lnkHistoryTD.children[0];
        if (nobrElem != null) {
            if (nobrElem.children != null)
                if (nobrElem.children.length > 0) {
                    var linkObj = nobrElem.children[0];
                    if (linkObj != null) linkObj.style.display = '';
                }
        }
    }
}

function WKF_GetStringForTemplates(templates) {
    var userTemplatesList = null;
    if (templates != null) {
        userTemplatesList = new Array();
        for (var i = 0; i < templates.length; i++) {
            var userTemplate = templates[i];
            if (userTemplate != null && userTemplate != '')
                userTemplatesList.push(userTemplate.Text);
        }
    }
    return userTemplatesList;
}

function SLField_InitProperties() {
    var solutionField = window.ListForm.GetField(SLFConsts.SolutionsConsts.FieldName);
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    //если стоит время на конфликт сохранения и включен режим скриптового UnsafeUpdate, 
    //то подменяем время на проверку конфликт сохранения
    if (this.ItemInfo.UnsafeUpdateEnable)
        window.SLFieldInstance.CheckIsCardWasUpdatedLimit = this.ItemInfo.UnsafeUpdateLimitTime * 60;

    this.Hidden = solutionField.Hidden;

    this.DivTooltip = window.document.getElementById('divSolutionToolTip');
    this.EditSolutionLink = window.document.getElementById('tooltipLink');

    this.DivContainer = window.document.getElementById('solutionDiv');
    this.SolutionButtonsDiv = window.document.getElementById('solutionButtonsDiv');
    this.HiddenSolutionsDivContainer = window.document.getElementById('hiddenSolutionDiv');
    this.HiddenSolutionsDivContainerTitle = window.document.getElementById('hiddenSolutionTitleDiv');

    if (SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable) {
        if (SLFieldInstance.ItemInfo.SolutionsParams.ShowHidenSolutionsByClick) {
            this.HiddenSolutionsDivContainer.onclick = WKF_ShowHiddenSolutionButtonDiv;
            this.HiddenSolutionsDivContainerTitle.onclick = WKF_ShowHiddenSolutionButtonDiv;
        }
        else {
            this.HiddenSolutionsDivContainer.onmouseover = WKF_ShowHiddenSolutionButtonDiv;
            //this.HiddenSolutionsDivContainer.onmouseout = WKF_HideSolutionButtonDiv;
            this.HiddenSolutionsDivContainerTitle.onmouseover = WKF_ShowHiddenSolutionButtonDiv;
        }
    }

    this.SolutionCtrlDivContainer = window.document.getElementById('solutionListDiv');

    this.ReqiredCommemtMark = document.getElementById('reqiredCommemtMarkID');

    //ширина для dropDownList c решениями
    this.ItemInfo._SolutionListWidth = this.ItemInfo.FieldWidth;
    if (window.SM.DTD)
        this.ItemInfo._SolutionListWidth = this.ItemInfo.FieldWidth;//+ 2

    if (!SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable)
        WKF_InitSolutionControl();

    this.CommentTD = window.document.getElementById('tdCommentsBlock');
    this.RemarkTD = window.document.getElementById('tdRemarksBlock');


    var styles = {};
    //ширина
    var commentWidth = this.ItemInfo.FieldWidth;
    if (solutionButtons) commentWidth = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonWidth + 8;
    styles.width = commentWidth + 'px';

    var userTemplates = WKF_GetStringForTemplates(this.ItemInfo.UserTemplates);


    //создание контрола комментария
    this.CommentTA = new ResizableAreaControl({
        Container: this.CommentTD,
        Styles: styles,
        Templates: userTemplates,
        NoRounded: true,
        TemplateSeparator: ' ',
        Rows: 2
    });


    this.CommentTA.InitControl();

    if (solutionButtons) {
        this.CommentTA.TextArea.value = this.DefaultCommentText;
        this.CommentTA.TextArea.onchange = WKF_CommentOnChange;
        this.CommentTA.TextArea.AttachEvent("OnChange", WKF_CommentOnChange);
        if (window.addEventListener != null) {
            this.CommentTA.TextArea.addEventListener("blur", WKF_CommentFocusOut, false);
            this.CommentTA.TextArea.addEventListener("focus", WKF_CommentFocusIn, false);

        }
        else {
            this.CommentTA.TextArea.attachEvent("onblur", WKF_CommentFocusOut);
            this.CommentTA.TextArea.attachEvent("onfocus", WKF_CommentFocusIn);
        }
        //this.CommentTD.onfocusout = WKF_CommentFocusOut;
        //this.CommentTD.onfocusin = WKF_CommentFocusIn;
    }


    if (this.ItemInfo.InitComment != '' && this.ItemInfo.InitComment != null)
        this.CommentTA.TextArea.value = this.ItemInfo.InitComment;

    //контрол с замечаниями
    this.RemarkTA = new ResizableAreaControl({
        Container: this.RemarkTD,
        Styles: styles,
        Templates: userTemplates,
        NoRounded: true,
        TemplateSeparator: ' ',
        Rows: 2
    });

    this.RemarkTA.InitControl();

    var notifyContainerTbl = document.getElementById('notifyBlockMainTbl');
    var notifyBlockMainTD = document.getElementById('notifyBlockMainTD');
    notifyBlockMainTD.style.width = (this.ItemInfo.FieldWidth - 22) + 'px';
    var notifyMainDiv = document.getElementById('notifyConteinerDiv');
    notifyMainDiv.style.width = (this.ItemInfo.FieldWidth - 2) + 'px';


    //размеры div с историей решений делаем как таблица (если высота маленькая)
    if (!this.Hidden)
        this.ChangeHistoryTBL();

    if (!solutionButtons && !this.ItemInfo.HideSelectSolutionOption)
        this.AddEmptyOption();

    this.CommentTR = document.getElementById('commentTR');

    this.RemarkTR = document.getElementById('remarkTR');

    var remarkTD = document.getElementById('cbRemarkButtonsTD');
    if (remarkTD != null) this.RemarkCB = remarkTD.children[0];
    else this.RemarkCB = this.DivContainer.children[1];

    this.RemarkCB.onclick = OnRemarkCBChange;

    this.NotifyUsersTD = document.getElementById('notifyUsersTD');
    this.NotifyTitleTD = document.getElementById('notifyTitleTD');
    this.NotifyTitleNoBR = document.getElementById('notifyTitleNoBR');
    this.NotifyBlockTD = document.getElementById('notifyBlockTD');
    this.V1_NotifiersTB = document.getElementById('txtNotifiers');

    this.CommentsBlock = document.getElementById('tdCommentsBlock');
    this.OpenNotifiersBT = document.getElementById('btnOpenNotifiers');

    this.HdnSelectedNotifiers = document.getElementById('hdnSelectedNotifiers');
    this.HdnSelectedNotifiersNames = document.getElementById('hdnSelectedNotifierNames');
    this.V1_SelectedNotifiersTooltip = document.getElementById('divUsersTitle');

    this.HdnResultInfo = document.getElementById('infoDiv').children[0];
    this.SolutionHint = document.getElementById('solutionHint');

    //WSSC_TS_SaveAllSections = window.SaveAllSections;
    //WSSC_CustomUpdateSolutionList = window.CustomUpdateSolutionList;
    window.FLS_DisableOKOnFileUploading = false;

    window.ListForm.AddPreSaveHandler(WKF_BeforeAcceptSolution);
    window.ListForm.AddSaveHandler(WKF_AcceptSolution);

    if (this.ItemInfo.CheckSaveConflict)
        this.CheckSaveConflict();

    //функция для добавления обработчиков для обязательности полей
    this.AddCondRequiredFieldsHandlers();

    //функция для изменения условного доступа
    this.AddCondAccessFieldsHandlers();

    //вызываем обработчики, которые должны быть после инициализации поля Решения
    if (window.SLFieldInstance != null)
        if (window.SLFieldInstance.InitHandlers != null)
            window.SLFieldInstance.ProcessInitHandlers();

    //установка ширины контролов

    if (this.V1_NotifiersTB != null)
        this.V1_NotifiersTB.style.width = (this.ItemInfo.FieldWidth - 20) + 'px';

    //считывание alert, который нужно выдать
    var dmsAlert = this.RequestParams['dmsAlert'];
    var doNotCloseCard = this.RequestParams['doNotCloseCard'] == 'true';
    this.DoNotCloseCard = doNotCloseCard;
    if (dmsAlert != null) {
        var tmpDmsAlert = decodeURI(dmsAlert);
        tmpDmsAlert = tmpDmsAlert.split('_eql_');
        tmpDmsAlert = tmpDmsAlert.join('=');

        this.DMSAlert = tmpDmsAlert;
        this.InitDMSAlert = dmsAlert;
        window.setTimeout(WKF_ShowDMSAlert, 1000);
    }

    //добавление обработчика для Dispose объектов
    $(window).onunload = function () { window.SLFieldInstance.Dispose(); };
}

function WKF_CommentOnChange() {
    var commentTA = SLFieldInstance.CommentTA.TextArea;
    var defaultText = SLFieldInstance.DefaultCommentText;
    var comment = commentTA.value;
    if (comment.indexOf(defaultText) == 0)
        commentTA.value = comment.replace(defaultText + ' ', '');
}

function WKF_CommentFocusIn() {
    var commentTA = SLFieldInstance.CommentTA.TextArea;
    var defaultText = SLFieldInstance.DefaultCommentText;
    var comment = commentTA.value;
    if (comment == defaultText)
        commentTA.value = '';

}

function WKF_CommentFocusOut() {
    var commentTA = SLFieldInstance.CommentTA.TextArea;
    var defaultText = SLFieldInstance.DefaultCommentText;
    if (commentTA.value == '')
        commentTA.value = defaultText;
}

function SLField_ClearSelectedSolution() {
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    //выпадающий список с решениями
    if (!solutionButtons) {
        var emptyChoiceValue =
        {
            Text: SLFConsts.SolutionsConsts.DefaultText,
            Value: SLFConsts.SolutionsConsts.DefaultText
        }
        this.SolutionControl.SetValue(emptyChoiceValue);
    }
    //решения-кнопки
    else {
        this.SolutionButtonsDiv.innerHTML = '';
        this.CommentTD.style.display = 'none';
        WKF_SetNoSolutionsText(this);
    }
}

function SLField_ChangeHistoryTBL() {
    //открытие ссылки "Расширенная история решений"
    WKF_ShowExtentedSolutionHistoryLink();

    //если поле скрыто, то не меняем ширину
    if (this.DBField.Hidden) return;

    //размеры div с историей решений делаем как таблица (если высота маленькая)
    var solutionHistoryTBL = document.getElementById('solHistoryTBL');
    if (solutionHistoryTBL != null) {
        var parentSolutionHistoryDiv = solutionHistoryTBL.parentElement;
        if (solutionHistoryTBL.offsetHeight < parentSolutionHistoryDiv.offsetHeight) {
            parentSolutionHistoryDiv.style.height = solutionHistoryTBL.offsetHeight + 'px';
        }
        var hasScroll = false;

        var checkOffsetHeight = parentSolutionHistoryDiv.offsetHeight;
        if (SM.IEVersion >= 9) checkOffsetHeight = checkOffsetHeight + 1;

        if (parentSolutionHistoryDiv.scrollHeight > checkOffsetHeight)
            hasScroll = true;

        //выравнивание высоты
        if (!hasScroll && (SM.IEVersion >= 9) && parentSolutionHistoryDiv.scrollHeight > parentSolutionHistoryDiv.offsetHeight)
            parentSolutionHistoryDiv.style.height = parentSolutionHistoryDiv.scrollHeight + 'px';

        if (solutionHistoryTBL.rows.length > 0 && hasScroll) {
            var headerContainer = document.getElementById('solutionHistoryHeader');
            var scrollContainer = document.getElementById('solutionHistoryTD').children[1];
            scrollContainer.style.width = (this.ItemInfo.FieldWidth - 1) + 'px';
            scrollContainer.style.borderBottom = 'solid 1px #88a6be';
            scrollContainer.style.borderRight = 'solid 1px #88a6be';
            window.SM.CreateFixedHeader(solutionHistoryTBL, headerContainer, scrollContainer);
            solutionHistoryTBL.style.width = null;
            //установка ширины контейнера
            headerContainer.style.width = this.ItemInfo.FieldWidth + 'px';
            scrollContainer.style.overflowY = 'scroll';
            scrollContainer.style.overflowX = 'hidden';

            //меняем ширину столбцов на 4 px
            var headerTBL = headerContainer.children[0];

            /*if(!window.SM.IsIE)
            {
                var newHeaderWidth = (new Number(headerTBL.style.width.replace('px', '')) - 2) + 'px';//-3
                headerTBL.style.width = newHeaderWidth;
            }*/

            headerTBL.style.width = "100%";//headerContainer.style.width;
            var userTD = headerTBL.rows[0].cells[0];
            var solutionsTD = headerTBL.rows[0].cells[1];
            userTD.style.width = '119px';

            var scrollWidthDefault = 16;
            var scrollWidth = scrollContainer.offsetWidth - 1 - scrollContainer.clientWidth;


            if (window.SM.IsIE) scrollWidthDefault = 17;//isIE9 || isIE8
            if (window.SM.IsSafari) scrollWidthDefault = 15;
            if (scrollWidth < scrollWidthDefault) scrollWidth = scrollWidthDefault;
            var solutionWidth = this.ItemInfo.FieldWidth - 125 - 6 - 3 - scrollWidth;
            var solutionWidthHeader = this.ItemInfo.FieldWidth - 125 - 6 - 3;

            solutionsTD.style.width = solutionWidthHeader + 'px';

            for (var k = 0; k < solutionHistoryTBL.rows.length; k++) {
                var solutionTD = solutionHistoryTBL.rows[k].cells[1];
                var solutionDiv = solutionTD.children[0];
                //solutionTD.style.width = solutionWidth + 'px';
                if (solutionDiv != null)
                    solutionDiv.style.width = solutionWidth + 'px';
            }

            //отступ на 2 px
            solutionHistoryTBL.style.marginTop = '-21px';
            //если у таблицы высота меньше, чем у дива, то меняем высоту дива
            var checkHeightTBL = solutionHistoryTBL.offsetHeight - 25;
            if (checkHeightTBL < scrollContainer.offsetHeight) {
                scrollContainer.style.height = checkHeightTBL + 'px';
                //if(window.SM.IsIE) solutionsTD.style.width = solutionWidth + 'px';
            }
        }
    }
}

//клиентское получение значений полей для серверного скрытия полей
function SLField_GetFieldValue(fieldObj) {
    if (fieldObj == null) return null;
    if (!fieldObj.ReadOnly) return fieldObj.GetValue();
    var valObj = fieldObj.GetValue();
    if (valObj == null) return null;

    switch (fieldObj.Type) {
        case 'DBFieldText':
        case 'DBFieldMultiLineText':
        case 'DBFieldChoice':
        case 'DBFieldNumber':
        case 'DBFieldInteger':
        case 'DBFieldDateTime':
            {
                return valObj;
            }
        case 'DBFieldBoolean':
            {
                return valObj == "True";
            }
        case 'DBFieldLookupSingle':
            {
                var lookupID = valObj.getAttribute('LookupID');
                if (lookupID != null) {
                    var lookupText = valObj.getAttribute('LookupText');
                    var lookupUrl = valObj.getAttribute('LookupUrl');
                    var lookupObj = new Object();
                    lookupObj.LookupID = new Number(lookupID);
                    lookupObj.LookupText = lookupText;
                    lookupObj.LookupUrl = lookupUrl;
                    return lookupObj;
                }
                break;
            }
        case 'DBFieldLookupMulti':
            {
                var lookupNodes = valObj.childNodes;
                if (lookupNodes != null) {
                    var multiLookupVal = new Array();
                    for (var i = 0; i < lookupNodes.length; i++) {
                        var lookupNode = lookupNodes[i];
                        if (lookupNode.tagName != "LookupValue") continue;
                        var lookupID = lookupNode.getAttribute('LookupID');
                        if (lookupID != null) {
                            var lookupText = lookupNode.getAttribute('LookupText');
                            var lookupUrl = lookupNode.getAttribute('LookupUrl');
                            var lookupObj = new Object();
                            lookupObj.LookupID = new Number(lookupID);
                            lookupObj.LookupText = lookupText;
                            lookupObj.LookupUrl = lookupUrl;
                            multiLookupVal.push(lookupObj);
                        }
                    }
                    return multiLookupVal;
                }
                break;
            }
    }
    return null;

}


//получение параметров Request
function SLField_GetRequest() {
    var htParams = new Array();
    try {
        var splitedUrl = window.location.href.split('?');
        if (splitedUrl.length <= 1) return;
        var stParams = splitedUrl[1];
        var arParams = stParams.split('&');

        var i, len = arParams.length;
        for (i = 0; i < len; i++) {
            var paramPair = arParams[i].split('=');
            if (paramPair.length = 2) {
                htParams[paramPair[0]] = paramPair[1];
            }
        }
    }
    catch (e) { alert('Возникла ошибка при получении параметров из url страницы.\nОписание ошибки:GetRequest - ' + e.message + '.'); }
    return htParams;
}




//-------------------------------------------------------------------------------------------
//обработка элементов разметки
function SLField_AddEmptyOption() {
    var emptyChoiceValue =
    {
        Text: SLFConsts.SolutionsConsts.DefaultText,
        Value: SLFConsts.SolutionsConsts.DefaultText
    }
    this.SolutionControl.AddGridRow(emptyChoiceValue.Text, emptyChoiceValue.Value);
    this.SolutionControl.SetValue(emptyChoiceValue);
}

function SLField_AddNoSolutionsOption() {
    var noSolutionsValue =
    {
        Text: SLFConsts.SolutionsConsts.NoSolutionsText,
        Value: SLFConsts.SolutionsConsts.NoSolutionsText
    }
    this.SolutionControl.AddGridRow(noSolutionsValue.Text, noSolutionsValue.Value);
    this.SolutionControl.SetValue(noSolutionsValue);
}

//добавление решение в список решений
function SLField_AddSolutionOption(stateItem, setLikeDefaultParam, hideSolutionButton) {
    var fieldsCol = stateItem.Fields;
    if (fieldsCol == null) return;
    //название решения
    var fldTitle;
    //отображаемое название решения
    var fldDisplayTitle;
    for (var i = 0; i < fieldsCol.length; i++) {
        var tmpField = fieldsCol[i];
        //получаем название решения
        if (tmpField.Title == SLFConsts.SolutionsConsts.Name)
            fldTitle = tmpField.Value;
        //получаем отображаемое название решения
        if (tmpField.Title == SLFConsts.SolutionsConsts.DisplayName)
            fldDisplayTitle = tmpField.Value;
    }
    //добавление option в список Решений
    if (fldTitle != null && fldDisplayTitle != null) {
        var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;

        if (!solutionButtons) {
            this.SolutionControl.AddGridRow(fldDisplayTitle, fldTitle);
            var setLikeDefault = setLikeDefaultParam;
            if (setLikeDefault == null) setLikeDefault = false;
            if (setLikeDefault) {
                var solutionValObj =
                {
                    Text: fldDisplayTitle,
                    Value: fldTitle
                }
                this.SolutionControl.SetValue(solutionValObj);
            }
        }
        else {
            //добавление кнопки
            this.CreateSolutionButton(fldTitle, fldDisplayTitle, hideSolutionButton);
        }

    }
}
function SLField_NeedChangeResetLayoutSizes(visible) {
    if (this.NotifyTitleTD.style.display != visible || this.NotifyBlockTD.style.display != visible)
        return true;
    return false;
}

//функция, вызываемая при смене решения
function OnSolutionChange() {
    var solutionFld = window.SLFieldInstance;

    if (!solutionFld.CheckSolutionWithUsersChoise())
        return;

    window.SolutionWindow = null;
    solutionFld.SolutionTooltip = '';
    solutionFld.SetParamsFromFloatWindow = false;
    solutionFld.SaveFormAfterCloseFloatWindow = true;
    solutionFld.IsSolutionChangedManual = true;
    //обязательность комментария по решению
    if (solutionFld.SelectedSolution != null) {
        var needComment = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.CommentRequired);
        if (needComment.toLowerCase() == 'true')
            solutionFld.ReqiredCommemtMark.style.display = '';
        else
            solutionFld.ReqiredCommemtMark.style.display = 'none';
    }
    //не выбрано решение
    else {
        solutionFld.ReqiredCommemtMark.style.display = 'none';
    }
    //простановка обязательных полей
    solutionFld.SetRequiredFields();
    //очистка всех оповещаемых при смене решения         
    solutionFld.ClearNotifyers();
    solutionFld.OnSolutionChangeMain();
    solutionFld.IsSolutionChangedManual = false;
    //сбрасываем признак ручной регистрации
    solutionFld.ResultInfo.IsSetManualRegNum = false;
    solutionFld.ResultInfo.SetFields = '';
    solutionFld.ResultInfo.DelegateUserID = 0;
    window.SLFieldInstance.Changed = true;
    ShowWindowWithSolutionParams(true);
    //проверка на решение делегирования
    solutionFld.CheckDelegateSolution();
    solutionFld.CheckNotifySolution();

    //вызов обработчиков при смене решения
    solutionFld.Custom_SolutionFloatWindow = null;
    solutionFld.Custom_SolutionFloatWindowResults = null;
    solutionFld.ListFormField.OnChange();
    solutionFld.Changed = true;
}


function SLField_OnSolutionChangeMain() {
    var solutionButtons = this.ItemInfo.SolutionsParams.SolutionButtonsEnable;

    var selectedSolution = this.SelectedSolution;

    //вывод подсказки к решению
    if (!solutionButtons)
        this.SetSolutionHint(selectedSolution);
    var selectedSolutionTitle = this.SelectedSolutionName;
    var needChangeLayoutSizes = this.NeedChangeResetLayoutSizes('none');
    this.NotifyTitleTD.style.display = 'none';
    this.NotifyBlockTD.style.display = 'none';
    if (needChangeLayoutSizes) SM.ResetFormLayout();

    if (selectedSolution != null) {
        //скрытие/отображение блока Замечания
        var showRemarkBlock = this.GetDMSFieldValue(selectedSolution, SLFConsts.SolutionsConsts.ShowRemarksBlock).toLowerCase() == 'true';

        if (showRemarkBlock) {
            this.RemarkTD.style.display = '';
            this.RemarkCB.style.display = '';
            var newWidth = new Number(this.ItemInfo.FieldWidth) - 100;
            if (newWidth < 0) newWidth = this.ItemInfo._SolutionListWidth;

            if (!solutionButtons)
                this.SolutionControl.SetControlWidth(newWidth + 'px'); //400;

            if (this.RemarkCB.checked)
                this.SetRemarkMode(true);
            else
                this.SetRemarkMode(false);

        }
        else {
            this.RemarkTD.style.display = 'none';
            this.RemarkCB.style.display = 'none';

            if (!solutionButtons)
                this.SolutionControl.SetControlWidth(this.ItemInfo._SolutionListWidth + 'px');

            this.SetRemarkMode(false);
        }

        //скрытие блока Оповестить
        var showNotifyBlock = this.GetDMSFieldValue(selectedSolution, SLFConsts.SolutionsConsts.ShowNotifyBlock).toLowerCase() == 'true';
        var windowCommonSettingName = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.CommonSettingForWindow);

        if (showNotifyBlock || this.SelectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution) {
            var needChangeLayoutSizes = this.NeedChangeResetLayoutSizes('');
            this.NotifyTitleTD.style.display = '';
            this.NotifyBlockTD.style.display = '';
            //выставляем текст выбора элементов
            var textSelectElements = this.GetDMSFieldValue(selectedSolution, SLFConsts.SolutionsConsts.TextSelectElements);
            $(this.NotifyTitleNoBR).text(textSelectElements + ':');

            if (needChangeLayoutSizes) window.SM.ResetFormLayout();
        }

        if (this.IsSolutionChangedManual) {
            this.ResultInfo.Solution = selectedSolutionTitle;
        }
        else {
            if (this.ResultInfo.Solution != '')
                this.CheckActualSolution = true;
        }

        this.SetNextStage();

        var openNotifiersBT = document.getElementById('btnOpenNotifiers');
        if (openNotifiersBT != null) openNotifiersBT.disabled = false;
    }
    else {
        this.RemarkTD.style.display = 'none';
        if (!solutionButtons)
            this.SolutionControl.SetControlWidth(this.ItemInfo._SolutionListWidth + 'px');

        this.SetRemarkMode(false);
    }
    //кастом проверка решений
    if (window.CustomOnSolutionCheck != null)
        window.CustomOnSolutionCheck(this.SolutionControl, this.ItemInfo.CurrentStage);
}

//скрытие или показ блока "Замечания" в зависимости от выставленной галочки "С замечаниями"
function OnRemarkCBChange() {
    var solutionFld = window.SLFieldInstance;
    var noDisplayRemark = solutionFld.RemarkCB.style.display == 'none';
    if (!noDisplayRemark) {
        var commentTD_title = solutionFld.CommentTR.children[0];
        var commentTD_tb = solutionFld.CommentTD;

        var remarkTD_title = solutionFld.RemarkTR.children[0];
        var remarkTD_tb = solutionFld.RemarkTD;

        if (solutionFld.RemarkCB.checked) {
            commentTD_title.style.display = 'none';
            commentTD_tb.style.display = 'none';

            remarkTD_title.style.display = '';
            remarkTD_tb.style.display = '';
        }
        else {
            commentTD_title.style.display = '';
            commentTD_tb.style.display = '';

            remarkTD_title.style.display = 'none';
            remarkTD_tb.style.display = 'none';
        }
    }
}

//скрытие/раскрытие комментария
function ExpandOrCollapseComment() {
    ExpandOrCollapseRemarkOrComment("commentTR");
    ExpandOrCollapseRemarkOrComment("remarkTR");
}

//скрытие/раскрытие комментария (внутрення функция)
function ExpandOrCollapseRemarkOrComment(trID) {
    var tr = document.getElementById(trID);
    var aImg = tr.children[0].children[1].children[0].parentElement;
    var imgPlus = "<img border='0px' src='/_layouts/images/plus.gif'/>";
    var imgMinus = "<img border='0px' src='/_layouts/images/minus.gif'/>";
    var commentTextBox = aImg.parentElement.parentElement.nextSibling.children[0].children[0];
    var oldInnerHTML = aImg.innerHTML;
    if (oldInnerHTML.replace('/_layouts/images/plus.gif', '') != oldInnerHTML) {
        commentTextBox.rows = 12;
        aImg.innerHTML = imgMinus;
    }
    else {
        commentTextBox.rows = 2;
        aImg.innerHTML = imgPlus;
    }
}

//TOOLTIP для решений
function ShowSolutionTooltip() {
    window.SLFieldInstance.ShowSolutionTooltip();
}

function SLField_ShowSolutionTooltip() {
}

function SLField_SetSolutionHint(solutionItem) {
    if (solutionItem == null) {
        $(this.SolutionHint).text('');
    }
    else {
        var solutionHint = this.GetDMSFieldValue(solutionItem, SLFConsts.SolutionsConsts.Hint);
        this.SolutionHint.innerHTML = solutionHint;
    }

}
//скрытие подсказки на решение
function SLField_HideSolutionTooltip() {

}

function HideSolutionTooltip() {
    window.SLFieldInstance.HideSolutionTooltip();
}

//-------------------------------------------------------------------------------------------
//обязательность полей по решениям и на этапах
function SLField_SetRequiredTooltip() {
    //вывод необходимости заполнить поля
    var setRequiredFields = this.RequestParams['setRequiredFields'] == 'true';
    if (setRequiredFields) {
        var fields = window.ListForm.Fields;
        if (fields != null) {
            for (var i = 0; i < fields.length; i++) {
                var fieldObj = fields[i];
                if (fieldObj.ReadOnly) continue;
                if (!fieldObj.Required) continue;
                if (fieldObj.IsEmptyValue()) fieldObj.ShowRequired();
            }
        }
    }
}


//--условная обязательность полей (добавление обработчиков)
//перед прекреплением обработчиков уже были проверены условия
//и выставлены флаги Required у полей
//поэтому в этой функции вызывается DrawRequred.
//эта функция вызвается после установки решения по умолчанию.
//вызывается только при загрузке страницы.
function SLField_AddCondRequiredFieldsHandlers() {
    if (this.ItemInfo.CondRequiredFields != null && this.ItemInfo.CondRequiredFields != '') {
        var condRequiredFieldNames = this.ItemInfo.CondRequiredFields.split(';');
        //идем в цикле по условно-обязательным полям.
        for (var i = 0; i < condRequiredFieldNames.length; i++) {

            var fieldObj = ListForm.GetField(condRequiredFieldNames[i]);
            if (fieldObj == null) continue;
            if (fieldObj.ReadOnly) continue;

            if (!fieldObj.IsSetCondRequiredHandler) {
                //прикрепляем обработчик, при срабатании которого 
                //будет проверяться условная обязательность и выставляться.
                fieldObj.AddChangeHandler(this.SetRequiredFields);
                fieldObj.IsSetCondRequiredHandler = true;
            }
        }
    }
}

//доступ к полям по условиям
function SLField_SetRequiredFields() {
    var solutionFld = window.SLFieldInstance;

    //простановка признака Reqired и установка звездочек
    var reqiredFields = solutionFld.CheckNotEmpties();

    //сброс обязательности для условных полей
    if (solutionFld.ItemInfo.CondRequiredFields != null && solutionFld.ItemInfo.CondRequiredFields != '') {
        var condRequiredFieldNames = solutionFld.ItemInfo.CondRequiredFields.split(';');
        for (var i = 0; i < condRequiredFieldNames.length; i++) {
            var fieldName = condRequiredFieldNames[i];
            var fieldObj = ListForm.GetField(fieldName);
            if (fieldObj == null) continue;
            if (fieldObj.ReadOnly) continue;
            //обязательные поля на уровне списка не трогаем
            if (fieldObj.OriginalRequired) continue;
            //снимаем обязательность поля
            if (reqiredFields[fieldName] == null) fieldObj.SetOriginalRequired();
        }
    }
}

//Условия, обязательные поля и простановка значений
//true - условия выполнены, false - условия не выполнены
//changeFunc - функция, которая будет вызвана, если изменится хотя бы одно поле в условии
function SLField_TestFieldByCondition(condField, condValue, criteriaValue, changeFunc) {
    //стандартные поля
    var testResult = false;
    var condType = '';
    if (criteriaValue == null) criteriaValue = 'e';
    var criteriaValue = criteriaValue.toLowerCase();

    if (condField != null && condField != '' && condValue != null)//убрано condValue != ''
    {
        var sourceFieldObj = ListForm.GetField(condField);
        if (sourceFieldObj == null) {
            //если поля нет в карточке, то условие считаем false
            //alert('Невозможно проверить условие на решение. Отсутствует поле "' + condField + '" заданное в условии.\r\nПроверьте валидатором процесс.');
            return false;
        }

        condType = sourceFieldObj.Type;
        var sourceFieldValue = '';
        if (condType != 'DBFieldFiles' && condType != 'CMField' && condType != 'NFField') sourceFieldValue = this.GetFieldValue(sourceFieldObj);
        if (!sourceFieldObj.IsSetCondsHandler) {
            sourceFieldObj.AddChangeHandler(changeFunc);
            sourceFieldObj.IsSetCondsHandler = true;
        }

        if (sourceFieldValue == null && condType != 'DBFieldFiles' && condType != 'AgreementBlockField' && condType != 'MSLField' && condType != 'DBFieldLink') {
            switch (criteriaValue) {
                case 'ne': testResult = condValue != ''; break;
                case 'e': testResult = condValue == ''; break;
            }
            return testResult; //возвращаем true, если нет поля в карточке, т.е. не можем проверить условие
        }

        //проверка если в value задано название поля
        var condValChars = condValue.split('');
        if (condValChars.length > 0) {
            if (condValChars[0] == '[' && condValChars[condValChars.length - 1] == ']' && condValue != '[Сегодня]' && condValue != '[Сейчас]' && condValue != '[Я]') {
                var checkFieldName = condValue.replace('[', '').replace(']', '');
                var checkFieldObj = ListForm.GetField(checkFieldName);
                condValue = this.GetFieldValue(checkFieldObj);

                if (checkFieldObj.Type == 'DBFieldLookupSingle') {
                    //обработка для поля подстановки
                    var tmpLookupID = '';
                    if (condValue != null)
                        if (condValue.LookupID != 0)
                            tmpLookupID = condValue.LookupID.toString();
                    condValue = tmpLookupID;
                }

                if (!checkFieldObj.IsSetCondsHandler) {
                    checkFieldObj.AddChangeHandler(changeFunc);
                    checkFieldObj.IsSetCondsHandler = true;
                }
            }

            if (condValue == '[Я]' && ListForm.CurrentUserID != null) condValue = ListForm.CurrentUserID;
        }

        switch (condType) {

            case 'DBFieldText':
            case 'DBFieldMultiLineText':
                switch (criteriaValue) {
                    case 'ne': testResult = condValue != sourceFieldValue; break;
                    case 'startswith': testResult = sourceFieldValue.indexOf(condValue) == 0; break;
                    case 'notstartswith': testResult = !sourceFieldValue.indexOf(condValue) == 0; break;
                    case 'contains': testResult = sourceFieldValue.indexOf(condValue) >= 0; break;
                    case 'notcontains': testResult = sourceFieldValue.indexOf(condValue) < 0; break;
                    default: testResult = condValue == sourceFieldValue; break;
                }
                break;

            case 'DBFieldNumber':
            case 'DBFieldInteger':
                {
                    //обработка проверки на пустое значение
                    if (condValue == '') {
                        switch (criteriaValue) {
                            case 'e': return sourceFieldValue == '';
                            case 'ne': return sourceFieldValue != '';
                        }
                    }
                    //обработка на заданные значения
                    if (sourceFieldValue == null || sourceFieldValue == "") {
                        switch (criteriaValue) {
                            case 'e': return condValue == '';
                            case 'ne': return condValue != '';
                            default: return false;
                        }
                    }
                    var condNum = new Number(WKF_RemoveSpaces(condValue).replace(',', '.'));
                    var formNum = new Number(WKF_RemoveSpaces(sourceFieldValue).replace(',', '.'));
                    if (criteriaValue != null) {
                        switch (criteriaValue) {
                            case 'e': testResult = condNum.toString() == formNum.toString(); break;
                            case 'equal': testResult = condNum.toString() == formNum.toString(); break;
                            case 'gt': testResult = condNum < formNum; break;
                            case 'greater': testResult = condNum < formNum; break;
                            case 'lt': testResult = condNum > formNum; break;
                            case 'smaller': testResult = condNum > formNum; break;
                            case 'gte': testResult = condNum <= formNum; break;
                            case 'greaterorequal': testResult = condNum <= formNum; break;
                            case 'lte': testResult = condNum >= formNum; break;
                            case 'smallerorequal': testResult = condNum >= formNum; break;
                            case 'ne': testResult = condNum.toString() != formNum.toString(); break;
                            case 'notequal': testResult = condNum.toString() != formNum.toString(); break;
                        }
                    }
                    break;
                }
            case 'DBFieldLookupSingle': //поле Единичная подстановка
                {
                    var lookupID = "";
                    if (sourceFieldValue != null && sourceFieldValue != '')
                        if (sourceFieldValue.LookupID != 0)
                            lookupID = sourceFieldValue.LookupID.toString();
                    switch (criteriaValue) {
                        case 'ne': testResult = condValue != lookupID; break;
                        default: testResult = condValue == lookupID; break;
                    }
                    break;
                }
            case 'DBFieldDateTime': //поле Дата
                {
                    if (condValue == "" || sourceFieldValue == "") {
                        switch (criteriaValue) {
                            case 'ne': testResult = condValue != sourceFieldValue.toString(); break;
                            default: testResult = condValue == sourceFieldValue.toString(); break;
                        }
                    }
                    else {
                        condValue = WKF_GetDateByValue(condValue, true);
                        var dateVal = WKF_GetDateByValue(sourceFieldValue, true);
                        var difference = condValue - dateVal;
                        switch (criteriaValue) {
                            case 'e': testResult = difference == 0; break;
                            case 'equal': testResult = difference == 0; break;
                            case 'gt': testResult = difference < 0; break;
                            case 'greater': testResult = difference < 0; break;
                            case 'lt': testResult = difference > 0; break;
                            case 'smaller': testResult = difference > 0; break;
                            case 'gte': testResult = difference <= 0; break;
                            case 'greaterorequal': testResult = difference <= 0; break;
                            case 'lte': testResult = difference >= 0; break;
                            case 'smallerorequal': testResult = difference >= 0; break;
                            case 'ne': testResult = difference != 0; break;
                            case 'notequal': testResult = difference != 0; break;
                            default: testResult = difference == 0; break;
                        }
                    }
                    break;
                }
            case 'DBFieldLookupMulti':
                {
                    testResult = false;

                    if (condValue != "") {
                        var isEqual = false;
                        var checkLookupID = "";
                        //сравнение множественной и единичной подстановки
                        if (condValue != null)
                            if (condValue.LookupID != null && condValue.LookupID != 0) {
                                checkLookupID = condValue.LookupID.toString();
                                if (sourceFieldValue != null)
                                    if (sourceFieldValue.length == 1)
                                        if (sourceFieldValue[0].LookupID != null && condValue.LookupID > 0)
                                            isEqual = checkLookupID == condValue.LookupID.toString();
                            }

                        switch (criteriaValue) {
                            case 'ne': testResult = !isEqual; break;
                            case 'contains': testResult = WKF_CheckContainsForMultiLookup(sourceFieldValue, condValue); break;
                            case 'notcontains': testResult = !WKF_CheckContainsForMultiLookup(sourceFieldValue, condValue); break;
                            default: testResult = isEqual; break;
                        }

                    }
                    else {
                        switch (criteriaValue) {
                            case 'ne': testResult = !this.IsEmptyMultiLookup(condField); break;
                            default: testResult = this.IsEmptyMultiLookup(condField); break;
                        }
                    }
                    break;
                }
            case 'DBFieldFiles':
                {
                    if (condValue == '') {
                        var filesCount = CheckFilesCount(condField)
                        switch (criteriaValue) {
                            case 'ne': testResult = filesCount > 0; break;
                            default: testResult = filesCount == 0; break;
                        }
                        break;
                    }
                }
            case 'CMField':
            case 'NFField':
            case 'MSLField':
            case 'PDField':
            case 'AgreementBlockField':
            case 'DBFieldLink':
                {
                    if (condValue == '') {
                        var notEmpty = this.TestFieldByNotEmpty(condField);
                        switch (criteriaValue) {
                            case 'ne': testResult = notEmpty; break;
                            default: testResult = !notEmpty; break;
                        }
                        break;
                    }
                }

            default:
                switch (criteriaValue) {
                    case 'ne': testResult = condValue != sourceFieldValue.toString(); break;
                    default: testResult = condValue == sourceFieldValue.toString(); break;
                }
                break;
        }
    }
    return testResult;
}

//проверка на заполненность полей
function SLField_CheckNotEmpties() {
    var reqiredFields = new Array();
    this.CondRequiredFields = new Array();
    this.CondRequiredFieldsStr = ' ';

    //условная обязательность полей на этапе
    if (this.ItemInfo.RequieredFieldsOnStages != null && this.ItemInfo.RequieredFieldsOnStages != '') {
        //проставляем признак обязательности у тех полей, которые должны быть заполнены
        this.MeetNotEmpty(this.ItemInfo.RequieredFieldsOnStages, reqiredFields);
    }

    var solutionItem = this.SelectedSolution;
    if (solutionItem != null) {
        var fieldsCol = solutionItem.Fields;
        if (fieldsCol == null) return reqiredFields;
        var notEmptyField;
        for (var i = 0; i < fieldsCol.length; i++) {
            var tmpField = fieldsCol[i];
            if (tmpField.Operation == 2) notEmptyField = tmpField;

        }
        if (notEmptyField != null) {
            var notEmpty = notEmptyField.Value;
            if (notEmpty != null && notEmpty != '') {
                //проставляем признак обязательности у тех полей, которые должны быть заполнены
                this.MeetNotEmpty(notEmpty, reqiredFields);
            }
        }
    }
    return reqiredFields;
}

//обработка условий на заполненность полей
function SLField_MeetNotEmpty(notEmpty, reqiredFields) {
    var stNotEmptyXml = WKF_GetXmlFromDataString(notEmpty);
    var axoNotEmpty;
    axoNotEmpty = window.SM.LoadXML(stNotEmptyXml);
    var docNotEmpty = axoNotEmpty.documentElement;
    var xmlNotEmpties = docNotEmpty.selectNodes('field');
    if (xmlNotEmpties != null) {
        var i, len = xmlNotEmpties.length;
        for (i = 0; i < len; i++) {
            var xmlNotEmpty = xmlNotEmpties[i];
            var applyChecking = true;
            var xmlInnerConds = xmlNotEmpty.selectSingleNode('conds');
            if (xmlInnerConds != null) {
                applyChecking = this.MeetCondition(window.SM.PersistXML(xmlInnerConds));
            }

            var testResult = false;

            var notEmptyFieldName = xmlNotEmpty.getAttribute('name');
            var text = xmlNotEmpty.getAttribute('text');
            var isSingleAlert = xmlNotEmpty.getAttribute('isSingleAlert') == 'true';
            var notDrawAlert = xmlNotEmpty.getAttribute('notDraw') == 'true';

            if (applyChecking) {
                //если это комментарий, то выполняем код для комментария
                if (notEmptyFieldName == '#comment#') {
                    this.ReqiredCommemtMark.style.display = '';
                    this.NeedCommentByCondition = true;
                }

                var notEmptyField = ListForm.GetField(notEmptyFieldName);
                if (notEmptyField == null) {
                    //alert("В карточке отсутствует поле '" + notEmptyFieldName + "' (обязательное поле по решению)");
                    //если поля нет в карточке, то не проверяем его обязательность
                    continue;
                }
                else {
                    //обязательные поля на уровне списка не трогаем
                    if (notEmptyField.OriginalRequired) continue;

                    //если стоит признак, не рисовать звездочку, то пропускаем это поле 
                    if (notDrawAlert) continue;

                    //простановка обязательности
                    notEmptyField.SetRequired(true);

                    //данные поля проверяем отдельно
                    if (text != null && text != '') {
                        if (!this.CondRequiredFieldsStr.indexOf(';' + notEmptyFieldName + ';') >= 0) {
                            notEmptyField.CustomRequiredAlert = text;
                            notEmptyField.CustomRequiredInformer = text;

                            this.CondRequiredFields.push(notEmptyField);
                            this.CondRequiredFieldsStr += ';' + notEmptyFieldName + ';';
                        }
                    }

                    //добавляем поле, которое помечено как обязательное
                    if (reqiredFields[notEmptyFieldName] == null)
                        reqiredFields[notEmptyFieldName] = true;
                }
            }

        }
    }
}

function WKF_CheckContainsForMultiLookup(sourceFieldValue, lookupID) {
    //пустые значения
    if (lookupID == null) return true;
    if (sourceFieldValue == null && lookupID != null) return false;
    if (sourceFieldValue.length == 0 && lookupID != null) return false;
    for (var i = 0; i < sourceFieldValue.length; i++) {
        if (sourceFieldValue[i].LookupID == lookupID) return true;
    }
    return false;
}

function WKF_RemoveSpaces(str) {
    var newString = "";
    var i, len = str.length;
    for (i = 0; i < len; i++) {
        if (IsNullOrEmpty(str))
            break;
        var chCode = str.charCodeAt(i);
        if (chCode != 8195 && chCode != 8194 && chCode != 160 && chCode != 32)
            newString += str.charAt(i);
    }

    return newString;
}

//true - поле заполнено, false - не заполнено
function SLField_TestFieldByNotEmpty(notEmptyField) {
    var testResult = false;
    if (notEmptyField != null && notEmptyField != '') {
        var inputField = null;
        //игнорируем поле в непустых полях, если его нет в карточке
        var fieldObj = ListForm.GetField(notEmptyField);
        notEmptyType = fieldObj.Type;

        //обработка поручений
        if (notEmptyType == 'CMField') return window.CMFieldInstance.IsFilled();

        //обработка рассылки
        if (notEmptyType == 'NFField') return !window.IsEmptyNotificationField(notEmptyField);

        var fieldValue = this.GetFieldValue(fieldObj);

        switch (notEmptyType) {
            case 'DBFieldText':
            case 'DBFieldMultiLineText':
                testResult = fieldValue.toLowerCase() != '';
                break;

            case 'DBFieldLookupSingle':
                testResult = fieldValue != '0' && fieldValue != '' && fieldValue != null;
                if (fieldValue != null)
                    testResult = fieldValue.LookupID != 0;
                break;
            case 'DBFieldLookupMulti':
                if (fieldValue != null)
                    testResult = fieldValue.length > 0;
                break;
            case 'DBFieldFiles':
                testResult = CheckFilesCount(notEmptyField);
                break;
            case 'MSLField':
            case 'AgreementBlockField':
            case 'PDField':
            case 'DBFieldLink':
                testResult = !fieldObj.TypedField.IsEmptyValue();
                break;
            default:
                testResult = fieldValue != '' && fieldValue != null;
                break;
        }

    }
    return testResult;
}

//функции работы с датой    
function WKF_GetDateByValue(value, returnAsDate) {
    if (value == "" || value == null) return '';
    var resultDate;
    switch (value) {
        case '[Сейчас]': resultDate = new Date(); break;
        case '[Сегодня]':
            resultDate = new Date();
            resultDate.setHours(0);
            resultDate.setMinutes(0);
            resultDate.setSeconds(0);
            break;
        default:
            var dateParts = value.split('.');
            if (dateParts.length < 3) return null;
            var hours = 0;
            var minutes = 0;
            if (dateParts[2].indexOf(' ') >= 0) {
                var timeParts = dateParts[2].split(' ')[1].split(':');

                hours = new Number(timeParts[0]);
                minutes = new Number(timeParts[1]);
            }
            var code = Date.parse(dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2]);
            if (isNaN(code)) return '';
            resultDate = new Date(code);
            resultDate.setHours(hours);
            resultDate.setMinutes(minutes);
            break;
    }
    if (returnAsDate) return resultDate; //возвращаем значение как дату
    //получаем дату как строку
    var stYear = resultDate.getFullYear().toString();

    var stMonth = WKF_AddZeroToNumber((resultDate.getMonth() + 1).toString());
    var stDay = WKF_AddZeroToNumber(resultDate.getDate().toString());
    var stHours = WKF_AddZeroToNumber(resultDate.getHours().toString());
    var stMinutes = WKF_AddZeroToNumber(resultDate.getMinutes().toString());
    //секунды дата в форме не поддерживает
    //var stSeconds = WKF_AddZeroToNumber(resultDate.getSeconds().toString());
    var stDate = stDay + '.' + stMonth + '.' + stYear + " " + stHours + ":" + stMinutes;//+ ":" + stSeconds
    return stDate;
}
//-------------------------------------------------------------------------------------------
//обработка принимаемого решения

//объект результата при сохранении карточки
function ResulInfo() {
    this.Solution = '';
    this.NextStage = '';
    this.IsSetManualRegNum = false;
    this.SetFields = '';
    this.Notifyers = '';
    this.DelegateUserID = 0;
    this.IsCurrentAgrBlockWasDeleted = false;
    this.ValueFromLookupWindow = 0;
    this.AcceptingUsersValue = '';
}

function SLField_SaveResultInfo() {
    var xmlResult = '<ResultInfo>';
    xmlResult += '<Solution>' + this.ResultInfo.Solution + '</Solution>';
    xmlResult += '<NextStage>' + this.ResultInfo.NextStage + '</NextStage>';
    xmlResult += '<IsSetManualRegNum>' + this.ResultInfo.IsSetManualRegNum.toString() + '</IsSetManualRegNum>';
    xmlResult += '<SetFields></SetFields>';
    xmlResult += '<Notifyers>' + this.ResultInfo.Notifyers + '</Notifyers>';
    if (this.ResultInfo.ProcessObj != null)
        xmlResult += this.ResultInfo.ProcessObj;
    xmlResult += '<DelegateUserID>' + this.ResultInfo.DelegateUserID + '</DelegateUserID>';
    var comment = this.GetComment();
    var remark = this.GetRemark();
    xmlResult += '<Comment>' + WKF_ReplaceSpeialSimbols(comment) + '</Comment>';
    xmlResult += '<Remark>' + WKF_ReplaceSpeialSimbols(remark) + '</Remark>';
    if (this.ResultInfo.ECP != null)
        xmlResult += '<ECP>' + this.ResultInfo.ECP + '</ECP>';
    xmlResult += '<RoleIDs>' + this.ItemInfo.RoleIDs + '</RoleIDs>';
    xmlResult += '<IsCurrentAgrBlockWasDeleted>' + this.ResultInfo.IsCurrentAgrBlockWasDeleted.toString() + '</IsCurrentAgrBlockWasDeleted>';
    if (this.ResultInfo.SignDate != null)
        xmlResult += "<SignDate>" + this.ResultInfo.SignDate + "</SignDate>";
    xmlResult += '<ValueFromLookupWindow>' + this.ResultInfo.ValueFromLookupWindow + '</ValueFromLookupWindow>';
    xmlResult += '<AcceptingUsersValue>' + this.ResultInfo.AcceptingUsersValue + '</AcceptingUsersValue>';
    xmlResult += '<OldRegNum>' + this.ItemInfo.OldRegNum + '</OldRegNum>';
    xmlResult += '</ResultInfo>';
    this.HdnResultInfo.value = xmlResult;
    return xmlResult;
}

//возврат старых значений полей, до их простановки по решению
function WKF_ReturnBackValues() {
    var solutionFld = window.SLFieldInstance;
    var oldClientValuesDic = solutionFld.OldClientValues;
    if (oldClientValuesDic == null) return;

    if (oldClientValuesDic.length == 0) return;

    for (var i = 0; i < oldClientValuesDic.length; i++) {
        var tmpClientValObj = oldClientValuesDic[i];
        var fieldName = tmpClientValObj.FieldName;
        var fieldValue = tmpClientValObj.FieldValue;

        //объект поля
        var fldObj = window.ListForm.GetField(fieldName);
        if (fldObj == null) continue;
        fldObj.SetValue(fieldValue);
    }
}

function WKF_BeforeAcceptSolution() {
    var solutionFld = window.SLFieldInstance;

    //получение текущего решения
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    if (!solutionButtons)
        solutionFld.GetSelectedSolution();

    solutionFld.OnSolutionChangeMain(true); //параметр - очищать ли список с этапами для отката

    //кастом поля по проверке условий
    if (window.CMN_CondsChecker_CheckCondion != null) {
        CMN_CondsChecker_CheckCondion();
    }

    //очистка старого словаря
    solutionFld.OldClientValues = null;

    if (solutionFld.SelectedSolution != null) {
        //проставляем клиентские значения
        var fieldsXml = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.SetValuesInCardOnClient);
        var isSetValSuccess = false;

        solutionFld.SetClientFieldValues(fieldsXml);
    }
    //простановка спец. полей
    if (solutionFld.ResultInfo.SetFields != null && solutionFld.ResultInfo.SetFields != '') {
        solutionFld.SetClientFieldValues(solutionFld.ResultInfo.SetFields);
    }

    WKF_OpenFloatWindow();

    //обновление обязательности полей
    solutionFld.SetRequiredFields();

}


function WKF_OpenFloatWindow() {
    //проверка на решение делегирования/выбора значения из всплывающего окна
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    if (solutionButtons) {

        if (SLFieldInstance.ResultInfo.Notifyers == null || SLFieldInstance.ResultInfo.Notifyers == '') {
            if (SLFieldInstance.CheckNotifySolution()) {
                SLFieldInstance.WaitSelectWindow = true;
                return true;
            }
            if (SLFieldInstance.CheckDelegateSolution()) {
                SLFieldInstance.WaitSelectWindow = true;
                return true;
            }
        }

        //открытие окна с выбором значений
        if (!SLFieldInstance.SetParamsFromFloatWindow) {
            if (ShowWindowWithSolutionParams(true)) {
                if (!SLFieldInstance.NotEmptyWindowFields)
                    SLFieldInstance.WaitSelectWindow = true;
                SLFieldInstance.NotEmptyWindowFields = false;
                return true;
            }
        }

    }
    return false;
}


//функция принятия решения
function WKF_AcceptSolution(saveEventsArgs) {
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;

    var solutionFld = window.SLFieldInstance;

    if (solutionFld.CheckAgrUsersWindowResult) {
        if (!SLField_ValidateAgrUsersWindowResult.call(solutionFld)) {
            saveEventsArgs.CanSave = false;
            saveEventsArgs.CommonAlertMessage = window.TN.TranslateKey('slfield.agruserswindow.agrUsersValidationAlert');
            return;
        }
    }

    if (solutionFld.WaitSelectWindow) {
        saveEventsArgs.CanSave = false;
        return;
    }

    if (solutionFld.ItemInfo.UnsafeUpdateEnable)
        saveEventsArgs.UnsafeUpdate = true;

    if (!solutionButtons)
        solutionFld.GetSelectedSolution();

    solutionFld.ResultInfo.Solution = '';
    solutionFld.ResultInfo.Comment = '';

    //проверка загрузки файла
    if (WKF_CheckFileLoading(saveEventsArgs)) {
        WKF_ReturnBackValues();
        return;
    }

    //отключение проверки конфликта сохранения
    solutionFld.StopCheckSaveConflict = true;
    saveEventsArgs.CanSave = true;

    //вызываем обработчики, добавленные на поле Решения
    if (window.SLFieldInstance != null)
        if (window.SLFieldInstance.SaveHandlers != null)
            window.SLFieldInstance.ProcessSaveHandlers(saveEventsArgs);

    //если обработчики проставляют флаг отключения сохранения, то не сохраняем форму
    if (!saveEventsArgs.CanSave) {
        solutionFld.StopCheckSaveConflict = true;
        WKF_ReturnBackValues();
        return;
    }

    saveEventsArgs.CanSave = false;

    //функция для сохранения данных процесса прохождения
    //возврат блока согласования, если принимается решение возврата блока согласования
    if (solutionFld.ItemInfo.ReturnSolutions != null && solutionFld.ItemInfo.ReturnSolutions != '') {
        var returnSolutions = solutionFld.ItemInfo.ReturnSolutions.split(';');
        for (var i = 0; i < returnSolutions.length; i++)
            if (solutionFld.SelectedSolutionName == returnSolutions[i]) {
                WSSC_PBS_RestoreAgrResults();
                WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = false;
                break;
            }
    }
    if (window.WSSC_PBS_SaveXmlInHidden != null) WSSC_PBS_SaveXmlInHidden();

    solutionFld.OnSolutionChangeMain(true); //параметр - очищать ли список с этапами для отката

    //простановка значений из всплвающего окна
    if (!solutionFld.SetParamsFromFloatWindow) {
        var isSolutionWithParams = ShowWindowWithSolutionParams(false);
        if (isSolutionWithParams || solutionFld.NotEmptyWindowFields) {
            WKF_ReturnBackValues();
            solutionFld.NotEmptyWindowFields = false;
            return;
        }

    }



    var commentValue = solutionFld.GetComment();
    //проверяем ситуацию, когда стоит Выберите решение

    var deletedAllCurrentUsers = false;
    //проверка на ситуацию, когда удаляются все согласующие и документ остается на этапе Согласования
    if (window.AgreementBlockInstance != null) {
        if (WSSC_PBS_PassingFormData.IsAgreementStageIsCurrent && WSSC_PBS_IsAllUsersPassed() && WSSC_PBS_CanUserEditPassageBlock) {
            deletedAllCurrentUsers = true;
        }
    }

    if (solutionFld.SelectedSolution == null) {
        if (solutionFld.SelectedSolutionName != ''
            && solutionFld.SelectedSolutionName != SLFConsts.SolutionsConsts.DefaultText
            && solutionFld.SelectedSolutionName != SLFConsts.SolutionsConsts.NoSolutionsText) {
            solutionFld.SelectedSolutionName = '';
            alert(window.TN.Translate('Данное решение не актуально.'));

            solutionFld.StopCheckSaveConflict = false;
            WKF_ReturnBackValues();
            return;
        }

        if (solutionFld.SelectedSolutionName == SLFConsts.SolutionsConsts.DefaultText
            || solutionFld.SelectedSolutionName == SLFConsts.SolutionsConsts.NoSolutionsText
            || solutionFld.SelectedSolutionName == '') {
            var noCheckEmptySolution = false;
            if (WSSC_PBS_PassingFormData != null)
                if (WSSC_PBS_PassingFormData.NoCheckEmptySolution != null)
                    noCheckEmptySolution = WSSC_PBS_PassingFormData.NoCheckEmptySolution;

            //проверка на ситуацию, когда удаляются все согласующие и документ остается на этапе Согласования
            if (deletedAllCurrentUsers && !noCheckEmptySolution) {
                window.alert(SLFConsts.Warning_DeletedAllAgrUsers);
                saveEventsArgs.CanSave = false;
                solutionFld.SetSolutions();
                WKF_ReturnBackValues();
                return;
            }

            if (commentValue != '' && !noCheckEmptySolution) {
                var isSave = window.confirm(window.TN.Translate("Поле 'Комментарий' сохраняется только при принятии решения.\r\nВы не выбрали решение, комментарий не будет сохранен. Продолжить?"));
                if (isSave) {
                    solutionFld.SaveResultInfo();
                    saveEventsArgs.CanSave = true;
                    WKF_ReturnBackValues();
                    return;
                }
                else {
                    saveEventsArgs.CanSave = false;
                    solutionFld.StopCheckSaveConflict = false;
                    WKF_ReturnBackValues();
                    return;
                }
            }
            else {
                solutionFld.SaveResultInfo();
                saveEventsArgs.CanSave = true;
                WKF_ReturnBackValues();
                return;
            };
        }
    }


    var accepted = true;
    if (solutionFld.SelectedSolution != null || solutionFld.SpecialSoution) {
        var isActual = true;
        solutionFld.ResultInfo.Solution = solutionFld.SelectedSolutionName;
        solutionFld.ResultInfo.Comment = commentValue;

        if (solutionFld.CheckActualSolution)
            solutionFld.CheckActualSolution = false;

        //проверка на изменение блока и то, куда переводит решение
        if (window.AgreementBlockInstance != null)
            if (WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson) {
                //определяем новый этап
                solutionFld.SetNextStage();
                if (solutionFld.ResultInfo.NextStage != solutionFld.ItemInfo.CurrentStage && solutionFld.SelectedSolutionName != SLFConsts.SolutionsConsts.MoveNextSolution) {
                    if (window.confirm(SLFConsts.Warning_AgrBlockChangeAgrUser)) {
                        saveEventsArgs.RedirectOnSuccessUrl = window.location.href;

                        //сброс решений
                        solutionFld.SolutionControl.SetValue({ Text: SLFConsts.SolutionsConsts.DefaultText, Value: SLFConsts.SolutionsConsts.DefaultText });

                        WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = false;
                        WSSC_PBS_PassingFormData.NoCheckEmptySolution = true;
                        WKF_AcceptSolution(saveEventsArgs);
                        return;
                    }
                    else {
                        solutionFld.StopCheckSaveConflict = false;
                        WKF_ReturnBackValues();
                        return;
                    }
                }
            }


        if (isActual) {
            //проверяем выбора оповещаемых, если решение с окошком выбора оповещаемых
            var showNotifyBlock = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.ShowNotifyBlock).toLowerCase() == 'true';
            if (showNotifyBlock && (solutionFld.ResultInfo.Notifyers == null || solutionFld.ResultInfo.Notifyers == "") && (solutionFld.ResultInfo.ValueFromLookupWindow == null || solutionFld.ResultInfo.ValueFromLookupWindow == '')
                && (solutionFld.Custom_SolutionFloatWindowResults == null || solutionFld.Custom_SolutionFloatWindowResults == '')) {
                saveEventsArgs.CommonAlertMessage = window.TN.Translate('Необходимо выбрать оповещаемых сотрудников.');
                solutionFld.StopCheckSaveConflict = false;
                WKF_ReturnBackValues();
                return;
            }

            //проверка на решение делегирования
            if (solutionFld.SelectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution) {
                var isError = false;
                if (solutionFld.ResultInfo.Notifyers == null || solutionFld.ResultInfo.Notifyers == "") {
                    saveEventsArgs.CommonAlertMessage = window.TN.Translate('Необходимо выбрать сотрудника, которому будет делегирован документ.');
                    isError = true;
                }
                else {
                    var checkDelegateUserID = ";" + solutionFld.ResultInfo.Notifyers + ";";

                    //проверка на делегирование тем, кто согласовал документ ранее
                    var checkStr = ";" + WSSC_PBS_AgrBlockInfo.ExceptDelegateUserIDs + ";";
                    if (checkStr.indexOf(checkDelegateUserID) >= 0) {
                        saveEventsArgs.CommonAlertMessage = window.TN.Translate('При параллельном согласовании нельзя делегировать согласование по документу сотруднику, который делегировал или согласовал документ ранее.');
                        isError = true;
                    }

                    //проверка на делегирование самому себе
                    checkStr = ";" + ListForm.CurrentUserID + ";";
                    if (checkStr.indexOf(checkDelegateUserID) >= 0) {
                        saveEventsArgs.CommonAlertMessage = window.TN.Translate('Нельзя себе делегировать согласование по документу. Выберите другого сотрудника.');
                        isError = true;
                    }

                }

                if (isError) {
                    solutionFld.StopCheckSaveConflict = false;
                    WKF_ReturnBackValues();
                    return;
                }
            }

            //обязательность комментария
            var result = WKF_CheckComment(true);
            if (result.Alert != "") saveEventsArgs.CommonAlertMessage = result.Alert;
            if (result.IsEmpty) accepted = false;
        }
        else {
            accepted = false;
            saveEventsArgs.CommonAlertMessage = window.TN.Translate('Данное решение не актуально.');
            solutionFld.StopCheckSaveConflict = false;
            WKF_ReturnBackValues();
            return;
        }
        //не выполнены проверки в решении, решение не принимаем
        if (!accepted) {
            WKF_ReturnBackValues();
            return;
        }

        if (accepted) {
            //проверка на режим установки согласующих (для режима "Фиксированный" - проставляем согласующих)
            if (window.WSSC_PBS_SentToAgrPersonSolutions != null && window.WSSC_PBS_SentToAgrPersonSolutions != "") {
                var tmpSolCheckStr = ";" + WSSC_PBS_SentToAgrPersonSolutions + ";";
                if (tmpSolCheckStr.indexOf(solutionFld.SelectedSolutionName) >= 0) {
                    if (WSSC_PBS_AgrPersonMode == "Fixed") {
                        //определяем согласующих и сохраняем в блок согласования
                        WSSC_PBS_LoadAgrPersonsByCriteria();
                        if (window.WSSC_PBS_SaveXmlInHidden != null) WSSC_PBS_SaveXmlInHidden();
                    }
                }
            }

            //проверка на предупреждения
            var condsForAlert = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.AlertCondition);
            if (condsForAlert != null && condsForAlert != "") {
                var textForAlert = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.AlertText);
                var resultAlertCond = solutionFld.MeetUnitCondition(condsForAlert, textForAlert);
                if (resultAlertCond != null) {
                    if (resultAlertCond.Message != null && resultAlertCond.Message != '') {
                        if (resultAlertCond.SolutionBanned) {

                            solutionFld.StopCheckSaveConflict = false;
                            saveEventsArgs.CanSave = false;
                            alert(window.TN.Translate(resultAlertCond.Message));
                            WKF_ReturnBackValues();
                            return;
                        }
                        else {
                            if (!window.confirm(window.TN.Translate(resultAlertCond.Message))) {
                                solutionFld.StopCheckSaveConflict = false;
                                saveEventsArgs.CanSave = false;
                                WKF_ReturnBackValues();
                                return;
                            }
                        }
                    }

                }
            }

            solutionFld.SetValuesToFormFromSolutionWindow(); //проставляем скриптом значения (если было всплывающее окно)

            solutionFld.SetNextStage();

            //вызываем кастом обработку решения
            var wasOpenedFiles = false;

            var fileParamArray = new Array();
            var openFilesInDialog = solutionFld.ItemInfo.Files_OpenFilesInDialog;

            if (window.WSSC_CustomSolutionRun != null) WSSC_CustomSolutionRun(solutionFld.SelectedSolutionName);
            else {
                //печать файлов по решению
                var filesFields = '';
                try { filesFields = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.WSSFielsField); } catch (e) { }
                if (filesFields != '') {
                    var fileFields = filesFields.split(';');
                    for (var i = 0; i < fileFields.length; i++) {
                        var fileField = fileFields[i];
                        var filesFieldObj = GetFilesClientField(fileField);
                        //узел, где находится библиотека с файлами
                        var webID = filesFieldObj.StorageWebID;
                        //id библиотеки с файлами
                        var fileListID = filesFieldObj.StorageListID;
                        //id файлов, которые нужно распечатать
                        var fileItemIDs = '';

                        if (filesFieldObj != null) {
                            for (var j = 0; j < filesFieldObj.FilesByIndex.length; j++) {
                                if (!window.SM.IsFF) {
                                    var fileItem = filesFieldObj.FilesByIndex[j];

                                    var officeIntergratedExts = '|doc|docx|xls|xlsx|ppt|pptx|mpp|';
                                    var fileExtension = '';
                                    var splExts = fileItem.FileName.toLowerCase().split('.');
                                    var ext = splExts[splExts.length - 1];
                                    var isOfficeDocument = officeIntergratedExts.indexOf('|' + ext + '|') != -1;
                                    //обработка офисных документов при включенном недиалоговом новом режиме
                                    if (isOfficeDocument && !openFilesInDialog) {
                                        var fullFileUrl = filesFieldObj.HostUrl + fileItem.FileUrl;
                                        ViewSharePointDocument(fullFileUrl);
                                    }
                                    //обработка неофисных файлов
                                    else {
                                        if (fileItemIDs != '') fileItemIDs += ';';
                                        fileItemIDs += fileItem.FileItemID;
                                    }
                                }
                                wasOpenedFiles = true;
                            }
                        }
                        else {
                            var tmpMessage = window.TN.Translate("Не удалось открыть файлы на печать из поля '{0}'.\r\n Проверьте правильность названия поля в решении в поле 'Поля типа WSS-Файлы для открытия файлов по решению'.");
                            tmpMessage = tmpMessage.replace("{0}", fileField);
                            saveEventsArgs.CommonAlertMessage = tmpMessage;
                        }
                        if (fileItemIDs != '') {
                            var fileObjParam = new Object();
                            fileObjParam.WebID = webID;
                            fileObjParam.LibID = fileListID;
                            fileObjParam.FilesIDs = fileItemIDs;
                            fileParamArray.push(fileObjParam);
                        }
                    }

                }

                //вызов кастом функции проверки договоров
                if (window.WSSC_SolutionCustomChecker != null) {
                    var resultObj = window.WSSC_SolutionCustomChecker(solutionFld.SelectedSolutionName, saveEventsArgs);
                    if (resultObj != null) {
                        switch (resultObj.status) {
                            case 'Error':
                                {
                                    if (resultObj.message != '')
                                        alert(resultObj.message);
                                    saveEventsArgs.CanSave = false;
                                    WKF_ReturnBackValues();
                                    return;
                                }
                            case 'Warning':
                                {
                                    if (resultObj.message != '')
                                        alert(resultObj.message);
                                    break;
                                }
                        }
                    }

                }

                //генерация ключа ЭЦП
                var errorMessage = solutionFld.GenerateECP(solutionFld.SelectedSolution);
                if (!window.SM.IsNE(errorMessage)) {
                    if (errorMessage != "null")//пустой signer (ошибка уже выдается во Framework)
                        saveEventsArgs.CommonAlertMessage = errorMessage;
                    solutionFld.StopCheckSaveConflict = false;
                    saveEventsArgs.CanSave = false;
                }
                else {
                    solutionFld.SaveResultInfo();
                    saveEventsArgs.CanSave = true;

                    if ((wasOpenedFiles || fileParamArray.length > 0) && window.SM.IsFF)
                        window.alert(window.TN.Translate('Печать файлов в Firefox не поддерживается.\nПерейдите по ссылкам в поле с файлами и распечатайте их вручную, либо воспользуйте другим браузером.'));

                    if ((wasOpenedFiles || fileParamArray.length > 0) && window.SM.IsSafari && openFilesInDialog)
                        window.alert(window.TN.Translate('Печать файлов в Safari не поддерживается.\nПерейдите по ссылкам в поле с файлами и распечатайте их вручную, либо воспользуйте другим браузером.'));

                    if (fileParamArray.length > 0 && window.SM.IsSafari && !openFilesInDialog)
                        window.alert(window.TN.Translate('Печать не офисных файлов в Safari не поддерживается.\nПерейдите по ссылкам в поле с файлами и распечатайте их вручную, либо воспользуйте другим браузером.'));

                    if (wasOpenedFiles && !window.SM.IsFF && !window.SM.IsSafari && fileParamArray.length > 0) {
                        for (var k = 0; k < fileParamArray.length; k++) {
                            var fileObjParam = fileParamArray[k];
                            var fileWebID = fileObjParam.WebID;
                            var fileListID = fileObjParam.LibID;
                            var fileItemIDs = fileObjParam.FilesIDs;
                            window.open('/_layouts/WSS/WSSC.V4.DMS.Workflow/SolutionsField/PrintFiles.aspx?fileListID=' + fileListID + '&fileItemIDs=' + fileItemIDs + '&webID=' + webID);
                        }
                    }
                    return;
                }

                return;
            }
        }
    }
}

function WKF_AddSpecialMoveSolution() {
    SLFConsts.SolutionsConsts.MoveNextSolution = 'Перевести на следующий подэтап'; //Перевести далее по процессу
    SLFConsts.SolutionsConsts.MoveNextSolutionDispName = window.TN.Translate('Перевести далее по процессу');

}

//-------------------------------------------------------------------------------------------
//специальные функции
function WKF_ReplaceSpeialSimbols(comment) {
    if (SM.IsNE(comment)) return comment;
    var commentParts = comment.split('&');
    newComment = commentParts.join('&amp;');
    commentParts = newComment.split('<');
    newComment = commentParts.join('&lt;');
    commentParts = newComment.split('>');
    newComment = commentParts.join('&gt;');
    return newComment;
}

function WKF_EnsureQueryString(str) {
    if (!window.SM.IsNE(str)) {
        var rgQ = /([?])/g;
        var rgSharp = /([#])/g;
        var rgAmp = /([&])/g;
        var rgPls = /([+])/g;
        str = str.replace(rgQ, 'q_smb');
        str = str.replace(rgSharp, 'sh_smb');
        str = str.replace(rgAmp, 'amp_smb');
        str = str.replace(rgPls, 'amp_pls');
    }
    return str;
}

function WKF_CheckFileLoading(saveEventsArgs) {
    var isFileUploading = false;
    if (window.FilesForm != null)
        isFileUploading = window.FilesForm.IsFileUploading();
    if (isFileUploading) {
        saveEventsArgs.CanSave = false;
        alert(window.TN.Translate('Подождите, пожалуйста, идет загрузка файла.'));
    }
    return isFileUploading;
}

//проверка заполненности комментария
function WKF_CheckComment(isSaveMode) {
    var solutionFld = window.SLFieldInstance;
    var result = { IsEmpty: false, Alert: "" };
    //проверяем заполненность поля Комментарий или Замечания
    if (solutionFld.RemarkCB.checked && solutionFld.RemarkTD.style.display != 'none') {
        var remarkValue = solutionFld.RemarkTA.TextArea.value;

        //var emptyComent = (remarkValue == '');
        var emptyComent = solutionFld.RemarkTA.IsEmptyTextValue();

        if (emptyComent) {
            result.IsEmpty = true;
            result.Alert = window.TN.Translate('Необходимо указать замечания.');
            if (isSaveMode) solutionFld.StopCheckSaveConflict = false;
        }
    }
    else {
        var needComment = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.CommentRequired);
        //обязательность комментария либо по решению, либо по условию
        if (needComment.toLowerCase() == 'true' || solutionFld.NeedCommentByCondition) {
            var comment = solutionFld.CommentTA.TextArea.value;
            if (comment == solutionFld.DefaultCommentText) comment = "";
            var emptyComent = !(/[^\s]+/g.test(comment));;
            if (emptyComent) {
                result.IsEmpty = true;
                result.Alert = window.TN.Translate('Необходимо указать комментарий.');
                if (isSaveMode) solutionFld.StopCheckSaveConflict = false;
            }
        }
    }
    return result;
}


function WKF_AddZeroToNumber(numStr) {
    if (numStr.length == 1)
        return '0' + numStr;
    return numStr;
}

function WKF_ShowParamsWindow() {
    //нажата кнопка с решением
    SLFieldInstance.SolutionButtonClicked = false;
    //нажата кнопка с книжечкой
    SLFieldInstance.LookupWindowSelectClicked = true;

    SLFieldInstance.CheckDelegateSolution();
    SLFieldInstance.CheckNotifySolution();
}

//-------------------------------------------------------------------------------------------
//внести комментарий и оповестить
function SLField_CheckNotifySolution() {
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    var solution = this.SelectedSolution;
    if (solutionButtons && solution == null)
        solution = this.LastSolution;

    if (solution == null) return false;

    var showNotifyBlock = this.GetDMSFieldValue(solution, SLFConsts.SolutionsConsts.ShowNotifyBlock).toLowerCase() == 'true';
    var windowCommonSettingName = this.GetDMSFieldValue(solution, SLFConsts.SolutionsConsts.CommonSettingForWindow);

    if (showNotifyBlock) {
        OpenNotifiersNewWindow(windowCommonSettingName);
        return true;
    }
    return false;
}


function OpenNotifiersNewWindow(windowCommonSettingName) {
    var solutionFld = window.SLFieldInstance;

    if (solutionFld.InitMode) return;

    var selectedSolutionName = solutionFld.SelectedSolutionName;
    if (selectedSolutionName == '' || selectedSolutionName == null) selectedSolutionName = solutionFld.LastSolutionName;
    var asyncOpenWindow = false;

    //если принимается решение "Привлечь к согласованию" 
    var notifyWindowSettingName = windowCommonSettingName;
    if (windowCommonSettingName == null || windowCommonSettingName == '') {
        notifyWindowSettingName = 'OpenNotifiersSelectUser';
        if (solutionFld.ItemInfo.AddAgrPersonsSolutions.indexOf(selectedSolutionName) != -1)
            notifyWindowSettingName = solutionFld.ItemInfo.AddAgrPersonsWindowSetting;

        //если принимается решение делегирования
        if (selectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution)
            notifyWindowSettingName = 'OpenDelegateSelectUser';
    }
    else {
        //смотрим прогружены ли общие настройки, если нет, то получаем их
        if (solutionFld.WindowCommonSettingDic[notifyWindowSettingName] == null) {
            asyncOpenWindow = true;

            //формируем запрос для получения json-объекта
            var pageUrl = '/_layouts/WSS/WSSC.V4.DMS.Workflow/SolutionsField/GetDMSCommonLookupSetting.aspx';
            var params = 'commonSettingName=' + notifyWindowSettingName;
            params += '&solutionName=' + selectedSolutionName;
            params += '&listFormWebID=' + ListForm.WebID;
            params += '&listFormListID=' + ListForm.ListID;
            params += '&listFormItemID=' + ListForm.ItemID;
            params = encodeURI(params);

            var ajax = window.SM.GetXmlRequest();
            ajax.open("POST", pageUrl, true);
            ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            ajax.onreadystatechange = function () {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    ajax.onreadystatechange = new Function();

                    var data = ajax.responseText;
                    if (data.indexOf("Error") >= 0) alert("Ошибка при получении настроек всплывающего окна: " + data);
                    //регистрируем 
                    var lookupSettings = JSON.parse(data);
                    DBLookupSettings.call(lookupSettings);
                    if (window.GetLookupSettings(notifyWindowSettingName) != null) window.GetLookupSettings(notifyWindowSettingName).InitSetValueXmlFunction();

                    solutionFld.WindowCommonSettingDic[notifyWindowSettingName] = lookupSettings;
                    //открытие окна
                    var lookupSettings = window.GetLookupSettings(notifyWindowSettingName);
                    lookupSettings.OpenLookupWindow(notifyWindowSettingName);
                }
            }
            ajax.send(params);

        }
    }
    //открытие окна с выбором значений
    if (!asyncOpenWindow) {
        var lookupSettings = window.GetLookupSettings(notifyWindowSettingName);
        if (!lookupSettings.CustomTitleHandlerWasSet) {
            SM.AttachEvent(lookupSettings, 'OnLookupWindowLoad', SetNotifiersWindowTitle);
            lookupSettings.CustomTitleHandlerWasSet = true;
        }
        lookupSettings.OpenLookupWindow(notifyWindowSettingName);
    }
}

//Проставляет title для окна выбора оповещаемых/привлеченных/делегируемых если перед ним открывалось окно выбора согласующих.
function SetNotifiersWindowTitle(settings, lookupWindow) {
    if (lookupWindow == null)
        throw new Error('Не передан параметр lookupWindow.');

    var solutionFld = window.SLFieldInstance;
    if (!solutionFld || !solutionFld.CheckAgrUsersWindowResult)
        return;

    SLField_AgrUsersWindow_SetLookupTitle(lookupWindow, 'slfield.agruserswindow.notifyUsersWindowTitle');
}

function SLField_SetValue_MultiLookupWindow(xml, lookupSettings) {
    var notifyBlockMainDiv = document.getElementById('notifyBlockMainDiv');

    var solutionFld = window.SLFieldInstance;
    var axoLookupResult = window.SM.LoadXML(xml);
    var loookupNodes = axoLookupResult.documentElement.selectNodes('LookupValue');
    if (loookupNodes != null) {
        var oldIDs = solutionFld.HdnSelectedNotifiers.value;
        if (oldIDs == '')
            oldIDs = solutionFld.ResultInfo.ValueFromLookupWindow;
        if (oldIDs == '')
            oldIDs = solutionFld.Custom_SolutionFloatWindowResults;
        if (oldIDs == null) oldIDs = '';

        var ids = '';
        var userNames = '';
        var dispUserNames = '';


        for (var i = 0; i < loookupNodes.length; i++) {
            var lookupNode = loookupNodes[i];
            if (i != 0) {
                ids += ';';
                userNames += ';';
                dispUserNames += ', ';
            }

            var lookupID = lookupNode.getAttribute('LookupID');

            //добавление элемента в таблицу

            //запись уже есть в таблице смотрим следующую
            var tmpIDs = ';' + oldIDs + ';';
            if (tmpIDs.indexOf(';' + lookupID + ';') >= 0) continue;

            var lastItemTable = notifyBlockMainDiv.LastItemTable;
            if (lastItemTable != null)
                lastItemTable.rows[0].cells[2].style.display = '';

            var tbItem = window.document.createElement('table');
            tbItem.LookupID = lookupID;
            notifyBlockMainDiv.appendChild(tbItem);
            tbItem.className = 'wkf_lookup_resultItemTable';

            //tbItem.setAttribute('Identity', identity);
            tbItem.border = 0;
            tbItem.cellSpacing = 0;
            tbItem.cellPadding = 0;
            /*tbItem.style.marginLeft = '2px';
            tbItem.style.marginTop = '2px';
            tbItem.style.marginBottom = '2px';*/

            var trItem = tbItem.insertRow(tbItem.rows.length);
            var tdDelete = trItem.insertCell(trItem.cells.length);
            tdDelete.innerHTML = "<img border='0' src='/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/delete.png' onclick='DMSDeleteSelectedNotifyPerson(this.parentNode.parentNode.parentNode.parentNode);' style='cursor:pointer' ></img>";
            tdDelete.className = 'wkf_lookup_resultItemDeleteCell'
            var tdItem = trItem.insertCell(trItem.cells.length);
            var lookupLink = DMS_WKF_CreateLookupLink(lookupNode, lookupSettings);
            var lookupDiv = window.document.createElement("div");
            lookupDiv.className = 'wkf_lookup_div';
            var notifyConteinerDiv = window.document.getElementById('notifyConteinerDiv');
            var notifyBlockMainDiv = window.document.getElementById('notifyBlockMainDiv');
            var limitWidth = notifyConteinerDiv.offsetWidth - 40;
            lookupDiv.appendChild(lookupLink);
            tdItem.appendChild(lookupDiv);

            if (lookupLink.offsetWidth > limitWidth) {
                lookupDiv.style.width = limitWidth - 5 + 'px';
                notifyBlockMainDiv.style.width = limitWidth + 'px';
                var lookupText = lookupNode.getAttribute('LookupText');
                if (lookupText != null)
                    lookupLink.title = lookupText;
            }

            tdItem.className = 'wkf_lookup_resultItemCell';
            var tdSeparator = trItem.insertCell(trItem.cells.length);
            tdSeparator.className = 'wkf_lookup_resultItemSeparatorLink';
            tdSeparator.style.display = 'none';
            $(tdSeparator).text(';');
            notifyBlockMainDiv.LastItemTable = tbItem;



            ids += lookupID;
            var tmpUserName = lookupNode.getAttribute('LookupText');
            userNames += tmpUserName;
            dispUserNames += tmpUserName;
        }

        var newIDs = oldIDs;
        if (newIDs != '') newIDs = newIDs + ';';
        newIDs = newIDs + ids;
        window.SM.ResetFormLayout();

        return newIDs;
    }
}

function SLField_SetValue_SingleLookupWindow(xml, lookupSettings) {
    var axoLookupResult = window.SM.LoadXML(xml);
    var lookupNode = axoLookupResult.documentElement;
    if (lookupNode != null) {
        var userID = lookupNode.getAttribute('LookupID');
        var userName = lookupNode.getAttribute('LookupValue');

        var notifyBlockMainDiv = document.getElementById('notifyBlockMainDiv');

        //добавление элемента в таблицу
        notifyBlockMainDiv.innerHTML = "";
        var lookupID = lookupNode.getAttribute('LookupID');

        var tbItem = window.document.createElement('table');
        tbItem.LookupID = lookupID;
        notifyBlockMainDiv.appendChild(tbItem);
        tbItem.className = 'wkf_lookup_resultItemTable';

        //tbItem.setAttribute('Identity', identity);
        tbItem.border = 0;
        tbItem.cellSpacing = 0;
        tbItem.cellPadding = 0;
        /*tbItem.style.marginLeft = '2px';
        tbItem.style.marginTop = '2px';
        tbItem.style.marginBottom = '2px';*/

        var trItem = tbItem.insertRow(tbItem.rows.length);
        var tdDelete = trItem.insertCell(trItem.cells.length);
        tdDelete.innerHTML = "<img border='0' src='/_layouts/WSS/WSSC.V4.SYS.Fields.Lookup/Images/delete.png' onclick='DMSDeleteSelectedDelegatePerson();' style='cursor:pointer' ></img>";
        tdDelete.className = 'wkf_lookup_resultItemDeleteCell'
        var tdItem = trItem.insertCell(trItem.cells.length);
        var lookupLink = DMS_WKF_CreateLookupLink(lookupNode, lookupSettings);
        var lookupDiv = window.document.createElement("div");
        lookupDiv.className = 'wkf_lookup_div';
        var notifyConteinerDiv = window.document.getElementById('notifyConteinerDiv');
        var notifyBlockMainDiv = window.document.getElementById('notifyBlockMainDiv');
        var limitWidth = notifyConteinerDiv.offsetWidth - 40;
        lookupDiv.appendChild(lookupLink);
        tdItem.appendChild(lookupDiv);

        if (lookupLink.offsetWidth > limitWidth) {
            lookupDiv.style.width = limitWidth - 5 + 'px';
            notifyBlockMainDiv.style.width = limitWidth + 'px';
            if (userName != null)
                lookupLink.title = userName;
        }

        tdItem.className = 'wkf_lookup_resultItemCell';

        return lookupID;

    }

    return 0;
}

function DMSLookupWindow_SetValueXml(resultUniqueKey, xml) {
    if (xml == null)
        return;
    var solutionFld = window.SLFieldInstance;
    var solutionButtons = solutionFld.ItemInfo.SolutionsParams.SolutionButtonsEnable;

    //окно выбора пользователей для блока согласования
    if (window.WSSC_PBS_LookupSettings_AgrBlockSelectUserKey != null)
        if (resultUniqueKey.indexOf(WSSC_PBS_LookupSettings_AgrBlockSelectUserKey) != -1) {
            WSSC_PBS_ReturnLookupResult(xml, resultUniqueKey);
            return;
        }

    var windowCommonSettingName = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.CommonSettingForWindow);
    var solutionCustomWindow = SLFieldInstance.Custom_SolutionFloatWindow;
    var isCustomWindow = false;
    if (solutionCustomWindow != null && solutionCustomWindow != '') {
        windowCommonSettingName = SLFieldInstance.Custom_SolutionFloatWindow;
        isCustomWindow = true;
    }

    //получение значений из окошка
    var lookupWindowValue = null;
    var lookupSettings = GetLookupSettings(resultUniqueKey);
    if (this.IsMultiple) lookupWindowValue = SLField_SetValue_MultiLookupWindow(xml, lookupSettings);
    else lookupWindowValue = SLField_SetValue_SingleLookupWindow(xml, lookupSettings);

    var selectedSolutionName = solutionFld.SelectedSolutionName;
    if (solutionButtons && (selectedSolutionName == null || selectedSolutionName == ''))
        selectedSolutionName = selectedSolutionName.LastSolutionName;

    //окно выбора пользователей для оповещений
    if (resultUniqueKey == 'OpenNotifiersSelectUser' || resultUniqueKey == 'AddAgrPersonsSelectUser') {
        solutionFld.HdnSelectedNotifiers.value = lookupWindowValue;
        solutionFld.ResultInfo.Notifyers = lookupWindowValue;
    }

    //окно делегирования
    if (resultUniqueKey == 'OpenDelegateSelectUser' || selectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution) {
        solutionFld.ResultInfo.DelegateUserID = lookupWindowValue;
        solutionFld.ResultInfo.Notifyers = lookupWindowValue;
    }

    //выбранные значения из окошка
    if (windowCommonSettingName != null && windowCommonSettingName != '') {
        if (!isCustomWindow)
            solutionFld.ResultInfo.ValueFromLookupWindow = lookupWindowValue;
        else
            solutionFld.Custom_SolutionFloatWindowResults = lookupWindowValue;
    }

    //нужно вызвать нажатие кнопки ОК, после выбора в окне

    solutionFld.WaitSelectWindow = false;

    //нажата кнопка с решением и не нажата кнопка с книжечкой
    if (solutionButtons && SLFieldInstance.SolutionButtonClicked && !SLFieldInstance.LookupWindowSelectClicked) {
        solutionFld.RestoreLastSolution();
        window.HidePopupWindow();
        WKF_OkButtonClick();
    }

    //if (!solutionButtons) ListForm.UpdateButton.click();
}

function DMSDeleteSelectedDelegatePerson() {
    var solutionFld = window.SLFieldInstance;
    var windowCommonSettingName = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.CommonSettingForWindow);
    var notifyBlockMainDiv = document.getElementById('notifyBlockMainDiv');

    notifyBlockMainDiv.innerHTML = "";

    solutionFld.ResultInfo.DelegateUserID = 0;
    solutionFld.ResultInfo.Notifyers = "";

    //простановка через окно
    if (windowCommonSettingName != null || windowCommonSettingName == '')
        solutionFld.ResultInfo.ValueFromLookupWindow = '';
}

function DMSDeleteSelectedNotifyPerson(returnControl) {
    var solutionFld = window.SLFieldInstance;

    var showNotifyBlock = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.ShowNotifyBlock).toLowerCase() == 'true';
    var windowCommonSettingName = solutionFld.GetDMSFieldValue(solutionFld.SelectedSolution, SLFConsts.SolutionsConsts.CommonSettingForWindow);

    var notifyBlockMainDiv = document.getElementById('notifyBlockMainDiv');
    var lookupID = returnControl.LookupID;

    var attrContainer = null;
    if (!window.SM.IsIE && returnControl.tagName.toLowerCase() == 'table')
        returnControl = returnControl.rows[0];

    if (!this.IsNewWindowDesign)
        attrContainer = returnControl.cells[0];
    else
        attrContainer = returnControl;
    returnControl.style.display = 'none';
    returnControl.Deleted = true;

    var oldIDs = '';
    //выбор через окно "Оповестить"
    if (showNotifyBlock) {
        var oldIDs = solutionFld.HdnSelectedNotifiers.value;
        if (oldIDs == '')
            oldIDs = solutionFld.ResultInfo.ValueFromLookupWindow;
        if (oldIDs == '')
            oldIDs = solutionFld.Custom_SolutionFloatWindowResults;
    }

    var newIDs = '';
    var tmpIDs = oldIDs.split(';');
    for (var j = 0; j < tmpIDs.length; j++) {
        var tmpID = tmpIDs[j];
        if (tmpID == '' || tmpID == lookupID) continue;
        if (newIDs != '') newIDs = newIDs + ';' + tmpID;
        else newIDs = tmpID;
    }

    //оповещаемые сотрудники
    if (showNotifyBlock) {
        solutionFld.HdnSelectedNotifiers.value = newIDs;
        solutionFld.ResultInfo.Notifyers = newIDs;
    }
    //простановка через окно
    if (windowCommonSettingName != null || windowCommonSettingName == '')
        solutionFld.ResultInfo.ValueFromLookupWindow = newIDs;

    var i, len = notifyBlockMainDiv.children.length;
    for (i = len - 1; i >= 0; i--) {
        var child = notifyBlockMainDiv.children[i];
        var separator = child.rows[0].cells[2];
        if (separator != null && child.style.display != 'none') {
            separator.style.display = 'none';
            notifyBlockMainDiv.LastItemTable = child;
            break;
        }
    }

    window.SM.ResetFormLayout();
}

//создает ссылку на подстановочный элемент
function DMS_WKF_CreateLookupLink(resultNode, lookupSettings) {
    var solutionFld = window.SLFieldInstance;
    var lookupItemControl = null;

    var lookupID = parseInt(resultNode.getAttribute('LookupID'));
    var lookupText = resultNode.getAttribute('LookupText');
    var urlAccessCode = resultNode.getAttribute('UrlAccessCode');

    if (lookupID > 0) {
        var lookupItemDispUrl = lookupSettings.LookupListDispFormUrl + '?ID=' + lookupID;

        var lnkLookupItem = window.document.createElement('a');
        lnkLookupItem.className = 'wkf_lookup_link';

        $(lnkLookupItem).text(lookupText);
        var lookupUrl = null;
        var params = '&closeOnUpdate=true&closeOnCancel=true';

        lnkLookupItem.href = lookupItemDispUrl;
        lookupUrl = lookupItemDispUrl + params;

        lnkLookupItem.onclick = function () { window.open(lookupUrl, '_blank', 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no'); return false; }
        lookupItemControl = lnkLookupItem;
    }
    else {
        var lblLookupItem = window.document.createElement('span');
        lblLookupItem.className = 'wkf_lookup_lable';
        $(lblLookupItem).text(lookupText);
        lblLookupItem.title = 'Элемент: ' + lookupID;
        lookupItemControl = lblLookupItem;
    }
    return lookupItemControl;
}

//показать окно с пользовтелями окна "Оповестить"
function SLField_ShowNotifiersTooltip() {
    var txtNotifiers = this.V1_NotifiersTB; //input c id txtNotifiers
    var divUsersTitle = this.V1_SelectedNotifiersTooltip;
    var x = txtNotifiers.offsetLeft + parseInt(txtNotifiers.style.width);
    var y = txtNotifiers.offsetTop + parseInt(txtNotifiers.style.height);

    divUsersTitle.style.pixelLeft = x;
    divUsersTitle.style.pixelTop = y;

    var tbUsersTitle = divUsersTitle.children[0];

    var tdAppointerTitle = tbUsersTitle.rows[1].cells[0];

    var tbNotifiers = tbUsersTitle.rows[3].cells[0].children[0];
    while (tbNotifiers.rows.length > 0) {
        tbNotifiers.deleteRow(0);
    }
    var hdnSelectedNotifierNames = this.HdnSelectedNotifiersNames;
    var notifierNames = hdnSelectedNotifierNames.value;
    var splNotifierNames = notifierNames.split(';');
    var i, len = splNotifierNames.length;
    var limit = 10;
    if (len < limit) limit = len;
    //рисуем только 10 пользователей
    for (i = 0; i < limit; i++) {
        var notifierName = splNotifierNames[i];
        if (notifierName != '') {
            var trNotifier = tbNotifiers.insertRow(tbNotifiers.rows.length);

            var tdImgPoint = trNotifier.insertCell(trNotifier.cells.length);
            tdImgPoint.vAlign = 'top';
            tdImgPoint.className = 'wssc-titletd';
            tdImgPoint.style.paddingTop = '6px';
            var imgPoint = window.document.createElement('img');
            imgPoint.border = '0px';
            imgPoint.src = '/_layouts/images/setrect.gif';
            tdImgPoint.appendChild(imgPoint);

            var tdNotifier = trNotifier.insertCell(trNotifier.cells.length);
            tdNotifier.vAlign = 'top';
            tdNotifier.className = 'wssc-titletd';
            $(tdNotifier).text(notifierName);
        }
    }
    if (len > limit) {
        var trNotifier = tbNotifiers.insertRow(tbNotifiers.rows.length);
        var tdImgPoint = trNotifier.insertCell(trNotifier.cells.length);

        var tdNotifier = trNotifier.insertCell(trNotifier.cells.length);
        tdNotifier.vAlign = 'top';
        tdNotifier.className = 'wssc-titletd';
        $(tdNotifier).text('...');
    }
    divUsersTitle.style.display = '';

    //вывод "Будут оповещены:" или "Будет делегировано:"
    var notifyTooltipTitle = window.document.getElementById("notifyTooltipTitleID");
    if (this.SelectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution) {
        notifyTooltipTitle.innerText = SLFConsts.NotifyTooltipDelegate;
    }
    else notifyTooltipTitle.innerText = SLFConsts.NotifyTooltip;

}

//скрытие заголовка с выбором пользователей
function SLField_HideNotifiersTooltip() {
    this.V1_SelectedNotifiersTooltip.style.display = 'none';
}

function SLField_ClearNotifyers() {
    this.ResultInfo.Notifyers = '';
    this.HdnSelectedNotifiers.value = '';
    this.HdnSelectedNotifiersNames.value = '';
    if (this.NotifyUsersTD != null) {
        var txtNotifyUsers = this.NotifyUsersTD.children[0];
        txtNotifyUsers.value = '';
    }
    var notifyBlockMainDiv = document.getElementById('notifyBlockMainDiv');
    var oldChild = notifyBlockMainDiv.children[0];
    while (oldChild != null) {
        notifyBlockMainDiv.removeChild(oldChild);
        oldChild = notifyBlockMainDiv.children[0];
    }

}

//-------------------------------------------------------------------------------------------
//Выбор пользователей от имени которых принимается решение

//Проверяет название решения на единственный/множественный выбор.
function SLField_IsSolutionWithMultipleChoise() {
    var isMultiple = true;
    if (this.SelectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution ||
        this.ItemInfo.AddAgrPersonsSolutions.indexOf(this.SelectedSolutionName) != -1)
        isMultiple = false;

    return isMultiple;
}

//Проверяет решение на необходимость выбора пользователей и выполняет обработку.
function SLField_CheckSolutionWithUsersChoise() {
    var needChiose = false;
    if (this.SelectedSolution != null) {

        //решение с выбором пользователей от имени которых оно принимается
        var solutionsWithChoise = this.ItemInfo.SolutionsWithUserChoise;
        if (solutionsWithChoise && solutionsWithChoise.indexOf(this.SelectedSolutionName) != -1) {
            needChiose = true;
            var openWindow = false;

            if (!this.AgrUsersLookupSettings) {
                var lookupSettings = window.GetLookupSettings('ApplySolutionSelectUser');
                if (lookupSettings == null)
                    throw new Error('lookupSettings is null.');

                SM.AttachEvent(lookupSettings, 'OnLookupWindowCancel', SLField_AgrUsersWindow_OnCancel);
                SM.AttachEvent(lookupSettings, 'OnSearchRequest', SLField_AgrUsersWindow_OnSearch);
                SM.AttachEvent(lookupSettings, 'OnLookupWindowSave', SLField_AgrUsersWindow_OnWindowSave);
                SM.AttachEvent(lookupSettings, 'OnLookupWindowLoad', SLField_AgrUsersWindow_OnLookupWindowLoad);

                //устанавливаем ширину контрола по ширине поля
                lookupSettings.ControlWidth = this.ItemInfo.FieldWidth;
                this.AgrUsersLookupSettings = lookupSettings;
            }

            if (!this.AgrUsersLookupControl) {

                //создаем контрол множественной подстановки вне зависимости от текущего решения
                this.AgrUsersLookupSettings.IsMultiple = true;
                this.AgrUsersLookupControl = new DBLookupControl('ApplySolutionSelectUser', this.AgrUsersLookupSettings.SettingsName, '', 'agrUsersConteinerDiv', 'hdnSelectedAgrUsers');

                this.AgrUsersLookupSettings.IsMultiple = this.IsSolutionWithMultipleChoise();
                this.AgrUsersLookupControl.SolutionChanged = true;
                this.AgrUsersLookupControl.SolutionName = this.SelectedSolutionName;

                this.AgrUsersLookupControl.AddDeleteHandler(SLField_AgrUsersLookupControl_OnValueDelete);
                this.AgrUsersLookupControl.AddChangeHandler(SLField_AgrUsersLookupControl_OnValueChanged);

                openWindow = true;
            }
            else {
                if (this.AgrUsersLookupControl.SolutionName != this.SelectedSolutionName) {
                    this.ResultInfo.AcceptingUsersValue = '';
                    this.AgrUsersLookupControl.SetValue(null, true);

                    this.AgrUsersLookupSettings.IsMultiple = this.IsSolutionWithMultipleChoise();
                    this.AgrUsersLookupControl.SolutionChanged = true;
                    this.AgrUsersLookupControl.SolutionName = this.SelectedSolutionName;
                    openWindow = true;
                }
            }

            if (openWindow)
                this.AgrUsersLookupSettings.OpenLookupWindow('ApplySolutionSelectUser');
        }
    }

    //окно отображалось, скрываем 
    if (!needChiose) {
        this.ResultInfo.AcceptingUsersValue = '';
        this.CheckAgrUsersWindowResult = false;
        SLField_AgrUsersWindow_HideViewControl();
    }
    else {
        this.CheckAgrUsersWindowResult = true;
        SLField_AgrUsersWindow_DisplayViewControl();
    }

    return !openWindow;
}

//Проверка заполненности выбора согласующих при принятии решения.
function SLField_ValidateAgrUsersWindowResult() {
    var valid = false;

    if (!SM.IsNE(this.ResultInfo.AcceptingUsersValue)) {
        if (this.AgrUsersLookupSettings != null && this.AgrUsersLookupControl != null) {
            valid = !this.AgrUsersLookupControl.IsEmptyValue();
        }
    }

    return valid;
}

//Удаление согласующего из контрола выбора.
function SLField_AgrUsersLookupControl_OnValueDelete(eventArgs) {
    if (!eventArgs)
        return;

    if (eventArgs.LookupValue && eventArgs.LookupValue.LookupID > 0) {
        var solutionFld = window.SLFieldInstance;
        var deletedUserID = eventArgs.LookupValue.LookupID;

        var usersIDs = solutionFld.ResultInfo.AcceptingUsersValue.split(';');
        var deletedUserIndex = usersIDs.indexOf(deletedUserID.toString());
        if (deletedUserIndex > -1) {
            usersIDs.splice(deletedUserIndex, 1);
        }

        solutionFld.ResultInfo.AcceptingUsersValue = usersIDs.join(';');
    }
}

//Обновляет значение AgrUsersLookupControl при изменениях в контроле подстановки
function SLField_AgrUsersLookupControl_OnValueChanged() {
    var solutionFld = window.SLFieldInstance;
    if (!solutionFld)
        return;

    var lookupControl = solutionFld.AgrUsersLookupControl;
    if (lookupControl)
        SLField_AgrUsersWindow_UpdateAcceptingUsersValue(solutionFld, lookupControl);
}

//Скрывает контрол выбора согласующих от имени которых принимается решение.
function SLField_AgrUsersWindow_HideViewControl() {
    var titleTD = document.getElementById('agrUsersTitleTD');
    var usersTD = document.getElementById('agrUsersTD');

    if (titleTD)
        titleTD.style.display = 'none';

    if (usersTD)
        usersTD.style.display = 'none';
}

//Отображает контрол выбора согласующих от имени которых принимается решение.
function SLField_AgrUsersWindow_DisplayViewControl() {
    var titleTD = document.getElementById('agrUsersTitleTD');
    var usersTD = document.getElementById('agrUsersTD');

    if (titleTD)
        titleTD.style.display = '';

    if (usersTD)
        usersTD.style.display = '';
}

//Срабатывает по нажатию отмены в окне выбора согласующих.
function SLField_AgrUsersWindow_OnCancel(settings, lookupWindow) {
    var solutionFld = window.SLFieldInstance;
    if (!solutionFld.ResultInfo.AcceptingUsersValue) {
        solutionFld.CheckAgrUsersWindowResult = false;
        solutionFld.ClearSelectedSolution();
        if (solutionFld.AgrUsersLookupControl) {
            solutionFld.AgrUsersLookupControl.SolutionName = '';
            SLField_AgrUsersWindow_HideViewControl();
        }
    }
}

//Срабатывает по поиску в окне выбора согласующих. Задает необходимые параметры запроса.
function SLField_AgrUsersWindow_OnSearch(settings, eventArgs) {
    var solutionFld = window.SLFieldInstance;

    eventArgs.QueryBuilder.SetParam('selectedSolutionName', solutionFld.SelectedSolutionName, true);
    //eventArgs.QueryBuilder.SetParam('defaultSelectedIDs', solutionFld.ResultInfo.AcceptingUsersValue, true);
    //eventArgs.QueryBuilder.SetParam('IsMultiple', solutionFld.IsSolutionWithMultipleChoise());
}

//Срабатывает по закрытию окна выбора согласующих. Продолжает логику при смене решения.
function SLField_AgrUsersWindow_OnWindowSave(settings, eventArgs) {
    var lookupControl = window.SLFieldInstance.AgrUsersLookupControl;
    if (lookupControl && lookupControl.SolutionChanged) {
        lookupControl.SolutionChanged = false;
        OnSolutionChange();
    }
}

//Срабатывает по событию отрисовки окна выбора согласующих. Задает заголовок и подсказку.
function SLField_AgrUsersWindow_OnLookupWindowLoad(settings, lookupWindow) {
    if (lookupWindow == null)
        throw new Error('Не передан параметр lookupWindow.');

    SLField_AgrUsersWindow_SetLookupTitle(lookupWindow, 'slfield.agruserswindow.agrUsersWindowTitle');

    var toolTip = ''
    if (!lookupWindow.IsMultiple)
        toolTip = window.TN.TranslateKey('slfield.agruserswindow.agrUsersSingleTooltip');
    else
        toolTip = window.TN.TranslateKey('slfield.agruserswindow.agrUsersMultipleTooltip');

    var divTooltip = document.createElement('div');
    divTooltip.className = 'slField_LookupWindowTooltip';
    SM.SetInnerText(divTooltip, toolTip);

    var tableFooters = document.getElementsByClassName('dbf_lookup_windowFooter');
    if (tableFooters && tableFooters.length > 0) {
        var tableFooter = tableFooters[0];
        lookupWindow.MainDiv.insertBefore(divTooltip, tableFooter);
    }
}

//Задает заголовок в окно подстановки.
function SLField_AgrUsersWindow_SetLookupTitle(lookupWindow, titleKey) {
    if (lookupWindow == null)
        throw new Error('Не передан параметр lookupWindow.');

    var title = window.TN.TranslateKey(titleKey);
    var divTitle = document.createElement('div');
    divTitle.className = 'slField_LookupWindowTitle';
    SM.SetInnerText(divTitle, title);
    lookupWindow.MainDiv.insertBefore(divTitle, lookupWindow.MainDiv.firstElementChild);
}

//Срабатывает по нажатию "ОК" в окне выбора согласующих. Записывает результат в контрол и ResultInfo.
function SLField_AgrUsersWindow_SetValueXml(resultUniqueKey, xml) {
    if (xml == null)
        return;
    var solutionFld = window.SLFieldInstance;
    var isMultiple = solutionFld.IsSolutionWithMultipleChoise();
    var solutionButtons = solutionFld.ItemInfo.SolutionsParams.SolutionButtonsEnable;

    var lookupControl = window.GetLookupControl(resultUniqueKey);
    if (lookupControl != null) {
        lookupControl.SetValueXml(xml);

        //SLField_AgrUsersWindow_UpdateAcceptingUsersValue(solutionFld, lookupControl);
    }
}

//
function SLField_AgrUsersWindow_UpdateAcceptingUsersValue(solutionFld, lookupControl) {
    if (!solutionFld)
        throw new Error('solutionFld is null');

    if (!lookupControl)
        throw new Error('lookupControl is null');

    solutionFld.ResultInfo.AcceptingUsersValue = '';
    var value = lookupControl.GetValue();
    if (value) {
        var stringValue = "";

        if (!lookupControl.Settings.IsMultiple)
            stringValue = value.LookupID.toString();
        else {
            var i, len = value.length;
            for (i = 0; i < len; i++) {
                var singleValue = value[i];
                if (singleValue && singleValue.LookupID > 0)
                    stringValue += singleValue.LookupID + ';';
            }
        }

        solutionFld.ResultInfo.AcceptingUsersValue = stringValue;
    }
}

//-------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------
//простановка значений по решению на клиенте
function SLField_SetClientFieldValues(fieldsXml) {
    if (fieldsXml == null || fieldsXml == '') return true;
    var stXml = WKF_GetXmlFromDataString(fieldsXml);
    var axoSetFields;
    axoSetFields = window.SM.LoadXML(stXml);
    if (axoSetFields == null) return;
    var docSetFields = axoSetFields.documentElement;
    var xmlSetFields = docSetFields.selectNodes('field');
    if (xmlSetFields != null) {
        //создание массива для значений, которые проставляются на клиеенте
        if (this.OldClientValues == null) this.OldClientValues = new Array();

        var i, len = xmlSetFields.length;
        for (i = 0; i < len; i++) {
            var setFieldNode = xmlSetFields[i];
            var fieldName = setFieldNode.getAttribute('name');
            var type = setFieldNode.getAttribute('type');
            var value = setFieldNode.getAttribute('value');
            var valueFromField = false;

            if (value != null)
                if (value.length > 2)
                    if (value.indexOf(']') > 0) {
                        var fieldVal = value.replace('[', '').replace(']', '');
                        //значение из поля
                        if (value != '[Сегодня]' && value != '[Сейчас]' && value != '[Я]') {
                            value = this.GetFieldValue(ListForm.GetField(fieldVal));
                            valueFromField = true;
                        }
                        //значение даты
                        if (value == '[Сегодня]')
                            value = WKF_GetDateByValue(value, false);

                        if (value == '[Сейчас]')
                            value = WKF_GetDateByValue(value, false);
                        //значение [Я]
                        if (value == '[Я]') value = ListForm.CurrentUserID.toString();
                    }
            //стандартные поля
            if (fieldName != null && fieldName != '')//&& value != null && value != ''
            {
                try {
                    var fieldObj = ListForm.GetField(fieldName);
                    if (fieldObj != null) {

                        if (!valueFromField && value.indexOf(';#') >= 0 && (fieldObj.Type == 'DBFieldLookupSingle' || fieldObj.Type == 'DBFieldLookupMulti')) {
                            var valParts = value.split(';#');
                            //значение единичной подстановки
                            if (fieldObj.Type == 'DBFieldLookupSingle') {
                                var lookupObj = new Object();
                                lookupObj.LookupID = valParts[0];
                                value = lookupObj;
                            }
                            //значение множественной подстановки
                            if (fieldObj.Type == 'DBFieldLookupMulti') {
                                var lookupObjArray = new Array();
                                for (var k = 0; k < valParts.length; k++) {
                                    if (valParts[k] == '') continue;
                                    var lookupObj = new Object();
                                    lookupObj.LookupID = valParts[k];
                                    lookupObjArray.push(lookupObj);
                                }
                                value = lookupObjArray;
                            }
                        }
                        //добавляем старые значения в словарь
                        var oldValue = fieldObj.GetValue();
                        var setClientFldObj = new Object();
                        setClientFldObj.FieldName = fieldName;
                        setClientFldObj.FieldValue = oldValue;
                        this.OldClientValues.push(setClientFldObj);

                        if (value == '') value = null;
                        if (fieldObj.Type == 'DBFieldLookupMulti')
                            fieldObj.TypedField.SetValue(value, true);
                        else
                            fieldObj.SetValue(value);

                    }
                }
                catch (e) {
                    alert('Возникла ошибка при установке значения ' + value + ' в поле ' + fieldName + '.\nОписание ошибки:SetClientFieldValues - ' + e.message + '.'); return false;
                }

            }

        }
    }
    return true;
}





//-------------------------------------------------------------------------------------------
//обработка конфликта сохранения
//сохранение состояния поля решения (для конфликта сохранения)
function SLField_GetSolutionFieldState() {
    //решение
    var solutionName = this.SelectedSolutionName;
    if (solutionName == null) solutionName = '';
    //комментарий
    var comment = this.GetComment();

    var xml = "<Fields><Field name='Решения'><FieldValue solution='' comment='' /></Field></Fields>";
    var xmlSolutionState = window.SM.LoadXML(xml);
    var rootNode = xmlSolutionState.documentElement.selectSingleNode("Field/FieldValue");
    rootNode.setAttribute('solution', solutionName);
    rootNode.setAttribute('comment', comment);
    var resultXml = window.SM.PersistXML(xmlSolutionState);
    return resultXml;
}


function WKF_SaveConflictData() {
    var solutionFld = window.SLFieldInstance;
    var url = WSSC_EDMS_WebUrl + '/_layouts/WSS/WSSC.V4.DMS.Workflow/SaveConflict/SaveConflictData.aspx?rnd=' + Math.random();

    var params = new String();
    params = params.concat('&listID=', ListForm.ListID);
    params = params.concat('&itemID=', ListForm.ItemID);
    var solXmlStr = solutionFld.GetSolutionFieldState();
    var solXmlDoc = SM.LoadXML(solXmlStr);
    var wasOpen = false;
    var nfField = ListForm.GetField('Рассылка');
    if (nfField && nfField.TypedField && nfField.TypedField.FieldValue) {
        if (window.NFWindow && window.NFWindow.PopupWindow && window.NFWindow.PopupWindow.IsOpen) {
            window.NFWindow.OnOKClick();
            wasOpen = true;
        }
        var nfXmlElement = nfField.TypedField.FieldValue.XmlElement;
        var nfieldXml = solXmlDoc.createElement('Field');
        solXmlDoc.selectSingleNode('Fields').appendChild(nfieldXml)
        nfieldXml.setAttribute('name', 'Рассылка');
        nfieldXml.setAttribute('versionNumber', ListForm.VersionNumber);
        if (wasOpen)
            nfieldXml.setAttribute('openNFWindow', "true");
        nfieldXml.appendChild(nfXmlElement);
    }
    var fieldsState = SM.PersistXML(solXmlDoc);
    params = params.concat('&fieldsValues=', WKF_EnsureQueryString(fieldsState));
    params = encodeURI(params);
    var ajax = window.SM.GetXmlRequest();
    ajax.open("POST", url, false);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.send(params);
    var conflictDataXml = ajax.responseText;


    if (conflictDataXml) {
        var conflictDataXmlDoc = window.SM.LoadXML(conflictDataXml);
        var resultNode = conflictDataXmlDoc.selectSingleNode("result");
        //проверка на конфликт сохранения вернула результат
        if (resultNode != null) {
            var conflictDataID = resultNode.getAttribute('conflictDataID');
            var editorFIO = resultNode.getAttribute('editorFIO');
            var editorID = resultNode.getAttribute('editorID');
        }
        var titleField = ListForm.GetField(SLFConsts.TitleFieldName);
        if (titleField != null)
            var title = titleField.GetValue();
    }

    var numConflictDataID = parseInt(conflictDataID);
    //был Exception при загрузки карточки
    var wasException = $('.dbf_errorpanel').length > 0

    if (!isNaN(numConflictDataID) && !solutionFld.StopCheckSaveConflict && !wasException) {
        var url = window.location.href;
        var oldConflictDataID = solutionFld.RequestParams['conflictDataID'];
        if (oldConflictDataID != null)
            url = url.replace('&conflictDataID=' + oldConflictDataID, '');


        if (ListForm.CurrentUserID != editorID) {
            var alertMessage = SLFConsts.Warning_SaveConflictMessage;

            //замена в сообщении Рег. номера
            if (title != '')
                alertMessage = alertMessage.replace('{0}', " '" + title + "' ");
            else alertMessage = alertMessage.replace('{0}', ' ');

            //замена в сообщении ФИО пользователя
            if (editorID != '')
                alertMessage = alertMessage.replace('{1}', " '" + editorFIO + "'");
            else alertMessage = alertMessage.replace('{1}', '');
            alert(alertMessage);
        }

        url = url + '&conflictDataID=' + conflictDataID;
        window.location.href = url;
    }
}

//функция проверки: обновлялась ли карточка - сверяет клиентский и серверный optimisticLockID
function SLField_CheckSaveConflict() {
    var solutionFld = window.SLFieldInstance;
    var optimisticLockID = solutionFld.ItemInfo.OptimisticLockID;
    var url = WSSC_EDMS_WebUrl + '/_layouts/WSS/WSSC.V4.DMS.Workflow/SaveConflict/CheckSaveConflict.aspx?rnd=' + Math.random();
    var params = new String();
    params = params.concat('&listID=', ListForm.ListID);
    params = params.concat('&itemID=', ListForm.ItemID);
    params = encodeURI(params);
    var ajax = window.SM.GetXmlRequest();
    ajax.open("POST", url, true);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            ajax.onreadystatechange = new Function();
            var lockId = ajax.responseText;
            //сохранить данные и вывести сообщение
            if (lockId && (lockId != optimisticLockID)) {
                WKF_SaveConflictData();
            }
            //перезапустить таймер
            else {
                //очищаем предыдущий таймер
                if (solutionFld.SaveConflictTimerID != null) {
                    window.TM.DeleteHandler(solutionFld.SaveConflictTimerID);
                    solutionFld.SaveConflictTimerID = null;
                }
                //добавляем таймер для повторной проверки конфликта сохранения - в случае отсутствия пользовтельской активности
                //следующий вызов таймера откладывается до ее возобновления.
                solutionFld.SaveConflictTimerID = window.TM.Execute(solutionFld.CheckIsCardWasUpdatedLimit * 1000, solutionFld.CheckSaveConflict);
            }
        }
    }
    ajax.send(params);
}

//-------------------------------------------------------------------------------------------
//dispose поля Решения
function SLField_Dispose() {
    this.DivContainer = null;
    this.SolutionControl = null; //dropdownlist с решениями

    this.DivTooltip = null; //div с подсказкой к решению
    this.EditSolutionLink = null; //ссылка "Редатировать решение для нового дизайна"

    this.RequestParams = null; //параметры страницы

    this.HdnResultInfo = null; //хидден с результами выбора решения

    //комментарии и замечания
    this.CommentTD = null; //ячейка с комментарием
    this.V1_CommentTB = null; //текст-бокс с комментарием
    this.CommentTA = null; //текст-бокс с комментарием (новый дизайн)
    this.CommentTR = null; //строка в таблице комментария

    this.V1_RemarkTB = null; //текст-бокс с замечаниями
    this.RemarkTA = null; //текст-бокс с замечаниями (новый дизайн)
    this.RemarkTD = null; //ячейка с замечаниями
    this.RemarkCB = null; //чек-бокс переключения режима

    //окно "Оповестить"
    this.NotifyUsersTD = null;
    this.NotifyTitleTD = null;
    this.NotifyBlockTD = null;
    this.NotifyTitleNoBR = null;
    this.V1_NotifiersTB = null;

    this.CommentsBlock = null;
    this.OpenNotifiersBT = null;

    this.HdnSelectedNotifiers = null;
    this.HdnSelectedNotifiersNames = null;
    this.V1_SelectedNotifiersTooltip = null;

    this.SelectedSolutionName = null;//выбранное решение
    this.SolutionHint = null;//подсказка к выбранному решению

    //объект с информацией о документе
    this.ResultInfo = null;

    //объект с информацией о возвращаемях значениях с формы
    this.ItemInfo = null;

    //массив полей, для которых обязательность нужно проверять отдельно
    this.CondRequiredFields = null;
}



//dispose объекта со сложными свойствами
function WKF_DisposeObj(obj) {
    if (obj != null) {
        for (var prop in obj) {
            obj[prop] = null;
        }
        obj = null;
    }
}

//-------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------
//всплывающие окна (перенос сроков, регистрация и т.п.)
//выбрано ли решение с параметрами из всплывающего окна
function SLField_IsSolutionWithWindowParams() {
    var solWindowVal = null;
    try {
        solWindowVal = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.SolutionWindowParams);
    } catch (e) { }
    if (solWindowVal != null && solWindowVal != "") return true;
    return false;
}

//простановка значений в форму из всплывающего окна
function SLField_SetValuesToFormFromSolutionWindow() {
    try {
        if (window.SolutionWindow != null) {
            for (var i = 0; i < window.SolutionWindow.IndexedFields.length; i++) {
                var WSSC_FieldObj = window.SolutionWindow.IndexedFields[i];
                if (WSSC_FieldObj.DestinationField != null && WSSC_FieldObj.DestinationField != "") {
                    var fieldName = WSSC_FieldObj.DestinationField.replace('{', '').replace('}', ''); //удаление системных символов
                    var fieldValue = WSSC_FieldObj.FieldValue;
                    var dbFieldObj = window.ListForm.GetField(fieldName);
                    if (dbFieldObj != null) {
                        if (dbFieldObj.Type == "DBFieldLookupMulti") {
                            var typedField = dbFieldObj.TypedField;
                            typedField.SetValue(fieldValue, WSSC_FieldObj.OvverideMultiValue);
                        }
                        else
                            dbFieldObj.SetValue(fieldValue);
                    }

                }

            }
        }
    }
    catch (e) { alert('Произошла ошибка при простановке значений из всплывающего окна. ' + e.message + '.'); }
}
//debugger;
//окно с дополнительными параметрами для решений
function ShowWindowWithSolutionParams(openManual) {
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    var openManualParam = openManual;
    if (openManualParam == null) openManualParam = true;
    var solutionFld = window.SLFieldInstance;
    if (solutionFld.InitMode) return;

    var solWindowVal = null;
    if (!solutionButtons) SLFieldInstance.GetSelectedSolution();

    var solution = solutionFld.SelectedSolution;
    if (solutionButtons && solution == null) solution = solutionFld.LastSolution;

    try {
        solWindowVal = solutionFld.GetDMSFieldValue(solution, SLFConsts.SolutionsConsts.SolutionWindowParams);
    }
    catch (e) {
    }

    if (solWindowVal != null && solWindowVal != "") {
        //если новый дизайн, то смотрим является ли данное решение - решением с параметрами из всплывающего окна
        if (!solutionButtons && solutionFld.EditSolutionLink != null)
            solutionFld.EditSolutionLink.style.display = '';

        //проверяем заполненность полей

        var requiredFieldsAlert = window.TN.TranslateKey('ListForm.Alerts.RequiredFields') + '\n\r';
        var hasNotEmptyFld = false;

        for (var i = 0; i < ListForm.Fields.length; i++) {
            var field = ListForm.Fields[i];
            if (field.ReadOnly || !field.Required) continue;
            if (field.IsEmptyValue()) {
                requiredFieldsAlert += ' - ' + field.DisplayName + '\n\r';
                hasNotEmptyFld = true;
            }
        }

        if (hasNotEmptyFld) {
            solutionFld.SetParamsFromFloatWindow = false;
            alert(requiredFieldsAlert);
            SLFieldInstance.NotEmptyWindowFields = true;
            //будет выдано сообщение о незаполненных полях через ListForm
            return true;
        }


        var solWindowXmlDoc;
        solWindowXmlDoc = window.SM.LoadXML(solWindowVal);
        var width = solWindowXmlDoc.firstChild.getAttribute('windowWidth');
        var height = solWindowXmlDoc.firstChild.getAttribute('windowHeight');
        if (width == null || width == '') width = 400;
        if (height == null || height == '') height = 350;
        var solutionID = solution.ID;

        var url = '/_layouts/WSS/WSSC.V4.DMS.Workflow/SolutionsField/SolutionParams.aspx?solutionID=' + solutionID + '&listID=' + ListForm.ListID + '&itemID=' + ListForm.ItemID + '&isEditForm=true' + '&webUrl=' +
            ListForm.WebUrl + "&openManual=" + openManualParam.toString().toLowerCase();
        var urlNewDesign1 = '/_layouts/WSS/WSSC.V4.DMS.Workflow/SolutionsField/SolutionParamsNewDesign1.aspx?solutionID=' + solutionID + '&listID=' + ListForm.ListID + '&itemID=' + ListForm.ItemID + '&isEditForm=true' + '&webUrl=' +
            ListForm.WebUrl + "&openManual=" + openManualParam.toString().toLowerCase();

        window.OpenPopupWindow(urlNewDesign1, width, height, '19px 16px 10px 16px !important');

        return true;
    }
    else {
        if (!solutionButtons && solutionFld.EditSolutionLink != null)
            solutionFld.EditSolutionLink.style.display = 'none';

        solutionFld.SetParamsFromFloatWindow = true;
        return false;
    }
}




//-------------------------------------------------------------------------------------------
//условия на поля по решениям и на этапах
function SLField_IsEmptyMultiLookup(condFieldName) {
    var fieldVal = this.GetFieldValue(ListForm.GetField(condFieldName));
    if (fieldVal != null && fieldVal.length != null) return fieldVal.length == 0;
    return true;
}

//проверка условий на поля карточки
function SLField_MeetUnitCondition(cond, textForAlert) {
    //try 
    {
        var resultObject = new Object();
        var stCondXml = WKF_GetXmlFromDataString(cond);
        var axoCond;
        axoCond = window.SM.LoadXML(stCondXml);
        var docCond = axoCond.documentElement;
        if (docCond == null) return null;
        var xmlUnitConds = docCond.selectNodes('condunit');
        if (xmlUnitConds == null || xmlUnitConds.length == 0) {
            var testResult = this.MeetCondition(cond);
            if (testResult) {
                resultObject.Message = textForAlert;
                resultObject.SolutionBanned = false;
                return resultObject;
            }
            else return null;
        }


        if (xmlUnitConds != null && xmlUnitConds.length > 0) {
            for (var k = 0; k < xmlUnitConds.length; k++) {
                var fullCondStr = "true";
                var xmlUnitCond = xmlUnitConds[k];
                var messageUnitConds = xmlUnitCond.getAttribute('text');
                var solutionBannedUnitConds = xmlUnitCond.getAttribute('solutionBanned') == 'true';
                if (messageUnitConds == null || messageUnitConds == '') continue;

                var xmlConds = xmlUnitCond.selectNodes('cond');
                var i, len = xmlConds.length;
                for (i = 0; i < len; i++) {
                    var xmlCond = xmlConds[i];
                    var condField = xmlCond.getAttribute('name');
                    var condValue = xmlCond.getAttribute('value');
                    var criteriaValue = xmlCond.getAttribute('criteria');
                    var combinationType = "&&"; //по умолчанию
                    var combinationTypeAttr = xmlCond.getAttribute('combinationType');
                    if (combinationTypeAttr != null)
                        if (combinationTypeAttr == "or") combinationType = "||";
                    if (criteriaValue == null) criteriaValue = 'e';
                    var testResult = false;
                    //try 
                    {
                        testResult = this.TestFieldByCondition(condField, condValue, criteriaValue, WKF_SetSolutions);
                    }
                    //catch (e) { alert('Возникла ошибка при проверке условия.\nПоле: ' + condField + ', Значение: ' + condValue + ', Критерий: ' + criteriaValue); break; }
                    fullCondStr += combinationType + testResult;

                }
                var meetCondition = eval(fullCondStr);
                if (meetCondition) {
                    resultObject.Message = window.TN.Translate(messageUnitConds);
                    resultObject.SolutionBanned = solutionBannedUnitConds;
                    return resultObject;
                }
            }
        }
    }
    //catch (e) 
    {
        //alert('Возникла ошибка при проверке условий.\nОписание ошибки:MeetCondition - ' + e.message + '.');
    }
    return null;
}


//проверка условий на поля карточки
function SLField_MeetCondition(cond) {
    var meetCondition = true;
    //try 
    {
        var stCondXml = WKF_GetXmlFromDataString(cond);
        var axoCond;
        axoCond = window.SM.LoadXML(stCondXml);
        var docCond = axoCond.documentElement;
        if (docCond == null) return true;
        var xmlConds = docCond.selectNodes('cond');

        var fullCondStr = "true";
        if (xmlConds != null) {
            var i, len = xmlConds.length;
            for (i = 0; i < len; i++) {
                var xmlCond = xmlConds[i];
                var condField = xmlCond.getAttribute('name');
                var condValue = xmlCond.getAttribute('value');
                var criteriaValue = xmlCond.getAttribute('criteria');
                var combinationType = "&&"; //по умолчанию
                var combinationTypeAttr = xmlCond.getAttribute('combinationType');
                if (combinationTypeAttr != null)
                    if (combinationTypeAttr == "or") combinationType = "||";
                if (criteriaValue == null) criteriaValue = 'e';
                var testResult = false;
                //try 
                {
                    testResult = this.TestFieldByCondition(condField, condValue, criteriaValue, WKF_SetSolutions);
                }
                //catch (e) { alert('Возникла ошибка при проверке условия.\nПоле: ' + condField + ', Значение: ' + condValue + ', Критерий: ' + criteriaValue); break; }
                fullCondStr += combinationType + testResult;

            }
            meetCondition = eval(fullCondStr);
        }
    }
    //catch (e) { alert('Возникла ошибка при проверке условий.\nОписание ошибки:MeetCondition - ' + e.message + '.'); }
    return meetCondition;
}

//-------------------------------------------------------------------------------------------
//делегирование
function SLField_CheckDelegateSolution() {
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;

    var selectedSolutionName = this.SelectedSolutionName;

    if (solutionButtons && (selectedSolutionName == null || selectedSolutionName == ''))
        selectedSolutionName = this.LastSolutionName;

    if (selectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution) {
        OpenNotifiersNewWindow();
        return true;

        //открываем окно делегирования
        //var lookupSettings = window.GetLookupSettings('OpenDelegateSelectUser');
        //lookupSettings.OpenLookupWindow('OpenDelegateSelectUser');
    }
    return false;
}


//-------------------------------------------------------------------------------------------
//доступ к полям по условиям
function SLField_GetNewCondAccessToFields() {
    if (this.GetNewCondAccessToFieldsDisabled
        || this.ItemInfo.ConditionalAccessFields == '' || this.ItemInfo.ConditionalAccessFields == null
        || this.ItemInfo.ChangedAccessFields == '' || this.ItemInfo.ChangedAccessFields == null) return;

    this.GetNewCondAccessToFieldsDisabled = true;

    //по переменной определяем для каких полей необходимо определить значения
    var resultFieldValues = '';
    if (this.ItemInfo.ConditionalAccessFields != '') {
        var fieldNames = this.ItemInfo.ConditionalAccessFields.split(';');
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var fieldObj = window.ListForm.GetField(fieldName);
            if (fieldObj == null) continue;
            //добавляем в запрос значения полей только следующих типов
            if (fieldObj.Type != 'DBFieldText' && fieldObj.Type != 'DBFieldMultiLineText' &&
                fieldObj.Type != 'DBFieldChoice' && fieldObj.Type != 'DBFieldBoolean' &&
                fieldObj.Type != 'DBFieldNumber' && fieldObj.Type != 'DBFieldInteger' &&
                fieldObj.Type != 'DBFieldDateTime' && fieldObj.Type != 'DBFieldLookupSingle'
                && fieldObj.Type != 'DBFieldLookupMulti' && fieldObj.Type != 'MSLField' && fieldObj.Type != 'PDField') continue;

            var value = this.GetFieldValue(fieldObj);
            //единичная подстановка
            if (fieldObj.Type == "DBFieldLookupSingle" && value != '' && value != null) value = value.LookupID;
            //множественная подстановка
            if (fieldObj.Type == "DBFieldLookupMulti" && value != '' && value != null) {
                var idStr = '';
                if (value.length > 0)
                    for (var k = 0; k < value.length; k++) {
                        var lookupObj = value[k];
                        if (lookupObj.LookupID != null && lookupObj.LookupID > 0) {
                            if (k != 0) {
                                idStr += ',';
                            }
                            idStr += lookupObj.LookupID.toString();
                        }
                    }
                value = idStr;
            }
            //мультиисточники
            if (fieldObj.Type == "MSLField" && value != '' && value != null) {
                //множественные мультиисточники
                if (fieldObj.TypedField.IsMultiple) {
                    var idStr = '';
                    if (value.length > 0)
                        for (var k = 0; k < value.length; k++) {
                            var lookupObj = value[k];
                            if (lookupObj.LookupID != null && lookupObj.LookupID > 0 && lookupObj.LookupListID != null && lookupObj.LookupListID > 0) {
                                if (k != 0)
                                    idStr += ',';

                                idStr += lookupObj.LookupID.toString() + ";" + lookupObj.LookupListID.toString();
                            }
                        }
                    value = idStr;
                }
                //единичные мультиисточники
                else {
                    value = value.LookupID + ";" + value.LookupListID;
                }
            }
            //файлы родительского документа
            if (fieldObj.Type == "PDField" && value != '' && value != null) {

                var idStr = '';
                if (value.length > 0)
                    for (var k = 0; k < value.length; k++) {
                        var fileObj = value[k];
                        if (fileObj.ItemID != null && fileObj.ItemID > 0 && fileObj.ItemListID != null && fileObj.ItemListID > 0) {
                            if (k != 0)
                                idStr += ',';

                            idStr += fileObj.ItemID.toString() + ";" + fileObj.ItemListID.toString();
                        }
                    }
                value = idStr;

            }
            if (value == null) value = '';
            if (resultFieldValues != '') resultFieldValues += "_sp_";
            resultFieldValues += fieldName + "=" + value;

        }
    }
    var url = '/_layouts/WSS/WSSC.V4.DMS.Workflow/CondAccessToFields/GetNewCondAccessToFields.aspx?rnd=' + Math.random().toString();
    var params = 'webID=' + ListForm.WebID;
    params += '&listID=' + ListForm.ListID;
    params += '&itemID=' + ListForm.ItemID;
    params += '&fieldsValues=' + resultFieldValues;
    params += '&changedFields=' + this.ItemInfo.ChangedAccessFields;
    params = encodeURI(params);

    var ajax = window.SM.GetXmlRequest();
    ajax.open("POST", url, false);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.send(params);
    var response = ajax.responseText;


    if (!window.SM.IsNE(response)) {
        if (response.indexOf('Exception') != -1) {
            window.alert(response);
            this.GetNewCondAccessToFieldsDisabled = false;
            return;
        }

        //загружаем полученный xml в блок согласований
        var tmpXmlDoc = window.SM.LoadXML(response);
        var fieldsNodes = tmpXmlDoc.selectNodes("condAccess/field");

        if (fieldsNodes != null) {
            for (var i = 0; i < fieldsNodes.length; i++) {
                var fieldNode = fieldsNodes[i];
                var fieldName = fieldNode.getAttribute("name");
                var access = fieldNode.getAttribute("access") == 'true';
                var display = fieldNode.getAttribute("display") == 'true';
                var fieldObj = ListForm.GetField(fieldName);
                if (fieldObj == null) continue;
                if (fieldObj.ReadOnly) continue;

                if (access) fieldObj.Enable();
                else fieldObj.Disable();
                if (display) fieldObj.Display();
                else fieldObj.Hide();
            }
        }

    }

    this.GetNewCondAccessToFieldsDisabled = false;
}

//добавление обработчиков
function SLField_AddCondAccessFieldsHandlers() {
    if (this.ItemInfo.ConditionalAccessFields != '') {
        var condAccessFieldNames = this.ItemInfo.ConditionalAccessFields.split(';');
        for (var i = 0; i < condAccessFieldNames.length; i++) {

            var fieldObj = ListForm.GetField(condAccessFieldNames[i]);
            if (fieldObj == null) continue;
            if (!fieldObj.IsSetCondAccessHandler) {
                fieldObj.AddChangeHandler(function () {
                    var solutionFld = window.SLFieldInstance;
                    solutionFld.GetNewCondAccessToFields();
                });
                fieldObj.IsSetCondAccessHandler = true;
            }
        }
    }
}





//-------------------------------------------------------------------------------------------
//базовая логика Wokflow
function WKF_SetSolutions() {
    var solutionFld = window.SLFieldInstance;
    solutionFld.SetSolutions();
}

function SLField_SetSolutions() {
    var solutionButtons = SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonsEnable;
    if (solutionButtons) {
        var noSolutionsDivID = document.getElementById('noSolutionsDivID');
        noSolutionsDivID.style.display = 'none';

        this.HiddenSolutionsDivContainer.innerHTML = '';
        this.HiddenSolutionsDivContainer.style.display = 'none';
        this.HiddenSolutionsDivContainerTitle.style.display = 'none';
        this.SolutionButtonsDiv.innerHTML = '';
        this.DivContainer.innerHTML = '';
    }

    var xiSolutionsList = window.xiSolutionsListID;
    if (xiSolutionsList == null && !solutionButtons) return;
    var solutionsItems = xiSolutionsList.Items;
    var solutionsExists = false;

    if (!solutionButtons) {
        this.SelectedSolutionName = '';
        this.SelectedSolution = null;
    }

    //новый дизайн
    var oldSelectedSolutionName = '';
    var oldSelectedSolutionDispName = '';
    var solutionIsActual = false;

    if (!solutionButtons)
        if (this.SolutionControl.Value != null) {
            oldSelectedSolutionDispName = this.SolutionControl.Value.Text;
            oldSelectedSolutionName = this.SolutionControl.Value.Value;
        }


    if (!solutionButtons) {
        WKF_InitSolutionControl();

        if (!this.ItemInfo.HideSelectSolutionOption)
            this.AddEmptyOption();
    }


    var needAddSpecialSolution = false;
    //добавление специального решения, если были удалены все согласующие из блока согласования
    if (window.AgreementBlockInstance != null) {
        if (WSSC_PBS_PassingFormData.IsAgreementStageIsCurrent && WSSC_PBS_IsAllUsersPassed() && WSSC_PBS_CanUserEditPassageBlock) {
            needAddSpecialSolution = true;
        }
    }

    //решение было установлено
    var firstSolutionLikeDefault = false;
    if (this.ItemInfo.HideSelectSolutionOption) firstSolutionLikeDefault = true;

    var addedSolutions = 0;//кол-во добавленных решений
    var hideSolutionButton = false;//кнопка-решение добавляется в скрытый div

    SLFieldInstance.SolutionButtons = new Array();

    if (solutionsItems != null) {
        var i, len = solutionsItems.length;
        for (i = 0; i < len; i++) {
            var solutionItem = solutionsItems[i];

            //пропускаем все скрытые кастом-кодом решения
            if (solutionItem.IsHidden) continue;

            var solutionName = this.GetDMSFieldValue(solutionItem, SLFConsts.SolutionsConsts.Name);

            //проверка на спец. решение для блока согласования
            var specialSolution = this.GetDMSFieldValue(solutionItem, SLFConsts.SolutionsConsts.IsSpecialSolution).toLowerCase() == 'true';
            if (specialSolution && !needAddSpecialSolution) continue;

            var showNotifyBlock = this.GetDMSFieldValue(solutionItem, SLFConsts.SolutionsConsts.ShowNotifyBlock).toLowerCase() == 'true';
            var windowCommonSettingName = this.GetDMSFieldValue(solutionItem, SLFConsts.SolutionsConsts.CommonSettingForWindow);

            var isHiddenSolution = false;
            //скрытое решение
            try {
                isHiddenSolution = this.GetDMSFieldValue(solutionItem, SLFConsts.SolutionsConsts.HiddenSolution).toLowerCase() == 'true';
            }
            catch (e) {
            }

            if (!solutionButtons) {
                if (showNotifyBlock || this.SelectedSolutionName == SLFConsts.SolutionsConsts.DelegateSolution) {
                    var needChangeLayoutSizes = this.NeedChangeResetLayoutSizes('');
                    this.NotifyTitleTD.style.display = '';
                    this.NotifyBlockTD.style.display = '';
                    if (needChangeLayoutSizes) window.SM.ResetFormLayout();
                }
                else {
                    var needChangeLayoutSizes = this.NeedChangeResetLayoutSizes('none');
                    this.NotifyTitleTD.style.display = 'none';
                    this.NotifyBlockTD.style.display = 'none';
                    this.NotifyTitleNoBR.innerText = '';
                    if (needChangeLayoutSizes) window.SM.ResetFormLayout();
                }
            }

            if (isHiddenSolution) continue;
            var defaultAction = true;

            //кнопка размещается в скрытой зоне
            hideSolutionButton = SLFieldInstance.ItemInfo.SolutionsParams.MaxSolutionButtons <= addedSolutions;

            //зависание на этапе
            switch (solutionName) {
                case 'Перейти на следующий этап':
                    var currentStageName = this.ItemInfo.CurrentStage;
                    var currentStage = GetStage(currentStageName);
                    var condFieldCol = currentStage.Fields;
                    if (condFieldCol != null) {
                        for (var j = 0; j < condFieldCol.length; j++) {
                            var condField = condFieldCol[j];
                            var cond = condField.Value;
                            var meetCondition = true;
                            if (cond != null && cond != '') {
                                meetCondition = this.MeetCondition(cond);
                            }
                            if (!meetCondition) {
                                //актуальность решения
                                if (oldSelectedSolutionName == solutionName)
                                    solutionIsActual = true;

                                this.AddSolutionOption(solutionItem, firstSolutionLikeDefault, hideSolutionButton);
                                addedSolutions++;
                                firstSolutionLikeDefault = false;
                                solutionsExists = true;
                            }
                        }
                    }
                    defaultAction = false;
                    break;
            }

            //стандартное добавление решения
            if (defaultAction) {
                var condField = null;
                if (solutionItem.Fields != null) {
                    for (var k = 0; k < solutionItem.Fields.length; k++) {
                        var tmpCondField = solutionItem.Fields[k];
                        if (tmpCondField.Operation == 1)//тип операции Equal
                        {
                            condField = tmpCondField;
                            break;
                        }
                    }
                }
                if (condField != null) {
                    var cond = condField.Value;
                    var meetCondition = true;
                    if (cond != null && cond != '') {
                        meetCondition = this.MeetCondition(cond);
                    }
                    if (meetCondition) {
                        //актуальность решения
                        if (oldSelectedSolutionName == solutionName)
                            solutionIsActual = true;
                        //добавление решения в dropdownlist или как кнопку
                        this.AddSolutionOption(solutionItem, firstSolutionLikeDefault, hideSolutionButton);
                        addedSolutions++;
                        firstSolutionLikeDefault = false;
                        solutionsExists = true;
                    }
                }
            }
        }
        if (len == 0) {
            solutionsExists = false;
        }
    }

    this.SolutionsExist = solutionsExists;

    //выставляем то решение, которое было
    //восстанавливаем ранее выбранное решение, если оно актуально
    if (!solutionButtons && solutionIsActual)
        this.SolutionControl.SetValue({ Text: oldSelectedSolutionDispName, Value: oldSelectedSolutionName });

    //выпадающий список с решениями
    if (!solutionButtons) {
        //устанавливаем значения SolutionName и SolutionDisplayName
        this.GetSelectedSolution();

        if (solutionsExists) {
            this.OnSolutionChangeMain();
        }
        else {
            //не зависимо от дизайна пишем "(нет доступных решений)"
            this.AddNoSolutionsOption();
            this.Disable();
        }
    }
    //кнопки-решения
    else {
        if (!solutionsExists) {
            WKF_SetNoSolutionsText(this);
        }
    }
}

function WKF_SetNoSolutionsText(slField) {
    var noSolutionsDivID = document.getElementById('noSolutionsDivID');
    noSolutionsDivID.style.display = '';
    $(noSolutionsDivID).text(SLFConsts.SolutionsConsts.NoSolutionsText);
    slField.CommentTR.children[0].style.display = 'none';
    slField.CommentTD.style.display = 'none';
}

function SLField_GetComment() {
    var comment = this.CommentTA.TextArea.value;
    if (comment == this.DefaultCommentText) comment = "";
    return comment;
}

function SLField_GetRemark() {
    return this.RemarkTA.TextArea.value;
}

//простановка решения по умолчанию
function SLField_SetDefaultSolution() {

    var oldSolutionName = this.SelectedSolutionName;
    var compareSolution = this.ItemInfo.DefaultSolution;
    if (this.ItemInfo.SetSolution != '' && this.ItemInfo.SetSolution != null) compareSolution = this.ItemInfo.SetSolution;
    if (this.ItemInfo.InitSolution != '' && this.ItemInfo.InitSolution != null)
        compareSolution = this.ItemInfo.InitSolution;

    var tmpSolution = this.GetDMSStateItem(compareSolution, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
    var compareSolutionDispName = this.GetDMSFieldValue(tmpSolution, SLFConsts.SolutionsConsts.DisplayName);

    if (compareSolution != null)
        this.SolutionControl.SetValue({ Text: compareSolutionDispName, Value: compareSolution });

    this.SelectedSolution = tmpSolution;
    this.SelectedSolutionName = compareSolutionDispName;
}

//получение объекта этапа
function SLField_GetCurrentStage(name) {
    var phase = this.GetDMSStateItem(name, SLFConsts.StagesConsts.Name, xiStagesListID);
    return phase;
}

//перевод на следующий этап
function SLField_SetNextStage() {
    //выбранное решение
    if (this.SelectedSolution != null) {
        //текущий этап
        var currentStage = this.ItemInfo.CurrentStage;
        var currentStageItem = this.GetCurrentStage(currentStage);

        //устанавливаем следующий этап - текущим этапом для случая если не определим "Переводит на этап" удовлетворяющий "Условию"
        var nextStageName = this.ItemInfo.CurrentStage;
        var nextStage = null;
        if (nextStageName != null && nextStageName != '')
            nextStage = this.GetCurrentStage(nextStageName);

        //переводит на этап
        var stNextStage = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.SendToStage);
        var setNotifiersFromStage = true;
        var selectedSolutionTitle = this.SelectedSolutionName;

        var isNextStageSolution = selectedSolutionTitle == 'Перейти на следующий этап';
        //переводит на следующий этап (из списка этапов)
        //устанавливаем флаг isNextStageSolution = 'true'
        var nextStageCount = 1;
        var isSendToNextStage = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.SendToNextStage);
        if (isSendToNextStage.toLowerCase() == 'true')
            isNextStageSolution = true;

        var nStage = this.GetDMSFieldValue(this.SelectedSolution, SLFConsts.SolutionsConsts.SendToNStage);
        if (nStage != null && nStage != '' && nStage != '0') { nextStageCount = new Number(nStage); isNextStageSolution = true; }

        var stNextStageName = null;

        if (isNextStageSolution)
            stNextStageName = this.ItemInfo.CurrentStage;

        if (stNextStage != null && stNextStage != '') {
            var splNextStage = stNextStage.split(';#');
            stNextStageName = splNextStage[1];
        }

        var xiStagesList = window.xiStagesListID;
        var phases = xiStagesList.Items;
        if (phases != null) {
            var checkNextStage = false;
            var setNextStageOption = false;
            var i, len = phases.length;
            var j = 0;
            for (i = 0; i < len; i++) {
                var phase = phases[i];
                var phaseName = this.GetDMSFieldValue(phase, SLFConsts.StagesConsts.Name);
                if (setNextStageOption)
                    checkNextStage = true;
                if (phaseName == stNextStageName) {
                    checkNextStage = true;
                    if (isNextStageSolution) {
                        checkNextStage = false;
                        setNextStageOption = true;
                    }
                }
                if (checkNextStage) {
                    j++;
                    setNextStageOption = false;
                    var stCond = this.GetDMSFieldValue(phase, SLFConsts.StagesConsts.Condition);
                    var meetCond = true;
                    if (stCond != null && stCond != '') {
                        meetCond = this.MeetCondition(stCond);
                    }
                    if (meetCond && j >= nextStageCount) {
                        checkNextStage = false;
                        nextStage = phase;
                        nextStageName = phaseName;
                    }
                }
            }
        }

        if (nextStageName != null && nextStageName != '')
            this.ResultInfo.NextStage = nextStageName;

    }
}


//получение объекта выбранного решения
function SPList_GetSelectedSolution() {
    if (this.SolutionControl == null) return null;

    var solutionItem = null;
    var selectedSolutionTitle = '';

    var tmpSolVal = this.SolutionControl.Value;
    if (tmpSolVal != null)
        selectedSolutionTitle = tmpSolVal.Value;

    if (selectedSolutionTitle != '') {
        solutionItem = this.GetDMSStateItem(selectedSolutionTitle, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
    }
    this.SelectedSolution = solutionItem;
    this.SelectedSolutionName = selectedSolutionTitle;

    return solutionItem;
}

//получение объекта этапа (внутрення функция)
function SLField_GetDMSStateItem(value, field, xiListID) {
    var stateItem = null;
    if (xiListID == null) return null;
    if (xiListID.Items == null) return null;
    for (var i = 0; i < xiListID.Items.length; i++) {
        var tmpXmlItem = xiListID.Items[i];
        if (tmpXmlItem.Fields == null) continue;
        for (var j = 0; j < tmpXmlItem.Fields.length; j++) {
            var tmpXmlField = tmpXmlItem.Fields[j];
            if (tmpXmlField.Title == field && tmpXmlField.Value == value)
                return tmpXmlItem;
        }
    }
    return null;
}

//получение значения поля у этапа или решения
function SLField_GetDMSFieldValue(stateItem, fieldTitle) {
    var field = this.GetDMSField(stateItem, fieldTitle);
    var value = null;
    if (field != null) {
        value = field.Value;
    }
    if (value == null) value = '';
    return value;
}

function SLField_GetDMSField(stateItem, fieldTitle) {
    if (stateItem == null) return null;
    if (stateItem.Fields == null) return null;
    for (var i = 0; i < stateItem.Fields.length; i++) {
        var xmlField = stateItem.Fields[i];
        if (xmlField.Title == fieldTitle) return xmlField;
    }
}

function WKF_GetXmlFromDataString(dataString) {
    var xml = dataString.replace(/(&lt;)/g, '<').replace(/(&gt;)/g, '>').replace(/(&quot;)/g, '"').replace(/(&amp;)/g, '&');
    return xml;
}

function WKF_GetFromDataStringToXml(dataString) {
    var xml = dataString.replace('<', /(&lt;)/g).replace('>', /(&gt;)/g).replace('"', /(&quot;)/g).replace('&', /(&amp;)/g);
    return xml;
}
//-------------------------------------------------------------------------------------------
//переключение между режимами 'Замечания' и 'Комментарий'
function SLField_SetRemarkMode(remarkMode) {
    var solutionButtons = this.ItemInfo.SolutionsParams.SolutionButtonsEnable;

    if (this.InitMode || solutionButtons) return;

    var commentTD_title = this.CommentTR.children[0];
    var commentTD_tb = this.CommentTD;

    var remarkTD_title = this.RemarkTR.children[0];
    var remarkTD_tb = this.RemarkTD;

    if (remarkMode) {
        commentTD_title.style.display = 'none';
        commentTD_tb.style.display = 'none';

        remarkTD_title.style.display = '';
        remarkTD_tb.style.display = '';
    }
    else {
        commentTD_title.style.display = '';
        commentTD_tb.style.display = '';

        remarkTD_title.style.display = 'none';
        remarkTD_tb.style.display = 'none';
    }
}


function WKF_ShowDMSAlert() {
    var solutionFld = window.SLFieldInstance;
    if (solutionFld.DMSAlert != '' && solutionFld.DMSAlert != null)
        alert(solutionFld.DMSAlert);

    if (!solutionFld.DoNotCloseCard) window.close();
    else {
        //после алерта снова открывает карточку, чтобы параметр dmsAlert пропал
        var newUrl = window.location.href.replace('&dmsAlert=' + solutionFld.InitDMSAlert, '');
        $(window).bind('beforeunload', function (evt) {

            try {
                if (window.opener != null && window.opener.Card != null)
                    window.opener.Card.Refresh();
            }
            catch (e) {
                //если не удалось обновить картотеку, то не выдаем ошибку
            }
        });

        window.location.href = newUrl;
    }
}

//-------------------------------------------------------------------------------------------
//скрытие/открытие решения из списка доступных решений
function SLField_HideSolution(solutionName) {
    var solutionItem = this.GetDMSStateItem(solutionName, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
    if (solutionItem == null) return;
    solutionItem.IsHidden = true;
    this.SetSolutions();
}

function SLField_ShowSolution(solutionName) {
    var solutionItem = this.GetDMSStateItem(solutionName, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
    if (solutionItem == null) return;
    solutionItem.IsHidden = false;
    this.SetSolutions();
}

//--------------------------------------------------------------------------------------------
function SLField_CreateSolutionButton(solutionName, solutionDisplayName, isSolutionInHiddenDiv, width) {
    var solutionButtonDiv = WKF_Inner_CreateSolutionButton(solutionName, solutionDisplayName, isSolutionInHiddenDiv, SLFieldInstance.ItemInfo.SolutionsParams.SolutionButtonWidth);
    /*document.createElement('div');
    var solutionButton = document.createElement('input');
    solutionButton.className = 'wkf_solutionButton';
    solutionButton.onclick = WKF_SolutionButtonClick;
    solutionButton.value = solutionName;
    solutionButton.type = 'button';
    $(solutionButton).text(solutionDisplayName);
    solutionButton.title = solutionDisplayName;
    solutionButtonDiv.style.paddingBottom = "2px";
    solutionButtonDiv.appendChild(solutionButton);*/

    if (isSolutionInHiddenDiv) {
        this.HiddenSolutionsDivContainer.appendChild(solutionButtonDiv);
        this.HiddenSolutionsDivContainerTitle.style.display = '';
    }
    else {
        this.SolutionButtonsDiv.appendChild(solutionButtonDiv);
        /*var br = document.createElement("br");
        this.SolutionButtonsDiv.appendChild(br);*/
    }
}

function SLField_RestoreLastSolution() {
    if (this.LastSolution != null)
        this.SelectedSolution = this.LastSolution;
    if (this.LastSolutionName != null)
        this.SelectedSolutionName = this.LastSolutionName;

    this.WaitSelectWindow = false;
}

function WKF_Inner_CreateSolutionButton(solutionName, solutionDisplayName, isSolutionInHiddenDiv, width) {
    var solutionFld = window.SLFieldInstance;

    //добавление серой кнопки с решением
    var solutionButtonContainerDiv = document.createElement('div');
    solutionButtonContainerDiv.title = solutionDisplayName;
    solutionButtonContainerDiv.onselectstart = new function () { return false };
    var solutionButtonDiv = document.createElement('div');
    solutionButtonDiv.Solution = solutionName;
    solutionButtonDiv.style.width = width + 'px';
    solutionButtonDiv.onselectstart = new function () { return false };
    solutionButtonDiv.className = "wkf_solutionButton wkf_solutionButton_left_Button wkf_solutionButton_left_grey";
    solutionButtonDiv.onmouseover = WKF_SolutionButton_SetBlueStyle;
    solutionButtonDiv.onmouseout = WKF_SolutionButton_SetGreyStyle;
    solutionButtonDiv.onclick = WKF_SolutionButtonClick;
    solutionButtonDiv.Mode = "left_border";
    solutionButtonDiv.title = solutionDisplayName;
    var innerSolutionDiv = document.createElement('div');
    innerSolutionDiv.onselectstart = new function () { return false };
    innerSolutionDiv.Solution = solutionName;
    innerSolutionDiv.className = "wkf_solutionButton wkf_solutionButton_right_Button wkf_solutionButton_right_grey";
    innerSolutionDiv.Mode = "right_border";
    innerSolutionDiv.title = solutionDisplayName;
    solutionButtonDiv.appendChild(innerSolutionDiv);
    var textSolutionDiv = document.createElement('div');
    textSolutionDiv.onselectstart = new function () { return false };
    textSolutionDiv.Solution = solutionName;
    $(textSolutionDiv).text(solutionDisplayName);
    textSolutionDiv.className = "wkf_solutionButton_text_grey  wkf_solutionButton_mid_grey wkf_solutionButton_text";
    textSolutionDiv.Mode = "middle_border";
    textSolutionDiv.title = solutionDisplayName;
    innerSolutionDiv.appendChild(textSolutionDiv);
    solutionButtonContainerDiv.appendChild(solutionButtonDiv);
    solutionButtonContainerDiv.style.paddingBottom = "2px";
    solutionButtonContainerDiv.style.float = 'left';

    //объект кнопки-решения
    var solutionButtonObj = new Object();
    solutionButtonObj.SolutionName = solutionName;
    solutionButtonObj.SolutionDisplayName = solutionDisplayName;
    solutionButtonObj.ControlContainer = solutionButtonContainerDiv;
    solutionButtonObj.LeftButtonPart = solutionButtonDiv;
    solutionButtonObj.RightButtonPart = innerSolutionDiv;
    solutionButtonObj.CentralButtonPart = textSolutionDiv;
    solutionFld.SolutionButtons.push(solutionButtonObj);

    return solutionButtonContainerDiv;
}

function WKF_GetButtonParts(e) {
    var ev = e || event;
    //определение элементов разметки
    var buttonDiv = null;
    var innerSolutionDiv = null;
    var textSolutionDiv = null;

    var srcElem = ev.srcElement || ev.target;
    return WKF_GetButtonParts_SrcElem(srcElem);
}

function WKF_GetButtonParts_SrcElem(srcElem) {
    //определение элементов разметки
    var buttonDiv = null;
    var innerSolutionDiv = null;
    var textSolutionDiv = null;

    switch (srcElem.Mode) {
        case "left_border":
            buttonDiv = srcElem;
            innerSolutionDiv = buttonDiv.children[0];
            textSolutionDiv = innerSolutionDiv.children[0];
            break;
        case "right_border":
            innerSolutionDiv = srcElem;
            buttonDiv = srcElem.parentElement;
            textSolutionDiv = srcElem.children[0];
            break;
        case "middle_border":
            textSolutionDiv = srcElem;
            innerSolutionDiv = srcElem.parentElement;
            buttonDiv = innerSolutionDiv.parentElement;
            break;
    }

    var buttonPartsArrays = new Array();
    buttonPartsArrays.push(buttonDiv);
    buttonPartsArrays.push(innerSolutionDiv);
    buttonPartsArrays.push(textSolutionDiv);
    return buttonPartsArrays;
}

function WKF_SolutionButton_SetBlueStyle(e) {
    var buttonPartsArrays = WKF_GetButtonParts(e);

    //определение элементов разметки
    var buttonDiv = buttonPartsArrays[0];
    var innerSolutionDiv = buttonPartsArrays[1];
    var textSolutionDiv = buttonPartsArrays[2];

    buttonDiv.className = "wkf_solutionButton wkf_solutionButton_left_Button wkf_solutionButton_left_blue";
    innerSolutionDiv.className = "wkf_solutionButton wkf_solutionButton_right_Button wkf_solutionButton_right_blue";
    textSolutionDiv.className = "wkf_solutionButton_text_white  wkf_solutionButton_mid_blue wkf_solutionButton_text";
}

function WKF_SolutionButton_SetBlueStyle_SrcElem(srcElem) {
    var buttonPartsArrays = WKF_GetButtonParts_SrcElem(srcElem);

    //определение элементов разметки
    var buttonDiv = buttonPartsArrays[0];
    var innerSolutionDiv = buttonPartsArrays[1];
    var textSolutionDiv = buttonPartsArrays[2];

    buttonDiv.className = "wkf_solutionButton wkf_solutionButton_left_Button wkf_solutionButton_left_blue";
    innerSolutionDiv.className = "wkf_solutionButton wkf_solutionButton_right_Button wkf_solutionButton_right_blue";
    textSolutionDiv.className = "wkf_solutionButton_text_white  wkf_solutionButton_mid_blue wkf_solutionButton_text";
}

function WKF_SolutionButton_SetGreyStyle(e) {
    var buttonPartsArrays = WKF_GetButtonParts(e);

    //определение элементов разметки
    var buttonDiv = buttonPartsArrays[0];
    var innerSolutionDiv = buttonPartsArrays[1];
    var textSolutionDiv = buttonPartsArrays[2];

    buttonDiv.className = "wkf_solutionButton wkf_solutionButton_left_Button wkf_solutionButton_left_grey";
    innerSolutionDiv.className = "wkf_solutionButton wkf_solutionButton_right_Button wkf_solutionButton_right_grey";
    textSolutionDiv.className = "wkf_solutionButton_text_grey  wkf_solutionButton_mid_grey wkf_solutionButton_text";
}

function WKF_SolutionButtonClick(e) {
    var ev = e || event;
    var button = ev.srcElement || ev.target;
    var selectedSolutionName = button.Solution;//button.value;
    SLFieldInstance.SelectedSolution = selectedSolutionName;
    SLFieldInstance.SelectedSolutionName = button.Solution;//button.value;
    SLFieldInstance.SelectedSolution = SLFieldInstance.GetDMSStateItem(selectedSolutionName, SLFConsts.SolutionsConsts.Name, xiSolutionsListID);
    SLFieldInstance.SelectedButton = button;
    WKF_OkButtonClick();
}

function WKF_OkButtonClick() {
    //нажата кнопка с решением
    SLFieldInstance.SolutionButtonClicked = true;
    //нажата кнопка с книжечкой
    SLFieldInstance.LookupWindowSelectClicked = false;

    //если предыдущее решение не совпадает с текущим, то сбрасываем флаг выбора значений из окна
    if (SLFieldInstance.LastSolutionName != SLFieldInstance.SelectedSolutionName) {
        window.SolutionWindow = null;
        SLFieldInstance.SolutionTooltip = '';
        SLFieldInstance.SetParamsFromFloatWindow = false;
        SLFieldInstance.SaveFormAfterCloseFloatWindow = true;
    }
    SLFieldInstance.SetRequiredFields();
    if (!WKF_OpenFloatWindow())
        ListForm.UpdateButton.click();
}

function WKF_DisableButton(saveCompletedEventArgs) {
    if (this.SolutionButtonClicked) {
        if (saveCompletedEventArgs.CanSave) {
            //текущую кнопку делаем синей
            WKF_DisableSolutionButtons();
            var button = SLFieldInstance.SelectedButton;
            if (button.parentElement != null)
                WKF_SolutionButton_SetBlueStyle_SrcElem(SLFieldInstance.SelectedButton);
        }
        //вызываем событие окончания обработки
        else {
            SLFieldInstance.LastSolution = SLFieldInstance.SelectedSolution;
            SLFieldInstance.LastSolutionName = SLFieldInstance.SelectedSolutionName;
            SLFieldInstance.SelectedSolution = null;
            SLFieldInstance.SelectedSolutionName = '';
        }
    }
}

function WKF_DisableSolutionButtons() {
    var solutionFld = window.SLFieldInstance;
    if (solutionFld.SolutionButtons == null || solutionFld.SolutionButtons.length == 0) return;

    for (var i = 0; i < solutionFld.SolutionButtons.length; i++) {
        var solutionButtonObj = solutionFld.SolutionButtons[i];

        solutionButtonObj.CentralButtonPart.className = "wkf_solutionButton_text_disable  wkf_solutionButton_mid_grey wkf_solutionButton_text";
        solutionButtonObj.LeftButtonPart.onmouseover = null;
        solutionButtonObj.LeftButtonPart.onmouseout = null;
        solutionButtonObj.LeftButtonPart.onclick = null;
    }
}

function WKF_EnableSolutionButtons() {
    var solutionFld = window.SLFieldInstance;
    if (solutionFld.SolutionButtons == null || solutionFld.SolutionButtons.length == 0) return;

    for (var i = 0; i < solutionFld.SolutionButtons.length; i++) {
        var solutionButtonObj = solutionFld.SolutionButtons[i];

        solutionButtonObj.CentralButtonPart.className = "wkf_solutionButton_text_grey  wkf_solutionButton_mid_grey wkf_solutionButton_text";
        solutionButtonObj.LeftButtonPart.onmouseover = WKF_SolutionButton_SetBlueStyle;
        solutionButtonObj.LeftButtonPart.onmouseout = WKF_SolutionButton_SetGreyStyle;
        solutionButtonObj.LeftButtonPart.onclick = WKF_SolutionButtonClick;
    }
}

function WKF_ShowHiddenSolutionButtonDiv() {
    SLFieldInstance.HiddenSolutionsDivContainer.style.display = '';
    SLFieldInstance.HiddenSolutionsDivContainerTitle.style.display = 'none';
    return false;
}

/*function WKF_HideSolutionButtonDiv()
{
    SLFieldInstance.HiddenSolutionsDivContainer.style.display = 'none';
    SLFieldInstance.HiddenSolutionsDivContainerTitle.style.display = '';
}*/