namespace Collection.UserCollections
{
    struct Month
    {
        public static string Name { get; set; }
        public static int Year { get; set; }

        public static readonly int days;

        /// <summary> Считает количество дней у месяца </summary>
        /// <param name="id"> id месяца в коллекции </param>
        /// <returns>Количество дней месяца</returns>
        public bool CountDays(int id)
        {
            id++;   // увеличиваем значение поскольку отсчет в массивах начинается с 0
            days = System.DateTime.DaysInMonth(Year, id);
            return true;
        }

        public Month(string name, int year)
        {
            Name = name;
            Year = year;
        }

    }
}
