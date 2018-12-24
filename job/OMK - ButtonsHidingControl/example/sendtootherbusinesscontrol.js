var WSSC_Nomenclature_List_Col_SendToOtherBusiness = "Направлен в дело";
var WSSC_Nomenclature_Solution_Col_SendToOtherBusiness = "Направить документ в другое дело";

function WSSC_Nomenclature_STOB_Init() 
{
    //обработчик на поле "Решение"
	var solutionFld = SLFieldInstance;
	SLFieldInstance.ListFormField.AddChangeHandler(WSSC_Nomenclature_STOB_AddChangeHandler);
	WSSC_Nomenclature_STOB_AddChangeHandler();
    //обработчик на сохранение формы
	ListForm.AddSaveHandler(WSSC_Nomenclature_STOB_SaveHandler);
    //обработчик на поле "Направлен в дело"
	var moveOtherBusinessFld = ListForm.GetField(WSSC_Nomenclature_List_Col_SendToOtherBusiness);
	if (moveOtherBusinessFld != null)
	{
	    moveOtherBusinessFld.AddChangeHandler(WSSC_Nomenclature_STOB_MoveToOtherBusinessHandler);
	}
}

//Обработчик на поле "Решение"
function WSSC_Nomenclature_STOB_AddChangeHandler() 
{
    var field = ListForm.GetField(WSSC_Nomenclature_List_Col_SendToOtherBusiness);
    if (field == null) return;
    var solution = SLFieldInstance.SelectedSolutionName;
    if(field.Disabled || field.NCT_DisableSet)
    {
		if(solution == WSSC_Nomenclature_Solution_Col_SendToOtherBusiness)
		{
			field.Enable();
			field.NCT_DisableSet = true;
		}
		else
		{
			if(field.NCT_DisableSet)
				field.Disable();
		}
	}
}

//обработчик на сохранение формы
//проверка: если сначала было выбрано решение "Направить документ в другое дело", а потом выбрано другое решение, 
//то можно изменить дело без принятия решения
function WSSC_Nomenclature_STOB_SaveHandler(saveEventsArgs)
{
    var field = ListForm.GetField(WSSC_Nomenclature_List_Col_SendToOtherBusiness);
    if (field == null) return;
    var solution = SLFieldInstance.SelectedSolutionName;

    if (field.NCT_DisableSet && field.ManualChanged && solution != WSSC_Nomenclature_Solution_Col_SendToOtherBusiness)
    {
        saveEventsArgs.CommonAlertMessage = "Вы изменили поле '" + WSSC_Nomenclature_List_Col_SendToOtherBusiness + 
            "', требуется выбрать решение '" + WSSC_Nomenclature_Solution_Col_SendToOtherBusiness + "'";
        saveEventsArgs.CanSave = false;
    }
}

//отмечаем, что поле "Направлен в другое дело был изменен"
function WSSC_Nomenclature_STOB_MoveToOtherBusinessHandler()
{
    var field = ListForm.GetField(WSSC_Nomenclature_List_Col_SendToOtherBusiness);
    if (field == null) return;

    field.ManualChanged = true;
}