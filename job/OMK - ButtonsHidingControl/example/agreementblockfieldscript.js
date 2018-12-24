function AgreementBlockField()
{
    window.AgreementBlockInstance = this;
    this.Changed = false;
    this.IsChanged = AgreementBlockField_IsChanged;
    
    this.OnInit = AgreementBlock_OnInit;
    this.OnSave = AgreementBlock_OnSave;
    this.Disable = AgreementBlock_Disable;
    this.Enable = AgreementBlock_Enable;
    this.GetValue = AgreementBlock_GetValue;
    this.SetValue = AgreementBlock_SetValue;
    this.IsEmptyValue = AgreementBlock_IsEmptyValue;
    
}

function AgreementBlockField_IsChanged()
{
    return this.Changed == true;
}

function GetAgreementBlockField()
{
    return window.AgreementBlockInstance;
}

function AgreementBlock_OnInit()
{
}

function AgreementBlock_OnSave(saveEventArgs)
{
    if (this.ListFormField.Required) 
    {
        if(this.IsEmptyValue())
        {
            saveEventArgs.CanSave = false;
            saveEventArgs.IsEmptyValue = true;
        }
    }
}

function AgreementBlock_Disable()
{
}

function AgreementBlock_Enable()
{
}

function AgreementBlock_GetValue()
{
}

function AgreementBlock_SetValue()
{
}

function AgreementBlock_IsEmptyValue() 
{
    var isEmpty = true;
    if(WSSC_PBS_PassingFormData != null)
        if (WSSC_PBS_PassingFormData.Stages != null)
            if (WSSC_PBS_PassingFormData.Stages.length > 0)
            {
                var stageObj = WSSC_PBS_PassingFormData.Stages[0];
                if (stageObj.Blocks != null)
                    if (stageObj.Blocks.length > 0)
                    for (var k = 0; k < stageObj.Blocks.length; k++)
                       {
                           var usersCol = stageObj.Blocks[k].Users;
                           if (usersCol == null) continue;
                           if (usersCol.length > 0) 
                           {
                                for(var i=0; i<usersCol.length; i++)
                                {
                                    var userObj = usersCol[i];
                                    if(userObj.IsDeleted) continue;
                                    else return false;
                                }
                           }
                        }
                    
            }
    return isEmpty;
}