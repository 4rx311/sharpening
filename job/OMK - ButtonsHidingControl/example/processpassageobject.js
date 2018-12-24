/****** Перенесено на сервер для мультиязычности
//сообщения при редактировании блока

//при наведении на крестик, если стоит настройка 'Запретить удаление'
var WSSC_PBS_Tooltip_DelDeny = "Удалить данную записи невозможно, так как согласующий является обязательным.\nНа записи стоит запрет удаления.";

//при наведении на крестик, стрелки перемещения, если стоит настройка 'Запретить перемещение'
var WSSC_PBS_Tooltip_EditDeny = "Переместить данную запись невозможно, так как на записи стоит запрет перемещения.";

//при наведении на стрелку перемещения вверх, если для согласующего выше стоит запрет на редактирования
var WSSC_PBS_Tooltip_EditDenyForUpperRecord = "Переместить вверх данную запись невозможно, так как на записи выше стоит запрет перемещения.";

//при наведении на стрелку перемещения вниз, если для согласующего ниже стоит запрет на редактирования
var WSSC_PBS_Tooltip_EditDenyForDownRecord = "Переместить вниз данную запись невозможно, так как на записи ниже стоит запрет перемещения.";

//при наведении на стрелку вверх на первой записи в подэтапе
var WSSC_PBS_Tooltip_MoveUpDeny = "Переместить вверх данную запись невозможно, так как она является первой активной записью в блоке";

//при наведении на стрелку вниз на последней записи в подэтапе
var WSSC_PBS_Tooltip_MoveDownDeny = "Переместить вниз данную запись невозможно, так как  она является последней записью в блоке";

//при наведении на стрелки перемещения на параллельном подэтапе
var WSSC_PBS_Tooltip_MoveParallel = "Переместить данную запись невозможно, так как данный блок согласования является параллельным";

//при наведении на стрелку (если выше стоит запись не добавлять выше) 
var WSSC_PBS_Tooltip_MoveUpDoNotAddUp = "Переместить данную запись выше невозможно, так как для предыдущей записи стоит запрет на добавление согласующих выше";

//при наведении на стрелку (если ниже стоит запись не добавлять выше) 
var WSSC_PBS_Tooltip_MoveDownDoNotAddUp = "Переместить данную запись ниже невозможно, так как для следующей записи стоит запрет на добавление согласующих ниже";

//при наведении на стрелку (если на записи стоит не добавлять выше) 
var WSSC_PBS_Tooltip_Rec_MoveUpDoNotAddUp = "Переместить данную запись ниже невозможно, так как для данной записи стоит запрет на добавление согласующих выше";

//при наведении на стрелку (если на записи стоит  не добавлять ниже) 
var WSSC_PBS_Tooltip_Rec_MoveDownDoNotAddUp = "Переместить данную запись выше невозможно, так как для данной записи стоит запрет на добавление согласующих ниже";


//дефолтовое значение 'Удалить'
var WSSC_PBS_Tooltip_Delete = "Удалить";

//дефолтовое значение 'Переместить вверх'
var WSSC_PBS_Tooltip_MoveUp = "Переместить вверх";

//дефолтовое значение 'Переместить вниз'
var WSSC_PBS_Tooltip_MoveDown = "Переместить вниз";


var WSSC_PBS_AddBlockProcessObjectLink_Parallel = "Добавить параллельный блок";
var WSSC_PBS_AddBlockProcessObjectLink_Common = "Добавить последовательный блок";
var WSSC_PBS_DisableDeleteBlock = "Удалить блок нельзя, так как он уже пройден";
var WSSC_PBS_DisableDeleteBlock_Matrix = "Удалить блок нельзя, так как он заполнен по матрице согласования";
var WSSC_PBS_DisableDeleteBlock_AgrSetting_Matrix = "Удалить блок нельзя, так как стоит запрет на удаления блока";
var WSSC_PBS_DisableDeleteBlock_AgrBlockPassed = "Удалить блок нельзя, так как часть согласующих в блоке уже согласовали документ";
var WSSC_PBS_DeleteBlock = "Удалить блок";
*/



var WSSC_PBS_DispSettings; //глобальная переменная с настройками отображения
var WSSC_PBS_PassingFormData; //глобальная переменная с данными объекта процесса прохождения
var WSSC_PBS_AddCommonBlockProcessObjectLink;
var WSSC_PBS_AddParallelBlockProcessObjectLink;

function WSSC_PBS_Init(xiPassingDispSettingsID, divFormContainerID, isIterationInit, isReload) 
{
    
    if(window.SLField == null)
    {
    
        alert(window.TN.Translate('Поле "Решение" скрыто на сервере. Необходимо, чтобы данное поле было скрыто на клиенте.'));
        return;
    }
    
    WSSC_PBS_DispSettings = new PassingFormDispSettings(xiPassingDispSettingsID);
    WSSC_PBS_PassingFormData = new PassingForm(divFormContainerID, isIterationInit);
    WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = false;

    //скрываем/открываем ссылку "Загрузить согласующих по умолчанию"
    if (WSSC_PBS_CanUserAutoLoadAgrPersons && WSSC_PBS_AgrPersonMode == "Editable") 
    {
        WSSC_PBS_DisplayAutoLoadAgrPersonLink(true);
    }
    if(window.ListForm.ControlMode == "Edit")
    {
        if (WSSC_PBS_AgrPersonMode == "Interactive" && window.ListForm != null)
            window.ListForm.AddInitHandler(WSSC_PBS_AddHandlers);

        if (WSSC_PBS_ShowLinksForClearAndRestore) 
        {
            
            var btClearAgrResults = document.getElementById("btClearAgrResults");
            btClearAgrResults.style.display = "";
            if(!WSSC_PBS_HideAddDeleteBlockLinks)
            {
				var tdClearAgrResults = document.getElementById("tdClearAgrResults");
				tdClearAgrResults.style.display = "";
            }

            var btRestoreAgrResults = document.getElementById("btRestoreAgrResults");
            btRestoreAgrResults.style.display = "";

			var tdRestoreAgrResults = document.getElementById("tdRestoreAgrResults");
			tdRestoreAgrResults.style.display = "";
        }
        WSSC_PBS_AddBlockLink_FUNC();
    }
    //Dispose объектов для блока согласования
    $(window).onunload = WKF_PBS_Dispose;
    var isInitParam = true;
    if (isReload != null)
        if (isReload) isInitParam = false;
    

    //для мозиллы, хрома делаем микрозадержку выравнивания картинок (только при загрузке)
    if (!SM.IsIE && isInitParam)
         window.setTimeout(function () { WSSC_PBS_SetWidthTypeColumn(WSSC_PBS_PassingFormData.MainTable, true); }, 200);
    else
         //для IE сразу выставляем правильную ширину
         WSSC_PBS_SetWidthTypeColumn(WSSC_PBS_PassingFormData.MainTable, isInitParam);

    //var difference = date2 - date1;
    //alert(difference);
}

function WSSC_PBS_DisplayAutoLoadAgrPersonLink(showLink)
{
    var displayMode = "none";
    if (showLink) displayMode = "";

    //открываем/скрываем ссылку "Загрузить согласующих по умолчанию"
    var btAutoLoadAgrPersons = document.getElementById("btAutoLoadAgrPersons");
    btAutoLoadAgrPersons.style.display = displayMode; 

    //средняя ячейка до ссылки "Загрузить согласующих по умолчанию" 
    var btAutoLoadAgrPersonsMiddleTd = document.getElementById("tdAutoLoadAgrPersonsMiddleTd");
    btAutoLoadAgrPersonsMiddleTd.style.display = displayMode;

    //ячейка со ссылкой "Загрузить согласующих по умолчанию"
    var tdAutoLoadAgrPersons = document.getElementById("tdAutoLoadAgrPersons");
    tdAutoLoadAgrPersons.style.display = displayMode;
}

function WSSC_PBS_AddBlockLink_FUNC() 
{
    //если у пользователя, есть возможность редактировать блок, то открываем ссылку "Добавить блок"
    if (WKF_IsNewDesign && WSSC_PBS_PassingFormData != null)
    {
        WSSC_PBS_AddCommonBlockProcessObjectLink = document.getElementById('AddCommonBlockInPassageObjID');
        WSSC_PBS_AddParallelBlockProcessObjectLink = document.getElementById('AddParallelBlockInPassageObjID');
        if (WSSC_PBS_CanUserEditPassageBlock && !WSSC_PBS_HideAddDeleteBlockLinks) 
        {
            WSSC_PBS_AddCommonBlockProcessObjectLink.style.display = "";
            WSSC_PBS_AddParallelBlockProcessObjectLink.style.display = "";
            var addBlocksMidleTd = document.getElementById('addBlocksMidleTd');
            addBlocksMidleTd.style.display = "";
            var tmpTD = WSSC_PBS_AddCommonBlockProcessObjectLink.parentElement;
            tmpTD.style.width = "1%";
            tmpTD.style.display = "";
            tmpTD = WSSC_PBS_AddParallelBlockProcessObjectLink.parentElement;
            tmpTD.style.width = "1%";
            tmpTD.style.display = "";
        }
    }
}

function PassingFormDispSettings(xiPassingDispSettingsID) 
{
    //получаем настройки отображения
    var passingDispSettingsXml = window.xiPassingDispSettingsID;
    this.PassingDispSettingsDocument = window.SM.LoadXML(passingDispSettingsXml);
    
    var xmlElement = this.PassingDispSettingsDocument.firstChild;
    var showStageTitle = $(xmlElement.selectSingleNode("ShowStageTitle")).text().toLowerCase() == "true";
    var stageTitle = $(xmlElement.selectSingleNode("StageTitle")).text();
    var stageColWidth = "";
    var stageColWidthNode = xmlElement.selectSingleNode("StageTitleColWidth");
    if (stageColWidthNode != null) {
        stageColWidth = $(stageColWidthNode).text();
    }
    var showRolePositionTitle = $(xmlElement.selectSingleNode("ShowRolePositionTitle")).text().toLowerCase() == "true";
    var rolePositionTitle = $(xmlElement.selectSingleNode("RolePositionTitle")).text();
    var rolePositionColWidth = "";
    var rolePositionColWidthNode = xmlElement.selectSingleNode("RolePositionTitleColWidth");
    if (rolePositionColWidthNode != null) {
        rolePositionColWidth = $(rolePositionColWidthNode).text();
    }
    var showUserTitle = $(xmlElement.selectSingleNode("ShowUserTitle")).text().toLowerCase() == "true";
    var userTitle = $(xmlElement.selectSingleNode("UserTitle")).text();
    var userColWidth = "";
    var userColWidthNode = xmlElement.selectSingleNode("UserTitleColWidth");
    if (userColWidthNode != null) {
        userColWidth = $(userColWidthNode).text();
    }
    var showFactUserTitle = $(xmlElement.selectSingleNode("ShowFactUserTitle")).text().toLowerCase() == "true";
    var factUserTitle = $(xmlElement.selectSingleNode("FactUserTitle")).text();
    var factUserColWidth = "";
    var factUserColWidthNode = xmlElement.selectSingleNode("FactUserTitleColWidth");
    if (factUserColWidthNode != null) {
        factUserColWidth = $(factUserColWidthNode).text();
    }
    var showSolutionResultTitle = $(xmlElement.selectSingleNode("ShowSolutionResultTitle")).text().toLowerCase() == "true";
    var solutionResultTitle = $(xmlElement.selectSingleNode("SolutionResultTitle")).text();
    var solutionResultColWidth = "";
    var solutionResultColWidthNode = xmlElement.selectSingleNode("SolutionResultTitleColWidth");
    if (solutionResultColWidthNode != null) {
        solutionResultColWidth = $(solutionResultColWidthNode).text();
    }
    var showAddUserlink = $(xmlElement.selectSingleNode("ShowAddUserlink")).text().toLowerCase() == "true";
    var addUserlink = $(xmlElement.selectSingleNode("AddUserlink")).text();
    var showAgrStartDateTitle = $(xmlElement.selectSingleNode("ShowAgrStartDateTitle")).text().toLowerCase() == "true";
    var agrStartDateTitle = $(xmlElement.selectSingleNode("AgrStartDateTitle")).text();
    var agrStartDateColWidth = "";
    var agrStartDateColWidthNode = xmlElement.selectSingleNode("AgrStartDateTitleColWidth");
    if (agrStartDateColWidthNode != null) {
        agrStartDateColWidth = $(agrStartDateColWidthNode).text();
    }
    var showAgrEndDateTitle = $(xmlElement.selectSingleNode("ShowAgrEndDateTitle")).text().toLowerCase() == "true";
    var agrEndDateTitle = $(xmlElement.selectSingleNode("AgrEndDateTitle")).text();
    var agrEndDateColWidth = "";
    var agrEndDateColWidthNode = xmlElement.selectSingleNode("AgrEndDateTitleColWidth");
    if (agrEndDateColWidthNode != null) {
        agrEndDateColWidth = $(agrEndDateColWidthNode).text();
    }
    var showCommentTitle = $(xmlElement.selectSingleNode("ShowCommentTitle")).text().toLowerCase() == "true";
    var commentTitle = $(xmlElement.selectSingleNode("CommentTitle")).text();
    var commentColWidth = "";
    var commentColWidthNode = xmlElement.selectSingleNode("AgrStartDateTitleColWidth");
    if (commentColWidthNode != null) {
        commentColWidth = $(commentColWidthNode).text();
    }

    this.ShowStageTitle = showStageTitle;
    this.StageTitle = stageTitle;
    this.StageTitleColWidth = stageColWidth;

    this.ShowRolePositionTitle = showRolePositionTitle;
    this.RolePositionTitle = rolePositionTitle;
    this.RolePositionTitleColWidth = rolePositionColWidth;

    this.ShowUserTitle = showUserTitle;
    this.UserTitle = userTitle;
    this.UserTitleColWidth = userColWidth;

    this.ShowFactUserTitle = showFactUserTitle;
    this.FactUserTitle = factUserTitle;
    this.FactUserTitleColWidth = factUserColWidth;

    this.ShowSolutionResultTitle = showSolutionResultTitle;
    this.SolutionResultTitle = solutionResultTitle;
    this.SolutionResultTitleColWidth = solutionResultColWidth;

    this.ShowAddUserlink = showAddUserlink;
    this.AddUserlink = addUserlink;

    this.ShowAgrStartDateTitle = showAgrStartDateTitle;
    this.AgrStartDateTitle = agrStartDateTitle;
    this.AgrStartDateTitleColWidth = agrStartDateColWidth;

    this.ShowAgrEndDateTitle = showAgrEndDateTitle;
    this.AgrEndDateTitle = agrEndDateTitle;
    this.AgrEndDateTitleColWidth = agrEndDateColWidth;

    this.ShowCommentTitle = showCommentTitle;
    this.CommentTitle = commentTitle;
    this.CommentTitleColWidth = commentColWidth;

    //для тестирования
    this.ShowAgrType = true;
}


function PassingForm(divFormContainerID, isIterationInit) 
{
    var solutionFld = window.SLFieldInstance;
    //получаем документ с настройками и данными
    var passingDataXml = window.xiPassingDataID;
    
    if(isIterationInit) passingDataXml = WSSC_PBS_IterationAgrBlock;
    
    if (passingDataXml == null) return null;
    var xmlDoc = window.SM.LoadXML(passingDataXml);

    this.PassingDataDocument = xmlDoc;

    var divAcceptDataObj = document.getElementById("processDiv");
    if (divAcceptDataObj != null && !isIterationInit) 
    {
        var xmlPassageBlockHdn = divAcceptDataObj.children[1];
        if (xmlPassageBlockHdn.value != "") 
        {
            //загружаем xml, который был + подгружаем настройки
            var settingsNodes = xmlDoc.selectNodes("ProcessPassageObject/Stages/ProcessStage/ProcessBlocks/ProcessBlock/ProcessUsers/ProcessUser/AgrSetting");
            var hdnPassageBlockXml = xmlPassageBlockHdn.value;
            var tmpXmlDoc = window.SM.LoadXML(hdnPassageBlockXml);
            if (settingsNodes != null)
            {
                var newUsersNodes = tmpXmlDoc.selectNodes("ProcessPassageObject/Stages/ProcessStage/ProcessBlocks/ProcessBlock/ProcessUsers/ProcessUser"); ;
                for (var j = 0; j < newUsersNodes.length; j++) {
                    var newUserNode = newUsersNodes[j];
                    var settingNode = newUserNode.selectSingleNode("SettingID");
                    //не указана настройка
                    if (settingNode == null) continue;
                    var settingID = settingNode.nodeTypedValue;
                    var agrSettingNode = null;
                    for (var k = 0; k < settingsNodes.length; k++) {
                        var settingNode = settingsNodes[k];
                        var agrSettingID = settingNode.getAttribute("ID");
                        if (settingID == agrSettingID) {
                            agrSettingNode = settingNode;
                            break;
                        }
                    }
                    //не нашли настройку
                    if (agrSettingNode == null) continue;
                    //добавление настройки в xml
                    hdnPassageBlockXml = hdnPassageBlockXml.replace("<SettingID>" + settingID + "</SettingID>", "<SettingID>" + settingID + "</SettingID>" + window.SM.PersistXML(agrSettingNode));
                }
                var resultXmlDoc = window.SM.LoadXML(hdnPassageBlockXml);
                this.PassingDataDocument = resultXmlDoc;
            }
        }
    }

    //генерация объекта с прохождением по этапам
    var stagesNodes = this.PassingDataDocument.firstChild.selectNodes("Stages/ProcessStage");
    if (stagesNodes == null) return;
    this.Stages = new Array();
    for (var i = 0; i < stagesNodes.length; i++) 
    {
        var stageNode = stagesNodes[i];
        this.Stages[i] = new StageClient(stageNode, this);
        var stageName = this.Stages[i].Name;
        if(stageName == WSSC_PBS_CurrentStage)
            this.IsAgreementStageIsCurrent = true;

    }
    //получаем контейнер для главной таблицы и формируем талицу
    this.DivFormContainer = window.document.getElementById(divFormContainerID);

    if (this.Stages.length == 0) return;

    //смотрим сколько нескрываемых блоков и выставляем переменную
    if (!WKF_IsNewDesign) 
    {
        var blocksCount = 0;
        for (var i = 0; i < this.Stages.length; i++) {
            var tmpStage = this.Stages[i];
            if (tmpStage.Blocks == null) continue;
            blocksCount += tmpStage.Blocks.length;
        }
        if (blocksCount > 1) WSSC_PBS_DrawLinkInUsersBlock = false;
        else WSSC_PBS_DrawLinkInUsersBlock = true;
    }
    
    var mainTable = window.document.createElement('table');
    WSSC_PBS_DrawTblHeaders(mainTable);
    //рисуем таблицу по этапам и блокам
    WSSC_PBS_DrawMainTable(this, mainTable);
    this.DivFormContainer.appendChild(mainTable);
    this.MainTable = mainTable;
    this.NoCheckEmptySolution = false;
}

function WSSC_PBS_DrawTblHeaders(mainTable)
{
    mainTable.cellSpacing = 1;
    if(WSSC_PBS_MainDivWidth > 0)
        mainTable.style.width = WSSC_PBS_MainDivWidth + 'px';

    mainTable.className = "wssc-PPB-Table";
    mainTable.id = "WsscPbsMainTableID";
    if (WSSC_PBS_TBWidth != null && WSSC_PBS_TBWidth > 0)
        mainTable.style.width = WSSC_PBS_TBWidth + 'px';
    this.TableForm = mainTable;
    mainTable.cellPadding = 2;

    var headersWithOuthSize = new Array();
    var k = 0;
    //делаем header таблицы, создавая всегда все ячейки, при этом указывая display=none, там где это нужно
    var headerRow = mainTable.insertRow(mainTable.rows.length);
    var stageHeaderTD = headerRow.insertCell(headerRow.cells.length);

    //ячейка "Этап"
    $(stageHeaderTD).text(WSSC_PBS_DispSettings.StageTitle);
    stageHeaderTD.className = "wssc-PPB-TableHeaderCell";
    if (!WSSC_PBS_DispSettings.ShowStageTitle) stageHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.StageTitleColWidth != null && WSSC_PBS_DispSettings.StageTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.StageTitleColWidth > 0)
            stageHeaderTD.style.width = WSSC_PBS_DispSettings.StageTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = stageHeaderTD;
        k++;
    }
    
    //ячейка для удаления подблока в блоке согласования
    var blockDeleteTitleTD = headerRow.insertCell(headerRow.cells.length);
    blockDeleteTitleTD.innerHTML = "&nbsp;";
    blockDeleteTitleTD.style.width = '13px';
    blockDeleteTitleTD.className = "wssc-PPB-TableHeaderCell";
    var blockInfo = WSSC_PBS_GetDeleteBlockType(blockDeleteTitleTD);
    if(blockInfo.Mode == "Hide")
        blockDeleteTitleTD.style.display = "none";
    
    //ячейка "Вид"
    var typeHeaderTD = headerRow.insertCell(headerRow.cells.length);
    typeHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(typeHeaderTD).text(WSSC_PBS_AgreementType);
    if (!WSSC_PBS_DispSettings.ShowAgrType || WSSC_PBS_DrawLinkInUsersBlock) typeHeaderTD.style.display = "none";

    //ячейка "Роль/должность"
    var roleHeaderTD = headerRow.insertCell(headerRow.cells.length);
    roleHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(roleHeaderTD).text(WSSC_PBS_DispSettings.RolePositionTitle);
    if (!WSSC_PBS_DispSettings.ShowRolePositionTitle) roleHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.RolePositionTitleColWidth != null && WSSC_PBS_DispSettings.RolePositionTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.RolePositionTitleColWidth > 0)
            roleHeaderTD.style.width = WSSC_PBS_DispSettings.RolePositionTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = roleHeaderTD;
        k++;
    }
    //ячейка "Сотрудник"
    var userHeaderTD = headerRow.insertCell(headerRow.cells.length);
    userHeaderTD.className = "wssc-PPB-TableHeaderCell";
    //userHeaderTD.colSpan = 4;
    $(userHeaderTD).text(WSSC_PBS_DispSettings.UserTitle);
    if (!WSSC_PBS_DispSettings.ShowUserTitle) userHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.UserTitleColWidth != null && WSSC_PBS_DispSettings.UserTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.UserTitleColWidth > 0)
            userHeaderTD.style.width = WSSC_PBS_DispSettings.UserTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = userHeaderTD;
        k++;
    }
    //ячейка с крестиком для удаления
    //var delHeaderTD = headerRow.insertCell(headerRow.cells.length);
    //delHeaderTD.className = "wssc-PPB-TableHeaderCell";
    //delHeaderTD.innerHTML = "&nbsp;";
    //delHeaderTD.style.width = '10px';

    //ячейка с кнопкой перемещения вверх
    //var upHeaderTD = headerRow.insertCell(headerRow.cells.length);
    //upHeaderTD.className = "wssc-PPB-TableHeaderCell";
    //upHeaderTD.innerHTML = "&nbsp;";
    //upHeaderTD.style.width = '10px';

    //ячейка с крестиком для удаления
    //var downHeaderTD = headerRow.insertCell(headerRow.cells.length);
    //downHeaderTD.className = "wssc-PPB-TableHeaderCell";
    //downHeaderTD.innerHTML = "&nbsp;";
    //downHeaderTD.style.width = '10px';

    //ячейка "Факт. принявший решение"
    var factUserHeaderTD = headerRow.insertCell(headerRow.cells.length);
    factUserHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(factUserHeaderTD).text(WSSC_PBS_DispSettings.FactUserTitle);
    if (!WSSC_PBS_DispSettings.ShowFactUserTitle) factUserHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.FactUserTitleColWidth != null && WSSC_PBS_DispSettings.FactUserTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.FactUserTitleColWidth > 0)
            factUserHeaderTD.style.width = WSSC_PBS_DispSettings.FactUserTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = userHeaderTD;
        k++;
    }
    //ячейка "Дата и время получения"
    var agrStartDateHeaderTD = headerRow.insertCell(headerRow.cells.length);
    agrStartDateHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(agrStartDateHeaderTD).text(WSSC_PBS_DispSettings.AgrStartDateTitle);
    if (!WSSC_PBS_DispSettings.ShowAgrStartDateTitle) agrStartDateHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.AgrStartDateTitleColWidth != null && WSSC_PBS_DispSettings.AgrStartDateTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.AgrStartDateTitleColWidth > 0)
            agrStartDateHeaderTD.style.width = WSSC_PBS_DispSettings.AgrStartDateTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = userHeaderTD;
        k++;
    }
    //ячейка "Дата и время согласования"
    var agrEndDateHeaderTD = headerRow.insertCell(headerRow.cells.length);
    agrEndDateHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(agrEndDateHeaderTD).text(WSSC_PBS_DispSettings.AgrEndDateTitle);
    if (!WSSC_PBS_DispSettings.ShowAgrEndDateTitle) agrEndDateHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.AgrEndDateTitleColWidth != null && WSSC_PBS_DispSettings.AgrEndDateTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.AgrEndDateTitleColWidth > 0)
            agrEndDateHeaderTD.style.width = WSSC_PBS_DispSettings.AgrEndDateTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = userHeaderTD;
        k++;
    }
    //ячейка "Результат решения"
    var solutionResultHeaderTD = headerRow.insertCell(headerRow.cells.length);
    solutionResultHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(solutionResultHeaderTD).text(WSSC_PBS_DispSettings.SolutionResultTitle);
    if (!WSSC_PBS_DispSettings.ShowSolutionResultTitle) solutionResultHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.SolutionResultTitleColWidth != null && WSSC_PBS_DispSettings.SolutionResultTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.SolutionResultTitleColWidth > 0)
            solutionResultHeaderTD.style.width = WSSC_PBS_DispSettings.SolutionResultTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = userHeaderTD;
        k++;
    }
    //ячейка "Комментарий"
    var commentHeaderTD = headerRow.insertCell(headerRow.cells.length);
    commentHeaderTD.className = "wssc-PPB-TableHeaderCell";
    $(commentHeaderTD).text(WSSC_PBS_DispSettings.CommentTitle);
    if (!WSSC_PBS_DispSettings.ShowCommentTitle) commentHeaderTD.style.display = "none";
    if (WSSC_PBS_DispSettings.CommentTitleColWidth != null && WSSC_PBS_DispSettings.CommentTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.CommentTitleColWidth > 0)
            commentHeaderTD.style.width = WSSC_PBS_DispSettings.CommentTitleColWidth + 'px';
    }
    else 
    {
        headersWithOuthSize[k] = userHeaderTD;
        k++;
    }
    //ячейка с действиями
    var actionsHeaderTD = headerRow.insertCell(headerRow.cells.length);
    actionsHeaderTD.className = "wssc-PPB-TableHeaderCell";
    actionsHeaderTD.style.width = "68px";
    $(actionsHeaderTD).text(WSSC_PBS_Actions);
    if (!WSSC_PBS_CanUserEditPassageBlock) actionsHeaderTD.style.display = "none";

    if (window.SM.IsFF && k > 0) 
    {
        var widthSize = 100 / k;
        for (var l = 0; l < headersWithOuthSize.length; l++) 
        {
            var headerWithOutSize = headersWithOuthSize[l];
            headerWithOutSize.style.width = widthSize.toString() + '%';
        }
    }
}

function WSSC_PBS_AddUserInRouteBlock_Img(e)
{
    WSSC_PBS_AddUserInRouteBlock(e); 
    return false;
}

//выставление ширины у столбцов таблицы согласования
function WSSC_PBS_SetWidthTypeColumn(mainTable, isInitParam)
{
    if (mainTable == null) return;
    if(mainTable.rows.length <= 1) return;
    var typeTitleTD = mainTable.rows[0].cells[2];
    var typeTitleWidth = typeTitleTD.offsetWidth;
    //вычисляем ширину, которую нужно проставить
    typeTitleWidth = typeTitleWidth - 8;//нужно отнимать паддинги по 4 с каждой стороны
    if (typeTitleWidth <= 0) return;

    for(var j=1; j<mainTable.rows.length; j++)
    {
        var tbRow = mainTable.rows[j];
        var tdCell = tbRow.cells[2];
        if(tdCell == null) continue;
        if(tdCell.children != null)
        {
            if(tdCell.children.length == 0) 
            {
                tdCell = tbRow.cells[1];
            }
        }
        if (tdCell.children != null)
        {
            if (tdCell.children.length == 0) continue;
            tdCell.children[0].width = typeTitleWidth + 'px';
        }
    }
    
    
} 

//удаление из блока всех пустых пользователей
function WSSC_PBS_CheckAgrObj(agrBlockObj)
{
    if(agrBlockObj == null) return null;
    for (var i = 0; i < agrBlockObj.Stages.length; i++) 
    {
        var stageObj = agrBlockObj.Stages[i];
        if (stageObj.Blocks != null)
        {
            for (var j = 0; j < stageObj.Blocks.length; j++) 
            {
                var blockObj = stageObj.Blocks[j];
                if (blockObj.Users != null) 
                {
                    var newUsersArray = new Array();
                    for (var l = 0; l < blockObj.Users.length; l++) 
                    {
                        var tmpUserObj = blockObj.Users[l];
                        if(tmpUserObj.IsDeleted) continue;
                        newUsersArray.push(tmpUserObj);
                    }
                    blockObj.Users = newUsersArray;
                }
            }
        }

    }
    return agrBlockObj;
}

function WSSC_PBS_DrawMainTable(agrBlockObjParam, mainTable) 
{
    var agrBlockObj = WSSC_PBS_CheckAgrObj(agrBlockObjParam);
    for (var i = 0; i < agrBlockObj.Stages.length; i++) 
    {
        var stageObj = agrBlockObj.Stages[i];
        var stageTR = null;
        if (stageObj.Blocks != null)
            if (stageObj.Blocks.length > 0) stageTR = mainTable.insertRow(mainTable.rows.length);

        var rowSpanForStage = 0;
        var stageTD;

        for (var j = 0; j < stageObj.Blocks.length; j++) {
            var blockObj = stageObj.Blocks[j];
            var rowSpanForBlock = 0;
            //ячейка "Этап"
            if (j == 0) 
            {
                stageTD = stageTR.insertCell(stageTR.cells.length);
                stageTD.className = "wssc-PPB-TableCell";
                stageTD.style.verticalAlign = 'top';
                //if(stageObj.IsCurrent) stageTD.className = "wssc-PPB-TableCell-current";
                if (stageObj.IsPassed) 
                {
                    stageTD.className = "wssc-PPB-TableCell-passed";
                }
                
                //название этапа согласования в блоке согласования
                var dispNameInPassageBlock = stageObj.DispNameInPassageBlock;
                if(WKF_IsMultilangVersion)
                    dispNameInPassageBlock = stageObj.TranslateDispNameInPassageBlock;
                $(stageTD).text(dispNameInPassageBlock);

                if (!WSSC_PBS_DispSettings.ShowStageTitle) stageTD.style.display = "none";
                if (WSSC_PBS_DispSettings.StageTitleColWidth != null && WSSC_PBS_DispSettings.StageTitleColWidth != "") 
                {
                    if(WSSC_PBS_DispSettings.StageTitleColWidth > 0)
                        stageTD.style.width = WSSC_PBS_DispSettings.StageTitleColWidth + 'px';
                }
            }
            if (j != 0) stageTR = mainTable.insertRow(mainTable.rows.length);
            //учейка для удаления подблока в блоке согласования
            var blockDeleteTD = stageTR.insertCell(stageTR.cells.length);
            blockDeleteTD.innerHTML = "<img border='0' onclick='WSSC_PBS_DeleteBlockFunc(this);return false;' style='cursor: pointer; display:block' />";
            blockDeleteTD.BlockObj = blockObj;
            var blockDeleteImg = blockDeleteTD.children[0];
            blockDeleteTD.ParentCell = stageTD;
            var blockInfo = WSSC_PBS_GetDeleteBlockType(blockObj);
            if(blockInfo.Tooltip != null && blockInfo.Tooltip != "")
                blockDeleteImg.title = blockInfo.Tooltip;
            if(blockInfo.Mode == "Hide")
                blockDeleteTD.style.display = "none";
            if(blockInfo.Mode == "Display")
            {
                blockDeleteImg.src = '/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/del.gif?wkf_img_param=1';
            }
            else
                if(blockInfo.Mode == "Disable")
                {
                    blockDeleteImg.src = '/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/del_disable.gif?wkf_img_param=1';
                    blockDeleteImg.onclick = null;
                }
            
            //ячейка "Вид"
            var typeTD = stageTR.insertCell(stageTR.cells.length);
            typeTD.className = "wssc-PPB-TableCell";
            typeTD.style.verticalAlign = 'top';
            typeTD.style.width = "1%";
            if (WSSC_PBS_DrawLinkInUsersBlock) typeTD.style.display = "none";
            if (blockObj.IsPassed) typeTD.className = "wssc-PPB-TableCell-passed";
            
            //копирование стилей для ячейки с крестиком для удаления блока
            blockDeleteTD.className = typeTD.className;
            
            typeTD.BlockObj = blockObj;
            typeTD.ParentCell = stageTD;
            if (!WSSC_PBS_DispSettings.ShowAgrType) typeTD.style.display = "none";
            else 
            {
                var typeTable = window.document.createElement('table');
                typeTable.cellPadding = 0;
                typeTable.cellSpacing = 0;
                //typeTable.style.width = "100%";
                typeTD.appendChild(typeTable);
                var blockTitleTr = typeTable.insertRow(typeTable.rows.length);
                var textTD = blockTitleTr.insertCell(blockTitleTr.cells.length);
                textTD.className = "wssc-PPB-block-text";
                if (blockObj.IsCurrent) textTD.className = "wssc-PPB-block-text-current";
                if (blockObj.IsPassed) textTD.className = "wssc-PPB-block-text-passed";

                var linkTD = blockTitleTr.insertCell(blockTitleTr.cells.length);
                linkTD.className = "wssc-PPB-add-user-link";
                if (blockObj.IsCurrent) linkTD.className = "wssc-PPB-add-user-link-current";
                if (blockObj.IsPassed) linkTD.className = "wssc-PPB-add-user-link-passed";

                linkTD.BlockObj = blockObj;
                linkTD.ParentCell = typeTD;

                if (blockObj.IsParallel)
                    $(textTD).text(WSSC_PBS_Agreement_ParallelType);
                else
                    $(textTD).text(WSSC_PBS_Agreement_SimpleType);
                //название типа согласования
                var blockName = blockObj.BlockName;
                if(WKF_IsMultilangVersion)
                    blockName = blockObj.TranslateBlockName;
                    
                if (blockName != null &&blockName != "") {
                    $(textTD).text(blockName);
                }
                var isLastDoNotAddLower = false;
                if (blockObj.Users != null) 
                {
                    for (var l = 0; l < blockObj.Users.length; l++) 
                    {
                        var tmpUserObj = blockObj.Users[l];
                        var tmpNotAddSetting = WSSC_PBS_GetDenySetting(tmpUserObj.AgrSetting, tmpUserObj.MatrixPerson, "add");
                        if (tmpNotAddSetting == "UpAndDown") {
                            isLastDoNotAddLower = true; break;
                        }

                    }
                }
                //в блоке стоит настройка "Добавить сотрудника" и не стоит признак "Не добавлять ниже"
                //блок не пройден или пользователь может редактировать блок на данном этапе
                if (WSSC_PBS_DispSettings.ShowAddUserlink && !isLastDoNotAddLower &&
                    (!blockObj.IsPassed || WSSC_PBS_CanUserEditPassageBlock && stageObj.IsPassed)) //&& j == (stageObj.Blocks.length - 1)
                {
                    if (blockObj.IsPassed) linkTD.className = "wssc-PPB-add-user-link-passed";
                    if (WKF_IsNewDesign)
                    {
                        linkTD.className = 'wkf_pbs_img_add_users';
                        linkTD.innerHTML = "<img src='/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/add_user.gif?wkf_img_param=1' style='cursor: pointer' />";
                    }
                    else 
                    {
                        linkTD.innerHTML = "<a href='#' class='wssc-PPB-link'>" + WSSC_PBS_DispSettings.AddUserlink + "</a>";
                    }
                    linkTD.children[0].onclick = WSSC_PBS_AddUserInRouteBlock_Img;
                }
                if (!WSSC_PBS_CanUserEditPassageBlock) linkTD.style.display = "none";
            }

            var lastNum = blockObj.Users.length - 1;
            var deleteRecordsNum = 0;
            for (var l = 0; l < blockObj.Users.length; l++) {
                var userObj = blockObj.Users[l];
                if (userObj.IsDeleted) {
                    continue;
                    deleteRecordsNum++;
                }

                rowSpanForStage++;
                rowSpanForBlock++;

                var userTR = stageTR;
                if (l != 0) {
                    userTR = mainTable.insertRow(mainTable.rows.length);
                    userTR.IsFirst = false;
                }
                else
                    userTR.IsFirst = true;

                userTR.BlockTR = stageTR;

                if (l == lastNum - deleteRecordsNum) userTR.IsLast = true;
                else userTR.IsLast = false;

                userTR.UserObj = userObj;
                var newUserTD = WSSC_TBS_AddUserTR(userObj, userTR);
            }
            //(ошибка с первой пустой строкой) проверка на то есть ли ли пользователь в блоке
            if (blockObj.Users.length == 0 && !WSSC_PBS_DispSettings.ShowStageTitle && WSSC_PBS_DrawLinkInUsersBlock) {
                stageTR.style.display = "none";
            }
            //формируем псевдо ячейку, если удалены все пользователи
            if (blockObj.Users.length == 0) {
                rowSpanForStage++;
                rowSpanForBlock++;
                tmpUserObj = new UserClientLight(blockObj, "", "", "", "0");
                WSSC_TBS_AddUserTR(tmpUserObj, stageTR);
                stageTR.IsFirst = true;
                var lastCell = stageTR.cells.length - 1;
                stageTR.cells[lastCell].innerHTML = "&nbsp;";

            }
            //if (WSSC_PBS_DrawLinkInUsersBlock && !stageObj.IsPassed && WSSC_PBS_CanUserEditPassageBlock) 
            if (WSSC_PBS_DrawLinkInUsersBlock && WSSC_PBS_DispSettings.ShowAddUserlink && !isLastDoNotAddLower &&
            WSSC_PBS_CanUserEditPassageBlock && (!blockObj.IsPassed || stageObj.IsPassed)) {
                WSSC_PBS_AddUserLinkTR(mainTable, blockObj, typeTD);
                rowSpanForBlock = rowSpanForBlock + 1;
                rowSpanForStage = rowSpanForStage + 1;
            }
            
            if (rowSpanForBlock > 0) 
            {
                typeTD.rowSpan = rowSpanForBlock;
                blockDeleteTD.rowSpan = rowSpanForBlock;
            }

            if (rowSpanForStage > 0) stageTD.rowSpan = rowSpanForStage;

            //обновляем tooltip в блоке
            WSSC_TBS_UpdateTooltipsForBlock(blockObj);

        }
    }
}

function WSSC_PBS_ClearAgrResultsForUser(paramObj) 
{
    var userTR;
    var aTag;
    if (paramObj.tagName.toLowerCase() != "a") userTR = paramObj;
    else aTag = paramObj;

    if (userTR == null) userTR = aTag.parentElement.parentElement;
    var blockObj = userTR.BlockTR.cells[1].BlockObj;
    if (blockObj == null) blockObj = userTR.BlockTR.cells[0].BlockObj;
    
    
    var rowIndex = userTR.rowIndex;
    var mainTable = window.document.getElementById('WsscPbsMainTableID');
    var userObj = mainTable.rows[rowIndex].UserObj;

    var startInd = 0;
    if (userTR.cells.length == 10) startInd = 2;
    if (userTR.cells.length == 11) startInd = 3;
    //ячейка с ролью/должностью
    var roleTD = userTR.cells[startInd];
    roleTD.className = "wssc-PPB-TableCell";
    //ячейка "Сотрудник"
    var userTD = userTR.cells[startInd + 1];
    userTD.className = "wssc-PPB-TableCell";
    //ячейка "Дата получения"
    var agrStartDateTD = userTR.cells[startInd + 2];
    agrStartDateTD.innerHTML = "&nbsp;";
    agrStartDateTD.className = "wssc-PPB-TableCell";
    //ячейка "Дата согласования"
    var agrEndDateTD = userTR.cells[startInd + 3];
    agrEndDateTD.innerHTML = "&nbsp;";
    agrEndDateTD.className = "wssc-PPB-TableCell";
    //ячейка "Факт. согласующий"
    var factUserTD = userTR.cells[startInd + 4];
    factUserTD.innerHTML = "&nbsp;";
    factUserTD.className = "wssc-PPB-TableCell";
    //ячейка "Результат согласования"
    var solutionResultTD = userTR.cells[startInd + 5];
    solutionResultTD.innerHTML = "&nbsp;";
    solutionResultTD.className = "wssc-PPB-TableCell";
    //ячейка "Комментарий"
    var agrCommentTD = userTR.cells[startInd + 6];
    agrCommentTD.innerHTML = "&nbsp;";
    agrCommentTD.className = "wssc-PPB-TableCell";
    //ячейка "Действия"
    var actionsTD = userTR.cells[startInd + 7];
    actionsTD.className = "wssc-PPB-TableCell";
    var cannotBeEdited = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "move");
    var cannotBeDeleted = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "delete"); ;

    userObj.IsPassed = false;
    userObj.FactUserLogin = "";
    userObj.FactUserFIO = "";
    userObj.TranslateFactUserFIO = "";
    userObj.FactUserPosition = "";
    userObj.TranslateFactUserPosition = "";
    userObj.Solution = "";
    userObj.SolutionResult = "";
    userObj.TranslateSolutionResult = "";
    userObj.Comment = "";
    userObj.StartDate = "";
    userObj.EndDate = "";

    WSSC_PBS_FillActionTD(actionsTD, userObj, cannotBeEdited, cannotBeDeleted);
    //обновляем tooltip в блоке
    WSSC_TBS_UpdateTooltipsForBlock(userObj.Block);
}


function WSSC_PBS_ClearAgrResults() 
{
    var agrBlockObj = WSSC_PBS_PassingFormData;
    var mainTable = document.getElementById("WsscPbsMainTableID");
    //оставляем в таблице только 1 столбец
    while (mainTable.rows.length > 1)
        mainTable.firstChild.removeChild(mainTable.rows[1]);
    for (var i = 0; i < agrBlockObj.Stages.length; i++) {
        var stageObj = agrBlockObj.Stages[i];
        if (stageObj.Blocks == null) continue;
        stageObj.IsPassed = false;

        for (var j = 0; j < stageObj.Blocks.length; j++) {
            var blockObj = stageObj.Blocks[j];
            blockObj.IsPassed = false;
            if (blockObj.Users == null) continue;

            var lastNum = blockObj.Users.length - 1;
            var newUsersArray = new Array();
            for (var l = 0; l < blockObj.Users.length; l++) {
                var userObj = blockObj.Users[l];
                if (userObj.IsDeleted) continue;
                userObj.IsPassed = false;
                userObj.FactUserLogin = "";
                userObj.FactUserFIO = "";
                userObj.TranslateFactUserFIO = "";
                userObj.FactUserPosition = "";
                userObj.TranslateFactUserPosition = "";
                userObj.Solution = "";
                userObj.SolutionResult = "";
                userObj.TranslateSolutionResult = "";
                userObj.Comment = "";
                userObj.StartDate = "";
                userObj.EndDate = "";
                newUsersArray.push(userObj);
            }
            blockObj.Users = newUsersArray;
        }
    }
    WSSC_PBS_DrawMainTable(agrBlockObj, mainTable);
    WSSC_PBS_SetWidthTypeColumn(mainTable, false);
    //обработчики на изменения поля
    WSSC_PSB_SetIsChangedAgrBlock();
}

function WSSC_PBS_RestoreAgrResults() 
{
    var agrBlockObj = WSSC_PBS_PassingFormData;
    var mainTable = document.getElementById("WsscPbsMainTableID");
    //пересоздаем таблицу согласования
    mainTable.parentElement.removeChild(mainTable);
    WSSC_PBS_Init('xiPassingDispSettingsID', 'processDiv', true, true);
    //обработчики на изменения поля
    WSSC_PSB_SetIsChangedAgrBlock();
}

function WSSC_PBS_AddUserLinkTR(mainTable, blockObj, typeTD) 
{
    var newAddUserLinkTR = mainTable.insertRow(mainTable.rows.length);
    var linkTD = newAddUserLinkTR.insertCell(newAddUserLinkTR.cells.length);
    linkTD.className = "wssc-PPB-TableCell";
    linkTD.colSpan = 5;
    linkTD.innerHTML = "<a href='#' >" + WSSC_PBS_DispSettings.AddUserlink + "</a>";
    linkTD.children[0].onclick = WSSC_PBS_AddUserInRouteBlock_Img;
    linkTD.BlockObj = blockObj;
    linkTD.ParentCell = typeTD;
    linkTD.style.textAlign = "right";
}

function WSSC_PBS_DeleteUserRecordInProcessBlock(paramObj) 
{
    if (!window.confirm(window.TN.Translate("Вы действительно хотите удалить согласующего?"))) return;

    var delTD = paramObj.parentElement;
    var tr = delTD.parentElement;
    var blockTR = tr.BlockTR;
    //if(!tr.IsFirst)
    {
        var newRowSpan1 = blockTR.cells[0].rowSpan - 1;
        var newRowSpan2 = blockTR.cells[1].rowSpan - 1;
        
        if (newRowSpan1 <= 0) newRowSpan1 = 1;
        if (newRowSpan2 <= 0) newRowSpan2 = 1;
        blockTR.cells[0].rowSpan = newRowSpan1;//ячейка с этпапом (либо ячейка с крестиком для нижних блоков)
        blockTR.cells[1].rowSpan = newRowSpan2;//ячейка с крестиком для удаления блока (либо ячейка с типом согласования)
        var tmpCell = blockTR.cells[2];
        if(tmpCell.BlockObj != null)
            blockTR.cells[2].rowSpan = newRowSpan2;//ячейка с типом согласования
    }
    var userObj = tr.UserObj;
    var block = userObj.Block;
    userObj.IsDeleted = true;
    //проверяем удаляем ли мы текущий элемент
    //устанавливаем признак, что поменялся текущий согласуюший
    if (userObj.IsCurrent) WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = true;

    if (userObj.IsCurrent && !block.IsParallel) {
        for (var i = 0; i < block.Users.length; i++) {
            var user = block.Users[i];
            if (!user.IsPassed && !user.IsDeleted && user.ID != userObj.ID) {
                user.IsCurrent = true;
                var nextTR = user.UserTR;
                var roleTD = nextTR.cells[0];
                var userTD = nextTR.cells[1];
                roleTD.className = "wssc-PPB-TableCell-current";
                userTD.className = "wssc-PPB-TableCell-current";
                break;
            }
        }
    }

    if (!tr.IsFirst) tr.parentElement.removeChild(tr);
    else {
        var startInd = 3;
        var blockObj = tr.UserObj.Block;
        if (tr.cells[0].BlockObj != null) startInd = 2;
        for (var j = startInd; j < tr.cells.length; j++)
            tr.cells[j].innerHTML = "&nbsp";
        var userCountInBlock = 0;
        for (var i = 0; i < blockObj.Users.length; i++) {
            var tmpUser = blockObj.Users[i];
            if (!tmpUser.IsDeleted) userCountInBlock++;
        }
        if (userCountInBlock >= 1) {
            var rowInd = tr.rowIndex;
            var mainTable = tr.parentElement.parentElement;
            var nextTR = mainTable.rows[rowInd + 1];
            WSSC_PBS_MoveUpUserRecordInProcessBlock(nextTR, true);
            var delTR = mainTable.rows[rowInd + 1];
            mainTable.firstChild.removeChild(delTR);
        }
        //(ошибка с первой пустой строкой) проверка на кол-во пользователей в блоке
        if (!WSSC_PBS_DispSettings.ShowStageTitle && userCountInBlock == 0 && WSSC_PBS_DrawLinkInUsersBlock)
            tr.style.display = "none";
    }
    //обновляем tooltip в блоке
    WSSC_TBS_UpdateTooltipsForBlock(block);
    //обработчики на изменения поля
    WSSC_PSB_SetIsChangedAgrBlock();

    /*var userObj = delTD.UserObj;
    userObj.NotActive = true;
    
    for(var i=0; i<tr.cells.length; i++)
    {
    var td = tr.cells[i];
    td.style.display = "none";
    }*/
}

function GetRowCountForBlock(blockObj) 
{
    var rowCount = 0;
    for (var i = 0; i < WSSC_PBS_PassingFormData.Stages.length; i++) {
        var stageObj = WSSC_PBS_PassingFormData.Stages[i];
        for (var j = 0; j < stageObj.Blocks.length; j++) {
            var tmpBlockObj = stageObj.Blocks[j];
            var allDeleted = true;
            for (var k = 0; k < tmpBlockObj.Users.length; k++) {
                var tmpUserObj = tmpBlockObj.Users[k];
                if (tmpUserObj.IsDeleted) continue;
                allDeleted = false;
                rowCount++;
            }
            if (allDeleted) rowCount++;
            if (blockObj == tmpBlockObj) return rowCount;
        }
    }
    return rowCount;
}

function WSSC_PBS_IsAllUsersPassed() 
{
    for (var i = 0; i < WSSC_PBS_PassingFormData.Stages.length; i++) 
    {
        var stageObj = WSSC_PBS_PassingFormData.Stages[i];
        for (var j = 0; j < stageObj.Blocks.length; j++) 
        {
            var tmpBlockObj = stageObj.Blocks[j];
            for (var k = 0; k < tmpBlockObj.Users.length; k++) 
            {
                var tmpUserObj = tmpBlockObj.Users[k];
                if (tmpUserObj.IsDeleted) continue;
                if(!tmpUserObj.IsPassed) return false;
            }
        }
    }
    return true;
}

function WSSC_PBS_AddUserInRouteBlock(e) 
{

    var e = e || window.event;
    var aTag = e.srcElement ? e.srcElement : e.target;

    var sourceTD = aTag.parentElement; //td c ссылкой Добавить
    var blockObj = sourceTD.BlockObj;
    var linkTR = sourceTD.parentElement;
    var rowCount = GetRowCountForBlock(blockObj);
    var param = sourceTD.ParentCell.parentElement.rowIndex + ";" + rowCount;
    //передать параметры
    var lookupSettings = window.GetLookupSettings(WSSC_PBS_LookupSettings_AgrBlockSelectUserKey);
    lookupSettings.OpenLookupWindow(WSSC_PBS_LookupSettings_AgrBlockSelectUserKey + ';' + param);
}

function StageClient(xmlElement, passingForm) 
{
    //делаем ссылку на данные об этапе и ссылку на род.объект - форму
    this.XmlElement = xmlElement;
    this.PassingForm = passingForm;

    var stageID = $(xmlElement.selectSingleNode("ID")).text();
    var IDCounter = $(xmlElement.selectSingleNode("IDCounter")).text();
    var stageName = $(xmlElement.selectSingleNode("Name")).text();
    var dispNameInPassageBlock = $(xmlElement.selectSingleNode("DispNameInPassageBlock")).text();
    var translateDispName = '';
    if(WKF_IsMultilangVersion)
    {
        translateDispName = $(xmlElement.selectSingleNode("TranslateDispNameInPassageBlock")).text();
        this.TranslateDispNameInPassageBlock = translateDispName;
    }
    var isPassed = $(xmlElement.selectSingleNode("IsPassed")).text().toLowerCase() == "true";
    var isCurrent = $(xmlElement.selectSingleNode("IsCurrent")).text().toLowerCase() == "true";

    this.ID = stageID;
    this.IDCounter = IDCounter;
    this.Name = stageName;
    this.DispNameInPassageBlock = dispNameInPassageBlock;
    this.IsPassed = isPassed;
    this.IsCurrent = isCurrent;

    var blockNodes = xmlElement.selectNodes("ProcessBlocks/ProcessBlock");
    var i, len = blockNodes.length;
    this.Blocks = new Array();
    for (i = 0; i < len; i++) {
        var blockNode = blockNodes[i];
        this.Blocks[i] = new BlockClient(blockNode, this);
    }
}

function BlockClient(xmlElement, stage) 
{
    this.XmlElement = xmlElement;
    this.Stage = stage;

    var isParallel = $(xmlElement.selectSingleNode("IsParallel")).text().toLowerCase() == "true";
    var showAddUserLink = $(xmlElement.selectSingleNode("ShowAddUserLink")).text().toLowerCase() == "true";
    var isPassed = $(xmlElement.selectSingleNode("IsPassed")).text().toLowerCase() == "true";
    var isCurrent = $(xmlElement.selectSingleNode("IsCurrent")).text().toLowerCase() == "true";
    var blockName = $(xmlElement.selectSingleNode("BlockName")).text();
    var id = $(xmlElement.selectSingleNode("ID")).text();
    var idCounter = $(xmlElement.selectSingleNode("IDCounter")).text();

    //делаем подзапрос к AgrSetting
    PBS_InitAgrSetting(xmlElement, this);

    var settingID = "0";
    var settingIdXmlNode = xmlElement.selectSingleNode("SettingID");
    if (settingIdXmlNode != null) settingID = $(settingIdXmlNode).text();

    //если включен перевод, то добавляем переводимые свойства
    if(WKF_IsMultilangVersion)
    {
        var translateBlockName = $(xmlElement.selectSingleNode("TranslateBlockName")).text();
        this.TranslateBlockName = translateBlockName;
    }
    this.IsParallel = isParallel;
    this.ShowAddUserLink = showAddUserLink;
    this.IsPassed = isPassed;
    this.IsCurrent = isCurrent;
    this.BlockName = blockName;
    this.ID = id;
    this.IDCounter = idCounter;
    this.SettingID = settingID;

    //получаем xml элементы с пользователями
    this.Users = new Array();
    var userNodes = xmlElement.selectNodes("ProcessUsers/ProcessUser");
    if (userNodes != null) {
        for (var k = 0; k < userNodes.length; k++) {
            this.Users[k] = new UserClient(userNodes[k], k, this);
        }
    }

}

function PBS_InitAgrSetting(xmlElement,obj)
{
    var agrSettingNode = xmlElement.selectSingleNode("AgrSetting");
    var agrSettingObj = null;
    if (agrSettingNode != null) 
    {
        agrSettingObj = new Object();
        var groupID = $(agrSettingNode.selectSingleNode("GroupID")).text();
        var roleID = $(agrSettingNode.selectSingleNode("RoleID")).text();
        var takeFromCard = $(agrSettingNode.selectSingleNode("TakeFromCard")).text().toString().toLowerCase() == "true";
        var cannotBeDeletedBlock = $(agrSettingNode.selectSingleNode("CannotBeDeletedBlock")).text().toString().toLowerCase() == "true";
        var cannotBeDeleted = $(agrSettingNode.selectSingleNode("CannotBeDeleted")).text().toString().toLowerCase() == "true";
        var cannotBeEdited = $(agrSettingNode.selectSingleNode("CannotBeEdited")).text().toString().toLowerCase() == "true";
        var notAddOption = $(agrSettingNode.selectSingleNode("NotAddOption")).text();
        var notAddSubblocksLowerAttr = $(agrSettingNode.selectSingleNode("NotAddSubblockLower"));
        var notAddSubblocksLower = false;
        if(notAddSubblocksLowerAttr != null) notAddSubblocksLower = notAddSubblocksLowerAttr.text().toString().toLowerCase() == "true";

        agrSettingObj.GroupID = groupID;
        agrSettingObj.RoleID = roleID;
        agrSettingObj.TakeFromCard = takeFromCard;
        agrSettingObj.CannotBeDeletedBlock = cannotBeDeletedBlock;
        agrSettingObj.CannotBeDeleted = cannotBeDeleted;
        agrSettingObj.CannotBeEdited = cannotBeEdited;
        agrSettingObj.NotAddOption = notAddOption;
        agrSettingObj.NotAddSubblocksLower = notAddSubblocksLower;
        obj.AgrSetting = agrSettingObj;
    }
}

//основной конструктор (через xml)
function UserClient(xmlElement, userIndex, block) 
{
    this.XmlElement = xmlElement;
    this.Block = block;

    var userLogin = "";
    if (xmlElement.selectSingleNode("UserLogin") != null) userLogin = $(xmlElement.selectSingleNode("UserLogin")).text();
    var userFio = $(xmlElement.selectSingleNode("UserFIO")).text();
    var userID = $(xmlElement.selectSingleNode("UserID")).text();
    var userPosition = "";
    if (xmlElement.selectSingleNode("UserPosition") != null) userPosition = $(xmlElement.selectSingleNode("UserPosition")).text();
    var factUserLoginXmlNode = xmlElement.selectSingleNode("FactUserLogin");
    var factUserLogin = "";
    if (factUserLoginXmlNode != null) factUserLogin = $(factUserLoginXmlNode).text();
    var factUserFioXmlNode = xmlElement.selectSingleNode("FactUserFIO");
    var factUserFIO = "";
    if (factUserFioXmlNode != null) factUserFIO = $(factUserFioXmlNode).text();
    var factUserPosionXmlNode = xmlElement.selectSingleNode("FactUserPosition");
    var factUserID = $(xmlElement.selectSingleNode("FactUserID")).text();
    var factUserPosition = "";
    if (factUserPosionXmlNode != null) factUserPosition = $(factUserPosionXmlNode).text();
    var solutionXmlNode = xmlElement.selectSingleNode("Solution");
    var solution = "";
    if (solutionXmlNode != null) solution = $(solutionXmlNode).text();
    var solutionResultXmlNode = xmlElement.selectSingleNode("SolutionResult");
    var solutionResult = "";
    if (solutionResultXmlNode != null) solutionResult = $(solutionResultXmlNode).text();
    var commentXmlNode = xmlElement.selectSingleNode("Comment");
    var comment = "";
    if (commentXmlNode != null) comment = $(commentXmlNode).text();
    var allowDelete = $(xmlElement.selectSingleNode("AllowDelete")).text().toLowerCase() == "true";
    var isPassed = $(xmlElement.selectSingleNode("IsPassed")).text().toLowerCase() == "true";
    var isCurrent = $(xmlElement.selectSingleNode("IsCurrent")).text().toLowerCase() == "true";

    var startDate = "";
    var startDateXmlNode = xmlElement.selectSingleNode("StartDate");
    if (startDateXmlNode != null)
        startDate = $(startDateXmlNode).text();
    var endDate = "";
    var endDateXmlNode = xmlElement.selectSingleNode("EndDate");
    if (endDateXmlNode != null)
        endDate = $(endDateXmlNode).text();
    
    var userDelegate = false;
    if (xmlElement.selectSingleNode("UserDelegate") != null)
        userDelegate = $(xmlElement.selectSingleNode("UserDelegate")).text().toLowerCase() == "true";

    //если включен перевод, то добавляем переводимые значения
    if(WKF_IsMultilangVersion)
    {
        //переводимые свойства
        //перевод ФИО пользователя
        var translateUserFio = $(xmlElement.selectSingleNode("TranslateUserFIO")).text();
        this.TranslateUserFIO = translateUserFio;
        
        //перевод должности пользователя
        var translateUserPosition = "";
        if (xmlElement.selectSingleNode("TranslateUserPosition") != null) 
            translateUserPosition = $(xmlElement.selectSingleNode("TranslateUserPosition")).text();
        this.TranslateUserPosition = translateUserPosition;
        
        //перевод ФИО, принявшего решение
        var translateFactUserFioXmlNode = xmlElement.selectSingleNode("TranslateFactUserFIO");
        var translateFactUserFIO = "";
        if (translateFactUserFioXmlNode != null) translateFactUserFIO = $(translateFactUserFioXmlNode).text();
        this.TranslateFactUserFIO = translateFactUserFIO;
        
        //перевод должности сотрудника, принявшего решения
        var translateFactUserPosionXmlNode = xmlElement.selectSingleNode("TranslateFactUserPosition");
        var translateFactUserPosition = "";
        if (translateFactUserPosionXmlNode != null) translateFactUserPosition = $(translateFactUserPosionXmlNode).text();
        this.TranslateFactUserPosition = translateFactUserPosition;
        
        //перевод результата решения
        var translateSolutionResultXmlNode = xmlElement.selectSingleNode("TranslateSolutionResult");
        var translateSolutionResult = "";
        if (translateSolutionResultXmlNode != null) translateSolutionResult = $(translateSolutionResultXmlNode).text();
        this.TranslateSolutionResult = translateSolutionResult;
    }
    
    //MatrixPerson
    var matrixPersonXmlNode = xmlElement.selectSingleNode("MatrixPerson");
    if (matrixPersonXmlNode != null)
    {
        this.MatrixPerson = new Object();
        var userItemXmlNode = matrixPersonXmlNode.selectSingleNode("UserID");
        if (userItemXmlNode != null)
            this.MatrixPerson.UserID = $(userItemXmlNode).text();

        var conditionXmlNode = matrixPersonXmlNode.selectSingleNode("Condition");
        if (conditionXmlNode != null)
            this.MatrixPerson.Codition = $(conditionXmlNode).text();

        var termForAgrStageXmlNode = matrixPersonXmlNode.selectSingleNode("TermForAgrStage");
        if (termForAgrStageXmlNode != null)
            this.MatrixPerson.TermForAgrStage = $(termForAgrStageXmlNode).text();

        var docFieldNameXmlNode = matrixPersonXmlNode.selectSingleNode("DocFieldName");
        if (docFieldNameXmlNode != null)
            this.MatrixPerson.DocFieldName = $(docFieldNameXmlNode).text();

        var setValuesXmlNode = matrixPersonXmlNode.selectSingleNode("SetValues");
        if (setValuesXmlNode != null)
            this.MatrixPerson.SetValues = $(setValuesXmlNode).text();

        var denyDeleteXmlNode = matrixPersonXmlNode.selectSingleNode("DenyDelete");
        if (denyDeleteXmlNode != null)
            this.MatrixPerson.DenyDelete = $(denyDeleteXmlNode).text().toLowerCase().toLowerCase() == "true";

        var denyMoveXmlNode = matrixPersonXmlNode.selectSingleNode("DenyMove");
        if (denyMoveXmlNode != null)
            this.MatrixPerson.DenyMove = $(denyMoveXmlNode).text().toLowerCase().toLowerCase() == "true";

        var denyAddXmlNode = matrixPersonXmlNode.selectSingleNode("DenyAdd");
        if (denyAddXmlNode != null)
            this.MatrixPerson.DenyAdd = $(denyAddXmlNode).text();

        var controlTermXmlNode = matrixPersonXmlNode.selectSingleNode("ControlTerm");
        if (controlTermXmlNode != null)
            this.MatrixPerson.ControlTerm = $(controlTermXmlNode).text().toLowerCase().toLowerCase() == "true";

        var roleIDXmlNode = matrixPersonXmlNode.selectSingleNode("RoleID");
        if (roleIDXmlNode != null)
            this.MatrixPerson.RoleID = $(roleIDXmlNode).text();

        var matrixIDInfoXmlNode = matrixPersonXmlNode.selectSingleNode("MatrixIDInfo");
        if (matrixIDInfoXmlNode != null)
        {
            this.MatrixPerson.MatrixIDInfo = new Object();
            var tsItemIDXmlNode = matrixIDInfoXmlNode.selectSingleNode("TSItemID");
            if (tsItemIDXmlNode != null)
                this.MatrixPerson.MatrixIDInfo.TSItemID = $(tsItemIDXmlNode).text();

            var tsFieldIDXmlNode = matrixIDInfoXmlNode.selectSingleNode("TSFieldID");
            if (tsFieldIDXmlNode != null)
                this.MatrixPerson.MatrixIDInfo.TSFieldID = $(tsFieldIDXmlNode).text();

            var tsRowIDXmlNode = matrixIDInfoXmlNode.selectSingleNode("TSRowID");
            if (tsRowIDXmlNode != null)
                this.MatrixPerson.MatrixIDInfo.TSRowID = $(tsRowIDXmlNode).text();
        }

    }
    
    //делаем подзапрос к AgrSetting
    PBS_InitAgrSetting(xmlElement, this);

    var settingID = "0";
    var settingIdXmlNode = xmlElement.selectSingleNode("SettingID");
    if (settingIdXmlNode != null) settingID = $(settingIdXmlNode).text();

    var ID = "0";
    var IDXmlNode = xmlElement.selectSingleNode("ID");
    if (IDXmlNode != null) ID = $(IDXmlNode).text();

    this.ID = ID;
    this.UserLogin = userLogin;
    this.UserFIO = userFio;
    this.UserID = userID;
    this.UserPosition = userPosition;
    this.FactUserLogin = factUserLogin;
    this.FactUserFIO = factUserFIO;
    this.FactUserID = factUserID;
    this.FactUserPosition = factUserPosition;
    this.Solution = solution;
    this.SolutionResult = solutionResult;
    this.Comment = comment;
    this.AllowDelete = allowDelete;
    this.IsPassed = isPassed;
    this.IsCurrent = isCurrent;
    this.SettingID = settingID;
    this.StartDate = startDate;
    this.EndDate = endDate;
    this.UserDelegate = userDelegate;
}

//констуртор (для добавления по ссылке "Добавить")
function UserClientLight(block, userLogin, userFIO, userPosition, userID, translateUserFIO, translateUserPosition) 
{
    this.Block = block;
    this.UserLogin = userLogin;
    this.UserFIO = userFIO;
    this.UserPosition = userPosition;
    this.UserID = userID;
    this.ID = 0;

    if(translateUserFIO != null)
        this.TranslateUserFIO = translateUserFIO;
    else
        this.TranslateUserFIO = userFIO;
        
    if(translateUserPosition != null)
        this.TranslateUserPosition = translateUserPosition;
    else
        this.TranslateUserPosition = userPosition;
        
    this.FactUserLogin = "";
    this.FactUserFIO = "";
    this.FactUserPosition = "";
    this.FactUserID = 0;
    this.Solution = "";
    this.SolutionResult = "";
    this.Comment = "";
    this.AllowDelete = true;
    this.IsPassed = false;
    this.IsCurrent = false;
    this.StartDate = "";
    this.EndDate = "";
    this.UserDelegate = false;

    if (block.IsParallel && block.IsCurrent) this.IsCurrent = true;
    if (!block.IsParallel && block.IsCurrent) {
        var hasCurrent = false;
        for (var j = 0; j < block.Users.length; j++) {
            var tmpUserObj = block.Users[j];
            if (tmpUserObj.IsCurrent && !tmpUserObj.IsDeleted) hasCurrent = true;
        }
        if (!hasCurrent) this.IsCurrent = true;
    }
    this.SettingID = "";
}

function CheckIsUserProcessBlock(processBlock, userID) 
{
    if (processBlock.Users == null) return false;
    for (var i = 0; i < processBlock.Users.length; i++)
    {
        var tmpUserObj = processBlock.Users[i];
        if (tmpUserObj.IsDeleted) continue;
        var tmpUser = tmpUserObj;
        var tmpUserID = tmpUser.UserID;
        if (tmpUserID == userID) return true; //пользователь уже есть в этом блоке согласования
    }
    return false; //пользователя нет в блоке согласования
}

function CheckLastUserInProcessBlock(processBlock, userID) 
{
    if (processBlock.Users == null) return false;
    for (var i = processBlock.Users.length - 1; i >= 0; i--) 
    {
        var tmpUserObj = processBlock.Users[i];
        if (tmpUserObj.IsDeleted) continue;
        var tmpUser = tmpUserObj;
        var tmpUserID = tmpUser.UserID;
        if (tmpUserID == userID) return true; //пользователь уже есть в этом блоке согласования
        return false;
    }
    return false; //пользователя нет в блоке согласования
}


//получение ячейки с действиями
function WSSC_TBS_GetActionTD(userTR) {
    return userTR.children[userTR.children.length - 1];
}

//установка tooltip
function WSSC_TBS_SetToolTipToAction(actionTD, ind, message) {
    if (actionTD.children.length <= ind) return;
    var img = actionTD.children[ind].children[0];
    img.title = message;
    if (message != WSSC_PBS_Tooltip_Delete && message != WSSC_PBS_Tooltip_MoveUp && message != WSSC_PBS_Tooltip_MoveDown) {
        switch (ind) {
            case 0:
                if (img.src != WSSC_PBS_DisableDeleteImgPath) img.src = WSSC_PBS_DisableDeleteImgPath;
                break;
            case 1:
                if (img.src != WSSC_PBS_MoveUpDisableImgPath) img.src = WSSC_PBS_MoveUpDisableImgPath;
                break;
            case 2:
                if (img.src != WSSC_PBS_MoveDownDisableImgPath) img.src = WSSC_PBS_MoveDownDisableImgPath;
                break;
        }
    }
    else {
        switch (ind) {
            case 0:
                if (img.src != WSSC_PBS_DeleteImgPath) img.src = WSSC_PBS_DeleteImgPath;
                break;
            case 1:
                if (img.src != WSSC_PBS_MoveUpImgPath) img.src = WSSC_PBS_MoveUpImgPath;
                break;
            case 2:
                if (img.src != WSSC_PBS_MoveDownImgPath) img.src = WSSC_PBS_MoveDownImgPath;
                break;
        }
    }
}

//проверка в блоке актуальности подсказок
function WSSC_TBS_UpdateTooltipsForBlock(blockObj) {
    //debugger;
    if (blockObj == null) return;
    if (blockObj.Users == null) return;
    var isFirstTD = true;
    var isSetNotMoveUp = false;

    //определяем индекс до которого нужно идти
    var maxIndex = blockObj.Users.length;
    for (var k = blockObj.Users.length - 1; k >= 0; k--) {
        var tmpUserObj = blockObj.Users[k];
        if (tmpUserObj.IsDeleted) continue;
        else {
            maxIndex = k + 1;
            break;
        }
    }

    for (var i = 0; i < maxIndex; i++) {
        var userObj = blockObj.Users[i];
        var actionTD = WSSC_TBS_GetActionTD(userObj.UserTR);
        if (actionTD.style.display == "none" || userObj.IsDeleted) continue;
        //если поэтап пройден, то подсказок не рисуем
        if (userObj.IsPassed) {
            WSSC_TBS_SetToolTipToAction(actionTD, 0, "");
            WSSC_TBS_SetToolTipToAction(actionTD, 1, "");
            WSSC_TBS_SetToolTipToAction(actionTD, 2, "");
            continue;
        }
        //удаление
        WSSC_TBS_SetToolTipToAction(actionTD, 0, WSSC_PBS_Tooltip_Delete);

        //проверка настроек
        var denyDelete = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "delete");
        if (denyDelete) {
            //нельзя удалять
            WSSC_TBS_SetToolTipToAction(actionTD, 0, WSSC_PBS_Tooltip_DelDeny);
        }
        var denyMove = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "move");
        //если запрещено редактирование, то устанавливаем сообветствующий tooltip
        if (denyMove) {
            //WSSC_TBS_SetToolTipToAction(actionTD, 0, WSSC_PBS_Tooltip_EditDeny);
            WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_EditDeny);
            WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_EditDeny);
            isSetNotMoveUp = true;
            continue;
        }

        //первая ячейка, нельзя перемещать вверх
        if (isFirstTD) {
            WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_MoveUpDeny);
            isFirstTD = false;
        }
        else {
            WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_MoveUp);
        }
        //последняя ячейка, нельзя перемещать вниз
        if (i == maxIndex - 1) {
            WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_MoveDownDeny);
        }
        else {
            WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_MoveDown);
        }
        //если установлен признак, что нельзя перемещать вверх вышестоящую запись
        if (isSetNotMoveUp) {
            isSetNotMoveUp = false;
            WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_EditDenyForUpperRecord);
        }
        //если параллельный подэтап
        if (blockObj.IsParallel) {
            WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_MoveParallel);
            WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_MoveParallel);
        }
        else {
            //проверка на настройки "Не добавлять (выше, ниже, выше и ниже)"
            //не добавлять выше для текущей записи
            var settingVal = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "add");
            var upArrowTooltipSet = false;
            var downArrowTooltipSet = false;
            switch (settingVal) {
                case "Down":
                    WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_Rec_MoveDownDoNotAddUp);
                    upArrowTooltipSet = true; break;
                case "Up":
                    WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_Rec_MoveUpDoNotAddUp);
                    downArrowTooltipSet = true; break;
                case "UpAndDown":
                    WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_Rec_MoveDownDoNotAddUp);
                    upArrowTooltipSet = true;
                    WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_Rec_MoveUpDoNotAddUp);
                    downArrowTooltipSet = true;
                    break;
            }
            //смотрим настройки предыдущей записи (стоит ли там не добавлять выше)
            if (!upArrowTooltipSet) {
                for (var j = i - 1; j >= 0; j--) {
                    var tmpUserObj = blockObj.Users[j];
                    if (tmpUserObj.IsDeleted) continue;

                    var tmpSettingVal = WSSC_PBS_GetDenySetting(tmpUserObj.AgrSetting, tmpUserObj.MatrixPerson, "add");
                    if (tmpSettingVal == "Up" || tmpSettingVal == "UpAndDown") {
                        WSSC_TBS_SetToolTipToAction(actionTD, 1, WSSC_PBS_Tooltip_MoveUpDoNotAddUp);
                    }

                    break;
                }
            }
            //смотрим настройки следующей записи (стоит ли там не добавлять ниже)
            if (!downArrowTooltipSet) {
                for (var j = i + 1; j < blockObj.Users.length; j++) {
                    var tmpUserObj = blockObj.Users[j];
                    if (tmpUserObj.IsDeleted) continue;

                    var tmpSettingVal = WSSC_PBS_GetDenySetting(tmpUserObj.AgrSetting, tmpUserObj.MatrixPerson, "add");
                    if (tmpSettingVal == "Down" || tmpSettingVal == "UpAndDown") {
                        WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_MoveDownDoNotAddUp);
                    }

                    var denyMove = WSSC_PBS_GetDenySetting(tmpUserObj.AgrSetting, tmpUserObj.MatrixPerson, "move");
                    if (denyMove)
                        WSSC_TBS_SetToolTipToAction(actionTD, 2, WSSC_PBS_Tooltip_EditDenyForDownRecord);

                    break;
                }
            }
        }
    }
}

function WSSC_PBS_UpdateHandlerToLookup(tdObj)
{
    if (tdObj == null) return;
    var divContainer = tdObj.firstChild;
    if (divContainer == null) return;
    var linkObj = divContainer.firstChild;
    if (linkObj == null) return;
    if (linkObj.tagName.toLowerCase() != "a" || linkObj.className != "wkf_pbs_lookup_link" || (linkObj.href == "")) return;
    var url = linkObj.href + '&closeOnUpdate=true&closeOnCancel=true';
    linkObj.onclick = function ()
    {
        window.open(url, '_blank', 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no');
        return false;
    }
}

function WSSC_PBS_UpdateLinksTR(trObj)
{
    if (trObj == null) return;
    if (trObj.cells == null) return;
    for (var i = 0; i < trObj.cells.length; i++)
    {
        var tdObj = trObj.cells[i];
        WSSC_PBS_UpdateHandlerToLookup(tdObj);
    }
}

function WSSC_PBS_CreateUserLinkByID(userTD, userID, userFIO, isFactUser)
{
    var solutionFld = window.SLFieldInstance;

    var lookupItemDispUrl = WSSC_PBS_UserListDispUrl + '?ID=' + userID;

    var lnkLookupItem = window.document.createElement('a');
    lnkLookupItem.className = 'wkf_pbs_lookup_link';

    $(lnkLookupItem).text(userFIO);
    var lookupUrl = null;
    var params = '&closeOnUpdate=true&closeOnCancel=true';

    lnkLookupItem.href = lookupItemDispUrl;
    lookupUrl = lookupItemDispUrl + params;

    lnkLookupItem.onclick = function() 
    {
        window.open(lookupUrl, '_blank', 'resizable=yes,location=yes,scrollbars=yes,menubar=no,status=yes,toolbar=no'); 
        return false; 
    }
    if (userTD.innerHTML == "&nbsp;" || userTD.innerHTML.toLowerCase() == "<br>") userTD.innerHTML = "";
        
    var lookupDiv = window.document.createElement("div");
    if(!isFactUser)
    {
        if (WSSC_PBS_DispSettings.UserTitleColWidth != null && WSSC_PBS_DispSettings.UserTitleColWidth != "" && WSSC_PBS_DispSettings.UserTitleColWidth > 0) 
        {
            if(WSSC_PBS_DispSettings.UserTitleColWidth > 0)
                lookupDiv.style.width = WSSC_PBS_DispSettings.UserTitleColWidth + 'px';
            lookupDiv.className = 'wkf_lookup_div';
        }
    }
    else
    {
        if (WSSC_PBS_DispSettings.FactUserTitleColWidth != null && WSSC_PBS_DispSettings.FactUserTitleColWidth != "" && WSSC_PBS_DispSettings.FactUserTitleColWidth > 0) 
        {
            if(WSSC_PBS_DispSettings.FactUserTitleColWidth > 0)
                lookupDiv.style.width = WSSC_PBS_DispSettings.FactUserTitleColWidth + 'px';
            lookupDiv.className = 'wkf_lookup_div';
        }
    }
    if (userTD.innerHTML != "")
    {
        if (SM.IEVersion >= 9)
        {
            lookupDiv.style.paddingTop = "4px";
        }
        else
            lookupDiv.style.paddingTop = 4;
    }

    lookupDiv.appendChild(lnkLookupItem);
    userTD.appendChild(lookupDiv);
}

function WSSC_PBS_CreateUserLink(userTD, userObj, isFactUser) 
{
    var userID = userObj.UserID;
    var userFIO = userObj.UserFIO;
    if(WKF_IsMultilangVersion)
        userFIO = userObj.TranslateUserFIO;
        
    if(isFactUser)
    {
        userID = userObj.FactUserID;
        userFIO = userObj.FactUserFIO;
        if(WKF_IsMultilangVersion)
            userFIO = userObj.TranslateFactUserFIO;
    }
    if(userFIO == null) userFIO = '';

    var solutionFld = window.SLFieldInstance;
    if (userID == 0)
    {
        var userFIOParts = userFIO.split('_#_');
        var allUserFIO = '';
        for(var i=0; i<userFIOParts.length; i++)
        {
            var userFIOPart = userFIOParts[i];
            var tmpUserFIOParts = userFIOPart.split(';#');
            var tmpUserID = 0;
            var tmpUserFIO = '';
            if(tmpUserFIOParts.length > 1)
            {
                tmpUserID = tmpUserFIOParts[0];
                tmpUserFIO = tmpUserFIOParts[1];
            }
            else 
             tmpUserFIO = tmpUserFIOParts[0];
            if(WKF_IsNewDesign && tmpUserID != 0) WSSC_PBS_CreateUserLinkByID(userTD, tmpUserID, tmpUserFIO, isFactUser);
            if(tmpUserID == 0 || !WKF_IsNewDesign)
            {
                allUserFIO += tmpUserFIO + "<br/>";
            }
        }
        if(allUserFIO != '')
            userTD.innerHTML = allUserFIO;
    }
    if(userID > 0) 
    {
        if(WKF_IsNewDesign)
            WSSC_PBS_CreateUserLinkByID(userTD, userID, userFIO, isFactUser);
        else
            userTD.innerHTML = userFIO;
    }
}

function WSSC_TBS_AddUserTR(userObj, userTR, notAddTD) {
    //задаем для userObj строку userTR
    userObj.UserTR = userTR;
    var startInd = 2;
    if (userTR.cells.length == 11) startInd = 3; //7

    //(ошибка с первой пустой строкой) проверка на добавление 1-го пользователя в режиме, когла не отображается этап
    if (notAddTD && !WSSC_PBS_DispSettings.ShowStageTitle)
        userTR.style.display = "";

    //добавление ячейки
    //ячейка "Роль/должность"
    var roleTD = null;
    if (notAddTD) roleTD = userTR.cells[startInd];
    else roleTD = userTR.insertCell(userTR.cells.length);
    var isBlockPassed = userObj.Block.IsPassed;
    roleTD.className = "wssc-PPB-TableCell";
    var userPosition = userObj.UserPosition;
    if(WKF_IsMultilangVersion)
        userPosition = userObj.TranslateUserPosition;
        
    $(roleTD).text(userPosition);
    if (userPosition == "" || userPosition == null) roleTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowRolePositionTitle) roleTD.style.display = "none";
    if (WSSC_PBS_DispSettings.RolePositionTitleColWidth != null && WSSC_PBS_DispSettings.RolePositionTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.RolePositionTitleColWidth > 0)
            roleTD.style.width = WSSC_PBS_DispSettings.RolePositionTitleColWidth + 'px';
    }

    if (userObj.IsCurrent) roleTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) roleTD.className = "wssc-PPB-TableCell-passed";

    //ячейка "Сотрудник"
    var userTD = null;
    if (notAddTD) userTD = userTR.cells[startInd + 1];
    else userTD = userTR.insertCell(userTR.cells.length);

    userTD.className = "wssc-PPB-TableCell";
    var addControl = true;
    var cannotBeEdited = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "move");
    var cannotBeDeleted = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "delete"); ;

    if (userObj.SettingID != null && userObj.SettingID != "0" && userObj.SettingID != "" && !userObj.IsPassed) 
    {
        var groupID = null;
        if (userObj.AgrSetting != null) groupID = userObj.AgrSetting.GroupID;
        var roleID = null;
        if (userObj.AgrSetting != null) roleID = userObj.AgrSetting.RoleID;

        WSSC_PBS_CreateUserLink(userTD, userObj);
    }
    else WSSC_PBS_CreateUserLink(userTD, userObj);

    if (userTD.innerHTML == "") userTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowUserTitle) userTD.style.display = "none";
    if (userObj.IsCurrent) userTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) userTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_DispSettings.UserTitleColWidth != null && WSSC_PBS_DispSettings.UserTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.UserTitleColWidth > 0)
            userTD.style.width = WSSC_PBS_DispSettings.UserTitleColWidth + 'px';
    }
    //ячейка "Факт. принявший решение"
    var factUserTD = null;
    if (notAddTD) factUserTD = userTR.cells[startInd + 2];
    else factUserTD = userTR.insertCell(userTR.cells.length);

    factUserTD.className = "wssc-PPB-TableCell";
    WSSC_PBS_CreateUserLink(factUserTD, userObj, true);
    //if (userObj.FactUserFIO == "") factUserTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowFactUserTitle) factUserTD.style.display = "none";
    if (userObj.IsCurrent) factUserTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) factUserTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_DispSettings.FactUserTitleColWidth != null && WSSC_PBS_DispSettings.FactUserTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.FactUserTitleColWidth > 0)
            factUserTD.style.width = WSSC_PBS_DispSettings.FactUserTitleColWidth + 'px';
    }

    //ячейка "Дата и время получения"
    var agrStartDateTD = null;
    if (notAddTD) agrStartDateTD = userTR.cells[startInd + 3];
    else agrStartDateTD = userTR.insertCell(userTR.cells.length);

    agrStartDateTD.className = "wssc-PPB-TableCell";
    var startDateVal = WSSC_PBS_GetAgrDate(userObj.StartDate);
    $(agrStartDateTD).text(startDateVal);
    if (startDateVal == "" || (startDateVal.indexOf("01.01.0001")>= 0) ) agrStartDateTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowAgrStartDateTitle) agrStartDateTD.style.display = "none";
    if (userObj.IsCurrent) agrStartDateTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) agrStartDateTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_DispSettings.AgrStartDateTitleColWidth != null && WSSC_PBS_DispSettings.AgrStartDateTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.AgrStartDateTitleColWidth > 0)
            agrStartDateTD.style.width = WSSC_PBS_DispSettings.AgrStartDateTitleColWidth + 'px';
    }
    //ячейка "Дата и время согласования"
    var agrEndDateTD = null;
    if (notAddTD) agrEndDateTD = userTR.cells[startInd + 4];
    else agrEndDateTD = userTR.insertCell(userTR.cells.length);

    agrEndDateTD.className = "wssc-PPB-TableCell";
    var endDateVal = WSSC_PBS_GetAgrDate(userObj.EndDate);
    $(agrEndDateTD).text(endDateVal);
    if (endDateVal == "" || (endDateVal.indexOf("01.01.0001")>= 0)) agrEndDateTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowAgrEndDateTitle) agrEndDateTD.style.display = "none";
    if (userObj.IsCurrent) agrEndDateTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) agrEndDateTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_DispSettings.AgrEndDateTitleColWidth != null && WSSC_PBS_DispSettings.AgrEndDateTitleColWidth != "")
    {
        if(WSSC_PBS_DispSettings.AgrEndDateTitleColWidth > 0)
            agrEndDateTD.style.width = WSSC_PBS_DispSettings.AgrEndDateTitleColWidth + 'px';
    }
    //ячейка "Результат решения"
    var solutionResultTD = null;
    if (notAddTD) solutionResultTD = userTR.cells[startInd + 5];
    else solutionResultTD = userTR.insertCell(userTR.cells.length);

    solutionResultTD.className = "wssc-PPB-TableCell";
    var solutionResult = userObj.SolutionResult;

    //берем значение из словаря для решений "Делегировать"
    var solutionResultWasSet = false;
    if(WSSC_PBS_DelegatedFIODic != null)
        if(WSSC_PBS_DelegatedFIODic[solutionResult] != null)
        {   
            solutionResult = WSSC_PBS_DelegatedFIODic[solutionResult];
            solutionResultWasSet = true;
        }
    if (WKF_IsMultilangVersion && !solutionResultWasSet && userObj.TranslateSolutionResult!= null)
        solutionResult = userObj.TranslateSolutionResult;
    
    if (solutionResult != null) 
    {
        if (solutionResult.indexOf("SYS:") >= 0) 
        {
            solutionResult = solutionResult.substring(4);
            solutionResultTD.innerHTML = solutionResult;
        }
        else 
        {
            $(solutionResultTD).text(solutionResult);
        }
    }
    if (solutionResult == "") solutionResultTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowSolutionResultTitle) solutionResultTD.style.display = "none";
    if (userObj.IsCurrent) solutionResultTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) solutionResultTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_DispSettings.SolutionResultTitleColWidth != null && WSSC_PBS_DispSettings.SolutionResultTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.SolutionResultTitleColWidth > 0)
            solutionResultTD.style.width = WSSC_PBS_DispSettings.SolutionResultTitleColWidth + 'px';
    }
    //ячейка "Комментарий"
    var agrCommentTD = null;
    if (notAddTD) agrCommentTD = userTR.cells[startInd + 6];
    else agrCommentTD = userTR.insertCell(userTR.cells.length);

    agrCommentTD.className = "wssc-PPB-TableCell";
    $(agrCommentTD).text(userObj.Comment);
    if (userObj.Comment == "" || userObj.Comment == null) agrCommentTD.innerHTML = "&nbsp;";
    if (!WSSC_PBS_DispSettings.ShowCommentTitle) agrCommentTD.style.display = "none";
    if (userObj.IsCurrent) agrCommentTD.className = "wssc-PPB-TableCell-current";
    if (userObj.IsPassed || isBlockPassed) agrCommentTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_DispSettings.CommentTitleColWidth != null && WSSC_PBS_DispSettings.CommentTitleColWidth != "") 
    {
        if(WSSC_PBS_DispSettings.CommentTitleColWidth > 0)
            agrCommentTD.style.width = WSSC_PBS_DispSettings.CommentTitleColWidth + 'px';
    }
    //ячейка с действиями
    var actionsTD = null;
    if (notAddTD) actionsTD = userTR.cells[startInd + 7];
    else actionsTD = userTR.insertCell(userTR.cells.length);

    actionsTD.innerHTML = "";
    actionsTD.noWrap = true;
    actionsTD.className = "wssc-PPB-TableCell";
    if (userObj.IsPassed || isBlockPassed) actionsTD.className = "wssc-PPB-TableCell-passed";
    if (WSSC_PBS_CanUserEditPassageBlock) {
        var cannotBeEdited = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "move");
        var cannotBeDeleted = WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "delete"); ;

        WSSC_PBS_FillActionTD(actionsTD, userObj, cannotBeEdited, cannotBeDeleted);
    }
    else actionsTD.style.display = "none";
}

//заполнение ячейки с действиями
function WSSC_PBS_FillActionTD(actionsTD, userObj, cannotBeEdited, cannotBeDeleted) 
{
    actionsTD.UserObj = userObj;
    if (!userObj.IsPassed && userObj.AllowDelete && !cannotBeDeleted) 
    {
        //ячейка с крестиком для удаления
        actionsTD.innerHTML = "<a href='#' onclick='WSSC_PBS_DeleteUserRecordInProcessBlock(this);return false;'><img border=0 src='" + WSSC_PBS_DeleteImgPath + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";
    }
    else
        actionsTD.innerHTML = "<a href='#' onclick='return false;'><img border=0 src='" + WSSC_PBS_DisableDeleteImgPath + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";


    //ячейка с кнопкой перемещения вверх
    if (!userObj.IsPassed && !cannotBeEdited && !userObj.Block.IsParallel)
        actionsTD.innerHTML += "<a href='#' onclick='WSSC_PBS_MoveUpUserRecordInProcessBlock(this);return false;'><img border=0 src='" + WSSC_PBS_MoveUpImgPath + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";
    else
        actionsTD.innerHTML += "<a href='#' onclick='return false;'><img border=0 src='" + WSSC_PBS_MoveUpDisableImgPath + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";

    //ячейка с кнопкой перемещения вниз
    if (!userObj.IsPassed && !cannotBeEdited && !userObj.Block.IsParallel)
        actionsTD.innerHTML += "<a href='#' onclick='WSSC_PBS_MoveDownUserRecordInProcessBlock(this);return false;'><img border=0 src='" + WSSC_PBS_MoveDownImgPath + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";
    else
        actionsTD.innerHTML += "<a href='#' onclick='return false;'><img border=0 src='" + WSSC_PBS_MoveDownDisableImgPath + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";

    //ячейка с кнопкой очистки результатов, если есть возможность редактирования блока
    if (userObj.IsPassed && WSSC_PBS_CanUserEditPassageBlock && WSSC_PBS_ShowLinksForClearAndRestore && WKF_IsNewDesign)
    {
        var clearResultsLinkName = WSSC_PBS_Tooltip_CleraResults;
        actionsTD.innerHTML += "<a href='#' onclick='WSSC_PBS_ClearAgrResultsForUser(this);return false;'><img border=0 src='/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/clear_act.gif' title='" + clearResultsLinkName + "' style='display:block; float:left' class='wssc-PPB-ActionImg'/></a>";
    }

    if (actionsTD.innerHTML == "") actionsTD.innerHTML = "&nbsp;";
}

function WSSC_PBS_ReturnLookupResult(xml, resultID) 
{
    var solutionFld = window.SLFieldInstance;
    if (xml == null || resultID == null || resultID == '') return;
    var lookupSettings = window.GetLookupSettings(WSSC_PBS_LookupSettings_AgrBlockSelectUserKey);
    var mainTable = window.document.getElementById('WsscPbsMainTableID');
    var param0 = resultID.split(';')[0]; //настройка
    var param1 = resultID.split(';')[1]; //содержит значение индекса ячейки блока, в который добавляется пользователь
    var typeTR = mainTable.rows[param1];
    
    var deleteBlockTD = typeTR.cells[0];
    var typeTD = typeTR.cells[1];
    if (deleteBlockTD.BlockObj == null) 
    {
        deleteBlockTD = mainTable.rows[param1].cells[1];
        typeTD = mainTable.rows[param1].cells[2];
    }
    
    var param2 = resultID.split(';')[2];
    var newInd = parseInt(param2) + 1; //строка в которую нужно добавить пользователя
    var blockObj = typeTD.BlockObj;
    //если блок и этап пройден, но в него добавляем пользователей, то делаем его непройденным
    if (blockObj.IsPassed) {
        blockObj.IsPassed = false;
        //если текущий этап - этап согласования, то блок делаем текущим
        if (solutionFld.ItemInfo.CurrentStage == blockObj.Stage.Name)
            blockObj.IsCurrent = true;
    }

    if (blockObj.Stage.IsPassed) blockObj.Stage.IsPassed = false;

    if (lookupSettings.IsMultiple) 
    {
        var axoLookupResult = window.SM.LoadXML(xml);
        var loookupNodes = axoLookupResult.documentElement.selectNodes('LookupValue');
        var loadFields = new Array();
        loadFields.push('Логин');
        loadFields.push('Должность');
        loadFields.push('Имя пользователя');
        
        if(WKF_IsMultilangVersion && WSSC_PBS_LangCode != '')
        {
            loadFields.push('Должность ' + WSSC_PBS_LangCode);
            loadFields.push('Имя пользователя ' + WSSC_PBS_LangCode);
        }
        
        var lookupUsers = null;
        //получаем id элементов, которые нужно добавить и получаем значения доп. полей
        var i, len = loookupNodes.length;
        var stIDs = '';
        var addedValues = new Array();
        for (i = 0; i < len; i++) {
            var singleValue = loookupNodes[i];
            var singleValueID = singleValue.getAttribute('LookupID');
            if (stIDs.length > 0)
                stIDs += ', ';
            stIDs += singleValueID;
            addedValues.push(singleValueID);
        }
        if (stIDs.length > 0) {
            if (lookupSettings.LookupList() != null) {
                var query = '[ID] IN (' + stIDs + ')';
                var thisObj = this;
                lookupUsers = lookupSettings.LookupList().GetItems(query, loadFields);
            }
        }

        //заполнение таблицы согласующих
        if (lookupUsers != null) {
            var userDic = new Array();
            for (var i = 0; i < lookupUsers.length; i++) {
                var lookupUser = lookupUsers[i];
                var userID = lookupUser["ID"];
                userDic[userID] = lookupUser;
            }

            //проверяем: есть ли в блоке запись с недобавлять ниже
            var lastAddingIndex = -1; //индекс, куда добавляем, если стоит настройка не добавлять Ниже
            for (var k = 0; k < blockObj.Users.length; k++) {
                var tmpUser = blockObj.Users[k];
                if (tmpUser.IsDeleted) continue;
                var denyAddSetting = WSSC_PBS_GetDenySetting(tmpUser.AgrSetting, tmpUser.MatrixPerson, "add");
                if (denyAddSetting == "Down") {
                    lastAddingIndex = k;
                    break;
                }
            }

            for (var i = 0; i < len; i++) {
                var userID = addedValues[i];
                var lookupUser = userDic[userID];
                if (lookupUser == null) continue;
                var userFIO = lookupUser.GetValue("Имя пользователя");
                var userPosition = lookupUser.GetValue("Должность");
                var translateUserFIO = null;
                var translateUserPosition = null;
                if(WKF_IsMultilangVersion && WSSC_PBS_LangCode != '')
                {
                    translateUserFIO = lookupUser.GetValue('Имя пользователя ' + WSSC_PBS_LangCode);
                    //if (translateUserFIO == null || translateUserFIO == '') translateUserFIO = userFIO;
                    translateUserPosition = lookupUser.GetValue('Должность ' + WSSC_PBS_LangCode);
                    //if (translateUserPosition == null || translateUserPosition == '') translateUserPosition = userPosition;
                }
                
                var userLogin = lookupUser.GetValue("Логин");
                //не добавляем пользователя, который уже есть в этом блоке
                if (blockObj.IsParallel && CheckIsUserProcessBlock(blockObj, userID) && lastAddingIndex < 0) continue;
                //не добавляем в конец последовательного блока, если он уже есть в этом блоке
                if (!blockObj.IsParallel && CheckLastUserInProcessBlock(blockObj, userID)) continue;

                var newUserObj = new UserClientLight(blockObj, userLogin, userFIO, userPosition, userID, translateUserFIO, translateUserPosition);

                //если не стоит настройка Не добавлять - Ниже
                if (lastAddingIndex >= 0) {
                    //смотрим: есть ли данные пользователи по краям от индекса
                    if (!blockObj.IsParallel) {
                        var prevUser = null;
                        for (var j = lastAddingIndex - 1; j >= 0; j--) {
                            if (blockObj.Users[j].IsDeleted) continue;
                            prevUser = blockObj.Users[j];
                            break;
                        }
                        var nextUser = blockObj.Users[lastAddingIndex];
                        
                        //совпадают ID предыдущего юзера и добавляемого
                        if (prevUser != null)
                            if (prevUser.UserID == userID) continue;
                        //совпадают ID следующего юзера и добавляемого
                        if (nextUser.UserID == userID) continue;
                        //для текущего параллельного блока делаем пользователя текущим
                        if(blockObj.IsCurrent && blockObj.IsParallel)
							nextUser.IsCurrent = true;
                    }

                    blockObj.Users.splice(lastAddingIndex, 0, newUserObj);
                    lastAddingIndex++;
                    continue;
                }

                var allUsersDeleted = true;
                var notAddTD = false;
                for (var k = 0; k < blockObj.Users.length; k++) {
                    var tmpUser = blockObj.Users[k];
                    if (!tmpUser.IsDeleted) allUsersDeleted = false;
                }
                var newTR = typeTR;
                if (!allUsersDeleted) newTR = mainTable.insertRow(newInd);
                else {
                    newInd--;
                    notAddTD = true;
                }
                //добавление объекта в модель
                var lastUserInd = blockObj.Users.length;
                blockObj.Users[lastUserInd] = newUserObj;
                
                WSSC_TBS_AddUserTR(newUserObj, newTR, notAddTD);
                newTR.BlockTR = typeTD.parentElement;
                newTR.UserObj = newUserObj;
                if (!notAddTD) {
                    typeTD.rowSpan += 1;
                    deleteBlockTD.rowSpan += 1;
                    typeTD.ParentCell.rowSpan += 1;
                    deleteBlockTD.ParentCell.rowSpan += 1;
                }
                newInd++;
            }

        }
        //если стоит настройка не добавлять ниже, то перерисовываем таблицу
        if (lastAddingIndex >= 0) 
        {
        	//изменение признака текущий согласующий для настройки не добавлять ниже
        	if (blockObj.IsCurrent && !blockObj.IsParallel && blockObj.Users.length > 0) 
        	{
        		var currentUserInd = 0;
        		for (var k = 0; k < blockObj.Users.length; k++) 
        		{
        			var tmpUser = blockObj.Users[k];
        			if (tmpUser.IsPassed) continue;
        			currentUserInd = k;
        			break;
        		}
        		var firstCurrentUser = blockObj.Users[currentUserInd];
        		if (!firstCurrentUser.IsCurrent) 
        		{
        			firstCurrentUser.IsCurrent = true;
        			for (var k = currentUserInd + 1; k < blockObj.Users.length; k++) 
        			{
        				var tmpUser = blockObj.Users[k];
        				if (tmpUser.IsCurrent) 
        				{
        					tmpUser.IsCurrent = false;
        					tmpUser.StartDate = "";
        				}
        			}
        		}

        	}
                
            var agrBlockObj = WSSC_PBS_PassingFormData;
            var mainTable = document.getElementById("WsscPbsMainTableID");
            //оставляем в таблице только 1 столбец
            while (mainTable.rows.length > 1)
                mainTable.firstChild.removeChild(mainTable.rows[1]);

            WSSC_PBS_DrawMainTable(agrBlockObj, mainTable);
        }
        WSSC_TBS_UpdateTooltipsForBlock(blockObj);
        //обработчики на изменения поля
        WSSC_PSB_SetIsChangedAgrBlock();
    }
}


function WSSC_PBS_ReturnLookupResultSingle(lookupResult, resultID) 
{
    if (lookupResult == null || resultID == null || resultID == '') return;
    var mainTable = window.document.getElementById('WsscPbsMainTableID');
    var userTR = mainTable.rows[resultID];
    var userObj = userTR.UserObj;
    var userItem = lookupResult;
    var userLogin = userItem.FieldValues["Логин"];
    var userFIO = userItem.ItemDisplayName;
    var userPosition = userItem.FieldValues["Должность"];
    var userID = userItem.ItemID;
    userObj.UserLogin = userLogin;
    userObj.UserFIO = userFIO;
    userObj.TranslateUserFIO = userFIO;
    userObj.UserID = userID;
    userObj.UserPosition = userPosition;
    userObj.TranslateUserPosition = userPosition;
    userObj.UserDelegate = false;
    userObj.ID = 0;
}

function CheckCannotBeEdited(userObj) {
    if (userObj == null) return false;
    //нельзя перемещать, если хотя бы один из перемещаемых объектов нередактируемый
    return WSSC_PBS_GetDenySetting(userObj.AgrSetting, userObj.MatrixPerson, "move");
}

function WSSC_PBS_MoveUpUserRecordInProcessBlock(paramObj, doNotCheckParam) {
    var doNotCheck = false;
    if (doNotCheckParam != null) doNotCheck = doNotCheckParam;

    var currentTR;
    var aTag;
    if (paramObj.tagName.toLowerCase() != "a") currentTR = paramObj;
    else aTag = paramObj;

    if (currentTR == null) currentTR = aTag.parentElement.parentElement;
  
    var rowIndex = currentTR.rowIndex;
    var previousRowIndex = rowIndex - 1;
    var mainTable = window.document.getElementById('WsscPbsMainTableID');
    var moveToTR = mainTable.rows[previousRowIndex];
    //if(moveToTR.UserObj.IsPassed) return;//если этап, который выше уже пройден, то не даем переместить

    //проверка на перемещаемые объекты
    if (previousRowIndex >= 0) {
        var tmpNewUserObj = mainTable.rows[previousRowIndex].UserObj;
        var tmpOldUserObj = mainTable.rows[rowIndex].UserObj;
        if (!doNotCheck) {
            //нельзя перемещать, если хотя бы один из перемещаемых объектов нередактируемый
            if (CheckCannotBeEdited(tmpNewUserObj) || CheckCannotBeEdited(tmpOldUserObj)) return;
            //нельзя перемещать выше
            if (tmpNewUserObj != null) {
                var tmpNotAddSetting = WSSC_PBS_GetDenySetting(tmpNewUserObj.AgrSetting, tmpNewUserObj.MatrixPerson, "add");

                if (tmpNotAddSetting == "Up" || tmpNotAddSetting == "UpAndDown")
                    return;
            }

            //нельзя перемещать ниже
            if (tmpOldUserObj != null) {
                var tmpNotAddSetting = WSSC_PBS_GetDenySetting(tmpOldUserObj.AgrSetting, tmpOldUserObj.MatrixPerson, "add");

                if (tmpNotAddSetting == "Down" || tmpNotAddSetting == "UpAndDown")
                    return;
            }
        }
    }


    if (previousRowIndex >= 0 && currentTR.BlockTR == moveToTR.BlockTR && !moveToTR.IsFirst) {
        var prevObj = mainTable.rows[previousRowIndex].UserObj;
        if (prevObj.IsPassed) return;


        mainTable.rows[rowIndex].parentNode.insertBefore(mainTable.rows[rowIndex], mainTable.rows[previousRowIndex]);
        var blockObj = currentTR.BlockTR.cells[1].BlockObj;
        if (blockObj == null) blockObj = currentTR.BlockTR.cells[0].BlockObj;
        var newUserObj = mainTable.rows[previousRowIndex].UserObj;
        var oldUserObj = mainTable.rows[rowIndex].UserObj;
        ChangeObjects(blockObj, newUserObj, oldUserObj);
        var isCurrentNewObj = newUserObj.IsCurrent;
        var isCurrentOldObj = oldUserObj.IsCurrent;
        newUserObj.IsCurrent = isCurrentOldObj;
        oldUserObj.IsCurrent = isCurrentNewObj;
        newUserObj.UserTR = currentTR;
        oldUserObj.UserTR = moveToTR;

        //меняем стили
        WSSC_PBS_ChangeStyles(newUserObj.UserTR, newUserObj);
        WSSC_PBS_ChangeStyles(oldUserObj.UserTR, oldUserObj);

        WSSC_TBS_UpdateTooltipsForBlock(blockObj);
        //установка признака перемещения текущего согласующего
        if (newUserObj.IsCurrent || oldUserObj.IsCurrent)
            WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = true;
        //обработчики на изменения поля
        WSSC_PSB_SetIsChangedAgrBlock();
    }

    //WSSC_PBS_SaveXmlInHidden();
    if (currentTR.BlockTR == moveToTR.BlockTR && moveToTR.IsFirst) {
        //копируем значения полей
        var oldUserObj = moveToTR.UserObj;
        if (oldUserObj.IsPassed) return;
        var oldGroupID = null;
        if (oldUserObj.AgrSetting != null) oldGroupID = oldUserObj.AgrSetting.GroupID;
        var oldRoleID = null;
        if (oldUserObj.AgrSetting != null) oldRoleID = oldUserObj.AgrSetting.RoleID;


        var newUserObj = currentTR.UserObj;
        var newGroupID = null;
        if (newUserObj.AgrSetting != null) newGroupID = newUserObj.AgrSetting.GroupID;
        var newRoleID = null;
        if (newUserObj.AgrSetting != null) newRoleID = newUserObj.AgrSetting.RoleID;
        //обновление данных
        WSSC_PBS_ChangeHtmlInTR(currentTR, moveToTR);
        WSSC_PBS_UpdateLinksTR(currentTR);
        WSSC_PBS_UpdateLinksTR(moveToTR);

        moveToTR.UserObj = newUserObj;
        currentTR.UserObj = oldUserObj;
        var blockObj = currentTR.BlockTR.cells[1].BlockObj;
        if (blockObj == null) blockObj = currentTR.BlockTR.cells[0].BlockObj;
        ChangeObjects(blockObj, newUserObj, oldUserObj);
        var isCurrentNewObj = newUserObj.IsCurrent;
        var isCurrentOldObj = oldUserObj.IsCurrent;
        newUserObj.IsCurrent = isCurrentOldObj;
        oldUserObj.IsCurrent = isCurrentNewObj;
        newUserObj.UserTR = moveToTR;
        oldUserObj.UserTR = currentTR;

        //меняем стили
        WSSC_PBS_ChangeStyles(newUserObj.UserTR, newUserObj);
        WSSC_PBS_ChangeStyles(oldUserObj.UserTR, oldUserObj);

        WSSC_TBS_UpdateTooltipsForBlock(blockObj);
        //установка признака перемещения текущего согласующего
        if (newUserObj.IsCurrent || oldUserObj.IsCurrent)
            WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = true;

        //обработчики на изменения поля
        WSSC_PSB_SetIsChangedAgrBlock();
    }
}

function WSSC_PBS_MoveDownUserRecordInProcessBlock(paramObj, doNotCheckParam) {
    var doNotCheck = false;
    if (doNotCheckParam != null) doNotCheck = doNotCheckParam;

    var currentTR;
    var aTag;
    if (paramObj.tagName.toLowerCase() != "a") currentTR = paramObj;
    else aTag = paramObj;

    if (currentTR == null) currentTR = aTag.parentElement.parentElement;
    
    var rowIndex = currentTR.rowIndex;
    var nextRowIndex = rowIndex + 1;
    var mainTable = window.document.getElementById('WsscPbsMainTableID');
    var moveToTR = mainTable.rows[nextRowIndex];
    if (moveToTR == null) return;

    if (nextRowIndex <= mainTable.rows.length) {
        var tmpNewUserObj = mainTable.rows[rowIndex].UserObj;
        var tmpNextUserObj = mainTable.rows[nextRowIndex].UserObj;

        if (!doNotCheck) {
            //нельзя перемещать, если хотя бы один из перемещаемых объектов нередактируемый
            if (CheckCannotBeEdited(tmpNewUserObj) || CheckCannotBeEdited(tmpNextUserObj)) return;
            //нельзя перемещать ниже
            if (tmpNextUserObj != null) {
                var tmpNotAddSetting = WSSC_PBS_GetDenySetting(tmpNextUserObj.AgrSetting, tmpNextUserObj.MatrixPerson, "add");
                if (tmpNotAddSetting == "Down" || tmpNotAddSetting == "UpAndDown")
                    return;
            }
            //не добавлять выше
            if (tmpNewUserObj != null) {
                var tmpNotAddSetting = WSSC_PBS_GetDenySetting(tmpNewUserObj.AgrSetting, tmpNewUserObj.MatrixPerson, "add");
                if (tmpNotAddSetting == "Up" || tmpNotAddSetting == "UpAndDown")
                    return;
            }
        }
    }

    if (currentTR.BlockTR == moveToTR.BlockTR && !currentTR.IsFirst) {
        if (nextRowIndex <= mainTable.rows.length) {

            mainTable.rows[rowIndex].parentNode.insertBefore(mainTable.rows[nextRowIndex], mainTable.rows[rowIndex]);
            var blockObj = currentTR.BlockTR.cells[1].BlockObj;
            if (blockObj == null) blockObj = currentTR.BlockTR.cells[0].BlockObj;
            var newUserObj = mainTable.rows[nextRowIndex].UserObj;
            var oldUserObj = mainTable.rows[rowIndex].UserObj;
            ChangeObjects(blockObj, newUserObj, oldUserObj);
            var isCurrentNewObj = newUserObj.IsCurrent;
            var isCurrentOldObj = oldUserObj.IsCurrent;
            newUserObj.IsCurrent = isCurrentOldObj;
            oldUserObj.IsCurrent = isCurrentNewObj;
            newUserObj.UserTR = currentTR;
            oldUserObj.UserTR = moveToTR;
            //меняем стили
            WSSC_PBS_ChangeStyles(newUserObj.UserTR, newUserObj);
            WSSC_PBS_ChangeStyles(oldUserObj.UserTR, oldUserObj);

            WSSC_TBS_UpdateTooltipsForBlock(blockObj);
            //установка признака перемещения текущего согласующего
            if (newUserObj.IsCurrent || oldUserObj.IsCurrent)
                WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = true;
            //обработчики на изменения поля
            WSSC_PSB_SetIsChangedAgrBlock();
        }
    }
    if (currentTR.BlockTR == moveToTR.BlockTR && currentTR.IsFirst) {
        //копируем значения полей
        var oldUserObj = currentTR.UserObj;
        var oldGroupID = null;
        if (oldUserObj.AgrSetting != null) oldGroupID = oldUserObj.AgrSetting.GroupID;
        var oldRoleID = null;
        if (oldUserObj.AgrSetting != null) oldRoleID = oldUserObj.AgrSetting.RoleID;


        var newUserObj = moveToTR.UserObj;
        var newGroupID = null;
        if (newUserObj.AgrSetting != null) newGroupID = newUserObj.AgrSetting.GroupID;
        var newRoleID = null;
        if (newUserObj.AgrSetting != null) newRoleID = newUserObj.AgrSetting.RoleID;

        //обновление данных
        WSSC_PBS_ChangeHtmlInTR(currentTR, moveToTR);

        WSSC_PBS_UpdateLinksTR(currentTR);
        WSSC_PBS_UpdateLinksTR(moveToTR);

        currentTR.UserObj = newUserObj;

        moveToTR.UserObj = oldUserObj;
        var blockObj = currentTR.BlockTR.cells[1].BlockObj;
        if (blockObj == null) blockObj = currentTR.BlockTR.cells[0].BlockObj;
        ChangeObjects(blockObj, newUserObj, oldUserObj);
        var isCurrentNewObj = newUserObj.IsCurrent;
        var isCurrentOldObj = oldUserObj.IsCurrent;
        newUserObj.IsCurrent = isCurrentOldObj;
        oldUserObj.IsCurrent = isCurrentNewObj;
        newUserObj.UserTR = currentTR;
        oldUserObj.UserTR = moveToTR;

        //меняем стили
        WSSC_PBS_ChangeStyles(newUserObj.UserTR, newUserObj);
        WSSC_PBS_ChangeStyles(oldUserObj.UserTR, oldUserObj);

        WSSC_TBS_UpdateTooltipsForBlock(blockObj);
        //установка признака перемещения текущего согласующего
        if (newUserObj.IsCurrent || oldUserObj.IsCurrent)
            WSSC_PBS_PassingFormData.IsChangeCurrentAgrPerson = true;
        //обработчики на изменения поля
        WSSC_PSB_SetIsChangedAgrBlock();
    }

}

function ChangeObjects(blockObj, newUserObj, oldUserObj) {
    var userCount = blockObj.Users.length;
    var newInd = 0;
    var oldInd = 0;
    for (var i = 0; i < userCount; i++) {
        if (blockObj.Users[i] == newUserObj) newInd = i;
        if (blockObj.Users[i] == oldUserObj) oldInd = i;
    }
    blockObj.Users[newInd] = oldUserObj;
    blockObj.Users[oldInd] = newUserObj;
}

function WKF_SetElemVal(elem, val)
{
    var setVal = val;
    if (setVal == null) setVal = '';
    if (SM.IsIE)
        elem.text = setVal;
    else
        elem.textContent = setVal;
}

function WSSC_PBS_SaveXmlInHidden() 
{
    var solutionFld = window.SLFieldInstance;
    var xmlDoc = window.SM.LoadXML("<ProcessPassageObject/>");
    if (WSSC_PBS_PassingFormData == null) return;
    var stagesList = WSSC_PBS_PassingFormData.Stages;
    var stagesElem = xmlDoc.createElement("Stages");
    xmlDoc.documentElement.appendChild(stagesElem);
    if (stagesList == null) return;
    for (var i = 0; i < stagesList.length; i++)
    {
        var stageObj = stagesList[i];
        var stageElem = xmlDoc.createElement("ProcessStage");
        stagesElem.appendChild(stageElem);

        var stageIDElem = xmlDoc.createElement("ID");
        stageElem.appendChild(stageIDElem);
        WKF_SetElemVal(stageIDElem, stageObj.ID);

        var idCounterElem = xmlDoc.createElement("IDCounter");
        stageElem.appendChild(idCounterElem);
        WKF_SetElemVal(idCounterElem, stageObj.IDCounter);

        var stageNameElem = xmlDoc.createElement("Name");
        stageElem.appendChild(stageNameElem);
        WKF_SetElemVal(stageNameElem, stageObj.Name);

        var dispNameInBlockElem = xmlDoc.createElement("DispNameInPassageBlock");
        stageElem.appendChild(dispNameInBlockElem);
        WKF_SetElemVal(dispNameInBlockElem, stageObj.DispNameInPassageBlock);

        var isCurrentElem = xmlDoc.createElement("IsCurrent");
        stageElem.appendChild(isCurrentElem);
        WKF_SetElemVal(isCurrentElem, stageObj.IsCurrent.toString().toLowerCase());


        var isPassedElem = xmlDoc.createElement("IsPassed");
        stageElem.appendChild(isPassedElem);
        WKF_SetElemVal(isPassedElem, stageObj.IsPassed.toString().toLowerCase());
        
        var processBlocks = stageObj.Blocks;
        var processBlocksElem = xmlDoc.createElement("ProcessBlocks");
        stageElem.appendChild(processBlocksElem);

        for (var j = 0; j < processBlocks.length; j++)
        {
            var blockObj = processBlocks[j];
            var processBlockElem = xmlDoc.createElement("ProcessBlock");
            processBlocksElem.appendChild(processBlockElem);

            var isParallelElem = xmlDoc.createElement("IsParallel");
            processBlockElem.appendChild(isParallelElem);
            WKF_SetElemVal(isParallelElem, blockObj.IsParallel.toString().toLowerCase());

            var isCurrentElem = xmlDoc.createElement("IsCurrent");
            processBlockElem.appendChild(isCurrentElem);
            WKF_SetElemVal(isCurrentElem, blockObj.IsCurrent.toString().toLowerCase());

            var isPassedElem = xmlDoc.createElement("IsPassed");
            processBlockElem.appendChild(isPassedElem);
            WKF_SetElemVal(isPassedElem, blockObj.IsPassed.toString().toLowerCase());

            var showAddUserLinkElem = xmlDoc.createElement("ShowAddUserLink");
            processBlockElem.appendChild(showAddUserLinkElem);
            WKF_SetElemVal(showAddUserLinkElem, blockObj.ShowAddUserLink.toString().toLowerCase());

            var blockNameElem = xmlDoc.createElement("BlockName");
            processBlockElem.appendChild(blockNameElem);
            WKF_SetElemVal(blockNameElem, blockObj.BlockName);

            var idElem = xmlDoc.createElement("ID");
            processBlockElem.appendChild(idElem);
            WKF_SetElemVal(idElem, blockObj.ID);

            var idCounterElem = xmlDoc.createElement("IDCounter");
            processBlockElem.appendChild(idCounterElem);
            WKF_SetElemVal(idCounterElem, blockObj.IDCounter);

            var processUsers = blockObj.Users;
            var processUsersElem = xmlDoc.createElement("ProcessUsers");
            processBlockElem.appendChild(processUsersElem);
            
            var settingIDElem = xmlDoc.createElement("SettingID");
            processBlockElem.appendChild(settingIDElem);
            var settingID = blockObj.SettingID;
            if (settingID == null || settingID == "") settingID = "0";
            WKF_SetElemVal(settingIDElem, settingID);

            for (var k = 0; k < processUsers.length; k++) {

                var userObj = processUsers[k];
                if (userObj.IsDeleted) continue;
                var processUserElem = xmlDoc.createElement("ProcessUser");
                processUsersElem.appendChild(processUserElem);

                var userLoginElem = xmlDoc.createElement("UserLogin");
                processUserElem.appendChild(userLoginElem);
                WKF_SetElemVal(userLoginElem, userObj.UserLogin);

                var userFIOElem = xmlDoc.createElement("UserFIO");
                processUserElem.appendChild(userFIOElem);
                WKF_SetElemVal(userFIOElem, userObj.UserFIO);

                var IDElem = xmlDoc.createElement("ID");
                processUserElem.appendChild(IDElem);
                if (userObj.ID == null || userObj.ID == "") userObj.ID = "0";
                WKF_SetElemVal(IDElem, userObj.ID);

                var userIDElem = xmlDoc.createElement("UserID");
                processUserElem.appendChild(userIDElem);
                if (userObj.UserID == null || userObj.UserID == "") userObj.UserID = "0";
                WKF_SetElemVal(userIDElem, userObj.UserID);

                var userPositionElem = xmlDoc.createElement("UserPosition");
                processUserElem.appendChild(userPositionElem);
                WKF_SetElemVal(userPositionElem, userObj.UserPosition);

                var factUserLoginElem = xmlDoc.createElement("FactUserLogin");
                processUserElem.appendChild(factUserLoginElem);
                WKF_SetElemVal(factUserLoginElem, userObj.FactUserLogin);

                var factUserFIOElem = xmlDoc.createElement("FactUserFIO");
                processUserElem.appendChild(factUserFIOElem);
                WKF_SetElemVal(factUserFIOElem, userObj.FactUserFIO);

                var factUserIDElem = xmlDoc.createElement("FactUserID");
                processUserElem.appendChild(factUserIDElem);
                if (userObj.FactUserID == null || userObj.FactUserID == "") userObj.FactUserID = "0";
                WKF_SetElemVal(factUserIDElem, userObj.FactUserID);

                var factUserPositionElem = xmlDoc.createElement("FactUserPosition");
                processUserElem.appendChild(factUserPositionElem);
                WKF_SetElemVal(factUserPositionElem, userObj.FactUserPosition);

                var solutionElem = xmlDoc.createElement("Solution");
                processUserElem.appendChild(solutionElem);
                WKF_SetElemVal(solutionElem, userObj.Solution);

                var solutionResultElem = xmlDoc.createElement("SolutionResult");
                processUserElem.appendChild(solutionResultElem);
                var solutionResult = userObj.SolutionResult;
                if (solutionResult.indexOf("SYS:") == 0) solutionResult = '';
                WKF_SetElemVal(solutionResultElem, solutionResult);

                var commentElem = xmlDoc.createElement("Comment");
                processUserElem.appendChild(commentElem);
                WKF_SetElemVal(commentElem, userObj.Comment);

                var allowDeleteElem = xmlDoc.createElement("AllowDelete");
                processUserElem.appendChild(allowDeleteElem);
                WKF_SetElemVal(allowDeleteElem, userObj.AllowDelete.toString().toLowerCase());

                var isCurrentElem = xmlDoc.createElement("IsCurrent");
                processUserElem.appendChild(isCurrentElem);
                WKF_SetElemVal(isCurrentElem, userObj.IsCurrent.toString().toLowerCase());

                var isPassedElem = xmlDoc.createElement("IsPassed");
                processUserElem.appendChild(isPassedElem);
                WKF_SetElemVal(isPassedElem, userObj.IsPassed.toString().toLowerCase());

                var settingIDElem = xmlDoc.createElement("SettingID");
                processUserElem.appendChild(settingIDElem);
                var settingID = userObj.SettingID;
                if (userObj.SettingID == null || userObj.SettingID == "") userObj.SettingID = "0";
                WKF_SetElemVal(settingIDElem, userObj.SettingID);

                var startDateElem = xmlDoc.createElement("StartDate");
                processUserElem.appendChild(startDateElem);
                if (userObj.StartDate == null || userObj.StartDate == "")
                    userObj.StartDate = "0001-01-01T00:00:00";
                WKF_SetElemVal(startDateElem, userObj.StartDate);

                var endDateElem = xmlDoc.createElement("EndDate");
                processUserElem.appendChild(endDateElem);
                if (userObj.EndDate == null || userObj.EndDate == "")
                    userObj.EndDate = "0001-01-01T00:00:00";
                WKF_SetElemVal(endDateElem, userObj.EndDate);

                var userDelegateElem = xmlDoc.createElement("UserDelegate");
                processUserElem.appendChild(userDelegateElem);
                WKF_SetElemVal(userDelegateElem, userObj.UserDelegate.toString().toLowerCase());

                //элементы матрицы согласования
                if (userObj.MatrixPerson != null) {
                    var matrixElem = xmlDoc.createElement("MatrixPerson");
                    processUserElem.appendChild(matrixElem);

                    var userIdElem = xmlDoc.createElement("UserID");
                    matrixElem.appendChild(userIdElem);
                    if (userObj.MatrixPerson.UserID != null)
                        WKF_SetElemVal(userIdElem, userObj.MatrixPerson.UserID);

                    var conditionElem = xmlDoc.createElement("Condition");
                    matrixElem.appendChild(conditionElem);
                    if (userObj.MatrixPerson.Condition != null)
                        WKF_SetElemVal(conditionElem, userObj.MatrixPerson.Condition);

                    var termForAgrStageElem = xmlDoc.createElement("TermForAgrStage");
                    matrixElem.appendChild(termForAgrStageElem);
                    if (userObj.MatrixPerson.TermForAgrStage != null)
                        WKF_SetElemVal(termForAgrStageElem, userObj.MatrixPerson.TermForAgrStage);

                    var docFieldNameElem = xmlDoc.createElement("DocFieldName");
                    matrixElem.appendChild(docFieldNameElem);
                    if (userObj.MatrixPerson.DocFieldName != null)
                        WKF_SetElemVal(docFieldNameElem, userObj.MatrixPerson.DocFieldName);

                    var setValuesElem = xmlDoc.createElement("SetValues");
                    matrixElem.appendChild(setValuesElem);
                    if (userObj.MatrixPerson.SetValues != null)
                        WKF_SetElemVal(setValuesElem, userObj.MatrixPerson.SetValues);

                    var roleIDElem = xmlDoc.createElement("RoleID");
                    matrixElem.appendChild(roleIDElem);
                    if (userObj.MatrixPerson.RoleID != null)
                        WKF_SetElemVal(roleIDElem, userObj.MatrixPerson.RoleID);

                    var denyDeleteElem = xmlDoc.createElement("DenyDelete");
                    matrixElem.appendChild(denyDeleteElem);
                    if (userObj.MatrixPerson.DenyDelete != null)
                        WKF_SetElemVal(denyDeleteElem, userObj.MatrixPerson.DenyDelete.toString().toLowerCase());

                    var denyMoveElem = xmlDoc.createElement("DenyMove");
                    matrixElem.appendChild(denyMoveElem);
                    if (userObj.MatrixPerson.DenyMove != null)
                        WKF_SetElemVal(denyMoveElem, userObj.MatrixPerson.DenyMove.toString().toLowerCase());

                    var denyAddElem = xmlDoc.createElement("DenyAdd");
                    matrixElem.appendChild(denyAddElem);
                    if (userObj.MatrixPerson.DenyAdd != null)
                        WKF_SetElemVal(denyAddElem, userObj.MatrixPerson.DenyAdd);

                    var controlTermElem = xmlDoc.createElement("ControlTerm");
                    matrixElem.appendChild(controlTermElem);
                    if (userObj.MatrixPerson.ControlTerm != null)
                        WKF_SetElemVal(controlTermElem, userObj.MatrixPerson.ControlTerm.toString().toLowerCase());

                    var matrixIDInfoElem = xmlDoc.createElement("MatrixIDInfo");
                    matrixElem.appendChild(matrixIDInfoElem);
                    if (userObj.MatrixPerson.MatrixIDInfo != null)
                    {
                        var tsItemIDElem = xmlDoc.createElement("TSItemID");
                        matrixIDInfoElem.appendChild(tsItemIDElem);
                        WKF_SetElemVal(tsItemIDElem, userObj.MatrixPerson.MatrixIDInfo.TSItemID.toString().toLowerCase());

                        var tsFieldIDElem = xmlDoc.createElement("TSFieldID");
                        matrixIDInfoElem.appendChild(tsFieldIDElem);
                        WKF_SetElemVal(tsFieldIDElem, userObj.MatrixPerson.MatrixIDInfo.TSFieldID.toString().toLowerCase());

                        var tsRowIDElem = xmlDoc.createElement("TSRowID");
                        matrixIDInfoElem.appendChild(tsRowIDElem);
                        WKF_SetElemVal(tsRowIDElem, userObj.MatrixPerson.MatrixIDInfo.TSRowID.toString().toLowerCase());
                    }

                  
                }
            }

        }
    }

    solutionFld.ResultInfo.ProcessObj = window.SM.PersistXML(xmlDoc);

}

//функция изменения url, добавление ID группы
function AddGroupIDToWindowUrl(openUrl) {
    var groupID = this.GroupID;
    var roleID = this.RoleID;
    var newUrl = openUrl;
    if (groupID != null && groupID != "" && groupID != "0")
        newUrl = newUrl + "&filterGroupID=" + groupID;
    if (roleID != null && roleID != "" && roleID != "0")
        newUrl = newUrl + "&requestRolesFilter=" + roleID;
    newUrl = newUrl + "&requestRolesWebUrl=" + WSSC_WebUrl;
    var td = this.ParentCell;
    var rowInd = td.parentElement.rowIndex;
    newUrl = newUrl + "&resultID=" + rowInd;
    return newUrl;
}


function WSSC_PBS_AddHandlers() {
    if (WSSC_PBS_FieldsForScript != '') {
        var fieldNames = WSSC_PBS_FieldsForScript.split(';');
        for (var i = 0; i < fieldNames.length; i++) {

            var fieldObj = ListForm.GetField(fieldNames[i]);
            if (fieldObj == null) continue;
            if (!fieldObj.IsSetLoadAgrPersonsHandler) {
                fieldObj.AddChangeHandler(WSSC_PBS_LoadAgrPersonsByCriteria);
                fieldObj.IsSetLoadAgrPersonsHandler = true;
            }
        }
        if (WSSC_PBS_UpdateMatrixFirstTime) WSSC_PBS_LoadAgrPersonsByCriteria();
    }
}

var WSSC_PBS_LoadObjectsCount = 0;
var WSSC_STOP_LoadMatrix = false;

function WSSC_PBS_UpdateMatrix(counter) 
{
    var solutionFld = window.SLFieldInstance;
    if (WSSC_STOP_LoadMatrix) return;

    //по переменной определяем для каких полей необходимо определить значения
    var resultFieldValues = '';
    if (WSSC_PBS_FieldsForScript != '') 
    {
        var fieldNames = WSSC_PBS_FieldsForScript.split(';');
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var fieldObj = window.ListForm.GetField(fieldName);
            if (fieldObj == null) continue;
            var value = solutionFld.GetFieldValue(fieldObj);
            if (fieldObj.Type == "DBFieldLookupSingle" && value != '' && value != null) value = value.LookupID;
            if (fieldObj.Type == "DBFieldLookupMulti" && value != '' && value != null) {
                var lookupVals = value;
                var ids = '';
                for (var k = 0; k < lookupVals.length; k++) {
                    if (k != 0) ids += ';';
                    ids += lookupVals[k].LookupID;
                }
                value = ids;
            }

            if (value == null) value = '';
            if (resultFieldValues != '') resultFieldValues += "_sp_";
            resultFieldValues += fieldName + "=" + value;

        }
    }
    var url = '/_layouts/WSS/WSSC.V4.DMS.Workflow/DMSMatrix/GetMatrixPersons.aspx?rnd=' + Math.random().toString();
    var params = 'webID=' + ListForm.WebID;
    params += '&listID=' + ListForm.ListID;
    params += '&itemID=' + ListForm.ItemID;
    params += '&fieldsValues=' + resultFieldValues;
    params = encodeURI(params);

    var ajax = window.SM.GetXmlRequest();
    ajax.open("POST", url, false);
    ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ajax.send(params);
    var response = ajax.responseText;

    //если было новое событие  на обработку матрицы, то игнорируем полученный результат и делаем запрос снова
    if (WSSC_PBS_LoadObjectsCount > counter) return;

    if (!window.SM.IsNE(response)) 
    {
        if (response.indexOf('Exception') != -1) 
        {
            window.alert(response);
        }
        if (response.indexOf('Error:') >= 0) 
        {
            WSSC_PBS_DefaultAgrSettingError = response.replace('Error:', '');
            if (window.WSSC_PBS_DefaultAgrSettingError != "" && window.WSSC_PBS_DefaultAgrSettingError != null) {
                if (WSSC_PBS_AgrPersonMode == "Editable")
                    alert(WSSC_PBS_DefaultAgrSettingError);
                WSSC_PBS_LoadAgrPersonsByCriteriaIsDisabled = false;
                return;
            }
        }
        //загружаем полученный xml в блок согласований
        var tmpXmlDoc = window.SM.LoadXML(response);
        var setFieldsNodes = tmpXmlDoc.selectSingleNode("ProcessPassageObject/setFields");
        if (setFieldsNodes != null) 
        {
            WSSC_STOP_LoadMatrix = true;
            solutionFld.SetClientFieldValues(window.SM.PersistXML(setFieldsNodes));
            tmpXmlDoc.firstChild.removeChild(setFieldsNodes);
            WSSC_STOP_LoadMatrix = false;
        }
        window.xiPassingDataID = window.SM.PersistXML(tmpXmlDoc);

        //прописываем в хидден
        var divAcceptDataObj = document.getElementById("processDiv");
        if (divAcceptDataObj != null) 
        {
            var xmlPassageBlockHdn = divAcceptDataObj.children[1];
            xmlPassageBlockHdn.value = response;
        }
        //удаляем старую таблицу
        var oldTable = document.getElementById('WsscPbsMainTableID');
        var processDiv = document.getElementById('processDiv');
        if (oldTable != null)
            processDiv.removeChild(oldTable);
        //вызываем функцию для обновления блока согласования
        WSSC_PBS_Init('xiPassingDispSettingsID', 'processDiv');
    }

    //обработчики на изменения поля
    WSSC_PSB_SetIsChangedAgrBlock();
}

//функция для обработки кнопки "Загрузить согласующих по умолчанию"
function WSSC_PBS_LoadAgrPersonsByCriteria() {
    WSSC_PBS_LoadObjectsCount++;
    WSSC_PBS_UpdateMatrix(WSSC_PBS_LoadObjectsCount);

}

//кастом-функция для обработки кнопки "Загрузить согласующих по умолчанию"
function WSSC_PBS_CustomLoadAgrPersonsByCriteria(processBlockXml) 
{
    //загружаем полученный xml в блок согласований
    var xmlDoc = window.SM.LoadXML(processBlockXml);

    //прописываем в хидден
    var divAcceptDataObj = document.getElementById("processDiv");
    if (divAcceptDataObj != null) 
    {
        var xmlPassageBlockHdn = divAcceptDataObj.children[1];
        xmlPassageBlockHdn.value = processBlockXml;
    }
    //удаляем старую таблицу
    var oldTable = document.getElementById('WsscPbsMainTableID');
    var processDiv = document.getElementById('processDiv');
    if (oldTable != null)
        processDiv.removeChild(oldTable);
    //вызываем функцию для обновления блока согласования
    WSSC_PBS_Init('xiPassingDispSettingsID', 'processDiv');
    //обработчики на изменения поля
    WSSC_PSB_SetIsChangedAgrBlock();
}

function WSSC_PBS_GetAgrDate(dateStr) {
    var partsByT = dateStr.split('T');
    if (partsByT.length != 2) partsByT = dateStr.split(' ');;
    if (partsByT.length != 2) return '';
    var dateStr = '';
    if(partsByT[0].indexOf('-') >= 0)
    {
        var dateParts = partsByT[0].split('-');
        dateStr = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0];
    }
    if(partsByT[0].indexOf('.')>=0)
    {
        var dateStr = partsByT[0];
    }
    var timeParts = partsByT[1].split(':');
    if (timeParts.length < 3) return '';

    var agrDate = dateStr + ' ' + timeParts[0] + ':' + timeParts[1];
    return agrDate;
}

//установка признака изменения поля блока согласования и вызов обработчика на изменение блока
function WSSC_PSB_SetIsChangedAgrBlock() {
    if (window.AgreementBlockInstance != null) {
        window.AgreementBlockInstance.IsChanged();
        if (window.AgreementBlockInstance.ListFormField != null)
            window.AgreementBlockInstance.ListFormField.OnChange();
    }
}

Array.prototype.insert = function (index, item) {   this.splice(index, 0, item); }; 

//добавление нового блока в процесс согласования
function WSSC_PBS_AddBlockInAgrBlock(blockType) 
{
    var agrBlockObj = WSSC_PBS_PassingFormData;
    if (agrBlockObj == null) return; //объект пустой
    if (agrBlockObj.Stages == null) return; //в объекте нет этапов
    var stageObj = agrBlockObj.Stages[0];
    if (stageObj.Blocks == null) return; //в объекте нет ни одного блока
    //if (stageObj.Blocks.length == 0) return;

    //определяем индекс блока куда нужно вставить новый блок, если стоит запрет на добавление подблоков ниже
    var notAddSubblocksLower = false;
    var currentBlockIndex = -1;
    var insertBlockIndex = -1;
    var blockIndexSet = false;
    //определяем самый первый блок с настройкой "Не добавлять подблоки ниже"
    for(var i=0; i<stageObj.Blocks.length; i++)
    {
        var tmpBlock = stageObj.Blocks[i];
        //настройка задана в самом блоке
        if(tmpBlock.AgrSetting == null) continue;
        if(tmpBlock.AgrSetting.NotAddSubblocksLower)
        {
            notAddSubblocksLower = true;
            insertBlockIndex = i;
            blockIndexSet = true;
            break;
        }
    }
    //отпределяем индекс текущего блока
    for (var i = 0; i < stageObj.Blocks.length; i++)
    {
        var tmpBlock = stageObj.Blocks[i];
        //настройка задана в самом блоке
        if (tmpBlock.IsCurrent)
        {
            currentBlockIndex = i;
            break;
        }
    }

    //стоит опция не добавлять подблоки ниже
    if (notAddSubblocksLower)
    {
        if (currentBlockIndex >= 0 && insertBlockIndex <= currentBlockIndex)
        {
            insertBlockIndex = -1;
            blockIndexSet = false;
        }
    }
  
    
    var blockXmlNode = null;
    var tmpXmlDoc;

    if (blockType)
        tmpXmlDoc = window.SM.LoadXML(WSSC_PBS_EmptyParallelBlock);
    else
        tmpXmlDoc = window.SM.LoadXML(WSSC_PBS_EmptyCommonBlock);

    blockXmlNode = tmpXmlDoc.selectSingleNode("ProcessBlocks/ProcessBlock");

    var mainTable = document.getElementById("WsscPbsMainTableID");

    var rowSpanForStage = 0;

    var blockObj = new BlockClient(blockXmlNode, stageObj);
    
    //если установлен признак запрета добавления подблока снизу, то всталяем блок в объект и рисуем таблицу
    if(notAddSubblocksLower || stageObj.Blocks.length == 0)
    {
        if (notAddSubblocksLower && (!blockIndexSet || insertBlockIndex >= stageObj.Blocks.length))
        {
            alert(window.TN.Translate('Невозможно добавить блок согласования, так как установлен запрет на добавление блоков ниже.'));
            return;
        }
        
        //если блок только один, то делаем его текущим
        if(stageObj.IsCurrent && stageObj.Blocks.length  == 0)
            blockObj.IsCurrent = true;
        
        //добавляем новый подблок в блок согласования
        stageObj.Blocks.insert(insertBlockIndex, blockObj);

        //удаляем старую таблицу и рисум ее
        var oldTable = document.getElementById('WsscPbsMainTableID');
        var processDiv = document.getElementById('processDiv');
        if (oldTable != null)
            processDiv.removeChild(oldTable);
        
        var mainTable = window.document.createElement('table');
        WSSC_PBS_DrawTblHeaders(mainTable);
        //рисуем таблицу по этапам и блокам
        WSSC_PBS_DrawMainTable(agrBlockObj, mainTable);
        agrBlockObj.DivFormContainer.appendChild(mainTable);
        WSSC_PBS_SetWidthTypeColumn(mainTable, false);
        
        return;
    }
    
    var stageTR = mainTable.insertRow(mainTable.rows.length);

    //если все предыдущие блоки пройдены, то следующим делаем текущим блоком
    if (stageObj.IsCurrent) 
    {
        //смотрим пройден ли самый последний блок в процессе согласования
        if (stageObj.Blocks != null && stageObj.Blocks.length > 0) 
        {
            var lastBlock = stageObj.Blocks[stageObj.Blocks.length - 1];
            if (lastBlock.IsPassed) blockObj.IsCurrent = true;
        }

    }
    stageObj.Blocks.push(blockObj);

    var rowSpanForBlock = 0;
    
    var stageTD = mainTable.rows[1].cells[0];

    //учейка для удаления подблока в блоке согласования
    var blockDeleteTD = stageTR.insertCell(stageTR.cells.length);
    blockDeleteTD.innerHTML = "<img border='0' onclick='WSSC_PBS_DeleteBlockFunc(this);return false;' style='cursor: pointer; display:block' />";
    blockDeleteTD.BlockObj = blockObj;
    blockDeleteTD.className = "wssc-PPB-TableCell";
    var blockDeleteImg = blockDeleteTD.children[0];
    blockDeleteTD.ParentCell = stageTD;
    var blockInfo = WSSC_PBS_GetDeleteBlockType(blockObj);
    if(blockInfo.Tooltip != null && blockInfo.Tooltip != "")
    blockDeleteImg.title = blockInfo.Tooltip;
    if(blockInfo.Mode == "Hide")
        blockDeleteTD.style.display = "none";
    if(blockInfo.Mode == "Display")
    {
        blockDeleteImg.src = '/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/del.gif';
    }
    else
        if(blockInfo.Mode == "Disable")
        {
            blockDeleteImg.src = '/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/del_disable.gif';
            blockDeleteImg.onclick = null;
        }
        
    //ячейка "Вид"
    var typeTD = stageTR.insertCell(stageTR.cells.length);
    typeTD.className = "wssc-PPB-TableCell";
    typeTD.style.verticalAlign = 'top';

    typeTD.style.width = "1%";
    if (WSSC_PBS_DrawLinkInUsersBlock) typeTD.style.display = "none";

    typeTD.BlockObj = blockObj;
    typeTD.ParentCell = stageTD;

    if (!WSSC_PBS_DispSettings.ShowAgrType) typeTD.style.display = "none";
    else 
    {
        var typeTable = window.document.createElement('table');
        typeTable.cellPadding = 0;
        typeTable.cellSpacing = 0;
        //typeTable.style.width = "100%";
        typeTD.appendChild(typeTable);
        var blockTitleTr = typeTable.insertRow(typeTable.rows.length);
        var textTD = blockTitleTr.insertCell(blockTitleTr.cells.length);
        if (blockObj.IsCurrent) textTD.className = "wssc-PPB-block-text-current";
        else textTD.className = "wssc-PPB-block-text";

        var linkTD = blockTitleTr.insertCell(blockTitleTr.cells.length);
        if (blockObj.IsCurrent) linkTD.className = "wssc-PPB-add-user-link-current";
        else linkTD.className = "wssc-PPB-add-user-link";

        linkTD.BlockObj = blockObj;
        linkTD.ParentCell = typeTD;

        //название типа согласования
        var blockName = blockObj.BlockName;
        if(WKF_IsMultilangVersion)
            blockName = blockObj.TranslateBlockName;
        
        if (blockName != null && blockName != "") 
            $(textTD).text(blockName);

        var isLastDoNotAddLower = false;

        //в блоке стоит настройка "Добавить сотрудника" и не стоит признак "Не добавлять ниже"
        //блок не пройден или пользователь может редактировать блок на данном этапе
        if (WSSC_PBS_DispSettings.ShowAddUserlink && !isLastDoNotAddLower &&
            (!blockObj.IsPassed || WSSC_PBS_CanUserEditPassageBlock && stageObj.IsPassed)) //&& j == (stageObj.Blocks.length - 1)
        {
            if (blockObj.IsPassed) linkTD.className = "wssc-PPB-add-user-link-passed";
            if (WKF_IsNewDesign)
            {
                linkTD.className = 'wkf_pbs_img_add_users';
                linkTD.innerHTML = "<img src='/_LAYOUTS/WSS/WSSC.V4.DMS.Workflow/Images/add_user.gif' style='cursor: pointer' />";
            }
            else
                linkTD.innerHTML = "<a href='#' class='wssc-PPB-link' >" + WSSC_PBS_DispSettings.AddUserlink + "</a>";
            linkTD.children[0].onclick = WSSC_PBS_AddUserInRouteBlock_Img;
            if (!WSSC_PBS_CanUserEditPassageBlock) linkTD.style.display = "none";
        }


        //(ошибка с первой пустой строкой) проверка на то есть ли ли пользователь в блоке
        if (!WSSC_PBS_DispSettings.ShowStageTitle && WSSC_PBS_DrawLinkInUsersBlock) 
        {
            stageTR.style.display = "none";
        }
        //формируем псевдо ячейку, если удалены все пользователи
        if (blockObj.Users.length == 0) 
        {
            rowSpanForStage++;
            rowSpanForBlock++;
            tmpUserObj = new UserClientLight(blockObj, "", "", "", "0");
            WSSC_TBS_AddUserTR(tmpUserObj, stageTR);
            stageTR.IsFirst = true;
            var lastCell = stageTR.cells.length - 1;
            stageTR.cells[lastCell].innerHTML = "&nbsp;";

        }
        //if (WSSC_PBS_DrawLinkInUsersBlock && !stageObj.IsPassed && WSSC_PBS_CanUserEditPassageBlock) 
        if (WSSC_PBS_DrawLinkInUsersBlock && WSSC_PBS_DispSettings.ShowAddUserlink && !isLastDoNotAddLower &&
         WSSC_PBS_CanUserEditPassageBlock && (!blockObj.IsPassed || stageObj.IsPassed)) 
         {
            WSSC_PBS_AddUserLinkTR(mainTable, blockObj, typeTD);
            rowSpanForBlock = rowSpanForBlock + 1;
            rowSpanForStage = rowSpanForStage + 1;
        }
        if (rowSpanForBlock > 0) 
        {
            typeTD.rowSpan = rowSpanForBlock;
            blockDeleteTD.rowSpan = rowSpanForBlock;
        }

        if (rowSpanForStage > 0) 
        {
            stageTD.rowSpan = stageTD.rowSpan + 1;
        }

        //обновляем tooltip в блоке
        WSSC_TBS_UpdateTooltipsForBlock(blockObj);

    }
    WSSC_PBS_SetWidthTypeColumn(mainTable, false);
}

//функция для определения параметров запрета удаления, перемещения и добавления
function WSSC_PBS_GetDenySetting(agrSetting, matrixPerson, settingType) {
    switch (settingType) {
        case "delete":
            {
                if (agrSetting != null)
                    if (agrSetting.CannotBeDeleted) return true; //стоит запрет на удаление всего блока
                if (matrixPerson != null)
                    if (matrixPerson.DenyDelete) return true; //стоит запрет на удаление конкретного сотрудника
                return false;
            }
        case "move":
            {
                if (agrSetting != null)
                    if (agrSetting.CannotBeEdited) return true; //стоит запрет на перемещение всего блока
                if (matrixPerson != null)
                    if (matrixPerson.DenyMove) return true; //стоит запрет на перемещение конкретного сотрудника
                return false;
            }
        case "add":
            {
                if (agrSetting != null) {
                    if (agrSetting.NotAddOption == "UpAndDown") return "UpAndDown";
                    if (matrixPerson != null) {
                        switch (matrixPerson.DenyAdd) {
                            case "UpAndDown": return "UpAndDown";
                            case "Up":
                                if (agrSetting.NotAddOption == "Down") return "UpAndDown";
                                else return "Up";
                            case "Down":
                                if (agrSetting.NotAddOption == "Up") return "UpAndDown";
                                else return "Down";
                            case "":
                                if (agrSetting.NotAddOption == "No") return null;
                                else return agrSetting.NotAddOption;
                        }
                    }
                    else {
                        if (agrSetting.NotAddOption == "No") return null;
                        else return agrSetting.NotAddOption;
                    }
                }
                else {
                    if (matrixPerson != null)
                        return matrixPerson.DenyAdd;
                }
                return null;
            }
            return null;
    }
}

function WSSC_PBS_ChangeStyles(userTR, userObj) {

    var startInd = 0;
    if (userTR.cells.length == 10) startInd = 2;
    if (userTR.cells.length == 11) startInd = 3;

    var className = "wssc-PPB-TableCell";
    if (userObj.IsPassed)
        className = "wssc-PPB-TableCell-passed";
    else
        if (userObj.IsCurrent)
        className = "wssc-PPB-TableCell-current";

    //ячейка с ролью/должностью
    var roleTD = userTR.cells[startInd];
    roleTD.className = className;

    //ячейка "Сотрудник"
    var userTD = userTR.cells[startInd + 1];
    userTD.className = className;
    //ячейка "Дата получения"
    var agrStartDateTD = userTR.cells[startInd + 2];
    agrStartDateTD.className = className;
    //ячейка "Дата согласования"
    var agrEndDateTD = userTR.cells[startInd + 3];
    agrEndDateTD.className = className;
    //ячейка "Факт. согласующий"
    var factUserTD = userTR.cells[startInd + 4];
    factUserTD.className = className;
    //ячейка "Результат согласования"
    var solutionResultTD = userTR.cells[startInd + 5];
    solutionResultTD.className = className;
    //ячейка "Комментарий"
    var agrCommentTD = userTR.cells[startInd + 6];
    agrCommentTD.className = className;
    //ячейка "Действия"
    var actionsTD = userTR.cells[startInd + 7];
    actionsTD.className = className;
}

function WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd, move_startInd) 
{
    var oldTD = currentTR.cells[current_startInd];
    var newTD = moveTR.cells[move_startInd];

    var oldTD_Html = currentTR.cells[current_startInd].innerHTML;
    var newTD_Html = moveTR.cells[move_startInd].innerHTML;

    oldTD.innerHTML = newTD_Html;
    newTD.innerHTML = oldTD_Html;
}

function WSSC_PBS_ChangeHtmlInTR(currentTR, moveTR) 
{

    var current_startInd = 0;
    if (currentTR.cells.length == 10) current_startInd = 2;
    if (currentTR.cells.length == 11) current_startInd = 3;

    var move_startInd = 0;
    if (moveTR.cells.length == 10) move_startInd = 2;
    if (moveTR.cells.length == 11) move_startInd = 3;

    //ячейка с ролью/должностью
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd, move_startInd);

    //ячейка "Сотрудник"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 1, move_startInd + 1);

    //ячейка "Дата получения"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 2, move_startInd + 2);

    //ячейка "Дата согласования"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 3, move_startInd + 3);

    //ячейка "Факт. согласующий"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 4, move_startInd + 4);

    //ячейка "Результат согласования"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 5, move_startInd + 5);

    //ячейка "Комментарий"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 6, move_startInd + 6);

    //ячейка "Действия"
    WSSC_PBS_ChangeHtml(currentTR, moveTR, current_startInd + 7, move_startInd + 7);

}

function WKF_PBS_Dispose()
{
    WKF_DisposeObj(WSSC_PBS_DispSettings); //глобальная переменная с настройками отображения
    
    //очистка основного блока согласования
    if(WSSC_PBS_PassingFormData != null)
    {
        //очистка этапов
        for(var i = 0;  i<WSSC_PBS_PassingFormData.Stages.length; i++)
        {
            var stageObj = WSSC_PBS_PassingFormData.Stages[i];
            //очистка блоков
            if (stageObj.Blocks == null) continue;
            if (stageObj.Blocks.length == 0) continue;
            
            for(var j=0; j<stageObj.Blocks.length; j++)
            {
                var blockObj = stageObj.Blocks[j];
                //очистка объектов пользователей
                if (blockObj.Users == null) continue;
                if (blockObj.Users.length == 0) continue;
                
                for(var k=0; k<blockObj.Users.length; k++)
                {
                    var userObj = blockObj.Users[k];
                    if (userObj == null) continue;
                    WKF_DisposeObj(userObj.AgrSetting);
                    WKF_DisposeObj(userObj.MatrixPerson);
                    WKF_DisposeObj(userObj);
                }
                WKF_DisposeObj(blockObj);
            }
            WKF_DisposeObj(stageObj);
        }
    }
    WKF_DisposeObj(WSSC_PBS_PassingFormData);//глобальная переменная с данными объекта процесса прохождения
    WSSC_PBS_AddCommonBlockProcessObjectLink = null;
    WSSC_PBS_AddParallelBlockProcessObjectLink = null;
}

function WSSC_PBS_DeleteBlockFunc(srcImg)
{
    if (!window.confirm(window.TN.Translate("Вы действительно хотите удалить данный блок согласования?"))) return;

    if(srcImg == null) return;
    var deleteBlockTD = srcImg.parentElement;
    if(deleteBlockTD != null)
    {
        if(deleteBlockTD.BlockObj == null) return;
        var blockObj = deleteBlockTD.BlockObj;
        var stageObj = blockObj.Stage;
        //нет блоков, пропускаем
        if(stageObj.Blocks == null) return;
        if(stageObj.Blocks.length == 0) return;
        blockObj.IsDeleted = true;
        var currentBlockWasDel = blockObj.IsCurrent;

        var newBlocksArray = new Array();
        for(var i=0; i<stageObj.Blocks.length; i++)
        {
            var tmpBlock = stageObj.Blocks[i];
            if(tmpBlock.IsDeleted) continue;
            newBlocksArray.push(tmpBlock);
        }
        stageObj.Blocks = newBlocksArray;
        
        if(stageObj.IsCurrent && currentBlockWasDel)
        {
            //смотрим по блокам, если были пройденный блоки, а затем идут новые, то делаем текущим следующий блок
            var setCurrent = false;
            for(var i=0; i<stageObj.Blocks.length; i++)
            {
                var tmpBlock = stageObj.Blocks[i]; 
                if(!tmpBlock.IsCurrent && !tmpBlock.IsPassed)
                {
                    tmpBlock.IsCurrent = true;
                    if(tmpBlock.Users == null) return;
                    for(var i=0; i < tmpBlock.Users.length ; i++)
                    {
                        var tmpUser = tmpBlock.Users[i];
                        if(tmpUser.IsDeleted) continue;
                        tmpUser.IsCurrent = true;
                        if(!tmpBlock.IsParallel) break;
                    }
                    break;
                }
            }
            //простановка признака, что был удален текущий блок
            if(currentBlockWasDel)
            {
                window.SLFieldInstance.ResultInfo.IsCurrentAgrBlockWasDeleted = true;
            }
        }
        
        //удаляем старую таблицу и рисум ее
        var agrBlockObj = WSSC_PBS_PassingFormData;

        var oldTable = document.getElementById('WsscPbsMainTableID');
        var processDiv = document.getElementById('processDiv');
        if (oldTable != null)
            processDiv.removeChild(oldTable);
        
        var mainTable = window.document.createElement('table');
        WSSC_PBS_DrawTblHeaders(mainTable);
        //рисуем таблицу по этапам и блокам
        WSSC_PBS_DrawMainTable(agrBlockObj, mainTable);
        agrBlockObj.DivFormContainer.appendChild(mainTable);
        WSSC_PBS_SetWidthTypeColumn(mainTable, false);
        
    }

    //функция, срабатывающая при изменении блока согласования
    WSSC_PSB_SetIsChangedAgrBlock();
}

//функция определяющая выводить ли крестик для удаления блока
function WSSC_PBS_GetDeleteBlockType(blockObj)
{
     var blockInfo = new Object();
     
     //если нет прав на редактирование или это старый дизайн, то не рисуем ячейку
     if (!WKF_IsNewDesign || !WSSC_PBS_CanUserEditPassageBlock) 
     {
        blockInfo.Mode = "Hide";
        blockInfo.Tooltip = "";
        return blockInfo;
     }
     
     if(blockObj == null) 
     {
        blockInfo.Mode = "Display";
        blockInfo.Tooltip = WSSC_PBS_DeleteBlock;
        return blockInfo;
     }
     
     //если нет ссылок "Добавить последовательный/параллельный блок", то и удалить его нельзя
     if (WSSC_PBS_HideAddDeleteBlockLinks)
     {
         blockInfo.Mode = "Disable";
         blockInfo.Tooltip = WSSC_PBS_DisableDeleteBlock_AgrSetting_Matrix;
         return blockInfo;
     }
    
     //блок пройден, этап не пройден
     if(blockObj.IsPassed && !blockObj.Stage.IsPassed) 
     {
        blockInfo.Mode = "Disable";
        blockInfo.Tooltip = WSSC_PBS_DisableDeleteBlock;
        return blockInfo;
      }
     
     if(blockObj.AgrSetting != null)
     {
		if(blockObj.AgrSetting.CannotBeDeletedBlock)
		{
			 blockInfo.Mode = "Disable";
			 blockInfo.Tooltip = WSSC_PBS_DisableDeleteBlock_AgrSetting_Matrix;
			 return blockInfo;
		}
     }
     
     if(blockObj.Users != null)
     {
        if(blockObj.Users.length > 0)
        {
           
            var nonDeleteUser = false;

            for (var p = 0; p < blockObj.Users.length; p++)
            {
                var tmpUser = blockObj.Users[p];
                //Запрет удаления через матрицу
                if (tmpUser.MatrixPerson != null) {
                    if (tmpUser.MatrixPerson.DenyDelete) nonDeleteUser = true;
                }
                //Запрет удаления через настройки процессов
                if (tmpUser.AgrSetting != null) {
                    if (tmpUser.AgrSetting.CannotBeDeleted) nonDeleteUser = true;
                }
                //Запрет удаления в ProcessUser
                if (tmpUser.CannotBeDeleted != null) {
                    if (tmpUser.CannotBeDeleted) nonDeleteUser = true;
                }


                if (nonDeleteUser)
                {
                    blockInfo.Mode = "Disable";
                    blockInfo.Tooltip = WSSC_PBS_DisableDeleteBlock_Matrix;
                    return blockInfo;
                }

                if (tmpUser.IsPassed)
                {
                    blockInfo.Mode = "Disable";
                    blockInfo.Tooltip = WSSC_PBS_DisableDeleteBlock_AgrBlockPassed;
                    return blockInfo;
                }
            }

          
        }
     }
     blockInfo.Mode = "Display";
     blockInfo.Tooltip = WSSC_PBS_DeleteBlock;
     return blockInfo;
}