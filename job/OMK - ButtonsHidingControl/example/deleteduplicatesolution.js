var EDMS_RegistrationSolution_Registrator = 'Разослать';
var EDMS_RegistrationSolution_Adresat = 'Разослать (адресаты)';


function EDMS_DeleteDuplicateSolution()
{
    var solutionList = xiSolutionsListID;
    if (solutionList.Items == null) return;
    var itemsArray = solutionList.Items;
    //есть решение регистратора
    var hasRegistrtorSolution = false;
    //есть решение адресата
    var hasAdresatSolution = false;
    var newItemsArray = new Array();
    
    for (var i = 0; i < itemsArray.length; i++) 
    {
        var tmpXmlItem = solutionList.Items[i];
        if (tmpXmlItem.Fields == null) continue;
        for (var j = 0; j < tmpXmlItem.Fields.length; j++) 
        {
            var tmpXmlField = tmpXmlItem.Fields[j];
            //решение регистратора
            if (tmpXmlField.Title == 'Name')
            {
                //решение регистратора
                if(tmpXmlField.Value == EDMS_RegistrationSolution_Registrator)
                    hasRegistrtorSolution = true;
                
                //решение адресата
                if(tmpXmlField.Value == EDMS_RegistrationSolution_Adresat)
                {
                    hasAdresatSolution = true;
                }
                else
                {
                    newItemsArray.push(tmpXmlItem);
                }
                break;
            }
         }
    }
    
    //если есть оба решения, то удаляем решение
    if(hasRegistrtorSolution && hasAdresatSolution)
        xiSolutionsListID.Items = newItemsArray;
    
    WKF_SetSolutions();
}