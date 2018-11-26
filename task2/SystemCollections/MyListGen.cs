using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SystemCollections
{
    class MyListGen
    {
        List<int> list = new List<int>();

        public void Init()
        {
            CompanyData data1 = new CompanyData(101, 101151);
            CompanyData data2 = new CompanyData(102, 101011);
            CompanyData data3 = new CompanyData(103, 967811);
            CompanyData data4 = new CompanyData(104, 251689);


            list[data1.number] = data1.amount;
            list[data2.number] = data2.amount;
            list[data3.number] = data3.amount;
            list[data4.number] = data4.amount;
        }

        public MyListGen()
        {
            Init();
        }
    }
}
