function SLFConsts() {
    //константы для решений
    this.SolutionsConsts = new Object();
    this.SolutionsConsts.DefaultText = WKF_Solution_DefaultText; //'(Выберите решение)';
    this.SolutionsConsts.NoSolutionsText = WKF_NoSolutionst;//'(нет доступных решений)';

    this.SolutionsConsts.FieldName = 'Решения';
    this.TitleFieldName = 'Регистрационный номер';

    //поля решения
    this.SolutionsConsts.Name = 'Name';
    this.SolutionsConsts.DisplayName = 'DisplayName';
    this.SolutionsConsts.CommentRequired = 'CommentRequired';
    this.SolutionsConsts.AlertCondition = 'AlertCondition'; //Условия предупреждения
    this.SolutionsConsts.AlertText = 'AlertText'; //Текст предупреждения
    this.SolutionsConsts.SetValuesInCardOnClient = 'SetClientValueInFields'; //Установить значения в полях (на клиенте)
    this.SolutionsConsts.ShowNotifyBlock = 'ShowNotifyBlock'; //Показать поле выбора
    this.SolutionsConsts.TextSelectElements = 'TextSelectElements'; //Текст для выбора элементов
    this.SolutionsConsts.ShowRemarksBlock = 'ShowRemarksBlock'; //Выводить блок Согласовать с замечаниями
    this.SolutionsConsts.SendToStage = 'Stage_For_Script'; //Переводит на этап
    this.SolutionsConsts.SendToNextStage = 'SendToNextStage'; //Переводит на следующий этап
    this.SolutionsConsts.SendToNStage = 'SendToNStage'; //Переводит на N этапов
    this.SolutionsConsts.HiddenSolution = 'HiddenSolution'; //Скрытое решение
    //this.SolutionsConsts.CommonSolution = 'CommonSolution'; //Обобщенное решение
    this.SolutionsConsts.SolutionWindowParams = 'SolutionWindowParams'; //Поля дополнительного окна
    this.SolutionsConsts.WSSFielsField = 'WSSFielsField'; //Поля типа 'WSS-Файлы' (для печати по решению)
    this.SolutionsConsts.Hint = 'Hint';  //Подсказка
    this.SolutionsConsts.FilesCheckECP = 'FilesCheckECP'; //Скрытое решение
    this.SolutionsConsts.IsSpecialSolution = 'IsSpecialSolution';
    this.SolutionsConsts.CommonSettingForWindow = 'CommonSettingNameForWindow';//общая настройка для окна выбора сотрудников
    this.SolutionsConsts.SetFielddValueFromWindow = 'SetFielddValueFromWindow';//поле в которое нужно проставить выбранные значения
    this.SolutionsConsts.DelegateSolution = 'Делегировать';
    this.SolutionsConsts.MoveNextSolution = 'Перевести на следующий подэтап'; //Перевести далее по процессу
    this.SolutionsConsts.MoveNextSolutionDispName = WKF_Solution_MoveNextSolutionDispName;//'Перевести далее по процессу';

    //поля этап
    this.StagesConsts = new Object();
    this.StagesConsts.Name = 'Name';
    this.StagesConsts.Condition = 'Condition';
    this.StagesConsts.DisplayName = 'DisplayName';

    //tooltip
    this.Warning_SolutionWasAccepted = WKF_Message_SolutionWasAccepted;//"У Вас нет решений на этапе '{0}'. Возможно, Вы уже приняли необходимые решения по документу ранее. Для того, чтобы убедиться в этом, просмотрите историю решений";
    this.Warning_AgrBlockChangeAgrUser = WKF_Message_AgrBlockChangeAgrUser;//"Был изменен текущий согласующий в блоке согласования. Для принятия решений необходимо сохранить карточку. Сохранить?";

    //конфликт сохранения
    this.Warning_SaveConflictMessage = WKF_Message_SaveConflictMessage;//"Заполняемая Вами карточка{0}была изменена другим пользователем{1}. Требуется обновить карточку.\nВыбранное Вами решение и комментарий к нему будут сохранены.";

    //проверка на зависание на этапе
    this.Warning_DeletedAllAgrUsers = WKF_Message_DeletedAllAgrUsers;//"В блоке согласования удалены все текущие согласующие. При сохранении карточки она не перейдет на следующий этап. Укажите согласующих или примите решение 'Перевести далее по процессу'";

    //название подсказки
    this.NotifyTooltip = WKF_NotifyTooltip;//"Будут оповещены:";
    this.NotifyTooltipDelegate = WKF_NotifyTooltipDelegate;//"Будет делегировано:";
}

