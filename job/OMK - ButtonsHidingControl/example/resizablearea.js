function ResizableAreaControl(options) {
    var defaultOptions = {
        Container: null,
        Styles: null,
        IsBlue: true,
        NoRounded: true,
        Templates: null,
        TemplateSeparator: '',
        Rows: options.Rows
    };
    SM.ApplyOptions(this, defaultOptions, options);
    ResizableArea.call(this, this.Container, this.Styles, this.IsBlue, this.NoRounded);
}

function ResizableArea(container, styles, isBlueBackground, noRounded) {
    if (container == null)
        alert('container не может быть равен null');

    //props
    this.Container = container;
    this.NoRounded = noRounded;
    this.TextArea = window.document.createElement('textarea');
    SM.ApplyEventModel(this.TextArea);
    this.TextArea.className = 'ra_txtarea';
    this.IsBlue = isBlueBackground;
    this.Styles = styles;

    //func
    this.Disable = RA_Disable;
    this.Enable = RA_Enable;
    this.IsEmptyTextValue = RA_IsEmptyTextValue;
    this.SetTemplates = RA_SetTemplates;
    this.HideTemplatesPicker = RA_HideTemplatesPicker;
    this.ShowTemplatesPicker = RA_ShowTemplatesPicker;
    this.InitTemplatesControl = RA_InitTemplatesControl;

    this.InitializeDOM = RA_InitializeDOM;
    this.InitControl = RA_InitControl;

    //this.InitControl();
    return this;
}

function RA_SetTemplates(templates) {
    var originalHasTemplates = this.Templates != null && this.Templates.length > 0;
    this.Templates = templates;
    var hasTemplates = this.Templates != null && this.Templates.length > 0;
    var templatesControlExists = this.DropDownTemplates != null;
    this.InitTemplatesControl();
    if (hasTemplates) {
        if (originalHasTemplates)
            this.DropDownTemplates.ClearItems();
        //добавляем шаблоны только в случае когда контрол не был создан в функции InitTemplatesControl.
        if (templatesControlExists) {
            var i, len = this.Templates.length;
            for (i = 0; i < len; i++) {
                var template = this.Templates[i];
                this.DropDownTemplates.AddItem(template, template);
            }
        }
    }
    if (!originalHasTemplates && hasTemplates)
        this.ShowTemplatesPicker();
    if (originalHasTemplates && !hasTemplates) {
        this.DropDownTemplates.ClearItems();
        this.HideTemplatesPicker();
    }
}

function RA_InitControl() {
    this.IsCreating = true;
    this.InitializeDOM();

    //fix style
    this.ContentContainer.style.display = 'block';
    this.TextArea.style.display = 'block';

    //style
    //дефолтные шрифты
    if (this.Styles.fontSize == null)
        this.Styles.fontSize = '11px';

    if (this.Styles.fontFamily == null)
        this.Styles.fontFamily = 'Tahoma';

    //определение высоты контрола
    if (this.Rows > 0) {
        this.ControlHeight = Math.round(13.95 * this.Rows) + 'px';
        //переопределение стилей с высотой (так как в приоритете количество строк)
        this.Styles['height'] = this.ControlHeight;
        this.Styles['minHeight'] = this.ControlHeight;
    }

    //копирование стилей
    for (var prop in this.Styles) {
        if (prop == 'containskey' || prop == 'remove')
            continue;

        this.TextArea.style[prop] = this.Styles[prop];
    }

    $(this.TextArea).autosize();
    this.IsCreating = false;
}

//инициализация контрола
function RA_InitializeDOM() {
    //this.TopContainer = window.document.createElement('div');

    this.Holder = window.document.createElement('div');
    this.Container.appendChild(this.Holder);

    this.ContentContainer = window.document.createElement('div');
    this.ContentContainer.className = 'rta_divcontainer';
    this.ContentContainer.appendChild(this.TextArea);

    var templatesEnable = this.Templates != null && this.Templates.length > 0;

    //смотрим ширину контрола
    for (var prop in this.Styles) {
        if (prop == 'width') {
            //если задано не в процентных показателях
            //то парсим ширину, чтобы сделать ее разной для разных браузеров
            var width = 0;
            var stringWidth = this.Styles[prop];
            if (!window.SM.IsNE(stringWidth) && stringWidth.indexOf('%') == -1) {
                var tmpWidth = parseInt(stringWidth);
                if (!isNaN(tmpWidth) && tmpWidth > 0) {
                    width = tmpWidth;
                    this.ControlWidthValid = true;
                    this.OriginalControlWidth = width;
                }
            }
            else
                width = stringWidth;

            this.ControlWidthInited = true;
            //если процентная ширина - устанавливаем как есть
            if (!this.ControlWidthValid)
                this.ControlWidth = width;
            else {
                //меняем размеры под браузеры
                var paddingLeftWidth = 3;
                if (window.SM.IsFF)
                    paddingLeftWidth = 2;

                var dtdDelta = 0;
                if (window.SM.DTD)
                    dtdDelta = 2;

                this.ControlWidth = (this.OriginalControlWidth - paddingLeftWidth - dtdDelta) + 'px';
                //записываем в оригинальную коллекцию стилей для зеркального textarea

                //если используются шаблоны, то textarea делаем меньше (для отступа справа)

                if (templatesEnable) {
                    //отступ для шаблонов
                    var templatePaddingRight = 23;
                    this.Styles[prop] = (this.OriginalControlWidth - paddingLeftWidth - templatePaddingRight - dtdDelta) + 'px';
                }
                else
                    //для правого отступа textarea отнимаем еще 4px
                    this.Styles[prop] = (this.OriginalControlWidth - paddingLeftWidth - dtdDelta - 4) + 'px';
            }
            break;
        }
    }

    if (this.NoRounded) {
        //добавляем контрол выбора шаблона
        if (templatesEnable) {
            this.InitTemplatesControl();
        }
        this.Holder.appendChild(this.ContentContainer);
    }
    else {
        var divTLB = window.document.createElement('div');
        if (this.ControlWidthInited)
            divTLB.style.width = this.ControlWidth;

        this.ControlContainer = divTLB;
        divTLB.className = 'rta_tlb';
        if (this.IsBlue)
            divTLB.className = 'rta_tlb_blue';

        var divTRB = window.document.createElement('div');
        divTRB.className = 'rta_trb';
        if (this.IsBlue)
            divTRB.className = 'rta_trb_blue';

        var divBLB = window.document.createElement('div');
        divBLB.className = 'rta_blb';
        if (this.IsBlue)
            divBLB.className = 'rta_blb_blue';

        var divBRB = window.document.createElement('div');
        divBRB.className = 'rta_brb';
        if (this.IsBlue)
            divBRB.className = 'rta_brb_blue';

        divTLB.appendChild(divTRB);
        divTRB.appendChild(divBLB);
        divBLB.appendChild(divBRB);
        divBRB.appendChild(this.ContentContainer);

        this.Holder.appendChild(divTLB);
    }
    if (this.ControlWidthInited)
        this.ContentContainer.style.width = this.ControlWidth;

    //контейнер шаблонов нужно добавлять имеенно в этом месте при загрузке страницы/контрола,
    //чтобы он открывался корректно
    if (this.DropDownTemplates != null)
        this.Holder.appendChild(this.DropDownTemplates.Container);
}

function RA_InitTemplatesControl() {
    var hasTemplates = this.Templates != null && this.Templates.length > 0;
    if (hasTemplates && this.DropDownTemplates == null) {
        //див с иконкой
        this.TemplatesContainer = window.document.createElement('div');
        this.TemplatesContainer.className = 'rta_templates_container';
        //иконка выбора шаблона
        var templatesBook = window.document.createElement('img');
        templatesBook.src = '/_layouts/WSS/WSSC.V4.SYS.UI.Controls/ListControl/Images/dropDown.png';
        this.TemplatesContainer.appendChild(templatesBook);

        //контрол выбора шаблонов (вып. список)
        this.DropDownTemplates = new DropDownControl({
            ParentControl: this.ContentContainer,
            Trigger: this.TemplatesContainer,
            Items: this.Templates
        });
        this.TemplatesVisible = true;

        //обработчик на выбор шаблона
        var thisObj = this;
        this.DropDownTemplates.AttachEvent('OnChange', function (sender, args) {
            if (sender != null) {
                //если разделитель не задан, то заменяем старое значение
                if (window.SM.IsNE(thisObj.TemplateSeparator))
                    thisObj.TextArea.value = sender.Value;
                    //если разделитель задан, то добавляем значение
                else {
                    //смотрим было ли уже задано значение
                    //в этом случае не добавляем сначала разделитель
                    if (!window.SM.IsNE(thisObj.TextArea.value))
                        var newValue = thisObj.TextArea.value + thisObj.TemplateSeparator + sender.Value;
                    else
                        var newValue = sender.Value;
                    thisObj.TextArea.value = newValue;
                }

                thisObj.TextArea.FireEvent('OnChange', null, true);
                thisObj.TextArea.Adjust(true);
            }
        });

        //добавляем контрол выбора шаблона в DOM
        this.ContentContainer.appendChild(this.TemplatesContainer);
        if (!this.IsCreating)
            this.Holder.appendChild(this.DropDownTemplates.Container);
    }
}

function RA_Disable() {
    this.TextArea.readOnly = true;
    this.TextArea.style.color = "#4a4a4a";
    this.HideTemplatesPicker();
    this.TextArea.Adjust();
}

function RA_Enable() {
    this.TextArea.readOnly = false;
    this.TextArea.style.color = "#000";
    this.ShowTemplatesPicker();
    this.TextArea.Adjust();
}

function RA_IsEmptyTextValue() {
    return !(/[^\s]+/g.test(this.TextArea.value));
}

function RA_HideTemplatesPicker() {
    if (this.ControlWidthValid && this.ControlWidthInited) {
        var controlWidth = this.ControlWidth;
        if (this.TemplatesVisible) {
            if (this.TemplatesContainer != null)
                this.TemplatesContainer.style.display = 'none';

            //отступ для шаблонов (устанавливаем в 0 - книжку не рисуем)
            var templatePaddingRight = 0;
            //отступ справа
            var paddingLeftWidth = 3;
            if (window.SM.IsFF)
                paddingLeftWidth = 2;

            var dtdDelta = 0;
            if (window.SM.DTD)
                dtdDelta = 2;

            this.TextArea.style.width = (this.OriginalControlWidth - paddingLeftWidth - templatePaddingRight - dtdDelta) + 'px';
            this.TemplatesVisible = false;
        }
    }
}

function RA_ShowTemplatesPicker() {
    if (this.ControlWidthValid && this.ControlWidthInited) {
        var controlWidth = this.ControlWidth;
        var templatesEnable = this.Templates != null && this.Templates.length > 0;
        if (templatesEnable) {
            if (this.TemplatesContainer != null)
                this.TemplatesContainer.style.display = '';

            //отступ для шаблонов
            var templatePaddingRight = 23;
            //отступ справа
            var paddingLeftWidth = 3;
            if (window.SM.IsFF)
                paddingLeftWidth = 2;

            var dtdDelta = 0;
            if (window.SM.DTD)
                dtdDelta = 2;

            this.TextArea.style.width = (this.OriginalControlWidth - paddingLeftWidth - templatePaddingRight - dtdDelta) + 'px';
            this.TemplatesVisible = true;
        }
    }
}