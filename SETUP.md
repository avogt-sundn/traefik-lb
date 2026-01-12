# Setting up your local machine

## Install Ubuntu into WSL2

We install now the first Linux operating system to run on the Windows Subsystem for Linux, WSL2.

- first we uninstall any previous Ubuntu distro: we want the newest long-term release for Ubuntu Linux ready. Some steps of the following steps are specific for Ubuntu 24.

Open Powershell Terminal or Command Prompt with <kbd>WIN</kbd>Terminal<kbd>ENTER</kbd> rsp. <kbd>WIN</kbd>Command<kbd>ENTER</kbd>:
- enter the commands from below
   - when asked for the new UNIX username, choose the name of your Windows user to reduce confusion
   - when asked for the new user password, enter a simple one that you can remember, since you will need it many times

```bash
# open a powershell terminal

# delete previous installation
# PS
wsl.exe --unregister Ubuntu
# Check in the Windows Explorer that this distro folder is gone.

# PS C:\Users\user>
wsl.exe --install Ubuntu
# wsl: Using legacy distribution registration. Consider using a tar based distribution instead.
# Downloading: Ubuntu 24.04 LTS
# Ubuntu 24.04 LTS has been downloaded.
# Distribution successfully installed. It can be launched via 'wsl.exe -d Ubuntu 24.04 LTS'
# Launching Ubuntu 24.04 LTS...
# Installing, this may take a few minutes...
# Please create a default UNIX user account. The username does not need to match your Windows username.
# For more information visit: https://aka.ms/wslusers
# Enter new UNIX username: user
# New password:
# Retype new password:
# passwd: password updated successfully
# Installation successful!

# your prompt looks now something like this:
user@winner:~$
# Now Linux has taken over the prompt and is ready to accept linux commands as below
```

```bash
cat /etc/os-release
# PRETTY_NAME="Ubuntu 24.04.3 LTS"
# NAME="Ubuntu"
# VERSION_ID="24.04"
# ..
```

- it will pull the latest LTS release of Ubuntu that Microsoft likes best when runnning WSL2 since they engineered WSL together with Ubuntu folks

- this will be 24 (specifically 24.04.3 LTS or newer)



## Install a Terminal App and zsh

Do yourself a favor and use the best terminal and shell available. This workshop is heavily using the command line. You will be grateful for:

- correctly functioning keys (like printed on the keycaps)
- the same shortcuts as on any linux server
- correct color coding
- searchable history with <kbd>CTRL</kbd>+<kbd>R</kbd>
- auto completion with <kbd>TAB</kbd>

### Install a terminal and zsh on Windows

1. first install Windows Terminal from Microsoft Store -> <kbd>WIN</kbd>`store`<kbd>ENTER</kbd>

1. **if Microsoft Store is disabled**, follow this short link to the Github releases page <https://github.com/microsoft/terminal/releases>
   - install the latest stable version (The msixbundle file) which you can find under assets
   - learn what it can do for you:
   <https://docs.microsoft.com/windows/terminal/>

1. install Ubuntu Distro from Microsoft Store

   - open Windows Store <kbd>WIN</kbd>`store`<kbd>ENTER</kbd>
   - search for `ubuntu` and it will find
     ![Alt text](.img/terminal-with-oh-my-zsh.png)

1. **if Microsoft Store is disabled**, install Ubuntu LTS from this link:
    - go directly to the Ubuntu download here: <https://aka.ms/wslubuntu> and download the apx package
      >for details follow the description here     <https://docs.microsoft.com/de-de/windows/wsl/install-manual>


2. Set ubuntu as your standard shell in windows terminal by opening windows terminal

   Find the dropdown arrow in the menu bar, in the menu choose `settings`` -> standardprofil -> ubuntu
   - ![Alt text](.img/configure-terminal.png)
   - ![Alt text](.img/terminal-settings.png)

   > Congratulations!
   > - Now you have an `Ubuntu shell` configured in windows terminal! You should use it as your standard shell from now on.

3. Install `zsh` by entering the following commands on your ubuntu shell

     ```bash
     sudo apt update
     sudo apt upgrade
     sudo apt install zsh
     ```

4. Install `oh-my-zsh`, a package manager extension for your `zsh`

     ```bash
     sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
     ```

     - after that, a new terminal window will open and look like this:

      ![Alt text](.img/terminal-with-oh-my-zsh.png)



## Install docker.io into WSL2

The most intriguing way to get to your Linux and Desktop environment is by using the Docker-for-Desktop Installer.

> We prefer to use Docker packages from the Ubuntu distribution which resemble the Community Edition that is free to use.
> - It's a quick and command-based way to install docker.
> - But you will have no fancy GUI for docker unter Windows.
>

```bash
# enter your password you set when installing the Ubuntu distro when asked
sudo apt update -y
sudo apt upgrade -y
sudo apt install docker.io -y
# install buildx plugin
mkdir $HOME/.docker/cli-plugins
curl -L https://github.com/docker/buildx/releases/download/v0.30.1/buildx-v0.30.1.linux-amd64 > $HOME/.docker/cli-plugins/docker-buildx
chmod +x $HOME/.docker/cli-plugins/docker-buildx

docker buildx version
# github.com/docker/buildx v0.30.1 9e66234aa13328a5e75b75aa5574e1ca6d6d9c01

```

- buildx plugin is faster since it uses extensive caching optimization than normal docker builder
- buildx is **required** by IntelliJ when building devcontainers
- for more options to other platforms look at https://github.com/docker/buildx


## Option: Install Git for Windows with Windows Credential Helper

1. Install git from <https://git-scm.com/downloads>
1. Configure your credentials on the git server

   - navigate to the access tokens settings
   - create a personal access token by choosing a name and clicking the scope api
   - copy the generated token
   - navigate to your windows control panel and click User Accounts -> Manage Windows Credentials -> add generic credentials
     - enter git:https//git.s-und-n.de as the network adress
     - enter your git username as the username
     - paste the created access token as the password
   - save the changes

1. setup git in ubuntu shell to use Windows Credentials helper (from `Git for Windows`)

   ```shell
   git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
   ```

   - the next `git clone` command will prompt for your access token with this windows dialog:
   ![Alt text](.img/credentialshelper-login.png)

## Setup Git

You can check the settings that apply to the project folder with this command:

```shell
git config --list --show-origin
```

- State your identity that is printed into your commits:

    ```shell
    # State your identity that is printed into your commits:
    git config --global user.name "John Doe"
    git config --global user.email johndoe@example.com
    # Force linux line endings when comitting:
    git config --global core.autocrlf input
    ```

**In each of your projects** commit a `.gitattributes` file into the top level folder:

```shell
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

### Further reading

- setup git under windows with wsl2
  - <https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-git>
- why to use .gitattributes
  - <https://code.visualstudio.com/docs/remote/troubleshooting#_resolving-git-line-ending-issues-in-wsl-resulting-in-many-modified-files>

## Install Java 17

Java 8 is no longer the way, java source in this workshop is best matched by JDK 17. Nothing newer!

**On MacOS:**

```shell
brew update
brew install jenv

brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
jenv add /Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home/
jenv global 17

brew install --cask zulu
jenv add /Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

**On Windows:**

- Enter into your ubuntu shell:

    ```shell
    sudo apt install openjdk-17-jdk
    ```

- restart your ubuntu shell

### Further reading

- multiple java versions on MacOS
  - <https://medium.com/@chamikakasun/how-to-manage-multiple-java-version-in-macos-e5421345f6d0>

## Install Helm

**On Windows:**

- Open your your ubuntu shell and enter:

- After executing the first command you need to confirm by entering your Ubuntu-Password and pressing Enter.

    ```shell
    curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
    sudo apt-get install apt-transport-https --yes
    echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
    sudo apt-get update
    sudo apt-get install helm
    ```

## Install an VisualStudio Code IDE and use it within WSL2

A well designed and free to use IDE is Visual Studio Code.

You can download it here:

- <https://code.visualstudio.com/download>

When starting Visual Studio Code on Windows, you will be prompted to install the **Remote WSL VS Code extension**.

- <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>X</kbd> will open the extension view
- search for "WSL"
- click to install the extension.
- Result:
   ![Alt text](.img/wsl2-extension-vsc.png)

Restart VS Code. Click on the lower left corner to enable WSL2 mode: this results in this corner being switched to

This will open up VS Code in a remote state. All operations will
then be run in your Linux Subsystem.

Check the bottom left corner it should display ``WSL: Ubuntu``

 - ![Alt text](.img/wsl-vsc-icon.png)

**From now on always use VS Code in its remote state to prevent mistakes.**

Visual Studio Code can be greatly modified by the use of extensions.
For this course it is neccesary to install the basic java extensions

- Open the extensions tab by pressing <kbd>CTRL</kbd><kbd>Shift</kbd>+<kbd>X</kbd>.
- Search for the Java Extension Pack by Microsoft and install it.

## Conclusion and next steps

This chapter helped you install all the necessary tools to start your development process in the cloud native enviroment.

The next chapter will cover basic Linux commands and the motivation behind using Linux.

- Click here to enter the next chapter of this course: [Linux Basics](01_Linux_basics.md)

- Click here to get back to the path overview: [Path overview](README.md)
