var OMK_RenameFiles_Consts = {
    Initiator: "Инициатор"
}

/**
 * Инициализирует контрол.
 * @returns {} 
 */
function OMK_RenameFile_Init() {
    var settings = window.OMK_RenameFile;

    // Проверка условий на пользователя
    var initiatorValue = ListForm.GetField(OMK_RenameFiles_Consts.Initiator, true).GetValue();
    if (!initiatorValue || ListForm.CurrentUserID != initiatorValue.LookupID)
        return;

    var fields = settings.Fields;
    //проходим по нужным полям
    if (fields && fields.length > 0) {
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var dbField = ListForm.GetField(field);
            if (dbField == null)
                throw new Error('Не найдено поле "' + field + '"');

            if (dbField.Disabled) continue;

            OMK_RenameFile_AttachHandler(dbField);
        }
    }
}

/**
 * Прикрепляет кнопки переименования к файлам в поле. Добавляет обработчики на изменение поля.
 * @param {} field 
 * @returns {} 
 */
function OMK_RenameFile_AttachHandler(field) {
    var filesField = field.TypedField;
    var files = filesField.FilesByIndex;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!OMK_RenameFile_IsValidFile(file)) continue;

        OMK_RenameFile_AttachButton(file);
    }
    field.AddChangeHandler(function (clientField, eventFile) {
        if (OMK_RenameFile_IsValidFile(eventFile)) {
            OMK_RenameFile_AttachButton(eventFile);
        }
    });
}

/**
 * Определяет, не удалён ли файл, и сохранён ли файл на сервере.
 * @param {} file 
 * @returns {} 
 */
function OMK_RenameFile_IsValidFile(file) {
    return file.CanEdit && !file.Deleted && (file.Existing || file.ClientField.SaveFileOnUpload === true);
}

/**
 * Прикрепляет кнопку к контейнеру иконок действий каждого из файлов в поле.
 * @param {} file 
 * @returns {} 
 */
function OMK_RenameFile_AttachButton(file) {
    var images = file.DivFileImages;
    if ($(images).find('.files-fileImage-rename').length === 0) {
        //var container = document.createElement('a');

        var btn = OMK_RenameFile_CreateRenameButton();
        btn.onclick = function () {
            OMK_RenameFile_ButtonClick(file, this);
        };
        //container.appendChild(btn);
        images.appendChild(btn);
        file.FileNameDialogContainer = btn;
    };
}

/**
 * Обрабатывает клик по кнопке переименования файла.
 * @param {} filesField 
 * @param {} file 
 * @param {} container 
 * @returns {} 
 */
function OMK_RenameFile_ButtonClick(file, container) {
    //разбираем название файла на название и расширение. Т.к. изменить расширение файла с помощью этого функционала нельзя
    //var parts = OMK_RenameFile_GetFileNameParts(file.FileName);

    //отображаем окошко с предложением ввести новое название файла
    if (container.FileNameDialog == null) {
        RL.CallAsync('FileNameDialog', function () {
            window.FileNameDialog.CreateDialog({
                Trigger: container,
                ParentContainer: container.parentNode,
                TriggerTooltip: "Переименовать",
                OnFileNameEnter: function (fileName) {
                    OMK_RenameFile_OnFileNameEnter(fileName, file);
                },
                FilesField: file.ClientField,
                DefaultFileName: file.FileName //автоматически отбрасывает расширение файла. Не позволяет его менять
            });
        }); //этот диалог сам проверяет наличие файла в поле
    }
}

/**
 * Обрабатывает нажатие "ОК" в окне переименования файла.
 * @param {} fileName 
 * @param {} parts 
 * @param {} file 
 * @returns {} 
 */
function OMK_RenameFile_OnFileNameEnter(fileName, file) {
    if (SM.IsNE(fileName)) {
        alert("Не указано имя файла");
        return;
    }

    var origFileName = file.FileName;
    var newFileName = fileName;

    //если название файла поменялось
    if (origFileName !== newFileName) {
        //проверяем на наличие такого файла в поле
        var previousFile = ListForm.GetFieldByID(file.ClientField.ListFormField.ID).TypedField.GetFile(newFileName);
        if (previousFile != null && !previousFile.Deleted) {
            alert("В поле уже присутствует файл с именем '" + newFileName + "'");
            return;
        }

        //переименовываем файл
        OMK_RenameFile_Rename(file, newFileName);
    }
}

/**
 * Возвращает объект с частями названия файла: название и расширение.
 * @param {} fileName 
 * @returns {} 
 */
function OMK_RenameFile_GetFileNameParts(fileName) {

    var obj = {
        Name: "",
        Ext: ""
    };
    var dotIndex = fileName.lastIndexOf('.');
    if (dotIndex == -1) {
        obj.Name = fileName;
    } else {
        obj.Name = fileName.substr(0, dotIndex);
        obj.Ext = fileName.substr(dotIndex + 1, fileName.length - dotIndex - 1);
    }

    return obj;
}

/**
 * Создаёт элемент - кнопку переименования.
 * @returns {} 
 */
function OMK_RenameFile_CreateRenameButton() {
    var elem = document.createElement('img');
    elem.setAttribute("class", 'files-fileImages files-fileImage-rename');
    elem.alt = elem.title = 'Переименовать';
    elem.src = "/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/Controls/RenameFilesControl/RenameFile.png";
    return elem;
}

/**
 * Отправляет запрос на переименование файла.
 * @param {} file 
 * @param {} fileName 
 * @returns {} 
 */
function OMK_RenameFile_Rename(file, newFileName) {
    var oldFileName = file.FileName;
    var oldFileNameLower = oldFileName.toLowerCase();

    var rb = SM.CreateRequestBuilder();
    rb.SetParam("fileUrl", file.FileUrl);
    rb.SetParam("fileName", newFileName);
    rb.SetParam("listid", ListForm.ListID);
    rb.SetParam("itemid", ListForm.ItemID);
    rb.SetParam("filefieldid", file.ClientField.FieldID);
    rb.SetParam("fileitemid", file.FileItemID);
    rb.SetParam("filelistid", file.FileListID);
    rb.SendRequest('/_LAYOUTS/WSS/WSSC.V4.DMS.OMK/Controls/RenameFilesControl/RenameFilesHandler.ashx', function (response) {
        var obj = JSON.parse(response);
        try {
            if (obj.Exception) {
                throw new Error("Не удалось переименовать файл: " + obj.Exception.DisplayText);
            }

            //Если переименование прошло успешно на сервере, то переименовываем файл на клиенте (JS + отображение)
            newFileName = obj.FileName;
            file.FileUrl = obj.FileUrl;
            file.FileName = newFileName;

            //заполняем origin для совместимости с IE < 11
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
            var fileLink = window.location.origin + file.FileUrl;
            var fileContainer = $(file.FileDiv);

            var newFileNameLower = newFileName.toLowerCase();
            var filesByName = file.ClientField.FilesByName;
            filesByName[newFileNameLower] = filesByName[oldFileNameLower];
            filesByName[oldFileNameLower] = undefined;

            //заменяем href для ссылок на картинке и тексте
            fileContainer.find(".files-fileAndCommentDiv a").attr("href", fileLink);
            $(file.DivFileName).find(".files-link-container .files-filespan").text(newFileName);

            //изменяем название файла по умолчанию, которое отображается при вызове окошка переименования
            var dialog = file.FileNameDialogContainer.FileNameDialog;
            if (dialog != null) {
                var newParts = OMK_RenameFile_GetFileNameParts(newFileName);
                dialog.DefaultFileName = newParts.Name;
                dialog.DefaultShortName = newParts.Name;
            }
        } catch (ex) {
            alert(ex.message + "\n\n" + ex.stack);
        }
    });
}