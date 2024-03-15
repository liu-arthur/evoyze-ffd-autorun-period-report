# FAST Front Desk Report Scheduler

## Overview

Handling history and forecast for last and next period report based on EG calendar.

## Node version

- Node requirement for development

    - version 18.16.1 or higher. In case of future upgrade, it's recommended to use the LTS version.

### Implementation steps
_ps: If there is existing Node.js, please uninstall before doing the following steps._

1. Run nvm-setup.exe to install nvm for Windows. This program helps in managing node.js version:

	[https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
	
	Notes: for upgrade, please see the "steps for upgrade" at the bottom of this file.
	
2. Run the following command which installs Node.js:

    ```
	nvm install 18.16.1	
    nvm use 18.16.1
    ```

3. Make sure to modified the file path in these 3 files:

   - `run.bat` - Windows task scheduler to execute this file.
   - `scheduler.xml` - Import task into windows task scheduler.
   - `config/db` - Database config.

4. Make sure get the filename `config.pem` from author so the db file able to decrypt and script able to run properly.
