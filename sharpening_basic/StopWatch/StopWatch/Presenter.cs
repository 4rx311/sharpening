using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StopWatch
{
    class Presenter
    {
        private MainWindow view = null;
        private Model model = null;
        public Presenter(MainWindow view)
        {
            // Инициализация элементов
            this.view = view;
            this.model = new Model();

            // Подписка на события
            this.view.StartEvent += V_StartEvent;
            this.view.StopEvent += V_StopEvent;
            this.view.ResetEvent += V_ResetEvent;

            this.view.TimerEvent += V_TimerTick;
            this.view.InitTimer();
        }

        #region  Buttons 
        private void V_StartEvent(object sender, EventArgs e)
        {
            view.StartTimer();
        }

        private void V_StopEvent(object sender, EventArgs e)
        {
            view.StopTimer();
        }

        private void V_ResetEvent(object sender, EventArgs e)
        {
            model.ResetTimer();
            SetTime();
        }
        #endregion

        private void V_TimerTick(object sender, EventArgs e)
        {
            model.TimerTick();
            SetTime();
        }
        
        private void SetTime()
        {
            string result = model.ReturnTime();
            view.PrintTime(result);
        }
    }
}
