//создает объект для контроля таймеров и пользовтельской активности и присваивает его window.TM
function TM_InitControl() {
    //глобальное свойство для управления всеми таймерами 
    window.TM = this;
    //очередь отложенных выполнений обработчиков с наступившим таймером до возобновления пользовательской активности
    this.CallExpectedHandlers = [];
    //очередь отложенных добавлений обработчиков ,которые добавлялись до возобновления пользовательской активности
    this.TimeoutExpectedHandlers = [];
    //метод добавления таймера
    this.Execute = TM_Execute;
    //метод удаления таймера
    this.DeleteHandler = TM_DeleteHandler;
    //последнее время активности на странице
    this.LastActiveTime = new Date();
    //подписка на события пользовательской активности на странице
    //вместо window.body необходимо использовать document, 
    //поскольку в некоторых случаях при открытии страницы свойство window.body ещё не инициализировано, 
    //а в свою очередь высота body может быть меньше видимой части окна, 
    //таким образом клики по нижней части окна не будут инициировать проверку активности окна.
    document.onkeydown = TM_CheckActivationHandler;  //на нажатие клавиш
    document.onmouseover = TM_CheckActivationHandler;//на движение курсора по области окна браузера
}

//вызывает отложенные обработчики при наличии пользовтельской активности
function TM_CheckActivationHandler() {
    var timeOperationControl = window.TM;
    if (timeOperationControl)
        TM_CheckActivation.call(timeOperationControl)
}

//вызывает отложенные обработчики в контексте window.TM
function TM_CheckActivation() {
    //проставляем текущее время активности.
    this.LastActiveTime = new Date();
    //проверяем наличие обработчиков, ожидающих вызова  и отсутствие флага факта исполнения обработчиков
    if (this.CallExpectedHandlers.length > 0 && !this.ExpectedHandlersCalling) {
        //проставляем флаг того, что экземпляр обработчика активности забрал на обработку обработчики ожидающие вызова.
        this.ExpectedHandlersCalling = true;
        //очищаем очередь обработчиков, ожидающих вызова, исполняя их по-очереди
        while (this.CallExpectedHandlers.length > 0) {
            //вырезать первый обработчик из очереди
            var handlerSet = this.CallExpectedHandlers.shift();
            //вызов обработчика 
            TM_CallHandler(handlerSet);
        }
        //сбросить флаг факта исполнения обработчиков
        this.ExpectedHandlersCalling = false;
    }

    //проверяем наличие обработчиков, ожидающих добавления  и отсутствие флага факта исполнения обработчиков
    if (this.TimeoutExpectedHandlers.length > 0 && !this.TimeoutExpectedCalling) {
        //проставляем флаг того, что экземпляр обработчика активности забрал на обработку обработчики ожидающие вызова.
        this.TimeoutExpectedCalling = true;
        //очищаем очередь недобавленных обработчиков , создавая им таймеры
        while (this.TimeoutExpectedHandlers.length > 0) {
            //вырезать первый обработчик из очереди
            var handlerSet = this.TimeoutExpectedHandlers.shift();
            //создать для него таймер
            //проверка на браузер , поддерживающий передачу аргументов в setTimeout
            if (!SM.IsIE || SM.IEVersion >= 10) {
                //проверка на браузер , поддерживающий передачу аргументов в setTimeout
                handlerSet.TimeoutID = window.setTimeout(TM_ExecuteOnTimeoutHandler, handlerSet.Timeout, handlerSet);
            }
            else {
                handlerSet.TimeoutID = window.setTimeout(function () { TM_ExecuteOnTimeoutHandler(handlerSet) }, handlerSet.Timeout);
            }
        }
        //сбросить флаг факта исполнения обработчиков
        this.TimeoutExpectedCalling = false;
    }
}

//добавляет обработчик с таймером 
function TM_Execute(timeout, handler, handlerInstance, args) {
    if (!handler)
        throw new Error('Не передан параметр handler в функцию добавления вызова по таймауту.')
    if (timeout == null || timeout <= 0)
        throw new Error('Параметр timeout должен быть больше 0.')
    //собираем все аргументы в один объект с необходимой информацией для запуска обработчика 
    var handlerSet = {
        Handler: handler,
        Instance: handlerInstance,
        Args: args,
        Timeout: timeout
    };
    //является ли текущее окно активным 
    var isActive = TM_IsActiveWindow.call(this);
    if (isActive) { //если активно - создадим таймер с обработчиком         
        //проверка на браузер , поддерживающий передачу аргументов в setTimeout
        if (!SM.IsIE || SM.IEVersion >= 10) {
            handlerSet.TimeoutID = window.setTimeout(TM_ExecuteOnTimeoutHandler, timeout, handlerSet);
        }
        else {
            handlerSet.TimeoutID = window.setTimeout(function () { TM_ExecuteOnTimeoutHandler(handlerSet) }, timeout);
        }
    }
    else    //если нет - добавим в очередь отложенных добавлений обработчиков ,которые добавлялись до возобновления пользовательской активности
        this.TimeoutExpectedHandlers.push(handlerSet);
    return handlerSet.TimeoutID;
}

//передает управление в объект обработчика при наступлении времени выполнения таймера
function TM_ExecuteOnTimeoutHandler(handlerSet) {
    if (!handlerSet)
        throw new Error('Не передан параметр handlerSet.');
    if (!window.TM)
        throw new Error('Невозможно выполнить обработчик, т.к. свойство window.TM не задано');
    TM_ExecuteOnTimeout.call(window.TM, handlerSet);
}

//выполняет функцию объекта обработчика ,если окно активно, иначе кладет его в очередь отложенного выполнения 
function TM_ExecuteOnTimeout(handlerSet) {
    if (!handlerSet)
        throw new Error('Не передан параметр handlerSet.');
    //проверка, активно ли окно 
    var isActive = TM_IsActiveWindow.call(this);
    if (isActive)   //если да - вызвать обработчик
        TM_CallHandler(handlerSet);
    else            //если нет - положить обработчик в очередь ожидания исполнения
        this.CallExpectedHandlers.push(handlerSet);
}

//Возвращает,считается ли активным текущее окно
function TM_IsActiveWindow() {
    //если задано время последней активности
    if (this.LastActiveTime) {
        //получить разницу в миллисекундах между текущем временем и временем последней активности
        var timeSpentMs = (new Date() - this.LastActiveTime);
        //если разница меньше или равна 10000 мс (10 секунд), то считаем, что окно еще активно
        var isActive = (timeSpentMs <= 10000);
        return isActive;
    }
    //если последнее время активности отсутсвует, возвращаем статус неактивного окна.
    return false;
}

//Осуществляет непосрественный вызов обработчика с агрументами и объектом в контексте которого необходимо вызвать обработчик.
function TM_CallHandler(handlerSet) {
    if (!handlerSet)
        throw new Error('Не передан параметр handlerSet.');
    if (!handlerSet.Handler)
        throw new Error('Отсутствует ссылка на непосредственный обработчик вызова по таймауту в свойстве handlerSet.Handler.');
    //вызов функции обработчика с агрументам
    //если задан объект в контексте которого необходимо вызвать обработчик, то вызовем обработчик в контексте этого объекта 
    if (handlerSet.Instance)
        handlerSet.Handler.call(handlerSet.Instance, handlerSet.Args);
    else
        handlerSet.Handler(handlerSet.Args);
    //очищаем timeout, чтобы не было утечки в IE.
    TM_DeleteHandler(handlerSet.TimeoutID);
}

//очищает timeout таймера
function TM_DeleteHandler(timeoutID) {
    if (timeoutID != null)
        window.clearTimeout(timeoutID);
}