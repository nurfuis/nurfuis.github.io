Set WShell = CreateObject("WScript.Shell")
Set oShell = CreateObject("Shell.Application")
Set fso = CreateObject("Scripting.FileSystemObject")

On Error Resume Next

' Get the script's directory
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

If Err.Number <> 0 Then
    WScript.Echo "Error getting script path: " & Err.Description
    WScript.Quit
End If

' Get wallpaper path
Set wallpaper = WShell.Exec("powershell -executionpolicy bypass -file """ & strPath & "\get-wallpaper.ps1""")
If Err.Number <> 0 Then
    WScript.Echo "Error executing PowerShell: " & Err.Description
    WScript.Quit
End If

wallpaperPath = Replace(wallpaper.StdOut.ReadAll(), vbCrLf, "")
If wallpaperPath = "" Then
    WScript.Echo "No wallpaper path returned"
    WScript.Quit
End If

' Launch default browser with the app URL
url = "file:///" & strPath & "/index.html?wallpaper=" & Replace(wallpaperPath, "\", "/")
WShell.Run "cmd /c start " & url, 0, False