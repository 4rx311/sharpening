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
//using System.Timers;
//using System.Windows.Forms;
using System.Windows.Threading;
namespace StopWatch
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

            timer.Tick += TimerTick;
        }

        // Events
        public event EventHandler StartEvent = null;
        public event EventHandler StopEvent = null;
        public event EventHandler ResetEvent = null;
        public event EventHandler TimerEvent = null;

        #region Buttons
        private void StartButtonClick(object sender, RoutedEventArgs e)
        {
            StartEvent.Invoke(sender, e);
        }

        private void StopButtonClick(object sender, RoutedEventArgs e)
        {
            StopEvent.Invoke(sender, e);
        }

        private void ResetButtonClick(object sender, RoutedEventArgs e)
        {
            ResetEvent.Invoke(sender, e);
        }
        #endregion

        #region Timer
        private DispatcherTimer timer = new DispatcherTimer();
        public void InitTimer()
        {
            timer.Interval = new TimeSpan(0,0,0,0,1);
            timer.Start();
            //timer.Enabled = false;
        }
        public void TimerTick(object sender, EventArgs e)
        {
            TimerEvent.Invoke(sender, e);
        }
        public void StartTimer()
        {
            //timer.Enabled = true;
            timer.Start();
        }
        public void StopTimer()
        {
            //timer.Enabled = false;
            timer.Stop();
        }
        #endregion

        public void PrintTime(string time)
        {
            timeLabel.Content = time;
        }

    }
}
