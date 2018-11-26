using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Collection.UserCollections
{
    public class MonthList
    {
        public static int year = 2018;

        private UserList list = new UserList
        {   new Month("January", year),
            new Month("February", year),
            new Month("Macrh", year),
            new Month("April", year),
            new Month("May", year),
            new Month("June", year),
            new Month("July", year),
            new Month("August", year),
            new Month("September", year),
            new Month("October", year),
            new Month("November", year),
            new Month("December", year)
        };
    }
}
