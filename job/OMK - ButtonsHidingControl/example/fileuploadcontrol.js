function FileUploadAdapterClass()
{
    this.AddTrigger = FUC_AddTrigger;
    this.CheckUploadPosition = FUC_CheckUploadPosition;
    this.GetUploadControl = FUC_GetUploadControl;
    
    //Properties
    this.UploadControls = new Array();
    this.UploadControlsByID = new Array();
}

function FUC_AddTrigger(options)
{
    var defaultOptions = {
        Trigger: null,
        TriggerActivator: null,
        OnSelectFiles: null,
        OnTriggerHover: null,
        OnTriggerOut: null,
        OnUpload: null,
        IsMultiple: true,
        IsMultiCompatible: false
    }
    var trigger = {};
    SM.ApplyOptions(trigger, defaultOptions, options);
    if(trigger.Trigger == null)
        throw new Error('Не передан параметр Trigger');
    if(trigger.TriggerActivator == null)
        trigger.TriggerActivator = trigger.Trigger;
    if(trigger.OnSelectFiles == null)
        throw new Error('Не передан параметр OnSelectFiles');
    if(trigger.OnUpload == null)
        throw new Error('Не передан параметр OnUpload');
    
    var triggerControl = trigger.Trigger;
    var triggerActivator = trigger.TriggerActivator;
    var thisObj = this;
    if(!triggerControl.HasTrigger)
    {
        triggerActivator.onmouseover = function(evt){ thisObj.CheckUploadPosition(evt, trigger); }
        triggerActivator.onmouseout = function(evt){ thisObj.CheckUploadPosition(evt, trigger); }
        triggerActivator.onmousemove = function(evt){ thisObj.CheckUploadPosition(evt, trigger); }
        
        triggerControl.HasTrigger = true;
    }
}

function AddFileUploadTrigger(options)
{
    if(window.FileUploadAdapter == null)
        window.FileUploadAdapter = new FileUploadAdapterClass();
    window.FileUploadAdapter.AddTrigger(options);
}

function GetFileUploadControl(controID)
{
    if(window.FileUploadAdapter == null)
        window.FileUploadAdapter = new FileUploadAdapterClass();
    return window.FileUploadAdapter.GetUploadControl(controID);
}

function FUC_CheckUploadPosition(evt, trigger)
{
    if(evt == null) evt = window.event;
    var mouseX = evt.clientX;
    var mouseY = evt.clientY;
    
   
    
    var triggerControl = trigger.Trigger;
    if(triggerControl.UploadDisabled)
        return;
    var isMultiple = trigger.IsMultiple == true;
    
    var rect = triggerControl.getBoundingClientRect();
   // alert(mouseX + ',' + mouseY);
   // alert(rect.left + ',' + rect.right + ';' + rect.top + ',' + rect.bottom)
   
    var isOver = 
        mouseX >= rect.left + 1 && mouseX <= rect.right - 1 &&
        mouseY >= rect.top + 1 && mouseY <= rect.bottom - 1;
        
    var uploadControl = this.GetUploadControl();
    var uploadContainer = uploadControl.Container;
    
    var uploadTop = 0;
    var uploadLeft = 0;
    
    var isMove = evt.type.toLowerCase() == 'mousemove';

    //alert(isOver)
    if(isOver)
    {
        var uploadTop = mouseY + SM.GetScrollTop() - 2;
        var uploadLeft = mouseX + SM.GetScrollLeft() - 2;
        
        uploadControl.Trigger = trigger;
        uploadControl.SubmitTrigger = trigger;

        if (trigger.IsMultiCompatible && !trigger.IsMultiple) {
            uploadControl.IsMultiCompatible = true;
            window.UseSafeAlerts = true;
        }
        else {
            uploadControl.IsMultiCompatible = false;
        }
            

        uploadControl.SetUploadMode(isMultiple);
        uploadContainer.style.top = uploadTop + 'px';
        uploadContainer.style.left = uploadLeft + 'px';
        uploadControl.OnInputHover();
    }
    else
    {
        uploadControl.OnInputOut();
    }
}

function FUC_GetUploadControl(controlID)
{
    var resultControl = null;
    if(SM.IsNE(controlID))
    {
        var i, len = this.UploadControls.length;
        for(i = 0; i < len; i++)
        {
            var uploadControl = this.UploadControls[i];
            if(!uploadControl.UploadStarted)    
            {
                resultControl = uploadControl;
                break;
            }
        }
        if(resultControl == null)
        {
            resultControl = new HttpUploadControl();
            this.UploadControls.push(resultControl);
            this.UploadControlsByID[resultControl.UniqueID] = resultControl;
        }
    }
    else
    {
        resultControl = this.UploadControlsByID[controlID];
    }
    return resultControl;
}

/*------------------- HttpUploadControl ---------------------*/
function HttpUploadControl()
{
    this.Container = window.document.createElement('div');
    this.Container.className = 'ff_httpUploadControl';
    
    //Methods
    this.SetUploadMode = HUC_SetUploadMode;
    this.SelectFilesCompleted = HUC_SelectFilesCompleted;
    this.OnUploadCompleted = HUC_OnUploadCompleted;
    this.OnInputHover = HUC_OnInputHover;
    this.OnInputOut = HUC_OnInputOut;
    this.SubmitFiles = HUC_SubmitFiles;
    this.SubmitFilesHTML5 = HUC_SubmitFilesHTML5;
    this.Reset = HUC_Reset;
    
    //Properties
    var thisObj = this;
    //создание через html, поскольку в IE по-другому загрузка файлов не работает.
    this.UploadForm = $("<form method='post' enctype='multipart/form-data'></form>")[0];
    this.UniqueID = 'fileUploadControl_' + Math.random().toString().replace('.', '').replace(',', '');
    this.TargetName = 'HUC_UploadTarget_' + this.UniqueID;
    this.UploadForm.target = this.TargetName;
    this.Container.appendChild(this.UploadForm);
    
    this.Input = window.document.createElement('input');
    this.Input.type = 'file';
    this.Input.name = 'HUC_Input_' + this.UniqueID;;
    this.SetUploadMode(true);
    this.Input.onchange = function(){ thisObj.SelectFilesCompleted(); }
    this.Input.onmouseout = function(){ thisObj.OnInputOut(); }
    
    this.UploadForm.appendChild(this.Input);
    
    //создание через html, поскольку в IE по-другому загрузка файлов не работает.
    this.UploadFrame = $("<iframe src='javascript:false' name='" + this.TargetName + "' onload='window.HUC_OnFrameLoadCompleted(" + '"' + this.UniqueID + '"' + ");'/>")[0];
    this.UploadFrame.id = this.TargetName;
    this.Container.appendChild(this.UploadFrame);
    
    window.document.body.appendChild(this.Container);
}

function HUC_Reset()
{
    this.UploadForm.reset();
    if(SM.IsSafari)
    {
        this.UploadForm.removeChild(this.Input);
        this.UploadForm.appendChild(this.Input);
    }
}

function HUC_OnInputHover()
{
    this.Container.style.display = 'block';
    this.Container.style.width = '3px';
    this.Container.style.height = '3px';
    if(this.Trigger != null)
    {
       
        if (this.Trigger.OnTriggerHover != null) {
            this.Trigger.OnTriggerHover();
            //alert('ok');
        }
    }
}

function HUC_OnInputOut()
{
    //this.Container.style.display = 'none';
    this.Container.style.top = '0px';
    this.Container.style.left = '0px';
    this.Container.style.width = '0px';
    this.Container.style.height = '0px';
    if(this.Trigger != null)
    {
        if(this.Trigger.OnTriggerOut != null)
            this.Trigger.OnTriggerOut();
        this.Trigger = null;
    }
}


function HUC_SetUploadMode(isMultiple)
{
    isMultiple = isMultiple == true;
    this.IsMultiple = isMultiple;
    this.Input.multiple = isMultiple;
    this.IsNewUploading = isMultiple;
}

function HUC_SubmitFiles(submitUrl) {
    if (SM.IsNE(submitUrl))
        throw new Error('Не передан параметр submitUrl');

    var enableHtml5 = (navigator.platform.indexOf("iPhone") != -1) ||
                  (navigator.platform.indexOf("iPod") != -1) ||
                  (navigator.platform.indexOf("iPad") != -1) ||
                  device.android()

    if (enableHtml5) {
        this.SubmitFilesHTML5(submitUrl)
        return;
    }
    this.UploadStarted = true;
    this.UploadForm.action = submitUrl;
    this.UploadForm.submit();
}
function HUC_SubmitFilesHTML5(submitUrl) {

    for (i = 0; i < this.UploadForm.children[0].files.length; i++) {
        var file = this.UploadForm.children[0].files[i];
        var fileReader = new FileReader();

        var httpControl = this;

        fileReader.readAsDataURL(file);

        fileReader.onloadend = function () {
            xmlhttp = SM.GetXmlRequest();

            var params = 'Base64FileContent=' + fileReader.result;

            if (SM.IsNE(fileReader.result)) {
                alert('Не удалось получить контент файла');
                return;
            }
            var submitUrlhtml5 = submitUrl + '&UseBase64Upload=true&fileName=' + file.name;

            xmlhttp.open("POST", submitUrlhtml5, true)

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {

                        if (xmlhttp.responseText.indexOf('{') == 0) {
                            httpControl.SubmitTrigger.OnUpload(httpControl, xmlhttp.responseText);
                        }
                        else {
                            alert(xmlhttp.responseText)
                        }
                    }
                    else {
                        alert(xmlhttp.responseText);
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
            xmlhttp.send(params)
        }
    }
}





function HUC_SelectFilesCompleted()
{
    if(this.SubmitTrigger != null && this.SubmitTrigger.OnSelectFiles != null)
        this.SubmitTrigger.OnSelectFiles(this);
    if(!this.UploadStarted)
        this.Reset();
}

function HUC_OnFrameLoadCompleted(controlID)
{
    var uploadControl = window.GetFileUploadControl(controlID);
    if(uploadControl != null)
        uploadControl.OnUploadCompleted();
}

function HUC_OnUploadCompleted()
{
    if(this.UploadStarted)
    {
        this.UploadStarted = false;
        var responseText = this.UploadFrame.contentWindow.document.body.innerHTML;
        //сбрасываем поле выбора файлов.
        this.Reset();
        if(this.SubmitTrigger != null && this.SubmitTrigger.OnUpload != null)
            this.SubmitTrigger.OnUpload(this, responseText);
    }
}