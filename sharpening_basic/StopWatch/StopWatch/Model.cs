using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Threading;
using System.Timers;

namespace StopWatch
{
    class Model
    {
        //private int time = 0;
        DateTime time = new DateTime(0, 0);
        public Model()
        {
            
        }
 
        public void TimerTick()
        {
            //this.time++;
            time = time.AddMilliseconds(17);
        }
        public void ResetTimer()
        {
            this.time = default(DateTime);
        }

        public string ReturnTime()
        {
            return this.time.ToString("mm:ss:ff");
        }
    }
}
