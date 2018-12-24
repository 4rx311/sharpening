function OMK_BlockSaveAgreementMatrix_Init() {
    ListForm.AddSaveHandler(function (saveEventArgs) {
        OMK_BlockSaveAgreementMatrix_Handler(saveEventArgs);
    });
}