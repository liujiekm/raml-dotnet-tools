using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Raml.Tools.WebApiGenerator;

namespace Raml.Tools
{
    [Serializable]
    public class ApiEnum : IHasName
    {
        public ApiEnum()
        {
            Values = new Collection<string>();
        }
        public string Name { get; set; }
        public ICollection<string> Values { get; set; }
        public string Description { get; set; }
    }
}