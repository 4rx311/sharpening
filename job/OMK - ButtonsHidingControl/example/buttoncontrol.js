function ButtonControlClass(options) {
    var defaultOptions = {
        Text: null,
        Width: null,
        Theme: 'White'
    };
    SM.ApplyOptions(this, defaultOptions, options);

    if (SM.IsNE(this.Text))
        throw new Error('Не задан текст кнопки.');
    if (SM.IsNE(this.Width))
        throw new Error('Не задана ширина кнопки.');
    if (SM.IsNE(this.Theme))
        throw new Error('Не задана тема кнопки.');

    this.Container = document.createElement('div');
    var themeClassName = this.Theme.toLowerCase() == 'white' ? 'white' : 'blue';
    this.Container.className = 'btn_left ' + themeClassName;
    this.Container.style.width = this.Width;

    var btnRight = document.createElement('div');
    this.Container.appendChild(btnRight);
    btnRight.className = 'btn_right';

    var btnMid = document.createElement('div');
    btnRight.appendChild(btnMid);
    btnMid.className = 'btn_mid btn_text';

    this.TextDiv = btnMid;

    ButtonControl.SetText(this, this.Text);
}

window.ButtonControl = {
    CreateControl: function (options) { return new ButtonControlClass(options); },
    SetText: function (buttonControl, text) { BTN_SetText.call(buttonControl, text); }
}

function BTN_SetText(text) {
    if (SM.IsNE(text))
        throw new Error('Не передан параметр text.');
    if (SM.IsIE)
        this.TextDiv.innerText = text;
    else
        this.TextDiv.textContent = text;
}