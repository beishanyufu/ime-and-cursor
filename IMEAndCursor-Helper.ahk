#Requires AutoHotkey v2.0

#SingleInstance Force

MsgBox("这是一个使用开源软件AutoHotkey制作的小工具，运行后会驻留在系统托盘中，可通过右键菜单关闭。`n功能：将【单击Shift键】操作转为【Shift+Space】（仅作用于VSCode窗口）。","IME and Cursor 助手 v1.0.0")

#HotIf WinActive("ahk_exe Code.exe")
~LShift::{
    StartTime := A_TickCount
    KeyWait("LShift")
    if (A_PriorKey == "LShift")  and (A_TickCount-StartTime < 600) {
        Send("+{Space}")
    }
    return
} 
~RShift::{
    StartTime := A_TickCount
    KeyWait("RShift")
    if (A_PriorKey == "RShift")  and (A_TickCount-StartTime < 600) {
        Send("+{Space}")
    }
    return
}
#HotIf