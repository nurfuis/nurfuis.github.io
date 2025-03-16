Add-Type @'
using System;
using System.Runtime.InteropServices;

public class Wallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);

    public static string Get() {
        string wallpaper = new string('\0', 260);
        SystemParametersInfo(0x73, 260, wallpaper, 0);
        return wallpaper.Substring(0, wallpaper.IndexOf('\0'));
    }
}
'@

$wallpaper = [Wallpaper]::Get()
Write-Output $wallpaper