using System;
using System.IO;
using System.Windows;

namespace RachnaCAD;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        AppDomain.CurrentDomain.UnhandledException += (s, args) =>
        {
            var ex = args.ExceptionObject as Exception;
            string msg = ex?.ToString() ?? "Unknown error";
            try
            {
                var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RachnaCAD");
                Directory.CreateDirectory(dir);
                File.WriteAllText(Path.Combine(dir, "crash.log"), msg);
            }
            catch { }
            MessageBox.Show($"RachnaCAD Error:\n{msg}", "RachnaCAD Launcher", MessageBoxButton.OK, MessageBoxImage.Error);
        };

        DispatcherUnhandledException += (s, args) =>
        {
            string msg = args.Exception.ToString();
            try
            {
                var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RachnaCAD");
                Directory.CreateDirectory(dir);
                File.WriteAllText(Path.Combine(dir, "crash.log"), msg);
            }
            catch { }
            MessageBox.Show($"RachnaCAD UI Error:\n{msg}", "RachnaCAD Launcher", MessageBoxButton.OK, MessageBoxImage.Error);
            args.Handled = true;
        };
    }
}
