using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SystemCollections
{
    struct CompanyData
    {
        public readonly int number;
        public readonly int amount;

        public CompanyData(int num, int amt)
        {
            number = num;
            amount = amt;
        }
    }
}
