function DropDownControl(options) {
    var defaultOptions = {
        ParentControl: null,
        Trigger: null,
        Items: null
    }
    SM.ApplyOptions(this, defaultOptions, options);

    this.HandlerNames = {
        OnChange: 'OnChange'
    }

    var thisObj = this;

    if (this.ParentControl == null)
        throw new Error('Не передан родительский контрол.');
    if (this.Trigger == null)
        throw new Error('Не передан триггер.');

    this.Container = window.document.createElement('div');
    this.Container.className = 'ddc_divContextHolder';


    this.ContextDiv = window.document.createElement('div');
    this.ContextDiv.className = 'ddc_divContext';
    this.Container.appendChild(this.ContextDiv);


    this.Grid = window.document.createElement('div');
    this.Grid.className = 'ddc_divContextItems';
    this.ContextDiv.appendChild(this.Grid);

    //Methods
    this.CheckEmptyItems = DDC_CheckEmptyItems;
    this.AddItem = DDC_AddItem;
    this.OnItemOver = DDC_OnItemOver;
    this.SelectItem = DDC_SelectItem;
    this.Open = DDC_Open;
    this.CheckWidth = DDC_CheckWidth;
    this.SetPosition = DDC_SetPosition;
    this.Hide = DDC_Hide;
    this.HoverItem = DDC_HoverItem;
    this.LeaveItem = DDC_LeaveItem;
    this.ClearItems = DDC_ClearItems;

    this.OnTriggerClick = DDC_OnTriggerClick;
    this.OnDocumentClick = DDC_OnDocumentClick;
    this.Trigger.onclick = function() { thisObj.OnTriggerClick(); }

    SM.ApplyEventModel(this);
    
    if(this.Items != null && this.Items.length > 0)
    {
        var i, len = this.Items.length;
        for(i = 0; i < len; i++)
        {
            var item = this.Items[i];
            if(!SM.IsNE(item))
            {
                item = item.toString();
                this.AddItem(item, item);
            }
        }
    }
}

function DDC_OnDocumentClick(evt) {
    var clientX = evt.clientX;
    var clientY = evt.clientY;
    if(this.ContextDiv == null || this.ContextDiv.parentNode == null || SM.IsNE(this.ContextDiv.tagName))
        return;
    var gridRect = this.ContextDiv.getBoundingClientRect();
    var triggerRect = this.Trigger.getBoundingClientRect();

    var overGrid =
        clientX >= gridRect.left && clientX <= gridRect.right &&
        clientY >= gridRect.top && clientY <= gridRect.bottom;

    var overTrigger =
        clientX >= triggerRect.left && clientX <= triggerRect.right &&
        clientY >= triggerRect.top && clientY <= triggerRect.bottom;

    if (overTrigger) {
        if (!this.GridOpened)
            this.Open();
        else
            this.Hide();
    }
    else if (!overGrid || this.IsEmptyGrid)
        this.Hide();
}

function DDC_OnTriggerClick() {
    if (this.TriggerAttached)
        return;

    //добавляем обработчик на body.
    //!!!этот обработчик вызывается даже в момент его добавление, поэтому открытие грида делаем только в нем
    var thisObj = this;
    $(window.document).click(function(evt) {
        thisObj.OnDocumentClick(evt);
    });
    this.TriggerAttached = true;
}

function DDC_ClearItems()
{
    if(this.Grid != null)
    {
        this.Grid.innerHTML = '';
        this.CheckEmptyItems();
    }
}

function DDC_AddItem(text, value, control) {
    if (window.SM.IsNE(text))
        throw new Error('Не передан параметр text');
    if (window.SM.IsNE(value))
        throw new Error('Не передан параметр value');
    //this.CheckGrid();
    if (this.IsEmptyGrid) {
        this.Grid.innerHTML = '';
        this.IsEmptyGrid = false;
    }
    var contextItem = window.document.createElement('div');
    var thisObj = this;
    contextItem.onmouseover = function() { thisObj.OnItemOver(contextItem); }
    contextItem.onclick = function() { thisObj.SelectItem(contextItem); }
    contextItem.Value = value;
    if (control == null)
        $(contextItem).text(text);
    else
        contextItem.appendChild(control);
    this.Grid.appendChild(contextItem);
    return contextItem;
}

function DDC_CheckEmptyItems() {
    if (this.Grid != null) {
        var len = this.Grid.children.length;
        this.IsEmptyGrid = false;
        //this.HasEmptyRow = false;
        if (len == 0) {
            var emptyRow = window.document.createElement('div');
            emptyRow.className = 'ddc_emptyValue';
            emptyRow.innerHTML = window.TN.TranslateKey('DropDownControl.NoValuesAvailable');
            emptyRow.IsEmptyItem = true;
            this.IsEmptyGrid = true;
            //this.HasEmptyRow = true;
            this.Grid.appendChild(emptyRow);
        }
        else if (len == 1) {
            var firstRow = this.Grid.children[0];
            if (firstRow.IsEmptyItem) {
                //this.HasEmptyRow = true;
                this.IsEmptyGrid = true;
            }
        }
    }
}

//сделать установку признака this.OveredItemsCount
function DDC_OnItemOver(selectedItem) {
    //this.OveredItemsCount++;
    this.HoverItem(selectedItem)
}

//debugger
function DDC_HoverItem(selectedItem) {
    if (!this.GridOpened)
        return;

    if (selectedItem == null)
        throw new Error('Не передан парамтер selectedItem');

    var canSelect = true;
    if (this.CurrentItem != null) {
        var isCurrentItem = this.CurrentItem == selectedItem;
        if (!isCurrentItem)
            this.LeaveItem(this.CurrentItem);
        else
            canSelect = false;
    }

    if (canSelect)
        selectedItem.className = 'ddc_selectedItem';

    this.CurrentItem = selectedItem;
}

function DDC_LeaveItem(selectedItem) {
    selectedItem.className = '';
    this.CurrentItem = null;
}



//debugger
function DDC_SelectItem(selectedItem) {
    this.CurrentItem = selectedItem;
    this.Value = selectedItem.Value;
    this.Hide();

    this.FireEvent('OnChange');
}


//debugger
function DDC_Open() {
    //SM.WriteLog('Open');
    this.CheckEmptyItems();
    if (!this.GridOpened && this.Grid != null) {
        this.Container.style.display = 'block';
        this.CheckWidth();
        this.SetPosition();
        this.GridOpened = true;
    }
}

function DDC_CheckWidth() {
    if (this.Grid.offsetWidth < this.ParentControl.offsetWidth || this.WrapGrid)
        this.Grid.style.width = (this.ParentControl.offsetWidth - 4) + 'px';
}

//debugger
function DDC_SetPosition() {
    //обнуляем позицию вып. списка.
    this.ContextDiv.style.top = '0px';

    var contextOffset = $(this.ContextDiv).offset();
    var topDown = 0;
    var topUp = -(this.ContextDiv.offsetHeight + this.ParentControl.offsetHeight - 2);

    var topPixel = contextOffset.top + topUp - 1;
    var bottomPixel = contextOffset.top + this.ContextDiv.offsetHeight;
    var screenTop = window.SM.GetScrollTop();
    var screenBottom = screenTop + window.SM.GetClientHeight();

    //открываем вниз всегда когда нижняя точка попадает в экран, или видимого места внизу больше чем вверху
    //или верхняя абсолютная точка улетает за экран (имеет отрицательную координату)
    //отладил на трех браузерах на всех случаях - работает (проверял только с DTD).
    if (bottomPixel <= screenBottom || (screenBottom - bottomPixel >= topPixel - screenTop) || topPixel < 0)
        this.ContextDiv.style.top = topDown + 'px';
    else
        this.ContextDiv.style.top = topUp + 'px';
}

function DDC_Hide() {
    if (!this.GridOpened)
        return;

    this.Container.style.display = 'none';
    this.GridOpened = false;

    if (this.CurrentItem != null)
        this.LeaveItem(this.CurrentItem);
}