﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SystemCollections.Generics
{
    class MySortedListGen
    {
        public SortedList<int, int> list = new SortedList<int, int>();
        MyDictGen dict = new MyDictGen();

        public void Init()
        {
            foreach (var value in dict.dict)
            {
                list[value.Value] = value.Key;
            }
        }

        public MySortedListGen()
        {
            Init();
        }
    }
}
