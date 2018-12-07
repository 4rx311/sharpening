using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stopwatch
{
    class Presenter
    {
        // Subscribers
        private Model model = null;
        private MainWindow mainWin = null;

        public Presenter(MainWindow mainWin)
        {
            this.mainWin = new MainWindow();
            this.model = new Model();

            // Listenners
            this.mainWin.StartEvent += mainWin_StartEvent;
            this.mainWin.StopEvent  += mainWin_StopEvent;
            this.mainWin.ResetEvent += mainWin_ResetEvent;
        }
         
        // Events
        //public event EventHandler PrintEvent = null;


        private void mainWin_StartEvent(object sender, System.EventArgs e)
        {
            model.StartTimer();
            SendData();
            //PrintEvent.Invoke(sender, e);
        }

        private void mainWin_StopEvent(object sender, System.EventArgs e)
        {
            model.StopTimer();
            SendData();
            //PrintEvent.Invoke(sender, e);
        }

        private void mainWin_ResetEvent(object sender, System.EventArgs e)
        {
            model.ResetTimer();
            SendData();
            //PrintEvent.Invoke(sender, e);
        }

        private void SendData()
        {
            //mainWin.Output = model.ReturnTime();
            mainWin.Print(model.ReturnTime());
        }


    }
}
