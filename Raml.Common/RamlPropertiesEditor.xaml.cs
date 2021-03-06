﻿using System;
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Linq;
using Raml.Common.Annotations;

namespace Raml.Common
{
    /// <summary>
    /// Interaction logic for RamlPropertiesEditor.xaml
    /// </summary>
    public partial class RamlPropertiesEditor : INotifyPropertyChanged
    {
        private bool isServerUseCase;

        private string ramlPath;
        private string ns;
        private string source;
        private string clientName;
        private bool useAsyncMethods;
        private bool includeApiVersionInRoutePrefix;
        private string baseControllersFolder;
        private string implementationControllersFolder;
        private string modelsFolder;
        private bool addGeneratedSuffixToFiles;

        public string Namespace
        {
            get { return ns; }
            set
            {
                ns = value;
                OnPropertyChanged();
            }
        }

        public string Source
        {
            get { return source; }
            set
            {
                source = value; 
                OnPropertyChanged();
            }
        }

        public string ClientName
        {
            get { return clientName; }
            set
            {
                clientName = value;
                OnPropertyChanged();
            }
        }

        public bool UseAsyncMethods
        {
            get { return useAsyncMethods; }
            set
            {
                useAsyncMethods = value;
                OnPropertyChanged();
            }
        }

        public bool IncludeApiVersionInRoutePrefix
        {
            get { return includeApiVersionInRoutePrefix; }
            set
            {
                includeApiVersionInRoutePrefix = value;
                OnPropertyChanged();
            }
        }

        public string ModelsFolder
        {
            get { return modelsFolder; }
            set
            {
                modelsFolder = value; 
                OnPropertyChanged();
            }
        }

        public string BaseControllersFolder
        {
            get { return baseControllersFolder; }
            set
            {
                baseControllersFolder = value;
                OnPropertyChanged();
            }
        }

        public string ImplementationControllersFolder
        {
            get { return implementationControllersFolder; }
            set
            {
                implementationControllersFolder = value;
                OnPropertyChanged();
            }
        }

        public Visibility ServerVisibility
        {
            get { return isServerUseCase ? Visibility.Visible : Visibility.Collapsed; }
        }

        public Visibility ClientVisibility
        {
            get { return isServerUseCase ? Visibility.Collapsed : Visibility.Visible; }
        }

        public bool AddGeneratedSuffixToFiles
        {
            get { return addGeneratedSuffixToFiles; }
            set
            {
                addGeneratedSuffixToFiles = value; 
                OnPropertyChanged();
            }
        }

        public RamlPropertiesEditor()
        {
            InitializeComponent();
        }

        public void Load(string ramlPath, string serverPath, string clientPath)
        {
            this.ramlPath = ramlPath;
            if (ramlPath.Contains(serverPath) && !ramlPath.Contains(clientPath))
                isServerUseCase = true;

            var ramlProperties = RamlPropertiesManager.Load(ramlPath);
            Namespace = ramlProperties.Namespace;
            Source = ramlProperties.Source;
            if (isServerUseCase)
            {
                UseAsyncMethods = ramlProperties.UseAsyncMethods.HasValue && ramlProperties.UseAsyncMethods.Value;
                IncludeApiVersionInRoutePrefix = ramlProperties.IncludeApiVersionInRoutePrefix.HasValue &&
                                                 ramlProperties.IncludeApiVersionInRoutePrefix.Value;
                ModelsFolder = ramlProperties.ModelsFolder;
                AddGeneratedSuffixToFiles = ramlProperties.AddGeneratedSuffix != null && ramlProperties.AddGeneratedSuffix.Value;
                ImplementationControllersFolder = ramlProperties.ImplementationControllersFolder;
            }
            else
                ClientName = ramlProperties.ClientName;

            OnPropertyChanged("ServerVisibility");
            OnPropertyChanged("ClientVisibility");
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            if (Namespace == null || NetNamingMapper.HasIndalidChars(Namespace))
            {
                MessageBox.Show("Error: invalid namespace.");
                return;                
            }
            if (clientName != null && NetNamingMapper.HasIndalidChars(ClientName))
            {
                MessageBox.Show("Error: invalid client name.");
                return;
            }
            if (source != null && NetNamingMapper.HasIndalidChars(source))
            {
                MessageBox.Show("Error: invalid source.");
                return;
            }
            if (HasInvalidPath(ModelsFolder))
            {
                MessageBox.Show("Error: invalid path specified for models. Path must be relative.");
                return;
            }

            if (HasInvalidPath(ImplementationControllersFolder))
            {
                MessageBox.Show("Error: invalid path specified for controllers. Path must be relative.");
                return;
            }


            var ramlProperties = new RamlProperties
            {
                Namespace = Namespace,
                Source = Source,
                ClientName = ClientName,
                UseAsyncMethods = UseAsyncMethods,
                IncludeApiVersionInRoutePrefix = IncludeApiVersionInRoutePrefix,
                ModelsFolder = ModelsFolder,
                AddGeneratedSuffix = AddGeneratedSuffixToFiles,
                ImplementationControllersFolder = ImplementationControllersFolder
            };
            
            RamlPropertiesManager.Save(ramlProperties, ramlPath);
            DialogResult = true;
            Close();
        }

        private readonly char[] invalidPathChars = Path.GetInvalidPathChars().Union((new[] { ':' }).ToList()).ToArray();
        private bool HasInvalidPath(string folder)
        {
            if (folder == null)
                return false;

            return invalidPathChars.Any(c => folder.Contains(c));
        }

        private void CancelButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        [NotifyPropertyChangedInvocator]
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            var handler = PropertyChanged;
            if (handler != null) handler(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
