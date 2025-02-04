
---

# **Flipper Zero - Custom Data Collector Script**

## **Overview**
This project demonstrates how to use the Flipper Zero's BadUSB functionality to create a custom data collection tool. The script automates the process of executing PowerShell commands on a target Windows machine to extract valuable system information. The collected data is saved to an emulated USB drive (Mass Storage) for exfiltration.

The script is written in **Lua**, the native scripting language of the Flipper Zero, and utilizes its built-in libraries for BadUSB emulation and Mass Storage management.

---

## **Features**
- **System Information Extraction**: Retrieves details about the computer's manufacturer, model, installed services, environment variables, and more.
- **User Account Details**: Lists all local users, including those with weak or no password protection.
- **Network Configuration**: Captures Wi-Fi profiles and their passwords, as well as active IPv4 addresses and listening TCP ports.
- **Antivirus Status**: Identifies the antivirus software installed on the target system.
- **Data Exfiltration**: Stores the collected data in a structured format on the Flipper Zero's emulated USB drive.
- **Post-Execution Cleanup**: Ensures no traces are left behind by clearing the Run dialog history and PowerShell command history.

---

## **How It Works**
1. **Mass Storage Setup**:
   - The script checks if a pre-defined image file (`SecureData.img`) exists. If not, it creates a new virtual USB drive with a specified size (8 MB).

2. **BadUSB Emulation**:
   - Using the Flipper Zero's BadUSB capabilities, the script simulates keyboard input to open PowerShell and execute a series of predefined commands.
   - These commands gather detailed information about the target system and save it to a temporary file (`system_info.txt`).

3. **Data Collection**:
   - The PowerShell commands include:
     - System details (`Win32_ComputerSystem`).
     - Local user accounts and password requirements.
     - Installed hotfixes and updates.
     - Network configurations, including Wi-Fi profiles and passwords.
     - Active services and listening TCP ports.
     - Environment variables and general system information.

4. **Data Transfer**:
   - Once the data is collected, the script transfers the `system_info.txt` file to the emulated USB drive.
   - The file is renamed to include the date, time, and computer name for easy identification.

5. **Cleanup**:
   - After transferring the data, the script deletes the temporary file and clears any traces of its execution, such as the Run dialog history and PowerShell command history.

6. **Ejection Detection**:
   - The script waits until the emulated USB drive is safely ejected before stopping the mass storage service.

---

## **Prerequisites**
Before running the script, ensure the following:
- **Flipper Zero Device**: The script is designed to run on a Flipper Zero.
- **Mass Storage Image**: A virtual disk image (`SecureData.img`) must be created or pre-existing on the Flipper Zero's storage.
- **BadUSB Payload**: The Flipper Zero must be configured to emulate a keyboard and mass storage device.

---

## **Security Considerations**
- **Legal Usage**: This script is intended for educational purposes only. Always obtain explicit permission before testing it on any system.
- **Privacy**: Be mindful of the sensitive nature of the data being collected. Handle it responsibly and securely.
- **Detection Risks**: While the script attempts to minimize its footprint, advanced security systems may detect unusual activity. Use with caution.

---

## **Contributing**
Feel free to contribute to this project by submitting pull requests or opening issues. Suggestions for improvements, additional features, or bug fixes are always welcome!

---

## **License**
This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute the code as long as proper attribution is maintained.

---

## **Disclaimer**
This script is provided "as-is" without warranty of any kind. The author assumes no responsibility for any damages resulting from its use. Always adhere to ethical guidelines and legal regulations when deploying tools like this.

---

By tailoring the `README.md` and script for the Flipper Zero, you ensure that it aligns with the platform's capabilities and conventions. This will help others understand how to use your script effectively while maintaining transparency about its purpose and limitations.
