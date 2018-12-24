var currentFullScreenEditor = null;

function DBFieldMultiLineText(ctrlID, settingsXML, itemValue) {
    if (itemValue == null)
        itemValue = '';
    var containerID = 'container_' + ctrlID;
    this.ControlID = ctrlID;
    this.Container = window.document.getElementById(containerID);
    this.SettingsDocument = window.SM.LoadXML(settingsXML);
    this.XmlElement = this.SettingsDocument.selectSingleNode('FieldSettings');
    this.GetAttribute = DBFieldMultiLineText_GetAttribute;
    this.GetBooleanAttribute = DBFieldMultiLineText_GetBooleanAttribute;
    this.GetIntegerAttribute = DBFieldMultiLineText_GetIntegerAttribute;
    this.IsNewDesign = this.GetBooleanAttribute('NewDesign');
    this.IsFormatted = this.GetBooleanAttribute('IsFormatted');
    this.ValidateSavedItems = this.GetBooleanAttribute('ValidateSavedItems');

    this.OriginalControlWidth = this.GetIntegerAttribute('ControlWidth');
    this.ControlWidth = this.OriginalControlWidth;
    if (window.SM.DTD)
        this.ControlWidth -= 2;

    this.RowCount = this.GetIntegerAttribute('RowCount');
    this.ControlMode = this.GetAttribute('ControlMode');
    this.UseDefaultFormattedEditor = this.GetBooleanAttribute('UseDefaultFormattedEditor');
    this.IsEditForm = this.ControlMode == 'Edit';
    this.TinyMCEInited = false;
    this.IsResizable = this.IsNewDesign && !this.IsFormatted;

    //инициализация шаблонов
    DBFieldMultiLineText_InitTemplates.call(this);

    //форма редактирования
    this.DisabledSymbolsFeatureEnabled = false;
    if (this.IsEditForm) {
        //новый дизайн
        //#region Новый дизайн
        if (this.IsNewDesign) {
            //var minHeight = Math.round(16.3 * this.RowCount);
            this.MaxHeight = this.GetIntegerAttribute('MaxHeight');
            //обычный режим
            if (!this.IsFormatted) {
                var styles = {};
                if (this.MaxHeight > 0)
                    styles.maxHeight = this.MaxHeight + 'px';
                styles.width = this.OriginalControlWidth + 'px';

                var raOptions = {
                    Container: this.Container,
                    Templates: this.Templates,
                    TemplateSeparator: this.TemplateSeparator,
                    Styles: styles,
                    IsBlue: true,
                    NoRounded: true,
                    Rows: this.RowCount
                };

                this.ResizableControl = new ResizableAreaControl(raOptions);

                this.ValueControl = this.ResizableControl.TextArea;
                this.ValueControl.id = this.ControlID;
                this.ValueControl.name = this.ControlID;
                $(this.ValueControl).val(itemValue);

                this.ResizableControl.InitControl();
                this.DisabledSymbolsFeatureEnabled = true;
            }
                //форматированный режим
                //#region Форматированный режим
            else {
                var ta = window.document.createElement('textarea');
                ta.id = this.ControlID;
                ta.name = this.ControlID;
                ta.className = ctrlID;
                ta.style.color = 'white';
                this.ValueControl = ta;
                ta.value = itemValue;
                this.Container.appendChild(ta);
                var thisObj = this;

                var resizableRichText = false;
                var rtHeight = minHeight;
                var statusBar = 'none';

                if (this.MaxHeight > 0) {
                    resizableRichText = true;
                    statusBar = 'bottom';
                    if (minHeight > this.MaxHeight)
                        minHeight = this.MaxHeight;
                }

                var eLine1 = 'bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,fontselect,fontsizeselect';
                var eLine2 = 'cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,preview';
                var eLine3 = 'tablecontrols,|,hr,removeformat,visualaid,|,sub,sup';
                var eLine4 = 'image,link,unlink,|,forecolor,backcolor,|,charmap,|,print,|,ltr,rtl,|,visualchars,nonbreaking,pagebreak,fullscreen';
                if (!this.UseDefaultFormattedEditor) {
                    var eLine1 = this.GetAttribute('RTEditorLine1');
                    var eLine2 = this.GetAttribute('RTEditorLine2');
                    var eLine3 = this.GetAttribute('RTEditorLine3');
                    var eLine4 = this.GetAttribute('RTEditorLine4');
                }

                var wh = 550;
                var ww = 750;

                var ed = new tinymce.Editor(this.ControlID, {
                    theme: "advanced",
                    theme_advanced_path: false,
                    skin: "o2k7",

                    readonly: 0,
                    apply_source_formatting: true,
                    convert_urls: false,

                    force_br_newlines: true,
                    force_p_newlines: false,
                    forced_root_block: '',

                    theme_advanced_font_sizes: "8,9,10,11,12,14,16,18,20,24,24",
                    accessibility_warnings: false,
                    theme_advanced_resizing: resizableRichText,
                    theme_advanced_resize_horizontal: false,
                    theme_advanced_resizing_min_height: minHeight,
                    theme_advanced_resizing_max_height: this.MaxHeight,
                    theme_advanced_resizing_use_cookie: false,
                    relative_urls: true,
                    width: '' + this.ControlWidth + 'px',
                    height: '' + (minHeight + 113) + 'px', //113 - высота тулбара
                    add_form_submit_trigger: false,
                    submit_patch: false,
                    add_unload_trigger: false,
                    browsers: "msie,gecko",
                    plugin_preview_height: wh,
                    plugin_preview_width: ww,

                    plugins: "preview,fullscreen,autolink,lists,pagebreak,table,advhr,insertdatetime,searchreplace,print,paste,directionality,noneditable,visualchars,nonbreaking,xhtmlxtras,inlinepopups",

                    // Theme options
                    theme_advanced_buttons1: eLine1,
                    theme_advanced_buttons2: eLine2,
                    theme_advanced_buttons3: eLine3,
                    theme_advanced_buttons4: eLine4,
                    theme_advanced_toolbar_location: "top",
                    theme_advanced_toolbar_align: "left",
                    theme_advanced_statusbar_location: statusBar,

                    // Example word content CSS (should be your site CSS) this one removes paragraph margins
                    content_css: "css/word.css",


                    setup: function (ed) {
                        ed.onInit.add(function (ed) {
                            if (!thisObj.TinyMCEInited) {
                                thisObj.TinyMCEInited = true;


                                thisObj.Disabled = thisObj.ListFormField.Disabled;
                                var tmc = tinyMCE.get(thisObj.ControlID);

                                if (thisObj.Disabled)
                                    thisObj.Disable();
                                else
                                    thisObj.Enable();
                            }
                        });

                        ed.onEvent.add(TMC_CancelEditing);
                        ed.onPostRender.add(function () {
                            window.setTimeout(function () {
                                DBFieldMultiLineText_ClearTimeOut();
                                window.SM.ResetFormLayout();
                            }, 100);
                        });
                    }
                });

                this.Editor = ed;
                ed.Field = thisObj;
                ed.render();

                /**
                var b = window.document.createElement('input');
                b.type = 'button';
                b.value = 'disable/enable';
                this.Container.appendChild(b);
                b.MT = this;
                b.onclick = function() {
                if (b.MT.Disabled)
                b.MT.Enable();
                else
                b.MT.Disable();
                }
                /**/
            }
            //#endregion
        }
            //#endregion
            //#region Старый дизайн
        else {
            //обычный режим
            if (!this.IsFormatted) {
                var ta = window.document.createElement('textarea');
                ta.style.fontFamily = 'Verdana';
                ta.style.fontSize = '11px';
                ta.id = ctrlID;
                ta.name = ctrlID;
                ta.rows = this.RowCount;
                ta.overflow = 'scroll';
                ta.style.width = this.ControlWidth + 'px';
                ta.value = itemValue;

                this.ValueControl = ta;
                this.Container.appendChild(ta);

                this.DisabledSymbolsFeatureEnabled = true;
            }
                //#region Форматированный режим
            else {
                var minHeight = Math.round(16.3 * this.RowCount);
                this.MaxHeight = this.GetIntegerAttribute('MaxHeight');

                var ta = window.document.createElement('textarea');
                ta.id = this.ControlID;
                ta.name = this.ControlID;
                ta.className = ctrlID;
                ta.style.color = 'white';
                this.ValueControl = ta;
                ta.value = itemValue;
                this.Container.appendChild(ta);
                var thisObj = this;

                var resizableRichText = false;
                var rtHeight = minHeight;
                var statusBar = 'none';

                if (this.MaxHeight > 0) {
                    resizableRichText = true;
                    statusBar = 'bottom';
                    if (minHeight > this.MaxHeight)
                        minHeight = this.MaxHeight;
                }

                var eLine1 = 'bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,fontselect,fontsizeselect';
                var eLine2 = 'cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,preview';
                var eLine3 = 'tablecontrols,|,hr,removeformat,visualaid,|,sub,sup';
                var eLine4 = 'image,link,unlink,|,forecolor,backcolor,|,charmap,|,print,|,ltr,rtl,|,visualchars,nonbreaking,pagebreak,fullscreen';
                if (!this.UseDefaultFormattedEditor) {
                    var eLine1 = this.GetAttribute('RTEditorLine1');
                    var eLine2 = this.GetAttribute('RTEditorLine2');
                    var eLine3 = this.GetAttribute('RTEditorLine3');
                    var eLine4 = this.GetAttribute('RTEditorLine4');
                }

                var wh = 550;
                var ww = 750;

                var ed = new tinymce.Editor(this.ControlID, {
                    theme: "advanced",
                    theme_advanced_path: false,
                    skin: "o2k7",

                    readonly: 0,
                    apply_source_formatting: true,
                    convert_urls: false,

                    force_br_newlines: true,
                    force_p_newlines: false,
                    forced_root_block: '',

                    theme_advanced_font_sizes: "8,9,10,11,12,14,16,18,20,24,24",
                    accessibility_warnings: false,
                    theme_advanced_resizing: resizableRichText,
                    theme_advanced_resize_horizontal: false,
                    theme_advanced_resizing_min_height: minHeight,
                    theme_advanced_resizing_max_height: this.MaxHeight,
                    theme_advanced_resizing_use_cookie: false,
                    relative_urls: true,
                    width: '' + this.ControlWidth + 'px',
                    height: '' + (minHeight + 113) + 'px', //113 - высота тулбара
                    add_form_submit_trigger: false,
                    submit_patch: false,
                    add_unload_trigger: false,
                    browsers: "msie,gecko",
                    plugin_preview_height: wh,
                    plugin_preview_width: ww,

                    plugins: "preview,fullscreen,autolink,lists,pagebreak,table,advhr,insertdatetime,searchreplace,print,paste,directionality,noneditable,visualchars,nonbreaking,xhtmlxtras,inlinepopups",

                    // Theme options
                    theme_advanced_buttons1: eLine1,
                    theme_advanced_buttons2: eLine2,
                    theme_advanced_buttons3: eLine3,
                    theme_advanced_buttons4: eLine4,
                    theme_advanced_toolbar_location: "top",
                    theme_advanced_toolbar_align: "left",
                    theme_advanced_statusbar_location: statusBar,

                    // Example word content CSS (should be your site CSS) this one removes paragraph margins
                    content_css: "css/word.css",


                    setup: function (ed) {
                        ed.onInit.add(function (ed) {
                            if (!thisObj.TinyMCEInited) {
                                thisObj.TinyMCEInited = true;


                                thisObj.Disabled = thisObj.ListFormField.Disabled;
                                var tmc = tinyMCE.get(thisObj.ControlID);

                                if (thisObj.Disabled)
                                    thisObj.Disable();
                                else
                                    thisObj.Enable();
                            }
                        });

                        ed.onEvent.add(TMC_CancelEditing);
                    }
                });

                this.Editor = ed;
                ed.Field = thisObj;
                ed.render();

                /**
                var b = window.document.createElement('input');
                b.type = 'button';
                b.value = 'disable/enable';
                this.Container.appendChild(b);
                b.MT = this;
                b.onclick = function() {
                if (b.MT.Disabled)
                b.MT.Enable();
                else
                b.MT.Disable();
                }
                /**/
            }
            //#endregion
        }
        //#endregion
    }
        //Форма просмотра
    else {
        if (this.IsFormatted) {
            var minHeight = Math.round(16.3 * this.RowCount);
            this.MaxHeight = this.GetIntegerAttribute('MaxHeight');

            var dispDiv = window.document.createElement('div');
            dispDiv.className = 'mt_disp_container';
            dispDiv.innerHTML = itemValue;

            if (this.MaxHeight > 0)
                dispDiv.style.height = this.MaxHeight + 'px';
            else if (minHeight > 0)
                dispDiv.style.height = minHeight + 'px';

            dispDiv.style.width = this.ControlWidth + 'px';
            this.Container.appendChild(dispDiv);
        }
    }

    if (this.DisabledSymbolsFeatureEnabled) {
        if (this.ValueControl != null) {
            var objRef = this.ValueControl;
            objRef.Field = this;

            //disable copypaste incorrect values
            $(this.ValueControl).bind('paste', function (e) {
                objRef.PreviosValue = $(objRef).val();
                var timeoutID = window.setTimeout(function () {
                    if (timeoutID > 0)
                        window.clearTimeout(timeoutID);

                    var currentValue = $(objRef).val();
                    //текущее значение поля содержит запрещенные символы
                    var contains = DBFieldMultiLineText_StringContainsDisabledSymbols.call(objRef.Field, currentValue);
                    if (contains)
                        $(objRef).val(objRef.PreviosValue);
                }, 5);
            });

            $(document).ready(function (objref) {
                $(objRef).keypress(function (e) {
                    var isDisabledSymbol = DBFieldMultiLineText_IsDisabledSymbol.call(objRef.Field, e.which);
                    if (isDisabledSymbol)
                        return false;
                });
            });
        }
    }

    //Свойства
    this.IsChange = false;
    this.FieldName = this.GetAttribute('FieldName');

    //интерфейсные методы
    this.IsChanged = DBFieldMultiLineText_IsChanged;
    this.OnInit = DBFieldMultiLineText_OnInit;
    this.OnSave = DBFieldMultiLineText_OnSave;
    this.Disable = DBFieldMultiLineText_Disable;
    this.Enable = DBFieldMultiLineText_Enable;
    this.GetValue = DBFieldMultiLineText_GetValue;
    this.SetValue = DBFieldMultiLineText_SetValue;
    this.ShowInformer = DBFieldMultiLineText_ShowInformer;
    this.IsEmptyValue = DBFieldMultiLineText_IsEmptyValue;

    //Методы
    this.Init = DBFieldMultiLineText_Init;

    if (this.IsEditForm && !this.IsFormatted) {
        this.ValueControl.onfocus = function () {
            if (this.readOnly)
                this.blur();
        }
    }

    //Инициализация
    this.Init();
}

function DBFieldMultiLineText_ClearTimeOut() {
    window.clearTimeout(dbf_multiline_timeout_id);
}


var dbf_multiline_timeout_id = 0;

function TMC_CancelEditing(ed) {
    if (ed.Field == null || ed.Field.Disabled) {
        var fieldEditor = tinyMCE.get(ed.settings.fullscreen_editor_id);

        if (fieldEditor.Field == null || fieldEditor.Field.Disabled) {
            window.document.body.focus();
            return false;
        }
    }
}

//Init
function DBFieldMultiLineText_Init() {
    if (window.DBFieldMultiLineTextCollection == null)
        window.DBFieldMultiLineTextCollection = [];
    if (!window.SM.IsNullOrEmpty(this.FieldName))
        window.DBFieldMultiLineTextCollection[this.FieldName.toLowerCase()] = this;
}

function DBFieldMultiLineText_IsChanged() {
    return this.IsChange;
}

function DBFieldMultiLineText_GetField(fieldName) {
    var field = null;
    if (window.DBFieldMultiLineTextCollection != null && !window.SM.IsNullOrEmpty(fieldName)) {
        fieldName = fieldName.toLowerCase();
        field = window.DBFieldMultiLineTextCollection[fieldName];
    }
    return field;
}

//Interface
function DBFieldMultiLineText_OnInit() {
    //Handlers
    if (this.ValueControl != null) {
        var objRef = this;
        this.ValueControl.onchange = function () { objRef.IsChange = true; objRef.ListFormField.OnChange(); }
    }
}

function DBFieldMultiLineText_OnSave(saveEventArgs) {
    var value = this.GetValue();

    if (this.IsFormatted)
        $(this.ValueControl).val(value);

    if (this.ListFormField.Required) {

        if (this.IsEmptyValue()) {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsEmptyValue = true;
        }
    }

    //проверка на запрещенные символы.
    if (!SM.IsNE(value) && this.DisabledSymbolsFeatureEnabled && this.ValidateSavedItems) {
        //текущее значение поля содержит запрещенные символы
        var contains = DBFieldMultiLineText_StringContainsDisabledSymbols.call(this, value);
        if (contains) {
            //коллекция запрещенных символов
            var disabledSymbols = [];
            for (var i = 0; i < value.length; i++) {
                var valueSymbol = value[i];
                if (DBFieldText_IsDisabledSymbol.call(this, valueSymbol))
                    disabledSymbols[valueSymbol] = valueSymbol;
            }

            var disabledSymbolsString = '';
            for (var symbol in disabledSymbols) {

                if (!disabledSymbols.hasOwnProperty(symbol))
                    continue;

                var disabledSymbol = disabledSymbols[symbol];
                if (disabledSymbolsString.length > 0)
                    disabledSymbolsString += ", ";

                disabledSymbolsString += '"' + disabledSymbol + '"';
            }

            saveEventArgs.CanSave = false;
            var commonMessage = 'В поле: "' + this.FieldName + '" содержатся символы, запрещенные для ввода. Запрещенные символы: ' + disabledSymbolsString + '.';
            saveEventArgs.CommonAlertMessage = commonMessage;
        }
    }
}

function DBFieldMultiLineText_IsEmptyValue() {
    var isEmpty;

    if (this.ResizableControl != null)
        (this.ResizableControl.IsEmptyTextValue()) ? isEmpty = true : isEmpty = false;
    else {
        var value = this.GetValue();
        (window.SM.IsNullOrEmpty(value)) ? isEmpty = true : isEmpty = false;
    }

    return isEmpty;
}

function DBFieldMultiLineText_Disable() {
    this.Disabled = true;
    if (!this.IsFormatted) {
        if (this.ValueControl != null) {
            if (this.IsResizable)
                this.ResizableControl.Disable();
            else {
                this.ValueControl.readOnly = true;
                this.ValueControl.style.color = "#808080";
            }
        }
    }
    else {
        if (!this.TinyMCEInited)
            return;

        var ed = this.Editor;
        if (ed == null)
            return;

        ed.contentWindow.document.body.oncontextmenu = function () {
            return false;
        }
        ed.contentWindow.document.body.onselectstart = function () {
            return false;
        }
        this.Container.oncontextmenu = function () {
            return false;
        }

        ed.settings.readonly = 1;
        ed.getBody().setAttribute('contenteditable', 'false');
        ed._refreshContentEditable();

        for (var prop in ed.controlManager.controls) {
            var p = ed.controlManager.get(prop);
            if (p != null && prop.indexOf('fullscreen1') == -1
             && prop.indexOf('preview') == -1)
                ed.controlManager.setDisabled(prop, true);
        }

        if (this.ResizeRow == null) {
            var tblEditor = window.document.getElementById(this.ControlID + '_tbl');
            if (tblEditor != null && tblEditor.rows != null && tblEditor.rows.length == 3)
                this.ResizeRow = tblEditor.rows[2];
        }

        if (this.ResizeRow != null)
            this.ResizeRow.style.display = 'none';
    }
}

function DBFieldMultiLineText_Enable() {
    this.Disabled = false;
    if (!this.IsFormatted) {
        if (this.ValueControl != null) {
            if (this.IsResizable)
                this.ResizableControl.Enable();
            else {
                this.ValueControl.readOnly = false;
                this.ValueControl.style.color = "#000000";
            }
        }
    }
    else {
        if (!this.TinyMCEInited)
            return;

        var ed = this.Editor;
        if (ed != null) {

            ed.contentWindow.document.body.oncontextmenu = null;
            ed.contentWindow.document.body.onselectstart = null;
            this.Container.oncontextmenu = null;

            ed.settings.readonly = 0;
            ed.getBody().setAttribute('contenteditable', 'true');
            ed._refreshContentEditable();

            for (var prop in ed.controlManager.controls) {
                var p = ed.controlManager.get(prop);
                if (p != null && prop.indexOf('fullscreen1') == -1
             && prop.indexOf('preview') == -1)
                    ed.controlManager.setDisabled(prop, false);
            }

            if (this.ResizeRow != null)
                this.ResizeRow.style.display = '';
        }
    }
}

function DBFieldMultiLineText_GetValue() {
    var value = null;
    if (this.IsEditForm) {
        if (!this.IsFormatted)
            value = $(this.ValueControl).val();
        else {
            value = tinyMCE.get(this.ControlID).getContent();
        }
    }
    else
        value = $(this.ValueControl).text();
    return value;
}

function DBFieldMultiLineText_SetValue(value) {
    if (this.IsEditForm) {
        if (!this.IsFormatted) {
            if (value == null)
                value = '';
            value = value.toString();
            $(this.ValueControl).val(value);
            if (this.ValueControl.Adjust != null)
                this.ValueControl.Adjust();
            this.IsChange = true;
            this.ListFormField.OnChange();
        }
        else
            alert('Программная установка значений на клиенте в данный момент не поддерживается для форматированного текста!');
    }
}

function DBFieldMultiLineText_ShowInformer(message) {
}

function DBFieldMultiLineText_InitTemplates() {
    if (this.XmlElement == null)
        return;
    //разделитель шаблонов
    this.TemplateSeparator = this.GetAttribute('TemplateSeparator');

    //шаблоны
    this.Templates = [];
    var nodes = this.XmlElement.selectNodes('Templates/string');
    if (nodes) {
        var i, len = nodes.length;
        for (i = 0; i < len; i++) {
            var node = nodes[i];
            var templateText = $(node).text();
            if (!window.SM.IsNE(templateText))
                this.Templates.push(templateText);
        }
    }
}


//Typed Methods
////////////////////////Common Methods//////////////////////////////
function DBFieldMultiLineText_GetAttribute(attributeName) {
    return DBFieldMultiLineText_GetAttributeValue(this.XmlElement, attributeName);
}

function DBFieldMultiLineText_GetBooleanAttribute(attributeName) {
    return DBFieldMultiLineText_GetBooleanAttributeValue(this.XmlElement, attributeName);
}

function DBFieldMultiLineText_GetIntegerAttribute(attributeName) {
    return DBFieldMultiLineText_GetIntegerAttributeValue(this.XmlElement, attributeName);
}


//получение текстового атрибута ХМЛ-элемента
function DBFieldMultiLineText_GetAttributeValue(xmlElement, attributeName) {
    var attrValue = null;
    var val = xmlElement.getAttribute(attributeName);
    if (!window.SM.IsNullOrEmpty(val))
        attrValue = val;
    return attrValue;
}

//получение булевого атрибута ХМЛ-элемента
function DBFieldMultiLineText_GetBooleanAttributeValue(xmlElement, attributeName) {
    var boolValue = false;
    var attrValue = DBFieldMultiLineText_GetAttributeValue(xmlElement, attributeName);
    if (!window.SM.IsNullOrEmpty(attrValue)) {
        boolValue = attrValue.toLowerCase() == 'true';
    }
    return boolValue;
}

function DBFieldMultiLineText_GetIntegerAttributeValue(xmlElement, attributeName) {
    var intValue = 0;
    var value = DBF_GetAttributeValue(xmlElement, attributeName);
    if (!window.SM.IsNullOrEmpty(value))
        intValue = parseInt(value);
    return intValue;
}
///////////////////////////////////////////////////////////////////

//Инициализирует запрещенные символы
function DBFieldMultiLineText_InitDisabledSymbols() {
    try {
        if (this.DisabledSymbolsInited)
            return;

        //создаем именованный массив запрещенных символов.
        this.DisabledSymbols = [];
        if (this.XmlElement != null) {
            var nodes = this.XmlElement.selectNodes('DisabledClientSymbols/char');
            if (nodes != null && nodes.length > 0) {
                var i, len = nodes.length;
                for (i = 0; i < len; i++) {
                    var disabledSymbolNode = nodes[i];
                    var disabledSymbol = disabledSymbolNode.text;
                    if (!SM.IsNE(disabledSymbol))
                        this.DisabledSymbols[disabledSymbol.toString()] = disabledSymbol;
                }
            }
        }

        this.DisabledSymbolsInited = true;
    }
    catch (ex) {
        alert('Возникла неожиданная ошибка. Текст ошибки: ' + ex.message);
    }
}

//Возвращает признак: есть ли в строке запрещенные символы
function DBFieldMultiLineText_StringContainsDisabledSymbols(string) {
    var contains = false;
    try {
        if (string == null)
            string = '';
        else
            string = string.toString();

        if (!SM.IsNE(string)) {
            //инициализация запрещенных символов
            DBFieldMultiLineText_InitDisabledSymbols.call(this);
            for (var i = 0; i < string.length; i++) {
                var symbol = string[i];
                if (!SM.IsNE(symbol) && this.DisabledSymbols != null
                    && this.DisabledSymbols[symbol] != null) {
                    contains = true;
                    break;
                }
            }
        }
    }
    catch (ex) {
        alert('Возникла неожиданная ошибка. Текст ошибки: ' + ex.message);
    }

    return contains;
}

//Возвращает признак, запрещен ли символ
function DBFieldMultiLineText_IsDisabledSymbol(symbol) {
    var disabled = false;
    try {
        if (symbol == null)
            symbol = '';
        else {
            //если пришло число, то считаем, что это код символа
            //если пришла строка, то считаем ее символом.
            if (typeof symbol == 'number')
                symbol = String.fromCharCode(symbol);
            else
                symbol = symbol.toString();

            if (symbol.length != 1)
                throw new Error('Для проверки символа на запрещенность необходимо передавть только один символ');
        }

        if (!SM.IsNE(symbol)) {
            //инициализация запрещенных символов
            DBFieldMultiLineText_InitDisabledSymbols.call(this);
            if (this.DisabledSymbols != null && this.DisabledSymbols[symbol] != null)
                disabled = true;
        }
    }
    catch (ex) {
        alert('Возникла неожиданная ошибка. Текст ошибки: ' + ex.message);
    }

    return disabled;
}