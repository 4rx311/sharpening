using System;
using System.Collections;

namespace Collection.UserCollections
{
    class UserList : IList, ICollection, IEnumerable
    {
        private readonly object[] contents = new object[8];
        private int count;

        public UserList()
        {
            count = 0;
        }

        #region IList Members

        /// <summary> Добавляет элемент в список IList. </summary>
        /// <param name="value">Элемент который требуется поместить в коллекцию.</param>
        /// <returns>Индекс элемента который помещен в коллекцию.</returns>
        public int Add (object value)
        {
            if (count < contents.Length)
            {
                contents[count] = value;
                count++;

                return (count - 1);
            }
            return -1;
        }

        /// <summary> Удаляет все элементы из коллекции IList </summary>
        public void Clear()
        {
            count = 0;
        }

        /// <summary> Определяет, содержится ли указанное значение в списке IList </summary>
        public bool Contains(object value)
        {
            for (int i = 0; i < Count; i++)
                if (contents[i] == value)
                    return true;

            return false;
        }

        /// <summary> Определяет индекс заданного элемента в списке IList </summary>
        public int IndexOf(object value)
        {
            for (int i = 0; i < Count; i++)
                if (contents[i] == value)
                    return i;
            return -1;
        }

        /// <summary> Вставляет элемент в коллекцию IList с заданным индексом </summary>
        public void Insert(int index, object value)
        {
            if ((count + 1 <= contents.Length) && (index < Count) && (index >= 0))
            {
                count++;
                for (int i = Count - 1; i > index; i--)
                {
                    contents[i] = contents[i - 1];
                }
                contents[index] = value;
            }
        }

        /// <summary> Получает значение, показывающее, имеет ли список IList фиксированный размер </summary>
        public bool IsFixedSize
        {
            get { return true; }
        }

        /// <summary> Получает значение, указывающее, доступна ли коллекция IList только для чтения </summary>
        public bool IsReadOnly
        {
            get { return false; }
        }

        /// <summary> Удаляет первое вхождение указанного объект из списка IList </summary>
        public void Remove(object value)
        {
            RemoveAt(IndexOf(value));
        }

        /// <summary> Удаляет элемен IList, расположенный по указанному индексу </summary>
        public void RemoveAt(int index)
        {
            if ((index >= 0) && (index < Count))
            {
                for (int i = index; i < Count - 1; i++)
                    contents[i] = contents[i + 1];

                count--;
            }
        }

        // Обертка для индексатора
        public object this[int index]
        {
            get
            {
                return contents[index];
            }
            set
            {
                contents[index] = value;
            }
        }
        
        #endregion

        #region ICollection Members

        /// <summary> Копирует элементы ICollection в Array, начиная с конкретного индекса Array </summary>
        /// <param name="array"></param>
        /// <param name="index"></param>
        public void CopyTo(Array array, int index)
        {
            int j = index;
            for (int i=0; i< Count; i++)
            {
                array.SetValue(contents[i], j);
                j++;
            }
        }

        /// <summary> Возвращает число элементов, содержащихся в коллекции ICollection </summary>
        public int Count
        {
            get { return count; }
        }
        

        /// <summary> Получает значение, позволяющее определить, является ли доступ к коллекции ICollection синхронизированным (потокобезопасным) </summary>
        public bool IsSynchronized
        {
            get { return false; }
        }

        /// <summary> Получает объект, который можно использовать для синхронизации доступа к ICollection </summary>
        public object SyncRoot
        {
            get { return null; }
        }

        #endregion

        #region IEnumerable Members
        // Возвращает перечислитель, который выполняет итерацию по элементам коллекции. (Реализация IEnumerable)
        public IEnumerator GetEnumerator()
        {
            for (int i = 0; i < Count; i++)
            {
                yield return contents[i];
            }
        }
        #endregion

        
        public void PrintContents()
        {
            for (int i = 0; i < Count; i++)
                Console.Write("{0}", contents[i]);
        }
        
    }
}
