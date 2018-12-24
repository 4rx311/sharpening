
// Добавление обработчика на сохранение формы
function OMK_AutoCreateDocuments_Init() {
    ListForm.AddSaveHandler(function () {
        var currentSolution = window.SLFieldInstance.SelectedSolutionName;
        if (currentSolution == null || currentSolution == "") return;

        var itemID = ListForm.ItemID;

        // Передаем параметры на сервер, делаем запрос
        var url = "/_layouts/WSS/WSSC.V4.DMS.OMK/Controls/AutoCreateDocumentsControl/AutoCreateDocumentsHandler.ashx";
        var request = SM.CreateRequestBuilder();

        request.SetParam("ItemID", itemID, true);
        request.SetParam("SolutionName", currentSolution, true);

        // Получаем ответ от сервера, парсим его
        var response = request.SendRequest(url);
        var parsedData = JSON.parse(response);

        if (parsedData.Exception)
            throw new Error(parsedData.Exception.DisplayText);

        // Открываем по ссылке окно с новым документом
        var newDocumentUrl = parsedData.Value;
        if (newDocumentUrl != null) {
            window.open(newDocumentUrl);
        }
    });
}