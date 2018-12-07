using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Threading;
using System.Timers;

using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;


namespace Stopwatch
{
    class Model
    {
        

        //private DateTime? time = new DateTime(0, 0);
        private Timer timer = new Timer();
        private int time = 0;
        public Model()
        {
            InitTimer();

            timer.Elapsed += TimerTick;
        }

        public void InitTimer()
        {
            timer.Interval = 100;
            timer.Start();

            timer.Enabled = false;
        }

        public void TimerTick(object sendel, ElapsedEventArgs e)
        {
            //this.time = this.time.AddMilliseconds(30);
            this.time++;
        }

        public void StartTimer()
        {
            timer.Enabled = true;
        }

        public void StopTimer()
        {
            timer.Enabled = false;
        }

        public void ResetTimer()
        {
            //this.time = new DateTime(0, 0);
            this.time = 0;
        }

        public string ReturnTime()
        {

            return this.time.ToString("mm:ss:ff");
        }

    }
}



/*
    private DispatcherTimer dTimer = new DispatcherTimer();
    dTimer.Interval = TimeSpan(0, 0, 0, 0, 1);  

    private void OnStartClicked(object sender, System.EventArgs e)
    {
        dTimer.Start();
    }

    private void OnStopClicked(object sender, System.EventArgs e)
    {
        dTimer.Stop();
    }

    private void OnResetClicked(object sender, System.EventArgs e)
    {
        time = new DateTime(0, 0);
    }
    private void dTimerTick(object sender, EventArgs e)
    {
        time = time.AddMilliseconds(30);
        label.Content = time.ToString("mm:ss,ff");
    }
*/
