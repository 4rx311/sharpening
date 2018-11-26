using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SystemCollections
{
    class MyReverseComparer<T> : Comparer<T>
    {
        public override int Compare(T x, T y)
        {
            return y.GetHashCode() - x.GetHashCode();
        }
    }
    class MyDictGen
    {
        public Dictionary<int, int> dict = new Dictionary<int, int>();
        public MyReverseComparer<int> comparer = new MyReverseComparer<int>();

        private void Init()
        {
            CompanyData data1 = new CompanyData(101, 101151);
            CompanyData data2 = new CompanyData(102, 101011);
            CompanyData data3 = new CompanyData(103, 967811);
            CompanyData data4 = new CompanyData(104, 251689);

            dict[data1.number] = data1.amount;
            dict[data2.number] = data2.amount;
            dict[data3.number] = data3.amount;
            dict[data4.number] = data4.amount;
        }
        
        public MyDictGen()
        {
            Init();
        }

        public void Print()
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("Number:  Amount: ");
            foreach (var value in dict)
            {
                Console.WriteLine("{0} \t {1}", value.Key, value.Value);
            }
        }
    }
}
