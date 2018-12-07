using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace Stopwatch
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
   
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            new Presenter(this);
        }

        private string output = "00:00,00";
        public string Output { set { output = value; } }

        // Events
        public event EventHandler StartEvent = null;
        public event EventHandler StopEvent = null;
        public event EventHandler ResetEvent = null;

        private void StartButtonClicked(object sender, RoutedEventArgs e)
        {
            StartEvent.Invoke(sender, e);
        }

        private void StopButtonClicked(object sender, RoutedEventArgs e)
        {
            StopEvent.Invoke(sender, e);
        }

        private void ResetButtonClicked(object sender, RoutedEventArgs e)
        {
            ResetEvent.Invoke(sender, e);
        }

        private void presenter_PrintEvent(object sender, System.EventArgs e)
        {
            timeLabel.Content = output;
        } 

        public void Print(string output)
        {
            timeLabel.Content = output;
        }
    }
}


//DateTime time = new DateTime(0, 0);
//DispatcherTimer dTimer = new DispatcherTimer();

/* 
    dTimer.Interval = new TimeSpan(0, 0, 0, 0, 1);
    dTimer.Tick += dTimerTick;

    DateTime time = new DateTime(0, 0);
    private void timer1_Tick(object sender, EventArgs e)
    {
        time = time.AddMilliseconds(1);
        label.Text = time.ToString("mm:ss:fff");
    }

    private void button1_Click(object sender, EventArgs e)
    {
        if (timer1.Enabled == true)
            timer1.Enabled = false;
        else
            timer1.Enabled = true;
    }
*/
